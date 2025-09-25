"use client"

import { useState, useEffect } from "react"
import { getAllCheckouts, updateCheckout } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Search,
  ExternalLink,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  LinkIcon,
} from "lucide-react"
import type { Checkout } from "@/types"

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCheckout, setEditingCheckout] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<{ [key: string]: "success" | "error" | null }>({})

  useEffect(() => {
    loadCheckouts()
  }, [])

  const loadCheckouts = async () => {
    setLoading(true)
    try {
      const data = await getAllCheckouts()
      setCheckouts(data)
    } catch (error) {
      console.error("Error loading checkouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (checkout: Checkout) => {
    setEditingCheckout(checkout.id)
    setEditValue(checkout.myCheckout)
    setUpdateStatus((prev) => ({ ...prev, [checkout.id]: null }))
  }

  const handleEditCancel = () => {
    setEditingCheckout(null)
    setEditValue("")
  }

  const handleEditSave = async (checkoutId: string) => {
    if (!editValue.trim()) {
      setUpdateStatus((prev) => ({ ...prev, [checkoutId]: "error" }))
      return
    }

    const checkout = checkouts.find((c) => c.id === checkoutId)
    if (!checkout) {
      setUpdateStatus((prev) => ({ ...prev, [checkoutId]: "error" }))
      return
    }

    setUpdating(checkoutId)
    try {
      const success = await updateCheckout(checkoutId, editValue.trim(), checkout.offer)

      if (success) {
        // Update local state
        setCheckouts((prev) =>
          prev.map((checkout) =>
            checkout.id === checkoutId ? { ...checkout, myCheckout: editValue.trim() } : checkout,
          ),
        )
        setUpdateStatus((prev) => ({ ...prev, [checkoutId]: "success" }))
        setEditingCheckout(null)
        setEditValue("")

        // Clear success status after 3 seconds
        setTimeout(() => {
          setUpdateStatus((prev) => ({ ...prev, [checkoutId]: null }))
        }, 3000)
      } else {
        setUpdateStatus((prev) => ({ ...prev, [checkoutId]: "error" }))
      }
    } catch (error) {
      console.error("Error updating checkout:", error)
      setUpdateStatus((prev) => ({ ...prev, [checkoutId]: "error" }))
    } finally {
      setUpdating(null)
    }
  }

  const filteredCheckouts = checkouts.filter(
    (checkout) =>
      checkout.offer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkout.myCheckout.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkout.lastClientCheckout.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Checkouts</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando checkouts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Checkouts</h1>
        </div>
        <Button onClick={loadCheckouts} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Loader2 className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Checkouts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{checkouts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Checkouts Configurados</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {checkouts.filter((c) => c.myCheckout && c.myCheckout.trim() !== "").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ofertas Ativas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {new Set(checkouts.map((c) => c.offerId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por oferta ou checkout..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Checkouts List */}
      <div className="space-y-4">
        {filteredCheckouts.map((checkout) => {
          const isEditing = editingCheckout === checkout.id
          const isUpdating = updating === checkout.id
          const status = updateStatus[checkout.id]

          return (
            <div
              key={checkout.id}
              className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{checkout.offer}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Criado em {formatDate(checkout.createdAt)}</span>
                        {checkout.updatedAt !== checkout.createdAt && (
                          <>
                            <span>•</span>
                            <span>Atualizado em {formatDate(checkout.updatedAt)}</span>
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Meu Checkout */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Meu Checkout</span>
                            {status === "success" && (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Atualizado
                              </Badge>
                            )}
                            {status === "error" && (
                              <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erro
                              </Badge>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Cole o link do seu checkout aqui..."
                                className="flex-1"
                                disabled={isUpdating}
                              />
                              <Button
                                onClick={() => handleEditSave(checkout.id)}
                                disabled={isUpdating || !editValue.trim()}
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Salvar
                              </Button>
                              <Button onClick={handleEditCancel} disabled={isUpdating} variant="outline" size="sm">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                                {checkout.myCheckout ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-900 dark:text-white font-mono break-all">
                                      {checkout.myCheckout}
                                    </span>
                                    {isValidUrl(checkout.myCheckout) && (
                                      <a
                                        href={checkout.myCheckout}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Nenhum checkout configurado
                                  </span>
                                )}
                              </div>
                              <Button
                                onClick={() => handleEditStart(checkout)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Edit3 className="w-4 h-4" />
                                Editar
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Último Checkout do Cliente */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Último Checkout do Cliente
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                            {checkout.lastClientCheckout ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900 dark:text-white font-mono break-all">
                                  {checkout.lastClientCheckout}
                                </span>
                                {isValidUrl(checkout.lastClientCheckout) && (
                                  <a
                                    href={checkout.lastClientCheckout}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Nenhum checkout registrado pelo cliente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCheckouts.length === 0 && !loading && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-8 border border-gray-200 dark:border-[#1F1F23]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum checkout encontrado</p>
            <p className="text-sm">
              {searchTerm ? "Tente ajustar os termos de busca" : "Não há checkouts cadastrados no sistema"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
