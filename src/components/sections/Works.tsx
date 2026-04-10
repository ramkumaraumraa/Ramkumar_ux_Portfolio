"use client";

import React, { useRef, useEffect, useCallback } from 'react';
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
    if (!sectionRef.current) return;

    // Initial strict centering setup
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

    const positions = getPositions();
    const tl = gsap.timeline({ paused: true });

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      tl.to(card, {
        xPercent: positions[i].xPercent - 50,
        yPercent: positions[i].yPercent - 50,
        rotation: positions[i].rotate,
        scale: positions[i].scale,
        opacity: 1,
        zIndex: positions[i].zIndex,
        ease: 'power2.out',
        duration: 1, // Timeline relative duration
        force3D: true
      }, i * 0.05); // slight stagger in the timeline
    });

    // Drive timeline progress by local scroll progress
    tl.progress(localProgress);

    return () => {
      tl.kill();
    };
  }, [getPositions, localProgress]);

  const handleMouseEnter = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const positions = getPositions();
    
    gsap.to(card, {
      scale: positions[index].scale + 0.1,
      zIndex: 50,
      rotation: 0, // Straighten the hovered card
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto'
    });

    // Dim sideways siblings
    cardRefs.current.forEach((c, i) => {
      if (i !== index && c) {
        gsap.to(c, {
          scale: positions[i].scale - 0.05,
          opacity: 0.4,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const positions = getPositions();

    cardRefs.current.forEach((c, i) => {
      if (c) {
        gsap.to(c, {
          scale: positions[i].scale,
          rotation: positions[i].rotate,
          opacity: 1,
          zIndex: positions[i].zIndex,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  };

  return (
    <div id="works" className="relative h-full">
      <section
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        ref={sectionRef}
      >
      <div
        className="relative w-full h-full flex items-center justify-center"
        ref={containerRef}
      >
        {cardData.map((card, index) => (
          <div
            className="group absolute w-[260px] md:w-[300px] lg:w-[340px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-300 border border-white/5 bg-neutral-900/60 backdrop-blur-xl cursor-pointer hover:border-emerald-500/30"
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
            <div className="absolute top-1/2 bottom-0 w-full p-6 md:p-8 flex flex-col justify-end">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col gap-1 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                {/* Use div instead of h3 to prevent global CSS from making it huge */}
                <div className="text-sm md:text-base font-bold text-white tracking-tight leading-snug m-0 p-0">
                  {card.title}
                </div>
                
                {/* Expandable Description */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-out">
                  <div className="overflow-hidden">
                    <p className="text-xs md:text-sm text-neutral-300 line-clamp-2 leading-relaxed pt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-1 flex items-center text-emerald-400 text-xs md:text-sm font-semibold transition-colors duration-300 group-hover:text-emerald-300">
                  <span className="relative flex items-center gap-2">
                    Explore the journey
                    <span className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>
    </div>
  );
};

export default Works;
