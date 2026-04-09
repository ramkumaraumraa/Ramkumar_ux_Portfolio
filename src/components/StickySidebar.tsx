"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

const SocialSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="mobile-fab-container">
        <div className={`fab-menu-items ${isOpen ? 'open' : ''}`}>
          {SOCIAL_LINKS.map((icon, index) => (
            <a
              key={index}
              href={icon.href}
              target="_blank"
              rel="noopener noreferrer"
              className="fab-item"
              onMouseEnter={() => setHoveredIcon(icon.label)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <Image
                src={hoveredIcon === icon.label ? icon.hoverIcon : icon.defaultIcon}
                alt={icon.label}
                width={18}
                height={18}
              />
            </a>
          ))}
        </div>
        
        <button 
          className={`fab-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="fab-icon">+</span>
        </button>
      </div>
    );
  }

  // Desktop original sidebar
  return (
    <div className="social-sidebar">
      {SOCIAL_LINKS.map((icon, index) => (
        <a
          key={index}
          href={icon.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-link"
          onMouseEnter={() => setHoveredIcon(icon.label)}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <Image
            src={hoveredIcon === icon.label ? icon.hoverIcon : icon.defaultIcon}
            alt={icon.label}
            width={40}
            height={40}
            className="social-icon"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
