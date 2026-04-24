'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Images, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminGalleryPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-gallery'], queryFn: () => api.get('/gallery').then(r => r.data) });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/gallery/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); toast.success('Deleted'); },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Images className="w-5 h-5" />Gallery</h1>
        <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Upload</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {(data?.items ?? []).map((item: any) => (
          <div key={item._id} className="card overflow-hidden group relative">
            {item.media?.[0]?.url && <img src={item.media[0].url} alt={item.title} className="w-full aspect-square object-cover" />}
            <div className="p-2"><p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.title}</p></div>
            <button onClick={() => confirm('Delete?') && deleteMutation.mutate(item._id)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
