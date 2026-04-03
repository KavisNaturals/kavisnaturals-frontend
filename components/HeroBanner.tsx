'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { bannersApi, Banner, API_BASE_URL, normalizeUrl } from '@/lib/api'

const FALLBACK_BANNERS = [1, 2, 3].map((id) => ({
  id: String(id),
  image_path: '/images/banner.png',
  title: `Banner ${id}`,
  is_active: true,
}))

function getBannerImageUrl(banner: Banner) {
  const p = banner.image_path
  if (!p) return '/images/banner.png'
  if (p.startsWith('/')) return p
  if (p.startsWith('http')) return normalizeUrl(p)
  return `${API_BASE_URL}/uploads/${p}`
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS)

  useEffect(() => {
    bannersApi.getActive()
      .then((data) => { if (data.length > 0) setBanners(data) })
      .catch(() => {/* keep fallback */})
  }, [])

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-[320px] md:h-[320px] lg:h-[400px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full">
              <img
                src={getBannerImageUrl(banner)}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/images/banner.png' }}
              />
            
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: #9EE94C !important;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          width: 44px !important;
          height: 44px !important;
          margin-top: -22px !important;
        }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 18px !important; font-weight: bold; }
        .swiper-pagination-bullet { background: rgba(255,255,255,0.5) !important; opacity: 1 !important; width: 12px !important; height: 12px !important; }
        .swiper-pagination-bullet-active { background: #9EE94C !important; transform: scale(1.2); }
        .swiper-pagination { bottom: 20px !important; display: none !important; }
      `}</style>
    </section>
  )
}

export default HeroBanner