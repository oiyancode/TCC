import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { APP_CONFIG } from '../../core/constants/app.constants';

gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  isSignUp = false;

  // Form Data
  email = '';
  password = '';

  // LGPD Modal
  showLgpdModal = true;
  lgpdRequiredChecked = false;
  lgpdOptionalChecked = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    // Check if LGPD was already accepted
    const lgpdAccepted = localStorage.getItem('lgpd_accepted');
    if (lgpdAccepted) {
      this.showLgpdModal = false;
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.password = ''; // Clear password for security
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.toastService.error('Por favor, preencha todos os campos.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.toastService.error('E-mail inválido.');
      return;
    }

    if (this.isSignUp) {
      this.authService
        .register({ email: this.email, password: this.password })
        .subscribe((success) => {
          if (success) {
            this.toastService.success(
              'Conta criada com sucesso! Faça login para continuar.'
            );
            this.toggleMode();
          } else {
            this.toastService.error('Este e-mail já está cadastrado.');
          }
        });
    } else {
      this.authService
        .login({ email: this.email, password: this.password })
        .subscribe((success) => {
          if (success) {
            this.router.navigate(['/']);
            this.toastService.success('Login realizado com sucesso!');
          } else {
            this.toastService.error('E-mail ou senha incorretos.');
          }
        });
    }
  }

  private isValidEmail(value: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(value);
  }

  acceptLgpd() {
    if (this.lgpdRequiredChecked) {
      localStorage.setItem('lgpd_accepted', 'true');
      this.showLgpdModal = false;
    }
  }

  ngAfterViewInit() {
    Draggable.create('.floating-item', {
      type: 'x,y',
      edgeResistance: 0.65,
      bounds: '.visual-content',
      inertia: true,
      throwProps: true,
      onDragStart: function () {
        gsap.to((this as any).target, {
          scale: 1.1,
          duration: APP_CONFIG.ANIMATION_DURATION,
        });
      },
      onDragEnd: function () {
        gsap.to((this as any).target, {
          scale: 1,
          duration: APP_CONFIG.ANIMATION_DURATION,
        });
      },
    });
  }
}
