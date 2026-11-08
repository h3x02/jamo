import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { FilterPanel, ProductGrid } from '../components/commerce'
import { defaultFilters, MAX_PRICE, searchProducts, type Filters } from '../lib/filters'
import { Breadcrumb, Button, Container, Drawer, EmptyState, ErrorState, Select, useFakeLoad } from '../components/ui'
import { catName, products } from '../lib/data'
import { cn, toFa } from '../lib/format'
import { navigate, useRoute } from '../lib/router'

const PER = 8
const sorts: Record<string, string> = { popular: 'محبوب‌ترین', best: 'پرفروش‌ترین', new: 'جدیدترین', cheap: 'ارزان‌ترین', expensive: 'گران‌ترین', discount: 'بیشترین تخفیف' }

export default function Listing() {
  const { query } = useRoute()
  const q = query.get('q') ?? ''
  const [f, setF] = useState<Filters>({ ...defaultFilters, cat: query.get('cat') ?? '' })
  const [sort, setSort] = useState(query.get('sort') ?? 'popular')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [sheet, setSheet] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    addEventListener('online', on); addEventListener('offline', off)
    return () => { removeEventListener('online', on); removeEventListener('offline', off) }
  }, [])
  // Sync with URL changes (header search, category links)
  useEffect(() => { setF((x) => ({ ...x, cat: query.get('cat') ?? '' })); setSort(query.get('sort') ?? 'popular'); setPage(1) }, [query.get('cat'), query.get('sort'), q])

  const items = useMemo(() => {
    let r = q ? searchProducts(q) : products
    r = r.filter((p) => (!f.cat || p.cat === f.cat) && p.price <= f.max && (!f.brands.length || f.brands.includes(p.brand)) && (!f.stock || p.stock > 0) && p.rating >= f.rating)
    const d = (p: (typeof products)[number]) => (p.old ? (p.old - p.price) / p.old : 0)
    const by: Record<string, (a: (typeof r)[number], b: (typeof r)[number]) => number> = {
      popular: (a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews), best: (a, b) => b.sold - a.sold, new: (a, b) => a.added - b.added,
      cheap: (a, b) => a.price - b.price, expensive: (a, b) => b.price - a.price, discount: (a, b) => d(b) - d(a),
    }
    return [...r].sort(by[sort])
  }, [q, f, sort])
  const pages = Math.max(1, Math.ceil(items.length / PER))
  const shown = items.slice((page - 1) * PER, page * PER)
  const loading = useFakeLoad([q, f.cat, sort, page, attempt], 450)
  const change = (p: Partial<Filters>) => { setF((x) => ({ ...x, ...p })); setPage(1) }
  const reset = () => { setF(defaultFilters); setPage(1); if (q || query.get('cat')) navigate('/products') }
  const active = (f.cat ? 1 : 0) + f.brands.length + (f.max < MAX_PRICE ? 1 : 0) + (f.stock ? 1 : 0) + (f.rating ? 1 : 0)
  const title = q ? `نتایج جستجو برای «${q}»` : f.cat ? catName(f.cat) : 'همه محصولات'

  return (
    <Container className="pb-4">
      <Breadcrumb items={[{ label: 'جامو', to: '/' }, { label: 'محصولات', to: f.cat || q ? '/products' : undefined }, ...(f.cat ? [{ label: catName(f.cat) }] : [])]} />
      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block"><div className="sticky top-40 rounded-xl bg-white p-5 shadow-card ring-1 ring-line/60"><FilterPanel f={f} onChange={change} onReset={reset} /></div></aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-xl font-bold md:text-2xl">{title}</h1><p className="text-sm text-muted">{toFa(items.length)} کالا</p></div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="lg:hidden" onClick={() => setSheet(true)}><Icon name="sliders" size={18} />فیلترها{active > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-[11px] text-white">{toFa(active)}</span>}</Button>
              <div className="w-40 md:w-48"><Select aria-label="مرتب‌سازی" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>{Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></div>
              <div className="hidden rounded-lg bg-white p-1 ring-1 ring-inset ring-line sm:flex" role="group" aria-label="نحوه نمایش">
                {(['grid', 'list'] as const).map((v) => <button key={v} aria-label={v === 'grid' ? 'نمایش شبکه‌ای' : 'نمایش لیستی'} aria-pressed={view === v} onClick={() => setView(v)} className={cn('grid size-9 place-items-center rounded-md', view === v ? 'bg-brand-700 text-white' : 'text-muted hover:bg-sand')}><Icon name={v} size={18} /></button>)}
              </div>
            </div>
          </div>
          {!online ? <ErrorState offline onRetry={() => setAttempt((x) => x + 1)} /> : !loading && items.length === 0 ? (
            <EmptyState icon="search" title="نتیجه‌ای پیدا نشد" text={q ? `برای «${q}» کالایی نداریم. املای کلمه را بررسی کنید یا فیلترها را کم کنید.` : 'با این فیلترها کالایی پیدا نشد. فیلترها را تغییر دهید.'} action={<><Button onClick={reset}>حذف فیلترها</Button><Button variant="secondary" onClick={() => navigate('/products')}>همه محصولات</Button></>} />
          ) : (
            <>
              <ProductGrid items={shown} layout={view} loading={loading} cols="lg:grid-cols-3 xl:grid-cols-4" />
              {!loading && pages > 1 && (
                <nav aria-label="صفحه‌بندی" className="mt-10 flex items-center justify-center gap-1.5">
                  <Button variant="secondary" size="sm" disabled={page === 1} aria-label="صفحه قبل" onClick={() => { setPage(page - 1); scrollTo({ top: 0 }) }}><Icon name="prev" size={16} /></Button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} aria-current={n === page ? 'page' : undefined} onClick={() => { setPage(n); scrollTo({ top: 0 }) }} className={cn('size-9 rounded-lg text-sm font-semibold tabular-nums', n === page ? 'bg-brand-700 text-white' : 'bg-white ring-1 ring-inset ring-line hover:bg-sand')}>{toFa(n)}</button>)}
                  <Button variant="secondary" size="sm" disabled={page === pages} aria-label="صفحه بعد" onClick={() => { setPage(page + 1); scrollTo({ top: 0 }) }}><Icon name="next" size={16} /></Button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
      <Drawer open={sheet} onClose={() => setSheet(false)} side="bottom" title="فیلتر محصولات" footer={<div className="flex gap-3"><Button full onClick={() => setSheet(false)}>نمایش {toFa(items.length)} کالا</Button><Button variant="secondary" onClick={reset}>پاک‌کردن</Button></div>}>
        <FilterPanel f={f} onChange={change} onReset={reset} />
      </Drawer>
    </Container>
  )
}
