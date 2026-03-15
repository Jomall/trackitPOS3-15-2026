'use client'

import { revalidatePath } from 'next/cache'

interface UnblacklistModalProps {
  client: {
    id: number
    name: string
  } | null
  onClose: () => void
}

export default function UnblacklistModal({ client, onClose }: UnblacklistModalProps) {
  const handleUnblacklist = async () => {
    if (!client) return

    const formData = new FormData()
    formData.append('clientId', client.id.toString())

    try {
      const res = await fetch('/api/rental-clients/unblacklist', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        revalidatePath('/vehicle-rental/clients')
        alert('Client unblacklisted')
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Error unblacklisting client')
      }
    } catch (error) {
      alert('Network error unblacklisting client')
    }
  }

  if (!client) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Unblacklist {client.name}</h2>
        <p className="text-lg text-gray-600 mb-8">Remove blacklist. Client eligible for rentals.</p>
        <div className="flex gap-4">
          <button 
            onClick={handleUnblacklist} 
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Unblacklist
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
