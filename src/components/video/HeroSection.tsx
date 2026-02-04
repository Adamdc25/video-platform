'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Plus, Check, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Video } from '@/types/database'

interface HeroSectionProps {
  video: Video
  userId?: string
  inWatchlist?: boolean
}

export default function HeroSection({ video, userId, inWatchlist: initialInWatchlist = false }: HeroSectionProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const toggleWatchlist = async () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

    setIsLoading(true)
    try {
      if (inWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('video_id', video.id)
        setInWatchlist(false)
      } else {
        await supabase
          .from('watchlist')
          .insert({ user_id: userId, video_id: video.id })
        setInWatchlist(true)
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {video.title}
          </h1>

          {/* Description */}
          {video.description && (
            <p className="text-gray-200 text-base md:text-lg mb-6 line-clamp-3 drop-shadow">
              {video.description}
            </p>
          )}

          {/* Season/Episode Info */}
          {(video.season_number || video.episode_number) && (
            <p className="text-gray-300 text-sm mb-4">
              {video.season_number && `Season ${video.season_number}`}
              {video.season_number && video.episode_number && ' · '}
              {video.episode_number && `Episode ${video.episode_number}`}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href={`/watch/${video.slug}`}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <Play className="w-5 h-5" fill="black" />
              Play
            </Link>

            <button
              onClick={toggleWatchlist}
              disabled={isLoading}
              className="w-12 h-12 bg-teal-500 hover:bg-teal-400 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </button>

            <Link
              href={`/watch/${video.slug}`}
              className="w-12 h-12 bg-gray-700/80 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              title="More Info"
            >
              <Info className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Episode Thumbnails on Right (Optional) */}
      <div className="absolute right-8 bottom-32 hidden lg:flex gap-2">
        {/* Placeholder for episode thumbnails */}
      </div>
    </div>
  )
}
