import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { agregar, ordenar } from './agregar.ts';
import { criarApi } from './api.ts';
import { classificar } from './classificar.ts';
import { diff } from './diff.ts';
import { populacao } from './ibge.ts';
import { resumirAno, type EntradaAno, type Resumo } from './resumo.ts';
import type { Agregado, Alteracao, Categoria, Fonte, Populacao, Totais, Validacao } from './tipos.ts';
import { validarMes } from './validar.ts';

const DATA = process.env.DATA_DIR ?? 'data';

const lerJson = <T>(caminho: string, padrao?: T): T =>
  existsSync(caminho) ? JSON.parse(readFileSync(caminho, 'utf8')) : (padrao as T);

const escritos: Record<string, string> = {};
function gravar(relativo: string, conteudo: string) {
  const caminho = join(DATA, relativo);
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, conteudo);
  escritos[relativo] = `sha256:${createHash('sha256').update(conteudo).digest('hex')}`;
}
const json = (x: unknown) => `${JSON.stringify(x, null, 2)}\n`;
// Uma linha por lançamento agregado: o diff do git mostra exatamente o que mudou.
const jsonLinhas = (a: Agregado[]) => `[\n${a.map((x) => JSON.stringify(x)).join(',\n')}\n]\n`;

function csv(agregados: Agregado[], codigos: Record<string, string>, categorias: Categoria[]) {
  const reais = (v: number) => (v / 100).toFixed(2).replace('.', ',');
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const linhas = agregados.map((a) =>
    [a.d, a.c, esc(codigos[a.c] ?? ''), esc(classificar(a.c, categorias).nome), reais(a.v)].join(';'),
  );
  return `data;codigo;descricao;categoria;valor_reais\n${linhas.join('\n')}\n`;
}

/** Data e hora em Brasília (UTC−3, sem horário de verão desde 2019). */
function agoraBRT(d = new Date()) {
  const iso = new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 19);
  return { hoje: iso.slice(0, 10), coletadoEm: `${iso}-03:00` };
}

