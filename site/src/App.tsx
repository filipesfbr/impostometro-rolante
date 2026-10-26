import { useEffect, useState } from 'react';
import type { Resumo } from '../../coletor/src/resumo.ts';
import { formatDateTime } from './lib/format.ts';
import { DeOndeVem, MesAMes, PorHabitante } from './components/Secoes.tsx';
import { Composicao, Hero, Orcamento } from './components/Topo.tsx';
import { Tributos } from './components/Tributos.tsx';
import { Dados, IcoCheck, IcoRelogio, IcoSeta } from './components/ui.tsx';

const LIMITE_ATRASO_MS = 36 * 3600_000;

function FaixaOrigem() {
  return (
    <div className="origin">
      <a href="#de-onde-vem">
        <span className="t">Todos os números vêm do Portal da Transparência da Prefeitura de Rolante</span>
        <span className="ar"><IcoSeta /></span>
      </a>
    </div>
  );
}

function Cabecalho() {
  return (
    <header className="hdr">
      <a className="logo" href="#inicio" aria-label="Impostômetro Rolante, início">
        <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="10" fill="var(--accent)" />
          <path d="M7 21a9 9 0 0 1 18 0" fill="none" stroke="var(--on-accent)" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="16" cy="21" r="2.2" fill="var(--on-accent)" />
        </svg>
        <b>Impostômetro Rolante</b>
      </a>
      <nav className="nav" aria-label="Seções da página">
        <a href="#tributos">Tributos</a>
        <a href="#mes-a-mes">Mês a mês</a>
        <a href="#de-onde-vem">De onde vêm os números</a>
      </nav>
      <span className="badge">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 7.2v4M8 4.9v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Site independente · não oficial
      </span>
    </header>
  );
}

function Rodape({ repo }: { repo?: string }) {
  return (
    <footer className="ftr">
      <p style={{ maxWidth: '70ch' }}>
        Dados: Portal da Transparência da Prefeitura de Rolante · Coleta diária · Site independente, sem vínculo com a prefeitura · Código e
        dados abertos.
      </p>
      <p style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '6px 22px' }}>
        <a href="#de-onde-vem">De onde vêm os números</a>
        {repo && <a href={repo} target="_blank" rel="noopener">Repositório público</a>}
        <a href="#inicio">Voltar ao topo</a>
      </p>
    </footer>
  );
}

function Carregando() {
  return (
    <div style={{ padding: '44px 0', display: 'flex', flexDirection: 'column', gap: 14 }} aria-busy="true" aria-label="Carregando os dados">
      <div className="sk" style={{ width: '60%', height: 18 }} />
      <div className="sk" style={{ width: '100%', height: 72 }} />
      <div className="sk" style={{ width: '46%', height: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
        <div className="sk" style={{ height: 96, borderRadius: 20 }} />
        <div className="sk" style={{ height: 96, borderRadius: 20 }} />
      </div>
    </div>
  );
}

export function App() {
  const [dados, setDados] = useState<Resumo | null>(null);
  const [erro, setErro] = useState(false);
  const [exato, setExato] = useState(true);

  useEffect(() => {
    fetch('dados/site.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setDados)
      .catch(() => setErro(true));
  }, []);

  // O alvo da âncora (#iss, #de-onde-vem) só existe depois que os dados chegam.
  useEffect(() => {
    if (dados && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [dados]);

  const anos = dados ? Object.keys(dados.anos).map(Number).sort() : [];
  const ano = anos.at(-1)!;
  const atrasado = dados && Date.now() - new Date(dados.coletado_em).getTime() > LIMITE_ATRASO_MS;

  return (
    <div className="pg">
      <FaixaOrigem />
      <div className="wrap">
        <Cabecalho />
        {erro && (
          <div className="msg err" role="alert">
            <p>Não conseguimos carregar os dados deste site agora. Tente recarregar a página.</p>
          </div>
        )}
        {!dados && !erro && <Carregando />}
        {dados && (
          <Dados.Provider value={{ dados, ano, atual: dados.anos[ano]!, anterior: dados.anos[ano - 1], exato, setExato }}>
            {atrasado ? (
              <div className="msg warn" role="status" style={{ marginTop: 12 }}>
                <IcoRelogio />
                <p>
                  <b>Atualização pendente.</b> A última coleta foi em {formatDateTime(dados.coletado_em).replace(' ', ' às ')}, há mais de 36
                  horas. Os valores abaixo são dessa coleta e podem estar um pouco atrás do portal.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <span className="pill up"><IcoCheck size={14} />Dados atualizados</span>
                <span className="pill line">coleta de {formatDateTime(dados.coletado_em)}</span>
              </div>
            )}
            <main>
              <Hero />
              <Orcamento />
              <Composicao />
              <Tributos />
              <MesAMes />
              <PorHabitante />
              <DeOndeVem />
            </main>
          </Dados.Provider>
        )}
        <Rodape {...(dados ? { repo: dados.fonte.repositorio } : {})} />
      </div>
    </div>
  );
}
