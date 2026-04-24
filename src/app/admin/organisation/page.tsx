'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Building2, CheckCircle, XCircle, Eye, Heart, Gift, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminOrgPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'members'|'helpPosts'|'donations'>('members');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: membersData } = useQuery({ queryKey: ['admin-org-members'], queryFn: () => api.get('/org/pending').then(r => r.data) });
  const { data: helpData, refetch } = useQuery({ queryKey: ['admin-help-posts'], queryFn: () => api.get('/org/help-posts/pending').then(r => r.data) });
  const { data: donationsData } = useQuery({ queryKey: ['admin-org-donations'], queryFn: () => api.get('/org/donations').then(r => r.data) });

  const approveMember = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/org/approve/${id}`, { status, adminNote }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-org-members'] }); toast.success('Updated'); setAdminNote(''); },
  });

  const approvePost = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/org/help-posts/${id}/approve`, { status, adminNote }),
    onSuccess: () => { refetch(); toast.success('Help post updated'); setSelectedPost(null); setAdminNote(''); },
  });

  const verifyDonation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/org/donations/${id}/verify`, { status, adminNote }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-org-donations'] }); toast.success('Donation updated'); setAdminNote(''); },
  });

  const pendingMembers = membersData?.members ?? [];
  const helpPosts = helpData?.posts ?? [];
  const donations = donationsData?.donations ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Building2 className="w-5 h-5 text-orange-500" /> Organisation Management
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
        {[
          { id: 'members', label: `Members (${pendingMembers.length})`, icon: Building2 },
          { id: 'helpPosts', label: `Help Posts (${helpPosts.length})`, icon: Heart },
          { id: 'donations', label: `Donations (${donations.length})`, icon: Gift },
        ].map((t: any) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pending Member Applications</h2>
          </div>
          {pendingMembers.length === 0 ? (
            <div className="p-12 text-center text-gray-400"><Clock className="w-12 h-12 mx-auto mb-3" /><p>No pending applications</p></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pendingMembers.map((m: any) => (
                <div key={m._id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/30 shrink-0 flex items-center justify-center text-orange-700 font-bold">
                      {m.profilePhoto?.url ? <img src={m.profilePhoto.url} alt="" className="w-full h-full object-cover" /> : m.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white">{m.name}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span>Father: {m.fatherName}</span>
                        <span>Phone: {m.phone}</span>
                        <span>District: {m.district}</span>
                        <span>Religion: {m.religion}</span>
                        <span>DOB: {m.dateOfBirth ? format(new Date(m.dateOfBirth), 'PPP') : '—'}</span>
                        <span>Birth Place: {m.birthPlace}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded font-mono">{m.paymentMethod?.toUpperCase()}: {m.transactionId}</span>
                        <span className="text-green-600 font-semibold">৳{m.paymentAmount}</span>
                        {m.nidDocument?.url && <a href={m.nidDocument.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-1"><Eye className="w-3 h-3" />NID</a>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{m.presentAddress}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => approveMember.mutate({ id: m._id, status: 'approved' })}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 rounded-lg font-medium transition">
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </button>
                      <button onClick={() => approveMember.mutate({ id: m._id, status: 'rejected' })}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 rounded-lg font-medium transition">
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Posts Tab */}
      {tab === 'helpPosts' && (
        <div className="space-y-4">
          {helpPosts.length === 0 ? (
            <div className="card p-12 text-center text-gray-400"><Heart className="w-12 h-12 mx-auto mb-3" /><p>No pending help posts</p></div>
          ) : helpPosts.map((post: any) => (
            <div key={post._id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                  {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" /> : post.author?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{post.title}</p>
                    <span className="badge-orange badge text-xs">{post.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{post.description}</p>
                  <p className="text-xs text-gray-400 mt-1">By: {post.author?.name} · {post.author?.email}</p>
                  {post.media?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.media.slice(0,3).map((m: any, i: number) => (
                        <a key={i} href={m.url} target="_blank" rel="noopener noreferrer">
                          <img src={m.url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => approvePost.mutate({ id: post._id, status: 'approved' })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition">
                    <CheckCircle className="w-3.5 h-3.5" />Approve & Notify All
                  </button>
                  <button onClick={() => { setSelectedPost(post); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition">
                    <XCircle className="w-3.5 h-3.5" />Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donations Tab */}
      {tab === 'donations' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3">Donor</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">TrxID</th>
                  <th className="text-left px-4 py-3">Purpose</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {donations.map((d: any) => (
                  <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3"><p className="font-medium text-gray-900 dark:text-white">{d.donorName || d.donor?.name}</p><p className="text-xs text-gray-400">{d.donor?.phone}</p></td>
                    <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">৳{d.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs capitalize">{d.paymentMethod}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{d.transactionId}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{d.purpose || '—'}</td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${d.status === 'completed' ? 'badge-green' : d.status === 'verifying' ? 'badge-orange' : 'bg-red-100 text-red-600'}`}>{d.status}</span></td>
                    <td className="px-4 py-3">
                      {(d.status === 'verifying' || d.status === 'pending') && (
                        <div className="flex gap-1">
                          <button onClick={() => verifyDonation.mutate({ id: d._id, status: 'completed' })} className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium transition">✓ Confirm</button>
                          <button onClick={() => verifyDonation.mutate({ id: d._id, status: 'failed' })} className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium transition">✗ Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donations.length === 0 && <div className="p-12 text-center text-gray-400"><Gift className="w-12 h-12 mx-auto mb-3" /><p>No donations yet</p></div>}
          </div>
        </div>
      )}

      {/* Reject help post modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Reject Help Post</h3>
            <p className="text-sm text-gray-500 mb-3">"{selectedPost.title}"</p>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} className="input resize-none w-full text-sm mb-3" rows={3} placeholder="Reason for rejection..." />
            <div className="flex gap-2">
              <button onClick={() => approvePost.mutate({ id: selectedPost._id, status: 'rejected' })} className="flex-1 btn-danger py-2.5">Reject</button>
              <button onClick={() => { setSelectedPost(null); setAdminNote(''); }} className="flex-1 btn-secondary py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
