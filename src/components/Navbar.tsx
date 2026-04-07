"use client";

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Form from './Form';

const Logo = '/assets/imgs/Logo.svg';
const PhoneIcon = '/assets/imgs/icons/Phone.svg';
const EmailIcon = '/assets/imgs/icons/Email.svg';
const CopyIcon = '/assets/imgs/icons/file_copy.svg';
import MobileBottomNav from './MobileBottomNav';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab = 'home', setActiveTab = () => {} }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const glowAnimationRef = useRef<any>(null);

  const socialIcons = [
    {
      default: '/assets/imgs/icons/social icons/01_Icon_Instagram.svg',
      hover: '/assets/imgs/icons/social icons/01_Icon_clr_Instagram.svg',
      link: 'https://www.instagram.com/ramkumargd01',
    },
    {
      default: '/assets/imgs/icons/social icons/02_Icon_Dribbble.svg',
      hover: '/assets/imgs/icons/social icons/02_Icon_clr_Dribbble.svg',
      link: 'https://dribbble.com/Ramuxui6',
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
    gsap.registerPlugin(ScrollTrigger);
    setIsMobile(window.innerWidth <= 1024);
  }, []);

  useEffect(() => {
    if (contactButtonRef.current && !isMobile) {
      glowAnimationRef.current = gsap.to(contactButtonRef.current, {
        '--gradient-angle': '360deg',
        duration: 4,
        ease: 'none',
        repeat: -1,
      } as any); // Type cast due to custom CSS var usage
    }

    return () => {
      if (glowAnimationRef.current) {
        glowAnimationRef.current.kill();
      }
    };
  }, [isMobile]);

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      gsap.to(navbar, {
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '+=200',
          scrub: true,
        },
        background: 'rgba(6, 12, 24, 0.97)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,220,255,0.12)',
      });
    }
  }, []);

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    gsap.fromTo(toast, 
      { y: 100, opacity: 0 },
      { 
        y: -20, 
        opacity: 1, 
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(toast, {
            y: 100,
            opacity: 0,
            duration: 0.5,
            delay: 2,
            ease: 'power2.in',
            onComplete: () => toast.remove()
          });
        }
      }
    );
  };

  const copyToClipboard = (text: string, event: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(text).then(() => {
      const button = event.currentTarget;
      const img = button.querySelector('img');
      if (img) {
        gsap.to(img, {
          scale: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power1.out',
        });
      }
      showToast(`${text} copied to clipboard!`);
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 1024;
      setIsMobile(isNowMobile);
      if (!isNowMobile) setMenuOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleContactClick = () => {
    setDropdownVisible(!dropdownVisible);
    
    if (!dropdownVisible) {
      gsap.fromTo('.dropdown-menu',
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  const handleDropdownMouseLeave = () => {
    gsap.to('.dropdown-menu', {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setDropdownVisible(false),
    });
  };

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? 'auto' : 'hidden';
    
    const timeline = gsap.timeline();
    if (!menuOpen) {
      timeline
        .fromTo('#mobile-menu',
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
        )
        .fromTo('#mobile-menu ul li',
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, stagger: 0.1, ease: 'power2.out' },
          '<'
        );
    } else {
      timeline.to('#mobile-menu', 
        { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in' }
      );
    }
  };

  const scrollToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openContactForm = () => {
    setIsFormOpen(true);
    setDropdownVisible(false);
    if (menuOpen) toggleMobileMenu();
  };

  const closeContactForm = () => {
    setIsFormOpen(false);
  };

  const downloadResume = () => {
    window.open('/assets/imgs/About/Ramkumarux_Resume.pdf', '_blank');
    setDropdownVisible(false);
    if (menuOpen) toggleMobileMenu();
  };

  return (
    <>
      {!isMobile && (
        <nav className="navbar">
          <div className="logo-section">
            <a href="#home" onClick={scrollToHome} className="logo-link">
              <img src={Logo} alt="Logo" className="logo-image" />
              <span className="logo-text">Ramkumar</span>
            </a>
          </div>

        {!isMobile && (
          <div className="nav-right">
            <ul className="nav-list-right body-2">
              <li><a href="#works">Works</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#process">Process</a></li>
            </ul>

<div className="contact-section" ref={dropdownRef}>
              <button 
                ref={contactButtonRef}
                className={`contact-glow-button ${dropdownVisible ? 'active' : ''}`}
                onClick={handleContactClick}
              >
                <span className="button-inner">
                  <span className="button-text">Contact</span>
                  <span className={`button-arrow ${dropdownVisible ? 'rotated' : ''}`}>▼</span>
                </span>
              </button>
              
              {dropdownVisible && (
                <div 
                  className="dropdown-menu body-2"
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <ul>
                    <li className="contact-info">
                      <p>
                        <img src={EmailIcon} alt="Email" className="icon" />
                        <span>ramkumargd01@gmail.com</span>
                      </p>
                      <button
                        onClick={(e) => copyToClipboard('ramkumargd01@gmail.com', e)}
                        className="copy-button"
                        aria-label="Copy email"
                      >
                        <img src={CopyIcon} alt="Copy" />
                      </button>
                    </li>
                    <li className="contact-info">
                      <p>
                        <img src={PhoneIcon} alt="Phone" className="icon" />
                        <span>+91 9176750625</span>
                      </p>
                      <button
                        onClick={(e) => copyToClipboard('+91 9176750625', e)}
                        className="copy-button"
                        aria-label="Copy phone"
                      >
                        <img src={CopyIcon} alt="Copy" />
                      </button>
                    </li>
                    <div className="dropdown-separator"></div>
                    <li className="dropdown-action">
                      <button onClick={openContactForm} className="dropdown-button">
                        <span>Open Contact Form</span>
                        <span className="action-arrow">→</span>
                      </button>
                    </li>
                    <li className="dropdown-action">
                      <button onClick={downloadResume} className="dropdown-button">
                        <span>Download Resume</span>
                        <span className="action-arrow">↓</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        </nav>
      )}

      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openContactForm={openContactForm}
        />
      )}

      <Form isOpen={isFormOpen} onClose={closeContactForm} />
      <div id="toast-container"></div>
    </>
  );
};

export default Navbar;
