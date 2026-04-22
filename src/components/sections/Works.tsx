"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const DESKTOP_POSITIONS = [
  { xPercent: -170, yPercent: -10, rotate: -15, scale: 0.88, zIndex: 1 },
  { xPercent: -85,  yPercent: 15,  rotate: -7,  scale: 0.95, zIndex: 2 },
  { xPercent: 0,    yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
  { xPercent: 85,   yPercent: -15, rotate: 7,   scale: 0.95, zIndex: 3 },
  { xPercent: 170,  yPercent: 10,  rotate: 15,  scale: 0.88, zIndex: 4 },
];

const TABLET_POSITIONS = [
  { xPercent: -85, yPercent: -15, rotate: -12, scale: 0.85, zIndex: 1 },
  { xPercent: -40, yPercent: 10,  rotate: -6,  scale: 0.95, zIndex: 2 },
  { xPercent: 0,   yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
  { xPercent: 40,  yPercent: -10, rotate: 6,   scale: 0.95, zIndex: 3 },
  { xPercent: 85,  yPercent: 15,  rotate: 12,  scale: 0.85, zIndex: 4 },
];

const MOBILE_POSITIONS = [
  { xPercent: -10, yPercent: -70, rotate: -8, scale: 0.85, zIndex: 1 },
  { xPercent: 15,  yPercent: -35, rotate: -4, scale: 0.9,  zIndex: 2 },
  { xPercent: 0,   yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
  { xPercent: -15, yPercent: 35,  rotate: 4,   scale: 0.9,  zIndex: 3 },
  { xPercent: 10,  yPercent: 70,  rotate: 8,   scale: 0.85, zIndex: 4 },
];

const Works = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hoverTweens = useRef<(gsap.core.Tween | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [descriptionHeights, setDescriptionHeights] = useState<number[]>([]);

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

  const getPositions = useCallback(() => {
    if (typeof window === 'undefined') return DESKTOP_POSITIONS;
    if (window.innerWidth <= 768) return MOBILE_POSITIONS;
    if (window.innerWidth <= 1024) return TABLET_POSITIONS;
    return DESKTOP_POSITIONS;
  }, []);

  const localProgress = useSectionProgress(1, 0.7); // Works is index 1, delay text reveal until 70% approaching

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measureDescriptions = () => {
      setDescriptionHeights(
        descriptionRefs.current.map((description) => description?.scrollHeight ?? 0)
      );
    };

    const animationFrame = window.requestAnimationFrame(measureDescriptions);
    const resizeObserver = new ResizeObserver(measureDescriptions);

    descriptionRefs.current.forEach((description) => {
      if (description) {
        resizeObserver.observe(description);
      }
    });

    document.fonts.ready.then(measureDescriptions);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      setHoveredIndex(null);
    }
  }, [isMobileViewport]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Initial strict centering setup
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      gsap.set(cardRefs.current, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        scale: 0.5,
        opacity: 0,
        transformOrigin: '50% 50%',
        force3D: true
      });
    } else {
      gsap.set(cardRefs.current, {
        position: 'relative',
        scale: 1,
        opacity: 1, // Let CSS handle mobile layout
      });
      // Return early for mobile so we don't run the desktop scrub timeline
      return;
    }

    const positions = getPositions();
    const tl = gsap.timeline({ paused: true });
    timelineRef.current = tl;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      
      // Phase 1: Enter (0 -> 0.5)
      tl.fromTo(card, {
        xPercent: -50,
        yPercent: -50,
        scale: 0.1,
        opacity: 0,
        rotation: 0
      }, {
        xPercent: positions[i].xPercent - 50,
        yPercent: positions[i].yPercent - 50,
        scale: positions[i].scale,
        rotation: positions[i].rotate,
        opacity: 1,
        zIndex: positions[i].zIndex,
        ease: 'power2.out',
        duration: 0.5,
        force3D: true
      }, 0);

      // Phase 2: Exit Portal (0.5 -> 1.0)
      tl.to(card, {
        xPercent: (positions[i].xPercent * 3) - 50,
        yPercent: (positions[i].yPercent * 3) - 50,
        scale: 4,
        rotation: positions[i].rotate * 2,
        duration: 0.5,
        ease: 'power2.in',
        force3D: true
      }, 0.5);
      
      // Fade out explicitly faster
      tl.to(card, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      }, 0.5);
    });

    // Initialize progress
    tl.progress(localProgress);

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [getPositions]);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.progress(localProgress);
    }
  }, [localProgress]);

  const handleMouseEnter = (index: number) => {
    if (isMobileViewport) return;

    const card = cardRefs.current[index];
    if (!card) return;

    const positions = getPositions();
    setHoveredIndex(index);
    
    // Kill any active hover tweens for this card to prevent conflicts, 
    // without killing the main timeline properties
    if (hoverTweens.current[index]) hoverTweens.current[index]?.kill();

    // Set z-index immediately to prevent overlap issues during the tween
    gsap.set(card, { zIndex: 100 });

    hoverTweens.current[index] = gsap.to(card, {
      scale: positions[index].scale + 0.1,
      opacity: 1,
      rotation: 0, // Straighten the hovered card
      duration: 0.5,
      ease: 'power3.out',
      overwrite: false
    });

    // Dim sideways siblings
    cardRefs.current.forEach((c, i) => {
      if (i !== index && c) {
        if (hoverTweens.current[i]) hoverTweens.current[i]?.kill();
        hoverTweens.current[i] = gsap.to(c, {
          scale: positions[i].scale - 0.05,
          opacity: 0.4,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: false
        });
      }
    });
  };

  const handleMouseLeave = (index: number) => {
    if (isMobileViewport) return;

    const card = cardRefs.current[index];
    if (!card) return;

    const positions = getPositions();
    setHoveredIndex((currentIndex) => (currentIndex === index ? null : currentIndex));

    cardRefs.current.forEach((c, i) => {
      if (c) {
        if (hoverTweens.current[i]) hoverTweens.current[i]?.kill();
        hoverTweens.current[i] = gsap.to(c, {
          scale: positions[i].scale,
          rotation: positions[i].rotate,
          opacity: 1,
          zIndex: positions[i].zIndex,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: false
        });
      }
    });
  };

  return (
    <div id="works" className="relative h-full">
      <section
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden works-section-mobile"
        ref={sectionRef}
      >
      <div
        className="works-container relative w-full h-full flex items-center justify-center"
        ref={containerRef}
      >
        {cardData.map((card, index) => (
          (() => {
            const isDescriptionVisible = isMobileViewport || hoveredIndex === index;
            const descriptionHeight = descriptionHeights[index] ?? 140;

            return (
              <div
                className="group relative md:absolute w-[260px] md:w-[300px] lg:w-[340px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-300 border border-white/5 bg-neutral-900/60 backdrop-blur-xl cursor-pointer hover:border-emerald-500/30 shrink-0"
                key={`case-study-${index}`}
                ref={(el) => { cardRefs.current[index] = el; }}
                onClick={() => window.open(card.link, '_blank')}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                {/* Image Container */}
                <div className="relative w-full h-[55%] overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                  <Image 
                    src={card.image} 
                    alt={`${index + 1}. ${card.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 340px"
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110 ease-out"
                    priority={index === 2} // prioritize center card
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-900/95" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 top-[35%] w-full p-5 md:p-6 flex flex-col justify-end">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col gap-2">
                    {/* Card Title — always visible, sits at top of content area */}
                    <p className="body-title-4" style={{ margin: 0, padding: 0 }}>
                      {card.title}
                    </p>
                    
                    {/* Description reveal follows the same JS hover state as the GSAP card animation. */}
                    <div
                      className="overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-out"
                      style={{
                        maxHeight: isDescriptionVisible ? `${descriptionHeight}px` : '0px',
                        opacity: isDescriptionVisible ? 1 : 0,
                        transform: `translateY(${isDescriptionVisible ? 0 : 8}px)`,
                      }}
                    >
                      <p
                        className="footnote text-neutral-300 pt-1 m-0"
                        ref={(el) => { descriptionRefs.current[index] = el; }}
                      >
                        {card.description}
                      </p>
                    </div>
                    
                    {/* Arrow CTA — clean, no duplicate text */}
                    <div className="flex justify-end mt-1">
                      <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300 text-base font-semibold transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ))}
      </div>
      </section>
    </div>
  );
};

export default Works;
