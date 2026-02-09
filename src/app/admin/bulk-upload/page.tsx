'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CSVRow {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  series_name?: string  // NEW: Added for series grouping
  trailer_url?: string
  vertical_thumbnail_url?: string
  season_number?: string
  episode_number?: string
  is_published?: string
}

interface ImportRow extends CSVRow {
  status: 'pending' | 'importing' | 'success' | 'error'
  error?: string
}

interface UploadItem {
  id: string
  file: File
  title: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  videoUrl?: string
}

export default function BulkUploadPage() {
  const supabase = createClient()
  const [csvData, setCsvData] = useState<ImportRow[]>([])
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [importing, setImporting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [importComplete, setImportComplete] = useState(false)

  function parseCSV(text: string): CSVRow[] {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = []
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
      rows.push(row)
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
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-6)
  }

  // UPDATED FUNCTION: Now handles series creation/lookup
  async function importCSVData() {
    setImporting(true)
    const updatedData = [...csvData]
    const seriesCache: Record<string, string> = {} // Cache for series lookups

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i]
      updatedData[i] = { ...row, status: 'importing' }
      setCsvData([...updatedData])

      try {
        let seriesId: string | null = null

        // Handle series creation/lookup if series_name is provided
        if (row.series_name) {
          if (seriesCache[row.series_name]) {
            // Use cached series ID
            seriesId = seriesCache[row.series_name]
          } else {
            // Check if series already exists
            const { data: existingSeries } = await supabase
              .from('series')
              .select('id')
              .eq('title', row.series_name)
              .single()

            if (existingSeries) {
              seriesId = existingSeries.id
              seriesCache[row.series_name] = seriesId
            } else {
              // Create new series
              const seriesSlug = generateSlug(row.series_name)
              const { data: newSeries, error: seriesError } = await supabase
                .from('series')
                .insert({
                  title: row.series_name,
                  slug: seriesSlug,
                })
                .select('id')
                .single()

              if (seriesError) throw new Error(`Failed to create series: ${seriesError.message}`)
              if (newSeries) {
                seriesId = newSeries.id
                seriesCache[row.series_name] = seriesId
              }
            }
          }
        }

        // Insert video to database
        const { error } = await supabase.from('videos').insert({
          title: row.title,
          description: row.description,
          video_url: row.video_url,
          thumbnail_url: row.thumbnail_url,
          trailer_url: row.trailer_url,
          vertical_thumbnail_url: row.vertical_thumbnail_url,
          season_number: row.season_number ? parseInt(row.season_number) : null,
          episode_number: row.episode_number ? parseInt(row.episode_number) : null,
          series_id: seriesId, // NEW: Link to series
          is_published: row.is_published?.toLowerCase() === 'true',
          slug: generateSlug(row.title),
          published_at: row.is_published?.toLowerCase() === 'true' ? new Date().toISOString() : null
        })

        if (error) throw error
        updatedData[i] = { ...row, status: 'success' }
      } catch (err: any) {
        updatedData[i] = { ...row, status: 'error', error: err.message }
      }
    }

    setCsvData([...updatedData])
    setImporting(false)
    setImportComplete(true)
  }

  async function uploadFileToStorage(item: UploadItem): Promise<string> {
    const formData = new FormData()
    formData.append('file', item.file)

    const BUNNY_STORAGE_URL = process.env.NEXT_PUBLIC_BUNNY_STORAGE_URL || 'https://uk.storage.bunnycdn.com/your-zone'
    const fileName = `${Date.now()}-${item.file.name.replace(/\s+/g, '-')}`
    const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://video-stream-cdn.b-cdn.net'
    
    return `${CDN_URL}/videos/${fileName}`
  }

  async function startUploadQueue() {
    setIsUploading(true)
    const updatedQueue = [...uploadQueue]

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i]
      if (item.status !== 'pending') continue

      updatedQueue[i] = { ...item, status: 'uploading', progress: 0 }
      setUploadQueue([...updatedQueue])

      try {
        for (let p = 0; p <= 80; p += 20) {
          updatedQueue[i] = { ...item, status: 'uploading', progress: p }
          setUploadQueue([...updatedQueue])
          await new Promise(r => setTimeout(r, 500))
        }

        const videoUrl = await uploadFileToStorage(item)
        updatedQueue[i] = { ...item, status: 'uploading', progress: 90 }
        updatedQueue[i] = { ...item, status: 'success', progress: 100, videoUrl }
      } catch (err: any) {
        updatedQueue[i] = { ...item, status: 'error', error: err.message }
      }
    }

    setUploadQueue([...updatedQueue])
    setIsUploading(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Bulk Upload</h1>

      <div className="space-y-8">
        {/* CSV Import Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Import from CSV</h2>
          
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            />

            {csvData.length > 0 && (
              <div>
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Series</th>
                        <th className="px-4 py-2 text-left">Episode</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{row.title}</td>
                          <td className="px-4 py-2">{row.series_name || '-'}</td>
                          <td className="px-4 py-2">{row.episode_number || '-'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              row.status === 'success' ? 'bg-green-100 text-green-800' :
                              row.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={importCSVData}
                  disabled={importing}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Start Import'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
