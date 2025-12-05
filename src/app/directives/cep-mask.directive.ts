import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCepMask]',
  standalone: true
})
export class CepMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limita a 8 dígitos
    value = value.substring(0, 8);
    
    // Aplica a máscara 00000-000
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
    
    input.value = value;
  }
}
