"use client"

import { useMemo } from "react"
import { getProductCategory, formatCurrency } from "@/lib/utils"
import { Package, TrendingUp } from "lucide-react"
import type { Sale, ProductCategory } from "@/types"

interface CategoryMetricsProps {
  sales: Sale[] // Recebe vendas já filtradas por visible pela AnalyticsPage
  title: string
}

export default function CategoryMetrics({ sales, title }: CategoryMetricsProps) {
  const categoryData = useMemo(() => {
    const categories: {
      [key in ProductCategory]: {
        totalRevenue: number
        approvedRevenue: number
        pendingRevenue: number
        totalSales: number
        approvedSales: number
        pendingSales: number
        avgTicketApproved: number
        growth: number
      }
    } = {
      Crocs: {
        totalRevenue: 0,
        approvedRevenue: 0,
        pendingRevenue: 0,
        totalSales: 0,
        approvedSales: 0,
        pendingSales: 0,
        avgTicketApproved: 0,
        growth: 0,
      },
      Sephora: {
        totalRevenue: 0,
        approvedRevenue: 0,
        pendingRevenue: 0,
        totalSales: 0,
        approvedSales: 0,
        pendingSales: 0,
        avgTicketApproved: 0,
        growth: 0,
      },
      Pandora: {
        totalRevenue: 0,
        approvedRevenue: 0,
        pendingRevenue: 0,
        totalSales: 0,
        approvedSales: 0,
        pendingSales: 0,
        avgTicketApproved: 0,
        growth: 0,
      },
      PixDoMilhão: {
        totalRevenue: 0,
        approvedRevenue: 0,
        pendingRevenue: 0,
        totalSales: 0,
        approvedSales: 0,
        pendingSales: 0,
        avgTicketApproved: 0,
        growth: 0,
      },
      Outros: {
        totalRevenue: 0,
        approvedRevenue: 0,
        pendingRevenue: 0,
        totalSales: 0,
        approvedSales: 0,
        pendingSales: 0,
        avgTicketApproved: 0,
        growth: 0,
      },
    }

    const now = new Date()
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // sales já devem estar filtradas por visible !== false pela AnalyticsPage
    const approvedSalesFromProp = sales.filter((s) => s.approved) // Apenas aprovadas das já visíveis

    const currentPeriodApprovedSales = approvedSalesFromProp.filter(
      (sale) => new Date(sale.createdAt) >= currentPeriodStart,
    )
    const lastPeriodApprovedSales = approvedSalesFromProp.filter(
      (sale) => new Date(sale.createdAt) >= lastPeriodStart && new Date(sale.createdAt) <= lastPeriodEnd,
    )

    // Usar 'sales' (que já são visíveis) para contagem total e receita total
    // Usar 'approvedSalesFromProp' para receita aprovada, vendas aprovadas, etc.
    sales.forEach((sale) => {
      // Não é necessário re-checar sale.visible aqui
      const category = getProductCategory(sale.productName)
      const categoryMetric = categories[category]

      categoryMetric.totalRevenue += sale.amount
      categoryMetric.totalSales += 1

      if (sale.approved) {
        categoryMetric.approvedRevenue += sale.amount
        categoryMetric.approvedSales += 1
      } else {
        categoryMetric.pendingRevenue += sale.amount
        categoryMetric.pendingSales += 1
      }
    })

    Object.keys(categories).forEach((categoryKey) => {
      const category = categoryKey as ProductCategory
      const currentRevenue = currentPeriodApprovedSales
        .filter((sale) => getProductCategory(sale.productName) === category)
        .reduce((sum, sale) => sum + sale.amount, 0)

      const lastRevenue = lastPeriodApprovedSales
        .filter((sale) => getProductCategory(sale.productName) === category)
        .reduce((sum, sale) => sum + sale.amount, 0)

      categories[category].growth =
        lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : currentRevenue > 0 ? 100 : 0
      categories[category].avgTicketApproved =
        categories[category].approvedSales > 0
          ? categories[category].approvedRevenue / categories[category].approvedSales
          : 0
    })

    return categories
  }, [sales])

  const colors: { [key in ProductCategory]: { bg: string; text: string; icon: string } } = {
    Crocs: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-400",
      icon: "text-green-600 dark:text-green-400",
    },
    Sephora: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-800 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
    },
    Pandora: {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-800 dark:text-pink-400",
      icon: "text-pink-600 dark:text-pink-400",
    },
    PixDoMilhão: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-400",
      icon: "text-yellow-600 dark:text-yellow-400",
    },
    Outros: {
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-800 dark:text-gray-400",
      icon: "text-gray-600 dark:text-gray-400",
    },
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Object.entries(categoryData).map(([categoryName, data]) => {
          const category = categoryName as ProductCategory
          const color = colors[category]

          return (
            <div key={category} className={`${color.bg} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${color.text}`}>{category}</h4>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${data.growth >= 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className={`text-sm font-medium ${data.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {data.growth >= 0 ? "+" : ""}
                    {data.growth.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Receita Aprovada</span>
                  <span className={`font-semibold ${color.text}`}>{formatCurrency(data.approvedRevenue)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vendas Aprovadas</span>
                  <span className={`font-medium ${color.text}`}>{data.approvedSales}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio (Aprov.)</span>
                  <span className={`font-medium ${color.text}`}>{formatCurrency(data.avgTicketApproved)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pendente</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(data.pendingRevenue)} ({data.pendingSales})
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Taxa de Aprovação</span>
                    <span className={`font-medium ${color.text}`}>
                      {data.totalSales > 0 ? ((data.approvedSales / data.totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
