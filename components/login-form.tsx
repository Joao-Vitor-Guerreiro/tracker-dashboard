"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"
import DynamicLogo from "@/components/dynamic-logo"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const success = login(email, password)

    if (!success) {
      setError("Email ou senha incorretos")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F12] p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-[#0F0F12] dark:to-gray-800/50" />

      <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/90 dark:bg-[#0F0F12]/90 border border-gray-200/50 dark:border-[#1F1F23]/50 shadow-2xl">
        <CardHeader className="text-center space-y-6 pt-8 pb-6">
          <div className="mx-auto w-72 h-20 relative">
            <DynamicLogo width={288} height={80} className="transition-all duration-500 ease-in-out hover:scale-105" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Acesso ao Sistema</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acesso Administrativo</p>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de gestão de vendas e clientes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
