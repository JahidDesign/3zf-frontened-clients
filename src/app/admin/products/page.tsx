'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Package, Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => api.get('/supershop/products', { params: { search: search || undefined, limit: 50 } }).then(r => r.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/supershop/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product removed'); },
  });
  const products = data?.products ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Package className="w-5 h-5" />Products</h1>
        <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Add Product</button>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="Search products..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">৳{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-orange' : 'bg-red-100 text-red-600'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={`/supershop/products/${p._id}`} target="_blank" className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 text-gray-500 transition"><Eye className="w-3.5 h-3.5" /></a>
                      <button className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-200 text-blue-600 transition"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => confirm('Delete?') && deleteMutation.mutate(p._id)} className="w-7 h-7 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 text-red-600 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
