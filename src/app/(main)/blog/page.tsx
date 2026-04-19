'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Eye, Heart, BookOpen, Tag } from 'lucide-react';
import { format } from 'date-fns';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import api from '@/lib/api';

const CATEGORIES = ['All', 'News', 'Technology', 'Community', 'Health', 'Education', 'Sports', 'Culture'];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [lang, setLang] = useState<'en' | 'bn' | ''>('');

  useEffect(() => { fetchBlogs(); }, [category, lang]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (lang) params.set('language', lang);
      const { data } = await api.get(`/blogs?${params}`);
      setBlogs(data.blogs || []);
    } catch { setBlogs([]); } finally { setLoading(false); }
  };

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        {/* Hero */}
        <div className="gradient-brand text-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-4xl font-bold mb-2">Blog</h1>
            <p className="text-purple-100">Insights, stories, and updates — in English & বাংলা</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                    ${(category === cat) || (cat === 'All' && !category) ? 'gradient-brand text-white' : 'btn-secondary'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {[['', 'All'], ['en', 'English'], ['bn', 'বাংলা']].map(([v, l]) => (
                <button key={v} onClick={() => setLang(v as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${lang === v ? 'gradient-brand text-white' : 'btn-secondary'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="rounded-xl mb-3 h-48" style={{ background: 'var(--color-border)' }} />
                  <div className="space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="card text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>No blogs yet</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <Link href={`/blog/${featured.slug}`}
                    className="card group flex flex-col md:flex-row gap-5 hover:shadow-card-hover transition-all hover:-translate-y-0.5 p-0 overflow-hidden">
                    <div className="md:w-1/2 h-60 md:h-auto overflow-hidden flex-shrink-0">
                      {featured.image ? (
                        <img src={featured.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full gradient-brand flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      {featured.isFeatured && (
                        <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 mb-3 inline-flex">★ Featured</span>
                      )}
                      <span className="badge mb-3 mr-2 inline-flex" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}>
                        {featured.category}
                      </span>
                      <h2 className="font-heading text-2xl font-bold mb-3 group-hover:text-[var(--color-brand)] transition-colors"
                        style={{ color: 'var(--color-text)' }}>{featured.title}</h2>
                      {featured.excerpt && (
                        <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <div className="flex items-center gap-1.5">
                          <img src={featured.author?.avatar || `https://ui-avatars.com/api/?name=A&background=6B46C1&color=fff`}
                            alt="" className="w-5 h-5 avatar" />
                          {featured.author?.name}
                        </div>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featured.readTime || 3} min read</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featured.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {featured.likes?.length || 0}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Rest */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((blog, i) => (
                  <motion.div key={blog._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/blog/${blog.slug}`}
                      className="card group block hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 h-full p-0 overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        {blog.image ? (
                          <img src={blog.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full gradient-brand flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-white opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge text-xs" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}>
                            {blog.category}
                          </span>
                          {blog.language === 'bn' && (
                            <span className="badge text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">বাংলা</span>
                          )}
                        </div>
                        <h3 className="font-heading font-semibold text-base mb-2 line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors"
                          style={{ color: 'var(--color-text)' }}>{blog.title}</h3>
                        {blog.excerpt && (
                          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{blog.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          <div className="flex items-center gap-1.5">
                            <img src={blog.author?.avatar || `https://ui-avatars.com/api/?name=A&background=6B46C1&color=fff`}
                              alt="" className="w-5 h-5 avatar" />
                            {blog.author?.name}
                          </div>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime || 3}m</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
