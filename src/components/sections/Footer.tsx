"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { useLocalTime } from '@/hooks/useLocalTime';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

import Form from '../Form';

const featuredTestimonials = [
  {
    name: 'HARISH',
    role: 'Senior Developer',
    description: 'Working with Ram was a force multiplier. His product thinking and design foresight made complex LMS experiences clearer, faster to build, and easier to scale.',
    image: '/assets/imgs/Footer/Harish.png',
    variant: 'left',
  },
  {
    name: 'JAYASHANKAR',
    role: 'Founder of Sachirva',
    description: 'Ram took our e-learning idea from zero to a usable product system. He brought structure, patience, and the kind of end-to-end thinking early-stage products badly need.',
    image: '/assets/imgs/Footer/Jayashankar.png',
    variant: 'featured',
  },
  {
    name: 'DIVYA',
    role: 'Scrum Master',
    description: 'Ram raises the quality of the whole team. His strategic UX approach and calm mentorship made decisions clearer and delivery stronger.',
    image: '/assets/imgs/Footer/Divya.png',
    variant: 'right',
  },
];

const Footer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const localProgress = useSectionProgress(4, 0.7); // Footer is index 4, delay text reveal until 70% approaching
  const localTime = useLocalTime();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      
      // Phase 1: Enter (0.0 to 0.5)
      tl.fromTo(
        '.testimonial-wrapper',
        { opacity: 0, scale: 0.2, z: -1000, rotateX: 20 },
        { 
          opacity: 1, 
          scale: 1,
          z: 0, 
          rotateX: 0, 
          stagger: 0.1,
          duration: 0.5, 
          ease: 'power2.out'
        },
        0
      );

      tl.fromTo(
        '.footer-contact-plane',
        { opacity: 0, scale: 0.5, z: -500 },
        { opacity: 1, scale: 1, z: 0, duration: 0.5, ease: 'power2.out' },
        0.2
      );

      // Phase 2: Exit Portal (0.5 to 1.0)
      tl.to(
        '.testimonial-wrapper',
        { 
          scale: 4,
          z: 800, 
          rotateX: -20, 
          stagger: 0.05,
          duration: 0.5, 
          ease: 'power2.in'
        },
        0.5
      );

      tl.to(
        '.footer-contact-panel',
        { scale: 5, z: 1000, duration: 0.5, ease: 'power2.in' },
        0.55
      );

      tl.to(
        ['.testimonial-wrapper', '.footer-contact-panel'],
        { opacity: 0, duration: 0.25, ease: 'power2.in' },
        0.5
      );

      tlRef.current = tl;
      tl.progress(localProgress);
    }, footerRef);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []); // Initialize with localProgress correctly, run once on mount

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.progress(localProgress);
    }
  }, [localProgress]);

  return (
    <section ref={footerRef} id="footer" className="footer-testimonials-section">
      <div className="footer-testimonial-plane">
        {featuredTestimonials.map((testimonial, index) => {
          const isFeatured = testimonial.variant === 'featured';

          return (
            <div key={testimonial.name} className="testimonial-wrapper">
              <article
                className={`testimonial-card testimonial-card--${testimonial.variant}`}
              >
                <p className="body-2 testimonial-quote">"{testimonial.description}"</p>

                <div className="testimonial-card-footer">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="testimonial-img"
                  />

                  <div className="testimonial-card-content">
                    <p className="body-title-2">{testimonial.name}</p>
                    <p className="footnote testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>


      <div className="footer-contact-plane">
        <div className="footer-contact-panel">
          <div className="footer-contact-top">
            <div className="footer-contact-copy">
              <p className="sub-header-1 footer-contact-title">
                Open to product design, UX systems,<br/>and mentoring conversations.
              </p>
            </div>

            <div className="footer-contact-direct">
              <a href="mailto:ramkumargd01@gmail.com" className="body-2 footer-direct-link">
                Email: ramkumargd01@gmail.com
              </a>
              <a href="tel:+919176750625" className="body-2 footer-direct-link">
                Phone: +91-9176750625
              </a>
            </div>

            <div className="footer-contact-actions">
              <button onClick={() => setIsFormOpen(true)} className="card-button body-2 footer-contact-button">
                OPEN CONTACT FORM
                <span></span><span></span><span></span><span></span><span></span>
              </button>

              <a href="mailto:ramkumargd01@gmail.com" className="footer-contact-link body-2">
                Email Directly
              </a>
            </div>
          </div>

          <div className="footer-contact-bottom">
            <div className="footer-social-links" aria-label="Social links">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={link.label}
                  title={link.label}
                >
                  <Image
                    src={link.defaultIcon}
                    alt=""
                    width={18}
                    height={18}
                    className="footer-social-icon"
                  />
                </a>
              ))}
            </div>

            <p className="body-2 footer-contact-body">
              Feel free to fill out the reach out form,<br/>my response back time is 1-3 days
            </p>

            <div className="footer-contact-meta">
              <p className="footnote footer-contact-time">
                {`Local time ${localTime} GMT+5:30`}
              </p>
              <p className="footnote footer-contact-copyright">
                {`Ramkumar \u00A9 ${currentYear} | All rights reserved`}
              </p>
            </div>
          </div>
        </div>

        <div className="footer-mobile-meta">
          <p className="footnote">{`Local time ${localTime} GMT+5:30`}</p>
        </div>
      </div>

      <Form isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
};

export default Footer;
