'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Video } from '@/types/database'

interface Top10CardProps {
  video: Video
  rank: number
}

export default function Top10Card({ video, rank }: Top10CardProps) {
  return (
    <Link href={`/watch/${video.slug}`} className="group flex-shrink-0 flex items-end">
      {/* Large Rank Number */}
      <span
        className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-600 to-gray-900 -mr-4 z-0"
        style={{
          WebkitTextStroke: '2px #374151',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {rank}
      </span>

      {/* Portrait Thumbnail - uses vertical_thumbnail_url if available, falls back to thumbnail_url */}
      <div className="relative w-[120px] h-[170px] bg-gray-800 rounded-lg overflow-hidden z-10">
        {(video.vertical_thumbnail_url || video.thumbnail_url) ? (
          <img
            src={video.vertical_thumbnail_url || video.thumbnail_url || ''}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          <h3 className="text-white text-xs font-medium line-clamp-2">
            {video.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
