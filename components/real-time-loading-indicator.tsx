"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, Users, Receipt, Clock, Zap } from "lucide-react"

interface RealTimeLoadingIndicatorProps {
  salesData: any
  clientsData: any
  batchUpdates: any[]
}

export default function RealTimeLoadingIndicator({
  salesData,
  clientsData,
  batchUpdates,
}: RealTimeLoadingIndicatorProps) {
  const combinedProgress = useMemo(() => {
    const totalCurrent = salesData.progress.current + clientsData.progress.current
    const totalMax = salesData.progress.total + clientsData.progress.total
    return {
      current: totalCurrent,
      total: totalMax,
      percentage: totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0,
    }
  }, [salesData.progress, clientsData.progress])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const isLoading = salesData.isLoading || clientsData.isLoading
  const isLoadingMore = salesData.isLoadingMore || clientsData.isLoadingMore
  const isComplete = salesData.isComplete && clientsData.isComplete

  if (!isLoading && !isLoadingMore && !isComplete) {
    return null
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {isLoadingMore && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status do Carregamento em Tempo Real
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isComplete && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Completo
              </Badge>
            )}
            {isLoadingMore && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <Zap className="w-3 h-3 mr-1 animate-pulse" />
                Carregando
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Vendas</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Carregadas</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {salesData.progress.current.toLocaleString()}
                </span>
              </div>
              <Progress value={salesData.progress.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Batches: {salesData.batchCount}</span>
                {salesData.estimatedTimeRemaining > 0 && (
                  <span>ETA: {formatTime(salesData.estimatedTimeRemaining)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Clientes</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Carregados</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {clientsData.progress.current.toLocaleString()}
                </span>
              </div>
              <Progress value={clientsData.progress.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Batches: {clientsData.batchCount}</span>
                {clientsData.estimatedTimeRemaining > 0 && (
                  <span>ETA: {formatTime(clientsData.estimatedTimeRemaining)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Progresso Total</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Registros</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {combinedProgress.current.toLocaleString()} / {combinedProgress.total.toLocaleString()}
                </span>
              </div>
              <Progress value={combinedProgress.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{combinedProgress.percentage.toFixed(1)}% completo</span>
                {(salesData.lastUpdate || clientsData.lastUpdate) && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(salesData.lastUpdate || clientsData.lastUpdate)?.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {salesData.getAverageBatchTime ? formatTime(salesData.getAverageBatchTime()) : "0ms"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tempo Médio/Batch</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{batchUpdates.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Atualizações</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {isComplete ? "100%" : `${combinedProgress.percentage.toFixed(1)}%`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Progresso</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {Math.max(salesData.estimatedTimeRemaining, clientsData.estimatedTimeRemaining) > 0
                ? formatTime(Math.max(salesData.estimatedTimeRemaining, clientsData.estimatedTimeRemaining))
                : "0s"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tempo Restante</div>
          </div>
        </div>
      </div>
    </div>
  )
}
