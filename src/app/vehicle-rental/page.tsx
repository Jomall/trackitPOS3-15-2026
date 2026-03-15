'use client'

import Link from 'next/link'

export default function VehicleRentalPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🚘 Vehicle Rental Management
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Complete fleet management system for vehicles, clients, and rental requests
            </p>
          </div>
          <Link 
            href="/" 
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center"
          >
            <span className="mr-2">📊</span>
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Placeholder Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Overview (Coming Soon)</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
                <div className="text-3xl font-bold">--</div>
                <div className="text-sm opacity-90">Vehicles</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                <div className="text-3xl font-bold">--</div>
                <div className="text-sm opacity-90">Active Rentals</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/vehicle-rental/new-client" className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center text-lg font-bold">
                👤 New Rental Client
              </Link>
              <Link href="/vehicle-rental/clients" className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center text-lg font-bold">
                👥 Manage Clients
              </Link>
              <Link href="/vehicle-rental/fleet" className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center text-lg font-bold">
                🚗 Manage Fleet
              </Link>
              <Link href="/vehicle-rental/new-rental-agreement" className="p-4 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-xl hover:from-orange-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center justify-center text-lg font-bold">
                📄 New Rental Agreement
              </Link>
            </div>
          </div>
        </div>

        {/* Placeholder Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">📋 Recent Rental Requests</h2>
            <p className="text-gray-500 mt-2">Table coming soon after database setup</p>
          </div>
        </div>
      </div>
    </main>
  )
}

