"use client"

import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Users2, TrendingUp, TrendingDown } from "lucide-react"
import type { Sale, Client } from "@/types"

interface ClientRevenueTableProps {
  sales: Sale[] // Recebe vendas já filtradas por isVisible
  clients: Client[]
  title: string
}

export default function ClientRevenueTable({ sales, clients, title }: ClientRevenueTableProps) {
  const clientMetrics = useMemo(() => {
    const metrics: {
      [clientId: string]: {
        client: Client | null
        totalRevenue: number
        totalSales: number
        approvedRevenue: number
        approvedSales: number
        pendingRevenue: number
        pendingSales: number
        avgTicket: number
      }
    } = {}

    // Inicializar métricas para todos os clientes
    clients.forEach((client) => {
      metrics[client.id] = {
        client,
        totalRevenue: 0,
        totalSales: 0,
        approvedRevenue: 0,
        approvedSales: 0,
        pendingRevenue: 0,
        pendingSales: 0,
        avgTicket: 0,
      }
    })

    // Calcular métricas baseadas nas vendas (já filtradas por isVisible)
    sales.forEach((sale) => {
      if (!metrics[sale.clientId]) {
        // Isso pode acontecer se uma venda tiver um clientId que não está na lista de clientes
        // Ou se a venda for de um cliente que não deveria estar aqui (improvável com filtro isVisible)
        metrics[sale.clientId] = {
          client: null, // Marcar como desconhecido se não encontrado
          totalRevenue: 0,
          totalSales: 0,
          approvedRevenue: 0,
          approvedSales: 0,
          pendingRevenue: 0,
          pendingSales: 0,
          avgTicket: 0,
        }
      }

      const metric = metrics[sale.clientId]
      metric.totalRevenue += sale.amount
      metric.totalSales += 1

      if (sale.approved) {
        metric.approvedRevenue += sale.amount
        metric.approvedSales += 1
      } else {
        metric.pendingRevenue += sale.amount
        metric.pendingSales += 1
      }

      metric.avgTicket = metric.approvedSales > 0 ? metric.approvedRevenue / metric.approvedSales : 0
    })

    return Object.values(metrics)
      .filter((metric) => metric.totalSales > 0) // Mostrar apenas clientes com alguma venda no período filtrado
      .sort((a, b) => b.approvedRevenue - a.approvedRevenue)
  }, [sales, clients])

  const totalRevenue = clientMetrics.reduce((sum, metric) => sum + metric.approvedRevenue, 0)

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3 mb-6">
        <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Receita Aprovada
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Vendas Aprovadas
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Ticket Médio (Aprov.)
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Pendente</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Participação
              </th>
            </tr>
          </thead>
          <tbody>
            {clientMetrics.map((metric, index) => {
              const participation = totalRevenue > 0 ? (metric.approvedRevenue / totalRevenue) * 100 : 0

              return (
                <tr
                  key={metric.client?.id || `unknown-${index}`}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {metric.client?.name || "Cliente Desconhecido"}
                      </div>
                      {metric.client?.useTax && (
                        <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Comissão Ativa
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(metric.approvedRevenue)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-gray-600 dark:text-gray-400">{metric.approvedSales}</span>
                      {metric.approvedSales > metric.pendingSales ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : metric.approvedSales < metric.pendingSales && metric.pendingSales > 0 ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(metric.avgTicket)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="space-y-1">
                      <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {formatCurrency(metric.pendingRevenue)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{metric.pendingSales} vendas</div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">{participation.toFixed(1)}%</div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 ml-auto">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${participation}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {clientMetrics.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum dado de cliente disponível para o período selecionado
          </div>
        )}
      </div>
    </div>
  )
}
