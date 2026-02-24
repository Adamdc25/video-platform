'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'

type InviteStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'accepting' | 'success' | 'error'

export default function AcceptInvitePage() {
  const [status, setStatus] = useState<InviteStatus>('loading')
  const [inviteEmail, setInviteEmail] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const supabase = createClient()

  useEffect(() => {
    checkInviteAndUser()
  }, [token])

  async function checkInviteAndUser() {
    // Check if user is logged in
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    // Check if invite is valid
    const { data: invite, error: inviteError } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      setStatus('invalid')
      return
    }

    // Check if already used
    if (invite.used_by) {
      setStatus('used')
      return
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      setStatus('expired')
      return
    }

    // Check if email restricted and matches
    if (invite.email && currentUser && invite.email !== currentUser.email) {
      setError(`This invite is restricted to ${invite.email}`)
      setStatus('invalid')
      return
    }

    setInviteEmail(invite.email)
    setStatus('valid')

    // If user is logged in, auto-accept
    if (currentUser) {
      acceptInvite(currentUser.id, currentUser.email)
    }
  }

  async function acceptInvite(userId: string, userEmail: string | undefined) {
    setStatus('accepting')

    try {
      // Update the invite as used
      const { error: updateInviteError } = await supabase
        .from('admin_invites')
        .update({
          used_by: userId,
          used_at: new Date().toISOString()
        })
        .eq('token', token)
        .is('used_by', null)

      if (updateInviteError) throw updateInviteError

      // Get the invite to find who created it
      const { data: invite } = await supabase
        .from('admin_invites')
        .select('created_by')
        .eq('token', token)
        .single()

      // Update user profile to be admin
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          invited_by: invite?.created_by
        })
        .eq('id', userId)

      if (updateProfileError) {
        // Try to insert if profile doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            is_admin: true,
            invited_by: invite?.created_by
          })

        if (insertError) throw insertError
      }

      setStatus('success')

      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite')
      setStatus('error')
    }
  }

  // Handle auth callback for new signups
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && status === 'valid') {
        acceptInvite(session.user.id, session.user.email)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [status])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" showText={true} />
          </Link>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Checking invite...
              </h2>
            </>
          )}

          {status === 'valid' && !user && (
            <>
              <Shield className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Admin Invite
              </h2>
              <p className="text-gray-400 mb-6">
                You've been invited to join as an admin.
                {inviteEmail && (
                  <span className="block mt-2 text-sm">
                    This invite is for: <strong className="text-white">{inviteEmail}</strong>
                  </span>
                )}
              </p>
              <div className="space-y-3">
                <Link
                  href={`/auth/login?redirect=/admin/invite/${token}`}
                  className="block w-full px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-lg transition-colors"
                >
                  Log In to Accept
                </Link>
                <Link
                  href={`/auth/signup?redirect=/admin/invite/${token}`}
                  className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </>
          )}

          {status === 'accepting' && (
            <>
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Setting up your admin access...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome to the team!
              </h2>
              <p className="text-gray-400 mb-4">
                You now have admin access. Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Invalid Invite
              </h2>
              <p className="text-gray-400 mb-4">
                {error || 'This invite link is not valid.'}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Go Home
              </Link>
            </>
          )}

          {status === 'expired' && (
            <>
              <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Invite Expired
              </h2>
              <p className="text-gray-400 mb-4">
                This invite link has expired. Please ask for a new invite.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Go Home
              </Link>
            </>
          )}

          {status === 'used' && (
            <>
              <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Already Used
              </h2>
              <p className="text-gray-400 mb-4">
                This invite has already been used.
              </p>
              <Link
                href="/admin"
                className="inline-block px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-400 mb-4">
                {error || 'Failed to accept invite. Please try again.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
