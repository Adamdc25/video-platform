'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, Search, Plus, PlaySquare, User, LogOut, Settings } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        setIsAdmin(profile?.is_admin || false)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navItems = [
    { href: '/', label: 'HOME', icon: Home },
    { href: '/search', label: 'SEARCH', icon: Search },
    { href: '/watchlist', label: 'WATCHLIST', icon: Plus },
    { href: '/series', label: 'SERIES', icon: PlaySquare },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo size="md" showText={false} />
            <span className="text-white font-semibold text-xs sm:text-sm md:text-lg ml-1 sm:ml-2 hidden sm:block">
              DISCOVER<span className="text-teal-400 ml-1">TMJ</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-xs sm:text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* User Profile */}
          <div className="relative flex-shrink-0">
            {user ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
                  aria-label="User menu"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 py-1 z-50">
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-800">
                      <p className="text-xs sm:text-sm text-white truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="text-xs text-teal-400">Admin</span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/auth/login"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 transition-colors"
                aria-label="Login"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
