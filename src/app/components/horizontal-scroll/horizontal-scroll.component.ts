import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-horizontal-scroll',
  standalone: true,
  imports: [],
  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.scss',
})
export class HorizontalScrollComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef<HTMLDivElement>;

  private mm: gsap.MatchMedia | undefined;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const wrapper = this.scrollWrapper.nativeElement;
    const skateSection = wrapper.querySelector('.section-skate') as HTMLElement;
    const basketSection = wrapper.querySelector(
      '.section-basket'
    ) as HTMLElement;

    const tenisText = wrapper.querySelector(
      '.section-tenis .section-description'
    ) as HTMLElement;
    const skateText = wrapper.querySelector(
      '.section-skate .section-description'
    ) as HTMLElement;
    const basketText = wrapper.querySelector(
      '.section-basket .section-description'
    ) as HTMLElement;

    // Títulos H2
    const tenisTitle = wrapper.querySelector(
      '.section-tenis .section-title'
    ) as HTMLElement;
    const skateTitle = wrapper.querySelector(
      '.section-skate .section-title'
    ) as HTMLElement;
    const basketTitle = wrapper.querySelector(
      '.section-basket .section-title'
    ) as HTMLElement;

    // Aguardar fontes carregarem para evitar layout shifts no split
    document.fonts.ready.then(() => {
      this.mm = gsap.matchMedia();

      // Contexto Desktop (> 768px)
      this.mm.add('(min-width: 769px)', () => {
        // Split text apenas no desktop
        const splitTenis = new SplitType(tenisText, { types: 'words' });
        const splitSkate = new SplitType(skateText, { types: 'words' });
        const splitBasket = new SplitType(basketText, { types: 'words' });

        // Split TODOS os títulos para animações letra por letra
        const splitTenisTitle = new SplitType(tenisTitle, { types: 'chars' });
        const splitSkateTitle = new SplitType(skateTitle, { types: 'chars' });
        const splitBasketTitle = new SplitType(basketTitle, { types: 'chars' });

        // Estado inicial - esconder títulos (apenas Basket e Skate que usam fromTo/set inicial)
        gsap.set([splitSkateTitle.chars, splitBasketTitle.chars], {
          autoAlpha: 0,
        });

        // Estado inicial das seções
        gsap.set([skateSection, basketSection], {
          xPercent: 100,
          autoAlpha: 1,
        });

        const getScrollDistance = () => window.innerHeight * 3; // 3x altura

        // ===== ANIMAÇÃO TÍTULO TÊNIS: Rotação + Escala letra por letra =====
        gsap.from(splitTenisTitle.chars, {
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
          },
          rotation: -180,
          scale: 0.3,
          opacity: 0,
          stagger: 0.03,
          duration: 1,
        });

        // Animação Descrição Tenis
        gsap.from(splitTenis.words, {
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 60%',
            end: () => `+=${getScrollDistance()}px`,
            toggleActions: 'play reset play reset',
          },
          y: 100,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power2.out',
        });

        // Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${getScrollDistance()}px`,
            pin: true,
            scrub: 0.2,
            anticipatePin: 1,
            fastScrollEnd: false,
            preventOverlaps: true,
            invalidateOnRefresh: true,
            refreshPriority: -1,
          },
        });

        // Skate
        tl.to(
          skateSection,
          {
            xPercent: 0,
            ease: 'none',
            duration: 1,
            overwrite: 'auto',
            force3D: true,
            immediateRender: false,
            onStart: () => {
              // ===== ANIMAÇÃO TÍTULO SKATE: Entrada da direita + Letra por letra com rotação =====
              gsap.fromTo(
                splitSkateTitle.chars,
                {
                  x: 200,
                  scale: 0,
                  rotation: 360,
                  autoAlpha: 0,
                },
                {
                  x: 0,
                  scale: 1,
                  rotation: 0,
                  autoAlpha: 1,
                  stagger: 0.05,
                  duration: 0.8,
                  ease: 'back.out(1.7)',
                  delay: 0.3, // Aumentado delay
                }
              );

              // Animação descrição Skate
              gsap.fromTo(
                splitSkate.words,
                { y: 100, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  stagger: 0.05,
                  duration: 0.8,
                  delay: 0.7, // Aumentado delay
                  ease: 'power2.out',
                  overwrite: true,
                }
              );
            },
            onReverseComplete: () => {
              gsap.set(splitSkate.words, { autoAlpha: 0, y: 100 });
              gsap.set(splitSkateTitle.chars, {
                autoAlpha: 0,
                x: 200,
                scale: 0,
                rotation: 360,
              });
            },
          },
          0
        );

        // Basket
        tl.to(
          basketSection,
          {
            xPercent: 0,
            ease: 'none',
            duration: 1,
            overwrite: 'auto',
            force3D: true,
            immediateRender: false,
            onStart: () => {
              // ===== ANIMAÇÃO TÍTULO BASKET: Entrada de cima + Bouncing Ball letra por letra =====
              gsap.fromTo(
                splitBasketTitle.chars,
                {
                  y: -300,
                  autoAlpha: 0,
                },
                {
                  y: 0,
                  autoAlpha: 1,
                  stagger: 0.04,
                  duration: 1.2,
                  ease: 'bounce.out',
                  delay: 0.3, // Aumentado delay
                }
              );

              // Animação descrição Basket
              gsap.fromTo(
                splitBasket.words,
                { y: 100, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  stagger: 0.05,
                  duration: 0.8,
                  delay: 0.8, // Aumentado delay
                  ease: 'power2.out',
                  overwrite: true,
                }
              );
            },
            onReverseComplete: () => {
              gsap.set(splitBasket.words, { autoAlpha: 0, y: 100 });
              gsap.set(splitBasketTitle.chars, { autoAlpha: 0, y: -300 });
            },
          },
          1
        );

        ScrollTrigger.refresh();

        // Cleanup function: Revert splits quando sair do breakpoint ou destruir
        return () => {
          splitTenis.revert();
          splitSkate.revert();
          splitBasket.revert();
          splitTenisTitle.revert();
          splitSkateTitle.revert();
          splitBasketTitle.revert();
        };
      });

      // Contexto Mobile (<= 768px)
      this.mm.add('(max-width: 768px)', () => {
        gsap.set([skateSection, basketSection], {
          xPercent: 0,
          clearProps: 'all',
        });
        // Texto normal sem split
        gsap.set([tenisText, skateText, basketText], {
          autoAlpha: 1,
          y: 0,
        });
        // Títulos visíveis no mobile
        gsap.set([tenisTitle, skateTitle, basketTitle], {
          autoAlpha: 1,
          clearProps: 'all',
        });
      });
    });
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  ngOnDestroy() {
    // Reverte tudo (matchMedia limpa triggers e chama a função de cleanup retornada)
    this.mm?.revert();
  }
}
