'use client'

import { useEffect } from 'react'

export function PWARegister() {
  console.log('[PWARegister] Component render')

  useEffect(() => {
    console.log('[PWARegister] useEffect running, window:', typeof window !== 'undefined', 'navigator.serviceWorker:', 'serviceWorker' in navigator)

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('[PWARegister] Attempting to register /sw.js...')
      // Try the complex next-pwa SW first
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('✓ Service Worker (sw.js) registered:', registration)
          console.log('  - Status:', registration.active ? 'active' : registration.installing ? 'installing' : 'pending')
        })
        .catch(error => {
          console.error('✗ Failed to register sw.js:', error.message || error)
          console.error('  Full error:', error)
          console.log('  Attempting fallback to simple SW...')

          // Fallback to simple SW
          return navigator.serviceWorker.register('/sw-simple.js', { scope: '/' })
            .then(registration => {
              console.log('✓ Service Worker (sw-simple.js) registered:', registration)
              console.log('  - Status:', registration.active ? 'active' : registration.installing ? 'installing' : 'pending')
            })
            .catch(simpleSWError => {
              console.error('✗ Both SW registrations failed:', simpleSWError)
            })
        })
    }
  }, [])

  return null
}
