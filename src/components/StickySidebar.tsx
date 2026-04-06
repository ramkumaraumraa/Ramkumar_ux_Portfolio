"use client";

import React, { useState, useEffect } from 'react';

const SocialSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const icons = [
    {
      default: '/assets/imgs/icons/social icons/01_Icon_Instagram.svg',
      hover: '/assets/imgs/icons/social icons/01_Icon_clr_Instagram.svg',
      link: 'https://www.instagram.com/ramkumargd01',
    },
    {
      default: '/assets/imgs/icons/social icons/03_Icon_Behance.svg',
      hover: '/assets/imgs/icons/social icons/03_Icon_clr_Behance.svg',
      link: 'https://www.behance.net/ramkumar6g80e6',
    },
    {
      default: '/assets/imgs/icons/social icons/04_Icon_Linkedin.svg',
      hover: '/assets/imgs/icons/social icons/04_Icon_clr_Linkedin.svg',
      link: 'https://www.linkedin.com/in/ramkumar6g/',
    },
    {
      default: '/assets/imgs/icons/social icons/05_Icon_ADPlist.svg',
      hover: '/assets/imgs/icons/social icons/05_Icon_clr_ADPlist.svg',
      link: 'https://adplist.org/mentors/ramkumar-g',
    },
  ];

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
          {icons.map((icon, index) => (
            <a
              key={index}
              href={icon.link}
              target="_blank"
              rel="noopener noreferrer"
              className="fab-item"
            >
              <img
                src={icon.default}
                alt={`Social Icon ${index + 1}`}
                onMouseOver={(e) => (e.currentTarget.src = icon.hover)}
                onMouseOut={(e) => (e.currentTarget.src = icon.default)}
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
      {icons.map((icon, index) => (
        <a
          key={index}
          href={icon.link}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon-link"
        >
          <img
            src={icon.default}
            alt={`Social Icon ${index + 1}`}
            className="social-icon"
            onMouseOver={(e) => (e.currentTarget.src = icon.hover)}
            onMouseOut={(e) => (e.currentTarget.src = icon.default)}
          />
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
