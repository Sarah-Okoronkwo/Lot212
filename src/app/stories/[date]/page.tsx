import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Story } from '@/types';
import ArchiveStoryViewer from '@/components/ArchiveStoryViewer';

interface PageProps {
  params: Promise<{ date: string }>;
}

async function getStoriesForDate(date: string): Promise<Story[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const supabase = await createClient();

  // Use Lagos timezone offset (UTC+1) — query a 26-hour window to catch all stories
  // that fall on this calendar date in West Africa Time
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