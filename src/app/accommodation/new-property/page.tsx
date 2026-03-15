'use client'

import Link from 'next/link'
import { useState } from 'react'
import InventoryForm from './InventoryForm'

export default function NewPropertyPage() {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    const response = await fetch('/api/create-property', {
      method: 'POST',
      body: formData
    })
    if (response.ok) {
      alert('Property created successfully!')
      window.location.href = '/accommodation'
    } else {
      alert('Error creating property')
    }
    setIsPending(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/accommodation" 
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium mb-8"
        >
          ← Back to Properties
        </Link>
        
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-3xl">➕</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">New Property</h1>
            <p className="text-xl text-gray-600">Add a new property to your rental portfolio</p>
          </div>

          <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              await handleSubmit(formData)
            }} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Property ID *</label>
              <input 
                name="propertyId"
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg"
                placeholder="APT101, ROOM205, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Property Name *</label>
              <input 
                name="name"
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg"
                placeholder="Studio Apartment 1A"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
              <input 
                name="address"
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Occupancy</label>
                <input 
                  name="occupancyLimit"
                  type="number" 
                  required 
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent *</label>
                <input 
                  name="rentAmount"
                  type="number" 
                  step="0.01"
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                  placeholder="1200.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit</label>
              <input 
                name="depositAmount"
                type="number" 
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                placeholder="1200.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Furnishing Type</label>
              <select 
                name="furnishingType"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg"
              >
                <option value="">Select...</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi_furnished">Semi Furnished</option>
                <option value="fully_furnished">Fully Furnished</option>
              </select>
            </div>

            <InventoryForm />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amenities (optional)</label>
              <textarea 
                name="amenities"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 resize-vertical"
                placeholder="WiFi, parking, pool, laundry, AC..."
              />
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-orange-600 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Property'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
