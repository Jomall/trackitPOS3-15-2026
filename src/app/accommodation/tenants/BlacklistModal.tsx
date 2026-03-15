'use client'

import { useState } from 'react'
import { revalidatePath } from 'next/cache'

interface BlacklistModalProps {
  tenant: {
    id: number
    name: string
  } | null
  onClose: () => void
}

export default function BlacklistModal({ tenant, onClose }: BlacklistModalProps) {
  const [reason, setReason] = useState('')
  const [blacklistUntil, setBlacklistUntil] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant || !reason) return

    setSubmitting(true)
    const formData = new FormData()
    formData.append('tenantId', tenant.id.toString())
    formData.append('reason', reason)
    if (blacklistUntil) formData.append('blacklistUntil', blacklistUntil)

    try {
      const res = await fetch('/api/tenants/blacklist', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        // Trigger revalidation
        revalidatePath('/accommodation/tenants')
        alert('Tenant blacklisted')
        onClose()
      } else {
        alert('Error blacklisting tenant')
      }
    } catch (error) {
      alert('Error blacklisting tenant')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tenant) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🚫 Blacklist {tenant.name}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (required)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Property damage, late payments, bad tenant history..."
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 min-h-[100px] resize-vertical focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm"
            required
            disabled={submitting}
          />
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (optional = indefinite)</label>
          <input
            type="date"
            value={blacklistUntil}
            onChange={(e) => setBlacklistUntil(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl mb-8 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm"
            disabled={submitting}
          />
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={submitting || !reason}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Blacklisting...' : 'Blacklist Tenant'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-gray-200 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
