import { getToken, getRefreshToken, saveAuth, clearAuth } from './auth';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Return auth header object if token exists. */
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Try to use the refresh token to get a new access token. Returns true on success. */
let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

async function doRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise(resolve => { refreshQueue.push(resolve); });
  }
  isRefreshing = true;
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    saveAuth(data.token, data.user, data.refreshToken);
    refreshQueue.forEach(resolve => resolve(true));
    return true;
  } catch {
    refreshQueue.forEach(resolve => resolve(false));
    clearAuth();
    return false;
  } finally {
    isRefreshing = false;
    refreshQueue = [];
  }
}

/** Generic fetch wrapper with JSON parsing and error throwing. */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
  isRetry = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeader(),
    ...extraHeaders,
  };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  // Auto-refresh on 401 (once)
  if (res.status === 401 && !isRetry) {
    const refreshed = await doRefresh();
    if (refreshed) {
      return request<T>(method, path, body, extraHeaders, true);
    }
    // Refresh failed — let the error propagate
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
  /** Multipart/form-data upload */
  upload: <T>(path: string, formData: FormData) => request<T>('POST', path, formData),
};

/* -------------------------------------------------------------------------- */
/*  AUTH                                                                        */
/* -------------------------------------------------------------------------- */

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: { id: string; name: string; email: string; role: string; avatar?: string };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post<AuthResponse>('/api/auth/register', { name, email, password, phone }),
};

/* -------------------------------------------------------------------------- */
/*  PRODUCTS                                                                    */
/* -------------------------------------------------------------------------- */

export interface Product {
  id: string;
  name: string;
  description?: string;
  product_description?: string;
  productDescription?: string;
  size?: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews_count: number;
  category?: string;
  image_path?: string;
  image_url?: string;
  imageUrl?: string;
  imagePath?: string;
  images?: string[];
  before_after_image?: string;
  benefits?: string[];
  ingredients?: string[];
  direction?: string;
  options?: { label: string; price: number; stock?: number; image?: string }[];
  stock: number;
  is_featured: boolean;
  sku?: string;
}

