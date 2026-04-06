"use client";

import React, { useEffect } from 'react';

const Cursor = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const customCursor = document.getElementById('custom-cursor');
      if (customCursor) {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Twinkle class from the CodePen
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
        this.size = Math.random() + 1;
        this.decay = 0.01;
        this.speed = speed * 0.08;
        this.spread = spread * this.speed;
        this.spreadX = (Math.random() - 0.5) * this.spread - this.mx;
        this.spreadY = (Math.random() - 0.5) * this.spread - this.my;
        this.color = `hsl(${hue}deg 90% 60%)`;
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

    // Custom element exactly like the CodePen
    class CustomCursorTwinkles extends HTMLElement {
      canvas: HTMLCanvasElement | null = null;
      ctx: CanvasRenderingContext2D | null = null;
      fps = 60;
      msPerFrame = 1000 / 60;
      timePrevious: number | null = null;
      twinkles: Twinkle[] = [];
      pointer = {
        x: 0,
        y: 0,
        mx: 0,
        my: 0,
      };
      hue = 0;
      animationFrameId: number | null = null;

      static register(tag = 'custom-cursor-twinkles') {
        if (typeof window !== "undefined" && 'customElements' in window && !customElements.get(tag)) {
          customElements.define(tag, this);
        }
      }

      static css = `
        :host {
          display: grid;
          width: 100%;
          height: 100%;
          pointer-events: none;
          position: fixed;
          top: 0;
          left: 0;
        }
      `;

      constructor() {
        super();
      }

      connectedCallback() {
        if (!this.shadowRoot) {
          const canvas = document.createElement('canvas');
          const sheet = new CSSStyleSheet();
          const shadowRoot = this.attachShadow({ mode: 'open' });

          sheet.replaceSync(CustomCursorTwinkles.css);
          shadowRoot.adoptedStyleSheets = [sheet];
          shadowRoot.appendChild(canvas);

          this.canvas = shadowRoot.querySelector('canvas');
          if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setCanvasDimensions();
            this.setupEvents();
            this.timePrevious = performance.now();
            this.animateTwinkles();
          }
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
            count: 120,
            speed: Math.random() + 1,
            spread: Math.random() + 30,
          });
        });

        document.addEventListener('pointermove', (event) => {
          this.createTwinkles(event, {
            count: 20,
            speed: this.getPointerVelocity(event),
            spread: 1,
          });
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
          #custom-cursor {
            position: fixed;
            width: 24px;
            height: 24px;
            background-size: cover;
            background-image: url('/assets/imgs/Cursor.svg');
            background-repeat: no-repeat;
            background-position: center;
            transition: transform 0.05s ease-out;
            transform: translate(-50%, -50%);
            z-index: 100001;
            pointer-events: none;
          }

          custom-cursor-twinkles {
            display: block;
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 100000;
            pointer-events: none;
          }

          body, a, button {
            cursor: none;
          }

          a:hover, button:hover, .case-study-card:hover, .card-button:hover {
            cursor: none;
          }

          a:hover ~ #custom-cursor, 
          button:hover ~ #custom-cursor, 
          .case-study-card:hover ~ #custom-cursor, 
          .card-button:hover ~ #custom-cursor {
             transform: translate(-50%, -50%) scale(1.5);
          }
        `
      }} />

      {/* Twinkles first, cursor on top */}
      {/* @ts-ignore - Custom Element */}
      <custom-cursor-twinkles></custom-cursor-twinkles>
      
      <div id="custom-cursor"></div>
    </>
  );
};

export default Cursor;
