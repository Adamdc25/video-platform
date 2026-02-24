'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import VideoPlayer from '@/components/video/VideoPlayer'
import { ArrowLeft } from 'lucide-react'
import type { Video, WatchProgress } from '@/types/database'

export default function ViewerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const videoPlayerRef = useRef<HTMLDivElement>(null)

  const [video, setVideo] = useState<Video | null>(null)
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
      }

      setLoading(false)
    }

    fetchData()
  }, [slug])

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

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Video Player */}
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
  )
}
