'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react'
import { productsApi, Product, API_BASE_URL, normalizeUrl } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

function getProductImage(product: Product) {
  const url = product.imageUrl || product.image_url || product.imagePath || product.image_path
  if (!url) return '/images/placeholder.svg'
  if (url.startsWith('/')) return url
  if (url.startsWith('http')) return normalizeUrl(url)
  return `${API_BASE_URL}/uploads/${url}`
}

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([])
  const { addItem } = useCart()
  const { toggle, isInWishlist } = useWishlist()

  useEffect(() => {
    productsApi.getAll({ featured: true })
      .then((data) => { if (data.length > 0) setProducts(data.slice(0, 6)) })
      .catch(() => {})
  }, [])

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      ))}
    </div>
  )

  if (products.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Most Loved Legends</h2>
          <p className="section-subtitle subtitle-underline">Best Sellers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const hasVariants = Array.isArray((product as any).options) && (product as any).options.length > 0
            const allVariantsOOS = hasVariants && (product as any).options.every((v: any) => Number(v.stock ?? -1) === 0)
            const isOOS = hasVariants ? allVariantsOOS : Number(product.stock ?? 0) <= 0
            return (
            <div
              key={product.id}
              className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
            >
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className={`w-full h-full object-contain p-6 ${isOOS ? 'opacity-50' : ''}`}
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                  />
                </Link>
                {isOOS && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">OUT OF STOCK</span>
                  </div>
                )}
                {!isOOS && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/10 pointer-events-none">
                    <div className="flex space-x-4 pointer-events-auto">
                      <button
                        onClick={() => {
                          if (hasVariants) { window.location.href = `/product/${product.id}` }
                          else { addItem({ id: product.id, name: product.name, price: Number(product.price), imageUrl: getProductImage(product), maxStock: Number(product.stock ?? 0) }) }
                        }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors"
                        title={hasVariants ? 'Select variant' : 'Add to Cart'}
                      >
                        <ShoppingCart size={18} />
                      </button>
                      <button
                        onClick={() => toggle(product.id)}
                        className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
                        title="Wishlist"
                      >
                        <Heart size={18} />
                      </button>
                      <Link href={`/product/${product.id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors">
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">({product.reviews_count}) Reviews</span>
                </div>
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                {isOOS ? (
                  <p className="text-sm font-semibold text-red-500 mb-2">Out of Stock</p>
                ) : (
                  <>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-xl font-bold text-gray-800">&#8377;{Number(product.price).toFixed(2)}</span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">&#8377;{Number(product.original_price).toFixed(2)}</span>
                      )}
                    </div>
                    {product.original_price && (
                      <p className="text-xs font-semibold text-primary">
                        You&apos;ll Save &#8377;{(Number(product.original_price) - Number(product.price)).toFixed(0)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BestSellers
