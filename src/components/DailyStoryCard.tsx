'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';

interface DailyStoryCardProps {
  date: string;
  stories: Story[];
}

function formatDateLabel(dateStr: string): { primary: string; secondary: string | null } {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return { primary: 'Today', secondary: null };
  if (isSameDay(date, yesterday)) return { primary: 'Yesterday', secondary: null };

  const weekday = date.toLocaleDateString([], { weekday: 'long' });
  const short = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return { primary: weekday, secondary: short };

  const full = date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  return { primary: full, secondary: null };
}

export default function DailyStoryCard({ date, stories }: DailyStoryCardProps) {
  const router = useRouter();
  const firstStory = stories[0];
  const categoryColor = getCategoryColor(firstStory.category);
  const { primary, secondary } = formatDateLabel(date);
  const isToday = primary === 'Today';

  // If first story has a slug, link directly to that slide page
  // Otherwise fall back to the day page
  const handleClick = () => {
    if (firstStory.slug) {
      router.push(`/stories/${date}/${firstStory.slug}`);
    } else {
      router.push(`/stories/${date}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-stretch rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98] hover:brightness-110"
      style={{
        background: 'rgba(22,22,30,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
        minHeight: '100px',
      }}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-24 h-24 self-center ml-3 my-3 rounded-xl overflow-hidden">
        {firstStory.media_type === 'video' ? (
          <video src={firstStory.media_url} className="w-full h-full object-cover" muted playsInline />
        ) : (
          <Image
            src={firstStory.media_url}
            alt={firstStory.caption}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-4 flex flex-col justify-center">
        {/* Day label row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm" style={{ color: isToday ? '#e8ff47' : '#e8a020' }}>
            {primary}
          </span>
          {secondary && (
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-dm-mono)' }}>
              {secondary}
            </span>
          )}
        </div>

        {/* Caption */}
        <p
          className="text-white font-semibold leading-snug mb-2"
          style={{
            fontSize: '16px',
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
          className="inline-block self-start text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: `${categoryColor}22`,
            color: categoryColor,
            border: `1px solid ${categoryColor}40`,
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {getCategoryLabel(firstStory.category)}
        </span>
      </div>

      {/* Right side: story count + chevron */}
      <div className="flex flex-col items-center justify-center gap-2 pr-4 flex-shrink-0">
        {stories.length > 1 && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-ink-950"
            style={{ background: '#e8ff47', fontSize: '12px', fontFamily: 'var(--font-dm-mono)' }}
          >
            {stories.length}
          </div>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}