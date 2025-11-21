## Objetivo
- Implementar a Section "LANÇAMENTOS" abaixo do `Hero`, com fundo amarelo (PNG fornecido), layout em 3 colunas e grunges coloridos (vermelho/azul/verde) atrás dos produtos, conforme Figma/referência.

## Onde integrar
- Inserir `<app-news>` em `src/app/app.component.html` logo após `<app-hero>` (`Projeto_E-commerce_Sports/src/app/app.component.html:1-3`).
- Importar `NewsComponent` em `AppComponent` (`src/app/app.component.ts`).

## Preparação de assets
- Produtos em `src/assets/section-news/`:
  - `Basketball_new.png` (grunge vermelho)
  - `tenis_new.png` (grunge azul)
  - `Skate 01.png` (grunge verde)
- Fundo amarelo: usar PNG fornecido (copiar para `src/assets/bgs/bg-yellow.png`) e aplicar como `cover`.
- Grunge: base em `src/assets/section-news/grunge.png` (ou arquivo existente em `src/assets`), com colorização por CSS.

## Componente e estrutura
- Criar `src/app/components/news/` (`news.component.ts/html/scss`) standalone com selector `app-news`.
- HTML:
  - `section.news`
    - `div.news__bg` (aplica o PNG amarelo)
    - `div.news__content`
      - `h2.news__title` = "LANÇAMENTOS" (maiúsculas, fonte do Hero, cor preta)
      - `p.news__cta` = "Pegue nossos designs mais recentes antes que eles se esgotem!" (menor, abaixo do título)
      - `div.news__grid`
        - 3 colunas (`article.news__item`), cada uma com:
          - `div.news__item-grunge` (grunge colorido por CSS)
          - `img.news__product` (produto correspondente, `loading="lazy"`, `alt` descritivo)

## Layout e estilos
- `section.news`: `position: relative`, `min-height: 80-90vh`, `overflow: hidden`.
- Fundo: `news__bg` com `background: url('/assets/bgs/bg-yellow.png') center/cover no-repeat`.
- Título: fonte `--font-headline`, `text-transform: uppercase`, `color: #000`.
- Grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap` consistente com Figma.
- Grunge por item: `position: absolute` atrás do produto; colorização via `filter` e/ou `mix-blend-mode: multiply` com overlays:
  - Basket = vermelho, Tênis = azul, Skate = verde.
- Produtos: `position: relative`, tamanhos conforme Figma, sem rotação exagerada (layout colunas).

## Responsividade
- `@media (max-width: 1024px)`: reduzir tamanho dos produtos e do gap.
- `@media (max-width: 768px)`: `grid-template-columns: 1fr` (uma coluna), mantendo ordem Basket → Tênis → Skate.

## Acessibilidade e interação
- `section` com `aria-labelledby` no título.
- `alt` descritivo em cada imagem.
- Sem eventos de clique por enquanto; evitar elementos interativos aninhados.

## Performance
- `loading="lazy"` nas imagens.
- Opcional futuro: otimizar/comprimir e/ou converter para `webp`.

## Verificação
- Visualizar em desktop/tablet/mobile; comparar com a imagem de referência e Figma.
- Garantir que o fundo amarelo PNG está cobrindo toda a área e que as cores dos grunges batem com os produtos.

## Observações
- Caso o grunge precise de arquivos separados (vermelho/azul/verde), podemos duplicar a base e aplicar tintas distintas; se preferir, mantenho um único grunge e faço a coloração por CSS.

## Confirmações já recebidas
- Título: "LANÇAMENTOS" (maiúsculas, preto, fonte do Hero).
- CTA: "Pegue nossos designs mais recentes antes que eles se esgotem!".
- Fundo: usar PNG amarelo fornecido (tamanho correto).
- Layout: colunas lado a lado.
- Interação: sem clique.
- Cores dos grunges: vermelho (basket), azul (tênis), verde (skate).

## Próximo passo
- Preparar os arquivos do componente, posicionar assets em `src/assets` e integrar no `AppComponent` conforme acima.