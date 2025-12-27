'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

const HeroBanner = () => {
  const bannerImages = [
    {
      id: 1,
      src: '/images/banner-2.png',
      alt: 'Natural Organic Products Banner 1'
    },
    {
      id: 2,
      src: '/images/banner-3.png',
      alt: 'Natural Organic Products Banner 2'
    },
    {
      id: 3,
      src: '/images/banner-2.png',
      alt: 'Natural Organic Products Banner 3'
    },
    {
      id: 4,
      src: '/images/banner-3.png',
      alt: 'Natural Organic Products Banner 4'
    },
    {
      id: 5,
      src: '/images/banner-2.png',
      alt: 'Natural Organic Products Banner 5'
    }
  ]

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={false}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="w-full h-[320px] md:h-[320px] lg:h-[400px]"
      >
        {bannerImages.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full">
              {/* Banner Image */}
              <img 
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full  object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#9EE94C"/>
                      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
                        Banner ${banner.id}
                      </text>
                    </svg>
                  `)
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          width: 12px !important;
          height: 12px !important;
        }
        
        .swiper-pagination-bullet-active {
          background: #9EE94C !important;
          transform: scale(1.2);
        }
        
        .swiper-pagination {
          bottom: 20px !important;
        }

        /* Hide pagination bullets for the banner */
        .swiper-pagination {
          display: none !important;
        }
      `}</style>
    </section>
  )
}

export default HeroBanner