"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const TEXTS = [
  { pre: 'HUMANIZING', main: 'TECH THROUGH', post: 'DESIGN', colorClass: 'turquoise' },
  { pre: 'CRAFTING IMMERSIVE', main: 'EXPERIENCES', post: 'THAT RESONATE DEEPLY', colorClass: 'turquoise' },
  { pre: 'DESIGNING FOR THE', main: 'FUTURE, INSPIRED', post: 'BY THE PAST', colorClass: 'turquoise' },
];

export default function Home({ activeSection = 'home' }: { activeSection?: string }) {
  const [index, setIndex] = useState(0);
  const blockRef = useRef<HTMLDivElement>(null);
  const glowRedRef = useRef<HTMLDivElement>(null);
  const glowCyanRef = useRef<HTMLDivElement>(null);
  
  const cycleTimerRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const contextRef = useRef<gsap.Context | null>(null);
  
  const [responsive, setResponsive] = useState({
    isMobile: false,
    isTablet: false
  });

  const { pre, main, post, colorClass } = TEXTS[index];

  useEffect(() => {
    setResponsive({
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth < 1024
    });

    const handleResize = () => {
      setResponsive({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth < 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasAnimatedIn = useRef(false);

  const localProgress = useSectionProgress(0); // Home is index 0

  useEffect(() => {
    const block = blockRef.current;
    if (!block || !hasAnimatedIn.current) return;

    // Use localProgress to drive the Zoom Past (Portal) effect
    // 0.0 to 0.5: Approaching (For circular scroll from Footer)
    // 0.5: Docked
    // 0.5 to 1.0: Zooming Past (Flying to Works)
    
    if (localProgress <= 0.5) {
      const enterP = localProgress * 2; // Map 0-0.5 to 0-1
      gsap.to(block, { 
        z: (1 - enterP) * -600, 
        scale: 0.2 + enterP * 0.8, 
        opacity: enterP, 
        duration: 0.2, 
        overwrite: 'auto' 
      });
    } else {
      const exitP = (localProgress - 0.5) * 2; // Map 0.5-1 to 0-1
      gsap.to(block, { 
        z: exitP * 1000, 
        scale: 1 + exitP * 12, 
        opacity: 1 - exitP, 
        duration: 0.2, 
        overwrite: 'auto' 
      });
    }
  }, [localProgress]);

  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;
    hasAnimatedIn.current = true;
    gsap.fromTo(
      block,
      { z: -600, scale: 0.1, opacity: 0 },
      { z: 0, scale: 1, opacity: 1, duration: 2.5, ease: 'power4.out', force3D: true }
    );
  }, []);

  const createTextElements = useCallback(() => {
    if (!blockRef.current) return null;

    const container = document.createElement('div');
    container.className = 'text-lines';
    
    // Line 1
    const line1 = document.createElement('div');
    line1.className = 'line line-1';
    const h3_1 = document.createElement('h3');
    h3_1.className = `neon ${colorClass}`;
    [...pre].forEach(char => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      h3_1.appendChild(span);
    });
    line1.appendChild(h3_1);
    
    // Line 2
    const line2 = document.createElement('div');
    line2.className = 'line line-2';
    const h1 = document.createElement('h1');
    h1.className = 'neon pink';
    [...main].forEach(char => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      h1.appendChild(span);
    });
    line2.appendChild(h1);
    
    // Line 3
    const line3 = document.createElement('div');
    line3.className = 'line line-3';
    const h3_3 = document.createElement('h3');
    h3_3.className = `neon ${colorClass}`;
    [...post].forEach(char => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      h3_3.appendChild(span);
    });
    line3.appendChild(h3_3);
    
    container.appendChild(line1);
    container.appendChild(document.createElement('br'));
    container.appendChild(line2);
    container.appendChild(document.createElement('br'));
    container.appendChild(line3);
    
    return container;
  }, [pre, main, post, colorClass]);

  useLayoutEffect(() => {
    if (!blockRef.current) return;

    if (contextRef.current) {
      contextRef.current.revert();
    }

    const fullText = `${pre} ${main} ${post}`;
    if (glowRedRef.current) glowRedRef.current.textContent = fullText;
    if (glowCyanRef.current) glowCyanRef.current.textContent = fullText;

    const textContainer = createTextElements();
    if (!textContainer) return;

    const glowElements = blockRef.current.querySelectorAll('.glow');
    const lastGlow = glowElements[glowElements.length - 1];
    
    const existingLines = blockRef.current.querySelector('.text-lines');
    if (existingLines) {
      existingLines.remove();
    }

    if (lastGlow && lastGlow.nextSibling) {
      blockRef.current.insertBefore(textContainer, lastGlow.nextSibling);
    } else {
      blockRef.current.appendChild(textContainer);
    }

    contextRef.current = gsap.context(() => {
      const line1Chars = textContainer.querySelectorAll('.line-1 .char');
      const line2Chars = textContainer.querySelectorAll('.line-2 .char');
      const line3Chars = textContainer.querySelectorAll('.line-3 .char');
      
      const shift = 35;
      
      gsap.set(line1Chars, {
        scale: 0.3,
        opacity: 0,
        x: -shift * 2,
        filter: 'blur(12px)',
        transformOrigin: 'center',
        force3D: true
      });

      gsap.set(line2Chars, {
        scale: 0.3,
        opacity: 0,
        x: (i) => (i - line2Chars.length / 2) * -shift,
        filter: 'blur(12px)',
        transformOrigin: 'center',
        force3D: true
      });

      gsap.set(line3Chars, {
        scale: 0.3,
        opacity: 0,
        x: shift * 2,
        filter: 'blur(12px)',
        transformOrigin: 'center',
        force3D: true
      });

      const masterTl = gsap.timeline();

      masterTl.to(line1Chars, {
        scale: 1,
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'start' },
        force3D: true
      }, 0);

      masterTl.to(line2Chars, {
        scale: 1,
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.05, from: 'center' },
        force3D: true
      }, 0.4);

      masterTl.to(line3Chars, {
        scale: 1,
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'end' },
        force3D: true
      }, 0.8);

      gsap.fromTo('.glow.glow--red', {
        x: -4, y: 4, opacity: 0.4, filter: 'blur(15px)', scale: 0.8
      }, {
        x: 0, y: 0, opacity: 0.08, filter: 'blur(3px)', scale: 1,
        duration: 5, ease: 'power4.out'
      });

      gsap.fromTo('.glow.glow--cyan', {
        x: 4, y: -4, opacity: 0.4, filter: 'blur(15px)', scale: 0.8
      }, {
        x: 0, y: 0, opacity: 0.08, filter: 'blur(3px)', scale: 1,
        duration: 5, ease: 'power4.out'
      });

    }, blockRef);

    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, [index, createTextElements]);

  useEffect(() => {
    if (isAnimatingRef.current) return;

    const schedule = () => {
      if (cycleTimerRef.current) {
        cycleTimerRef.current.kill();
      }

      cycleTimerRef.current = gsap.delayedCall(7, () => {
        if (isAnimatingRef.current) return;
        
        isAnimatingRef.current = true;

        const textContainer = blockRef.current?.querySelector('.text-lines');
        if (!textContainer) {
          isAnimatingRef.current = false;
          schedule();
          return;
        }

        const line1Chars = textContainer.querySelectorAll('.line-1 .char');
        const line2Chars = textContainer.querySelectorAll('.line-2 .char');
        const line3Chars = textContainer.querySelectorAll('.line-3 .char');
        
        const shift = 35;
        
        const exitTl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
            setIndex((i) => (i + 1) % TEXTS.length);
            schedule();
          }
        });

        exitTl.to(line1Chars, {
          scale: 0.2,
          opacity: 0,
          x: shift * 3,
          filter: 'blur(15px)',
          duration: 1.5,
          ease: 'power4.inOut',
          stagger: { each: 0.03, from: 'start' },
          force3D: true
        }, 0);

        exitTl.to(line2Chars, {
          scale: 0.2,
          opacity: 0,
          x: (i) => (i - line2Chars.length / 2) * shift,
          filter: 'blur(15px)',
          duration: 1.5,
          ease: 'power4.inOut',
          stagger: { each: 0.02, from: 'center' },
          force3D: true
        }, 0.2);

        exitTl.to(line3Chars, {
          scale: 0.2,
          opacity: 0,
          x: -shift * 3,
          filter: 'blur(15px)',
          duration: 1.5,
          ease: 'power4.inOut',
          stagger: { each: 0.03, from: 'end' },
          force3D: true
        }, 0.4);

        exitTl.to(['.glow.glow--red', '.glow.glow--cyan'], {
          opacity: 0,
          filter: 'blur(20px)',
          scale: 0.7,
          duration: 1.5,
          ease: 'power4.inOut',
        }, 0);
      });
    };
    
    schedule();
    
    return () => {
      if (cycleTimerRef.current) {
        cycleTimerRef.current.kill();
      }
      isAnimatingRef.current = false;
    };
  }, [index]);


  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', perspective: '1200px' }}>
      <section id="hero" className="home cinematic-hero" aria-labelledby="hero-text">
        <div className="hero-block" ref={blockRef} id="hero-text" aria-live="polite">
          <div className="glow glow--red" ref={glowRedRef} aria-hidden="true" />
          <div className="glow glow--cyan" ref={glowCyanRef} aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
