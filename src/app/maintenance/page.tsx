'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Types
interface Vehicle {
  id: number
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

interface Maintenance {
  id: number
  vehicleId: number
  type: string
  description?: string | null
  date: string
  nextDue?: string | null
  cost?: number | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
  vehicle?: Vehicle
}

interface SearchFilters {
  search: string
  vehicleId: string
  type: string
  startDate: string
  endDate: string
  minCost: string
  maxCost: string
}

interface Stats {
  totalVehicles: number
  totalMaintenance: number
  totalCost: number
  upcomingCount: number
  overdueCount: number
}

type TabType = 'vehicles' | 'add-maintenance' | 'schedule' | 'history' | 'search' | 'stats'

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('vehicles')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalMaintenance: 0,
    totalCost: 0,
    upcomingCount: 0,
    overdueCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    notes: ''
  })
  
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  
  const [newMaintenance, setNewMaintenance] = useState({
    vehicleId: '',
    type: '',
    description: '',
    date: '',
    nextDue: '',
    cost: '',
    notes: ''
  })
  
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null)
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    vehicleId: '',
    type: '',
    startDate: '',
    endDate: '',
    minCost: '',
    maxCost: ''
  })
  
  const [searchResults, setSearchResults] = useState<Maintenance[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'vehicle' | 'maintenance', id: number} | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [vehiclesRes, maintenancesRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/maintenance')
      ])
      
      const vehiclesData = await vehiclesRes.json()
      const maintenancesData = await maintenancesRes.json()
      
      if (Array.isArray(vehiclesData)) {
        setVehicles(vehiclesData)
      }
      
      if (Array.isArray(maintenancesData)) {
        setMaintenances(maintenancesData)
        calculateStats(vehiclesData, maintenancesData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (vehiclesData: Vehicle[], maintenancesData: Maintenance[]) => {
    const now = new Date()
    const upcoming = maintenancesData.filter(m => m.nextDue && new Date(m.nextDue) > now)
    const overdue = maintenancesData.filter(m => m.nextDue && new Date(m.nextDue) < now)
    const totalCost = maintenancesData.reduce((sum, m) => sum + (m.cost || 0), 0)
    
    setStats({
      totalVehicles: vehiclesData.length,
      totalMaintenance: maintenancesData.length,
      totalCost,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      })
      
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to create vehicle')
        return
      }
      
      const vehicle = await res.json()
      setVehicles([vehicle, ...vehicles])
      setNewVehicle({ make: '', model: '', year: '', vin: '', licensePlate: '', notes: '' })
      setActiveTab('vehicles')
      alert('Vehicle added successfully!')
    } catch (err) {
      console.error('Error creating vehicle:', err)
      alert('Failed to create vehicle')
    }
  }

  const handleVehicleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return
    
    try {
      const res = await fetch('/api/vehicles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVehicle)
      })
      
      if (!res.ok) {
        alert('Failed to update vehicle')
        return
      }
      
      const updated = await res.json()
      setVehicles(vehicles.map(v => v.id === updated.id ? updated : v))
      setEditingVehicle(null)
      alert('Vehicle updated successfully!')
    } catch (err) {
      console.error('Error updating vehicle:', err)
      alert('Failed to update vehicle')
    }
  }

  const handleDeleteVehicle = async (id: number) => {
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        alert('Failed to delete vehicle')
        return
      }
      
      setVehicles(vehicles.filter(v => v.id !== id))
      setMaintenances(maintenances.filter(m => m.vehicleId !== id))
      setDeleteConfirm(null)
      alert('Vehicle deleted successfully!')
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      alert('Failed to delete vehicle')
    }
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaintenance)
      })
      
      if (!res.ok) {
        alert('Failed to create maintenance record')
        return
      }
      
      const maintenance = await res.json()
      setMaintenances([maintenance, ...maintenances])
      setNewMaintenance({ vehicleId: '', type: '', description: '', date: '', nextDue: '', cost: '', notes: '' })
      setActiveTab('history')
      alert('Maintenance record added successfully!')
    } catch (err) {
      console.error('Error creating maintenance:', err)
      alert('Failed to create maintenance record')
    }
  }

  const handleMaintenanceUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaintenance) return
    
    try {
      const res = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMaintenance)
      })
      
      if (!res.ok) {
        alert('Failed to update maintenance record')
        return
      }
      
      const updated = await res.json()
      setMaintenances(maintenances.map(m => m.id === updated.id ? updated : m))
      setEditingMaintenance(null)
      alert('Maintenance record updated successfully!')
    } catch (err) {
      console.error('Error updating maintenance:', err)
      alert('Failed to update maintenance record')
    }
  }

  const handleDeleteMaintenance = async (id: number) => {
    try {
      const res = await fetch(`/api/maintenance?id=${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        alert('Failed to delete maintenance record')
        return
      }
      
      setMaintenances(maintenances.filter(m => m.id !== id))
      setDeleteConfirm(null)
      alert('Maintenance record deleted successfully!')
    } catch (err) {
      console.error('Error deleting maintenance:', err)
      alert('Failed to delete maintenance record')
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId)
      if (filters.type) params.append('type', filters.type)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.minCost) params.append('minCost', filters.minCost)
      if (filters.maxCost) params.append('maxCost', filters.maxCost)
      
      const res = await fetch(`/api/maintenance?${params.toString()}`)
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setSearchResults(data)
      }
    } catch (err) {
      console.error('Error searching:', err)
      alert('Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (sectionId: string) => {
    const printContent = document.getElementById(sectionId)
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Vehicle Maintenance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Vehicle Maintenance Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const upcomingMaintenances = maintenances
    .filter(m => m.nextDue && new Date(m.nextDue) > new Date())
    .sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime())

  const overdueMaintenances = maintenances
    .filter(m => m.nextDue && new Date(m.nextDue) < new Date())

  const vehicleMaintenances = selectedVehicleId 
    ? maintenances.filter(m => m.vehicleId === selectedVehicleId)
    : maintenances

  const tabs = [
    { id: 'vehicles' as TabType, label: 'Vehicles', icon: '🚗' },
    { id: 'add-maintenance' as TabType, label: 'Add Maintenance', icon: '🔧' },
    { id: 'schedule' as TabType, label: 'Schedule', icon: '📅' },
    { id: 'history' as TabType, label: 'History', icon: '📋' },
    { id: 'search' as TabType, label: 'Search', icon: '🔍' },
    { id: 'stats' as TabType, label: 'Statistics', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="inline-block mb-4 text-white/80 hover:text-white">
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold">Vehicle Maintenance Schedules</h1>
              <p className="text-white/80 mt-1">Manage vehicles and track maintenance records</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">
                {stats.totalVehicles} Vehicles | {stats.totalMaintenance} Records
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
              <form onSubmit={handleVehicleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                  <input
                    type="text"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN *</label>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newVehicle.notes}
                    onChange={(e) => setNewVehicle({...newVehicle, notes: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="lg:col-span-3">
                  <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Registered Vehicles</h2>
                <button onClick={() => handlePrint('vehicle-list')} className="text-purple-600 hover:text-purple-800">
                  🖨️ Print List
                </button>
              </div>
              
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : vehicles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No vehicles registered yet</p>
              ) : (
                <div id="vehicle-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                          <p className="text-sm text-gray-600">Plate: {vehicle.licensePlate}</p>
                          {vehicle.notes && <p className="text-sm text-gray-500 mt-1">📝 {vehicle.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingVehicle(vehicle)} className="text-blue-600 hover:text-blue-800" title="Edit">✏️</button>
                          <button onClick={() => setDeleteConfirm({type: 'vehicle', id: vehicle.id})} className="text-red-600 hover:text-red-800" title="Delete">🗑️</button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={() => { setSelectedVehicleId(vehicle.id); setActiveTab('history'); }}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          View Maintenance ({maintenances.filter(m => m.vehicleId === vehicle.id).length})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editingVehicle && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>
                  <form onSubmit={handleVehicleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                        <input type="text" value={editingVehicle.make} onChange={(e) => setEditingVehicle({...editingVehicle, make: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                        <input type="text" value={editingVehicle.model} onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                        <input type="number" value={editingVehicle.year} onChange={(e) => setEditingVehicle({...editingVehicle, year: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VIN *</label>
                        <input type="text" value={editingVehicle.vin} onChange={(e) => setEditingVehicle({...editingVehicle, vin: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                        <input type="text" value={editingVehicle.licensePlate} onChange={(e) => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input type="text" value={editingVehicle.notes || ''} onChange={(e) => setEditingVehicle({...editingVehicle, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <button type="button" onClick={() => setEditingVehicle(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-maintenance' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Maintenance Record</h2>
            <form onSubmit={handleMaintenanceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                <select value={newMaintenance.vehicleId} onChange={(e) => setNewMaintenance({...newMaintenance, vehicleId: e.target.value})} className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (<option key={v.id} value={v.id}>{v.year} {v.make} {v.model} - {v.licensePlate}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                <input type="text" value={newMaintenance.type} onChange={(e) => setNewMaintenance({...newMaintenance, type: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Oil Change" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={newMaintenance.description} onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={newMaintenance.date} onChange={(e) => setNewMaintenance({...newMaintenance, date: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                <input type="date" value={newMaintenance.nextDue} onChange={(e) => setNewMaintenance({...newMaintenance, nextDue: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                <input type="number" step="0.01" value={newMaintenance.cost} onChange={(e) => setNewMaintenance({...newMaintenance, cost: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={newMaintenance.notes} onChange={(e) => setNewMaintenance({...newMaintenance, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Add Maintenance Record</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Upcoming Maintenance Schedule</h2>
              <button onClick={() => handlePrint('schedule-list')} className="text-purple-600 hover:text-purple-800">🖨️ Print Schedule</button>
            </div>
            
            {overdueMaintenances.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-700 mb-3">⚠️ Overdue Maintenance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overdueMaintenances.map(m => {
                    const vehicle = vehicles.find(v => v.id === m.vehicleId)
                    const daysOverdue = Math.ceil((new Date().getTime() - new Date(m.nextDue!).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={m.id} className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{m.type}</h4>
                            <p className="text-sm text-gray-600">{vehicle?.year} {vehicle?.make} {vehicle?.model}</p>
                            <p className="text-sm text-red-600 font-medium">Overdue by {daysOverdue} days</p>
                            {m.cost && <p className="text-sm">Est. Cost: ${m.cost.toFixed(2)}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingMaintenance(m)} className="text-blue-600">✏️</button>
                            <button onClick={() => setDeleteConfirm({type: 'maintenance', id: m.id})} className="text-red-600">🗑️</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div id="schedule-list" className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : upcomingMaintenances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming maintenance scheduled</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMaintenances.map(m => {
                    const vehicle = vehicles.find(v => v.id === m.vehicleId)
                    const daysUntilDue = Math.ceil((new Date(m.nextDue!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={m.id} className={`rounded-lg p-4 shadow border-l-4 ${daysUntilDue <= 7 ? 'border-red-500 bg-red-50' : daysUntilDue <= 30 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{m.type}</h4>
                            <p className="text-sm text-gray-600">{vehicle?.year} {vehicle?.make} {vehicle?.model}</p>
                            <p className={`text-sm font-medium ${daysUntilDue <= 7 ? 'text-red-600' : daysUntilDue <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                              Due: {new Date(m.nextDue!).toLocaleDateString()} ({daysUntilDue} days)
                            </p>
                            {m.cost && <p className="text-sm">Est. Cost: ${m.cost.toFixed(2)}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingMaintenance(m)} className="text-blue-600 hover:text-blue-800">✏️</button>
                            <button onClick={() => setDeleteConfirm({type: 'maintenance', id: m.id})} className="text-red-600 hover:text-red-800">🗑️</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Maintenance History</h2>
              <div className="flex gap-4">
                <select value={selectedVehicleId?.toString() || ''} onChange={(e) => setSelectedVehicleId(e.target.value ? parseInt(e.target.value) : null)} className="border rounded-lg px-3 py-2">
                  <option value="">All Vehicles</option>
                  {vehicles.map(v => (<option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>))}
                </select>
                <button onClick={() => handlePrint('history-list')} className="text-purple-600 hover:text-purple-800">🖨️ Print History</button>
              </div>
            </div>
            
            <div id="history-list" className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : vehicleMaintenances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No maintenance records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-600 text-white">
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Vehicle</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Cost</th>
                        <th className="px-4 py-3 text-left">Next Due</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleMaintenances.map(m => {
                        const vehicle = vehicles.find(v => v.id === m.vehicleId)
                        return (
                          <tr key={m.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{new Date(m.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{vehicle?.year} {vehicle?.make} {vehicle?.model}</td>
                            <td className="px-4 py-3 font-medium">{m.type}</td>
                            <td className="px-4 py-3 text-gray-600">{m.description || '-'}</td>
                            <td className="px-4 py-3">${m.cost?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-3">{m.nextDue ? <span className={new Date(m.nextDue) < new Date() ? 'text-red-600 font-medium' : ''}>{new Date(m.nextDue).toLocaleDateString()}</span> : '-'}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => setEditingMaintenance(m)} className="text-blue-600 hover:text-blue-800 mr-2">✏️</button>
                              <button onClick={() => setDeleteConfirm({type: 'maintenance', id: m.id})} className="text-red-600 hover:text-red-800">🗑️</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Comprehensive Search</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Text</label>
                  <input type="text" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Search any field..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <select value={filters.vehicleId} onChange={(e) => setFilters({...filters, vehicleId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <input type="text" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Oil Change" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Cost ($)</label>
                  <input type="number" step="0.01" value={filters.minCost} onChange={(e) => setFilters({...filters, minCost: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost ($)</label>
                  <input type="number" step="0.01" value={filters.maxCost} onChange={(e) => setFilters({...filters, maxCost: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={handleSearch} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Search</button>
                  <button onClick={() => { setFilters({search: '', vehicleId: '', type: '', startDate: '', endDate: '', minCost: '', maxCost: ''}); setSearchResults([]); }} className="border px-4 py-2 rounded-lg hover:bg-gray-50">Clear</button>
                </div>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Search Results ({searchResults.length})</h3>
                  <button onClick={() => handlePrint('search-results')} className="text-purple-600 hover:text-purple-800">🖨️ Print Results</button>
                </div>
                <div id="search-results" className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-600 text-white">
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Vehicle</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Cost</th>
                        <th className="px-4 py-3 text-left">Next Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(m => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(m.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{m.vehicle?.year} {m.vehicle?.make} {m.vehicle?.model}</td>
                          <td className="px-4 py-3 font-medium">{m.type}</td>
                          <td className="px-4 py-3 text-gray-600">{m.description || '-'}</td>
                          <td className="px-4 py-3">${m.cost?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3">{m.nextDue ? new Date(m.nextDue).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-3xl mb-2">🚗</div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalVehicles}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-3xl mb-2">🔧</div>
                <p className="text-sm text-gray-600">Total Maintenance Records</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalMaintenance}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm text-gray-600">Total Maintenance Cost</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-3xl mb-2">⏰</div>
                <p className="text-sm text-gray-600">Upcoming Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.upcomingCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Maintenance Summary by Vehicle</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-600 text-white">
                      <th className="px-4 py-3 text-left">Vehicle</th>
                      <th className="px-4 py-3 text-left">VIN</th>
                      <th className="px-4 py-3 text-right">Total Records</th>
                      <th className="px-4 py-3 text-right">Total Cost</th>
                      <th className="px-4 py-3 text-right">Last Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => {
                      const vehicleMaints = maintenances.filter(m => m.vehicleId === vehicle.id)
                      const totalCost = vehicleMaints.reduce((sum, m) => sum + (m.cost || 0), 0)
                      const lastService = vehicleMaints.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                      return (
                        <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                          <td className="px-4 py-3 text-gray-600">{vehicle.vin}</td>
                          <td className="px-4 py-3 text-right">{vehicleMaints.length}</td>
                          <td className="px-4 py-3 text-right">${totalCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{lastService ? new Date(lastService.date).toLocaleDateString() : '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Maintenance Types Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  maintenances.reduce((acc, m) => {
                    acc[m.type] = (acc[m.type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type} className="border rounded-lg p-4 flex justify-between items-center">
                    <span className="font-medium">{type}</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {editingMaintenance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Edit Maintenance Record</h2>
              <form onSubmit={handleMaintenanceUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                    <select value={editingMaintenance.vehicleId} onChange={(e) => setEditingMaintenance({...editingMaintenance, vehicleId: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required>
                      {vehicles.map(v => (<option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                    <input type="text" value={editingMaintenance.type} onChange={(e) => setEditingMaintenance({...editingMaintenance, type: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" value={editingMaintenance.description || ''} onChange={(e) => setEditingMaintenance({...editingMaintenance, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input type="date" value={editingMaintenance.date.split('T')[0]} onChange={(e) => setEditingMaintenance({...editingMaintenance, date: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                    <input type="date" value={editingMaintenance.nextDue?.split('T')[0] || ''} onChange={(e) => setEditingMaintenance({...editingMaintenance, nextDue: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                    <input type="number" step="0.01" value={editingMaintenance.cost || ''} onChange={(e) => setEditingMaintenance({...editingMaintenance, cost: parseFloat(e.target.value) || null})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={editingMaintenance.notes || ''} onChange={(e) => setEditingMaintenance({...editingMaintenance, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setEditingMaintenance(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {deleteConfirm.type === 'vehicle' ? 'vehicle' : 'maintenance record'}?
                {deleteConfirm.type === 'vehicle' && ' This will also delete all associated maintenance records.'}
              </p>
              <div className="flex gap-4 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => deleteConfirm.type === 'vehicle' ? handleDeleteVehicle(deleteConfirm.id) : handleDeleteMaintenance(deleteConfirm.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
