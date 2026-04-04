'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { paymentApi, ordersApi, usersApi, settingsApi, type Address } from '@/lib/api'
import { ShoppingBag, ChevronDown, CreditCard } from 'lucide-react'

declare global {
  interface Window { Razorpay: any }
}

interface CheckoutItem {
  id: string
  name: string
  price: number
  imageUrl?: string
  quantity: number
  variant_label?: string
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh','Lakshadweep','Andaman & Nicobar Islands','Dadra & Nagar Haveli and Daman & Diu']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { isLoggedIn } = useAuth()

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [directItems, setDirectItems] = useState<CheckoutItem[]>([])
  const [isDirectCheckout, setIsDirectCheckout] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'razorpay'>('razorpay')
  const [shippingCost, setShippingCost] = useState(60)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(600)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address_line1: '', address_line2: '',
    city: '', state: '', pincode: '',
  })

  // Load shipping settings
  useEffect(() => {
    settingsApi.getShipping()
      .then(res => {
        if (res.value) {
          setShippingCost(res.value.cost ?? 60)
          setFreeShippingThreshold(res.value.free_threshold ?? 600)
        }
      })
      .catch(() => {})
  }, [])

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (isLoggedIn) {
      setLoadingAddresses(true)
      usersApi.getAddresses()
        .then(setSavedAddresses)
        .catch(() => {})
        .finally(() => setLoadingAddresses(false))
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const directMode = new URLSearchParams(window.location.search).get('direct') === '1'
    setIsDirectCheckout(directMode)

    if (!directMode) {
      setDirectItems([])
      return
    }

    try {
      const raw = sessionStorage.getItem('kn_direct_checkout')
      const parsed = raw ? JSON.parse(raw) : []
      setDirectItems(Array.isArray(parsed) ? parsed : [])
    } catch {
      setDirectItems([])
    }
  }, [])

  const checkoutItems = isDirectCheckout && directItems.length > 0 ? directItems : items
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const fillFromAddress = (addr: Address) => {
    setForm({
      name: `${addr.first_name} ${addr.last_name}`.trim(),
      email: form.email,
      phone: addr.phone || '',
      address_line1: `${addr.flat_house_no}, ${addr.area_street}`.trim(),
      address_line2: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    })
  }

  const shipping = checkoutTotal >= freeShippingThreshold ? 0 : shippingCost
  const grandTotal = checkoutTotal + shipping

  const shippingAddress = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    address_line1: form.address_line1,
    address_line2: form.address_line2,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (checkoutItems.length === 0) { setError('Your checkout is empty.'); return }
    setPaying(true)

    // ── Razorpay Online Payment ──────────────────────────────────────────────
    const loaded = await loadRazorpayScript()
    if (!loaded) { setError('Failed to load Razorpay. Check your internet connection.'); setPaying(false); return }

    try {
      // Step 1: Create Razorpay order on backend
      const rzpOrder = await paymentApi.createOrder(grandTotal)

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: "KaVi's Naturals",
        description: `Order of ${checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} item(s)`,
        image: '/images/logo.png',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment signature
            const verification = await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }) as any

            if (verification.status !== 'success') {
              setError('Payment verification failed. Please contact support.')
              setPaying(false)
              return
            }

            // Step 4: Create order in our DB
            const order = await ordersApi.create({
              items: checkoutItems.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price, variant_label: i.variant_label })),
              total_amount: grandTotal,
              shipping_address: shippingAddress,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            } as any)

            if (isDirectCheckout && typeof window !== 'undefined') {
              sessionStorage.removeItem('kn_direct_checkout')
            } else {
              clearCart()
            }
            router.push(`/order-success?id=${order.id}`)
          } catch (err: any) {
            setError(err?.message || 'Order could not be saved after payment. Contact support with payment ID: ' + response.razorpay_payment_id)
            setPaying(false)
          }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { address: `${form.address_line1}, ${form.city}, ${form.state} ${form.pincode}` },
        theme: { color: '#92D050' },
        modal: { ondismiss: () => setPaying(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`)
        setPaying(false)
      })
      rzp.open()
    } catch (err: any) {
      setError(err?.message || 'Could not initiate payment. Try again.')
      setPaying(false)
    }
  }

  if (checkoutItems.length === 0 && !paying) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
          <ShoppingBag size={64} className="mx-auto text-gray-300" strokeWidth={1} />
          <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-gray-500">Add some products before checking out.</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors">
            Browse Shop
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">Checkout</span>
        </p>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Login prompt if not logged in */}
        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-yellow-800 text-sm font-medium">Log in to use saved addresses and track orders easily.</p>
            <Link href="/" className="text-yellow-900 underline text-sm font-semibold">Login / Sign Up</Link>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
            <button className="ml-2 underline" onClick={() => setError('')}>dismiss</button>
          </div>
        )}

        <form onSubmit={handlePay}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Shipping form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Shipping Details</h2>

                {/* Saved addresses */}
                {isLoggedIn && savedAddresses.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Use Saved Address</label>
                    <div className="space-y-2">
                      {savedAddresses.map(addr => (
                        <button type="button" key={addr.id} onClick={() => fillFromAddress(addr)}
                          className="w-full text-left p-3 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors text-sm">
                          <span className="font-semibold">{addr.first_name} {addr.last_name}</span> — {addr.flat_house_no}, {addr.area_street}, {addr.city}, {addr.state} - {addr.pincode}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Or fill in manually below:</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1 *</label>
                    <input required value={form.address_line1} onChange={e => setForm({...form, address_line1: e.target.value})}
                      placeholder="Flat/House No., Building, Street"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 2 / Landmark</label>
                    <input value={form.address_line2} onChange={e => setForm({...form, address_line2: e.target.value})}
                      placeholder="Landmark, Area (optional)"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                    <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                      placeholder="City"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode *</label>
                    <input required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                    <div className="relative">
                      <select required value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-sm appearance-none">
                        <option value="">Select State</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay' ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')} className="accent-green-600 w-4 h-4" />
                    <CreditCard size={22} className="text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Online Payment (Razorpay)</p>
                      <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets — Secured by Razorpay</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right - Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {checkoutItems.map(item => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-lg relative flex-shrink-0 border border-gray-200 overflow-hidden">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl">🛒</span>
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#003F62] text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{checkoutTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400">Add ₹{(freeShippingThreshold - checkoutTotal).toFixed(0)} more for free shipping</p>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full mt-5 py-4 bg-[#003F62] text-white font-bold rounded-xl hover:bg-[#002a42] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
                >
                  {paying ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span>Placing Order...</span>
                    </span>
                  ) : (
                    `Pay ₹${grandTotal.toFixed(0)} with Razorpay`
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  🔒 Payments secured by Razorpay
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  )
}
