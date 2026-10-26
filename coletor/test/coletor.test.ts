import { describe, expect, it, vi } from 'vitest';
import categorias from '../../config/categorias.json' with { type: 'json' };
import linhas from './fixtures/receitas-mes.json' with { type: 'json' };
import { agregar } from '../src/agregar.ts';
import { criarApi } from '../src/api.ts';
import { classificar } from '../src/classificar.ts';
import { diff } from '../src/diff.ts';
import type { Categoria, Fonte } from '../src/tipos.ts';
import { validarMes } from '../src/validar.ts';

const cats = categorias as Categoria[];
// 100,10 + 0,20 + 50,00 + 1000,55 − 200,11 = 950,74
const TOTAL = 95074;

describe('validar (R2)', () => {
  it('fecha quando a soma é igual ao totalizador', () => {
    expect(validarMes(linhas, TOTAL)).toEqual({ soma: TOTAL, totalizador: TOTAL, ok: true });
  });
  it('falha com 1 centavo de diferença', () => {
    expect(validarMes(linhas, TOTAL + 1).ok).toBe(false);
  });
});

describe('agregar', () => {
  const { agregados, codigos } = agregar(linhas);
  it('soma em centavos por (data, código), com negativos', () => {
    expect(agregados).toEqual([
      { d: '2026-01-05', c: '1112500100000000', v: 5000 },
      { d: '2026-01-05', c: '1114511101000000', v: 10030 },
      { d: '2026-01-10', c: '1715001101000000', v: 80044 },
    ]);
    expect(codigos['1114511101000000']).toBe('ISS - Próprio');
  });
  it('nunca leva o nome do contribuinte (R8)', () => {
    const saida = JSON.stringify(agregar(linhas));
    expect(saida).not.toContain('nome');
    expect(saida).not.toContain('FICTICIO');
  });
});

describe('classificar (R6)', () => {
  it.each([
    ['1114511101000000', 'iss'],
    ['1112500100000000', 'iptu'],
    ['1112530101000000', 'itbi'],
    ['1113034101010000', 'irrf'],
    ['1121010100000000', 'taxas'],
    ['1240000100000000', 'cosip'],
    ['1119000000000000', 'outros-municipais'],
    ['1715001101000000', 'transferencias'],
    ['2412000000000000', 'transferencias'],
    ['1321001101000000', 'outras'],
    ['9999999999999999', 'outras'],
  ])('%s → %s', (codigo, id) => {
    expect(classificar(codigo, cats).id).toBe(id);
  });
});

describe('diff (R5)', () => {
  const antes = [
    { d: '2026-09-10', c: '1114511101000000', v: 100 },
    { d: '2026-10-01', c: '1114511101000000', v: 50 },
  ];
  it('mês alterado gera entrada', () => {
    const depois = [{ ...antes[0]!, v: 150 }, antes[1]!];
    expect(diff(2026, antes, depois, '2026-10-01', '2026-10-27')).toEqual([
      { detectado_em: '2026-10-27', ano: 2026, mes: 9, codigo: '1114511101000000', antes: 100, depois: 150 },
    ]);
  });
  it('mês igual e lançamento novo depois da última coleta não geram entrada', () => {
    const depois = [...antes, { d: '2026-10-02', c: '1114511101000000', v: 999 }];
    expect(diff(2026, antes, depois, '2026-10-01', '2026-10-27')).toEqual([]);
  });
});

describe('api', () => {
  const fonte = { api: 'https://api.exemplo/', token: 't', entidade: 0, userAgent: 'teste', intervaloMs: 2000 } as Fonte;
  const resposta = (status: number, corpo: unknown = {}) => new Response(JSON.stringify(corpo), { status });

  it('429 → espera e tenta de novo', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(resposta(429))
      .mockResolvedValueOnce(resposta(200, { status: 'success', data: '10.5000' }));
    const esperar = vi.fn().mockResolvedValue(undefined);
    const api = criarApi(fonte, { fetch, esperar });
    expect(await api.totalizador(2026, 1)).toBe(1050);
    expect(esperar).toHaveBeenCalledWith(30000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('data.length != recordsTotal → erro', async () => {
    const fetch = vi.fn().mockResolvedValue(resposta(200, { status: true, recordsTotal: 3, data: [linhas[0]] }));
    const api = criarApi(fonte, { fetch, esperar: async () => {} });
    await expect(api.listarReceitas(2026, 1)).rejects.toThrow('vieram 1 de 3');
  });
});
