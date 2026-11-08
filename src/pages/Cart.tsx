import { useState } from 'react'
import { Icon } from '../components/Icon'
import { CartItem, Price, ProductGrid } from '../components/commerce'
import { Button, Container, EmptyState, Input, Img, Modal } from '../components/ui'
import { coupons, FREE_SHIP, getProduct, img, products } from '../lib/data'
import { toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Summary({ cta }: { cta?: boolean }) {
  const { totals: t, couponCode, applyCoupon, removeCoupon, toast, count } = useStore()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const row = (l: string, v: React.ReactNode, cls = '') => <div className={`flex items-center justify-between text-sm ${cls}`}><span className="text-muted">{l}</span><span className="font-medium tabular-nums">{v}</span></div>
  const left = FREE_SHIP - (t.subtotal - t.coupon)
  return (
    <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-line/60">
      <h2 className="font-bold">خلاصه سفارش</h2>
      {t.subtotal > 0 && (
        <div className="rounded-lg bg-brand-50 p-3 text-[13px] text-brand-800">
          {left > 0 ? <>با <b className="tabular-nums">{toFa(left)}</b> تومان خرید بیشتر، ارسال رایگان می‌شود.</> : <span className="flex items-center gap-1.5 font-semibold"><Icon name="check" size={16} />ارسال این سفارش رایگان است</span>}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: Math.min(100, ((t.subtotal - t.coupon) / FREE_SHIP) * 100) + '%' }} /></div>
        </div>
      )}
      <div className="space-y-2.5">
        {row(`قیمت کالاها (${toFa(count)})`, `${toFa(t.original)} تومان`)}
        {t.productDiscount > 0 && row('سود شما از تخفیف', <span className="text-sale">− {toFa(t.productDiscount)} تومان</span>)}
        {t.coupon > 0 && row('کد تخفیف', <span className="text-sale">− {toFa(t.coupon)} تومان</span>)}
        {row('هزینه ارسال (تخمینی)', t.shipping ? `${toFa(t.shipping)} تومان` : <span className="text-brand-700">رایگان</span>)}
      </div>
      {couponCode ? (
        <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2.5 text-sm"><span className="flex items-center gap-2 text-brand-800"><Icon name="tag" size={16} /><b>{couponCode}</b><span className="text-xs">{coupons[couponCode].label}</span></span><button aria-label="حذف کد" onClick={removeCoupon} className="text-muted hover:text-sale"><Icon name="x" size={16} /></button></div>
      ) : (
        <form className="flex items-start gap-2" onSubmit={(e) => { e.preventDefault(); const r = applyCoupon(code); setErr(r ?? ''); if (!r) { toast('کد تخفیف اعمال شد'); setCode('') } }}>
          <div className="flex-1"><Input aria-label="کد تخفیف" placeholder="کد تخفیف" value={code} onChange={(e) => { setCode(e.target.value); setErr('') }} error={err} /></div>
          <Button type="submit" variant="secondary">اعمال</Button>
        </form>
      )}
      <div className="flex items-end justify-between border-t border-line pt-4"><span className="font-semibold">مبلغ قابل پرداخت</span><Price price={t.total} size="lg" /></div>
      {cta && <Button size="lg" full onClick={() => navigate('/checkout')}>ادامه و تکمیل خرید<Icon name="next" size={18} /></Button>}
    </div>
  )
}

export default function Cart() {
  const { cart, saved, moveToCart, removeSaved, count, clearCart } = useStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const sug = products.filter((p) => p.stock > 0).sort((a, b) => b.sold - a.sold).slice(0, 4)
  return (
    <Container className="pb-4 pt-6">
      {cart.length === 0 ? (
        <>
          <EmptyState icon="cart" title="سبد خرید شما خالی است" text="کالاهای مورد علاقه‌تان را به سبد اضافه کنید." action={<Button onClick={() => navigate('/products')}>شروع خرید</Button>} />
        </>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between"><h1 className="text-xl font-bold md:text-2xl">سبد خرید <span className="text-base font-normal text-muted">({toFa(count)} کالا)</span></h1><button onClick={() => setConfirmClear(true)} className="text-sm text-muted hover:text-sale">حذف همه</button></div>
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
            <div className="divide-y divide-line rounded-xl bg-white px-4 shadow-card ring-1 ring-line/60 md:px-5">{cart.map((l) => <CartItem key={l.key} line={l} />)}</div>
            <div className="lg:sticky lg:top-40"><Summary cta /></div>
          </div>
        </>
      )}
      {saved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">ذخیره‌شده برای بعد ({toFa(saved.length)})</h2>
          <div className="divide-y divide-line rounded-xl bg-white px-4 ring-1 ring-line/60">
            {saved.map((l) => { const p = getProduct(l.id)!; return (
              <div key={l.key} className="flex items-center gap-3 py-3"><Img src={img(p.images[0], 200)} alt="" className="size-16 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1"><Link to={`/product/${p.id}`} className="line-clamp-1 text-sm font-medium">{p.name}</Link><Price price={p.price} size="sm" /></div>
                <Button size="sm" variant="secondary" onClick={() => moveToCart(l.key)}>افزودن به سبد</Button>
                <button aria-label="حذف" onClick={() => removeSaved(l.key)} className="grid size-9 place-items-center text-muted hover:text-sale"><Icon name="trash" size={18} /></button>
              </div>) })}
          </div>
        </section>
      )}
      <section className="mt-14"><h2 className="mb-5 text-xl font-bold">{cart.length ? 'شاید این‌ها را هم بپسندید' : 'پیشنهاد ما برای شروع'}</h2><ProductGrid items={sug} /></section>
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="حذف همه کالاها" footer={<div className="flex gap-3"><Button variant="danger" full onClick={() => { clearCart(); setConfirmClear(false) }}>حذف همه</Button><Button variant="secondary" full onClick={() => setConfirmClear(false)}>انصراف</Button></div>}>
        <p className="text-sm leading-7 text-muted">آیا مطمئن هستید که می‌خواهید همه کالاهای سبد خرید را حذف کنید؟ این عمل قابل بازگشت نیست.</p>
      </Modal>
    </Container>
  )
}
