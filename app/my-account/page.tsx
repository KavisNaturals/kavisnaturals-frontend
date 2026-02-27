'use client'

import React, { useEffect, useState, Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { usersApi, ordersApi, Address, type Order } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
}

const MyAccountContent = () => {
  const { isLoggedIn, logout, authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams?.get('tab') === 'orders' ? 'orders' : 'addresses'

  const [activeTab, setActiveTab] = useState<'addresses' | 'orders'>(defaultTab as 'addresses' | 'orders')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) { router.push('/'); return }
    usersApi.getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddr(false))
  }, [isLoggedIn, authLoading, router])

  useEffect(() => {
    if (!isLoggedIn || authLoading || activeTab !== 'orders') return
    if (orders.length > 0) return // already loaded
    setLoadingOrders(true)
    ordersApi.getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false))
  }, [activeTab, isLoggedIn, authLoading, orders.length])

  const deleteAddress = async (id: string) => {
    await usersApi.deleteAddress(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="w-full py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">My Account</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-6 py-4 font-bold rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-primary text-black' : 'bg-gray-100 hover:bg-primary text-gray-800'}`}
                >
                  Account details
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-6 py-4 font-bold rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary text-black' : 'bg-gray-100 hover:bg-primary text-gray-800'}`}
                >
                  Orders
                </button>
                <Link href="/my-account/reset-password" className="block px-6 py-4 bg-gray-100 hover:bg-primary transition-colors rounded-lg text-gray-800 font-medium">Reset Password</Link>
                <button onClick={() => { logout(); router.push('/') }} className="w-full text-left px-6 py-4 bg-gray-100 hover:bg-primary transition-colors rounded-lg text-gray-800 font-medium">🚪 Logout</button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Addresses</h2>
                    <Link href="/my-account/edit-address?new=1" className="px-5 py-2 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-dark">+ Add New</Link>
                  </div>

                  {loadingAddr ? (
                    <p className="text-gray-500">Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <p className="text-gray-500">No addresses saved yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-gray-200 rounded-xl p-6">
                          <p className="text-gray-800 font-semibold">{addr.first_name} {addr.last_name}</p>
                          <p className="text-gray-700">{addr.flat_house_no}, {addr.area_street}</p>
                          {addr.landmark && <p className="text-gray-700">{addr.landmark}</p>}
                          <p className="text-gray-700">{addr.pincode} {addr.city} {addr.state}</p>
                          <p className="text-gray-700">{addr.country}</p>
                          <p className="text-gray-700 mt-1">{addr.phone}</p>
                          {addr.is_default && <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-xs font-bold rounded">Default</span>}
                          <div className="flex space-x-4 mt-4">
                            <Link href={`/my-account/edit-address?id=${addr.id}`} className="px-6 py-2 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark text-sm">Edit</Link>
                            <button onClick={() => deleteAddress(addr.id)} className="px-6 py-2 bg-white text-black font-bold border-2 border-gray-800 rounded-xl hover:bg-gray-100 text-sm">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h2>

                  {loadingOrders ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003F62]" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No orders yet.</p>
                      <Link href="/shop" className="mt-4 inline-block px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/80">
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const items = order.OrderItems || []
                        const status = order.delivery_status || (order as any).status || 'pending'
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-xl p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Order ID</p>
                                <p className="font-mono text-sm font-semibold text-gray-800">{order.id.slice(0, 8).toUpperCase()}...</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm text-gray-700">{new Date(order.createdAt || (order as any).created_at || '').toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-sm font-bold text-gray-900">₹{Number(order.total_amount || 0).toFixed(2)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                                {status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {items.length > 0 && (
                              <div className="text-sm text-gray-600">
                                {items.slice(0, 2).map((item: any, i: number) => (
                                  <span key={i}>{item.Product?.name || item.product_name || 'Product'}{i < Math.min(items.length, 2) - 1 ? ', ' : ''}</span>
                                ))}
                                {items.length > 2 && <span> +{items.length - 2} more</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

const MyAccountPage = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <MyAccountContent />
  </Suspense>
)

export default MyAccountPage
