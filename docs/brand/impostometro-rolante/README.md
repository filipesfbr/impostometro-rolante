# Sistema de marcas Rolante

Pacote com as marcas da família Rolante e as regras para criar novas. Serve de fonte de verdade para o Claude (ou qualquer designer) gerar peças e marcas novas sem perder a coerência.

Marcas atuais:

| Marca | O que é | Símbolo interno | Pasta |
| --- | --- | --- | --- |
| **auditoria-rolante** | Orquestração de agentes de IA que alimenta o portal | Três nós ligados em fila (pipeline) | `assets/auditoria-rolante/` |
| **Impostômetro Rolante** | Site que mostra a receita acumulada de Rolante | Mostrador de meia volta com ponteiro | `assets/impostometro-rolante/` |

Arquivos do pacote:

- `README.md` — este documento (regras, medidas, inventário).
- `PROMPT.md` — texto para colar no Claude como instrução permanente e exemplos de pedido.
- `brands.json` — as mesmas informações em formato legível por máquina.
- `assets/` — 33 SVGs, sem metadados, prontos para uso.
- `reference/` — páginas HTML de referência visual (Acervo de Marca, Impostômetro Rolante e as explorações descartadas).

---

## 1. Fundação

### Cores

| Nome | Hex | Papel |
| --- | --- | --- |
| Terracota | `#b4622f` | Cor de marca. Traço do símbolo e palavra de acento em fundo claro |
| Âmbar | `#d98a52` | Terracota em fundo escuro |
| Tinta | `#26221d` | Texto, fundo escuro, contorno da marca interna (auditoria) |
| Creme | `#fbf4e9` | Preenchimento do símbolo, fundo de peças de marca |
| Branco | `#ffffff` | Versão negativa |
| Fundo de página | `#faf8f4` | Fundo dos sites |
| Corpo | `#5a534a` | Texto corrido |
| Apagado | `#9a9082` | Metadados, legendas |
| Linha | `#ece7df` | Bordas e divisórias |

Uma única cor de acento (terracota). Não introduzir outra. Para variações pontuais, derivar na mesma família em oklch, com mesma croma e luminância.

### Tipografia

- Família única: **Inter** (400 a 800). Fallback `'Helvetica Neue', Arial, sans-serif`.
- Nomes de marca: 700 (Impostômetro Rolante) ou 600 (auditoria-rolante).
- Rótulos pequenos: 12 px, 600, caixa alta, tracking `0.08em`.

### Forma

- Sem sombras, sem gradientes. Profundidade por borda `1px #ece7df` e fundo branco.
- Raio de cartão 14 px. Pílulas 20 a 30 px.
- Traço único, terminações arredondadas.

---

## 2. A gota: construção do símbolo

Toda marca parte do mesmo contorno.

```
viewBox      0 0 26 34
contorno     <rect x="2" y="2" width="22" height="30" rx="11"/>   (pílula vertical)
espessura    1.8 no contorno
interior     1.4 a 1.5, stroke-linecap round
eixo         x = 13
área útil    x 5 a 21, y 6 a 28 (dentro do contorno, com respiro)
```

Regras para o desenho interno:

1. Uma ideia só, lida em um segundo.
2. No máximo três elementos.
3. Um elemento (o que importa) pode ficar na cor de acento ou em traço cheio; o resto fica em opacidade 0.3 a 0.55.
4. Nenhum elemento toca o contorno.
5. Precisa funcionar no favicon de 16 px só com o elemento principal.

### Leitura das três marcas

| Marca | Contorno | Interior |
| --- | --- | --- |
| auditoria-rolante | tinta, preenchimento creme | `M13 12.4 L13 15.6 M13 19.4 L13 22.6` (.55, 1.4) e círculos r 1.9 em `(13,10.4)`, `(13,17.5)`, `(13,24.6)`; o último em terracota |
| Impostômetro Rolante | terracota, preenchimento creme | arco `M6.2 22 A6.8 6.8 0 0 1 19.8 22` (.45, 1.4), ponteiro `M13 22 L17.2 15.6` (1.8) e círculo r 1.9 em `(13,22)` |

### Lógica de cor

- **Voltada ao cidadão** (portal, impostômetro): contorno terracota sobre creme; palavra de acento em terracota.
- **Interna e técnica** (auditoria): contorno em tinta, terracota só no elemento de saída.
- Fundo escuro: fundo `#26221d`; contorno e acento em âmbar `#d98a52` (voltada ao cidadão) ou contorno creme `#fbf4e9` com acento âmbar (técnica).
- Uma cor: tinta `#26221d` ou branco, sem preenchimento.

---

## 3. Assinatura (nome)

