import { createClient } from '@/lib/supabase/server';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stories')
    .select('created_at, slug')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const stories = data || [];

  // Get unique dates for day pages
  const dates = [...new Set(
    stories.map((s) => {
      const lagosTime = new Date(new Date(s.created_at).getTime() + 60 * 60 * 1000);
      return lagosTime.toISOString().split('T')[0];
    })
  )];

  // Day-level pages
  const dayPages: MetadataRoute.Sitemap = dates.map((date) => ({
    url: `https://lot212.com/stories/${date}`,
    lastModified: new Date(date),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Individual slide pages (only those with slugs)
  const slidePages: MetadataRoute.Sitemap = stories
    .filter((s) => s.slug && !s.slug.startsWith('slide-'))
    .map((s) => {
      const lagosTime = new Date(new Date(s.created_at).getTime() + 60 * 60 * 1000);
      const date = lagosTime.toISOString().split('T')[0];
      return {
        url: `https://lot212.com/stories/${date}/${s.slug}`,
        lastModified: new Date(s.created_at),
        changeFrequency: 'never' as const,
        priority: 0.9,
      };
    });

  return [
    {
      url: 'https://lot212.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...slidePages,
    ...dayPages,
  ];
}