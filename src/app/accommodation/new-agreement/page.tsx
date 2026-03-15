'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function NewAgreementPage() {
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [isPending, setIsPending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch properties and tenants
    Promise.all([
      fetch('/api/properties').then(res => res.json()),
      fetch('/api/tenants').then(res => res.json())
    ]).then(([propertiesData, tenantsData]) => {
      setProperties(propertiesData.properties || [])
      setTenants(tenantsData.tenants || [])
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    
    const response = await fetch('/api/create-agreement', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      alert('✅ Rental agreement created successfully!')
      window.location.href = '/accommodation'
    } else {
      alert('❌ Error creating agreement')
    }
    setIsPending(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading properties and tenants...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-4 mb-8">
          <Link 
            href="/accommodation" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to Properties
          </Link>
          <Link 
            href="/accommodation/new-tenant" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            ➕ New Tenant
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">New Rental Agreement</h1>
            <p className="text-xl text-gray-600">
              {tenants.length === 0 && (
                <span className="text-orange-600 font-medium">No tenants yet. <Link href="/accommodation/new-tenant" className="underline hover:no-underline">Create one first →</Link></span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Property *</label>
              <select 
                name="propertyId"
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-lg"
              >
                <option value="">Select Property</option>
                {properties.map((property: any) => (
                  <option key={property.id} value={property.id}>
                    {property.propertyId} - {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tenant *</label>
              <select 
                name="tenantId"
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-lg"
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant: any) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.phone || 'No phone'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Agreement Type *</label>
                <select 
                  name="agreementType"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-lg"
                >
                  <option value="">Select Type</option>
                  <option value="fixed-term">Fixed-Term Lease</option>
                  <option value="month-to-month">Month-to-Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                <input 
                  name="endDate"
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
              <input 
                name="startDate"
                type="date" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rent Due Day *</label>
                <select 
                  name="rentDueDay"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="">Select Day</option>
                  <option value="1">1st of Month</option>
                  <option value="15">15th of Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Methods *</label>
                <select 
                  name="paymentMethods"
                  required
                  multiple
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="money_order">Money Order</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee ($)</label>
                <input 
                  name="lateFee"
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee After (days)</label>
                <input 
                  name="lateFeeAfterDays"
                  type="number" 
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent *</label>
              <input 
                name="rentAmount"
                type="number" 
                step="0.01"
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                placeholder="1200.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deposit Amount</label>
              <input 
                name="depositAmount"
                type="number" 
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                placeholder="1200.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rent Increase Policy</label>
              <textarea 
                name="rentIncreasePolicy"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 resize-vertical"
                placeholder="Annual rent increases limited to 5% or CPI adjustment, with 60 days written notice required..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notice Period (days) *</label>
              <input 
                name="noticePeriod"
                type="number" 
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                placeholder="30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Utilities Included in Rent</label>
                <select 
                  name="utilitiesIncluded"
                  multiple
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="internet">Internet</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                  <option value="trash">Trash Removal</option>
                  <option value="sewer">Sewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tenant Responsible Utilities</label>
                <select 
                  name="tenantUtilities"
                  multiple
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="internet">Internet</option>
                  <option value="electricity">Electricity</option>
                  <option value="gas">Gas</option>
                  <option value="cable">Cable TV</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Shared Utility Calculation Method</label>
              <textarea 
                name="sharedUtilityMethod"
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 resize-vertical"
                placeholder="50/50 split between tenants, or based on square footage allocation. Electricity meter reading on the 1st, water/sewer billed quarterly..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Renewal Options & Procedures</label>
              <textarea 
                name="renewalOptions"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 resize-vertical"
                placeholder="Automatic renewal after end date, 60-day written notice required for non-renewal. Tenant must notify in writing by certified mail..."
              />
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-emerald-600 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Agreement...
                </>
              ) : (
                'Create Agreement'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
