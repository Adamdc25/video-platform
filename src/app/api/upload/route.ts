import { NextRequest, NextResponse } from 'next/server'

// Configure for large file uploads in Next.js 14
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'video'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Get environment variables
    const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE
    const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD
    const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL

    console.log('Environment check:', {
      hasStorageZone: !!BUNNY_STORAGE_ZONE,
      hasPassword: !!BUNNY_STORAGE_PASSWORD,
      hasCdnUrl: !!BUNNY_CDN_URL,
      storageZone: BUNNY_STORAGE_ZONE,
    })

    if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_CDN_URL) {
      console.error('Missing Bunny.net environment variables')
      return NextResponse.json(
        { error: 'Server configuration error - missing credentials' },
        { status: 500 }
      )
    }

    // Validate video format
    const validVideoFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v']
    const validImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    if (type === 'video' && !validVideoFormats.includes(extension)) {
      return NextResponse.json(
        { error: 'Invalid video format. Supported: MP4, WebM, MOV, AVI, MKV' },
        { status: 400 }
      )
    }

    if (type === 'thumbnail' && !validImageFormats.includes(extension)) {
      return NextResponse.json(
        { error: 'Invalid image format. Supported: JPG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
    const uniqueFilename = `${baseName}-${timestamp}-${randomString}.${extension}`

    const folder = type === 'video' ? 'videos' : 'thumbnails'
    const path = `${folder}/${uniqueFilename}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Bunny.net Storage (UK region)
    const storageRegion = process.env.BUNNY_STORAGE_REGION || ''
    const regionPrefix = storageRegion ? `${storageRegion}.` : ''
    const storageUrl = `https://${regionPrefix}storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${path}`

    console.log('Uploading to Bunny:', {
      url: storageUrl,
      fileSize: buffer.length,
      fileName: uniqueFilename,
    })

    const response = await fetch(storageUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_STORAGE_PASSWORD,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    })

    console.log('Bunny response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bunny upload failed:', response.status, errorText)
      return NextResponse.json(
        { error: `Upload failed: ${response.status} ${response.statusText}` },
        { status: 500 }
      )
    }

    // Return the CDN URL
    const cdnUrl = `${BUNNY_CDN_URL}/${path}`
    console.log('Upload successful:', cdnUrl)

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      filename: uniqueFilename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
