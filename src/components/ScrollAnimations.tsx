/*Yo vlad voici le composant ScrollAnimation.tsx ou je vais centraliser les animations 
et importer dans les differents fichiers, j'ai ajouter deux dependances lenis et gsap scroll trigger pour gerer le scroll et les animations
donc tu devras les installer ....je pense*/
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    //configs basiques de lenis 
    const delayMs = 80; 
    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let lenis: InstanceType<typeof Lenis> | null = null;/*bon pour ici je sais pas si ca respzecte 
    les regles de typages hein mais c'est pas rouge donc oklm hahah, 
    j'ai plus utiliser lenis avec du Jsx*/

    const internalBtnHandlers: { el: HTMLElement; enter: () => void; leave: () => void }[] = [];
    const internalAnchorHandlers: { el: Element; fn: (e: Event) => void }[] = [];
    const q = (s: string) => (gsap.utils.toArray(s) as unknown[]) as HTMLElement[];
    const safeNum = (v?: string) => {
      const n = parseFloat(String(v ?? "0").replace("%", ""));
      if (Number.isNaN(n)) return 0;
      return Math.min(Math.max(n, 0), 100);
    };

    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timeout = window.setTimeout(() => {
    /*vu que parfois avec Next lenis a des problemes si genre ca refuse , on va utiliser gsap plutot et donc
rendre null lenis */
      try {
        lenis = new Lenis({
          duration: 1.2,
          lerp: 0.08,
        });
      } catch (e) {
        //et donc si ca marche oklm quoi
        lenis = null;
      }

      const loop = (time: number) => {
        if (lenis) lenis.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

    // et puis icic je synchro lenis et scroll trigger de gsap pour que pas de conflit
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
      }
      
      ScrollTrigger.defaults({ scroller: undefined });

    
      ctx = gsap.context(() => {
        if (prefersReduced) {
          gsap.set(q(".anim-hero-title, .anim-hero-sub, .anim-hero-cta, .fade-up, .book-card, .funding-fill"), {
            opacity: 1,
            y: 0,
            scale: 1,
            clearProps: "all",
          });
          return;
        }

        //j'ai essayé d'ajouter et d'ameliorer les anciennes anims que javais fait
        const heroImg = document.querySelector(".hero-image") as HTMLElement | null;
        if (heroImg instanceof HTMLElement) {
          gsap.fromTo(heroImg, 
            { x: 80, opacity: 0 }, 
            { x: 0, opacity: 1, duration: 1.4, ease: "power4.out", delay: 0.2 }
          );
        }

       
        gsap.fromTo(
          ".anim-hero-title",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "expo.out" }
        );

       
        gsap.fromTo(
          ".anim-hero-sub",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.15, ease: "power3.out" }
        );

       
        gsap.fromTo(
          ".anim-hero-cta",
          { y: 8, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: "back.out(1.2)" }
        );

        // j'ai essayé un Parallaxe  sur l'image du hero
        if (heroImg instanceof HTMLElement) {
          gsap.to(heroImg, {
            y: 60,
            ease: "power1.out",
            scrollTrigger: {
              trigger: heroImg,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        }

        
        const featuredTitle = Array.from(document.querySelectorAll("h2.bg-primary"))
          .find(el => el.textContent?.includes("A la une"));
        if (featuredTitle) {
          gsap.fromTo(featuredTitle,
            { x: -60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power4.out",
              scrollTrigger: {
                trigger: featuredTitle,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        
        const featuredSection = featuredTitle?.closest("section");
        const featuredBookLink = featuredSection?.querySelector("a.group");
        if (featuredBookLink) {
          gsap.fromTo(featuredBookLink,
            { y: 30, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.3,
              ease: "power4.out",
              scrollTrigger: {
                trigger: featuredBookLink,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        
        ScrollTrigger.batch(".fade-up", {
          interval: 0.15,
          batchMax: 12,
          onEnter: (batch) =>
            gsap.fromTo(batch, 
              { y: 28, opacity: 0 }, 
              { y: 0, opacity: 1, stagger: 0.07, duration: 1, ease: "power4.out" }
            ),
          start: "top 92%",
          once: false,
        });

        const grids = Array.from(document.querySelectorAll(".books-grid")) as HTMLElement[];
        grids.forEach((grid) => {
          const cards = Array.from(grid.querySelectorAll(".book-card")) as HTMLElement[];
          if (!cards.length) return;

          gsap.set(cards, { y: 20, opacity: 0, scale: 0.95, willChange: "transform, opacity" });

          gsap.fromTo(
            cards,
            { y: 20, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              ease: "power4.out",
              duration: 1.2,
              stagger: 0.1,
              scrollTrigger: {
                trigger: grid,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        //je sais pas si c'est vraiment utiles d'animer les barres de finacement mais c'est joli donc hahaha
        const fundingBars = (gsap.utils.toArray(".funding-bar") as unknown[]) as HTMLElement[];
        fundingBars.forEach((bar) => {
          const fill = bar.querySelector<HTMLElement>(".funding-fill");
          if (!fill) return;
          const pct = safeNum(fill.dataset.width);
          const target = `${pct}%`;
          gsap.set(fill, { width: "0%" });
          gsap.fromTo(
            fill,
            { width: "0%" },
            {
              width: target,
              duration: 1.5,
              ease: "power4.out",
              scrollTrigger: { trigger: bar, start: "top 92%", toggleActions: "play none none reverse" },
            }
          );
        });

        
        const btns = q(".btn-cta, .anim-button");
        btns.forEach((btn) => {
          const enter = () => {
            gsap.killTweensOf(btn);
            gsap.to(btn, { scale: 1.05, y: -3, duration: 0.2, ease: "power2.out" });
          };
          const leave = () => {
            gsap.killTweensOf(btn);
            gsap.to(btn, { scale: 1, y: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
          };
          btn.addEventListener("mouseenter", enter);
          btn.addEventListener("mouseleave", leave);
          internalBtnHandlers.push({ el: btn, enter, leave });
        });

       //la si lenis a marcher ca devrais faire aussi marcher les scroll into views 
        const anchors = Array.from(document.querySelectorAll('a[href^="#"], [data-scroll-to]')) as HTMLElement[];
        anchors.forEach((el) => {
          const handler = (e: Event) => {
            const href =
              el.getAttribute("href") && el.getAttribute("href")!.startsWith("#")
                ? el.getAttribute("href")
                : el.getAttribute("data-scroll-to");
            if (!href) return;
            const targetEl = document.querySelector(href);
            if (!targetEl) return;
            if (!(targetEl instanceof HTMLElement)) return;
            e.preventDefault();
            
            const headerOffset = 92; 
            const rect = targetEl.getBoundingClientRect();
            const destY = window.scrollY + rect.top - headerOffset;
            if (lenis) {
              lenis.scrollTo(destY, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
            } else {
              window.scrollTo({ top: destY, behavior: "smooth" });
            }
          };
          el.addEventListener("click", handler);
          internalAnchorHandlers.push({ el, fn: handler });
        });

        ScrollTrigger.refresh();
      }, document);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
      try {
        internalBtnHandlers.forEach(({ el, enter, leave }) => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
        internalAnchorHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
      } catch (e) {
       //la console n'a pas signalé derreur donc on s'en fout hein , vu qu'il faut catch....
      }

     
      if (ctx) {
        try {
          ctx.revert();
        } catch (e) {
          // ignorons les erreurs vivants
        }
      }
      // ici c'est la destruction de lenis kamehameha
      try {
        if (lenis && typeof lenis.destroy === "function") {
          lenis.destroy();
        }
      } catch (e) {
        // encore ue fois ignorons les erreurs 
      }
      //on kill tout machette 
      try {
        ScrollTrigger.killAll();
      } catch (e) {
      }
    };
  }, []);

  return <div ref={rootRef} aria-hidden />;
}
/*j'ai creer la branche feature/animation sur laquelle seront poussés les changemens
et donc si par exemple tu veux animer les autres pages , par exemple ce sera simple
tu copie juste le nom de la classe parmi celles crees ici pour une anim specifique , pour textz , image ou
card , et tu ajoutes juste dans le style tailwind de l'element en question et puis tranquille*/