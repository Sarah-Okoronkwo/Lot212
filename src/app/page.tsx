import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types';
import StoryViewer from '@/components/StoryViewer';
import AllCaughtUp from '@/components/AllCaughtUp';

export const revalidate = 0;

interface DayGroup {
  date: string;
  stories: Story[];
}

async function getActiveStories(): Promise<Story[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });
  return (data as Story[]) || [];
}

async function getAllStoriesGrouped(): Promise<DayGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stories')
    .select('id, media_url, media_type, caption, category, created_at, expires_at, is_active')
    .order('created_at', { ascending: false });

  if (!data) return [];

  const groups: Record<string, Story[]> = {};
  for (const story of data as Story[]) {
    const date = new Date(story.created_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(story);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, stories]) => ({ date, stories }));
}

export default async function HomePage() {
  const stories = await getActiveStories();

  if (!stories || stories.length === 0) {
    const groups = await getAllStoriesGrouped();
    return <AllCaughtUp groups={groups} />;
  }

  return <StoryViewer initialStories={stories} />;
}