'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import VideoCard from '@/components/video/VideoCard'
import Link from 'next/link'
import { PlaySquare, Play } from 'lucide-react'
import type { Video } from '@/types/database'
import Footer from '@/components/layout/Footer'

export default function SeriesPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setVideos(data)
        // Set the newest video as featured
        setFeaturedVideo(data[0])
      }
      setLoading(false)
    }
    fetchVideos()
  }, [])

  // Get the year from published_at
  const getFeaturedYear = () => {
    if (featuredVideo?.published_at) {
      return new Date(featuredVideo.published_at).getFullYear()
    }
    return new Date().getFullYear()
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      {featuredVideo && (
        <div className="relative h-[550px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {featuredVideo.thumbnail_url ? (
              <img
                src={featuredVideo.thumbnail_url}
                alt={featuredVideo.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 flex flex-col justify-center">
            <div className="max-w-2xl">
              {/* Series Title - Stylized */}
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>
                {featuredVideo.title}
              </h1>

              {/* New Release Label */}
              <p className="text-teal-400 font-semibold text-lg mb-4">New Release</p>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-gray-300 mb-6">
                <span>{getFeaturedYear()}</span>
                <span className="text-gray-500">•</span>
                <span className="px-2 py-0.5 border border-gray-500 rounded text-sm">18+</span>
                <span className="text-gray-500">•</span>
                <span>{featuredVideo.season_number ? `${featuredVideo.season_number} Season${featuredVideo.season_number > 1 ? 's' : ''}` : '1 Season'}</span>
                <span className="text-gray-500">•</span>
                <span>English</span>
              </div>

              {/* Watch Button */}
              <Link
                href={`/watch/${featuredVideo.slug}`}
                className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                <Play className="w-6 h-6" fill="white" />
                Watch Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="relative bg-black pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 pt-24">
              <PlaySquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No content yet</h2>
              <p className="text-gray-400">
                Check back soon for new series and videos
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* View All Series Section */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-6">View all Series</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {videos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/watch/${video.slug}`}
                      className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                          <PlaySquare className="w-10 h-10 text-gray-600" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                        </div>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                        <h3 className="text-white text-sm font-medium line-clamp-2">
                          {video.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
