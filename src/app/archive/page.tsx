import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types';
import DailyStoryArchive from '@/components/DailyStoryArchive';

interface DayGroup {
  date: string;
  stories: Story[];
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stories')
    .select('id, media_url, media_type, caption, category, created_at, expires_at, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const groups: Record<string, Story[]> = {};
  for (const story of (data || []) as Story[]) {
    // Convert UTC to Lagos time (UTC+1) before grouping by date
    const lagosTime = new Date(new Date(story.created_at).getTime() + 60 * 60 * 1000);
    const date = lagosTime.toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(story);
  }

  const sorted: DayGroup[] = Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, stories]) => ({ date, stories }));

  return <DailyStoryArchive groups={sorted} />;
}