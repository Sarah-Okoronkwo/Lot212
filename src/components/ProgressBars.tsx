'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ProgressBarsProps {
  total: number;
  current: number;
  duration: number;
  isPaused: boolean;
  onComplete: () => void;
}

export default function ProgressBars({
  total,
  current,
  duration,
  isPaused,
  onComplete,
}: ProgressBarsProps) {
  const animationRef = useRef<Animation | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  const startAnimation = useCallback(() => {
    if (!barRef.current) return;

    const remaining = duration - elapsedRef.current;

    animationRef.current = barRef.current.animate(
      [{ width: `${(elapsedRef.current / duration) * 100}%` }, { width: '100%' }],
      {
        duration: remaining,
        easing: 'linear',
        fill: 'forwards',
      }
    );

    animationRef.current.onfinish = () => {
      elapsedRef.current = 0;
      onComplete();
    };

    startTimeRef.current = Date.now();
  }, [duration, onComplete]);

  useEffect(() => {
    elapsedRef.current = 0;
    startAnimation();

    return () => {
      animationRef.current?.cancel();
    };
  }, [current, startAnimation]);

  useEffect(() => {
    if (!animationRef.current) return;

    if (isPaused) {
      elapsedRef.current += startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      animationRef.current.pause();
    } else {
      animationRef.current.play();
      startTimeRef.current = Date.now();
    }
  }, [isPaused]);

  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="flex-1 h-[3px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          {index < current ? (
            // Completed segment
            <div className="w-full h-full bg-white rounded-full" />
          ) : index === current ? (
            // Active segment
            <div
              ref={index === current ? barRef : null}
              className="h-full bg-white rounded-full"
              style={{ width: '0%' }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
