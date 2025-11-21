## Problemas
- Produtos e grunges não aparecem porque os arquivos não estão em `src/assets` (o dev server só serve `src/assets` e `public`).
- Fundo segue sólido pois o SVG está fora do projeto; é necessário usar `src/assets/BGs/BG_Yellow.svg`.
- Título precisa ficar sem `margin-bottom`.

## Plano de Correção
1) Assets no projeto
- Criar pastas no projeto: `src/assets/section_news/`, `src/assets/Grunge_dos_lancamentos/`, `src/assets/BGs/`.
- Copiar:
  - Produtos: `Basketball_new.png`, `tenis_new.png`, `Skate_01.png` → `src/assets/section_news/`.
  - Grunges: `grunge_basket_red.png`, `grunge_tenis_blue.png`, `grunge_skate_green.png` → `src/assets/Grunge_dos_lancamentos/`.
  - Fundo: `BG_Yellow.svg` → `src/assets/BGs/BG_Yellow.svg`.
- Motivo: garantir que o Angular sirva os arquivos via `/assets/...` e tudo carregue no 4200.

2) Ajustes de código
- Manter os caminhos `/assets/section_news/...` e `/assets/Grunge_dos_lancamentos/...` já configurados no HTML/CSS.
- Garantir o uso do SVG no fundo: `.news__bg { background: url('/assets/BGs/BG_Yellow.svg') center/cover no-repeat, var(--brand-yellow); }`.
- Remover espaçamento inferior do título: `.news__title { margin-bottom: 0; }`.
- CTA: já em `16px` e `DM Mono`.
- Seção: `padding` já ajustado para `0.5rem` em cima e em baixo.

3) Verificação
- Com os arquivos copiados ao `src/assets`, validar no `http://localhost:4200/`:
  - Produtos e grunges aparecem nas 3 colunas.
  - Fundo renderiza o SVG (gradiente amarelo do Figma).
  - Título sem `margin-bottom`; CTA abaixo centralizado.

## Observação
- Referenciar caminhos absolutos fora do projeto (como `D:\...`) não funciona no navegador; por segurança o dev server só expõe `/assets`. Por isso a cópia para `src/assets` é necessária.

## Próximo passo
- Posso aplicar o ajuste do `margin-bottom` no título e manter os paths prontos, enquanto você copia os arquivos para `src/assets` conforme acima. Assim que os arquivos estiverem no lugar, tudo aparece automaticamente no 4200.