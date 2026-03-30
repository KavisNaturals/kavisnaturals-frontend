'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-label="X (Twitter)">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)
import { settingsApi, type SocialLinks } from '@/lib/api'

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})

  useEffect(() => {
    settingsApi.getSocialLinks()
      .then(res => setSocialLinks(res.value || {}))
      .catch(() => {})
  }, [])

  return (
    <footer style={{ backgroundColor: '#9EE94C' }} className="text-gray-900">

      {/* ── Main 4-column section ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1: Company info */}
          <div className="space-y-3">
            <h4 className="font-bold text-base">Kavi&apos;s Naturals</h4>
            <p className="text-sm leading-relaxed">
              Sri Mahaliammam Agro Products
              <br />S.F.No: 123/6A, Kummakkalipalayam,
              <br />Perundurai-638052 Erode,
              <br />Tamilnadu, India
            </p>
            <p className="text-sm">Gmail:- kavisnaturals@gmail.com</p>
            <p className="text-sm">Phone number:- +91 98422 22355, 98429 22355</p>
          </div>

          {/* Col 2: Useful Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">Useful Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-900 hover:text-black">Home</Link></li>
              <li><Link href="/shop" className="text-sm text-gray-900 hover:text-black">Shop</Link></li>
              <li><Link href="/cart" className="text-sm text-gray-900 hover:text-black">Cart</Link></li>
              <li><Link href="/track-order" className="text-sm text-gray-900 hover:text-black">Track Order</Link></li>
            </ul>
          </div>

          {/* Col 3: Help */}
          <div>
            <h3 className="text-base font-semibold mb-4">Help</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-sm text-gray-900 hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-sm text-gray-900 hover:text-black">Terms &amp; Conditions</Link></li>
              <li><Link href="/shipping-policy" className="text-sm text-gray-900 hover:text-black">Shipping Policy</Link></li>
              <li><Link href="/return" className="text-sm text-gray-900 hover:text-black">Cancellations &amp; Returns</Link></li>
              <li><Link href="/my-account" className="text-sm text-gray-900 hover:text-black">Refund &amp; Returns Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: Join our Community */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Join our Community</h3>
            <p className="text-sm leading-relaxed">
              Stay informed about our latest offers, bulk order discounts, and exclusive deals. Sign up now to receive updates directly in your inbox.
            </p>
            <div className="flex items-center bg-white border-2 border-black rounded-full w-full px-5 py-3">
              <input
                type="email"
                placeholder="Enter Your E-mail Address"
                className="flex-1 bg-transparent outline-none text-sm min-w-0 text-gray-700"
              />
              <button className="text-sm font-bold text-black whitespace-nowrap ml-3 hover:opacity-70 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Follow us on ── */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <h5 className="text-base font-semibold mb-3">Follow us on</h5>
        <div className="flex items-center space-x-3">
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-black/30 rounded flex items-center justify-center hover:bg-black/10 transition-colors">
              <Facebook size={16} />
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-black/30 rounded flex items-center justify-center hover:bg-black/10 transition-colors">
              <Instagram size={16} />
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-black/30 rounded flex items-center justify-center hover:bg-black/10 transition-colors">
              <XIcon />
            </a>
          )}
          {socialLinks.youtube && (
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-black/30 rounded flex items-center justify-center hover:bg-black/10 transition-colors">
              <Youtube size={16} />
            </a>
          )}
          {/* Placeholder icons when no links are configured */}
          {!socialLinks.facebook && !socialLinks.instagram && !socialLinks.twitter && !socialLinks.youtube && (
            <>
              {([Facebook, Instagram, Linkedin] as React.FC<{ size: number }>[]).map((Icon, i) => (
                <span key={i} className="w-9 h-9 border border-black/30 rounded flex items-center justify-center">
                  <Icon size={16} />
                </span>
              ))}
              <span className="w-9 h-9 border border-black/30 rounded flex items-center justify-center">
                <XIcon />
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm order-last md:order-first">
              &copy; 2026 Kavi&apos;s Naturals All Rights Reserved | Made By Dribblu Tech 
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium whitespace-nowrap">100% SECURE PAYMENTS POWERED BY</span>
                <Image src="/images/razorpay.png" alt="Razorpay" width={80} height={22} className="object-contain" style={{ height: 'auto' }} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/phonepay.png" alt="PhonePe" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/upi.png" alt="UPI" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/paypal.png" alt="PayPal" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/gpay.png" alt="GPay" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/paytm.png" alt="Paytm" width={32} height={32} className="object-contain" />
                </div>
                {/* <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                  <Image src="/images/world.png" alt="Card" width={32} height={32} className="object-contain" />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer