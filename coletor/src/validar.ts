import { centavos } from './api.ts';
import type { Linha, Validacao } from './tipos.ts';

/** R2: a soma dos lançamentos do mês tem de ser igual ao totalizador do portal, ao centavo. */
export function validarMes(linhas: Linha[], totalizador: number): Validacao {
  const soma = linhas.reduce((s, l) => s + centavos(l.valor), 0);
  return { soma, totalizador, ok: soma === totalizador };
}
