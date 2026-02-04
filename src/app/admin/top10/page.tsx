'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Trophy,
  Upload,
  X,
  GripVertical,
  Plus,
  Image as ImageIcon,
  Save
} from 'lucide-react'
import type { Video } from '@/types/database'

const BUNNY_STORAGE_ZONE = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE || 'video-stream-cdn'
const BUNNY_CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://video-stream-cdn.b-cdn.net'

export default function Top10ManagementPage() {
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [top10Videos, setTop10Videos] = useState<(Video | null)[]>(Array(10).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    // Fetch all published videos
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('title')

    if (videos) {
      setAllVideos(videos)

      // Build top 10 array from ranked videos
      const ranked = Array(10).fill(null)
      videos.forEach(video => {
        if (video.top_10_rank && video.top_10_rank >= 1 && video.top_10_rank <= 10) {
          ranked[video.top_10_rank - 1] = video
        }
      })
      setTop10Videos(ranked)
    }

    setLoading(false)
  }

  async function handleSelectVideo(slot: number, videoId: string) {
    if (!videoId) {
      // Remove from slot
      const newTop10 = [...top10Videos]
      newTop10[slot] = null
      setTop10Videos(newTop10)
      return
    }

    const video = allVideos.find(v => v.id === videoId)
    if (video) {
      const newTop10 = [...top10Videos]
      // Remove video from any other slot it might be in
      for (let i = 0; i < newTop10.length; i++) {
        if (newTop10[i]?.id === videoId) {
          newTop10[i] = null
        }
      }
      newTop10[slot] = video
      setTop10Videos(newTop10)
    }
  }

  async function handleVerticalThumbnailUpload(slot: number, file: File) {
    const video = top10Videos[slot]
    if (!video) return

    setUploadingSlot(slot)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `vertical-thumbnails/${video.id}-${Date.now()}.${fileExt}`

      // Upload to Bunny.net
      const response = await fetch(`https://uk.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${fileName}`, {
        method: 'PUT',
        headers: {
          'AccessKey': process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY || '',
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!response.ok) throw new Error('Upload failed')

      const verticalThumbnailUrl = `${BUNNY_CDN_URL}/${fileName}`

      // Update the video in state
      const newTop10 = [...top10Videos]
      newTop10[slot] = { ...video, vertical_thumbnail_url: verticalThumbnailUrl }
      setTop10Videos(newTop10)

      // Also update in allVideos
      setAllVideos(prev => prev.map(v =>
        v.id === video.id ? { ...v, vertical_thumbnail_url: verticalThumbnailUrl } : v
      ))

      setMessage({ type: 'success', text: 'Vertical thumbnail uploaded!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload thumbnail' })
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      // First, clear all top_10_rank values
      await supabase
        .from('videos')
        .update({ top_10_rank: null })
        .not('top_10_rank', 'is', null)

      // Then set the new rankings
      for (let i = 0; i < top10Videos.length; i++) {
        const video = top10Videos[i]
        if (video) {
          await supabase
            .from('videos')
            .update({
              top_10_rank: i + 1,
              vertical_thumbnail_url: video.vertical_thumbnail_url
            })
            .eq('id', video.id)
        }
      }

      setMessage({ type: 'success', text: 'Top 10 saved successfully!' })

      // Refresh data
      await fetchVideos()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save Top 10' })
    } finally {
      setSaving(false)
    }
  }

  function getAvailableVideos(currentSlot: number) {
    // Get videos not in other slots
    const usedIds = top10Videos
      .filter((v, i) => v && i !== currentSlot)
      .map(v => v!.id)

    return allVideos.filter(v => !usedIds.includes(v.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-6 border-r border-gray-800">
          <h1 className="text-xl font-bold text-white mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Dashboard
            </Link>
            <Link href="/admin/videos" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Videos
            </Link>
            <Link href="/admin/upload" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Upload
            </Link>
            <Link href="/admin/top10" className="flex items-center gap-3 px-4 py-2 text-white bg-gray-800 rounded-lg">
              <Trophy className="w-5 h-5" />
              Top 10
            </Link>
          </nav>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
              Back to Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Top 10 Management
                  </h1>
                  <p className="text-gray-400 mt-1">Select videos and upload vertical thumbnails for the Top 10 section</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-400 disabled:opacity-50 transition"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Top 10'}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Top 10 Slots */}
            <div className="space-y-4">
              {top10Videos.map((video, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>

                    {/* Video Selector */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Video
                      </label>
                      <select
                        value={video?.id || ''}
                        onChange={(e) => handleSelectVideo(index, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">-- Select a video --</option>
                        {getAvailableVideos(index).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title}
                          </option>
                        ))}
                        {video && (
                          <option value={video.id}>{video.title}</option>
                        )}
                      </select>
                    </div>

                    {/* Vertical Thumbnail Preview & Upload */}
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Vertical Thumbnail
                      </label>
                      <div className="relative w-24 h-36 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        {video?.vertical_thumbnail_url ? (
                          <img
                            src={video.vertical_thumbnail_url}
                            alt="Vertical thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : video?.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt="Thumbnail"
                            className="w-full h-full object-cover opacity-50"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}

                        {uploadingSlot === index && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                          </div>
                        )}
                      </div>

                      {video && (
                        <>
                          <input
                            ref={el => fileInputRefs.current[index] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleVerticalThumbnailUpload(index, file)
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRefs.current[index]?.click()}
                            disabled={uploadingSlot === index}
                            className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition"
                          >
                            <Upload className="w-3 h-3" />
                            Upload
                          </button>
                        </>
                      )}
                    </div>

                    {/* Remove Button */}
                    {video && (
                      <button
                        onClick={() => handleSelectVideo(index, '')}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 transition"
                        title="Remove from Top 10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-2">Instructions</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Select videos for each Top 10 position</li>
                <li>• Upload vertical thumbnails (portrait orientation, recommended 2:3 ratio)</li>
                <li>• If no vertical thumbnail is uploaded, the regular thumbnail will be used</li>
                <li>• Click "Save Top 10" to apply your changes</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
