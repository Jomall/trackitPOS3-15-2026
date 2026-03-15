'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = parseInt(params.id as string)

  const [client, setClient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    driversLicenseNumber: '',
    driversLicensePhoto: '',
    preferredVehicle: '',
    emergencyContact: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/rental-clients/${clientId}`)
      if (!res.ok) throw new Error('Client not found')
      const data = await res.json()
      setClient(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        driversLicenseNumber: data.driversLicenseNumber || '',
        driversLicensePhoto: data.driversLicensePhoto || '',
        preferredVehicle: data.preferredVehicle || '',
        emergencyContact: data.emergencyContact || ''
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const updateData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      updateData.append(key, value)
    })

    try {
      const res = await fetch(`/api/rental-clients/${clientId}`, {
        method: 'PUT',
        body: updateData
      })

      if (res.ok) {
        router.push(`/vehicle-rental/clients/${clientId}`)
      } else {
        alert('Failed to update client')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href={`/vehicle-rental/clients/${clientId}`}
          className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Client Details
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">✏️ Edit {client?.name}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Driver&apos;s License #</label>
                <input
                  type="text"
                  value={formData.driversLicenseNumber}
                  onChange={(e) => setFormData({...formData, driversLicenseNumber: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setFormData({...formData, driversLicensePhoto: file.name})
                  }}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Vehicle</label>
                <input
                  type="text"
                  value={formData.preferredVehicle}
                  onChange={(e) => setFormData({...formData, preferredVehicle: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Client'}
              </button>
              <Link
                href={`/vehicle-rental/clients/${clientId}`}
                className="flex-1 bg-gray-200 py-4 rounded-xl font-bold text-center hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
