'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Story } from '@/types';
import StoryCard from './StoryCard';
import ProgressBars from './ProgressBars';
import TapZones from './TapZones';

const STORY_DURATION_MS = 7000;

interface ArchiveStoryViewerProps {
  stories: Story[];
  date: string;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ArchiveStoryViewer({ stories, date }: ArchiveStoryViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPaused(false);
      elapsedRef.current = 0;
    } else {
      router.back();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPaused(false);
      elapsedRef.current = 0;
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      goToNext();
    }, STORY_DURATION_MS - elapsedRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  // Pause/resume elapsed tracking
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        elapsedRef.current += Date.now() - startTimeRef.current;
      }
    } else {
      elapsedRef.current = 0;
    }
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex]);

  // Swipe down to exit
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    // Only trigger if swipe is more vertical than horizontal and long enough
    if (dy > 80 && dx < 60) {
      router.back();
    }
  };

  const currentStory = stories[currentIndex];

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      style={{ fontFamily: 'var(--font-syne)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop blurred background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: currentStory?.media_type !== 'video'
            ? `url(${currentStory?.media_url})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000',
          filter: 'blur(40px) saturate(1.5) brightness(0.4)',
          transform: 'scale(1.1)',
        }}
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="relative w-full h-full md:w-[420px] md:h-[88vh] md:max-h-[760px] md:rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {currentStory && (
            <StoryCard story={currentStory} isPaused={isPaused} />
          )}

          {/* Top overlay */}
          <div
            className="absolute top-0 left-0 right-0 z-20 pb-8 pt-safe"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
          >
            <div className="px-3 pt-3">
              <ProgressBars
                total={stories.length}
                current={currentIndex}
                duration={STORY_DURATION_MS}
                isPaused={isPaused}
                onComplete={goToNext}
              />
            </div>

            {/* Header row: back arrow + logo + date + close button */}
            <div className="flex items-center gap-3 px-4 pt-3">
              {/* Back button */}
              <button
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 z-40"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', position: 'relative' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>

              {/* Logo */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'var(--color-accent, #e8ff47)',
                  color: '#18181f',
                  fontFamily: 'var(--font-dm-mono)',
                }}
              >
                212
              </div>

              {/* Date + counter */}
              <div className="flex-1">
                <p className="text-white text-sm font-semibold leading-tight">
                  {formatDateLabel(date)}
                </p>
                <p className="text-white/50 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                  {currentIndex + 1} / {stories.length}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 z-40"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  position: 'relative',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <TapZones
            onTapLeft={goToPrev}
            onTapRight={goToNext}
            onHoldStart={() => setIsPaused(true)}
            onHoldEnd={() => setIsPaused(false)}
          />
        </div>
      </div>

      {/* Swipe down hint — fades in on mobile */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden flex flex-col items-center gap-1 opacity-30 pointer-events-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        <p className="text-white text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>swipe down to exit</p>
      </div>
    </div>
  );
}