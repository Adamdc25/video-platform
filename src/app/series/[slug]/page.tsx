'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { ArrowLeft, Play, Volume2, VolumeX } from 'lucide-react'
import type { Video } from '@/types/database'
import Footer from '@/components/layout/Footer'
import { useParams } from 'next/navigation'

interface SeriesWithEpisodes {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  cover_art_url?: string
  backdrop_url?: string
  hero_image_url?: string
  trailer_url?: string
  slug: string
  created_at: string
  updated_at: string
  videos?: Video[]
}

export default function SeriesDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [seriesData, setSeriesData] = useState<SeriesWithEpisodes | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerMuted, setTrailerMuted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSeriesDetail() {
      if (!slug) return

      try {
        // Extract slug without trailing number: "the-rise-of-tech-261267" → "the-rise-of-tech"
        const slugWithoutNumber = slug.split('-').slice(0, -1).join('-') || slug
        const titleQuery = slugWithoutNumber.replace(/-/g, ' ')

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
          .ilike('title', titleQuery)
          .eq('videos.is_published', true)
          .single()

        if (error) throw error

        const sortedData = {
          ...data,
          videos: (data.videos || []).sort(
            (a: Video, b: Video) =>
              (a.season_number || 0) - (b.season_number || 0) ||
              (a.episode_number || 0) - (b.episode_number || 0)
          )
        }

        setSeriesData(sortedData)
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeriesDetail()
  }, [slug])

  // Auto-play trailer after 3-5 seconds if available
  useEffect(() => {
    if (!seriesData?.trailer_url || showTrailer) return

    const delay = 3000 + Math.random() * 2000 // 3-5 seconds
    const timer = setTimeout(() => setShowTrailer(true), delay)

    return () => clearTimeout(timer)
  }, [seriesData?.trailer_url, showTrailer])

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

  if (!seriesData) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Series not found</h1>
            <Link href="/series" className="text-teal-400 hover:text-teal-300">
              Back to Series
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const episodesBySeason: { [key: number]: Video[] } = {}
  seriesData.videos?.forEach(episode => {
    const season = episode.season_number || 1
    if (!episodesBySeason[season]) {
      episodesBySeason[season] = []
    }
    episodesBySeason[season].push(episode)
  })

  const heroImage =
    seriesData.hero_image_url ||
    seriesData.backdrop_url ||
    seriesData.cover_art_url ||
    seriesData.videos?.[0]?.thumbnail_url ||
    ''

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section - Netflix Style */}
      {seriesData && (
        <div className="relative h-screen overflow-hidden bg-gray-900">
          {/* Thumbnail/Backdrop (shows initially, fades to trailer) */}
          {!showTrailer ? (
            <>
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={heroImage}
                  alt={seriesData.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />

              {/* Hero Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
                {/* Back Button + Featured Badge */}
                <div className="pt-8 flex items-center justify-between">
                  <Link
                    href="/series"
                    className="inline-flex items-center gap-2 text-white hover:text-teal-400 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Series
                  </Link>
                  <span className="inline-block bg-teal-500 text-black px-4 py-2 rounded-full text-sm font-semibold">
                    Series Detail
                  </span>
                </div>

                {/* Series Title and Info */}
                <div className="max-w-2xl pb-80">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>
                    {seriesData.title}
                  </h1>

                  <p className="text-gray-300 mb-4">
                    2026 · {Object.keys(episodesBySeason).length} Season · English
                  </p>

                  {seriesData.description && (
                    <p className="text-gray-300 text-lg mb-8 max-w-xl">
                      {seriesData.description}
                    </p>
                  )}

                  {/* Watch Now Button */}
                  {seriesData.videos && seriesData.videos.length > 0 && (
                    <Link
                      href={`/watch/${seriesData.videos[0].slug}`}
                      className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Play className="w-6 h-6 fill-black" />
                      Watch Now
                    </Link>
                  )}
                </div>
              </div>

              {/* Play Trailer Button - Center Overlay */}
              <button
                onClick={() => setShowTrailer(true)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group relative w-20 h-20 flex items-center justify-center bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
              >
                <Play className="w-8 h-8 text-white fill-white ml-1" />
                <span className="absolute text-xs text-white mt-24 opacity-0 group-hover:opacity-100 transition">
                  Play Trailer
                </span>
              </button>
            </>
          ) : (
            /* Trailer Video Player */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={seriesData.trailer_url}
                autoPlay
                muted={trailerMuted}
                className="w-full h-full object-cover"
              />

              {/* Video Controls Overlay */}
              <div className="absolute top-8 right-8 flex gap-3 z-10">
                <button
                  onClick={() => setTrailerMuted(!trailerMuted)}
                  className="p-3 bg-white/20 hover:bg-white/40 rounded-full transition backdrop-blur-sm text-white"
                  title={trailerMuted ? 'Unmute' : 'Mute'}
                >
                  {trailerMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="px-4 py-3 bg-white/20 hover:bg-white/40 rounded-lg transition backdrop-blur-sm text-white font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
          )}
        </div>
      )}

      {/* Episodes Section */}
      <div className="relative bg-black pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {seriesData.videos && seriesData.videos.length > 0 ? (
            <div className="space-y-12">
              {Object.entries(episodesBySeason).map(([season, episodes]) => (
                <section key={season}>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Season {season}
                  </h2>
                  <div className="space-y-4">
                    {episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        href={`/watch/${episode.slug}`}
                        className="group flex gap-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={episode.thumbnail_url || ''}
                            alt={episode.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-gray-400 text-sm">
                              Season {episode.season_number} · Episode {episode.episode_number}
                            </p>
                            {episode.duration && (
                              <p className="text-gray-400 text-sm">
                                {Math.floor(episode.duration / 60)}m {episode.duration % 60}s
                              </p>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-teal-400 transition-colors">
                            {episode.title}
                          </h3>
                          {episode.description && (
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {episode.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">No episodes available for this series</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
