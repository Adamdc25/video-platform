'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import VideoCard from '@/components/video/VideoCard'
import { BookmarkPlus } from 'lucide-react'
import Link from 'next/link'
import type { Video } from '@/types/database'

export default function WatchlistPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchWatchlist() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (!currentUser) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('watchlist')
        .select(`
          video_id,
          videos (*)
        `)
        .eq('user_id', currentUser.id)
        .order('added_at', { ascending: false })

      if (data) {
        const watchlistVideos = data
          .map((item: any) => item.videos)
          .filter((video: Video | null) => video !== null)
        setVideos(watchlistVideos)
      }
      setLoading(false)
    }

    fetchWatchlist()
  }, [])

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <BookmarkPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Sign in to view your watchlist</h1>
            <p className="text-gray-400 mb-6">Keep track of videos you want to watch later</p>
            <Link
              href="/auth/login"
              className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <BookmarkPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
              <p className="text-gray-400 mb-6">
                Add videos to your watchlist to save them for later
              </p>
              <Link
                href="/"
                className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 transition-colors"
              >
                Browse Videos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
