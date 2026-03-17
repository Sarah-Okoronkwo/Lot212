import { createClient } from '@/lib/supabase/server';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stories')
    .select('created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const dates = [...new Set(
    (data || []).map((s) => new Date(s.created_at).toISOString().split('T')[0])
  )];

  const storyPages = dates.map((date) => ({
    url: `https://lot212.vercel.app/stories/${date}`,
    lastModified: new Date(date),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://lot212.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...storyPages,
  ];
}