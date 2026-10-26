import { useEffect, useState } from 'react';
import { pontos } from '../lib/compare.ts';
import { formatBRLShort, formatDate, formatPct, formatPeriod } from '../lib/format.ts';
import { Fonte, Seg, useDados } from './ui.tsx';

/** Anima de 0 até o valor real uma vez (900 ms). Nunca um contador por estimativa (R1). */
function useContagem(alvo: number) {
  const [v, setV] = useState(() => (matchMedia('(prefers-reduced-motion: reduce)').matches ? alvo : 0));
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(alvo);
    const t0 = performance.now();
    let id = 0;
    const passo = (t: number) => {
      const p = Math.min((t - t0) / 900, 1);
      setV(Math.round(alvo * (1 - (1 - p) ** 3)));
      if (p < 1) id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [alvo]);
  return v;
}

export function Hero() {
  const { ano, atual, exato, setExato, brl } = useDados();
  const valor = useContagem(atual.arrecadado);
  const periodo = formatPeriod(`${ano}-01-01`, atual.ate);
  return (
    <section id="inicio" style={{ padding: '44px 0 8px' }} aria-labelledby="h-hero">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span className="pill accent">dado real · atualizado todo dia</span>
        <span className="pill line">{periodo}</span>
      </div>
      <h1 id="h-hero" style={{ fontSize: 'clamp(18px,3cqw,26px)', fontWeight: 500, letterSpacing: '-.02em', marginTop: 26 }}>
        A Prefeitura de Rolante arrecadou em {ano}
      </h1>
      <p className="bignum num">
        <span aria-hidden="true">{brl(valor)}</span>
        <span className="sr">{brl(atual.arrecadado)}</span>
      </p>
      <p style={{ color: 'var(--ink-2)', fontSize: 17 }}>
        de {periodo} · último lançamento em {formatDate(atual.ate)}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center', marginTop: 28 }}>
        <Seg label="Formato dos valores" valor={exato} opcoes={[[true, 'Valor exato'], [false, 'Abreviado']]} onChange={setExato} />
        <div className="srcbox">
          <Fonte />
        </div>
      </div>
    </section>
  );
}

export function Orcamento() {
  const { ano, atual, brl } = useDados();
  const pct = Math.min(atual.percentual, 100);
  return (
    <section id="orcamento" className="sec" aria-labelledby="h-orc" style={{ paddingTop: 48 }}>
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 40px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 id="h-orc" className="eyebrow" style={{ margin: 0 }}>Orçamento de {ano}</h2>
            <p className="bignum num" style={{ fontSize: 'clamp(56px,16cqw,128px)', margin: '8px 0 0' }}>{formatPct(atual.percentual)}</p>
          </div>
          <p style={{ color: 'var(--ink-2)', maxWidth: '30ch', fontSize: 18, lineHeight: '26px' }}>
            do que está previsto na Lei Orçamentária já foi arrecadado até {formatDate(atual.ate).slice(0, 5)}.
          </p>
        </div>
        <div className="bar" role="progressbar" aria-label="Arrecadado em relação ao previsto na Lei Orçamentária" aria-valuemin={0} aria-valuemax={100} aria-valuenow={atual.percentual}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))', gap: '18px 28px' }}>
          <div className="stat"><span className="l">Arrecadado</span><span className="v">{brl(atual.arrecadado)}</span></div>
          <div className="stat"><span className="l">Saldo a arrecadar</span><span className="v">{brl(atual.orcado - atual.arrecadado)}</span></div>
          <div className="stat"><span className="l">Previsto na Lei Orçamentária</span><span className="v">{brl(atual.orcado)}</span></div>
        </div>
        <Fonte />
      </div>
    </section>
  );
}

/** "R$ 100" em texto corrido, sem quebrar entre o símbolo e o número. */
const reais = (n: number) => `R$\u00a0${n}`;

const PARTES = [
  { id: 'municipal', nome: 'Arrecadado aqui', bg: 'var(--seg-a)' },
  { id: 'fora', nome: 'Recebido de fora', bg: 'var(--seg-b)' },
  { id: 'outras', nome: 'Outras receitas', bg: 'var(--seg-c)' },
] as const;

export function Composicao() {
  const { ano, atual } = useDados();
  const total = atual.grupos.municipal + atual.grupos.fora + atual.grupos.outras;
  const pts = pontos(PARTES.map((p) => atual.grupos[p.id]));
  const celulas = PARTES.flatMap((p, i) => Array.from({ length: pts[i]! }, () => p.bg));
  const desc = {
    municipal: `Tributos municipais: ${formatBRLShort(atual.grupos.municipal)} até ${formatDate(atual.ate).slice(0, 5)}.`,
    fora: 'Transferências da União e do Estado.',
    outras: 'Rendimentos e outras fontes.',
  };
  return (
    <section id="origem" className="sec" aria-labelledby="h-comp" style={{ paddingTop: 12 }}>
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h2 id="h-comp" className="eyebrow" style={{ margin: 0 }}>De onde vem o dinheiro · {ano}</h2>
          <p className="key" style={{ marginTop: 14 }}>
            De cada {reais(100)} que a prefeitura recebe, cerca de {reais(pts[0]!)} são arrecadados em Rolante.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: '32px 64px', alignItems: 'center' }}>
          <figure style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              className="waffle"
              role="img"
              aria-label={`Cem pontos, cada um representando R$ 1 de cada R$ 100 recebidos: ${pts[0]} arrecadados em Rolante, ${pts[1]} recebidos de fora e ${pts[2]} de outras receitas.`}
            >
              {celulas.map((bg, i) => <i key={i} style={{ background: bg }} />)}
            </div>
            <figcaption style={{ fontSize: 14, color: 'var(--ink-3)' }}>Cada ponto é {reais(1)} de cada {reais(100)} recebidos em {ano}.</figcaption>
          </figure>
          <div>
            {PARTES.map((p) => (
              <div key={p.id} className="lg">
                <span className="sq" style={{ background: p.bg }} />
                <span className="t">{p.nome}</span>
                <span className="p">{total ? formatPct((atual.grupos[p.id] / total) * 100, 1) : '—'}</span>
                <span className="d">{desc[p.id]}</span>
              </div>
            ))}
          </div>
        </div>
        <Fonte />
      </div>
    </section>
  );
}
