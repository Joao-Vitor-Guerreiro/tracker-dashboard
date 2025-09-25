"use client"

import { useDateFilter } from "@/contexts/date-filter-context"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import type { DateFilter } from "@/types"

const filterOptions: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "7 dias" },
  { value: "30days", label: "30 dias" },
  { value: "all", label: "Todos" },
]

export default function DateFilterComponent() {
  const { dateFilter, setDateFilter } = useDateFilter()

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900/70 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={dateFilter === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setDateFilter(option.value)}
          className={`text-xs transition-all duration-200 ${
            dateFilter === option.value
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
