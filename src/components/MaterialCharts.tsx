import { useState } from 'react'
import { toFa } from '../lib/format'

// Format Persian date and time
export function getPersianDateTime(date: Date = new Date()): { date: string; time: string; full: string } {
  const d = date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const t = date.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return { date: d, time: t, full: `${d} ساعت ${t}` }
}

export type ChartDataPoint = {
  label: string
  value: number
  secondary?: number
}

// Material Theme Colors (Material 3 Palette)
export const MaterialColors = {
  primary: '#1973E8', // Material Google Blue
  primaryDark: '#0D47A1',
  secondary: '#00897B', // Teal
  tertiary: '#E65100', // Amber/Orange
  success: '#2E7D32', // Green
  warning: '#F57C00', // Deep Orange
  error: '#D32F2F', // Red
  purple: '#673AB7', // Deep Purple
  pink: '#E91E63',
  surfaceVariant: '#F1F5F9',
  outline: '#E2E8F0',
  grid: '#EDF2F7',
}

interface MaterialChartProps {
  title?: string
  subtitle?: string
  data: ChartDataPoint[]
  height?: number
  unit?: string
  color?: string
  secondaryColor?: string
  showSecondary?: boolean
  secondaryLabel?: string
  primaryLabel?: string
}

/**
 * Material Area & Line Chart with smooth bezier curves, interactive tooltip, and Persian axes
 */
export function MaterialLineChart({
  title,
  subtitle,
  data,
  height = 240,
  unit = '',
  color = MaterialColors.primary,
  secondaryColor = MaterialColors.secondary,
  showSecondary = false,
  primaryLabel = 'مقدار',
  secondaryLabel = 'ثانویه',
}: MaterialChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (!data || data.length === 0) return null

  const paddingLeft = 50
  const paddingRight = 24
  const paddingTop = 24
  const paddingBottom = 40
  const width = 600

  const innerWidth = width - paddingLeft - paddingRight
  const innerHeight = height - paddingTop - paddingBottom

  const allValues = [
    ...data.map((d) => d.value),
    ...(showSecondary ? data.map((d) => d.secondary ?? 0) : []),
  ]
  const maxValue = Math.max(...allValues, 1) * 1.15
  const minValue = 0

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2
    return paddingLeft + (index / (data.length - 1)) * innerWidth
  }

  const getY = (val: number) => {
    return paddingTop + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight
  }

  // Smooth bezier curve generator
  const createPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2] ?? p2

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
  }

  const primaryPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
  const secondaryPoints = showSecondary
    ? data.map((d, i) => ({ x: getX(i), y: getY(d.secondary ?? 0) }))
    : []

  const primaryPath = createPath(primaryPoints)
  const secondaryPath = showSecondary ? createPath(secondaryPoints) : ''

  const areaPath = primaryPoints.length
    ? `${primaryPath} L ${primaryPoints[primaryPoints.length - 1].x} ${paddingTop + innerHeight} L ${primaryPoints[0].x} ${paddingTop + innerHeight} Z`
    : ''

  // 4 horizontal grid lines
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    val: Math.round(maxValue * pct),
    y: getY(maxValue * pct),
  }))

  const hoveredItem = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {(title || subtitle) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {showSecondary && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-600">{primaryLabel}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <span className="text-slate-600">{secondaryLabel}</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full overflow-hidden" dir="ltr">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          style={{ maxHeight: height }}
        >
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke={MaterialColors.grid}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {toFa(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill={`url(#gradient-${color.replace('#', '')})`} />
          )}

          {/* Secondary Line */}
          {showSecondary && secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
          )}

          {/* Primary Line */}
          {primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {primaryPoints.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === i ? 6 : 4}
                fill="#ffffff"
                stroke={color}
                strokeWidth={hoverIndex === i ? 3 : 2}
                className="transition-all duration-150 cursor-pointer"
              />
              {/* X Axis Label */}
              <text
                x={pt.x}
                y={paddingTop + innerHeight + 20}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {data[i].label}
              </text>
            </g>
          ))}

          {/* Interactive touch/hover overlay bars */}
          {data.map((_, i) => {
            const x = getX(i)
            const barW = innerWidth / data.length
            return (
              <rect
                key={i}
                x={x - barW / 2}
                y={paddingTop}
                width={barW}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              />
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && hoveredItem && (
          <div
            className="pointer-events-none absolute -top-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg transition-transform duration-150"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-bold">{hoveredItem.label}</p>
            <p className="tabular-nums text-slate-200">
              {primaryLabel}: {toFa(hoveredItem.value)} {unit}
            </p>
            {showSecondary && hoveredItem.secondary !== undefined && (
              <p className="tabular-nums text-slate-300">
                {secondaryLabel}: {toFa(hoveredItem.secondary)} {unit}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Material Bar Chart with rounded tops and elevation styling
 */
export function MaterialBarChart({
  title,
  subtitle,
  data,
  height = 240,
  unit = '',
  color = MaterialColors.primary,
}: MaterialChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.value), 1) * 1.15
  const hoveredItem = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div className="relative flex items-end gap-2 pt-6" style={{ height }}>
        {data.map((d, i) => {
          const heightPct = Math.max(4, Math.round((d.value / maxValue) * 100))
          const isHovered = hoverIndex === i

          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Bar */}
              <div
                className="w-full max-w-[42px] rounded-t-lg transition-all duration-200 group-hover:brightness-110"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isHovered ? MaterialColors.primaryDark : color,
                  boxShadow: isHovered
                    ? '0 4px 12px rgba(25, 115, 232, 0.35)'
                    : '0 2px 4px rgba(0,0,0,0.05)',
                }}
              />

              {/* Label */}
              <span className="mt-2 text-center text-[11px] font-medium text-slate-500 truncate w-full">
                {d.label}
              </span>
            </div>
          )
        })}

        {/* Floating Tooltip */}
        {hoverIndex !== null && hoveredItem && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg transition-all duration-150"
            style={{
              left: `${((hoverIndex + 0.5) / data.length) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-bold">{hoveredItem.label}</p>
            <p className="tabular-nums text-slate-200">
              {toFa(hoveredItem.value)} {unit}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Material Donut Chart with clean legends and center summary
 */
export function MaterialDonutChart({
  title,
  subtitle,
  data,
  centerTitle,
  centerValue,
}: {
  title?: string
  subtitle?: string
  data: { label: string; value: number; color: string }[]
  centerTitle?: string
  centerValue?: string
}) {
  const total = data.reduce((s, i) => s + i.value, 0) || 1
  let cumulative = 0

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
        {/* SVG Donut */}
        <div className="relative size-44 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            {data.map((item, i) => {
              const fraction = item.value / total
              const strokeDasharray = `${fraction * 283} 283`
              const strokeDashoffset = -cumulative * 283
              cumulative += fraction

              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-90"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerTitle && <span className="text-[11px] text-slate-400">{centerTitle}</span>}
            {centerValue && (
              <span className="text-lg font-extrabold text-slate-800 tabular-nums">
                {centerValue}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2.5 w-full">
          {data.map((item, i) => {
            const pct = Math.round((item.value / total) * 100)
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {toFa(pct)}٪ ({toFa(item.value)})
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
