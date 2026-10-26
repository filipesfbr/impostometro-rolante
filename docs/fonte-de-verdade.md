# Fonte de verdade — Impostômetro Rolante

> Definição de onde vem cada número do site e das regras para exibi-lo.
> Definido em 26/10/2026. Estas regras valem para o coletor e para o site.

---

## 1. Definição

> **A única fonte de verdade é o Portal da Transparência da Prefeitura Municipal de Rolante**
> (https://transparencia.abase.com.br/home/apvqyIT7vjY=, operado pela Abase Sistemas),
> **entidade "Prefeitura Municipal de Rolante"**.
>
> Um número está correto quando é **igual ao que o portal exibe** para o mesmo filtro.

O site **não produz dados**: ele copia, organiza e mostra o que o portal publica. A nossa base é um **espelho datado** do portal, nunca a fonte.

---

## 2. Hierarquia

| Nível | O quê | Origem (endpoint) | Papel |
|---|---|---|---|
| **1. Fonte de verdade** | Total arrecadado (ano, mês, dia, código), total orçado, % do orçado | `ListaTotalizadorReceitas`, `TotalizadorReceitasOrcadas` — os cartões da tela de Receitas do portal | define o número |
| **2. Detalhe** | Lançamentos diários por código de receita | `ListarReceitas` | permite quebrar por tributo, mês e dia. **Só é aceito se a soma bater com o nível 1** |
| **3. Conferência** | Receita realizada declarada ao Tesouro | SICONFI — MSC mensal (`msc_orcamentaria`) | **nunca altera número**; divergência vira alerta interno e nota pública |
| Apoio | População | IBGE (agregado 6579) | fonte de verdade só para "por habitante" |
| Espelho | Snapshots diários | nossa coleta | cópia auditável, nunca fonte |

---

## 3. Regras

**R1 — Nenhum número sem origem.** Todo número exibido é um valor do portal, ou uma soma ou divisão simples de valores do portal (ex.: por habitante, % do total). **Proibido:** projeção, estimativa, extrapolação ("R$ por segundo"), correção pela inflação, média de anos.

**R2 — Fechamento obrigatório.** A cada coleta, para cada mês: `soma(lançamentos do mês) == totalizador do mês` (tolerância R$ 0,01). Se algum mês não fechar, **aquela coleta não é publicada**. O site continua com o último snapshot válido e mostra "atualização pendente".

**R3 — Snapshot imutável.** Cada coleta guarda os dados da API **já agregados por (data, código) e sem o campo `nome`** (R8), os totalizadores do portal, a data/hora da coleta e o hash SHA-256 de cada arquivo. O histórico do repositório git é o registro imutável. Os snapshots ficam versionados e públicos. Assim dá para provar o que o portal mostrava em cada data.

**R4 — Rastreabilidade na tela.** Todo número exibe: *"Fonte: Portal da Transparência de Rolante · coletado em dd/mm/aaaa hh:mm · [conferir no portal]"*. O link abre a tela do portal com o mesmo filtro aplicado. A data exibida é a **da nossa coleta** e a **do último lançamento**: a "Última Atualização" do rodapé do portal é só o relógio do navegador e não serve como dado.

**R5 — Mudanças retroativas.** O portal pode alterar valores passados (estornos, lançamentos com data anterior). O site mostra sempre o último snapshot válido, e cada diferença em relação ao anterior entra num **histórico de alterações** público.

**R6 — Classificação transparente.** As categorias (ISS, IPTU, Taxas…) são agrupamentos dos **códigos oficiais de natureza da receita**, não interpretação nossa. A tabela código → categoria é publicada no site:

| Categoria | Códigos (prefixo) |
|---|---|
| ISS | `111451` |
| IPTU | `111250` |
| ITBI | `111253` |
| IRRF | `11130` |
| Taxas | `112` |
| COSIP (iluminação pública) | `124` |
| Outros tributos municipais | demais `11` e `12` |
| Transferências | `17` e `24` |
| Outras receitas | demais |

**R7 — Escopo.** Só a **Prefeitura** (a Câmara fica de fora). Só o que o portal publica: **tributos estaduais e federais não entram**.

**R8 — Privacidade.** Nomes de contribuintes **nunca são armazenados nem publicados**. A coleta agrega por `(data, código)` e descarta o campo `nome` antes de gravar.

**R9 — Divergência externa.** Se o SICONFI divergir do portal, o site mantém o número do portal e acrescenta uma nota explicando a diferença (ex.: retenção do FUNDEB registrada em outra conta).

---

## 4. Como o site interativo aplica isso

```
coletor diário (06:17) ──► API do portal (Abase)
   │  valida R2, descarta nomes (R8)
   ▼
snapshots versionados na branch `data` (JSON + hash + data/hora)   ◄── R3, R5
   ▼
site estático lê os JSON  ──► gráficos, filtros, comparações
   │
   └─ link "conferir no portal" em cada número: abre a tela de Receitas
      do portal com o mesmo ano, mês e código                       ◄── R4
```

- O site **não depende da API em tempo real**. A API tem rate limit com reCAPTCHA e pode mudar sem aviso; se o portal cair, o site mostra o último snapshot com a data.
- A conferência é diária e automática: a coleta só é publicada se cada mês bater com o portal (R2). O site mostra quantos meses conferiram na última coleta.
- A interatividade (filtrar por mês, comparar anos, ver por tributo) usa só os dados do snapshot (níveis 1 e 2).

---

## 5. Texto público sugerido ("De onde vêm os números")

> Todos os valores deste site vêm do **Portal da Transparência da Prefeitura de Rolante**. Não fazemos estimativas: mostramos o que a prefeitura publica, organizado de forma mais fácil de entender. Os dados são coletados todos os dias e só são publicados quando a soma confere exatamente com o total exibido no portal. Em cada número há um link para você conferir no próprio portal. Nomes de contribuintes não são coletados.

---

## 6. O que pode invalidar esta definição

| Evento | Efeito | Resposta |
|---|---|---|
| Abase muda a API | coleta falha ou R2 não fecha | site congela no último snapshot e exibe aviso; ajustar o coletor |
| Prefeitura troca de sistema (já aconteceu em mar/2026) | fonte muda de endereço ou formato | redefinir o nível 1 para o novo portal; documentar a data da troca |
| Portal fora do ar | sem coleta | último snapshot com data visível |
| Portal publica valor errado | o site repete o erro | por definição o site espelha o portal; aceita-se que o erro pertence à fonte; a nota do SICONFI (R9) pode sinalizar |
