'use client'

import React from 'react'
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'

const BestSellers = () => {
  const products = [
    {
      id: 1,
      name: 'Aloe vera Shampoo ( 200 ml )',
      price: '₹185',
      originalPrice: '₹200',
      rating: 4.5,
      reviews: 89,
      imagePath: '/images/aloe-vera-shampoo.png',
      category: 'Hair Care'
    },
    {
      id: 2,
      name: 'Milk Protein Shampoo ( 200 ml )',
      price: '₹215',
      originalPrice: '₹250',
      rating: 4.7,
      reviews: 142,
      imagePath: '/images/milk-protein-shampoo.png',
      category: 'Hair Care'
    },
    {
      id: 3,
      name: 'Onion Shampoo ( 200 ml )',
      price: '₹195',
      originalPrice: '₹220',
      rating: 4.6,
      reviews: 167,
      imagePath: '/images/onion-shampoo.png',
      category: 'Hair Care'
    },
    {
      id: 4,
      name: 'Shikakai & Reetha Shampoo ( 200 ml )',
      price: '₹175',
      originalPrice: '₹200',
      rating: 4.4,
      reviews: 98,
      imagePath: '/images/shikakai-shampoo.png',
      category: 'Hair Care'
    },
    {
      id: 5,
      name: 'Natural wash Organic Detergent Liquid ( 500 ml )',
      price: '₹245',
      originalPrice: '₹280',
      rating: 4.8,
      reviews: 203,
      imagePath: '/images/natural-liquid.png',
      category: 'Home Care'
    },
    {
      id: 6,
      name: 'Aavarampoo Tea ( 100 g )',
      price: '₹125',
      originalPrice: '₹150',
      rating: 4.9,
      reviews: 156,
      imagePath: '/images/aavarampoo-tea.png',
      category: 'Health Care'
    }
  ]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">
            Most Loved Legends
          </h2>
          <p className="section-subtitle subtitle-underline">
            Best Sellers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
            >
              {/* Product Image */}
              <div className="relative aspect-square  overflow-hidden">
                <div className="w-full h-full relative">
                  <Image
                    src={product.imagePath}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
                  />
                </div>
              </div>

              {/* Hover Action Buttons */}
              <div className="absolute bottom-[15rem] left-4 right-4 flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors">
                  <ShoppingCart size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors">
                  <Heart size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors">
                  <Eye size={18} />
                </button>
              </div>

              {/* Product Info */}
              <div className="pb-3 text-center">
                {/* Rating */}
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">
                    ({product.reviews}) Reviews
                  </span>
                </div>

                {/* Product Name */}
                <h3
                  className="text-gray-800 mb-3"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: '20px',
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  {product.name}
                </h3>
                
                {/* Product Description */}
                <p
                  className="text-gray-600 mb-3"
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}
                >
                  {product.category === 'Hair Care' ? 'Frizz-Free, Strong & Health Hair' : 
                   product.category === 'Home Care' ? 'Hair Cleanser & hair strong and shiny' :
                   'reducing hair fall & breakage'}
                </p>

                {/* Price */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-xl font-bold text-gray-800">
                    {product.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500">You'll Save ₹35</p>
              </div>
            </div>
          ))}
        </div>

  
      </div>
    </section>
  )
}

export default BestSellers