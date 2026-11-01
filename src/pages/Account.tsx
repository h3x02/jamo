import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { OrderStatus, Price, ProductGrid } from '../components/commerce'
import { Badge, Breadcrumb, Button, Container, EmptyState, Img, Input, Modal, Select, Textarea, Toggle } from '../components/ui'
import { getProduct, img, provinces, statusMeta, timeline, type Order, type Status } from '../lib/data'
import { cn, enDigits, isMobile, isPostal, toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { useStore } from '../lib/store'

const nav = [
  ['/account', 'user', 'پروفایل'], ['/account/orders', 'package', 'سفارش‌ها'], ['/account/addresses', 'pin', 'آدرس‌ها'],
  ['/account/wishlist', 'heart', 'علاقه‌مندی‌ها'], ['/account/saved', 'bookmark', 'ذخیره‌شده‌ها'], ['/account/settings', 'settings', 'تنظیمات حساب'],
] as const

export default function Account({ sub }: { sub: string }) {
  const { user, logout, toast } = useStore()
  useEffect(() => { if (!user) navigate(`/login?next=/account${sub ? '/' + sub : ''}`) }, [user, sub])
  if (!user) return null
  const [section, ...rest] = sub.split('/')
  const path = '/account' + (section ? '/' + section : '')
  return (
    <Container className="pb-4">
      <Breadcrumb items={[{ label: 'جامو', to: '/' }, { label: 'حساب کاربری', to: section ? '/account' : undefined }, ...(section ? [{ label: nav.find((n) => n[0] === path)?.[2] ?? '' }] : [])]} />
      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-32">
          <div className="hidden items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-line/60 lg:flex"><span className="grid size-12 place-items-center rounded-full bg-brand-700 text-lg font-bold text-white">{user.name[0]}</span><div><p className="font-bold">{user.name}</p><p className="text-sm text-muted tabular-nums">{user.phone}</p></div></div>
          <nav aria-label="حساب کاربری" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-1 lg:rounded-xl lg:bg-white lg:p-2 lg:ring-1 lg:ring-line/60">
            {nav.map(([to, ic, l]) => <Link key={to} to={to} aria-current={path === to ? 'page' : undefined} className={cn('flex h-11 shrink-0 items-center gap-2.5 rounded-lg px-4 text-sm font-medium', path === to ? 'bg-brand-700 text-white lg:bg-brand-50 lg:text-brand-800' : 'bg-white ring-1 ring-line/60 hover:bg-sand lg:bg-transparent lg:ring-0')}><Icon name={ic} size={18} />{l}</Link>)}
            <button onClick={() => { logout(); toast('از حساب خارج شدید', 'info'); navigate('/') }} className="hidden h-11 items-center gap-2.5 rounded-lg px-4 text-sm font-medium text-sale hover:bg-sale-50 lg:flex"><Icon name="logout" size={18} />خروج</button>
          </nav>
        </aside>
        <section className="min-w-0 animate-fade-up" key={sub}>
          {section === 'orders' ? (rest[0] ? <OrderDetail id={decodeURIComponent(rest[0])} /> : <Orders />) : section === 'addresses' ? <Addresses /> : section === 'wishlist' ? <Wishlist /> : section === 'saved' ? <Saved /> : section === 'settings' ? <Settings /> : <Profile />}
        </section>
      </div>
    </Container>
  )
}

const Card = ({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="rounded-xl bg-white p-5 shadow-card ring-1 ring-line/60">{(title || action) && <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{title}</h2>{action}</div>}{children}</div>
)

function Profile() {
  const { user, setUser, orders, wishlist, toast } = useStore()
  const [f, setF] = useState({ name: user!.name, phone: user!.phone, email: '' })
  const [err, setErr] = useState('')
  const stats = [['سفارش‌ها', orders.length, 'package'], ['در جریان', orders.filter((o) => ['paid', 'preparing', 'courier', 'shipped'].includes(o.status)).length, 'truck'], ['علاقه‌مندی', wishlist.length, 'heart']] as const
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">{stats.map(([l, v, ic]) => <div key={l} className="rounded-xl bg-white p-4 ring-1 ring-line/60"><Icon name={ic} size={20} className="text-brand-700" /><p className="mt-2 text-2xl font-extrabold tabular-nums">{toFa(v)}</p><p className="text-[13px] text-muted">{l}</p></div>)}</div>
      <Card title="اطلاعات شخصی">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (f.name.trim().length < 3) return setErr('نام را کامل وارد کنید'); if (!isMobile(f.phone)) return setErr('شماره موبایل معتبر نیست'); setErr(''); setUser({ name: f.name, phone: enDigits(f.phone) }); toast('اطلاعات ذخیره شد') }}>
          <Input label="نام و نام خانوادگی" name="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="شماره موبایل" name="phone" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <div className="sm:col-span-2"><Input label="ایمیل" name="email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="example@mail.com" /></div>
          {err && <p role="alert" className="text-sm text-sale sm:col-span-2">{err}</p>}
          <div className="sm:col-span-2"><Button type="submit">ذخیره تغییرات</Button></div>
        </form>
      </Card>
    </div>
  )
}

