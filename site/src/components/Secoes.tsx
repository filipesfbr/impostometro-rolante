import { useState } from 'react';
import { formatDate, formatInt, formatPerCapita, MESES_EXTENSO } from '../lib/format.ts';
import { Barras } from './Graficos.tsx';
import { Fonte, IcoBaixar, LinkPortal, Seg, useDados } from './ui.tsx';

export function MesAMes() {
  const { ano, atual, anterior } = useDados();
  const [metrica, setMetrica] = useState<'total' | 'trib'>('total');
  const trib = metrica === 'trib';
  const parcial = atual.mes_parcial;
  return (
    <section id="mes-a-mes" className="sec" aria-labelledby="h-mes">
      <p className="eyebrow">{trib ? 'Tributos municipais' : 'Receita total'} · por mês</p>
      <h2 id="h-mes" className="h2">Mês a mês</h2>
      <p className="lead">
        {ano} ao lado de {ano - 1}.
        {parcial && ` ${MESES_EXTENSO[parcial - 1]![0]!.toUpperCase()}${MESES_EXTENSO[parcial - 1]!.slice(1)} está incompleto: vai só até ${formatDate(atual.ate).slice(0, 5)}.`}
      </p>
      <div className="panel" style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Seg
          label="O que mostrar no gráfico"
          valor={metrica}
          opcoes={[['total', 'Receita total'], ['trib', 'Só tributos municipais']]}
          onChange={setMetrica}
          style={{ background: 'var(--bg)', alignSelf: 'flex-start' }}
        />
        <Barras
          key={metrica}
          atual={trib ? atual.municipal_por_mes : atual.por_mes}
          anterior={anterior ? (trib ? anterior.municipal_por_mes : anterior.por_mes) : null}
          parcial={parcial}
          rotulo={trib ? 'Tributos municipais' : 'Receita total'}
        />
        <Fonte />
      </div>
    </section>
  );
}

export function PorHabitante() {
  const { dados, ano, atual, brl } = useDados();
  const [porHab, setPorHab] = useState(false);
  // Estimativa do IBGE do próprio ano ou, se ainda não saiu, a mais recente antes dele.
  const anoPop = Object.keys(dados.populacao).map(Number).filter((a) => a <= ano).sort().at(-1);
  const pop = anoPop ? dados.populacao[anoPop]! : null;
  if (!pop) return null;
  const v = (c: number) => (porHab ? formatPerCapita(Math.round(c / pop)) : brl(c));
  const ate = formatDate(atual.ate).slice(0, 5);
  return (
    <section id="por-habitante" className="sec" aria-labelledby="h-hab">
      <p className="eyebrow">Em escala de pessoa</p>
      <h2 id="h-hab" className="h2">Por habitante</h2>
      <div style={{ margin: '20px 0' }}>
        <Seg label="Total ou por habitante" valor={porHab} opcoes={[[false, 'Total'], [true, 'Por habitante']]} onChange={setPorHab} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 12 }} aria-live="polite">
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="eyebrow">Receita total · {ano} até {ate}</p>
          <p className="num" style={{ fontWeight: 600, letterSpacing: '-.045em', lineHeight: 1, fontSize: 'clamp(30px,7cqw,60px)' }}>{v(atual.arrecadado)}</p>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="eyebrow">Tributos municipais · {ano} até {ate}</p>
          <p className="num" style={{ fontWeight: 600, letterSpacing: '-.045em', lineHeight: 1, fontSize: 'clamp(30px,7cqw,60px)' }}>{v(atual.grupos.municipal)}</p>
        </div>
      </div>
      <Fonte
        style={{ marginTop: 16 }}
        antes={
          <span>
            População considerada: {formatInt(pop)} habitantes (estimativa do IBGE para {anoPop}) ·{' '}
          </span>
        }
      />
    </section>
  );
}

const REGRAS = [
  ['Sem estimativas', 'Só aparece o que o portal publicou. Se não há dado, o espaço fica vazio.'],
  ['A soma tem que bater', 'Só publicamos quando a soma dos lançamentos confere, ao centavo, com o total do portal, mês a mês.'],
  ['Sem nomes de pessoas', 'Nomes de contribuintes não são coletados nem guardados.'],
  ['Confira você mesmo', 'Cada número tem um link que abre o portal oficial com o mesmo filtro.'],
];

