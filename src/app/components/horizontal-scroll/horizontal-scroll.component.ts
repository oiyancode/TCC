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

    document.fonts.ready.then(() => {
      this.mm = gsap.matchMedia();

      this.mm.add('(min-width: 769px)', () => {
        const splitTenis = new SplitType(tenisText, { types: 'words' });
        const splitSkate = new SplitType(skateText, { types: 'words' });
        const splitBasket = new SplitType(basketText, { types: 'words' });

        const splitTenisTitle = new SplitType(tenisTitle, { types: 'chars' });
        const splitSkateTitle = new SplitType(skateTitle, { types: 'chars' });
        const splitBasketTitle = new SplitType(basketTitle, {
          types: 'chars',
        });

        gsap.set([skateSection, basketSection], {
          xPercent: 100,
          autoAlpha: 1,
        });

        const getScrollDistance = () => window.innerHeight * 8; // Scroll mais longo para acomodar pausas

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 0.2,
            anticipatePin: 1,
            toggleActions: 'play pause resume reverse',
          },
        });

        // ANIMAÇÕES DA SEÇÃO TÊNIS (t=0 a t=1)
        tl.from(
          splitTenisTitle.chars,
          {
            rotation: -180,
            scale: 0.3,
            opacity: 0,
            stagger: 0.03,
            duration: 1,
          },
          0
        ).from(
          splitTenis.words,
          {
            y: 100,
            autoAlpha: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: 'power2.out',
          },
          0.2
        );

        // TRANSIÇÃO E ANIMAÇÕES DA SEÇÃO SKATE (Inicia em t=2)
        tl.to(skateSection, { xPercent: 0, ease: 'none', duration: 1 }, 2) // Pausa de 1s, transição de t=2 a t=3
          .from(
            splitSkateTitle.chars,
            {
              x: 200,
              scale: 0,
              rotation: 360,
              autoAlpha: 0,
              stagger: 0.05,
              duration: 0.8,
              ease: 'back.out(1.7)',
            },
            3.2 // Inicia 0.2s após a transição
          )
          .from(
            splitSkate.words,
            {
              y: 100,
              autoAlpha: 0,
              stagger: 0.05,
              duration: 0.8,
              ease: 'power2.out',
            },
            3.4 // Inicia 0.2s após o título
          );

        // TRANSIÇÃO E ANIMAÇÕES DA SEÇÃO BASKET (Inicia em t=5)
        tl.to(basketSection, { xPercent: 0, ease: 'none', duration: 1 }, 5) // Pausa de 1s, transição de t=5 a t=6
          .from(
            splitBasketTitle.chars,
            {
              y: -300,
              autoAlpha: 0,
              stagger: 0.04,
              duration: 1.2,
              ease: 'bounce.out',
            },
            6.2 // Inicia 0.2s após a transição
          )
          .from(
            splitBasket.words,
            {
              y: 100,
              autoAlpha: 0,
              stagger: 0.05,
              duration: 0.8,
              ease: 'power2.out',
            },
            6.4 // Inicia 0.2s após o título
          );

        ScrollTrigger.refresh();

        return () => {
          splitTenis.revert();
          splitSkate.revert();
          splitBasket.revert();
          splitTenisTitle.revert();
          splitSkateTitle.revert();
          splitBasketTitle.revert();
          // O revert do matchMedia já limpa os ScrollTriggers da timeline
        };
      });

      this.mm.add('(max-width: 768px)', () => {
        gsap.set([skateSection, basketSection], {
          xPercent: 0,
          clearProps: 'all',
        });
        gsap.set([tenisText, skateText, basketText], {
          autoAlpha: 1,
          y: 0,
        });
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
