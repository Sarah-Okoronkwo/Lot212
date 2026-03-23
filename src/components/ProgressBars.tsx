'use client';

interface ProgressBarsProps {
  total: number;
  current: number;
  duration: number;
  isPaused: boolean;
  isWaitingForTap: boolean;
  onComplete: () => void;
}

export default function ProgressBars({
  total,
  current,
  isPaused,
  isWaitingForTap,
}: ProgressBarsProps) {
  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="flex-1 h-[3px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          {index < current ? (
            // Completed segment — fully filled
            <div className="w-full h-full bg-white rounded-full" />
          ) : index === current ? (
            // Active segment — filled only when not waiting for tap
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: isWaitingForTap || isPaused ? '0%' : '0%',
                // No animation — stays at 0% until user taps
                // When they tap, this segment completes instantly
                transition: 'none',
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
