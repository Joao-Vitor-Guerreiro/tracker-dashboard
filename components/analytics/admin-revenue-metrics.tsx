"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react"
import type { Sale } from "@/types"

interface AdminRevenueMetricsProps {
  sales: Sale[] // Recebe vendas já filtradas por isVisible
  title: string
}

export default function AdminRevenueMetrics({ sales, title }: AdminRevenueMetricsProps) {
  const metrics = useMemo(() => {
    let adminRevenue = 0 // Vendas que foram para o admin (toClient: false)
    let clientRevenue = 0 // Vendas que foram para clientes (toClient: true)
    let totalCommission = 0 // Total de comissões (estimativa)
    let adminSalesCount = 0
    let clientSalesCount = 0

    // Separar por período para calcular crescimento (baseado em vendas aprovadas)
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const approvedSales = sales.filter((s) => s.approved)

    const currentMonthApprovedSales = approvedSales.filter((sale) => new Date(sale.createdAt) >= currentMonthStart)
    const lastMonthApprovedSales = approvedSales.filter(
      (sale) => new Date(sale.createdAt) >= lastMonthStart && new Date(sale.createdAt) <= lastMonthEnd,
    )

    // Calcular métricas atuais (baseado em vendas aprovadas)
    approvedSales.forEach((sale) => {
      if (sale.toClient) {
        clientRevenue += sale.amount
        clientSalesCount += 1
        // Assumindo 10% de comissão para vendas de clientes
        totalCommission += sale.amount * 0.1
      } else {
        adminRevenue += sale.amount
        adminSalesCount += 1
      }
    })

    // Calcular crescimento mensal
    const currentMonthAdminRevenue = currentMonthApprovedSales
      .filter((sale) => !sale.toClient)
      .reduce((sum, sale) => sum + sale.amount, 0)

    const lastMonthAdminRevenue = lastMonthApprovedSales
      .filter((sale) => !sale.toClient)
      .reduce((sum, sale) => sum + sale.amount, 0)

    const adminGrowth =
      lastMonthAdminRevenue > 0
        ? ((currentMonthAdminRevenue - lastMonthAdminRevenue) / lastMonthAdminRevenue) * 100
        : currentMonthAdminRevenue > 0
          ? 100
          : 0

    const currentMonthClientRevenue = currentMonthApprovedSales
      .filter((sale) => sale.toClient)
      .reduce((sum, sale) => sum + sale.amount, 0)

    const lastMonthClientRevenue = lastMonthApprovedSales
      .filter((sale) => sale.toClient)
      .reduce((sum, sale) => sum + sale.amount, 0)

    const clientGrowth =
      lastMonthClientRevenue > 0
        ? ((currentMonthClientRevenue - lastMonthClientRevenue) / lastMonthClientRevenue) * 100
        : currentMonthClientRevenue > 0
          ? 100
          : 0

    return {
      adminRevenue,
      clientRevenue,
      totalCommission,
      adminSalesCount,
      clientSalesCount,
      totalRevenue: adminRevenue + clientRevenue,
      adminGrowth,
      clientGrowth,
      adminAvgTicket: adminSalesCount > 0 ? adminRevenue / adminSalesCount : 0,
      clientAvgTicket: clientSalesCount > 0 ? clientRevenue / clientSalesCount : 0,
    }
  }, [sales])

  const cards = [
    {
      title: "Minha Receita",
      value: formatCurrency(metrics.adminRevenue),
      subtitle: `${metrics.adminSalesCount} vendas`,
      growth: metrics.adminGrowth,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Receita dos Clientes",
      value: formatCurrency(metrics.clientRevenue),
      subtitle: `${metrics.clientSalesCount} vendas`,
      growth: metrics.clientGrowth,
      icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Comissões Estimadas",
      value: formatCurrency(metrics.totalCommission),
      subtitle: "10% das vendas de clientes",
      growth: metrics.clientGrowth,
      icon: CreditCard,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Receita Total (Aprovada)",
      value: formatCurrency(metrics.totalRevenue),
      subtitle: `${metrics.adminSalesCount + metrics.clientSalesCount} vendas`,
      growth: (metrics.adminGrowth + metrics.clientGrowth) / 2,
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ]

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className={`${card.bg} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-3 h-3 ${card.growth >= 0 ? "text-green-500" : "text-red-500"}`} />
                <span className={`text-xs font-medium ${card.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {card.growth >= 0 ? "+" : ""}
                  {card.growth.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</h4>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detalhes Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Análise de Performance (Aprovadas)</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio (Minhas Vendas)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(metrics.adminAvgTicket)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio (Clientes)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(metrics.clientAvgTicket)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Comissão</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">10%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Distribuição de Vendas (Aprovadas)</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Vendas Próprias</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {((metrics.adminSalesCount / (metrics.adminSalesCount + metrics.clientSalesCount)) * 100 || 0).toFixed(
                  1,
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Vendas de Clientes</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {((metrics.clientSalesCount / (metrics.adminSalesCount + metrics.clientSalesCount)) * 100 || 0).toFixed(
                  1,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-l-full"
                style={{
                  width: `${(metrics.adminSalesCount / (metrics.adminSalesCount + metrics.clientSalesCount)) * 100 || 0}%`,
                }}
              />
              <div
                className="bg-blue-500 h-2 rounded-r-full"
                style={{
                  width: `${(metrics.clientSalesCount / (metrics.adminSalesCount + metrics.clientSalesCount)) * 100 || 0}%`,
                  marginLeft: `${(metrics.adminSalesCount / (metrics.adminSalesCount + metrics.clientSalesCount)) * 100 || 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
