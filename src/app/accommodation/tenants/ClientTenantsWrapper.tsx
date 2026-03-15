'use client'

import { useState } from 'react'
import Link from 'next/link'

import BlacklistModal from './BlacklistModal'
import UnblacklistModal from './UnblacklistModal'

interface Tenant {
  id: number
  name: string
  phone?: string
  email?: string
  idNumber?: string
  agreements: { length: number }[]
  createdAt: string
  isBlacklisted: boolean
  blacklistUntil?: string
}

interface ClientTenantsWrapperProps {
  tenants: Tenant[]
}

export default function ClientTenantsWrapper({ tenants }: ClientTenantsWrapperProps) {
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [showUnblacklistModal,