| Marca | Texto | Peso | Tracking | Acento |
| --- | --- | --- | --- | --- |
| auditoria-rolante | `auditoria` + **`-rolante`** | 600 | -0.01em | `-rolante` em terracota |
| Impostômetro Rolante | `Impostômetro ` + **`Rolante`** | 700 | -0.02em | `Rolante` em terracota |

Padrão para novas marcas: nome do produto em tinta + a palavra que liga ao município (ou o sufixo que o define) em terracota. Capitalização igual à do nome público. Produtos técnicos e internos usam minúsculas, hífen e peso 600.

### Geometria dos arquivos

| Peça | Medidas |
| --- | --- |
| Horizontal | altura 34. Símbolo escala 1 em (0,0). Texto em `x=38 y=24`, 20 px, `letter-spacing=-0.40` (700) ou `-0.20` (600). Largura = 38 + largura do texto |
| Vertical | altura 96. Símbolo em `translate(centro-15 0) scale(1.15)`. Texto centralizado em `y=88`, 20 px |
| Favicon | 32×32, `rx=7`, fundo terracota (ou tinta na marca técnica). Símbolo em `translate(7.3 4.6) scale(0.67)`, traço creme 1.8 |
| Ícone de app | 512×512, `rx=112`. Símbolo em `translate(88.3 36.8) scale(12.9)`, traço creme ≈1.78 |
| Cartão social | 1200×1200, fundo creme. Símbolo em `translate(366.2 190.2) scale(18)` com traço 1.444. Nome centralizado em `y=940`, 84 px, `letter-spacing=-1.68` |

Os SVGs de assinatura usam `<text>` com Inter. Se o destino não carregar a fonte, converter o texto em curvas na exportação.

### Respiro e tamanhos mínimos

- Margem livre ao redor da assinatura = largura do símbolo.
- Mínimo: símbolo 16 px; assinatura horizontal 132 px. Abaixo disso, usar o favicon.
- Não girar, distorcer, sombrear, aplicar gradiente, trocar a fonte nem alterar a espessura do traço.

---

## 4. Inventário de arquivos

Cada marca tem este conjunto. Marca nova deve entregar pelo menos os itens marcados com ●.

| Arquivo | Uso | Obrigatório |
| --- | --- | --- |
| `mark.svg` | símbolo, fundo claro | ● |
| `mark-dark.svg` | símbolo, fundo escuro | ● |
| `mark-mono-ink.svg` | uma cor, tinta | ● |
| `mark-mono-white.svg` | uma cor, branco | ● |
| `lockup-horizontal.svg` | assinatura padrão | ● |
| `lockup-horizontal-dark.svg` | assinatura em fundo escuro | ● |
| `lockup-stacked.svg` | assinatura vertical | ● |
| `favicon.svg` | aba do navegador | ● |
| `app-icon-512.svg` | app / PWA | ● |
| `social-square-1200.svg` | redes e Open Graph | ● |

Disponibilidade hoje:

- `auditoria-rolante/` — 9 arquivos (sem `social-square-1200.svg`).
- `impostometro-rolante/` — 10 arquivos (conjunto obrigatório completo).

Pendente: gerar `social-square-1200.svg` do auditoria-rolante e os extras mono das duas marcas novas, se forem necessários.

---

## 5. Impostômetro Rolante: decisões

- **Conceito:** o site mostra quanto Rolante já arrecadou. O mostrador é um medidor, o ponteiro é o valor acumulado.
- **Escolhida:** variação 2a (medidor).
- **Descartadas, mantidas em `reference/Impostometro Rolante v2.dc.html`:** 2b contador (odômetro com último dígito em terracota), 2c pilha de moedas, 3a escala (cinco marcas ao redor do ponteiro), 3b arco com janela de contador, 3c velocímetro (anel de três quartos). A 3a e a 3c são as alternativas mais próximas, caso se queira retomar.
- **Primeira versão (gota com nível):** `reference/Impostometro Rolante v1.dc.html`.
- **Favicon:** mostra só o ponteiro e o contorno; o arco some em 16 px.

---

## 6. Como criar uma marca nova

Peça ao Claude com as informações abaixo (ver exemplos em `PROMPT.md`):

1. **Nome** e o que o produto faz, em uma frase.
2. **Público:** cidadão (contorno terracota) ou interno (contorno tinta).
3. **A ideia que o símbolo deve comunicar.**
4. **Quais arquivos** (padrão: os 10 obrigatórios).

Processo que o Claude deve seguir:

1. Propor 3 ideias de símbolo interno, mostradas dentro da gota, com versão clara, escura, favicon e assinatura.
2. Esperar a escolha.
3. Gerar o conjunto completo dentro da geometria da seção 3.
4. Salvar em `assets/<nome-da-marca>/`, atualizar `brands.json` e a tabela da seção 1 deste README.
