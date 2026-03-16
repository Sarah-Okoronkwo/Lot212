export interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  category: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface StoryUploadData {
  caption: string;
  category: string;
  file: File;
}

export type StoryCategory =
  | 'breaking'
  | 'politics'
  | 'technology'
  | 'sports'
  | 'entertainment'
  | 'world'
  | 'business'
  | 'health'
  | 'science'
  | 'lifestyle';

export const STORY_CATEGORIES: { value: StoryCategory; label: string; color: string }[] = [
  { value: 'breaking', label: 'Breaking', color: '#ff3b3b' },
  { value: 'politics', label: 'Politics', color: '#0070f3' },
  { value: 'technology', label: 'Technology', color: '#8b5cf6' },
  { value: 'sports', label: 'Sports', color: '#00c853' },
  { value: 'entertainment', label: 'Entertainment', color: '#ff6b00' },
  { value: 'world', label: 'World', color: '#06b6d4' },
  { value: 'business', label: 'Business', color: '#eab308' },
  { value: 'health', label: 'Health', color: '#ec4899' },
  { value: 'science', label: 'Science', color: '#14b8a6' },
  { value: 'lifestyle', label: 'Lifestyle', color: '#a855f7' },
];

export function getCategoryColor(category: string): string {
  const found = STORY_CATEGORIES.find((c) => c.value === category);
  return found?.color ?? '#717183';
}

export function getCategoryLabel(category: string): string {
  const found = STORY_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? category;
}
