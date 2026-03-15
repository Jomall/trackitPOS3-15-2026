'use client'

import { useState } from 'react'

interface Vehicle {
  id: number
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  color: string
  category: string
  transmissionType: string
  fuelType: string
  currentOdometerReading: number
  nextServiceDueDate: string
  status: string
  notes: string
}

interface EditVehicleModalProps {
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function EditVehicleModal({ vehicle, isOpen, onClose, onUpdate }: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year.toString(),
    vin: vehicle.vin,
    licensePlate: vehicle.licensePlate,
    color: vehicle.color || '',
    category: vehicle.category || '',
    transmissionType: vehicle.transmissionType || '',
    fuelType: vehicle.fuelType || '',
    currentOdometerReading: vehicle.currentOdometerReading?.toString() || '',
    nextServiceDueDate: vehicle.nextServiceDueDate || '',
    status: vehicle.status || 'Available',
    notes: vehicle.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        onUpdate()
        onClose()
      } else {
        alert('Error updating vehicle')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Vehicle - {vehicle.licensePlate}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Make *</label>
              <input name="make" value={formData.make} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Model *</label>
              <input name="model" value={formData.model} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Year *</label>
              <input name="year" type="number" value={formData.year} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">License Plate *</label>
              <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
              <input name="color" value={formData.color} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <input name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transmission</label>
              <input name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Type</label>
              <input name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Odometer (km)</label>
              <input name="currentOdometerReading" type="number" value={formData.currentOdometerReading} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Next Service</label>
            <input name="nextServiceDueDate" type="date" value={formData.nextServiceDueDate} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">VIN</label>
            <input name="vin" value={formData.vin} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Vehicle'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-4 rounded-xl font-bold hover:bg-gray-400 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
