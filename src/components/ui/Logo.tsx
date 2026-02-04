'use client'

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
      {/* TMJ-style Logo Icon */}
      <div className="relative" style={{ width: icon, height: icon }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 bg-teal-400/30 rounded-lg blur-md"
          style={{ transform: 'scale(1.2)' }}
        />

        {/* Logo SVG */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full"
        >
          {/* Background with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main background */}
          <rect x="4" y="4" width="40" height="40" rx="8" fill="#111827" />

          {/* The "i" dot */}
          <circle cx="14" cy="14" r="3" fill="url(#logoGradient)" filter="url(#glow)" />

          {/* The "M" shape */}
          <path
            d="M10 36V20L18 30L26 20V36"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />

          {/* Extended right part to make "iM" distinctive */}
          <path
            d="M26 20V36"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Additional vertical line for "i" */}
          <path
            d="M14 20V36"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Accent line */}
          <path
            d="M32 14H38"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M35 11V17"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className={`font-semibold ${text}`}>
          <span className="text-white">DISCOVER</span>
          <span className="text-teal-400 ml-1">TMJ</span>
        </div>
      )}
    </div>
  )
}
