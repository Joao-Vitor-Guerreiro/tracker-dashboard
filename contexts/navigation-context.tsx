"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Page = "dashboard" | "analytics" | "clients" | "checkouts"

interface NavigationContextType {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  return <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
