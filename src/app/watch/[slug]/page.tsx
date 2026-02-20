'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import VideoPlayer from '@/components/video/VideoPlayer'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { Play, Plus, Check, ThumbsUp, Share2, Clock } from 'lucide-react'
import type { Video, WatchProgress } from '@/types/database'

export default function WatchPage() {
  const params = useParams()
  const slug = params.slug as string
  const videoPlayerRef = useRef<HTMLDivElement>(null)

  const [video, setVideo] = useState<Video | null>(null)
  const [seriesEpisodes, setSeriesEpisodes] = useState<Video[]>([])
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'episodes' | 'details' | 'trailer'>('episodes')
  const [showPlayer, setShowPlayer] = useState(false)
  const [playTrailerBackground, setPlayTrailerBackground] = useState(false)
  const trailerRef = useRef<HTMLVideoElement>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const { data: videoData, error } = await supabase
        .from('videos')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error || !videoData) {
        setLoading(false)
        return
      }

      setVideo(videoData)

      // Fetch all episodes from the same series
      const { data: seriesData } = await supabase
        .from('series')
        .select(`
          videos (
            id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration_seconds,
            episode_number,
            season_number,
            slug,
            view_count,
            is_published,
            published_at
          )
        `)
        .eq('id', videoData.series_id)
        .single()

      if (seriesData?.videos) {
        // Filter to only published episodes and sort by season and episode number
        const published = (seriesData.videos as Video[]).filter(ep => ep.is_published)
        const sorted = published.sort(
          (a: Video, b: Video) =>
            (a.season_number || 0) - (b.season_number || 0) ||
            (a.episode_number || 0) - (b.episode_number || 0)
        )
        setSeriesEpisodes(sorted)
      }

      // Update basic view count
      await supabase
        .from('videos')
        .update({ view_count: (videoData.view_count || 0) + 1 })
        .eq('id', videoData.id)

      // Log detailed view for analytics
      const deviceType = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
        ? /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : 'mobile'
        : 'desktop'

      await supabase.from('video_views').insert({
        video_id: videoData.id,
        user_id: currentUser?.id || null,
        device_type: deviceType,
      })

      if (currentUser) {
        const { data: progress } = await supabase
          .from('watch_progress')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('video_id', videoData.id)
          .single()

        if (progress) {
          setWatchProgress(progress)
        }

        const { data: watchlistItem } = await supabase
          .from('watchlist')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('video_id', videoData.id)
          .single()

        setInWatchlist(!!watchlistItem)
      }

      setLoading(false)
    }

    fetchData()
  }, [slug])

  // Autoplay trailer in background after 3 seconds
  useEffect(() => {
    if (video?.trailer_url && !showPlayer) {
      const timer = setTimeout(() => {
        setPlayTrailerBackground(true)
      }, 3000) // Show thumbnail for 3 seconds before trailer starts

      return () => clearTimeout(timer)
    }
  }, [video?.trailer_url, showPlayer])

  // Handle trailer video playback
  useEffect(() => {
    if (playTrailerBackground && trailerRef.current) {
      trailerRef.current.play().catch(() => {
        // Autoplay was prevented, that's okay
      })
    }
  }, [playTrailerBackground])

  const handleTimeUpdate = async (currentTime: number) => {
    if (!user || !video) return
    await supabase
      .from('watch_progress')
      .upsert({
        user_id: user.id,
        video_id: video.id,
        progress_seconds: Math.floor(currentTime),
        last_watched: new Date().toISOString(),
      }, { onConflict: 'user_id,video_id' })
  }

  const handleVideoEnded = async () => {
    if (!user || !video) return
    await supabase
      .from('watch_progress')
      .upsert({
        user_id: user.id,
        video_id: video.id,
        completed: true,
        last_watched: new Date().toISOString(),
      }, { onConflict: 'user_id,video_id' })
  }

  const toggleWatchlist = async () => {
    if (!user || !video) {
      window.location.href = '/auth/login'
      return
    }

    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('video_id', video.id)
      setInWatchlist(false)
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, video_id: video.id })
      setInWatchlist(true)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: video?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleWatchNow = () => {
    setShowPlayer(true)
    setPlayTrailerBackground(false) // Stop background trailer
    setIsFullscreen(true) // Go fullscreen
    if (trailerRef.current) {
      trailerRef.current.pause()
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `(${mins} min ${secs} sec)`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
            <p className="text-gray-400 mb-6">The video you're looking for doesn't exist or has been removed.</p>
            <Link href="/" className="text-teal-400 hover:text-teal-300">← Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-16 min-h-[400px]">
        {/* Background - Thumbnail or Trailer Video */}
        <div className="absolute inset-0 pt-16 overflow-hidden">
          {/* Thumbnail (shows initially, fades out when trailer plays) */}
          {video.thumbnail_url && (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                playTrailerBackground ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}

          {/* Trailer Video (autoplays in background) */}
          {video.trailer_url && (
            <video
              ref={trailerRef}
              src={video.trailer_url}
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                playTrailerBackground ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Fallback gradient if no thumbnail */}
          {!video.thumbnail_url && !video.trailer_url && (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {video.title}
            </h1>

            {/* Description */}
            {video.description && (
              <p className="text-gray-300 text-lg mb-6 line-clamp-3">
                {video.description}
              </p>
            )}

            {/* Watch Now Button */}
            <button
              onClick={handleWatchNow}
              className="flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors mb-6"
            >
              <Play className="w-6 h-6" fill="white" />
              Watch Now
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWatchlist}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  inWatchlist
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
              <button
                className="w-12 h-12 bg-gray-800/80 text-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                title="Like"
              >
                <ThumbsUp className="w-6 h-6" />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 bg-gray-800/80 text-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                title="Share"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Video Player (shown when Watch Now is clicked) */}
      {showPlayer && isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 bg-gray-900/80 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Exit Fullscreen
          </button>
          <div ref={videoPlayerRef} className="w-full h-full">
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url || undefined}
              title={video.title}
              startTime={watchProgress?.progress_seconds || 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          </div>
        </div>
      ) : showPlayer ? (
        <div ref={videoPlayerRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VideoPlayer
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            title={video.title}
            startTime={watchProgress?.progress_seconds || 0}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />
        </div>
      ) : null}

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-4 font-semibold transition-colors relative ${
                activeTab === 'episodes'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Episodes
              {activeTab === 'episodes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 font-semibold transition-colors relative ${
                activeTab === 'details'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            {video.trailer_url && (
              <button
                onClick={() => setActiveTab('trailer')}
                className={`py-4 font-semibold transition-colors relative ${
                  activeTab === 'trailer'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Trailer
                {activeTab === 'trailer' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'trailer' && video.trailer_url ? (
          /* Trailer Tab */
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">Trailer</h2>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={video.trailer_url}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full"
                poster={video.thumbnail_url || undefined}
              />
            </div>
            <p className="text-gray-400 mt-4">
              Watch the trailer for {video.title}
            </p>
          </div>
        ) : activeTab === 'episodes' ? (
          /* Episodes Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Current Video Card */}
            <div className="group">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                {/* Now Playing Badge */}
                <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Now Playing
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">
                {video.episode_number ? `E${video.episode_number}. ` : ''}{video.title}
              </h3>
              {video.description && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-1">{video.description}</p>
              )}
              {video.duration_seconds && (
                <p className="text-gray-500 text-sm">{formatDuration(video.duration_seconds)}</p>
              )}
            </div>

            {/* Series Episodes */}
            {seriesEpisodes.filter(ep => ep.id !== video.id).map((episode, index) => (
              <Link
                key={episode.id}
                href={`/watch/${episode.slug}`}
                className="group"
              >
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
                  {episode.thumbnail_url ? (
                    <img
                      src={episode.thumbnail_url}
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {/* Hover Play Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black ml-1" fill="black" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-teal-400 transition-colors">
                  {episode.season_number ? `S${episode.season_number} ` : ''}{episode.episode_number ? `E${episode.episode_number}. ` : ''}{episode.title}
                </h3>
                {episode.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-1">{episode.description}</p>
                )}
                {episode.duration_seconds && (
                  <p className="text-gray-500 text-sm">{formatDuration(episode.duration_seconds)}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          /* Details Tab */
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">{video.title}</h2>

            {video.description && (
              <div className="mb-6">
                <h3 className="text-gray-400 font-semibold mb-2">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {video.season_number && (
                <div>
                  <h3 className="text-gray-400 font-semibold mb-1">Season</h3>
                  <p className="text-white">{video.season_number}</p>
                </div>
              )}
              {video.episode_number && (
                <div>
                  <h3 className="text-gray-400 font-semibold mb-1">Episode</h3>
                  <p className="text-white">{video.episode_number}</p>
                </div>
              )}
              {video.duration_seconds && (
                <div>
                  <h3 className="text-gray-400 font-semibold mb-1">Duration</h3>
                  <p className="text-white">{Math.floor(video.duration_seconds / 60)} minutes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  )
}
