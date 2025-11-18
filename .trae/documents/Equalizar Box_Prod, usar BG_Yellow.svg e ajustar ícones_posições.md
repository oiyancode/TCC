## Objetivo
- Garantir BG exato em `/assets/BGs/BG_Yellow.svg`.
- Aumentar grunges e Box_Prod para padronizar pelo tamanho do card da bola.
- Corrigir ícones e preços para ficarem dentro do Box_Prod.
- Usar ícones fornecidos em `src/assets/icons/` (estrela e sacola), sem inline custom.
- Aumentar skate ~10%.

## Mudanças
1) Fundo da seção
- `news.component.scss`: `.news__bg { background: url('/assets/BGs/BG_Yellow.svg') center/cover no-repeat; }` (sem cor sólida).

2) Box_Prod
- `news.component.scss`: `.news__box` → `max-width: 420px`, `padding: 0.75rem 0.75rem 0.5rem`, `background: url('/assets/Box_Prod.svg') center/100% 100% no-repeat`.

3) Grunge
- `news.component.scss`: `.news__item-grunge` → `width/height: min(100%, 680px)` para ampliar e permitir leve overflow.

4) Produtos
- Basket: `.news__product--basket { width: min(65%, 360px); }`.
- Tênis: `.news__product--tenis { width: min(78%, 400px); transform: translateY(2px); }`.
- Skate: `.news__product--skate { width: min(62%, 360px); }` e manter `left: 20px`.

5) Ícones e preços (HTML)
- Substituir ícones inline:
  - Estrela: `<img src="/assets/icons/star.png" class="icon icon--star" alt="">`
  - Sacola: `<img src="/assets/icons/Shopping bag.svg" class="icon icon--bag" alt="">`
- Assegurar que ambos estejam dentro de `news__box` (head/foot) e ajustar `news__foot { margin-top: 0.25rem; }`.

## Verificação
- Recarregar 4200 e checar: BG correto, grunges maiores, todos os cards com mesmo box, estrela/preço/sacola dentro do box, skate ~10% maior e centralizado.

## Próximo
- Aplicar patches no SCSS e HTML. Confirmar visual e micro-ajustes conforme Figma, mantendo múltiplos de 8.