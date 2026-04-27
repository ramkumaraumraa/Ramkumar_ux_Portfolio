"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import emailjs from '@emailjs/browser';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
}

const Form = ({ isOpen, onClose }: FormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    assistance: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    setSuccess(false);
    setFormData({ name: '', email: '', organization: '', assistance: '', message: '' });
    setErrors({});
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.assistance.trim()) newErrors.assistance = 'Please let us know how we can help';

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    const emailParams = {
      from_name: formData.name,
      from_email: formData.email,
      organization: formData.organization || 'N/A',
      assistance: formData.assistance,
      message: formData.message,
      to_name: 'RamKumar',
    };

    emailjs
      .send(
        'service_a5tx3mi',
        'template_cko2itt',
        emailParams,
        { publicKey: 'MUZvBPSGwQFoiwINK' }
      )
      .then(() => {
        setSuccess(true);
        setFormData({ name: '', email: '', organization: '', assistance: '', message: '' });
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to send. Please try again or email me directly at ramkumargd01@gmail.com'
        }));
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <>
      <div
        className="form-backdrop"
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 14, 35, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
            position: 'relative',
            animation: 'slideUp 0.4s ease-out',
            backgroundColor: '#000e23',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={handleClose}
            aria-label="Close form"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'none',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background 0.3s ease',
              zIndex: 1
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            ✕
          </button>

          {success ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 255, 180, 0.12)',
                border: '1.5px solid rgba(0, 255, 180, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
              }}>
                ✓
              </div>
              <h5 style={{ marginBottom: '12px' }}>Message Sent!</h5>
              <p className="body-2" style={{ opacity: 0.9, marginBottom: '12px' }}>
                Thank you for trusting me with your project.
              </p>
              <p className="body-2" style={{ opacity: 0.65, maxWidth: '460px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                I'll personally review your message and reach out to you within 1–3 days.
                Looking forward to creating something great together!
              </p>
              <button
                onClick={handleClose}
                className="card-button sub-header-3"
                style={{ cursor: 'none' }}
              >
                Close
                <span></span><span></span><span></span><span></span><span></span>
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <h5 style={{ marginBottom: '8px', textAlign: 'center' }}>
                Let's Create Something Great Together!
              </h5>
              <p className="body-2" style={{ textAlign: 'center', marginBottom: '32px', opacity: 0.9 }}>
                Share your project details and I'll get back to you within 1–3 days
              </p>

              <form onSubmit={sendEmail} className="contact-form">
                <div className="input-row">
                  <div className="input-group">
                    <label className="sub-header-3">
                      Your Name <span style={{ color: '#ff6666' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      style={{ borderColor: errors.name ? '#ff6666' : undefined }}
                    />
                    {errors.name && (
                      <span id="name-error" className="caption-text" style={{ color: '#ff6666', marginTop: '4px', display: 'block' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="sub-header-3">
                      Best Email to Reach You <span style={{ color: '#ff6666' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      style={{ borderColor: errors.email ? '#ff6666' : undefined }}
                    />
                    {errors.email && (
                      <span id="email-error" className="caption-text" style={{ color: '#ff6666', marginTop: '4px', display: 'block' }}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label className="sub-header-3">Organization / Company (optional)</label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Your company or organization"
                      value={formData.organization}
                      onChange={handleChange}
                      autoComplete="organization"
                    />
                  </div>

                  <div className="input-group">
                    <label className="sub-header-3">
                      What can I assist you with? <span style={{ color: '#ff6666' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="assistance"
                      placeholder="e.g., Web Design, SaaS Product, Mobile App, Brand Strategy"
                      value={formData.assistance}
                      onChange={handleChange}
                      aria-describedby={errors.assistance ? 'assistance-error' : undefined}
                      style={{ borderColor: errors.assistance ? '#ff6666' : undefined }}
                    />
                    {errors.assistance && (
                      <span id="assistance-error" className="caption-text" style={{ color: '#ff6666', marginTop: '4px', display: 'block' }}>
                        {errors.assistance}
                      </span>
                    )}
                  </div>
                </div>

                <div className="input-group full-width">
                  <label className="sub-header-3">
                    What's on your mind? <span style={{ color: '#ff6666' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    placeholder="Share any details..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    style={{
                      borderColor: errors.message ? '#ff6666' : undefined,
                      minHeight: '120px'
                    }}
                  />
                  {errors.message && (
                    <span id="message-error" className="caption-text" style={{ color: '#ff6666', marginTop: '4px', display: 'block' }}>
                      {errors.message}
                    </span>
                  )}
                </div>

                {errors.submit && (
                  <p className="caption-text" style={{ color: '#ff6666', textAlign: 'center', marginTop: '-8px' }}>
                    {errors.submit}
                  </p>
                )}

                <div className="input-row align-end">
                  <p className="response-time caption-text" style={{ opacity: 0.8 }}>
                    📧 Response back time: 1–3 days
                  </p>
                  <button
                    type="submit"
                    className="card-button sub-header-3"
                    disabled={loading}
                    style={{
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'none'
                    }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    <span></span><span></span><span></span><span></span><span></span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          max-width: 100%;
          gap: 24px;
          margin-top: 24px;
        }

        .input-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .input-row.align-end {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .input-group.full-width {
          flex-basis: 100%;
        }

        .contact-form label {
          color: #ffffff;
          margin-bottom: 4px;
          font-family: 'Source Sans 3', sans-serif;
          font-size: var(--font-size-sub-header-3);
          line-height: var(--line-height-normal);
          font-weight: 600;
        }

        .contact-form input,
        .contact-form textarea {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #f1f1f1;
          background-color: rgba(29, 24, 38, 0.2);
          backdrop-filter: blur(1px);
          color: #ffffff;
          outline: none;
          font-family: 'Source Sans 3', sans-serif;
          font-size: var(--font-size-body-2);
          line-height: var(--line-height-relaxed);
          transition: all 0.3s ease;
          cursor: text !important;
        }

        .contact-form input::placeholder,
        .contact-form textarea::placeholder {
          color: #b3c4d5;
          opacity: 0.7;
        }

        .contact-form textarea {
          resize: none;
          cursor: text !important;
        }

        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: 2px solid #00ffff;
          outline-offset: 2px;
          border-color: #00ffff;
          background-color: rgba(29, 24, 38, 0.4);
        }

        .response-time {
          color: #efefef;
          font-family: 'Source Sans 3', sans-serif;
          font-size: var(--font-size-footnote);
          line-height: var(--line-height-relaxed);
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .contact-form {
            width: 100%;
            max-width: 100%;
            padding: 0;
          }

          .input-row {
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }

          .input-group {
            width: 100%;
          }

          .contact-form input,
          .contact-form textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 8px;
            border-radius: 8px;
          }

          .contact-form label {
            font-size: 16px;
            margin-bottom: 4px;
            text-align: left;
            display: inline-block;
            width: 100%;
          }

          .response-time {
            font-size: 12px;
            margin-top: 8px;
            text-align: left;
          }

          .card-button {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
          }

          .input-row.align-end {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .contact-form {
            padding: 0;
          }

          .input-row {
            gap: 12px;
          }

          .contact-form input,
          .contact-form textarea {
            font-size: 14px;
            padding: 10px;
          }

          .contact-form label {
            font-size: 14px;
          }

          .card-button {
            font-size: 14px;
            padding: 8px;
          }
        }
      `}} />
    </>,
    document.body
  );
};

export default Form;
