import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  categories as initialCategories,
  coupons as initialCoupons,
  defaultAddress,
  FREE_SHIP,
  mockOrders,
  products as initialProducts,
  type Address,
  type Order,
  type Product,
  type Status,
} from './data'

export const ADMIN_PHONE = '09104056429'

export type Category = { id: string; name: string; image: string }
export type CouponItem = { type: 'percent' | 'fixed'; value: number; cap?: number; label: string }
export type Line = { key: string; id: number; variant?: string; qty: number }
export type Toast = { id: number; msg: string; tone: 'success' | 'error' | 'info' }
export type UserRole = 'customer' | 'admin'
export type User = { name: string; phone: string; role?: UserRole; token?: string }

function usePersisted<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem('jamo2:' + key)
      return s ? (JSON.parse(s) as T) : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try { localStorage.setItem('jamo2:' + key, JSON.stringify(v)) } catch { /* storage unavailable */ }
  }, [key, v])
  return [v, setV] as const
}

function useStoreImpl() {
  const [cart, setCart] = usePersisted<Line[]>('cart', [])
  const [saved, setSaved] = usePersisted<Line[]>('saved', [])
  const [wishlist, setWishlist] = usePersisted<number[]>('wish', [])
  const [user, setUser] = usePersisted<User | null>('user', null)
  const [orders, setOrders] = usePersisted<Order[]>('orders', mockOrders)
  const [addresses, setAddresses] = usePersisted<Address[]>('addresses', [defaultAddress])
  const [couponCode, setCouponCode] = usePersisted<string | null>('coupon', null)

  // Runtime in-memory products, categories, coupons
  const [productsList, setProductsList] = useState<Product[]>(() => [...initialProducts])
  const [categoriesList, setCategoriesList] = useState<Category[]>(() => [...initialCategories])
  const [couponsMap, setCouponsMap] = useState<Record<string, CouponItem>>(() => ({ ...initialCoupons }))
  const [hiddenProductIds, setHiddenProductIds] = useState<number[]>([])

  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))

  const getProductItem = useCallback(
    (id: number) => productsList.find((p) => p.id === id),
    [productsList]
  )

  const add = (id: number, qty = 1, variant?: string) => {
    const key = `${id}|${variant ?? ''}`
    const max = getProductItem(id)?.stock ?? 99
    setCart((c) => {
      const ex = c.find((l) => l.key === key)
      if (ex) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(max, l.qty + qty) } : l))
      return [...c, { key, id, variant, qty: Math.min(max, qty) }]
    })
  }
  const setQty = (key: string, qty: number) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(getProductItem(l.id)?.stock ?? 99, qty)) } : l)))
  const remove = (key: string) => setCart((c) => c.filter((l) => l.key !== key))
  const clearCart = () => { setCart([]); setCouponCode(null) }
  const saveForLater = (key: string) => {
    const l = cart.find((x) => x.key === key)
    if (!l) return
    setCart((c) => c.filter((x) => x.key !== key))
    setSaved((s) => (s.some((x) => x.key === key) ? s : [...s, l]))
  }
  const moveToCart = (key: string) => {
    const l = saved.find((x) => x.key === key)
    if (!l) return
    setSaved((s) => s.filter((x) => x.key !== key))
    add(l.id, l.qty, l.variant)
  }
  const removeSaved = (key: string) => setSaved((s) => s.filter((x) => x.key !== key))
  const toggleWish = (id: number) => {
    const has = wishlist.includes(id)
    setWishlist((w) => (has ? w.filter((x) => x !== id) : [...w, id]))
    toast(has ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد', has ? 'info' : 'success')
  }

  const applyCoupon = (code: string): string | null => {
    const c = code.trim().toUpperCase()
    if (!c) return 'کد تخفیف را وارد کنید'
    if (!couponsMap[c]) return 'کد تخفیف معتبر نیست یا منقضی شده است'
    setCouponCode(c)
    return null
  }

  const login = (phone: string, name?: string) => {
    const cleanPhone = phone.trim()
    const isAdmin = cleanPhone === ADMIN_PHONE
    const role: UserRole = isAdmin ? 'admin' : 'customer'
    const token = isAdmin ? `admin-token-${Date.now()}` : `user-token-${Date.now()}`
    const defaultName = isAdmin ? 'مدیر ارشد' : 'نرگس احمدی'
    setUser({ phone: cleanPhone, name: name || user?.name || defaultName, role, token })
  }
  const logout = () => setUser(null)
  const addOrder = (o: Order) => setOrders((x) => [o, ...x])
  const setOrderStatus = (id: string, status: Status) => setOrders((x) => x.map((o) => (o.id === id ? { ...o, status } : o)))
  const addAddress = (a: Address) => setAddresses((x) => [...x, a])
  const removeAddress = (id: string) => setAddresses((x) => x.filter((a) => a.id !== id))

  // Product management actions
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newId = Math.max(0, ...productsList.map((x) => x.id)) + 1
    const newProduct: Product = { ...p, id: newId }
    setProductsList((prev) => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = (id: number, patch: Partial<Product>) => {
    setProductsList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const deleteProduct = (id: number) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id))
    setHiddenProductIds((prev) => prev.filter((x) => x !== id))
  }

  const toggleHideProduct = (id: number) => {
    setHiddenProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  // Category management
  const addCategory = (cat: Category) => {
    setCategoriesList((prev) => (prev.some((c) => c.id === cat.id) ? prev : [...prev, cat]))
  }

  // Coupon / Discount management
  const setCoupon = (code: string, coupon: CouponItem) => {
    setCouponsMap((prev) => ({ ...prev, [code.trim().toUpperCase()]: coupon }))
  }

  const removeCouponItem = (code: string) => {
    setCouponsMap((prev) => {
      const copy = { ...prev }
      delete copy[code.trim().toUpperCase()]
      return copy
    })
  }

  const count = cart.reduce((s, l) => s + l.qty, 0)
  const totals = useMemo(() => {
    let original = 0, subtotal = 0
    for (const l of cart) {
      const p = productsList.find((x) => x.id === l.id)
      if (!p) continue
      original += (p.old ?? p.price) * l.qty
      subtotal += p.price * l.qty
    }
    const cp = couponCode ? couponsMap[couponCode] : null
    const coupon = cp ? (cp.type === 'percent' ? Math.min(Math.round((subtotal * cp.value) / 100), cp.cap ?? Infinity) : Math.min(cp.value, subtotal)) : 0
    const shipping = subtotal - coupon >= FREE_SHIP || !cart.length ? 0 : 60000
    return { original, subtotal, productDiscount: original - subtotal, coupon, shipping, total: subtotal - coupon + shipping }
  }, [cart, couponCode, couponsMap, productsList])

  return {
    cart,
    saved,
    wishlist,
    user,
    orders,
    addresses,
    couponCode,
    toasts,
    count,
    totals,
    productsList,
    categoriesList,
    couponsMap,
    hiddenProductIds,
    getProductItem,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleHideProduct,
    addCategory,
    setCoupon,
    removeCouponItem,
    toast,
    dismissToast,
    add,
    setQty,
    remove,
    clearCart,
    saveForLater,
    moveToCart,
    removeSaved,
    toggleWish,
    applyCoupon,
    removeCoupon: () => setCouponCode(null),
    login,
    logout,
    addOrder,
    setOrderStatus,
    addAddress,
    removeAddress,
    setUser,
  }
}

type Store = ReturnType<typeof useStoreImpl>
const Ctx = createContext<Store>(null as never)
export const StoreProvider = ({ children }: { children: ReactNode }) => <Ctx.Provider value={useStoreImpl()}>{children}</Ctx.Provider>
export const useStore = () => useContext(Ctx)
