// Placeholder server action - API handles persistence
'use server'

import { redirect } from 'next/navigation'

export async function createRentalClient(formData: FormData) {
  // Forward to API route
  const response = await fetch('/api/create-rental-client', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to create rental client')
  }

  redirect('/vehicle-rental?success=true')
}

