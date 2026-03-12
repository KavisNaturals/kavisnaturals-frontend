'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ordersApi } from '@/lib/api'

const TrackOrderPage = () => {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const order = await ordersApi.track(orderId, billingEmail)
      sessionStorage.setItem('trackedOrder', JSON.stringify(order))
      router.push('/track-order/status')
    } catch {
      setError('Order not found. Please check your Order ID and email address.')
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="w-full  py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Track Order</h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800 font-medium">Track Order</span>
          </p>
        </div>
      </section>

      {/* Track Order Form */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-gray-800 mb-8 max-w-xl mx-auto">
            To track your order please enter your Order ID in the box below and press the &quot;Track&quot; button. This was given to you on your receipt and in the confirmation email you should have received.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">{error}</div>
          )}

          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label className="block text-gray-800 font-medium mb-2">Order ID</label>
              <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                placeholder="Enter Your Order ID"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
            </div>
            <div>
              <label className="block text-gray-800 font-medium mb-2">Billing Email</label>
              <input type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)}
                placeholder="Enter Your Billing E-mail Address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60">
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default TrackOrderPage
