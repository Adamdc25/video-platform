'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Save, X, Folder, Tag } from 'lucide-react'
import type { Series, Category } from '@/types/database'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'series' | 'categories'>('series')
  const [series, setSeries] = useState<Series[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [seriesForm, setSeriesForm] = useState({ name: '', description: '' })
  const [categoryForm, setCategoryForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    setLoading(true)

    try {
      const [seriesResult, categoriesResult] = await Promise.all([
        supabase.from('series').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ])

      if (seriesResult.data) setSeries(seriesResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate slug from name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Series CRUD
  async function handleAddSeries() {
    if (!seriesForm.name.trim()) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from('series').insert({
      name: seriesForm.name.trim(),
      slug: generateSlug(seriesForm.name),
      description: seriesForm.description.trim() || null,
    })

    if (!error) {
      setSeriesForm({ name: '', description: '' })
      setShowAddForm(false)
      fetchData()
    } else {
      alert('Error adding series: ' + error.message)
    }
    setSaving(false)
  }

  async function handleUpdateSeries(id: string) {
    if (!seriesForm.name.trim()) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('series')
      .update({
        name: seriesForm.name.trim(),
        slug: generateSlug(seriesForm.name),
        description: seriesForm.description.trim() || null,
      })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      setSeriesForm({ name: '', description: '' })
      fetchData()
    } else {
      alert('Error updating series: ' + error.message)
    }
    setSaving(false)
  }

  async function handleDeleteSeries(id: string) {
    if (!confirm('Delete this series? Videos in this series will be unassigned.')) return

    const supabase = createClient()
    const { error } = await supabase.from('series').delete().eq('id', id)

    if (!error) {
      fetchData()
    } else {
      alert('Error deleting series: ' + error.message)
    }
  }

  // Categories CRUD
  async function handleAddCategory() {
    if (!categoryForm.name.trim()) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from('categories').insert({
      name: categoryForm.name.trim(),
      slug: generateSlug(categoryForm.name),
    })

    if (!error) {
      setCategoryForm({ name: '' })
      setShowAddForm(false)
      fetchData()
    } else {
      alert('Error adding category: ' + error.message)
    }
    setSaving(false)
  }

  async function handleUpdateCategory(id: string) {
    if (!categoryForm.name.trim()) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .update({
        name: categoryForm.name.trim(),
        slug: generateSlug(categoryForm.name),
      })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      setCategoryForm({ name: '' })
      fetchData()
    } else {
      alert('Error updating category: ' + error.message)
    }
    setSaving(false)
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Delete this category? Videos will be uncategorized.')) return

    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (!error) {
      fetchData()
    } else {
      alert('Error deleting category: ' + error.message)
    }
  }

  function startEdit(item: Series | Category) {
    setEditingId(item.id)
    setShowAddForm(false)
    if (activeTab === 'series') {
      const s = item as Series
      setSeriesForm({ name: s.name, description: s.description || '' })
    } else {
      setCategoryForm({ name: item.name })
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setSeriesForm({ name: '', description: '' })
    setCategoryForm({ name: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage series, categories, and platform settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => { setActiveTab('series'); cancelEdit(); setShowAddForm(false) }}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'series'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Folder className="w-4 h-4" />
              Series ({series.length})
            </button>
            <button
              onClick={() => { setActiveTab('categories'); cancelEdit(); setShowAddForm(false) }}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'categories'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              Categories ({categories.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Add Button */}
          {!showAddForm && !editingId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'series' ? 'Series' : 'Category'}
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">
                Add New {activeTab === 'series' ? 'Series' : 'Category'}
              </h3>

              {activeTab === 'series' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Series name"
                    value={seriesForm.name}
                    onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={seriesForm.description}
                    onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Category name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={activeTab === 'series' ? handleAddSeries : handleAddCategory}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setSeriesForm({ name: '', description: '' })
                    setCategoryForm({ name: '' })
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Series List */}
          {activeTab === 'series' && (
            <div className="space-y-3">
              {series.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No series created yet</p>
                  <p className="text-sm mt-1">Create series to organize your videos into collections</p>
                </div>
              ) : (
                series.map((s) => (
                  <div key={s.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingId === s.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={seriesForm.name}
                          onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <textarea
                          value={seriesForm.description}
                          onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                          rows={2}
                          placeholder="Description (optional)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateSeries(s.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{s.name}</h4>
                          {s.description && (
                            <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">Slug: {s.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSeries(s.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Categories List */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No categories created yet</p>
                  <p className="text-sm mt-1">Create categories to tag and filter your videos</p>
                </div>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingId === c.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(c.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{c.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">Slug: {c.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
