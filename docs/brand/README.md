# Marca

Identidade visual do Impostômetro Rolante, parte do sistema de marcas Rolante.

| Arquivo | O quê |
|---|---|
| [`impostometro-rolante/README.md`](impostometro-rolante/README.md) | regras do sistema: cores, tipografia, forma, construção do símbolo, tamanhos mínimos. Em conflito, vale este |
| [`impostometro-rolante/brands.json`](impostometro-rolante/brands.json) | os mesmos dados em formato de máquina |
| [`impostometro-rolante/assets/`](impostometro-rolante/assets/impostometro-rolante/) | os 10 SVGs da marca (símbolo, assinaturas, favicon, ícone de app, cartão social) |
| [`impostometro-rolante/HANDOFF-impostometro-rolante.md`](impostometro-rolante/HANDOFF-impostometro-rolante.md) | como o sistema foi aplicado no site: tokens, componentes, contraste, decisões |

O README do pacote descreve o sistema inteiro. Este repositório guarda só o Impostômetro Rolante: as
pastas das outras marcas (`transparencia-rolante/`, `auditoria-rolante/`), o `PROMPT.md` e as páginas HTML de
`reference/` citadas lá não estão aqui.

No site, a marca entra só pelos componentes `BrandMark` e `BrandLockup` (`site/src/components/brand/`)
e as cores só por `site/src/styles/tokens.css`.
