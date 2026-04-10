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
  },
  {
    id: 2,
    title: "02. Discovery",
    subtitle: "Transforming Concepts into Prototypes",
    description:
      "Guided by a problem-solving mindset, I transform complex ideas into interactive prototypes. This approach provides a compelling vision of the end product before development begins.",
    colorClass: "pink",
  },
  {
    id: 3,
    title: "03. Creation",
    subtitle: "Orchestrating Seamless Collaboration",
    description:
      "Bridging stakeholders and users is key. I drive collaboration with developers and stakeholders, ensuring a fluid process from inception to post-launch.",
    colorClass: "blue",
  },
  {
    id: 4,
    title: "04. Optimizing",
    subtitle: "Refining Through Rigorous Testing",
    description:
      "Continuous improvement is at the core of my process. I rigorously test designs through multiple methodologies, ensuring every interaction is purposeful.",
    colorClass: "turquoise",
  },
];

const svgRotations = [
  [1, 2, 3, 4],
  [2, 3, 4, 1],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
];

const Process = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const localProgress = useSectionProgress(3, 0.7); // Process is index 3, delayed until 70% approaching

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set('.process-card', { opacity: 0, scale: 0.9, y: 30 });

      const entranceTl = gsap.timeline({ paused: true });
      entranceTl.to('.process-card', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power2.out'
      });

      // Sync entrance with scroll
      entranceTl.progress(localProgress);

      // SVG Rotation Logic
      processSteps.forEach((_, cardIndex) => {
        for (let svgNum = 1; svgNum <= 4; svgNum++) {
          const isVisible = svgNum === cardIndex + 1;
          gsap.set(`.card-${cardIndex + 1} .svg-${svgNum}`, {
            opacity: isVisible ? 1 : 0,
          });
        }
      });

      const tl = gsap.timeline({
        repeat: -1,
        paused: true,
        defaults: { ease: 'power1.inOut' },
      });
      masterTimelineRef.current = tl;

      svgRotations.forEach((rotation, idx) => {
        if (idx === 0) return;
        const prev = svgRotations[idx - 1];
        tl.add(() => {
          processSteps.forEach((_, cardIndex) => {
            const fromSvg = prev[cardIndex];
            const toSvg = rotation[cardIndex];
            gsap.to(`.card-${cardIndex + 1} .svg-${fromSvg}`, {
              opacity: 0,
              duration: 1.5,
            });
            gsap.to(`.card-${cardIndex + 1} .svg-${toSvg}`, {
              opacity: 1,
              duration: 1.5,
              delay: 0.5,
            });
          });
        }).to({}, { duration: 4 });
      });

      masterTimelineRef.current
        .add(() => {
          const prev = svgRotations[3];
          const next = svgRotations[0];
          processSteps.forEach((_, cardIndex) => {
            const fromSvg = prev[cardIndex];
            const toSvg = next[cardIndex];
            gsap.to(`.card-${cardIndex + 1} .svg-${fromSvg}`, {
              opacity: 0,
              duration: 1.5,
            });
            gsap.to(`.card-${cardIndex + 1} .svg-${toSvg}`, {
              opacity: 1,
              duration: 1.5,
              delay: 0.5,
            });
          });
        })
        .to({}, { duration: 4 });

      // Autonomous trigger for SVG timeline when section is docked
      if (localProgress > 0.7 && !masterTimelineRef.current?.isActive()) {
        masterTimelineRef.current?.play();
      } else if (localProgress < 0.2) {
        masterTimelineRef.current?.pause();
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      masterTimelineRef.current?.kill();
    };
  }, [localProgress]);

  return (
    <section id="process" className="process-section" ref={sectionRef}>
      <div className="process-container">
        <div className="process-grid">
          {processSteps.map((step, i) => (
            <div key={step.id} className={`process-card card-${i + 1} process-card-${step.id}`}>
              <div className="process-svg-wrap" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 1 }} className="process-card-svg svg-1">
                  <Image src="/assets/imgs/Process/1.svg" alt="" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} className="process-card-svg svg-2">
                  <Image src="/assets/imgs/Process/2.svg" alt="" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} className="process-card-svg svg-3">
                  <Image src="/assets/imgs/Process/3.svg" alt="" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} className="process-card-svg svg-4">
                  <Image src="/assets/imgs/Process/4.svg" alt="" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>

              <div className="process-card-content">
                <h3 className={`${step.colorClass} neon body-title-3`}>{step.title}</h3>
                <p className="body-2">{step.subtitle}</p>
                <p className="footnote">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
