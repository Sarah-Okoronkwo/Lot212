import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Story, getCategoryColor, getCategoryLabel } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ date: string; slug: string }>;
}

async function getStoryBySlug(date: string, slug: string): Promise<Story | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const supabase = await createClient();
  const startOfDay = `${date}T00:00:00+01:00`;
  const endOfDay = `${date}T23:59:59+01:00`;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .eq('slug', slug)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .single();

  if (error || !data) return null;
  return data as Story;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date, slug } = await params;
  const story = await getStoryBySlug(date, slug);

  if (!story) return { title: 'Lot 212' };

  return {
    title: `${story.caption} — Lot 212`,
    description: story.subtext || story.caption,
    openGraph: {
      title: story.caption,
      description: story.subtext || story.caption,
      images: story.media_type === 'image' ? [{ url: story.media_url, alt: story.caption }] : [],
      type: 'article',
      publishedTime: story.created_at,
      siteName: 'Lot 212',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.caption,
      description: story.subtext || story.caption,
      images: story.media_type === 'image' ? [story.media_url] : [],
    },
  };
}

export default async function StorySlugPage({ params }: PageProps) {
  const { date, slug } = await params;
  const story = await getStoryBySlug(date, slug);

  if (!story) notFound();

  const categoryColor = getCategoryColor(story.category);
  const categoryLabel = getCategoryLabel(story.category);

  // Format date for display
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden"
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      {/* Blurred background */}
      {story.media_type === 'image' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${story.media_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) saturate(1.5) brightness(0.3)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto flex flex-col overflow-hidden"
        style={{
          minHeight: '100vh',
          maxHeight: '100vh',
        }}
      >
        {/* Media */}
        <div className="relative flex-1 min-h-0">
          {story.media_type === 'video' ? (
            <video
              src={story.media_url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
              style={{ background: '#000', maxHeight: '60vh' }}
            />
          ) : (
            <div className="relative w-full" style={{ height: '60vh' }}>
              <Image
                src={story.media_url}
                alt={story.caption}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          )}

          {/* Gradient over image */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            }}
          />

          {/* Logo top left */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <Link href="/">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: '#e8ff47',
                  color: '#18181f',
                  fontFamily: 'var(--font-dm-mono)',
                }}
              >
                212
              </div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div
          className="relative z-10 px-6 pt-5 pb-8 flex flex-col gap-4"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), #0e0e14)' }}
        >
          {/* Category + date */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{
                background: `${categoryColor}22`,
                color: categoryColor,
                border: `1px solid ${categoryColor}40`,
                fontFamily: 'var(--font-dm-mono)',
              }}
            >
              {categoryLabel}
            </span>
            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-dm-mono)' }}
            >
              {displayDate}
            </span>
          </div>

          {/* Caption */}
          <h1
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(20px, 5vw, 26px)' }}
          >
            {story.caption}
          </h1>

          {/* Subtext */}
          {story.subtext && (
            <p
              className="leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
              }}
            >
              {story.subtext}
            </p>
          )}

          {/* CTA — view all stories from this day */}
          <Link
            href={`/stories/${date}?from=${slug}`}
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all active:scale-[0.98] mt-2"
            style={{
              background: '#e8ff47',
              color: '#18181f',
            }}
          >
            <div>
              <p className="font-bold text-sm">See all stories from today</p>
              <p className="text-xs opacity-60" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                Lot 212 · {displayDate}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>

          {/* Back to archive */}
          <Link
            href="/"
            className="text-center text-xs transition-colors"
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-dm-mono)',
            }}
          >
            ← Back to Lot 212
          </Link>
        </div>
      </div>
    </div>
  );
}
