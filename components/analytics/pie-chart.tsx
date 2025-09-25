"use client"

import { useMemo } from "react"
import { getProductCategory, formatCurrency } from "@/lib/utils"
import type { Sale, ProductCategory } from "@/types"

interface PieChartProps {
  sales: Sale[] // Recebe vendas já filtradas por visible pela AnalyticsPage
  title: string
}

export default function PieChart({ sales, title }: PieChartProps) {
  const chartData = useMemo(() => {
    const categoryData: { [key in ProductCategory]: number } = {
      Crocs: 0,
      Sephora: 0,
      Pandora: 0,
      PixDoMilhão: 0,
      Outros: 0,
    }

    // sales já devem estar filtradas por visible !== false pela AnalyticsPage
    sales.forEach((sale) => {
      if (sale.approved) {
        // Não é necessário re-checar sale.visible aqui
        const category = getProductCategory(sale.productName)
        categoryData[category] += sale.amount
      }
    })

    const total = Object.values(categoryData).reduce((sum, value) => sum + value, 0)

    const colors: { [key in ProductCategory]: string } = {
      Crocs: "bg-green-500",
      Sephora: "bg-purple-500",
      Pandora: "bg-pink-500",
      PixDoMilhão: "bg-yellow-500",
      Outros: "bg-gray-500",
    }

    return Object.entries(categoryData)
      .map(([category, value]) => ({
        category: category as ProductCategory,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: colors[category as ProductCategory],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [sales])

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{title}</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative w-48 h-48 mx-auto">
          <div className="w-full h-full rounded-full border-8 border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {chartData.length > 0 ? (
              <div className="absolute inset-0">
                {chartData.map((item, index) => {
                  const previousPercentage = chartData
                    .slice(0, index)
                    .reduce((sum, prevItem) => sum + prevItem.percentage, 0)

                  return (
                    <div
                      key={item.category}
                      className={`absolute inset-0 ${item.color.replace("bg-", "border-")} border-8`}
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${
                          50 + 50 * Math.cos((((previousPercentage + item.percentage) * 360) / 100) * (Math.PI / 180))
                        }% ${
                          50 + 50 * Math.sin((((previousPercentage + item.percentage) * 360) / 100) * (Math.PI / 180))
                        }%, 50% 50%)`,
                        transform: `rotate(${(previousPercentage * 360) / 100}deg)`,
                      }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
            )}

            <div className="absolute inset-4 bg-white dark:bg-[#0F0F12] rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`} />
                <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum dado disponível para o período selecionado
        </div>
      )}
    </div>
  )
}
