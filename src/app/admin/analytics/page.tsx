'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Video, Eye, TrendingUp, Calendar, Clock } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalVideos: number
  totalViews: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  viewsThisWeek: number
  viewsThisMonth: number
  dailySignups: { date: string; count: number }[]
  dailyViews: { date: string; count: number }[]
  topVideos: { video_id: string; title: string; thumbnail_url: string; view_count: number; unique_viewers: number }[]
  recentUsers: { id: string; display_name: string; created_at: string }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    const supabase = createClient()
    setLoading(true)

    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Fetch all data in parallel
      const [
        { count: totalUsers },
        { count: totalVideos },
        { data: allVideos },
        { data: weekUsers },
        { data: monthUsers },
        { data: weekViews },
        { data: monthViews },
        { data: topVideosData },
        { data: recentUsersData },
        { data: dailySignupsData },
        { data: dailyViewsData },
      ] = await Promise.all([
        // Total counts
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('videos').select('view_count'),

        // Users this week/month
        supabase.from('profiles').select('id').gte('created_at', weekAgo.toISOString()),
        supabase.from('profiles').select('id').gte('created_at', monthAgo.toISOString()),

        // Views this week/month (from video_views table)
        supabase.from('video_views').select('id').gte('created_at', weekAgo.toISOString()),
        supabase.from('video_views').select('id').gte('created_at', monthAgo.toISOString()),

        // Top videos by view_count (fallback to basic counter)
        supabase
          .from('videos')
          .select('id, title, thumbnail_url, view_count')
          .eq('is_published', true)
          .order('view_count', { ascending: false })
          .limit(10),

        // Recent users
        supabase
          .from('profiles')
          .select('id, display_name, created_at')
          .order('created_at', { ascending: false })
          .limit(10),

        // Daily signups
        supabase.rpc('get_daily_signups', { days_back: parseInt(timeRange) }),

        // Daily views
        supabase.rpc('get_daily_views', { days_back: parseInt(timeRange) }),
      ])

      // Calculate total views from video view_count
      const totalViews = allVideos?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0

      setData({
        totalUsers: totalUsers || 0,
        totalVideos: totalVideos || 0,
        totalViews,
        newUsersThisWeek: weekUsers?.length || 0,
        newUsersThisMonth: monthUsers?.length || 0,
        viewsThisWeek: weekViews?.length || 0,
        viewsThisMonth: monthViews?.length || 0,
        dailySignups: dailySignupsData || [],
        dailyViews: dailyViewsData || [],
        topVideos: topVideosData?.map(v => ({
          video_id: v.id,
          title: v.title,
          thumbnail_url: v.thumbnail_url,
          view_count: v.view_count || 0,
          unique_viewers: 0,
        })) || [],
        recentUsers: recentUsersData || [],
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your platform's performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7' ? '7 Days' : range === '30' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          subtitle={`+${data.newUsersThisMonth} this month`}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Videos"
          value={data.totalVideos}
          subtitle="published"
          icon={<Video className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Views"
          value={data.totalViews}
          subtitle={`+${data.viewsThisMonth} this month`}
          icon={<Eye className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="New Users (Week)"
          value={data.newUsersThisWeek}
          subtitle="last 7 days"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Signups Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Signups</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <SimpleBarChart
            data={data.dailySignups}
            color="#3B82F6"
            label="signups"
          />
        </div>

        {/* Views Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Video Views</h2>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <SimpleBarChart
            data={data.dailyViews}
            color="#8B5CF6"
            label="views"
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Videos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Videos</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          {data.topVideos.length > 0 ? (
            <div className="space-y-3">
              {data.topVideos.slice(0, 5).map((video, index) => (
                <div key={video.video_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{video.title}</p>
                    <p className="text-sm text-gray-500">{video.view_count.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No video data yet</p>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Signups</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          {data.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                      {(user.display_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.display_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple stat card component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Simple bar chart component (no external dependencies)
function SimpleBarChart({
  data,
  color,
  label,
}: {
  data: { date: string; count: number }[]
  color: string
  label: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <p>No data for this period</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-40 gap-1">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {item.count} {label}
                <br />
                {new Date(item.date).toLocaleDateString()}
              </div>

              {/* Bar */}
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${Math.max(height, 2)}%`,
                  backgroundColor: color,
                  minHeight: item.count > 0 ? '4px' : '2px',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels (show first, middle, last) */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{data[0] ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{data.length > 2 && data[Math.floor(data.length / 2)] ? new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{data[data.length - 1] ? new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
      </div>
    </div>
  )
}
