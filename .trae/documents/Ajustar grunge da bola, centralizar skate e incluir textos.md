## Diagnóstico
- O grunge do basket não está visível e o skate não está alinhado ao grunge. Faltam nome e preço dos produtos conforme Figma.

## Propostas de ajuste
- Grunge basket:
  - Confirmar uso do arquivo `src/assets/Grunge_dos_lancamentos/grunge_basket_red.svg`.
  - Ajustar dimensões para garantir presença visual: aumentar `width/height` da camada grunge e fixar `z-index: 0` sob o produto (que permanece `z-index: 1`).
- Centralização do skate:
  - Manter grunge central absoluto.
  - Adicionar um pequeno offset apenas para a imagem do skate (`.news__item--skate .news__product`) para compensar a assimetria do PNG (transparência lateral) e alinhar ao centro do grunge.
- Textos (nome e preço):
  - Incluir bloco textual sob cada produto:
    - `h3.news__name` (nome do produto)
    - `span.news__price` (preço)
  - Estilo legível sobre o fundo amarelo (cor `#000`), alinhado ao centro, espaçamento mínimo, respeitando múltiplos de 8.

## Mudanças de código
- HTML (`news.component.html`):
  - Dentro de cada `article.news__item`, adicionar `div.news__info` com `h3.news__name` e `span.news__price`.
- CSS (`news.component.scss`):
  - `.news__item-grunge`: `z-index: 0`, `width/height` levemente maiores e responsivos.
  - `.news__product`: `z-index: 1`, centralizado; offset específico apenas para o skate.
  - `.news__info`: tipografia centralizada, cor preta, espaçamento pequeno.

## Perguntas rápidas
- Nomes e preços exatos dos 3 produtos (conforme Figma):
  - Basket: [nome], [preço]
  - Tênis: [nome], [preço]
  - Skate: [nome], [preço]
- Tipografia dos nomes/preços: A) `DM Mono` B) `Noto Serif` C) Outra (qual?)
- Offset fino do skate (caso necessário após ajuste inicial): A) +2% B) +4% C) personalizar depois

## Verificação
- Validar no `http://localhost:4200/` a presença do grunge do basket, o alinhamento do skate e a exibição dos nomes e preços; revisar em desktop e mobile para responsividade.

## Próximo passo
- Aplicar os ajustes acima e inserir os textos com os nomes/preços fornecidos. Se preferir, posso inserir placeholders até você confirmar valores finais.