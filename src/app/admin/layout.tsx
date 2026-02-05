import Link from 'next/link'
import { LayoutDashboard, Upload, Video, Settings, Home, Users, Trophy, FolderUp, BarChart3 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-xl">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <NavLink href="/admin/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/videos" icon={<Video className="w-5 h-5" />}>
              Videos
            </NavLink>
            <NavLink href="/admin/upload" icon={<Upload className="w-5 h-5" />}>
              Upload
            </NavLink>
            <NavLink href="/admin/bulk-upload" icon={<FolderUp className="w-5 h-5" />}>
              Bulk Upload
            </NavLink>
            <NavLink href="/admin/top10" icon={<Trophy className="w-5 h-5" />}>
              Top 10
            </NavLink>
            <NavLink href="/admin/team" icon={<Users className="w-5 h-5" />}>
              Team
            </NavLink>
            <NavLink href="/admin/analytics" icon={<BarChart3 className="w-5 h-5" />}>
              Analytics
            </NavLink>
            <NavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />}>
              Settings
            </NavLink>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <NavLink href="/" icon={<Home className="w-5 h-5" />}>
              Back to Site
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition group"
    >
      <span className="text-gray-400 group-hover:text-primary-400 transition">
        {icon}
      </span>
      <span className="ml-3">{children}</span>
    </Link>
  )
}
