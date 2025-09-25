"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import type { Sale } from "@/types"

interface BarChartProps {
  sales: Sale[] // Recebe vendas já filtradas por isVisible
  title: string
}

export default function BarChart({ sales, title }: BarChartProps) {
  const chartData = useMemo(() => {
    const dailyData: { [key: string]: number } = {}

    sales.forEach((sale) => {
      if (sale.approved) {
        // isVisible já foi filtrado antes
        const date = new Date(sale.createdAt).toLocaleDateString("pt-BR")
        dailyData[date] = (dailyData[date] || 0) + sale.amount
      }
    })

    const sortedData = Object.entries(dailyData)
      .sort(([a], [b]) => {
        const dateA = new Date(a.split("/").reverse().join("-"))
        const dateB = new Date(b.split("/").reverse().join("-"))
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-7) // Últimos 7 dias

    const maxValue = Math.max(...sortedData.map(([, value]) => value))

    return sortedData.map(([date, value]) => ({
      date,
      value,
      percentage: maxValue > 0 ? (value / maxValue) * 100 : 0,
    }))
  }, [sales])

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{title}</h3>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.date}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum dado disponível para o período selecionado
        </div>
      )}
    </div>
  )
}
