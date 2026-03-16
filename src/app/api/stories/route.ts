import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stories: data }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}