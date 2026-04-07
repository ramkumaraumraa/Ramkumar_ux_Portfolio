"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Form from '../Form';

const testimonialsData: { name: string; role: string; description: string; image: string; }[] = [
  {
    name: 'SAMUEL',
    role: 'Lead Collaborator',
    description: 'Ram\'s design philosophy centers on user empathy and business impact. His ability to translate complex requirements into elegant solutions consistently exceeded our project expectations.',
    image: '/assets/imgs/Footer/Sameul.png',
  },
  {
    name: 'CHEVVIYAN',
    role: 'Product Owner',
    description: 'Ram\'s expertise in user research and design systems implementation helped us establish a scalable design foundation that continues to drive our product innovation.',
    image: '/assets/imgs/Footer/Default.png',
  },
  {
    name: 'DIVYA',
    role: 'Scrum Master',
    description: 'Working with Ramkumar has been transformative for our team dynamics. His strategic approach to UX design and mentorship has elevated our entire product development process.',
    image: '/assets/imgs/Footer/Divya.png',
  },
  {
    name: 'HARISH',
    role: 'Senior Developer',
    description: 'Working hand-in-hand with Ram was a game changer. Together we built impactful LMS products that boosted revenue. His design foresight and my development expertise created seamless solutions that scaled globally.',
    image: '/assets/imgs/Footer/Harish.png',
  },
  {
    name: 'PURUSHOTHAM',
    role: 'Business Analyst',
    description: 'Ramkumar transformed a construction-focused project management platform with scalable design systems and clear user–business alignment. At the same time, he pushed boundaries to deliver an adhoc product solution under a very short deadline — bringing clarity and speed to execution.',
    image: '/assets/imgs/Footer/Default.png',
  },
  {
    name: 'JAYASHANKAR',
    role: 'Founder of Sachirva',
    description: 'Ram is a very good team player with remarkable patience and skill. He took my e-learning startup idea from scratch, building the branding, design system, and complex product flows that enabled us to automate tests and deliver learning directly into students’ hands.',
    image: '/assets/imgs/Footer/Jayashankar.png',
  },
];

const Footer = () => {
  const [localTime, setLocalTime] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const updateTime = () => {
      const now = new Date();
      const time = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      setLocalTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!testimonialsRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const container = testimonialsRef.current?.querySelector('.testimonials-grid');
      if (!container) return;

      gsap.set(container, { x: 0, force3D: true });
      const cards = Array.from(container.children);

      const setCount = testimonialsData.length;
      const firstSetEls = cards.slice(0, setCount);

      const getOuterWidth = (el: Element) => {
        const cs = getComputedStyle(el);
        return el.getBoundingClientRect().width +
               parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
      };

      let setWidth = firstSetEls.reduce((sum, el) => sum + getOuterWidth(el), 0);

      while (container.scrollWidth < setWidth * 2 + 2) {
        firstSetEls.forEach((el) => container.appendChild(el.cloneNode(true)));
      }

      setWidth = firstSetEls.reduce((sum, el) => sum + getOuterWidth(el), 0);

      scrollTweenRef.current = gsap.to(container, {
        x: `-=${setWidth}`,
        duration: 40,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: (x: string) => {
            const v = parseFloat(x);
            const wrapped = ((v % -setWidth) + 0); 
            return `${wrapped}px`;
          }
        }
      });

      container.addEventListener('mouseenter', () => {
        if (scrollTweenRef.current) scrollTweenRef.current.pause();
      });

      container.addEventListener('mouseleave', () => {
        if (scrollTweenRef.current) scrollTweenRef.current.resume();
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const openContactForm = () => {
    setIsFormOpen(true);
  };

  const closeContactForm = () => {
    setIsFormOpen(false);
  };

  return (
    <section id="footer" className="footer-testimonials-section" ref={sectionRef}>
      <div className="testimonials-content" ref={testimonialsRef}>
        <h5 className="turquoise h5 neon section-sticky-label section-sticky-label--full" style={{ marginTop: '24px' }}>TESTIMONIALS</h5>
        <div className="testimonials-grid">
          {testimonialsData.map((testimonial, index) => (
            <div key={`testimonial-${index}`} className="testimonial-card" style={{ display: 'flex', opacity: 1, visibility: 'visible' }}>
              <div className="testimonial-card-header">
                <Image src={testimonial.image} alt={testimonial.name} width={64} height={64} className="testimonial-img" />
                <div className="testimonial-card-content">
                  <p className="body-title-2">{testimonial.name}</p>
                </div>
              </div>
              <p className="body-1">{testimonial.role}</p>
              <p className="caption-text">{testimonial.description}</p>
            </div>
          ))}
          
          {testimonialsData.map((testimonial, index) => (
            <div key={`testimonial-duplicate-${index}`} className="testimonial-card" style={{ display: 'flex', opacity: 1, visibility: 'visible' }}>
              <div className="testimonial-card-header">
                <Image src={testimonial.image} alt={testimonial.name} width={64} height={64} className="testimonial-img" />
                <div className="testimonial-card-content">
                  <p className="body-title-2">{testimonial.name}</p>
                </div>
              </div>
              <p className="body-1">{testimonial.role}</p>
              <p className="caption-text">{testimonial.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-content">
        <h6 className="blue h6 neon footer-title">👋 Thanks for stopping by!</h6>

        <div className="footer-sections">
          <div className="footer-left">
            <p className="sub-header-3">Get in Touch</p>
            <p className="sub-header-3">Email: ramkumargd01@gmail.com</p>
            <p className="sub-header-3">Phone: +91-9176750625</p>
          </div>

          <div className="footer-right">
            <p className="body-2" style={{ marginBottom: '16px' }}>
              Feel free to fill out the reach out form, my response back time is 1-3 days
            </p>
            <button 
              onClick={openContactForm}
              className="card-button body-2"
            >
              Reach out form
              <span></span><span></span><span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-row">
            <p className="footnote">RamKumar © {new Date().getFullYear()} | Powered by ILAKH | All Rights Reserved</p>
            <p className="local-time footnote">Local Time: {localTime} GMT +5:30</p>
          </div>
        </div>
      </div>

      <Form isOpen={isFormOpen} onClose={closeContactForm} />
    </section>
  );
};

export default Footer;
