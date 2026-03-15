'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ClientDamagesPage() {
  const params = useParams()
  const clientId = parseInt(params.id as string)

  const [client, setClient] = useState(null)
  const [clients, setClients] = useState([])  // All clients for payer select
  const [vehicles, setVehicles] = useState([])  // All vehicles for damage select
  const [damages, setDamages] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  // Modal states
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [damageForm, setDamageForm] = useState({
    description: '',
    amount: '',
    status: 'pending',
    notes: '',
    accidentDate: '',
    accidentLocation: '',
    vehiclesInvolved: '',
    vehicleId: '',
    payerClientId: '',  
    payerName: '',
    payerAddress: '',
    receiverName: 'Trackit Rental Co',
    receiverAddress: 'Business Address'
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    notes: '',
    totalAgreementAmount: '',
    installmentNumber: '',
    totalInstallments: '',
    dueDate: '',
    lateFeeAmount: '',
    lateFeeRate: ''
  })

  useEffect(() => {
    fetchData()
    fetchAllClients()
    fetchAllVehicles()
  }, [clientId])

  const fetchAllVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles')
      const data = await res.json()
      setVehicles(data.vehicles || data || [])
    } catch (error) {
      console.error('Error fetching vehicles', error)
      setVehicles([])
    }
  }


  const fetchAllClients = async () => {
    try {
      const res = await fetch('/api/rental-clients?page=1&limit=100')  // Get more clients
      const data = await res.json()
      setClients(Array.isArray(data.clients) ? data.clients : data || [])
    } catch (error) {
      console.error('Error fetching clients', error)
      setClients([])
    }
  }

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/rental-clients/${clientId}`)
      if (!res.ok) throw new Error('Client not found')
      const data = await res.json()
      setClient(data)
      
      const damageTotal = data.damages?.reduce((sum, d) => sum + d.amount, 0) || 0
      const paymentTotal = data.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
      setBalance(damageTotal - paymentTotal)
      
      setDamages(data.damages || [])
      setPayments(data.payments || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayerSelect = (payerClientId) => {
    const payerClient = clients.find(c => c.id === parseInt(payerClientId))
    if (payerClient) {
      setDamageForm({
        ...damageForm,
        payerClientId,
        payerName: payerClient.name,
        payerAddress: `${payerClient.phone || ''} ${payerClient.email || ''}`.trim()
      })
    }
  }

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId))
    if (vehicle) {
      setDamageForm({
        ...damageForm,
        vehicleId: vehicleId,
        vehiclesInvolved: `${vehicle.licensePlate} - ${vehicle.make} ${vehicle.model} (${vehicle.year})`
      })
    }
  }

  const handleDamageSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(damageForm).forEach(([key, value]) => formData.append(key, value))
    formData.append('rentalClientId', clientId.toString())

    try {
      const res = await fetch(`/api/rental-clients/${clientId}/damages`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setShowDamageModal(false)
        setDamageForm({
          description: '',
          amount: '',
          status: 'pending',
          notes: '',
          accidentDate: '',
          accidentLocation: '',
          vehiclesInvolved: '',
          vehicleId: '',
          payerClientId: '',
          payerName: '',
          payerAddress: '',
          receiverName: 'Trackit Rental Co',
          receiverAddress: 'Business Address'
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating damage', error)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(paymentForm).forEach(([key, value]) => formData.append(key, value))
    formData.append('rentalClientId', clientId.toString())

    try {
      const res = await fetch(`/api/rental-clients/${clientId}/payments`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setShowPaymentModal(false)
        setPaymentForm({ amount: '', method: 'cash', notes: '', totalAgreementAmount: '', installmentNumber: '', totalInstallments: '', dueDate: '', lateFeeAmount: '', lateFeeRate: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating payment', error)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          href={`/vehicle-rental/clients/${clientId}`}
          className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-bold text-lg"
        >
          ← Back to {client?.name} Details
        </Link>

        {/* Balance Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">💰 Damages & Payments</h1>
            <div className={`px-6 py-3 rounded-2xl font-bold text-2xl ${balance > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
              ${balance.toFixed(2)}
            </div>
          </div>
          <p className="text-gray-600">Track damages from rentals and payments received.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Damages Table */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🚗 Damages</h2>
              <button 
                onClick={() => setShowDamageModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                ➕ New Damage
              </button>
            </div>
            <div className="space-y-4">
              {damages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🚗</div>
                  <p>No damages recorded</p>
                </div>
              ) : (
                damages.map((damage) => (
                  <div key={damage.id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-900">{damage.description}</h4>
                    <p className="text-sm text-gray-600">
                      Amount: ${damage.amount} • Date: {new Date(damage.date).toLocaleDateString()} • Status: <span className={`px-2 py-1 rounded-full text-xs font-bold ${damage.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : damage.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{damage.status.toUpperCase()}</span>
                    </p>
                    {damage.payerName && <p><strong>Payer:</strong> {damage.payerName}</p>}
                    {damage.payerAddress && <p><strong>Address:</strong> {damage.payerAddress}</p>}
                    {damage.accidentLocation && <p><strong>Location:</strong> {damage.accidentLocation}</p>}
                    {damage.vehiclesInvolved && <p><strong>Vehicles:</strong> {damage.vehiclesInvolved}</p>}
                    {damage.notes && <p><strong>Notes:</strong> {damage.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">💳 Payments</h2>
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                ➕ Record Payment
              </button>
            </div>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">💳</div>
                  <p>No payments recorded</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col gap-2 p-4 bg-emerald-50 rounded-xl">
                    <h4 className="font-bold text-gray-900">{payment.method.toUpperCase()} - ${payment.amount}</h4>
                    <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    {payment.dueDate && <p><strong>Due:</strong> {new Date(payment.dueDate).toLocaleDateString()}</p>}
                    {payment.installmentNumber && <p><strong>Installment:</strong> {payment.installmentNumber}/{payment.totalInstallments || 'N/A'}</p>}
                    {payment.notes && <p><strong>Notes:</strong> {payment.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Damage Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">➕ New Damage Record</h2>
            <form onSubmit={handleDamageSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Description" value={damageForm.description} onChange={(e) => setDamageForm({...damageForm, description: e.target.value})} className="p-3 border rounded-lg w-full" required />
                <input type="number" step="0.01" placeholder="Amount ($)" value={damageForm.amount} onChange={(e) => setDamageForm({...damageForm, amount: e.target.value})} className="p-3 border rounded-lg w-full" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select value={damageForm.payerClientId} onChange={(e) => handlePayerSelect(e.target.value)} className="p-3 border rounded-lg w-full">
                  <option value="">Select Payer Client</option>
                  {Array.isArray(clients) && clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select value={damageForm.vehicleId || ''} onChange={(e) => handleVehicleSelect(e.target.value)} className="p-3 border rounded-lg w-full">
                  <option value="">Select Fleet Vehicle</option>
                  {Array.isArray(vehicles) && vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.licensePlate} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Payer Details (auto-filled)</label>
                <p className="p-3 bg-gray-100 rounded-lg">{damageForm.payerName || 'No payer selected'} - {damageForm.payerAddress || ''}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Accident Location" value={damageForm.accidentLocation} onChange={(e) => setDamageForm({...damageForm, accidentLocation: e.target.value})} className="p-3 border rounded-lg w-full" />
                <input type="text" placeholder="Vehicles Involved" value={damageForm.vehiclesInvolved} onChange={(e) => setDamageForm({...damageForm, vehiclesInvolved: e.target.value})} className="p-3 border rounded-lg w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select value={damageForm.status} onChange={(e) => setDamageForm({...damageForm, status: e.target.value})} className="p-3 border rounded-lg w-full">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
                <input type="text" placeholder="Receiver Name" value={damageForm.receiverName} onChange={(e) => setDamageForm({...damageForm, receiverName: e.target.value})} className="p-3 border rounded-lg w-full" />
              </div>
              <textarea placeholder="Notes" value={damageForm.notes} onChange={(e) => setDamageForm({...damageForm, notes: e.target.value})} className="p-3 border rounded-lg w-full h-24 mb-4" />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white p-3 rounded-xl font-bold hover:from-red-600">
                  Create Damage
                </button>
                <button type="button" onClick={() => setShowDamageModal(false)} className="flex-1 bg-gray-300 p-3 rounded-xl font-bold hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">➕ Record Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              {/* Payment fields same as before */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="number" step="0.01" placeholder="Amount ($)" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="p-3 border rounded-lg w-full" required />
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})} className="p-3 border rounded-lg w-full">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              {/* ... other payment fields */}
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl font-bold">
                  Record Payment
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-300 p-3 rounded-xl font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

