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
