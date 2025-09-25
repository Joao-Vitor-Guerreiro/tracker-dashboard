"use client"

import { useState, useMemo } from "react"
import { toggleOfferUseTax } from "@/lib/api"
import { formatDate, formatCurrency, filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Users2,
  Package,
  ChevronDown,
  ChevronUp,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import type { Offer } from "@/types"
import { useProgressiveClients } from "@/hooks/use-progressive-data"
import ProgressiveLoadingIndicator from "../progressive-loading-indicator"

interface GroupedClient {
  baseName: string
  clients: any[]
  totalRevenue: number
  totalSales: number
  totalOffers: number
  activeOffers: number
}

export default function ClientsPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactiveOffers, setShowInactiveOffers] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(new Map())
  const { dateFilter } = useDateFilter()

  const {
    data: clients,
    isLoading: loading,
    isLoadingMore,
    isComplete,
    progress,
    error,
    refetch: refetchClients,
  } = useProgressiveClients()

  const handleToggleOfferUseTax = async (offerId: string, currentUseTax: boolean) => {
    setToggling(offerId)

    // Optimistic update
    const newUseTaxValue = !currentUseTax
    setOptimisticUpdates((prev) => new Map(prev).set(offerId, newUseTaxValue))

    try {
      const success = await toggleOfferUseTax(offerId, currentUseTax)

      if (success) {
        // Keep the optimistic update since it was successful
        console.log(`Successfully toggled offer ${offerId} to ${newUseTaxValue}`)
      } else {
        // Revert optimistic update on failure
        setOptimisticUpdates((prev) => {
          const newMap = new Map(prev)
          newMap.delete(offerId)
          return newMap
        })
        console.error(`Failed to toggle offer ${offerId}`)
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev)
        newMap.delete(offerId)
        return newMap
      })
      console.error(`Error toggling offer ${offerId}:`, error)
    } finally {
      setToggling(null)
    }
  }

  const toggleGroupExpansion = (baseName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(baseName)) newSet.delete(baseName)
      else newSet.add(baseName)
      return newSet
    })
  }

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clientId)) newSet.delete(clientId)
      else newSet.add(clientId)
      return newSet
    })
  }

  const getClientMetrics = (client: any) => {
    const filteredSales = filterSalesByDate(client.sales || [], dateFilter)
    const approvedSales = filteredSales.filter((sale: any) => sale.approved && sale.visible !== false)
    const totalRevenue = approvedSales.reduce((sum: number, sale: any) => sum + sale.amount, 0)
    const totalSales = approvedSales.length

    // Use optimistic updates for active offers count
    let activeOffers = 0
    client.offers.forEach((offer: any) => {
      const optimisticValue = optimisticUpdates.get(offer.id)
      const useTax = optimisticValue !== undefined ? optimisticValue : offer.useTax
      if (useTax) activeOffers++
    })

    return {
      totalRevenue,
      totalSales,
      activeOffers,
      totalOffers: client.offers.length,
      avgTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
    }
  }

  const getOfferMetrics = (offer: Offer) => {
    const filteredSales = filterSalesByDate(offer.sales || [], dateFilter)
    const approvedSales = filteredSales.filter((sale) => sale.approved && sale.visible !== false)
    const totalRevenue = approvedSales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalSales = approvedSales.length
    const pendingSales = filteredSales.filter((sale) => !sale.approved && sale.visible !== false).length
    return {
      totalRevenue,
      totalSales,
      pendingSales,
      avgTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
    }
  }

  const getBaseName = (name: string): string => name.replace(/\s*-\s*\d+$/, "").trim()

  const groupedClients = useMemo(() => {
    if (!clients.length) return []
    const groups: { [key: string]: any[] } = {}
    const filteredClients = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.offers.some((offer: any) => offer.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    filteredClients.forEach((client) => {
      const baseName = getBaseName(client.name)
      if (!groups[baseName]) groups[baseName] = []
      groups[baseName].push(client)
    })
    return Object.entries(groups)
      .map(([baseName, clientsInGroup]) => {
        const sortedClients = clientsInGroup.sort((a, b) => a.name.localeCompare(b.name))
        let totalRevenue = 0,
          totalSales = 0,
          totalOffers = 0,
          activeOffers = 0
        sortedClients.forEach((client) => {
          const metrics = getClientMetrics(client)
          totalRevenue += metrics.totalRevenue
          totalSales += metrics.totalSales
          totalOffers += metrics.totalOffers
          activeOffers += metrics.activeOffers
        })
        return { baseName, clients: sortedClients, totalRevenue, totalSales, totalOffers, activeOffers }
      })
      .sort((a, b) => a.baseName.localeCompare(b.baseName))
  }, [clients, searchTerm, dateFilter, optimisticUpdates])

  const totalClientsCount = clients.length
  const totalOffersCount = clients.reduce((sum, client) => sum + client.offers.length, 0)

  // Calculate active offers with optimistic updates
  const activeOffersCount = clients.reduce((sum, client) => {
    return (
      sum +
      client.offers.filter((offer: any) => {
        const optimisticValue = optimisticUpdates.get(offer.id)
        return optimisticValue !== undefined ? optimisticValue : offer.useTax
      }).length
    )
  }, 0)

  // Helper function to get the current useTax value (with optimistic updates)
  const getCurrentUseTax = (offer: any) => {
    const optimisticValue = optimisticUpdates.get(offer.id)
    return optimisticValue !== undefined ? optimisticValue : offer.useTax
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Clientes</h1>
        </div>
      </div>

      {/* Progressive Loading Indicator */}
      <ProgressiveLoadingIndicator
        isLoading={loading}
        isLoadingMore={isLoadingMore}
        isComplete={isComplete}
        progress={progress}
        error={error}
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalClientsCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ofertas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalOffersCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ofertas Ativas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{activeOffersCount}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes ou ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowInactiveOffers(!showInactiveOffers)}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            {showInactiveOffers ? "Ocultar Ofertas Inativas" : "Mostrar Ofertas Inativas"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {groupedClients.map((group) => {
          const isGroupExpanded = expandedGroups.has(group.baseName)
          const hasMultipleClients = group.clients.length > 1
          return (
            <div
              key={group.baseName}
              className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {hasMultipleClients ? (
                        <Users2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {group.baseName}
                        {hasMultipleClients && (
                          <Badge variant="secondary" className="text-xs">
                            {group.clients.length} contas
                          </Badge>
                        )}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {hasMultipleClients
                          ? `${group.clients.length} contas diferentes`
                          : `Criado em ${formatDate(group.clients[0].createdAt)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Receita (Período)</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(group.totalRevenue)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ofertas</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {group.activeOffers}/{group.totalOffers}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Vendas</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{group.totalSales}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroupExpansion(group.baseName)}
                      className="flex items-center gap-2"
                    >
                      {isGroupExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isGroupExpanded ? "Ocultar" : hasMultipleClients ? "Ver Contas" : "Ver Ofertas"}
                    </Button>
                  </div>
                </div>
              </div>
              {isGroupExpanded && (
                <div className="bg-gray-50 dark:bg-gray-800/30">
                  {group.clients.map((client, clientIndex) => {
                    const isClientExpanded = expandedClients.has(client.id)
                    const metrics = getClientMetrics(client)
                    const visibleOffers = showInactiveOffers
                      ? client.offers
                      : client.offers.filter((offer: any) => getCurrentUseTax(offer))
                    return (
                      <div
                        key={client.id}
                        className={clientIndex > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}
                      >
                        {hasMultipleClients && (
                          <div className="p-4 bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{client.name}</h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> {formatDate(client.createdAt)}
                                    </span>
                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {client.token.slice(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Receita</div>
                                  <div className="font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(metrics.totalRevenue)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Ofertas</div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {metrics.activeOffers}/{metrics.totalOffers}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleClientExpansion(client.id)}
                                  className="flex items-center gap-2"
                                >
                                  {isClientExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                  {isClientExpanded ? "Ocultar" : `Ver Ofertas (${client.offers.length})`}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        {(isClientExpanded || !hasMultipleClients) && (
                          <div className="p-6">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Package className="w-5 h-5" />
                              Ofertas {hasMultipleClients && `de ${client.name}`} ({visibleOffers.length})
                            </h5>
                            {visibleOffers.length > 0 ? (
                              <div className="grid gap-4">
                                {visibleOffers.map((offer: any) => {
                                  const offerMetrics = getOfferMetrics(offer)
                                  const currentUseTax = getCurrentUseTax(offer)
                                  const isToggling = toggling === offer.id

                                  return (
                                    <div
                                      key={offer.id}
                                      className="bg-white dark:bg-[#0F0F12] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                          </div>
                                          <div>
                                            <h6 className="font-semibold text-gray-900 dark:text-white">
                                              {offer.name}
                                            </h6>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formatDate(offer.createdAt)}
                                              </span>
                                              <Badge
                                                variant={currentUseTax ? "default" : "secondary"}
                                                className={`text-xs flex items-center gap-1 ${
                                                  currentUseTax
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                              >
                                                {currentUseTax ? (
                                                  <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                  <XCircle className="w-3 h-3" />
                                                )}
                                                {currentUseTax ? "Comissão Ativa" : "Comissão Inativa"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                              Receita (Período)
                                            </div>
                                            <div className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                                              <DollarSign className="w-3 h-3" />{" "}
                                              {formatCurrency(offerMetrics.totalRevenue)}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Vendas</div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                              {offerMetrics.totalSales}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Pendentes</div>
                                            <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                                              {offerMetrics.pendingSales}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Ticket Médio</div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                              {formatCurrency(offerMetrics.avgTicket)}
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-center gap-2">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Comissão</span>
                                            <div className="flex items-center gap-2">
                                              {isToggling ? (
                                                <div className="flex items-center gap-2">
                                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                  <span className="text-xs text-gray-500">Atualizando...</span>
                                                </div>
                                              ) : (
                                                <Switch
                                                  checked={currentUseTax}
                                                  onCheckedChange={() =>
                                                    handleToggleOfferUseTax(offer.id, currentUseTax)
                                                  }
                                                  className="data-[state=checked]:bg-green-500"
                                                  disabled={isToggling}
                                                />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0F0F12] rounded-lg border border-gray-200 dark:border-gray-700">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">
                                  {showInactiveOffers ? "Nenhuma oferta encontrada" : "Nenhuma oferta ativa encontrada"}
                                </p>
                                <p className="text-sm">
                                  {showInactiveOffers
                                    ? "Este cliente ainda não possui ofertas cadastradas"
                                    : "Ative as ofertas para visualizá-las aqui"}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {groupedClients.length === 0 && !loading && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-8 border border-gray-200 dark:border-[#1F1F23]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum cliente encontrado</p>
            <p className="text-sm">
              {searchTerm ? "Tente ajustar os termos de busca" : "Não há clientes cadastrados no sistema"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
