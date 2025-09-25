export interface Sale {
  id: string
  ghostId: string
  approved: boolean
  productName: string
  customerName: string
  amount: number
  toClient: boolean
  createdAt: string
  clientId: string
  offerId: string
  visible?: boolean
}

export interface Offer {
  id: string
  name: string
  useTax: boolean
  clientId: string
  sales: Sale[]
  createdAt: string
}

export interface Client {
  id: string
  name: string
  token: string
  offers: Offer[]
  sales: Sale[] // Sales gerais de todas as ofertas
  createdAt: string
}

export interface Checkout {
  id: string
  offer: string // nome da oferta
  myCheckout: string
  lastClientCheckout: string
  offerId: string
  clientId: string
  createdAt: string
  updatedAt: string
}

export type ProductCategory = "Crocs" | "Sephora" | "Pandora" | "PixDoMilhão" | "Outros"

export type DateFilter = "today" | "7days" | "30days" | "all"
