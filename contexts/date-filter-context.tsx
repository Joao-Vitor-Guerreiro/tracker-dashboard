"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { DateFilter } from "@/types"

interface DateFilterContextType {
  dateFilter: DateFilter
  setDateFilter: (filter: DateFilter) => void
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today") // Mudado de "7days" para "today"

  return <DateFilterContext.Provider value={{ dateFilter, setDateFilter }}>{children}</DateFilterContext.Provider>
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error("useDateFilter must be used within a DateFilterProvider")
  }
  return context
}
