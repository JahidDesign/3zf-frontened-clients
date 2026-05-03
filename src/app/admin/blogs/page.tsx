'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  BookOpen, Plus, Pencil, Trash2, Eye, Heart,
  MessageCircle, Globe, Tag, X, Upload, Check,
  ChevronLeft, ChevronRight, Search, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Blog {
  _id:         string;
  title:       string;
  slug:        string;
  category:    string;
  language:    string;
  tags:        string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt:   string;
  views:       number;
  likes:       string[];
  comments:    unknown[];
  coverImage?: { url: string; publicId: string };
  author:      { name: string; avatar?: string };
  description?: string;
}

interface BlogForm {
  title:       string;
  description: string;
  content:     string;
  category:    string;
  language:    string;
  tags:        string;
  isPublished: boolean;
}

const EMPTY_FORM: BlogForm = {
  title:       '',
  description: '',
  content:     '',
  category:    '',
  language:    'en',
  tags:        '',
  isPublished: false,
};

// ─── Blog Modal ───────────────────────────────────────────────────────────────

function BlogModal({
  blog,
  onClose,
}: {
  blog: Blog | null;
  onClose: () => void;
}) {
  const qc        = useQueryClient();
  const fileRef   = useRef<HTMLInputElement>(null);
  const isEdit    = !!blog;

  const [form, setForm]           = useState<BlogForm>(
    blog
      ? {
          title:       blog.title,
          description: blog.description ?? '',
          content:     '',
          category:    blog.category,
          language:    blog.language,
          tags:        blog.tags?.join(', ') ?? '',
          isPublished: blog.isPublished,
        }
      : EMPTY_FORM,
  );
  const [preview, setPreview]     = useState<string | null>(blog?.coverImage?.url ?? null);
  const [file,    setFile]        = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);

  const set = (k: keyof BlogForm, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (file) fd.append('coverImage', file);

      if (isEdit) {
        await api.put(`/blogs/${blog._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog updated');
      } else {
        await api.post('/blogs', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog created');
      }

      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">

          {/* Cover image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Cover Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 border-dashed transition
                ${preview
                  ? 'border-transparent'
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                }`}
            >
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="cover" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Click to upload cover image</span>
                  <span className="text-xs">PNG, JPG up to 10MB</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Enter blog title..."
              className="input w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short summary shown in blog cards..."
              rows={2}
              className="input w-full resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Content (Markdown / HTML)
            </label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Write your blog content here..."
              rows={8}
              className="input w-full resize-y font-mono text-sm"
            />
          </div>

          {/* Category + Language (2-col) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <input
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Health, Tech..."
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Language
              </label>
              <select
                value={form.language}
                onChange={e => set('language', e.target.value)}
                className="input w-full"
              >
                <option value="en">English</option>
                <option value="bn">Bengali</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Tags <span className="font-normal normal-case text-gray-400">(comma separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. donation, awareness, community"
              className="input w-full"
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Publish immediately</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {form.isPublished ? 'Post will be visible to everyone' : 'Post will be saved as draft'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('isPublished', !form.isPublished)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.isPublished ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.isPublished ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ blog, onClose }: { blog: Blog; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.delete(`/blogs/${blog._id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog deleted');
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-1">Delete Post?</h3>
        <p className="text-sm text-center text-gray-500 mb-6">
          "<span className="font-medium text-gray-700 dark:text-gray-300">{blog.title}</span>" will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [tab,          setTab]          = useState<'published' | 'draft'>('published');
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [modalBlog,    setModalBlog]    = useState<Blog | null | 'new'>(null);
  const [deleteBlog,   setDeleteBlog]   = useState<Blog | null>(null);

  const { data, isLoading } = useQuery<{ blogs: Blog[]; total: number; pages: number }>({
    queryKey: ['admin-blogs', tab, page],
    queryFn:  () =>
      api.get('/blogs', {
        params: {
          isPublished: tab === 'published' ? true : false,
          page,
          limit: 10,
        },
      }).then(r => r.data),
    refetchInterval: 60_000,
  });

  const blogs      = data?.blogs  ?? [];
  const totalPages = data?.pages  ?? 1;

  const filtered = search.trim()
    ? blogs.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.category?.toLowerCase().includes(search.toLowerCase()),
      )
    : blogs;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" /> Blog Posts
        </h1>
        <button
          onClick={() => setModalBlog('new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
          {([
            { id: 'published', label: 'Published' },
            { id: 'draft',     label: 'Drafts'    },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input pl-9 w-full text-sm"
          />
        </div>
      </div>

      {/* Blog list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="card p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No {tab} posts{search ? ` matching "${search}"` : ''}</p>
          </div>
        )}

        {filtered.map(blog => (
          <div key={blog._id} className="card p-4">
            <div className="flex items-start gap-4">
              {/* Cover thumb */}
              {blog.coverImage?.url ? (
                <img
                  src={blog.coverImage.url}
                  alt={blog.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {blog.title}
                  </h3>
                  <span className={`badge text-xs shrink-0 ${blog.isPublished ? 'badge-green' : 'badge-gray'}`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {blog.category && (
                    <span className="badge badge-blue text-xs shrink-0">{blog.category}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />{blog.views ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />{blog.likes?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />{blog.comments?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />{blog.language}
                  </span>
                  {blog.tags?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />{blog.tags.slice(0, 2).join(', ')}
                    </span>
                  )}
                  <span>
                    {format(new Date(blog.publishedAt ?? blog.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>

                {blog.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{blog.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`/blog/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition"
                  title="View post"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setModalBlog(blog)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 transition"
                  title="Edit post"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteBlog(blog)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      {modalBlog !== null && (
        <BlogModal
          blog={modalBlog === 'new' ? null : modalBlog}
          onClose={() => setModalBlog(null)}
        />
      )}
      {deleteBlog && (
        <DeleteConfirm
          blog={deleteBlog}
          onClose={() => setDeleteBlog(null)}
        />
      )}
    </div>
  );
}