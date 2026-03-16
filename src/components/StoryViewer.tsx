'use client';

import { useEffect, useRef } from 'react';
import { Story } from '@/types';
import { useStoryStore } from '@/store/storyStore';
import StoryCard from './StoryCard';
import ProgressBars from './ProgressBars';
import TapZones from './TapZones';
import AllCaughtUp from './AllCaughtUp';

const STORY_DURATION_MS = 7000;

interface StoryViewerProps {
  initialStories: Story[];
}

export default function StoryViewer({ initialStories }: StoryViewerProps) {
  const {
    stories,
    currentIndex,
    isPaused,
    isFinished,
    setStories,
    goToNext,
    goToPrev,
    pause,
    resume,
  } = useStoryStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    setStories(initialStories);
  }, [initialStories, setStories]);

  useEffect(() => {
    if (isFinished || isPaused || stories.length === 0) return;

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      goToNext();
    }, STORY_DURATION_MS - elapsedRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      elapsedRef.current = 0;
    };
  }, [currentIndex, isPaused, isFinished, stories.length, goToNext]);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goToNext, goToPrev]);

  if (isFinished) return <AllCaughtUp />;
  if (!stories || stories.length === 0) return <AllCaughtUp />;

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      {/* Desktop blurred background */}
      <div
        className="absolute inset-0 hidden md:block desktop-blur-bg"
        style={{
          backgroundImage: currentStory.media_type !== 'video'
            ? `url(${currentStory.media_url})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000',
        }}
      />

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="relative w-full h-full md:w-[420px] md:h-[88vh] md:max-h-[760px] md:rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          <StoryCard story={currentStory} isPaused={isPaused} />

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 story-gradient-top pb-8 pt-safe">
            <div className="px-3 pt-3">
              <ProgressBars
                total={stories.length}
                current={currentIndex}
                duration={STORY_DURATION_MS}
                isPaused={isPaused}
                onComplete={goToNext}
              />
            </div>

            {/* Site header */}
            <div className="flex items-center gap-3 px-4 pt-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'var(--color-accent)',
                  color: '#18181f',
                  fontFamily: 'var(--font-dm-mono)',
                }}
              >
                212
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Lot 212</p>
                <p className="text-white/50 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                  {new Date(currentStory.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <TapZones
            onTapLeft={goToPrev}
            onTapRight={goToNext}
            onHoldStart={pause}
            onHoldEnd={resume}
          />
        </div>
      </div>

      <div
        className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {currentIndex + 1} / {stories.length}
      </div>
    </div>
  );
}