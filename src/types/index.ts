export interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  subtext: string;
  slug: string;
  alt_text: string;
  category: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export type StoryCategory =
  | 'history'
  | 'culture'
  | 'science'
  | 'food'
  | 'crime'
  | 'world'
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'lifestyle';

export const STORY_CATEGORIES: { value: StoryCategory; label: string; color: string }[] = [
  { value: 'history',       label: 'History',       color: '#c9a84c' },
  { value: 'culture',       label: 'Culture',       color: '#a78bfa' },
  { value: 'science',       label: 'Science',       color: '#22d3ee' },
  { value: 'food',          label: 'Food',          color: '#f97316' },
  { value: 'crime',         label: 'Crime',         color: '#ef4444' },
  { value: 'world',         label: 'World',         color: '#06b6d4' },
  { value: 'technology',    label: 'Technology',    color: '#8b5cf6' },
  { value: 'business',      label: 'Business',      color: '#eab308' },
  { value: 'entertainment', label: 'Entertainment', color: '#ff6b00' },
  { value: 'lifestyle',     label: 'Lifestyle',     color: '#a855f7' },
];

export function getCategoryColor(category: string): string {
  const found = STORY_CATEGORIES.find((c) => c.value === category);
  return found?.color ?? '#717183';
}

export function getCategoryLabel(category: string): string {
  const found = STORY_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? category;
}

export function generateSlug(caption: string): string {
  return caption
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function getWebPUrl(mediaUrl: string, width?: number): string {
  return mediaUrl;
}
