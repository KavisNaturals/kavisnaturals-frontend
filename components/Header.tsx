'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, User, Heart, ShoppingCart, Menu, X, Plus, Minus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AuthModal from './AuthModal'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { productsApi, categoriesApi, settingsApi, type Product, API_BASE_URL, normalizeUrl } from '@/lib/api'

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [freeShippingMin, setFreeShippingMin] = useState<number>(600)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isLoggedIn, logout } = useAuth()
  const { count: cartCount, items: cartItems, total: cartTotal, removeItem, updateQty } = useCart()
  const { count: wishlistCount } = useWishlist()

  // Load free shipping threshold
  useEffect(() => {
    settingsApi.getShipping()
      .then(res => { if (res?.value?.free_threshold) setFreeShippingMin(res.value.free_threshold) })
      .catch(() => {})
  }, [])

  // Load categories from API
  useEffect(() => {
    categoriesApi.getAll()
      .then(cats => {
        if (cats && cats.length > 0) {
          setCategories(cats.filter((c: any) => c.is_active !== false).map((c: any) => c.name))
        } else {
          // Fallback from products
          categoriesApi.fromProducts().then(names => setCategories(names || [])).catch(() => {})
        }
      })
      .catch(() => {
        categoriesApi.fromProducts().then(names => setCategories(names || [])).catch(() => {})
      })
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (searchQuery.length < 2) { setSearchResults([]); setShowSearchDropdown(false); return }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await productsApi.getAll({ search: searchQuery })
        const arr = Array.isArray(results) ? results : (results as any)?.products || []
        setSearchResults(arr.slice(0, 6))
        setShowSearchDropdown(true)
      } catch { /* silent */ }
    }, 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [searchQuery])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const getProductImage = (p: Product) => {
    const url = p?.imageUrl || p?.image_url || p?.imagePath || p?.image_path
    if (!url) return '/images/shop-cart/img-1.png'
    if (url.startsWith('/')) return url
    if (url.startsWith('http')) return normalizeUrl(url)
    return `${API_BASE_URL}/uploads/${url}`
  }

  const handleSearchSelect = (p: Product) => {
    setShowSearchDropdown(false)
    setShowMobileSearch(false)
    setSearchQuery('')
    router.push(`/product/${p.id}`)
  }

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return
    setShowSearchDropdown(false)
    setShowMobileSearch(false)
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }

  const handleCategoryClick = (category: string) => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push(`/shop?category=${encodeURIComponent(category)}`)
  }

  return (
    <header className="w-full">
      {/* Top Green Strip - Marquee */}
      <div className="bg-primary text-black text-base py-4 overflow-hidden font-roboto font-medium leading-none tracking-normal">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="mx-8">★ Free Shipping above Rs. {freeShippingMin} Order ★</span>
          <span className="mx-8">★ We Deliver across all Over India ★</span>
          <span className="mx-8">★ Free Shipping above Rs. {freeShippingMin} Order ★</span>
          <span className="mx-8">★ We Deliver across all Over India ★</span>
          <span className="mx-8">★ Free Shipping above Rs. {freeShippingMin} Order ★</span>
          <span className="mx-8">★ We Deliver across all Over India ★</span>
          <span className="mx-8">★ Free Shipping above Rs. {freeShippingMin} Order ★</span>
          <span className="mx-8">★ We Deliver across all Over India ★</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-black hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={28} strokeWidth={2} />
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="Kavi's Naturals Logo" 
                className="h-16 md:h-28 w-auto"
                onError={(e) => {
                  // Fallback logo if image fails to load
                  e.currentTarget.style.display = 'none'
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = `
                      <div class="bg-primary text-white px-3 py-2 md:px-4 md:py-3 rounded-lg font-bold text-lg md:text-xl flex items-center">
                        <span class="text-white mr-1">🌿</span>
                        KaVi's
                        <span class="text-xs ml-1 bg-white text-primary px-1 rounded">NATURALS</span>
                      </div>
                    `
                  }
                }}
              />
            </div>

            {/* Search Bar - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8 relative" ref={searchRef}>
              <div className="flex w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); if (e.key === 'Escape') { setShowSearchDropdown(false); setSearchQuery('') } }}
                  placeholder="Search products..."
                  className="flex-1 px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-300 border-r-0 rounded-l-lg text-sm lg:text-base font-roboto focus:outline-none focus:border-primary bg-white"
                />
                <button onClick={handleSearchSubmit} className="bg-primary text-white px-4 lg:px-5 py-2 lg:py-3 rounded-r-lg hover:bg-primary-dark transition-colors flex items-center justify-center">
                  <Search size={20} className="lg:w-6 lg:h-6" strokeWidth={2.5} />
                </button>
              </div>
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] overflow-hidden">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => handleSearchSelect(p)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image src={getProductImage(p)} alt={p.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 flex-shrink-0">₹{Number(p.price || 0).toFixed(0)}</span>
                    </button>
                  ))}
                  <button onClick={handleSearchSubmit} className="w-full py-2.5 text-sm text-primary font-medium hover:bg-primary/5 transition-colors">
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6">
              {/* Search icon for mobile only */}
              <button onClick={() => setShowMobileSearch(v => !v)} className="md:hidden flex flex-col items-center text-black hover:text-primary transition-colors">
                <Search size={24} strokeWidth={1.5} />
              </button>
              
              {/* User icon - dropdown menu */}
              <div className="relative hidden sm:block" ref={userDropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex flex-col items-center text-black hover:text-primary transition-colors"
                >
                  <User size={24} className="lg:w-7 lg:h-7" strokeWidth={1.5} />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                    {isLoggedIn ? (
                      <>
                        <a
                          href="/my-account"
                          className="block px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors border-b border-gray-100 font-roboto font-medium text-base"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          My Account
                        </a>
                        <a
                          href="/my-orders"
                          className="block px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors border-b border-gray-100 font-roboto font-medium text-base"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          My Orders
                        </a>
                        <button
                          onClick={() => {
                            logout()
                            setIsUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors font-roboto font-medium text-base"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true)
                            setIsUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors border-b border-gray-100 font-roboto font-medium text-base"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true)
                            setIsUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors font-roboto font-medium text-base"
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Heart icon - navigate to wishlist */}
              <a href="/wishlist" className="flex flex-col items-center text-black hover:text-primary transition-colors relative">
                <Heart size={24} className="lg:w-7 lg:h-7" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </a>
              
              {/* Cart icon - opens cart drawer */}
              <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center text-black hover:text-primary transition-colors relative">
                <ShoppingCart size={24} className="lg:w-7 lg:h-7" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-2 relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); if (e.key === 'Escape') setShowMobileSearch(false) }}
              placeholder="Search products..."
              autoFocus
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-l-lg text-sm focus:outline-none focus:border-primary bg-white"
            />
            <button onClick={handleSearchSubmit} className="bg-primary text-white px-4 py-2.5 rounded-r-lg hover:bg-primary-dark transition-colors">
              <Search size={18} />
            </button>
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] overflow-hidden">
                {searchResults.map(p => (
                  <button key={p.id} onClick={() => handleSearchSelect(p)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image src={getProductImage(p)} alt={p.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 flex-shrink-0">₹{Number(p.price || 0).toFixed(0)}</span>
                  </button>
                ))}
                <button onClick={handleSearchSubmit} className="w-full py-2.5 text-sm text-primary font-medium hover:bg-primary/5 transition-colors">
                  See all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Bar - Desktop */}
      <div className="hidden lg:block bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-12 py-3">
            {/* Browse All Category Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-primary text-black px-8 py-3 rounded-lg flex items-center space-x-3 hover:bg-primary-dark transition-colors font-roboto font-semibold text-2xl leading-none tracking-normal"
              >
                <Menu size={20} />
                <span>Browse All Category</span>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No categories found</div>
                  ) : categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors border-b border-gray-100 last:border-b-0 font-roboto font-medium text-lg leading-none tracking-normal"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex space-x-12">
              <a href="/" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Home
              </a>
              <a href="/shop" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Shop
              </a>
              <a href="/track-order" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Track Order
              </a>
              <a href="/return" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Return
              </a>
              {/* <a href="/wishlist" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Wishlist
              </a>
              <a href="/my-orders" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                My Orders
              </a> */}
              <a href="/contact" className="text-black hover:text-primary font-roboto font-semibold text-2xl leading-none tracking-normal transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-roboto font-bold text-xl">Menu</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X size={28} strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 border-r-0 rounded-l-lg text-sm font-roboto focus:outline-none focus:border-primary bg-white"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark transition-colors flex items-center justify-center">
                <Search size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories Section */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-roboto font-semibold text-lg mb-3 text-gray-700">Categories</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary hover:text-black transition-colors rounded-lg font-roboto font-medium text-base"
                  >
                    {category}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-400 px-4">No categories yet</p>
                )}
              </div>
            </div>

            {/* Main Navigation Links */}
            <nav className="p-4 space-y-2">
              <h3 className="font-roboto font-semibold text-lg mb-3 text-gray-700">Navigation</h3>
              <a 
                href="/" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="/shop" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </a>
              <a 
                href="/track-order" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Track Order
              </a>
              <a 
                href="/return" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Return
              </a>
              <a 
                href="/wishlist" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wishlist
              </a>
              <a 
                href="/my-orders" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </a>
              <a 
                href="/my-account" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Account
              </a>
              <a 
                href="/contact" 
                className="block px-4 py-3 text-black hover:bg-gray-100 rounded-lg font-roboto font-medium text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <a 
              href="#" 
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-roboto font-medium text-base transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={20} />
              <span>My Account</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsCartOpen(false)} />
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Your Cart ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <ShoppingCart size={56} strokeWidth={1} />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <button onClick={() => { setIsCartOpen(false); router.push('/shop') }} className="px-6 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Browse Shop
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-start space-x-4 border-b border-gray-100 pb-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛒</div>
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{(item.price * item.quantity).toFixed(0)}</p>
                      <p className="text-xs text-gray-500">₹{item.price}/ea</p>
                      {/* Qty controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1, item.variant_label)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1, item.variant_label)}
                          disabled={item.maxStock != null && item.maxStock > 0 && item.quantity >= item.maxStock}
                          className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {item.maxStock != null && item.maxStock > 0 && item.quantity >= item.maxStock && (
                        <p className="text-xs text-orange-500 mt-0.5">Max stock reached</p>
                      )}
                    </div>
                    {/* Remove */}
                    <button onClick={() => removeItem(item.id, item.variant_label)} className="text-gray-400 hover:text-red-500 transition-colors mt-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); router.push('/checkout') }}
                  className="w-full py-3 bg-[#003F62] text-white font-bold rounded-xl hover:bg-[#002a42] transition-colors text-base"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => { setIsCartOpen(false); router.push('/shop') }}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header