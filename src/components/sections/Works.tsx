"use client";

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  // Desktop Positions (Wide X spread)
  const fannedPositions = [
    { xPercent: -130, yPercent: -10, rotate: -15, scale: 0.85, zIndex: 1 },
    { xPercent: -65,  yPercent: 15,  rotate: -7,  scale: 0.95, zIndex: 2 },
    { xPercent: 0,    yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
    { xPercent: 65,   yPercent: -15, rotate: 7,   scale: 0.95, zIndex: 3 },
    { xPercent: 130,  yPercent: 10,  rotate: 15,  scale: 0.85, zIndex: 4 },
  ];

  // Tablet Positions (Tighter X-spread for 768-1024px)
  const tabletPositions = [
    { xPercent: -85, yPercent: -15, rotate: -12, scale: 0.85, zIndex: 1 },
    { xPercent: -40, yPercent: 10,  rotate: -6,  scale: 0.95, zIndex: 2 },
    { xPercent: 0,   yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
    { xPercent: 40,  yPercent: -10, rotate: 6,   scale: 0.95, zIndex: 3 },
    { xPercent: 85,  yPercent: 15,  rotate: 12,  scale: 0.85, zIndex: 4 },
  ];

  // Mobile Positions (Tighter Y-cascade, minimal X-spread so they fit on screen!)
  const mobilePositions = [
    { xPercent: -10, yPercent: -70, rotate: -8, scale: 0.85, zIndex: 1 },
    { xPercent: 15,  yPercent: -35, rotate: -4, scale: 0.9,  zIndex: 2 },
    { xPercent: 0,   yPercent: 0,   rotate: 0,   scale: 1,    zIndex: 5 },
    { xPercent: -15, yPercent: 35,  rotate: 4,   scale: 0.9,  zIndex: 3 },
    { xPercent: 10,  yPercent: 70,  rotate: 8,   scale: 0.85, zIndex: 4 },
  ];

  const getPositions = () => {
    if (typeof window === 'undefined') return fannedPositions;
    if (window.innerWidth <= 768) return mobilePositions;
    if (window.innerWidth <= 1024) return tabletPositions;
    return fannedPositions;
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
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

    let mm = gsap.matchMedia();

    // Responsive setup
    mm.add({
      isDesktop: "(min-width: 1025px)",
      isTablet: "(min-width: 769px) and (max-width: 1024px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      let { isTablet, isMobile } = context.conditions as any;
      let positions = isMobile ? mobilePositions : isTablet ? tabletPositions : fannedPositions;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 50%',
        onEnter: () => {
          cardRefs.current.forEach((card, i) => {
            gsap.to(card, {
              xPercent: positions[i].xPercent - 50, // Accounts for -50 starting offset
              yPercent: positions[i].yPercent - 50,
              rotation: positions[i].rotate,
              scale: positions[i].scale,
              opacity: 1,
              zIndex: positions[i].zIndex,
              duration: 1.4,
              ease: 'expo.out',
              delay: i * 0.1,
              force3D: true,
              overwrite: 'auto'
            });
          });
        },
        onLeaveBack: () => {
          gsap.to(cardRefs.current, {
            xPercent: -50,
            yPercent: -50,
            rotation: 0,
            scale: 0.5,
            opacity: 0,
            duration: 1,
            ease: 'power3.inOut',
            overwrite: 'auto'
          });
        }
      });
    });

    return () => {
      mm.revert(); // clean up matchMedia
    };
  }, []);

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
    <section 
      id="works" 
      className="relative w-full min-h-[100vh] py-24 flex flex-col items-center justify-center overflow-hidden" 
      ref={sectionRef}
    >
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4">
        <h2 className="text-turquoise text-xs md:text-sm uppercase tracking-[0.3em] font-medium text-emerald-400">
          SELECTED WORKS
        </h2>
      </div>

      <div 
        className="relative w-full max-w-7xl mx-auto h-[600px] md:h-[600px] flex items-center justify-center mt-32 md:mt-24" 
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
  );
};

export default Works;
