'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  ImageIcon,
  X,
  Save,
  Search
} from 'lucide-react'

interface Series {
  id: string
  title: string
  hero_image_url?: string | null
  cover_art_url?: string
  backdrop_url?: string
  created_at: string
  updated_at: string
}

export default function HeroImagesManagementPage() {
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [heroImages, setHeroImages] = useState<Record<string, string | null>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSeries()
  }, [])

  async function fetchSeries() {
    try {
      const { data: series, error } = await supabase
        .from('series')
        .select('*')
        .order('title')

      if (error) throw error

      if (series) {
        setAllSeries(series)
        // Initialize hero images map
        const heroMap: Record<string, string | null> = {}
        series.forEach(s => {
          heroMap[s.id] = s.hero_image_url || null
        })
        setHeroImages(heroMap)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      setMessage({ type: 'error', text: 'Failed to load series' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      // Update all series with new hero image URLs
      for (const [seriesId, url] of Object.entries(heroImages)) {
        const { error } = await supabase
          .from('series')
          .update({ hero_image_url: url || null })
          .eq('id', seriesId)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'All hero images saved successfully!' })
    } catch (error) {
      console.error('Error saving hero images:', error)
      setMessage({ type: 'error', text: 'Failed to save hero images' })
    } finally {
      setSaving(false)
    }
  }

  function handleUrlChange(seriesId: string, url: string) {
    setHeroImages(prev => ({
      ...prev,
      [seriesId]: url || null
    }))
  }

  function handleClear(seriesId: string) {
    setHeroImages(prev => ({
      ...prev,
      [seriesId]: null
    }))
  }

  function handleResetAll() {
    const heroMap: Record<string, string | null> = {}
    allSeries.forEach(s => {
      heroMap[s.id] = s.hero_image_url || null
    })
    setHeroImages(heroMap)
    setMessage(null)
  }

  // Filter series based on search query
  const filteredSeries = allSeries.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-8 h-8 text-teal-500" />
              Hero Image Management
            </h1>
          </div>
        </div>
        <p className="text-gray-400">Customize hero banner images for each series</p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 text-green-400 border border-green-700'
              : 'bg-red-900/20 text-red-400 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Series List */}
        <div className="space-y-4 mb-8">
          {filteredSeries.map((series) => (
            <div key={series.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Series Info */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-white mb-2">{series.title}</h3>
                  <p className="text-gray-400 text-sm">ID: {series.id.slice(0, 8)}...</p>
                </div>

                {/* URL Input */}
                <div className="flex flex-col justify-center">
                  <input
                    type="text"
                    placeholder="Paste hero image URL..."
                    value={heroImages[series.id] || ''}
                    onChange={(e) => handleUrlChange(series.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">From Bunny CDN or other sources</p>
                </div>

                {/* Preview & Actions */}
                <div className="flex items-center gap-3">
                  {heroImages[series.id] && (
                    <img
                      src={heroImages[series.id]}
                      alt={series.title}
                      className="w-20 h-32 object-cover rounded border border-gray-600"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleClear(series.id)}
                    disabled={!heroImages[series.id]}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No series found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
          <button
            onClick={handleResetAll}
            disabled={saving}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
