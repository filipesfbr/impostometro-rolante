import { classificar } from './classificar.ts';
import type { Agregado, Alteracao, Categoria, Fonte, Grupo, Totais } from './tipos.ts';

type Meses = (number | null)[];

export type ResumoCategoria = { total: number; por_mes: Meses; codigos: { c: string; d: string; v: number }[] };

export type ResumoAno = {
  ano: number;
  /** Último dia coberto: 31/12 em ano fechado, último lançamento no ano corrente. */
  ate: string;
  /** Mês ainda em andamento (só no ano corrente): não se compara com mês fechado. */
  mes_parcial: number | null;
  arrecadado: number;
  orcado: number;
  percentual: number;
  por_mes: Meses;
  municipal_por_mes: Meses;
  grupos: Record<Grupo, number>;
  categorias: Record<string, ResumoCategoria>;
  /** Mesmo período (01/01 até o mesmo dia/mês) do ano anterior, se houver dados. */
  anterior: null | { ate: string; arrecadado: number; grupos: Record<Grupo, number>; categorias: Record<string, number> };
};

export type Resumo = {
  versao: 1;
  coletado_em: string;
  ultimo_lancamento: string;
  fonte: Pick<Fonte, 'portal' | 'portalReceitas' | 'api' | 'token' | 'entidade' | 'repositorio'>;
  populacao: Record<string, number>;
  categorias: Categoria[];
  validacao: { meses_ok: number; meses_total: number };
  historico: Alteracao[];
  anos: Record<string, ResumoAno>;
};

export type EntradaAno = { agregados: Agregado[]; totais: Totais };

const zerarGrupos = (): Record<Grupo, number> => ({ municipal: 0, fora: 0, outras: 0 });

function somarPeriodo(agregados: Agregado[], ate: string, categorias: Categoria[]) {
  const grupos = zerarGrupos();
  const porCategoria: Record<string, number> = Object.fromEntries(categorias.map((c) => [c.id, 0]));
  let total = 0;
  for (const a of agregados) {
    if (a.d > ate) continue;
    const cat = classificar(a.c, categorias);
    grupos[cat.grupo] += a.v;
    porCategoria[cat.id]! += a.v;
    total += a.v;
  }
  return { total, grupos, porCategoria };
}

export function resumirAno(
  ano: number,
  entrada: EntradaAno,
  anterior: EntradaAno | undefined,
  hoje: string,
  categorias: Categoria[],
  codigos: Record<string, string>,
): ResumoAno {
  const anoHoje = Number(hoje.slice(0, 4));
  const corrente = ano === anoHoje;
  const ultimoNoAno = entrada.agregados.reduce((m, a) => (a.d > m ? a.d : m), `${ano}-01-01`);
  const ate = corrente ? ultimoNoAno : `${ano}-12-31`;
  const mesesColetados = corrente ? Number(hoje.slice(5, 7)) : 12;

  const meses = (): Meses => Array.from({ length: 12 }, (_, i) => (i < mesesColetados ? 0 : null));
  const categoriasAno: Record<string, ResumoCategoria> = Object.fromEntries(
    categorias.map((c) => [c.id, { total: 0, por_mes: meses(), codigos: [] }]),
  );
  const municipal = meses();
  const grupos = zerarGrupos();
  const porCodigo = new Map<string, number>();

  for (const a of entrada.agregados) {
    const cat = classificar(a.c, categorias);
    const m = Number(a.d.slice(5, 7)) - 1;
    const rc = categoriasAno[cat.id]!;
    rc.total += a.v;
    rc.por_mes[m] = (rc.por_mes[m] ?? 0) + a.v;
    if (cat.grupo === 'municipal') municipal[m] = (municipal[m] ?? 0) + a.v;
    grupos[cat.grupo] += a.v;
    porCodigo.set(a.c, (porCodigo.get(a.c) ?? 0) + a.v);
  }
  for (const [c, v] of porCodigo) {
    categoriasAno[classificar(c, categorias).id]!.codigos.push({ c, d: codigos[c] ?? '', v });
  }
  for (const rc of Object.values(categoriasAno)) rc.codigos.sort((x, y) => y.v - x.v);

  let resumoAnterior: ResumoAno['anterior'] = null;
  if (anterior) {
    const ateAnterior = `${ano - 1}${ate.slice(4)}`;
    const s = somarPeriodo(anterior.agregados, ateAnterior, categorias);
    resumoAnterior = { ate: ateAnterior, arrecadado: s.total, grupos: s.grupos, categorias: s.porCategoria };
  }

  return {
    ano,
    ate,
    mes_parcial: corrente ? mesesColetados : null,
    arrecadado: entrada.totais.arrecadado,
    orcado: entrada.totais.orcado,
    percentual: entrada.totais.percentual,
    por_mes: meses().map((v, i) => (v === null ? null : (entrada.totais.por_mes[String(i + 1)] ?? 0))),
    municipal_por_mes: municipal,
    grupos,
    categorias: categoriasAno,
    anterior: resumoAnterior,
  };
}
