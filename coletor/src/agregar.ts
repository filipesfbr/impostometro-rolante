import { centavos } from './api.ts';
import type { Agregado, Linha } from './tipos.ts';

/**
 * Soma os lançamentos por (data, código) em centavos. Só lê `data`, `receita`,
 * `valor` e `descricao`: o `nome` do contribuinte nunca é copiado (R8).
 */
export function agregar(linhas: Linha[]): { agregados: Agregado[]; codigos: Record<string, string> } {
  const somas = new Map<string, number>();
  const codigos: Record<string, string> = {};

  for (const l of linhas) {
    const d = l.data.slice(0, 10);
    const chave = `${d}|${l.receita}`;
    somas.set(chave, (somas.get(chave) ?? 0) + centavos(l.valor));
    codigos[l.receita] ??= l.descricao.replace(/\s+/g, ' ').trim();
  }

  const agregados = [...somas].map(([chave, v]) => {
    const [d, c] = chave.split('|') as [string, string];
    return { d, c, v };
  });
  return { agregados: ordenar(agregados), codigos };
}

export const ordenar = (a: Agregado[]): Agregado[] =>
  a.sort((x, y) => (x.d === y.d ? (x.c < y.c ? -1 : x.c > y.c ? 1 : 0) : x.d < y.d ? -1 : 1));
