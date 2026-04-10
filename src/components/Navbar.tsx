"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import Form from "./Form";

const LOGO_SRC = "/assets/imgs/Logo.svg";
const PHONE_ICON_SRC = "/assets/imgs/icons/Phone.svg";
const EMAIL_ICON_SRC = "/assets/imgs/icons/Email.svg";
const COPY_ICON_SRC = "/assets/imgs/icons/file_copy.svg";
const RESUME_SRC = "/assets/imgs/About/Ramkumarux_Resume.pdf";

const PRIMARY_NAV_ITEMS = [
  { id: "works", label: "Works", icon: WorksIcon },
  { id: "about", label: "About", icon: AboutIcon },
  { id: "process", label: "Process", icon: ProcessIcon },
] as const;

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

function Navbar({ activeTab = "home", setActiveTab = () => {} }: NavbarProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const dockRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback((animated = true) => {
    const dropdownMenu = dropdownMenuRef.current;

    if (!animated || !dropdownMenu) {
      setDropdownVisible(false);
      return;
    }

    gsap.to(dropdownMenu, {
      autoAlpha: 0,
      y: 18,
      scale: 0.96,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setDropdownVisible(false),
    });
  }, []);

  useEffect(() => {
    if (!frameRef.current) return;

    void gsap.fromTo(
      frameRef.current,
      { y: 72, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out", delay: 0.35 }
    );
  }, []);

  useEffect(() => {
    if (!contactButtonRef.current) return;

    const tween = gsap.to(contactButtonRef.current, {
      "--gradient-angle": "360deg",
      duration: 5.5,
      ease: "none",
      repeat: -1,
    } as gsap.TweenVars);

    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!dropdownVisible || !dropdownMenuRef.current) return;

    gsap.fromTo(
      dropdownMenuRef.current,
      { autoAlpha: 0, y: 18, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power2.out" }
    );
  }, [dropdownVisible]);

  useEffect(() => {
    if (!dropdownVisible) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current?.contains(event.target as Node)) return;
      closeDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDropdown, dropdownVisible]);

  const showToast = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);

    gsap.fromTo(
      toast,
      { y: 24, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(toast, {
            y: 18,
            autoAlpha: 0,
            duration: 0.3,
            delay: 1.8,
            ease: "power2.in",
            onComplete: () => toast.remove(),
          });
        },
      }
    );
  };

  const copyToClipboard = async (
    text: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      const copyIcon = event.currentTarget.querySelector("[data-copy-icon]");
      if (copyIcon) {
        gsap.fromTo(
          copyIcon,
          { scale: 1 },
          { scale: 1.18, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.out" }
        );
      }

      showToast(`${text} copied to clipboard`);
    } catch {
      showToast("Copy failed. Please try again.");
    }
  };

  const handleContactClick = () => {
    if (dropdownVisible) {
      closeDropdown();
      return;
    }

    setDropdownVisible(true);
  };

  const openContactForm = () => {
    setIsFormOpen(true);
    closeDropdown(false);
  };

  const downloadResume = () => {
    window.open(RESUME_SRC, "_blank", "noopener,noreferrer");
    closeDropdown(false);
  };

  const isContactActive = activeTab === "footer" || dropdownVisible;

  return (
    <>
      <nav ref={dockRef} className="site-dock" aria-label="Primary">
        <div ref={frameRef} className="site-dock__frame">
          <div className="site-dock__edge site-dock__edge--start">
            <button
              type="button"
              className={`site-dock__brand ${activeTab === "home" ? "is-active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              <span className="site-dock__brand-mark" aria-hidden="true">
                <Image src={LOGO_SRC} alt="" width={28} height={28} />
              </span>
              <span className="site-dock__brand-wordmark">Ramkumar</span>
              <span className="site-dock__brand-mobile-label">Home</span>
            </button>
          </div>

          <div className="site-dock__center">
            <div className="site-dock__nav">
              {PRIMARY_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`site-dock__item ${activeTab === id ? "is-active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <span className="site-dock__item-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="site-dock__item-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="site-dock__edge site-dock__edge--end">
            <div ref={dropdownRef} className="site-dock__contact">
              <button
                ref={contactButtonRef}
                type="button"
                className={`site-dock__item site-dock__item--contact ${isContactActive ? "is-active" : ""}`}
                onClick={isMobile ? () => setActiveTab("footer") : handleContactClick}
                aria-expanded={isMobile ? undefined : dropdownVisible}
                aria-haspopup={isMobile ? undefined : "dialog"}
              >
                <span className="site-dock__item-icon" aria-hidden="true">
                  <ContactIcon />
                </span>
                <span className="site-dock__item-label">Contact</span>
                <span className={`site-dock__chevron ${dropdownVisible ? "is-open" : ""}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {dropdownVisible && (
                <div
                  ref={dropdownMenuRef}
                  className="site-dock__dropdown body-2"
                  role="dialog"
                  aria-label="Contact options"
                >
                  <ul className="site-dock__dropdown-list">
                    <li className="site-dock__contact-row">
                      <p>
                        <Image src={EMAIL_ICON_SRC} alt="" width={18} height={18} />
                        <span>ramkumargd01@gmail.com</span>
                      </p>
                      <button
                        type="button"
                        onClick={(event) =>
                          copyToClipboard("ramkumargd01@gmail.com", event)
                        }
                        className="site-dock__copy-button"
                        aria-label="Copy email"
                      >
                        <Image
                          src={COPY_ICON_SRC}
                          alt=""
                          width={16}
                          height={16}
                          data-copy-icon
                        />
                      </button>
                    </li>

                    <li className="site-dock__contact-row">
                      <p>
                        <Image src={PHONE_ICON_SRC} alt="" width={18} height={18} />
                        <span>+91 9176750625</span>
                      </p>
                      <button
                        type="button"
                        onClick={(event) => copyToClipboard("+91 9176750625", event)}
                        className="site-dock__copy-button"
                        aria-label="Copy phone"
                      >
                        <Image
                          src={COPY_ICON_SRC}
                          alt=""
                          width={16}
                          height={16}
                          data-copy-icon
                        />
                      </button>
                    </li>

                    <li className="site-dock__dropdown-separator" aria-hidden="true" />

                    <li>
                      <button
                        type="button"
                        onClick={openContactForm}
                        className="site-dock__dropdown-button"
                      >
                        <span>Open Contact Form</span>
                        <span className="site-dock__dropdown-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={downloadResume}
                        className="site-dock__dropdown-button"
                      >
                        <span>Download Resume</span>
                        <span className="site-dock__dropdown-arrow" aria-hidden="true">
                          ↓
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Form isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}

function WorksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function ProcessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h5" />
      <path d="M14 7h5" />
      <path d="M12 7v10" />
      <path d="M7.5 17h9" />
      <circle cx="12" cy="17" r="2.5" />
      <circle cx="12" cy="7" r="2.5" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m6 8 6 4 6-4" />
    </svg>
  );
}

export default Navbar;
