"use client"

import { useState, useEffect } from "react"
import { getClients, toggleUseTax } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Users2, Loader2 } from "lucide-react"
import type { Client } from "@/types"

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    const data = await getClients()
    setClients(data)
    setLoading(false)
  }

  const handleToggleUseTax = async (clientId: string, currentUseTax: boolean) => {
    setToggling(clientId)
    const success = await toggleUseTax(clientId, currentUseTax) // Passar o valor atual

    if (success) {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, useTax: !client.useTax } : client)),
      )
    }

    setToggling(null)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Users2 className="w-5 h-5" />
        Clientes ({clients.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Nome</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Status Comissão
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Cadastro
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Ação</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{client.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {client.token.slice(0, 8)}...
                  </div>
                </td>
                <td className="py-3 px-2">
                  <Badge
                    variant={client.useTax ? "default" : "secondary"}
                    className={`text-xs ${
                      client.useTax
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {client.useTax ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(client.createdAt)}</td>
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center">
                    {toggling === client.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch
                        checked={client.useTax}
                        onCheckedChange={() => handleToggleUseTax(client.id, client.useTax)} // Passar o valor atual
                        className="data-[state=checked]:bg-green-500"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
