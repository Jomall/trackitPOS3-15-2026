'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = parseInt(params.id as string)

  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/rental-clients/${clientId}`)
      if (!res.ok) {
        throw new Error('Client not found')
      }
      const data = await res.json()
      setClient(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!client) return <div>Client not found</div>

  const isBlacklisted = client.isBlacklisted
  const blacklistStatus = isBlacklisted ? 'BLACKLISTED' : 'Active'
  const statusColor = isBlacklisted ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{client.name}</h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold {statusColor}">
              {isBlacklisted ? '🚫 BLACKLISTED' : '✅ Active'}
            </div>
          </div>
          <Link 
            href="/vehicle-rental/clients" 
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            ← Back to Clients
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Client Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Client Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <p className="text-lg">{client.phone || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <p className="text-lg">{client.email || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Driver&apos;s License</label>
                <p className="font-mono text-lg">{client.driversLicenseNumber || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Vehicle</label>
                <p className="text-lg font-medium text-indigo-600">{client.preferredVehicle || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Contact</label>
                <p className="text-lg">{client.emergencyContact || '—'}</p>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status & Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Status & Actions</h2>
            <div className="space-y-4">
              {isBlacklisted && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="font-bold text-red-900 mb-2">Blacklist Details</h3>
                  <p className="text-sm text-red-800 mb-2">Reason: {client.blacklistReason}</p>
                  {client.blacklistUntil && (
                    <p className="text-sm text-red-800">Until: {new Date(client.blacklistUntil).toLocaleDateString()}</p>
                  )}
                  <p className="text-xs text-red-700 mt-2">Date: {new Date(client.blacklistDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href={`/vehicle-rental/clients/${client.id}/edit`}
                  className="block p-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-center font-bold hover:from-indigo-600 hover:to-blue-700 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                  ✏️ Edit
                </Link>
                <Link 
                  href={`/vehicle-rental/clients/${client.id}/damages`}
                  className="block p-4 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-xl text-center font-bold hover:from-orange-600 hover:to-yellow-700 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                  💰 Damages & Payments
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Recent Activity</h2>
          <p className="text-gray-500">Rentals, damages, payments coming soon...</p>
        </div>
      </div>
    </main>
  )
}
