import { useEffect, useState } from 'react'
import { categories, FREE_SHIP } from '../lib/data'
import { cn, toFa } from '../lib/format'
import { Link, useRoute } from '../lib/router'
import { useStore } from '../lib/store'
import { SearchBar } from './commerce'
import { Icon } from './Icon'
import { Container, Drawer, IconButton } from './ui'

export const Logo = ({ light, className }: { light?: boolean; className?: string }) => (
  <Link to="/" aria-label="جامو - صفحه اصلی" className={cn('inline-flex items-center select-none', className)}>
    <img
      src="/logo.png"
      alt="جامو"
      width={2056}
      height={765}
      className={cn('h-10 w-auto md:h-11', light && 'rounded-lg bg-white px-2 py-1.5')}
    />
  </Link>
)

function CartBadge() {
  const { count } = useStore()
  if (!count) return null
  return <span key={count} className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-sale px-1 text-[11px] font-bold leading-5 text-white animate-bump tabular-nums">{toFa(count)}</span>
}

export function Header() {
  const { path, query } = useRoute()
  const { user, wishlist } = useStore()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(scrollY > 8)
    addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])
  const checkout = path.startsWith('/checkout')
  if (checkout)
    return (
      <header className="border-b border-line bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <span className="flex items-center gap-1.5 text-sm text-muted"><Icon name="lock" size={16} className="text-brand-600" />پرداخت امن</span>
        </Container>
      </header>
    )
  const nav = [
    { to: '/products', label: 'همه محصولات', current: path === '/products' && !query.get('cat') },
    ...categories.slice(0, 5).map((c) => ({ to: `/products?cat=${c.id}`, label: c.name, current: path === '/products' && query.get('cat') === c.id })),
    { to: '/products?sort=discount', label: 'تخفیف‌ها', hot: true, current: path === '/products' && query.get('sort') === 'discount' },
  ]
  return (
    <header className={cn('sticky top-0 z-40 bg-white transition-shadow', scrolled && 'shadow-card')}>
      <div className="hidden bg-brand-800 py-1.5 text-center text-[13px] text-brand-50 md:block">ارسال رایگان برای خرید بالای {toFa(FREE_SHIP / 1000000)} میلیون تومان · ضمانت تازگی کالا</div>
      <Container>
        <div className="flex h-16 items-center gap-3 md:h-[72px] md:gap-6">
          <IconButton label="منو" className="-ms-2 md:hidden" onClick={() => setMenu(true)}><Icon name="menu" /></IconButton>
          <Logo />
          <SearchBar className="hidden max-w-2xl flex-1 md:block" />
          <div className="ms-auto flex items-center gap-0.5 md:ms-0">
            <Link to={user ? '/account' : '/login'} className="hidden h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-sand md:flex"><Icon name="user" size={20} />{user ? user.name : 'ورود | ثبت‌نام'}</Link>
            <Link to="/account/wishlist" aria-label="علاقه‌مندی‌ها" className="relative hidden size-11 place-items-center rounded-full hover:bg-sand md:grid"><Icon name="heart" />{wishlist.length > 0 && <span className="absolute end-1 top-1 size-2 rounded-full bg-sale" />}</Link>
            <Link to="/cart" aria-label="سبد خرید" className="relative grid size-11 place-items-center rounded-full hover:bg-sand"><Icon name="cart" /><CartBadge /></Link>
          </div>
        </div>
        <SearchBar className="pb-3 md:hidden" />
        <nav aria-label="دسته‌بندی‌ها" className="no-scrollbar hidden h-11 items-center gap-1 overflow-x-auto border-t border-line md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} aria-current={n.current ? 'page' : undefined} className={cn('flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-medium', n.current ? 'bg-brand-50 text-brand-800' : n.hot ? 'text-sale hover:bg-sand' : 'text-ink/80 hover:bg-sand hover:text-ink')}>{n.hot && <Icon name="tag" size={15} className="me-1.5" />}{n.label}</Link>
          ))}
        </nav>
      </Container>
      <Drawer open={menu} onClose={() => setMenu(false)} title="منو">
        <nav className="-mx-2 flex flex-col" onClick={() => setMenu(false)}>
          {[...nav, { to: user ? '/account' : '/login', label: user ? 'حساب کاربری' : 'ورود | ثبت‌نام' }, { to: '/account/orders', label: 'پیگیری سفارش' }].map((n) => (
            <Link key={n.to + n.label} to={n.to} className="flex h-12 items-center justify-between rounded-lg px-3 font-medium hover:bg-sand">{n.label}<Icon name="next" size={16} className="text-muted" /></Link>
          ))}
        </nav>
      </Drawer>
    </header>
  )
}

