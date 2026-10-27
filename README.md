<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/img/lockup-dark.png">
    <img src="docs/img/lockup.png" alt="Impostômetro Rolante" width="250">
  </picture>
</h1>

Quanto a Prefeitura de Rolante (RS) arrecada, com dado real e diário. **Todos os números vêm do
[Portal da Transparência da Prefeitura de Rolante](https://transparencia.abase.com.br/home/apvqyIT7vjY=)**
e cada um tem link para conferir no próprio portal.

**Site:** [filipesfbr.github.io/impostometro-rolante](https://filipesfbr.github.io/impostometro-rolante/)

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
```

| Pasta | O quê |
|---|---|
| `coletor/` | coleta, validação, agregação, classificação, diff e o resumo que o site lê (`site.json`) |
| `config/` | `fonte.json` (endereço, token e entidade do portal), `categorias.json` (código → categoria, R6) e `populacao-ibge.json` (última estimativa do IBGE, usada quando a API do IBGE não responde) |
| `site/` | a página (única, navegação por âncoras) |
| `data/` | **não fica na `main`**: é a branch `data`, gerada pelo coletor |
| `docs/` | regras da fonte de verdade e o pacote de marca (`docs/brand/`) |

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

## Identidade visual

O site segue o sistema de marcas Rolante. A fonte de verdade é
[`docs/brand/impostometro-rolante/`](docs/brand/impostometro-rolante/README.md) (regras, `brands.json`
e os SVGs da marca).

- **Uma cor de acento:** terracota `#b4622f` no tema claro, âmbar `#d98a52` no escuro. Nada de outra cor;
  séries de apoio nos gráficos usam neutros e forma (tracejado, opacidade).
- **Neutros:** tinta `#26221d`, creme `#fbf4e9`, fundo `#faf8f4`, corpo `#5a534a`, linha `#ece7df`.
- **Forma:** sem sombras e sem gradientes; cartões brancos com borda de 1 px e raio de 14 px; ícones em
  traço único de 1.8 com pontas redondas.
- **Fonte:** Inter (local, via `@fontsource-variable/inter`); números com `tabular-nums`.
- **Contraste:** texto pequeno nunca em terracota nem no cinza apagado (`#9a9082`); eles ficam para
  texto grande, traços e ícones.

| Onde | O quê |
|---|---|
| `site/src/styles/tokens.css` | único lugar com cores; temas claro e escuro |
| `site/src/components/brand/` | `BrandMark` e `BrandLockup`: a marca só entra por eles |
| `site/public/` | favicon, ícones do manifest, `apple-touch-icon` e `og-image` |
| `docs/img/` | assinatura em PNG para este README (o `<text>` dos SVGs não carrega a Inter no GitHub) |

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

### Rodar a coleta na mão

Pelo GitHub: **Actions → Coleta diária → Run workflow** (branch `main`). Ou pelo terminal:

```bash
gh workflow run coleta.yml --ref main
gh run watch   # acompanha até terminar
```

A coleta leva cerca de 2 minutos, grava na branch `data` e publica o site em seguida. Se algum mês
não bater com o portal, nada é publicado e o site continua na coleta anterior.

O código vai por PR; os dados vão direto na `data`, pela coleta. Assim o histórico de releases fica
só com mudança de código, e o da `data` é o registro diário do que o portal mostrava.

## Configuração do repositório

1. Empurre a `main` primeiro (a primeira branch vira a default).
2. Rode `scripts/bootstrap-repo.sh filipesfbr/impostometro-rolante`: cria a `develop`, ajusta merge
   (`delete_branch_on_merge: false`, sem rebase), cria os rulesets (`main`, `develop`, `data`) e liga
   o GitHub Pages pelo Actions.
3. Rode a primeira coleta na mão: `gh workflow run coleta.yml --ref main`.

## Licença

Código sob [MIT](LICENSE). Os dados são públicos e pertencem à fonte: Portal da Transparência da
Prefeitura de Rolante e IBGE.
