'use client'

import { useEffect, useRef } from 'react'

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface UsageChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  showLabels?: boolean
}

export function UsageChart({ data, height = 200, color = '#18181b', showLabels = true }: UsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate dimensions
    const padding = { top: 20, right: 20, bottom: showLabels ? 40 : 20, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Find max value
    const maxValue = Math.max(...data.map(d => d.value), 1)
    const yAxisMax = Math.ceil(maxValue * 1.1) // Add 10% padding

    // Calculate bar dimensions
    const barCount = data.length
    const barWidth = Math.min(40, (chartWidth / barCount) * 0.7)
    const barGap = (chartWidth - barWidth * barCount) / (barCount + 1)

    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = '#a3a3a3'
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      const value = Math.round(yAxisMax - (yAxisMax / gridLines) * i)
      ctx.fillText(formatNumber(value), padding.left - 8, y)
    }

    // Draw bars
    data.forEach((point, index) => {
      const barHeight = (point.value / yAxisMax) * chartHeight
      const x = padding.left + barGap + (barWidth + barGap) * index
      const y = padding.top + chartHeight - barHeight

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, adjustColor(color, 30))

      // Draw bar with rounded top
      ctx.fillStyle = gradient
      ctx.beginPath()
      const radius = Math.min(4, barWidth / 2)
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.lineTo(x, y + barHeight)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.fill()

      // X-axis labels
      if (showLabels) {
        ctx.fillStyle = '#a3a3a3'
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const label = point.label || formatDate(point.date)
        ctx.fillText(label, x + barWidth / 2, padding.top + chartHeight + 8)
      }
    })
  }, [data, height, color, showLabels])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full"
      style={{ height }}
    />
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Line chart variant
interface LineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  showArea?: boolean
}

export function LineChart({ data, height = 200, color = '#18181b', showArea = true }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    const maxValue = Math.max(...data.map(d => d.value), 1)
    const yAxisMax = Math.ceil(maxValue * 1.1)

    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
      ctx.stroke()

      ctx.fillStyle = '#a3a3a3'
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      const value = Math.round(yAxisMax - (yAxisMax / gridLines) * i)
      ctx.fillText(formatNumber(value), padding.left - 8, y)
    }

    // Calculate points
    const points = data.map((point, index) => ({
      x: padding.left + (chartWidth / (data.length - 1 || 1)) * index,
      y: padding.top + chartHeight - (point.value / yAxisMax) * chartHeight,
    }))

    // Draw area
    if (showArea && points.length > 0) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
      gradient.addColorStop(0, color + '30')
      gradient.addColorStop(1, color + '05')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(points[0].x, padding.top + chartHeight)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight)
      ctx.closePath()
      ctx.fill()
    }

    // Draw line
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.stroke()

    // Draw points
    points.forEach(p => {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // X-axis labels
    const labelInterval = Math.ceil(data.length / 7)
    data.forEach((point, index) => {
      if (index % labelInterval === 0 || index === data.length - 1) {
        ctx.fillStyle = '#a3a3a3'
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const label = point.label || formatDate(point.date)
        ctx.fillText(label, points[index].x, padding.top + chartHeight + 8)
      }
    })
  }, [data, height, color, showArea])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full"
      style={{ height }}
    />
  )
}
