"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, RefreshCw } from "lucide-react"
import type { ProductCategory } from "@/types"

interface AnalyticsFiltersProps {
  onCategoryChange: (category: "all" | ProductCategory) => void
  onStatusChange: (status: "all" | "approved" | "pending") => void
  onRefresh: () => void
}

export default function AnalyticsFilters({ onCategoryChange, onStatusChange, onRefresh }: AnalyticsFiltersProps) {
  const [category, setCategory] = useState<"all" | ProductCategory>("all")
  const [status, setStatus] = useState<"all" | "approved" | "pending">("all")

  const handleCategoryChange = (value: "all" | ProductCategory) => {
    setCategory(value)
    onCategoryChange(value)
  }

  const handleStatusChange = (value: "all" | "approved" | "pending") => {
    setStatus(value)
    onStatusChange(value)
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23] mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
        </div>

        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
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

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="approved">Apenas pagos</SelectItem>
            <SelectItem value="pending">Apenas pendentes</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onRefresh} variant="outline" size="sm" className="ml-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  )
}