export function BottomNav() {
  const { path } = useRoute()
  const { count, wishlist } = useStore()
  if (path.startsWith('/checkout') || path.startsWith('/product/') || path === '/login') return null
  const items = [
    { to: '/', icon: 'home', label: 'خانه' },
    { to: '/products', icon: 'grid2', label: 'دسته‌ها' },
    { to: '/cart', icon: 'cart', label: 'سبد خرید', badge: count },
    { to: '/account/wishlist', icon: 'heart', label: 'علاقه‌مندی', badge: wishlist.length ? -1 : 0 },
    { to: '/account', icon: 'user', label: 'حساب من' },
  ]
  const active = (to: string) => (to === '/' ? path === '/' : to === '/account' ? path.startsWith('/account') && path !== '/account/wishlist' : path.startsWith(to))
  return (
    <nav aria-label="ناوبری اصلی" className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to} aria-current={active(it.to) ? 'page' : undefined} className={cn('relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium', active(it.to) ? 'text-brand-700' : 'text-muted')}>
              <span className="relative"><Icon name={it.icon} size={23} solid={active(it.to) && it.icon === 'heart'} />
                {it.badge ? <span key={it.badge} className="absolute -end-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-4 text-white animate-bump">{it.badge > 0 ? toFa(it.badge) : ''}</span> : null}
              </span>
              {it.label}
              {active(it.to) && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-700" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  const { path } = useRoute()
  const [open, setOpen] = useState<string | null>(null)
  if (path.startsWith('/checkout')) return <footer className="py-8 text-center text-xs text-muted">© ۱۴۰۵ جامو · تمامی حقوق محفوظ است</footer>
  const cols = [
    { t: 'جامو', l: ['درباره ما', 'تماس با ما', 'فرصت‌های شغلی'] },
    { t: 'راهنمای مشتریان', l: ['راهنمای خرید', 'روش‌های ارسال', 'قوانین و مقررات', 'رویه بازگرداندن کالا'] },
  ]
  return (
    <footer className="mt-20 bg-brand-900 pb-20 text-brand-100 md:pb-0">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-7 text-brand-200">جامو از سال ۱۳۹۲ سوپرمارکت محله‌ی شما بوده و حالا آنلاین است؛ کالای تازه، قیمت منصفانه و تحویل سریع تا درِ خانه.</p>
          <div className="flex gap-2">
            {[['camera', 'اینستاگرام'], ['send', 'تلگرام'], ['phone', 'واتساپ']].map(([i, l]) => (
              <a key={l} href="#/" aria-label={l} className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"><Icon name={i} size={18} /></a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.t} className="border-b border-white/10 pb-3 md:border-0 md:pb-0">
            <button className="flex w-full items-center justify-between font-bold text-white md:pointer-events-none" aria-expanded={open === c.t} onClick={() => setOpen(open === c.t ? null : c.t)}>{c.t}<Icon name="down" size={16} className={cn('md:hidden transition-transform', open === c.t && 'rotate-180')} /></button>
            <ul className={cn('mt-3 space-y-1 text-sm', open === c.t ? 'block' : 'hidden md:block')}>{c.l.map((x) => <li key={x}><a href="#/" className="inline-block py-1.5 text-brand-200 hover:text-white">{x}</a></li>)}</ul>
          </div>
        ))}
        <div>
          <p className="font-bold text-white">اطلاعات تماس</p>
          <ul className="mt-3 space-y-2.5 text-sm text-brand-200">
            <li className="flex gap-2"><Icon name="pin" size={18} className="mt-0.5 shrink-0" />تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲۰</li>
            <li className="flex gap-2"><Icon name="phone" size={18} className="shrink-0" /><span>۰۲۱-۹۱۰۰۱۲۳۴</span></li>
            <li className="flex gap-2"><Icon name="mail" size={18} className="shrink-0" />support@jamo-online.ir</li>
            <li className="flex gap-2"><Icon name="clock" size={18} className="shrink-0" />همه روزه ۹ تا ۲۱</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-5 text-center text-[13px] text-brand-200">© ۱۴۰۵ جامو · تمامی حقوق این وب‌سایت محفوظ است · jamo-online</div>
    </footer>
  )
}
