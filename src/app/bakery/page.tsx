'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BakeryItem {
  id: number
  itemNumber: string
  name: string
  type: string
  description?: string
  quantity: number
  image?: string
  weight?: number
  expirationDate?: string
  desiredStockLevel: number
  serviceSchedule?: string
  lastServiceDate?: string
  nextServiceDate?: string
  purchaseLocation?: string
  website?: string
  status?: 'active' | 'expired' | 'serviced'
  statusDate?: string
  statusNotes?: string
  stockHistory?: { date: string; type: string; quantity: number; notes: string }[]
  metrics?: { key: string; value: string; unit?: string }[]
}

// Popular bakery supply websites for searching
const BAKERY_SUPPLY_WEBSITES = [
  { name: 'Amazon', url: 'https://www.amazon.com', searchParam: 's?k=' },
  { name: 'Web Restaurant Store', url: 'https://www.webstaurantstore.com', searchParam: '/search.html?search=' },
  { name: 'Restaurant Supply', url: 'https://www.restaurantsupply.com', searchParam: '/search?query=' },
  { name: 'Walton\'s', url: 'https://www.waltons.com', searchParam: '/search?query=' },
  { name: 'KBK Bakery', url: 'https://www.kbkbakery.com', searchParam: '/search?q=' },
  { name: 'eBay', url: 'https://www.ebay.com', searchParam: '/sch/i.html?_nkw=' },
  { name: 'Sam\'s Club', url: 'https://www.samsclub.com', searchParam: '/s/?searchTerm=' },
  { name: 'Costco', url: 'https://www.costco.com', searchParam: '/s/?keyword=' },
]

