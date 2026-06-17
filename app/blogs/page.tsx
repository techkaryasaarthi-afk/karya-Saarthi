'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import PageCTABanner from '@/components/PageCTABanner'

interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string
  is_featured: boolean
  views: number
  created_at: string
  published_at: string | null
  category: { id: number; name: string; slug: string } | null
  author: { id: number; fullname: string } | null
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/blogs?public=true').then(r => r.json()),
      fetch('/api/blogs/categories').then(r => r.json()),
    ]).then(([blogData, catData]) => {
      setBlogs(blogData.blogs || [])
      setCategories(catData.categories || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = blogs
    if (activeCategory !== 'All') result = result.filter(b => b.category?.name === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q))
    }
    return result
  }, [blogs, activeCategory, search])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pb-20">
        {/* Hero Header */}
        <div className="bg-[var(--color-surface-1)] pt-24 pb-12 px-4 border-b border-[var(--color-hairline-soft)] text-[var(--color-ink)]">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)] text-sm font-semibold mb-4">
                📝 Blog & Resources
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold font-heading mb-3 text-[var(--color-ink)]">
                Insights &amp; Expert Guides
              </h1>
              <p className="text-[var(--color-ink-muted)] text-lg max-w-2xl">
                Practical tips, in-depth guides, and industry insights from the Karya Saarthi team.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {/* Search + Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-sm px-5 py-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors text-sm font-body"
            />
            <div className="flex flex-wrap gap-2">
              {['All', ...(categories.length > 0
                ? categories.map(c => c.name)
                : ['Academic', 'Technology', 'Marketing', 'Career', 'Business']
              )].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer font-heading ${
                    activeCategory === cat
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)]'
                      : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)] border border-transparent hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blog count */}
          {!loading && (
            <p className="text-sm text-[var(--color-ink-muted)] mb-6 font-medium">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[var(--color-surface-1)] rounded-2xl animate-pulse border border-[var(--color-hairline)]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <span className="text-5xl block mb-4">{blogs.length === 0 ? '✍️' : '🔍'}</span>
              {blogs.length === 0 ? (
                <>
                  <p className="font-semibold text-slate-600 text-lg">Blog articles coming soon!</p>
                  <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                    Our team is crafting insightful articles on academics, technology, business & more. Check back shortly!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">No articles match your search.</p>
                  <button
                    onClick={() => { setSearch(''); setActiveCategory('All') }}
                    className="mt-4 px-5 py-2 rounded-xl bg-navy text-white text-sm font-bold cursor-pointer hover:opacity-90"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Square card grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((b, i) => (
                <Link key={b.id} href={`/blogs/${b.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="group cursor-pointer"
                  >
                    <div
                      className={`aspect-square rounded-2xl overflow-hidden relative flex flex-col justify-end p-4 shadow-sm border border-[var(--color-hairline-soft)] hover:border-[var(--color-hairline)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                        b.is_featured ? 'bg-[#6a4cf5]' : 'bg-[var(--color-surface-1)]'
                      }`}
                    >
                      {/* Background pattern */}
                      <div
                        className="absolute inset-0 opacity-5"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 70% 30%, currentColor 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />

                      {/* Featured badge */}
                      {b.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/20 text-white text-[9px] font-bold">
                          ⭐ FEATURED
                        </span>
                      )}

                      {/* Category chip */}
                      <div className="relative z-10">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mb-2 uppercase tracking-wider ${
                            b.is_featured ? 'bg-black/20 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-accent-blue)]'
                          }`}
                        >
                          {b.category?.name || 'General'}
                        </span>
                        <h3
                          className={`font-bold text-sm leading-snug line-clamp-3 font-heading group-hover:opacity-80 transition-opacity ${
                            b.is_featured ? 'text-white' : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {b.title}
                        </h3>
                        <div className={`flex items-center gap-2 mt-2 text-[10px] ${b.is_featured ? 'text-white/70' : 'text-[var(--color-ink-muted)]'}`}>
                          <span>{new Date(b.published_at || b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>·</span>
                          <span>{b.views} views</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <PageCTABanner
        headline="Have a Project in Mind?"
        subtext="From academic writing to website development — our experts are ready. Get a free quote within 30 minutes!"
        primaryLabel="Get Free Quote →"
        primaryHref="/contact"
        secondaryLabel="💬 WhatsApp Us"
        secondaryHref="https://wa.me/918595025753"
        variant="violet"
      />
      <Footer />

    </>
  )
}

const CAT_COLOR_MAP: Record<string, string> = {
  'Technology': '#3B82F6',
  'Business': '#10B981',
  'Design': '#EC4899',
  'Marketing': '#EF4444',
  'Academic': '#8B5CF6',
  'Government': '#F59E0B',
  'Legal': '#6B7280',
  'Career': '#FF6B35',
}

function getCatColor(name?: string | null): string {
  if (!name) return '#1B3A6B'
  return CAT_COLOR_MAP[name] || '#1B3A6B'
}

