'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AutoPart {
  id: number
  name: string
  make?: string
  model?: string
  year?: number
  partNumber?: string
  description?: string
  quantity: number
  price?: number
  photo?: string
  licensePlate?: string
  vin?: string
  purchaseLocation?: string
  website?: string
  desiredStockLevel: number
  zone?: string
  dateOfEntry: string
  lastUpdated: string
  lastStockUpdate?: string
  stockHistory?: { date: string; type: string; quantity: number; notes: string }[]
  metrics?: { key: string; value: string; unit?: string }[]
}

// Popular auto parts websites for searching
const AUTO_PARTS_WEBSITES = [
  { name: 'AutoZone', url: 'https://www.autozone.com', searchParam: '?search=' },
  { name: "O'Reilly Auto Parts", url: 'https://www.oreillyauto.com', searchParam: '?search=' },
  { name: 'Advance Auto Parts', url: 'https://shop.advanceautoparts.com', searchParam: '?search=' },
  { name: 'Amazon', url: 'https://www.amazon.com', searchParam: 's?k=' },
  { name: 'RockAuto', url: 'https://www.rockauto.com', searchParam: '/en/search/?searchterm=' },
  { name: 'CARiD', url: 'https://www.carid.com', searchParam: '/parts?search=' },
  { name: 'Summit Racing', url: 'https://www.summitracing.com', searchParam: '/search?type=part&query=' },
  { name: 'eBay', url: 'https://www.ebay.com', searchParam: '/sch/i.html?_nkw=' },
]

