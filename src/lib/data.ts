export const img = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

export type Variant = { name: string; options: string[]; preselect?: boolean }
export type Product = {
  id: number
  name: string
  brand: string
  cat: string
  price: number
  old?: number
  rating: number
  reviews: number
  stock: number
  sold: number
  added: number
  images: string[]
  variants?: Variant[]
  short: string
}

export const categories = [
  { id: 'fresh', name: 'میوه و سبزی تازه', image: '1550989460-0adf9ea622e2' },
  { id: 'dairy', name: 'لبنیات', image: '1604095853918-1a1823a63dd5' },
  { id: 'pantry', name: 'خواروبار و کنسرو', image: '1509043183980-23be96ae4109' },
  { id: 'drinks', name: 'چای، قهوه و نوشیدنی', image: '1521012012373-6a85bade18da' },
  { id: 'snacks', name: 'خشکبار و تنقلات', image: '1543158181-1274e5362710' },
  { id: 'cleaning', name: 'شوینده و بهداشتی', image: '1563453392212-326f5e854473' },
] as const

const pool: Record<string, string[]> = {
  fresh: ['1488459716781-31db52582fe9', '1609780447631-05b93e5a88ea', '1485637701894-09ad422f6de6', '1612305424474-403a79cc4383'],
  dairy: ['1604095853918-1a1823a63dd5', '1559561853-08451507cbe7', '1624806992221-12d8062c35e5', '1733197012835-e99ebf3c914d'],
  pantry: ['1509043183980-23be96ae4109', '1592178036182-5400889dfc74', '1567966221845-e91f7d888354', '1781018727258-4a70d500e4ee'],
  drinks: ['1491720731493-223f97d92c21', '1521012012373-6a85bade18da', '1498604636225-6b87a314baa0', '1536735926702-9e14ec0448fe'],
  snacks: ['1543158181-1274e5362710', '1641291361624-38b69b86b1cf', '1710857397974-f0617001c39e', '1626697556426-8a55a8af4999'],
  cleaning: ['1563453392212-326f5e854473', '1626379481874-3dc5678fa8ca', '1550963295-019d8a8a61c5', '1583947215259-38e31be8751f'],
}

const weight = (...o: string[]): Variant => ({ name: 'وزن', options: o, preselect: true })

