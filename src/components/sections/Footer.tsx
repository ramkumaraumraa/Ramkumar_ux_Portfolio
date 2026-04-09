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
  const localProgress = useSectionProgress(4); // Footer is index 4
  const localTime = useLocalTime();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo('.footer-heading-plane', {
        opacity: 0,
        y: 36,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
      }, 0);

      tl.fromTo('.testimonial-card--featured', {
        opacity: 0,
        y: 48,
        scale: 0.92,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
      }, 0.1);

      tl.fromTo('.testimonial-card--side', {
        opacity: 0,
        y: 56,
        scale: 0.9,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power2.out',
      }, 0.18);

      tl.fromTo('.footer-contact-panel, .footer-mobile-meta', {
        opacity: 0,
        y: 64,
        scale: 0.96,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: 'power2.out',
      }, 0.42);

      tl.progress(localProgress);
    }, footerRef);

    return () => ctx.revert();
  }, [localProgress]);

  return (
    <section ref={footerRef} id="footer" className="footer-testimonials-section">
      <div className="footer-heading-plane">
        <p className="caption-text footer-heading-label">TESTIMONIALS</p>
      </div>

      <div className="footer-testimonial-plane">
        {featuredTestimonials.map((testimonial) => {
          const isFeatured = testimonial.variant === 'featured';

          return (
            <article
              key={testimonial.name}
              className={`testimonial-card ${isFeatured ? 'testimonial-card--featured' : 'testimonial-card--side'} testimonial-card--${testimonial.variant}`}
            >
              <p className="body-2 testimonial-quote">“{testimonial.description}”</p>

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
          );
        })}
      </div>

      <div className="footer-contact-plane">
        <div className="footer-contact-panel">
          <div className="footer-contact-top">
            <div className="footer-contact-copy">
              <p className="caption-text footer-contact-overline">Thanks for stopping by</p>
              <p className="sub-header-1 footer-contact-title">
                Open to product design, UX systems, and mentoring conversations.
              </p>
            </div>

            <div className="footer-contact-aside">
              <div className="footer-contact-actions">
                <button onClick={() => setIsFormOpen(true)} className="card-button body-2 footer-contact-button">
                  Open contact form
                  <span></span><span></span><span></span><span></span><span></span>
                </button>

                <a href="mailto:ramkumargd01@gmail.com" className="footer-contact-link body-2">
                  Email directly
                </a>
              </div>

              <div className="footer-contact-direct">
                <a href="mailto:ramkumargd01@gmail.com" className="body-2 footer-direct-link">
                  Email: ramkumargd01@gmail.com
                </a>
                <a href="tel:+919176750625" className="body-2 footer-direct-link">
                  Phone: +91-9176750625
                </a>
              </div>
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
              Feel free to fill out the reach out form, my response back time is 1-3 days
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