export default function AutoParts() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [parts, setParts] = useState<AutoPart[]>([])
  const [loading, setLoading] = useState(true)
  const [newPart, setNewPart] = useState({ 
    name: '', 
    make: '', 
    model: '',
    year: '',
    partNumber: '', 
    description: '', 
    quantity: 0, 
    price: 0, 
    photo: '', 
    licensePlate: '', 
    vin: '',
    purchaseLocation: '',
    website: '',
    desiredStockLevel: 0,
    zone: '',
    metrics: [] as { key: string; value: string; unit?: string }[]
  })
  const [editingPart, setEditingPart] = useState<AutoPart | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    make: '',
    zone: '',
    stockStatus: '',
    minPrice: '',
    maxPrice: '',
    licensePlate: ''
  })

  // Report filters
  const [reportFilter, setReportFilter] = useState('all')
  const [reportMakeFilter, setReportMakeFilter] = useState('all')
  
  // Stock transaction modal state
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockPart, setStockPart] = useState<AutoPart | null>(null)
  const [stockChangeType, setStockChangeType] = useState<'add' | 'remove'>('add')
  const [stockQuantity, setStockQuantity] = useState(1)
  const [stockNotes, setStockNotes] = useState('')

  // Reorder modal state
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderPart, setReorderPart] = useState<AutoPart | null>(null)
  const [suggestedWebsites, setSuggestedWebsites] = useState<{name: string; url: string}[]>([])

  // Metrics state
  const [newMetricKey, setNewMetricKey] = useState('')
  const [newMetricValue, setNewMetricValue] = useState('')
  const [newMetricUnit, setNewMetricUnit] = useState('')

  const addMetric = () => {
    if (newMetricKey && newMetricValue) {
      setNewPart({
        ...newPart,
        metrics: [...(newPart.metrics || []), { key: newMetricKey, value: newMetricValue, unit: newMetricUnit || undefined }]
      })
      setNewMetricKey('')
      setNewMetricValue('')
      setNewMetricUnit('')
    }
  }

  const removeMetric = (index: number) => {
    const updatedMetrics = [...(newPart.metrics || [])]
    updatedMetrics.splice(index, 1)
    setNewPart({ ...newPart, metrics: updatedMetrics })
  }

  const warehouseZones = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3']

  useEffect(() => {
    fetchParts()
  }, [])

  const fetchParts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auto-parts')
      const data = await res.json()
      if (Array.isArray(data)) {
        setParts(data)
      } else {
        setParts([])
      }
    } catch (error) {
      console.error('Error fetching parts:', error)
      setParts([])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let response
      const partData = {
        ...newPart,
        year: newPart.year ? parseInt(newPart.year as string) : null
      }
      
      if (editingPart) {
        response = await fetch('/api/auto-parts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPart.id, ...partData, lastUpdated: new Date() })
        })
      } else {
        response = await fetch('/api/auto-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partData)
        })
      }
      
      if (response.ok) {
        await fetchParts()
        resetForm()
        alert(editingPart ? 'Part updated successfully!' : 'Part added successfully!')
      } else {
        alert('Failed to save part. Please try again.')
      }
    } catch (error) {
      console.error('Error saving part:', error)
      alert('Error saving part. Please check if the server is running.')
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

  // Open stock transaction modal
  const openStockModal = (part: AutoPart, type: 'add' | 'remove') => {
    setStockPart(part)
    setStockChangeType(type)
    setStockQuantity(1)
    setStockNotes('')
    setShowStockModal(true)
  }

  // Process stock transaction
  const processStockTransaction = async () => {
    if (!stockPart || stockQuantity <= 0) return

    const newQuantity = stockChangeType === 'add' 
      ? stockPart.quantity + stockQuantity 
      : Math.max(0, stockPart.quantity - stockQuantity)

    const transaction = {
      date: new Date().toISOString().split('T')[0],
      type: stockChangeType,
      quantity: stockQuantity,
      notes: stockNotes
    }

    try {
      const response = await fetch('/api/auto-parts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: stockPart.id, 
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
          lastStockUpdate: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        setParts(parts.map(part => {
          if (part.id === stockPart.id) {
            return {
              ...part,
              quantity: newQuantity,
              lastUpdated: new Date().toISOString(),
              lastStockUpdate: new Date().toISOString(),
              stockHistory: [...(part.stockHistory || []), transaction]
            }
          }
          return part
        }))
        setShowStockModal(false)
        setStockPart(null)
        alert(stockChangeType === 'add' ? 'Stock added successfully!' : 'Stock removed successfully!')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error updating stock. Please try again.')
    }
  }

  // Open reorder modal with suggested websites
  const openReorderModal = (part: AutoPart) => {
    setReorderPart(part)
    generateSuggestedWebsites(part)
    setShowReorderModal(true)
  }

  // Generate suggested websites based on part details
  const generateSuggestedWebsites = (part: AutoPart) => {
    const searchTerms = []
    
    // Build search query from part details
    if (part.name) searchTerms.push(part.name)
    if (part.make) searchTerms.push(part.make)
    if (part.model) searchTerms.push(part.model)
    if (part.year) searchTerms.push(part.year.toString())
    if (part.partNumber) searchTerms.push(part.partNumber)
    
    const searchQuery = searchTerms.join(' ')
    const encodedQuery = encodeURIComponent(searchQuery)
    
    // Generate website URLs
    const websites = AUTO_PARTS_WEBSITES.map(site => ({
      name: site.name,
      url: `${site.url}${site.searchParam}${encodedQuery}`
    }))
    
    // If the part has a custom website, add it to the top
    if (part.website) {
      websites.unshift({ name: 'Custom Website', url: part.website })
    }
    
    // If the part has a purchase location (physical store), add it
    if (part.purchaseLocation) {
      websites.push({ name: `Visit: ${part.purchaseLocation}`, url: '#' })
    }
    
    setSuggestedWebsites(websites)
  }

  // Open website in new tab
  const openWebsite = (url: string) => {
    if (url === '#') {
      alert(`Visit the store: ${reorderPart?.purchaseLocation}`)
    } else {
      window.open(url, '_blank')
    }
  }

  const resetForm = () => {
    setNewPart({ 
      name: '', make: '', model: '', year: '', partNumber: '', description: '', 
      quantity: 0, price: 0, photo: '', licensePlate: '', 
      vin: '', purchaseLocation: '', website: '', desiredStockLevel: 0, zone: '',
      metrics: []
    })
    setEditingPart(null)
  }

  const editPart = (part: AutoPart) => {
    setNewPart({
      name: part.name,
      make: part.make || '',
      model: part.model || '',
      year: part.year?.toString() || '',
      partNumber: part.partNumber || '',
      description: part.description || '',
      quantity: part.quantity,
      price: part.price || 0,
      photo: part.photo || '',
      licensePlate: part.licensePlate || '',
      vin: part.vin || '',
      purchaseLocation: part.purchaseLocation || '',
      website: part.website || '',
      desiredStockLevel: part.desiredStockLevel,
      zone: part.zone || '',
      metrics: part.metrics || []
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
          !(part.zone && part.zone.toLowerCase().includes(search)) &&
          !(part.licensePlate && part.licensePlate.toLowerCase().includes(search)) &&
          !(part.vin && part.vin.toLowerCase().includes(search))) {
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
    if (filters.licensePlate && part.licensePlate) {
      if (!part.licensePlate.toLowerCase().includes(filters.licensePlate.toLowerCase())) return false
    }
    return true
  })

  // Get parts for reports based on filter
  const getReportParts = () => {
    let filtered = [...parts]
    
    // Filter by make
    if (reportMakeFilter !== 'all') {
      filtered = filtered.filter(part => part.make === reportMakeFilter)
    }
    
    // Filter by status
    switch (reportFilter) {
      case 'low-stock':
        filtered = filtered.filter(part => getStockStatus(part).status === 'low')
        break
      case 'out-of-stock':
        filtered = filtered.filter(part => getStockStatus(part).status === 'out')
        break
      case 'reorder':
        // Parts that need reordering: low stock or out of stock
        filtered = filtered.filter(part => {
          const status = getStockStatus(part)
          return status.status === 'low' || status.status === 'out'
        })
        break
    }
    
    return filtered
  }

  // Print comprehensive report
  const printReport = () => {
    const reportParts = getReportParts()
    const filterLabel = reportFilter === 'all' ? 'All Parts' : 
                       reportFilter === 'low-stock' ? 'Low Stock Parts' :
                       reportFilter === 'out-of-stock' ? 'Out of Stock Parts' :
                       reportFilter === 'reorder' ? 'Parts Needing Reorder' : 'All Parts'
    
    const makeLabel = reportMakeFilter === 'all' ? 'All Makes' : reportMakeFilter

    let tableRows = reportParts.map(p => {
      const status = getStockStatus(p)
      return `<tr>
        <td style="border:1px solid #ddd;padding:8px;">${p.name}</td>
        <td style="border:1px solid #ddd;padding:8px;">${p.year || ''} ${p.make || ''} ${p.model || ''}</td>
        <td style="border:1px solid #ddd;padding:8px;">${p.partNumber || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${p.licensePlate || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${p.quantity}</td>
        <td style="border:1px solid #ddd;padding:8px;">$${(p.price || 0).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:8px;">${p.zone || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${status.label}</td>
      </tr>`
    }).join('')

    const printContent = `
      <html>
      <head>
        <title>Auto Parts Inventory Report - ${filterLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #dc2626; margin-bottom: 5px; }
          h2 { color: #991b1b; margin-top: 0; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #fee2e2; padding: 10px; text-align: left; border: 1px solid #ddd; }
          .summary { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>🚗 Auto Parts Inventory Report</h1>
        <h2>${filterLabel}</h2>
        <div class="meta">
          <p><strong>Filter:</strong> ${makeLabel}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Parts:</strong> ${reportParts.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Vehicle</th>
              <th>Part #</th>
              <th>License Plate</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Zone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Parts in Report:</strong> ${reportParts.length}</p>
          <p><strong>Low Stock:</strong> ${reportParts.filter(p => getStockStatus(p).status === 'low').length}</p>
          <p><strong>Out of Stock:</strong> ${reportParts.filter(p => getStockStatus(p).status === 'out').length}</p>
          <p><strong>Total Value:</strong> $${reportParts.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0).toFixed(2)}</p>
        </div>
      </body>
      </html>
    `
    
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  // Export report to CSV
  const exportReportCSV = () => {
    const reportParts = getReportParts()
    const headers = ['Name', 'Year', 'Make', 'Model', 'Part Number', 'License Plate', 'VIN', 'Quantity', 'Price', 'Desired Stock', 'Zone', 'Stock Status', 'Purchase Location', 'Website']
    const rows = reportParts.map(p => [
      p.name,
      p.year || '',
      p.make || '',
      p.model || '',
      p.partNumber || '',
      p.licensePlate || '',
      p.vin || '',
      p.quantity,
      p.price || '',
      p.desiredStockLevel,
      p.zone || '',
      getStockStatus(p).label,
      p.purchaseLocation || '',
      p.website || ''
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auto-parts-report-${reportFilter}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const uniqueMakes: string[] = []
  const makesSet = new Set(parts.filter(p => p.make).map(p => p.make))
  makesSet.forEach(m => uniqueMakes.push(m as string))

  const uniqueZones: string[] = []
  const zonesSet = new Set(parts.filter(p => p.zone).map(p => p.zone))
  zonesSet.forEach(z => uniqueZones.push(z as string))

  const uniqueLicensePlates: string[] = []
  const lpSet = new Set(parts.filter(p => p.licensePlate).map(p => p.licensePlate))
  lpSet.forEach(lp => uniqueLicensePlates.push(lp as string))

  const stats = {
    totalParts: parts.length,
    totalValue: parts.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0),
    lowStock: parts.filter(p => getStockStatus(p).status === 'low' || getStockStatus(p).status === 'out').length,
    outOfStock: parts.filter(p => getStockStatus(p).status === 'out').length,
    partsByZone: uniqueZones.map(z => ({ zone: z, count: parts.filter(p => p.zone === z).length })),
    partsByMake: uniqueMakes.map(m => ({ make: m, count: parts.filter(p => p.make === m).length })),
    partsByLicensePlate: uniqueLicensePlates.map(lp => ({ licensePlate: lp, count: parts.filter(p => p.licensePlate === lp).length }))
  }

  const printInventoryReport = () => {
    const printContent = '<html><head><title>Auto Parts Inventory Report</title></head><body><h1>Auto Parts Inventory Report</h1><p>Generated: ' + new Date().toLocaleString() + '</p><h2>Summary</h2><p>Total Parts: ' + stats.totalParts + '</p><p>Total Value: $' + stats.totalValue.toFixed(2) + '</p><p>Low Stock: ' + stats.lowStock + '</p><p>Out of Stock: ' + stats.outOfStock + '</p><h2>Parts List</h2><table border="1" style="border-collapse: collapse; width: 100%"><tr><th>Name</th><th>Make</th><th>Part #</th><th>License Plate</th><th>Qty</th><th>Price</th><th>Zone</th></tr>' + filteredParts.map(p => '<tr><td>' + p.name + '</td><td>' + (p.year || '') + ' ' + (p.make || '') + ' ' + (p.model || '') + '</td><td>' + (p.partNumber || '') + '</td><td>' + (p.licensePlate || '') + '</td><td>' + p.quantity + '</td><td>$' + (p.price || 0).toFixed(2) + '</td><td>' + (p.zone || '') + '</td></tr>').join('') + '</table></body></html>'
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
    { id: 'reorder', label: 'Reorder Parts', icon: '🛒' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'stats', label: 'Statistics', icon: '📈' }
  ]

  const reportParts = getReportParts()

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
              <button onClick={printInventoryReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
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
                          <div>
                            <h3 className="font-bold text-lg">{part.name}</h3>
                            <p className="text-sm text-gray-500">{part.year ? `${part.year} ` : ''}{part.make} {part.model}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        {part.licensePlate && <p className="text-sm text-blue-600 font-medium">🚗 {part.licensePlate}</p>}
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
                          <button onClick={() => openStockModal(part, 'add')} className="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm">
                            + Stock
                          </button>
                          <button onClick={() => openStockModal(part, 'remove')} className="flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-sm">
                            - Stock
                          </button>
                          <button onClick={() => openReorderModal(part)} className="flex-1 bg-purple-500 text-white py-1 rounded hover:bg-purple-600 text-sm">
                            🛒 Reorder
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
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
                  <input type="text" value={newPart.make} onChange={(e) => setNewPart({...newPart, make: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="e.g., Ford, Toyota" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" value={newPart.model} onChange={(e) => setNewPart({...newPart, model: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="e.g., F-150, Camry" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="number" value={newPart.year} onChange={(e) => setNewPart({...newPart, year: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="e.g., 2020" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                  <input type="text" value={newPart.partNumber} onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle License Plate</label>
                  <input type="text" value={newPart.licensePlate} onChange={(e) => setNewPart({...newPart, licensePlate: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="Enter vehicle license plate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                  <input type="text" value={newPart.vin} onChange={(e) => setNewPart({...newPart, vin: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="Vehicle Identification Number" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical Store Location</label>
                  <input type="text" value={newPart.purchaseLocation} onChange={(e) => setNewPart({...newPart, purchaseLocation: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="e.g., AutoZone Downtown" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website for Reordering</label>
                  <input type="url" value={newPart.website} onChange={(e) => setNewPart({...newPart, website: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="https://www.autozone.com/..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newPart.description} onChange={(e) => setNewPart({...newPart, description: e.target.value})} className="border rounded px-3 py-2 w-full" rows={2} />
                </div>
                
                {/* Metrics Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metrics (Custom Measurements)</label>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="Metric name (e.g., Width)" 
                        value={newMetricKey}
                        onChange={(e) => setNewMetricKey(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Value (e.g., 10)" 
                        value={newMetricValue}
                        onChange={(e) => setNewMetricValue(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Unit (e.g., cm, kg)" 
                        value={newMetricUnit}
                        onChange={(e) => setNewMetricUnit(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      />
                      <button 
                        type="button"
                        onClick={addMetric}
                        disabled={!newMetricKey || !newMetricValue}
                        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add Metric
                      </button>
                    </div>
                    
                    {newPart.metrics && newPart.metrics.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Added Metrics:</p>
                        {newPart.metrics.map((metric, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="text-sm">
                              <span className="font-medium">{metric.key}:</span> {metric.value} {metric.unit}
                            </span>
                            <button 
                              type="button"
                              onClick={() => removeMetric(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    <th className="px-4 py-3 text-left">License Plate</th>
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
                        <td className="px-4 py-3">{part.name}<br/><span className="text-sm text-gray-500">{part.year ? `${part.year} ` : ''}{part.make} {part.model}</span></td>
                        <td className="px-4 py-3">{part.licensePlate || '-'}</td>
                        <td className="px-4 py-3 font-bold">{part.quantity}</td>
                        <td className="px-4 py-3">{part.desiredStockLevel}</td>
                        <td className="px-4 py-3"><span className={"px-2 py-1 rounded text-xs font-semibold " + status.color}>{status.label}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openStockModal(part, 'add')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">+</button>
                            <button onClick={() => openStockModal(part, 'remove')} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">-</button>
                            <button onClick={() => openReorderModal(part)} className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">Reorder</button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select value={filters.licensePlate} onChange={(e) => setFilters({...filters, licensePlate: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All License Plates</option>
                  {uniqueLicensePlates.map(lp => <option key={lp} value={lp}>{lp}</option>)}
                </select>
                <select value={filters.stockStatus} onChange={(e) => setFilters({...filters, stockStatus: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Status</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="normal">Normal</option>
                  <option value="over">Overstocked</option>
                </select>
                <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="border rounded px-3 py-2" />
                <button onClick={() => {setSearchTerm(''); setFilters({make: '', zone: '', stockStatus: '', minPrice: '', maxPrice: '', licensePlate: ''})}} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Clear</button>
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
                    <p className="text-gray-600">{part.year ? `${part.year} ` : ''}{part.make} {part.model} - {part.partNumber}</p>
                    {part.licensePlate && <p className="text-blue-600 font-medium">🚗 {part.licensePlate}</p>}
                    <p>Qty: {part.quantity} | ${part.price ? part.price.toFixed(2) : '0.00'} | Zone: {part.zone || 'N/A'}</p>
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
                          <p>{part.year ? `${part.year} ` : ''}{part.make} {part.model} - {part.partNumber}</p>
                          {part.licensePlate && <p className="text-blue-600">🚗 {part.licensePlate}</p>}
                          <p>Current: {part.quantity} | Desired: {part.desiredStockLevel}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openStockModal(part, 'add')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Add Stock
                          </button>
                          <button onClick={() => openReorderModal(part)} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                            🛒 Reorder
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

        {activeTab === 'reorder' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🛒 Reorder Parts</h2>
            <p className="text-gray-600 mb-6">Click on a part to see suggested websites for reordering</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parts.map(part => (
                <div 
                  key={part.id} 
                  onClick={() => openReorderModal(part)}
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:border-purple-500 border-2 border-transparent transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{part.name}</h3>
                    <span className="text-purple-600">🛒</span>
                  </div>
                  <p className="text-gray-600">{part.year ? `${part.year} ` : ''}{part.make} {part.model}</p>
                  <p className="text-sm text-gray-500">{part.partNumber && `Part #: ${part.partNumber}`}</p>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm font-medium">Current Qty: {part.quantity}</span>
                    <span className="text-purple-600 text-sm font-medium">Click to Find →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📋 Reports & Printing</h2>
            
            {/* Report Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4">Filter Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value)} className="border rounded px-3 py-2 w-full">
                    <option value="all">All Parts</option>
                    <option value="low-stock">Low Stock Parts</option>
                    <option value="out-of-stock">Out of Stock Parts</option>
                    <option value="reorder">Parts Needing Reorder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Make</label>
                  <select value={reportMakeFilter} onChange={(e) => setReportMakeFilter(e.target.value)} className="border rounded px-3 py-2 w-full">
                    <option value="all">All makes</option>
                    {uniqueMakes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={printReport} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  🖨️ Print Report
                </button>
                <button onClick={exportReportCSV} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  📥 Export CSV
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-bold">
                  Report Preview: {reportFilter === 'all' ? 'All Parts' : 
                                 reportFilter === 'low-stock' ? 'Low Stock Parts' :
                                 reportFilter === 'out-of-stock' ? 'Out of Stock Parts' :
                                 reportFilter === 'reorder' ? 'Parts Needing Reorder' : 'All Parts'}
                  <span className="ml-2 text-gray-500 font-normal">({reportParts.length} parts)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Vehicle</th>
                      <th className="px-4 py-3 text-left">Part #</th>
                      <th className="px-4 py-3 text-left">License Plate</th>
                      <th className="px-4 py-3 text-left">Qty</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Zone</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportParts.map(part => {
                      const status = getStockStatus(part)
                      return (
                        <tr key={part.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{part.name}</td>
                          <td className="px-4 py-3 text-gray-500">{part.year ? `${part.year} ` : ''}{part.make} {part.model}</td>
                          <td className="px-4 py-3 text-gray-500">{part.partNumber || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{part.licensePlate || '-'}</td>
                          <td className="px-4 py-3 font-bold">{part.quantity}</td>
                          <td className="px-4 py-3">${(part.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-500">{part.zone || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openReorderModal(part)} className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">
                              Reorder
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {reportParts.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No parts match the selected filters
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
              <button onClick={printInventoryReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Parts by Vehicle</h3>
                {stats.partsByLicensePlate.map(lp => (
                  <div key={lp.licensePlate} className="flex justify-between py-2 border-b">
                    <span>🚗 {lp.licensePlate}</span>
                    <span className="font-bold">{lp.count} parts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Stock Transaction Modal */}
      {showStockModal && stockPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {stockChangeType === 'add' ? '➕ Add Stock' : '➖ Remove Stock'}
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2"><span className="font-semibold">Part:</span> {stockPart.name}</p>
              <p className="text-gray-600 mb-2"><span className="font-semibold">Make:</span> {stockPart.year ? `${stockPart.year} ` : ''}{stockPart.make} {stockPart.model}</p>
              <p className="text-gray-600 mb-4"><span className="font-semibold">Current Quantity:</span> {stockPart.quantity}</p>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={stockQuantity} 
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} 
                className="border rounded px-3 py-2 w-full" 
              />
              
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Notes (optional)</label>
              <textarea 
                value={stockNotes} 
                onChange={(e) => setStockNotes(e.target.value)} 
                className="border rounded px-3 py-2 w-full" 
                rows={2}
                placeholder="Add notes about this transaction..."
              />
              
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="text-sm">
                  <span className="font-semibold">New Quantity:</span> {' '}
                  {stockChangeType === 'add' 
                    ? stockPart.quantity + stockQuantity 
                    : Math.max(0, stockPart.quantity - stockQuantity)
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStockModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              <button 
                onClick={processStockTransaction} 
                className={`${stockChangeType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white px-4 py-2 rounded`}
              >
                {stockChangeType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      {showReorderModal && reorderPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">🛒 Reorder: {reorderPart.name}</h3>
            <p className="text-gray-600 mb-4">
              {reorderPart.year ? `${reorderPart.year} ` : ''}{reorderPart.make} {reorderPart.model} 
              {reorderPart.partNumber && ` - Part #: ${reorderPart.partNumber}`}
            </p>
            
            {/* Search Query Display */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 font-semibold">Search Query:</p>
              <p className="text-purple-900">
                {reorderPart.name} {reorderPart.make} {reorderPart.model} {reorderPart.year} {reorderPart.partNumber}
              </p>
            </div>

            {/* Custom Website Option */}
            {reorderPart.website && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Saved Website:</p>
                <button 
                  onClick={() => openWebsite(reorderPart.website!)}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  🌐 Visit: {reorderPart.website.replace(/^https?:\/\//, '')}
                </button>
              </div>
            )}

            {/* Physical Store Option */}
            {reorderPart.purchaseLocation && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Physical Store:</p>
                <div className="bg-green-50 border border-green-500 rounded-lg p-3">
                  <p className="text-green-700 font-medium">📍 {reorderPart.purchaseLocation}</p>
                  <p className="text-sm text-gray-600">Visit this store to purchase the part in person</p>
                </div>
              </div>
            )}

            {/* Suggested Websites */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Suggested Online Retailers:</p>
              <div className="space-y-2">
                {suggestedWebsites.filter(s => s.name !== 'Custom Website' && !s.name.startsWith('Visit:')).map((site, index) => (
                  <button 
                    key={index}
                    onClick={() => openWebsite(site.url)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">{site.name}</span>
                    <span className="text-blue-600 text-sm">Search →</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowReorderModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
