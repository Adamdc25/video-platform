'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  File,
  Trash2,
  Play
} from 'lucide-react'

// Updated interface to include series asset fields
interface CSVRow {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  trailer_url?: string
  vertical_thumbnail_url?: string
  series_name?: string
  series_description?: string
  cover_art_url?: string
  backdrop_url?: string
  featured?: string
  season_number?: string
  episode_number?: string
  is_published?: string
}

interface ImportStatus {
  status: 'pending' | 'importing' | 'success' | 'error'
  error?: string
}

export default function BulkUploadPage() {
  const [csvData, setCsvData] = useState<(CSVRow & ImportStatus)[]>([])
  const [importing, setImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  function parseCSV(text: string) {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const values = []
      let current = ''
      let inQuotes = false

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (row.title && row.video_url) {
        rows.push(row)
      }
    }

    return rows
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = parseCSV(text)
      setCsvData(parsed.map(row => ({ ...row, status: 'pending' as const })))
      setImportComplete(false)
    }
    reader.readAsText(file)
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
  }

  // Enhanced series handling with asset fields
  async function getOrCreateSeries(seriesName: string, seriesDescription?: string, assets?: { cover_art_url?: string; backdrop_url?: string; trailer_url?: string; featured?: string }) {
    if (!seriesName) return null

    try {
      // Check if series exists
      const { data: existing, error: queryError } = await supabase
        .from('series')
        .select('id')
        .ilike('title', seriesName)
        .single()

      if (existing) {
        return existing.id
      }

      // Create new series with asset fields
      const { data: newSeries, error: insertError } = await supabase
        .from('series')
        .insert({
          title: seriesName,
          description: seriesDescription || null,
          slug: generateSlug(seriesName),
          cover_art_url: assets?.cover_art_url || null,
          backdrop_url: assets?.backdrop_url || null,
          trailer_url: assets?.trailer_url || null,
          featured: assets?.featured?.toLowerCase() === 'true' || false
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      return newSeries?.id
    } catch (err: any) {
      console.error('Error with series:', err.message)
      return null
    }
  }

  async function importCSVData() {
    setImporting(true)
    const updatedData = [...csvData]
    const seriesCache: { [key: string]: string } = {} // Cache series IDs

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i]
      updatedData[i] = { ...row, status: 'importing' }
      setCsvData([...updatedData])

      try {
        let seriesId = null

        // Handle series if series_name is provided
        if (row.series_name) {
          // Check cache first
          if (!seriesCache[row.series_name]) {
            seriesId = await getOrCreateSeries(row.series_name, row.series_description, {
              cover_art_url: row.cover_art_url,
              backdrop_url: row.backdrop_url,
              trailer_url: row.trailer_url,
              featured: row.featured
            })
            if (seriesId) {
              seriesCache[row.series_name] = seriesId
            }
          } else {
            seriesId = seriesCache[row.series_name]
          }
        }

        // Insert video
        const { error } = await supabase.from('videos').insert({
          title: row.title,
          description: row.description || null,
          video_url: row.video_url,
          thumbnail_url: row.thumbnail_url || null,
          trailer_url: row.trailer_url || null,
          vertical_thumbnail_url: row.vertical_thumbnail_url || null,
          season_number: row.season_number ? parseInt(row.season_number) : null,
          episode_number: row.episode_number ? parseInt(row.episode_number) : null,
          is_published: row.is_published?.toLowerCase() === 'true',
          slug: generateSlug(row.title),
          published_at: row.is_published?.toLowerCase() === 'true' ? new Date().toISOString() : null,
          series_id: seriesId || null
        })

        if (error) throw error
        updatedData[i] = { ...row, status: 'success' }
      } catch (err: any) {
        updatedData[i] = { ...row, status: 'error', error: err.message }
      }

      setCsvData([...updatedData])
    }

    setImporting(false)
    setImportComplete(true)
  }

  function downloadTemplate() {
    const template = `title,description,video_url,thumbnail_url,series_name,series_description,cover_art_url,backdrop_url,trailer_url,featured,season_number,episode_number,is_published
"E1. The Student Mirror","What Students Really Think","https://your-cdn.com/video1.mp4","https://your-cdn.com/thumb1.jpg","The Lies We Are Forced To Teach","A groundbreaking series","https://your-cdn.com/cover.jpg","https://your-cdn.com/backdrop.jpg","https://your-cdn.com/trailer.mp4","true",1,1,true
"E2. Breaking the Myth","Is Success Just a Paycheck?","https://your-cdn.com/video2.mp4","https://your-cdn.com/thumb2.jpg","The Lies We Are Forced To Teach","A groundbreaking series","https://your-cdn.com/cover.jpg","https://your-cdn.com/backdrop.jpg","https://your-cdn.com/trailer.mp4","true",1,2,true`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Import Videos</h1>
          <p className="text-gray-400">Import multiple videos and series at once with cover art, backdrops, and trailers</p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FileSpreadsheet className="w-8 h-8 text-teal-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">CSV File Upload</h2>
              <p className="text-sm text-gray-400">Upload a CSV file with video data, series info, and asset URLs</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />

            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Upload className="w-5 h-5" />
                Choose CSV File
              </button>

              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
            </div>

            {csvData.length > 0 && (
              <div className="text-sm text-gray-400">
                {csvData.length} row{csvData.length !== 1 ? 's' : ''} loaded
              </div>
            )}
          </div>
        </div>

        {/* Data Preview */}
        {csvData.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Preview & Import</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {csvData.map((row, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{row.title}</h3>
                      {row.series_name && (
                        <p className="text-sm text-teal-400">Series: {row.series_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {row.status === 'pending' && <span className="text-gray-400 text-sm">Pending</span>}
                      {row.status === 'importing' && <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />}
                      {row.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {row.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{row.description}</p>
                  {row.error && (
                    <p className="text-sm text-red-400">Error: {row.error}</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={importCSVData}
              disabled={importing || importComplete}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-700 text-black disabled:text-gray-400 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : importComplete ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Import Complete
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Start Import
                </>
              )}
            </button>
          </div>
        )}

        {/* Success Message */}
        {importComplete && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-400 mb-1">Import Complete!</h3>
              <p className="text-sm text-gray-400">
                Your videos and series have been imported. You can now view them on the home page and series pages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}