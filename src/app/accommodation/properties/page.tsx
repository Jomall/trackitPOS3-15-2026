'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    propertyId: '',
    rentAmount: '',
    occupancyLimit: '',
    status: 'AVAILABLE'
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 20

  const searchTerm = searchParams.get('search') || ''

  const fetchProperties = useCallback(async (pageNum = currentPage, search = searchTerm) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pageNum.toString(), limit: limit.toString() })
    if (search) params.set('search', search)
    
    const res = await fetch(`/api/properties?${params}`)
    const data = await res.json()
    setProperties(data.properties || [])
    setTotalCount(data.totalCount || 0)
    setCurrentPage(parseInt(data.page) || 1)
    setLoading(false)
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleSearch = (e) => {
    e.preventDefault()
    const newSearch = e.target.search.value
    router.push(`/accommodation/properties?search=${encodeURIComponent(newSearch)}&page=1`)
  }

  const handleEdit = (property) => {
    setEditForm({
      name: property.name,
      propertyId: property.propertyId,
      rentAmount: property.rentAmount,
      occupancyLimit: property.occupancyLimit,
      status: property.status
    })
    setSelectedProperty(property)
    setShowEditModal(true)
  }

  const handleDeleteConfirm = (property) => {
    setDeleteConfirm(property)
  }

  const handleDelete = async () => {
    if (deleteConfirm) {
      await fetch(`/api/properties/${deleteConfirm.id}`, { method: 'DELETE' })
      fetchProperties()
      setDeleteConfirm(null)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (selectedProperty) {
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('propertyId', editForm.propertyId)
      formData.append('rentAmount', editForm.rentAmount)
      formData.append('occupancyLimit', editForm.occupancyLimit)
      formData.append('status', editForm.status)

      await fetch(`/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        body: formData
      })
      fetchProperties()
      setShowEditModal(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  if (loading) return <div className="min-h-screen flex items-center justify-center p-8">Loading properties...</div>

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">🏢 Properties Management</h1>
              <p className="text-xl text-gray-600">Complete CRUD for properties with search and cascade delete</p>
            </div>
            <Link href="/accommodation" className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600">
              ← Back to Accommodation
            </Link>
          </div>

  {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                name="search"
                defaultValue={searchTerm}
                placeholder="Search properties by name, ID or address..."
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
              <button type="submit" className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Search
              </button>
            </form>
            {searchTerm && (
              <button 
                onClick={() => router.push('/accommodation/properties')}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalCount}</div>
              <div className="text-gray-600">Total Properties</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-emerald-600">{properties.length}</div>
              <div className="text-gray-600">Page Results</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{properties.filter(p => p.status === 'AVAILABLE').length}</div>
              <div className="text-gray-600">Available (page)</div>
            </div>
          </div>

          {/* Properties Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Properties ({totalCount})
              </h2>
              <Link href="/accommodation/new-property" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600">
                ➕ New Property
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Rent</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Occupancy</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">
                        {property.propertyId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{property.name}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold">
                        ${property.rentAmount}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          property.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.occupancyLimit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(property)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(property)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProperties.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No properties match "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">✏️ Edit Property</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Property ID"
                value={editForm.propertyId}
                onChange={(e) => setEditForm({...editForm, propertyId: e.target.value})}
                className="w-full p-3 border rounded-xl mb-4"
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-3 border rounded-xl mb-4"
                required
              />
              <input
                type="number"
                placeholder="Rent Amount"
                value={editForm.rentAmount}
                onChange={(e) => setEditForm({...editForm, rentAmount: e.target.value})}
                className="w-full p-3 border rounded-xl mb-4"
                required
              />
              <input
                type="number"
                placeholder="Occupancy Limit"
                value={editForm.occupancyLimit}
                onChange={(e) => setEditForm({...editForm, occupancyLimit: e.target.value})}
                className="w-full p-3 border rounded-xl mb-4"
                required
              />
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                className="w-full p-3 border rounded-xl mb-6"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold">
                  Update Property
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-300 py-3 rounded-xl font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h2 className="text-2xl font-bold mb-2">Delete Property?</h2>
            <p className="text-gray-600 mb-8">This will permanently delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.propertyId}) and all related agreements/payments.</p>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-300 py-3 rounded-xl font-bold hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
