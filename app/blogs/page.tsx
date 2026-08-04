'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageCTABanner from '@/components/PageCTABanner'

interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  is_featured: boolean
  views: number
  created_at: string
  published_at: string | null
  category: { id: number; name: string; slug: string } | null
  author: { id: number; fullname: string; avatar_url?: string | null } | null
  tags?: string[]
  content?: string
}

interface Category {
  id: number
  name: string
  slug: string
}

// Category → gradient
const CAT_GRADIENTS: Record<string, string> = {
  Technology:   'from-blue-600 to-indigo-700',
  Academic:     'from-violet-600 to-purple-700',
  Business:     'from-emerald-600 to-teal-700',
  Marketing:    'from-rose-600 to-pink-700',
  Career:       'from-orange-500 to-amber-600',
  Design:       'from-pink-500 to-fuchsia-600',
  Government:   'from-yellow-600 to-orange-600',
  Legal:        'from-slate-600 to-gray-700',
  Educational:  'from-cyan-600 to-blue-700',
  General:      'from-[#6a4cf5] to-[#d44df0]',
}

const CAT_COLORS: Record<string, string> = {
  Technology: '#3B82F6', Academic: '#8B5CF6', Business: '#10B981',
  Marketing: '#EF4444', Career: '#FF6B35', Design: '#EC4899',
  Government: '#F59E0B', Legal: '#6B7280', Educational: '#0EA5E9', General: '#6a4cf5',
}

function getCatGradient(name?: string | null) {
  return CAT_GRADIENTS[name || ''] || 'from-[#6a4cf5] to-[#d44df0]'
}
function getCatColor(name?: string | null) {
  return CAT_COLORS[name || ''] || '#6a4cf5'
}

