import type { Fonte, Linha } from './tipos.ts';

type Opcoes = {
  fetch?: typeof fetch;
  esperar?: (ms: number) => Promise<void>;
};

const TENTATIVAS = 3;
const TIMEOUT_MS = 60_000;

type Envelope<T> = { status: string | boolean; data: T; recordsTotal?: number };

/** Reais (número ou string "10335995.2600") → centavos inteiros. */
export const centavos = (v: number | string): number => Math.round(Number(v) * 100);

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Cliente da API Abase. Uma chamada a cada `intervaloMs` (o portal responde
 * 429/403 com reCAPTCHA quando passa disso); nesses casos espera 30 s, 60 s, 90 s.
 */
export function criarApi(fonte: Fonte, op: Opcoes = {}) {
  const f = op.fetch ?? fetch;
  const esperar = op.esperar ?? dormir;
  let primeira = true;

  async function chamar<T>(
    caminho: string,
    params: Record<string, string | number>,
    metodo: 'GET' | 'POST' = 'GET',
  ): Promise<Envelope<T>> {
    // Parâmetro vazio vai como string vazia: o texto "null" zera os totalizadores sem erro.
    const corpo = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    const url = new URL(caminho, fonte.api);
    if (metodo === 'GET') url.search = corpo.toString();

    for (let tentativa = 1; ; tentativa++) {
      if (!primeira) await esperar(fonte.intervaloMs);
      primeira = false;

      let resp: Response;
      let texto: string;
      try {
        resp = await f(url, {
          method: metodo,
          headers: {
            'User-Agent': fonte.userAgent,
            ...(metodo === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
          },
          ...(metodo === 'POST' ? { body: corpo.toString() } : {}),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        // O portal já derrubou a conexão no meio do corpo: ler aqui para o retry cobrir.
        texto = await resp.text();
      } catch (erro) {
        if (tentativa >= TENTATIVAS) throw new Error(`${caminho}: falha de rede`, { cause: erro });
        await esperar(5000 * tentativa);
        continue;
      }

      if (resp.status === 429 || resp.status === 403) {
        if (tentativa > TENTATIVAS) throw new Error(`${caminho}: portal pediu verificação (${resp.status})`);
        await esperar(30000 * tentativa);
        continue;
      }
      if (resp.status >= 500 && tentativa < TENTATIVAS) {
        await esperar(5000 * tentativa);
        continue;
      }
      if (!resp.ok) throw new Error(`${caminho}: HTTP ${resp.status}`);

      const json = JSON.parse(texto) as Envelope<T>;
      if (json.status !== 'success' && json.status !== true) {
        throw new Error(`${caminho}: status ${JSON.stringify(json.status)}`);
      }
      return json;
    }
  }

  return {
    /** Lançamentos de um mês inteiro em uma chamada: paginar repete e pula linhas. */
    async listarReceitas(ano: number, mes: number): Promise<Linha[]> {
      const r = await chamar<Linha[] | null>(
        'Usuario/Receitas/ListarReceitas',
        { token: fonte.token, draw: 1, start: 0, length: 20000, Ano: ano, entidade: fonte.entidade, Mes: mes },
        'POST',
      );
      const linhas: Linha[] = r.data ?? [];
      if (linhas.length !== r.recordsTotal) {
        throw new Error(`ListarReceitas ${ano}/${mes}: vieram ${linhas.length} de ${r.recordsTotal} linhas`);
      }
      return linhas;
    },

    /** Total arrecadado (cartão do portal), em centavos. Sem `mes` = ano inteiro. */
    async totalizador(ano: number, mes?: number): Promise<number> {
      const r = await chamar<string | null>('Usuario/Receitas/ListaTotalizadorReceitas', {
        token: fonte.token,
        ano,
        entidade: fonte.entidade,
        ...(mes ? { mes } : {}),
      });
      return centavos(r.data ?? 0);
    },

    async orcado(ano: number): Promise<{ orcado: number; percentual: number }> {
      const r = await chamar<{ valorOrcado: number; valorPorcentagem: number }>(
        'Usuario/Receitas/TotalizadorReceitasOrcadas',
        { token: fonte.token, entidade: fonte.entidade, ano, receita: '', vinculo: '', fonteRecurso: 0 },
      );
      return { orcado: centavos(r.data.valorOrcado), percentual: r.data.valorPorcentagem };
    },
  };
}
