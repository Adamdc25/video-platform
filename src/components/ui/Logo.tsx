'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-sm' },
    md: { icon: 40, text: 'text-lg' },
    lg: { icon: 56, text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className="flex items-center gap-3">
      {/* AEON LIBRARY Logo Image */}
      <div className="relative flex-shrink-0" style={{ width: icon, height: icon }}>
        <Image
          src="https://video-stream-cdn.b-cdn.net/Logos/1.png"
          alt="AEON LIBRARY"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Text */}
      {showText && (
        <div className={`font-semibold ${text}`}>
          <span className="text-white">AEON</span>
          <span className="text-brand-400 ml-1">LIBRARY</span>
        </div>
      )}
    </div>
  )
}
