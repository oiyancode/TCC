import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
  styleUrl: './horizontal-scroll.component.scss'
})
export class HorizontalScrollComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef<HTMLDivElement>;
  
  private mm: gsap.MatchMedia | undefined;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const wrapper = this.scrollWrapper.nativeElement;
    const skateSection = wrapper.querySelector('.section-skate') as HTMLElement;
    const basketSection = wrapper.querySelector('.section-basket') as HTMLElement;
    
    const tenisText = wrapper.querySelector('.section-tenis .section-description') as HTMLElement;
    const skateText = wrapper.querySelector('.section-skate .section-description') as HTMLElement;
    const basketText = wrapper.querySelector('.section-basket .section-description') as HTMLElement;

    // Aguardar fontes carregarem para evitar layout shifts no split
    document.fonts.ready.then(() => {
      this.mm = gsap.matchMedia();

      // Contexto Desktop (> 768px)
      this.mm.add("(min-width: 769px)", () => {
        // Split text apenas no desktop
        const splitTenis = new SplitType(tenisText, { types: 'words' });
        const splitSkate = new SplitType(skateText, { types: 'words' });
        const splitBasket = new SplitType(basketText, { types: 'words' });

        // Estado inicial
        gsap.set([skateSection, basketSection], { 
          xPercent: 100,
          autoAlpha: 1 
        });

        const getScrollDistance = () => window.innerHeight * 3; // 3x altura

        // Animação Tenis
        gsap.from(splitTenis.words, {
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 60%', 
            end: () => `+=${getScrollDistance()}px`, 
            toggleActions: 'play reset play reset' 
          },
          y: 100,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power2.out'
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
          }
        });

        // Skate
        tl.to(skateSection, {
          xPercent: 0,
          ease: 'none',
          duration: 1,
          overwrite: 'auto',
          force3D: true,
          immediateRender: false,
          onStart: () => {
               gsap.fromTo(splitSkate.words, 
                  { y: 100, autoAlpha: 0 },
                  { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.8, delay: 0.2, ease: 'power2.out', overwrite: true }
               );
          },
          onReverseComplete: () => {
              gsap.set(splitSkate.words, { autoAlpha: 0, y: 100 });
          }
        }, 0);

        // Basket
        tl.to(basketSection, {
          xPercent: 0,
          ease: 'none',
          duration: 1,
          overwrite: 'auto',
          force3D: true,
          immediateRender: false,
          onStart: () => {
               gsap.fromTo(splitBasket.words, 
                  { y: 100, autoAlpha: 0 },
                  { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.8, delay: 0.2, ease: 'power2.out', overwrite: true }
               );
          },
          onReverseComplete: () => {
               gsap.set(splitBasket.words, { autoAlpha: 0, y: 100 });
          }
        }, 1); 

        ScrollTrigger.refresh();

        // Cleanup function: Revert splits quando sair do breakpoint ou destruir
        return () => {
          splitTenis.revert();
          splitSkate.revert();
          splitBasket.revert();
        };
      });

      // Contexto Mobile (<= 768px)
      this.mm.add("(max-width: 768px)", () => {
        gsap.set([skateSection, basketSection], { 
          xPercent: 0,
          clearProps: "all" 
        });
        // Texto normal sem split
        gsap.set([tenisText, skateText, basketText], {
            autoAlpha: 1,
            y: 0
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
