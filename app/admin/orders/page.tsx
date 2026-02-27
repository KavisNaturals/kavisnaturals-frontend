'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { ordersApi, type Order } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-600', cancelled: 'text-red-600', pending: 'text-orange-600',
  processing: 'text-blue-600', shipped: 'text-purple-600', out_for_delivery: 'text-indigo-600',
}

const AdminOrdersPage = () => {
  const router = useRouter()
  const { isLoggedIn, isAdmin } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) { router.push('/admin/login'); return }
    ordersApi.getAllAdmin()
      .then(data => {
        const allOrders = Array.isArray(data) ? data : []
        const filtered = statusFilter
          ? allOrders.filter((order: any) => (order.delivery_status || order.status || '').toLowerCase() === statusFilter)
          : allOrders
        setOrders(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn, isAdmin, router, statusFilter])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders List</h1>
            <p className="text-sm text-gray-600">Home &gt; Order List</p>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-primary">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">All Orders</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => {
                    const status = (order.delivery_status || order.status || 'pending').toLowerCase()
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">#{order.id}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{new Date(order.createdAt || order.created_at || '').toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{order.User?.name || order.user_name || '—'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1 text-sm capitalize ${STATUS_COLORS[status] || 'text-gray-600'}`}>
                            <span className="w-2 h-2 rounded-full bg-current" />
                            <span>{status.replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                        </td>
                      </tr>
                    )
                  })}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminOrdersPage
