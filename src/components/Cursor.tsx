"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Detect touch device
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Direct positioning for the dot
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
      }
      
      // Lagging positioning for the ring
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.5,
          ease: "power3.out"
        });
      }
    };

    const handleMouseEnter = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 0, duration: 0.3 });
    };

    const handleMouseDown = () => {
      gsap.to(ringRef.current, { scale: 0.8, duration: 0.2 });
    };

    const handleMouseUp = () => {
      gsap.to(ringRef.current, { scale: 1, duration: 0.2 });
    };

    // Global listeners for interactive elements
    const handleHoverStart = () => {
      gsap.to(ringRef.current, { 
        scale: 1.5, 
        borderWidth: '1px', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        duration: 0.3 
      });
      gsap.to(dotRef.current, { scale: 0.5, duration: 0.3 });
    };

    const handleHoverEnd = () => {
      gsap.to(ringRef.current, { 
        scale: 1, 
        borderWidth: '2px', 
        backgroundColor: 'transparent', 
        duration: 0.3 
      });
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Attach hover effects to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, .case-study-card, .card-button, .expertise-item, .nav-item, .site-dock__item, .site-dock__brand, .footer-social-link, .footer-direct-link, .expertise-accordion-header, .contact-info, .dropdown-button, .copy-button, .holo-card'
    );
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice.current) return;

    // Twinkle class
    class Twinkle {
      ctx: CanvasRenderingContext2D;
      x: number;
      y: number;
      mx: number;
      my: number;
      size: number;
      decay: number;
      speed: number;
      spread: number;
      spreadX: number;
      spreadY: number;
      color: string;

      constructor(spread: number, speed: number, component: any) {
        const { ctx, pointer, hue } = component;

        this.ctx = ctx;
        this.x = pointer.x;
        this.y = pointer.y;
        this.mx = pointer.mx * 0.1;
        this.my = pointer.my * 0.1;
        this.size = Math.random() * 0.8 + 0.4; 
        this.decay = 0.012; 
        this.speed = speed * 0.08;
        this.spread = spread * this.speed;
        this.spreadX = (Math.random() - 0.5) * this.spread - this.mx;
        this.spreadY = (Math.random() - 0.5) * this.spread - this.my;
        this.color = `hsl(${hue}deg 90% 70%)`;
      }

      draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      collapse() {
        this.size -= this.decay;
      }

      trail() {
        this.x += this.spreadX * this.size;
        this.y += this.spreadY * this.size;
      }

      update() {
        this.draw();
        this.trail();
        this.collapse();
      }
    }

    class CustomCursorTwinkles extends HTMLElement {
      canvas: HTMLCanvasElement | null = null;
      ctx: CanvasRenderingContext2D | null = null;
      msPerFrame = 1000 / 60;
      timePrevious: number | null = null;
      twinkles: Twinkle[] = [];
      pointer = { x: 0, y: 0, mx: 0, my: 0 };
      hue = 0;
      animationFrameId: number | null = null;

      static register(tag = 'custom-cursor-twinkles') {
        if (typeof window !== "undefined" && 'customElements' in window && !customElements.get(tag)) {
          customElements.define(tag, this);
        }
      }

      constructor() {
        super();
      }

      connectedCallback() {
        if (!this.shadowRoot) {
          const canvas = document.createElement('canvas');
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.appendChild(canvas);

          this.canvas = canvas;
          this.ctx = canvas.getContext('2d');
          this.setCanvasDimensions();
          this.setupEvents();
          this.timePrevious = performance.now();
          this.animateTwinkles();

          // Styles for the component
          const style = document.createElement('style');
          style.textContent = `
            :host {
              display: block;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 99999;
            }
            canvas {
              display: block;
            }
          `;
          shadowRoot.appendChild(style);
        }
      }

      disconnectedCallback() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      }

      createTwinkles(event: PointerEvent | MouseEvent, { count, speed, spread }: {count: number, speed: number, spread: number}) {
        this.setPointerValues(event);
        for (let i = 0; i < count; i++) {
          this.twinkles.push(new Twinkle(spread, speed, this));
        }
      }

      setPointerValues(event: PointerEvent | MouseEvent) {
        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;
        this.pointer.mx = event.movementX || 0;
        this.pointer.my = event.movementY || 0;
      }

      setupEvents() {
        document.addEventListener('click', (event) => {
          this.createTwinkles(event, {
            count: 35, 
            speed: Math.random() + 1,
            spread: Math.random() + 20,
          });
        });

        document.addEventListener('pointermove', (event) => {
          if (Math.random() > 0.6) { 
            this.createTwinkles(event, {
              count: 3, 
              speed: this.getPointerVelocity(event),
              spread: 1,
            });
          }
        });

        window.addEventListener('resize', () => this.setCanvasDimensions());
      }

      getPointerVelocity(event: PointerEvent | MouseEvent) {
        const a = event.movementX || 0;
        const b = event.movementY || 0;
        return Math.floor(Math.sqrt(a * a + b * b));
      }

      handleTwinkles() {
        for (let i = this.twinkles.length - 1; i >= 0; i--) {
          this.twinkles[i].update();
          if (this.twinkles[i].size <= 0.1) {
            this.twinkles.splice(i, 1);
          }
        }
      }

      setCanvasDimensions() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }

      animateTwinkles() {
        this.animationFrameId = requestAnimationFrame(() => this.animateTwinkles());
        const timeNow = performance.now();
        if (this.timePrevious === null) return;
        const timePassed = timeNow - this.timePrevious;
        if (timePassed < this.msPerFrame) return;
        const excessTime = timePassed % this.msPerFrame;
        this.timePrevious = timeNow - excessTime;

        if (this.ctx && this.canvas) {
           this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.hue = this.hue > 360 ? 0 : (this.hue += 3);
        this.handleTwinkles();
      }
    }

    CustomCursorTwinkles.register();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (hover: hover) and (pointer: fine) {
            body, a, button, .case-study-card, .card-button {
              cursor: none !important;
            }

            #cursor-dot {
              position: fixed;
              top: 0;
              left: 0;
              width: 8px;
              height: 8px;
              background-color: #fff;
              border-radius: 50%;
              z-index: 1000001;
              pointer-events: none;
              transform: translate(-50%, -50%);
              mix-blend-mode: difference;
            }

            #cursor-ring {
              position: fixed;
              top: 0;
              left: 0;
              width: 36px;
              height: 36px;
              border: 2px solid rgba(255, 255, 255, 0.4);
              border-radius: 50%;
              z-index: 1000000;
              pointer-events: none;
              transform: translate(-50%, -50%);
              backdrop-filter: blur(1px);
              mix-blend-mode: difference;
            }
          }

          @media (hover: none) {
            #cursor-dot, #cursor-ring, custom-cursor-twinkles {
              display: none !important;
            }
            body, a, button {
              cursor: auto !important;
            }
          }
        `
      }} />

      {/* @ts-ignore - Custom Element */}
      <custom-cursor-twinkles></custom-cursor-twinkles>
      <div id="cursor-dot" ref={dotRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
    </>
  );
};

export default Cursor;
