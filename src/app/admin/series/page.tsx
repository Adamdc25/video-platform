'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Edit2, Image as ImageIcon, PlayCircle, Trash2, X } from 'lucide-react'

interface Series {
  id: string
  title: string
  description?: string
  backdrop_url?: string
  cover_art_url?: string
  trailer_url?: string
  featured: boolean
}

interface EditingSeriesData {
  id: string
  title: string
  description: string
  backdrop_url: string
  cover_art_url: string
  trailer_url: string
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingSeriesData | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('series')
      .select('id, title, description, backdrop_url, cover_art_url, trailer_url, featured')
      .order('title', { ascending: true })

    if (err) {
      console.error('Error fetching series:', err)
      setError('Failed to load series')
    } else {
      setSeries(data || [])
    }
    setLoading(false)
  }

  const openEdit = (s: Series) => {
    setEditingId(s.id)
    setEditingData({
      id: s.id,
      title: s.title,
      description: s.description || '',
      backdrop_url: s.backdrop_url || '',
      cover_art_url: s.cover_art_url || '',
      trailer_url: s.trailer_url || '',
    })
    setError(null)
    setSuccess(false)
  }

  const closeEdit = () => {
    setEditingId(null)
    setEditingData(null)
    setError(null)
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!editingData) return

    if (!editingData.title.trim()) {
      setError('Series name is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: err } = await supabase
      .from('series')
      .update({
        title: editingData.title.trim(),
        description: editingData.description.trim() || null,
        backdrop_url: editingData.backdrop_url || null,
        cover_art_url: editingData.cover_art_url || null,
        trailer_url: editingData.trailer_url || null,
      })
      .eq('id', editingData.id)

    if (err) {
      setError('Failed to save: ' + err.message)
      console.error(err)
    } else {
      setSuccess(true)
      setSeries(
        series.map(s =>
          s.id === editingData.id
            ? {
                ...s,
                title: editingData.title,
                description: editingData.description || undefined,
                backdrop_url: editingData.backdrop_url || undefined,
                cover_art_url: editingData.cover_art_url || undefined,
                trailer_url: editingData.trailer_url || undefined,
              }
            : s
        )
      )
      setTimeout(() => closeEdit(), 1500)
    }

    setSaving(false)
  }

  const handleDelete = async (seriesId: string, seriesTitle: string) => {
    if (!confirm(`Delete "${seriesTitle}" and all its videos? This cannot be undone.`)) {
      return
    }

    setDeleting(seriesId)

    // Delete all videos first
    const { error: videoErr } = await supabase
      .from('videos')
      .delete()
      .eq('series_id', seriesId)

    if (videoErr) {
      setError('Failed to delete videos: ' + videoErr.message)
      setDeleting(null)
      return
    }

    // Then delete the series
    const { error: seriesErr } = await supabase
      .from('series')
      .delete()
      .eq('id', seriesId)

    if (seriesErr) {
      setError('Failed to delete series: ' + seriesErr.message)
    } else {
      setSeries(series.filter(s => s.id !== seriesId))
    }

    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="p-8 bg-black min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Manage Series</h1>
        <p className="text-gray-400">Edit series info, images, and trailers • Total: {series.length} series</p>
      </div>

      {/* Series Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {series.map(s => (
          <div key={s.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-teal-500 transition flex flex-col">
            {/* Image Preview */}
            <div className="relative h-40 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {s.backdrop_url ? (
                <img
                  src={s.backdrop_url}
                  alt={s.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <p className="text-xs">No hero image</p>
                </div>
              )}
              {s.featured && (
                <div className="absolute top-2 right-2 bg-teal-500 text-black px-2 py-1 rounded text-xs font-bold">
                  FEATURED
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-white font-bold mb-1 truncate">{s.title}</h3>
              {s.description && (
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">{s.description}</p>
              )}

              {/* Status Indicators */}
              <div className="space-y-1 mb-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  {s.backdrop_url ? (
                    <span className="text-green-400">✓ Hero image</span>
                  ) : (
                    <span className="text-red-400">✗ No hero</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-3 h-3" />
                  {s.trailer_url ? (
                    <span className="text-green-400">✓ Trailer</span>
                  ) : (
                    <span className="text-yellow-400">○ No trailer</span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => openEdit(s)}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.title)}
                  disabled={deleting === s.id}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition disabled:opacity-50 text-sm"
                  title="Delete series"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && editingData && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-teal-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-950 border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Series</h2>
                <p className="text-gray-400 mt-1">Update series details and media</p>
              </div>
              <button onClick={closeEdit} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border border-green-700 text-green-200 p-3 rounded">
                  ✓ Saved successfully!
                </div>
              )}

              {/* Series Name */}
              <div>
                <label className="block text-white font-semibold mb-2">Series Name *</label>
                <input
                  type="text"
                  value={editingData.title}
                  onChange={e => setEditingData({ ...editingData, title: e.target.value })}
                  placeholder="Enter series name"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-semibold mb-2">Description</label>
                <textarea
                  value={editingData.description}
                  onChange={e => setEditingData({ ...editingData, description: e.target.value })}
                  placeholder="Enter series description"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Backdrop URL */}
              <div>
                <label className="block text-white font-semibold mb-2">Hero Image (Backdrop)</label>
                <p className="text-gray-400 text-sm mb-2">Large landscape image for hero section</p>
                <input
                  type="url"
                  value={editingData.backdrop_url}
                  onChange={e => setEditingData({ ...editingData, backdrop_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                {editingData.backdrop_url && (
                  <div className="mt-3 border border-gray-700 rounded overflow-hidden h-32">
                    <img
                      src={editingData.backdrop_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Invalid hero image URL')}
                    />
                  </div>
                )}
              </div>

              {/* Cover Art URL */}
              <div>
                <label className="block text-white font-semibold mb-2">Cover Art</label>
                <p className="text-gray-400 text-sm mb-2">Poster image for series card</p>
                <input
                  type="url"
                  value={editingData.cover_art_url}
                  onChange={e => setEditingData({ ...editingData, cover_art_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                {editingData.cover_art_url && (
                  <div className="mt-3 border border-gray-700 rounded overflow-hidden h-40 w-32">
                    <img
                      src={editingData.cover_art_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Invalid cover art URL')}
                    />
                  </div>
                )}
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-white font-semibold mb-2">Trailer Video</label>
                <p className="text-gray-400 text-sm mb-2">Video URL for auto-playing trailer</p>
                <input
                  type="url"
                  value={editingData.trailer_url}
                  onChange={e => setEditingData({ ...editingData, trailer_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-950 border-t border-gray-700 p-6 flex gap-3 justify-end">
              <button
                onClick={closeEdit}
                className="px-6 py-2 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
