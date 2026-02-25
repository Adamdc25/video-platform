'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Video } from '@/types/database'

interface VideoCardProps {
  video: Video
  showDescription?: boolean
  priority?: boolean
}

export default function VideoCard({ video, showDescription = true, priority = false }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.slug}`} className="group block flex-shrink-0 w-[280px] relative">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Play className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration_seconds && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white">
            {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Hover Overlay - positioned outside overflow-hidden container */}
      <div className="absolute top-0 left-0 right-0 aspect-video rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
          <Play className="w-6 h-6 text-black ml-1" fill="black" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-medium text-sm mb-1 line-clamp-1 group-hover:text-brand-400 transition-colors">
        {video.title}
      </h3>

      {/* Description */}
      {showDescription && video.description && (
        <p className="text-gray-400 text-xs line-clamp-2">
          {video.description}
        </p>
      )}
    </Link>
  )
}
