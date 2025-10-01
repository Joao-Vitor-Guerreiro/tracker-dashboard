"use client"

import { useState, useMemo } from "react"
import { filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { useRealTimeSales, useRealTimeClients } from "@/hooks/use-real-time-data"
import RealTimeMetrics from "./real-time-metrics"
import RealTimeOfferRanking from "./real-time-offer-ranking"
import RealTimeSalesTable from "./real-time-sales-table"
import { TrendingUp } from "lucide-react"
import type { Sale } from "@/types"

interface BatchUpdate {
  timestamp: Date
  batchIndex: number
  newRecords: number
  totalRecords: number
  type: "sales" | "clients"
}

export default function RealTimeDashboard() {
  const { dateFilter } = useDateFilter()
  const [batchUpdates, setBatchUpdates] = useState<BatchUpdate[]>([])
  const [recentlyUpdatedMetrics, setRecentlyUpdatedMetrics] = useState<Set<string>>(new Set())

  const salesOptions = {
    onBatchUpdate: (batch: Sale[], allData: Sale[], batchIndex: number) => {
      const update: BatchUpdate = {
        timestamp: new Date(),
        batchIndex,
        newRecords: batch.length,
        totalRecords: allData.length,
        type: "sales",
      }

      setBatchUpdates((prev) => [...prev.slice(-9), update]) // Keep last 10 updates

      // Highlight updated metrics
      setRecentlyUpdatedMetrics(new Set(["sales", "revenue", "avgTicket"]))
      setTimeout(() => {
        setRecentlyUpdatedMetrics(new Set())
      }, 2000)
    },
    onProgress: (progress: { current: number; total: number; percentage: number }) => {
      // Real-time progress updates
    },
  }

  const clientsOptions = {
    onBatchUpdate: (batch: any[], allData: any[], batchIndex: number) => {
      const update: BatchUpdate = {
        timestamp: new Date(),
        batchIndex,
        newRecords: batch.length,
        totalRecords: allData.length,
        type: "clients",
      }

      setBatchUpdates((prev) => [...prev.slice(-9), update])

      // Highlight updated metrics
      setRecentlyUpdatedMetrics(new Set(["clients", "offers"]))
      setTimeout(() => {
        setRecentlyUpdatedMetrics(new Set())
      }, 1500)
    },
  }

  const salesData = useRealTimeSales(salesOptions)
  const clientsData = useRealTimeClients(clientsOptions)

  const visibleSales = useMemo(() => salesData.data.filter((sale) => sale.visible !== false), [salesData.data])

  const filteredSales = useMemo(() => filterSalesByDate(visibleSales, dateFilter), [visibleSales, dateFilter])

  // Calculate real-time metrics
  const myApprovedSales = filteredSales.filter((sale) => sale.approved && !sale.toClient)
  const myTotalRevenue = myApprovedSales.reduce((sum, sale) => sum + sale.amount, 0)
  const myTotalSales = myApprovedSales.length
  const myAvgTicket = myTotalSales > 0 ? myTotalRevenue / myTotalSales : 0

  const totalFilteredApprovedSales = filteredSales.filter((sale) => sale.approved)
  const totalFilteredRevenue = totalFilteredApprovedSales.reduce((sum, sale) => sum + sale.amount, 0)

  // Daily conversion: % of paid orders out of generated orders for today
  const todaySales = useMemo(() => filterSalesByDate(visibleSales, "today" as any), [visibleSales])
  const todayGeneratedCount = todaySales.length
  const todayPaidCount = todaySales.filter((sale) => sale.approved).length
  const dailyConversionPct = todayGeneratedCount > 0 ? (todayPaidCount / todayGeneratedCount) * 100 : 0

  const isLoading = salesData.isLoading || clientsData.isLoading
  const isLoadingMore = salesData.isLoadingMore || clientsData.isLoadingMore
  const isComplete = salesData.isComplete && clientsData.isComplete

  const combinedProgress = {
    current: salesData.progress.current + clientsData.progress.current,
    total: salesData.progress.total + clientsData.progress.total,
    percentage:
      salesData.progress.total + clientsData.progress.total > 0
        ? ((salesData.progress.current + clientsData.progress.current) /
            (salesData.progress.total + clientsData.progress.total)) *
          100
        : 0,
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <RealTimeMetrics
            myTotalRevenue={myTotalRevenue}
            myTotalSales={myTotalSales}
            myAvgTicket={myAvgTicket}
            totalFilteredRevenue={totalFilteredRevenue}
            dailyConversionPct={dailyConversionPct}
            dailyPaidCount={todayPaidCount}
            dailyTotalCount={todayGeneratedCount}
            dateFilter={dateFilter}
            recentlyUpdated={recentlyUpdatedMetrics}
            isUpdating={isLoadingMore}
          />
        </div>

        <div className="lg:col-span-2">
          <RealTimeOfferRanking
            sales={filteredSales}
            clients={clientsData.data}
            isUpdating={isLoadingMore}
            lastUpdate={salesData.lastUpdate}
          />
        </div>
      </div>

      {/* Real-time Sales Table */}
      <RealTimeSalesTable
        sales={salesData.data}
        clients={clientsData.data}
        isUpdating={isLoadingMore}
        batchCount={salesData.batchCount}
        lastUpdate={salesData.lastUpdate}
      />

      {/* Batch Update History */}
      {batchUpdates.length > 0 && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Histórico de Atualizações em Tempo Real
            </h3>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {batchUpdates
              .slice()
              .reverse()
              .map((update, index) => (
                <div
                  key={`${update.type}-${update.batchIndex}-${update.timestamp.getTime()}-${index}`}
                  className={`flex items-center justify-between text-xs p-2 rounded ${
                    index === 0
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                      : "bg-gray-50 dark:bg-gray-800/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${update.type === "sales" ? "bg-blue-500" : "bg-purple-500"}`}
                    />
                    <span className="font-medium">{update.type === "sales" ? "Vendas" : "Clientes"}</span>
                    <span className="text-gray-600 dark:text-gray-400">+{update.newRecords} registros</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Total: {update.totalRecords}</span>
                    <span className="text-gray-400 dark:text-gray-500">{update.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
