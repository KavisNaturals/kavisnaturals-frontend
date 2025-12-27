 'use client'

import React from 'react'
import Image from 'next/image'

const OurPromise = () => {
  const promises = [
    {
      id: 1,
      imagePath: '/images/icons/icon-1.png',
      title: 'Plant Based',
      description: 'Made with 100% natural plant-based ingredients for your safety and wellness'
    },
    {
      id: 2,
      imagePath: '/images/icons/icon-2.png',
      title: 'Handmade',
      description: 'Carefully crafted by hand with love and traditional methods for best quality'
    },
    {
      id: 3,
      imagePath: '/images/icons/icon-3.png',
      title: 'No Toxic Chemicals',
      description: 'Free from harmful chemicals, sulfates, parabens and artificial preservatives'
    },
    {
      id: 4,
      imagePath: '/images/icons/icon-4.png',
      title: 'Cruelty-Free & Vegan',
      description: 'Never tested on animals and made with 100% vegan ingredients'
    },
    {
      id: 5,
      imagePath: '/images/icons/icon-5.png',
      title: 'Free Shipping',
      description: 'Enjoy free shipping on orders above ₹600 across all over India'
    }
  ]

  return (
    <section className="py-16" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
      <div className="max-w-8xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="section-title title-underline mb-2">
            Our Promise
          </h2>
          <p className="text-lg text-gray-900/85 max-w-2xl mx-auto">
            Why choose Kavi's Naturals for your natural lifestyle
          </p>
        </div>

        {/* Promises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
          {promises.map((promise) => {
            return (
              <div
                key={promise.id}
                className="text-center group px-4"
              >
                {/* Icon Container (image) */}
                <div className="relative mb-6">
                  <div className="w-35 h-35 mx-auto   flex items-center justify-center  group-hover:scale-110 ">
                    <Image src={promise.imagePath} alt={promise.title} width={55} height={55} className="object-contain" />
                  </div>

                  {/* Background Circle */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto bg-white/30 rounded-full -z-10 group-hover:bg-white/40 transition-colors duration-300"></div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {promise.title}
                  </h3>
                  <p className="text-sm text-gray-900/85 leading-relaxed hidden lg:block">
                    {promise.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>       
      </div>
    </section>
  )
}

export default OurPromise