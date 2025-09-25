"use client"

import { useMemo } from "react"
import { formatCurrency, filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { TrendingUp, Package, DollarSign, Globe } from "lucide-react"
import { useProgressiveSales } from "@/hooks/use-progressive-data"
import ProgressiveLoadingIndicator from "./progressive-loading-indicator"

export default function MetricsCharts() {
  const { dateFilter } = useDateFilter()
  const { data: sales, isLoading, isLoadingMore, isComplete, progress, error, refetch } = useProgressiveSales()

  const visibleSales = useMemo(() => sales.filter((sale) => sale.visible !== false), [sales])
  const filteredSales = useMemo(() => filterSalesByDate(visibleSales, dateFilter), [visibleSales, dateFilter])

  // Filtrar apenas vendas aprovadas que foram para o admin (toClient: false)
  const myApprovedSales = filteredSales.filter((sale) => sale.approved && !sale.toClient)

  // Calcular métricas das minhas vendas (período filtrado)
  const myTotalRevenue = myApprovedSales.reduce((sum, sale) => sum + sale.amount, 0)
  const myTotalSales = myApprovedSales.length
  const myAvgTicket = myTotalSales > 0 ? myTotalRevenue / myTotalSales : 0

  // Calcular faturamento TOTAL do período filtrado (todas as vendas aprovadas do período)
  const totalFilteredApprovedSales = filteredSales.filter((sale) => sale.approved)
  const totalFilteredRevenue = totalFilteredApprovedSales.reduce((sum, sale) => sum + sale.amount, 0)

  // Função para obter o texto do período baseado no filtro
  const getPeriodText = (filter: string) => {
    switch (filter) {
      case "today":
        return "Hoje"
      case "7days":
        return "7 Dias"
      case "30days":
        return "30 Dias"
      case "all":
        return "Todos os Períodos"
      default:
        return "Período"
    }
  }

  return (
    <div className="space-y-4">
      {/* Progressive Loading Indicator */}
      <ProgressiveLoadingIndicator
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isComplete={isComplete}
        progress={progress}
        error={error}
        className="mb-4"
      />

      {/* Minha Receita Total */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minha Receita Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(myTotalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Minhas Vendas */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minhas Vendas</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{myTotalSales}</p>
          </div>
        </div>
      </div>

      {/* Meu Ticket Médio */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Meu Ticket Médio</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(myAvgTicket)}</p>
          </div>
        </div>
      </div>

      {/* Faturamento Total Geral */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Faturamento Total ({getPeriodText(dateFilter)})</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalFilteredRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