export function DeOndeVem() {
  const { dados, ano, atual, brl } = useDados();
  const repo = dados.fonte.repositorio;
  const caixa = { background: 'color-mix(in srgb,var(--on-inv) 10%,transparent)', borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 } as const;
  const { meses_ok, meses_total } = dados.validacao;
  return (
    <section id="de-onde-vem" className="sec" aria-labelledby="h-onde">
      <div className="inv">
        <span className="pill accent">a parte mais importante do site</span>
        <h2 id="h-onde" className="h2" style={{ fontSize: 'clamp(34px,9.5cqw,84px)', margin: '22px 0 18px', maxWidth: '18ch' }}>De onde vêm os números</h2>
        <p style={{ fontSize: 'clamp(18px,3cqw,26px)', lineHeight: 1.3, maxWidth: '34ch', letterSpacing: '-.02em' }}>
          Todos os valores vêm do Portal da Transparência da Prefeitura de Rolante. Não fazemos estimativas.
        </p>
        <p className="mut" style={{ fontSize: 17, lineHeight: '26px', maxWidth: '62ch', marginTop: 16 }}>
          Mostramos o que a prefeitura publica, organizado de forma mais fácil de entender. Os dados são coletados todos os dias e só são
          publicados quando a soma confere exatamente com o total exibido no portal. Em cada número há um link para você conferir no próprio
          portal. Este site é independente e não tem vínculo com a prefeitura.
        </p>
        <p style={{ marginTop: 16 }}>
          <LinkPortal href={dados.fonte.portal}>Abrir o Portal da Transparência de Rolante</LinkPortal>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '24px 32px', marginTop: 48 }}>
          {REGRAS.map(([t, d], i) => (
            <div key={t} className="rule">
              <p className="num mut" style={{ fontSize: 14 }}>0{i + 1}</p>
              <p style={{ fontWeight: 600, fontSize: 20, letterSpacing: '-.02em', margin: '4px 0 6px' }}>{t}</p>
              <p className="mut" style={{ fontSize: 15, lineHeight: '22px' }}>{d}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 12, marginTop: 48 }}>
          <div style={caixa}>
            <p className="mut" style={{ fontSize: 14, fontWeight: 500 }}>Status da última coleta</p>
            <p className="num" style={{ fontWeight: 600, letterSpacing: '-.035em', fontSize: 34, lineHeight: 1.05 }}>
              {formatDate(dados.coletado_em)} às {dados.coletado_em.slice(11, 16)}
            </p>
            <span className="pill accent" style={{ alignSelf: 'flex-start' }}>
              {meses_ok} de {meses_total} meses conferidos {meses_ok === meses_total ? '✓' : ''}
            </span>
            <p className="mut" style={{ fontSize: 14 }}>
              Último lançamento no portal: {formatDate(dados.ultimo_lancamento)}. Coleta diária, às 6h. Se passar de 36 horas sem coleta, o site avisa no topo.
            </p>
          </div>
          <div style={{ ...caixa, gap: 14 }}>
            <p className="mut" style={{ fontSize: 14, fontWeight: 500 }}>Baixar os dados</p>
            <p style={{ fontSize: 18, lineHeight: '26px', letterSpacing: '-.01em' }}>
              Os lançamentos de {ano}, somados por dia e código, em formato aberto. Sem nomes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <a className="btn-inv" href={`dados/receitas/${ano}.json`} download><IcoBaixar />JSON</a>
              <a className="btn-inv" href={`dados/receitas/${ano}.csv`} download><IcoBaixar />CSV</a>
              <a className="btn-inv o" href={repo} target="_blank" rel="noopener">Repositório público ↗</a>
            </div>
            <p className="mut" style={{ fontSize: 14 }}>
              Todas as coletas ficam guardadas, com data e hash, na <a href={`${repo}/commits/data`} target="_blank" rel="noopener">branch de dados do repositório</a>.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <p style={{ fontWeight: 600, fontSize: 24, letterSpacing: '-.03em' }}>Como agrupamos os códigos</p>
          <p className="mut" style={{ margin: '6px 0 16px', maxWidth: '60ch' }}>
            Cada categoria é a soma dos códigos oficiais de 16 dígitos do portal que começam com o prefixo indicado. Vale o primeiro prefixo que
            casar, de cima para baixo.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Categoria</th><th>Prefixos</th><th className="r">Códigos em {ano}</th><th className="r">Valor em {ano}</th></tr>
              </thead>
              <tbody>
                {dados.categorias.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{c.prefixos.map((p) => p || 'demais').join(' · ')}</td>
                    <td className="r">{atual.categorias[c.id]!.codigos.length}</td>
                    <td className="r num">{brl(atual.categorias[c.id]!.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="historico" style={{ marginTop: 56 }}>
          <p style={{ fontWeight: 600, fontSize: 24, letterSpacing: '-.03em' }}>Histórico de alterações</p>
          {dados.historico.length ? (
            <ul className="hist">
              {[...dados.historico].reverse().map((h) => (
                <li key={`${h.detectado_em}-${h.ano}-${h.mes}-${h.codigo}`}>
                  <b>{formatDate(h.detectado_em)}</b> · {MESES_EXTENSO[h.mes - 1]} de {h.ano} · código <span style={{ fontFamily: 'var(--font-mono)' }}>{h.codigo}</span>: de{' '}
                  {brl(h.antes)} para {brl(h.depois)}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ marginTop: 14, border: '1.5px dashed color-mix(in srgb,var(--on-inv) 45%,transparent)', borderRadius: 24, padding: '22px 24px' }}>
              <p className="mut" style={{ fontSize: 15, lineHeight: '22px', maxWidth: '62ch' }}>
                Nenhuma alteração registrada até agora. Quando o portal mudar um valor de um dia que já tínhamos coletado, o registro aparece aqui:
                data da nossa coleta, mês, código, valor anterior e valor novo.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