type Seed = [number, string, string, string, number, number | undefined, number, number, number, number, number, Variant[]?, string?]
// id, name, brand, cat, price, old, rating, reviews, stock, sold, added(order), variants, short
const seeds: Seed[] = [
  [1, 'سیب قرمز درجه یک، ۱ کیلوگرم', 'باغ‌های شمال', 'fresh', 98000, 120000, 4.6, 312, 60, 2400, 3, undefined, 'برداشت همین هفته، شیرین و آبدار'],
  [2, 'گوجه‌فرنگی گلخانه‌ای، ۱ کیلوگرم', 'مزرعه سبز', 'fresh', 65000, undefined, 4.4, 198, 80, 3100, 1, undefined, 'رسیده و مناسب سالاد'],
  [3, 'موز وارداتی، ۱ کیلوگرم', 'میوه‌نو', 'fresh', 140000, 165000, 4.3, 87, 0, 1200, 11, undefined, 'درجه یک و رسیده'],
  [4, 'خیار سالادی بسته ۵۰۰ گرمی', 'مزرعه سبز', 'fresh', 38000, undefined, 4.2, 120, 90, 1800, 14, undefined, 'تازه و ترد'],
  [5, 'شیر کم‌چرب پاستوریزه، ۱ لیتر', 'دامداران کوهستان', 'dairy', 48000, undefined, 4.7, 540, 120, 5200, 2, undefined, 'چربی ۱٫۵ درصد، تازه و روزانه'],
  [6, 'ماست پرچرب سنتی، ۹۰۰ گرم', 'دامداران کوهستان', 'dairy', 62000, 70000, 4.8, 410, 70, 3900, 5, undefined, 'غلیظ با طعم ماست خانگی'],
  [7, 'پنیر لیقوان ممتاز، ۴۰۰ گرم', 'سپیدگاه', 'dairy', 185000, 215000, 4.7, 156, 25, 980, 9, undefined, 'رسیده در آب‌نمک، بدون مواد نگه‌دارنده'],
  [8, 'کره پاستوریزه، ۱۰۰ گرم', 'سپیدگاه', 'dairy', 55000, undefined, 4.5, 203, 45, 1500, 15, undefined, 'تهیه‌شده از خامه تازه'],
  [9, 'برنج ایرانی طارم هاشمی', 'دانه‌طلا', 'pantry', 1150000, 1350000, 4.9, 628, 22, 2700, 4, [weight('۵ کیلوگرم', '۱۰ کیلوگرم')], 'عطر و پخت عالی، فصل برداشت امسال'],
  [10, 'روغن مایع آفتابگردان، ۱٫۵ لیتر', 'زرین‌روغن', 'pantry', 195000, undefined, 4.3, 267, 55, 2100, 10, undefined, 'مناسب پخت‌وپز و سرخ‌کردن'],
  [11, 'ماکارونی اسپاگتی ۵۰۰ گرمی', 'نان‌آوران', 'pantry', 38000, 44000, 4.4, 330, 150, 4400, 8, undefined, 'پخت یکنواخت، بدون چسبندگی'],
  [12, 'رب گوجه‌فرنگی، ۸۰۰ گرم', 'مزرعه سبز', 'pantry', 120000, 138000, 4.5, 214, 40, 1300, 13, undefined, 'غلیظ و بدون افزودنی'],
  [13, 'چای سیاه ممتاز ایرانی، ۵۰۰ گرم', 'چای بهار', 'drinks', 340000, 390000, 4.8, 455, 38, 2900, 6, undefined, 'برگ بلند، عطر و رنگ عالی'],
  [14, 'قهوه اسپرسو ۷۰٪ عربیکا، ۲۵۰ گرم', 'کافه‌نو', 'drinks', 420000, undefined, 4.6, 134, 16, 640, 12, [{ name: 'آسیاب', options: ['دانه کامل', 'آسیاب‌شده'], preselect: true }], 'رُست متوسط با طعم شکلاتی'],
  [15, 'آب معدنی بسته ۶ عددی ۱٫۵ لیتری', 'چشمه‌سار', 'drinks', 72000, undefined, 4.2, 98, 100, 3300, 16, undefined, 'کم‌سدیم و گوارا'],
  [16, 'آب پرتقال طبیعی، ۱ لیتر', 'میوه‌نو', 'drinks', 85000, 98000, 4.1, 76, 34, 780, 7, undefined, 'بدون شکر افزوده'],
  [17, 'مغز بادام درختی، ۲۵۰ گرم', 'خشکبار پارس', 'snacks', 395000, 450000, 4.7, 189, 20, 870, 17, undefined, 'خام و درجه یک'],
  [18, 'پسته اکبری رفسنجان، ۲۵۰ گرم', 'خشکبار پارس', 'snacks', 520000, undefined, 4.9, 241, 12, 760, 18, [{ name: 'نوع', options: ['خام', 'شور'], preselect: true }], 'دهان‌بسته و خوش‌طعم'],
  [19, 'آجیل مخلوط ویژه، ۳۰۰ گرم', 'خشکبار پارس', 'snacks', 340000, 380000, 4.5, 102, 28, 520, 19, undefined, 'ترکیب بادام، فندق، پسته و کشمش'],
  [20, 'کشمش پلویی سبز، ۲۰۰ گرم', 'خشکبار پارس', 'snacks', 85000, undefined, 4.3, 64, 48, 430, 20, undefined, 'بدون هسته و شیرین'],
  [21, 'مایع ظرفشویی لیمو، ۳٫۷۵ لیتر', 'پاک‌نو', 'cleaning', 165000, 195000, 4.4, 177, 36, 1450, 21, undefined, 'چربی‌بر قوی و ملایم روی دست'],
  [22, 'پودر ماشین لباسشویی، ۳ کیلوگرم', 'پاک‌نو', 'cleaning', 289000, undefined, 4.5, 143, 30, 990, 22, [{ name: 'رایحه', options: ['گل‌های بهاری', 'لیمو', 'بدون عطر'] }], 'شست‌وشوی عمیق، مناسب لباس رنگی'],
]

export const products: Product[] = seeds.map((s, i) => {
  const p = pool[s[3]]
  return {
    id: s[0], name: s[1], brand: s[2], cat: s[3], price: s[4], old: s[5], rating: s[6], reviews: s[7],
    stock: s[8], sold: s[9], added: s[10], variants: s[11], short: s[12] ?? '',
    images: [p[i % p.length], p[(i + 1) % p.length], p[(i + 2) % p.length]],
  }
})
export const getProduct = (id: number) => products.find((p) => p.id === id)
export const brands = [...new Set(products.map((p) => p.brand))]
export const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? ''

