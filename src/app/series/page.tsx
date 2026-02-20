'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Video } from '@/types/database'
import Footer from '@/components/layout/Footer'

// Type for series with episodes
interface SeriesWithEpisodes {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  slug: string
  created_at: string
  updated_at: string
  videos?: Video[]
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesWithEpisodes[]>([])
  const [featuredSeries, setFeaturedSeries] = useState<SeriesWithEpisodes | null>(null)
  const [hoveredSeriesId, setHoveredSeriesId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSeries() {
      try {
        // Fetch all series with their episodes, ordered by created_at
        const { data, error } = await supabase
          .from('series')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            hero_image_url,
            backdrop_url,
            cover_art_url,
            slug,
            created_at,
            updated_at,
            videos (
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              episode_number,
              season_number,
              slug,
              view_count,
              is_published,
              published_at
            )
          `)
          .eq('videos.is_published', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Filter to only series that have at least one published episode
        const seriesWithEpisodes = (data || []).filter(s => s.videos && s.videos.length > 0)

        // Sort episodes within each series by season and episode number
        const sortedSeries = seriesWithEpisodes.map(s => ({
          ...s,
          videos: (s.videos || []).sort(
            (a, b) =>
              (a.season_number || 0) - (b.season_number || 0) ||
              (a.episode_number || 0) - (b.episode_number || 0)
          )
        }))

        setSeries(sortedSeries)

        // Set first series as featured
        if (sortedSeries.length > 0) {
          setFeaturedSeries(sortedSeries[0])
        }
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      {featuredSeries && (
        <div className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {featuredSeries.videos && featuredSeries.videos.length > 0 && (
              <img
                src={featuredSeries.hero_image_url || featuredSeries.backdrop_url || featuredSeries.cover_art_url || featuredSeries.videos[0].thumbnail_url || ''}
                alt={featuredSeries.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-2xl">
              {/* Series Title - Styled */}
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>
                {featuredSeries.title}
              </h1>

              {/* New Release Label */}
              <p className="text-teal-400 font-semibold lg:mb-4">New Release</p>

              {/* Metadata */}
              <p className="text-gray-300 mb-8">
                2026 · 18+ · {featuredSeries.videos?.length ? Math.max(...(featuredSeries.videos.map(v => v.season_number || 1))) : 1} Season · English
              </p>

              {/* Watch Now Button */}
              <Link
                href={`/watch/${featuredSeries.videos?.[0]?.slug || ''}`}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <Play className="w-6 h-6 fill-black" />
                Watch Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="relative bg-black pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {series.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-center py-16 px-4">
                <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No series created yet</h2>
                <p className="text-gray-400">
                  Check back soon for new series and videos
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* View All Series Section */}
              <div className="space-y-12">
                <section>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {series.map((seriesItem) => (
                      <div
                        key={seriesItem.id}
                        onMouseEnter={() => setHoveredSeriesId(seriesItem.id)}
                        onMouseLeave={() => setHoveredSeriesId(null)}
                        className="group cursor-pointer relative"
                      >
                        <Link
                          href={`/series/${seriesItem.slug}`}
                          className="block overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300"
                        >
                          {/* Series Card */}
                          <div className="relative aspect-video bg-gray-800 overflow-hidden">
                            {seriesItem.videos && seriesItem.videos.length > 0 && (
                              <>
                                {/* Thumbnail Image */}
                                <img
                                  src={seriesItem.videos[0].thumbnail_url || ''}
                                  alt={seriesItem.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                {/* Play Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-12 h-12 text-white fill-white" />
                                </div>
                              </>
                            )}
                          </div>
                          {/* Series Info */}
                          <div className="mt-2">
                            <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-teal-400 transition-colors">
                              {seriesItem.title}
                            </p>
                          </div>
                        </Link>

                        {/* Hover Preview Card */}
                        {hoveredSeriesId === seriesItem.id && (
                          <div className="absolute -top-2 -left-32 z-50 pointer-events-auto">
                            <div className="bg-gray-900 rounded-lg overflow-hidden w-96 shadow-2xl">
                              {/* Preview Image */}
                              <div className="relative h-54 bg-gray-800">
                                <img
                                  src={seriesItem.videos?.[0]?.thumbnail_url || ''}
                                  alt={seriesItem.title}
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              {/* Preview Info */}
                              <div className="p-6">
                                <h2 className="text-2xl font-bold text-white mb-2">{seriesItem.title}</h2>
                                {seriesItem.description && (
                                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{seriesItem.description}</p>
                                )}

                                {/* Watch Now Button */}
                                {seriesItem.videos && seriesItem.videos.length > 0 && (
                                  <Link
                                    href={`/series/${seriesItem.slug}`}
                                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center"
                                  >
                                    <Play className="w-5 h-5 fill-black" />
                                    View Series
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
