'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { User, Package, MapPin, Download } from 'lucide-react'
import { ordersApi, type Order } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const STATUSES = ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'returned'] as const

// 👇 Add a safe extended type so build won’t fail on API shape variations
type AnyOrder = Order & {
  createdAt?: string
  created_at?: string
  delivery_status?: string
  status?: string
  payment_status?: string
  payment_method?: string
  total_amount?: number

  items?: any[]
  OrderItems?: any[]

  shipping_address?: any
  ShippingAddress?: any
  shippingAddress?: any

  User?: any
  UserAddresses?: any[]
}

const OrderDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { isLoggedIn, isAdmin } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const handleDownloadInvoice = async () => {
    if (!order) return

    const o = order as AnyOrder // ✅ normalize once

    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()

    const addr =
      o.shipping_address ||
      o.ShippingAddress ||
      o.shippingAddress ||
      o.UserAddresses?.[0] ||
      null

    const items = o.OrderItems || o.items || []

    doc.setFontSize(20)
    doc.setTextColor(0, 63, 98)
    doc.text("Kavi's Naturals", 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Invoice / Receipt', 14, 27)

    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text(`Order ID: ${o.id}`, 14, 38)
    doc.text(`Date: ${new Date(o.createdAt || o.created_at || '').toLocaleDateString()}`, 14, 44)
    doc.text(`Payment: ${o.payment_status || '—'}`, 14, 50)
    doc.text(`Status: ${(o.delivery_status || o.status || '').replace(/_/g, ' ')}`, 14, 56)

    if (o.User) {
      doc.text(`Customer: ${o.User.name || '—'} (${o.User.email || '—'})`, 14, 62)
    }

    if (addr) {
      const addrParts = [
        addr.flat_house_no || addr.address_line1,
        addr.area_street || addr.address_line2,
        addr.city,
        addr.state,
        addr.pincode,
      ]
        .filter(Boolean)
        .join(', ')
      doc.text(`Ship to: ${addrParts}`, 14, 68)
    }

    autoTable(doc, {
      startY: 76,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: items.map((item: any) => [
        item.Product?.name || item.product_name || '—',
        item.quantity ?? '—',
        `₹${Number(item.unit_price || item.price || 0).toFixed(2)}`,
        `₹${Number(item.subtotal || (Number(item.quantity || 0) * Number(item.unit_price || item.price || 0))).toFixed(2)}`,
      ]),
      foot: [['', '', 'Grand Total', `₹${Number(o.total_amount || 0).toFixed(2)}`]],
      headStyles: { fillColor: [0, 63, 98] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    })

    doc.save(`invoice-${String(o.id).slice(0, 8)}.pdf`)
  }

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      router.push('/admin/login')
      return
    }

    ordersApi
      .getById(orderId)
      .then((data) => {
        const o = data as AnyOrder
        setOrder(data)
        setNewStatus(o?.delivery_status || o?.status || 'pending')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn, isAdmin, orderId, router])

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setSaving(true)
    try {
      await ordersApi.updateStatus(orderId, { delivery_status: newStatus })
      setOrder((prev) => (prev ? ({ ...(prev as AnyOrder), delivery_status: newStatus } as Order) : prev))
    } catch {
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    )

  if (!order)
    return (
      <AdminLayout>
        <p className="text-center py-20 text-gray-400">Order not found.</p>
      </AdminLayout>
    )

  const o = order as AnyOrder
  const addr =
    o.shipping_address ||
    o.ShippingAddress ||
    o.shippingAddress ||
    o.UserAddresses?.[0] ||
    null

  const items = o.OrderItems || o.items || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-600">
            Home &gt;{' '}
            <Link href="/admin/orders" className="hover:underline">
              Order List
            </Link>{' '}
            &gt; #{o.id}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Order #: {o.id}</h2>
              <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-semibold capitalize">
                {(o.delivery_status || o.status || 'pending').replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className="px-4 py-2 bg-[#003F62] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Update Status'}
              </button>

              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-green-700"
              >
                <Download size={14} /> Invoice PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer</h3>
                <p className="text-sm text-gray-900">Name: {o.User?.name || addr?.name || '—'}</p>
                <p className="text-sm text-gray-600">Email: {o.User?.email || addr?.email || '—'}</p>
                <p className="text-sm text-gray-600">Phone: {o.User?.phone || addr?.phone || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Order Info</h3>
                <p className="text-sm text-gray-900">Payment: {o.payment_method || '—'}</p>
                <p className="text-sm text-gray-600">Payment Status: {o.payment_status || '—'}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(o.createdAt || o.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Deliver to</h3>
                {addr ? (
                  <>
                    <p className="text-sm text-gray-900">{addr.address_line1 || addr.flat_house_no || '—'}</p>
                    {(addr.address_line2 || addr.area_street) && (
                      <p className="text-sm text-gray-600">{addr.address_line2 || addr.area_street}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {addr.city || '—'}, {addr.state || '—'} {addr.pincode || ''}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No address</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Products</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {item.Product?.name || item.product_name || '—'}
                    {item.variant_label && (
                      <span className="ml-1 text-xs text-gray-500">({item.variant_label})</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{item.quantity ?? '—'}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    ₹{Number(item.unit_price || item.price || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                    ₹
                    {Number(
                      item.subtotal || (Number(item.quantity || 0) * Number(item.unit_price || item.price || 0))
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>₹{Number(o.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default OrderDetailsPage
