'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Users,
  Mail,
  Clock,
  Shield
} from 'lucide-react'

interface TeamMember {
  id: string
  email: string | null
  full_name: string | null
  is_admin: boolean
  created_at: string
}

interface Invite {
  id: string
  token: string
  email: string | null
  created_at: string
  expires_at: string
  used_by: string | null
  used_at: string | null
}

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Fetch team members (admins)
    const { data: members } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_admin, created_at')
      .eq('is_admin', true)
      .order('created_at', { ascending: true })

    if (members) {
      setTeamMembers(members)
    }

    // Fetch pending invites
    const { data: pendingInvites } = await supabase
      .from('admin_invites')
      .select('*')
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (pendingInvites) {
      setInvites(pendingInvites)
    }

    setLoading(false)
  }

  async function generateInviteLink() {
    setGenerating(true)
    setError('')
    setGeneratedLink('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate a random token
      const token = crypto.randomUUID() + '-' + crypto.randomUUID()

      // Set expiry to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { error: insertError } = await supabase
        .from('admin_invites')
        .insert({
          token,
          email: newInviteEmail || null,
          created_by: user.id,
          expires_at: expiresAt.toISOString()
        })

      if (insertError) throw insertError

      // Generate the invite link
      const baseUrl = window.location.origin
      const inviteLink = `${baseUrl}/admin/invite/${token}`
      setGeneratedLink(inviteLink)
      setNewInviteEmail('')

      // Refresh invites list
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite link')
    } finally {
      setGenerating(false)
    }
  }

  async function deleteInvite(inviteId: string) {
    const { error } = await supabase
      .from('admin_invites')
      .delete()
      .eq('id', inviteId)

    if (!error) {
      setInvites(invites.filter(i => i.id !== inviteId))
    }
  }

  async function removeAdmin(userId: string) {
    if (!confirm('Are you sure you want to remove admin access for this user?')) {
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', userId)

    if (!error) {
      setTeamMembers(teamMembers.filter(m => m.id !== userId))
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Team Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Invite Section */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-500" />
            Invite New Admin
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email (optional - leave blank for open invite)
              </label>
              <input
                type="email"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={generateInviteLink}
              disabled={generating}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Invite Link'}
            </button>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {generatedLink && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Share this link with your team member:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This link expires in 7 days
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-500" />
              Pending Invites ({invites.length})
            </h2>

            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="text-white">
                      {invite.email || 'Open invite (any email)'}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {formatDate(invite.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/admin/invite/${invite.token}`)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copy invite link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteInvite(invite.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete invite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-500" />
            Admin Team ({teamMembers.length})
          </h2>

          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {member.full_name || member.email || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Joined {formatDate(member.created_at)}
                  </span>
                  {index > 0 && (
                    <button
                      onClick={() => removeAdmin(member.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove admin access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <h3 className="text-white font-medium mb-2">How it works:</h3>
          <ol className="list-decimal list-inside text-gray-400 text-sm space-y-1">
            <li>Generate an invite link (optionally restrict to a specific email)</li>
            <li>Share the link with your team member</li>
            <li>They sign up or log in using the invite link</li>
            <li>They automatically get admin access</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
