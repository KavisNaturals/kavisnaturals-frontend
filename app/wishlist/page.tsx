'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Trash2, Eye } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { API_BASE_URL } from '@/lib/api'

function getImage(p: any) {
  const url = p.imageUrl || p.image_url || p.imagePath || p.image_path
  if (!url) return '/images/placeholder.svg'
  if (url.startsWith('http') || url.startsWith('/')) return url
  return `${API_BASE_URL}/uploads/${url}`
}

const WishlistPage = () => {
  const { items, toggle, loading } = useWishlist()
  const { addItem } = useCart()

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} size={14} className={star <= Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="w-full py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Wishlist</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center min-h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 mb-6">Your wishlist is empty.</p>
              <Link href="/shop" className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => {
                const product = (item.Product || item) as any
                const pid = item.product_id || item.id
                return (
                  <div key={item.id} className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
                    <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                      <Image src={getImage(product)} alt={product.name || 'Product'} width={500} height={500} className="object-contain p-6" />
                      <div className="absolute flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ bottom: '4rem', left: '50%', transform: 'translateX(-50%)' }}>
                        <button onClick={() => addItem({ id: pid, name: product.name, price: Number(product.price || product.sale_price || 0), imageUrl: getImage(product) })}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary transition-colors">
                          <ShoppingCart size={18} strokeWidth={2} />
                        </button>
                        <button onClick={() => toggle(pid)}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-100 transition-colors text-red-500">
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                        <Link href={`/product/${pid}`}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary transition-colors">
                          <Eye size={18} strokeWidth={2} />
                        </Link>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {renderStars(Number(product.rating || product.average_rating || 0))}
                        <span className="text-xs text-gray-600">({product.review_count || 0})</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm">{product.name}</h3>
                      {product.short_description && <p className="text-xs text-gray-600 mb-3">{product.short_description}</p>}
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-base font-bold text-gray-800">₹{Number(product.sale_price || product.price || 0).toFixed(0)}</span>
                        {product.original_price && <span className="text-xs text-gray-400 line-through">₹{Number(product.original_price).toFixed(0)}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default WishlistPage