// Estimate reading time from excerpt/content
function readingTime(text?: string | null) {
  if (!text) return '1 min read'
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function AuthorAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, background: 'linear-gradient(135deg,#6a4cf5,#d44df0)' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ──────────────────────────────────────────────
   FEATURED HERO CARD (large, top of page)
────────────────────────────────────────────── */
function HeroCard({ blog }: { blog: Blog }) {
  const catColor = getCatColor(blog.category?.name)
  const gradient = getCatGradient(blog.category?.name)

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative rounded-3xl overflow-hidden cursor-pointer mb-12 shadow-2xl"
        style={{ minHeight: 420 }}
      >
        {/* Background: image or gradient */}
        {blog.featured_image ? (
          <div className="absolute inset-0">
            <Image src={blog.featured_image} alt={blog.title} fill sizes="100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </div>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-end h-full min-h-[420px]">
          <div className="mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white" style={{ background: `${catColor}cc` }}>
                {blog.category?.name || 'Featured'}
              </span>
              <span className="text-white/60 text-xs">⭐ Featured</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading leading-tight mb-3 group-hover:opacity-90 transition-opacity max-w-3xl">
              {blog.title}
            </h2>
            {blog.excerpt && (
              <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl line-clamp-2">{blog.excerpt}</p>
            )}
            <div className="flex items-center gap-3">
              {blog.author && <AuthorAvatar name={blog.author.fullname} size={32} />}
              <div className="text-white/80 text-sm">
                {blog.author && <span className="font-semibold text-white mr-2">{blog.author.fullname}</span>}
                <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">·</span>
                <span>{readingTime(blog.excerpt)}</span>
                <span className="mx-2">·</span>
                <span>{blog.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/* ──────────────────────────────────────────────
   STANDARD BLOG CARD (Medium-style horizontal)
────────────────────────────────────────────── */
function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const catColor = getCatColor(blog.category?.name)
  const gradient = getCatGradient(blog.category?.name)

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer border border-[var(--color-hairline-soft)] bg-[var(--color-surface-1)] hover:border-[var(--color-hairline)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {blog.featured_image ? (
            <>
              <Image src={blog.featured_image} alt={blog.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            /* Stylish gradient placeholder */
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="text-center">
                <span className="text-5xl opacity-20 block">✍️</span>
              </div>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          )}
          {/* Category pill over image */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
              style={{ background: `${catColor}ee`, backdropFilter: 'blur(4px)' }}>
              {blog.category?.name || 'General'}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          <h3 className="font-bold text-[var(--color-ink)] text-base leading-snug font-heading line-clamp-2 group-hover:text-[var(--color-accent-blue)] transition-colors mb-2">
            {blog.title}
          </h3>
          {blog.excerpt && (
            <p className="text-[var(--color-ink-muted)] text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
              {blog.excerpt}
            </p>
          )}
          {/* Footer */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[var(--color-hairline-soft)]">
            {blog.author && <AuthorAvatar name={blog.author.fullname} size={24} />}
            <div className="flex-1 min-w-0">
              {blog.author && (
                <p className="text-[var(--color-ink)] text-[11px] font-semibold truncate">{blog.author.fullname}</p>
              )}
              <p className="text-[var(--color-ink-muted)] text-[10px]">
                {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {' · '}{readingTime(blog.excerpt)}
                {' · '}{blog.views} views
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent-blue)] group-hover:translate-x-1 transition-all flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/* ──────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────── */
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

  const featured = useMemo(() => blogs.find(b => b.is_featured), [blogs])

  const filtered = useMemo(() => {
    let result = blogs.filter(b => !b.is_featured || activeCategory !== 'All' || search.trim())
    if (activeCategory !== 'All') result = blogs.filter(b => b.category?.name === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = blogs.filter(b => b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q))
    }
    return result
  }, [blogs, activeCategory, search])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20" style={{ background: 'var(--color-canvas)' }}>

        {/* Hero Header */}
        <div className="pt-24 pb-10 px-4 border-b border-[var(--color-hairline-soft)]"
          style={{ background: 'var(--color-surface-1)' }}>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)] text-sm font-semibold mb-4">
                ✍️ Blog &amp; Resources
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

          {/* Search + Category filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...(categories.length > 0 ? categories.map(c => c.name) : ['Academic', 'Technology', 'Marketing', 'Career', 'Business'])].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'text-white shadow-lg'
                      : 'bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] border border-[var(--color-hairline)] hover:border-[var(--color-ink-muted)]'
                  }`}
                  style={activeCategory === cat ? { background: getCatColor(cat === 'All' ? null : cat) } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-8">
              {/* Skeleton hero */}
              <div className="rounded-3xl bg-[var(--color-surface-1)] animate-pulse border border-[var(--color-hairline-soft)]" style={{ height: 420 }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-[var(--color-surface-1)] animate-pulse border border-[var(--color-hairline-soft)]" style={{ height: 320 }} />
                ))}
              </div>
            </div>

          ) : filtered.length === 0 && !featured ? (
            <div className="text-center py-32 text-[var(--color-ink-muted)]">
              <span className="text-6xl block mb-4">{blogs.length === 0 ? '✍️' : '🔍'}</span>
              {blogs.length === 0 ? (
                <>
                  <p className="font-bold text-[var(--color-ink)] text-xl mb-2">Blog articles coming soon!</p>
                  <p className="text-sm max-w-sm mx-auto">Our team is crafting insightful guides on academics, technology &amp; more. Check back shortly!</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-[var(--color-ink)] text-lg mb-4">No articles match your search.</p>
                  <button onClick={() => { setSearch(''); setActiveCategory('All') }}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--color-accent-blue)' }}>
                    Clear filters
                  </button>
                </>
              )}
            </div>

          ) : (
            <>
              {/* Article count */}
              <p className="text-sm text-[var(--color-ink-muted)] mb-6 font-medium">
                {activeCategory === 'All' && !search.trim() ? `${blogs.length} article${blogs.length !== 1 ? 's' : ''}` : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              </p>

              {/* Featured Hero — only on "All" with no search */}
              {featured && activeCategory === 'All' && !search.trim() && (
                <HeroCard blog={featured} />
              )}

              {/* Grid */}
              {filtered.length > 0 && (
                <>
                  {activeCategory === 'All' && !search.trim() && filtered.length > 0 && (
                    <h2 className="text-lg font-bold text-[var(--color-ink)] mb-5 font-heading flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--color-accent-blue)' }} />
                      Latest Articles
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((blog, i) => (
                      <BlogCard key={blog.id} blog={blog} index={i} />
                    ))}
                  </div>
                </>
              )}
            </>
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