function Orders() {
  const { orders } = useStore()
  const [flt, setFlt] = useState<'all' | Status>('all')
  const list = orders.filter((o) => flt === 'all' || o.status === flt)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">سفارش‌های من</h1>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(['all', ...Object.keys(statusMeta)] as const).map((s) => <button key={s} onClick={() => setFlt(s as never)} aria-pressed={flt === s} className={cn('h-9 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ring-inset', flt === s ? 'bg-ink text-white ring-ink' : 'bg-white ring-line hover:bg-sand')}>{s === 'all' ? 'همه' : statusMeta[s as Status].label}</button>)}
      </div>
      {list.length === 0 ? <EmptyState icon="package" title="سفارشی پیدا نشد" text="در این وضعیت سفارشی ندارید." action={<Button onClick={() => navigate('/products')}>شروع خرید</Button>} /> : list.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="block rounded-xl bg-white p-4 shadow-card ring-1 ring-line/60 transition hover:ring-brand-200">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm"><b>{o.id}</b><span className="mx-2 text-muted">·</span><span className="text-muted">{o.date}</span></div><OrderStatus status={o.status} size="sm" /></div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex -space-x-2 space-x-reverse">{o.items.slice(0, 4).map((i) => <Img key={i.id} src={img(getProduct(i.id)!.images[0], 120)} alt="" className="size-14 rounded-lg ring-2 ring-white" />)}</div>
            <div className="text-end"><p className="text-xs text-muted">مبلغ کل</p><p className="font-bold tabular-nums">{toFa(o.total)} تومان</p></div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function OrderDetail({ id }: { id: string }) {
  const { orders, setOrderStatus, toast } = useStore()
  const o: Order | undefined = orders.find((x) => x.id === id)
  const [confirm, setConfirm] = useState(false)
  if (!o) return <EmptyState icon="package" title="سفارش پیدا نشد" action={<Button onClick={() => navigate('/account/orders')}>همه سفارش‌ها</Button>} />
  const idx = timeline.indexOf(o.status)
  const canCancel = ['pending', 'paid', 'preparing'].includes(o.status)
  const sub = o.items.reduce((s, i) => s + i.price * i.qty, 0)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><Link to="/account/orders" className="flex items-center gap-1 text-sm text-muted hover:text-ink"><Icon name="arrow" size={14} className="-scale-x-100" />همه سفارش‌ها</Link><h1 className="mt-1 text-xl font-bold">سفارش {o.id}</h1><p className="text-sm text-muted">ثبت‌شده در {o.date}</p></div><OrderStatus status={o.status} /></div>
      {o.status === 'cancelled' ? (
        <div className="flex gap-3 rounded-xl bg-sale-50 p-4 text-sm leading-7 text-red-900"><Icon name="alert" className="mt-1 shrink-0" /><p>این سفارش لغو شده است. در صورت پرداخت، مبلغ تا ۷۲ ساعت کاری به حساب شما بازگردانده می‌شود.</p></div>
      ) : o.status === 'pending' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><span className="flex items-center gap-2"><Icon name="clock" size={18} />پرداخت این سفارش هنوز انجام نشده است.</span><Button size="sm" onClick={() => { setOrderStatus(o.id, 'paid'); toast('پرداخت با موفقیت انجام شد') }}>پرداخت {toFa(o.total)} تومان</Button></div>
      ) : (
        <Card title="پیگیری سفارش">
          <ol className="relative grid grid-cols-5 gap-1">
            {timeline.map((s, i) => { const done = i <= idx; return (
              <li key={s} className="relative flex flex-col items-center gap-2 text-center">
                {i > 0 && <span className={cn('absolute end-1/2 top-4 h-0.5 w-full', i <= idx ? 'bg-brand-600' : 'bg-line')} />}
                <span className={cn('relative grid size-8 place-items-center rounded-full', done ? 'bg-brand-600 text-white' : 'bg-line text-muted', i === idx && 'ring-4 ring-brand-100')}><Icon name={done ? 'check' : statusMeta[s].icon} size={15} /></span>
                <span className={cn('text-[11px] leading-5 sm:text-[13px]', done ? 'font-semibold' : 'text-muted')}>{statusMeta[s].label}</span>
              </li>) })}
          </ol>
        </Card>
      )}
      <Card title={`کالاها (${toFa(o.items.length)})`}>
        <ul className="divide-y divide-line">{o.items.map((i) => { const p = getProduct(i.id)!; return <li key={i.id + (i.variant ?? '')} className="flex items-center gap-3 py-3"><Img src={img(p.images[0], 160)} alt="" className="size-16 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><Link to={`/product/${p.id}`} className="line-clamp-2 text-sm font-medium">{p.name}</Link><p className="text-[13px] text-muted">{i.variant ? i.variant + ' · ' : ''}{toFa(i.qty)} عدد</p></div><b className="text-sm tabular-nums">{toFa(i.price * i.qty)}</b></li> })}</ul>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="تحویل گیرنده"><div className="space-y-1 text-sm leading-7"><p className="font-semibold">{o.address.name}</p><p className="tabular-nums text-muted">{toFa(o.address.phone)}</p><p className="text-muted">{o.address.province}، {o.address.city}، {o.address.address}</p><p className="text-muted">کد پستی: {o.address.postal}</p><p className="pt-1"><Badge className="bg-sand">{o.method}</Badge></p></div></Card>
        <Card title="صورت‌حساب"><dl className="space-y-2 text-sm">{[['جمع کالاها', sub], ['هزینه ارسال', o.shipping], ...(o.discount ? [['تخفیف', -o.discount]] : [])].map(([l, v]) => <div key={l as string} className="flex justify-between"><dt className="text-muted">{l}</dt><dd className="tabular-nums">{v === 0 ? 'رایگان' : toFa(v as number)}</dd></div>)}<div className="flex items-end justify-between border-t border-line pt-3"><dt className="font-semibold">مبلغ کل</dt><dd><Price price={o.total} /></dd></div><p className="text-xs text-muted">{o.payment}</p></dl></Card>
      </div>
      {canCancel && <Button variant="danger" onClick={() => setConfirm(true)}>لغو سفارش</Button>}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="لغو سفارش" footer={<div className="flex gap-3"><Button variant="danger" full onClick={() => { setOrderStatus(o.id, 'cancelled'); setConfirm(false); toast('سفارش لغو شد', 'info') }}>بله، لغو شود</Button><Button variant="secondary" full onClick={() => setConfirm(false)}>انصراف</Button></div>}><p className="text-sm leading-7">آیا از لغو سفارش <b>{o.id}</b> مطمئن هستید؟ این کار قابل بازگشت نیست.</p></Modal>
    </div>
  )
}

function Addresses() {
  const { addresses, addAddress, removeAddress, toast, user } = useStore()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ title: '', province: 'تهران', city: 'تهران', address: '', postal: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const save = () => {
    const e: Record<string, string> = {}
    if (!f.title.trim()) e.title = 'عنوان آدرس را وارد کنید'
    if (f.address.trim().length < 10) e.address = 'نشانی کامل را وارد کنید'
    if (!isPostal(f.postal)) e.postal = 'کد پستی باید ۱۰ رقم باشد'
    setErrs(e)
    if (Object.keys(e).length) return
    addAddress({ ...f, id: 'a' + Date.now(), name: user!.name, phone: user!.phone, postal: enDigits(f.postal) })
    setOpen(false); setF({ title: '', province: 'تهران', city: 'تهران', address: '', postal: '' }); toast('آدرس ذخیره شد')
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">آدرس‌های من</h1><Button size="sm" onClick={() => setOpen(true)}><Icon name="plus" size={16} />آدرس جدید</Button></div>
      {addresses.length === 0 ? <EmptyState icon="pin" title="آدرسی ثبت نشده" text="برای خرید سریع‌تر، آدرس خود را ذخیره کنید." /> : <div className="grid gap-4 md:grid-cols-2">{addresses.map((a) => <Card key={a.id}><div className="flex items-start justify-between"><b>{a.title}</b><button aria-label="حذف آدرس" onClick={() => { removeAddress(a.id); toast('آدرس حذف شد', 'info') }} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sale-50 hover:text-sale"><Icon name="trash" size={18} /></button></div><p className="mt-2 text-sm leading-7 text-muted">{a.province}، {a.city}، {a.address}</p><p className="mt-1 text-sm text-muted">کد پستی: {a.postal}</p></Card>)}</div>}
      <Modal open={open} onClose={() => setOpen(false)} title="افزودن آدرس" footer={<Button full onClick={save}>ذخیره آدرس</Button>}>
        <div className="space-y-4">
          <Input label="عنوان" name="title" placeholder="خانه، محل کار …" value={f.title} error={errs.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3"><Select label="استان" value={f.province} onChange={(e) => setF({ ...f, province: e.target.value, city: provinces[e.target.value][0] })}>{Object.keys(provinces).map((p) => <option key={p}>{p}</option>)}</Select><Select label="شهر" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{provinces[f.province].map((c) => <option key={c}>{c}</option>)}</Select></div>
          <Textarea label="نشانی کامل" name="address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />{errs.address && <p role="alert" className="text-[13px] text-sale">{errs.address}</p>}
          <Input label="کد پستی" name="postal" inputMode="numeric" maxLength={10} value={f.postal} error={errs.postal} onChange={(e) => setF({ ...f, postal: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

function Wishlist() {
  const { wishlist } = useStore()
  const items = wishlist.map(getProduct).filter(Boolean) as NonNullable<ReturnType<typeof getProduct>>[]
  return <div className="space-y-4"><h1 className="text-xl font-bold">علاقه‌مندی‌ها</h1>{items.length === 0 ? <EmptyState icon="heart" title="فهرست علاقه‌مندی خالی است" text="با زدن آیکون قلب روی هر کالا، آن را اینجا ذخیره کنید." action={<Button onClick={() => navigate('/products')}>مشاهده محصولات</Button>} /> : <ProductGrid items={items} cols="lg:grid-cols-3" />}</div>
}

function Saved() {
  const { saved, moveToCart, removeSaved } = useStore()
  return (
    <div className="space-y-4"><h1 className="text-xl font-bold">ذخیره‌شده برای بعد</h1>
      {saved.length === 0 ? <EmptyState icon="bookmark" title="موردی ذخیره نشده" text="در سبد خرید می‌توانید کالاها را برای خرید بعدی نگه دارید." action={<Button onClick={() => navigate('/cart')}>رفتن به سبد</Button>} /> : (
        <div className="divide-y divide-line rounded-xl bg-white px-4 ring-1 ring-line/60">{saved.map((l) => { const p = getProduct(l.id)!; return <div key={l.key} className="flex items-center gap-3 py-3"><Img src={img(p.images[0], 200)} alt="" className="size-16 shrink-0 rounded-lg" /><div className="min-w-0 flex-1"><Link to={`/product/${p.id}`} className="line-clamp-1 text-sm font-medium">{p.name}</Link><Price price={p.price} size="sm" /></div><Button size="sm" variant="secondary" onClick={() => moveToCart(l.key)}>افزودن به سبد</Button><button aria-label="حذف" onClick={() => removeSaved(l.key)} className="grid size-9 place-items-center text-muted hover:text-sale"><Icon name="trash" size={18} /></button></div> })}</div>
      )}
    </div>
  )
}

function Settings() {
  const { logout, toast } = useStore()
  const [s, setS] = useState({ sms: true, offers: false, stock: true })
  const rows: [keyof typeof s, string, string][] = [['sms', 'پیامک وضعیت سفارش', 'اطلاع از مراحل ارسال و تحویل'], ['offers', 'پیشنهادهای ویژه', 'تخفیف‌ها و کدهای اختصاصی'], ['stock', 'اطلاع‌رسانی موجودی', 'وقتی کالای مورد علاقه‌تان موجود شد']]
  return (
    <div className="space-y-5"><h1 className="text-xl font-bold">تنظیمات حساب</h1>
      <Card title="اطلاع‌رسانی"><ul className="divide-y divide-line">{rows.map(([k, t, d]) => <li key={k} className="flex items-center justify-between gap-4 py-3.5"><div><p className="text-sm font-semibold">{t}</p><p className="text-[13px] text-muted">{d}</p></div><Toggle label={t} checked={s[k]} onChange={(v) => setS({ ...s, [k]: v })} /></li>)}</ul></Card>
      <Card title="امنیت"><div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => toast('لینک تغییر رمز برای شما پیامک شد')}><Icon name="lock" size={17} />تغییر رمز عبور</Button><Button variant="danger" onClick={() => { logout(); navigate('/') }}><Icon name="logout" size={17} />خروج از حساب</Button></div></Card>
    </div>
  )
}
