import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { coupons, defaultAddress, FREE_SHIP, getProduct, mockOrders, type Address, type Order, type Status } from './data'

export type Line = { key: string; id: number; variant?: string; qty: number }
export type Toast = { id: number; msg: string; tone: 'success' | 'error' | 'info' }
type User = { name: string; phone: string }

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
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))

  const add = (id: number, qty = 1, variant?: string) => {
    const key = `${id}|${variant ?? ''}`
    const max = getProduct(id)?.stock ?? 99
    setCart((c) => {
      const ex = c.find((l) => l.key === key)
      if (ex) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(max, l.qty + qty) } : l))
      return [...c, { key, id, variant, qty: Math.min(max, qty) }]
    })
  }
  const setQty = (key: string, qty: number) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(getProduct(l.id)?.stock ?? 99, qty)) } : l)))
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
    if (!coupons[c]) return 'کد تخفیف معتبر نیست یا منقضی شده است'
    setCouponCode(c)
    return null
  }

  const login = (phone: string, name?: string) => setUser({ phone, name: name || user?.name || 'نرگس احمدی' })
  const logout = () => setUser(null)
  const addOrder = (o: Order) => setOrders((x) => [o, ...x])
  const setOrderStatus = (id: string, status: Status) => setOrders((x) => x.map((o) => (o.id === id ? { ...o, status } : o)))
  const addAddress = (a: Address) => setAddresses((x) => [...x, a])
  const removeAddress = (id: string) => setAddresses((x) => x.filter((a) => a.id !== id))

  const count = cart.reduce((s, l) => s + l.qty, 0)
  const totals = useMemo(() => {
    let original = 0, subtotal = 0
    for (const l of cart) {
      const p = getProduct(l.id)
      if (!p) continue
      original += (p.old ?? p.price) * l.qty
      subtotal += p.price * l.qty
    }
    const cp = couponCode ? coupons[couponCode] : null
    const coupon = cp ? (cp.type === 'percent' ? Math.min(Math.round((subtotal * cp.value) / 100), cp.cap ?? Infinity) : Math.min(cp.value, subtotal)) : 0
    const shipping = subtotal - coupon >= FREE_SHIP || !cart.length ? 0 : 60000
    return { original, subtotal, productDiscount: original - subtotal, coupon, shipping, total: subtotal - coupon + shipping }
  }, [cart, couponCode])

  return { cart, saved, wishlist, user, orders, addresses, couponCode, toasts, count, totals, toast, dismissToast, add, setQty, remove, clearCart, saveForLater, moveToCart, removeSaved, toggleWish, applyCoupon, removeCoupon: () => setCouponCode(null), login, logout, addOrder, setOrderStatus, addAddress, removeAddress, setUser }
}

type Store = ReturnType<typeof useStoreImpl>
const Ctx = createContext<Store>(null as never)
export const StoreProvider = ({ children }: { children: ReactNode }) => <Ctx.Provider value={useStoreImpl()}>{children}</Ctx.Provider>
export const useStore = () => useContext(Ctx)
