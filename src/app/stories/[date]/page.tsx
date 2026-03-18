import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Story } from '@/types';
import ArchiveStoryViewer from '@/components/ArchiveStoryViewer';

export const revalidate = 30;

interface PageProps {
  params: Promise<{ date: string }>;
}

async function getStoriesForDate(date: string): Promise<Story[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const supabase = await createClient();

  const startOfDay = `${date}T00:00:00+01:00`;
  const endOfDay = `${date}T23:59:59+01:00`;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as Story[];
}

export default async function DateStoriesPage({ params }: PageProps) {
  const { date } = await params;
  const stories = await getStoriesForDate(date);

  if (!stories || stories.length === 0) {
    notFound();
  }

  return <ArchiveStoryViewer stories={stories} date={date} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params;
  const stories = await getStoriesForDate(date);
  const first = stories[0];

  if (!first) return { title: 'Lot 212' };

  return {
    title: `${first.caption} — Lot 212`,
    description: first.subtext || first.caption,
    openGraph: {
      title: first.caption,
      description: first.subtext || first.caption,
      images: first.media_type === 'image' ? [{ url: first.media_url }] : [],
      type: 'article',
      publishedTime: first.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: first.caption,
      description: first.subtext || first.caption,
      images: first.media_type === 'image' ? [first.media_url] : [],
    },
  };
}