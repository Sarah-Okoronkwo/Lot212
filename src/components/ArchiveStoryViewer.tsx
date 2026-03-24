'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Story } from '@/types';
import StoryCard from './StoryCard';
import ProgressBars from './ProgressBars';
import TapZones from './TapZones';

const VIDEO_DURATION_MS = 7000;

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
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);

  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.media_type === 'video';

  const handleExit = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPaused(false);
    } else {
      handleExit();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPaused(false);
    }
  };

  // Auto-advance ONLY for videos
  useEffect(() => {
    if (!isVideo || isPaused) return;
    timerRef.current = setTimeout(() => { goToNext(); }, VIDEO_DURATION_MS);
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [currentIndex, isPaused, isVideo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') handleExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex]);

  // Swipe down detection on the outer wrapper
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    const dt = Date.now() - touchStartTime.current;
    // Downward swipe: more vertical than horizontal, fast enough
    if (dy > 60 && dx < 80 && dt < 500) {
      handleExit();
    }
  };

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
          backgroundImage: currentStory?.media_type !== 'video' ? `url(${currentStory?.media_url})` : 'none',
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
            <StoryCard
              story={currentStory}
              isPaused={isPaused}
              isFirst={currentIndex === 0}
            />
          )}

          {/* Top overlay — sits above TapZones (z-20 > z-30 won't work, so we use pointer-events) */}
          <div
            className="absolute top-0 left-0 right-0 z-40 pb-8 pt-safe"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)' }}
          >
            <div className="px-3 pt-3">
              <ProgressBars
                total={stories.length}
                current={currentIndex}
                duration={VIDEO_DURATION_MS}
                isPaused={isPaused}
                isWaitingForTap={!isVideo}
                onComplete={goToNext}
              />
            </div>

            {/* Header row */}
            <div className="flex items-center gap-3 px-4 pt-3">
              {/* Back button */}
              <button
                onPointerDown={(e) => { e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); handleExit(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  position: 'relative',
                  zIndex: 60,
                  touchAction: 'manipulation',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>

              {/* Logo */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--color-accent, #e8ff47)', color: '#18181f', fontFamily: 'var(--font-dm-mono)' }}
              >
                212
              </div>

              {/* Date + counter */}
              <div className="flex-1">
                <p className="text-white text-sm font-semibold leading-tight">{formatDateLabel(date)}</p>
                <p className="text-white/50 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                  {currentIndex + 1} / {stories.length}
                </p>
              </div>

              {/* Close button */}
              <button
                onPointerDown={(e) => { e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); handleExit(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  position: 'relative',
                  zIndex: 60,
                  touchAction: 'manipulation',
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

      {/* Swipe down hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden flex flex-col items-center gap-1 opacity-30 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        <p className="text-white text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>swipe down to exit</p>
      </div>
    </div>
  );
}