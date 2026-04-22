"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const TEXTS = [
  { pre: 'HUMANIZING', main: 'TECH THROUGH', post: 'DESIGN' },
  { pre: 'CRAFTING IMMERSIVE', main: 'EXPERIENCES', post: 'THAT RESONATE DEEPLY' },
  { pre: 'DESIGNING FOR THE', main: 'FUTURE, INSPIRED', post: 'BY THE PAST' },
];

export default function Home({ activeSection = 'home' }: { activeSection?: string }) {
  const [index, setIndex] = useState(0);
  const blockRef = useRef<HTMLDivElement>(null);
  
  const cycleTimerRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const contextRef = useRef<gsap.Context | null>(null);
  
  const [responsive, setResponsive] = useState({
    isMobile: false,
    isTablet: false
  });

  const { pre, main, post } = TEXTS[index];

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
        z: exitP * 600, 
        scale: 1 + exitP * 4, 
        opacity: Math.max(0, 1 - exitP * 3), 
        duration: 0.2, 
        overwrite: 'auto' 
      });
    }
  }, [localProgress]);

  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;
    hasAnimatedIn.current = true;
    
    // Zoom scale/Z 
    gsap.fromTo(block, 
      { z: -600, scale: 0.1 }, 
      { z: 0, scale: 1, duration: 2.5, ease: 'power4.out', force3D: true }
    );
    // Faster fade-in
    gsap.fromTo(block,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  const createTextElements = useCallback(() => {
    if (!blockRef.current) return null;

    const container = document.createElement('div');
    container.className = 'text-lines';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.textAlign = 'center';
    
    // Helper: wrap each word in a nowrap container so mobile breaks between words, not mid-char
    const appendChars = (parent: HTMLElement, text: string) => {
      const words = text.split(' ');
      words.forEach((word, wi) => {
        // Word wrapper — keeps chars together, allows line break between words
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-flex';
        wordSpan.style.whiteSpace = 'nowrap';

        [...word].forEach(char => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = char;
          span.style.display = 'inline-block';
          wordSpan.appendChild(span);
        });

        parent.appendChild(wordSpan);

        // Add a space between words (not inside the nowrap wrapper)
        if (wi < words.length - 1) {
          const space = document.createElement('span');
          space.className = 'char';
          space.textContent = '\u00A0';
          space.style.display = 'inline-block';
          parent.appendChild(space);
        }
      });
    };

    // Clean white text styles
    const setCleanWhite = (el: HTMLElement) => {
      el.style.color = '#ffffff';
      el.style.textShadow = 'none';
      el.style.margin = '0.1em 0';
    };

    // Line 1
    const line1 = document.createElement('div');
    line1.className = 'line line-1';
    const h3_1 = document.createElement('h3');
    setCleanWhite(h3_1);
    appendChars(h3_1, pre);
    line1.appendChild(h3_1);
    
    // Line 2
    const line2 = document.createElement('div');
    line2.className = 'line line-2';
    const h1 = document.createElement('h1');
    setCleanWhite(h1);
    appendChars(h1, main);
    line2.appendChild(h1);
    
    // Line 3
    const line3 = document.createElement('div');
    line3.className = 'line line-3';
    const h3_3 = document.createElement('h3');
    setCleanWhite(h3_3);
    appendChars(h3_3, post);
    line3.appendChild(h3_3);
    
    container.appendChild(line1);
    container.appendChild(line2);
    container.appendChild(line3);
    
    return container;
  }, [pre, main, post]);

  useLayoutEffect(() => {
    if (!blockRef.current) return;

    if (contextRef.current) {
      contextRef.current.revert();
    }

    const textContainer = createTextElements();
    if (!textContainer) return;

    const existingLines = blockRef.current.querySelector('.text-lines');
    if (existingLines) {
      existingLines.remove();
    }

    blockRef.current.appendChild(textContainer);

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

      // Line 1 entry
      masterTl.to(line1Chars, {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.out',
        stagger: { each: 0.06, from: 'start' }
      }, 0);
      masterTl.to(line1Chars, {
        scale: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'start' },
        force3D: true
      }, 0);

      // Line 2 entry
      masterTl.to(line2Chars, {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.out',
        stagger: { each: 0.05, from: 'center' }
      }, 0.4);
      masterTl.to(line2Chars, {
        scale: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.05, from: 'center' },
        force3D: true
      }, 0.4);

      // Line 3 entry
      masterTl.to(line3Chars, {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.out',
        stagger: { each: 0.06, from: 'end' }
      }, 0.8);
      masterTl.to(line3Chars, {
        scale: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 4,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'end' },
        force3D: true
      }, 0.8);

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
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', perspective: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section id="hero" className="home cinematic-hero" aria-labelledby="hero-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <div className="hero-block" ref={blockRef} id="hero-text" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        </div>
      </section>
    </div>
  );
}
