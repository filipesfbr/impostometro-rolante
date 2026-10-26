import type { Categoria } from './tipos.ts';

/** R6: primeira categoria (na ordem do arquivo) com um prefixo que case com o código. */
export function classificar(codigo: string, categorias: Categoria[]): Categoria {
  const cat = categorias.find((c) => c.prefixos.some((p) => codigo.startsWith(p)));
  if (!cat) throw new Error(`código ${codigo} sem categoria: falta o prefixo "" no fim de categorias.json`);
  return cat;
}
