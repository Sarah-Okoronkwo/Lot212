'use client';

import { Story } from '@/types';
import DailyStoryCard from './DailyStoryCard';

interface DayGroup {
  date: string;
  stories: Story[];
}

interface DailyStoryArchiveProps {
  groups: DayGroup[];
}

export default function DailyStoryArchive({ groups }: DailyStoryArchiveProps) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: 'var(--color-bg, #18181f)',
        fontFamily: 'var(--font-syne)',
      }}
    >
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #e8ff47 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pb-12">
        {/* Header */}
        <div className="pt-14 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'var(--color-accent, #e8ff47)',
                color: '#18181f',
                fontFamily: 'var(--font-dm-mono)',
              }}
            >
              212
            </div>
            <span className="text-white font-bold text-lg">Lot 212</span>
          </div>
          <h1 className="text-white font-bold mt-4" style={{ fontSize: 'clamp(22px, 5vw, 28px)' }}>
            Story Archive
          </h1>
          <p className="text-ink-500 text-sm mt-1" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {groups.length} day{groups.length !== 1 ? 's' : ''} of stories
          </p>
        </div>

        {/* Story groups */}
        {groups.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(35,35,45,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-ink-400 text-sm">No stories yet.</p>
            <p className="text-ink-600 text-xs mt-2" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <DailyStoryCard
                key={group.date}
                date={group.date}
                stories={group.stories}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <p
          className="text-center text-ink-700 text-xs mt-10"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Lot 212 · Stories expire after 24 hours
        </p>
      </div>
    </div>
  );
}
