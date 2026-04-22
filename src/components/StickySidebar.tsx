"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

const SocialSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile && mounted) {
    const fabContent = (
      <div style={{
        position: 'fixed',
        bottom: '116px',
        right: '16px',
        zIndex: 99999,
      }}>
        {/* Menu items — absolutely positioned ABOVE the trigger button */}
        <div
          className={`fab-menu-items ${isOpen ? 'open' : ''}`}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            right: '0',
            flexDirection: 'column-reverse',
          }}
        >
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

        {/* Trigger button */}
        <button
          className={`fab-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="fab-icon">
            {/* Person/profile icon — clearly "find me online", not "share" */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </span>
        </button>
      </div>
    );

    return createPortal(fabContent, document.body);
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
