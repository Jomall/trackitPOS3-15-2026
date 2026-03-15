'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data.vehicles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vehicle?')) return

    setDeleteLoading(id)
    try {
      await fetch('/api/vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setVehicles(vehicles.filter(v => v.id !== id))
    } catch (error) {
      alert('Error deleting vehicle.')
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading fleet...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🚗 Fleet Management</h1>
            <p className="text-xl text-gray-600">Complete vehicle inventory with CRUD operations</p>
          </div>
          <div className="flex gap-4">
            <Link href="/vehicle-rental/fleet/new-vehicle" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform hover:-translate-y-0.5 transition-all">➕ Add Vehicle</Link>
            <Link href="/vehicle-rental" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all">← Back</Link>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500 mb-4">No vehicles in fleet</p>
            <Link href="/vehicle-rental/fleet/new-vehicle" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">➕ Add First Vehicle</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <th className="p-6 text-left font-bold">License Plate</th>
                  <th className="p-6 text-left font-bold">Vehicle Details</th>
                  <th className="p-6 text-left font-bold">Status</th>
                  <th className="p-6 text-left font-bold">Odometer</th>
                  <th className="p-6 text-left font-bold">Next Service</th>
                  <th className="p-6 text-left font-bold">Damages</th>
                  <th className="p-6 text-left font-bold">Actions</th>
                </tr>


              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="p-6 font-mono font-bold text-lg">{vehicle.licensePlate}</td>
                    <td className="p-6">
                      <div>{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                      <div className="text-sm text-gray-500">{vehicle.color} • {vehicle.category} • {vehicle.transmissionType}/{vehicle.fuelType}</div>
                      <div className="text-xs text-gray-400">VIN: {vehicle.vin?.slice(-8)}</div>
                    </td>
    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        (vehicle.status || 'Available') === 'Available' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
                        vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.status || 'Available'}
                      </span>
                    </td>
                    <td className="p-6">{vehicle.currentOdometerReading || 'N/A'} km</td>

                    <td className="p-6">{vehicle.nextServiceDueDate || 'N/A'}</td>
                    <td className="p-6">
                      {(vehicle._count?.damages || 0) > 0 ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                          🚗 {vehicle._count.damages} damage(s)
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          No damages
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => handleDelete(vehicle.id)} 
                        disabled={deleteLoading === vehicle.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-50"
                      >
                        {deleteLoading === vehicle.id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

