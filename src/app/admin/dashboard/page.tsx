'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Video, Users, Eye, Clock } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalVideos: number
  totalUsers: number
  totalViews: number
  recentVideos: Array<{
    id: string
    title: string
    view_count: number
    created_at: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalUsers: 0,
    totalViews: 0,
    recentVideos: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        // Fetch video count and total views
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('id, title, view_count, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Fetch total video count
        const { count: videoCount } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })

        // Calculate total views
        const { data: allVideos } = await supabase
          .from('videos')
          .select('view_count')

        const totalViews = allVideos?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0

        setStats({
          totalVideos: videoCount || 0,
          totalUsers: userCount || 0,
          totalViews,
          recentVideos: videos || [],
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your video platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Videos"
          value={stats.totalVideos}
          icon={<Video className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          icon={<Eye className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="This Month"
          value={stats.recentVideos.length}
          icon={<Clock className="w-6 h-6" />}
          color="bg-orange-500"
          subtitle="new videos"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
            <Link href="/admin/videos" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all →
            </Link>
          </div>

          {stats.recentVideos.length > 0 ? (
            <div className="space-y-3">
              {stats.recentVideos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{video.title}</p>
                    <p className="text-sm text-gray-500">{video.view_count} views</p>
                  </div>
                  <Link
                    href={`/admin/videos/${video.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No videos uploaded yet</p>
              <Link href="/admin/upload" className="text-primary-600 hover:underline mt-2 inline-block">
                Upload your first video
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/upload"
              className="flex items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
            >
              <div className="p-2 bg-primary-500 text-white rounded-lg mr-4">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload New Video</p>
                <p className="text-sm text-gray-500">Add content to your platform</p>
              </div>
            </Link>
            <Link
              href="/admin/videos"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="p-2 bg-gray-500 text-white rounded-lg mr-4">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Videos</p>
                <p className="text-sm text-gray-500">Edit, delete, or organize content</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
