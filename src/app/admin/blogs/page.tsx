'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { BookOpen, Plus, Trash2, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminBlogsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-blogs'], queryFn: () => api.get('/blogs?limit=50').then(r => r.data) });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blogs'] }); toast.success('Blog deleted'); },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="w-5 h-5" />Blog Posts ({data?.total ?? 0})</h1>
        <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />New Post</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
            <tr><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Author</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Views</th><th className="text-left px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {(data?.blogs ?? []).map((b: any) => (
              <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 max-w-[200px]"><p className="font-medium text-gray-900 dark:text-white truncate">{b.title}</p></td>
                <td className="px-4 py-3 text-gray-500">{b.author?.name}</td>
                <td className="px-4 py-3"><span className="badge-blue badge text-xs">{b.category || 'General'}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(b.publishedAt || b.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3 text-gray-500">{b.views}</td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <Link href={`/blog/${b.slug}`} target="_blank" className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"><Eye className="w-3.5 h-3.5" /></Link>
                  <button className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => confirm('Delete?') && deleteMutation.mutate(b._id)} className="w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
