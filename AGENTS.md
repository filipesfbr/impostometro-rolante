# AGENTS.md

Impostômetro Rolante: site estático que mostra a arrecadação da Prefeitura de Rolante com dados do
Portal da Transparência. Visão geral, comandos e dados: `README.md`.

## Regras que não podem quebrar

- **`docs/fonte-de-verdade.md` (R1–R9) manda.** Nada de estimativa, projeção ou contador por segundo
  (R1). Coleta só é publicada se a soma de cada mês bater ao centavo com o totalizador do portal (R2).
  O campo `nome` da API nunca é gravado (R8) — há teste e passo no `coleta.yml` para isso.
- Valores sempre em **centavos inteiros**; reais só na hora de formatar (`site/src/lib/format.ts`).
- API do portal: **nunca paginar** `ListarReceitas` (1 mês por chamada, `length=20000`), 1 chamada a
  cada 2 s, parâmetro vazio é string vazia (o texto `null` zera os totais).
- Fixtures sem nomes de contribuintes.

## Pipeline

Padrão do repositório [`workflow-test`](https://github.com/filipesfbr/workflow-test): leia o README de
lá antes de mudar `ci.yml`, `bump.yml` ou `release.yml`. As guardas (bump na `develop`, release que
nunca escreve na `main`, guarda de tag, sync que falha em conflito, `delete_branch_on_merge=false`)
seguram problemas reais.

Específico daqui: `coleta.yml` commita na branch `data` (nunca na `main`) e chama `deploy.yml`,
porque push com `GITHUB_TOKEN` não dispara workflow.
