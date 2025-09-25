"use client"

import { useState, useMemo } from "react"
import { filterSalesByDate, getProductCategory } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import AnalyticsFilters from "./analytics-filters"
import BarChart from "./bar-chart"
import PieChart from "./pie-chart"
import LineChart from "./line-chart"
import ClientRanking from "./client-ranking"
import CategoryMetrics from "./category-metrics"
import AdminRevenueMetrics from "./admin-revenue-metrics"
import PerformanceSummary from "./performance-summary"
import { TrendingUp } from "lucide-react"
import type { ProductCategory } from "@/types"
import { useProgressiveSales, useProgressiveClients } from "@/hooks/use-progressive-data"
import ProgressiveLoadingIndicator from "../progressive-loading-indicator"

export default function AnalyticsPage() {
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const { dateFilter } = useDateFilter()

  const {
    data: sales,
    isLoading: isLoadingSales,
    isLoadingMore: isLoadingMoreSales,
    isComplete: isCompleteSales,
    progress: progressSales,
    error: errorSales,
    refetch: refetchSales,
  } = useProgressiveSales()

  const {
    data: clients,
    isLoading: isLoadingClients,
    isLoadingMore: isLoadingMoreClients,
    isComplete: isCompleteClients,
    progress: progressClients,
    error: errorClients,
    refetch: refetchClients,
  } = useProgressiveClients()

  const loading = isLoadingSales || isLoadingClients
  const isLoadingMore = isLoadingMoreSales || isLoadingMoreClients
  const isComplete = isCompleteSales && isCompleteClients
  const error = errorSales || errorClients
  const progress = {
    current: progressSales.current + progressClients.current,
    total: progressSales.total + progressClients.total,
  }

  const handleRefresh = () => {
    refetchSales()
    refetchClients()
  }

  const filteredSales = useMemo(() => {
    if (!sales.length) return []
    const preFiltered = sales.filter((sale) => sale.visible !== false)
    let filteredByDate = filterSalesByDate(preFiltered, dateFilter)

    if (categoryFilter !== "all") {
      filteredByDate = filteredByDate.filter((sale) => getProductCategory(sale.productName) === categoryFilter)
    }

    if (statusFilter !== "all") {
      filteredByDate = filteredByDate.filter((sale) => {
        if (statusFilter === "approved") return sale.approved
        if (statusFilter === "pending") return !sale.approved
        return true
      })
    }
    return filteredByDate.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [sales, dateFilter, categoryFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      </div>

      <AnalyticsFilters
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onRefresh={handleRefresh}
      />

      {/* Progressive Loading Indicator */}
      <ProgressiveLoadingIndicator
        isLoading={loading}
        isLoadingMore={isLoadingMore}
        isComplete={isComplete}
        progress={progress}
        error={error}
        className="mb-6"
      />

      <PerformanceSummary sales={filteredSales} title="Resumo de Performance" />
      <AdminRevenueMetrics sales={filteredSales} title="Análise de Receita" />
      <CategoryMetrics sales={filteredSales} title="Performance por Categoria" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart sales={filteredSales} title="Receita por Dia (Últimos 7 dias)" />
        <PieChart sales={filteredSales} title="Distribuição por Categoria" />
      </div>
      <LineChart sales={filteredSales} title="Tendência de Vendas (Últimos 14 dias)" />
      <ClientRanking sales={filteredSales} clients={clients} title="🏆 Ranking de Performance dos Clientes" />
    </div>
  )
}
