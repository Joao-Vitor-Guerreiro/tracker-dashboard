"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import { Trophy, Medal, Award, TrendingUp, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Sale, Client } from "@/types"

interface ClientRankingProps {
  sales: Sale[] // Recebe vendas já filtradas por isVisible
  clients: Client[]
  title: string
}

export default function ClientRanking({ sales, clients, title }: ClientRankingProps) {
  const clientRanking = useMemo(() => {
    const clientMetrics: {
      [clientId: string]: {
        client: Client | null
        totalRevenue: number
        totalSales: number
        approvedRevenue: number
        approvedSales: number
        activeOffers: number
        totalOffers: number
        avgTicket: number
        topOffer: { name: string; revenue: number } | null
      }
    } = {}

    // Inicializar métricas para todos os clientes
    clients.forEach((client) => {
      clientMetrics[client.id] = {
        client,
        totalRevenue: 0,
        totalSales: 0,
        approvedRevenue: 0,
        approvedSales: 0,
        activeOffers: client.offers.filter((offer) => offer.useTax).length,
        totalOffers: client.offers.length,
        avgTicket: 0,
        topOffer: null,
      }
    })

    // Calcular métricas por oferta para encontrar a melhor de cada cliente
    const offerRevenues: { [offerId: string]: { revenue: number; name: string; clientId: string } } = {}

    // Calcular métricas baseadas nas vendas (já filtradas por isVisible)
    sales.forEach((sale) => {
      if (!clientMetrics[sale.clientId]) {
        clientMetrics[sale.clientId] = {
          client: null,
          totalRevenue: 0,
          totalSales: 0,
          approvedRevenue: 0,
          approvedSales: 0,
          activeOffers: 0,
          totalOffers: 0,
          avgTicket: 0,
          topOffer: null,
        }
      }

      const metric = clientMetrics[sale.clientId]
      metric.totalRevenue += sale.amount
      metric.totalSales += 1

      if (sale.approved) {
        metric.approvedRevenue += sale.amount
        metric.approvedSales += 1
      }

      // Rastrear receita por oferta
      if (!offerRevenues[sale.offerId]) {
        // Encontrar nome da oferta
        let offerName = "Oferta Desconhecida"
        for (const client of clients) {
          const offer = client.offers.find((o) => o.id === sale.offerId)
          if (offer) {
            offerName = offer.name
            break
          }
        }
        offerRevenues[sale.offerId] = {
          revenue: 0,
          name: offerName,
          clientId: sale.clientId,
        }
      }

      if (sale.approved) {
        offerRevenues[sale.offerId].revenue += sale.amount
      }
    })

    // Encontrar a melhor oferta de cada cliente
    Object.values(offerRevenues).forEach((offerData) => {
      const clientMetric = clientMetrics[offerData.clientId]
      if (clientMetric && (!clientMetric.topOffer || offerData.revenue > clientMetric.topOffer.revenue)) {
        clientMetric.topOffer = {
          name: offerData.name,
          revenue: offerData.revenue,
        }
      }
    })

    // Calcular ticket médio
    Object.values(clientMetrics).forEach((metric) => {
      metric.avgTicket = metric.approvedSales > 0 ? metric.approvedRevenue / metric.approvedSales : 0
    })

    return Object.values(clientMetrics)
      .filter((metric) => metric.approvedSales > 0) // Mostrar apenas clientes com vendas aprovadas
      .sort((a, b) => b.approvedRevenue - a.approvedRevenue) // Ordenar por receita aprovada
      .slice(0, 10) // Top 10
  }, [sales, clients])

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{position}</span>
          </div>
        )
    }
  }

  const getRankBadge = (position: number) => {
    switch (position) {
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
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        {clientRanking.map((metric, index) => {
          const position = index + 1
          const isTopPerformer = position === 1

          return (
            <div
              key={metric.client?.id || `unknown-${index}`}
              className={`relative rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
                isTopPerformer
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700"
                  : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Fire emoji for top performer */}
              {isTopPerformer && <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🔥</div>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank Position */}
                  <div className="flex flex-col items-center gap-1">
                    {getRankIcon(position)}
                    <Badge className={`text-xs px-2 py-1 ${getRankBadge(position)}`}>#{position}</Badge>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {metric.client?.name || "Cliente Desconhecido"}
                      </h4>
                      {isTopPerformer && (
                        <Badge className="bg-yellow-500 text-white text-xs font-bold px-2 py-1">TOP PERFORMER</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {metric.activeOffers} ofertas ativas de {metric.totalOffers}
                        </span>
                      </div>

                      {metric.topOffer && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Melhor: <span className="font-medium">{metric.topOffer.name}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receita</div>
                    <div
                      className={`text-xl font-bold ${isTopPerformer ? "text-yellow-600" : "text-green-600"} dark:text-green-400`}
                    >
                      {formatCurrency(metric.approvedRevenue)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Vendas</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{metric.approvedSales}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(metric.avgTicket)}
                    </div>
                  </div>

                  {metric.topOffer && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Melhor Oferta</div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {formatCurrency(metric.topOffer.revenue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for visual comparison */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isTopPerformer
                        ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                        : "bg-gradient-to-r from-blue-400 to-purple-500"
                    }`}
                    style={{
                      width: `${clientRanking.length > 0 ? (metric.approvedRevenue / clientRanking[0].approvedRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {clientRanking.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhum dado de ranking disponível</p>
          <p className="text-sm">Não há vendas aprovadas para o período selecionado</p>
        </div>
      )}
    </div>
  )
}
