import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — NewsStories',
  description: 'NewsStories admin dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout min-h-screen bg-ink-950">
      {children}
    </div>
  );
}
