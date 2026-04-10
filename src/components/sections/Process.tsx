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

  // ── Mount: build entrance timeline once ───────────────────
  useEffect(() => {
    if (!sectionRef.current) return;

    gsapCtxRef.current = gsap.context(() => {
      // ── 1. Initial arc positions (invisible) ──────────────
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const pos = ARC[i]; // card 0=center, 1=near-right, 2=far-right, 3=near-left
        gsap.set(el, { x: pos.x, scale: 0.4, opacity: 0, y: 80, filter: 'blur(12px)' });
      });

      // ── 2. Description initial states ─────────────────────
      // Card 0 (active) description open; others collapsed
      const descEls = cardRefs.current.map(el => el?.querySelector<HTMLElement>('.process-desc-wrap'));
      gsap.set(descEls[0], { height: 'auto', opacity: 1 });
      [1, 2, 3].forEach(i => gsap.set(descEls[i], { height: 0, opacity: 0 }));

      // ── 3. Build paused entrance timeline ─────────────────
      const tl = gsap.timeline({ paused: true });

      // Cards emerge from blur/depth into arc positions — staggered 0.08s
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const pos = ARC[i];
        tl.to(el, {
          x: pos.x,
          scale: pos.scale,
          opacity: pos.opacity,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
        }, i * 0.08);
      });

      // Internal parallax: 3 layers at different Y start offsets (deeper = less travel)
      // SVG — slowest, feels deepest
      tl.fromTo('.process-svg-wrap',
        { y: 32 },
        { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
        0,
      );
      // Title group — baseline
      tl.fromTo('.process-card-title-group',
        { y: 48 },
        { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
        0,
      );
      // Description text travels furthest — feels closest to viewer
      tl.fromTo('.process-desc-wrap',
        { y: 64 },
        { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
        0,
      );

      entranceTlRef.current = tl;

      // ── 4. Initial dot state ──────────────────────────────
      const activeDot = dotRefs.current[0];
      if (activeDot) {
        gsap.set(activeDot, { width: 24, backgroundColor: processSteps[0].accentColor });
      }
    }, sectionRef);

    return () => {
      stopAutoPlayRef.current?.();
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
      entranceTlRef.current = null;
    };
  }, []); // Mount only — no deps

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
