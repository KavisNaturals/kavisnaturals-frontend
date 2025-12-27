'use client'

import React from 'react'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#9EE94C' }} className="text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Company info */}
          <div className="space-y-6 lg:col-span-1">
            <h4
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '18px', lineHeight: '150%', letterSpacing: '0%' }}
            >
              Kavi's Naturals
            </h4>
            <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }}>
              Sri Mahaliammam Agro Products
              <br />S.F.No: 123/6A, Kummakkalipalayam,
              <br />Perundurai-638052 Erode,
              <br />Tamilnadu, India
            </p>
            <p className="text-sm mt-3" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '100%' }}>Gmail: kavisnaturals@gmail.com</p>
            <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '100%' }}>Phone: +91 98422 22355, 98429 22355</p>
          </div>

          {/* Middle: Useful Links & Help */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-4 text-left">
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '18px', lineHeight: '150%', letterSpacing: '0%' }}>Useful Links</h3>
                <ul className="space-y-3 mt-2">
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Home</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Shop</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Cart</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Track Order</a></li>
                </ul>
              </div>

              <div className="space-y-4 text-left">
                <h3 style={{ fontFamily: 'var(--font-sans)' , fontWeight: 600, fontSize: '18px', lineHeight: '150%', letterSpacing: '0%' }}>Help</h3>
                <ul className="space-y-3 mt-2">
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Privacy Policy</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Terms & Conditions</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Shipping Policy</a></li>
                  <li><a href="#"  style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15.75px', lineHeight: '150%', letterSpacing: '0%' }} className="text-gray-900 text-sm">Cancellations & Returns</a></li>
                </ul>
              </div>
          </div>

          {/* Right: Newsletter & small payment icons */}
          <div className="space-y-4 flex flex-col items-start w-3/4 lg:col-span-1">
            <h3 className="force-sans" style={{ fontWeight: 600, fontSize: '16px', lineHeight: '150%', letterSpacing: '0%' }}>Join our Community</h3>
            <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '15px', lineHeight: '150%' }}>
              Stay informed about our latest offers, bulk order discounts, and exclusive deals. Sign up now to receive updates directly in your inbox.
            </p>

            <div className="mt-4 w-full">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch border-2 border-black/10 bg-white rounded-full sm:rounded-full overflow-hidden w-full">
                <input type="email" placeholder="Enter Your E-mail Address" className="flex-1 px-4 sm:px-6 py-3 bg-transparent outline-none text-sm" />
                <button className="px-4 sm:px-6 py-3 font-semibold whitespace-nowrap bg-white hover:bg-gray-50 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social row */}
      <div className="max-w-7xl mx-auto px-6 pb-6 border-t border-black/10">
        <div className="pt-6">
          <div>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '20px', lineHeight: '150%', letterSpacing: '0%' }} className="mb-4">Follow us on</h5>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-10 h-10 border border-black/20 rounded flex items-center justify-center text-black">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-black/20 rounded flex items-center justify-center text-black">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-black/20 rounded flex items-center justify-center text-black">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-black/20 rounded flex items-center justify-center text-black">
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: copyright + payments */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-gray-900 text-sm">© 2025 Kavi's Naturals All Rights Reserved</p>

            <div className="flex flex-col items-center w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full lg:w-auto">
              <span className="text-gray-900 text-xs">100% SECURE PAYMENTS POWERED BY</span>
              <div className="flex-shrink-0">
                <Image src="/images/razorpay.png" alt="Razorpay" width={110} height={28} />
              </div>
            </div>
              <div className="flex items-center justify-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/upi.png" alt="UPI" width={32} height={32} />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/phonepay.png" alt="PhonePe" width={32} height={32} />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/paypal.png" alt="PayPal" width={32} height={32} />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/gpay.png" alt="GPay" width={32} height={32} />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/paytm.png" alt="Paytm" width={32} height={32} />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src="/images/world.png" alt="Card" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer