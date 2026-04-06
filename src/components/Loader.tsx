"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from 'gsap';

interface LoaderProps {
  onComplete?: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const circleRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setDisplayProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (circleRef.current) {
      const radius = isMobile ? 90 : 120;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (displayProgress / 100) * circumference;
      
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [displayProgress, isMobile]);

  useEffect(() => {
    if (displayProgress >= 100 && !isCompleting) {
      setIsCompleting(true);
      
      setTimeout(() => {
        setShowWelcome(true);
        
        setTimeout(() => {
          gsap.timeline()
            .fromTo(".welcome-title", 
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
            )
            .fromTo(".welcome-subtitle",
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
              "-=0.6"
            )
            .fromTo(".enter-section",
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
              "-=0.4"
            );
        }, 100);
      }, 600);
    }
  }, [displayProgress, isCompleting]);

  const handleEnter = () => {
    setIsEntering(true);
    
    gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    })
    .to(".loader-content", {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in"
    })
    .to(".loader", {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      display: "none"
    }, "-=0.2");
  };

  const svgSize = isMobile ? 220 : 280;
  const center = isMobile ? 110 : 140;
  const radius = isMobile ? 90 : 120;

  return (
    <div className={`loader ${isEntering ? "fade-out" : ""}`}>
      <div className="loader-content">
        {!showWelcome && (
          <div className="progress-container">
            <svg className="progress-ring" width={svgSize} height={svgSize}>
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff" />
                  <stop offset="50%" stopColor="#00a2ff" />
                  <stop offset="100%" stopColor="#b700ff" />
                </linearGradient>
              </defs>
              
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                className="progress-bg"
              />
              
              <circle
                ref={circleRef}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                className="progress-bar"
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: 'rotate(-90deg)',
                  transition: 'stroke-dashoffset 0.3s ease'
                }}
              />
            </svg>
            
            <div className="progress-text">
              <h1 className="progress-number turquoise h1 neon">
                {Math.round(displayProgress)}%
              </h1>
              <p className="progress-label caption-text">
                {displayProgress < 30 ? 'Initializing...' :
                 displayProgress < 60 ? 'Loading Assets...' :
                 displayProgress < 90 ? 'Preparing...' :
                 'Ready'}
              </p>
            </div>
          </div>
        )}

        {showWelcome && (
          <>
            <div className="welcome-section">
              <h1 className="welcome-title blue h1 neon" style={{ opacity: 0 }}>
                Welcome to Ramkumar's
              </h1>
              <h3 className="welcome-subtitle turquoise h4 neon" style={{ opacity: 0 }}>
                World of Design
              </h3>
            </div>
            
            <div className="enter-section" style={{ opacity: 0 }}>
              <button className="enter-button" onClick={handleEnter}>
                <span className="enter-text">Enter Journey</span>
                <span className="enter-arrow">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
