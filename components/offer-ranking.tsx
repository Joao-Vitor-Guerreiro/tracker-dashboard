"use client"

import { useMemo } from "react"
import { formatCurrency, filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { Trophy, Medal, Award, ArrowRight, Package, DollarSign } from "lucide-react"
import { useProgressiveSales, useProgressiveClients } from "@/hooks/use-progressive-data"
import ProgressiveLoadingIndicator from "./progressive-loading-indicator"

interface OfferRankingProps {
  className?: string
}

interface OfferRankingItem {
  offerId: string
  offerName: string
  clientId: string
  clientName: string
  totalRevenue: number
  adminRevenue: number
  totalSales: number
  adminSales: number
  rank: number
}

export default function OfferRanking({ className }: OfferRankingProps) {
  const { dateFilter } = useDateFilter()

  const {
    data: sales,
    isLoading: isLoadingSales,
    isLoadingMore: isLoadingMoreSales,
    isComplete: isCompleteSales,
    progress: progressSales,
    error: errorSales,
  } = useProgressiveSales()

  const {
    data: clients,
    isLoading: isLoadingClients,
    isLoadingMore: isLoadingMoreClients,
    isComplete: isCompleteClients,
    progress: progressClients,
    error: errorClients,
  } = useProgressiveClients()

  const isLoading = isLoadingSales || isLoadingClients
  const isLoadingMore = isLoadingMoreSales || isLoadingMoreClients
  const isComplete = isCompleteSales && isCompleteClients
  const error = errorSales || errorClients
  const progress = {
    current: progressSales.current + progressClients.current,
    total: progressSales.total + progressClients.total,
  }

  const getOfferInfo = (offerId: string) => {
    for (const client of clients) {
      const offer = client.offers.find((o) => o.id === offerId)
      if (offer) {
        return {
          name: offer.name,
          clientId: client.id,
          clientName: client.name,
        }
      }
    }
    return {
      name: "Oferta Desconhecida",
      clientId: "",
      clientName: "Cliente Desconhecido",
    }
  }

  const rankingData = useMemo(() => {
    if (!sales.length || !clients.length) return []

    const filteredSales = filterSalesByDate(
      sales.filter((sale) => sale.visible !== false),
      dateFilter,
    )
    const approvedSales = filteredSales.filter((sale) => sale.approved)

    const offerData: { [offerId: string]: OfferRankingItem } = {}

    approvedSales.forEach((sale) => {
      if (!offerData[sale.offerId]) {
        const offerInfo = getOfferInfo(sale.offerId)
        offerData[sale.offerId] = {
          offerId: sale.offerId,
          offerName: offerInfo.name,
          clientId: offerInfo.clientId,
          clientName: offerInfo.clientName,
          totalRevenue: 0,
          adminRevenue: 0,
          totalSales: 0,
          adminSales: 0,
          rank: 0,
        }
      }
      const offer = offerData[sale.offerId]
      offer.totalRevenue += sale.amount
      offer.totalSales += 1
      if (!sale.toClient) {
        offer.adminRevenue += sale.amount
        offer.adminSales += 1
      }
    })

    return Object.values(offerData)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .slice(0, 10)
  }, [sales, clients, dateFilter])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{rank}</span>
          </div>
        )
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div
      className={`w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm backdrop-blur-xl ${className}`}
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Ranking de Ofertas por Faturamento
            <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400 ml-1">(Top 10)</span>
          </h2>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {dateFilter === "all" ? "Todos os períodos" : "Período atual"}
          </span>
        </div>

        {/* Progressive Loading Indicator */}
        <ProgressiveLoadingIndicator
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          isComplete={isComplete}
          progress={progress}
          error={error}
        />
      </div>

      <div className="space-y-2 p-3">
        {rankingData.map((item) => {
          const isTopPerformer = item.rank === 1
          const adminPercentage = item.totalRevenue > 0 ? (item.adminRevenue / item.totalRevenue) * 100 : 0

          return (
            <div
              key={item.offerId}
              className={`relative rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
                isTopPerformer
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700"
                  : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              {isTopPerformer && <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🔥</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    {getRankIcon(item.rank)}
                    <div className={`text-xs px-2 py-1 rounded-full font-bold ${getRankBadge(item.rank)}`}>
                      #{item.rank}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{item.offerName}</h3>
                        {isTopPerformer && (
                          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            TOP OFERTA
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <span className="text-zinc-600 dark:text-zinc-400">Cliente:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{item.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">{item.totalSales} vendas totais</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <span className="text-lg">💰</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Faturamento Total</span>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        isTopPerformer ? "text-yellow-600" : "text-green-600"
                      } dark:text-green-400`}
                    >
                      {formatCurrency(item.totalRevenue)}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-zinc-300 dark:bg-zinc-600"></div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <span className="text-lg">🤑</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Seu Faturamento</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.adminRevenue)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {adminPercentage.toFixed(1)}% do total • {item.adminSales} vendas
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Distribuição de Faturamento</span>
                  <span>
                    Cliente: {(((item.totalRevenue - item.adminRevenue) / item.totalRevenue) * 100 || 0).toFixed(1)}% |
                    Você: {adminPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500"
                      style={{ width: `${100 - adminPercentage}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500"
                      style={{ width: `${adminPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {rankingData.length === 0 && !isLoading && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhuma oferta com vendas</p>
          <p className="text-sm">Não há dados de vendas para exibir o ranking no período selecionado</p>
        </div>
      )}

      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-50 dark:to-zinc-200 text-zinc-50 dark:text-zinc-900 hover:from-zinc-800 hover:to-zinc-700 dark:hover:from-zinc-200 dark:hover:to-zinc-300 shadow-sm hover:shadow transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Ver Ranking Completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
