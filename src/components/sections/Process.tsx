"use client";

import React, { useEffect, useRef, useState } from 'react';
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

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const localProgress = useSectionProgress(3, 0.5);
  const entranceTlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    ctxRef.current = gsap.context(() => {
      const cards = gsap.utils.toArray('.holo-card') as HTMLElement[];

      // Initial State
      gsap.set(cards, { opacity: 0, z: -800, y: 100, rotationX: 15, scale: 0.8 });

      // Build Entrance Timeline scrubbed by localProgress
      const tl = gsap.timeline({ paused: true });
      tl.to(cards, {
        opacity: 1,
        z: 0,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 2,
        ease: 'power3.out',
        stagger: 0.1,
        force3D: true,
      });

      entranceTlRef.current = tl;
    }, sectionRef);

    return () => ctxRef.current?.revert();
  }, []);

  useEffect(() => {
    if (entranceTlRef.current) {
      entranceTlRef.current.progress(localProgress);
    }
  }, [localProgress]);

  // Handle Holographic Hover Effects
  const handleMouseEnter = (index: number) => {
    setHoveredCard(index);

    const cards = document.querySelectorAll('.holo-card');
    cards.forEach((card, i) => {
      if (i === index) {
        // Expand the hovered card
        gsap.to(card, { scale: 1.05, borderColor: processSteps[i].accentColor, backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 10, duration: 0.4, ease: 'power2.out' });
        
        // Spin SVG
        const svg = card.querySelector('.holo-svg');
        gsap.to(svg, { rotation: '+=90', duration: 0.6, ease: 'back.out(1.5)' });

        // Show description
        const desc = card.querySelector('.holo-desc') as HTMLElement;
        gsap.to(desc, { height: 'auto', opacity: 1, marginTop: '12px', duration: 0.4, ease: 'power2.out' });

      } else {
        // Dim other cards
        gsap.to(card, { scale: 0.95, opacity: 0.3, zIndex: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'transparent', duration: 0.4, ease: 'power2.out' });
        
        const desc = card.querySelector('.holo-desc');
        gsap.to(desc, { height: 0, opacity: 0, marginTop: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);

    const cards = document.querySelectorAll('.holo-card');
    cards.forEach((card, i) => {
      gsap.to(card, { scale: 1, opacity: 1, zIndex: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', duration: 0.4, ease: 'power2.out' });
      
      const desc = card.querySelector('.holo-desc');
      gsap.to(desc, { height: 0, opacity: 0, marginTop: 0, duration: 0.4, ease: 'power2.out' });
    });
  };

  return (
    <section id="process" className="process-section" ref={sectionRef}>
      <div className="holographic-grid" ref={gridRef} onMouseLeave={handleMouseLeave} style={{ perspective: '1200px' }}>
        {processSteps.map((step, i) => (
          <div
            key={step.id}
            className="holo-card"
            onMouseEnter={() => handleMouseEnter(i)}
          >
            <div className="holo-header">
              <div className="holo-icon-wrap" style={{ borderColor: step.accentColor, boxShadow: `0 0 15px ${step.accentColor}40` }}>
                <div className="holo-svg">
                  <Image src={step.svgSrc} alt={step.title} fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <div className="holo-title-group">
                <h3 className={`${step.colorClass} neon body-title-4 m-0`}>{step.title}</h3>
                <p className="body-2 m-0" style={{ opacity: 0.8 }}>{step.subtitle}</p>
              </div>
            </div>
            <div className="holo-desc">
              <p className="footnote m-0" style={{ color: '#e0e0e0', lineHeight: 1.6 }}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
