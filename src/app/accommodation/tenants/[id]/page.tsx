'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    agreementId: '',
    amount: '',
    paymentDate: '',
    method: 'cash'
  })

  useEffect(() => {
    fetch(`/api/tenants/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setTenant(data.tenant)
        // Flatten payments from all agreements
        const allPayments = data.tenant.agreements?.flatMap(a => a.payments) || []
        setPayments(allPayments)
        setTenant(data.tenant)

        setLoading(false)
      })
  }, [params.id])

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('agreementId', paymentForm.agreementId)
    formData.append('amount', paymentForm.amount)
    formData.append('paymentDate', paymentForm.paymentDate)
    formData.append('method', paymentForm.method)

    const res = await fetch(`/api/payments/${params.id}`, {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      // Refresh data
      const freshData = await fetch(`/api/tenants/${params.id}`).then(r => r.json())
      setTenant(freshData.tenant)
      setPayments(freshData.payments)
      setShowPaymentModal(false)
      setPaymentForm({ agreementId: '', amount: '', paymentDate: '', method: 'cash' })
    }
  }

  if (loading) return <div>Loading tenant...</div>

  const totalOutstanding = tenant?.balance || tenant?.agreements?.reduce((sum, agreement) => {
    const months = Math.ceil((new Date().getFullYear() - new Date(agreement.startDate).getFullYear()) * 12)
    const expected = agreement.rentAmount * months
    const paid = (payments || []).filter(p => p.agreementId === agreement.id).reduce((s, p) => s + p.amount, 0)
    return sum + Math.max(0, expected - paid)
  }, 0) || 0


  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-xl text-gray-600 mt-2">ID: {tenant.idNumber} | Phone: {tenant.phone}</p>
          </div>
          <Link href="/accommodation/tenants" className="bg-gray-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-600">
            ← Back to Tenants
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Agreements</h3>
            <div className="text-3xl font-bold text-emerald-600">{tenant.agreements?.length || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Paid</h3>
            <div className="text-3xl font-bold text-blue-600">${(payments || []).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</div>

          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Outstanding Balance</h3>
            <div className={`text-3xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ${totalOutstanding.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">📋 Rental Agreements</h2>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all"
            >
              ➕ Record Payment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenant.agreements?.map(agreement => (
                  <tr key={agreement.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{agreement.property.name}</div>
                      <div className="text-sm text-gray-500">{agreement.property.propertyId}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold">${agreement.rentAmount}/mo</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(agreement.startDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        agreement.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agreement.status}
                      </span>
                    </td>
                  </tr>
                )) || <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No agreements</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">💰 Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agreement</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
{(payments || []).map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{payment.agreement?.agreementNumber}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">${payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{payment.receiptNumber || '—'}</td>
                  </tr>
                )) || <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No payments recorded</td></tr>}

              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">➕ Record Payment</h2>
              <form onSubmit={handlePaymentSubmit}>
                <select 
                  value={paymentForm.agreementId} 
                  onChange={(e) => setPaymentForm({...paymentForm, agreementId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl mb-4"
                  required
                >
                  <option value="">Select Agreement</option>
                  {tenant.agreements?.map(a => (
                    <option key={a.id} value={a.id}>{a.property.propertyId} - ${a.rentAmount}/mo</option>
                  ))}
                </select>
                <input
                  type="number" 
                  placeholder="Amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl mb-4"
                  step="0.01"
                  required
                />
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl mb-4"
                  required
                />
                <select 
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl mb-6"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600">
                    Record Payment
                  </button>
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-200 py-3 rounded-xl font-bold hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

