import { useEffect, useRef, useState } from 'react'
import { Logo } from '../components/Layout'
import { Icon } from '../components/Icon'
import { Button, Input } from '../components/ui'
import { cn, enDigits, isMobile, toFa } from '../lib/format'
import { Link, navigate, useRoute } from '../lib/router'
import { useStore } from '../lib/store'

function Otp({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const set = (i: number, d: string) => {
    const arr = value.padEnd(5, ' ').split('')
    arr[i] = d || ' '
    onChange(arr.join('').trimEnd())
    if (d && i < 4) refs.current[i + 1]?.focus()
  }
  return (
    <div dir="ltr" className="flex justify-center gap-2" onPaste={(e) => { const t = enDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 5); if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(t.length, 4)]?.focus() } }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <input key={i} ref={(el) => { refs.current[i] = el }} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`رقم ${toFa(i + 1)}`} value={value[i] && value[i] !== ' ' ? toFa(value[i]) : ''}
          onChange={(e) => set(i, enDigits(e.target.value).replace(/\D/g, '').slice(-1))} onKeyDown={(e) => e.key === 'Backspace' && !(value[i] && value[i] !== ' ') && i > 0 && refs.current[i - 1]?.focus()}
          className={cn('size-12 rounded-lg bg-white text-center text-xl font-bold ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-brand-500 sm:size-14', error ? 'ring-sale' : 'ring-line')} />
      ))}
    </div>
  )
}

