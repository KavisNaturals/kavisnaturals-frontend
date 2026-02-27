'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { usersApi } from '@/lib/api'

const EMPTY_FORM = {
  first_name: '', last_name: '', address_line1: '', address_line2: '',
  landmark: '', pincode: '', city: '', state: '', country: 'India', email: '', phone: '',
}

function EditAddressForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { isLoggedIn, authLoading } = useAuth()
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addressId = params.get('id')
  const isNew = params.get('new') === '1' || !addressId

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) { router.push('/'); return }
    if (!isNew && addressId) {
      setLoading(true)
      usersApi.getAddresses()
        .then((list: any[]) => {
          const addr = list.find((a: any) => String(a.id) === addressId)
          if (addr) setFormData({
            first_name: addr.first_name || '', last_name: addr.last_name || '',
            address_line1: addr.address_line1 || '', address_line2: addr.address_line2 || '',
            landmark: addr.landmark || '', pincode: addr.pincode || '',
            city: addr.city || '', state: addr.state || '',
            country: addr.country || 'India', email: addr.email || '', phone: addr.phone || '',
          })
        })
        .catch(() => setError('Failed to load address'))
        .finally(() => setLoading(false))
    }
  }, [isLoggedIn, authLoading, addressId, isNew, router])

  const set = (field: string, val: string) => setFormData(prev => ({ ...prev, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (isNew) await usersApi.saveAddress(formData)
      else await usersApi.updateAddress(String(addressId), formData)
      router.push('/my-account')
    } catch {
      setError('Failed to save address. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <main className="min-h-screen bg-white"><Header />
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div><Footer /></main>
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="w-full py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Address</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{isNew ? 'Add New Address' : 'Edit Address'}</h2>
            <Link href="/my-account" className="text-sm text-gray-600 hover:underline">← Back</Link>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">First Name</label>
                  <input type="text" value={formData.first_name} onChange={e => set('first_name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">Last Name</label>
                  <input type="text" value={formData.last_name} onChange={e => set('last_name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2">Flat, House No / Street Address</label>
                <input type="text" value={formData.address_line1} onChange={e => set('address_line1', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2">Area, Street (optional)</label>
                <input type="text" value={formData.address_line2} onChange={e => set('address_line2', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2">Land mark (optional)</label>
                <input type="text" value={formData.landmark} onChange={e => set('landmark', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">Pincode</label>
                  <input type="text" value={formData.pincode} onChange={e => set('pincode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">City</label>
                  <input type="text" value={formData.city} onChange={e => set('city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">State</label>
                  <input type="text" value={formData.state} onChange={e => set('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">Country</label>
                  <input type="text" value={formData.country} onChange={e => set('country', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-medium mb-2">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" disabled={saving}
                  className="px-12 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : isNew ? 'Add Address' : 'Update'}
                </button>
                <Link href="/my-account"
                  className="px-12 py-3 bg-white text-black font-bold border-2 border-gray-800 rounded-xl hover:bg-gray-100 transition-colors text-center">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function EditAddressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditAddressForm />
    </Suspense>
  )
}
