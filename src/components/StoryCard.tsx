'use client';

import { useEffect, useRef, useState } from 'react';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';

interface StoryCardProps {
  story: Story;
  isPaused: boolean;
}

export default function StoryCard({ story, isPaused }: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [displaySrc, setDisplaySrc] = useState(story.media_url);
  const [loadingSrc, setLoadingSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const categoryColor = getCategoryColor(story.category);

  useEffect(() => {
    setExpanded(false);
  }, [story.id]);

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

    if (img.complete) {
      onLoad();
    } else {
      img.onload = onLoad;
      img.onerror = onLoad;
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [story.media_url, story.media_type]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused]);

  const hasLongSubtext = story.subtext && story.subtext.length > 100;

  return (
    <div
      className="absolute inset-0"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
      } as React.CSSProperties}
    >
      {/* ── MEDIA ── */}
      {story.media_type === 'video' ? (
        <video
          ref={videoRef}
          src={story.media_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          loop={false}
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
          Only darkens the bottom 40% — image is fully visible above that */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top,',
            '  rgba(0,0,0,0.93) 0%,',
            '  rgba(0,0,0,0.75) 18%,',
            '  rgba(0,0,0,0.40) 32%,',
            '  rgba(0,0,0,0.10) 45%,',
            '  transparent 58%)',
          ].join(''),
        }}
      />

      {/* Subtle top vignette for header legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 22%)',
        }}
      />

      {/* ── TEXT PANEL ── */}
      <div
        className="absolute left-0 right-0 flex flex-col"
        style={{
          /* Sits well above browser chrome on all iPhones */
          bottom: 'calc(env(safe-area-inset-bottom, 20px) + 110px)',
          padding: '0 24px',
        }}
      >
        {/* Category pill */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
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
            }}
          >
            {getCategoryLabel(story.category)}
          </span>
        </div>

        {/* Headline */}
        <p
          className="text-white"
          style={{
            fontSize: 'clamp(22px, 5.5vw, 30px)',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            marginBottom: story.subtext ? '10px' : '14px',
          }}
        >
          {story.caption}
        </p>

        {/* Body text */}
        {story.subtext && (
          <div style={{ marginBottom: '12px' }}>
            <p
              style={{
                fontSize: 'clamp(14px, 3.8vw, 16px)',
                fontWeight: 400,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 999 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              {story.subtext}
            </p>

            {/* Read more */}
            {hasLongSubtext && !expanded && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  marginTop: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.80)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                  display: 'inline-block',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Read more ↓
              </button>
            )}

            {/* Show less */}
            {expanded && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  marginTop: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.80)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                  display: 'inline-block',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Show less ↑
              </button>
            )}
          </div>
        )}

        {/* Tap hint */}
        <p
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.32)',
            fontFamily: 'var(--font-dm-mono)',
            letterSpacing: '0.05em',
          }}
        >
          tap to continue →
        </p>
      </div>
    </div>
  );
}