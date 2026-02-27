'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/register-sw.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return null
}
