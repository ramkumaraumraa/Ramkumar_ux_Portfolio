"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSpring, animated } from '@react-spring/web';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const About = () => {
  const aboutRef = useRef<HTMLElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  const [hoveredExpertise, setHoveredExpertise] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState("right");
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
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
    setMounted(true);
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!aboutRef.current || !mounted) return;

    gsapContextRef.current = gsap.context(() => {
      // Use small pixel offsets instead of xPercent to avoid large shifts
      // when the section height exceeds 100vh
      gsap.fromTo(
        '.about-left',
        { scale: 0.95, opacity: 0, x: -24 },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          ease: 'power2.out',
          duration: 1.4,
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      gsap.fromTo(
        '.about-right',
        { scale: 0.95, opacity: 0, x: 24 },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          ease: 'power2.out',
          duration: 1.4,
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      gsap.fromTo(
        '.stat-item',
        { scale: 0.8, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 1.2,
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.expertise-item',
        { scale: 0.9, opacity: 0, y: 16 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.expertise-grid',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, aboutRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
        gsapContextRef.current = null;
      }
    };
  }, [mounted]);

  const [statProps, setStatProps] = useSpring(() => ({
    scale: 1,
    config: { tension: 250, friction: 15 },
  }));

  const handleStatMouseEnter = () => setStatProps({ scale: 1.05 });
  const handleStatMouseLeave = () => setStatProps({ scale: 1 });

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
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.2', overflow: 'hidden', borderRadius: '1rem' }} className="profile-image-container">
          <Image
            src="/assets/imgs/About/My Pic 1.png"
            alt="Ramkumar - Senior Product Designer and UX Mentor"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
            style={{ objectFit: 'cover' }}
            className="profile-image"
            priority
          />
        </div>
        <a
          href="/assets/imgs/About/Ramkumarux_Resume.pdf"
          className="card-button body-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download Ramkumar's Resume PDF"
          style={{ marginTop: '24px' }}
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
          <h5 className="blue h5 neon">Hello I'm Ramkumar</h5>
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
          <animated.div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
            style={statProps}
          >
            <h5 className="pink h5 neon">25+</h5>
            <p className="caption-text-label">PRODUCTS DESIGNED</p>
          </animated.div>

          <animated.div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
            style={statProps}
          >
            <h5 className="pink h5 neon">100+</h5>
            <p className="caption-text-label">FEATURES DEVELOPED</p>
          </animated.div>

          <animated.div
            className="stat-item"
            onMouseEnter={handleStatMouseEnter}
            onMouseLeave={handleStatMouseLeave}
            style={statProps}
          >
            <h5 className="pink h5 neon">500+</h5>
            <p className="caption-text-label">RESEARCH ORCHESTRATED</p>
          </animated.div>
        </div>

        <div className="expertise-section">
          {/* Desktop: grid with hover tooltip */}
          {mounted && isDesktop && (
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
          {mounted && !isDesktop && (
            <div className="expertise-accordion-list">
              {expertiseData.map((item, index) => (
                <div
                  key={index}
                  className={`expertise-accordion-item${activeAccordion === index ? ' active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="expertise-accordion-header">
                    <span className="caption">{item.title}</span>
                    <span className="expertise-accordion-icon">
                      {activeAccordion === index ? '−' : '+'}
                    </span>
                  </div>
                  <div className="expertise-accordion-body">
                    <p className="body-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop tooltip */}
      {mounted && isDesktop && hoveredExpertise !== null && (
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
