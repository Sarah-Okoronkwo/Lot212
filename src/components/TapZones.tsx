'use client';

import { useRef, useCallback } from 'react';

interface TapZonesProps {
  onTapLeft: () => void;
  onTapRight: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

const HOLD_THRESHOLD_MS = 200;

export default function TapZones({
  onTapLeft,
  onTapRight,
  onHoldStart,
  onHoldEnd,
}: TapZonesProps) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const handlePointerDown = useCallback(
    (side: 'left' | 'right') => (e: React.PointerEvent) => {
      touchStartXRef.current = e.clientX;
      touchStartYRef.current = e.clientY;
      isHoldingRef.current = false;

      holdTimerRef.current = setTimeout(() => {
        isHoldingRef.current = true;
        onHoldStart();
      }, HOLD_THRESHOLD_MS);
    },
    [onHoldStart]
  );

  const handlePointerUp = useCallback(
    (side: 'left' | 'right') => (e: React.PointerEvent) => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      if (isHoldingRef.current) {
        isHoldingRef.current = false;
        onHoldEnd();
        return;
      }

      // Check for swipe
      const dx = e.clientX - touchStartXRef.current;
      const dy = e.clientY - touchStartYRef.current;

      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          onTapLeft();
        } else {
          onTapRight();
        }
        return;
      }

      // Regular tap
      if (side === 'left') {
        onTapLeft();
      } else {
        onTapRight();
      }
    },
    [onTapLeft, onTapRight, onHoldEnd]
  );

  const handlePointerLeave = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      onHoldEnd();
    }
  }, [onHoldEnd]);

  return (
    <div className="absolute inset-0 z-30 flex" style={{ pointerEvents: 'none' }}>
      {/* Left zone */}
      <div
        className="w-1/3 h-full cursor-pointer"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={handlePointerDown('left')}
        onPointerUp={handlePointerUp('left')}
        onPointerLeave={handlePointerLeave}
      />

      {/* Middle zone — hold only */}
      <div
        className="flex-1 h-full"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={handlePointerDown('right')}
        onPointerUp={handlePointerUp('right')}
        onPointerLeave={handlePointerLeave}
      />

      {/* Right zone */}
      <div
        className="w-1/3 h-full cursor-pointer"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={handlePointerDown('right')}
        onPointerUp={handlePointerUp('right')}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
}
