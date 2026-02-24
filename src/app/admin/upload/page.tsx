'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Check, Film, Image, PlayCircle } from 'lucide-react'
import type { Series } from '@/types/database'

export default function UploadVideoPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const verticalThumbnailInputRef = useRef<HTMLInputElement>(null)
  const trailerInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<string>('')
  const [series, setSeries] = useState<Series[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [verticalThumbnailFile, setVerticalThumbnailFile] = useState<File | null>(null)
  const [trailerFile, setTrailerFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [verticalThumbnailPreview, setVerticalThumbnailPreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    seriesId: '',
    episodeNumber: '',
    seasonNumber: '',
  })

  // Fetch series for dropdown
  useEffect(() => {
    async function fetchSeries() {
      const { data } = await supabase
        .from('series')
        .select('*')
        .order('title')

      if (data) setSeries(data)
    }
    fetchSeries()
  }, [])

  // Handle thumbnail preview
  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile)
      setThumbnailPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [thumbnailFile])

  // Handle vertical thumbnail preview
  useEffect(() => {
    if (verticalThumbnailFile) {
      const url = URL.createObjectURL(verticalThumbnailFile)
      setVerticalThumbnailPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [verticalThumbnailFile])

  const handleVerticalThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVerticalThumbnailFile(file)
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        setFormData(prev => ({ ...prev, title: name }))
      }
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
    }
  }

  const handleTrailerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTrailerFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      alert('Please select a video file')
      return
    }

    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Step 1: Upload video file
      setUploadStage('Uploading video...')
      const videoFormData = new FormData()
      videoFormData.append('file', videoFile)
      videoFormData.append('type', 'video')

      const videoResponse = await fetch('/api/upload', {
        method: 'POST',
        body: videoFormData,
      })

      if (!videoResponse.ok) {
        throw new Error('Video upload failed')
      }

      const { url: videoUrl } = await videoResponse.json()
      setUploadProgress(40)

      // Step 2: Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        setUploadStage('Uploading thumbnail...')
        const thumbFormData = new FormData()
        thumbFormData.append('file', thumbnailFile)
        thumbFormData.append('type', 'thumbnail')

        const thumbResponse = await fetch('/api/upload', {
          method: 'POST',
          body: thumbFormData,
        })

        if (thumbResponse.ok) {
          const { url } = await thumbResponse.json()
          thumbnailUrl = url
        }
      }
      setUploadProgress(60)

      // Step 3: Upload vertical thumbnail if provided
      let verticalThumbnailUrl = null
      if (verticalThumbnailFile) {
        setUploadStage('Uploading vertical thumbnail...')
        const vertThumbFormData = new FormData()
        vertThumbFormData.append('file', verticalThumbnailFile)
        vertThumbFormData.append('type', 'vertical-thumbnail')

        const vertThumbResponse = await fetch('/api/upload', {
          method: 'POST',
          body: vertThumbFormData,
        })

        if (vertThumbResponse.ok) {
          const { url } = await vertThumbResponse.json()
          verticalThumbnailUrl = url
        }
      }
      setUploadProgress(70)

      // Step 4: Upload trailer if provided
      let trailerUrl = null
      if (trailerFile) {
        setUploadStage('Uploading trailer...')
        const trailerFormData = new FormData()
        trailerFormData.append('file', trailerFile)
        trailerFormData.append('type', 'trailer')

        const trailerResponse = await fetch('/api/upload', {
          method: 'POST',
          body: trailerFormData,
        })

        if (trailerResponse.ok) {
          const { url } = await trailerResponse.json()
          trailerUrl = url
        }
      }
      setUploadProgress(85)

      // Step 4: Create database record
      setUploadStage('Saving to database...')
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now()

      console.log('Saving to database with URL:', videoUrl)

      const { data: insertData, error: dbError } = await supabase.from('videos').insert({
        title: formData.title,
        description: formData.description || null,
        video_url: videoUrl,
        trailer_url: trailerUrl,
        thumbnail_url: thumbnailUrl,
        vertical_thumbnail_url: verticalThumbnailUrl,
        slug: slug,
        series_id: formData.seriesId || null,
        episode_number: formData.episodeNumber ? parseInt(formData.episodeNumber) : null,
        season_number: formData.seasonNumber ? parseInt(formData.seasonNumber) : null,
        is_published: false,
      }).select()

      console.log('Database response:', { insertData, dbError })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(dbError.message)
      }

      setUploadProgress(100)
      setUploadStage('Complete!')

      // Success - redirect after a moment
      setTimeout(() => {
        router.push('/admin/videos')
      }, 1500)

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
      setLoading(false)
      setUploadProgress(0)
      setUploadStage('')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
        <p className="text-gray-500 mt-1">Add a new video to your platform</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Video File *</h2>

            {!videoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <Film className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click to select a video file</p>
                <p className="text-sm text-gray-400">MP4, WebM, MOV up to 5GB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-4">
                    <Film className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Trailer Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trailer (optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Upload a short trailer or preview for this video</p>

            {!trailerFile ? (
              <div
                onClick={() => trailerInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <PlayCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Click to add a trailer</p>
                <p className="text-sm text-gray-400">MP4, WebM, MOV</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-brand-100 rounded-lg mr-4">
                    <PlayCircle className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trailerFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(trailerFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrailerFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <input
              ref={trailerInputRef}
              type="file"
              accept="video/*"
              onChange={handleTrailerSelect}
              className="hidden"
            />
          </div>

          {/* Video Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Series (optional)
                </label>
                <select
                  value={formData.seriesId}
                  onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No series</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Season Number
                  </label>
                  <input
                    type="number"
                    value={formData.seasonNumber}
                    onChange={(e) => setFormData({ ...formData, seasonNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    value={formData.episodeNumber}
                    onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail (optional)</h2>

            {!thumbnailFile ? (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <Image className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Click to add a thumbnail</p>
                <p className="text-sm text-gray-400">JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-32 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{thumbnailFile.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview('')
                    }}
                    className="text-sm text-red-500 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>

          {/* Vertical Thumbnail (for Top 10) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vertical Thumbnail (optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Portrait orientation for Top 10 section (2:3 ratio recommended)</p>

            {!verticalThumbnailFile ? (
              <div
                onClick={() => verticalThumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <Image className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Click to add a vertical thumbnail</p>
                <p className="text-sm text-gray-400">JPG, PNG, WebP - Portrait orientation</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={verticalThumbnailPreview}
                  alt="Vertical thumbnail preview"
                  className="w-20 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{verticalThumbnailFile.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setVerticalThumbnailFile(null)
                      setVerticalThumbnailPreview('')
                    }}
                    className="text-sm text-red-500 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <input
              ref={verticalThumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleVerticalThumbnailSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{uploadStage}</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress === 100 && (
                <div className="flex items-center mt-4 text-green-600">
                  <Check className="w-5 h-5 mr-2" />
                  Upload complete! Redirecting...
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !videoFile}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
