'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';

interface StoryCardProps {
  story: Story;
  isPaused: boolean;
}

export default function StoryCard({ story, isPaused }: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const categoryColor = getCategoryColor(story.category);

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
          loop={false}
        />
      ) : (
        <>
          {/* Placeholder skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-ink-900 animate-pulse" />
          )}
          <Image
            src={story.media_url}
            alt={story.caption}
            fill
            priority
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, 420px"
          />
        </>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 story-gradient-bottom z-10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-10 md:pb-8">
        {/* Category badge */}
        <div className="mb-3">
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
          className="text-white font-semibold leading-snug"
          style={{
            fontSize: 'clamp(18px, 4vw, 22px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {story.caption}
        </p>

        {/* Swipe hint (mobile) */}
        <p
          className="text-white/30 text-xs mt-3 md:hidden"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          tap to continue →
        </p>
      </div>
    </div>
  );
}
