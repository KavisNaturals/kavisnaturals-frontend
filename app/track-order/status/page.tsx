'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import type { Order } from '@/lib/api'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Ordered',          icon: '/images/track-icons/icon-1.png' },
  { key: 'processing', label: 'Order Ready',       icon: '/images/track-icons/icon-2.png' },
  { key: 'shipped',    label: 'Shipped',           icon: '/images/track-icons/icon-3.png' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '/images/track-icons/icon-4.png' },
  { key: 'delivered',  label: 'Delivered',         icon: '/images/track-icons/icon-5.png' },
]

function stepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

const TrackOrderStatusPage = () => {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('trackedOrder')
    if (raw) { try { setOrder(JSON.parse(raw)) } catch {} }
    else { router.replace('/track-order') }
  }, [router])

  const currentStep = order ? stepIndex(order.delivery_status || (order as any).status || 'pending') : 0

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="w-full py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Track Order</h1>
        </div>
      </section>

      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link href="/track-order" className="hover:text-primary">Track Order</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800 font-medium">Status</span>
          </p>
        </div>
      </section>

      {order && (
        <section className="py-6 bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-700">
              <span><span className="font-semibold">Order ID:</span> #{order.id}</span>
              <span><span className="font-semibold">Status:</span> <span className="capitalize">{(order.delivery_status || (order as any).status || '').replace(/_/g, ' ')}</span></span>
              {order.total_amount && <span><span className="font-semibold">Total:</span> ₹{Number(order.total_amount).toFixed(2)}</span>}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-8">
            {STATUS_STEPS.map((step, index) => {
              const completed = index <= currentStep
              return (
                <div key={index} className="flex items-center space-x-4 relative">
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`absolute h-12 w-1 z-0 ${completed ? 'bg-primary' : 'bg-gray-200'}`} style={{ top: '3rem', left: '2.2rem' }} />
                  )}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${completed ? 'bg-primary' : 'bg-white border-2 border-gray-300'}`}>
                      {completed && <Check size={24} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${completed ? 'border-primary bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      <Image src={step.icon} alt={step.label} width={40} height={40} className="object-contain" />
                    </div>
                    <p className={`text-lg font-semibold ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/track-order" className="px-8 py-3 border-2 border-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Track Another Order
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default TrackOrderStatusPage
