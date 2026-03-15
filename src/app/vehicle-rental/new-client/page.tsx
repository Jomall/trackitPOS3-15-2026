'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewRentalClient() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    driversLicenseNumber: '',
    driversLicenseState: '',
    driversLicenseExpiry: '',
    passportNumber: '',
    corporateAccountId: '',
    blacklistStatus: 'clear',
    emergencyContact: '',
    driversLicensePhoto: null as File | null,
    preferredVehicle: '',
    rentalDates: '',
    notes: ''
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data.vehicles || []))
      .catch(console.error)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, driversLicensePhoto: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        submitData.append(key, value as string)
      }
    })
    if (formData.driversLicensePhoto) {
      submitData.append('driversLicensePhoto', formData.driversLicensePhoto)
    }

    try {
      const response = await fetch('/api/create-rental-client', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/vehicle-rental'), 2000)
      } else {
        alert('Error creating rental client.')
      }
    } catch (error) {
      console.error(error)
      alert('Error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">👤 Record New Rental Client</h1>
          <p className="text-xl text-gray-600">Complete customer, verification, and rental details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Personal Information */}
          <section className="border-b pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📋</span> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact *</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Name & Phone" />
              </div>
            </div>
          </section>

          {/* Verification */}
          <section className="border-b pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🔐</span> Driver Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Driver&apos;s License Number *</label>
                <input type="text" name="driversLicenseNumber" value={formData.driversLicenseNumber} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issuing State/Country</label>
                <input type="text" name="driversLicenseState" value={formData.driversLicenseState} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">License Expiry Date *</label>
                <input type="date" name="driversLicenseExpiry" value={formData.driversLicenseExpiry} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Passport Number (optional)</label>
                <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Driver&apos;s License Photo Upload *</label>
              <input type="file" name="driversLicensePhoto" onChange={handlePhotoChange} accept="image/*,.pdf" required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              {photoPreview && (
                <div className="mt-4 p-4 bg-gray-100 rounded-xl">
                  <img src={photoPreview} alt="Preview" className="max-w-xs max-h-48 rounded-lg shadow-md" />
                </div>
              )}
            </div>
          </section>

          {/* Risk & Rental */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🚘</span> Risk & Rental Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Corporate Account ID</label>
                <input type="text" name="corporateAccountId" value={formData.corporateAccountId} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Blacklist Status</label>
                <select name="blacklistStatus" value={formData.blacklistStatus} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="clear">Clear</option>
                  <option value="blacklisted">Blacklisted</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Vehicle *</label>
                <select name="preferredVehicle" value={formData.preferredVehicle} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">Select vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.licensePlate}>
                      {vehicle.licensePlate} ({vehicle.make} {vehicle.model} {vehicle.year}) - {vehicle.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rental Period</label>
                <input type="text" name="rentalDates" value={formData.rentalDates} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="2026-01-15 to 2026-01-30" />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Additional requirements..." />
            </div>
          </section>

          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Saving...' : '💾 Record Client'}
            </button>
            <Link href="/vehicle-rental" className="px-8 py-4 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center justify-center">
              Cancel
            </Link>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl text-center font-bold mt-6">
              Client recorded successfully! Redirecting...
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

