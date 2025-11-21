## Objetivo
- Inserir o Box_Prod abaixo de cada produto, usar somente o BG_Yellow.svg no fundo, reduzir o tamanho da bola de basquete, aproximar preço/sacola e ampliar levemente os grunges.

## Ações
1) Fundo
- Trocar o background da seção para apenas `url('/assets/bgs/BG_Yellow.svg') center/cover no-repeat` (remover a cor sólida sobreposta).

2) Box_Prod
- Usar `src/assets/Box_Prod.svg` como moldura/base do card.
- Estrutura: dentro de cada `article.news__item` já existe `news__box`; aplicar o `Box_Prod.svg` como `background-image` de `news__box` e ajustar `padding` para limitar visualmente o espaço dos produtos.

3) Tamanhos e posições
- Bola de basquete: reduzir mais (`.news__product--basket` para ~65%/360px).
- Tênis: corrigir subida (reduzir translateY para ~2px ou 0).
- Sacola/preço: reduzir margem superior do rodapé e usar `gap` menor para aproximar.

4) Grunge
- Aumentar `width/height` da `.news__item-grunge` para ~620–640px, mantendo `contain` e `z-index:0`.

5) Verificação
- Validar no 4200 que:
  - BG usa somente o SVG (gradiente do Figma visível).
  - Box_Prod aparece abaixo/contornando cada card, limitando seu espaço.
  - Basket fica proporcional aos outros e rodapé fica próximo.
  - Grunges maiores sem ultrapassar visualmente o Box_Prod.

## Observação
- Já há `src/assets/Box_Prod.svg` disponível; usaremos esse arquivo diretamente.

## Próximo passo
- Aplicar ajustes no `news.component.scss` e pequenas alterações no HTML se necessário para posicionamento fino do Box_Prod e rodapé.