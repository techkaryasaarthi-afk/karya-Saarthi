'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false, loading: () => <div className="h-[400px] bg-slate-50 rounded-xl animate-pulse" /> })

interface Category {
  id: number
  name: string
  slug: string
}

export default function NewBlogPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const featuredImgRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: '',
    featured_image: '',
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: '',
  })

  useEffect(() => {
    fetch('/api/blogs/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }, [])

  const handleFeaturedImageUpload = async (file: File) => {
    setUploadingImg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/blogs/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        setForm(f => ({ ...f, featured_image: data.url }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch {
      alert('Image upload failed')
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id ? Number(form.category_id) : null,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      router.push('/admin/blogs')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-heading">📝 New Blog Post</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new blog article with rich content, images, and formatting</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            placeholder="Enter blog title"
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 focus:outline-none text-sm"
          />
        </div>

        {/* Rich Text Content */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Content * <span className="font-normal text-slate-400">(use toolbar to insert images, headings, lists, tables, etc.)</span>
          </label>
          <RichTextEditor
            content={form.content}
            onChange={(html) => setForm(f => ({ ...f, content: html }))}
            placeholder="Start writing your amazing blog post..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={3}
            placeholder="Short description shown in blog listings and search results"
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 focus:outline-none text-sm"
          />
        </div>

        {/* Category + Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g., thesis, education, tips"
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-navy focus:ring-2 focus:ring-navy/10 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Featured Image — URL + Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Featured Image</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={form.featured_image}
                onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
                placeholder="Paste image URL, or click Upload Image →"
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-navy focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => featuredImgRef.current?.click()}
                disabled={uploadingImg}
                className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
              >
                {uploadingImg ? '⏳ Uploading…' : '📁 Upload Image'}
              </button>
            </div>
            <input
              ref={featuredImgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFeaturedImageUpload(f) }}
            />
            {form.featured_image && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.featured_image}
                  alt="Featured preview"
                  className="h-36 rounded-xl object-cover border border-slate-200 shadow-sm"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, featured_image: '' }))}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center cursor-pointer hover:bg-red-600 shadow"
                >✕</button>
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
          <h3 className="font-semibold text-navy text-sm">🔍 SEO Settings</h3>
          <input
            type="text"
            value={form.meta_title}
            onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
            placeholder="Meta Title (defaults to blog title if empty)"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none text-sm"
          />
          <textarea
            value={form.meta_description}
            onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
            rows={2}
            placeholder="Meta Description (shown in Google search results)"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none text-sm"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
              className="rounded accent-green-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">Publish immediately</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="rounded accent-orange-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">Featured post</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-accent text-white font-bold shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? '⏳ Saving...' : form.is_published ? '🚀 Publish Blog' : '💾 Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
