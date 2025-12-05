import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Não valida se estiver vazio (use Validators.required separadamente)
  }

  const cpf = control.value.replace(/\D/g, ''); // Remove formatação

  if (cpf.length !== 11) {
    return { invalidCpf: true };
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { invalidCpf: true };
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder >= 10 ? 0 : remainder;

  if (digit1 !== parseInt(cpf.charAt(9))) {
    return { invalidCpf: true };
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder >= 10 ? 0 : remainder;

  if (digit2 !== parseInt(cpf.charAt(10))) {
    return { invalidCpf: true };
  }

  return null; // CPF válido
}
