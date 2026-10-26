# Impostômetro Rolante

Quanto a Prefeitura de Rolante (RS) arrecada, com dado real e diário. **Todos os números vêm do
[Portal da Transparência da Prefeitura de Rolante](https://transparencia.abase.com.br/home/apvqyIT7vjY=)**
e cada um tem link para conferir no próprio portal.

Site independente, sem vínculo com a prefeitura. As regras de onde vem cada número estão em
[`docs/fonte-de-verdade.md`](docs/fonte-de-verdade.md) (R1–R9).

## Como funciona

Sem servidor e sem banco:

```
GitHub Actions (todo dia, 06:17 em Brasília)
  └─ coletor (Node + TS, sem dependências) ──► API do portal (Abase)
       ├─ R2: soma dos lançamentos == total do portal, mês a mês (senão nada é publicado)
       ├─ R8: agrega por (dia, código) e descarta o nome do contribuinte
       ├─ R5: registra alterações em dias já coletados
       └─ grava na branch `data` (histórico público dos snapshots, R3)
            └─ deploy: site estático (Vite + React) no GitHub Pages
Visitante ──► "Conferir agora": o navegador consulta o portal ao vivo e compara
```

| Pasta | O quê |
|---|---|
| `coletor/` | coleta, validação, agregação, classificação, diff e o resumo que o site lê (`site.json`) |
| `config/` | `fonte.json` (endereço, token e entidade do portal) e `categorias.json` (código → categoria, R6) |
| `site/` | a página (única, navegação por âncoras) |
| `data/` | **não fica na `main`**: é a branch `data`, gerada pelo coletor |
| `docs/` | regras da fonte de verdade |

## Rodar local

Node 24 (roda TypeScript direto, sem build do coletor).

```bash
npm ci
npm run coletar     # ~2 min (1 chamada a cada 2 s); grava em ./data
npm run dev         # http://localhost:5173
```

Para usar os dados publicados em vez de coletar: `git worktree add data origin/data`.

Antes de abrir PR (é o que o CI roda):

```bash
npm run lint && npm run build && npm test && npm run checks
```

Valores de referência para conferir uma coleta (portal em 26/10/2026): 2025 total R$ 134.900.191,59
(92.812 lançamentos), jan/2025 R$ 9.476.487,92, dez/2025 R$ 15.099.403,32, jan/2026 R$ 10.335.995,26,
orçado 2026 R$ 142.640.000,00.

## Dados

Na branch [`data`](../../tree/data), todos em centavos inteiros, datas `AAAA-MM-DD`:

| Arquivo | Conteúdo |
|---|---|
| `receitas/AAAA.json` · `.csv` | lançamentos somados por dia e código (sem nomes) |
| `totais/AAAA.json` | totais do portal: arrecadado, orçado, %, por mês |
| `site.json` | resumo que a página lê |
| `codigos.json` | descrição oficial de cada código |
| `historico-alteracoes.json` | mudanças em dias já coletados (R5) |
| `populacao.json` | estimativas do IBGE |
| `manifest.json` | data da coleta, validação mês a mês e SHA-256 de cada arquivo |

## Fluxo de trabalho

Mesmo pipeline do [`workflow-test`](https://github.com/filipesfbr/workflow-test) (ler o README de lá
antes de mudar qualquer workflow):

```
PR → develop (squash) → bump automático da versão na develop
develop → main (PR, merge commit) → tag + Release → sync main → develop → deploy
```

| Workflow | Quando | O quê |
|---|---|---|
| `ci.yml` | push/PR | lint, build, test, checks |
| `bump.yml` | push na `develop` | 1 bump de versão por ciclo (minor/major: rodar na mão com `kind`) |
| `release.yml` | push na `main` | tag `vX.Y.Z` + Release; sincroniza `main → develop` |
| `deploy.yml` | push na `main`, chamado pela coleta, manual | build com a branch `data` e publica no Pages |
| `coleta.yml` | todo dia 09:17 UTC, manual | coleta → commit na `data` → deploy |

O código vai por PR; os dados vão direto na `data`, pela coleta. Assim o histórico de releases fica
só com mudança de código, e o da `data` é o registro diário do que o portal mostrava.

## Configuração do repositório

1. Empurre a `main` primeiro (a primeira branch vira a default).
2. Rode `scripts/bootstrap-repo.sh filipesfbr/impostometro-rolante`: cria a `develop`, ajusta merge
   (`delete_branch_on_merge: false`, sem rebase), cria os rulesets (`main`, `develop`, `data`) e liga
   o GitHub Pages pelo Actions.
3. Rode a primeira coleta na mão: `gh workflow run coleta.yml --ref main`.