export const productsApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    sort?: string;
    featured?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.featured) q.set('featured', 'true');
    return api.get<Product[]>(`/api/products${q.toString() ? `?${q}` : ''}`);
  },
  getById: (id: string) => api.get<Product>(`/api/products/${id}`),
  create: (data: Partial<Product>) =>
    api.post<Product>('/api/products', data),
  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/api/products/${id}`, data),
  delete: (id: string) => api.del<{ message: string }>(`/api/products/${id}`),
};

/* -------------------------------------------------------------------------- */
/*  UPLOAD                                                                      */
/* -------------------------------------------------------------------------- */

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<{ url: string; fileName: string }>('/api/upload', formData);
  },
};

/* -------------------------------------------------------------------------- */
/*  CATEGORIES                                                                  */
/* -------------------------------------------------------------------------- */

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_path?: string;
  sort_order?: number;
  is_active: boolean;
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/api/categories'),
  getAllAdmin: () => api.get<Category[]>('/api/categories/all'),
  fromProducts: () => api.get<string[]>('/api/categories/from-products'),
  create: (data: Partial<Category>) => api.post<Category>('/api/categories', data),
  update: (id: string, data: Partial<Category>) => api.put<Category>(`/api/categories/${id}`, data),
  delete: (id: string) => api.del<{ message: string }>(`/api/categories/${id}`),
};

/* -------------------------------------------------------------------------- */
/*  BANNERS                                                                     */
/* -------------------------------------------------------------------------- */

export interface Banner {
  id: string;
  title?: string;
  image_path: string;
  link?: string;
  sort_order?: number;
  is_active: boolean;
}

export const bannersApi = {
  getActive: () => api.get<Banner[]>('/api/banners'),
  getAll: () => api.get<Banner[]>('/api/banners/all'),
  create: (data: Partial<Banner>) => api.post<Banner>('/api/banners', data),
  update: (id: string, data: Partial<Banner>) => api.put<Banner>(`/api/banners/${id}`, data),
  delete: (id: string) => api.del<{ message: string }>(`/api/banners/${id}`),
};

/* -------------------------------------------------------------------------- */
/*  CONCERNS                                                                    */
/* -------------------------------------------------------------------------- */

export interface Concern {
  id: string;
  title: string;
  image_path?: string;
  sort_order?: number;
  is_active: boolean;
}

export const concernsApi = {
  getActive: () => api.get<Concern[]>('/api/concerns'),
  getAll: () => api.get<Concern[]>('/api/concerns/all'),
  create: (data: Partial<Concern>) => api.post<Concern>('/api/concerns', data),
  update: (id: string, data: Partial<Concern>) => api.put<Concern>(`/api/concerns/${id}`, data),
  delete: (id: string) => api.del<{ message: string }>(`/api/concerns/${id}`),
};

/* -------------------------------------------------------------------------- */
/*  REVIEWS                                                                     */
/* -------------------------------------------------------------------------- */

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  createdAt: string;
  Product?: { name: string; image_path?: string };
}

export const reviewsApi = {
  getForProduct: (productId: string) =>
    api.get<Review[]>(`/api/products/${productId}/reviews`),
  addReview: (productId: string, data: { rating: number; comment: string; user_name: string }) =>
    api.post<Review>(`/api/products/${productId}/reviews`, data),
  getFeatured: (limit?: number) =>
    api.get<Review[]>(`/api/reviews/featured${limit ? `?limit=${limit}` : ''}`),
  getAllAdmin: () => api.get<Review[]>('/api/reviews'),
  deleteReview: (id: string) => api.del<{ message: string }>(`/api/reviews/${id}`),
};

/* -------------------------------------------------------------------------- */
/*  ORDERS                                                                      */
/* -------------------------------------------------------------------------- */

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  variant_label?: string;
  Product?: Product;
}

export interface Order {
  id: string;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'processing' | 'shipped' | 'delivered';
  razorpay_order_id?: string;
  shipping_address?: Record<string, string>;
  createdAt: string;
  OrderItems?: OrderItem[];
  User?: { name: string; email: string };
}

export const ordersApi = {
  create: (data: {
    items: { product_id: string; quantity: number; price: number }[];
    total_amount: number;
    shipping_address?: Record<string, string>;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
  }) => api.post<Order>('/api/orders', data),
  getMyOrders: () => api.get<Order[]>('/api/orders'),
  getById: (id: string) => api.get<Order>(`/api/orders/${id}`),
  track: (orderId: string, email: string) =>
    api.get<Order>(`/api/orders/track?orderId=${orderId}&email=${encodeURIComponent(email)}`),
  getAllAdmin: () => api.get<Order[]>('/api/orders/all'),
  updateStatus: (
    id: string,
    status: { payment_status?: string; delivery_status?: string }
  ) => api.put<Order>(`/api/orders/${id}/status`, status),
};

/* -------------------------------------------------------------------------- */
/*  USER / ADDRESSES                                                            */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  flat_house_no: string;
  area_street: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  is_default: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export const usersApi = {
  getProfile: () => api.get<UserProfile>('/api/users/profile'),
  updateProfile: (data: Partial<UserProfile & { password?: string; currentPassword?: string }>) =>
    api.put<UserProfile>('/api/users/profile', data),
  getAddresses: () => api.get<Address[]>('/api/users/address'),
  saveAddress: (data: Partial<Address>) => api.post<Address>('/api/users/address', data),
  updateAddress: (id: string, data: Partial<Address>) =>
    api.put<Address>(`/api/users/address/${id}`, data),
  deleteAddress: (id: string) => api.del<{ message: string }>(`/api/users/address/${id}`),
  // admin
  getAllUsers: () => api.get<AdminUser[]>('/api/users'),
};

/* -------------------------------------------------------------------------- */
/*  WISHLIST                                                                    */
/* -------------------------------------------------------------------------- */

export interface WishlistItem {
  id: string;
  product_id: string;
  Product?: Product;
}

export const wishlistApi = {
  get: () => api.get<WishlistItem[]>('/api/wishlist'),
  add: (product_id: string) => api.post<WishlistItem>('/api/wishlist', { product_id }),
  check: (productId: string) =>
    api.get<{ inWishlist: boolean }>(`/api/wishlist/check/${productId}`),
  remove: (productId: string) =>
    api.del<{ message: string }>(`/api/wishlist/${productId}`),
};

/* -------------------------------------------------------------------------- */
/*  CONTACT                                                                     */
/* -------------------------------------------------------------------------- */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post<{ message: string }>('/api/contact', data),
  // Admin
  getAll: () => api.get<ContactMessage[]>('/api/contact'),
  markRead: (id: string) => api.put<ContactMessage>(`/api/contact/${id}/read`, {}),
};

/* -------------------------------------------------------------------------- */
/*  DASHBOARD                                                                   */
/* -------------------------------------------------------------------------- */

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalSales: number;
  recentOrders: Order[];
  topProducts?: { name: string; price: number; total_sold: number }[];
}

export interface SalesChartPoint {
  label: string;
  date?: string;
  month?: string;
  orders: number;
  revenue: number;
}

export interface SalesChartData {
  daily: SalesChartPoint[];
  monthly: SalesChartPoint[];
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/api/dashboard/stats'),
  getSalesChart: () => api.get<SalesChartData>('/api/dashboard/sales-chart'),
};

/* -------------------------------------------------------------------------- */
/*  PAYMENT                                                                     */
/* -------------------------------------------------------------------------- */

export const paymentApi = {
  createOrder: (amount: number) =>
    api.post<{ id: string; amount: number; currency: string }>('/api/payment/create-order', { amount }),
  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post<{ status: string; message: string }>('/api/payment/verify', data),
};

/* -------------------------------------------------------------------------- */
/*  SITE SETTINGS                                                               */
/* -------------------------------------------------------------------------- */

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export const settingsApi = {
  getSocialLinks: () => api.get<{ key: string; value: SocialLinks }>('/api/settings/social_links'),
  updateSocialLinks: (value: SocialLinks) => api.put<{ key: string; value: SocialLinks }>('/api/settings/social_links', { value }),
  getAll: () => api.get<Record<string, unknown>>('/api/settings'),
};

// ─── Page Content ──────────────────────────────────────
export interface PageContent {
  id: string
  slug: string
  title: string
  content: string
  updatedAt: string
}

export const pagesApi = {
  getPage: (slug: string) => api.get<PageContent>(`/api/pages/${slug}`),
  getAllPages: () => api.get<PageContent[]>('/api/pages'),
  updatePage: (slug: string, data: { title: string; content: string }) =>
    api.put<PageContent>(`/api/pages/${slug}`, data),
};

