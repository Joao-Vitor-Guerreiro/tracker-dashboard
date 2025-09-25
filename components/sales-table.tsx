"use client"

import { useState, useEffect, useMemo } from "react"
import { formatCurrency, formatDateTime, getProductCategory, filterSalesByDate } from "@/lib/utils"
import { useDateFilter } from "@/contexts/date-filter-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Receipt, CheckCircle, Clock, Search, Filter } from "lucide-react"
import type { ProductCategory } from "@/types"
import { useProgressiveSales, useProgressiveClients } from "@/hooks/use-progressive-data"
import ProgressiveLoadingIndicator from "./progressive-loading-indicator"

const ITEMS_PER_PAGE = 10

export default function SalesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all")
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

  const loading = isLoadingSales || isLoadingClients
  const isLoadingMore = isLoadingMoreSales || isLoadingMoreClients
  const isComplete = isCompleteSales && isCompleteClients
  const error = errorSales || errorClients
  const progress = {
    current: progressSales.current + progressClients.current,
    total: progressSales.total + progressClients.total,
  }

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

  const filteredSales = useMemo(() => {
    if (!sales.length) return []
    const preFiltered = sales.filter((sale) => sale.visible !== false)
    let filteredByDate = filterSalesByDate(preFiltered, dateFilter)

    if (searchTerm) {
      filteredByDate = filteredByDate.filter(
        (sale) =>
          sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getClientName(sale.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getOfferName(sale.offerId).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filteredByDate = filteredByDate.filter((sale) => {
        if (statusFilter === "approved") return sale.approved
        if (statusFilter === "pending") return !sale.approved
        return true
      })
    }

    if (categoryFilter !== "all") {
      filteredByDate = filteredByDate.filter((sale) => getProductCategory(sale.productName) === categoryFilter)
    }

    return filteredByDate.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [sales, clients, dateFilter, searchTerm, statusFilter, categoryFilter])

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

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Vendas ({filteredSales.length})
        </h2>
      </div>

      {/* Progressive Loading Indicator */}
      <ProgressiveLoadingIndicator
        isLoading={loading}
        isLoadingMore={isLoadingMore}
        isComplete={isComplete}
        progress={progress}
        error={error}
        className="mb-4"
      />

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
            {filteredSales.length} de {sales.filter((s) => s.visible !== false).length} vendas visíveis
          </span>
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
            {paginatedSales.map((sale) => (
              <tr
                key={sale.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{sale.productName}</div>
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
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(sale.amount)}</span>
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
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{formatDateTime(sale.createdAt)}</td>
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
            ))}
          </tbody>
        </table>

        {paginatedSales.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma venda encontrada para os filtros selecionados
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredSales.length)} de{" "}
            {filteredSales.length} vendas
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
