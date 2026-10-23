'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';

export interface SlideData {
  type: 'default' | 'course' | 'event';
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string | null;
  badge?: string;
}

interface HomeHeroSliderProps {
  slides: SlideData[];
}

export default function HomeHeroSlider({ slides }: HomeHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
      <div className={styles.heroBg} aria-hidden="true">
        <div className={styles.heroBgOrb1} />
        <div className={styles.heroBgOrb2} />
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              style={{
                position: isActive ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'opacity 0.6s ease-in-out, visibility 0.6s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: isActive ? 10 : 1,
              }}
            >
              <div className={styles.heroContent} style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
                
                {slide.badge && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#ffffff',
                    color: 'var(--text-primary)',
                    padding: '0.4rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '1.5rem',
                    border: '1.5px solid var(--gold)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ color: 'var(--gold)', fontSize: '1rem', lineHeight: 1 }}>•</span>
                    {slide.badge.replace(/^[^a-zA-Z0-9]+/, '')}
                  </span>
                )}

                {slide.type === 'default' && (
                  <>
                    <p className={styles.bismillah} lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    <div className={styles.ornamentDivider} aria-hidden="true">
                      <span className={styles.ornamentLine} />
                      <span className={styles.ornamentStar}>✦</span>
                      <span className={styles.ornamentLine} />
                    </div>
                  </>
                )}

                <h1 className={styles.heroTitle} style={{ 
                  fontSize: slide.type !== 'default' ? 'clamp(2.2rem, 5vw, 3.4rem)' : undefined 
                }}>
                  {slide.title}
                </h1>
                
                <p className={styles.heroSubtitle} style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {slide.description}
                </p>

                {slide.type === 'default' && (
                  <div className={styles.hadithQuote}>
                    <span className={styles.quoteIcon}>❝</span>
                    <p><em>&ldquo;Seeking knowledge is an obligation upon every Muslim.&rdquo;</em></p>
                    <span className={styles.hadithSource}>— Sunan Ibn Mājah</span>
                  </div>
                )}

                <div className={styles.ctaGroup} style={{ marginTop: '2rem' }}>
                  <Link href={slide.ctaLink} className={styles.primaryCta}>
                    <span>{slide.ctaText}</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      color: 'var(--bg-dark)',
                      fontSize: '0.8rem',
                      fontWeight: 900
                    }}>→</span>
                  </Link>
                  {slide.type === 'default' && (
                    <Link href="#subjects" className={styles.secondaryCta}>
                      View Subjects ↓
                    </Link>
                  )}
                </div>
              </div>

              {slide.imageUrl && slide.type !== 'default' && (
                <div style={{ marginTop: '3rem', width: '100%', maxWidth: '720px', padding: '0 1rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '380px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xl)',
                    }}
                  />
                </div>
              )}

              {slide.type === 'default' && (
                <div className={styles.heroVisual} aria-hidden="true" style={{ marginTop: '2.5rem' }}>
                  <div className={styles.geometricFrame}>
                    <div className={styles.starOuter}>
                      <svg viewBox="0 0 200 200" className={styles.starSvg}>
                        <polygon points="100,10 118,65 175,65 129,100 147,155 100,120 53,155 71,100 25,65 82,65" fill="none" stroke="rgba(212,168,67,0.5)" strokeWidth="1.5"/>
                        <polygon points="100,30 113,72 157,72 122,97 135,139 100,115 65,139 78,97 43,72 87,72" fill="none" stroke="rgba(212,168,67,0.3)" strokeWidth="1"/>
                        <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(212,168,67,0.35)" strokeWidth="1" />
                        <circle cx="100" cy="100" r="6" fill="rgba(212,168,67,0.7)" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          zIndex: 20,
        }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: idx === currentIndex ? 'var(--gold)' : 'rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
