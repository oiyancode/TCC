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
    
    // Configuração inicial para garantir que esteja visível e centralizado
    // Vamos animar PARTINDO de cima (fora da tela)
    
    gsap.set(skatista, { xPercent: -50, yPercent: -50 }); // Garante o centro antes de animar

    // Animação de flutuação contínua
    const floatAnim = gsap.to(skatista, {
      duration: 3,
      y: '+=20',
      rotation: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      paused: true // Pausado inicialmente para não conflitar com a entrada
    });

    gsap.fromTo(skatista, 
      {
        y: -window.innerHeight - 200, 
      },
      {
        duration: 1.5,
        y: 200, 
        rotation: 0,
        ease: 'ease.out',
        delay: 0.5,
        onComplete: () => {
          floatAnim.play(); // Inicia a flutuação após a entrada
        }
      }
    );

    Draggable.create(skatista, {
      type: 'x,y',
      bounds: '.contact-container',
      inertia: true,
      onDragStart: function () {
        floatAnim.pause();
        gsap.to(this['target'], { duration: 0.3, scale: 1.1, cursor: 'grabbing' });
      },
      onDragEnd: function () {
        const target = this['target'];
        gsap.to(target, { duration: 0.3, scale: 1, cursor: 'grab' });
        
        // Simulação de "Gravidade" / Retorno APENAS VERTICAL
        // Se o usuário soltar, ele cai para o nível "zero" (centro vertical) mas MANTÉM a posição X
        
        gsap.to(target, {
          duration: 1,
          y: 200, 
          // x: 0, // REMOVIDO: Permite que o skatista fique onde foi solto horizontalmente
          rotation: 0,
          ease: 'ease.out',
          onComplete: () => {
             // Retoma a flutuação sutil onde quer que esteja
             floatAnim.restart();
          }
        });
      },
    });
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
