// Check de regra (R6), sem rede: a tabela de categorias precisa classificar qualquer código.
import { readFileSync } from 'node:fs';
import type { Categoria } from '../src/tipos.ts';

const categorias: Categoria[] = JSON.parse(readFileSync('config/categorias.json', 'utf8'));
const erros: string[] = [];
const ids = categorias.map((c) => c.id);
if (new Set(ids).size !== ids.length) erros.push('ids repetidos');
for (const c of categorias) {
  if (!['municipal', 'fora', 'outras'].includes(c.grupo)) erros.push(`${c.id}: grupo inválido ${c.grupo}`);
  if (!c.prefixos.length) erros.push(`${c.id}: sem prefixos`);
}
if (categorias.at(-1)?.prefixos[0] !== '') erros.push('a última categoria precisa do prefixo "" (pega o resto)');

if (erros.length) {
  console.error(`categorias.json inválido:\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log(`categorias.json ok (${categorias.length} categorias)`);
