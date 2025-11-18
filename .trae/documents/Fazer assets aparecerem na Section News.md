## Diagnóstico
- Os produtos e grunges estão em `TCC/ASSETS_`, mas o Angular só serve arquivos de `src/assets`.
- Grunges são `.svg` (confirmado), enquanto o CSS estava referenciando `.png`.

## Plano
1) Criar pastas do projeto para assets:
- `src/assets/section_news/`
- `src/assets/Grunge_dos_lancamentos/`
- `src/assets/BGs/`

2) Copiar arquivos:
- Produtos: `ASSETS_/section_news/Basketball_new.png`, `tenis_new.png`, `Skate 01.png` → `src/assets/section_news/` (renomear para `Skate_01.png`).
- Grunges: `ASSETS_/Grunge_dos_lancamentos/grunge_basket_red.svg`, `grunge_tenis_blue.svg`, `grunge_skate_green.svg` → `src/assets/Grunge_dos_lancamentos/`.
- Fundo: `ASSETS_/BGs/BG_Yellow.svg` → `src/assets/BGs/BG_Yellow.svg`.

3) Ajustes de código
- Atualizar CSS para usar grunges `.svg` em `/assets/Grunge_dos_lancamentos/*.svg`.
- Confirmar HTML dos produtos apontando para `/assets/section_news/...`.
- Fundo amarelo: manter `/assets/BGs/BG_Yellow.svg`.
- Título sem `margin-bottom` já aplicado.

4) Verificação
- Abrir `http://localhost:4200/` e validar que produtos e grunges aparecem; fundo com SVG visível; CTA/título centralizados e espaçamento vertical pequeno.

## Observação
- Caminhos absolutos fora do projeto (`D:\...`) não funcionam no navegador. A cópia para `src/assets` é obrigatória para servir via `/assets`.

## Próximo passo
- Executar a cópia dos arquivos e ajustar o CSS para `.svg`. Após isso, validar no dev server.