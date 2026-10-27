# Handoff: adequar o Impostômetro Rolante ao sistema de marcas Rolante

Documento para o Claude Code. Objetivo: aplicar na aplicação existente a identidade visual (tokens, tipografia, forma) e a marca **Impostômetro Rolante** (logo, favicon, ícones, cartão social), sem mexer em dados, cálculos nem regras de negócio.

## 1. Contexto

- **Produto:** site independente que mostra a receita acumulada da Prefeitura de Rolante (RS) com dados do Portal da Transparência, sem estimativas. Se a aplicação já tiver aviso de "não oficial" ou fonte dos dados, mantenha.
- **Stack prevista:** React + TypeScript, gráficos com Recharts, estilos com variáveis CSS (design tokens). Se o repositório usar algo diferente, siga o que já existe e adapte os exemplos abaixo.
- **Direção de interface:** moderna, mobile first, claro e escuro. Referência de atitude: site da On Running (muito respiro, tipografia grande, números em destaque). A paleta e a forma, porém, são as deste documento, não as da referência.
- **Escopo:** visual. Não alterar fontes de dados, fórmulas, rotas nem a lógica do medidor.

## 2. Fonte de verdade

Pasta `impostometro-rolante_handoff/` (este pacote, só com o Impostômetro Rolante; copie para o repositório, por exemplo em `docs/brand/`, ou aponte para ela). O `README.md` descreve o sistema de marcas Rolante inteiro (inclui TransparêncIA e auditoria-rolante), mas só o Impostômetro Rolante é escopo desta tarefa:

| Caminho | Para quê |
| --- | --- |
| `README.md` | regras, medidas e decisões do sistema |
| `brands.json` | os mesmos dados em formato de máquina (cores, geometria, marcas) |
| `assets/impostometro-rolante/` | os 10 SVGs da marca |
| `reference/Impostometro Rolante.dc.html` | página de referência visual da marca |
| `reference/Impostometro Rolante v2.dc.html` | explorações descartadas (não implementar) |

Em conflito, vale `README.md`. Não há telas da aplicação neste pacote: aplique o sistema sobre o layout atual e só reestruture onde for necessário para respeitar as regras.

## 3. Regras que não se negociam

1. Uma única cor de acento: terracota. Não introduzir outra cor. Para séries extras de gráfico, derivar na mesma família (ver seção 7).
2. Sem sombras e sem gradientes. Profundidade vem de borda de 1 px e fundo branco.
3. Fonte única: Inter (400 a 800).
4. Traço único, de pontas arredondadas, nos ícones e ilustrações.
5. Não girar, distorcer, sombrear, trocar a fonte nem alterar a espessura do traço da marca.

## 4. Design tokens

Crie um arquivo único de tokens (ex.: `src/styles/tokens.css`) e faça todo o resto consumi-lo. Nenhum hex solto nos componentes.

```css
:root {
  /* marca */
  --terracota: #b4622f;
  --ambar: #d98a52;
  --tinta: #26221d;
  --creme: #fbf4e9;
  --branco: #ffffff;

  /* interface (tema claro) */
  --bg: #faf8f4;          /* fundo de página */
  --surface: #ffffff;     /* cartões */
  --brand-bg: #fbf4e9;    /* fundo de peças de marca, preenchimento do símbolo */
  --text: #26221d;
  --text-body: #5a534a;   /* texto corrido */
  --text-muted: #9a9082;  /* só metadados grandes e decoração, ver seção 8 */
  --line: #ece7df;
  --accent: #b4622f;

  /* forma */
  --radius-card: 14px;
  --radius-pill: 24px;    /* faixa permitida: 20 a 30 */
  --stroke: 1px;

  /* tipo */
  --font: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

/* tema escuro: segue o sistema; permitir também forçar por [data-theme] se a app já tiver alternador */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { /* mesmos valores de [data-theme='dark'] abaixo */ }
}
:root[data-theme='dark'] {
  --bg: #26221d;                         /* tinta */
  --surface: #312c27;                    /* creme a 5% sobre tinta */
  --brand-bg: #26221d;
  --text: #fbf4e9;                       /* creme */
  --text-body: rgba(251, 244, 233, 0.72);
  --text-muted: rgba(251, 244, 233, 0.65);
  --line: #403b35;                       /* creme a 12% sobre tinta */
  --accent: #d98a52;                     /* âmbar */
}
```

Observação para o dev: o `README` define só o fundo escuro (`#26221d`), o creme e o âmbar para o escuro. Os valores de `--surface`, `--line` e opacidades de texto no escuro são derivados do próprio creme sobre a tinta (sem matiz novo), então são uma proposta a confirmar visualmente, não regra do sistema.

### Tipografia

