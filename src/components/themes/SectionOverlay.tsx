"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const HomeSection    = dynamic(() => import('../sections/Home'),    { ssr: false });
const WorksSection   = dynamic(() => import('../sections/Works'),   { ssr: false });
const AboutSection   = dynamic(() => import('../sections/About'),   { ssr: false });
const ProcessSection = dynamic(() => import('../sections/Process'), { ssr: false });
const FooterSection  = dynamic(() => import('../sections/Footer'),  { ssr: false });

interface SectionOverlayProps {
  activeSection: string;
}

export default function SectionOverlay({ activeSection }: SectionOverlayProps) {
  const visible = true; // Always visible, sections fade in based on scroll
  const footerClass = activeSection === 'footer' ? ' section-overlay--footer' : '';

  return (
    <div className={`section-overlay${visible ? ' section-overlay--visible' : ''}${footerClass}`}>
      <Suspense fallback={null}>
        <HomeSection activeSection={activeSection} />
        {activeSection === 'works'   && <WorksSection />}
        {activeSection === 'about'   && <AboutSection />}
        {activeSection === 'process' && <ProcessSection />}
        {activeSection === 'footer'  && <FooterSection />}
      </Suspense>
    </div>
  );
}
