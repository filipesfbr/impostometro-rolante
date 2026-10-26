import type { Resumo } from '../../../coletor/src/resumo.ts';

type Fonte = Resumo['fonte'];

/**
 * Link para a tela de Receitas do portal já filtrada. O portal só aplica
 * parâmetros com o `id` do campo (`anoFiltroReceitas`, `mesFiltroReceitas`…),
 * não os nomes que ele mesmo grava na URL (`Ano`, `Mes`).
 */
export function linkPortal(fonte: Fonte, f: { ano: number; mes?: number; codigo?: string }): string {
  const p = new URLSearchParams({ anoFiltroReceitas: String(f.ano), entidade: String(fonte.entidade), tipoConsulta: '1' });
  if (f.mes) p.set('mesFiltroReceitas', String(f.mes));
  if (f.codigo) p.set('codigo-receita', f.codigo);
  return `${fonte.portalReceitas}?${p}`;
}

export type EstadoMes = 'confere' | 'mais-novo' | 'alterado';
export type ResultadoMes = { mes: number; portal: number; nosso: number; estado: EstadoMes };

export class PortalPediuVerificacao extends Error {}

/**
 * "Conferir agora": o navegador do visitante consulta o totalizador do portal
 * (CORS liberado) mês a mês e compara com a nossa coleta. 300 ms entre chamadas
 * e para no primeiro 429/403, que é quando o portal mostra reCAPTCHA.
 */
export async function conferir(
  dados: Resumo,
  ano: number,
  aoAvancar: (r: ResultadoMes) => void,
  sinal?: AbortSignal,
): Promise<ResultadoMes[]> {
  const resumo = dados.anos[ano]!;
  const meses = resumo.por_mes.flatMap((v, i) => (v === null ? [] : [i + 1]));
  const resultados: ResultadoMes[] = [];

  for (const mes of meses) {
    if (resultados.length) await new Promise((r) => setTimeout(r, 300));
    const url = new URL('Usuario/Receitas/ListaTotalizadorReceitas', dados.fonte.api);
    url.search = new URLSearchParams({
      token: dados.fonte.token,
      ano: String(ano),
      entidade: String(dados.fonte.entidade),
      mes: String(mes),
    }).toString();

    const resp = await fetch(url, sinal ? { signal: sinal } : {});
    if (resp.status === 429 || resp.status === 403) throw new PortalPediuVerificacao();
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json: { data: string | null } = await resp.json();

    const portal = Math.round(Number(json.data ?? 0) * 100);
    const nosso = resumo.por_mes[mes - 1] ?? 0;
    const corrente = mes === resumo.mes_parcial;
    const estado: EstadoMes = portal === nosso ? 'confere' : corrente && portal > nosso ? 'mais-novo' : 'alterado';
    const r = { mes, portal, nosso, estado };
    resultados.push(r);
    aoAvancar(r);
  }
  return resultados;
}
