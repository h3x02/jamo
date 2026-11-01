import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '../lib/format'
import { useStore } from '../lib/store'
import { Icon } from './Icon'

/* ---------- Button ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  loading?: boolean
}
const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-700/40',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-sand hover:ring-brand-200 disabled:text-muted/60',
  ghost: 'text-ink hover:bg-sand disabled:text-muted/60',
  danger: 'bg-white text-sale ring-1 ring-inset ring-sale/30 hover:bg-sale-50',
  light: 'bg-white text-brand-800 hover:bg-brand-50',
}
const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-5 text-[15px]', lg: 'h-12 px-6 text-base' }
export function Button({ variant = 'primary', size = 'md', full, loading, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] select-none whitespace-nowrap', variants[variant], sizes[size], full && 'w-full', className)}
      {...rest}
    >
      {loading ? <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : null}
      {children}
    </button>
  )
}
export const IconButton = ({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) => (
  <button aria-label={label} title={label} className={cn('inline-grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-sand active:scale-95', className)} {...rest}>{children}</button>
)

/* ---------- Form ---------- */
export function Field({ label, error, hint, children, htmlFor }: { label?: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">{label}</label>}
      {children}
      {error ? <p role="alert" className="text-[13px] text-sale">{error}</p> : hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
    </div>
  )
}
const control = 'h-11 w-full rounded-lg bg-white px-3.5 text-[15px] ring-1 ring-inset ring-line placeholder:text-muted/70 transition focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-sand'
export function Input({ label, error, hint, id, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }) {
  const uid = id ?? rest.name
  return (
    <Field label={label} error={error} hint={hint} htmlFor={uid}>
      <input id={uid} aria-invalid={!!error} className={cn(control, error && 'ring-sale/60', className)} {...rest} />
    </Field>
  )
}
export function Select({ label, error, id, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const uid = id ?? rest.name
  return (
    <Field label={label} error={error} htmlFor={uid}>
      <select id={uid} className={cn(control, 'appearance-none bg-[length:16px] bg-[position:left_12px_center] bg-no-repeat pe-3.5 ps-9', error && 'ring-sale/60', className)} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2366726f' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m3 6 5 5 5-5'/%3E%3C/svg%3E")` }} {...rest}>{children}</select>
    </Field>
  )
}
export const Textarea = ({ label, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
  <Field label={label} htmlFor={rest.name}>
    <textarea id={rest.name} rows={3} className={cn(control, 'h-auto py-2.5 resize-none')} {...rest} />
  </Field>
)
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-line')}>
      <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'end-0.5' : 'end-[22px]')} />
    </button>
  )
}

/* ---------- Skeleton / States ---------- */
export const Skeleton = ({ className }: { className?: string }) => <div className={cn('skeleton rounded-lg', className)} />
export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center animate-fade-up">
      <span className="mb-4 grid size-16 place-items-center rounded-full bg-sand text-brand-700"><Icon name={icon} size={28} /></span>
      <h2 className="text-lg font-bold">{title}</h2>
      {text && <p className="mt-1.5 text-sm leading-7 text-muted">{text}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
export const ErrorState = ({ onRetry, offline }: { onRetry: () => void; offline?: boolean }) => (
  <EmptyState icon={offline ? 'wifioff' : 'alert'} title={offline ? 'اتصال اینترنت برقرار نیست' : 'خطا در دریافت اطلاعات'} text="لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید." action={<Button onClick={onRetry}><Icon name="refresh" size={18} />تلاش دوباره</Button>} />
)

/* ---------- Overlay: Modal + Drawer ---------- */
function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    addEventListener('keydown', key)
    ref.current?.focus()
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', key)
      prev?.focus?.()
    }
  }, [open])
  return ref
}
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/50 animate-fade" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="relative flex max-h-[90dvh] w-full max-w-md flex-col rounded-xl bg-white shadow-pop outline-none animate-fade-up">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-bold">{title}</h2>
          <IconButton label="بستن" onClick={onClose} className="-me-2 size-9"><Icon name="x" size={18} /></IconButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  )
}
export function Drawer({ open, onClose, title, side = 'right', children, footer }: { open: boolean; onClose: () => void; title: string; side?: 'right' | 'bottom'; children: ReactNode; footer?: ReactNode }) {
  const ref = useOverlay(open, onClose)
  if (!open) return null
  const bottom = side === 'bottom'
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-ink/50 animate-fade" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={cn('absolute flex flex-col bg-white shadow-pop outline-none', bottom ? 'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl animate-sheet' : 'inset-y-0 end-0 w-[min(88vw,360px)] animate-side')}>
        {bottom && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <IconButton label="بستن" onClick={onClose} className="-me-2"><Icon name="x" /></IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="pb-safe border-t border-line bg-white p-4">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------- Toast ---------- */
export function ToastHost() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex min-w-60 max-w-sm items-center gap-3 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-pop animate-toast">
          <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', t.tone === 'success' ? 'bg-brand-500' : t.tone === 'error' ? 'bg-sale' : 'bg-white/20')}>
            <Icon name={t.tone === 'error' ? 'alert' : t.tone === 'info' ? 'heart' : 'check'} size={14} />
          </span>
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="بستن" className="text-white/60 hover:text-white"><Icon name="x" size={16} /></button>
        </div>
      ))}
    </div>
  )
}

/* ---------- Misc ---------- */
export const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', className)}>{children}</span>
)
export function Img({ src, alt, className, zoom }: { src: string; alt: string; className?: string; zoom?: boolean }) {
  const [ok, setOk] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-sand', className)}>
      {!ok && <div className="skeleton absolute inset-0" />}
      <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={() => setOk(true)} className={cn('size-full object-cover transition-all duration-500', ok ? 'opacity-100' : 'opacity-0', zoom && 'group-hover:scale-105')} />
    </div>
  )
}
export function useFakeLoad(deps: unknown[], ms = 500) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return loading
}
export const Container = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('mx-auto w-full max-w-[1280px] px-4 md:px-6', className)}>{children}</div>
)
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-1.5 py-4 text-[13px] text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.to ? <a href={'#' + it.to} className="hover:text-brand-700">{it.label}</a> : <span className="text-ink">{it.label}</span>}
          {i < items.length - 1 && <Icon name="next" size={12} />}
        </span>
      ))}
    </nav>
  )
}
