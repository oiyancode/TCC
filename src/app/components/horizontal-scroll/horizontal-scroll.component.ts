import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
  
  private scrollTrigger: ScrollTrigger | undefined;

  ngAfterViewInit() {
    const wrapper = this.scrollWrapper.nativeElement;
    const skateSection = wrapper.querySelector('.section-skate') as HTMLElement;
    const basketSection = wrapper.querySelector('.section-basket') as HTMLElement;

    // Configuração Responsiva com matchMedia
    const mm = gsap.matchMedia();

    // Contexto Desktop (> 768px)
    mm.add("(min-width: 769px)", () => {
      // Estado inicial: Skate e Basquete fora da tela à direita
      gsap.set([skateSection, basketSection], { 
        xPercent: 100,
        autoAlpha: 1 // Garante visibilidade otimizada
      });

      // Timeline principal atrelada ao scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=300%',    // Aumentado para dar mais tempo/espaço para a animação
          pin: true,        // Fixa o wrapper
          scrub: 1,         // Suaviza mais para evitar "pulos" visuais
          fastScrollEnd: true,
          preventOverlaps: true,
          invalidateOnRefresh: true
        }
      });

      // Passo 1: Skate entra cobrindo o Tênis
      tl.to(skateSection, {
        xPercent: 0,
        ease: 'none',
        duration: 1,
        overwrite: 'auto',
        force3D: true, // Força GPU
        immediateRender: false
      });

      // Passo 2: Basquete entra cobrindo o Skate
      tl.to(basketSection, {
        xPercent: 0,
        ease: 'none',
        duration: 1,
        overwrite: 'auto',
        force3D: true, // Força GPU
        immediateRender: false
      });
    });

    // Contexto Mobile (<= 768px) - Opcional, apenas para garantir limpeza
    mm.add("(max-width: 768px)", () => {
      // Garante que as seções estejam visíveis e na posição original
      gsap.set([skateSection, basketSection], { 
        xPercent: 0,
        clearProps: "all" // Limpa propriedades injetadas pelo GSAP
      });
    });
  }

  ngOnDestroy() {
    // Limpa os triggers e animações ao destruir o componente
    ScrollTrigger.getAll().forEach(t => t.kill());
  }
}
