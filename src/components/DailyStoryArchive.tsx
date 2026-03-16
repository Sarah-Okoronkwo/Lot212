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
      className="min-h-screen w-full overflow-y-auto"
      style={{
        background: '#0e0e14',
        fontFamily: 'var(--font-syne)',
      }}
    >
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 60% 0%, rgba(180,100,30,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 10% 60%, rgba(20,40,80,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 pb-16">
        {/* Header */}
        <div className="pt-12 pb-8">
          <h1
            className="text-white font-bold mb-1"
            style={{ fontSize: 'clamp(26px, 6vw, 32px)' }}
          >
            Recent Stories
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Revisit the stories from the past two weeks.
          </p>
        </div>

        {/* Story groups */}
        {groups.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              No stories yet.
            </p>
            <p
              className="text-xs mt-2"
              style={{
                color: 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm-mono)',
              }}
            >
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
      </div>
    </div>
  );
}