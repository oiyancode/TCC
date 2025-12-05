import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCardExpiryMask]',
  standalone: true
})
export class CardExpiryMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limita a 4 dígitos (MMAA)
    value = value.substring(0, 4);
    
    // Aplica a máscara MM/AA
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    input.value = value;
  }
}