type Mode = 'login' | 'register' | 'otp' | 'password' | 'forgot' | 'reset'
export default function Auth() {
  const { query } = useRoute()
  const { login, toast } = useStore()
  const [mode, setMode] = useState<Mode>(query.get('mode') === 'register' ? 'register' : 'login')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(0)
  const [after, setAfter] = useState<'login' | 'register' | 'reset'>('login')
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t) }, [left])
  const finish = () => {
    const cleanPhone = enDigits(phone)
    login(cleanPhone, name || undefined)
    toast('خوش آمدید به جامو')
    const nextUrl = query.get('next')
    if (nextUrl) {
      navigate(nextUrl)
    } else if (cleanPhone === '09104056429') {
      navigate('/dashboard')
    } else {
      navigate('/account')
    }
  }
  const wait = (fn: () => void) => { setBusy(true); setTimeout(() => { setBusy(false); fn() }, 700) }

  const sendCode = (a: typeof after) => {
    setErr('')
    if (a === 'register' && name.trim().length < 3) return setErr('نام و نام خانوادگی را وارد کنید')
    if (!isMobile(phone)) return setErr('شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)')
    wait(() => { setAfter(a); setCode(''); setLeft(60); setMode('otp'); toast(`کد تأیید به ${toFa(enDigits(phone))} ارسال شد`) })
  }
  const verify = () => {
    if (!/^\d{5}$/.test(enDigits(code))) return setErr('کد ۵ رقمی را کامل وارد کنید')
    if (enDigits(code) === '00000') return setErr('کد وارد شده اشتباه است')
    wait(() => (after === 'reset' ? (setErr(''), setMode('reset')) : finish()))
  }

  const titles: Record<Mode, [string, string]> = {
    login: ['ورود به جامو', 'شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود'],
    register: ['ساخت حساب کاربری', 'با ثبت‌نام، خرید و پیگیری سفارش‌ها ساده‌تر می‌شود'],
    otp: ['کد تأیید را وارد کنید', `کد ۵ رقمی ارسال‌شده به ${toFa(enDigits(phone))} را وارد کنید`],
    password: ['ورود با رمز عبور', 'شماره موبایل و رمز عبور خود را وارد کنید'],
    forgot: ['بازیابی رمز عبور', 'کد تأیید برای شماره‌ی شما ارسال می‌شود'],
    reset: ['رمز عبور جدید', 'رمز عبور جدید حداقل ۶ کاراکتر باشد'],
  }
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (mode === 'login') sendCode('login')
    else if (mode === 'register') sendCode('register')
    else if (mode === 'forgot') sendCode('reset')
    else if (mode === 'otp') verify()
    else if (mode === 'password') { if (!isMobile(phone)) return setErr('شماره موبایل معتبر نیست'); if (pass.length < 6) return setErr('رمز عبور حداقل ۶ کاراکتر است'); wait(finish) }
    else if (mode === 'reset') { if (pass.length < 6) return setErr('رمز عبور حداقل ۶ کاراکتر است'); wait(() => { toast('رمز عبور تغییر کرد'); setPass(''); setMode('password') }) }
  }
  const phoneField = <Input label="شماره موبایل" name="phone" inputMode="numeric" autoComplete="tel" maxLength={11} placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={phone} onChange={(e) => setPhone(e.target.value)} />
  const tab = (m: Mode, l: string) => <button type="button" onClick={() => { setMode(m); setErr('') }} className={cn('h-10 flex-1 rounded-md text-sm font-semibold transition', mode === m ? 'bg-white shadow-sm' : 'text-muted')}>{l}</button>

  return (
    <div className="grid min-h-dvh md:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden bg-brand-800 md:block">
        <img src="https://images.unsplash.com/photo-1485637701894-09ad422f6de6?auto=format&fit=crop&w=1000&q=70" alt="" className="absolute inset-0 size-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/30 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white"><Logo light /><div><p className="text-3xl font-extrabold leading-snug">سوپرمارکت شما،<br />درِ خانه.</p><p className="mt-2 text-brand-100">تازه، مطمئن و با قیمت منصفانه.</p></div></div>
      </div>
      <div className="flex flex-col px-5 py-6 md:px-10">
        <div className="flex items-center justify-between md:justify-end"><Logo className="md:hidden" /><Link to="/" className="flex items-center gap-1 text-sm text-muted hover:text-ink">بازگشت به فروشگاه<Icon name="next" size={16} /></Link></div>
        <form onSubmit={onSubmit} className="m-auto w-full max-w-sm space-y-5 py-8 animate-fade-up" key={mode}>
          {(mode === 'login' || mode === 'register') && <div className="flex rounded-lg bg-sand p-1">{tab('login', 'ورود')}{tab('register', 'ثبت‌نام')}</div>}
          <div><h1 className="text-2xl font-bold">{titles[mode][0]}</h1><p className="mt-1.5 text-sm leading-7 text-muted">{titles[mode][1]}</p></div>
          {mode === 'register' && <Input label="نام و نام خانوادگی" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'password') && phoneField}
          {mode === 'password' && <Input label="رمز عبور" name="pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />}
          {mode === 'reset' && <Input label="رمز عبور جدید" name="pass" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />}
          {mode === 'otp' && (
            <div className="space-y-4">
              <Otp value={code} onChange={(v) => { setCode(v); setErr('') }} error={!!err} />
              <div className="flex items-center justify-between text-sm"><button type="button" className="font-medium text-brand-700" onClick={() => { setMode(after === 'register' ? 'register' : 'login'); setErr('') }}>ویرایش شماره</button>
                {left > 0 ? <span className="text-muted tabular-nums">ارسال مجدد تا {toFa(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`)}</span> : <button type="button" className="font-semibold text-brand-700" onClick={() => { setLeft(60); toast('کد جدید ارسال شد') }}>ارسال مجدد کد</button>}</div>
              <p className="rounded-lg bg-sand p-3 text-xs leading-6 text-muted">نسخه نمایشی: هر کد ۵ رقمی (به‌جز ۰۰۰۰۰) پذیرفته می‌شود.</p>
            </div>
          )}
          {err && <p role="alert" className="text-sm text-sale">{err}</p>}
          <Button type="submit" size="lg" full loading={busy}>{{ login: 'دریافت کد تأیید', register: 'ثبت‌نام و دریافت کد', otp: 'تأیید و ورود', password: 'ورود', forgot: 'ارسال کد بازیابی', reset: 'ثبت رمز جدید' }[mode]}</Button>
          <div className="space-y-2 text-center text-sm">
            {mode === 'login' && <button type="button" className="font-medium text-brand-700" onClick={() => setMode('password')}>ورود با رمز عبور</button>}
            {mode === 'password' && <><button type="button" className="block w-full font-medium text-brand-700" onClick={() => setMode('login')}>ورود با کد تأیید پیامکی</button><button type="button" className="text-muted hover:text-ink" onClick={() => setMode('forgot')}>رمز عبور را فراموش کرده‌اید؟</button></>}
            {mode === 'forgot' && <button type="button" className="font-medium text-brand-700" onClick={() => setMode('password')}>بازگشت</button>}
            <p className="text-xs leading-6 text-muted">با ورود یا ثبت‌نام، <a href="#/" className="underline">قوانین و مقررات</a> جامو را می‌پذیرید.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