- Carregar Inter localmente (ex.: `@fontsource-variable/inter`, ou `@fontsource/inter` nos pesos 400, 500, 600, 700 e 800), com `font-display: swap` e subconjunto latino. Evite depender de CDN.
- Corpo: 16 px, `line-height` 1.65, cor `--text-body`.
- Títulos: 700, `letter-spacing` entre -0.02em e -0.03em.
- Rótulos pequenos: 12 px, 600, caixa alta, `letter-spacing: 0.08em`.
- Números do impostômetro (valor acumulado, totais): `font-variant-numeric: tabular-nums`, peso 700 ou 800, tracking -0.03em. É o elemento de maior destaque da página; pode ser grande (de 48 px no mobile a 96 px ou mais no desktop), sempre com `tabular-nums` para o contador não "tremer".

### Forma e componentes base

| Elemento | Regra |
| --- | --- |
| Cartão | fundo `--surface`, borda `1px solid var(--line)`, raio 14 px, sem sombra |
| Pílula / chip | raio 20 a 30 px, borda `1px solid var(--line)` |
| Divisória | `1px solid var(--line)` |
| Botão primário | fundo `--accent`, texto: ver nota de contraste na seção 8; raio de pílula |
| Link | cor `--text`, sublinhado em `--accent` com `text-underline-offset: 4px` |
| Foco | `outline: 2px solid var(--accent); outline-offset: 2px` (visível nos dois temas) |
| Alvos de toque | mínimo 44 × 44 px |

## 5. A marca Impostômetro Rolante

### Construção (para conferir qualquer SVG)

```
viewBox      0 0 26 34
contorno     <rect x="2" y="2" width="22" height="30" rx="11"/>   traço 1.8
interior     arco   M6.2 22 A6.8 6.8 0 0 1 19.8 22   traço 1.4, opacidade .45
             ponteiro  M13 22 L17.2 15.6              traço 1.8
             pino   círculo r 1.9 em (13, 22)
pontas       stroke-linecap round
```

O arco e o contorno são o fundo; o ponteiro é o elemento que importa (o valor acumulado).

### Assinatura (nome)

`Impostômetro ` em `--text` + `Rolante` em `--accent`, Inter 700, `letter-spacing: -0.02em`. Renderize como **texto HTML**, não como `<img>` do SVG: o `<text>` dos SVGs depende da fonte instalada no destino, e em `<img>` ela não é carregada.

### Componente React sugerido

Crie `src/components/brand/` com estes dois componentes e use-os em todo lugar (cabeçalho, rodapé, tela de carregamento, 404).

```tsx
// BrandMark.tsx
type Props = { height?: number; tone?: 'auto' | 'ink' | 'white'; title?: string };

export function BrandMark({ height = 34, tone = 'auto', title }: Props) {
  const stroke =
    tone === 'ink' ? 'var(--tinta)' : tone === 'white' ? 'var(--branco)' : 'var(--accent)';
  const fill = tone === 'auto' ? 'var(--brand-bg)' : 'none';
  return (
    <svg
      width={(height * 26) / 34}
      height={height}
      viewBox="0 0 26 34"
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="2" y="2" width="22" height="30" rx="11" fill={fill} stroke={stroke} strokeWidth="1.8" />
      <path d="M6.2 22 A6.8 6.8 0 0 1 19.8 22" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity=".45" />
      <path d="M13 22 L17.2 15.6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="13" cy="22" r="1.9" fill={stroke} />
    </svg>
  );
}

// BrandLockup.tsx
export function BrandLockup({ stacked = false, markHeight }: { stacked?: boolean; markHeight?: number }) {
  return (
    <span className={stacked ? 'lockup lockup--stacked' : 'lockup'}>
      <BrandMark height={markHeight ?? (stacked ? 52 : 34)} />
      <span className="lockup__name">
        Impostômetro <span className="lockup__accent">Rolante</span>
      </span>
    </span>
  );
}
```

```css
.lockup { display: inline-flex; align-items: center; gap: 12px; font: 700 20px/1 var(--font); letter-spacing: -0.02em; color: var(--text); }
.lockup--stacked { flex-direction: column; gap: 16px; }
.lockup__accent { color: var(--accent); }
```

Como `--accent` vira âmbar no tema escuro, a versão escura (contorno e acento em âmbar, fundo tinta) sai de graça. O preenchimento do símbolo usa `--brand-bg` (creme no claro, tinta no escuro).

### Uso

