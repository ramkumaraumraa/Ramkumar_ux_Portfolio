"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Works = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardData = [
    {
      title: 'Mandarai, E-commerce',
      description:
        'Exquisite flowers boutique to your doorstep for celebrating every occasion with culturally infused floral arrangements and timely deliveries.',
      image: '/assets/imgs/Works/01_IMG Mandarai.png',
      link: 'https://believed-suggestion-f69.notion.site/Mandarai-E-Commerce-Reviving-a-Local-Flower-Boutique-Amidst-the-Pandemic-d800f24026e64017a2204445947ce7a9',
    },
    {
      title: 'HCI - AI System Design',
      description:
        'Explores the design for fall detection emphasizing interpretability, and collaboration to ensure elderly safety and well-being.',
      image: '/assets/imgs/Works/02_IMG HCI AI.png',
      link: 'https://ramkumar6g.myportfolio.com/hci-for-ai',
    },
    {
      title: 'Connected Driving Experience',
      description:
        'Innovative Mobility designed to seamlessly bridge the gap between owner and the vehicle.',
      image: '/assets/imgs/Works/03_IMG i-Connect.png',
      link: 'https://www.youtube.com/playlist?list=PLJjcadb173eX82D8WUR8qUUeNEXzjs7a7',
    },
    {
      title: 'Android & iOS Smartwatch',
      description:
        'Driving experience on wrist, Elevating unparalleled convenience of the driving experience to new heights.',
      image: '/assets/imgs/Works/04_IMG i-Connect smart watch.png',
      link: 'https://high-premise-296616.framer.app/',
    },
    {
      title: 'INFLEET, Design System',
      description:
        'Bridging the gap between global functionality and regional needs, that resonates with Indian fleet managers for optimal efficiency.',
      image: '/assets/imgs/Works/05_IMG INF.png',
      link: 'https://ramkumar6g.myportfolio.com/infleet-design-system',
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !sectionRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    
    const cardWidth = cardRefs.current[0]?.offsetWidth || 600;
    const gap = 32;
    const totalCardWidth = cardWidth + gap;
    const sectionWidth = section.offsetWidth;
    const centerOffset = (sectionWidth - cardWidth) / 2;
    
    const maxScroll = (cardData.length - 1) * totalCardWidth;

    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    gsap.set(cardRefs.current, { 
      x: '100vw', 
      opacity: 0,
      force3D: true
    });

    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => {
        if (isMobile) {
          return `+=${maxScroll + window.innerHeight * 0.9}`;
        } else if (isTablet) {
          return `+=${maxScroll + window.innerHeight * 0.3}`;
        } else {
          return `+=${maxScroll + window.innerHeight}`;
        }
      },
      pin: true,
      scrub: isMobile ? 2 : 1.2,
      anticipatePin: 1,
      pinSpacing: true,
      refreshPriority: isMobile ? -1 : 0,
      invalidateOnRefresh: true,
      
      onEnter: () => {
        gsap.to(cardRefs.current, {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: isMobile ? 1.5 : 1.2,
          stagger: isMobile ? 0.2 : 0.15,
          force3D: true
        });
      },
      
      onUpdate: (self) => {
        const progress = self.progress;
        const currentIndex = Math.round(progress * (cardData.length - 1));
        setActiveIndex(currentIndex);

        const targetX = -progress * maxScroll + centerOffset;
        
        gsap.set(container, {
          x: targetX,
          force3D: true
        });
      },
      
      onEnterBack: () => {
        gsap.set(cardRefs.current, {
          x: 0,
          opacity: 1,
          force3D: true
        });
      },

      onRefresh: function(this: any) {
        if (isMobile) {
          const newCardWidth = cardRefs.current[0]?.offsetWidth || 600;
          const newMaxScroll = (cardData.length - 1) * (newCardWidth + gap);
          if (this && this.vars) {
            this.vars.end = `+=${newMaxScroll + window.innerHeight * 0.9}`;
          }
        }
      }
    });

    if (isMobile) {
      let resizeTimeout: NodeJS.Timeout;
      const handleMobileResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const currentWidth = window.innerWidth;
          
          if (Math.abs(currentWidth - window.innerWidth) > 50) {
            ScrollTrigger.refresh();
          }
        }, 100);
      };

      window.addEventListener('resize', handleMobileResize);
      
      return () => {
        window.removeEventListener('resize', handleMobileResize);
        if (scrollTrigger) scrollTrigger.kill();
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }

    return () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [cardData.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent, card: HTMLDivElement, image: Element) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 25;
      const rotateY = (centerX - e.clientX) / 25;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        force3D: true
      });

      gsap.to(image, { 
        scale: 1.03,
        duration: 0.4, 
        ease: 'power2.out',
        force3D: true 
      });
    };

    const handleMouseLeave = (card: HTMLDivElement, image: Element) => {
      gsap.to(card, { 
        rotateX: 0, 
        rotateY: 0, 
        duration: 0.6, 
        ease: 'power2.inOut',
        force3D: true 
      });
      gsap.to(image, { 
        scale: 1, 
        duration: 0.6, 
        ease: 'power2.inOut',
        force3D: true 
      });
    };

    cardRefs.current.forEach((card) => {
      if (card) {
        const image = card.querySelector('.card-image img');
        if (image) {
          const boundMouseMove = (e: MouseEvent) => handleMouseMove(e, card, image);
          const boundMouseLeave = () => handleMouseLeave(card, image);
          
          card.addEventListener('mousemove', boundMouseMove, { passive: true });
          card.addEventListener('mouseleave', boundMouseLeave, { passive: true });
          
          (card as any)._boundMouseMove = boundMouseMove;
          (card as any)._boundMouseLeave = boundMouseLeave;
        }
      }
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card && (card as any)._boundMouseMove && (card as any)._boundMouseLeave) {
          card.removeEventListener('mousemove', (card as any)._boundMouseMove);
          card.removeEventListener('mouseleave', (card as any)._boundMouseLeave);
        }
      });
    };
  }, []);

  const handleDotClick = (index: number) => {
    if (index === activeIndex) return;
    
    const isMobile = window.innerWidth <= 768;
    const cardWidth = cardRefs.current[0]?.offsetWidth || 600;
    const gap = 32;
    const totalCardWidth = cardWidth + gap;
    const sectionCenter = (sectionRef.current?.offsetWidth || window.innerWidth) / 2;
    const cardCenter = index * totalCardWidth + cardWidth / 2;
    const scrollPosition = cardCenter - sectionCenter;

    setActiveIndex(index);

    gsap.to(containerRef.current, {
      x: -scrollPosition,
      ease: 'power2.out',
      duration: isMobile ? 1.0 : 0.8,
      force3D: true
    });
  };

  const handleArrowClick = (direction: number) => {
    let newIndex = activeIndex + direction;
    newIndex = Math.max(0, Math.min(newIndex, cardData.length - 1));
    handleDotClick(newIndex);
  };

  return (
    <section id="works" className="sticky" ref={sectionRef}>
      <h5 className="turquoise h5 neon" style={{ marginBottom: '8px' }}>
        CASE STUDIES
      </h5>

      <div className="case-study-container container" ref={containerRef}>
        {cardData.map((card, index) => (
          <div
            className="case-study-link"
            key={`case-study-${index}`}
            ref={(el) => { cardRefs.current[index] = el; }}
            onClick={() => window.open(card.link, '_blank')}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="case-study-card">
              <div className="card-image" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
                <Image 
                  src={card.image} 
                  alt={`${index + 1}. ${card.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ 
                    objectFit: 'cover',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
              <div className="card-content">
                <p className="body-title-3">{card.title}</p>
                <p className="body-2">{card.description}</p>
                <div className="card-button body-2">
                  Explore the journey →
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container">
        <button 
          className="card-button" 
          onClick={() => handleArrowClick(-1)}
          disabled={activeIndex === 0}
          style={{ opacity: activeIndex === 0 ? 0.5 : 1 }}
        >
          <img
            src="/assets/imgs/icons/chevron_left.svg"
            alt="Previous"
            className="pagination-icon"
          />
          <span></span><span></span><span></span>
        </button>

        <div className="pagination-dots">
          {cardData.map((_, index) => (
            <span
              className={`dot ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              key={`dot-${index}`}
              style={{ cursor: 'none' }}
            ></span>
          ))}
        </div>

        <button 
          className="card-button" 
          onClick={() => handleArrowClick(1)}
          disabled={activeIndex === cardData.length - 1}
          style={{ opacity: activeIndex === cardData.length - 1 ? 0.5 : 1 }}
        >
          <img
            src="/assets/imgs/icons/chevron_right.svg"
            alt="Next"
            className="pagination-icon"
          />
          <span></span><span></span><span></span>
        </button>
      </div>
    </section>
  );
};

export default Works;
