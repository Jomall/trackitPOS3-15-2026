'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function TenantsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [tenants, setTenants] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [showUnblacklistModal, setShowUnblacklistModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [reason, setReason] = useState('')
  const [blacklistUntil, setBlacklistUntil] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    emergencyContact: ''
  })

  const search = searchParams.get('search') || ''
  const limit = 20

  const fetchTenants = useCallback(async (pageNum = page, searchTerm = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pageNum.toString(), limit: limit.toString() })
    if (searchTerm) params.set('search', searchTerm)
    
    const res = await fetch(`/api/tenants?${params}`)
    const data = await res.json()
    
    setTenants(data.tenants || [])
    setTotalCount(data.totalCount || 0)
    setPage(parseInt(data.page) || 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleSearch = (e) => {
    e.preventDefault()
    const newSearch = e.target.search.value
    router.push(`/accommodation/tenants?search=${encodeURIComponent(newSearch)}&page=1`)
  }

  const handleEdit = (tenant) => {
    setEditForm({
      name: tenant.name,
      phone: tenant.phone || '',
      email: tenant.email || '',
      idNumber: tenant.idNumber || '',
      emergencyContact: tenant.emergencyContact || ''
    })
    setSelectedTenant(tenant)
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTenant) return
    
    const formData = new FormData()
    formData.append('name', editForm.name)
    formData.append('phone', editForm.phone)
    formData.append('email', editForm.email)
    formData.append('idNumber', editForm.idNumber)
    formData.append('emergencyContact', editForm.emergencyContact)

    const res = await fetch(`/api/tenants/${selectedTenant.id}`, {
      method: 'PUT',
      body: formData
    })

    if (res.ok) {
      fetchTenants()
      setShowEditModal(false)
    }
  }

  const handleDeleteConfirm = (tenant) => {
    setShowDeleteConfirm(tenant)
  }

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await fetch(`/api/tenants/${showDeleteConfirm.id}`, { method: 'DELETE' })
      fetchTenants()
      setShowDeleteConfirm(null)
    }
  }

  // Blacklist handlers (unchanged)
  const handleBlacklist = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('tenantId', selectedTenant.id.toString())
    formData.append('reason', reason)
    if (blacklistUntil) formData.append('blacklistUntil', blacklistUntil)

    const res = await fetch('/api/tenants/blacklist', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      fetchTenants()
      alert('Tenant blacklisted')
      closeModals()
    } else {
      alert('Error')
    }
  }

  const handleUnblacklist = async () => {
    const formData = new FormData()
    formData.append('tenantId', selectedTenant.id.toString())

    const res = await fetch('/api/tenants/unblacklist', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      fetchTenants()
      alert('Tenant unblacklisted')
      closeModals()
    } else {
      alert('Error')
    }
  }

  const openBlacklistModal = (tenant) => {
    setSelectedTenant(tenant)
    setReason('')
    setBlacklistUntil('')
    setShowBlacklistModal(true)
  }

  const openUnblacklistModal = (tenant) => {
    setSelectedTenant(tenant)
    setShowUnblacklistModal(true)
  }

  const closeModals = () => {
    setShowBlacklistModal(false)
    setShowUnblacklistModal(false)
    setShowEditModal(false)
    setShowDeleteConfirm(null)
    setSelectedTenant(null)
    setReason('')
    setBlacklistUntil('')
    setEditForm({ name: '', phone: '', email: '', idNumber: '', emergencyContact: '' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const totalPages = Math.ceil(totalCount / limit)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-8">Loading tenants...</div>
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">👥 Tenant Management</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete tenant database with full CRUD, search, pagination and blacklist management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Overview</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
                  <div className="text-3xl font-bold">{totalCount}</div>
                  <div className="text-sm opacity-90">Total Tenants</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                  <div className="text-3xl font-bold">{tenants.reduce((acc, t) => acc + (t.agreements?.length || 0), 0)}</div>
                  <div className="text-sm opacity-90">Active Agreements</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/accommodation/new-tenant" className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  ➕ New Tenant
                </Link>
                <Link href="/accommodation" className="p-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  🏠 Properties
                </Link>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                name="search"
                defaultValue={search}
                placeholder="Search tenants by name, phone, email, ID..."
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Search
              </button>
            </form>
            {search && (
              <button 
                onClick={() => router.push('/accommodation/tenants')}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                📋 All Tenants ({totalCount})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agreements</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className={`hover:bg-gray-50 ${tenant.isBlacklisted ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${tenant.isBlacklisted ? 'text-red-900' : 'text-gray-900'}`}>
                          {tenant.name}
                          {tenant.isBlacklisted && (
                            <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                              🚫 BLACKLISTED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                        {tenant.idNumber || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {tenant.agreements?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-lg font-bold text-green-600">
                        {formatCurrency(tenant.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tenant.blacklistReason ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                            Blacklisted
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/accommodation/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          👁️
                        </Link>
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(tenant)}
                          className="text-red-600 hover:text-red-900 mr-3 font-medium"
                        >
                          🗑️ Delete
                        </button>
                        {tenant.isBlacklisted ? (
                          <button
                            onClick={() => openUnblacklistModal(tenant)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-bold transition-colors"
                          >
                            Unlist
                          </button>
                        ) : (
                          <button
                            onClick={() => openBlacklistModal(tenant)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-bold transition-colors"
                          >
                            Blacklist
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-2xl mb-4">👥</div>
                        {search ? (
                          <>
                            <div className="text-lg font-medium mb-2">No tenants match "{search}"</div>
                            <button onClick={() => router.push('/accommodation/tenants')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                              Clear search
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-medium mb-2">No tenants yet</div>
                            <Link href="/accommodation/new-tenant" className="text-indigo-600 hover:text-indigo-700 font-medium">
                              Create your first tenant →
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">✏️ Edit {selectedTenant.name}</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Name *"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="ID Number"
                value={editForm.idNumber}
                onChange={(e) => setEditForm({...editForm, idNumber: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Emergency Contact"
                value={editForm.emergencyContact}
                onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Update Tenant
                </button>
                <button type="button" onClick={closeModals} className="flex-1 bg-gray-200 py-4 rounded-xl font-bold hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h2 className="text-2xl font-bold mb-2">Delete {showDeleteConfirm.name}?</h2>
            <p className="text-gray-600 mb-8">This will delete tenant and all related agreements/payments (cascade).</p>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600">
                Delete
              </button>
              <button onClick={closeModals} className="flex-1 bg-gray-200 py-4 rounded-xl font-bold hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist/Unblacklist Modals (unchanged) */}
      {showBlacklistModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚫 Blacklist {selectedTenant.name}</h2>
            <form onSubmit={handleBlacklist}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (required)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Property damage, late payments..."
                className="w-full p-4 border border-gray-300 rounded-xl mb-6 min-h-[100px] focus:ring-2 focus:ring-red-500"
                required
              />
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (optional)</label>
              <input
                type="date"
                value={blacklistUntil}
                onChange={(e) => setBlacklistUntil(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl mb-8 focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold">
                  Blacklist
                </button>
                <button type="button" onClick={closeModals} className="flex-1 bg-gray-200 py-4 rounded-xl font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUnblacklistModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Unblacklist {selectedTenant.name}</h2>
            <p className="text-lg text-gray-600 mb-8">Remove from blacklist?</p>
            <div className="flex gap-4">
              <button onClick={handleUnblacklist} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold">
                Unblacklist
              </button>
              <button onClick={closeModals} className="flex-1 bg-gray-200 py-4 rounded-xl font-bold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

