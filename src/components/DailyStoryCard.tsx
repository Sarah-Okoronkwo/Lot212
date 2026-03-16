'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';

interface DailyStoryCardProps {
  date: string;
  stories: Story[];
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

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DailyStoryCard({ date, stories }: DailyStoryCardProps) {
  const router = useRouter();
  const firstStory = stories[0];
  const categoryColor = getCategoryColor(firstStory.category);
  const dateLabel = formatDateLabel(date);
  const shortDate = formatShortDate(date);
  const isToday = dateLabel === 'Today';

  return (
    <div
      onClick={() => router.push(`/stories/${date}`)}
      className="relative flex items-center gap-4 rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98]"
      style={{
        background: 'rgba(28,28,36,0.9)',
        border: `1px solid ${isToday ? 'rgba(232,255,71,0.2)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isToday
          ? '0 0 0 1px rgba(232,255,71,0.1), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 h-28 overflow-hidden" style={{ borderRadius: '14px 0 0 14px' }}>
        {firstStory.media_type === 'video' ? (
          <video
            src={firstStory.media_url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          <Image
            src={firstStory.media_url}
            alt={firstStory.caption}
            fill
            className="object-cover"
            sizes="112px"
          />
        )}
        {/* Gradient overlay on thumbnail */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 100%)' }}
        />
        {/* Story count badge */}
        {stories.length > 1 && (
          <div
            className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-white"
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              fontSize: '10px',
              fontFamily: 'var(--font-dm-mono)',
            }}
          >
            {stories.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-4 pr-2">
        {/* Date label + short date */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="font-bold"
            style={{
              fontSize: '15px',
              color: isToday ? 'var(--color-accent)' : '#f0f0f5',
              fontFamily: 'var(--font-syne)',
            }}
          >
            {dateLabel}
          </span>
          {!isToday && (
            <span
              className="text-ink-600"
              style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)' }}
            >
              {shortDate}
            </span>
          )}
        </div>

        {/* Caption */}
        <p
          className="text-ink-300 leading-snug mb-2"
          style={{
            fontSize: '13px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {firstStory.caption}
        </p>

        {/* Category badge */}
        <span
          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md"
          style={{
            background: `${categoryColor}20`,
            color: categoryColor,
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {getCategoryLabel(firstStory.category)}
        </span>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0 pr-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
