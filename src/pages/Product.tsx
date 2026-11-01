import { useState } from 'react'
import { Icon } from '../components/Icon'
import { AddToCart, DiscountBadge, Price, ProductGrid, Qty, Rating, SectionHead, Stars, WishButton } from '../components/commerce'
import { Badge, Breadcrumb, Button, Container, EmptyState, Img, Skeleton, useFakeLoad } from '../components/ui'
import { catName, descFor, getProduct, img, products, reviewsMock, specsFor } from '../lib/data'
import { cn, pct, toFa } from '../lib/format'
import { navigate } from '../lib/router'
import { useStore } from '../lib/store'

export default function ProductPage({ id }: { id: number }) {
  const p = getProduct(id)
  const loading = useFakeLoad([id], 450)
  const { add, toast } = useStore()
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [sel, setSel] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [err, setErr] = useState(false)

  if (!p) return <Container><EmptyState icon="search" title="این کالا پیدا نشد" text="ممکن است حذف شده یا آدرس اشتباه باشد." action={<Button onClick={() => navigate('/products')}>مشاهده محصولات</Button>} /></Container>
  if (loading)
    return <Container><div className="grid gap-8 py-8 lg:grid-cols-2"><Skeleton className="aspect-square" /><div className="space-y-4"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24" /><Skeleton className="h-12" /></div></div></Container>

  const vars = p.variants ?? []
  const init = { ...Object.fromEntries(vars.filter((v) => v.preselect).map((v) => [v.name, v.options[0]])), ...sel }
  const missing = vars.find((v) => !init[v.name])
  const variant = vars.length ? vars.map((v) => `${v.name}: ${init[v.name]}`).join('، ') : undefined
  const out = p.stock === 0
  const related = products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4)
  const needVariant = missing ? () => { setErr(true); toast(`لطفاً ${missing.name} را انتخاب کنید`, 'error') } : undefined
  const buyNow = () => { if (needVariant) return needVariant(); add(p.id, qty, variant); navigate('/checkout') }

  return (
    <Container className="pb-28 md:pb-4">
      <Breadcrumb items={[{ label: 'جامو', to: '/' }, { label: catName(p.cat), to: `/products?cat=${p.cat}` }, { label: p.name }]} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 md:flex-row lg:sticky lg:top-32 lg:self-start">
          <div className="flex gap-2 md:flex-col">
            {p.images.map((im, i) => (
              <button key={i} aria-label={`تصویر ${toFa(i + 1)}`} aria-current={i === active} onClick={() => setActive(i)} className={cn('size-16 overflow-hidden rounded-lg ring-2 transition md:size-20', i === active ? 'ring-brand-600' : 'ring-transparent opacity-70 hover:opacity-100')}><Img src={img(im, 200)} alt="" className="size-full" /></button>
            ))}
          </div>
          <div className="relative flex-1 cursor-zoom-in overflow-hidden rounded-xl bg-sand ring-1 ring-line/60"
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }) }} onMouseLeave={() => setZoom(null)}>
            <img key={active} src={img(p.images[active], 1000)} alt={p.name} fetchPriority="high" className="aspect-square size-full object-cover animate-fade" style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: 'transform .1s' } : { transition: 'transform .3s' }} />
            <div className="absolute start-3 top-3 flex gap-1.5">{out ? <Badge className="bg-ink text-white">ناموجود</Badge> : <DiscountBadge price={p.price} old={p.old} />}</div>
            <WishButton id={p.id} className="absolute end-3 top-3" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-brand-700">{p.brand}</p>
            <h1 className="mt-1 text-xl font-bold leading-9 md:text-[26px]">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
              <Rating value={p.rating} count={p.reviews} size={16} />
              <button className="hover:text-brand-700 hover:underline" onClick={() => { setTab('reviews'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }) }}>دیدگاه کاربران</button>
              <span>·</span><span className="tabular-nums">{toFa(p.sold)} فروش</span>
            </div>
          </div>
          <p className="text-[15px] text-muted">{p.short}</p>

          <div className="rounded-xl bg-white p-4 ring-1 ring-line/60 md:p-5 space-y-4">
            {vars.map((v) => (
              <div key={v.name}>
                <p className="mb-2 text-sm font-semibold">{v.name}: <span className="font-normal text-muted">{init[v.name] ?? 'انتخاب کنید'}</span></p>
                <div role="radiogroup" aria-label={v.name} className="flex flex-wrap gap-2">
                  {v.options.map((o) => <button key={o} role="radio" aria-checked={init[v.name] === o} onClick={() => { setSel({ ...sel, [v.name]: o }); setErr(false) }} className={cn('min-h-11 min-w-12 rounded-lg px-4 text-sm font-medium ring-1 ring-inset transition', init[v.name] === o ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-600' : 'bg-white ring-line hover:ring-brand-200')}>{o}</button>)}
                </div>
                {err && !init[v.name] && <p role="alert" className="mt-1.5 text-[13px] text-sale">لطفاً {v.name} را انتخاب کنید</p>}
              </div>
            ))}
            <div className="flex items-end justify-between gap-3">
              <div>
                <Price price={p.price} old={p.old} size="lg" />
                {p.old && <p className="mt-1 text-[13px] font-semibold text-sale tabular-nums">{toFa(pct(p.price, p.old))}٪ تخفیف · {toFa(p.old - p.price)} تومان سود شما</p>}
              </div>
              <p className={cn('flex items-center gap-1.5 text-sm font-medium', out ? 'text-sale' : p.stock <= 10 ? 'text-amber-700' : 'text-brand-700')}>
                <span className={cn('size-2 rounded-full', out ? 'bg-sale' : p.stock <= 10 ? 'bg-amber-500' : 'bg-brand-500')} />
                {out ? 'ناموجود' : p.stock <= 10 ? `تنها ${toFa(p.stock)} عدد در انبار` : 'موجود در انبار'}
              </p>
            </div>
            {!out && (
              <div className="hidden items-center gap-3 md:flex">
                <Qty value={qty} max={p.stock} onChange={setQty} />
                <AddToCart p={p} variant={variant} qty={qty} size="lg" onNeedVariant={needVariant} className="flex-1" />
              </div>
            )}
            <div className="hidden gap-3 md:flex">
              {out ? <AddToCart p={p} size="lg" /> : <Button size="lg" full className="bg-sale hover:bg-sale/90" onClick={buyNow}><Icon name="bolt" size={18} />خرید فوری</Button>}
            </div>
          </div>

          <ul className="grid grid-cols-3 gap-2 text-center text-xs text-muted">
            {[['truck', 'ارسال سریع'], ['award', 'ضمانت تازگی'], ['refresh', 'تعویض در صورت مشکل']].map(([i, t]) => <li key={t} className="flex flex-col items-center gap-1.5 rounded-lg bg-sand py-3"><Icon name={i} size={20} className="text-brand-700" />{t}</li>)}
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <section id="tabs" className="mt-14 scroll-mt-32">
        <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
          {([['desc', 'توضیحات'], ['specs', 'مشخصات'], ['reviews', `دیدگاه‌ها (${toFa(p.reviews)})`]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('relative h-12 shrink-0 px-5 text-[15px] font-semibold transition-colors', tab === k ? 'text-brand-700' : 'text-muted hover:text-ink')}>{l}{tab === k && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-700" />}</button>
          ))}
        </div>
        <div role="tabpanel" className="max-w-3xl py-6 animate-fade" key={tab}>
          {tab === 'desc' && <p className="leading-9 text-ink/85">{descFor(p)}</p>}
          {tab === 'specs' && <dl className="divide-y divide-line overflow-hidden rounded-xl bg-white ring-1 ring-line/60">{specsFor(p).map(([k, v]) => <div key={k} className="grid grid-cols-[130px_1fr] gap-4 px-4 py-3 text-sm sm:grid-cols-[200px_1fr]"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>}
          {tab === 'reviews' && (
            <div className="grid gap-8 md:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                <p className="text-4xl font-extrabold tabular-nums">{toFa(p.rating.toFixed(1))}</p><Stars value={p.rating} /><p className="text-sm text-muted">از {toFa(p.reviews)} دیدگاه</p>
                {[5, 4, 3, 2, 1].map((s, i) => <div key={s} className="flex items-center gap-2 text-xs text-muted"><span className="w-3 tabular-nums">{toFa(s)}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-gold" style={{ width: [64, 24, 8, 3, 1][i] + '%' }} /></div></div>)}
                <Button variant="secondary" full className="mt-3" onClick={() => toast('برای ثبت دیدگاه ابتدا وارد حساب شوید', 'info')}>ثبت دیدگاه</Button>
              </div>
              <ul className="space-y-4">{reviewsMock.map((r, i) => <li key={i} className="rounded-xl bg-white p-4 ring-1 ring-line/60"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{r.name[0]}</span><span className="text-sm font-semibold">{r.name}</span>{r.verified && <Badge className="bg-brand-50 text-brand-700">خریدار جامو</Badge>}</div><span className="text-xs text-muted">{r.date}</span></div><div className="mt-2"><Stars value={r.rating} size={14} /></div><p className="mt-2 text-sm leading-7">{r.text}</p></li>)}</ul>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && <section className="mt-10"><SectionHead title="کالاهای مرتبط" to={`/products?cat=${p.cat}`} /><ProductGrid items={related} /></section>}

      {/* Mobile sticky purchase bar */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><Price price={p.price} old={p.old} size="sm" /><p className={cn('text-xs', out ? 'text-sale' : 'text-muted')}>{out ? 'ناموجود' : 'موجود در انبار'}</p></div>
          {out ? <AddToCart p={p} full={false} className="px-6" /> : <><AddToCart p={p} variant={variant} qty={qty} full={false} className="px-5" onNeedVariant={needVariant} /><Button className="bg-sale px-5 hover:bg-sale/90" onClick={buyNow}>خرید فوری</Button></>}
        </div>
      </div>
    </Container>
  )
}
