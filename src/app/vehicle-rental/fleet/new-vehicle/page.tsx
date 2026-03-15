'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewVehicle() {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vin: '',
    fleetUnitNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    transmissionType: '',
    fuelType: '',
    category: '',
    currentLocation: 'Main Branch',
    status: 'Available',
    gpsTrackingId: '',
    currentOdometerReading: '',
    nextServiceDueDate: '',
    oilChangeMileage: '',
    tireStatus: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => window.location.href = '/vehicle-rental/fleet', 2000)
      } else {
        alert('Error adding vehicle.')
      }
    } catch (error) {
      console.error(error)
      alert('Error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">➕ Add New Vehicle</h1>
          <p className="text-xl text-gray-600">Register new vehicle to fleet with complete details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Identification */}
          <div className="border-b pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🆔 Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">License Plate *</label>
                <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">VIN *</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fleet Unit Number</label>
                <input type="text" name="fleetUnitNumber" value={formData.fleetUnitNumber} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="border-b pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Vehicle Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Make *</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Ford" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Focus" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" placeholder="Blue" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Transmission</label>
                <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Type</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                  <option value="EV">EV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  <option value="Economy">Economy</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status & Location */}
          <div className="border-b pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Status & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Location</label>
                <input type="text" name="currentLocation" value={formData.currentLocation} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">GPS Tracking ID</label>
                <input type="text" name="gpsTrackingId" value={formData.gpsTrackingId} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className="pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Condition & Maintenance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Odometer (km)</label>
                <input type="number" name="currentOdometerReading" value={formData.currentOdometerReading} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Next Service Due</label>
                <input type="date" name="nextServiceDueDate" value={formData.nextServiceDueDate} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Oil Change Mileage</label>
                <input type="number" name="oilChangeMileage" value={formData.oilChangeMileage} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tire Status</label>
                <select name="tireStatus" value={formData.tireStatus} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center">
              {loading ? 'Adding...' : '➕ Add Vehicle'}
            </button>
            <Link href="/vehicle-rental/fleet" className="px-8 py-4 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all flex items-center justify-center">
              Cancel
            </Link>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl text-center font-bold mt-6">
              Vehicle added successfully!
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

