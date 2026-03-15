'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AccommodationPage() {
  const [properties, setProperties] = useState([])
  const [tenantsCount, setTenantsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/properties'),
      fetch('/api/tenants')
    ]).then(async ([propRes, tenantRes]) => {
      const propData = await propRes.json()
      const tenantData = await tenantRes.json()
      setProperties(propData.properties || [])
      setTenantsCount(tenantData.totalCount || 0)
      setLoading(false)
    })
  }, [])

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeAgreements = properties.reduce((sum, p) => sum + (p.agreements?.length || 0), 0)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🏠 Accommodation Rental Management
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Complete rental agreement management system for properties, tenants, and payments
            </p>
          </div>
          <Link 
            href="/" 
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center"
          >
            <span className="mr-2">🏠</span>
            Back to Home
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
          <input
            type="text"
            placeholder="Search properties and tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Overview</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl text-white">
                <div className="text-3xl font-bold">{properties.length}</div>
                <div className="text-sm opacity-90">Properties</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                <div className="text-3xl font-bold">{activeAgreements}</div>
                <div className="text-sm opacity-90">Active Agreements</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/accommodation/new-property" className="p-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center">
                ➕ New Property
              </Link>
              <Link href="/accommodation/properties" className="p-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center">
                🏢 Manage Properties
              </Link>
              <Link href="/accommodation/tenants" className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center">
                👥 Manage Tenants
              </Link>
              <Link href="/accommodation/new-agreement" className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center">
                📝 New Agreement
              </Link>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">🏢 Properties ({filteredProperties.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agreements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-indigo-600">
                      {property.propertyId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        property.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        property.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${property.rentAmount.toFixed(2)}/mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.occupancyLimit} max
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(property.agreements || []).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
