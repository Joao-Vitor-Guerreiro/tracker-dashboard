import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProductCategory, DateFilter } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductCategory(productName: string): ProductCategory {
  const name = productName.toLowerCase()

  if (name.includes("bracelete")) {
    return "Pandora"
  }

  if (name.includes("ebook")) {
    return "PixDoMilhão"
  }

  if (name.includes("sandália") || name.includes("crocs") || name.includes("jibbitz")) {
    return "Crocs"
  }

  if (name.includes("kit labia")) {
    return "Sephora"
  }

  return "Outros"
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function filterSalesByDate(sales: any[], filter: DateFilter): any[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (filter) {
    case "today":
      return sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt)
        const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate())
        return saleDateOnly.getTime() === today.getTime()
      })

    case "7days":
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)
      return sales.filter((sale) => new Date(sale.createdAt) >= sevenDaysAgo)

    case "30days":
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      return sales.filter((sale) => new Date(sale.createdAt) >= thirtyDaysAgo)

    case "all":
    default:
      return sales
  }
}
