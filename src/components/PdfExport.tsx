import React, { useRef, useState } from 'react'
import { toFa } from '../lib/format'
import { getPersianDateTime } from './MaterialCharts'
import { Button } from './ui'
import { Icon } from './Icon'

/**
 * pdfcn component primitives:
 * - PdfDocument
 * - PdfPage
 * - PdfHeader
 * - PdfCard
 * - PdfDataTable
 * - PdfKeyValue
 * - PdfBadge
 * - PdfDivider
 *
 * Implements a print/export system that renders the document using shadcn/pdfcn design
 * and opens a high-fidelity print-to-PDF / direct download window.
 */

export interface PdfDocumentProps {
  title: string
  subtitle?: string
  date?: string
  children: React.ReactNode
}

export function PdfDocument({ title, subtitle, date, children }: PdfDocumentProps) {
  const curDate = date || getPersianDateTime().full

  return (
    <div
      dir="rtl"
      className="pdfcn-document max-w-[800px] mx-auto bg-white p-8 font-sans text-slate-800 shadow-xl border border-slate-200 rounded-xl print:p-0 print:border-0 print:shadow-none"
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-white font-extrabold text-sm">
              ج
            </span>
            <span className="text-xl font-black text-slate-900">سامانه مدیریت جامو</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-left text-xs text-slate-500 space-y-1" dir="ltr">
          <p>تاریخ گزارش: <span className="font-semibold text-slate-700">{curDate}</span></p>
          <p className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
            CONFIDENTIAL / محرمانه
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-4 mt-8 flex items-center justify-between text-[11px] text-slate-400">
        <span>گزارش رسمی سوپراپ جامو (pdfcn.dev report engine)</span>
        <span>صفحه ۱ از ۱</span>
      </div>
    </div>
  )
}

export function PdfCard({
  title,
  subtitle,
  children,
  badge,
}: {
  title?: string
  subtitle?: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
      {(title || subtitle || badge) && (
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
          {badge && (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function PdfMetricCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      <p className="text-lg font-black text-slate-900 tabular-nums mt-1">
        {typeof value === 'number' ? toFa(value) : value}
      </p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export interface PdfDataTableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  render?: (row: T) => React.ReactNode
}

export function PdfDataTable<T extends Record<string, any>>({
  columns,
  data,
}: {
  columns: PdfDataTableColumn<T>[]
  data: T[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-right text-xs">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`py-2.5 px-3 font-bold ${
                  c.align === 'center' ? 'text-center' : c.align === 'left' ? 'text-left' : 'text-right'
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-2 px-3 text-slate-700 ${
                    c.align === 'center' ? 'text-center' : c.align === 'left' ? 'text-left' : 'text-right'
                  }`}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PdfExportButton({
  documentTitle,
  renderContent,
}: {
  documentTitle: string
  renderContent: () => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('لطفاً اجازه باز شدن پنجره پاپ‌آپ چاپ را صادر کنید.')
      return
    }

    const reportHtml = reportRef.current?.innerHTML || ''
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: system-ui, -apple-system, 'Vazirmatn', sans-serif; background: #fff; }
        </style>
      </head>
      <body class="p-4">
        ${reportHtml}
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 400);
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm"
      >
        <Icon name="download" size={16} />
        خروجی گزارش PDF (pdfcn)
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-50 shadow-2xl border border-slate-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">پیش‌نمایش سند PDF (pdfcn)</h3>
                <p className="text-xs text-slate-500">
                  فرمت گزارش استاندارد با کامپوننت‌های فرمت شده shadcn / pdfcn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handlePrint} className="bg-emerald-700 hover:bg-emerald-800">
                  <Icon name="download" size={16} className="me-1" />
                  چاپ و دانلود PDF
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Preview */}
            <div className="flex-1 overflow-y-auto p-6" ref={reportRef}>
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
