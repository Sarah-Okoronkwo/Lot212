import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types';
import DailyStoryArchive from '@/components/DailyStoryArchive';

interface DayGroup {
  date: string;
  stories: Story[];
}

export const revalidate = 0;

export default async function ArchivePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stories')
    .select('id, media_url, media_type, caption, category, created_at, expires_at, is_active')
    .order('created_at', { ascending: false });

  const groups: Record<string, Story[]> = {};
  for (const story of (data || []) as Story[]) {
    const date = new Date(story.created_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(story);
  }

  const sorted: DayGroup[] = Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, stories]) => ({ date, stories }));

  return <DailyStoryArchive groups={sorted} />;
}