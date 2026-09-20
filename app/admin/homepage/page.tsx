'use client'

import { useEffect, useState, useCallback } from 'react'

/* ─────────────────────────── Types ─────────────────────────── */
interface HeroStat  { value: string; label: string }
interface StatCard  { icon: string; value: number; suffix: string; label: string }
interface TileCard  { title: string; color: string; icon: string; audience: string[] }

interface HomepageSettings {
  ticker_enabled: boolean
  ticker_text: string
  ticker_color: string
  ticker_bg: string
  hero_stats: HeroStat[]
  stats_section: StatCard[]
  service_tiles: TileCard[]
}

const AUDIENCE_OPTIONS = ['all', 'students', 'professionals', 'businesses', 'government']

/* ─────────────────────── Shared Styles ─────────────────────── */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-1)',
  border: '1px solid var(--color-hairline-soft)',
  borderRadius: 'var(--radius-xl)',
  padding: 24,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--color-ink-muted)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-hairline)',
  backgroundColor: 'var(--color-surface-2)',
  color: 'var(--color-ink)',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'var(--font-inter, "Inter", sans-serif)',
}

/* ─────────────────────────── Save Button ─────────────────────── */
function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        padding: '10px 24px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: saving ? 'var(--color-surface-2)' : 'var(--color-accent-blue)',
        color: saving ? 'var(--color-ink-muted)' : '#fff',
        border: 'none',
        fontWeight: 700,
        fontSize: 13,
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {saving ? '⏳ Saving…' : '💾 Save Changes'}
    </button>
  )
}

