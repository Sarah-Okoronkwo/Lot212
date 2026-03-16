'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AllCaughtUp() {
  const router = useRouter();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-ink-950 overflow-hidden"
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              border: `1px solid rgba(232,255,71,${0.04 - i * 0.005})`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse-soft ${3 + i}s ease infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-sm">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #e8ff47 0%, #c8df00 100%)',
            boxShadow: '0 0 60px rgba(232,255,71,0.3)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="#18181f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-white text-3xl font-bold mb-3">
          You&apos;re all caught up
        </h1>
        <p className="text-ink-400 text-base leading-relaxed mb-10">
          You&apos;ve seen every story from today.
          <br />
          Check back soon for the latest updates{dots}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.refresh()}
            className="w-full py-3 rounded-xl font-semibold text-sm text-ink-950 transition-all active:scale-95"
            style={{ background: 'var(--color-accent)' }}
          >
            Check for new stories
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white/60 border border-white/10 hover:border-white/20 transition-all"
          >
            Restart from beginning
          </button>
        </div>

        <p
          className="text-ink-600 text-xs mt-8"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Stories refresh every 24 hours
        </p>
      </div>
    </div>
  );
}
