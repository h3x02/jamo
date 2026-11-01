import { useState } from 'react'
import { Icon } from '../components/Icon'
import { CartItem, OrderStatus, Price } from '../components/commerce'
import { Button, Container, EmptyState, Input, Modal, Select, Textarea } from '../components/ui'
import { FREE_SHIP, getProduct, provinces, shippingMethods, type Order } from '../lib/data'
import { cn, enDigits, faDigits, isMobile, isPostal, toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { useStore } from '../lib/store'

const steps = ['اطلاعات مشتری', 'آدرس تحویل', 'شیوه ارسال', 'پرداخت', 'تأیید سفارش']

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center" aria-label="مراحل خرید">
      {steps.map((s, i) => (
        <li key={s} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')} aria-current={i === step ? 'step' : undefined}>
          <span className={cn('grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors', i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-700 text-white ring-4 ring-brand-100' : 'bg-line text-muted')}>{i < step ? <Icon name="check" size={16} /> : toFa(i + 1)}</span>
          <span className={cn('ms-2 hidden text-sm font-medium lg:inline', i === step ? 'text-ink' : 'text-muted')}>{s}</span>
          {i < steps.length - 1 && <span className={cn('mx-2 h-0.5 flex-1 rounded-full', i < step ? 'bg-brand-600' : 'bg-line')} />}
        </li>
      ))}
    </ol>
  )
}

export default function Checkout() {
  const { cart, user, addresses, totals: t, couponCode, addOrder, setOrderStatus, clearCart, toast, login } = useStore()
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [step, setStep] = useState(0)
  const [info, setInfo] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: '' })
  const [addr, setAddr] = useState({ province: 'تهران', city: 'تهران', address: '', postal: '', notes: '' })
  const [savedAddr, setSavedAddr] = useState<string>(addresses[0]?.id ?? 'new')
  const [method, setMethod] = useState('post')
  const [pay, setPay] = useState<'online' | 'cod'>('online')
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [gateway, setGateway] = useState(false)
  const [paying, setPaying] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; order: Order } | null>(null)
  const [showItems, setShowItems] = useState(false)

  if (!cart.length && !result)
    return <Container><EmptyState icon="cart" title="سبد خرید شما خالی است" text="برای ثبت سفارش ابتدا کالایی به سبد اضافه کنید." action={<Button onClick={() => navigate('/products')}>مشاهده محصولات</Button>} /></Container>

  const useSaved = savedAddr !== 'new'
  const sa = addresses.find((a) => a.id === savedAddr)
  const finalAddr = useSaved && sa ? sa : { id: 'n', title: 'آدرس سفارش', name: info.name, phone: info.phone, ...addr }
  const free = t.subtotal - t.coupon >= FREE_SHIP
  const m = shippingMethods.find((x) => x.id === method)!
  const ship = free ? 0 : m.price
  const total = t.subtotal - t.coupon + ship
  const tehran = finalAddr.province === 'تهران' || finalAddr.province === 'البرز'

  const next = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (info.name.trim().length < 3) e.name = 'نام و نام خانوادگی را کامل وارد کنید'
      if (!isMobile(info.phone)) e.phone = 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'
      if (info.email && !/^\S+@\S+\.\S+$/.test(info.email)) e.email = 'ایمیل معتبر نیست'
    }
    if (step === 1 && !useSaved) {
      if (addr.address.trim().length < 10) e.address = 'نشانی دقیق را (حداقل ۱۰ حرف) وارد کنید'
      if (!isPostal(addr.postal)) e.postal = 'کد پستی باید ۱۰ رقم باشد'
    }
    setErrs(e)
    if (Object.keys(e).length) { toast('لطفاً خطاهای فرم را برطرف کنید', 'error'); return }
    if (step === 1 && method === 'courier' && !tehran) setMethod('post')
    setStep(step + 1); scrollTo({ top: 0, behavior: 'smooth' })
  }

  const place = (ok: boolean) => {
    const status = ok ? (pay === 'cod' ? 'preparing' : 'paid') : 'pending'
    let order: Order
    if (pendingOrder) {
      order = { ...pendingOrder, status, payment: pay === 'cod' ? 'پرداخت در محل' : 'پرداخت آنلاین' }
      setOrderStatus(order.id, status)
    } else {
      order = {
        id: 'JM-' + faDigits(String(300000 + Math.floor(Math.random() * 99999))), date: new Date().toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }),
        status, items: cart.map((l) => ({ id: l.id, qty: l.qty, variant: l.variant, price: getProduct(l.id)!.price })), shipping: ship, discount: t.coupon, total, method: m.name,
        payment: pay === 'cod' ? 'پرداخت در محل' : 'پرداخت آنلاین', address: { ...finalAddr, id: 'o' } as Order['address'],
      }
      addOrder(order)
    }
    setPendingOrder(ok ? null : order)
    if (!user) login(info.phone, info.name)
    if (ok) clearCart()
    setResult({ ok, order }); setStep(4); setGateway(false); setPaying(false); scrollTo({ top: 0 })
  }
  const submit = () => (pay === 'cod' ? place(true) : setGateway(true))

  /* Result views */
  if (result)
    return (
      <Container className="max-w-xl py-10">
        <div className="space-y-5 rounded-xl bg-white p-6 text-center shadow-card ring-1 ring-line/60 animate-fade-up md:p-10">
          <span className={cn('mx-auto grid size-16 place-items-center rounded-full', result.ok ? 'bg-brand-50 text-brand-600' : 'bg-sale-50 text-sale')}><Icon name={result.ok ? 'check' : 'alert'} size={32} /></span>
          <h1 className="text-xl font-bold">{result.ok ? 'سفارش شما با موفقیت ثبت شد' : 'پرداخت ناموفق بود'}</h1>
          <p className="text-sm leading-7 text-muted">{result.ok ? 'پیامک تأیید سفارش برای شما ارسال شد. می‌توانید وضعیت سفارش را در حساب کاربری پیگیری کنید.' : 'مبلغی از حساب شما کسر نشده است. سفارش با وضعیت «در انتظار پرداخت» ذخیره شد و می‌توانید تا ۲۴ ساعت دیگر آن را پرداخت کنید.'}</p>
          <div className="space-y-2 rounded-lg bg-sand p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">کد پیگیری</span><b>{result.order.id}</b></div>
            <div className="flex justify-between"><span className="text-muted">وضعیت</span><OrderStatus status={result.order.status} size="sm" /></div>
            <div className="flex justify-between"><span className="text-muted">مبلغ</span><b className="tabular-nums">{toFa(result.order.total)} تومان</b></div>
            <div className="flex justify-between"><span className="text-muted">تحویل</span><span>{result.order.method}</span></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {result.ok ? <Button onClick={() => navigate(`/account/orders/${result.order.id}`)}>پیگیری سفارش</Button> : <><Button onClick={() => { setResult(null); setStep(3) }}>تلاش مجدد برای پرداخت</Button><Button variant="secondary" onClick={() => navigate(`/account/orders/${result.order.id}`)}>مشاهده سفارش</Button></>}
            <Button variant="secondary" onClick={() => navigate('/')}>بازگشت به فروشگاه</Button>
          </div>
        </div>
      </Container>
    )

  return (
    <Container className="max-w-5xl py-6 md:py-10">
      <Stepper step={step} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 rounded-xl bg-white p-5 shadow-card ring-1 ring-line/60 md:p-7 animate-fade" key={step}>
          <h1 className="text-lg font-bold">{steps[step]}</h1>
          {step === 0 && (
            <div className="space-y-4">
              <Input label="نام و نام خانوادگی" name="name" autoComplete="name" value={info.name} error={errs.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="مثلاً نرگس احمدی" />
              <Input label="شماره موبایل" name="phone" inputMode="numeric" autoComplete="tel" maxLength={11} value={info.phone} error={errs.phone} hint="کد رهگیری و اطلاعات ارسال به این شماره پیامک می‌شود" onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              <Input label="ایمیل (اختیاری)" name="email" type="email" value={info.email} error={errs.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
              {!user && <p className="text-[13px] text-muted">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login?next=/checkout" className="font-semibold text-brand-700">وارد شوید</Link></p>}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              {addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((a) => <label key={a.id} className={cn('flex cursor-pointer gap-3 rounded-lg p-3 ring-1 ring-inset', savedAddr === a.id ? 'bg-brand-50 ring-2 ring-brand-600' : 'ring-line')}><input type="radio" name="addr" className="mt-1.5" checked={savedAddr === a.id} onChange={() => setSavedAddr(a.id)} /><span className="text-sm leading-7"><b>{a.title}</b> · {a.province}، {a.city}<br /><span className="text-muted">{a.address}</span></span></label>)}
                  <label className={cn('flex cursor-pointer items-center gap-3 rounded-lg p-3 text-sm font-medium ring-1 ring-inset', useSaved ? 'ring-line' : 'bg-brand-50 ring-2 ring-brand-600')}><input type="radio" name="addr" checked={!useSaved} onChange={() => setSavedAddr('new')} /><Icon name="plus" size={16} />آدرس جدید</label>
                </div>
              )}
              {!useSaved && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="استان" name="province" value={addr.province} onChange={(e) => setAddr({ ...addr, province: e.target.value, city: provinces[e.target.value][0] })}>{Object.keys(provinces).map((p) => <option key={p}>{p}</option>)}</Select>
                  <Select label="شهر" name="city" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })}>{provinces[addr.province].map((c) => <option key={c}>{c}</option>)}</Select>
                  <div className="sm:col-span-2"><Textarea label="نشانی کامل" name="address" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="خیابان، کوچه، پلاک، واحد" />{errs.address && <p role="alert" className="mt-1.5 text-[13px] text-sale">{errs.address}</p>}</div>
                  <Input label="کد پستی (۱۰ رقم)" name="postal" inputMode="numeric" maxLength={10} value={addr.postal} error={errs.postal} onChange={(e) => setAddr({ ...addr, postal: e.target.value })} />
                </div>
              )}
              <Textarea label="توضیحات تحویل (اختیاری)" name="notes" value={addr.notes} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} placeholder="مثلاً: لطفاً قبل از رسیدن تماس بگیرید" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3" role="radiogroup" aria-label="شیوه ارسال">
              {shippingMethods.map((s) => { const dis = s.tehranOnly && !tehran; return (
                <label key={s.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg p-4 ring-1 ring-inset', dis && 'cursor-not-allowed opacity-50', method === s.id ? 'bg-brand-50 ring-2 ring-brand-600' : 'ring-line')}>
                  <input type="radio" name="ship" disabled={dis} checked={method === s.id} onChange={() => setMethod(s.id)} />
                  <span className="grid size-10 place-items-center rounded-full bg-white text-brand-700"><Icon name="truck" size={20} /></span>
                  <span className="flex-1"><b className="block text-[15px]">{s.name}</b><span className="text-[13px] text-muted">{dis ? 'فقط تهران و البرز' : s.eta}</span></span>
                  <b className="text-sm tabular-nums">{free ? <span className="text-brand-700">رایگان</span> : `${toFa(s.price)} تومان`}</b>
                </label>) })}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3" role="radiogroup" aria-label="روش پرداخت">
              {([['online', 'پرداخت آنلاین', 'پرداخت امن با کارت‌های عضو شتاب', 'card'], ['cod', 'پرداخت در محل', tehran && method === 'courier' ? 'پرداخت هنگام تحویل با پیک' : 'فقط با ارسال پیک موتوری', 'package']] as const).map(([id, n, d, ic]) => { const dis = id === 'cod' && !(tehran && method === 'courier'); return (
                <label key={id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg p-4 ring-1 ring-inset', dis && 'cursor-not-allowed opacity-50', pay === id ? 'bg-brand-50 ring-2 ring-brand-600' : 'ring-line')}>
                  <input type="radio" name="pay" disabled={dis} checked={pay === id} onChange={() => setPay(id)} />
                  <span className="grid size-10 place-items-center rounded-full bg-white text-brand-700"><Icon name={ic} size={20} /></span>
                  <span className="flex-1"><b className="block text-[15px]">{n}</b><span className="text-[13px] text-muted">{d}</span></span>
                </label>) })}
              <div className="rounded-lg bg-sand p-4 text-sm leading-7 text-muted">
                <p><b className="text-ink">تحویل به:</b> {finalAddr.name || info.name} · {finalAddr.province}، {finalAddr.city}</p>
                <p><b className="text-ink">ارسال:</b> {m.name} · {m.eta}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>بازگشت</Button> : <Link to="/cart" className="text-sm font-medium text-muted hover:text-ink">بازگشت به سبد</Link>}
            {step < 3 ? <Button size="lg" className="min-w-40" onClick={next}>ادامه<Icon name="next" size={18} /></Button> : <Button size="lg" className="min-w-48" onClick={submit}><Icon name="lock" size={18} />{pay === 'cod' ? 'ثبت سفارش' : `پرداخت ${toFa(total)} تومان`}</Button>}
          </div>
        </div>

        <aside className="rounded-xl bg-white p-5 shadow-card ring-1 ring-line/60 lg:sticky lg:top-6">
          <button className="flex w-full items-center justify-between font-bold lg:pointer-events-none" aria-expanded={showItems} onClick={() => setShowItems(!showItems)}>خلاصه سفارش ({toFa(cart.length)} کالا)<Icon name="down" size={18} className={cn('lg:hidden transition-transform', showItems && 'rotate-180')} /></button>
          <div className={cn('divide-y divide-line', showItems ? 'block' : 'hidden lg:block')}>{cart.map((l) => <CartItem key={l.key} line={l} compact />)}</div>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">جمع کالاها</dt><dd className="tabular-nums">{toFa(t.subtotal)}</dd></div>
            {t.coupon > 0 && <div className="flex justify-between text-sale"><dt>کد تخفیف {couponCode}</dt><dd className="tabular-nums">− {toFa(t.coupon)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">ارسال</dt><dd className="tabular-nums">{step < 2 ? 'در مرحله بعد' : ship ? toFa(ship) : 'رایگان'}</dd></div>
          </dl>
          <div className="mt-3 flex items-end justify-between border-t border-line pt-4"><span className="font-semibold">قابل پرداخت</span><Price price={step < 2 ? t.subtotal - t.coupon : total} /></div>
        </aside>
      </div>

      <Modal open={gateway} onClose={() => !paying && setGateway(false)} title="درگاه پرداخت امن">
        <div className="space-y-4 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700"><Icon name="lock" size={22} /></span>
          <p className="text-sm text-muted">پرداخت به فروشگاه <b className="text-ink">جامو</b></p>
          <p className="text-2xl font-extrabold tabular-nums">{toFa(total)} <span className="text-sm font-medium text-muted">تومان</span></p>
          <p className="rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-800">این صفحه شبیه‌ساز درگاه بانکی است. نتیجه پرداخت را انتخاب کنید.</p>
          <div className="flex flex-col gap-2"><Button size="lg" loading={paying} onClick={() => { setPaying(true); setTimeout(() => place(true), 1100) }}>پرداخت موفق</Button><Button variant="danger" disabled={paying} onClick={() => place(false)}>انصراف / پرداخت ناموفق</Button></div>
        </div>
      </Modal>
    </Container>
  )
}
