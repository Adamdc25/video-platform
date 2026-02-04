'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  startTime?: number
  title?: string
}

export default function VideoPlayer({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  startTime = 0,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastUpdateRef = useRef(startTime)

  // Set start time when video loads
  useEffect(() => {
    const video = videoRef.current
    if (video && startTime > 0) {
      video.currentTime = startTime
    }
  }, [startTime])

  // Handle time updates - save progress every 10 seconds
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && onTimeUpdate) {
      const currentTime = video.currentTime
      if (currentTime - lastUpdateRef.current >= 10) {
        onTimeUpdate(currentTime)
        lastUpdateRef.current = currentTime
      }
    }
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Video Title Overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10 pointer-events-none">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
        </div>
      )}

      {/* Native HTML5 Video Player */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="w-full aspect-video bg-black"
        onLoadedData={() => setIsLoading(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onError={(e) => {
          console.error('Video error:', e)
          setError('Failed to load video')
          setIsLoading(false)
        }}
      />

      {/* Loading Indicator */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-gray-500 text-sm">Video URL: {src}</p>
          </div>
        </div>
      )}
    </div>
  )
}
