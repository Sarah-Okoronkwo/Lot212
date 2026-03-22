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
          Light vignette at top, stronger only at the bottom third
          so the image stays the hero */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top,',
            '  rgba(0,0,0,0.88) 0%,',
            '  rgba(0,0,0,0.65) 22%,',
            '  rgba(0,0,0,0.20) 45%,',
            '  rgba(0,0,0,0.04) 65%,',
            '  transparent 100%)',
          ].join(''),
        }}
      />

      {/* Subtle top vignette so header stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%)',
        }}
      />

      {/* ── TEXT PANEL ──
          Positioned in the lower portion, not at the very edge */}
      <div
        className="absolute left-0 right-0 flex flex-col"
        style={{
          bottom: expanded
            ? 'calc(env(safe-area-inset-bottom, 16px) + 60px)'
            : 'calc(env(safe-area-inset-bottom, 16px) + 80px)',
          padding: '0 22px',
          transition: 'bottom 0.3s ease',
        }}
      >
        {/* Category pill */}
        <div style={{ marginBottom: '10px' }}>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-dm-mono)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: categoryColor,
              background: `${categoryColor}18`,
              border: `1px solid ${categoryColor}40`,
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
            textShadow: '0 1px 10px rgba(0,0,0,0.5)',
            marginBottom: story.subtext ? '10px' : '12px',
          }}
        >
          {story.caption}
        </p>

        {/* Body text */}
        {story.subtext && (
          <div style={{ marginBottom: '10px' }}>
            <p
              style={{
                fontSize: 'clamp(14px, 3.8vw, 16px)',
                fontWeight: 400,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.82)',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 999 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              } as React.CSSProperties}
            >
              {story.subtext}
            </p>

            {/* Read more button */}
            {hasLongSubtext && !expanded && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 0 0 0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                  display: 'block',
                }}
              >
                Read more ↓
              </button>
            )}

            {/* Collapse button */}
            {expanded && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 0 0 0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                  display: 'block',
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
            color: 'rgba(255,255,255,0.30)',
            fontFamily: 'var(--font-dm-mono)',
            letterSpacing: '0.05em',
            marginTop: '2px',
          }}
        >
          tap to continue →
        </p>
      </div>
    </div>
  );
}