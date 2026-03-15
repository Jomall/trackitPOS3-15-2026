'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BlacklistModal from './BlacklistModal'
import UnblacklistModal from './UnblacklistModal'

export default function RentalClientsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [clients, setClients] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [showUnblacklistModal, setShowUnblacklistModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [reason, setReason] = useState('')
  const [blacklistUntil, setBlacklistUntil] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    driversLicenseNumber: '',
    emergencyContact: '',
    preferredVehicle: ''
  })

  const search = searchParams.get('search') || ''
  const limit = 20

  const fetchClients = useCallback(async (pageNum = page, searchTerm = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pageNum.toString(), limit: limit.toString() })
    if (searchTerm) params.set('search', searchTerm)
    
    const res = await fetch(`/api/rental-clients?${params}`)
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    
    setClients(data.clients || [])
    setTotalCount(data.totalCount || 0)
    setPage(parseInt(data.page) || 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleSearch = (e) => {
    e.preventDefault()
    const newSearch = e.target.search.value
    router.push(`/vehicle-rental/clients?search=${encodeURIComponent(newSearch)}&page=1`)
  }

  const handleEdit = (client) => {
    setEditForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      driversLicenseNumber: client.driversLicenseNumber || '',
      emergencyContact: client.emergencyContact || '',
      preferredVehicle: client.preferredVehicle || ''
    })
    setSelectedClient(client)
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClient) return
    
    const formData = new FormData()
    formData.append('name', editForm.name)
    formData.append('phone', editForm.phone)
    formData.append('email', editForm.email)
    formData.append('driversLicenseNumber', editForm.driversLicenseNumber)
    formData.append('emergencyContact', editForm.emergencyContact)
    formData.append('preferredVehicle', editForm.preferredVehicle)

    const res = await fetch(`/api/rental-clients/${selectedClient.id}`, {
      method: 'PUT',
      body: formData
    })

    if (res.ok) {
      fetchClients()
      closeModals()
    }
  }

  const handleDeleteConfirm = (client) => {
    setShowDeleteConfirm(client)
  }

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await fetch(`/api/rental-clients/${showDeleteConfirm.id}`, { method: 'DELETE' })
      fetchClients()
      setShowDeleteConfirm(null)
    }
  }

  const openBlacklistModal = (client) => {
    setSelectedClient(client)
    setReason('')
    setBlacklistUntil('')
    setShowBlacklistModal(true)
  }

  const openUnblacklistModal = (client) => {
    setSelectedClient(client)
    setShowUnblacklistModal(true)
  }

  const closeModals = () => {
    setShowBlacklistModal(false)
    setShowUnblacklistModal(false)
    setShowEditModal(false)
    setShowDeleteConfirm(null)
    setSelectedClient(null)
    setReason('')
    setBlacklistUntil('')
    setEditForm({ name: '', phone: '', email: '', driversLicenseNumber: '', emergencyContact: '', preferredVehicle: '' })
  }

  const totalPages = Math.ceil(totalCount / limit)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-8">Loading clients...</div>
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/vehicle-rental" 
            className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-bold text-lg"
          >
            ← Back to Vehicle Rental
          </Link>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🚗 Rental Clients Management</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete rental clients database with full CRUD, search, pagination and blacklist management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Overview</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl text-white">
                  <div className="text-3xl font-bold">{totalCount}</div>
                  <div className="text-sm opacity-90">Total Clients</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                  <div className="text-3xl font-bold">{clients.filter(c => c.isBlacklisted).length}</div>
                  <div className="text-sm opacity-90">Blacklisted</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/vehicle-rental/new-client" className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  ➕ New Client
                </Link>
                <Link href="/vehicle-rental" className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  🚗 Fleet
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
                placeholder="Search clients by name, phone, email, license..."
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                🔍 Search
              </button>
            </form>
            {search && (
              <button 
                onClick={() => router.push('/vehicle-rental/clients')}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                📋 All Clients ({totalCount})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">License</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Damages/Payments</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className={`hover:bg-gray-50 ${client.isBlacklisted ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${client.isBlacklisted ? 'text-red-900' : 'text-gray-900'}`}>
                          {client.name}
                          {client.isBlacklisted && (
                            <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                              🚫 BLACKLISTED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                        {client.driversLicenseNumber || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {client.preferredVehicle || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(client._count.damages + client._count.payments > 0) ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                            💰 {client._count.damages}D {client._count.payments}P
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.isBlacklisted ? (
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
                        <Link href={`/vehicle-rental/clients/${client.id}`} className="text-blue-600 hover:text-blue-900 mr-3 font-medium">
                          👁️ View
                        </Link>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(client)}
                          className="text-red-600 hover:text-red-900 mr-3 font-medium"
                        >
                          🗑️ Delete
                        </button>
                        {client.isBlacklisted ? (
                          <button
                            onClick={() => openUnblacklistModal(client)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-bold transition-colors"
                          >
                            Unlist
                          </button>
                        ) : (
                          <button
                            onClick={() => openBlacklistModal(client)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-bold transition-colors"
                          >
                            Blacklist
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-2xl mb-4">👥</div>
                        {search ? (
                          <>
                            <div className="text-lg font-medium mb-2">No clients match "{search}"</div>
                            <button onClick={() => router.push('/vehicle-rental/clients')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                              Clear search
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-medium mb-2">No clients yet</div>
                            <Link href="/vehicle-rental/new-client" className="text-indigo-600 hover:text-indigo-700 font-medium">
                              Create your first client →
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
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">✏️ Edit {selectedClient.name}</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Name *"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Drivers License Number"
                value={editForm.driversLicenseNumber}
                onChange={(e) => setEditForm({...editForm, driversLicenseNumber: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Preferred Vehicle"
                value={editForm.preferredVehicle}
                onChange={(e) => setEditForm({...editForm, preferredVehicle: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Emergency Contact"
                value={editForm.emergencyContact}
                onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Update Client
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
            <p className="text-gray-600 mb-8">This action cannot be undone.</p>
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

      {/* Modals */}
      {showBlacklistModal && selectedClient && (
        <BlacklistModal client={selectedClient} onClose={() => {
          closeModals()
          fetchClients()
        }} />
      )}
      {showUnblacklistModal && selectedClient && (
        <UnblacklistModal client={selectedClient} onClose={() => {
          closeModals()
          fetchClients()
        }} />
      )}
    </>
  )
}
