'use client';

import { useEffect, useRef, useState } from 'react';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';

interface StoryCardProps {
  story: Story;
  isPaused: boolean;
  isFirst: boolean;
}

export default function StoryCard({ story, isPaused, isFirst }: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [displaySrc, setDisplaySrc] = useState(story.media_url);
  const [loadingSrc, setLoadingSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const categoryColor = getCategoryColor(story.category);

  useEffect(() => {
    setExpanded(false);
    setIsTruncated(false);
  }, [story.id]);

  useEffect(() => {
    if (!subtextRef.current || expanded) return;
    const el = subtextRef.current;
    setIsTruncated(el.scrollHeight > el.clientHeight + 2);
  }, [story.subtext, expanded]);

  useEffect(() => {
    if (story.media_type === 'video') {
      setDisplaySrc(story.media_url);
      setIsLoading(false);
      return;
    }
    if (story.media_url === displaySrc) return;
    setLoadingSrc(story.media_url);
    setIsLoading(true);
    const img = new window.Image();
    img.src = story.media_url;
    const onLoad = () => {
      setDisplaySrc(story.media_url);
      setLoadingSrc(null);
      setIsLoading(false);
    };
    if (img.complete) { onLoad(); }
    else { img.onload = onLoad; img.onerror = onLoad; }
    return () => { img.onload = null; img.onerror = null; };
  }, [story.media_url, story.media_type]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) { videoRef.current.pause(); }
      else { videoRef.current.play().catch(() => {}); }
    }
  }, [isPaused]);

  const handleReadMore = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(true);
    setIsTruncated(false);
  };

  const handleShowLess = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(false);
  };

  const hasText = !!(story.caption || story.subtext);
  const showCaption = isFirst || !!story.caption;

  // Shared text shadow — acts like a subtitle outline, readable on any bg
  const headlineShadow = [
    '0 0 4px rgba(0,0,0,1)',
    '-1px -1px 0 rgba(0,0,0,0.9)',
    '1px -1px 0 rgba(0,0,0,0.9)',
    '-1px  1px 0 rgba(0,0,0,0.9)',
    '1px  1px 0 rgba(0,0,0,0.9)',
    '0 2px 20px rgba(0,0,0,0.95)',
  ].join(', ');

  const bodyShadow = [
    '0 0 4px rgba(0,0,0,1)',
    '-1px -1px 0 rgba(0,0,0,0.8)',
    '1px -1px 0 rgba(0,0,0,0.8)',
    '-1px  1px 0 rgba(0,0,0,0.8)',
    '1px  1px 0 rgba(0,0,0,0.8)',
    '0 2px 12px rgba(0,0,0,0.95)',
  ].join(', ');

  return (
    <div
      className="absolute inset-0"
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' } as React.CSSProperties}
    >
      {/* ── MEDIA ── */}
      {story.media_type === 'video' ? (
        <video
          ref={videoRef}
          src={story.media_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted playsInline preload="auto" loop={false}
          style={{ background: '#000' }}
        />
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              backgroundImage: `url(${displaySrc})`,
              filter: isLoading ? 'blur(10px) brightness(0.75)' : 'none',
              transform: isLoading ? 'scale(1.04)' : 'scale(1)',
              transition: 'filter 0.25s ease, transform 0.25s ease',
              WebkitTouchCallout: 'none',
              userSelect: 'none',
            } as React.CSSProperties}
          />
          {!isLoading && loadingSrc === null && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              onContextMenu={(e) => e.preventDefault()}
              style={{
                backgroundImage: `url(${displaySrc})`,
                animation: 'fadeIn 0.3s ease forwards',
                WebkitTouchCallout: 'none',
                userSelect: 'none',
              } as React.CSSProperties}
            />
          )}
        </>
      )}

      {/* ── GRADIENT ──
          Light — just enough to anchor text.
          Image remains the hero throughout. */}
      {hasText ? (
        <div
          className="absolute inset-0"
          style={{
            background: [
              'linear-gradient(to top,',
              '  rgba(0,0,0,0.65) 0%,',
              '  rgba(0,0,0,0.38) 18%,',
              '  rgba(0,0,0,0.10) 35%,',
              '  transparent 50%)',
            ].join(''),
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 20%)' }}
        />
      )}

      {/* Top vignette for header readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 22%)' }}
      />

      {/* ── TEXT PANEL ── */}
      {hasText && (
        <div
          className="absolute left-0 right-0 flex flex-col"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 20px) + 110px)',
            padding: '0 24px',
          }}
        >
          {/* Category pill — first slide only */}
          {isFirst && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-dm-mono)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: categoryColor,
                background: `${categoryColor}20`,
                border: `1px solid ${categoryColor}45`,
                borderRadius: '999px',
                padding: '4px 12px',
                display: 'inline-block',
                textShadow: 'none',
              }}>
                {getCategoryLabel(story.category)}
              </span>
            </div>
          )}

          {/* Headline */}
          {showCaption && story.caption && (
            <p
              className="text-white"
              style={{
                fontSize: 'clamp(22px, 5.5vw, 30px)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                textShadow: headlineShadow,
                marginBottom: story.subtext ? '10px' : '14px',
              }}
            >
              {story.caption}
            </p>
          )}

          {/* Body text */}
          {story.subtext && (
            <div style={{ marginBottom: '12px' }}>
              <p
                ref={subtextRef}
                style={{
                  fontSize: 'clamp(14px, 3.8vw, 16px)',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.92)',
                  textShadow: bodyShadow,
                  display: '-webkit-box',
                  WebkitLineClamp: expanded ? 999 : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } as React.CSSProperties}
              >
                {story.subtext}
              </p>

              {isTruncated && !expanded && (
                <button
                  onClick={handleReadMore}
                  onTouchEnd={handleReadMore}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '999px',
                    padding: '5px 16px',
                    marginTop: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.90)',
                    fontFamily: 'var(--font-dm-mono)',
                    letterSpacing: '0.04em',
                    display: 'inline-block',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 50,
                    position: 'relative',
                  } as React.CSSProperties}
                >
                  Read more ↓
                </button>
              )}

              {expanded && (
                <button
                  onClick={handleShowLess}
                  onTouchEnd={handleShowLess}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '999px',
                    padding: '5px 16px',
                    marginTop: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.90)',
                    fontFamily: 'var(--font-dm-mono)',
                    letterSpacing: '0.04em',
                    display: 'inline-block',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 50,
                    position: 'relative',
                  } as React.CSSProperties}
                >
                  Show less ↑
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAP ARROWS ── */}
      <div
        className="absolute left-4 pointer-events-none"
        style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 25, opacity: 0.45 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" fill="rgba(0,0,0,0.2)" />
          <path d="M14 8l-4 4 4 4" />
        </svg>
      </div>

      <div
        className="absolute right-4 pointer-events-none"
        style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 25, opacity: 0.45 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" fill="rgba(0,0,0,0.2)" />
          <path d="M10 8l4 4-4 4" />
        </svg>
      </div>
    </div>
  );
}