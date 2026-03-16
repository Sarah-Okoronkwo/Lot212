import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types';
import DailyStoryArchive from '@/components/DailyStoryArchive';

interface DayGroup {
  date: string;
  stories: Story[];
}

async function getArchivedStories(): Promise<DayGroup[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stories')
    .select('id, media_url, media_type, caption, category, created_at, expires_at, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // Group by calendar date
  const groups: Record<string, Story[]> = {};

  for (const story of data as Story[]) {
    const date = new Date(story.created_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(story);
  }

  // Sort dates newest first
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, stories]) => ({ date, stories }));
}

export default async function AllCaughtUp() {
  const groups = await getArchivedStories();

  return <DailyStoryArchive groups={groups} />;
}
