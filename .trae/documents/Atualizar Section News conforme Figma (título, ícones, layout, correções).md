## Objetivo
- Alinhar a seção LANÇAMENTOS ao design do Figma: título em Bowlby One SC, cards com Box_Prod, ícones de estrela (favoritos) e sacola (shopping bag), nomes e preços posicionados, correções de grunge do basket e centralização do skate, reduzir o tamanho da bola de basquete e ajustar posicionamento do tênis.

## Mudanças de estrutura (HTML)
- Em cada `article.news__item`, criar uma estrutura semântica:
  - `div.news__box` (limita o espaço do produto – Box_Prod)
    - `div.news__head`: `h3.news__name` centralizado e `div.news__fav` à direita com ícone de estrela e rating (sem interação)
    - `div.news__canvas`: camada do grunge e `img.news__product` centralizada
    - `div.news__foot`: preço à esquerda e ícone de sacola à direita
- Atualizar nomes/preços para os do Figma: WILSON NBA TEAM (R$49,99), GOLD STARS (R$799,90), GREEN DROP (R$229,90).

## Estilos (SCSS)
- `news__box`: definir dimensão consistente do card (Box_Prod), padding interno mínimo, e stack de camadas.
- `news__head`: centralizar nome (Bowlby One SC, uppercase, preto), posicionar estrela/rating à direita.
- `news__canvas`: garantir `position: relative` com grunge em `z-index:0` e produto em `z-index:1`; ajustar dimensões do grunge para visibilidade; corrigir:
  - Basket: reduzir tamanho do produto
  - Skate: centralizar produto sobre o grunge
  - Tênis: corrigir deslocamento vertical
- `news__foot`: linha inferior com `display:flex`, `justify-content:space-between` para preço e ícone da sacola.
- Ícones: inserir inline SVG para estrela e sacola (sem eventos de click), com cor e tamanho conforme Figma.

## Fundo
- Manter fundo via `url('/assets/bgs/BG_Yellow.svg') center/cover`.

## Acessibilidade
- Ícones marcados com `aria-hidden="true"`; textos com `aria-label` descritivo nos containers quando aplicável.

## Verificação com Figma
- Validar textos e posições comparando com o Figma; ajustar espaçamentos para múltiplos de 8.

## Próximo passo
- Implementar as mudanças no `news.component.html/scss` e verificar no servidor local.