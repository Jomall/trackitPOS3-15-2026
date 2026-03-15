'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [householdItems, setHouseholdItems] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const id = parseInt(params.id)

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data.property)
        setHouseholdItems(data.property.householdItems || [])
        setLoading(false)
      })
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!property) return <div>Property not found</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <Link href="/accommodation/properties" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-bold text-lg">
        ← Back to Properties
      </Link>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.name}</h1>
            <p className="text-xl text-gray-600">{property.propertyId} • {property.address}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Info</h2>
              <div className="space-y-4 text-lg">
                <div><strong>Property ID:</strong> {property.propertyId}</div>
                <div><strong>Rent:</strong> ${property.rentAmount}/mo</div>
                <div><strong>Occupancy:</strong> {property.occupancyLimit} max</div>
                <div><strong>Status:</strong> <span className={`px-3 py-1 rounded-full font-bold ${property.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{property.status}</span></div>
                <div><strong>Furnishing:</strong> {property.furnishingType || 'Unfurnished'}</div>
                <div><strong>Amenities:</strong> {property.amenities || 'None'}</div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
              <div className="space-y-4">
                <button onClick={() => setShowEditModal(true)} className="block w-full p-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 text-center font-bold">
                  ✏️ Edit Property
                </button>
                <Link href={`/accommodation/tenants/${property.id}`} className="block w-full p-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-center font-bold">
                  👥 View Tenants & Agreements
                </Link>
              </div>
            </div>
          </div>
        </div>

        {householdItems.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 Household Items Inventory ({householdItems.length} items)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {householdItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{item.description}</td>
                      <td className="px-6 py-4 font-mono font-bold">{item.quantity}</td>
                      <td className="px-6 py-4">{item.conditionNote || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Edit Property</h2>
            <form>
              {/* Add edit form fields */}
              <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold mt-4">
                Update
              </button>
              <button type="button" onClick={() => setShowEditModal(false)} className="w-full bg-gray-300 py-3 rounded-xl font-bold mt-2">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
