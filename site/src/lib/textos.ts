/** Rótulos dos tributos municipais (texto do site; os valores e códigos vêm do portal). */
export const TRIBUTOS: Record<string, { nome: string; sub: string; explica: string }> = {
  iss: { nome: 'ISS', sub: 'serviços', explica: 'ISS: imposto pago por quem presta serviços na cidade.' },
  iptu: { nome: 'IPTU', sub: 'imóveis', explica: 'IPTU: imposto pago por quem tem imóvel na cidade.' },
  taxas: { nome: 'Taxas', sub: '', explica: 'Taxas: valores cobrados pela prefeitura por serviços públicos prestados.' },
  irrf: {
    nome: 'IRRF',
    sub: 'IR retido',
    explica: 'IRRF: imposto de renda retido na fonte em pagamentos feitos pela prefeitura, que fica com o município.',
  },
  cosip: { nome: 'Iluminação pública', sub: 'COSIP', explica: 'COSIP: contribuição que paga a iluminação pública da cidade.' },
  itbi: { nome: 'ITBI', sub: 'venda de imóveis', explica: 'ITBI: imposto pago na compra e venda de imóveis.' },
  'outros-municipais': { nome: 'Outros', sub: '', explica: 'Outros: demais receitas tributárias de valor menor.' },
};

/** "Outros" mistura receitas pequenas: a variação não diz nada e fica como "—". */
export const SEM_VARIACAO = new Set(['outros-municipais']);