- **Cabeçalho:** assinatura horizontal (símbolo 34 px de altura, nome 20 px). Em telas estreitas, se faltar espaço, reduza a assinatura inteira até o mínimo de 132 px de largura; abaixo disso use só o símbolo (mínimo 16 px).
- **Respiro:** margem livre ao redor da assinatura igual à largura do símbolo.
- **Fundo escuro:** nunca usar a versão clara sobre escuro. Use os tokens do tema escuro.
- **Uma cor:** `tone="ink"` (tinta) ou `tone="white"` em impressões, carimbos e fundos de cor chapada.

### Arquivos estáticos

Copie de `assets/impostometro-rolante/` para `public/` (ou o equivalente do bundler):

| Origem | Destino / uso |
| --- | --- |
| `favicon.svg` | `public/favicon.svg`, `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` |
| `app-icon-512.svg` | gerar PNGs 180, 192 e 512 para `apple-touch-icon` e manifest/PWA |
| `social-square-1200.svg` | gerar `og-image.png` para `og:image` e `twitter:image` |
| `lockup-horizontal.svg`, `lockup-horizontal-dark.svg` | uso em e-mail, README, materiais fora da app (na app, use os componentes) |

Pontos de atenção:

1. **SVG não serve para `og:image`, `apple-touch-icon` nem para o manifest.** Converta para PNG (ex.: `sharp` ou `resvg` em um script de build, ou export manual). O `social-square-1200.svg` usa `<text>` com Inter: instale a Inter no ambiente de renderização ou converta o texto em curvas antes.
2. O cartão social do pacote é **quadrado (1200 × 1200)**. Muitos previews esperam 1200 × 630. Use o quadrado como está e, se o preview cortar mal, avise o dono do projeto em vez de recompor a peça.
3. Os SVGs do pacote carregam um bloco `<metadata>` de proveniência (C2PA). É inofensivo, mas pode ser removido ao copiar para `public/` para reduzir o peso.
4. Favicon: em 16 px o arco some e fica só o contorno e o ponteiro (regra 5 da seção "A gota" do README). Se o `favicon.svg` do pacote ficar ilegível em 16 px no navegador, não redesenhe: sinalize.

Metadados do `<head>` e do manifest:

```html
<meta name="theme-color" content="#faf8f4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#26221d" media="(prefers-color-scheme: dark)">
```

```json
{
  "name": "Impostômetro Rolante",
  "short_name": "Impostômetro",
  "background_color": "#fbf4e9",
  "theme_color": "#b4622f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## 6. Aplicação por área da interface

Adapte aos componentes que existirem; os nomes são indicativos.

| Área | O que fazer |
| --- | --- |
| Cabeçalho | `BrandLockup` à esquerda, navegação com alvos de 44 px, borda inferior `--line`, fundo `--bg`, sem sombra |
| Hero / valor acumulado | número grande com `tabular-nums`, rótulo em caixa alta pequena acima, cartão `--surface` com borda; o medidor, se existir, usa o ponteiro em `--accent` |
| Cartões de dados | fundo `--surface`, borda `--line`, raio 14 px, rótulo 12 px caixa alta em `--text-body`, valor em `--text` |
| Tabelas | `<table>` semântica, cabeçalho em rótulo pequeno, divisórias `--line`, rolagem horizontal em caixa própria no mobile |
| Gráficos | ver seção 7 |
| Filtros / seletores | pílulas com borda `--line`; estado ativo com fundo `--accent` e texto conforme seção 8 |
| Rodapé | assinatura horizontal pequena, fonte dos dados (Portal da Transparência), aviso de projeto independente se já existir |
| Estados vazios, erro, carregamento | `BrandMark` em 52 px com texto curto; nada de ilustrações novas |
| 404 | assinatura vertical (`stacked`) |

Mobile first: comece em 360 px de largura, grids com `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`, sem rolagem horizontal da página, margens laterais de 16 a 20 px, 48 px ou mais no desktop. Largura máxima de conteúdo em torno de 1120 px.

## 7. Gráficos (Recharts)

O sistema permite um acento só. Então:

- Série principal (a receita acumulada): `var(--accent)`.
- Séries de apoio: tinta (`var(--text)`) e neutros (`--text-body`), diferenciando também por **forma** (traço contínuo, tracejado, marcadores), não só por cor.
- Se for inevitável ter mais de três séries categóricas, derive tons da terracota em oklch **mantendo croma e luminosidade**, variando só o matiz de forma contida, e registre a decisão no PR. Não introduza azul, verde ou outra cor nova por conta própria.
- Grade e eixos em `--line`; rótulos de eixo e legenda 12 px em `--text-body`; sem sombra, sem gradiente de área (use preenchimento sólido com opacidade, se precisar).
- Tooltip: cartão `--surface` com borda `--line`, raio 14 px.
- Linhas com `strokeLinecap="round"` e `strokeLinejoin="round"`.
- Valores monetários e percentuais em `tabular-nums`, formatados em pt-BR (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).
- Todo gráfico precisa de equivalente textual: `aria-label` com o resumo e, quando fizer sentido, uma tabela acessível oculta visualmente.

## 8. Acessibilidade e contraste (medido)

| Combinação | Razão | Uso permitido |
| --- | --- | --- |
| tinta sobre fundo de página | 14.9:1 | tudo |
| corpo `#5a534a` sobre página / branco | 7.1:1 / 7.6:1 | texto corrido e legendas |
| creme sobre tinta | 14.5:1 | texto no tema escuro |
| âmbar sobre tinta | 5.8:1 | texto e ícones no tema escuro |
| terracota sobre fundo de página / branco | 4.2:1 / 4.4:1 | **só** texto grande (a partir de 24 px, ou 18.7 px em negrito), símbolo, traços e ícones |
| apagado `#9a9082` sobre página / branco | 3.0:1 / 3.1:1 | só decoração e texto grande; **nunca** legenda pequena |
| branco ou creme sobre terracota | 4.4:1 / 4.1:1 | só texto grande ou negrito de 18.7 px ou mais |