export const specsFor = (p: Product): [string, string][] => {
  const common: [string, string][] = [['برند', p.brand], ['کشور سازنده', 'ایران'], ['شرایط نگهداری', p.cat === 'dairy' ? 'یخچال، ۲ تا ۵ درجه' : p.cat === 'fresh' ? 'یخچال یا جای خنک' : 'جای خشک و خنک']]
  const by: Record<string, [string, string][]> = {
    fresh: [['نوع کالا', 'تازه و فله‌ای'], ['درجه کیفی', 'درجه یک'], ['مبدأ', 'باغ‌ها و مزارع داخلی'], ['ماندگاری', '۵ تا ۷ روز']],
    dairy: [['نوع', 'پاستوریزه'], ['ماندگاری', '۷ تا ۳۰ روز'], ['مجوز', 'وزارت بهداشت'], ['بسته‌بندی', 'بهداشتی و دربسته']],
    pantry: [['نوع بسته‌بندی', 'کیسه، قوطی یا بطری'], ['مجوز', 'وزارت بهداشت'], ['تاریخ انقضا', '۱۲ تا ۲۴ ماه پس از تولید'], ['مواد نگه‌دارنده', 'ندارد']],
    drinks: [['نوع', 'آماده مصرف یا دمی'], ['مجوز', 'وزارت بهداشت'], ['تاریخ انقضا', '۱۲ تا ۲۴ ماه پس از تولید'], ['بسته‌بندی', 'دربسته']],
    snacks: [['فرآوری', 'بدون افزودنی'], ['مجوز', 'وزارت بهداشت'], ['تاریخ انقضا', '۹ ماه پس از بسته‌بندی'], ['بسته‌بندی', 'زیپ‌دار و خلأ']],
    cleaning: [['نوع', 'شوینده خانگی'], ['مجوز', 'وزارت بهداشت'], ['تاریخ انقضا', '۳۶ ماه پس از تولید'], ['ایمنی', 'دور از دسترس کودکان']],
  }
  return [...(by[p.cat] ?? []), ...common]
}
export const descFor = (p: Product) =>
  `${p.name}؛ ${p.short}. این کالا با دقت از تأمین‌کنندگان معتبر جامو انتخاب شده و پیش از ارسال در انبار بررسی می‌شود. تاریخ تولید و انقضا روی بسته‌بندی درج شده است. در صورت هرگونه مشکل در کیفیت یا تازگی، کالا تعویض یا مبلغ آن بازگردانده می‌شود.`

export const reviewsMock = [
  { name: 'مریم ن.', date: '۱۲ مهر ۱۴۰۵', rating: 5, text: 'خیلی تازه بود و بسته‌بندی عالی داشت. همان روز رسید دستم.', verified: true },
  { name: 'علی ر.', date: '۳ مهر ۱۴۰۵', rating: 4, text: 'کیفیت نسبت به قیمت خیلی خوبه. فقط کاش بسته‌بندی کمی محکم‌تر بود.', verified: true },
  { name: 'سارا ک.', date: '۲۵ شهریور ۱۴۰۵', rating: 5, text: 'سفارش‌هایم را همیشه از جامو می‌گیرم. کیفیت ثابت است و پشتیبانی هم سریع جواب می‌دهد.', verified: true },
  { name: 'حسین م.', date: '۱۹ شهریور ۱۴۰۵', rating: 3, text: 'کالا خوب بود ولی ارسالش چند ساعت دیرتر از زمان اعلام‌شده رسید.', verified: false },
]

export type Status = 'pending' | 'paid' | 'preparing' | 'courier' | 'shipped' | 'delivered' | 'cancelled'
export const statusMeta: Record<Status, { label: string; tone: string; icon: string }> = {
  pending: { label: 'در انتظار پرداخت', tone: 'bg-amber-50 text-amber-800 ring-amber-200', icon: 'clock' },
  paid: { label: 'پرداخت شده', tone: 'bg-sky-50 text-sky-800 ring-sky-200', icon: 'card' },
  preparing: { label: 'در حال آماده‌سازی', tone: 'bg-violet-50 text-violet-800 ring-violet-200', icon: 'package' },
  courier: { label: 'تحویل به پیک', tone: 'bg-indigo-50 text-indigo-800 ring-indigo-200', icon: 'truck' },
  shipped: { label: 'ارسال شده', tone: 'bg-cyan-50 text-cyan-800 ring-cyan-200', icon: 'truck' },
  delivered: { label: 'تحویل داده شده', tone: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: 'check' },
  cancelled: { label: 'لغو شده', tone: 'bg-red-50 text-red-800 ring-red-200', icon: 'x' },
}
export const timeline: Status[] = ['paid', 'preparing', 'courier', 'shipped', 'delivered']

