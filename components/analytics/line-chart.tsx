"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import type { Sale } from "@/types"

interface LineChartProps {
  sales: Sale[] // Recebe vendas já filtradas por isVisible
  title: string
}

export default function LineChart({ sales, title }: LineChartProps) {
  const chartData = useMemo(() => {
    const dailyData: { [key: string]: { revenue: number; count: number } } = {}

    sales.forEach((sale) => {
      if (sale.approved) {
        // isVisible já foi filtrado antes
        const date = new Date(sale.createdAt).toLocaleDateString("pt-BR")
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, count: 0 }
        }
        dailyData[date].revenue += sale.amount
        dailyData[date].count += 1
      }
    })

    const sortedData = Object.entries(dailyData)
      .sort(([a], [b]) => {
        const dateA = new Date(a.split("/").reverse().join("-"))
        const dateB = new Date(b.split("/").reverse().join("-"))
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-14) // Últimos 14 dias

    const maxRevenue = Math.max(...sortedData.map(([, data]) => data.revenue))
    const maxCount = Math.max(...sortedData.map(([, data]) => data.count))

    return sortedData.map(([date, data], index) => ({
      date,
      revenue: data.revenue,
      count: data.count,
      revenuePercentage: maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0,
      countPercentage: maxCount > 0 ? (data.count / maxCount) * 100 : 0,
      index,
    }))
  }, [sales])

  const maxHeight = 200

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{title}</h3>

      {chartData.length > 0 ? (
        <div className="space-y-6">
          {/* Gráfico de Receita */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Receita Diária</h4>
            <div className="relative" style={{ height: maxHeight }}>
              <svg width="100%" height={maxHeight} className="overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((percentage) => (
                  <line
                    key={percentage}
                    x1="0"
                    y1={maxHeight - (percentage / 100) * maxHeight}
                    x2="100%"
                    y2={maxHeight - (percentage / 100) * maxHeight}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-200 dark:text-gray-700"
                    opacity="0.5"
                  />
                ))}

                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData
                    .map((item, index) => {
                      const x = (index / (chartData.length - 1 || 1)) * 100 // Evitar divisão por zero
                      const y = maxHeight - (item.revenuePercentage / 100) * maxHeight
                      return `${x}%,${y}`
                    })
                    .join(" ")}
                />

                {/* Data points */}
                {chartData.map((item, index) => {
                  const x = (index / (chartData.length - 1 || 1)) * 100 // Evitar divisão por zero
                  const y = maxHeight - (item.revenuePercentage / 100) * maxHeight
                  return (
                    <circle
                      key={index}
                      cx={`${x}%`}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      className="hover:r-6 transition-all duration-200"
                    >
                      <title>
                        {item.date}: {formatCurrency(item.revenue)}
                      </title>
                    </circle>
                  )
                })}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                {chartData.map((item, index) => {
                  if (index % Math.ceil(chartData.length / 4) === 0 || index === chartData.length - 1) {
                    return <span key={index}>{item.date}</span>
                  }
                  return <span key={index} />
                })}
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Receita Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {chartData.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total de Vendas</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum dado disponível para o período selecionado
        </div>
      )}
    </div>
  )
}
