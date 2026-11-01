export const toFa = (n: number | string) => Number(n).toLocaleString('fa-IR')
export const faDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d])
/** Normalise Persian/Arabic digits to Latin for validation. */
export const enDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
export const isMobile = (s: string) => /^09\d{9}$/.test(enDigits(s).trim())
export const isPostal = (s: string) => /^\d{10}$/.test(enDigits(s).trim())
export const pct = (price: number, old?: number) => (old ? Math.round(((old - price) / old) * 100) : 0)
export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
