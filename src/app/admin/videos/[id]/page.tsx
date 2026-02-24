'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Trash2, Eye, EyeOff, PlayCircle, X } from 'lucide-react'
import type { Video } from '@/types/database'

export default function EditVideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [verticalThumbnailUrl, setVerticalThumbnailUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [seasonNumber, setSeasonNumber] = useState<number | ''>('')
  const [episodeNumber, setEpisodeNumber] = useState<number | ''>('')
  const [isPublished, setIsPublished] = useState(false)

  // Upload states
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingVerticalThumbnail, setUploadingVerticalThumbnail] = useState(false)
  const [uploadingTrailer, setUploadingTrailer] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchVideo() {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (error || !data) {
        setError('Video not found')
        setLoading(false)
        return
      }

      setVideo(data)
      setTitle(data.title)
      setDescription(data.description || '')
      setThumbnailUrl(data.thumbnail_url || '')
      setVerticalThumbnailUrl(data.vertical_thumbnail_url || '')
      setTrailerUrl(data.trailer_url || '')
      setSeasonNumber(data.season_number || '')
      setEpisodeNumber(data.episode_number || '')
      setIsPublished(data.is_published)
      setLoading(false)
    }

    fetchVideo()
  }, [videoId])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'thumbnail')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload thumbnail')
      }

      setThumbnailUrl(result.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleVerticalThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVerticalThumbnail(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'vertical-thumbnail')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload vertical thumbnail')
      }

      setVerticalThumbnailUrl(result.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingVerticalThumbnail(false)
    }
  }

  const handleTrailerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingTrailer(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'trailer')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload trailer')
      }

      setTrailerUrl(result.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingTrailer(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('videos')
      .update({
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        vertical_thumbnail_url: verticalThumbnailUrl || null,
        trailer_url: trailerUrl || null,
        season_number: seasonNumber || null,
        episode_number: episodeNumber || null,
        is_published: isPublished,
        published_at: isPublished && !video?.published_at ? new Date().toISOString() : video?.published_at,
      })
      .eq('id', videoId)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      setError(error.message)
    } else {
      router.push('/admin/videos')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Video not found</h2>
        <Link href="/admin/videos" className="text-primary-600 hover:text-primary-700">
          ← Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/videos"
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Video</h1>
            <p className="text-gray-500 mt-1">Update video details and settings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/watch/${video.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="max-w-3xl">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            Video updated successfully!
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter a description for this video..."
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <div className="flex gap-4">
              {/* Current Thumbnail Preview */}
              <div className="w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No thumbnail
                  </div>
                )}
              </div>

              {/* Upload Options */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    {uploadingThumbnail ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500">Or enter URL:</div>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>
          </div>

          {/* Vertical Thumbnail (for Top 10) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertical Thumbnail (for Top 10)
            </label>
            <p className="text-sm text-gray-500 mb-3">Portrait orientation for Top 10 section (2:3 ratio recommended)</p>
            <div className="flex gap-4">
              {/* Current Vertical Thumbnail Preview */}
              <div className="w-24 h-36 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {verticalThumbnailUrl ? (
                  <img
                    src={verticalThumbnailUrl}
                    alt="Vertical Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                    No vertical thumbnail
                  </div>
                )}
              </div>

              {/* Upload Options */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    {uploadingVerticalThumbnail ? 'Uploading...' : 'Upload Vertical Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVerticalThumbnailUpload}
                      disabled={uploadingVerticalThumbnail}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500">Or enter URL:</div>
                <input
                  type="url"
                  value={verticalThumbnailUrl}
                  onChange={(e) => setVerticalThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/vertical-thumbnail.jpg"
                />
              </div>
            </div>
          </div>

          {/* Trailer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trailer (optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">Upload a short preview or trailer for this video</p>

            {trailerUrl ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-100 rounded-lg">
                    <PlayCircle className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Trailer uploaded</p>
                    <a
                      href={trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:underline"
                    >
                      View trailer
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrailerUrl('')}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer w-fit">
                  <PlayCircle className="w-4 h-4" />
                  {uploadingTrailer ? 'Uploading trailer...' : 'Upload Trailer'}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleTrailerUpload}
                    disabled={uploadingTrailer}
                    className="hidden"
                  />
                </label>
                <div className="text-sm text-gray-500">Or enter URL:</div>
                <input
                  type="url"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/trailer.mp4"
                />
              </div>
            )}
          </div>

          {/* Season & Episode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season Number
              </label>
              <input
                type="number"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value ? parseInt(e.target.value) : '')}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episode Number
              </label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value ? parseInt(e.target.value) : '')}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Video URL (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <input
              type="text"
              value={video.video_url}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">Video URL cannot be changed after upload</p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isPublished ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {isPublished ? 'Published' : 'Draft'}
                </p>
                <p className="text-sm text-gray-500">
                  {isPublished
                    ? 'This video is visible to all users'
                    : 'This video is hidden from users'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isPublished
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
