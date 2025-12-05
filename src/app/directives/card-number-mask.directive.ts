import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCardNumberMask]',
  standalone: true
})
export class CardNumberMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limita a 16 dígitos
    value = value.substring(0, 16);
    
    // Aplica a máscara 0000 0000 0000 0000
    const parts = value.match(/.{1,4}/g);
    input.value = parts ? parts.join(' ') : value;
  }
}
