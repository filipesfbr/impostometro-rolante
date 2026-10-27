import { Fragment, useState } from 'react';
import { variacao } from '../lib/compare.ts';
import { formatDate, formatPeriod } from '../lib/format.ts';
import { linkPortal } from '../lib/portal.ts';
import { SEM_VARIACAO, TRIBUTOS } from '../lib/textos.ts';
import { Acumulado, Barras } from './Graficos.tsx';
import { Delta, Fonte, LinkPortal, Seg, useDados } from './ui.tsx';

export function Tributos() {
  const { dados, ano, atual, anterior, brl } = useDados();
  const municipais = dados.categorias.filter((c) => c.grupo === 'municipal');
  // Maior primeiro; "Outros" sempre por último.
  const ordem = [...municipais].sort((a, b) =>
    a.id === 'outros-municipais' ? 1 : b.id === 'outros-municipais' ? -1 : atual.categorias[b.id]!.total - atual.categorias[a.id]!.total,
  );
  const [aberto, setAberto] = useState<string | null>(() => {
    const h = location.hash.slice(1);
    return municipais.some((c) => c.id === h) ? h : 'iss';
  });
  const abrir = (id: string) => {
    const novo = aberto === id ? null : id;
    setAberto(novo);
    history.replaceState(null, '', novo ? `#${novo}` : '#tributos');
  };

  const ant = atual.anterior;
  const totalMunicipal = atual.grupos.municipal;
  return (
    <section id="tributos" className="sec" aria-labelledby="h-trib">
      <p className="eyebrow">Arrecadado em Rolante · {formatPeriod(`${ano}-01-01`, atual.ate).slice(0, 13)}</p>
      <h2 id="h-trib" className="h2">Tributos municipais</h2>
      <p className="lead">
        {ano} comparado ao mesmo período de {ano - 1}. Toque num tributo para abrir o detalhe.
      </p>
      <div className="tgrid">
        {ordem.map((c) => {
          const t = TRIBUTOS[c.id] ?? { nome: c.nome, sub: '', explica: c.nome };
          const valor = atual.categorias[c.id]!.total;
          const antes = ant?.categorias[c.id] ?? null;
          const delta = SEM_VARIACAO.has(c.id) ? null : variacao(valor, antes);
          const open = aberto === c.id;
          return (
            <Fragment key={c.id}>
              <div className={open ? 'tcard open' : 'tcard'} id={c.id} style={open ? { gridColumn: '1/-1' } : undefined}>
                <button type="button" className="thead" aria-expanded={open} aria-controls={`${c.id}-detalhe`} onClick={() => abrir(c.id)}>
                  <span className="tt">
                    <span>
                      <span className="n">{t.nome}</span>
                      {t.sub && <span className="s">{t.sub}</span>}
                    </span>
                    <span className="ic" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d={open ? 'M3 8h10' : 'M8 3v10M3 8h10'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  </span>
                  <span className="v num">{brl(valor)}</span>
                  <span className="r">
                    <Delta v={delta} />
                    {antes !== null && <span className="pv">{ano - 1}: {brl(antes)}</span>}
                  </span>
                </button>
              </div>
              {open && <Detalhe id={c.id} explica={t.explica} nome={t.nome} />}
            </Fragment>
          );
        })}
      </div>
      <div className="tot" style={{ marginTop: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-.02em' }}>Total dos tributos municipais</p>
          {ant && <p className="num" style={{ fontSize: 14, color: 'var(--on-inv-2)' }}>{ano - 1}, mesmo período: {brl(ant.grupos.municipal)}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span className="num" style={{ fontWeight: 700, letterSpacing: '-.03em', fontSize: 'clamp(30px,6cqw,48px)', lineHeight: 1 }}>{brl(totalMunicipal)}</span>
          <Delta v={variacao(totalMunicipal, ant?.grupos.municipal)} />
        </div>
      </div>
      <Fonte style={{ marginTop: 16 }} />
      {!anterior && <p className="lead" style={{ marginTop: 12 }}>Sem dados de {ano - 1} para comparar.</p>}
    </section>
  );
}

function Detalhe({ id, explica, nome }: { id: string; explica: string; nome: string }) {
  const { dados, ano, atual, anterior, brl } = useDados();
  const [anoSel, setAnoSel] = useState(ano);
  const cat = atual.categorias[id]!;
  const catAnt = anterior?.categorias[id];
  const doAno = anoSel === ano ? cat : catAnt!;
  const fim = anoSel === ano ? atual.ate : anterior!.ate;
  const antes = atual.anterior?.categorias[id] ?? null;
  const delta = SEM_VARIACAO.has(id) ? null : variacao(cat.total, antes);

  return (
    <div className="tdetail" id={`${id}-detalhe`} style={{ gridColumn: '1/-1' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <p style={{ fontWeight: 500, fontSize: 'clamp(18px,3cqw,24px)', letterSpacing: '-.02em', maxWidth: '36ch' }}>{explica}</p>
        {catAnt && <Seg label="Ano" valor={anoSel} opcoes={[[ano, String(ano)], [ano - 1, String(ano - 1)]]} onChange={setAnoSel} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(360px,100%),1fr))', gap: 12 }}>
        <div className="sub" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="eyebrow">Arrecadado em {anoSel} · {formatPeriod(`${anoSel}-01-01`, fim)}</p>
          <p className="num" style={{ fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1, fontSize: 'clamp(32px,8cqw,60px)' }}>{brl(doAno.total)}</p>
          {anoSel === ano ? (
            antes !== null && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center' }}>
                <Delta v={delta} />
                <span style={{ color: 'var(--ink-2)', fontSize: 15 }}>
                  em relação ao mesmo período de {ano - 1} ({brl(antes)})
                </span>
              </div>
            )
          ) : (
            <span style={{ color: 'var(--ink-2)', fontSize: 15 }}>Ano fechado. Sem comparação: não coletamos {anoSel - 1}.</span>
          )}
          <Fonte ano={anoSel} style={{ marginTop: 4 }} />
        </div>
        {antes !== null && anoSel === ano && (
          <div className="sub" style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <p className="eyebrow">Mesmo período de {ano - 1} · até {formatDate(atual.anterior!.ate)}</p>
            <p className="num" style={{ fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, fontSize: 'clamp(28px,6cqw,44px)' }}>{brl(antes)}</p>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(380px,100%),1fr))', gap: 12 }}>
        <div className="sub" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontWeight: 600 }}>Mês a mês</p>
          <Barras atual={cat.por_mes} anterior={catAnt?.por_mes ?? null} parcial={atual.mes_parcial} rotulo={`${nome}: arrecadado`} />
        </div>
        <div className="sub" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontWeight: 600 }}>Acumulado no ano</p>
          <Acumulado atual={cat.por_mes} anterior={catAnt?.por_mes ?? null} />
        </div>
      </div>
      <div className="sub">
        <p className="eyebrow">Códigos oficiais que compõem {id === 'outros-municipais' ? 'esta categoria' : `o ${nome}`}</p>
        <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '6px 0 8px' }}>
          Cada código e descrição vêm do portal. Só publicamos quando a soma de todos os códigos bate com o total do portal.
        </p>
        <div className="crow head" aria-hidden="true">
          <span>Código</span><span>Descrição oficial</span><span>Valor em {anoSel}</span><span />
        </div>
        {doAno.codigos.map((c) => (
          <div key={c.c} className="crow">
            <span className="code">{c.c}</span>
            <span className="desc">{c.d}</span>
            <span className="val num">{brl(c.v)}</span>
            <span className="lk"><LinkPortal href={linkPortal(dados.fonte, { ano: anoSel, codigo: c.c })} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
