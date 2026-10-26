export type Fonte = {
  api: string;
  portal: string;
  portalReceitas: string;
  token: string;
  entidade: number;
  ibge: string;
  repositorio: string;
  userAgent: string;
  intervaloMs: number;
};

export type Grupo = 'municipal' | 'fora' | 'outras';

export type Categoria = { id: string; nome: string; grupo: Grupo; prefixos: string[] };

/** Linha de `ListarReceitas`. `nome` (contribuinte) existe na API e nunca sai da memória (R8). */
export type Linha = { receita: string; descricao: string; data: string; valor: number; nome?: string };

/** Lançamentos somados por (data, código), em centavos. */
export type Agregado = { d: string; c: string; v: number };

export type Validacao = { soma: number; totalizador: number; ok: boolean };

export type Totais = {
  arrecadado: number;
  orcado: number;
  percentual: number;
  por_mes: Record<string, number>;
};

export type Alteracao = {
  detectado_em: string;
  ano: number;
  mes: number;
  codigo: string;
  antes: number;
  depois: number;
};

export type Populacao = Record<string, Record<string, number>>;
