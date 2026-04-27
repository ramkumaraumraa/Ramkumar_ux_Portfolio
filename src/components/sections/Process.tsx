"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const processSteps = [
  {
    id: 1,
    title: "01. Strategizing",
    subtitle: "Laying the foundation for success",
    description:
      "I dive deep into uncovering core challenges and aspirations of clients and stakeholders. Through comprehensive exploration, I create detailed wireframes that align with strategic goals.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/1.svg",
  },
  {
    id: 2,
    title: "02. Discovery",
    subtitle: "Transforming concepts into prototypes",
    description:
      "Guided by a problem-solving mindset, I transform complex ideas into interactive prototypes. This approach provides a compelling vision of the end product before development begins.",
    colorClass: "pink",
    accentColor: "#d946ef",
    svgSrc: "/assets/imgs/Process/2.svg",
  },
  {
    id: 3,
    title: "03. Creation",
    subtitle: "Orchestrating seamless collaboration",
    description:
      "Bridging stakeholders and users is key. I drive collaboration with developers and stakeholders, ensuring a fluid process from inception to post-launch.",
    colorClass: "blue",
    accentColor: "#60a5fa",
    svgSrc: "/assets/imgs/Process/3.svg",
  },
  {
    id: 4,
    title: "04. Optimizing",
    subtitle: "Refining through rigorous testing",
    description:
      "Continuous improvement is at the core of my process. I rigorously test designs through multiple methodologies, ensuring every interaction is purposeful.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/4.svg",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const svgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const localProgress = useSectionProgress(3, 0.5);
  const entranceTlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    ctxRef.current = gsap.context(() => {
      const cards = gsap.utils.toArray('.holo-card') as HTMLElement[];

      // Initial State
      gsap.set(cards, { opacity: 0, z: -800, y: 100, rotationX: 15, scale: 0.8 });

      // Build Portal Timeline scrubbed by localProgress
      const tl = gsap.timeline({ paused: true });

      // Phase 1: Enter (0.0 to 0.5)
      tl.fromTo(cards, {
        opacity: 0,
        z: -1000,
        scale: 0.1,
        rotationX: 30
      }, {
        opacity: 1,
        z: 0,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.05,
        force3D: true,
      }, 0);

      // Phase 2: Exit Portal (0.5 to 1.0)
      tl.to(cards, {
        z: 800,
        scale: 5,
        rotationX: -45,
        duration: 0.5,
        ease: 'power2.in',
        stagger: 0.03,
        force3D: true,
      }, 0.5);

      tl.to(cards, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        stagger: 0.03,
      }, 0.5);

      entranceTlRef.current = tl;

      // GSAP floating animations for each SVG illustration
      svgRefs.current.forEach((svgEl, i) => {
        if (!svgEl) return;
        gsap.to(svgEl, {
          y: i % 2 === 0 ? -14 : -10,
          rotation: i % 2 === 0 ? 2.5 : -2.5,
          duration: 3 + i * 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.5,
        });
      });
    }, sectionRef);

    return () => ctxRef.current?.revert();
  }, []);

  useEffect(() => {
    if (entranceTlRef.current) {
      entranceTlRef.current.progress(localProgress);
    }
  }, [localProgress]);

  return (
    <section
      id="process"
      className="process-section"
      ref={sectionRef}
    >
      <div
        className="holographic-grid"
        ref={gridRef}
        style={{ perspective: '1200px', width: '100%' }}
      >
        {processSteps.map((step, i) => (
          <div
            key={step.id}
            className={`holo-card process-card--${i}`}
          >
            {/* Large Illustration — flex-grows to fill upper portion */}
            <div
              ref={(el) => { svgRefs.current[i] = el; }}
              className={`holo-illustration ill-${i}`}
            >
              <Image
                src={step.svgSrc}
                alt={step.title}
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </div>

            {/* Content Area — fixed spacing at the bottom */}
            <div className="holo-content">
              <h3 className="body-title-3 mt-2" style={{ textAlign: 'left' }}>
                {step.title}
              </h3>
              <p className="body-2 mt-1" style={{ textAlign: 'left', marginTop: '4px' }}>
                {step.subtitle}
              </p>
              <p className="footnote mt-2" style={{ color: '#d0dde8', lineHeight: 1.65, textAlign: 'left' }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
