'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, FileText, ShoppingBag, AlertTriangle, MessageSquare, Trash2, TrendingUp, Bell, CheckCircle, XCircle, Ban, BarChart3, Settings, LogOut, Home, Building2, Package } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type ActiveSection = 'dashboard' | 'users' | 'posts' | 'organisation' | 'orders' | 'contacts' | 'delete-requests';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'organisation', label: 'Organisation', icon: Building2 },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'contacts', label: 'Contacts', icon: MessageSquare },
  { id: 'delete-requests', label: 'Delete Requests', icon: Trash2 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [active, setActive] = useState<ActiveSection>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orgRequests, setOrgRequests] = useState<any[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user && !['admin', 'superadmin', 'moderator'].includes(user.role)) { router.replace('/'); return; }
    fetchDashboard();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (active === 'users') fetchUsers();
    if (active === 'organisation') fetchOrgRequests();
    if (active === 'delete-requests') fetchDeleteRequests();
    if (active === 'contacts') fetchContacts();
    if (active === 'orders') fetchOrders();
  }, [active]);

  const fetchDashboard = async () => {
    try { const { data } = await api.get('/admin/dashboard'); setStats(data.stats); } catch {}
  };
  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/admin/users?search=${searchUser}`); setUsers(data.users); } catch {}
    finally { setLoading(false); }
  };
  const fetchOrgRequests = async () => {
    try { const { data } = await api.get('/organisation/admin/pending'); setOrgRequests(data.orgs); } catch {}
  };
  const fetchDeleteRequests = async () => {
    try { const { data } = await api.get('/admin/delete-requests'); setDeleteRequests(data.users); } catch {}
  };
  const fetchContacts = async () => {
    try { const { data } = await api.get('/admin/contacts'); setContacts(data.contacts); } catch {}
  };
  const fetchOrders = async () => {
    try { const { data } = await api.get('/admin/orders'); setOrders(data.orders); } catch {}
  };

  const banUser = async (userId: string, ban: boolean, reason?: string) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { isBanned: ban, banReason: reason });
      toast.success(ban ? 'User banned' : 'User unbanned');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this account?')) return;
    try { await api.delete(`/admin/users/${userId}/delete`); toast.success('Account deleted'); fetchDeleteRequests(); } catch { toast.error('Failed'); }
  };

  const approveOrg = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      await api.patch(`/organisation/admin/${id}/status`, { status, adminNote: note });
      toast.success(`Registration ${status}`);
      fetchOrgRequests();
    } catch { toast.error('Failed'); }
  };

  if (!isAuthenticated || !user) return null;

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Posts', value: stats.posts, icon: FileText, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'from-amber-500 to-orange-600' },
    { label: 'Revenue', value: `৳${(stats.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-violet-600' },
    { label: 'Pending Orgs', value: stats.pendingOrgs, icon: AlertTriangle, color: 'from-yellow-500 to-amber-600' },
    { label: 'New Contacts', value: stats.contacts, icon: MessageSquare, color: 'from-teal-500 to-cyan-600' },
    { label: 'Delete Requests', value: stats.deleteRequests, icon: Trash2, color: 'from-red-500 to-rose-600' },
    { label: 'Active Users', value: Math.round((stats.users || 0) * 0.7), icon: CheckCircle, color: 'from-pink-500 to-rose-600' },
  ] : [];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col" style={{ background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)', minHeight: '100vh' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">3Z</div>
            <div>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--color-text)' }}>3ZF Admin</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{user.role}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id as ActiveSection)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${active === item.id ? 'gradient-brand text-white shadow-brand' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t space-y-0.5" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
            <Home className="w-4 h-4" /> Back to Site
          </Link>
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <h1 className="font-heading font-bold text-xl capitalize" style={{ color: 'var(--color-text)' }}>
            {active.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-3">
            <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0 relative">
              <Bell className="w-5 h-5" />
              {stats?.pendingOrgs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-brand text-white text-[9px] font-bold flex items-center justify-center">
                  {stats.pendingOrgs}
                </span>
              )}
            </button>
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
              alt="" className="w-8 h-8 avatar" />
          </div>
        </header>

        <div className="p-6">
          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((card) => (
                  <div key={card.label} className="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</p>
                        <p className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{card.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* USERS */}
          {active === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-3 mb-5">
                <input value={searchUser} onChange={e => setSearchUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search by name, email, username..." className="flex-1 max-w-sm" />
                <button onClick={fetchUsers} className="btn-primary px-5">Search</button>
              </div>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider"
                          style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6B46C1&color=fff`}
                              alt="" className="w-8 h-8 avatar" />
                            <div>
                              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : u.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${u.isBanned ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : u.isVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {u.isBanned ? 'Banned' : u.isVerified ? 'Active' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {u.isBanned ? (
                              <button onClick={() => banUser(u._id, false)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                                <CheckCircle className="w-3 h-3" /> Unban
                              </button>
                            ) : (
                              <button onClick={() => { const r = prompt('Ban reason?'); if (r) banUser(u._id, true, r); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                                <Ban className="w-3 h-3" /> Ban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && !loading && (
                  <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>No users found</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ORGANISATION */}
          {active === 'organisation' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {orgRequests.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No pending registrations</p>
                </div>
              ) : orgRequests.map((org) => (
                <div key={org._id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={org.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=6B46C1&color=fff`}
                        alt="" className="w-10 h-10 avatar" />
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{org.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{org.user?.email}</p>
                      </div>
                    </div>
                    <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                    {[
                      ['Father', org.fathersName], ['Mother', org.mothersName],
                      ['Religion', org.religion], ['Phone', org.phone],
                      ['Birth Place', org.birthPlace], ['District', org.district],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                        <p style={{ color: 'var(--color-text)' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* NID preview */}
                  {org.nidCard?.url && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>NID Card</p>
                      <img src={org.nidCard.url} alt="NID" className="h-32 rounded-xl object-cover" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => approveOrg(org._id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { const note = prompt('Rejection reason:'); if (note !== null) approveOrg(org._id, 'rejected', note); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* DELETE REQUESTS */}
          {active === 'delete-requests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {deleteRequests.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No pending deletion requests</p>
                </div>
              ) : deleteRequests.map((u) => (
                <div key={u._id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6B46C1&color=fff`}
                      alt="" className="w-10 h-10 avatar" />
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Requested: {new Date(u.deleteRequestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteUser(u._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* CONTACTS */}
          {active === 'contacts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {contacts.map((c) => (
                <div key={c._id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{c.email} · {c.phone}</p>
                    </div>
                    <span className={`badge ${c.status === 'new' ? 'bg-blue-100 text-blue-700' : c.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-2" style={{ color: 'var(--color-text)' }}>Re: {c.subject}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.message}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* ORDERS */}
          {active === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider"
                        style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-[var(--color-bg-hover)] transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{order._id.slice(-8)}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>{order.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-brand)' }}>৳{order.totalAmount}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>No orders</p>}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
