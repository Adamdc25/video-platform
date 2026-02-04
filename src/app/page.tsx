'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/video/HeroSection'
import ContentRow from '@/components/video/ContentRow'
import VideoCard from '@/components/video/VideoCard'
import Top10Card from '@/components/video/Top10Card'
import type { Video } from '@/types/database'
import Logo from '@/components/ui/Logo'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [top10Videos, setTop10Videos] = useState<Video[]>([])
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [user, setUser] = useState<any>(null)
  const [watchlistIds, setWatchlistIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Fetch published videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (videosData && videosData.length > 0) {
        setVideos(videosData)
        // Set the most recent as featured
        setFeaturedVideo(videosData[0])
      }

      // Fetch Top 10 videos (those with top_10_rank set, ordered by rank)
      const { data: top10Data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .not('top_10_rank', 'is', null)
        .order('top_10_rank', { ascending: true })
        .limit(10)

      if (top10Data) {
        setTop10Videos(top10Data)
      }

      // Get user's watchlist if logged in
      if (currentUser) {
        const { data: watchlistData } = await supabase
          .from('watchlist')
          .select('video_id')
          .eq('user_id', currentUser.id)

        if (watchlistData) {
          setWatchlistIds(watchlistData.map(w => w.video_id))
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  // Get videos for different sections
  const latestVideos = videos.slice(0, 10)
  const moreVideos = videos.slice(0, 10)

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      {featuredVideo ? (
        <HeroSection
          video={featuredVideo}
          userId={user?.id}
          inWatchlist={watchlistIds.includes(featuredVideo.id)}
        />
      ) : (
        <div className="h-[70vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={true} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Discover TMJ</h1>
            <p className="text-gray-400 mb-8">No videos published yet. Check back soon!</p>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="pb-16 -mt-20 relative z-10">
        {/* Watch the Latest */}
        {latestVideos.length > 0 && (
          <ContentRow title="Watch the Latest" moreLink="/series">
            {latestVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </ContentRow>
        )}

        {/* Top 10 */}
        {top10Videos.length > 0 && (
          <ContentRow title="Top 10" moreLink="/series">
            {top10Videos.map((video) => (
              <Top10Card key={video.id} video={video} rank={video.top_10_rank || 1} />
            ))}
          </ContentRow>
        )}

        {/* Watch More */}
        {moreVideos.length > 0 && (
          <ContentRow title="Watch More" moreLink="/series">
            {moreVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </ContentRow>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
