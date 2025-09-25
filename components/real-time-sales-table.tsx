"use client"

import { useState, useEffect, useMemo } from "react"
import { formatCurrency, formatDateTime, getProductCategory, filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, CheckCircle, Clock, Search, Filter, Zap, DollarSign } from "lucide-react"
import type { Sale, Client, ProductCategory } from "@/types"

interface RealTimeSalesTableProps {
  sales: Sale[]
  clients: Client[]
  isUpdating: boolean
  batchCount: number
  lastUpdate: Date | null
}

const ITEMS_PER_PAGE = 10

export default function RealTimeSalesTable({
  sales,
  clients,
  isUpdating,
  batchCount,
  lastUpdate,
}: RealTimeSalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all")
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set())
  const { dateFilter } = useDateFilter()

  // Track newly added sales for highlighting
  useEffect(() => {
    if (sales.length > 0) {
      const latestSales = sales.slice(0, 5) // Assume latest 5 are new
      const newIds = new Set(latestSales.map((sale) => sale.id))
      setRecentlyAddedIds(newIds)

      // Remove highlighting after 3 seconds
      const timer = setTimeout(() => {
        setRecentlyAddedIds(new Set())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [batchCount])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter, dateFilter])

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Cliente Desconhecido"
  }

  const getOfferName = (offerId: string) => {
    for (const client of clients) {
      const offer = client.offers.find((o) => o.id === offerId)
      if (offer) return offer.name
    }
    return "Oferta Desconhecida"
  }

  // First filter sales by visibility
  const visibleSales = useMemo(() => {
    return sales.filter((sale) => sale.visible !== false)
  }, [sales])

  // Then filter by date
  const dateFilteredSales = useMemo(() => {
    return filterSalesByDate(visibleSales, dateFilter)
  }, [visibleSales, dateFilter])

  // Then apply other filters (search, status, category)
  const filteredSales = useMemo(() => {
    let result = dateFilteredSales

    if (searchTerm) {
      result = result.filter(
        (sale) =>
          sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getClientName(sale.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getOfferName(sale.offerId).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((sale) => {
        if (statusFilter === "approved") return sale.approved
        if (statusFilter === "pending") return !sale.approved
        return true
      })
    }

    if (categoryFilter !== "all") {
      result = result.filter((sale) => getProductCategory(sale.productName) === categoryFilter)
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [dateFilteredSales, searchTerm, statusFilter, categoryFilter])

  // Calculate metrics based on date-filtered sales
  const metrics = useMemo(() => {
    const total = dateFilteredSales.length
    const approved = dateFilteredSales.filter((sale) => sale.approved).length
    const pending = dateFilteredSales.filter((sale) => !sale.approved)
    const pendingCount = pending.length
    const pendingValue = pending.reduce((sum, sale) => sum + sale.amount, 0)

    return {
      total,
      approved,
      pendingCount,
      pendingValue,
    }
  }, [dateFilteredSales])

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSales = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const getStatusIcon = (approved: boolean) => {
    if (approved) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Clock className="w-4 h-4 text-yellow-500" />
  }

  const getCategoryColor = (productName: string) => {
    const category = getProductCategory(productName)
    switch (category) {
      case "Crocs":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Sephora":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "Pandora":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
      case "PixDoMilhão":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Get period text for display
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

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Receipt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {isUpdating && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Vendas em Tempo Real ({filteredSales.length})
          </h2>
          {isUpdating && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <Zap className="w-3 h-3 mr-1 animate-pulse" />
              Atualizando
            </Badge>
          )}
        </div>

        {lastUpdate && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produto, cliente, oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="approved">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="Crocs">Crocs</SelectItem>
            <SelectItem value="Sephora">Sephora</SelectItem>
            <SelectItem value="Pandora">Pandora</SelectItem>
            <SelectItem value="PixDoMilhão">PixDoMilhão</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span>
            {filteredSales.length} de {dateFilteredSales.length} vendas ({getPeriodText(dateFilter)})
          </span>
        </div>
      </div>

      {/* Real-time stats - now filtered by date */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Qtd. Pendentes</span>
          </div>
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{metrics.pendingCount}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Receipt className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Total</span>
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{metrics.total}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Aprovadas</span>
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{metrics.approved}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Valor Pendente</span>
          </div>
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(metrics.pendingValue)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Produto</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Vendedor</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Oferta</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Valor</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Data</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Destino</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale) => {
              const isRecentlyAdded = recentlyAddedIds.has(sale.id)

              return (
                <tr
                  key={sale.id}
                  className={`border-b border-gray-100 dark:border-gray-800 transition-all duration-500 ${
                    isRecentlyAdded
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 animate-pulse"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      <div
                        className={`font-medium text-gray-900 dark:text-white text-sm transition-all duration-300 ${
                          isRecentlyAdded ? "font-bold" : ""
                        }`}
                      >
                        {sale.productName}
                        {isRecentlyAdded && (
                          <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            NOVO
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getCategoryColor(sale.productName)}`}>
                        {getProductCategory(sale.productName)}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{sale.customerName}</td>
                  <td className="py-3 px-2">
                    <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
                      {getClientName(sale.clientId)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-medium text-sm text-purple-600 dark:text-purple-400">
                      {getOfferName(sale.offerId)}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`font-medium text-gray-900 dark:text-white transition-all duration-300 ${
                        isRecentlyAdded ? "text-green-600 dark:text-green-400 font-bold" : ""
                      }`}
                    >
                      {formatCurrency(sale.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sale.approved)}
                      <Badge
                        variant={sale.approved ? "default" : "secondary"}
                        className={`text-xs ${
                          sale.approved
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {sale.approved ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(sale.createdAt)}
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        sale.toClient
                          ? "border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-400"
                          : "border-orange-200 text-orange-800 dark:border-orange-700 dark:text-orange-400"
                      }`}
                    >
                      {sale.toClient ? "Cliente" : "Admin"}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {paginatedSales.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isUpdating ? (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" />
                <span>Carregando vendas em tempo real...</span>
              </div>
            ) : (
              "Nenhuma venda encontrada para os filtros selecionados"
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredSales.length)} de{" "}
            {filteredSales.length} vendas
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
