 'use client'

import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

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

function PromiseCard({ imagePath, title, description }: { imagePath: string; title: string; description: string }) {
  return (
    <div className="text-center group px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Image src={imagePath} alt={title} width={55} height={55} className="object-contain" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-white/30 rounded-full -z-10 group-hover:bg-white/40 transition-colors duration-300"></div>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-900/85 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

const OurPromise = () => {
  return (
    <section className="py-16" style={{ backgroundColor: 'rgb(206, 244, 165)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="section-title title-underline mb-2">
            Our Promise
          </h2>
          <p className="text-lg text-gray-900/85 max-w-2xl mx-auto">
            Why choose Kavi&apos;s Naturals for your natural lifestyle
          </p>
        </div>

        {/* Mobile: Swiper carousel (1 slide per view) */}
        <div className="md:hidden">
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="pb-10"
          >
            {promises.map((p) => (
              <SwiperSlide key={p.id} className="flex justify-center">
                <PromiseCard imagePath={p.imagePath} title={p.title} description={p.description} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: 5-column grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10 items-start">
          {promises.map((p, idx) => (
            <div
              key={p.id}
              className={idx === 4 ? 'md:col-span-2 flex justify-center lg:col-span-1 lg:block' : ''}
            >
              <PromiseCard imagePath={p.imagePath} title={p.title} description={p.description} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurPromise