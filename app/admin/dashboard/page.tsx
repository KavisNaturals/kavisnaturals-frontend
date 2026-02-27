'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { TrendingUp, Package, CheckCircle, Users } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { dashboardApi, type DashboardStats, type SalesChartData } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const AdminDashboard = () => {
  const router = useRouter()
  const { isLoggedIn, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<SalesChartData | null>(null)
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) { router.push('/admin/login'); return }
    Promise.all([
      dashboardApi.getStats().catch(() => null),
      dashboardApi.getSalesChart().catch(() => null),
    ]).then(([s, c]) => {
      if (s) setStats(s)
      if (c) setChartData(c)
    }).finally(() => setLoading(false))
  }, [isLoggedIn, isAdmin, router])

  const statCards = stats ? [
    { title: 'Total Orders', value: stats.totalOrders ?? 0, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Products', value: stats.totalProducts ?? 0, icon: Package, color: 'bg-purple-500' },
    { title: 'Total Users', value: stats.totalUsers ?? 0, icon: Users, color: 'bg-green-500' },
    { title: 'Total Sales', value: `₹${Number(stats.totalSales ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-yellow-500' },
  ] : []

  const recentOrders = stats?.recentOrders || []
  const graphData = chartView === 'daily' ? (chartData?.daily || []) : (chartData?.monthly || [])

  // Show last 7 days or all 12 months
  const displayData = chartView === 'daily' ? graphData.slice(-14) : graphData

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Home &gt; Dashboard</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-600">{stat.title}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Revenue Chart</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setChartView('daily')}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      chartView === 'daily' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >Last 14 Days</button>
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      chartView === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >Monthly (12m)</button>
                </div>
              </div>
              {displayData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No sales data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="revenue"
                      orientation="left"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: any, name?: string): [string, string] | [any, string] => {
                        const key = name || ''
                        return key === 'revenue'
                          ? [`₹${Number(value).toLocaleString()}`, 'Revenue']
                          : [value, 'Orders']
                      }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#003F62" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="revenue" />
                    <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#86efac" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar chart for monthly orders */}
            {chartView === 'monthly' && displayData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Orders</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip formatter={(v: any) => [v, 'Orders']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="orders" fill="#003F62" radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">#{String(order.id).slice(0, 8)}</Link>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{new Date(order.createdAt || order.created_at || '').toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{order.User?.name || order.user_name || '—'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1 text-sm capitalize ${
                            (order.delivery_status || order.status) === 'delivered' ? 'text-green-600' :
                            (order.delivery_status || order.status) === 'cancelled' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              (order.delivery_status || order.status) === 'delivered' ? 'bg-green-600' :
                              (order.delivery_status || order.status) === 'cancelled' ? 'bg-red-600' : 'bg-orange-600'
                            }`} />
                            <span>{(order.delivery_status || order.status || '').replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
