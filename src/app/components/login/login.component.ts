import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import { AuthService } from '../../services/auth.service';

gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
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

  constructor(private authService: AuthService, private router: Router) {
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
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (this.isSignUp) {
      this.authService.register({ email: this.email, password: this.password }).subscribe(success => {
        if (success) {
          alert('Conta criada com sucesso! Faça login para continuar.');
          this.toggleMode();
        } else {
          alert('Este e-mail já está cadastrado.');
        }
      });
    } else {
      this.authService.login({ email: this.email, password: this.password }).subscribe(success => {
        if (success) {
          this.router.navigate(['/']);
        } else {
          alert('E-mail ou senha incorretos.');
        }
      });
    }
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
      onDragStart: function() {
        gsap.to((this as any).target, { scale: 1.1, duration: 0.1 });
      },
      onDragEnd: function() {
        gsap.to((this as any).target, { scale: 1, duration: 0.1 });
      }
    });
  }
}
