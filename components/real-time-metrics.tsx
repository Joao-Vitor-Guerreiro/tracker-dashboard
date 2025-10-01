"use client"

import { formatCurrency } from "@/lib/utils"
import { DollarSign, Package, TrendingUp, Globe, Percent } from "lucide-react"

interface RealTimeMetricsProps {
  myTotalRevenue: number
  myTotalSales: number
  myAvgTicket: number
  totalFilteredRevenue: number
  dailyConversionPct: number
  dailyPaidCount: number
  dailyTotalCount: number
  dateFilter: string
  recentlyUpdated: Set<string>
  isUpdating: boolean
}

export default function RealTimeMetrics({
  myTotalRevenue,
  myTotalSales,
  myAvgTicket,
  totalFilteredRevenue,
  dailyConversionPct,
  dailyPaidCount,
  dailyTotalCount,
  dateFilter,
  recentlyUpdated,
  isUpdating,
}: RealTimeMetricsProps) {
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

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    color,
    metricKey,
    subtitle,
  }: {
    icon: any
    title: string
    value: string
    color: string
    metricKey: string
    subtitle?: string
  }) => {
    return (
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MetricCard
        icon={DollarSign}
        title="Minha Receita Total"
        value={formatCurrency(myTotalRevenue)}
        color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        metricKey="revenue"
        subtitle={`${myTotalSales} vendas aprovadas`}
      />

      <MetricCard
        icon={Package}
        title="Minhas Vendas"
        value={myTotalSales.toString()}
        color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        metricKey="sales"
        subtitle="Vendas aprovadas (minhas)"
      />

      <MetricCard
        icon={TrendingUp}
        title="Meu Ticket Médio"
        value={formatCurrency(myAvgTicket)}
        color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        metricKey="avgTicket"
        subtitle="Baseado em vendas aprovadas"
      />

      <MetricCard
        icon={Percent}
        title="Conversão Diária"
        value={`${dailyConversionPct.toFixed(1)}%`}
        color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
        metricKey="dailyConversion"
        subtitle={`${dailyPaidCount}/${dailyTotalCount} pagos/gerados (Hoje)`}
      />

      <MetricCard
        icon={Globe}
        title={`Faturamento Total (${getPeriodText(dateFilter)})`}
        value={formatCurrency(totalFilteredRevenue)}
        color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        metricKey="totalRevenue"
        subtitle="Todas as vendas aprovadas"
      />
    </div>
  )
}
