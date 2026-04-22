"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface LoaderProps {
  onComplete?: () => void;
  sceneReady?: boolean;
}

const PREWARM_PROGRESS = 68;
const HOLD_PROGRESS = 92;
const FALLBACK_READY_MS = 3200;
const FINAL_PROGRESS_DURATION_DESKTOP = 0.62;
const FINAL_PROGRESS_DURATION_MOBILE = 0.52;
const REVEAL_HOLD_DURATION_DESKTOP = 0.42;
const REVEAL_HOLD_DURATION_MOBILE = 0.32;
const PANEL_REVEAL_DURATION_DESKTOP = 1.32;
const PANEL_REVEAL_DURATION_MOBILE = 1.08;
const CONTENT_FADE_DURATION = 0.44;
const ROOT_FADE_DURATION = 0.3;
const REDUCED_MOTION_PROGRESS_DURATION = 0.24;
const REDUCED_MOTION_HOLD_DURATION = 0.16;

export default function Loader({ onComplete, sceneReady = false }: LoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fallbackReady, setFallbackReady] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const progressStateRef = useRef({ value: 0 });
  const progressTweenRef = useRef<gsap.core.Tween | null>(null);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const bootStartedRef = useRef(false);
  const prewarmStartedRef = useRef(false);
  const completionStartedRef = useRef(false);

  const canReveal = sceneReady || fallbackReady;
  const progressRatio = Math.max(0, Math.min(1, displayProgress / 100));

  const phaseLabel =
    displayProgress < 24
      ? "Calibrating scene"
      : displayProgress < PREWARM_PROGRESS
        ? "Loading depth"
        : displayProgress < HOLD_PROGRESS
          ? "Locking focus"
          : canReveal
            ? "Entering frame"
            : "Holding focus";

  const tweenProgressTo = useCallback(
    (target: number, duration: number, onComplete?: () => void) => {
      progressTweenRef.current?.kill();
      progressTweenRef.current = gsap.to(progressStateRef.current, {
        value: target,
        duration,
        ease: target >= 100 ? "power2.inOut" : "power2.out",
        onUpdate: () => {
          setDisplayProgress(progressStateRef.current.value);
        },
        onComplete,
      });
    },
    []
  );

  const startExitSequence = useCallback(() => {
    if (completionStartedRef.current) return;
    completionStartedRef.current = true;

    const finalProgressDuration = prefersReducedMotion
      ? REDUCED_MOTION_PROGRESS_DURATION
      : (isMobile ? FINAL_PROGRESS_DURATION_MOBILE : FINAL_PROGRESS_DURATION_DESKTOP);
    const revealHoldDuration = prefersReducedMotion
      ? REDUCED_MOTION_HOLD_DURATION
      : (isMobile ? REVEAL_HOLD_DURATION_MOBILE : REVEAL_HOLD_DURATION_DESKTOP);
    const panelRevealDuration = isMobile ? PANEL_REVEAL_DURATION_MOBILE : PANEL_REVEAL_DURATION_DESKTOP;

    tweenProgressTo(100, finalProgressDuration, () => {
      if (prefersReducedMotion) {
        exitTimelineRef.current = gsap.timeline({
          onComplete: () => {
            onComplete?.();
          },
        });

        exitTimelineRef.current.to(rootRef.current, {
          autoAlpha: 0,
          duration: ROOT_FADE_DURATION,
          ease: "power2.out",
        }, REDUCED_MOTION_HOLD_DURATION);
        return;
      }

      const rootFadeStart = revealHoldDuration + panelRevealDuration - ROOT_FADE_DURATION;

      exitTimelineRef.current = gsap.timeline({
        onComplete: () => {
          onComplete?.();
        },
      });

      exitTimelineRef.current
        .to(contentRef.current, {
          y: -16,
          autoAlpha: 0,
          duration: CONTENT_FADE_DURATION,
          ease: "power2.out",
        }, revealHoldDuration)
        .fromTo(
          flashRef.current,
          { autoAlpha: 0 },
          {
            autoAlpha: 0.18,
            duration: 0.16,
            ease: "power1.out",
          },
          revealHoldDuration + 0.02
        )
        .to(
          flashRef.current,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: "power1.inOut",
          },
          revealHoldDuration + 0.18
        )
        .to(
          leftPanelRef.current,
          {
            xPercent: -104,
            duration: panelRevealDuration,
            ease: "power2.inOut",
          },
          revealHoldDuration + 0.04
        )
        .to(
          rightPanelRef.current,
          {
            xPercent: 104,
            duration: panelRevealDuration,
            ease: "power2.inOut",
          },
          revealHoldDuration + 0.04
        )
        .to(
          rootRef.current,
          {
            autoAlpha: 0,
            duration: ROOT_FADE_DURATION,
            ease: "power2.out",
          },
          rootFadeStart
        );
    });
  }, [isMobile, onComplete, prefersReducedMotion, tweenProgressTo]);

  useEffect(() => {
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleReducedMotion = () => {
      setPrefersReducedMotion(reducedMotionMedia.matches);
    };

    handleResize();
    handleReducedMotion();

    window.addEventListener("resize", handleResize);
    reducedMotionMedia.addEventListener("change", handleReducedMotion);

    return () => {
      window.removeEventListener("resize", handleResize);
      reducedMotionMedia.removeEventListener("change", handleReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    introTweenRef.current = gsap.fromTo(
      contentRef.current,
      { autoAlpha: 0, y: 24, scale: 0.985 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: reduceMotion ? 0.25 : 0.9,
        ease: "power3.out",
      }
    );

    tweenProgressTo(PREWARM_PROGRESS, reduceMotion ? 0.8 : 1.35);
  }, [tweenProgressTo]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
      introTweenRef.current?.kill();
      progressTweenRef.current?.kill();
      exitTimelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (prewarmStartedRef.current || displayProgress < PREWARM_PROGRESS - 0.5) return;

    prewarmStartedRef.current = true;
    window.dispatchEvent(new CustomEvent("loader-exiting"));
    tweenProgressTo(HOLD_PROGRESS, prefersReducedMotion ? 0.45 : 0.9);

    if (!sceneReady) {
      fallbackTimerRef.current = window.setTimeout(() => {
        setFallbackReady(true);
      }, FALLBACK_READY_MS);
    }
  }, [displayProgress, prefersReducedMotion, sceneReady, tweenProgressTo]);

  useEffect(() => {
    if (!sceneReady || fallbackTimerRef.current === null) return;
    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = null;
  }, [sceneReady]);

  useEffect(() => {
    if (!prewarmStartedRef.current || !canReveal || displayProgress < HOLD_PROGRESS - 0.5) return;
    startExitSequence();
  }, [canReveal, displayProgress, startExitSequence]);

  return (
    <div
      ref={rootRef}
      className="loader"
      role="status"
      aria-live="polite"
      aria-label={`${Math.round(displayProgress)} percent loaded`}
    >
      <div ref={leftPanelRef} className="loader-panel loader-panel--left" aria-hidden="true" />
      <div ref={rightPanelRef} className="loader-panel loader-panel--right" aria-hidden="true" />
      <div ref={flashRef} className="loader-flash" aria-hidden="true" />

      <div ref={contentRef} className="loader-content">
        <p className="loader-phase">{phaseLabel}</p>

        <div className="loader-progress-group" aria-hidden="true">
          <div className="loader-progress-number">
            <span className="loader-progress-value">{Math.round(displayProgress)}</span>
            <span className="loader-progress-percent">%</span>
          </div>
          <div className="loader-progress-shell">
            <div className="loader-progress-rail" />
            <div className="loader-progress-seam" />
            <span
              className="loader-progress-half loader-progress-half--left"
              style={{ transform: `translateY(-50%) scaleX(${progressRatio})` }}
            />
            <span
              className="loader-progress-half loader-progress-half--right"
              style={{ transform: `translateY(-50%) scaleX(${progressRatio})` }}
            />
          </div>
        </div>

        <div className="loader-title-group">
          <h1 className="loader-title">Ramkumar&apos;s World of Design</h1>
          <p className="loader-subtitle">comes into focus</p>
        </div>
      </div>
    </div>
  );
}
