'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productsApi, Product, API_BASE_URL, normalizeUrl } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const CATEGORIES = ['All Products', 'Hair Care', 'Personal Care', 'Health Care', 'Home Care', 'Women Care']

function getProductImage(product: Product) {
  const url = product.imageUrl || product.image_url || product.imagePath || product.image_path
  if (!url) return '/images/placeholder.svg'
  if (url.startsWith('/')) return url
  if (url.startsWith('http')) return normalizeUrl(url)
  return `${API_BASE_URL}/uploads/${url}`
}

function ShopContent() {
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All Products')
  const [sortBy, setSortBy] = useState('featured')

  // Sync when URL params change (e.g. navigating here from the header dropdown)
  useEffect(() => {
    const cat = searchParams.get('category') || 'All Products'
    setSelectedCategory(cat)
  }, [searchParams])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const { addItem } = useCart()
  const { toggle, isInWishlist } = useWishlist()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: { category?: string; sort?: string } = {}
      if (selectedCategory && selectedCategory !== 'All Products') params.category = selectedCategory
      if (sortBy === 'price-low') params.sort = 'price-low'
      else if (sortBy === 'price-high') params.sort = 'price-high'
      else if (sortBy === 'rating') params.sort = 'rating'
      const data = await productsApi.getAll(params)
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, sortBy])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} className={star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="w-full py-12" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Shop</h1>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-100">
            <div className="text-gray-600">
              <span className="font-semibold">{products.length}</span> Products Found
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const hasVariants = Array.isArray((product as any).options) && (product as any).options.length > 0
                const allVariantsOOS = hasVariants && (product as any).options.every((v: any) => Number(v.stock ?? -1) === 0)
                const isOOS = hasVariants ? allVariantsOOS : Number(product.stock ?? 0) <= 0

                return (
                <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                  <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                    <Link href={`/product/${product.id}`} className="block w-full h-full">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className={`w-full h-full object-contain p-8 ${isOOS ? 'opacity-50' : ''}`}
                        onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                      />
                    </Link>
                    {isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wide">OUT OF STOCK</span>
                      </div>
                    )}
                    {!isOOS && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 pointer-events-none">
                        <div className="flex space-x-2 pointer-events-auto">
                          <button
                            onClick={() => {
                              if (hasVariants) {
                                window.location.href = `/product/${product.id}`
                              } else {
                                addItem({ id: product.id, name: product.name, price: Number(product.price), imageUrl: getProductImage(product), maxStock: Number(product.stock ?? 0) })
                              }
                            }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors"
                            title={hasVariants ? 'Select variant' : 'Add to cart'}
                          >
                            <ShoppingCart size={18} />
                          </button>
                          <button
                            onClick={() => toggle(product.id)}
                            className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
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

                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-600">({product.reviews_count})</span>
                    </div>
                    <Link href={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-gray-800 mb-2 text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-1">{product.description}</p>
                    {isOOS ? (
                      <p className="text-sm font-semibold text-red-500">Out of Stock</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                          {product.original_price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.original_price}</span>
                          )}
                        </div>
                        {product.original_price && (
                          <p className="text-xs font-semibold text-green-600 mt-1">You&apos;ll Save ₹{(Number(product.original_price) - Number(product.price)).toFixed(0)}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

const ShopPage = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <ShopContent />
  </Suspense>
)

export default ShopPage