export default function Bakery() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [items, setItems] = useState<BakeryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({
    itemNumber: '',
    name: '',
    type: 'machinery',
    description: '',
    quantity: 0,
    image: '',
    weight: 0,
    expirationDate: '',
    desiredStockLevel: 0,
    serviceSchedule: '',
    lastServiceDate: '',
    nextServiceDate: '',
    purchaseLocation: '',
    website: '',
    metrics: [] as { key: string; value: string; unit?: string }[]
  })
  
  // Metrics management
  const [newMetricKey, setNewMetricKey] = useState('')
  const [newMetricValue, setNewMetricValue] = useState('')
  const [newMetricUnit, setNewMetricUnit] = useState('')
  
  const addMetric = () => {
    if (newMetricKey && newMetricValue) {
      setNewItem({
        ...newItem,
        metrics: [...(newItem.metrics || []), { key: newMetricKey, value: newMetricValue, unit: newMetricUnit || undefined }]
      })
      setNewMetricKey('')
      setNewMetricValue('')
      setNewMetricUnit('')
    }
  }
  
  const removeMetric = (index: number) => {
    const updatedMetrics = [...(newItem.metrics || [])]
    updatedMetrics.splice(index, 1)
    setNewItem({ ...newItem, metrics: updatedMetrics })
  }
  const [editingItem, setEditingItem] = useState<BakeryItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    stockStatus: '',
    minQuantity: '',
    maxQuantity: ''
  })
  
  // Report filters
  const [reportFilter, setReportFilter] = useState('all')
  const [reportTypeFilter, setReportTypeFilter] = useState('all')
  
  const [selectedItem, setSelectedItem] = useState<BakeryItem | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [statusNotes, setStatusNotes] = useState('')

  // Stock transaction modal state
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockItem, setStockItem] = useState<BakeryItem | null>(null)
  const [stockChangeType, setStockChangeType] = useState<'add' | 'remove'>('add')
  const [stockQuantity, setStockQuantity] = useState(1)
  const [stockNotes, setStockNotes] = useState('')

  // Reorder modal state
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderItem, setReorderItem] = useState<BakeryItem | null>(null)
  const [suggestedWebsites, setSuggestedWebsites] = useState<{name: string; url: string}[]>([])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    setItems([
      { id: 1, itemNumber: 'BK001', name: 'Industrial Oven', type: 'machinery', description: 'Large capacity baking oven', quantity: 2, desiredStockLevel: 1, serviceSchedule: 'quarterly', lastServiceDate: '2024-01-15', nextServiceDate: '2024-04-15', stockHistory: [], purchaseLocation: 'Restaurant Supply Co', website: '' },
      { id: 2, itemNumber: 'BK002', name: 'Dough Mixer', type: 'machinery', description: 'Professional dough mixer', quantity: 3, desiredStockLevel: 2, serviceSchedule: 'monthly', lastServiceDate: '2024-02-01', nextServiceDate: '2024-03-01', stockHistory: [], purchaseLocation: 'Web Restaurant Store', website: '' },
      { id: 3, itemNumber: 'BK003', name: 'Flour Bags', type: 'supplies', description: 'Premium wheat flour 25kg', quantity: 50, desiredStockLevel: 20, expirationDate: '2024-12-31', stockHistory: [], purchaseLocation: 'Sam\'s Club', website: 'https://www.samsclub.com' },
      { id: 4, itemNumber: 'BK004', name: 'Baking Sheets', type: 'equipment', description: 'Aluminum baking sheets', quantity: 100, desiredStockLevel: 50, stockHistory: [], purchaseLocation: 'Restaurant Supply Co', website: '' },
      { id: 5, itemNumber: 'BK005', name: 'Yeast', type: 'supplies', description: 'Instant dry yeast 500g', quantity: 5, desiredStockLevel: 10, expirationDate: '2024-06-30', stockHistory: [], purchaseLocation: 'Costco', website: '' },
      { id: 6, itemNumber: 'BK006', name: 'Proofing Cabinet', type: 'machinery', description: 'Dough proofing cabinet', quantity: 1, desiredStockLevel: 1, serviceSchedule: 'quarterly', stockHistory: [], purchaseLocation: 'Web Restaurant Store', website: '' },
    ])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        setItems(items.map(item => item.id === editingItem.id ? { ...item, ...newItem } : item))
      } else {
        const item: BakeryItem = {
          id: Date.now(),
          stockHistory: [],
          ...newItem
        }
        setItems([...items, item])
      }
      resetForm()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleDelete = async (id: number) => {
    setItems(items.filter(item => item.id !== id))
    setDeleteConfirm(null)
  }

  const resetForm = () => {
    setNewItem({
      itemNumber: '',
      name: '',
      type: 'machinery',
      description: '',
      quantity: 0,
      image: '',
      weight: 0,
      expirationDate: '',
      desiredStockLevel: 0,
      serviceSchedule: '',
      lastServiceDate: '',
      nextServiceDate: '',
      purchaseLocation: '',
      website: '',
      metrics: []
    })
    setEditingItem(null)
  }

  const editItem = (item: BakeryItem) => {
    setNewItem({
      itemNumber: item.itemNumber,
      name: item.name,
      type: item.type,
      description: item.description || '',
      quantity: item.quantity,
      image: item.image || '',
      weight: item.weight || 0,
      expirationDate: item.expirationDate || '',
      desiredStockLevel: item.desiredStockLevel || 0,
      serviceSchedule: item.serviceSchedule || '',
      lastServiceDate: item.lastServiceDate || '',
      nextServiceDate: item.nextServiceDate || '',
      purchaseLocation: item.purchaseLocation || '',
      website: item.website || '',
      metrics: item.metrics || []
    })
    setEditingItem(item)
    setActiveTab('add')
  }

  // Open stock transaction modal
  const openStockModal = (item: BakeryItem, type: 'add' | 'remove') => {
    setStockItem(item)
    setStockChangeType(type)
    setStockQuantity(1)
    setStockNotes('')
    setShowStockModal(true)
  }

  // Process stock transaction
  const processStockTransaction = () => {
    if (!stockItem || stockQuantity <= 0) return

    const newQuantity = stockChangeType === 'add' 
      ? stockItem.quantity + stockQuantity 
      : Math.max(0, stockItem.quantity - stockQuantity)

    const transaction = {
      date: new Date().toISOString().split('T')[0],
      type: stockChangeType,
      quantity: stockQuantity,
      notes: stockNotes
    }

    setItems(items.map(item => {
      if (item.id === stockItem.id) {
        return {
          ...item,
          quantity: newQuantity,
          stockHistory: [...(item.stockHistory || []), transaction]
        }
      }
      return item
    }))

    setShowStockModal(false)
    setStockItem(null)
  }

  // Open reorder modal
  const openReorderModal = (item: BakeryItem) => {
    setReorderItem(item)
    generateSuggestedWebsites(item)
    setShowReorderModal(true)
  }

  // Generate suggested websites based on item details
  const generateSuggestedWebsites = (item: BakeryItem) => {
    const searchTerms = []
    
    if (item.name) searchTerms.push(item.name)
    if (item.description) searchTerms.push(item.description)
    if (item.type === 'supplies') searchTerms.push('bakery supplies')
    if (item.type === 'equipment') searchTerms.push('bakery equipment')
    if (item.type === 'machinery') searchTerms.push('bakery machinery')
    
    const searchQuery = searchTerms.join(' ')
    const encodedQuery = encodeURIComponent(searchQuery)
    
    const websites = BAKERY_SUPPLY_WEBSITES.map(site => ({
      name: site.name,
      url: `${site.url}${site.searchParam}${encodedQuery}`
    }))
    
    if (item.website) {
      websites.unshift({ name: 'Custom Website', url: item.website })
    }
    
    if (item.purchaseLocation) {
      websites.push({ name: `Visit: ${item.purchaseLocation}`, url: '#' })
    }
    
    setSuggestedWebsites(websites)
  }

  // Open website
  const openWebsite = (url: string) => {
    if (url === '#') {
      alert(`Visit the store: ${reorderItem?.purchaseLocation}`)
    } else {
      window.open(url, '_blank')
    }
  }

  const addStock = async (id: number) => {
    const quantityToAdd = parseInt(prompt('Enter quantity to add:', '1') || '0')
    if (quantityToAdd > 0) {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: item.quantity + quantityToAdd } : item
      ))
    }
  }

  const removeStock = async (id: number) => {
    const quantityToRemove = parseInt(prompt('Enter quantity to remove:', '1') || '0')
    if (quantityToRemove > 0) {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity - quantityToRemove) } : item
      ))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setNewItem({...newItem, image: url})
    }
  }

  const openItemModal = (item: BakeryItem) => {
    setSelectedItem(item)
    setStatusNotes(item.statusNotes || '')
    setShowItemModal(true)
  }

  const updateItemStatus = (newStatus: 'active' | 'expired' | 'serviced') => {
    if (!selectedItem) return
    
    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: newStatus,
          statusDate: new Date().toISOString().split('T')[0],
          statusNotes: statusNotes
        }
      }
      return item
    })
    
    setItems(updatedItems)
    setShowItemModal(false)
    setStatusNotes('')
    setSelectedItem(null)
  }

  const getStockStatus = (item: BakeryItem) => {
    if (item.desiredStockLevel === 0) return { status: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' }
    if (item.quantity === 0) return { status: 'out', label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    const percentage = (item.quantity / item.desiredStockLevel) * 100
    if (percentage <= 50) return { status: 'low', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    if (percentage >= 100) return { status: 'over', label: 'Overstocked', color: 'bg-green-100 text-green-700' }
    return { status: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' }
  }

  const getExpirationStatus = (item: BakeryItem) => {
    if (!item.expirationDate) return null
    const expDate = new Date(item.expirationDate)
    const today = new Date()
    const daysUntil = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: 'bg-red-500 text-white' }
    if (daysUntil <= 7) return { status: 'expiring-soon', label: 'Expiring Soon', color: 'bg-orange-100 text-orange-700' }
    if (daysUntil <= 30) return { status: 'expiring', label: 'Expiring', color: 'bg-yellow-100 text-yellow-700' }
    return { status: 'good', label: 'Good', color: 'bg-green-100 text-green-700' }
  }

  const getServiceStatus = (item: BakeryItem) => {
    if (!item.nextServiceDate) return null
    const serviceDate = new Date(item.nextServiceDate)
    const today = new Date()
    const daysUntil = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'overdue', label: 'Service Overdue', color: 'bg-red-500 text-white' }
    if (daysUntil <= 7) return { status: 'due-soon', label: 'Service Due Soon', color: 'bg-orange-100 text-orange-700' }
    return { status: 'ok', label: 'Service OK', color: 'bg-green-100 text-green-700' }
  }

  const filteredItems = items.filter(item => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!item.name.toLowerCase().includes(search) && 
          !item.type.toLowerCase().includes(search) &&
          !item.itemNumber.toLowerCase().includes(search) &&
          !(item.description && item.description.toLowerCase().includes(search))) {
        return false
      }
    }
    if (filters.type && item.type !== filters.type) return false
    if (filters.stockStatus) {
      const status = getStockStatus(item).status
      if (filters.stockStatus !== status) return false
    }
    if (filters.minQuantity && item.quantity < parseInt(filters.minQuantity)) return false
    if (filters.maxQuantity && item.quantity > parseInt(filters.maxQuantity)) return false
    return true
  })

  // Get items for reports based on filter
  const getReportItems = () => {
    let filtered = [...items]
    
    // Filter by type
    if (reportTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === reportTypeFilter)
    }
    
    // Filter by status
    switch (reportFilter) {
      case 'low-stock':
        filtered = filtered.filter(item => getStockStatus(item).status === 'low')
        break
      case 'out-of-stock':
        filtered = filtered.filter(item => getStockStatus(item).status === 'out')
        break
      case 'expiring':
        filtered = filtered.filter(item => {
          const exp = getExpirationStatus(item)
          return exp && (exp.status === 'expired' || exp.status === 'expiring-soon' || exp.status === 'expiring')
        })
        break
      case 'service-due':
        filtered = filtered.filter(item => {
          const svc = getServiceStatus(item)
          return svc && (svc.status === 'overdue' || svc.status === 'due-soon')
        })
        break
      case 'reorder':
        // Items that need reordering: low stock, out of stock, expiring, or service due
        filtered = filtered.filter(item => {
          const stockStatus = getStockStatus(item)
          const expStatus = getExpirationStatus(item)
          const svcStatus = getServiceStatus(item)
          return stockStatus.status === 'low' || stockStatus.status === 'out' || 
                 (expStatus && (expStatus.status === 'expired' || expStatus.status === 'expiring-soon')) ||
                 (svcStatus && (svcStatus.status === 'overdue' || svcStatus.status === 'due-soon'))
        })
        break
    }
    
    return filtered
  }

  // Print comprehensive report
  const printReport = () => {
    const reportItems = getReportItems()
    const filterLabel = reportFilter === 'all' ? 'All Items' : 
                       reportFilter === 'low-stock' ? 'Low Stock Items' :
                       reportFilter === 'out-of-stock' ? 'Out of Stock Items' :
                       reportFilter === 'expiring' ? 'Expiring Items' :
                       reportFilter === 'service-due' ? 'Service Due Items' :
                       reportFilter === 'reorder' ? 'Items Needing Reorder' : 'All Items'
    
    const typeLabel = reportTypeFilter === 'all' ? 'All Types' :
                    reportTypeFilter === 'machinery' ? 'Machinery' :
                    reportTypeFilter === 'equipment' ? 'Equipment' :
                    reportTypeFilter === 'supplies' ? 'Supplies' : 'All Types'

    let tableRows = reportItems.map(i => {
      const stockStatus = getStockStatus(i)
      const expStatus = getExpirationStatus(i)
      const svcStatus = getServiceStatus(i)
      return `<tr>
        <td style="border:1px solid #ddd;padding:8px;">${i.name}</td>
        <td style="border:1px solid #ddd;padding:8px;">${i.itemNumber}</td>
        <td style="border:1px solid #ddd;padding:8px;text-transform:capitalize;">${i.type}</td>
        <td style="border:1px solid #ddd;padding:8px;">${i.quantity}</td>
        <td style="border:1px solid #ddd;padding:8px;">${i.desiredStockLevel || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${stockStatus.label}</td>
        <td style="border:1px solid #ddd;padding:8px;">${i.expirationDate || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${expStatus?.label || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${i.nextServiceDate || '-'}</td>
        <td style="border:1px solid #ddd;padding:8px;">${svcStatus?.label || '-'}</td>
      </tr>`
    }).join('')

    const printContent = `
      <html>
      <head>
        <title>Bakery Inventory Report - ${filterLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #b45309; margin-bottom: 5px; }
          h2 { color: #92400e; margin-top: 0; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #fef3c7; padding: 10px; text-align: left; border: 1px solid #ddd; }
          .flag-low { background: #fef9c3; }
          .flag-out { background: #fee2e2; }
          .flag-expired { background: #fecaca; }
          .flag-service { background: #ffedd5; }
          .summary { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>🏪 Bakery Inventory Report</h1>
        <h2>${filterLabel}</h2>
        <div class="meta">
          <p><strong>Filter:</strong> ${typeLabel}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Items:</strong> ${reportItems.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Item #</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Desired</th>
              <th>Stock Status</th>
              <th>Expiration</th>
              <th>Exp. Status</th>
              <th>Next Service</th>
              <th>Service Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Items in Report:</strong> ${reportItems.length}</p>
          <p><strong>Low Stock:</strong> ${reportItems.filter(i => getStockStatus(i).status === 'low').length}</p>
          <p><strong>Out of Stock:</strong> ${reportItems.filter(i => getStockStatus(i).status === 'out').length}</p>
          <p><strong>Expiring Soon/Expired:</strong> ${reportItems.filter(i => { const e = getExpirationStatus(i); return e && (e.status === 'expired' || e.status === 'expiring-soon') }).length}</p>
          <p><strong>Service Due/Overdue:</strong> ${reportItems.filter(i => { const s = getServiceStatus(i); return s && (s.status === 'overdue' || s.status === 'due-soon') }).length}</p>
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
    const reportItems = getReportItems()
    const headers = ['Name', 'Item Number', 'Type', 'Quantity', 'Desired Stock', 'Stock Status', 'Expiration Date', 'Expiration Status', 'Next Service Date', 'Service Status', 'Purchase Location', 'Website']
    const rows = reportItems.map(i => [
      i.name,
      i.itemNumber,
      i.type,
      i.quantity,
      i.desiredStockLevel || '',
      getStockStatus(i).label,
      i.expirationDate || '',
      getExpirationStatus(i)?.label || '',
      i.nextServiceDate || '',
      getServiceStatus(i)?.label || '',
      i.purchaseLocation || '',
      i.website || ''
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bakery-report-${reportFilter}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const uniqueTypes: string[] = []
  const typesSet = new Set(items.map(i => i.type))
  typesSet.forEach(t => uniqueTypes.push(t))

  const stats = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    lowStock: items.filter(i => getStockStatus(i).status === 'low' || getStockStatus(i).status === 'out').length,
    outOfStock: items.filter(i => getStockStatus(i).status === 'out').length,
    expiringSoon: items.filter(i => {
      const expStatus = getExpirationStatus(i)
      return expStatus && (expStatus.status === 'expired' || expStatus.status === 'expiring-soon')
    }).length,
    serviceDue: items.filter(i => {
      const svcStatus = getServiceStatus(i)
      return svcStatus && (svcStatus.status === 'overdue' || svcStatus.status === 'due-soon')
    }).length,
    byType: uniqueTypes.map(t => ({ type: t, count: items.filter(i => i.type === t).length }))
  }

  const printInventoryReport = () => {
    const printContent = '<html><head><title>Bakery Stock Inventory Report</title></head><body><h1>Bakery Stock Inventory Report</h1><p>Generated: ' + new Date().toLocaleString() + '</p><h2>Summary</h2><p>Total Items: ' + stats.totalItems + '</p><p>Total Quantity: ' + stats.totalQuantity + '</p><p>Low Stock: ' + stats.lowStock + '</p><p>Expiring Soon: ' + stats.expiringSoon + '</p><h2>Items List</h2><table border="1" style="border-collapse: collapse; width: 100%"><tr><th>Name</th><th>Type</th><th>Item #</th><th>Qty</th><th>Expiration</th><th>Next Service</th></tr>' + filteredItems.map(i => '<tr><td>' + i.name + '</td><td>' + i.type + '</td><td>' + i.itemNumber + '</td><td>' + i.quantity + '</td><td>' + (i.expirationDate || 'N/A') + '</td><td>' + (i.nextServiceDate || 'N/A') + '</td></tr>').join('') + '</table></body></html>'
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Item Number', 'Quantity', 'Desired Stock', 'Expiration Date', 'Service Schedule', 'Next Service', 'Purchase Location', 'Website']
    const rows = filteredItems.map(i => [i.name, i.type, i.itemNumber, i.quantity, i.desiredStockLevel, i.expirationDate || '', i.serviceSchedule || '', i.nextServiceDate || '', i.purchaseLocation || '', i.website || ''])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bakery-inventory.csv'
    a.click()
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory List', icon: '📦' },
    { id: 'add', label: 'Add Item', icon: '➕' },
    { id: 'stock', label: 'Stock Management', icon: '📊' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'alerts', label: 'Alerts', icon: '⚠️' },
    { id: 'reorder', label: 'Reorder', icon: '🛒' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'service', label: 'Service Schedule', icon: '🔧' },
    { id: 'stats', label: 'Statistics', icon: '📈' }
  ]

  const reportItems = getReportItems()

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bakery Stock Inventory</h1>
            <p className="opacity-90">Manage bakery equipment, machinery & supplies</p>
          </div>
          <Link href="/" className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-50">
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
                    ? 'bg-yellow-500 text-white' 
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
              <h2 className="text-2xl font-bold">All Items ({items.length})</h2>
              <div className="flex gap-2">
                <button onClick={printInventoryReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                  Print Report
                </button>
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Export CSV
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No items in inventory</p>
                <button onClick={() => setActiveTab('add')} className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg">
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => {
                  const status = getStockStatus(item)
                  const expStatus = getExpirationStatus(item)
                  const serviceStatus = getServiceStatus(item)
                  return (
                    <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${item.quantity === 0 ? 'border-2 border-red-500' : ''}`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.itemNumber}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-600 capitalize">{item.type}</p>
                        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                        
                        {expStatus && (
                          <div className={`px-2 py-1 rounded text-xs font-semibold mb-2 inline-block ${expStatus.color}`}>
                            📅 Expires: {item.expirationDate} ({expStatus.label})
                          </div>
                        )}
                        
                        {serviceStatus && (
                          <div className={`px-2 py-1 rounded text-xs font-semibold mb-2 inline-block ml-2 ${serviceStatus.color}`}>
                            🔧 Service: {item.nextServiceDate} ({serviceStatus.label})
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <p className="font-bold text-xl">Qty: {item.quantity}</p>
                            {item.desiredStockLevel > 0 && (
                              <p className="text-xs text-gray-500">Desired: {item.desiredStockLevel}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {item.weight && <p className="text-sm text-gray-500">{item.weight}kg</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => openItemModal(item)} className="flex-1 bg-purple-500 text-white py-1 rounded hover:bg-purple-600 text-sm">
                            Details
                          </button>
                          <button onClick={() => openStockModal(item, 'add')} className="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm">
                            + Stock
                          </button>
                          <button onClick={() => openStockModal(item, 'remove')} className="flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-sm">
                            - Stock
                          </button>
                          <button onClick={() => openReorderModal(item)} className="flex-1 bg-pink-500 text-white py-1 rounded hover:bg-pink-600 text-sm">
                            🛒 Reorder
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => editItem(item)} className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">
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
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Edit Bakery Item' : 'Add New Bakery Item'}</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Number *</label>
                  <input type="text" value={newItem.itemNumber} onChange={(e) => setNewItem({...newItem, itemNumber: e.target.value})} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={newItem.type} onChange={(e) => setNewItem({...newItem, type: e.target.value})} className="border rounded px-3 py-2 w-full">
                    <option value="machinery">Machinery</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Stock Level</label>
                  <input type="number" value={newItem.desiredStockLevel} onChange={(e) => setNewItem({...newItem, desiredStockLevel: parseInt(e.target.value)})} className="border rounded px-3 py-2 w-full" placeholder="Alert when below this" />
                </div>
                {newItem.type === 'supplies' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input type="date" value={newItem.expirationDate} onChange={(e) => setNewItem({...newItem, expirationDate: e.target.value})} className="border rounded px-3 py-2 w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input type="number" step="0.01" value={newItem.weight} onChange={(e) => setNewItem({...newItem, weight: parseFloat(e.target.value)})} className="border rounded px-3 py-2 w-full" />
                    </div>
                  </>
                )}
                {(newItem.type === 'machinery' || newItem.type === 'equipment') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Schedule</label>
                      <select value={newItem.serviceSchedule} onChange={(e) => setNewItem({...newItem, serviceSchedule: e.target.value})} className="border rounded px-3 py-2 w-full">
                        <option value="">Select schedule</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                      <input type="date" value={newItem.lastServiceDate} onChange={(e) => setNewItem({...newItem, lastServiceDate: e.target.value})} className="border rounded px-3 py-2 w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date</label>
                      <input type="date" value={newItem.nextServiceDate} onChange={(e) => setNewItem({...newItem, nextServiceDate: e.target.value})} className="border rounded px-3 py-2 w-full" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical Store Location</label>
                  <input type="text" value={newItem.purchaseLocation} onChange={(e) => setNewItem({...newItem, purchaseLocation: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="e.g., Sam's Club, Restaurant Supply Co" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website for Reordering</label>
                  <input type="url" value={newItem.website} onChange={(e) => setNewItem({...newItem, website: e.target.value})} className="border rounded px-3 py-2 w-full" placeholder="https://www.example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="border rounded px-3 py-2 w-full" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="border rounded px-3 py-2 w-full" />
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
                    
                    {newItem.metrics && newItem.metrics.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Added Metrics:</p>
                        {newItem.metrics.map((metric, index) => (
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
                <button type="submit" className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 font-medium">
                  {editingItem ? ' Update Item' : 'Add Item'}
                </button>
                {editingItem && (
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
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Current Qty</th>
                    <th className="px-4 py-3 text-left">Desired</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const status = getStockStatus(item)
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.name}<br/><span className="text-sm text-gray-500">{item.itemNumber}</span></td>
                        <td className="px-4 py-3 capitalize">{item.type}</td>
                        <td className="px-4 py-3 font-bold">{item.quantity}</td>
                        <td className="px-4 py-3">{item.desiredStockLevel}</td>
                        <td className="px-4 py-3"><span className={"px-2 py-1 rounded text-xs font-semibold " + status.color}>{status.label}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openStockModal(item, 'add')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">+</button>
                            <button onClick={() => openStockModal(item, 'remove')} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">-</button>
                            <button onClick={() => openReorderModal(item)} className="bg-pink-500 text-white px-3 py-1 rounded text-sm hover:bg-pink-600">Reorder</button>
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
                <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-3 py-2" />
                <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Types</option>
                  {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filters.stockStatus} onChange={(e) => setFilters({...filters, stockStatus: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Status</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="normal">Normal</option>
                  <option value="over">Overstocked</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="number" placeholder="Min Quantity" value={filters.minQuantity} onChange={(e) => setFilters({...filters, minQuantity: e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="Max Quantity" value={filters.maxQuantity} onChange={(e) => setFilters({...filters, maxQuantity: e.target.value})} className="border rounded px-3 py-2" />
                <button onClick={() => {setSearchTerm(''); setFilters({type: '', stockStatus: '', minQuantity: '', maxQuantity: ''})}} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Clear</button>
              </div>
            </div>
            <p className="mb-4">Found: {filteredItems.length} items</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const status = getStockStatus(item)
                return (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{item.name}</h3>
                      <span className={"px-2 py-1 rounded text-xs " + status.color}>{status.label}</span>
                    </div>
                    <p className="text-gray-600">{item.type} - {item.itemNumber}</p>
                    <p>Qty: {item.quantity} | Desired: {item.desiredStockLevel}</p>
                    {item.expirationDate && <p className="text-sm">Exp: {item.expirationDate}</p>}
                    {item.nextServiceDate && <p className="text-sm">Service: {item.nextServiceDate}</p>}
                    <button onClick={() => openReorderModal(item)} className="mt-2 w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
                      🛒 Reorder
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Alerts & Notifications</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">📦 Stock Alerts</h3>
              {stats.lowStock === 0 ? (
                <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg mb-4">
                  All items are properly stocked!
                </div>
              ) : (
                <div className="space-y-4">
                  {items.filter(i => getStockStatus(i).status === 'out' || getStockStatus(i).status === 'low').map(item => {
                    const status = getStockStatus(item)
                    return (
                      <div key={item.id} className={"p-4 rounded-lg border-l-4 " + (status.status === 'out' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500')}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <p>Current: {item.quantity} | Desired: {item.desiredStockLevel}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openStockModal(item, 'add')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                              Add Stock
                            </button>
                            <button onClick={() => openReorderModal(item)} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
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

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">📅 Expiration Alerts (Supplies)</h3>
              {stats.expiringSoon === 0 ? (
                <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg mb-4">
                  No items expiring soon!
                </div>
              ) : (
                <div className="space-y-4">
                  {items.filter(i => {
                    const exp = getExpirationStatus(i)
                    return exp && (exp.status === 'expired' || exp.status === 'expiring-soon' || exp.status === 'expiring')
                  }).map(item => {
                    const expStatus = getExpirationStatus(item)
                    return (
                      <div key={item.id} className={"p-4 rounded-lg border-l-4 " + (expStatus?.status === 'expired' ? 'bg-red-100 border-red-500' : 'bg-orange-100 border-orange-500')}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <p>Expires: {item.expirationDate}</p>
                          </div>
                          <span className={"px-2 py-1 rounded text-xs " + expStatus?.color}>{expStatus?.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">🔧 Service Alerts (Machinery & Equipment)</h3>
              {stats.serviceDue === 0 ? (
                <div className="bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
                  All machinery and equipment are properly serviced!
                </div>
              ) : (
                <div className="space-y-4">
                  {items.filter(i => {
                    const svc = getServiceStatus(i)
                    return svc && (svc.status === 'overdue' || svc.status === 'due-soon')
                  }).map(item => {
                    const svcStatus = getServiceStatus(item)
                    return (
                      <div key={item.id} className={"p-4 rounded-lg border-l-4 " + (svcStatus?.status === 'overdue' ? 'bg-red-100 border-red-500' : 'bg-orange-100 border-orange-500')}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <p>Next Service: {item.nextServiceDate}</p>
                            <p className="text-sm">Schedule: {item.serviceSchedule}</p>
                          </div>
                          <span className={"px-2 py-1 rounded text-xs " + svcStatus?.color}>{svcStatus?.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reorder' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🛒 Reorder Items</h2>
            <p className="text-gray-600 mb-6">Click on an item to see suggested websites for reordering</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => openReorderModal(item)}
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:border-pink-500 border-2 border-transparent transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{item.name}</h3>
                    <span className="text-pink-600">🛒</span>
                  </div>
                  <p className="text-gray-600 capitalize">{item.type}</p>
                  <p className="text-sm text-gray-500">{item.itemNumber}</p>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm font-medium">Current Qty: {item.quantity}</span>
                    <span className="text-pink-600 text-sm font-medium">Click to Find →</span>
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
                    <option value="all">All Items</option>
                    <option value="low-stock">Low Stock Items</option>
                    <option value="out-of-stock">Out of Stock Items</option>
                    <option value="expiring">Expiring Soon / Expired</option>
                    <option value="service-due">Service Due / Overdue</option>
                    <option value="reorder">Items Needing Reorder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                  <select value={reportTypeFilter} onChange={(e) => setReportTypeFilter(e.target.value)} className="border rounded px-3 py-2 w-full">
                    <option value="all">All Types</option>
                    <option value="machinery">Machinery</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
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
                  Report Preview: {reportFilter === 'all' ? 'All Items' : 
                                 reportFilter === 'low-stock' ? 'Low Stock Items' :
                                 reportFilter === 'out-of-stock' ? 'Out of Stock Items' :
                                 reportFilter === 'expiring' ? 'Expiring / Expired Items' :
                                 reportFilter === 'service-due' ? 'Service Due Items' :
                                 reportFilter === 'reorder' ? 'Items Needing Reorder' : 'All Items'}
                  <span className="ml-2 text-gray-500 font-normal">({reportItems.length} items)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Item #</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Qty</th>
                      <th className="px-4 py-3 text-left">Desired</th>
                      <th className="px-4 py-3 text-left">Stock Status</th>
                      <th className="px-4 py-3 text-left">Expiration</th>
                      <th className="px-4 py-3 text-left">Next Service</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportItems.map(item => {
                      const status = getStockStatus(item)
                      const expStatus = getExpirationStatus(item)
                      const svcStatus = getServiceStatus(item)
                      return (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-gray-500">{item.itemNumber}</td>
                          <td className="px-4 py-3 capitalize">{item.type}</td>
                          <td className="px-4 py-3 font-bold">{item.quantity}</td>
                          <td className="px-4 py-3">{item.desiredStockLevel || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {expStatus ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${expStatus.color}`}>
                                {expStatus.label}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {svcStatus ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${svcStatus.color}`}>
                                {svcStatus.label}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openReorderModal(item)} className="bg-pink-500 text-white px-3 py-1 rounded text-sm hover:bg-pink-600">
                              Reorder
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {reportItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No items match the selected filters
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'service' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Service Schedule Management</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Schedule</th>
                    <th className="px-4 py-3 text-left">Last Service</th>
                    <th className="px-4 py-3 text-left">Next Service</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.type === 'machinery' || i.type === 'equipment').map(item => {
                    const svcStatus = getServiceStatus(item)
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">{item.name}<br/><span className="text-sm text-gray-500">{item.itemNumber}</span></td>
                        <td className="px-4 py-3 capitalize">{item.type}</td>
                        <td className="px-4 py-3 capitalize">{item.serviceSchedule || '-'}</td>
                        <td className="px-4 py-3">{item.lastServiceDate || '-'}</td>
                        <td className="px-4 py-3">{item.nextServiceDate || '-'}</td>
                        <td className="px-4 py-3">
                          {svcStatus ? (
                            <span className={"px-2 py-1 rounded text-xs font-semibold " + svcStatus.color}>{svcStatus.label}</span>
                          ) : (
                            <span className="text-gray-500">Not scheduled</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
                <p className="text-gray-500 text-sm">Total Items</p>
                <p className="text-3xl font-bold">{stats.totalItems}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Total Quantity</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalQuantity}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-500 text-sm">Service Due</p>
                <p className="text-3xl font-bold text-purple-600">{stats.serviceDue}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Items by Type</h3>
                {stats.byType.map(t => (
                  <div key={t.type} className="flex justify-between py-2 border-b">
                    <span className="capitalize">{t.type}</span>
                    <span className="font-bold">{t.count} items</span>
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
            <p className="mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transaction Modal */}
      {showStockModal && stockItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {stockChangeType === 'add' ? '➕ Add Stock' : '➖ Remove Stock'}
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2"><span className="font-semibold">Item:</span> {stockItem.name}</p>
              <p className="text-gray-600 mb-4"><span className="font-semibold">Current Quantity:</span> {stockItem.quantity}</p>
              
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
                    ? stockItem.quantity + stockQuantity 
                    : Math.max(0, stockItem.quantity - stockQuantity)
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStockModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"> Cancel</button>
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

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedItem.name}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600"><span className="font-semibold">Item Number:</span> {selectedItem.itemNumber}</p>
              <p className="text-gray-600 capitalize"><span className="font-semibold">Type:</span> {selectedItem.type}</p>
              {selectedItem.description && <p className="text-gray-600"><span className="font-semibold">Description:</span> {selectedItem.description}</p>}
              <p className="text-gray-600"><span className="font-semibold">Quantity:</span> {selectedItem.quantity}</p>
              {selectedItem.desiredStockLevel > 0 && <p className="text-gray-600"><span className="font-semibold">Desired Stock:</span> {selectedItem.desiredStockLevel}</p>}
              {selectedItem.purchaseLocation && <p className="text-gray-600"><span className="font-semibold">Store:</span> {selectedItem.purchaseLocation}</p>}
              {selectedItem.website && <p className="text-gray-600"><span className="font-semibold">Website:</span> {selectedItem.website}</p>}
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold mb-2">Alert Recommendations</h4>
              {selectedItem.type === 'supplies' && selectedItem.expirationDate && (
                <div className="mb-2">
                  <p className="text-sm"><span className="font-semibold">Expiration:</span> {selectedItem.expirationDate}</p>
                  {getExpirationStatus(selectedItem) && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getExpirationStatus(selectedItem)?.color}`}>
                      {getExpirationStatus(selectedItem)?.label}
                    </span>
                  )}
                </div>
              )}
              {(selectedItem.type === 'machinery' || selectedItem.type === 'equipment') && selectedItem.nextServiceDate && (
                <div className="mb-2">
                  <p className="text-sm"><span className="font-semibold">Next Service:</span> {selectedItem.nextServiceDate}</p>
                  <p className="text-sm"><span className="font-semibold">Schedule:</span> {selectedItem.serviceSchedule}</p>
                  {getServiceStatus(selectedItem) && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getServiceStatus(selectedItem)?.color}`}>
                      {getServiceStatus(selectedItem)?.label}
                    </span>
                  )}
                </div>
              )}
              
              <div className="mt-3 p-3 bg-white rounded border">
                {selectedItem.type === 'supplies' && selectedItem.expirationDate && getExpirationStatus(selectedItem)?.status === 'expired' && (
                  <>
                    <p className="text-red-600 font-semibold">⚠️ This item has expired!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Remove from inventory and dispose of properly.</p>
                  </>
                )}
                {selectedItem.type === 'supplies' && selectedItem.expirationDate && getExpirationStatus(selectedItem)?.status === 'expiring-soon' && (
                  <>
                    <p className="text-orange-600 font-semibold">⏰ Expiring Soon!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Use immediately or mark as expired.</p>
                  </>
                )}
                {(selectedItem.type === 'machinery' || selectedItem.type === 'equipment') && getServiceStatus(selectedItem)?.status === 'overdue' && (
                  <>
                    <p className="text-red-600 font-semibold">🔧 Service Overdue!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Schedule service immediately.</p>
                  </>
                )}
                {(selectedItem.type === 'machinery' || selectedItem.type === 'equipment') && getServiceStatus(selectedItem)?.status === 'due-soon' && (
                  <>
                    <p className="text-orange-600 font-semibold">📅 Service Due Soon!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Schedule maintenance.</p>
                  </>
                )}
                {getStockStatus(selectedItem).status === 'low' && (
                  <>
                    <p className="text-yellow-600 font-semibold">📦 Low Stock!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Order more supplies.</p>
                  </>
                )}
                {getStockStatus(selectedItem).status === 'out' && (
                  <>
                    <p className="text-red-600 font-semibold">📦 Out of Stock!</p>
                    <p className="text-sm text-gray-600 mb-2">Recommend: Order more supplies immediately.</p>
                  </>
                )}
                {getStockStatus(selectedItem).status === 'normal' && !(selectedItem.type === 'supplies' && selectedItem.expirationDate && (getExpirationStatus(selectedItem)?.status === 'expired' || getExpirationStatus(selectedItem)?.status === 'expiring-soon')) && !((selectedItem.type === 'machinery' || selectedItem.type === 'equipment') && (getServiceStatus(selectedItem)?.status === 'overdue' || getServiceStatus(selectedItem)?.status === 'due-soon')) && (
                  <p className="text-green-600 font-semibold">✅ All Good - This item is in good condition.</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold mb-2">Update Status</h4>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  value={statusNotes} 
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="border rounded px-3 py-2 w-full" 
                  rows={2}
                  placeholder="Add notes about this status update..."
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateItemStatus('expired')}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Mark as Expired
                </button>
                <button 
                  onClick={() => updateItemStatus('serviced')}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Mark as Serviced
                </button>
                <button 
                  onClick={() => updateItemStatus('active')}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Mark Active
                </button>
              </div>
            </div>

            {selectedItem.status && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm"><span className="font-semibold">Current Status:</span> {selectedItem.status}</p>
                {selectedItem.statusDate && <p className="text-sm"><span className="font-semibold">Status Date:</span> {selectedItem.statusDate}</p>}
                {selectedItem.statusNotes && <p className="text-sm"><span className="font-semibold">Notes:</span> {selectedItem.statusNotes}</p>}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setShowItemModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      {showReorderModal && reorderItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">🛒 Reorder: {reorderItem.name}</h3>
            <p className="text-gray-600 mb-4">
              {reorderItem.type} - {reorderItem.itemNumber}
              {reorderItem.description && ` - ${reorderItem.description}`}
            </p>
            
            {/* Search Query Display */}
            <div className="mb-4 p-3 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-700 font-semibold">Search Query:</p>
              <p className="text-pink-900">
                {reorderItem.name} {reorderItem.type === 'supplies' ? 'bakery supplies' : reorderItem.type === 'equipment' ? 'bakery equipment' : 'bakery machinery'} {reorderItem.description}
              </p>
            </div>

            {/* Custom Website Option */}
            {reorderItem.website && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Saved Website:</p>
                <button 
                  onClick={() => openWebsite(reorderItem.website!)}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  🌐 Visit: {reorderItem.website.replace(/^https?:\/\//, '')}
                </button>
              </div>
            )}

            {/* Physical Store Option */}
            {reorderItem.purchaseLocation && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Physical Store:</p>
                <div className="bg-green-50 border border-green-500 rounded-lg p-3">
                  <p className="text-green-700 font-medium">📍 {reorderItem.purchaseLocation}</p>
                  <p className="text-sm text-gray-600">Visit this store to purchase the item in person</p>
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
