import React, { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import {
  MaterialBarChart,
  MaterialColors,
  MaterialDonutChart,
  MaterialLineChart,
  getPersianDateTime,
} from '../components/MaterialCharts'
import {
  PdfCard,
  PdfDataTable,
  PdfDocument,
  PdfExportButton,
  PdfMetricCard,
} from '../components/PdfExport'
import {
  Badge,
  Breadcrumb,
  Button,
  Container,
  Drawer,
  EmptyState,
  Img,
  Input,
  Modal,
  Select,
  Textarea,
  Toggle,
} from '../components/ui'
import {
  catName,
  img,
  statusMeta,
  type Order,
  type Product,
  type Status,
} from '../lib/data'
import { cn, enDigits, faDigits, toFa } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { ADMIN_PHONE, useStore, type Category, type CouponItem } from '../lib/store'

type AdminTab = 'overview' | 'products' | 'categories' | 'discounts' | 'transactions'

export default function Dashboard({ sub }: { sub?: string }) {
  const { user, logout, toast } = useStore()

  // Guard: No one can visit /dashboard without auth
  if (!user) {
    navigate('/login?next=/dashboard' + (sub ? '/' + sub : ''))
    return null
  }

  // Token decision: If user role is not admin, show customer dashboard view
  const isAdmin = user.phone === ADMIN_PHONE || user.role === 'admin'

  if (!isAdmin) {
    return <CustomerDashboard />
  }

  // Check if viewing a dedicated product page: /dashboard/product/:id
  if (sub && sub.startsWith('product/')) {
    const prodId = Number(sub.split('/')[1])
    return <AdminDedicatedProductPage id={prodId} />
  }

  return <SuperadminView activeTab={(sub as AdminTab) || 'overview'} />
}

/**
 * Normal customer view of /dashboard
 */
function CustomerDashboard() {
  const { user, orders, wishlist, logout, toast } = useStore()
  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-card ring-1 ring-line/60">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-xl font-bold">داشبورد کاربر</h1>
            <p className="text-sm text-muted">خوش آمدید، {user?.name}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              logout()
              toast('از حساب خارج شدید', 'info')
              navigate('/')
            }}
          >
            خروج
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-sand p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-brand-700">{toFa(orders.length)}</p>
            <p className="text-xs text-muted mt-1">تعداد سفارش‌ها</p>
          </div>
          <div className="rounded-xl bg-sand p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-brand-700">{toFa(wishlist.length)}</p>
            <p className="text-xs text-muted mt-1">علاقه‌مندی‌ها</p>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate('/account/orders')}>مشاهده سفارش‌ها</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>بازگشت به فروشگاه</Button>
        </div>
      </div>
    </Container>
  )
}

/**
 * Superadmin Main Panel View
 */
function SuperadminView({ activeTab }: { activeTab: AdminTab }) {
  const { user, logout, toast } = useStore()
  const tab = activeTab || 'overview'

  const navItems: [AdminTab, string, string][] = [
    ['overview', 'chart', 'آمار و گزارش‌ها'],
    ['products', 'grid2', 'مدیریت محصولات'],
    ['categories', 'tag', 'دسته‌بندی‌ها'],
    ['discounts', 'percent', 'تخفیف‌ها و کوپن'],
    ['transactions', 'card', 'تراکنش‌های زنده'],
  ]

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Admin Top Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white font-extrabold text-base shadow-sm">
              ج
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">پنل سوپرادمین جامو</h1>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  مدیر کل
                </span>
              </div>
              <p className="text-[11px] text-slate-400">شماره مدیر: {toFa(user?.phone ?? '')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Icon name="home" size={16} className="me-1" />
              مشاهده سایت
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout()
                toast('از پنل مدیریت خارج شدید', 'info')
                navigate('/login')
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <Icon name="logout" size={16} />
              خروج
            </Button>
          </div>
        </Container>

        {/* Tab Navigation */}
        <Container>
          <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
            {navItems.map(([id, icon, label]) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => navigate(id === 'overview' ? '/dashboard' : `/dashboard/${id}`)}
                  className={cn(
                    'flex h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-xs font-bold transition-all',
                    active
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon name={icon} size={16} />
                  {label}
                </button>
              )
            })}
          </nav>
        </Container>
      </div>

      <Container className="pt-6">
        {tab === 'overview' && <AdminOverviewTab />}
        {tab === 'products' && <AdminProductsTab />}
        {tab === 'categories' && <AdminCategoriesTab />}
        {tab === 'discounts' && <AdminDiscountsTab />}
        {tab === 'transactions' && <AdminLiveTransactionsTab />}
      </Container>
    </div>
  )
}

/* =========================================================================
   1. OVERVIEW & STATISTICS TAB + PDFCN EXPORT
   ========================================================================= */
