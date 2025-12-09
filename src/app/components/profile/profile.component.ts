import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
import { CpfMaskDirective } from '../../directives/cpf-mask.directive';
import { PhoneMaskDirective } from '../../directives/phone-mask.directive';
import { CepMaskDirective } from '../../directives/cep-mask.directive';
import { TextOnlyDirective } from '../../directives/text-only.directive';
import { CardNumberMaskDirective } from '../../directives/card-number-mask.directive';
import { CardExpiryMaskDirective } from '../../directives/card-expiry-mask.directive';
import { cpfValidator } from '../../validators/cpf.validator';
import { BRAZILIAN_STATES, COUNTRIES, BrazilianState } from '../../data/locations.data';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    ReactiveFormsModule,
    RouterModule,
    CpfMaskDirective,
    PhoneMaskDirective,
    CepMaskDirective,
    TextOnlyDirective,
    CardNumberMaskDirective,
    CardExpiryMaskDirective
  ],
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
  showLogoutModal = false;

  // Location data
  states = BRAZILIAN_STATES;
  countries = COUNTRIES;
  availableCities: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.personalForm = this.createPersonalForm();
    this.passwordForm = this.createPasswordForm();
    this.cardForm = this.createCardForm();
  }

  ngOnInit() {
    this.setupInitialTab();
    this.setupUserSubscription();
  }

  private createPersonalForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      cpf: ['', Validators.required], // Apenas máscara, sem validação de CPF real
      birthDate: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required], // Apenas máscara, sem validação de CEP real
        country: ['Brasil', Validators.required],
      }),
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  private createCardForm(): FormGroup {
    return this.fb.group({
      number: ['', Validators.required],
      name: ['', Validators.required],
      expiry: ['', Validators.required],
      cvv: ['', Validators.required],
    });
  }

  private setupInitialTab(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'security') {
        this.activeTab = 'security';
      }
    });
  }

  private setupUserSubscription(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.savedCards = user.savedCards || [];
        this.profileImage = (user as any).photoUrl || '/assets/icons/perfil_guest.svg';
        this.personalForm.patchValue(user);
        // Load cities for current state
        if (user.address?.state) {
          this.onStateChange(user.address.state);
        }
      }
    });
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.currentUser) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const updatedUser = { ...this.currentUser, photoUrl: e.target.result };
        // Type assertion para evitar erro de tipo
        this.authService.updateProfile(updatedUser as User).subscribe();
      };
      reader.readAsDataURL(file);
    }
  }

  setActiveTab(tab: 'personal' | 'security'): void {
    this.activeTab = tab;
  }

  onStateChange(stateUf: string): void {
    const selectedState = this.states.find(s => s.uf === stateUf);
    this.availableCities = selectedState ? selectedState.cities : [];
    
    // Reset city if it's not in the new state's cities
    const currentCity = this.personalForm.get('address.city')?.value;
    if (currentCity && !this.availableCities.includes(currentCity)) {
      this.personalForm.get('address.city')?.setValue('');
    }
  }

  onSavePersonal(): void {
    if (this.personalForm.valid && this.currentUser) {
      const updatedUser: User = { ...this.currentUser, ...this.personalForm.getRawValue() };
      this.authService.updateProfile(updatedUser).subscribe(success => {
        this.toastService[success ? 'success' : 'error'](
          success ? 'Dados pessoais atualizados com sucesso!' : 'Erro ao atualizar dados.'
        );
      });
    } else {
      this.personalForm.markAllAsTouched();
      this.toastService.error('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onChangePassword(): void {
    if (!this.validatePasswordChange()) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    if (currentPassword !== this.currentUser?.password) {
      this.toastService.error('Senha atual incorreta.');
      return;
    }

    const updatedUser: User = { ...this.currentUser!, password: newPassword };
    this.authService.updateProfile(updatedUser).subscribe(success => {
      if (success) {
        this.toastService.success('Senha alterada com sucesso!');
        this.passwordForm.reset();
      }
    });
  }

  private validatePasswordChange(): boolean {
    if (!this.passwordForm.valid || !this.currentUser) {
      this.passwordForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  toggleTwoFactor(): void {
    if (!this.currentUser) return;
    
    const updatedUser: User = { ...this.currentUser, twoFactorEnabled: !this.currentUser.twoFactorEnabled };
    this.authService.updateProfile(updatedUser).subscribe(() => {
      this.toastService.success(`Autenticação de dois fatores ${updatedUser.twoFactorEnabled ? 'ativada' : 'desativada'}`);
    });
  }

  onAddCard(): void {
    if (!this.cardForm.valid || !this.currentUser) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const newCard: CreditCard = this.cardForm.value;
    const updatedCards = [...this.savedCards, newCard];
    const updatedUser: User = { ...this.currentUser, savedCards: updatedCards };

    this.authService.updateProfile(updatedUser).subscribe(success => {
      if (success) {
        this.toastService.success('Cartão adicionado com sucesso!');
        this.showCardForm = false;
        this.cardForm.reset();
      }
    });
  }

  removeCard(index: number): void {
    if (!confirm('Tem certeza que deseja remover este cartão?') || !this.currentUser) return;

    const updatedCards = this.savedCards.filter((_, i) => i !== index);
    const updatedUser: User = { ...this.currentUser, savedCards: updatedCards };

    this.authService.updateProfile(updatedUser).subscribe(success => {
      if (success) {
        this.toastService.success('Cartão removido.');
      }
    });
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.toastService.success('Logout realizado com sucesso!');
    this.router.navigate(['/']);
    this.showLogoutModal = false;
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);

    return (hasUpper && hasLower && hasNumeric) ? null : { complexity: true };
  }
}
