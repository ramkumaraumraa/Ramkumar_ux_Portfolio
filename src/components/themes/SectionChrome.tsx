"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

const SECTION_CHROME = {
  home: {
    title: "",
    tone: "neutral",
  },
  works: {
    title: "Selected Works",
    tone: "turquoise",
  },
  about: {
    title: "Hello I'M Ramkumar",
    tone: "blue",
  },
  process: {
    title: "Evolving non-linear process",
    tone: "pink",
  },
  footer: {
    title: "",
    tone: "neutral",
  },
} as const;

interface SectionChromeProps {
  activeSection: string;
}

export default function SectionChrome({ activeSection }: SectionChromeProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const entry = SECTION_CHROME[activeSection as keyof typeof SECTION_CHROME] ?? SECTION_CHROME.home;
  const titleChars = useMemo(() => entry.title.split(""), [entry.title]);

  useEffect(() => {
    if (!railRef.current) return;

    const ctx = gsap.context(() => {
      const frame = railRef.current;
      if (!frame) return;

      const chars = gsap.utils.toArray<HTMLElement>(".section-chrome__char");
      const accent = frame.querySelector<HTMLElement>(".section-chrome__accent");

      gsap.fromTo(
        frame,
        { autoAlpha: 0.68, y: -12 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }
      );

      if (accent) {
        gsap.fromTo(
          accent,
          { opacity: 0.16, scaleX: 0.25 },
          { opacity: 1, scaleX: 1, duration: 0.65, ease: "power3.out" }
        );
      }

      if (chars.length) {
        gsap.fromTo(
          chars,
          { y: 18, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.025,
            ease: "power3.out",
          }
        );
      }
    }, railRef);

    return () => ctx.revert();
  }, [activeSection, entry.title]);

  return (
    <div
      className={`section-chrome section-chrome--${entry.tone}${entry.title ? "" : " section-chrome--blank"}`}
      aria-live="polite"
    >
      <div ref={railRef} className="section-chrome__frame">
        <div className="section-chrome__accent" aria-hidden="true" />

        <div className="section-chrome__title-wrap">
          {entry.title ? (
            <p className="section-chrome__title">
              {titleChars.map((char, index) => (
                <span key={`${char}-${index}`} className="section-chrome__char">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
          ) : (
            <div className="section-chrome__placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
