import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, AfterViewInit {
  @ViewChild('backgroundSkatista')
  backgroundSkatista!: ElementRef<HTMLImageElement>;
  contactForm!: FormGroup;
  isLoggedIn = false;
  submissionSuccess = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  /**
   * Inicializa o componente, cria o formulário de contato e se inscreve no status de login.
   * Se o usuário estiver logado, preenche automaticamente os campos de nome e email.
   */
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });

    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.contactForm.patchValue({
          name: user.name || '',
          email: user.email || '',
        });
      }
    });
  }

  /**
   * Executado após a visualização do componente ser inicializada.
   * Configura as animações GSAP para a imagem do skatista, incluindo uma animação de entrada,
   * uma animação de flutuação e a funcionalidade de arrastar.
   */
  ngAfterViewInit(): void {
    const skatista = this.backgroundSkatista.nativeElement;

    const startAnimation = () => {
      // 1. Initial State (Hidden & Off-screen) - FORCE IT
      // Using setTimeout to ensure it runs after any initial layout paints
      setTimeout(() => {
        gsap.set(skatista, {
          xPercent: -50,
          yPercent: -50,
          y: -1000,
          rotation: 0,
          scale: 1,
          autoAlpha: 0, // Keep hidden
        });

        // 2. Prepare Float Animation (Paused)
        const floatAnim = gsap.to(skatista, {
          duration: 2,
          y: '+=20',
          rotation: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: true,
        });

        // 3. Start Entrance Animation (Make Visible & Fall)
        // Ensure delay is handled logically
        gsap.to(skatista, {
          duration: 1,
          y: 150,
          autoAlpha: 1, // Reveal smoothly
          ease: 'ease.out',
          delay: 0.2,
          onComplete: () => {
            floatAnim.play();
          },
        });

        // 4. Setup Draggable
        Draggable.create(skatista, {
          type: 'x,y',
          bounds: '.contact-container',
          inertia: true,
          onDragStart: function () {
            floatAnim.pause();
            gsap.to(this['target'], {
              duration: 0.3,
              scale: 1,
              cursor: 'grabbing',
            });
          },
          onDragEnd: function () {
            const target = this['target'];
            gsap.to(target, { duration: 0.3, scale: 1, cursor: 'grab' });

            gsap.to(target, {
              duration: 1,
              y: 150,
              rotation: 0,
              ease: 'ease.out',
              onComplete: () => {
                floatAnim.restart();
              },
            });
          },
        });
      }, 100); // 100ms delay to ensure DOM readiness
    };

    if (skatista.complete) {
      startAnimation();
    } else {
      skatista.onload = startAnimation;
    }
  }

  /**
   * Manipula o envio do formulário de contato.
   */
  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Formulário enviado:', this.contactForm.value);

      // Simula envio com delay para feedback visual
      setTimeout(() => {
        this.submissionSuccess = true;
        this.contactForm.reset();

        // Reseta a mensagem de sucesso após alguns segundos
        setTimeout(() => {
          this.submissionSuccess = false;
        }, 5000);
      }, 500);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Replace any digits with empty string
    input.value = value.replace(/[0-9]/g, '');
    this.contactForm.get('name')?.setValue(input.value);
  }
}
