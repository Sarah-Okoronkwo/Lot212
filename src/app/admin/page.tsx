import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Story } from '@/types';
import AdminDashboard from '@/components/AdminDashboard';

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <AdminDashboard
      initialStories={(data as Story[]) || []}
      userEmail={user.email ?? ''}
    />
  );
}
