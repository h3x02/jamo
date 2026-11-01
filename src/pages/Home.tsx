import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { CategoryCard, ProductGrid, SectionHead } from '../components/commerce'
import { Button, Container, Img, useFakeLoad } from '../components/ui'
import { categories, img, products } from '../lib/data'
import { toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'

function Countdown() {
  const [s, setS] = useState(8 * 3600 + 24 * 60 + 17)
  useEffect(() => {
    const t = setInterval(() => setS((x) => (x > 0 ? x - 1 : 24 * 3600)), 1000)
    return () => clearInterval(t)
  }, [])
  const p = (n: number) => toFa(String(n).padStart(2, '0'))
  return (
    <div className="flex items-center gap-1.5" dir="ltr" aria-label="زمان باقی‌مانده">
      {[Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5"><span className="grid h-10 w-11 place-items-center rounded-lg bg-white/10 text-lg font-bold tabular-nums text-white">{p(v)}</span>{i < 2 && <span className="text-white/50">:</span>}</span>
      ))}
    </div>
  )
}

const trust = [
  { icon: 'truck', t: 'ارسال سریع', d: 'تحویل حداکثر ۲ ساعته در تهران و کرج' },
  { icon: 'shield', t: 'پرداخت امن', d: 'درگاه معتبر بانکی با رمزنگاری' },
  { icon: 'award', t: 'ضمانت تازگی', d: 'تاریخ انقضای معتبر و کیفیت تضمین‌شده' },
  { icon: 'headset', t: 'پشتیبانی', d: 'پاسخ‌گویی همه روزه تا ساعت ۲۱' },
]

export default function Home() {
  const loading = useFakeLoad([], 600)
  const offers = products.filter((p) => p.old).sort((a, b) => (b.old! - b.price) / b.old! - (a.old! - a.price) / a.old!).slice(0, 4)
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4)
  const latest = [...products].sort((a, b) => a.added - b.added).slice(0, 4)
  const featured = [...products].sort((a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews)).slice(0, 8)
  return (
    <div className="space-y-14 pb-4 md:space-y-20">
      {/* Hero */}
      <section className="pt-4 md:pt-6">
        <Container>
          <div className="relative grid overflow-hidden rounded-2xl bg-brand-800 md:min-h-[460px] md:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 flex flex-col items-start justify-center gap-5 p-6 pb-8 text-white md:p-14 animate-fade-up">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-brand-100">تازه‌های امروز، ارسال سریع</span>
              <h1 className="text-[32px] font-extrabold leading-[1.35] md:text-5xl md:leading-[1.3]">سبد خانواده‌تان را<br />تازه و ارزان پر کنید</h1>
              <p className="max-w-md text-[15px] leading-8 text-brand-100 md:text-base">میوه و سبزی تازه، لبنیات، خواروبار، خشکبار و شوینده؛ همه در یک سفارش و با ارسال سریع تا درِ منزل.</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="light" size="lg" onClick={() => navigate('/products')}>مشاهده محصولات<Icon name="next" size={18} /></Button>
                <Button size="lg" className="bg-white/10 hover:bg-white/20" onClick={() => navigate('/products?sort=discount')}>پیشنهادهای ویژه</Button>
              </div>
            </div>
            <div className="relative order-first h-56 md:order-none md:h-auto">
              <img src={img('1609780447631-05b93e5a88ea', 1100)} alt="میوه‌های تازه در بازار" fetchPriority="high" className="absolute inset-0 size-full object-cover animate-[fade_0.8s_ease_both]" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-800/50 to-transparent md:bg-gradient-to-l md:from-transparent md:to-brand-800/30" />
              <Link to="/product/9" className="absolute bottom-4 start-4 hidden items-center gap-3 rounded-xl bg-white p-3 pe-5 shadow-pop transition-transform hover:-translate-y-0.5 md:flex">
                <span className="grid size-10 place-items-center rounded-lg bg-sale-50 text-sale"><Icon name="tag" size={20} /></span>
                <span><span className="block text-xs text-muted">برنج طارم هاشمی</span><span className="text-sm font-bold">{toFa(15)}٪ تخفیف ویژه</span></span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section>
        <Container>
          <SectionHead title="خرید بر اساس دسته‌بندی" to="/products" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-6 md:gap-5">{categories.map((c) => <CategoryCard key={c.id} c={c} />)}</div>
        </Container>
      </section>

      {/* Featured */}
      <section><Container>
        <SectionHead title="محصولات منتخب" sub="محبوب‌ترین‌ها از نگاه مشتریان جامو" to="/products" />
        <ProductGrid items={featured} loading={loading} />
      </Container></section>

      {/* Offers */}
      <section className="bg-brand-900 py-10 md:py-14"><Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-white">
          <div><h2 className="text-xl font-bold md:text-2xl">پیشنهادهای ویژه امروز</h2><p className="mt-0.5 text-sm text-brand-200">تخفیف روی کالاهای پرمصرف، تا پایان زمان مشخص‌شده</p></div>
          <Countdown />
        </div>
        <ProductGrid items={offers} loading={loading} />
        <div className="mt-6 text-center"><Button variant="light" onClick={() => navigate('/products?sort=discount')}>مشاهده همه تخفیف‌ها</Button></div>
      </Container></section>

      {/* Best sellers + promo */}
      <section><Container>
        <SectionHead title="پرفروش‌ترین‌ها" sub="بیشترین خرید در ۳۰ روز گذشته" to="/products?sort=best" />
        <ProductGrid items={best} loading={loading} />
      </Container></section>

      <section><Container>
        <Link to="/products?cat=pantry" className="group relative flex min-h-48 items-center overflow-hidden rounded-2xl bg-sand ring-1 ring-line">
          <div className="relative z-10 max-w-md p-6 md:p-12">
            <p className="text-sm font-semibold text-brand-700">خواروبار با کیفیت</p>
            <h2 className="mt-1 text-2xl font-extrabold leading-snug md:text-3xl">برنج، روغن و چای؛ سبد ماهانه‌تان را یک‌جا بخرید</h2>
            <span className="mt-4 inline-flex items-center gap-1 font-semibold text-brand-700 group-hover:gap-2 transition-all">مشاهده خواروبار<Icon name="next" size={18} /></span>
          </div>
          <Img src={img('1509043183980-23be96ae4109', 900)} alt="" zoom className="absolute inset-y-0 end-0 hidden w-1/2 md:block [mask-image:linear-gradient(to_right,transparent,black_40%)] rtl:[mask-image:linear-gradient(to_right,black_60%,transparent)]" />
        </Link>
      </Container></section>

      <section><Container>
        <SectionHead title="تازه‌ترین کالاها" sub="به‌تازگی به قفسه‌های جامو اضافه شده" to="/products?sort=new" />
        <ProductGrid items={latest} loading={loading} />
      </Container></section>

      {/* Trust */}
      <section><Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line md:grid-cols-4">
          {trust.map((t) => (
            <div key={t.t} className="flex flex-col items-start gap-3 bg-white p-5 md:flex-row md:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Icon name={t.icon} size={22} /></span>
              <div><h3 className="font-bold">{t.t}</h3><p className="mt-0.5 text-[13px] leading-6 text-muted">{t.d}</p></div>
            </div>
          ))}
        </div>
      </Container></section>
    </div>
  )
}
