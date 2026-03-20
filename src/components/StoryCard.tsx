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
  const categoryColor = getCategoryColor(story.category);
  const imageAlt = story.alt_text || story.caption;

  useEffect(() => {
    if (story.media_type === 'video') {
      setDisplaySrc(story.media_url);
      setIsLoading(false);
      return;
    }

    // If same image, do nothing
    if (story.media_url === displaySrc) return;

    // Start loading new image
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

  return (
    <div className="absolute inset-0">
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
          {/* Current image — always visible */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${displaySrc})`,
              // Blur current image when loading next one
              filter: isLoading ? 'blur(12px) brightness(0.7)' : 'none',
              transform: isLoading ? 'scale(1.05)' : 'scale(1)',
              transition: 'filter 0.2s ease, transform 0.2s ease',
            }}
          />


          {/* Next image — fades in when loaded */}
          {!isLoading && loadingSrc === null && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${displaySrc})`,
                animation: 'fadeIn 0.3s ease forwards',
              }}
            />
          )}
        </>
      )}

      {/* Bottom gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: story.subtext
            ? 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.3) 70%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div
        className="absolute left-0 right-0 z-20 px-5 flex flex-col"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 150px)',
          maxHeight: '55%',
        }}
      >
        {/* Category badge */}
        <div className="mb-2 flex-shrink-0">
          <span
            className="category-badge"
            style={{
              backgroundColor: `${categoryColor}28`,
              color: categoryColor,
              border: `1px solid ${categoryColor}40`,
            }}
          >
            {getCategoryLabel(story.category)}
          </span>
        </div>

        {/* Caption */}
        <p
          className="text-white font-semibold leading-snug flex-shrink-0"
          style={{
            fontSize: 'clamp(20px, 5vw, 26px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        >
          {story.caption}
        </p>

        {/* Subtext */}
        {story.subtext && (
          <p
            className="text-white/75 leading-relaxed mt-2 overflow-hidden"
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {story.subtext}
          </p>
        )}

        {/* Tap hint */}
        <p
          className="text-white/30 text-xs mt-2 md:hidden flex-shrink-0"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          tap to continue →
        </p>
      </div>
    </div>
  );
}