async function main() {
  const fonte = lerJson<Fonte>('config/fonte.json');
  const categorias = lerJson<Categoria[]>('config/categorias.json');
  const { hoje, coletadoEm } = agoraBRT();
  const anoAtual = Number(hoje.slice(0, 4));
  const mesAtual = Number(hoje.slice(5, 7));
  const anos = process.env.ANOS ? process.env.ANOS.split(',').map(Number) : [anoAtual - 1, anoAtual];

  const api = criarApi(fonte);
  const codigos = lerJson<Record<string, string>>(join(DATA, 'codigos.json'), {});
  const novos: Record<number, EntradaAno> = {};
  const validacao: Record<string, Record<string, Validacao>> = {};
  const erros: string[] = [];

  for (const ano of anos) {
    const meses = ano === anoAtual ? mesAtual : 12;
    const agregados: Agregado[] = [];
    const porMes: Record<string, number> = {};
    validacao[ano] = {};

    for (let mes = 1; mes <= meses; mes++) {
      const linhas = await api.listarReceitas(ano, mes);
      const totalizador = await api.totalizador(ano, mes);
      const v = validarMes(linhas, totalizador);
      validacao[ano][mes] = v;
      porMes[mes] = totalizador;
      if (!v.ok) erros.push(`${ano}/${mes}: soma ${v.soma} ≠ totalizador ${v.totalizador} (centavos)`);

      const r = agregar(linhas);
      agregados.push(...r.agregados);
      Object.assign(codigos, r.codigos);
      console.log(`${ano}/${String(mes).padStart(2, '0')}: ${linhas.length} linhas · ${v.ok ? 'confere' : 'NÃO CONFERE'}`);
    }

    const totalAno = await api.totalizador(ano);
    const somaMeses = Object.values(porMes).reduce((s, v) => s + v, 0);
    if (totalAno !== somaMeses) erros.push(`${ano}: total do ano ${totalAno} ≠ soma dos meses ${somaMeses}`);
    const { orcado, percentual } = await api.orcado(ano);
    const totais: Totais = { arrecadado: totalAno, orcado, percentual, por_mes: porMes };
    novos[ano] = { agregados: ordenar(agregados), totais };
  }

  // R2: se algum mês não fechar, nada é gravado e o site fica no último snapshot.
  if (erros.length) {
    console.error(`\nColeta NÃO publicada (R2):\n- ${erros.join('\n- ')}`);
    process.exit(1);
  }

  // R5: alterações em dias que a coleta anterior já cobria.
  const manifestAnterior = lerJson<{ ultimo_lancamento: string } | null>(join(DATA, 'manifest.json'), null);
  const historico = lerJson<Alteracao[]>(join(DATA, 'historico-alteracoes.json'), []);
  if (manifestAnterior) {
    for (const ano of anos) {
      const anterior = lerJson<Agregado[] | null>(join(DATA, `receitas/${ano}.json`), null);
      if (anterior) historico.push(...diff(ano, anterior, novos[ano]!.agregados, manifestAnterior.ultimo_lancamento, hoje));
    }
  }

  const pop = lerJson<Populacao>(join(DATA, 'populacao.json'), {});
  if (!pop[fonte.ibge]?.[anoAtual]) {
    try {
      pop[fonte.ibge] = { ...pop[fonte.ibge], ...(await populacao(fonte)) };
    } catch (erro) {
      if (!pop[fonte.ibge]) throw erro;
      console.warn(`IBGE indisponível, mantendo população anterior: ${String(erro)}`);
    }
  }

  for (const ano of anos) {
    gravar(`receitas/${ano}.json`, jsonLinhas(novos[ano]!.agregados));
    gravar(`receitas/${ano}.csv`, csv(novos[ano]!.agregados, codigos, categorias));
    gravar(`totais/${ano}.json`, json(novos[ano]!.totais));
  }
  const codigosOrdenados = Object.fromEntries(Object.entries(codigos).sort(([a], [b]) => (a < b ? -1 : 1)));
  gravar('codigos.json', json(codigosOrdenados));
  gravar('populacao.json', json(pop));
  gravar('historico-alteracoes.json', json(historico));

  // Anos já gravados em coletas anteriores (fora da janela atual) continuam no site.
  const todosAnos = readdirSync(join(DATA, 'receitas'))
    .filter((f) => /^\d{4}\.json$/.test(f))
    .map((f) => Number(f.slice(0, 4)))
    .sort();
  const entrada = (ano: number): EntradaAno | undefined =>
    novos[ano] ??
    (existsSync(join(DATA, `totais/${ano}.json`))
      ? { agregados: lerJson(join(DATA, `receitas/${ano}.json`)), totais: lerJson(join(DATA, `totais/${ano}.json`)) }
      : undefined);

  for (const ano of todosAnos.filter((a) => !novos[a])) {
    for (const f of [`receitas/${ano}.json`, `receitas/${ano}.csv`, `totais/${ano}.json`]) {
      if (existsSync(join(DATA, f))) gravar(f, readFileSync(join(DATA, f), 'utf8'));
    }
  }

  const ultimoLancamento = novos[anoAtual]?.agregados.at(-1)?.d ?? novos[anoAtual - 1]?.agregados.at(-1)?.d ?? hoje;
  const mesesValidados = Object.values(validacao).flatMap((m) => Object.values(m));
  const resumo: Resumo = {
    versao: 1,
    coletado_em: coletadoEm,
    ultimo_lancamento: ultimoLancamento,
    fonte: {
      portal: fonte.portal,
      portalReceitas: fonte.portalReceitas,
      api: fonte.api,
      token: fonte.token,
      entidade: fonte.entidade,
      repositorio: fonte.repositorio,
    },
    populacao: pop[fonte.ibge] ?? {},
    categorias,
    validacao: { meses_ok: mesesValidados.filter((v) => v.ok).length, meses_total: mesesValidados.length },
    historico,
    anos: Object.fromEntries(
      todosAnos.map((ano) => [ano, resumirAno(ano, entrada(ano)!, entrada(ano - 1), hoje, categorias, codigos)]),
    ),
  };
  gravar('site.json', json(resumo));

  gravar(
    'manifest.json',
    json({
      coletado_em: coletadoEm,
      fonte: { portal: fonte.portal, api: fonte.api, entidade: fonte.entidade },
      ultimo_lancamento: ultimoLancamento,
      anos: todosAnos,
      validacao,
      arquivos: escritos,
    }),
  );
  console.log(`\nColeta ok: ${mesesValidados.length} meses conferem · último lançamento ${ultimoLancamento}`);
}

await main();