Consequências práticas:

1. Texto pequeno (legendas, rótulos de 12 px, metadados) usa `--text-body`, não `--text-muted` nem `--accent`.
2. Rótulos em caixa alta de 12 px ficam em `--text-body`; o toque de terracota entra como um filete decorativo ao lado, não na cor do texto.
3. Botão primário em terracota deve ter texto grande e em negrito (18.7 px ou mais, peso 700). Para botões menores, use contorno em `--text` com fundo transparente, e reserve a terracota para o estado ativo com texto grande.
4. Links: cor `--text` com sublinhado em terracota (o contraste do sublinhado é decorativo).
5. Cor nunca é o único canal: estados (ativo, erro, selecionado) também mudam por forma, peso ou ícone.
6. Respeitar `prefers-reduced-motion`: o ponteiro e o contador podem animar, mas sem animação quando o usuário pediu redução.
7. Alvos de toque de 44 × 44 px, foco visível, `lang="pt-BR"` no `<html>`.

## 9. Plano de execução sugerido

1. **Auditar** o repositório: onde estão estilos globais, tema, cabeçalho, rodapé, componentes de cartão, gráficos, `index.html`, favicon e manifest. Listar os hex e fontes em uso.
2. **Tokens e fontes:** criar `tokens.css`, importar uma vez no ponto de entrada, instalar a Inter.
3. **Marca:** criar `BrandMark` e `BrandLockup`; trocar todo logo/texto de marca existente por eles.
4. **Estáticos:** copiar os SVGs, gerar PNGs (apple-touch-icon, ícones PWA, og-image), atualizar `index.html` e o manifest.
5. **Componentes:** migrar cartões, botões, chips, tabelas e links para os tokens, substituindo hex soltos.
6. **Gráficos:** aplicar a seção 7.
7. **Tema escuro:** validar cada tela nos dois temas.
8. **Verificação:** rodar o build e os testes existentes; conferir 360, 768 e 1280 px de largura; checar contraste conforme a seção 8; conferir o favicon em 16 px; Lighthouse de acessibilidade.
9. **Entrega:** um PR com commits separados (tokens, marca, componentes, gráficos), descrição com antes e depois em capturas de tela e a lista do que ficou como decisão em aberto.

## 10. Critérios de aceite

- Nenhum hex de cor fora de `tokens.css`; nenhuma sombra nem gradiente na interface.
- Inter carregada localmente; sem salto visível de fonte no carregamento.
- A marca aparece só pelos componentes `BrandMark` e `BrandLockup`, nos dois temas, respeitando respiro e tamanhos mínimos.
- Favicon, `apple-touch-icon`, ícones do manifest e `og-image` presentes e corretos; `theme-color` nos dois temas.
- Tema claro e escuro funcionando, sem texto pequeno em terracota ou apagado.
- Gráficos com um único acento, sem depender só de cor, com resumo acessível.
- Dados, cálculos e rotas inalterados: o diff não toca regras de negócio.
- Sem rolagem horizontal da página em 360 px.

## 11. Decisões em aberto (perguntar ao dono antes de assumir)

1. Valores finais de `--surface`, `--line` e opacidades de texto no tema escuro (hoje derivados do creme sobre a tinta).
2. Formato do `og:image`: usar o quadrado 1200 × 1200 do pacote ou produzir uma peça 1200 × 630.
3. Se a aplicação terá alternador manual de tema ou só seguirá o sistema.
4. Se o aviso de "projeto independente / não oficial" já existe e onde fica.
5. Se o favicon do pacote atende em 16 px ou precisa de ajuste de desenho (a mudança seria feita no pacote de marcas, não aqui).
