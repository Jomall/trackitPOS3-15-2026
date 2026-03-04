'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AutoPart {
  id: number
  name: string
  make?: string
  partNumber?: string
  description?: string
  quantity: number
  price?: number
  photo?: string
  licensePlate?: string
  vin?: string
  purchaseLocation?: string
  desiredStockLevel: number
  zone?: string
  dateOfEntry: string
  lastUpdated: string
  lastStockUpdate?: string
}

export default function AutoParts() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [parts, setParts] = useState<AutoPart[]>([])
  const [loading, setLoading] = useState(true)
  const [newPart, setNewPart] = useState({ 
    name: '', 
    make: '', 
    partNumber: '', 
    description: '', 
    quantity: 0, 
    price: 0, 
    photo: '', 
    licensePlate: '', 
    vin: '',
    purchaseLocation: '',
    desiredStockLevel: 0,
    zone: ''
  })
  const [editingPart, setEditingPart] = useState<AutoPart | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    make: '',
    zone: '',
    stockStatus: '',
    minPrice: '',
    maxPrice: ''
  })

  const warehouseZones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3']

  useEffect(() => {
    fetchParts()
  }, [])

  const fetchParts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auto-parts')
      const data = await res.json()
      setParts(data)
    } catch (error) {
      console.error('Error fetching parts:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPart) {
        await fetch('/api/auto-parts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPart.id, ...newPart, lastUpdated: new Date() })
        })
      } else {
        await fetch('/api/auto-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPart)
        })
      }
      fetchParts()
      resetForm()
    } catch (error) {
      console.error('Error saving part:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/auto-parts?id=' + id, { method: 'DELETE' })
      setParts(parts.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting part:', error)
    }
  }

  const addStock = async (id: number) => {
    const quantityToAdd = parseInt(prompt('Enter quantity to add:', '1') || '0')
    if (quantityToAdd > 0) {
      const part = parts.find(p => p.id === id)
      if (part) {
        try {
          await fetch('/api/auto-parts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id, 
              quantity: part.quantity + quantityToAdd,
              lastUpdated: new Date(),
              lastStockUpdate: new Date()
            })
          })
          fetchParts()
        } catch (error) {
          console.error('Error adding stock:', error)
        }
      }
    }
  }

  const removeStock = async (id: number) => {
    const quantityToRemove = parseInt(prompt('Enter quantity to remove:', '1') || '0')
    if (quantityToRemove > 0) {
      const part = parts.find(p => p.id === id)
      if (part) {
        try {
          await fetch('/api/auto-parts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id, 
              quantity: Math.max(0, part.quantity - quantityToRemove),
              lastUpdated: new Date(),
              lastStockUpdate: new Date()
            })
          })
          fetchParts()
        } catch (error) {
          console.error('Error removing stock:', error)
        }
      }
    }
  }

  const resetForm = () => {
    setNewPart({ 
      name: '', make: '', partNumber: '', description: '', 
      quantity: 0, price: 0, photo: '', licensePlate: '', 
      vin: '', purchaseLocation: '', desiredStockLevel: 0, zone: '' 
    })
    setEditingPart(null)
  }

  const editPart = (part: AutoPart) => {
    setNewPart({
      name: part.name,
      make: part.make || '',
      partNumber: part.partNumber || '',
      description: part.description || '',
      quantity: part.quantity,
      price: part.price || 0,
      photo: part.photo || '',
      licensePlate: part.licensePlate || '',
      vin: part.vin || '',
      purchaseLocation: part.purchaseLocation || '',
      desiredStockLevel: part.desiredStockLevel,
      zone: part.zone || ''
    })
    setEditingPart(part)
    setActiveTab('add')
  }

  const getStockStatus = (part: AutoPart) => {
    if (part.desiredStockLevel === 0) return { status: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' }
    if (part.quantity === 0) return { status: 'out', label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    const percentage = (part.quantity / part.desiredStockLevel) * 100
    if (percentage <= 50) return { status: 'low', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    if (percentage >= 100) return { status: 'over', label: 'Overstocked', color: 'bg-green-100 text-green-700' }
    return { status: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' }
  }

  const filteredParts = parts.filter(part => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!part.name.toLowerCase().includes(search) && 
          !(part.make && part.make.toLowerCase().includes(search)) &&
          !(part.partNumber && part.partNumber.toLowerCase().includes(search)) &&
          !(part.description && part.description.toLowerCase().includes(search)) &&
          !(part.zone && part.zone.toLowerCase().includes(search))) {
        return false
      }
    }
    if (filters.make && part.make !== filters.make) return false
    if (filters.zone && part.zone !== filters.zone) return false
    if (filters.stockStatus) {
      const status = getStockStatus(part).status
      if (filters.stockStatus !== status) return false
    }
    if (filters.minPrice && (part.price || 0) < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && (part.price || 0) > parseFloat(filters.maxPrice)) return false
    return true
  })

  const uniqueMakes: string[] = []
  const makesSet = new Set(parts.filter(p => p.make).map(p => p.make))
  makesSet.forEach(m => uniqueMakes.push(m as string))

  const uniqueZones: string[] = []
  const zonesSet = new Set(parts.filter(p => p.zone).map(p => p.zone))
  zonesSet.forEach(z => uniqueZones.push(z as string))

  const stats = {
    totalParts: parts.length,
    totalValue: parts.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0),
    lowStock: parts.filter(p => getStockStatus(p).status === 'low' || getStockStatus(p).status === 'out').length,
    outOfStock: parts.filter(p => getStockStatus(p).status === 'out').length,
    partsByZone: uniqueZones.map(z => ({ zone: z, count: parts.filter(p => p.zone === z).length })),
    partsByMake: uniqueMakes.map(m => ({ make: m, count: parts.filter(p => p.make === m).length }))
  }

  const printReport = () => {
    const printContent = '<html><head><title>Auto Parts Inventory Report</title></head><body><h1>Auto Parts Inventory Report</h1><p>Generated: ' + new Date().toLocaleString() + '</p><h2>Summary</h2><p>Total Parts: ' + stats.totalParts + '</p><p>Total Value: $' + stats.totalValue.toFixed(2) + '</p><p>Low Stock: ' + stats.lowStock + '</p><p>Out of Stock: ' + stats.outOfStock + '</p><h2>Parts List</h2><table border="1" style="border-collapse: collapse; width: 100%"><tr><th>Name</th><th>Make</th><th>Part #</th><th>Qty</th><th>Price</th><th>Zone</th></tr>' + filteredParts.map(p => '<tr><td>' + p.name + '</td><td>' + (p.make || '') + '</td><td>' + (p.partNumber || '') + '</td><td>' + p.quantity + '</td><td>$' + (p.price || 0).toFixed(2) + '</td><td>' + (p.zone || '') + '</td></tr>').join('') + '</table></body></html>'
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory List', icon: '📦' },
    { id: 'add', label: 'Add Part', icon: '➕' },
    { id: 'stock', label: 'Stock Management', icon: '📊' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'alerts', label: 'Stock Alerts', icon: '⚠️' },
    { id: 'stats', label: 'Statistics', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Auto Parts Inventory</h1>
            <p className="opacity-90">Manage your automotive parts inventory</p>
          </div>
          <Link href="/" className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-2 gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Parts ({parts.length})</h2>
              <button onClick={printReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Print Report
              </button>
            </div>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : parts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No parts in inventory</p>
                <button onClick={() => setActiveTab('add')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">
                  Add First Part
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parts.map(part => {
                  const status = getStockStatus(part)
                  return (
                    <div key={part.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${part.quantity === 0 ? 'border-2 border-red-500' : ''}`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{part.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-600">{part.make} {part.partNumber && "- " + part.partNumber}</p>
                        <p className="text-sm text-gray-500 mb-2">{part.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <p className="font-bold text-xl">Qty: {part.quantity}</p>
                            {part.desiredStockLevel > 0 && (
                              <p className="text-xs text-gray-500">Desired: {part.desiredStockLevel}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${(part.price || 0).toFixed(2)}</p>
                            {part.zone && <p className="text-xs text-gray-500">Zone: {part.zone}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => addStock(part.id)} className="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm">
                            + Stock
                          </button>
                          <button onClick={() => removeStock(part.id)} className="flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-sm">
                            - Stock
                          </button>
                          <button onClick={() => editPart(part)} className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(part.id)} className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{editingPart ? 'Edit Auto Part' : 'Add New Auto Part'}</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name *</label>
                  <input type="text" value={newPart.name} onChange={(e) => setNewPart({...newPart, name: e.target.value})} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input type="text" value={newPart.make} onChange={(e) => setNewPart({...newPart, make: e.target.value})} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                  <input type="text" value={newPart.partNumber} onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" value={newPart.quantity} onChange={(e) => setNewPart({...newPart, quantity: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={newPart.price} onChange={(e) => setNewPart({...newPart, price: parseFloat(e.target.value)})} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Stock Level</label>
                  <input type="number" value={newPart.desiredStockLevel} onChange={(e) => setNewPart({...newPart, desiredStockLevel: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" placeholder="Alert when below this" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Zone</label>
                  <select value={newPart.zone} onChange={(e) => setNewPart({...newPart, zone: e.target.value})} className="border rounded px-3 py-2 w-full">
                    <option value="">Select zone</option>
                    {warehouseZones.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Location</label>
                  <input type="text" value={newPart.purchaseLocation} onChange={(e) => setNewPart({...newPart, purchaseLocation: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="AutoZone, O'Reilly, etc." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newPart.description} onChange={(e) => setNewPart({...newPart, description: e.target.value})} className="border rounded px-3 py-2 w-full" rows={2} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium">
                  {editingPart ? 'Update Part' : 'Add Part'}
                </button>
                {editingPart && (
                  <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Stock Management</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Part</th>
                    <th className="px-4 py-3 text-left">Current Qty</th>
                    <th className="px-4 py-3 text-left">Desired</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map(part => {
                    const status = getStockStatus(part)
                    return (
                      <tr key={part.id} className="border-t">
                        <td className="px-4 py-3">{part.name}<br/><span className="text-sm text-gray-500">{part.make}</span></td>
                        <td className="px-4 py-3 font-bold">{part.quantity}</td>
                        <td className="px-4 py-3">{part.desiredStockLevel}</td>
                        <td className="px-4 py-3"><span className={"px-2 py-1 rounded text-xs font-semibold " + status.color}>{status.label}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => addStock(part.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">+</button>
                            <button onClick={() => removeStock(part.id)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">-</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Search and Filter</h2>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Search parts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-3 py-2" />
                <select value={filters.make} onChange={(e) => setFilters({...filters, make: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Makes</option>
                  {uniqueMakes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={filters.zone} onChange={(e) => setFilters({...filters, zone: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Zones</option>
                  {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select value={filters.stockStatus} onChange={(e) => setFilters({...filters, stockStatus: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Status</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="normal">Normal</option>
                  <option value="over">Overstocked</option>
                </select>
                <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="border rounded px-3 py-2" />
                <button onClick={() => {setSearchTerm(''); setFilters({make: '', zone: '', stockStatus: '', minPrice: '', maxPrice: ''})}} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Clear</button>
              </div>
            </div>
            <p className="mb-4">Found: {filteredParts.length} parts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParts.map(part => {
                const status = getStockStatus(part)
                return (
                  <div key={part.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{part.name}</h3>
                      <span className={"px-2 py-1 rounded text-xs " + status.color}>{status.label}</span>
                    </div>
                    <p className="text-gray-600">{part.make} - {part.partNumber}</p>
                    <p>Qty: {part.quantity} | ${(part.price || 0).toFixed(2)} | Zone: {part.zone || 'N/A'}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Stock Alerts</h2>
            {stats.lowStock === 0 ? (
              <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
                No stock alerts! All items are properly stocked.
              </div>
            ) : (
              <div className="space-y-4">
                {parts.filter(p => getStockStatus(p).status === 'out' || getStockStatus(p).status === 'low').map(part => {
                  const status = getStockStatus(part)
                  return (
                    <div key={part.id} className={"p-4 rounded-lg border-l-4 " + (status.status === 'out' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500')}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{part.name}</h3>
                          <p>{part.make} - {part.partNumber}</p>
                          <p>Current: {part.quantity} | Desired: {part.desiredStockLevel}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addStock(part.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Add Stock
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
              <button onClick={printReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Print Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Total Parts</p>
                <p className="text-3xl font-bold">{stats.totalParts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Parts by Zone</h3>
                {stats.partsByZone.map(z => (
                  <div key={z.zone} className="flex justify-between py-2 border-b">
                    <span>Zone {z.zone}</span>
                    <span className="font-bold">{z.count} parts</span>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Parts by Make</h3>
                {stats.partsByMake.map(m => (
                  <div key={m.make} className="flex justify-between py-2 border-b">
                    <span>{m.make}</span>
                    <span className="font-bold">{m.count} parts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this part? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
