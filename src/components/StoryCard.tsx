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
  const imageAlt = story.alt_text || story.caption;

  // Reset expanded when story changes
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

  const hasLongSubtext = story.subtext && story.subtext.length > 120;

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
          {/* Current image — stays visible, blurs while next loads */}
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

          {/* Next image fades in when loaded */}
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

      {/* ── GRADIENT OVERLAY ──
          Soft, starts low — image is the hero, text reads clearly */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top,',
            '  rgba(0,0,0,0.92) 0%,',
            '  rgba(0,0,0,0.78) 28%,',
            '  rgba(0,0,0,0.35) 52%,',
            '  rgba(0,0,0,0.08) 72%,',
            '  transparent 100%)',
          ].join(''),
        }}
      />

      {/* ── TEXT PANEL ──
          Sits in the lower-middle: not at the very bottom edge,
          comfortable reading position, clear hierarchy */}
      <div
        className="absolute left-0 right-0 flex flex-col"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 16px) + 100px)',
          padding: '0 24px',
          maxHeight: expanded ? '70%' : '52%',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        {/* Category — small, coloured pill */}
        <div className="mb-3 flex-shrink-0">
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-dm-mono)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: categoryColor,
              background: `${categoryColor}18`,
              border: `1px solid ${categoryColor}35`,
              borderRadius: '999px',
              padding: '4px 12px',
              display: 'inline-block',
            }}
          >
            {getCategoryLabel(story.category)}
          </span>
        </div>

        {/* Headline — most prominent */}
        <p
          className="text-white flex-shrink-0"
          style={{
            fontSize: 'clamp(21px, 5.5vw, 28px)',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            marginBottom: story.subtext ? '10px' : '0',
          }}
        >
          {story.caption}
        </p>

        {/* Body text — readable, not cramped */}
        {story.subtext && (
          <>
            <p
              style={{
                fontSize: 'clamp(14px, 3.8vw, 16px)',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.80)',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 999 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '10px',
                flexShrink: 0,
              } as React.CSSProperties}
            >
              {story.subtext}
            </p>

            {/* Read more — only when text is long */}
            {hasLongSubtext && !expanded && (
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-dm-mono)',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}
              >
                Read more ↓
              </button>
            )}
          </>
        )}

        {/* Tap to continue — very subtle, sits below body */}
        <p
          className="flex-shrink-0"
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.28)',
            fontFamily: 'var(--font-dm-mono)',
            letterSpacing: '0.06em',
            marginTop: '6px',
          }}
        >
          tap to continue →
        </p>
      </div>
    </div>
  );
}