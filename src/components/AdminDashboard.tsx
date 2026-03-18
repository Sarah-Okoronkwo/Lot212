'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Story, STORY_CATEGORIES, getCategoryColor, getCategoryLabel, generateSlug } from '@/types';

interface AdminDashboardProps {
  initialStories: Story[];
  userEmail: string;
}

function formatTimeRemaining(expiresAt: string): { text: string; urgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expired', urgent: true };
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  if (hours === 0) return { text: `${minutes}m remaining`, urgent: true };
  return { text: `${hours}h ${minutes}m remaining`, urgent: hours < 3 };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard({ initialStories, userEmail }: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<Story[]>(initialStories);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('manage');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [caption, setCaption] = useState('');
  const [subtext, setSubtext] = useState('');
  const [category, setCategory] = useState('breaking');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadError('');
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setUploadError('Please select a file.'); return; }
    if (!caption.trim()) { setUploadError('Please add a caption.'); return; }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';

      // Generate slug from caption
      const slug = generateSlug(caption.trim());

      const { error: storageError } = await supabase.storage
        .from('stories')
        .upload(fileName, selectedFile, { upsert: false });

      if (storageError) throw new Error(`Upload failed: ${storageError.message}`);

      const { data: urlData } = supabase.storage.from('stories').getPublicUrl(fileName);

      const { data: newStory, error: dbError } = await supabase
        .from('stories')
        .insert({
          media_url: urlData.publicUrl,
          media_type: mediaType,
          caption: caption.trim(),
          subtext: subtext.trim(),
          slug,
          category,
        })
        .select()
        .single();

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setStories((prev) => [newStory as Story, ...prev]);
      setUploadSuccess(true);
      setCaption('');
      setSubtext('');
      setCategory('breaking');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    setDeletingId(storyId);
    try {
      const story = stories.find((s) => s.id === storyId);
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId);
      if (error) throw error;

      if (story?.media_url) {
        const url = new URL(story.media_url);
        const pathParts = url.pathname.split('/stories/');
        if (pathParts[1]) {
          await supabase.storage.from('stories').remove([pathParts[1]]);
        }
      }

      setStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = stories.filter((s) => new Date(s.expires_at).getTime() > Date.now()).length;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--color-accent)', color: '#18181f', fontFamily: 'var(--font-dm-mono)' }}
          >
            212
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
            <p className="text-ink-500 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="hidden md:flex items-center gap-1.5 text-ink-400 text-sm hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View site
          </a>
          <button onClick={handleSignOut} className="text-ink-400 text-sm hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Active Stories', value: activeCount, color: '#00c853' },
          { label: 'Total Today', value: stories.length, color: '#e8ff47' },
          { label: 'Expired Today', value: stories.length - activeCount, color: '#ff3b3b' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(35,35,45,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-2xl font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-ink-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {(['manage', 'upload'] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{ background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === tab ? '#fff' : '#717183' }}
          >
            {tab === 'manage' ? 'Manage Stories' : 'Upload New'}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(35,35,45,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-white text-lg font-bold mb-6">Upload New Story</h2>
          <form onSubmit={handleUpload} className="space-y-5">

            {/* File zone */}
            <div>
              <label className="block text-ink-300 text-xs font-semibold mb-2 uppercase tracking-wider">Media File</label>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <div onClick={handleDropZoneClick} className="rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden"
                style={{ borderColor: selectedFile ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.15)', background: selectedFile ? 'rgba(232,255,71,0.04)' : 'rgba(255,255,255,0.02)', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {previewUrl && selectedFile ? (
                  <div className="relative w-full">
                    {selectedFile.type.startsWith('video') ? (
                      <video src={previewUrl} className="w-full max-h-64 object-cover" muted />
                    ) : (
                      <Image src={previewUrl} alt="Preview" width={800} height={400} className="w-full max-h-64 object-cover" unoptimized />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(232,255,71,0.1)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-ink-300 text-sm font-semibold">Click to select a file</p>
                    <p className="text-ink-600 text-xs mt-1">JPG, PNG, MP4, MOV supported</p>
                  </div>
                )}
              </div>
              {selectedFile && (
                <p className="text-ink-400 text-xs mt-2">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)</p>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-ink-300 text-xs font-semibold mb-2 uppercase tracking-wider">Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a short, punchy headline..." rows={3} className="admin-input resize-none" />
              <div className="flex items-center justify-between mt-1">
                <p className="text-ink-600 text-xs">{caption.length}/150 characters</p>
                {caption.trim() && (
                  <p className="text-ink-600 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                    slug: {generateSlug(caption.trim())}
                  </p>
                )}
              </div>
            </div>

            {/* Subtext */}
            <div>
              <label className="block text-ink-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                Subtext <span className="text-ink-600 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea value={subtext} onChange={(e) => setSubtext(e.target.value)} placeholder="Add extra context, notes or details..." rows={2} className="admin-input resize-none" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-ink-300 text-xs font-semibold mb-2 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {STORY_CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: category === cat.value ? `${cat.color}25` : 'rgba(255,255,255,0.05)', border: `1px solid ${category === cat.value ? cat.color + '50' : 'rgba(255,255,255,0.08)'}`, color: category === cat.value ? cat.color : '#717183' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {uploadError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{uploadError}</div>
            )}
            {uploadSuccess && (
              <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17L4 12" /></svg>
                Story published successfully!
              </div>
            )}

            <button type="submit" disabled={uploading || !selectedFile || !caption.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-accent)', color: '#18181f' }}
            >
              {uploading ? 'Publishing...' : 'Publish Story'}
            </button>
          </form>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          {stories.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(35,35,45,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-ink-400 text-sm mb-4">No active stories found.</p>
              <button type="button" onClick={() => setActiveTab('upload')} className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
                Upload your first story
              </button>
            </div>
          ) : (
            stories.map((story) => {
              const { text: timeText, urgent } = formatTimeRemaining(story.expires_at);
              const isExpired = new Date(story.expires_at).getTime() <= Date.now();
              const catColor = getCategoryColor(story.category);
              const storyDate = new Date(story.created_at).toISOString().split('T')[0];

              return (
                <div key={story.id} className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: 'rgba(35,35,45,0.8)', border: `1px solid ${isExpired ? 'rgba(255,59,59,0.15)' : 'rgba(255,255,255,0.07)'}`, opacity: isExpired ? 0.6 : 1 }}
                >
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-ink-800 relative">
                    {story.media_type === 'video' ? (
                      <video src={story.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <Image src={story.media_url} alt={story.caption} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${catColor}20`, color: catColor, fontFamily: 'var(--font-dm-mono)' }}>
                        {getCategoryLabel(story.category)}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold truncate">{story.caption}</p>
                    {story.slug && (
                      <p className="text-ink-600 text-xs truncate mt-0.5" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                        /stories/{storyDate}/{story.slug}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ fontFamily: 'var(--font-dm-mono)', color: isExpired ? '#ff3b3b' : urgent ? '#ff9500' : '#717183' }}>
                        {timeText}
                      </span>
                      <span className="text-ink-700 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>{formatDate(story.created_at)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDelete(story.id)} disabled={deletingId === story.id}
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20 text-ink-500 hover:text-red-400 disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="mt-12 pb-6 text-center text-ink-700 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>
        Lot 212 Admin · Stories auto-expire after 24 hours
      </div>
    </div>
  );
}