/* ──────────────────────── Main Page ────────────────────────── */
export default function HomepageStylingPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ticker' | 'hero' | 'numbers' | 'tiles'>('ticker')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  /* ── Fetch current settings ── */
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/homepage-settings')
      const data = await res.json()
      setSettings(data)
    } catch {
      setError('Failed to load homepage settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Save ── */
  const save = async () => {
    if (!settings) return
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/homepage-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const update = (patch: Partial<HomepageSettings>) =>
    setSettings(prev => prev ? { ...prev, ...patch } : prev)

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  )

  if (!settings) return <p style={{ color: '#ef4444' }}>{error || 'Could not load settings.'}</p>

  /* ── Tab definitions ── */
  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'ticker',  label: 'Ticker Banner',         icon: '📢' },
    { key: 'hero',    label: 'Hero Stats',             icon: '🏠' },
    { key: 'numbers', label: 'Numbers That Speak',     icon: '📊' },
    { key: 'tiles',   label: 'Service Tiles',          icon: '🛍️' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 4 }}>
            🏠 Homepage Styling
          </h1>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>
            Edit ticker banner, hero stats, Numbers That Speak, and service tiles.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && (
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✅ Saved!
            </span>
          )}
          {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
          <SaveBtn saving={saving} onClick={save} />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: 4, backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-lg)', padding: 4 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)',
              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              backgroundColor: activeTab === t.key ? 'var(--color-accent-blue)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--color-ink-muted)',
              transition: 'all 0.18s',
            }}
          >
            <span>{t.icon}</span>
            <span style={{ display: 'none' }} className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════ TICKER TAB ══════════════════ */}
      {activeTab === 'ticker' && (
        <div style={cardStyle}>
          <h2 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700, marginBottom: 20 }}>
            📢 Ticker / News Banner
          </h2>

          {/* Preview */}
          {settings.ticker_enabled && (
            <div style={{
              marginBottom: 24, padding: '0 16px',
              backgroundColor: settings.ticker_bg || '#0d0d0d',
              borderRadius: 'var(--radius-md)',
              height: 36, display: 'flex', alignItems: 'center',
              overflow: 'hidden', border: `1px solid ${settings.ticker_color}30`,
              position: 'relative',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: settings.ticker_color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Preview: {settings.ticker_text}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Enable toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => update({ ticker_enabled: !settings.ticker_enabled })}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  backgroundColor: settings.ticker_enabled ? 'var(--color-accent-blue)' : 'var(--color-surface-2)',
                  position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: '#fff', transition: 'left 0.2s',
                  left: settings.ticker_enabled ? 22 : 2,
                }} />
              </button>
              <label className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                {settings.ticker_enabled ? '✅ Ticker is enabled on homepage' : '❌ Ticker is disabled'}
              </label>
            </div>

            {/* Text */}
            <div>
              <label style={labelStyle}>Ticker Text</label>
              <textarea
                value={settings.ticker_text}
                rows={3}
                onChange={e => update({ ticker_text: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Enter the text to scroll in the ticker..."
              />
              <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 4 }}>
                Separate multiple items with • or – for readability.
              </p>
            </div>

            {/* Colors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={settings.ticker_color}
                    onChange={e => update({ ticker_color: e.target.value })}
                    style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-hairline)', cursor: 'pointer', padding: 2 }}
                  />
                  <input
                    type="text"
                    value={settings.ticker_color}
                    onChange={e => update({ ticker_color: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="#FF6B35"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={settings.ticker_bg || '#0d0d0d'}
                    onChange={e => update({ ticker_bg: e.target.value })}
                    style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-hairline)', cursor: 'pointer', padding: 2 }}
                  />
                  <input
                    type="text"
                    value={settings.ticker_bg || '#0d0d0d'}
                    onChange={e => update({ ticker_bg: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="#0d0d0d"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ HERO STATS TAB ══════════════════ */}
      {activeTab === 'hero' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>
              🏠 Hero Section Stats
            </h2>
            <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>These appear below the main CTA in the hero</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {settings.hero_stats.map((stat, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end', padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)' }}>
                <div>
                  <label style={labelStyle}>Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => {
                      const updated = [...settings.hero_stats]
                      updated[i] = { ...updated[i], value: e.target.value }
                      update({ hero_stats: updated })
                    }}
                    style={inputStyle}
                    placeholder="500+"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => {
                      const updated = [...settings.hero_stats]
                      updated[i] = { ...updated[i], label: e.target.value }
                      update({ hero_stats: updated })
                    }}
                    style={inputStyle}
                    placeholder="Projects Completed"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = settings.hero_stats.filter((_, idx) => idx !== i)
                    update({ hero_stats: updated })
                  }}
                  style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid #7f1d1d', backgroundColor: '#1a0808', color: '#f87171', cursor: 'pointer', fontSize: 14 }}
                  title="Remove stat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {settings.hero_stats.length < 6 && (
            <button
              onClick={() => update({ hero_stats: [...settings.hero_stats, { value: 'NEW', label: 'New Metric' }] })}
              style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-hairline)', backgroundColor: 'transparent', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              + Add Stat Card
            </button>
          )}
        </div>
      )}

      {/* ══════════════════ NUMBERS THAT SPEAK TAB ══════════════════ */}
      {activeTab === 'numbers' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>
              📊 Numbers That Speak
            </h2>
            <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>Animated counters in the stats section</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {settings.stats_section.map((stat, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 60px 2fr auto', gap: 10, alignItems: 'end', padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)' }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <input
                    type="text"
                    value={stat.icon}
                    onChange={e => {
                      const updated = [...settings.stats_section]
                      updated[i] = { ...updated[i], icon: e.target.value }
                      update({ stats_section: updated })
                    }}
                    style={{ ...inputStyle, textAlign: 'center', fontSize: 18 }}
                    placeholder="🏆"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Number</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={e => {
                      const updated = [...settings.stats_section]
                      updated[i] = { ...updated[i], value: Number(e.target.value) }
                      update({ stats_section: updated })
                    }}
                    style={inputStyle}
                    placeholder="500"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Suffix</label>
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={e => {
                      const updated = [...settings.stats_section]
                      updated[i] = { ...updated[i], suffix: e.target.value }
                      update({ stats_section: updated })
                    }}
                    style={inputStyle}
                    placeholder="+  or  %"
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => {
                      const updated = [...settings.stats_section]
                      updated[i] = { ...updated[i], label: e.target.value }
                      update({ stats_section: updated })
                    }}
                    style={inputStyle}
                    placeholder="Projects Completed"
                  />
                </div>
                <button
                  onClick={() => update({ stats_section: settings.stats_section.filter((_, idx) => idx !== i) })}
                  style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid #7f1d1d', backgroundColor: '#1a0808', color: '#f87171', cursor: 'pointer', fontSize: 14 }}
                  title="Remove stat"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {settings.stats_section.length < 8 && (
            <button
              onClick={() => update({ stats_section: [...settings.stats_section, { icon: '🌟', value: 100, suffix: '+', label: 'New Metric' }] })}
              style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-hairline)', backgroundColor: 'transparent', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              + Add Stat Counter
            </button>
          )}
        </div>
      )}

      {/* ══════════════════ SERVICE TILES TAB ══════════════════ */}
      {activeTab === 'tiles' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>
              🛍️ Homepage Service Tiles
            </h2>
            <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>Service categories shown on homepage with audience filters</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settings.service_tiles.map((tile, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', border: `1px solid ${tile.color}25`, position: 'relative' }}>
                {/* Left accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: tile.color, borderRadius: '3px 0 0 3px' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Icon</label>
                    <input
                      type="text"
                      value={tile.icon}
                      onChange={e => {
                        const updated = [...settings.service_tiles]
                        updated[i] = { ...updated[i], icon: e.target.value }
                        update({ service_tiles: updated })
                      }}
                      style={{ ...inputStyle, textAlign: 'center', fontSize: 18 }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Service Title</label>
                    <input
                      type="text"
                      value={tile.title}
                      onChange={e => {
                        const updated = [...settings.service_tiles]
                        updated[i] = { ...updated[i], title: e.target.value }
                        update({ service_tiles: updated })
                      }}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="color"
                        value={tile.color}
                        onChange={e => {
                          const updated = [...settings.service_tiles]
                          updated[i] = { ...updated[i], color: e.target.value }
                          update({ service_tiles: updated })
                        }}
                        style={{ width: 32, height: 32, border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 2 }}
                      />
                      <input
                        type="text"
                        value={tile.color}
                        onChange={e => {
                          const updated = [...settings.service_tiles]
                          updated[i] = { ...updated[i], color: e.target.value }
                          update({ service_tiles: updated })
                        }}
                        style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Audience tags */}
                <div>
                  <label style={labelStyle}>Audience Tags (who sees this tile)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {AUDIENCE_OPTIONS.map(aud => {
                      const active = tile.audience.includes(aud)
                      return (
                        <button
                          key={aud}
                          onClick={() => {
                            const updated = [...settings.service_tiles]
                            const audiences = active
                              ? tile.audience.filter(a => a !== aud)
                              : [...tile.audience, aud]
                            updated[i] = { ...updated[i], audience: audiences }
                            update({ service_tiles: updated })
                          }}
                          style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                            fontSize: 11, fontWeight: 600, border: `1px solid ${active ? tile.color : 'var(--color-hairline)'}`,
                            backgroundColor: active ? `${tile.color}20` : 'transparent',
                            color: active ? tile.color : 'var(--color-ink-muted)',
                            cursor: 'pointer', textTransform: 'capitalize',
                          }}
                        >
                          {active ? '✓ ' : ''}
                          {aud}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => update({ service_tiles: settings.service_tiles.filter((_, idx) => idx !== i) })}
                  style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 'var(--radius-sm)', border: '1px solid #7f1d1d', backgroundColor: '#1a0808', color: '#f87171', cursor: 'pointer', fontSize: 12 }}
                  title="Remove tile"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {settings.service_tiles.length < 12 && (
            <button
              onClick={() => update({ service_tiles: [...settings.service_tiles, { title: 'New Service', icon: '⭐', color: '#6a4cf5', audience: ['all'] }] })}
              style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-hairline)', backgroundColor: 'transparent', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              + Add Service Tile
            </button>
          )}
        </div>
      )}

      {/* ── Bottom Save ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 40 }}>
        {saved && <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, alignSelf: 'center' }}>✅ All changes saved!</span>}
        {error && <span style={{ fontSize: 12, color: '#ef4444', alignSelf: 'center' }}>{error}</span>}
        <SaveBtn saving={saving} onClick={save} />
      </div>

      <style>{`
        @media (min-width: 640px) { .tab-label { display: inline !important; } }
      `}</style>
    </div>
  )
}
