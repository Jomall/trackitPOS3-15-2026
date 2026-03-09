'use client'

import { useState, useEffect } from 'react'

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
  isWeighted?: boolean
  weightUnit?: 'lb' | 'kg' | 'oz' | 'g'
  pricePerWeight?: number
}

interface CartItem {
  id: number
  part: AutoPart
  quantity: number
  unitPrice: number
  subtotal: number
  weight?: number
  isWeightedSale?: boolean
}

interface DailyReport {
  date: string
  totalSales: number
  totalRefunds: number
  totalVoided: number
  totalCancelled: number
  transactionCount: number
  paymentBreakdown: { method: string; total: number }[]
  lastZReportDate?: string
}

interface Transaction {
  id: string
  timestamp: Date
  items: CartItem[]
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  discountType: string | null
  discountValue: number
  totalAmount: number
  paymentMethod: string
  cashTendered: number | null
  changeGiven: number | null
  status: 'completed' | 'voided' | 'cancelled' | 'refunded'
  originalTransactionId?: string
}

interface RefundItem {
  transactionId: string
  partId: number
  partName: string
  quantity: number
  unitPrice: number
  refundQuantity: number
}

// Charge Customer Interfaces
interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  accountNumber?: string
  creditLimit?: number
  currentBalance: number
  createdAt: Date
}

interface ChargeTransaction {
  id: string
  customerId: string
  customerName: string
  customerCompany?: string
  timestamp: Date
  items: CartItem[]
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  discountType: string | null
  discountValue: number
  totalAmount: number
  dueDate?: Date
  status: 'pending' | 'paid' | 'partial' | 'overdue'
  payments: PaymentRecord[]
}

interface PaymentRecord {
  id: string
  amount: number
  date: Date
  method: 'cash' | 'check' | 'card' | 'other'
  notes?: string
}

interface POSComponentProps {
  parts: AutoPart[]
  onCompleteSale: (saleData: any) => void
}

// Sample customers for demo
const sampleCustomers: Customer[] = [
  { id: 'CUST-001', name: 'John Smith', company: 'Smith Auto Repair', email: 'john@smithauto.com', phone: '555-0101', accountNumber: 'ACC1001', creditLimit: 5000, currentBalance: 250, createdAt: new Date('2024-01-15') },
  { id: 'CUST-002', name: 'Mike Johnson', company: 'Johnson Motors', email: 'mike@johnsonmotors.com', phone: '555-0102', accountNumber: 'ACC1002', creditLimit: 10000, currentBalance: 1500, createdAt: new Date('2024-02-20') },
  { id: 'CUST-003', name: 'Sarah Williams', company: 'Williams Garage', email: 'sarah@williamsgarage.com', phone: '555-0103', accountNumber: 'ACC1003', creditLimit: 7500, currentBalance: 0, createdAt: new Date('2024-03-10') },
  { id: 'CUST-004', name: 'Bob Brown', company: 'Brown Trucking', email: 'bob@browntrucking.com', phone: '555-0104', accountNumber: 'ACC1004', creditLimit: 15000, currentBalance: 3200, createdAt: new Date('2024-01-05') },
]

