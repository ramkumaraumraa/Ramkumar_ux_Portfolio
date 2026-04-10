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
