import { useState, type ReactNode } from 'react'
import { brands, categories, getProduct, img, statusMeta, type Product, type Status } from '../lib/data'
import { cn, pct, toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { useStore, type Line } from '../lib/store'
import { Icon } from './Icon'
import { searchProducts, type Filters } from '../lib/filters'
import { Badge, Button, Img, Skeleton } from './ui'

export function Price({ price, old, size = 'md' }: { price: number; old?: number; size?: 'sm' | 'md' | 'lg' }) {
  const main = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-[15px]' : 'text-lg'
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cn('font-bold tabular-nums', main)}>{toFa(price)} <span className="text-[11px] font-medium text-muted">تومان</span></span>
      {old ? <del className="text-[13px] text-muted/80 tabular-nums">{toFa(old)}</del> : null}
    </div>
  )
}
export const DiscountBadge = ({ price, old }: { price: number; old?: number }) =>
  old ? <Badge className="bg-sale text-white tabular-nums">{toFa(pct(price, old))}٪ تخفیف</Badge> : null

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-muted">
      <Icon name="star" size={size} solid className="text-gold" />
      <span className="font-semibold text-ink tabular-nums">{toFa(value.toFixed(1))}</span>
      {count != null && <span className="tabular-nums">({toFa(count)})</span>}
    </span>
  )
}
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${toFa(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={size} solid={i <= Math.round(value)} className={i <= Math.round(value) ? 'text-gold' : 'text-line'} />)}
    </span>
  )
}

export function WishButton({ id, className }: { id: number; className?: string }) {
  const { wishlist, toggleWish } = useStore()
  const on = wishlist.includes(id)
  return (
    <button aria-label={on ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'} aria-pressed={on} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(id) }}
      className={cn('grid size-10 place-items-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-white', on ? 'text-sale' : 'text-ink/70 hover:text-sale', className)}>
      <span key={String(on)} className={on ? 'animate-pop' : ''}><Icon name="heart" size={19} solid={on} /></span>
    </button>
  )
}

export function AddToCart({ p, variant, qty = 1, size = 'md', full = true, className, onNeedVariant }: { p: Product; variant?: string; qty?: number; size?: 'sm' | 'md' | 'lg'; full?: boolean; className?: string; onNeedVariant?: () => void }) {
  const { add, toast } = useStore()
  const [done, setDone] = useState(false)
  if (p.stock === 0)
    return <Button variant="secondary" size={size} full={full} className={className} onClick={() => toast('وقتی موجود شد به شما اطلاع می‌دهیم')}><Icon name="clock" size={18} />خبرم کن</Button>
  return (
    <Button size={size} full={full} className={cn(done && 'bg-brand-500 hover:bg-brand-500', className)} onClick={() => {
      if (onNeedVariant) return onNeedVariant()
      add(p.id, qty, variant)
      setDone(true)
      toast('به سبد خرید اضافه شد')
      setTimeout(() => setDone(false), 1400)
    }}>
      <span key={String(done)} className="inline-flex animate-fade"><Icon name={done ? 'check' : 'cart'} size={18} /></span>
      {done ? 'اضافه شد' : 'افزودن به سبد'}
    </Button>
  )
}

export function ProductCard({ p, layout = 'grid' }: { p: Product; layout?: 'grid' | 'list' }) {
  const out = p.stock === 0
  const list = layout === 'list'
  return (
    <article className={cn('group relative flex rounded-xl bg-white shadow-card ring-1 ring-line/60 transition-shadow hover:shadow-pop/30', list ? 'flex-row gap-4 p-3' : 'flex-col')}>
      <Link to={`/product/${p.id}`} className={cn('relative block overflow-hidden', list ? 'w-32 shrink-0 rounded-lg sm:w-44' : 'rounded-t-xl')}>
        <Img src={img(p.images[0], 600)} alt={p.name} zoom className={cn(list ? 'aspect-square' : 'aspect-[4/5]')} />
        <div className="absolute start-2 top-2 flex flex-col gap-1">
          {out ? <Badge className="bg-ink text-white">ناموجود</Badge> : <DiscountBadge price={p.price} old={p.old} />}
        </div>
        {out && <div className="absolute inset-0 bg-white/50" />}
      </Link>
      <WishButton id={p.id} className={cn('absolute end-2 top-2', list && 'end-2')} />
      <div className={cn('flex flex-1 flex-col gap-2', list ? 'justify-between py-1 pe-8' : 'p-3')}>
        <div className="space-y-1.5">
          <p className="text-xs text-muted">{p.brand}</p>
          <h3 className="line-clamp-2 min-h-[2.9em] text-sm font-medium leading-[1.45] sm:text-[15px]"><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
          {list && <p className="hidden text-sm text-muted sm:block">{p.short}</p>}
          <Rating value={p.rating} count={p.reviews} />
        </div>
        <div className={cn('flex gap-2', list ? 'flex-col sm:flex-row sm:items-end sm:justify-between' : 'flex-col')}>
          <Price price={p.price} old={p.old} size="sm" />
          <div className={list ? 'sm:w-44' : ''}>
            {p.variants ? <Button variant={out ? 'secondary' : 'primary'} size="sm" full onClick={() => navigate(`/product/${p.id}`)}>{out ? 'ناموجود' : 'انتخاب گزینه‌ها'}</Button> : <AddToCart p={p} size="sm" />}
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ items, layout = 'grid', loading, cols = 'lg:grid-cols-4' }: { items: Product[]; layout?: 'grid' | 'list'; loading?: boolean; cols?: string }) {
  const grid = layout === 'grid'
  const cls = grid ? cn('grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5', cols) : 'flex flex-col gap-3'
  if (loading)
    return <div className={cls}>{Array.from({ length: grid ? 8 : 4 }).map((_, i) => <ProductSkeleton key={i} list={!grid} />)}</div>
  return <div className={cls}>{items.map((p, i) => <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}><ProductCard p={p} layout={layout} /></div>)}</div>
}
export const ProductSkeleton = ({ list }: { list?: boolean }) => (
  <div className={cn('rounded-xl bg-white p-0 shadow-card ring-1 ring-line/60', list && 'flex gap-4 p-3')}>
    <Skeleton className={list ? 'size-32 rounded-lg sm:size-44' : 'aspect-[4/5] rounded-b-none rounded-t-xl'} />
    <div className={cn('space-y-2.5', list ? 'flex-1 py-2' : 'p-3')}><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-9 w-full" /></div>
  </div>
)

