'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function NewTenantPage() {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    
    const response = await fetch('/api/create-tenant', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      alert('✅ Tenant created successfully!')
      window.location.href = '/accommodation/tenants'
    } else {
      alert('❌ Error creating tenant')
    }
    setIsPending(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/accommodation/tenants" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-8"
        >
          ← Back to Tenants
        </Link>
        
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">New Tenant</h1>
            <p className="text-xl text-gray-600">Add a new tenant to your rental database</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
              <input 
                name="name"
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                <input 
                  name="phone"
                  type="tel" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  name="email"
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="john.doe@email.com"
                />
              </div>
            </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Government ID #</label>
                <input 
                  name="idNumber"
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 font-mono"
                  placeholder="ID12345678"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Government ID Photo</label>
                <input 
                  name="idPhoto"
                  type="file" 
                  accept="image/*,.pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-100 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center mb-3">
                  <input 
                    id="requiresDeposit"
                    name="requiresSecurityDeposit"
                    type="checkbox" 
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="requiresDeposit" className="ml-2 block text-sm font-bold text-gray-700">Requires Security Deposit</label>
                </div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit Amount (if applicable)</label>
                <input 
                  name="securityDepositAmount"
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center">
                  <input 
                    id="depositCollected"
                    name="securityDepositCollected"
                    type="checkbox" 
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-2"
                  />
                  <span className="text-sm font-bold text-gray-700">Security Deposit Collected Today</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact</label>
                <input 
                  name="emergencyContact"
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="Jane Doe - +1 (555) 987-6543"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-purple-600 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Tenant...
                </>
              ) : (
                'Create Tenant'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
