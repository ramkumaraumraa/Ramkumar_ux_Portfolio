"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const processSteps = [
  {
    id: 1,
    title: "01. Strategizing",
    subtitle: "Laying the Foundation for Success",
    description:
      "I dive deep into uncovering core challenges and aspirations of clients and stakeholders. Through comprehensive exploration, I create detailed wireframes that align with strategic goals.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/1.svg",
  },
  {
    id: 2,
    title: "02. Discovery",
    subtitle: "Transforming Concepts into Prototypes",
    description:
      "Guided by a problem-solving mindset, I transform complex ideas into interactive prototypes. This approach provides a compelling vision of the end product before development begins.",
    colorClass: "pink",
    accentColor: "#d946ef",
    svgSrc: "/assets/imgs/Process/2.svg",
  },
  {
    id: 3,
    title: "03. Creation",
    subtitle: "Orchestrating Seamless Collaboration",
    description:
      "Bridging stakeholders and users is key. I drive collaboration with developers and stakeholders, ensuring a fluid process from inception to post-launch.",
    colorClass: "blue",
    accentColor: "#60a5fa",
    svgSrc: "/assets/imgs/Process/3.svg",
  },
  {
    id: 4,
    title: "04. Optimizing",
    subtitle: "Refining Through Rigorous Testing",
    description:
      "Continuous improvement is at the core of my process. I rigorously test designs through multiple methodologies, ensuring every interaction is purposeful.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/4.svg",
  },
];

// Arc position configs by offset from active card (mod 4).
// x is in px, applied by GSAP.
const ARC = [
  { x: 0,    scale: 1.00, opacity: 1.00 }, // offset 0 = center (active)
  { x: 260,  scale: 0.72, opacity: 0.55 }, // offset 1 = near-right
  { x: 520,  scale: 0.50, opacity: 0.20 }, // offset 2 = far-right
  { x: -260, scale: 0.72, opacity: 0.55 }, // offset 3 = near-left
] as const;

const Process = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const dotRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const entranceTlRef    = useRef<gsap.core.Timeline | null>(null);
  const gsapCtxRef       = useRef<gsap.Context | null>(null);
  const activeIndexRef   = useRef(0);
  const autoPlayRunning  = useRef(false);
  const startAutoPlayRef = useRef<(() => void) | null>(null);
  const stopAutoPlayRef  = useRef<(() => void) | null>(null);

  const localProgress = useSectionProgress(3, 0.7);

  // ── Mount: entrance TL + auto-play ───────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;

    gsapCtxRef.current = gsap.context(() => {
      // ── Initial GSAP positions ────────────────────────────
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const pos = ARC[i];
        gsap.set(el, { x: pos.x, scale: 0.4, opacity: 0, y: 80, filter: 'blur(12px)' });
      });

      const descEls = cardRefs.current.map(el => el?.querySelector<HTMLElement>('.process-desc-wrap') ?? null);
      if (descEls[0]) gsap.set(descEls[0], { height: 'auto', opacity: 1 });
      [1, 2, 3].forEach(i => { if (descEls[i]) gsap.set(descEls[i], { height: 0, opacity: 0 }); });

      // ── Entrance timeline ─────────────────────────────────
      const q = gsap.utils.selector(sectionRef.current);
      const tl = gsap.timeline({ paused: true });

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const pos = ARC[i];
        tl.to(el, {
          x: pos.x, scale: pos.scale, opacity: pos.opacity,
          y: 0, filter: 'blur(0px)',
          duration: 1.2, ease: 'power3.out',
        }, i * 0.08);
      });

      tl.fromTo(q('.process-svg-wrap'),
        { y: 32 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);
      tl.fromTo(q('.process-card-title-group'),
        { y: 48 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);
      tl.fromTo(q('.process-desc-wrap'),
        { y: 64 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);

      entranceTlRef.current = tl;

      // ── Step dot updater ──────────────────────────────────
      const updateDots = (idx: number) => {
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          if (i === idx) {
            gsap.to(dot, {
              width: 24,
              backgroundColor: processSteps[idx].accentColor,
              duration: 0.4, ease: 'power2.out',
            });
          } else {
            gsap.to(dot, {
              width: 8,
              backgroundColor: 'rgba(255,255,255,0.2)',
              duration: 0.3, ease: 'power2.out',
            });
          }
        });
      };

      // Set initial dot — card 0 active
      const d0 = dotRefs.current[0];
      if (d0) gsap.set(d0, { width: 24, backgroundColor: processSteps[0].accentColor });

      // ── Auto-play: advance one step ───────────────────────
      let timerHandle: ReturnType<typeof setTimeout> | null = null;

      const advance = () => {
        const prev = activeIndexRef.current;
        const next = (prev + 1) % 4;

        const transitionTl = gsap.timeline({
          onComplete: () => {
            activeIndexRef.current = next;
            window.dispatchEvent(
              new CustomEvent('process-active-card', { detail: { index: next } })
            );
            updateDots(next);
            schedule();
          },
        });

        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const diff = ((i - next) % 4 + 4) % 4;
          const pos = ARC[diff];
          transitionTl.to(el, {
            x: pos.x, scale: pos.scale, opacity: pos.opacity,
            duration: 0.7, ease: 'power3.inOut',
          }, 0);
        });

        const prevDesc = descEls[prev];
        const nextDesc = descEls[next];
        if (prevDesc) {
          transitionTl.to(prevDesc, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
        }
        if (nextDesc) {
          // Measure natural height first — GSAP cannot tween to 'auto'
          nextDesc.style.height = 'auto';
          const naturalHeight = nextDesc.scrollHeight;
          nextDesc.style.height = '0px';
          transitionTl.to(nextDesc, { height: naturalHeight, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
        }
      };

      const schedule = () => {
        if (!autoPlayRunning.current) return;
        timerHandle = setTimeout(advance, 3500);
      };

      // ── Expose start / stop via refs ──────────────────────
      startAutoPlayRef.current = () => {
        if (autoPlayRunning.current) return;
        autoPlayRunning.current = true;
        schedule();
      };

      stopAutoPlayRef.current = () => {
        autoPlayRunning.current = false;
        if (timerHandle) { clearTimeout(timerHandle); timerHandle = null; }
      };
    }, sectionRef);

    return () => {
      stopAutoPlayRef.current?.();
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
      entranceTlRef.current = null;
    };
  }, []); // mount only

  // ── localProgress: scrub entrance TL + start/stop autoplay ─
  useEffect(() => {
    entranceTlRef.current?.progress(localProgress);

    if (localProgress >= 0.92) {
      startAutoPlayRef.current?.();
    } else if (localProgress < 0.5) {
      stopAutoPlayRef.current?.();
    }
  }, [localProgress]);

  return (
    <section id="process" className="process-section" ref={sectionRef}>
      <div className="process-arc-container">
        {processSteps.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`process-card process-arc-card process-card-${step.id}`}
          >
            <div className="process-svg-wrap" style={{ position: 'relative' }}>
              <Image
                src={step.svgSrc}
                alt=""
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className="process-card-content">
              <div className="process-card-title-group">
                <h3 className={`${step.colorClass} neon body-title-3`}>{step.title}</h3>
                <p className="body-2">{step.subtitle}</p>
              </div>
              <div className="process-desc-wrap">
                <p className="footnote">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="process-step-indicators">
        {processSteps.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            className="process-step-dot"
          />
        ))}
      </div>
    </section>
  );
};

export default Process;
