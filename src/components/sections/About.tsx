"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { gsap } from 'gsap';

const About = () => {
  const aboutRef = useRef<HTMLElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  const [hoveredExpertise, setHoveredExpertise] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState("right");
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const expertiseData = [
    {
      title: "Design Workshops & Mentorship",
      description: "Conduct interactive workshops or training sessions to educate teams and aspiring designers on UX best practices, methodologies, and strategies."
    },
    {
      title: "Branding, Design Systems, & Audits",
      description: "I develop scalable design systems and libraries that ensure consistent, efficient product development and brand alignment, while conducting in-depth UX audits to enhance usability, accessibility, and overall user satisfaction across websites, mobile apps, and digital platforms."
    },
    {
      title: "Websites, & Mobile Apps",
      description: "Create responsive, high-performing websites and landing pages designed to captivate users, generate leads, and drive conversions."
    },
    {
      title: "IoT, Mobility, SaaS, & AI Products",
      description: "I design intuitive mobility smart systems and digital products that align user needs with business goals, while leveraging human-centered AI principles to craft conversational UIs, ethical systems, and inclusive experiences."
    },
  ];

  // Detect desktop vs mobile
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const localProgress = useSectionProgress(2, 0.7); // About is index 2, delay text reveal until 70% approaching

  useEffect(() => {
    if (!aboutRef.current || isDesktop === null) return;

    gsapContextRef.current = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Build the reveal timeline
      tl.fromTo('.about-left', { scale: 0.95, opacity: 0, x: -24 }, { scale: 1, opacity: 1, x: 0, ease: 'power2.out', duration: 1 }, 0);
      tl.fromTo('.about-right', { scale: 0.95, opacity: 0, x: 24 }, { scale: 1, opacity: 1, x: 0, ease: 'power2.out', duration: 1 }, 0);
      tl.fromTo('.stat-item', { scale: 0.8, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, ease: 'power2.out', duration: 0.8, stagger: 0.1 }, 0.2);
      
      const targetClass = isDesktop ? '.expertise-item' : '.expertise-accordion-item';
      if (document.querySelectorAll(targetClass).length > 0) {
        tl.fromTo(targetClass, { scale: 0.9, opacity: 0, y: 16 }, { scale: 1, opacity: 1, y: 0, ease: 'power2.out', duration: 0.6, stagger: 0.05 }, 0.4);
      }

      // Sync timeline with scroll progress
      tl.progress(localProgress);
    }, aboutRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [isDesktop, localProgress]);

  const handleStatMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
  };
  const handleStatMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
  };

  const handleExpertiseMouseMove = (e: React.MouseEvent) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const offsetX = 15;
    const offsetY = 10;
    const tooltipWidth = 320;
    const tooltipHeight = 100;

    let placement = "right";
    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    if (x + tooltipWidth > viewportWidth - 20) {
      placement = "left";
      x = e.clientX - tooltipWidth - offsetX;
    }

    if (y + tooltipHeight > viewportHeight - 20) {
      y = e.clientY - tooltipHeight - offsetY;
    }

    if (x < 20) {
      x = 20;
      placement = "right";
    }

    if (y < 20) {
      y = 20;
    }

    setTooltipPlacement(placement);
    setTooltipPosition({ x, y });
  };

  const handleExpertiseMouseEnter = (index: number, e: React.MouseEvent) => {
    if (!isDesktop) return;
    setHoveredExpertise(index);
    handleExpertiseMouseMove(e);

    const tooltip = document.querySelector(".expertise-tooltip");
    if (tooltip) {
      gsap.fromTo(
        tooltip,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  };

  const handleExpertiseMouseLeave = () => {
    if (!isDesktop) return;
    const tooltip = document.querySelector(".expertise-tooltip");
    if (tooltip) {
      gsap.to(tooltip, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power3.out",
        onComplete: () => setHoveredExpertise(null)
      });
    } else {
      setHoveredExpertise(null);
    }
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(prev => prev === index ? null : index);
  };

  return (
    <section ref={aboutRef} id="about" className="about-expertise-section">
      <div className="about-left">
        <div className="profile-visual">
          <div className="profile-image-container">
            <Image
              src="/assets/imgs/About/My Pic 1.png"
              alt="Ramkumar - Senior Product Designer and UX Mentor"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 42vw, 32vw"
              quality={90}
              style={{ objectFit: 'contain', objectPosition: 'center top' }}
              className="profile-image"
              priority
            />
          </div>
        </div>
        <a
          href="/assets/imgs/About/Ramkumarux_Resume.pdf"
          className="card-button body-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download Ramkumar's Resume PDF"
        >
          Download Resume
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>

      <div className="about-right">
        <div className="about-header">
          <p className="sub-header-1">Senior Product Designer and UX Mentor</p>
          <p className="sub-header-2">Based in Chennai, Tamil Nadu, India.</p>
          <p className="body-2 about-description">
            With more than a decade of experience as a designer, my expertise lies
            in Lean UX methodologies, which I employ to harmonize processes,
            yielding heightened efficiency. In a world obsessed with complexity, I
            wield the power of design to transform challenges into user-friendly
            masterpieces.
          </p>
        </div>

        <div className="about-stats">
          <div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
          >
            <h5 className="pink h5 neon">25+</h5>
            <p className="caption-text-label">PRODUCTS DESIGNED</p>
          </div>

          <div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
          >
            <h5 className="pink h5 neon">100+</h5>
            <p className="caption-text-label">FEATURES DEVELOPED</p>
          </div>

          <div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
          >
            <h5 className="pink h5 neon">500+</h5>
            <p className="caption-text-label">RESEARCH ORCHESTRATED</p>
          </div>
        </div>

        <div className="expertise-section">
          {/* Desktop: grid with hover tooltip */}
          {isDesktop && (
            <div className="expertise-grid">
              {expertiseData.map((item, index) => (
                <div
                  key={index}
                  className="expertise-item card-button caption"
                  onMouseEnter={(e) => handleExpertiseMouseEnter(index, e)}
                  onMouseMove={handleExpertiseMouseMove}
                  onMouseLeave={handleExpertiseMouseLeave}
                >
                  {item.title}
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              ))}
            </div>
          )}

          {/* Mobile: accordion */}
          {isDesktop === false && (
            <div className="expertise-accordion-list">
              {expertiseData.map((item, index) => (
                <div
                  key={index}
                  className={`expertise-accordion-item${activeAccordion === index ? ' active' : ''}`}
                >
                  <button
                    type="button"
                    className="expertise-accordion-header"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={activeAccordion === index}
                    aria-controls={`expertise-panel-${index}`}
                  >
                    <span className="caption">{item.title}</span>
                    <span className="expertise-accordion-icon">
                      {activeAccordion === index ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`expertise-panel-${index}`}
                    className="expertise-accordion-body"
                  >
                    <p className="body-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop tooltip */}
      {isDesktop && hoveredExpertise !== null && (
        <div
          className={`expertise-tooltip ${tooltipPlacement}`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <p className="body-2">
            {expertiseData[hoveredExpertise].description}
          </p>
        </div>
      )}
    </section>
  );
};

export default About;