export default function POSComponent({ parts, onCompleteSale }: POSComponentProps) {
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartIdCounter, setCartIdCounter] = useState(1)
  
  // Transaction History State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'voided' | 'cancelled' | 'refunded'>('all')
  
  // Daily Report State
  const [dailyTotals, setDailyTotals] = useState<DailyReport>({
    date: new Date().toLocaleDateString(),
    totalSales: 0,
    totalRefunds: 0,
    totalVoided: 0,
    totalCancelled: 0,
    transactionCount: 0,
    paymentBreakdown: []
  })
  const [lastZReportDate, setLastZReportDate] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState<'x' | 'z'>('x')
  
  // Charge Customer State
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)
  const [chargeTransactions, setChargeTransactions] = useState<ChargeTransaction[]>([])
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showChargeHistoryModal, setShowChargeHistoryModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [dueInDays, setDueInDays] = useState(30)
  
  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    accountNumber: '',
    creditLimit: 0
  })
  
  // Payment on Account State
  const [showPaymentOnAccountModal, setShowPaymentOnAccountModal] = useState(false)
  const [paymentCustomerSearch, setPaymentCustomerSearch] = useState('')
  const [selectedPaymentCustomer, setSelectedPaymentCustomer] = useState<Customer | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check' | 'card'>('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  
  // Refund/Return State
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundSearchQuery, setRefundSearchQuery] = useState('')
  const [selectedRefundItems, setSelectedRefundItems] = useState<RefundItem[]>([])
  const [refundMethod, setRefundMethod] = useState('cash')
  
  // Weighted Item Modal State
  const [showWeightedModal, setShowWeightedModal] = useState(false)
  const [selectedWeightedPart, setSelectedWeightedPart] = useState<AutoPart | null>(null)
  const [weightInput, setWeightInput] = useState('')
  
  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethodState, setPaymentMethodState] = useState('cash')
  const [cashInput, setCashInput] = useState('')
  const [calculatedChange, setCalculatedChange] = useState(0)
  
  // Tax and Discount
  const [taxRate, setTaxRate] = useState(0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | null>(null)
  const [discountValue, setDiscountValue] = useState(0)
  
  // Manual Item Entry
  const [manualItemName, setManualItemName] = useState('')
  const [manualItemPrice, setManualItemPrice] = useState('')
  const [manualItemQty, setManualItemQty] = useState(1)
  const [manualIsWeighted, setManualIsWeighted] = useState(false)
  const [manualWeightUnit, setManualWeightUnit] = useState<'lb' | 'kg' | 'oz' | 'g'>('lb')
  const [manualPricePerWeight, setManualPricePerWeight] = useState('')
  
  // Barcode Search
  const [barcodeInput, setBarcodeInput] = useState('')
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [showItemLookup, setShowItemLookup] = useState(false)
  
  // Filtered parts
  const filteredParts = itemSearchQuery.trim() 
    ? parts.filter(p => 
        p.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        (p.partNumber?.toLowerCase().includes(itemSearchQuery.toLowerCase())) ||
        (p.make?.toLowerCase().includes(itemSearchQuery.toLowerCase())) ||
        (p.model?.toLowerCase().includes(itemSearchQuery.toLowerCase())) ||
        (p.year?.toString().includes(itemSearchQuery)) ||
        (p.description?.toLowerCase().includes(itemSearchQuery.toLowerCase()))
      ).filter(p => p.quantity > 0)
    : []

  // Filter customers
  const filteredCustomers = customerSearchQuery.trim()
    ? customers.filter(c => 
        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        (c.company?.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
        (c.accountNumber?.toLowerCase().includes(customerSearchQuery.toLowerCase()))
      )
    : customers

  // Filter transactions for refund
  const refundSearchResults = refundSearchQuery.trim()
    ? transactions.filter(t => 
        t.status === 'completed' && 
        (t.id.toLowerCase().includes(refundSearchQuery.toLowerCase()) ||
         t.items.some(item => item.part.name.toLowerCase().includes(refundSearchQuery.toLowerCase())))
      )
    : transactions.filter(t => t.status === 'completed').slice(0, 5)

  const filteredTransactions = historyFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === historyFilter)

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => {
    if (item.isWeightedSale && item.weight) {
      return sum + (item.unitPrice * item.weight)
    }
    return sum + item.unitPrice * item.quantity
  }, 0)
  
  const discountAmount = discountType === 'percentage' 
    ? cartTotal * (discountValue / 100) 
    : discountValue
  const subtotalAfterDiscount = cartTotal - discountAmount
  const taxAmount = subtotalAfterDiscount * (taxRate / 100)
  const grandTotal = subtotalAfterDiscount + taxAmount

  const refundTotal = selectedRefundItems.reduce((sum, item) => sum + (item.unitPrice * item.refundQuantity), 0)

  const calculateChange = (cash: number) => {
    if (cash >= grandTotal) setCalculatedChange(cash - grandTotal)
    else setCalculatedChange(0)
  }

  const calculateDailyTotals = (txns: Transaction[], reset: boolean = false) => {
    const today = new Date().toLocaleDateString()
    const todayTransactions = txns.filter(t => 
      t.timestamp.toLocaleDateString() === today && 
      (t.status === 'completed' || t.status === 'refunded' || t.status === 'voided' || t.status === 'cancelled')
    )
    
    const totalSales = todayTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.totalAmount, 0)
    
    const totalRefunds = todayTransactions
      .filter(t => t.status === 'refunded')
      .reduce((sum, t) => sum + t.totalAmount, 0)
    
    const totalVoided = todayTransactions
      .filter(t => t.status === 'voided')
      .reduce((sum, t) => sum + t.totalAmount, 0)
    
    const totalCancelled = todayTransactions
      .filter(t => t.status === 'cancelled')
      .reduce((sum, t) => sum + t.totalAmount, 0)
    
    const transactionCount = todayTransactions.filter(t => t.status === 'completed').length
    
    const paymentMethods = ['cash', 'card', 'check', 'charge']
    const paymentBreakdown = paymentMethods.map(method => ({
      method,
      total: todayTransactions
        .filter(t => t.status === 'completed' && t.paymentMethod === method)
        .reduce((sum, t) => sum + t.totalAmount, 0)
    }))
    
    return {
      date: today,
      totalSales,
      totalRefunds,
      totalVoided,
      totalCancelled,
      transactionCount,
      paymentBreakdown,
      lastZReportDate: reset ? today : lastZReportDate
    }
  }

  useEffect(() => {
    setDailyTotals(calculateDailyTotals(transactions))
  }, [transactions])

  const addToCart = (part: AutoPart, quantity: number = 1, weight?: number, isWeighted: boolean = false) => {
    if (isWeighted && weight && part.pricePerWeight) {
      const subtotal = part.pricePerWeight * weight
      const newItem: CartItem = {
        id: cartIdCounter,
        part,
        quantity: 1,
        unitPrice: part.pricePerWeight,
        subtotal,
        weight,
        isWeightedSale: true
      }
      setCart([...cart, newItem])
      setCartIdCounter(cartIdCounter + 1)
    } else {
      const existingItem = cart.find(item => item.part.id === part.id && !item.isWeightedSale)
      if (existingItem) {
        setCart(cart.map(item => 
          item.part.id === part.id && !item.isWeightedSale
            ? { ...item, quantity: item.quantity + quantity, subtotal: item.unitPrice * (item.quantity + quantity) }
            : item
        ))
      } else {
        const newItem: CartItem = {
          id: cartIdCounter,
          part,
          quantity,
          unitPrice: part.price || 0,
          subtotal: (part.price || 0) * quantity
        }
        setCart([...cart, newItem])
        setCartIdCounter(cartIdCounter + 1)
      }
    }
  }

  const openWeightedModal = (part: AutoPart) => {
    if (part.isWeighted && part.pricePerWeight) {
      setSelectedWeightedPart(part)
      setWeightInput('')
      setShowWeightedModal(true)
    } else {
      addToCart(part, 1)
    }
  }

  const addWeightedItem = () => {
    if (!selectedWeightedPart || !selectedWeightedPart.pricePerWeight) return
    
    const weight = parseFloat(weightInput)
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight')
      return
    }
    
    addToCart(selectedWeightedPart, 1, weight, true)
    setShowWeightedModal(false)
    setSelectedWeightedPart(null)
    setWeightInput('')
  }

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newSubtotal = item.isWeightedSale 
          ? item.unitPrice * (item.weight || 0) * quantity
          : item.unitPrice * quantity
        return { ...item, quantity, subtotal: newSubtotal }
      }
      return item
    }))
  }

  const updateWeight = (itemId: number, newWeight: number) => {
    if (newWeight <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(cart.map(item => {
      if (item.id === itemId && item.isWeightedSale) {
        return { ...item, weight: newWeight, subtotal: item.unitPrice * newWeight }
      }
      return item
    }))
  }

  const voidSale = () => {
    if (cart.length === 0) return
    
    const voidTransaction: Transaction = {
      id: `VOID-${Date.now()}`,
      timestamp: new Date(),
      items: [...cart],
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      paymentMethod: 'void',
      cashTendered: null,
      changeGiven: null,
      status: 'voided'
    }
    
    setTransactions([voidTransaction, ...transactions])
    setCart([])
    setDiscountType(null)
    setDiscountValue(0)
    setTaxRate(0)
  }

  const cancelTransaction = (transactionId: string) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'cancelled' as const }
        : t
    ))
  }

  const addManualItem = () => {
    if (!manualItemName.trim()) {
      alert('Please enter item name')
      return
    }
    
    if (manualIsWeighted) {
      const pricePerWeight = parseFloat(manualPricePerWeight)
      if (isNaN(pricePerWeight) || pricePerWeight <= 0) {
        alert('Please enter a valid price per weight')
        return
      }
      
      const manualPart: AutoPart = {
        id: Date.now(),
        name: manualItemName.trim(),
        quantity: 999,
        price: pricePerWeight,
        isWeighted: true,
        weightUnit: manualWeightUnit,
        pricePerWeight: pricePerWeight
      }
      
      setSelectedWeightedPart(manualPart)
      setWeightInput('')
      setShowWeightedModal(true)
    } else {
      const price = parseFloat(manualItemPrice) || 0
      if (price <= 0) {
        alert('Please enter a valid price')
        return
      }
      
      const manualPart: AutoPart = {
        id: Date.now(),
        name: manualItemName.trim(),
        quantity: 999,
        price: price
      }
      
      addToCart(manualPart, manualItemQty)
    }
    
    setManualItemName('')
    setManualItemPrice('')
    setManualItemQty(1)
    setManualIsWeighted(false)
    setManualPricePerWeight('')
  }

  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      const part = parts.find(p => 
        p.partNumber?.toLowerCase() === barcodeInput.toLowerCase() || 
        p.name.toLowerCase().includes(barcodeInput.toLowerCase())
      )
      if (part) {
        if (part.isWeighted && part.pricePerWeight) {
          openWeightedModal(part)
        } else {
          addToCart(part, 1)
        }
      } else {
        alert('Part not found')
      }
      setBarcodeInput('')
    }
  }

  const handleItemSelect = (part: AutoPart) => {
    if (part.isWeighted && part.pricePerWeight) {
      openWeightedModal(part)
    } else {
      addToCart(part, 1)
    }
    setShowItemLookup(false)
    setItemSearchQuery('')
  }

  const quickAmounts = [1, 5, 10, 20, 50, 100]

  // Process charge to customer account
  const processChargeToAccount = () => {
    if (!selectedCustomer) {
      alert('Please select a customer')
      return
    }
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueInDays)

    const chargeTransaction: ChargeTransaction = {
      id: `CHARGE-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerCompany: selectedCustomer.company,
      timestamp: new Date(),
      items: [...cart],
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      dueDate,
      status: 'pending',
      payments: []
    }

    // Update customer balance
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, currentBalance: c.currentBalance + grandTotal }
        : c
    ))

    setChargeTransactions([chargeTransaction, ...chargeTransactions])
    
    // Also add to main transactions for history and reports
    const completedTransaction: Transaction = {
      id: `CHARGE-${Date.now()}`,
      timestamp: new Date(),
      items: [...cart],
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      paymentMethod: 'charge',
      cashTendered: null,
      changeGiven: null,
      status: 'completed'
    }
    setTransactions([completedTransaction, ...transactions])
    
    onCompleteSale({
      items: cart.map(item => ({ 
        autoPartId: item.part.id, 
        quantity: item.isWeightedSale ? (item.weight || 0) : item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        isWeighted: item.isWeightedSale,
        weight: item.weight,
        weightUnit: item.part.weightUnit
      })),
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      paymentMethod: 'charge',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name
    })

    // Reset
    setCart([])
    setDiscountType(null)
    setDiscountValue(0)
    setTaxRate(0)
    setSelectedCustomer(null)
    setShowChargeModal(false)
    
    alert(`Charge of $${grandTotal.toFixed(2)} added to ${selectedCustomer.name}'s account! Due: ${dueDate.toLocaleDateString()}`)
  }

  // Process payment on account
  const processPaymentOnAccount = () => {
    if (!selectedPaymentCustomer) {
      alert('Please select a customer')
      return
    }
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    const paymentRecord: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      amount,
      date: new Date(),
      method: paymentMethod,
      notes: paymentNotes
    }

    // Update charge transactions
    setChargeTransactions(chargeTransactions.map(ct => {
      if (ct.customerId === selectedPaymentCustomer.id && ct.status !== 'paid') {
        const newBalance = ct.totalAmount - ct.payments.reduce((sum, p) => sum + p.amount, 0) - amount
        return {
          ...ct,
          payments: [...ct.payments, paymentRecord],
          status: newBalance <= 0 ? 'paid' : 'partial' as const
        }
      }
      return ct
    }))

    // Update customer balance
    setCustomers(customers.map(c => 
      c.id === selectedPaymentCustomer.id 
        ? { ...c, currentBalance: Math.max(0, c.currentBalance - amount) }
        : c
    ))

    alert(`Payment of $${amount.toFixed(2)} recorded for ${selectedPaymentCustomer.name}`)
    
    // Reset
    setSelectedPaymentCustomer(null)
    setPaymentAmount('')
    setPaymentMethod('cash')
    setPaymentNotes('')
    setShowPaymentOnAccountModal(false)
  }

  // Add new customer
  const addNewCustomer = () => {
    if (!newCustomer.name.trim()) {
      alert('Please enter customer name')
      return
    }

    const customer: Customer = {
      id: `CUST-${Date.now()}`,
      name: newCustomer.name,
      company: newCustomer.company,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      accountNumber: newCustomer.accountNumber || `ACC${Date.now().toString().slice(-4)}`,
      creditLimit: newCustomer.creditLimit,
      currentBalance: 0,
      createdAt: new Date()
    }

    setCustomers([...customers, customer])
    setNewCustomer({ name: '', company: '', email: '', phone: '', address: '', accountNumber: '', creditLimit: 0 })
    setShowCustomerModal(false)
    alert(`Customer ${customer.name} added successfully!`)
  }

  const processPayment = () => {
    if (cart.length === 0) return
    
    const cashTendered = parseFloat(cashInput) || 0
    const saleData = {
      items: cart.map(item => ({ 
        autoPartId: item.part.id, 
        quantity: item.isWeightedSale ? (item.weight || 0) : item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        isWeighted: item.isWeightedSale,
        weight: item.weight,
        weightUnit: item.part.weightUnit
      })),
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      paymentMethod: paymentMethodState,
      cashTendered: paymentMethodState === 'cash' ? cashTendered : null,
      changeGiven: paymentMethodState === 'cash' ? calculatedChange : null
    }
    
    const completedTransaction: Transaction = {
      id: `SALE-${Date.now()}`,
      timestamp: new Date(),
      items: [...cart],
      subtotal: cartTotal,
      taxAmount,
      taxRate,
      discountAmount,
      discountType,
      discountValue,
      totalAmount: grandTotal,
      paymentMethod: paymentMethodState,
      cashTendered: paymentMethodState === 'cash' ? cashTendered : null,
      changeGiven: paymentMethodState === 'cash' ? calculatedChange : null,
      status: 'completed'
    }
    
    setTransactions([completedTransaction, ...transactions])
    onCompleteSale(saleData)
    
    setCart([])
    setDiscountType(null)
    setDiscountValue(0)
    setTaxRate(0)
    setCashInput('')
    setCalculatedChange(0)
    setShowPaymentModal(false)
  }

  const processRefund = () => {
    if (selectedRefundItems.length === 0) {
      alert('Please select items to refund')
      return
    }

    const refundTransaction: Transaction = {
      id: `REFUND-${Date.now()}`,
      timestamp: new Date(),
      items: selectedRefundItems.map(item => ({
        id: Date.now() + Math.random(),
        part: {
          id: item.partId,
          name: item.partName,
          quantity: item.refundQuantity
        },
        quantity: item.refundQuantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.refundQuantity
      })),
      subtotal: refundTotal,
      taxAmount: 0,
      taxRate: 0,
      discountAmount: 0,
      discountType: null,
      discountValue: 0,
      totalAmount: refundTotal,
      paymentMethod: refundMethod,
      cashTendered: refundMethod === 'cash' ? refundTotal : null,
      changeGiven: 0,
      status: 'refunded',
      originalTransactionId: selectedRefundItems[0]?.transactionId
    }

    setTransactions([refundTransaction, ...transactions])
    
    setShowRefundModal(false)
    setRefundSearchQuery('')
    setSelectedRefundItems([])
    setRefundMethod('cash')
    
    alert(`Refund of $${refundTotal.toFixed(2)} processed successfully!`)
  }

  const toggleRefundItem = (transactionId: string, partId: number, partName: string, quantity: number, unitPrice: number) => {
    const existingIndex = selectedRefundItems.findIndex(
      item => item.transactionId === transactionId && item.partId === partId
    )

    if (existingIndex >= 0) {
      setSelectedRefundItems(selectedRefundItems.filter((_, index) => index !== existingIndex))
    } else {
      setSelectedRefundItems([...selectedRefundItems, {
        transactionId,
        partId,
        partName,
        quantity,
        unitPrice,
        refundQuantity: 1
      }])
    }
  }

  const updateRefundQuantity = (transactionId: string, partId: number, newQty: number) => {
    if (newQty < 1) return
    setSelectedRefundItems(selectedRefundItems.map(item => 
      item.transactionId === transactionId && item.partId === partId
        ? { ...item, refundQuantity: Math.min(newQty, item.quantity) }
        : item
    ))
  }

  const printReceipt = () => {
    const receiptContent = `
      <html>
      <head><title>Receipt</title></head>
      <body style="font-family: monospace; padding: 20px; max-width: 300px;">
        <h2 style="text-align: center;">🧾 RECEIPT</h2>
        <hr/>
        <p>Date: ${new Date().toLocaleString()}</p>
        <hr/>
        <table style="width: 100%;">
          ${cart.map(item => `
            <tr>
              <td>${item.part.name} ${item.isWeightedSale ? `(${item.weight?.toFixed(2)} ${item.part.weightUnit})` : `x${item.quantity}`}</td>
              <td style="text-align: right;">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <hr/>
        <p>Subtotal: $${cartTotal.toFixed(2)}</p>
        ${discountAmount > 0 ? `<p style="color: red;">Discount: -$${discountAmount.toFixed(2)}</p>` : ''}
        ${taxAmount > 0 ? `<p>Tax: $${taxAmount.toFixed(2)}</p>` : ''}
        <p style="font-weight: bold; font-size: 18px;">TOTAL: $${grandTotal.toFixed(2)}</p>
        <hr/>
        <p>Payment: ${paymentMethodState}</p>
        ${paymentMethodState === 'cash' ? `<p>Cash Tendered: $${parseFloat(cashInput || '0').toFixed(2)}</p><p>Change: $${calculatedChange.toFixed(2)}</p>` : ''}
        <hr/>
        <p style="text-align: center;">Thank you!</p>
      </body>
      </html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(receiptContent)
      win.document.close()
      win.print()
    }
  }

  const printChargeReceipt = () => {
    if (!selectedCustomer) return
    const receiptContent = `
      <html>
      <head><title>Charge Receipt</title></head>
      <body style="font-family: monospace; padding: 20px; max-width: 300px;">
        <h2 style="text-align: center;">📋 CHARGE RECEIPT</h2>
        <hr/>
        <p>Date: ${new Date().toLocaleString()}</p>
        <p>Due Date: ${new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        <hr/>
        <p><strong>Charge To:</strong></p>
        <p>${selectedCustomer.name}</p>
        <p>${selectedCustomer.company || ''}</p>
        <p>Account: ${selectedCustomer.accountNumber}</p>
        <hr/>
        <table style="width: 100%;">
          ${cart.map(item => `
            <tr>
              <td>${item.part.name} ${item.isWeightedSale ? `(${item.weight?.toFixed(2)} ${item.part.weightUnit})` : `x${item.quantity}`}</td>
              <td style="text-align: right;">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <hr/>
        <p>Subtotal: $${cartTotal.toFixed(2)}</p>
        ${discountAmount > 0 ? `<p style="color: red;">Discount: -$${discountAmount.toFixed(2)}</p>` : ''}
        ${taxAmount > 0 ? `<p>Tax: $${taxAmount.toFixed(2)}</p>` : ''}
        <p style="font-weight: bold; font-size: 18px;">CHARGE TOTAL: $${grandTotal.toFixed(2)}</p>
        <hr/>
        <p style="text-align: center;">Thank you!</p>
      </body>
      </html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(receiptContent)
      win.document.close()
      win.print()
    }
  }

  const printReport = (isZReport: boolean) => {
    const currentTotals = calculateDailyTotals(transactions, isZReport)
    const chargeTotal = currentTotals.paymentBreakdown.find(p => p.method === 'charge')?.total || 0
    const netTotal = currentTotals.totalSales - currentTotals.totalRefunds - currentTotals.totalVoided - currentTotals.totalCancelled
    
    if (isZReport) {
      setLastZReportDate(currentTotals.date)
    }
    
    const reportContent = `
      <html>
      <head><title>${isZReport ? 'Z-Report' : 'X-Report'}</title></head>
      <body style="font-family: monospace; padding: 20px; max-width: 350px;">
        <h2 style="text-align: center;">📊 ${isZReport ? 'Z-Report' : 'X-Report'}</h2>
        <p style="text-align: center;">${isZReport ? 'End of Day' : 'Mid-Day'} Report</p>
        <hr/>
        <p><strong>Date:</strong> ${currentTotals.date}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
        ${lastZReportDate && isZReport ? `<p><strong>Last Z-Report:</strong> ${lastZReportDate}</p>` : ''}
        <hr/>
        <h3>Sales Summary</h3>
        <table style="width: 100%;">
          <tr><td>Completed Sales:</td><td style="text-align: right;">${currentTotals.transactionCount}</td></tr>
          <tr><td>Total Sales (Cash/Card/Check):</td><td style="text-align: right;">$${currentTotals.totalSales.toFixed(2)}</td></tr>
          <tr><td>Refunds:</td><td style="text-align: right; color: red;">-$${currentTotals.totalRefunds.toFixed(2)}</td></tr>
          <tr><td>Voided:</td><td style="text-align: right; color: red;">-$${currentTotals.totalVoided.toFixed(2)}</td></tr>
          <tr><td>Cancelled:</td><td style="text-align: right; color: red;">-$${currentTotals.totalCancelled.toFixed(2)}</td></tr>
        </table>
        <hr/>
        <p style="font-size: 18px;"><strong>NET TOTAL: $${netTotal.toFixed(2)}</strong></p>
        <hr/>
        <h3>Payment Breakdown</h3>${chargeTotal > 0 ? `<tr><td>Charge (On Account):</td><td style="text-align: right;">$${chargeTotal.toFixed(2)}</td></tr>` : ''}
        <table style="width: 100%;">
          ${currentTotals.paymentBreakdown.map(p => `
            <tr><td>${p.method.charAt(0).toUpperCase() + p.method.slice(1)}:</td><td style="text-align: right;">$${p.total.toFixed(2)}</td></tr>
          `).join('')}
        </table>
        <hr/>
        ${isZReport ? '<p style="text-align: center; color: red;"><strong>*** Z-REPORT - TOTALS RESET ***</strong></p>' : ''}
        <p style="text-align: center;">Report Generated: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `
    
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(reportContent)
      win.document.close()
      win.print()
    }
  }

  const processZReport = () => {
    printReport(true)
    alert('Z-Report printed and daily totals have been reset!')
    setShowReportModal(false)
  }

  const printTransactionReceipt = (transaction: Transaction) => {
    const receiptContent = `
      <html>
      <head><title>${transaction.status === 'voided' ? 'VOIDED' : transaction.status === 'cancelled' ? 'CANCELLED' : transaction.status === 'refunded' ? 'REFUND' : 'REPRINT'} Receipt</title></head>
      <body style="font-family: monospace; padding: 20px; max-width: 300px;">
        <h2 style="text-align: center;">🧾 ${transaction.status === 'voided' ? 'VOIDED' : transaction.status === 'cancelled' ? 'CANCELLED' : transaction.status === 'refunded' ? 'REFUND' : 'REPRINT'} RECEIPT</h2>
        <p style="text-align: center; color: ${transaction.status === 'completed' ? 'green' : 'red'};">${transaction.status.toUpperCase()}</p>
        <hr/>
        <p>Date: ${transaction.timestamp.toLocaleString()}</p>
        <p>Transaction ID: ${transaction.id}</p>
        ${transaction.originalTransactionId ? `<p>Original Trans: ${transaction.originalTransactionId}</p>` : ''}
        <hr/>
        <table style="width: 100%;">
          ${transaction.items.map(item => `
            <tr>
              <td>${item.part.name} ${item.isWeightedSale ? `(${item.weight?.toFixed(2)} ${item.part.weightUnit})` : `x${item.quantity}`}</td>
              <td style="text-align: right;">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <hr/>
        <p>Subtotal: $${transaction.subtotal.toFixed(2)}</p>
        ${transaction.discountAmount > 0 ? `<p style="color: red;">Discount: -$${transaction.discountAmount.toFixed(2)}</p>` : ''}
        ${transaction.taxAmount > 0 ? `<p>Tax: $${transaction.taxAmount.toFixed(2)}</p>` : ''}
        <p style="font-weight: bold; font-size: 18px;">TOTAL: $${transaction.totalAmount.toFixed(2)}</p>
        <hr/>
        <p>Payment: ${transaction.paymentMethod}</p>
        ${transaction.paymentMethod === 'cash' ? `<p>Cash Tendered: $${(transaction.cashTendered || 0).toFixed(2)}</p><p>Change: $${(transaction.changeGiven || 0).toFixed(2)}</p>` : ''}
        <hr/>
        <p style="text-align: center;">Thank you!</p>
      </body>
      </html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(receiptContent)
      win.document.close()
      win.print()
    }
  }

  // Calculate totals for reports
  const totalSales = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.totalAmount, 0)
  const totalRefunds = transactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.totalAmount, 0)
  const totalVoided = transactions.filter(t => t.status === 'voided').reduce((sum, t) => sum + t.totalAmount, 0)
  const totalCancelled = transactions.filter(t => t.status === 'cancelled').reduce((sum, t) => sum + t.totalAmount, 0)
  const transactionCount = transactions.filter(t => t.status === 'completed').length

  // Calculate charge account totals
  const totalCharged = chargeTransactions.reduce((sum, ct) => sum + ct.totalAmount, 0)
  const totalPaid = chargeTransactions.reduce((sum, ct) => sum + ct.payments.reduce((pSum, p) => pSum + p.amount, 0), 0)
  const totalOutstanding = totalCharged - totalPaid

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Product Selection */}
      <div className="lg:col-span-2">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Scan barcode or enter part number..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowItemLookup(!showItemLookup)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
            >
              🔍 Item Lookup
            </button>
            <button
              onClick={() => setShowChargeModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
            >
              💳 Charge to Account
            </button>
            <button
              onClick={() => setShowPaymentOnAccountModal(true)}
              className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 flex items-center gap-2"
            >
              💰 Payment on Account
            </button>
            <button
              onClick={() => setShowChargeHistoryModal(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex items-center gap-2"
            >
              📋 Charge History
              {chargeTransactions.length > 0 && (
                <span className="bg-white text-indigo-600 px-2 rounded-full text-xs">${totalOutstanding.toFixed(2)}</span>
              )}
            </button>
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              📋 Transactions
            </button>
            <button
              onClick={() => setShowRefundModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
            >
              ↩️ Refund
            </button>
            <button
              onClick={() => { setReportType('x'); setShowReportModal(true); }}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 flex items-center gap-2"
            >
              📊 X-Report
            </button>
            <button
              onClick={() => { setReportType('z'); setShowReportModal(true); }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              📊 Z-Report
            </button>
            {showItemLookup && (
              <input
                type="text"
                placeholder="Search by name, make, model..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="flex-1 border border-purple-300 rounded px-3 py-2"
                autoFocus
              />
            )}
          </div>
          
          {/* Item Lookup Results */}
          {showItemLookup && itemSearchQuery.trim() && (
            <div className="mt-3 border rounded-lg max-h-60 overflow-y-auto bg-gray-50">
              {filteredParts.length === 0 ? (
                <p className="p-3 text-gray-500 text-center">No items found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">Name</th>
                      <th className="px-3 py-2 text-left text-sm">Make/Model</th>
                      <th className="px-3 py-2 text-right text-sm">Price</th>
                      <th className="px-3 py-2 text-center text-sm">Type</th>
                      <th className="px-3 py-2 text-center text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.slice(0, 10).map(part => (
                      <tr key={part.id} className="border-t hover:bg-white">
                        <td className="px-3 py-2 text-sm">{part.name}</td>
                        <td className="px-3 py-2 text-sm">{part.make} {part.model}</td>
                        <td className="px-3 py-2 text-sm text-right font-bold">
                          ${part.isWeighted && part.pricePerWeight ? `${part.pricePerWeight.toFixed(2)}/${part.weightUnit}` : (part.price || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-sm text-center">
                          {part.isWeighted ? <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">⚖️</span> : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Each</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => handleItemSelect(part)} className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600">Add</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Transaction History Panel */}
        {showTransactionHistory && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="font-bold text-lg mb-4">📋 Transaction History</h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Completed</p>
                <p className="font-bold text-green-600">${totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Refunded</p>
                <p className="font-bold text-orange-600">${totalRefunds.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Voided</p>
                <p className="font-bold text-red-600">${totalVoided.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="font-bold text-yellow-600">${totalCancelled.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">Net Total</p>
                <p className="font-bold text-blue-600">${(totalSales - totalRefunds - totalVoided - totalCancelled).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'completed', 'refunded', 'voided', 'cancelled'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    historyFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter} ({filter === 'all' ? transactions.length : transactions.filter(t => t.status === filter).length})
                </button>
              ))}
            </div>

            <div className="border rounded-lg max-h-80 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">No transactions found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">ID</th>
                      <th className="px-3 py-2 text-left text-sm">Date/Time</th>
                      <th className="px-3 py-2 text-right text-sm">Total</th>
                      <th className="px-3 py-2 text-left text-sm">Payment</th>
                      <th className="px-3 py-2 text-center text-sm">Status</th>
                      <th className="px-3 py-2 text-center text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs font-mono">{transaction.id}</td>
                        <td className="px-3 py-2 text-sm">{transaction.timestamp.toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-right font-bold">${transaction.totalAmount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm capitalize">{transaction.paymentMethod}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                            transaction.status === 'voided' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => printTransactionReceipt(transaction)} className="text-blue-600 hover:text-blue-800 text-sm mr-2">🖨️</button>
                          {transaction.status === 'completed' && (
                            <button onClick={() => cancelTransaction(transaction.id)} className="text-red-600 hover:text-red-800 text-sm">❌</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Manual Item Entry */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold mb-2">Manual Item Entry</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="manualIsWeighted"
                checked={manualIsWeighted}
                onChange={(e) => setManualIsWeighted(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="manualIsWeighted" className="text-sm">⚖️ Sell by weight</label>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <input type="text" placeholder="Item Name" value={manualItemName} onChange={(e) => setManualItemName(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              
              {manualIsWeighted ? (
                <>
                  <input type="number" placeholder={`Price per ${manualWeightUnit}`} value={manualPricePerWeight} onChange={(e) => setManualPricePerWeight(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                  <select value={manualWeightUnit} onChange={(e) => setManualWeightUnit(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                    <option value="lb">per lb</option>
                    <option value="kg">per kg</option>
                    <option value="oz">per oz</option>
                    <option value="g">per g</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="number" placeholder="Price" value={manualItemPrice} onChange={(e) => setManualItemPrice(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                  <input type="number" placeholder="Qty" value={manualItemQty} onChange={(e) => setManualItemQty(parseInt(e.target.value) || 1)} className="border rounded px-2 py-1 text-sm" min="1" />
                </>
              )}
              
              <button onClick={addManualItem} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Add</button>
            </div>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-3">Inventory Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {parts.filter(p => p.quantity > 0).map(part => (
              <button
                key={part.id}
                onClick={() => openWeightedModal(part)}
                className="border rounded p-3 text-left hover:bg-gray-50 hover:border-blue-500 transition-all"
              >
                <p className="font-medium text-sm truncate">{part.name}</p>
                <p className="text-xs text-gray-500">{part.partNumber || part.make}</p>
                <p className="font-bold text-green-600">
                  {part.isWeighted && part.pricePerWeight ? `$${part.pricePerWeight.toFixed(2)}/${part.weightUnit}` : `$${(part.price || 0).toFixed(2)}`}
                </p>
                {part.isWeighted && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">⚖️</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="bg-white p-4 rounded-lg shadow-md h-fit">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Current Sale</h3>
          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{cart.length} items</span>
        </div>

        {/* Cart Items */}
        <div className="border rounded mb-4 max-h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items in cart</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 border-b">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.part.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.isWeightedSale ? `$${item.unitPrice.toFixed(2)}/${item.part.weightUnit} × ${item.weight?.toFixed(2)} ${item.part.weightUnit}` : `$${item.unitPrice.toFixed(2)} × ${item.quantity}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.isWeightedSale ? (
                    <div className="flex items-center">
                      <button onClick={() => updateWeight(item.id, (item.weight || 0) - 0.1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                      <span className="mx-2 text-sm">{item.weight?.toFixed(2)} {item.part.weightUnit}</span>
                      <button onClick={() => updateWeight(item.id, (item.weight || 0) + 0.1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                      <span className="mx-2 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                    </div>
                  )}
                  <span className="font-bold text-sm w-16 text-right">${item.subtotal.toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tax and Discount */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <input type="number" placeholder="Tax %" value={taxRate || ''} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="border rounded px-2 py-1 text-sm w-20" />
            <select value={discountType || ''} onChange={(e) => setDiscountType(e.target.value as any || null)} className="border rounded px-2 py-1 text-sm">
              <option value="">Discount</option>
              <option value="percentage">% Off</option>
              <option value="fixed">$ Off</option>
            </select>
            <input type="number" placeholder="Value" value={discountValue || ''} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} disabled={!discountType} className="border rounded px-2 py-1 text-sm flex-1 disabled:opacity-50" />
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal:</span><span>${cartTotal.toFixed(2)}</span></div>
          {discountAmount > 0 && <div className="flex justify-between text-sm text-red-500"><span>Discount:</span><span>-${discountAmount.toFixed(2)}</span></div>}
          {taxAmount > 0 && <div className="flex justify-between text-sm"><span>Tax ({taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-xl font-bold"><span>Total:</span><span className="text-green-600">${grandTotal.toFixed(2)}</span></div>
        </div>

        {/* Checkout Buttons */}
        <div className="mt-4 space-y-2">
          <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed">CHECKOUT</button>
          <div className="flex gap-2">
            <button onClick={voidSale} disabled={cart.length === 0} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-300">VOID</button>
            <button onClick={() => setCart([])} disabled={cart.length === 0} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-300">CLEAR</button>
          </div>
        </div>
      </div>

      {/* Weighted Item Modal */}
      {showWeightedModal && selectedWeightedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">⚖️ Enter Weight</h3>
            <div className="mb-4">
              <p className="font-medium mb-2">{selectedWeightedPart.name}</p>
              <p className="text-sm text-gray-600 mb-4">Price: ${selectedWeightedPart.pricePerWeight?.toFixed(2)} per {selectedWeightedPart.weightUnit}</p>
              <label className="block text-sm font-medium mb-2">Enter weight in {selectedWeightedPart.weightUnit}:</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="flex-1 border rounded px-3 py-2 text-lg font-mono" placeholder="0.00" autoFocus />
                <span className="flex items-center text-lg font-medium">{selectedWeightedPart.weightUnit}</span>
              </div>
              {weightInput && !isNaN(parseFloat(weightInput)) && parseFloat(weightInput) > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Calculated Price:</p>
                  <p className="text-2xl font-bold text-green-600">${(parseFloat(weightInput) * (selectedWeightedPart.pricePerWeight || 0)).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={addWeightedItem} disabled={!weightInput || isNaN(parseFloat(weightInput)) || parseFloat(weightInput) <= 0} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300">Add to Cart</button>
              <button onClick={() => { setShowWeightedModal(false); setSelectedWeightedPart(null); setWeightInput(''); }} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Charge to Account Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-indigo-600">💳 Charge to Customer Account</h3>
            
            {/* Customer Selection */}
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Search customers by name, company, or account #..." value={customerSearchQuery} onChange={(e) => setCustomerSearchQuery(e.target.value)} className="flex-1 border rounded px-3 py-2" />
                <button onClick={() => setShowCustomerModal(true)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">+ New</button>
              </div>
              
              <div className="border rounded max-h-48 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No customers found</p>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredCustomers.map(customer => (
                      <div key={customer.id} className={`p-3 border rounded cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'}`} onClick={() => setSelectedCustomer(customer)}>
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.company}</p>
                            <p className="text-xs text-gray-500">Account: {customer.accountNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">Balance: ${customer.currentBalance.toFixed(2)}</p>
                            {customer.creditLimit && <p className="text-xs text-gray-500">Credit: ${customer.creditLimit.toFixed(2)}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Due In:</label>
              <select value={dueInDays} onChange={(e) => setDueInDays(parseInt(e.target.value))} className="border rounded px-3 py-2 w-full">
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                <p className="font-bold">Charge To:</p>
                <p>{selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                <p className="text-sm">Account: {selectedCustomer.accountNumber}</p>
                <p className="text-sm">Due: {new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold mb-2">Order Summary:</p>
              <p>Items: {cart.length}</p>
              <p>Subtotal: ${cartTotal.toFixed(2)}</p>
              {discountAmount > 0 && <p className="text-red-500">Discount: -${discountAmount.toFixed(2)}</p>}
              {taxAmount > 0 && <p>Tax: ${taxAmount.toFixed(2)}</p>}
              <p className="font-bold text-lg">Total to Charge: ${grandTotal.toFixed(2)}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { processChargeToAccount(); printChargeReceipt(); }} disabled={!selectedCustomer || cart.length === 0} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-300">Process Charge</button>
              <button onClick={() => { setShowChargeModal(false); setSelectedCustomer(null); setCustomerSearchQuery(''); }} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-green-600">➕ Add New Customer</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Customer Name *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="Company" value={newCustomer.company} onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="email" placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="tel" placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="Account Number (optional)" value={newCustomer.accountNumber} onChange={(e) => setNewCustomer({...newCustomer, accountNumber: e.target.value})} className="w-full border rounded px-3 py-2" />
              <input type="number" placeholder="Credit Limit" value={newCustomer.creditLimit || ''} onChange={(e) => setNewCustomer({...newCustomer, creditLimit: parseFloat(e.target.value) || 0})} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addNewCustomer} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600">Save Customer</button>
              <button onClick={() => { setShowCustomerModal(false); setNewCustomer({ name: '', company: '', email: '', phone: '', address: '', accountNumber: '', creditLimit: 0 }); }} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment on Account Modal */}
      {showPaymentOnAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-cyan-600">💰 Payment on Account</h3>
            
            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Customer:</label>
              <input type="text" placeholder="Search customers..." value={paymentCustomerSearch} onChange={(e) => setPaymentCustomerSearch(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
              
              <div className="border rounded max-h-40 overflow-y-auto">
                {customers.filter(c => c.currentBalance > 0 && (paymentCustomerSearch === '' || c.name.toLowerCase().includes(paymentCustomerSearch.toLowerCase()) || c.company?.toLowerCase().includes(paymentCustomerSearch.toLowerCase()))).map(customer => (
                  <div key={customer.id} className={`p-3 border-b cursor-pointer ${selectedPaymentCustomer?.id === customer.id ? 'bg-cyan-50 border-cyan-500' : 'hover:bg-gray-50'}`} onClick={() => setSelectedPaymentCustomer(customer)}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">Balance: ${customer.currentBalance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Customer Info */}
            {selectedPaymentCustomer && (
              <div className="mb-4 p-3 bg-cyan-50 rounded-lg">
                <p className="font-bold">Payment From:</p>
                <p>{selectedPaymentCustomer.name}</p>
                <p className="text-sm text-gray-600">{selectedPaymentCustomer.company}</p>
                <p className="text-sm">Current Balance: <span className="font-bold text-red-600">${selectedPaymentCustomer.currentBalance.toFixed(2)}</span></p>
              </div>
            )}

            {/* Payment Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Amount:</label>
              <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full border rounded px-3 py-2 text-lg font-mono" placeholder="0.00" />
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method:</label>
              <div className="flex gap-2">
                {(['cash', 'check', 'card'] as const).map(method => (
                  <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 rounded capitalize ${paymentMethod === method ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Notes (optional):</label>
              <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} placeholder="Add any notes..." />
            </div>

            <div className="flex gap-2">
              <button onClick={processPaymentOnAccount} disabled={!selectedPaymentCustomer || !paymentAmount || parseFloat(paymentAmount) <= 0} className="flex-1 bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-700 disabled:bg-gray-300">Process Payment</button>
              <button onClick={() => { setShowPaymentOnAccountModal(false); setSelectedPaymentCustomer(null); setPaymentAmount(''); setPaymentNotes(''); setPaymentCustomerSearch(''); }} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Charge History Modal */}
      {showChargeHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-indigo-600">📋 Charge Account History</h3>
              <button onClick={() => setShowChargeHistoryModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Charged</p>
                <p className="text-2xl font-bold text-blue-600">${totalCharged.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
              </div>
            </div>

            {/* Charge Transactions */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {chargeTransactions.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">No charge transactions found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">Date</th>
                      <th className="px-3 py-2 text-left text-sm">Customer</th>
                      <th className="px-3 py-2 text-right text-sm">Total</th>
                      <th className="px-3 py-2 text-right text-sm">Paid</th>
                      <th className="px-3 py-2 text-right text-sm">Balance</th>
                      <th className="px-3 py-2 text-center text-sm">Status</th>
                      <th className="px-3 py-2 text-center text-sm">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargeTransactions.map(ct => {
                      const paid = ct.payments.reduce((sum, p) => sum + p.amount, 0)
                      const balance = ct.totalAmount - paid
                      return (
                        <tr key={ct.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{ct.timestamp.toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-sm">
                            <p className="font-medium">{ct.customerName}</p>
                            <p className="text-xs text-gray-500">{ct.customerCompany}</p>
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-bold">${ct.totalAmount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-right text-green-600">${paid.toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-right font-bold text-red-600">${balance.toFixed(2)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ct.status === 'paid' ? 'bg-green-100 text-green-700' :
                              ct.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                              ct.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ct.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-center">{ct.dueDate?.toLocaleDateString() || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <button onClick={() => setShowChargeHistoryModal(false)} className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Close</button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-orange-600">↩️ Process Refund</h3>

            {/* Search Transaction */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search Transaction (ID or Item):</label>
              <input type="text" placeholder="Enter transaction ID or item name..." value={refundSearchQuery} onChange={(e) => setRefundSearchQuery(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            {/* Transaction Results */}
            <div className="border rounded-lg max-h-64 overflow-y-auto mb-4">
              {refundSearchResults.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">No completed transactions found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm">ID</th>
                      <th className="px-3 py-2 text-left text-sm">Date</th>
                      <th className="px-3 py-2 text-left text-sm">Items</th>
                      <th className="px-3 py-2 text-right text-sm">Total</th>
                      <th className="px-3 py-2 text-center text-sm">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundSearchResults.map(t => (
                      <tr key={t.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs font-mono">{t.id}</td>
                        <td className="px-3 py-2 text-sm">{t.timestamp.toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm">{t.items.map(i => i.part.name).join(', ')}</td>
                        <td className="px-3 py-2 text-sm text-right font-bold">${t.totalAmount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => {
                            t.items.forEach(item => {
                              toggleRefundItem(t.id, item.part.id, item.part.name, item.quantity, item.unitPrice)
                            })
                          }} className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600">Select All</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Selected Items */}
            {selectedRefundItems.length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                <p className="font-bold mb-2">Selected Items for Refund:</p>
                {selectedRefundItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-medium">{item.partName}</p>
                      <p className="text-xs text-gray-500">Original: ${item.unitPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateRefundQuantity(item.transactionId, item.partId, item.refundQuantity - 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                      <span className="text-sm w-8 text-center">{item.refundQuantity}</span>
                      <button onClick={() => updateRefundQuantity(item.transactionId, item.partId, item.refundQuantity + 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                      <span className="font-bold text-sm w-20 text-right">${(item.unitPrice * item.refundQuantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <p className="font-bold text-lg">Refund Total: ${refundTotal.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Refund Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Refund Method:</label>
              <div className="flex gap-2">
                {['cash', 'card', 'check'].map(method => (
                  <button key={method} onClick={() => setRefundMethod(method)} className={`flex-1 py-2 rounded capitalize ${refundMethod === method ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={processRefund} disabled={selectedRefundItems.length === 0} className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-300">Process Refund</button>
              <button onClick={() => { setShowRefundModal(false); setRefundSearchQuery(''); setSelectedRefundItems([]); }} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-teal-600">📊 {reportType === 'z' ? 'Z-Report' : 'X-Report'}</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-center text-lg mb-2">{reportType === 'z' ? 'End of Day Report' : 'Mid-Day Summary'}</p>
              <p className="text-center text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Completed Sales:</span>
                <span className="font-bold">{dailyTotals.transactionCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sales:</span>
                <span className="font-bold">${dailyTotals.totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Refunds:</span>
                <span>-${dailyTotals.totalRefunds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Voided:</span>
                <span>-${dailyTotals.totalVoided.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Cancelled:</span>
                <span>-${dailyTotals.totalCancelled.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Net Total:</span>
                  <span className="text-green-600">${(dailyTotals.totalSales - dailyTotals.totalRefunds - dailyTotals.totalVoided - dailyTotals.totalCancelled).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-bold mb-2 text-sm">Payment Breakdown:</p>
                <div className="space-y-1">
                  {dailyTotals.paymentBreakdown.map(p => (
                    <div key={p.method} className="flex justify-between text-sm">
                      <span className="capitalize">{p.method}:</span>
                      <span className={p.method === 'charge' ? 'font-bold text-indigo-600' : 'font-medium'}>${p.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {reportType === 'z' && (
              <p className="text-center text-red-500 text-sm mb-4">⚠️ WARNING: Z-Report will reset daily totals</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => { if (reportType === 'z') processZReport(); else printReport(false); setShowReportModal(false); }} className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700">
                {reportType === 'z' ? 'Print Z-Report' : 'Print X-Report'}
              </button>
              <button onClick={() => setShowReportModal(false)} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-green-600">💵 Payment</h3>
            
            {/* Total Display */}
            <div className="text-center mb-6">
              <p className="text-gray-600">Total Amount Due</p>
              <p className="text-4xl font-bold text-green-600">${grandTotal.toFixed(2)}</p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method:</label>
              <div className="flex gap-2">
                {['cash', 'card', 'check'].map(method => (
                  <button key={method} onClick={() => setPaymentMethodState(method)} className={`flex-1 py-3 rounded-lg capitalize font-medium ${paymentMethodState === method ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Payment Inputs */}
            {paymentMethodState === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Cash Tendered:</label>
                <input type="number" step="0.01" value={cashInput} onChange={(e) => { setCashInput(e.target.value); calculateChange(parseFloat(e.target.value)); }} className="w-full border rounded px-3 py-3 text-xl font-mono" placeholder="0.00" autoFocus />
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {quickAmounts.map(amount => (
                    <button key={amount} onClick={() => { setCashInput(amount.toString()); calculateChange(amount); }} className="bg-gray-100 hover:bg-gray-200 rounded py-2 text-sm font-medium">
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Change Display */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Change Due</p>
                  <p className="text-2xl font-bold text-green-600">${calculatedChange.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Card/Check Payment */}
            {paymentMethodState !== 'cash' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">Press "Complete Sale" to process {paymentMethodState} payment</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { processPayment(); printReceipt(); }} disabled={paymentMethodState === 'cash' && (!cashInput || parseFloat(cashInput) < grandTotal)} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300">
                Complete Sale
              </button>
              <button onClick={() => { setShowPaymentModal(false); setCashInput(''); setCalculatedChange(0); }} className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




