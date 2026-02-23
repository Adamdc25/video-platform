'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react'
import type { Video } from '@/types/database'
import Footer from '@/components/layout/Footer'

interface SeriesWithEpisodes {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  cover_art_url?: string
  backdrop_url?: string
  hero_image_url?: string
  trailer_url?: string
  featured: boolean
  featured_order?: number | null
  slug: string
  created_at: string
  updated_at: string
  videos?: Video[]
}

export default function HomePage() {
  const [allSeries, setAllSeries] = useState<SeriesWithEpisodes[]>([])
  const [featuredSeries, setFeaturedSeries] = useState<SeriesWithEpisodes[]>([])
  const [topSeriesByViews, setTopSeriesByViews] = useState<SeriesWithEpisodes[]>([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
  const [allSeriesCarouselIndex, setAllSeriesCarouselIndex] = useState(0)
  const [topSeriesCarouselIndex, setTopSeriesCarouselIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [autoRotateDisabled, setAutoRotateDisabled] = useState(false)
  const [hoveredTopSeriesId, setHoveredTopSeriesId] = useState<string | null>(null)
  const [hoveredAllSeriesId, setHoveredAllSeriesId] = useState<string | null>(null)
  const [hoveredMoreSeriesId, setHoveredMoreSeriesId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSeries() {
      try {
        // Fetch all series with their episodes
        const { data, error } = await supabase
          .from('series')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            cover_art_url,
            backdrop_url,
            hero_image_url,
            trailer_url,
            featured,
            featured_order,
            slug,
            created_at,
            updated_at,
            videos (
              id,
              title,
              episode_number,
              season_number,
              video_url,
              thumbnail_url,
              duration,
              slug,
              view_count,
              is_published,
              published_at
            )
          `)

        if (error) throw error

        // Filter to only series with published episodes
        const seriesWithEpisodes = (data || []).filter(
          s => s.videos && s.videos.length > 0
        ) as SeriesWithEpisodes[]

        // Sort episodes within each series
        const sortedSeries = seriesWithEpisodes.map(s => ({
          ...s,
          videos: (s.videos || []).sort(
            (a: Video, b: Video) =>
              (a.season_number || 0) - (b.season_number || 0) ||
              (a.episode_number || 0) - (b.episode_number || 0)
          )
        }))

        // Get featured banners (4 series ordered by featured_order)
        const featured = sortedSeries
          .filter(s => s.featured)
          .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))
          .slice(0, 4)

        // Debug logging
        console.log('Featured banners:', featured.map(f => ({
          title: f.title,
          featured_order: f.featured_order,
          hero_image_url: f.hero_image_url,
          backdrop_url: f.backdrop_url
        })))

        setFeaturedSeries(featured)

        // Fetch manually-ranked top 10 series
        const { data: top10Data, error: top10Error } = await supabase
          .from('series')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            cover_art_url,
            backdrop_url,
            trailer_url,
            featured,
            slug,
            created_at,
            updated_at,
            top_10_rank,
            top_10_thumbnail_url,
            videos (
              id,
              title,
              episode_number,
              season_number,
              video_url,
              thumbnail_url,
              duration,
              slug,
              view_count,
              is_published,
              published_at
            )
          `)
          .not('top_10_rank', 'is', null)
          .order('top_10_rank')

        let top10 = [] as SeriesWithEpisodes[]
        if (top10Data && !top10Error) {
          top10 = (top10Data as SeriesWithEpisodes[]).filter(
            s => s.videos && s.videos.length > 0
          ) as SeriesWithEpisodes[]
        }

        setTopSeriesByViews(top10)
        setAllSeries(sortedSeries)
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  // Auto-rotate featured carousel every 4 seconds (unless disabled)
  useEffect(() => {
    if (featuredSeries.length === 0 || autoRotateDisabled) return

    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredSeries.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [featuredSeries.length, autoRotateDisabled])

  const handlePrevFeatured = () => {
    setCurrentFeaturedIndex(prev =>
      prev === 0 ? featuredSeries.length - 1 : prev - 1
    )
    // Pause auto-rotation for 6 seconds after manual click
    setAutoRotateDisabled(true)
    setTimeout(() => setAutoRotateDisabled(false), 6000)
  }

  const handleNextFeatured = () => {
    setCurrentFeaturedIndex(prev => (prev + 1) % featuredSeries.length)
    // Pause auto-rotation for 6 seconds after manual click
    setAutoRotateDisabled(true)
    setTimeout(() => setAutoRotateDisabled(false), 6000)
  }

  const handlePrevAllSeries = () => {
    setAllSeriesCarouselIndex(prev => Math.max(0, prev - 4))
  }

  const handleNextAllSeries = () => {
    const maxIndex = Math.max(0, allSeries.length - 12)
    setAllSeriesCarouselIndex(prev => Math.min(maxIndex, prev + 4))
  }

  const handlePrevTopSeries = () => {
    setTopSeriesCarouselIndex(prev => Math.max(0, prev - 5))
  }

  const handleNextTopSeries = () => {
    const maxIndex = Math.max(0, topSeriesByViews.length - 5)
    setTopSeriesCarouselIndex(prev => Math.min(maxIndex, prev + 5))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  const currentFeatured = featuredSeries[currentFeaturedIndex]
  const heroImage = currentFeatured?.hero_image_url || currentFeatured?.backdrop_url || currentFeatured?.cover_art_url || currentFeatured?.videos?.[0]?.thumbnail_url || ''

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Featured Carousel */}
      {featuredSeries.length > 0 && currentFeatured && (
        <div className="relative h-screen overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt={currentFeatured.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Background Audio */}
          <audio autoPlay loop muted className="hidden">
            <source src="https://example.com/audio/banner-music.mp3" type="audio/mpeg" />
          </audio>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
            {/* Featured Badge */}
            <div className="pt-8">
              <span className="inline-block bg-teal-500 text-black px-4 py-2 rounded-full text-sm font-semibold">
                Featured Series
              </span>
            </div>

            {/* Series Title and Info */}
            <div className="max-w-2xl pb-80">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>
                {currentFeatured.title}
              </h1>

              <p className="text-gray-300 mb-4">
                2026 · Highly Rated
              </p>

              {currentFeatured.description && (
                <p className="text-gray-300 text-lg mb-8 max-w-xl">
                  {currentFeatured.description}
                </p>
              )}

              {/* Watch Now Button */}
              <Link
                href={`/series/${currentFeatured.slug}`}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <Play className="w-6 h-6 fill-black" />
                Watch Now
              </Link>
            </div>
          </div>

          {/* Carousel Controls */}
          {featuredSeries.length > 1 && (
            <>
              <button
                onClick={handlePrevFeatured}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextFeatured}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {featuredSeries.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeaturedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentFeaturedIndex ? 'bg-teal-500 w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Thumbnail Carousel - Bottom Right */}
              <div className="absolute bottom-64 right-8 flex flex-nowrap gap-2 z-20 w-max">
                {featuredSeries.map((series, index) => (
                  <button
                    key={series.id}
                    onClick={() => setCurrentFeaturedIndex(index)}
                    className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                      index === currentFeaturedIndex
                        ? 'w-24 h-14 ring-2 ring-teal-500'
                        : 'w-20 h-11 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={series.hero_image_url || series.cover_art_url || series.thumbnail_url || ''}
                      alt={series.title}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Top 10 Series (Vertical Layout - Carousel) */}
      {topSeriesByViews.length > 0 && (
        <div className="relative bg-transparent pb-16 pt-0 mt-[-300px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Top 10 Series</h2>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {topSeriesByViews.slice(topSeriesCarouselIndex, topSeriesCarouselIndex + 5).map((series, index) => (
                  <Link
                    key={series.id}
                    href={`/series/${series.slug}`}
                    onMouseEnter={() => setHoveredTopSeriesId(series.id)}
                    onMouseLeave={() => setHoveredTopSeriesId(null)}
                    className="group cursor-pointer relative block"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-[9/16] mb-3">
                      {/* Series Cover/Thumbnail */}
                      <img
                        src={series.top_10_thumbnail_url || series.cover_art_url || series.thumbnail_url || ''}
                        alt={series.title}
                        className="w-full h-full object-contain transition-transform duration-300"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </div>

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 bg-teal-500 text-black px-3 py-1 rounded-full text-lg font-bold">
                        #{topSeriesCarouselIndex + index + 1}
                      </div>
                    </div>

                    {/* Series Info */}
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1 text-sm mt-2">
                      {series.title}
                    </h3>

                    {/* Hover Preview Card */}
                    {hoveredTopSeriesId === series.id && (
                      <div className="absolute -top-2 -left-32 z-50 pointer-events-auto">
                        <div className="bg-gray-900 rounded-lg overflow-hidden w-96 shadow-2xl">
                          {/* Preview Image */}
                          <div className="relative h-54 bg-gray-800">
                            <img
                              src={series.hero_image_url || series.cover_art_url || series.thumbnail_url || ''}
                              alt={series.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Preview Info */}
                          <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{series.title}</h2>
                            {series.description && (
                              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{series.description}</p>
                            )}

                            {/* View Series Button */}
                            <button
                              onClick={() => {}}
                              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center pointer-events-auto"
                            >
                              <Play className="w-5 h-5 fill-black" />
                              View Series
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Carousel Controls */}
              {topSeriesCarouselIndex > 0 && (
                <button
                  onClick={handlePrevTopSeries}
                  className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {topSeriesCarouselIndex < topSeriesByViews.length - 5 && (
                <button
                  onClick={handleNextTopSeries}
                  className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Series Grid (Horizontal Layout) */}
      <div className="relative bg-black pb-4 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">All Series</h2>
            <p className="text-gray-400">Browse all available series and episodes</p>
          </div>

          {allSeries.length > 0 ? (
            <>
              {/* Main Grid - First 12 Series */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
                {allSeries.slice(0, 12).map(series => (
                  <Link
                    key={series.id}
                    href={`/series/${series.slug}`}
                    onMouseEnter={() => setHoveredAllSeriesId(series.id)}
                    onMouseLeave={() => setHoveredAllSeriesId(null)}
                    className="group cursor-pointer relative block"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video mb-3">
                      {/* Series Cover/Thumbnail */}
                      <img
                        src={series.cover_art_url || series.thumbnail_url || ''}
                        alt={series.title}
                        className="w-full h-full object-contain transition-transform duration-300"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </div>
                    </div>

                    {/* Series Info */}
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1 text-sm">
                      {series.title}
                    </h3>

                    {/* Hover Preview Card */}
                    {hoveredAllSeriesId === series.id && (
                      <div className="absolute -top-2 -left-32 z-50 pointer-events-auto">
                        <div className="bg-gray-900 rounded-lg overflow-hidden w-96 shadow-2xl">
                          {/* Preview Image */}
                          <div className="relative h-54 bg-gray-800">
                            <img
                              src={series.hero_image_url || series.cover_art_url || series.thumbnail_url || ''}
                              alt={series.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Preview Info */}
                          <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{series.title}</h2>
                            {series.description && (
                              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{series.description}</p>
                            )}

                            {/* View Series Button */}
                            <button
                              onClick={() => {}}
                              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center pointer-events-auto"
                            >
                              <Play className="w-5 h-5 fill-black" />
                              View Series
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Carousel for remaining series (13+) */}
              {allSeries.length > 12 && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">More Series</h3>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {allSeries.slice(12 + allSeriesCarouselIndex, 12 + allSeriesCarouselIndex + 4).map(series => (
                        <Link
                          key={series.id}
                          href={`/series/${series.slug}`}
                          onMouseEnter={() => setHoveredMoreSeriesId(series.id)}
                          onMouseLeave={() => setHoveredMoreSeriesId(null)}
                          className="group cursor-pointer relative block"
                        >
                          <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video mb-3">
                            {/* Series Cover/Thumbnail */}
                            <img
                              src={series.cover_art_url || series.thumbnail_url || ''}
                              alt={series.title}
                              className="w-full h-full object-contain transition-transform duration-300"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white fill-white" />
                            </div>
                          </div>

                          {/* Series Info */}
                          <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1 text-sm">
                            {series.title}
                          </h3>

                          {/* Hover Preview Card */}
                          {hoveredMoreSeriesId === series.id && (
                            <div className="absolute -top-2 -left-32 z-50 pointer-events-auto">
                              <div className="bg-gray-900 rounded-lg overflow-hidden w-96 shadow-2xl">
                                {/* Preview Image */}
                                <div className="relative h-54 bg-gray-800">
                                  <img
                                    src={series.hero_image_url || series.cover_art_url || series.thumbnail_url || ''}
                                    alt={series.title}
                                    className="w-full h-full object-contain"
                                  />
                                </div>

                                {/* Preview Info */}
                                <div className="p-6">
                                  <h2 className="text-2xl font-bold text-white mb-2">{series.title}</h2>
                                  {series.description && (
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{series.description}</p>
                                  )}

                                  {/* View Series Button */}
                                  <button
                                    onClick={() => {}}
                                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center pointer-events-auto"
                                  >
                                    <Play className="w-5 h-5 fill-black" />
                                    View Series
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>

                    {/* Carousel Controls */}
                    {allSeriesCarouselIndex > 0 && (
                      <button
                        onClick={handlePrevAllSeries}
                        className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {allSeriesCarouselIndex < allSeries.length - 16 && (
                      <button
                        onClick={handleNextAllSeries}
                        className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">No series available yet</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
// Testing auto-deploy - Tue Feb 17 14:47:17 SAST 2026
