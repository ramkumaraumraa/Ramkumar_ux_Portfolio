import React, { useEffect } from 'react';
import { gsap } from 'gsap';

const PROXY_HEIGHT = 18_000;
const SECTION_SCROLL: Record<string, number> = {
  home:    0,
  works:   PROXY_HEIGHT * 0.18,
  about:   PROXY_HEIGHT * 0.36,
  process: PROXY_HEIGHT * 0.54,
  contact: PROXY_HEIGHT * 0.72,
};

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openContactForm: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, openContactForm }) => {
  useEffect(() => {
    gsap.fromTo('.mobile-bottom-nav', 
      { y: 100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 1 }
    );
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // Virtual scroll jump is handled upstream by handleSetActiveTab in page.tsx
  };

  const svgs = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    works: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    about: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    process: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    contact: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  };

  return (
    <div className="mobile-bottom-nav body-2">
      {(['home', 'works', 'about', 'process'] as const).map(tab => (
        <button 
          key={tab}
          className={`nav-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          <span className="nav-icon">{svgs[tab]}</span>
          <span className="nav-label">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
        </button>
      ))}

      <button className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => handleTabClick('contact')}>
        <span className="nav-icon">{svgs.contact}</span>
        <span className="nav-label">Contact</span>
      </button>

    </div>
  );
};

export default MobileBottomNav;
