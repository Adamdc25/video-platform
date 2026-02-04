'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import VideoCard from '@/components/video/VideoCard'
import { Search as SearchIcon } from 'lucide-react'
import type { Video } from '@/types/database'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('title')

      if (data) {
        setAllVideos(data)
        setVideos(data)
      }
      setLoading(false)
    }
    fetchVideos()
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      setVideos(allVideos)
    } else {
      const filtered = allVideos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description?.toLowerCase().includes(query.toLowerCase())
      )
      setVideos(filtered)
    }
  }, [query, allVideos])

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full bg-gray-900 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
              <p className="text-gray-400">
                {query ? `No videos match "${query}"` : 'Start typing to search'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                {videos.length} {videos.length === 1 ? 'result' : 'results'}
                {query && ` for "${query}"`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
