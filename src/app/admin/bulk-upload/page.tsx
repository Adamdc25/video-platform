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

interface CSVRow {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  trailer_url?: string
  vertical_thumbnail_url?: string
  season_number?: string
  episode_number?: string
  is_published?: string
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

interface ImportRow extends CSVRow {
  status: 'pending' | 'importing' | 'success' | 'error'
  error?: string
}

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'files'>('csv')

  // CSV Import State
  const [csvData, setCsvData] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)

  // File Upload State
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const csvInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // ========== CSV IMPORT FUNCTIONS ==========

  function parseCSV(text: string): CSVRow[] {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      // Handle quoted values with commas
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

  async function importCSVData() {
    setImporting(true)
    const updatedData = [...csvData]

    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i]
      updatedData[i] = { ...row, status: 'importing' }
      setCsvData([...updatedData])

      try {
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
          published_at: row.is_published?.toLowerCase() === 'true' ? new Date().toISOString() : null
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
    const template = `title,description,video_url,thumbnail_url,trailer_url,vertical_thumbnail_url,season_number,episode_number,is_published
"Episode 1: Introduction","This is the first episode description","https://your-cdn.com/video1.mp4","https://your-cdn.com/thumb1.jpg","https://your-cdn.com/trailer1.mp4","https://your-cdn.com/vertical1.jpg",1,1,true
"Episode 2: Getting Started","Second episode description","https://your-cdn.com/video2.mp4","https://your-cdn.com/thumb2.jpg","","",1,2,false`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'video-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ========== FILE UPLOAD FUNCTIONS ==========

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newItems: UploadItem[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      file,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      status: 'pending',
      progress: 0
    }))

    setUploadQueue(prev => [...prev, ...newItems])
  }

  function updateItemTitle(id: string, title: string) {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, title } : item
    ))
  }

  function removeItem(id: string) {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  async function uploadFileToStorage(item: UploadItem): Promise<string> {
    // This is a placeholder - you'll need to implement actual upload to Bunny.net
    // For now, we'll simulate the upload

    const formData = new FormData()
    formData.append('file', item.file)

    // Replace with your actual Bunny.net upload endpoint
    const BUNNY_STORAGE_URL = process.env.NEXT_PUBLIC_BUNNY_STORAGE_URL || 'https://uk.storage.bunnycdn.com/your-zone'
    const BUNNY_API_KEY = process.env.NEXT_PUBLIC_BUNNY_API_KEY || ''

    const fileName = `${Date.now()}-${item.file.name.replace(/\s+/g, '-')}`

    const response = await fetch(`${BUNNY_STORAGE_URL}/videos/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': item.file.type
      },
      body: item.file
    })

    if (!response.ok) {
      throw new Error('Failed to upload to CDN')
    }

    // Return the CDN URL
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
        // Simulate progress updates
        for (let p = 0; p <= 80; p += 20) {
          updatedQueue[i] = { ...item, status: 'uploading', progress: p }
          setUploadQueue([...updatedQueue])
          await new Promise(r => setTimeout(r, 500))
        }

        const videoUrl = await uploadFileToStorage(item)

        updatedQueue[i] = { ...item, status: 'uploading', progress: 90 }
        setUploadQueue([...updatedQueue])

        // Create video record in database
        const { error } = await supabase.from('videos').insert({
          title: item.title,
          video_url: videoUrl,
          slug: generateSlug(item.title),
          is_published: false
        })

        if (error) throw error

        updatedQueue[i] = { ...item, status: 'success', progress: 100, videoUrl }
      } catch (err: any) {
        updatedQueue[i] = { ...item, status: 'error', error: err.message }
      }

      setUploadQueue([...updatedQueue])
    }

    setIsUploading(false)
  }

  const pendingCount = uploadQueue.filter(i => i.status === 'pending').length
  const successCount = uploadQueue.filter(i => i.status === 'success').length
  const errorCount = uploadQueue.filter(i => i.status === 'error').length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/videos"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Bulk Upload</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'csv'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            CSV Import
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-5 h-5" />
            Multi-File Upload
          </button>
        </div>

        {/* CSV Import Tab */}
        {activeTab === 'csv' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Import from CSV/Excel</h2>
              <p className="text-gray-400 mb-4">
                Upload a CSV file with your video details. The file should include columns for title, video_url, and optionally description, thumbnail_url, etc.
              </p>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <button
                  onClick={() => csvInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Upload CSV
                </button>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </div>

              {csvData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white">
                      {csvData.length} videos ready to import
                    </p>
                    {!importing && !importComplete && (
                      <button
                        onClick={importCSVData}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Import
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 text-sm py-3 px-4">Status</th>
                          <th className="text-left text-gray-400 text-sm py-3 px-4">Title</th>
                          <th className="text-left text-gray-400 text-sm py-3 px-4">Video URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-3 px-4">
                              {row.status === 'pending' && (
                                <span className="text-gray-400 text-sm">Pending</span>
                              )}
                              {row.status === 'importing' && (
                                <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                              )}
                              {row.status === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {row.status === 'error' && (
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-400 text-xs">{row.error}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-white text-sm">{row.title}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm truncate max-w-xs">
                              {row.video_url}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {importComplete && (
                    <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">
                        Import complete! {csvData.filter(r => r.status === 'success').length} videos imported successfully.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-500" />
                CSV Format Instructions
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• <strong className="text-white">Required columns:</strong> title, video_url</li>
                <li>• <strong className="text-white">Optional columns:</strong> description, thumbnail_url, trailer_url, vertical_thumbnail_url, season_number, episode_number, is_published</li>
                <li>• Use "true" or "false" for is_published column</li>
                <li>• Wrap text with commas in double quotes</li>
                <li>• Video URLs should point to your Bunny.net CDN</li>
              </ul>
            </div>
          </div>
        )}

        {/* Multi-File Upload Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Upload Multiple Files</h2>
              <p className="text-gray-400 mb-4">
                Select multiple video files to upload. They will be uploaded to your CDN and added to your video library.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-white mb-2">Click to select files or drag and drop</p>
                <p className="text-gray-500 text-sm">MP4, MOV, WebM supported</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadQueue.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {pendingCount > 0 && <span className="mr-4">{pendingCount} pending</span>}
                      {successCount > 0 && <span className="mr-4 text-green-400">{successCount} complete</span>}
                      {errorCount > 0 && <span className="text-red-400">{errorCount} failed</span>}
                    </div>
                    {pendingCount > 0 && !isUploading && (
                      <button
                        onClick={startUploadQueue}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Upload
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {uploadQueue.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-4">
                          <File className="w-8 h-8 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateItemTitle(item.id, e.target.value)}
                              disabled={item.status !== 'pending'}
                              className="w-full bg-transparent text-white border-b border-transparent hover:border-gray-600 focus:border-teal-500 focus:outline-none pb-1 disabled:opacity-50"
                              placeholder="Video title"
                            />
                            <p className="text-gray-500 text-sm truncate">
                              {item.file.name} • {(item.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {item.status === 'uploading' && (
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-teal-500 transition-all"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="text-teal-500 text-sm">{item.progress}%</span>
                              </div>
                            )}
                            {item.status === 'success' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {item.status === 'error' && (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-red-400 text-xs">{item.error}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-500" />
                Upload Notes
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Videos will be uploaded as drafts (unpublished)</li>
                <li>• Edit each video after upload to add thumbnails, descriptions, etc.</li>
                <li>• Large files may take several minutes to upload</li>
                <li>• Ensure you have sufficient Bunny.net storage quota</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
