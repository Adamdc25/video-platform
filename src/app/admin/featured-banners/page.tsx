'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  X,
  Save,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface Series {
  id: string
  title: string
  hero_image_url?: string | null
  featured: boolean
  featured_order: number | null
  cover_art_url?: string
  backdrop_url?: string
  created_at: string
}

export default function FeaturedBannersPage() {
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [featuredBanners, setFeaturedBanners] = useState<(Series | null)[]>(Array(4).fill(null))
  const [bannerImages, setBannerImages] = useState<(string | null)[]>(Array(4).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch all series
      const { data: series, error } = await supabase
        .from('series')
        .select('*')
        .order('title')

      if (error) throw error

      if (series) {
        setAllSeries(series)

        // Fetch featured banners (ordered by featured_order)
        const featured = series
          .filter(s => s.featured)
          .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))

        const banners: (Series | null)[] = Array(4).fill(null)
        const images: (string | null)[] = Array(4).fill(null)

        featured.forEach((series, index) => {
          if (index < 4) {
            banners[index] = series
            images[index] = series.hero_image_url || null
          }
        })

        setFeaturedBanners(banners)
        setBannerImages(images)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      // Clear all featured flags first
      const { error: clearError } = await supabase
        .from('series')
        .update({ featured: false, featured_order: null })
        .eq('featured', true)

      if (clearError) throw clearError

      // Update selected banners
      for (let i = 0; i < featuredBanners.length; i++) {
        const series = featuredBanners[i]
        if (series) {
          const { error } = await supabase
            .from('series')
            .update({
              featured: true,
              featured_order: i + 1,
              hero_image_url: bannerImages[i] || null
            })
            .eq('id', series.id)

          if (error) throw error
        }
      }

      setMessage({ type: 'success', text: 'Featured banners saved successfully!' })
      fetchData()
    } catch (error) {
      console.error('Error saving banners:', error)
      setMessage({ type: 'error', text: 'Failed to save banners' })
    } finally {
      setSaving(false)
    }
  }

  function handleSelectSeries(slotIndex: number, series: Series) {
    // Check if series is already in another slot
    const alreadySelected = featuredBanners.findIndex(s => s?.id === series.id)
    if (alreadySelected !== -1 && alreadySelected !== slotIndex) {
      setMessage({ type: 'error', text: 'This series is already selected in another slot' })
      return
    }

    const newBanners = [...featuredBanners]
    newBanners[slotIndex] = series
    setFeaturedBanners(newBanners)

    const newImages = [...bannerImages]
    newImages[slotIndex] = series.hero_image_url || null
    setBannerImages(newImages)
  }

  function handleRemove(slotIndex: number) {
    const newBanners = [...featuredBanners]
    newBanners[slotIndex] = null
    setFeaturedBanners(newBanners)

    const newImages = [...bannerImages]
    newImages[slotIndex] = null
    setBannerImages(newImages)
  }

  function handleImageUrlChange(slotIndex: number, url: string) {
    const newImages = [...bannerImages]
    newImages[slotIndex] = url || null
    setBannerImages(newImages)
  }

  function handleMoveBanner(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= 4) return

    const newBanners = [...featuredBanners]
    const newImages = [...bannerImages]

    // Swap
    [newBanners[fromIndex], newBanners[toIndex]] = [newBanners[toIndex], newBanners[fromIndex]]
    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]]

    setFeaturedBanners(newBanners)
    setBannerImages(newImages)
  }

  function handleReset() {
    fetchData()
    setMessage(null)
  }

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
      <div className="bg-black border-b border-gray-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-teal-500" />
              Home Page Banners
            </h1>
          </div>
        </div>
        <p className="text-gray-400">Select and customize 4 featured banners for the home page carousel</p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
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

        {/* Banner Slots */}
        <div className="space-y-6 mb-8">
          {Array.from({ length: 4 }).map((_, slotIndex) => (
            <div key={slotIndex} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Banner #{slotIndex + 1}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveBanner(slotIndex, slotIndex - 1)}
                    disabled={slotIndex === 0 || !featuredBanners[slotIndex]}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveBanner(slotIndex, slotIndex + 1)}
                    disabled={slotIndex === 3 || !featuredBanners[slotIndex]}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Series Selector */}
                <div>
                  {featuredBanners[slotIndex] ? (
                    <div className="bg-gray-700 rounded p-4 border border-gray-600">
                      <p className="text-sm text-gray-400 mb-2">Selected Series</p>
                      <p className="text-white font-semibold">{featuredBanners[slotIndex]?.title}</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const series = allSeries.find(s => s.id === e.target.value)
                          if (series) handleSelectSeries(slotIndex, series)
                        }}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="">Select a series...</option>
                        {allSeries.map(series => (
                          <option key={series.id} value={series.id} disabled={featuredBanners.some(b => b?.id === series.id)}>
                            {series.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Banner Image URL */}
                <div>
                  <input
                    type="text"
                    placeholder="Paste banner image URL..."
                    value={bannerImages[slotIndex] || ''}
                    onChange={(e) => handleImageUrlChange(slotIndex, e.target.value)}
                    disabled={!featuredBanners[slotIndex]}
                    className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-teal-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs mt-1">From Bunny CDN or other sources</p>
                </div>

                {/* Preview & Action */}
                <div className="flex items-center gap-3">
                  {bannerImages[slotIndex] && (
                    <img
                      src={bannerImages[slotIndex]}
                      alt="Banner preview"
                      className="w-24 h-32 object-cover rounded border border-gray-600"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleRemove(slotIndex)}
                    disabled={!featuredBanners[slotIndex]}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Banners'}</span>
          </button>
          <button
            onClick={handleReset}
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
