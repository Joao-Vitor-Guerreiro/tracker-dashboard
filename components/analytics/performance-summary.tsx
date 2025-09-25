"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import { Target, Calendar, TrendingUp, Award, CheckCircle } from "lucide-react"
import type { Sale } from "@/types"

interface PerformanceSummaryProps {
  sales: Sale[] // Recebe vendas já filtradas por visible pela AnalyticsPage
  title: string
}

export default function PerformanceSummary({ sales, title }: PerformanceSummaryProps) {
  const metrics = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // sales já devem estar filtradas por visible !== false pela AnalyticsPage
    const approvedSales = sales.filter((sale) => sale.approved)
    const allVisibleSales = sales // 'sales' já são as visíveis

    const todaySales = approvedSales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate())
      return saleDateOnly.getTime() === today.getTime()
    })

    const thisWeekSales = approvedSales.filter((sale) => new Date(sale.createdAt) >= thisWeekStart)
    const thisMonthSales = approvedSales.filter((sale) => new Date(sale.createdAt) >= thisMonthStart)
    const lastMonthSales = approvedSales.filter(
      (sale) => new Date(sale.createdAt) >= lastMonthStart && new Date(sale.createdAt) <= lastMonthEnd,
    )

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount, 0)
    const thisWeekRevenue = thisWeekSales.reduce((sum, sale) => sum + sale.amount, 0)
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0)
    const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.amount, 0)

    const monthlyGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0

    const totalVisibleSalesCount = allVisibleSales.length
    const conversionRate = totalVisibleSalesCount > 0 ? (approvedSales.length / totalVisibleSalesCount) * 100 : 0

    const dayRevenue: { [key: number]: number } = {}
    approvedSales.forEach((sale) => {
      const day = new Date(sale.createdAt).getDay()
      dayRevenue[day] = (dayRevenue[day] || 0) + sale.amount
    })

    const bestDayEntry = Object.entries(dayRevenue).reduce(
      (best, [day, revenue]) => (revenue > best.revenue ? { day: Number.parseInt(day), revenue } : best),
      { day: 0, revenue: 0 },
    )

    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

    const monthlyGoal =
      lastMonthRevenue > 0 ? lastMonthRevenue * 1.5 : thisMonthRevenue > 0 ? thisMonthRevenue * 1.2 : 1000000
    const goalProgress = monthlyGoal > 0 ? (thisMonthRevenue / monthlyGoal) * 100 : 0

    const currentDayOfMonth = now.getDate()

    return {
      todayRevenue,
      todaySalesCount: todaySales.length,
      thisWeekRevenue,
      thisWeekSalesCount: thisWeekSales.length,
      thisMonthRevenue,
      thisMonthSalesCount: thisMonthSales.length,
      monthlyGrowth,
      conversionRate,
      bestDayName: dayNames[bestDayEntry.day],
      bestDayRevenue: bestDayEntry.revenue,
      monthlyGoal,
      goalProgress: Math.min(goalProgress, 100),
      avgDailyRevenueThisMonth: currentDayOfMonth > 0 ? thisMonthRevenue / currentDayOfMonth : 0,
    }
  }, [sales])

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Hoje</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(metrics.todayRevenue)}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{metrics.todaySalesCount} vendas</p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Esta Semana</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(metrics.thisWeekRevenue)}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">{metrics.thisWeekSalesCount} vendas</p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Este Mês</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(metrics.thisMonthRevenue)}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">{metrics.thisMonthSalesCount} vendas</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3 h-3 ${metrics.monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"}`} />
              <span className={`text-xs font-medium ${metrics.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {metrics.monthlyGrowth >= 0 ? "+" : ""}
                {metrics.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Meta Mensal</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {metrics.goalProgress.toFixed(1)}%
            </p>
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.goalProgress}%` }}
              />
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">Meta: {formatCurrency(metrics.monthlyGoal)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-teal-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.conversionRate.toFixed(1)}%</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão (Aprovadas)</p>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.avgDailyRevenueThisMonth)}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Receita Média Diária (Mês)</p>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.bestDayName}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Melhor Dia ({formatCurrency(metrics.bestDayRevenue)})
          </p>
        </div>
      </div>
    </div>
  )
}
