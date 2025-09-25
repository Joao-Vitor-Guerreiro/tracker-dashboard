import type { Client, Sale, Checkout } from "@/types"

const BASE_URL = "https://host.pauloenterprise.com.br"

interface PaginationParams {
  page?: number
  limit?: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Progressive loading callback types
export interface ProgressiveLoadingCallbacks<T> {
  onInitialData?: (data: T[]) => void
  onDataUpdate?: (newData: T[], totalData: T[]) => void
  onComplete?: (allData: T[]) => void
  onError?: (error: Error) => void
  onProgress?: (current: number, total: number) => void
}

export async function getClients(params: PaginationParams = {}): Promise<Client[]> {
  try {
    const { page = 1, limit = 50 } = params
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`${BASE_URL}/clients?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch clients")

    const data = await response.json()

    // Verificar se a resposta tem estrutura paginada
    if (data.data && Array.isArray(data.data)) {
      return data.data as Client[]
    }

    // Fallback para API sem paginação
    return data as Client[]
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getSales(params: PaginationParams = {}): Promise<Sale[]> {
  try {
    const { page = 1, limit = 100 } = params
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`${BASE_URL}/sales?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch sales")

    const data = await response.json()

    let salesData: any[]

    // Verificar se a resposta tem estrutura paginada
    if (data.data && Array.isArray(data.data)) {
      salesData = data.data
    } else {
      // Fallback para API sem paginação
      salesData = data
    }

    return salesData.map((saleItem) => {
      const processedSale = { ...saleItem }

      // Processar visible
      if (typeof processedSale.visible === "string") {
        processedSale.visible = processedSale.visible.toLowerCase() !== "false"
      } else if (processedSale.visible === null || typeof processedSale.visible === "undefined") {
        processedSale.visible = true
      }

      // Regra de negócio para BurgerLab: se o produto contém "BurgerLab" no nome e é para cliente, multiplicar amount por 100
      if (
        processedSale.productName &&
        processedSale.productName.toLowerCase().includes("burgerlab") &&
        processedSale.toClient === true
      ) {
        processedSale.amount = processedSale.amount * 100
        console.log(
          `BurgerLab product detected for client: ${processedSale.productName}, amount multiplied by 100: ${processedSale.amount}`,
        )
      }

      return processedSale as Sale
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return []
  }
}

// Checkout API functions
export async function getAllCheckouts(): Promise<Checkout[]> {
  try {
    const response = await fetch(`${BASE_URL}/checkout`)
    if (!response.ok) throw new Error("Failed to fetch checkouts")

    const data = await response.json()

    // Verificar se a resposta tem estrutura paginada
    if (data.data && Array.isArray(data.data)) {
      return data.data as Checkout[]
    }

    // Fallback para API sem paginação
    return data as Checkout[]
  } catch (error) {
    console.error("Error fetching checkouts:", error)
    return []
  }
}

export async function updateCheckout(checkoutId: string, myCheckout: string, offer: string): Promise<boolean> {
  try {
    console.log(`[API] Attempting to update checkout ${checkoutId} with new myCheckout: ${myCheckout}`)

    const response = await fetch(`${BASE_URL}/checkout/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout: myCheckout,
        offer: offer,
      }),
    })

    console.log(`[API] Response status for updateCheckout (${checkoutId}): ${response.status}`)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[API] Error (${response.status}) for updateCheckout (${checkoutId}): ${errorBody}`)
    }
    return response.ok
  } catch (error) {
    console.error(`[API] Network or other error in updateCheckout for checkoutId ${checkoutId}:`, error)
    return false
  }
}

// Progressive loading for sales with immediate first page display
export async function getAllSalesProgressive(callbacks?: ProgressiveLoadingCallbacks<Sale>): Promise<Sale[]> {
  try {
    let allSales: Sale[] = []
    let page = 1
    const limit = 100
    let hasMore = true
    let isFirstPage = true

    while (hasMore) {
      try {
        const sales = await getSales({ page, limit })

        if (sales.length === 0) {
          hasMore = false
          break
        }

        allSales = [...allSales, ...sales]

        // Immediate callback for first page
        if (isFirstPage && callbacks?.onInitialData) {
          callbacks.onInitialData(sales)
          isFirstPage = false
        }

        // Update callback for subsequent pages
        if (!isFirstPage && callbacks?.onDataUpdate) {
          callbacks.onDataUpdate(sales, allSales)
        }

        // Progress callback
        if (callbacks?.onProgress) {
          // Estimate total based on first page if we don't have exact count
          const estimatedTotal = sales.length < limit ? allSales.length : Math.max(allSales.length * 2, 1000)
          callbacks.onProgress(allSales.length, estimatedTotal)
        }

        // Check if we should continue
        if (sales.length < limit) {
          hasMore = false
        } else {
          page++
        }

        // Safety limit to prevent infinite loops
        if (page > 50) {
          console.warn("Reached maximum page limit (50) when fetching all sales")
          hasMore = false
        }

        // Add small delay between requests to avoid overwhelming the API
        if (hasMore && page > 2) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } catch (pageError) {
        console.error(`Error fetching sales page ${page}:`, pageError)
        if (callbacks?.onError) {
          callbacks.onError(pageError as Error)
        }
        // Continue with next page on error
        page++
        if (page > 50) hasMore = false
      }
    }

    // Complete callback
    if (callbacks?.onComplete) {
      callbacks.onComplete(allSales)
    }

    return allSales
  } catch (error) {
    console.error("Error in progressive sales fetching:", error)
    if (callbacks?.onError) {
      callbacks.onError(error as Error)
    }
    return []
  }
}

// Progressive loading for clients with immediate first page display
export async function getAllClientsProgressive(callbacks?: ProgressiveLoadingCallbacks<Client>): Promise<Client[]> {
  try {
    let allClients: Client[] = []
    let page = 1
    const limit = 50
    let hasMore = true
    let isFirstPage = true

    while (hasMore) {
      try {
        const clients = await getClients({ page, limit })

        if (clients.length === 0) {
          hasMore = false
          break
        }

        allClients = [...allClients, ...clients]

        // Immediate callback for first page
        if (isFirstPage && callbacks?.onInitialData) {
          callbacks.onInitialData(clients)
          isFirstPage = false
        }

        // Update callback for subsequent pages
        if (!isFirstPage && callbacks?.onDataUpdate) {
          callbacks.onDataUpdate(clients, allClients)
        }

        // Progress callback
        if (callbacks?.onProgress) {
          const estimatedTotal = clients.length < limit ? allClients.length : Math.max(allClients.length * 2, 200)
          callbacks.onProgress(allClients.length, estimatedTotal)
        }

        // Check if we should continue
        if (clients.length < limit) {
          hasMore = false
        } else {
          page++
        }

        // Safety limit
        if (page > 20) {
          console.warn("Reached maximum page limit (20) when fetching all clients")
          hasMore = false
        }

        // Add small delay between requests
        if (hasMore && page > 2) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } catch (pageError) {
        console.error(`Error fetching clients page ${page}:`, pageError)
        if (callbacks?.onError) {
          callbacks.onError(pageError as Error)
        }
        page++
        if (page > 20) hasMore = false
      }
    }

    // Complete callback
    if (callbacks?.onComplete) {
      callbacks.onComplete(allClients)
    }

    return allClients
  } catch (error) {
    console.error("Error in progressive clients fetching:", error)
    if (callbacks?.onError) {
      callbacks.onError(error as Error)
    }
    return []
  }
}

// Backward compatibility - these now use progressive loading but return all data
export async function getAllSales(): Promise<Sale[]> {
  return getAllSalesProgressive()
}

export async function getAllClients(): Promise<Client[]> {
  return getAllClientsProgressive()
}

export async function toggleOfferUseTax(offerId: string, currentUseTax: boolean): Promise<boolean> {
  try {
    console.log(`[API] Attempting to toggle useTax for offerId: ${offerId}, current value: ${currentUseTax}`)

    const newUseTaxValue = !currentUseTax

    const response = await fetch(`${BASE_URL}/use-tax`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offerId,
        useTax: newUseTaxValue,
      }),
    })

    console.log(`[API] Response status for toggleOfferUseTax (${offerId}): ${response.status}`)
    console.log(`[API] Sent useTax value: ${newUseTaxValue}`)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[API] Error (${response.status}) for toggleOfferUseTax (${offerId}): ${errorBody}`)
    }
    return response.ok
  } catch (error) {
    console.error(`[API] Network or other error in toggleOfferUseTax for offerId ${offerId}:`, error)
    return false
  }
}

// Manter a função antiga para compatibilidade, mas marcar como deprecated
export async function toggleUseTax(clientId: string, currentUseTax: boolean): Promise<boolean> {
  console.warn("toggleUseTax is deprecated, use toggleOfferUseTax instead")
  return false
}
