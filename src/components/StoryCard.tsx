'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Story, getCategoryColor, getCategoryLabel, getWebPUrl } from '@/types';

interface StoryCardProps {
  story: Story;
  isPaused: boolean;
}

export default function StoryCard({ story, isPaused }: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const categoryColor = getCategoryColor(story.category);

  // Use alt_text if available, fall back to caption
  const imageAlt = story.alt_text || story.caption;

  const imageUrl = story.media_url;

  useEffect(() => {
    setImageLoaded(false);
  }, [story.id]);

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
    <div className="absolute inset-0 story-enter">
      {/* Media */}
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
          {!imageLoaded && (
            <div className="absolute inset-0 bg-ink-900 animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, 420px"
            unoptimized
          />
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
        className="absolute left-0 right-0 z-10 px-5 flex flex-col"
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