export type Address = { id: string; title: string; name: string; phone: string; province: string; city: string; address: string; postal: string }
export type OrderItem = { id: number; qty: number; price: number; variant?: string }
export type Order = { id: string; date: string; status: Status; items: OrderItem[]; shipping: number; discount: number; total: number; method: string; payment: string; address: Address }

export const defaultAddress: Address = { id: 'a1', title: 'خانه', name: 'نرگس احمدی', phone: '۰۹۱۲۳۴۵۶۷۸۹', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، بالاتر از پارک ملت، کوچه شقایق، پلاک ۱۴، واحد ۳', postal: '۱۹۶۹۸۱۲۳۴۵' }
const mk = (id: string, date: string, status: Status, items: [number, number][], shipping = 45000): Order => {
  const its = items.map(([pid, qty]) => ({ id: pid, qty, price: getProduct(pid)!.price }))
  const sub = its.reduce((s, i) => s + i.price * i.qty, 0)
  return { id, date, status, items: its, shipping, discount: 0, total: sub + shipping, method: 'پیک موتوری جامو', payment: 'پرداخت آنلاین', address: defaultAddress }
}
export const mockOrders: Order[] = [
  mk('JM-۲۸۴۱۹۶', '۱۸ آبان ۱۴۰۵', 'shipped', [[7, 1], [10, 2]]),
  mk('JM-۲۸۳۷۴۰', '۱۴ آبان ۱۴۰۵', 'preparing', [[13, 1]], 0),
  mk('JM-۲۸۱۱۰۲', '۹ آبان ۱۴۰۵', 'pending', [[4, 1]]),
  mk('JM-۲۷۶۳۵۸', '۲۲ مهر ۱۴۰۵', 'delivered', [[1, 1]], 0),
  mk('JM-۲۷۴۹۲۱', '۱۱ مهر ۱۴۰۵', 'courier', [[17, 1], [12, 1]]),
  mk('JM-۲۶۹۰۱۷', '۲ مهر ۱۴۰۵', 'cancelled', [[15, 1]]),
]

export const provinces: Record<string, string[]> = {
  تهران: ['تهران', 'ری', 'شهریار', 'اسلامشهر', 'پردیس', 'ورامین'],
  البرز: ['کرج', 'فردیس', 'نظرآباد'],
  اصفهان: ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'],
  'خراسان رضوی': ['مشهد', 'نیشابور', 'سبزوار', 'تربت‌حیدریه'],
  فارس: ['شیراز', 'مرودشت', 'کازرون', 'جهرم'],
  'آذربایجان شرقی': ['تبریز', 'مراغه', 'مرند'],
  گیلان: ['رشت', 'بندر انزلی', 'لاهیجان'],
  مازندران: ['ساری', 'بابل', 'آمل'],
  خوزستان: ['اهواز', 'دزفول', 'آبادان'],
  کرمان: ['کرمان', 'رفسنجان', 'جیرفت'],
}

export const FREE_SHIP = 3000000
export const shippingMethods = [
  { id: 'courier', name: 'پیک موتوری جامو', eta: 'حداکثر ۲ ساعته (تهران و کرج)', price: 45000, tehranOnly: true },
  { id: 'post', name: 'پست پیشتاز', eta: '۲ تا ۴ روز کاری', price: 90000 },
  { id: 'tipax', name: 'تیپاکس', eta: '۱ تا ۳ روز کاری', price: 120000 },
]
export const coupons: Record<string, { type: 'percent' | 'fixed'; value: number; cap?: number; label: string }> = {
  JAMO10: { type: 'percent', value: 10, cap: 100000, label: '۱۰٪ تخفیف (حداکثر ۱۰۰ هزار تومان)' },
  WELCOME: { type: 'fixed', value: 50000, label: '۵۰ هزار تومان تخفیف اولین خرید' },
}
