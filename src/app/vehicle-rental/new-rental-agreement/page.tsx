'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewRentalAgreement() {
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [balance, setBalance] = useState(0)
  const router = useRouter()

  const [formData, setFormData] = useState({
    vehicleId: '',
    rentalClientId: '',
    agreementType: '',
    startDate: '',
    endDate: '',
    dailyAmount: '',
    weeklyAmount: '',
    monthlyAmount: '',
    leaseAmount: '',
    depositAmount: '',
    lateFee: '',
    lateFeeAfterDays: ''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/vehicles').then(res => res.json()).catch(() => ({ vehicles: [] })),
      fetch('/api/rental-clients?limit=100').then(res => res.json()).catch(() => ({ clients: [] }))
    ]).then(([vehiclesData, clientsData]) => {
      setVehicles((vehiclesData.vehicles || []).filter((v: any) => v.status === 'Available'))
      setClients((clientsData.clients || []).filter((c: any) => !c.isBlacklisted))
      setLoading(false)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Debounce calc
    setTimeout(calculateBalance, 100)
  }

  const calculateBalance = () => {
    const days = formData.endDate && formData.startDate ? 
      Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
    let totalRental = 0
    if (formData.agreementType === 'daily') totalRental = parseFloat(formData.dailyAmount || '0') * Math.max(days, 1)
    else if (formData.agreementType === 'weekly') totalRental = parseFloat(formData.weeklyAmount || '0') * Math.ceil(days / 7)
    else if (formData.agreementType === 'monthly') totalRental = parseFloat(formData.monthlyAmount || '0') * Math.ceil(days / 30)
    else if (formData.agreementType === 'fixed-lease') totalRental = parseFloat(formData.leaseAmount || '0') || 0
    const rate = parseFloat(formData.depositAmount || '0')
    const deposit = parseFloat(formData.depositAmount || '0')
    setBalance(Math.max(0, totalRental - deposit))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value))

    const response = await fetch('/api/create-rental-agreement', {
      method: 'POST',
      body: submitData
    })

    if (response.ok) {
      alert('Rental agreement created successfully!')
      router.push('/vehicle-rental')
    } else {
      alert('Error creating agreement')
    }
    setIsPending(false)
  }

  const getAmountField = () => {
    if (formData.agreementType === 'daily') return 'dailyAmount'
    if (formData.agreementType === 'weekly') return 'weeklyAmount'
    if (formData.agreementType === 'monthly') return 'monthlyAmount'
    return 'leaseAmount'
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/vehicle-rental" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-bold mb-8">
          ← Back to Vehicle Rental
        </Link>
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">📝 New Rental Agreement</h1>
          <p className="text-xl text-gray-600 text-center mb-12">Create rental agreement between client and vehicle</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle *</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500">
                <option value="">Select Available Vehicle</option>
                {vehicles.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rental Client *</label>
              <select name="rentalClientId" value={formData.rentalClientId} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500">
                <option value="">Select Client</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Agreement Type *</label>
              <select name="agreementType" value={formData.agreementType} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500">
                <option value="">Select Type</option>
                <option value="daily">Per Day</option>
                <option value="weekly">Per Week</option>
                <option value="monthly">Month-to-Month</option>
                <option value="fixed-lease">Fixed-Term Lease</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount ({formData.agreementType === 'daily' ? 'Daily' : formData.agreementType === 'weekly' ? 'Weekly' : formData.agreementType === 'monthly' ? 'Monthly' : 'Lease'})
                </label>
                <input name={getAmountField()} type="number" step="0.01" value={formData[getAmountField() as keyof typeof formData] || ''} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deposit Amount</label>
                <input name="depositAmount" type="number" step="0.01" value={formData.depositAmount} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee ($)</label>
                <input name="lateFee" type="number" step="0.01" value={formData.lateFee} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee After (days)</label>
                <input name="lateFeeAfterDays" type="number" value={formData.lateFeeAfterDays} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200" />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-2xl text-center">
              <div className="text-3xl font-bold mb-2">${balance.toFixed(2)}</div>
              <div className="text-lg opacity-90">Calculated Balance</div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 px-8 rounded-2xl text-xl font-bold hover:from-orange-600 hover:to-red-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Rental Agreement'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

