import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTextOnly]',
  standalone: true
})
export class TextOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove números e caracteres especiais, mantém apenas letras, espaços e acentos
    input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const char = event.key;
    // Permite apenas letras, espaços e acentos
    const pattern = /^[a-zA-ZÀ-ÿ\s]$/;
    
    if (!pattern.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
