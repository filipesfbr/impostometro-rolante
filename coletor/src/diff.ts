import type { Agregado, Alteracao } from './tipos.ts';

/**
 * R5: compara, por (mês, código), só os dias que a coleta anterior já cobria
 * (até `ate`). Lançamento novo depois de `ate` é dado novo, não alteração.
 */
export function diff(ano: number, anterior: Agregado[], novo: Agregado[], ate: string, detectadoEm: string): Alteracao[] {
  const somar = (lista: Agregado[]) => {
    const m = new Map<string, number>();
    for (const a of lista) {
      if (a.d > ate) continue;
      const chave = `${Number(a.d.slice(5, 7))}|${a.c}`;
      m.set(chave, (m.get(chave) ?? 0) + a.v);
    }
    return m;
  };
  const antes = somar(anterior);
  const depois = somar(novo);

  const alteracoes: Alteracao[] = [];
  for (const chave of new Set([...antes.keys(), ...depois.keys()])) {
    const a = antes.get(chave) ?? 0;
    const b = depois.get(chave) ?? 0;
    if (a === b) continue;
    const [mes, codigo] = chave.split('|') as [string, string];
    alteracoes.push({ detectado_em: detectadoEm, ano, mes: Number(mes), codigo, antes: a, depois: b });
  }
  return alteracoes.sort((x, y) => x.mes - y.mes || (x.codigo < y.codigo ? -1 : 1));
}
