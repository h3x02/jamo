import { lazy, Suspense, useEffect } from 'react'
import { BottomNav, Footer, Header } from './components/Layout'
import { Button, Container, EmptyState, ToastHost } from './components/ui'
import { navigate, useRoute } from './lib/router'
import { StoreProvider } from './lib/store'
import Home from './pages/Home'

const Account = lazy(() => import('./pages/Account'))
const Auth = lazy(() => import('./pages/Auth'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const ProductPage = lazy(() => import('./pages/Product'))
const Listing = lazy(() => import('./pages/Listing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function Router() {
  const { path } = useRoute()
  useEffect(() => { scrollTo({ top: 0 }) }, [path])
  const m = path.match(/^\/product\/(\d+)/)
  if (path === '/') return <Home />
  if (path === '/products') return <Listing />
  if (m) return <ProductPage id={+m[1]} />
  if (path === '/cart') return <Cart />
  if (path === '/checkout') return <Checkout />
  if (path.startsWith('/dashboard')) return <Dashboard sub={path.replace(/^\/dashboard\/?/, '')} />
  if (path.startsWith('/account')) return <Account sub={path.replace(/^\/account\/?/, '')} />
  return <Container><EmptyState icon="search" title="صفحه پیدا نشد" text="آدرسی که وارد کردید وجود ندارد." action={<Button onClick={() => navigate('/')}>بازگشت به خانه</Button>} /></Container>
}

function Shell() {
  const { path } = useRoute()
  if (path === '/login') return <Suspense fallback={null}><Auth /></Suspense>
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0" key={path.split('/').slice(0, 3).join('/')}><div className="animate-fade"><Suspense fallback={<div className="min-h-[60vh]" />}><Router /></Suspense></div></main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
      <ToastHost />
    </StoreProvider>
  )
}