function AdminOverviewTab() {
  const { productsList, orders, categoriesList } = useStore()

  // Calculate real metrics
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'delivered')
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing')
  const lowStockProducts = productsList.filter((p) => p.stock > 0 && p.stock <= 15)
  const outOfStockProducts = productsList.filter((p) => p.stock === 0)

  // Material Chart Data: Sales trend over Persian months
  const salesTrendData = [
    { label: 'اردیبهشت', value: 18500000, secondary: 120 },
    { label: 'خرداد', value: 24200000, secondary: 154 },
    { label: 'تیر', value: 29800000, secondary: 190 },
    { label: 'مرداد', value: 34100000, secondary: 215 },
    { label: 'شهریور', value: 41200000, secondary: 260 },
    { label: 'مهر', value: 38900000, secondary: 240 },
    { label: 'آبان', value: 47600000, secondary: 310 },
  ]

  // Category sales distribution for Donut Chart
  const categorySalesData = categoriesList.map((cat, idx) => {
    const prods = productsList.filter((p) => p.cat === cat.id)
    const count = prods.length
    const colors = [
      MaterialColors.primary,
      MaterialColors.secondary,
      MaterialColors.tertiary,
      MaterialColors.purple,
      MaterialColors.warning,
      MaterialColors.pink,
      MaterialColors.success,
    ]
    return {
      label: cat.name,
      value: Math.max(1, count),
      color: colors[idx % colors.length],
    }
  })

  // Order status breakdown for Bar Chart
  const statusCounts = Object.keys(statusMeta).map((st) => ({
    label: statusMeta[st as Status].label,
    value: orders.filter((o) => o.status === st).length,
  }))

  return (
    <div className="space-y-6">
      {/* Top Banner with Action & PDF Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">آمار و عملکرد جامع فروشگاه</h2>
          <p className="text-xs text-slate-500 mt-1">
            وضعیت زنده درآمد، سفارش‌ها، محصولات و انبار جامو ({getPersianDateTime().date})
          </p>
        </div>
        <div>
          <PdfExportButton
            documentTitle="گزارش جامع عملکرد و فروشگاه جامو"
            renderContent={() => (
              <PdfDocument
                title="گزارش تحلیلی و مالی فروشگاه جامو"
                subtitle="خلاصه فروش، تفکیک دسته‌بندی‌ها و وضعیت انبار"
              >
                {/* PDF Metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <PdfMetricCard label="مجموع فروش" value={`${toFa(totalSales)} تومان`} />
                  <PdfMetricCard label="سفارش‌های کل" value={toFa(orders.length)} />
                  <PdfMetricCard label="محصولات فعال" value={toFa(productsList.length)} />
                  <PdfMetricCard label="کالاهای ناموجود" value={toFa(outOfStockProducts.length)} />
                </div>

                {/* PDF Category Table */}
                <PdfCard title="تفکیک دسته‌بندی‌ها و موجودی کالا" badge="تحلیل دوره‌ای">
                  <PdfDataTable
                    columns={[
                      { key: 'name', header: 'دسته‌بندی' },
                      {
                        key: 'count',
                        header: 'تعداد اقلام',
                        render: (r) =>
                          toFa(productsList.filter((p) => p.cat === r.id).length) + ' کالا',
                      },
                      {
                        key: 'totalStock',
                        header: 'موجودی کل انبار',
                        render: (r) =>
                          toFa(
                            productsList
                              .filter((p) => p.cat === r.id)
                              .reduce((s, p) => s + p.stock, 0)
                          ) + ' عدد',
                      },
                      {
                        key: 'avgPrice',
                        header: 'میانگین قیمت',
                        render: (r) => {
                          const pInCat = productsList.filter((p) => p.cat === r.id)
                          const avg = pInCat.length
                            ? Math.round(pInCat.reduce((s, p) => s + p.price, 0) / pInCat.length)
                            : 0
                          return toFa(avg) + ' تومان'
                        },
                      },
                    ]}
                    data={categoriesList}
                  />
                </PdfCard>

                {/* PDF Recent Orders Table */}
                <PdfCard title="آخرین تراکنش‌ها و سفارش‌های ثبت‌شده">
                  <PdfDataTable
                    columns={[
                      { key: 'id', header: 'شماره سفارش' },
                      { key: 'date', header: 'تاریخ' },
                      {
                        key: 'customer',
                        header: 'مشتری',
                        render: (o: Order) => o.address.name,
                      },
                      {
                        key: 'status',
                        header: 'وضعیت',
                        render: (o: Order) => statusMeta[o.status]?.label ?? o.status,
                      },
                      {
                        key: 'total',
                        header: 'مبلغ کل',
                        render: (o: Order) => toFa(o.total) + ' تومان',
                      },
                    ]}
                    data={orders.slice(0, 8)}
                  />
                </PdfCard>
              </PdfDocument>
            )}
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">کل درآمد فروشگاه</span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name="card" size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
            {toFa(totalSales)} <span className="text-xs font-medium text-slate-500">تومان</span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            ↑ ۱۸٪ رشد نسبت به ماه گذشته
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">کل سفارش‌ها</span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Icon name="package" size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
            {toFa(orders.length)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {toFa(paidOrders.length)} پرداخت‌شده · {toFa(pendingOrders.length)} در انتظار
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">محصولات تعریف‌شده</span>
            <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <Icon name="grid2" size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
            {toFa(productsList.length)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            در {toFa(categoriesList.length)} دسته‌بندی مختلف
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">هشدار موجودی انبار</span>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Icon name="alert" size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-amber-600 tabular-nums">
            {toFa(lowStockProducts.length + outOfStockProducts.length)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {toFa(outOfStockProducts.length)} ناموجود · {toFa(lowStockProducts.length)} کمبود
          </p>
        </div>
      </div>

      {/* Material Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MaterialLineChart
          title="روند فروش ماهانه و سفارش‌ها (Material Chart)"
          subtitle="بررسی رشد ریالی و تعداد فاکتورهای ثبت‌شده در ماه‌های اخیر"
          data={salesTrendData}
          unit="تومان"
          color={MaterialColors.primary}
          secondaryColor={MaterialColors.tertiary}
          showSecondary
          primaryLabel="مبلغ فروش (تومان)"
          secondaryLabel="تعداد سفارش"
        />

        <MaterialDonutChart
          title="توزیع کالایی در دسته‌بندی‌ها"
          subtitle="تعداد محصولات تعریف‌شده بر اساس دسته‌های فعال"
          data={categorySalesData}
          centerTitle="کل کالاها"
          centerValue={`${toFa(productsList.length)}`}
        />
      </div>

      {/* Order Status Distribution Bar Chart */}
      <MaterialBarChart
        title="وضعیت سفارش‌های فروشگاه"
        subtitle="تعداد فاکتورها در هر یک از مراحل چرخه ارسال"
        data={statusCounts}
        unit="سفارش"
        color={MaterialColors.secondary}
        height={220}
      />
    </div>
  )
}

/* =========================================================================
   2. PRODUCTS MANAGEMENT TAB (CRUD + SEARCH + FILTER)
   ========================================================================= */
function AdminProductsTab() {
  const {
    productsList,
    categoriesList,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleHideProduct,
    hiddenProductIds,
    toast,
  } = useStore()

  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Filtered products
  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      const matchQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
      const matchCat = selectedCat === 'all' || p.cat === selectedCat
      return matchQuery && matchCat
    })
  }, [productsList, query, selectedCat])

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">مدیریت محصولات فروشگاه</h2>
          <p className="text-xs text-slate-500 mt-1">
            امکان افزودن، ویرایش سریع، پنهان‌سازی و مشاهده صفحه اختصاصی آمار هر کالا
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-emerald-700 hover:bg-emerald-800">
          <Icon name="plus" size={16} className="me-1.5" />
          افزودن محصول جدید
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="جستجو بر اساس نام محصول یا برند …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-52">
          <Select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
            <option value="all">همه دسته‌بندی‌ها</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <span className="text-xs text-slate-500">
          نمایش {toFa(filtered.length)} از {toFa(productsList.length)} محصول
        </span>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600">
                <th className="py-3 px-4">کالا</th>
                <th className="py-3 px-4">دسته‌بندی</th>
                <th className="py-3 px-4">قیمت فعلی</th>
                <th className="py-3 px-4">قیمت قبل (تخفیف)</th>
                <th className="py-3 px-4">موجودی</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isHidden = hiddenProductIds.includes(p.id)
                return (
                  <tr key={p.id} className={cn('hover:bg-slate-50/60', isHidden && 'opacity-60 bg-slate-50/30')}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Img
                          src={img(p.images[0], 120)}
                          alt={p.name}
                          className="size-12 shrink-0 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {catName(p.cat) || p.cat}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      {toFa(p.price)} تومان
                    </td>
                    <td className="py-3 px-4 tabular-nums text-slate-400">
                      {p.old ? (
                        <span className="line-through text-red-500">{toFa(p.old)} تومان</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-semibold tabular-nums text-xs px-2 py-0.5 rounded-full',
                          p.stock === 0
                            ? 'bg-red-50 text-red-700'
                            : p.stock <= 15
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        )}
                      >
                        {p.stock === 0 ? 'ناموجود' : `${toFa(p.stock)} عدد`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          toggleHideProduct(p.id)
                          toast(isHidden ? 'محصول در فروشگاه نمایان شد' : 'محصول مخفی شد')
                        }}
                        className={cn(
                          'rounded-md px-2 py-1 text-xs font-semibold',
                          isHidden
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                      >
                        {isHidden ? 'مخفی شده' : 'نمایش داده می‌شود'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Dedicated Product Page Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/product/${p.id}`)}
                          className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                          title="صفحه اختصاصی و آمار محصول"
                        >
                          <Icon name="chart" size={16} />
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(p)}
                          className="h-8 px-2 text-slate-700 hover:bg-slate-100"
                          title="ویرایش سریع"
                        >
                          <Icon name="settings" size={16} />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="h-8 px-2 text-red-600 hover:bg-red-50"
                          title="حذف کالا"
                        >
                          <Icon name="trash" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductFormModal
          title="افزودن محصول جدید"
          categories={categoriesList}
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            addProduct({
              ...data,
              rating: 5.0,
              reviews: 1,
              sold: 0,
              added: Date.now(),
              images: [
                data.images[0] || '1550989460-0adf9ea622e2',
                '1604095853918-1a1823a63dd5',
                '1509043183980-23be96ae4109',
              ],
            })
            setShowAddModal(false)
            toast('محصول جدید با موفقیت اضافه شد')
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          title={`ویرایش محصول: ${editingProduct.name}`}
          initialData={editingProduct}
          categories={categoriesList}
          onClose={() => setEditingProduct(null)}
          onSave={(data) => {
            updateProduct(editingProduct.id, data)
            setEditingProduct(null)
            toast('تغییرات محصول ذخیره شد')
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="تأیید حذف محصول"
        footer={
          <div className="flex gap-2">
            <Button
              variant="danger"
              full
              onClick={() => {
                if (deleteConfirmId) {
                  deleteProduct(deleteConfirmId)
                  setDeleteConfirmId(null)
                  toast('محصول حذف شد', 'info')
                }
              }}
            >
              بله، حذف شود
            </Button>
            <Button variant="secondary" full onClick={() => setDeleteConfirmId(null)}>
              انصراف
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-700 leading-7">
          آیا از حذف این محصول مطمئن هستید؟ این کالا از فهرست محصولات فروشگاه حذف خواهد شد.
        </p>
      </Modal>
    </div>
  )
}

/**
 * Product Form (Add/Edit Modal)
 */
function ProductFormModal({
  title,
  initialData,
  categories,
  onClose,
  onSave,
}: {
  title: string
  initialData?: Product
  categories: Category[]
  onClose: () => void
  onSave: (data: {
    name: string
    brand: string
    cat: string
    price: number
    old?: number
    stock: number
    short: string
    images: string[]
  }) => void
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [cat, setCat] = useState(initialData?.cat || categories[0]?.id || 'fresh')
  const [price, setPrice] = useState(String(initialData?.price || ''))
  const [old, setOld] = useState(initialData?.old ? String(initialData.old) : '')
  const [stock, setStock] = useState(String(initialData?.stock ?? 50))
  const [short, setShort] = useState(initialData?.short || '')
  const [image, setImage] = useState(initialData?.images?.[0] || '1550989460-0adf9ea622e2')
  const [err, setErr] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setErr('نام محصول را وارد کنید')
    if (!price || Number(enDigits(price)) <= 0) return setErr('قیمت معتبر وارد کنید')

    onSave({
      name: name.trim(),
      brand: brand.trim() || 'جامو',
      cat,
      price: Number(enDigits(price)),
      old: old ? Number(enDigits(old)) : undefined,
      stock: Number(enDigits(stock)) || 0,
      short: short.trim() || 'محصول باکیفیت و تازه فروشگاه جامو',
      images: [image.trim()],
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2">
          <Button full onClick={handleSubmit}>
            ذخیره اطلاعات
          </Button>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="نام محصول" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="برند" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <Select label="دسته‌بندی" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="قیمت فروش (تومان)"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="قیمت قبلی (اختیاری)"
            inputMode="numeric"
            value={old}
            onChange={(e) => setOld(e.target.value)}
          />
          <Input
            label="تعداد موجودی"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <Input
          label="شناسه تصویر (Unsplash ID)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          hint="مثال: 1550989460-0adf9ea622e2"
        />
        <Textarea
          label="توضیحات کوتاه"
          value={short}
          onChange={(e) => setShort(e.target.value)}
        />
        {err && <p className="text-xs text-red-600">{err}</p>}
      </form>
    </Modal>
  )
}

/* =========================================================================
   3. DEDICATED PRODUCT EDIT & STATISTICS PAGE (#/dashboard/product/:id)
   ========================================================================= */
function AdminDedicatedProductPage({ id }: { id: number }) {
  const { productsList, categoriesList, updateProduct, toast } = useStore()
  const p = productsList.find((x) => x.id === id)

  if (!p) {
    return (
      <Container className="py-12">
        <EmptyState
          icon="search"
          title="محصول یافت نشد"
          action={<Button onClick={() => navigate('/dashboard/products')}>بازگشت به فهرست محصولات</Button>}
        />
      </Container>
    )
  }

  // Edit state
  const [name, setName] = useState(p.name)
  const [brand, setBrand] = useState(p.brand)
  const [cat, setCat] = useState(p.cat)
  const [price, setPrice] = useState(String(p.price))
  const [old, setOld] = useState(p.old ? String(p.old) : '')
  const [stock, setStock] = useState(String(p.stock))
  const [short, setShort] = useState(p.short)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProduct(p.id, {
      name,
      brand,
      cat,
      price: Number(enDigits(price)),
      old: old ? Number(enDigits(old)) : undefined,
      stock: Number(enDigits(stock)),
      short,
    })
    toast('تغییرات محصول با موفقیت ذخیره شد')
  }

  // Mock product specific performance data for Material charts
  const salesHistory = [
    { label: 'شنبه', value: 14, secondary: 2 },
    { label: 'یکشنبه', value: 19, secondary: 3 },
    { label: 'دوشنبه', value: 24, secondary: 5 },
    { label: 'سه‌شنبه', value: 18, secondary: 4 },
    { label: 'چهارشنبه', value: 32, secondary: 6 },
    { label: 'پنج‌شنبه', value: 45, secondary: 8 },
    { label: 'جمعه', value: 52, secondary: 9 },
  ]

  const monthlyVolume = [
    { label: 'مرداد', value: 410 },
    { label: 'شهریور', value: 580 },
    { label: 'مهر', value: 720 },
    { label: 'آبان', value: p.sold },
  ]

  const stockRatio = [
    { label: 'فروش‌رفته', value: p.sold, color: MaterialColors.primary },
    { label: 'موجود در انبار', value: p.stock, color: MaterialColors.success },
  ]

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Header */}
      <div className="border-b border-slate-200 bg-white py-4 shadow-sm">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard/products')}
            >
              <Icon name="arrow" size={14} className="-scale-x-100 me-1" />
              بازگشت به محصولات
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{p.name}</h1>
              <p className="text-xs text-slate-500">
                صفحه تحلیل و مدیریت اختصاصی کالا کد #{toFa(p.id)}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-emerald-700 hover:bg-emerald-800">
            ذخیره تغییرات
          </Button>
        </Container>
      </div>

      <Container className="pt-6 space-y-6">
        {/* Top Product Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">کل فروش ثبت‌شده</span>
            <p className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
              {toFa(p.sold)} <span className="text-xs font-normal text-slate-500">واحد</span>
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              ارزش کل: {toFa(p.sold * p.price)} تومان
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">موجودی انبار</span>
            <p className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
              {toFa(p.stock)} <span className="text-xs font-normal text-slate-500">واحد</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {p.stock > 10 ? 'وضعیت مطلوب' : 'نیازمند شارژ مجدد'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">امتیاز کاربران</span>
            <p className="mt-2 text-2xl font-black text-amber-500 tabular-nums">
              {toFa(p.rating.toFixed(1))} <span className="text-xs font-normal text-slate-500">از ۵</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{toFa(p.reviews)} دیدگاه ثبت‌شده</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">درصد تخفیف فعال</span>
            <p className="mt-2 text-2xl font-black text-red-600 tabular-nums">
              {p.old ? `${toFa(Math.round(((p.old - p.price) / p.old) * 100))}٪` : 'بدون تخفیف'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {p.old ? `سود خریدار: ${toFa(p.old - p.price)} تومان` : 'قیمت عادی'}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MaterialLineChart
            title="روند فروش هفتگی محصول (Material Chart)"
            subtitle="میزان خرید مشتریان در ۷ روز اخیر به همراه مرجوعی‌ها"
            data={salesHistory}
            unit="عدد"
            color={MaterialColors.primary}
            secondaryColor={MaterialColors.error}
            showSecondary
            primaryLabel="تعداد فروش"
            secondaryLabel="مرجوعی"
          />

          <MaterialDonutChart
            title="نسبت موجودی انبار به فروش کل"
            subtitle="بررسی گردش کالای انبار و تقاضای بازار"
            data={stockRatio}
            centerTitle="مجموع چرخه"
            centerValue={`${toFa(p.stock + p.sold)}`}
          />
        </div>

        {/* Edit Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
            ویرایش مشخصات و قیمت‌گذاری کالا
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <Input label="نام کالا" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="برند" value={brand} onChange={(e) => setBrand(e.target.value)} />

            <Select label="دسته‌بندی" value={cat} onChange={(e) => setCat(e.target.value)}>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input
              label="تعداد موجودی در انبار"
              inputMode="numeric"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <Input
              label="قیمت فروش (تومان)"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <Input
              label="قیمت خط خورده / قبلی (تومان)"
              inputMode="numeric"
              value={old}
              onChange={(e) => setOld(e.target.value)}
            />

            <div className="md:col-span-2">
              <Textarea
                label="توضیحات کوتاه محصول"
                value={short}
                onChange={(e) => setShort(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/dashboard/products')}
              >
                انصراف
              </Button>
              <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">
                ذخیره تغییرات محصول
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  )
}

/* =========================================================================
   4. CATEGORIES MANAGEMENT TAB
   ========================================================================= */
function AdminCategoriesTab() {
  const { categoriesList, productsList, addCategory, toast } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [image, setImage] = useState('1550989460-0adf9ea622e2')
  const [err, setErr] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setErr('نام دسته‌بندی را وارد کنید')
    if (!id.trim()) return setErr('شناسه انگلیسی دسته‌بندی را وارد کنید')

    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    addCategory({
      id: cleanId,
      name: name.trim(),
      image: image.trim() || '1550989460-0adf9ea622e2',
    })
    setShowModal(false)
    setName('')
    setId('')
    toast('دسته‌بندی جدید با موفقیت اضافه شد')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">مدیریت دسته‌بندی‌ها</h2>
          <p className="text-xs text-slate-500 mt-1">
            دسته‌بندی‌های فعال سایت؛ تغییرات بلافاصله در ناوبری، هدر و فیلترها نمایش داده می‌شود.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-emerald-700 hover:bg-emerald-800">
          <Icon name="plus" size={16} className="me-1.5" />
          افزودن دسته جدید
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesList.map((c) => {
          const prodsInCat = productsList.filter((p) => p.cat === c.id)
          return (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Img
                src={img(c.image, 200)}
                alt={c.name}
                className="size-16 rounded-xl object-cover border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{c.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">slug: {c.id}</p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  {toFa(prodsInCat.length)} محصول فعال
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <Modal
          open
          onClose={() => setShowModal(false)}
          title="افزودن دسته‌بندی جدید"
          footer={
            <div className="flex gap-2">
              <Button full onClick={handleAdd}>
                ذخیره دسته‌بندی
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                انصراف
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              label="نام فارسی دسته"
              placeholder="مثلاً: پروتئینی و گوشت"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="شناسه انگلیسی (Slug)"
              placeholder="مثلاً: protein"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <Input
              label="شناسه تصویر (Unsplash ID)"
              placeholder="مثلاً: 1550989460-0adf9ea622e2"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {err && <p className="text-xs text-red-600">{err}</p>}
          </form>
        </Modal>
      )}
    </div>
  )
}

/* =========================================================================
   5. DISCOUNT PRODUCTS & COUPONS MANAGEMENT TAB
   ========================================================================= */
function AdminDiscountsTab() {
  const { productsList, updateProduct, couponsMap, setCoupon, removeCouponItem, toast } =
    useStore()

  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null)
  const [discountPercent, setDiscountPercent] = useState('')
  const [showAddCoupon, setShowAddCoupon] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<'percent' | 'fixed'>('percent')
  const [newValue, setNewValue] = useState('')
  const [newCap, setNewCap] = useState('')
  const [newLabel, setNewLabel] = useState('')

  // List of products that currently have a discount (p.old > p.price)
  const discountedProducts = productsList.filter((p) => p.old && p.old > p.price)

  const handleApplyProductDiscount = (prod: Product) => {
    const pct = Number(enDigits(discountPercent))
    if (pct <= 0 || pct >= 100) {
      toast('درصد تخفیف باید بین ۱ تا ۹۹ باشد', 'error')
      return
    }

    const currentBasePrice = prod.old || prod.price
    const newPrice = Math.round(currentBasePrice * (1 - pct / 100))

    updateProduct(prod.id, {
      old: currentBasePrice,
      price: newPrice,
    })
    setEditingDiscountId(null)
    setDiscountPercent('')
    toast(`تخفیف ${toFa(pct)}٪ روی ${prod.name} اعمال شد`)
  }

  const handleRemoveProductDiscount = (prod: Product) => {
    if (prod.old) {
      updateProduct(prod.id, {
        price: prod.old,
        old: undefined,
      })
      toast('تخفیف محصول برداشته شد')
    }
  }

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim()) return toast('کد تخفیف را وارد کنید', 'error')
    if (!newValue || Number(enDigits(newValue)) <= 0)
      return toast('مقدار تخفیف را معتبر وارد کنید', 'error')

    setCoupon(newCode.trim().toUpperCase(), {
      type: newType,
      value: Number(enDigits(newValue)),
      cap: newCap ? Number(enDigits(newCap)) : undefined,
      label: newLabel.trim() || `کد تخفیف ${newCode.trim().toUpperCase()}`,
    })

    setShowAddCoupon(false)
    setNewCode('')
    setNewValue('')
    setNewCap('')
    setNewLabel('')
    toast('کد تخفیف با موفقیت ایجاد شد')
  }

  return (
    <div className="space-y-8">
      {/* 1. Discounted Products Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">محصولات تخفیف‌دار</h2>
            <p className="text-xs text-slate-500 mt-1">
              مدیریت و ویرایش تخفیف روی تک‌تک محصولات فروشگاه ({toFa(discountedProducts.length)} محصول تخفیف‌دار)
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600">
                <th className="py-3 px-4">کالا</th>
                <th className="py-3 px-4">قیمت اصلی</th>
                <th className="py-3 px-4">قیمت با تخفیف</th>
                <th className="py-3 px-4">درصد سود خریدار</th>
                <th className="py-3 px-4 text-center">ویرایش درصد</th>
                <th className="py-3 px-4 text-center">حذف تخفیف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discountedProducts.map((p) => {
                const pct = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0
                const isEditing = editingDiscountId === p.id

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Img
                          src={img(p.images[0], 120)}
                          alt={p.name}
                          className="size-11 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-slate-500 line-through">
                      {toFa(p.old ?? p.price)} تومان
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 tabular-nums">
                      {toFa(p.price)} تومان
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                        {toFa(pct)}٪ تخفیف
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="درصد"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-xs font-bold"
                          />
                          <Button size="sm" onClick={() => handleApplyProductDiscount(p)}>
                            ثبت
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingDiscountId(null)}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingDiscountId(p.id)
                            setDiscountPercent(String(pct))
                          }}
                        >
                          تغییر درصد
                        </Button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveProductDiscount(p)}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        لغو تخفیف
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Coupon Codes Management */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">کدهای تخفیف و کوپن‌ها</h2>
            <p className="text-xs text-slate-500 mt-1">
              تعریف کدهای درصدی یا مبلغ ثابت برای استفاده مشتریان در سبد خرید
            </p>
          </div>
          <Button onClick={() => setShowAddCoupon(true)} className="bg-emerald-700 hover:bg-emerald-800">
            <Icon name="plus" size={16} className="me-1.5" />
            افزودن کد تخفیف جدید
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(couponsMap).map(([code, cp]) => (
            <div
              key={code}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {code}
                  </span>
                  <button
                    onClick={() => {
                      removeCouponItem(code)
                      toast(`کد تخفیف ${code} حذف شد`, 'info')
                    }}
                    className="text-slate-400 hover:text-red-600"
                    title="حذف کد"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{cp.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  نوع:{' '}
                  {cp.type === 'percent'
                    ? `${toFa(cp.value)}٪ درصدی`
                    : `${toFa(cp.value)} تومان ثابت`}
                  {cp.cap ? ` (سقف: ${toFa(cp.cap)} تومان)` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddCoupon && (
        <Modal
          open
          onClose={() => setShowAddCoupon(false)}
          title="تعریف کد تخفیف جدید"
          footer={
            <div className="flex gap-2">
              <Button full onClick={handleAddCoupon}>
                ایجاد کد تخفیف
              </Button>
              <Button variant="secondary" onClick={() => setShowAddCoupon(false)}>
                انصراف
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddCoupon} className="space-y-4">
            <Input
              label="کد کوپن (انگلیسی)"
              placeholder="مثلاً: SPRING1404"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="نوع تخفیف"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
              >
                <option value="percent">درصدی (٪)</option>
                <option value="fixed">مبلغ ثابت (تومان)</option>
              </Select>
              <Input
                label={newType === 'percent' ? 'درصد تخفیف' : 'مبلغ (تومان)'}
                inputMode="numeric"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            {newType === 'percent' && (
              <Input
                label="حداکثر سقف تخفیف (تومان، اختیاری)"
                inputMode="numeric"
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
              />
            )}
            <Input
              label="عنوان / توضیح کد"
              placeholder="مثلاً: ۲۰٪ تخفیف جشنواره بهاره"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* =========================================================================
   6. LIVE TRANSACTIONS TAB (Smooth Top Animation + Simulation + Deep Filter)
   ========================================================================= */
function AdminLiveTransactionsTab() {
  const { orders, addOrder, setOrderStatus, toast, productsList } = useStore()

  // State for all transactions view vs live last 20
  const [showAllModal, setShowAllModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')

  // Top 20 latest transactions
  const latest20 = orders.slice(0, 20)

  // Simulation of new real-time order arriving
  const simulateNewTransaction = () => {
    const randomProduct = productsList[Math.floor(Math.random() * productsList.length)]
    const randomPrice = randomProduct.price * 2
    const newOrderId = 'JM-' + faDigits(String(400000 + Math.floor(Math.random() * 99999)))
    const { full } = getPersianDateTime()

    const names = ['سروش محمودی', 'مهسا کریمی', 'پویان صالحی', 'نیلوفر راد', 'امیررضا صادقی']
    const randomName = names[Math.floor(Math.random() * names.length)]

    const newOrder: Order = {
      id: newOrderId,
      date: full,
      status: 'paid',
      items: [{ id: randomProduct.id, qty: 2, price: randomProduct.price }],
      shipping: 45000,
      discount: 0,
      total: randomPrice + 45000,
      method: 'پیک موتوری جامو',
      payment: 'پرداخت آنلاین بانکی',
      address: {
        id: 'sim-' + Date.now(),
        title: 'منزل',
        name: randomName,
        phone: '۰۹' + Math.floor(100000000 + Math.random() * 900000000),
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان کریمخان زند، نبش حافظ، پلاک ۷۲',
        postal: '۱۵۹۸۷۶۵۴۳۲',
      },
    }

    addOrder(newOrder)
    toast(`تراکنش جدید ${newOrder.id} از ${randomName} ثبت شد!`, 'success')
  }

  // Deep search and filter for all transactions modal
  const allFiltered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter

      if (!matchQuery(o, searchQuery)) return false
      return matchStatus
    })
  }, [orders, searchQuery, statusFilter])

  function matchQuery(o: Order, q: string) {
    if (!q.trim()) return true
    const term = q.toLowerCase()
    const idMatch = o.id.toLowerCase().includes(term)
    const nameMatch = o.address.name.toLowerCase().includes(term)
    const phoneMatch = o.address.phone.includes(term)
    const addressMatch = o.address.address.toLowerCase().includes(term)
    const productMatch = o.items.some((item) => {
      const p = productsList.find((x) => x.id === item.id)
      return p?.name.toLowerCase().includes(term)
    })
    return idMatch || nameMatch || phoneMatch || addressMatch || productMatch
  }

  return (
    <div className="space-y-6">
      {/* Header and Simulation controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">جدول تراکنش‌های زنده</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ۲۰ تراکنش آخر به صورت زنده نمایش داده می‌شوند (هر تراکنش جدید به بالای جدول اضافه می‌شود).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={simulateNewTransaction}
            className="bg-emerald-700 hover:bg-emerald-800 shadow-sm"
          >
            <Icon name="bolt" size={16} className="me-1" />
            شبیه‌سازی تراکنش جدید
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowAllModal(true)}
            className="border-slate-300"
          >
            <Icon name="card" size={16} className="me-1" />
            مشاهده همه تراکنش‌ها ({toFa(orders.length)})
          </Button>
        </div>
      </div>

      {/* Live Table (20 Latest) with smooth entrance animation */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600">
                <th className="py-3 px-4">شماره سفارش / تراکنش</th>
                <th className="py-3 px-4">مشتری</th>
                <th className="py-3 px-4">شماره تماس</th>
                <th className="py-3 px-4">زمان ثبت</th>
                <th className="py-3 px-4">مبلغ کل</th>
                <th className="py-3 px-4">روش پرداخت</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4 text-center">تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latest20.map((o, idx) => (
                <tr
                  key={o.id}
                  className={cn(
                    'transition-all duration-500 hover:bg-slate-50/70',
                    idx === 0 && 'animate-fade-up bg-emerald-50/40'
                  )}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">{o.id}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{o.address.name}</td>
                  <td className="py-3 px-4 tabular-nums text-slate-500">{toFa(o.address.phone)}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{o.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                    {toFa(o.total)} تومان
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{o.payment}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
                        statusMeta[o.status]?.tone ?? 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {statusMeta[o.status]?.label ?? o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Select
                      value={o.status}
                      onChange={(e) => {
                        setOrderStatus(o.id, e.target.value as Status)
                        toast(`وضعیت سفارش ${o.id} به‌روز شد`)
                      }}
                      className="text-xs h-8 py-0"
                    >
                      {Object.entries(statusMeta).map(([stKey, stMeta]) => (
                        <option key={stKey} value={stKey}>
                          {stMeta.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View All Transactions with Deep Search & Filters */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  فهرست کامل کلیه تراکنش‌ها ({toFa(orders.length)})
                </h3>
                <p className="text-xs text-slate-500">
                  امکان فیلتر بر اساس وضعیت، تاریخ، و جستجوی چندگانه (آدرس، تلفن، نام مشتری یا نام کالا)
                </p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[280px]">
                  <Input
                    placeholder="جستجو در نام مشتری، شماره تلفن، آدرس، نام محصول، کد سفارش …"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    {Object.entries(statusMeta).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  یافت‌شده: {toFa(allFiltered.length)} مورد
                </span>
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {allFiltered.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="تراکنشی پیدا نشد"
                  text="با فیلترهای جستجوی انتخابی، موردی ثبت نشده است."
                />
              ) : (
                <table className="w-full border-collapse text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">کد</th>
                      <th className="py-2.5 px-3">مشتری</th>
                      <th className="py-2.5 px-3">تماس</th>
                      <th className="py-2.5 px-3">نشانی تحویل</th>
                      <th className="py-2.5 px-3">اقلام سفارش</th>
                      <th className="py-2.5 px-3">مبلغ کل</th>
                      <th className="py-2.5 px-3">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allFiltered.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="py-2.5 px-3 font-semibold">{o.address.name}</td>
                        <td className="py-2.5 px-3 tabular-nums">{toFa(o.address.phone)}</td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate">
                          {o.address.province}، {o.address.city}، {o.address.address}
                        </td>
                        <td className="py-2.5 px-3">
                          {o.items
                            .map((it) => {
                              const p = productsList.find((x) => x.id === it.id)
                              return `${p?.name || 'کالا'} (${toFa(it.qty)})`
                            })
                            .join('، ')}
                        </td>
                        <td className="py-2.5 px-3 font-bold tabular-nums">
                          {toFa(o.total)} تومان
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              'inline-block rounded px-2 py-0.5 font-semibold text-[11px]',
                              statusMeta[o.status]?.tone
                            )}
                          >
                            {statusMeta[o.status]?.label ?? o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 flex justify-end">
              <Button onClick={() => setShowAllModal(false)}>بستن</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