export const CategoryCard = ({ c }: { c: (typeof categories)[number] }) => (
  <Link to={`/products?cat=${c.id}`} className="group flex flex-col items-center gap-2.5 text-center">
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-sand ring-1 ring-line/60">
      <Img src={img(c.image, 400)} alt="" zoom className="size-full" />
    </div>
    <span className="text-sm font-semibold transition-colors group-hover:text-brand-700">{c.name}</span>
  </Link>
)

export function SectionHead({ title, sub, to, action = 'مشاهده همه' }: { title: string; sub?: string; to?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div><h2 className="text-xl font-bold md:text-2xl">{title}</h2>{sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}</div>
      {to && <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">{action}<Icon name="next" size={16} /></Link>}
    </div>
  )
}

export function Qty({ value, max, onChange, size = 'md' }: { value: number; max: number; onChange: (n: number) => void; size?: 'sm' | 'md' }) {
  const b = size === 'sm' ? 'size-9' : 'size-11'
  return (
    <div className="inline-flex items-center rounded-lg bg-white ring-1 ring-inset ring-line">
      <button aria-label="افزایش" disabled={value >= max} onClick={() => onChange(value + 1)} className={cn(b, 'grid place-items-center rounded-lg text-brand-700 hover:bg-sand disabled:text-muted/40')}><Icon name="plus" size={16} /></button>
      <span key={value} className="w-9 text-center font-semibold tabular-nums animate-fade">{toFa(value)}</span>
      <button aria-label="کاهش" disabled={value <= 1} onClick={() => onChange(value - 1)} className={cn(b, 'grid place-items-center rounded-lg text-brand-700 hover:bg-sand disabled:text-muted/40')}><Icon name="minus" size={16} /></button>
    </div>
  )
}

export function CartItem({ line, compact }: { line: Line; compact?: boolean }) {
  const { setQty, remove, saveForLater } = useStore()
  const p = getProduct(line.id)
  if (!p) return null
  const off = p.old ? (p.old - p.price) * line.qty : 0
  return (
    <div className="flex gap-3 py-4 animate-fade sm:gap-4">
      <Link to={`/product/${p.id}`} className="shrink-0"><Img src={img(p.images[0], 300)} alt={p.name} className="size-20 rounded-lg sm:size-24" /></Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/product/${p.id}`} className="line-clamp-2 text-sm font-medium leading-6 hover:text-brand-700 sm:text-[15px]">{p.name}</Link>
            {line.variant && <p className="text-[13px] text-muted">{line.variant}</p>}
          </div>
          {!compact && <button aria-label="حذف از سبد" onClick={() => remove(line.key)} className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-sale-50 hover:text-sale"><Icon name="trash" size={18} /></button>}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          {compact ? <span className="text-sm text-muted">{toFa(line.qty)} عدد</span> : <Qty size="sm" value={line.qty} max={p.stock} onChange={(n) => setQty(line.key, n)} />}
          <div className="text-end">
            {off > 0 && <p className="text-xs font-semibold text-sale tabular-nums">{toFa(off)} تومان تخفیف</p>}
            <Price price={p.price * line.qty} size="sm" />
          </div>
        </div>
        {!compact && line.qty >= p.stock && <p className="text-xs text-amber-700">حداکثر موجودی این کالا در سبد شماست</p>}
        {!compact && <button onClick={() => saveForLater(line.key)} className="flex items-center gap-1 self-start text-[13px] font-medium text-brand-700 hover:underline"><Icon name="bookmark" size={14} />ذخیره برای بعد</button>}
      </div>
    </div>
  )
}

export function OrderStatus({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' }) {
  const m = statusMeta[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset', m.tone, size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-[13px]')}>
      <Icon name={m.icon} size={size === 'sm' ? 13 : 15} />{m.label}
    </span>
  )
}

export function SearchBar({ className, autoFocus, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const hits = q.trim().length > 0 ? searchProducts(q).slice(0, 5) : []
  const go = (v: string) => { navigate(`/products?q=${encodeURIComponent(v)}`); setQ(''); setFocus(false); onDone?.() }
  return (
    <form role="search" className={cn('relative', className)} onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()) }}>
      <Icon name="search" size={19} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} type="search" aria-label="جستجو در فروشگاه" placeholder="دنبال چه چیزی می‌گردید؟"
        className="h-11 w-full rounded-lg bg-sand ps-11 pe-4 text-[15px] ring-1 ring-transparent transition placeholder:text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
      {focus && hits.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl bg-white py-1 shadow-pop ring-1 ring-line animate-fade">
          {hits.map((p) => (
            <li key={p.id}><Link to={`/product/${p.id}`} onClick={() => { setQ(''); onDone?.() }} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-sand"><Img src={img(p.images[0], 100)} alt="" className="size-10 shrink-0 rounded-md" /><span className="line-clamp-1">{p.name}</span></Link></li>
          ))}
          <li><button type="button" onMouseDown={() => go(q.trim())} className="w-full px-3 py-2.5 text-start text-sm font-semibold text-brand-700 hover:bg-sand">نمایش همه نتایج «{q}»</button></li>
        </ul>
      )}
    </form>
  )
}

/* ---------- Filters ---------- */
export function FilterPanel({ f, onChange, onReset }: { f: Filters; onChange: (p: Partial<Filters>) => void; onReset: () => void }) {
  const Group = ({ title, children }: { title: string; children: ReactNode }) => (
    <fieldset className="border-b border-line py-4 first:pt-0"><legend className="mb-3 text-sm font-bold">{title}</legend>{children}</fieldset>
  )
  const row = 'flex min-h-9 cursor-pointer items-center gap-2.5 text-sm'
  return (
    <div>
      <Group title="دسته‌بندی">
        <div className="space-y-1">
          <label className={row}><input type="radio" name="cat" checked={f.cat === ''} onChange={() => onChange({ cat: '' })} className="size-4" />همه محصولات</label>
          {categories.map((c) => <label key={c.id} className={row}><input type="radio" name="cat" checked={f.cat === c.id} onChange={() => onChange({ cat: c.id })} className="size-4" />{c.name}</label>)}
        </div>
      </Group>
      <Group title="حداکثر قیمت">
        <input type="range" min={50000} max={2000000} step={50000} value={f.max} onChange={(e) => onChange({ max: +e.target.value })} aria-label="حداکثر قیمت" className="w-full" />
        <p className="mt-1 text-sm text-muted tabular-nums">تا <b className="text-ink">{toFa(f.max)}</b> تومان</p>
      </Group>
      <Group title="برند">
        <div className="space-y-1">
          {brands.map((b) => (
            <label key={b} className={row}><input type="checkbox" className="size-4" checked={f.brands.includes(b)} onChange={(e) => onChange({ brands: e.target.checked ? [...f.brands, b] : f.brands.filter((x) => x !== b) })} />{b}</label>
          ))}
        </div>
      </Group>
      <Group title="امتیاز">
        <div className="space-y-1">
          {[0, 4.5, 4, 3].map((r) => <label key={r} className={row}><input type="radio" name="rating" className="size-4" checked={f.rating === r} onChange={() => onChange({ rating: r })} />{r === 0 ? 'همه' : <>{toFa(r)} به بالا <Icon name="star" size={14} solid className="text-gold" /></>}</label>)}
        </div>
      </Group>
      <Group title="موجودی">
        <label className="flex min-h-9 cursor-pointer items-center justify-between text-sm">فقط کالاهای موجود
          <input type="checkbox" className="size-4" checked={f.stock} onChange={(e) => onChange({ stock: e.target.checked })} />
        </label>
      </Group>
      <Button variant="ghost" size="sm" className="mt-3 text-sale" onClick={onReset}>حذف همه فیلترها</Button>
    </div>
  )
}
