'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Trophy,
  X,
  Save
} from 'lucide-react'

interface Series {
  id: string
  title: string
  cover_art_url?: string
  backdrop_url?: string
  top_10_rank?: number | null
  top_10_thumbnail_url?: string | null
  created_at: string
  updated_at: string
}

export default function Top10ManagementPage() {
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [top10Series, setTop10Series] = useState<(Series | null)[]>(Array(10).fill(null))
  const [thumbnailUrls, setThumbnailUrls] = useState<(string | null)[]>(Array(10).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSeries()
  }, [])

  async function fetchSeries() {
    try {
      // Fetch all series
      const { data: series, error } = await supabase
        .from('series')
        .select('*')
        .order('title')

      if (error) throw error

      if (series) {
        setAllSeries(series)

        // Build top 10 array from ranked series
        const ranked = Array(10).fill(null)
        series.forEach(s => {
          if (s.top_10_rank && s.top_10_rank >= 1 && s.top_10_rank <= 10) {
            ranked[s.top_10_rank - 1] = s
          }
        })
        setTop10Series(ranked)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      setMessage({ type: 'error', text: 'Failed to load series' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectSeries(slot: number, seriesId: string) {
    if (!seriesId) {
      // Remove from slot
      const newTop10 = [...top10Series]
      newTop10[slot] = null
      setTop10Series(newTop10)
      return
    }

    const series = allSeries.find(s => s.id === seriesId)
    if (series) {
      const newTop10 = [...top10Series]
      // Remove series from any other slot it might be in
      for (let i = 0; i < newTop10.length; i++) {
        if (newTop10[i]?.id === seriesId) {
          newTop10[i] = null
        }
      }
      newTop10[slot] = series
      setTop10Series(newTop10)
    }
  }

  function handleThumbnailUrlChange(slot: number, url: string) {
    const newUrls = [...thumbnailUrls]
    newUrls[slot] = url || null
    setThumbnailUrls(newUrls)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      // First, clear all top_10_rank values
      await supabase
        .from('series')
        .update({ top_10_rank: null })
        .not('top_10_rank', 'is', null)

      // Then set the new rankings and thumbnails
      for (let i = 0; i < top10Series.length; i++) {
        const series = top10Series[i]
        if (series) {
          await supabase
            .from('series')
            .update({
              top_10_rank: i + 1,
              top_10_thumbnail_url: thumbnailUrls[i] || null
            })
            .eq('id', series.id)
        }
      }

      setMessage({ type: 'success', text: 'Top 10 saved successfully!' })

      // Refresh data
      await fetchSeries()
    } catch (error) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: 'Failed to save Top 10' })
    } finally {
      setSaving(false)
    }
  }

  function getAvailableSeries(currentSlot: number) {
    // Get series not in other slots
    const usedIds = top10Series
      .filter((s, i) => s && i !== currentSlot)
      .map(s => s!.id)

    return allSeries.filter(s => !usedIds.includes(s.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-6 border-r border-gray-800">
          <h1 className="text-xl font-bold text-white mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Dashboard
            </Link>
            <Link href="/admin/videos" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Videos
            </Link>
            <Link href="/admin/series" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Series
            </Link>
            <Link href="/admin/top10" className="flex items-center gap-3 px-4 py-2 text-white bg-gray-800 rounded-lg">
              <Trophy className="w-5 h-5" />
              Top 10
            </Link>
          </nav>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Back to Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Top 10 Management
                  </h1>
                  <p className="text-gray-400 mt-1">Select and rank your top 10 series</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 disabled:opacity-50 transition"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Top 10'}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Top 10 Slots */}
            <div className="space-y-4">
              {top10Series.map((series, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>

                    {/* Series Selector */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Series
                      </label>
                      <select
                        value={series?.id || ''}
                        onChange={(e) => handleSelectSeries(index, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">-- Select a series --</option>
                        {getAvailableSeries(index).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                        {series && (
                          <option value={series.id}>{series.title}</option>
                        )}
                      </select>
                    </div>

                    {/* Thumbnail URL Input */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thumbnail URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={thumbnailUrls[index] || ''}
                        onChange={(e) => handleThumbnailUrlChange(index, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-600"
                      />
                    </div>

                    {/* Thumbnail Preview */}
                    {series && (
                      <div className="flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preview
                        </label>
                        <div className="w-40 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                          {thumbnailUrls[index] ? (
                            <img
                              src={thumbnailUrls[index]!}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                              onError={() => {
                                setMessage({ type: 'error', text: 'Failed to load thumbnail image' })
                              }}
                            />
                          ) : series.cover_art_url || series.backdrop_url ? (
                            <img
                              src={series.cover_art_url || series.backdrop_url || ''}
                              alt={series.title}
                              className="w-full h-full object-cover opacity-50"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center">
                              Paste URL above
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    {series && (
                      <button
                        onClick={() => handleSelectSeries(index, '')}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 transition"
                        title="Remove from Top 10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-2">Instructions</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Select series for each Top 10 position (1-10)</li>
                <li>• Paste thumbnail URLs (horizontal/widescreen images work best)</li>
                <li>• Preview appears as you type the URL</li>
                <li>• Each series can only appear once in the Top 10</li>
                <li>• Click "Save Top 10" to apply your changes</li>
                <li>• The Top 10 section on your home page will update immediately</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
