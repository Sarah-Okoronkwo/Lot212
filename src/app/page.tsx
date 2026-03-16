import { createClient } from '@/lib/supabase/server';
import { Story } from '@/types';
import StoryViewer from '@/components/StoryViewer';
import AllCaughtUp from '@/components/AllCaughtUp';

export const revalidate = 0;

async function getActiveStories(): Promise<Story[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  return (data as Story[]) || [];
}

export default async function HomePage() {
  const stories = await getActiveStories();

  if (!stories || stories.length === 0) {
    return <AllCaughtUp />;
  }

  return <StoryViewer initialStories={stories} />;
}