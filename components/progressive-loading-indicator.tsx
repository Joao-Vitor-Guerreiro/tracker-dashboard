"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface ProgressiveLoadingIndicatorProps {
  isLoading: boolean
  isLoadingMore: boolean
  isComplete: boolean
  progress: { current: number; total: number }
  error?: Error | null
  className?: string
}

export default function ProgressiveLoadingIndicator({
  isLoading,
  isLoadingMore,
  isComplete,
  progress,
  error,
  className = "",
}: ProgressiveLoadingIndicatorProps) {
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 dark:text-red-400 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Erro ao carregar dados</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-blue-600 dark:text-blue-400 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Carregando dados iniciais...</span>
      </div>
    )
  }

  if (isLoadingMore) {
    const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            Carregando mais dados... ({progress.current}/{progress.total})
          </span>
        </div>
        <Progress value={progressPercentage} className="h-1" />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Todos os dados carregados ({progress.current} registros)</span>
      </div>
    )
  }

  return null
}
