'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  author: { id: number; fullname: string } | null
}

const CAT_GRADIENTS: Record<string, string[]> = {
  Academic:    ['#6a4cf5', '#9747ff'],
  Technology:  ['#0ea5e9', '#2563eb'],
  Marketing:   ['#ef4444', '#e11d48'],
  Career:      ['#f59e0b', '#ea580c'],
  Business:    ['#10b981', '#0d9488'],
  Design:      ['#ec4899', '#a855f7'],
  Government:  ['#f59e0b', '#d97706'],
  Legal:       ['#475569', '#334155'],
}

function getCatGrad(name?: string | null) {
  return CAT_GRADIENTS[name || ''] || ['#6a4cf5', '#d44df0']
}

function readingTime(text?: string | null) {
  if (!text) return '1 min'
  const mins = Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200))
  return `${mins} min read`
}

// Placeholder blogs shown while real ones are being written
const SAMPLE_BLOGS: Blog[] = [
  {
    id: -1, slug: '#', is_featured: true, views: 0, featured_image: null,
    created_at: new Date().toISOString(), published_at: null,
    title: 'How to Write a Winning Research Paper: A Complete Guide',
    excerpt: 'From choosing a topic to structuring your arguments — a step-by-step guide for students and researchers.',
    category: { id: 1, name: 'Academic', slug: 'academic' }, author: null,
  },
  {
    id: -2, slug: '#', is_featured: false, views: 0, featured_image: null,
    created_at: new Date().toISOString(), published_at: null,
    title: 'Top 10 Digital Marketing Trends in 2025',
    excerpt: 'Stay ahead of the competition with the latest trends shaping the digital marketing landscape.',
    category: { id: 2, name: 'Marketing', slug: 'marketing' }, author: null,
  },
  {
    id: -3, slug: '#', is_featured: false, views: 0, featured_image: null,
    created_at: new Date().toISOString(), published_at: null,
    title: 'Why Every Student Needs a Campus Ambassador Program',
    excerpt: 'Discover the career benefits and networking opportunities of joining a campus ambassador program.',
    category: { id: 3, name: 'Career', slug: 'career' }, author: null,
  },
  {
    id: -4, slug: '#', is_featured: false, views: 0, featured_image: null,
    created_at: new Date().toISOString(), published_at: null,
    title: 'Web Development for Small Businesses: Where to Start',
    excerpt: 'A practical guide for small business owners looking to establish a strong online presence.',
    category: { id: 4, name: 'Technology', slug: 'technology' }, author: null,
  },
]

export default function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [usingSamples, setUsingSamples] = useState(false)

  useEffect(() => {
    fetch('/api/admin/blogs?public=true')
      .then(r => r.json())
      .then(d => {
        const real = (d.blogs || []).slice(0, 5)
        if (real.length > 0) {
          setBlogs(real)
          setUsingSamples(false)
        } else {
          setBlogs(SAMPLE_BLOGS)
          setUsingSamples(true)
        }
      })
      .catch(() => { setBlogs(SAMPLE_BLOGS); setUsingSamples(true) })
      .finally(() => setLoading(false))
  }, [])

  const featured = blogs.find(b => b.is_featured) || blogs[0]
  const rest = blogs.filter(b => b.id !== featured?.id).slice(0, 4)
  const [g1, g2] = getCatGrad(featured?.category?.name)

  return (
    <section id="blog" className="py-20 lg:py-28 bg-[var(--color-canvas)] border-t border-[var(--color-hairline-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-hairline)] text-sm font-semibold mb-4 font-heading">
              ✍️ Blog
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--color-ink)] font-heading">
              Insights &amp; Resources
            </h2>
            <p className="mt-3 text-[var(--color-ink-muted)] font-body max-w-lg">
              Expert tips, tutorials, and industry insights to help you succeed.
            </p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-all whitespace-nowrap font-heading"
          >
            View All Articles →
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-[var(--color-surface-2)] rounded-3xl animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-[var(--color-surface-2)] rounded-2xl animate-pulse border border-[var(--color-hairline-soft)]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {usingSamples && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm flex items-center gap-2">
                <span>✍️</span>
                <span>Our team is writing insightful articles — these are sample topics. <Link href="/blogs" className="underline font-semibold">Visit the blog page</Link> to stay updated.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── FEATURED large card (left, spans 2 cols) ── */}
              {featured && (
                <Link href={usingSamples ? '/blogs' : `/blogs/${featured.slug}`} className="lg:col-span-2">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer border border-[var(--color-hairline-soft)] hover:border-[var(--color-hairline)] hover:shadow-2xl transition-all duration-300"
                    style={{ minHeight: 380 }}
                  >
                    {/* Background: real image or gradient */}
                    {featured.featured_image ? (
                      <div className="absolute inset-0">
                        <Image
                          src={featured.featured_image}
                          alt={featured.title}
                          fill sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </div>
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                      >
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-end min-h-[380px]">
                      <div className="mt-auto">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 font-heading"
                          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
                        >
                          {featured.category?.name || 'Featured'}
                        </span>
                        <h3 className="text-2xl lg:text-3xl font-bold font-heading text-white leading-snug mb-3 group-hover:opacity-90 transition-opacity">
                          {featured.title}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-2 mb-5 max-w-xl">{featured.excerpt}</p>
                        {!usingSamples && (
                          <div className="flex items-center gap-3 text-white/60 text-xs">
                            {featured.author && <span className="font-semibold text-white/80">{featured.author.fullname}</span>}
                            {featured.author && <span>·</span>}
                            <span>{new Date(featured.published_at || featured.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>·</span>
                            <span>{readingTime(featured.excerpt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </Link>
              )}

              {/* ── SIDE STACK (right column) ── */}
              <div className="flex flex-col gap-4">
                {rest.slice(0, 3).map((post, i) => {
                  const [gc1, gc2] = getCatGrad(post.category?.name)
                  return (
                    <Link key={post.id} href={usingSamples ? '/blogs' : `/blogs/${post.slug}`}>
                      <motion.article
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="group flex gap-4 items-center bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-hairline-soft)] hover:border-[var(--color-hairline)] hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden p-0"
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 rounded-l-2xl overflow-hidden" style={{ width: 96, height: 96, minWidth: 96 }}>
                          {post.featured_image ? (
                            <Image src={post.featured_image} alt={post.title} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${gc1}, ${gc2})` }}>
                              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                            </div>
                          )}
                        </div>
                        {/* Text */}
                        <div className="flex-1 py-3 pr-4 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: gc1 }}>
                            {post.category?.name || 'Article'}
                          </span>
                          <h3 className="font-bold text-[var(--color-ink)] text-sm leading-snug mt-0.5 mb-1 line-clamp-2 font-heading group-hover:text-[var(--color-accent-blue)] transition-colors">
                            {post.title}
                          </h3>
                          {!usingSamples && (
                            <p className="text-[10px] text-[var(--color-ink-muted)]">
                              {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {' · '}{readingTime(post.excerpt)}
                            </p>
                          )}
                        </div>
                      </motion.article>
                    </Link>
                  )
                })}

                {/* "View all" pill */}
                <Link href="/blogs"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[var(--color-hairline)] text-[var(--color-ink-muted)] text-sm font-semibold hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition-all group"
                >
                  <span>Explore all articles</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>

            </div>
          </>
        )}
      </div>
    </section>
  )
}
