import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService, User, CreditCard } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  activeTab: 'personal' | 'security' = 'personal';
  currentUser: User | null = null;
  profileImage: string = '/assets/icons/perfil_guest.svg';

  personalForm: FormGroup;
  passwordForm: FormGroup;
  cardForm: FormGroup;

  showCardForm = false;
  savedCards: CreditCard[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      cpf: ['', Validators.required],
      birthDate: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required],
        country: ['Brasil', Validators.required],
      }),
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordComplexityValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.cardForm = this.fb.group({
      number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      name: ['', Validators.required],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.savedCards = user.savedCards || [];
        // Check if user has a photoUrl, otherwise use default
        // For now, we'll just use the default or what's in local state if we persisted it
        // In a real app, this would be in the User object
        this.profileImage = (user as any).photoUrl || '/assets/icons/perfil_guest.svg';
        this.patchPersonalForm(user);
      }
    });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        // Update user profile with new image
        if (this.currentUser) {
            const updatedUser = { ...this.currentUser, photoUrl: this.profileImage };
            this.authService.updateProfile(updatedUser).subscribe();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  patchPersonalForm(user: User) {
    this.personalForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
      address: user.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'Brasil',
      },
    });
  }

  setActiveTab(tab: 'personal' | 'security') {
    this.activeTab = tab;
  }

  onSavePersonal() {
    if (this.personalForm.valid && this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        ...this.personalForm.getRawValue(),
      };

      this.authService.updateProfile(updatedUser).subscribe((success) => {
        if (success) {
          this.toastService.success('Dados pessoais atualizados com sucesso!');
        } else {
          this.toastService.error('Erro ao atualizar dados.');
        }
      });
    } else {
      this.personalForm.markAllAsTouched();
      this.toastService.error('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid && this.currentUser) {
      const { currentPassword, newPassword } = this.passwordForm.value;

      if (currentPassword !== this.currentUser.password) {
        this.toastService.error('Senha atual incorreta.');
        return;
      }

      const updatedUser: User = {
        ...this.currentUser,
        password: newPassword,
      };

      this.authService.updateProfile(updatedUser).subscribe((success) => {
        if (success) {
          this.toastService.success('Senha alterada com sucesso!');
          this.passwordForm.reset();
        }
      });
    } else {
        this.passwordForm.markAllAsTouched();
    }
  }

  toggleTwoFactor() {
    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        twoFactorEnabled: !this.currentUser.twoFactorEnabled,
      };
      this.authService.updateProfile(updatedUser).subscribe(() => {
        this.toastService.success(
          `Autenticação de dois fatores ${
            updatedUser.twoFactorEnabled ? 'ativada' : 'desativada'
          }`
        );
      });
    }
  }

  onAddCard() {
    if (this.cardForm.valid && this.currentUser) {
      const newCard: CreditCard = this.cardForm.value;
      const updatedCards = [...this.savedCards, newCard];
      
      const updatedUser: User = {
        ...this.currentUser,
        savedCards: updatedCards,
      };

      this.authService.updateProfile(updatedUser).subscribe((success) => {
        if (success) {
          this.toastService.success('Cartão adicionado com sucesso!');
          this.showCardForm = false;
          this.cardForm.reset();
        }
      });
    } else {
        this.cardForm.markAllAsTouched();
    }
  }

  removeCard(index: number) {
    if (confirm('Tem certeza que deseja remover este cartão?') && this.currentUser) {
      const updatedCards = this.savedCards.filter((_, i) => i !== index);
      const updatedUser: User = {
        ...this.currentUser,
        savedCards: updatedCards,
      };

      this.authService.updateProfile(updatedUser).subscribe((success) => {
        if (success) {
          this.toastService.success('Cartão removido.');
        }
      });
    }
  }

  logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
      this.toastService.success('Logout realizado com sucesso!');
      this.router.navigate(['/']);
    }
  }

  // Validators
  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);

    const valid = hasUpper && hasLower && hasNumeric;
    return valid ? null : { complexity: true };
  }
}
