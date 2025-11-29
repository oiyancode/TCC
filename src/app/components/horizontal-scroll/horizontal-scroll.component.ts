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

      // Calcular altura baseada no número de seções
      // Cada seção precisa de espaço completo de scroll (3 seções = 3x viewport)
      // Usar função para recalcular dinamicamente em cada refresh
      const getScrollDistance = () => {
        return window.innerHeight * 4; // 4x a altura da viewport
      };

      // Timeline principal atrelada ao scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${getScrollDistance()}px`, // Função para recalcular dinamicamente
          pin: true,        // Fixa o wrapper
          scrub: 0.2,       // Valor menor = resposta mais rápida, menos "pulos"
          anticipatePin: 1, // Melhora a detecção do pin
          fastScrollEnd: false, // Desabilitado para evitar pulos
          preventOverlaps: true,
          invalidateOnRefresh: true,
          refreshPriority: -1, // Prioridade de refresh
        }
      });

      // Passo 1: Skate entra cobrindo o Tênis
      // Primeira parte do scroll (0% a 50% da timeline)
      tl.to(skateSection, {
        xPercent: 0,
        ease: 'none',
        duration: 1,
        overwrite: 'auto',
        force3D: true,
        immediateRender: false
      }, 0);

      // Passo 2: Basquete entra cobrindo o Skate
      // Segunda parte do scroll (50% a 100% da timeline)
      // Começar APÓS o skate ter completado completamente (em 1.0)
      tl.to(basketSection, {
        xPercent: 0,
        ease: 'none',
        duration: 1,
        overwrite: 'auto',
        force3D: true,
        immediateRender: false
      }, 1); // Começar em 1.0 para garantir que o skate complete primeiro

      // Forçar refresh após todas as animações serem configuradas
      // Usar setTimeout para garantir que o DOM esteja totalmente renderizado
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
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
