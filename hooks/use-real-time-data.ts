"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getAllSalesProgressive, getAllClientsProgressive, type ProgressiveLoadingCallbacks } from "@/lib/api"
import type { Sale, Client } from "@/types"

interface RealTimeDataState<T> {
  data: T[]
  batchData: T[][]
  isLoading: boolean
  isLoadingMore: boolean
  isComplete: boolean
  error: Error | null
  progress: { current: number; total: number; percentage: number }
  lastUpdate: Date | null
  batchCount: number
  estimatedTimeRemaining: number
}

interface RealTimeDataOptions {
  autoStart?: boolean
  batchUpdateInterval?: number
  onBatchUpdate?: (batch: any[], allData: any[], batchIndex: number) => void
  onProgress?: (progress: { current: number; total: number; percentage: number }) => void
  onError?: (error: Error) => void
}

export function useRealTimeSales(options: RealTimeDataOptions = {}) {
  const [state, setState] = useState<RealTimeDataState<Sale>>({
    data: [],
    batchData: [],
    isLoading: false,
    isLoadingMore: false,
    isComplete: false,
    error: null,
    progress: { current: 0, total: 0, percentage: 0 },
    lastUpdate: null,
    batchCount: 0,
    estimatedTimeRemaining: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)
  const startTimeRef = useRef<Date | null>(null)
  const batchTimesRef = useRef<number[]>([])

  const { batchUpdateInterval = 500, onBatchUpdate, onProgress, onError } = options

  const calculateEstimatedTime = useCallback((current: number, total: number) => {
    if (current === 0 || !startTimeRef.current) return 0

    const elapsed = Date.now() - startTimeRef.current.getTime()
    const rate = current / elapsed
    const remaining = total - current
    return remaining / rate
  }, [])

  const fetchData = useCallback(async () => {
    if (isLoadingRef.current) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isLoadingRef.current = true
    startTimeRef.current = new Date()
    batchTimesRef.current = []

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isLoadingMore: false,
      isComplete: false,
      error: null,
      data: [],
      batchData: [],
      progress: { current: 0, total: 0, percentage: 0 },
      lastUpdate: null,
      batchCount: 0,
      estimatedTimeRemaining: 0,
    }))

    let batchIndex = 0

    const callbacks: ProgressiveLoadingCallbacks<Sale> = {
      onInitialData: (initialData) => {
        const now = new Date()
        batchTimesRef.current.push(now.getTime())

        setState((prev) => {
          const newBatchData = [...prev.batchData, initialData]
          const progress = {
            current: initialData.length,
            total: Math.max(initialData.length * 10, 1000), // Initial estimate
            percentage: 0,
          }

          return {
            ...prev,
            data: initialData,
            batchData: newBatchData,
            isLoading: false,
            isLoadingMore: true,
            progress,
            lastUpdate: now,
            batchCount: 1,
          }
        })

        onBatchUpdate?.(initialData, initialData, batchIndex++)
      },
      onDataUpdate: (newData, allData) => {
        const now = new Date()
        batchTimesRef.current.push(now.getTime())

        setState((prev) => {
          const newBatchData = [...prev.batchData, newData]
          const progress = {
            current: allData.length,
            total: prev.progress.total,
            percentage: prev.progress.total > 0 ? (allData.length / prev.progress.total) * 100 : 0,
          }

          const estimatedTimeRemaining = calculateEstimatedTime(allData.length, prev.progress.total)

          return {
            ...prev,
            data: allData,
            batchData: newBatchData,
            progress,
            lastUpdate: now,
            batchCount: prev.batchCount + 1,
            estimatedTimeRemaining,
          }
        })

        onBatchUpdate?.(newData, allData, batchIndex++)
        onProgress?.(state.progress)
      },
      onProgress: (current, total) => {
        setState((prev) => {
          const progress = {
            current,
            total,
            percentage: total > 0 ? (current / total) * 100 : 0,
          }

          const estimatedTimeRemaining = calculateEstimatedTime(current, total)

          return {
            ...prev,
            progress,
            estimatedTimeRemaining,
          }
        })

        onProgress?.({ current, total, percentage: total > 0 ? (current / total) * 100 : 0 })
      },
      onComplete: (allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
          isLoadingMore: false,
          isComplete: true,
          progress: { ...prev.progress, percentage: 100 },
          lastUpdate: new Date(),
          estimatedTimeRemaining: 0,
        }))
        isLoadingRef.current = false
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
          isLoadingMore: false,
          estimatedTimeRemaining: 0,
        }))
        isLoadingRef.current = false
        onError?.(error)
      },
    }

    try {
      await getAllSalesProgressive(callbacks)
    } catch (error) {
      console.error("Error in real-time sales loading:", error)
      isLoadingRef.current = false
    }
  }, [batchUpdateInterval, onBatchUpdate, onProgress, onError, calculateEstimatedTime])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const { autoStart = true } = options

    if (autoStart && !isLoadingRef.current) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      isLoadingRef.current = false
    }
  }, [])

  return {
    ...state,
    refetch,
    getBatchHistory: () => state.batchData,
    getAverageBatchTime: () => {
      if (batchTimesRef.current.length < 2) return 0
      const times = batchTimesRef.current
      const intervals = []
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1])
      }
      return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    },
  }
}

export function useRealTimeClients(options: RealTimeDataOptions = {}) {
  const [state, setState] = useState<RealTimeDataState<Client>>({
    data: [],
    batchData: [],
    isLoading: false,
    isLoadingMore: false,
    isComplete: false,
    error: null,
    progress: { current: 0, total: 0, percentage: 0 },
    lastUpdate: null,
    batchCount: 0,
    estimatedTimeRemaining: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)
  const startTimeRef = useRef<Date | null>(null)
  const batchTimesRef = useRef<number[]>([])

  const { batchUpdateInterval = 500, onBatchUpdate, onProgress, onError } = options

  const calculateEstimatedTime = useCallback((current: number, total: number) => {
    if (current === 0 || !startTimeRef.current) return 0

    const elapsed = Date.now() - startTimeRef.current.getTime()
    const rate = current / elapsed
    const remaining = total - current
    return remaining / rate
  }, [])

  const fetchData = useCallback(async () => {
    if (isLoadingRef.current) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isLoadingRef.current = true
    startTimeRef.current = new Date()
    batchTimesRef.current = []

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isLoadingMore: false,
      isComplete: false,
      error: null,
      data: [],
      batchData: [],
      progress: { current: 0, total: 0, percentage: 0 },
      lastUpdate: null,
      batchCount: 0,
      estimatedTimeRemaining: 0,
    }))

    let batchIndex = 0

    const callbacks: ProgressiveLoadingCallbacks<Client> = {
      onInitialData: (initialData) => {
        const now = new Date()
        batchTimesRef.current.push(now.getTime())

        setState((prev) => {
          const newBatchData = [...prev.batchData, initialData]
          const progress = {
            current: initialData.length,
            total: Math.max(initialData.length * 5, 200), // Initial estimate
            percentage: 0,
          }

          return {
            ...prev,
            data: initialData,
            batchData: newBatchData,
            isLoading: false,
            isLoadingMore: true,
            progress,
            lastUpdate: now,
            batchCount: 1,
          }
        })

        onBatchUpdate?.(initialData, initialData, batchIndex++)
      },
      onDataUpdate: (newData, allData) => {
        const now = new Date()
        batchTimesRef.current.push(now.getTime())

        setState((prev) => {
          const newBatchData = [...prev.batchData, newData]
          const progress = {
            current: allData.length,
            total: prev.progress.total,
            percentage: prev.progress.total > 0 ? (allData.length / prev.progress.total) * 100 : 0,
          }

          const estimatedTimeRemaining = calculateEstimatedTime(allData.length, prev.progress.total)

          return {
            ...prev,
            data: allData,
            batchData: newBatchData,
            progress,
            lastUpdate: now,
            batchCount: prev.batchCount + 1,
            estimatedTimeRemaining,
          }
        })

        onBatchUpdate?.(newData, allData, batchIndex++)
        onProgress?.(state.progress)
      },
      onProgress: (current, total) => {
        setState((prev) => {
          const progress = {
            current,
            total,
            percentage: total > 0 ? (current / total) * 100 : 0,
          }

          const estimatedTimeRemaining = calculateEstimatedTime(current, total)

          return {
            ...prev,
            progress,
            estimatedTimeRemaining,
          }
        })

        onProgress?.({ current, total, percentage: total > 0 ? (current / total) * 100 : 0 })
      },
      onComplete: (allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
          isLoadingMore: false,
          isComplete: true,
          progress: { ...prev.progress, percentage: 100 },
          lastUpdate: new Date(),
          estimatedTimeRemaining: 0,
        }))
        isLoadingRef.current = false
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
          isLoadingMore: false,
          estimatedTimeRemaining: 0,
        }))
        isLoadingRef.current = false
        onError?.(error)
      },
    }

    try {
      await getAllClientsProgressive(callbacks)
    } catch (error) {
      console.error("Error in real-time clients loading:", error)
      isLoadingRef.current = false
    }
  }, [batchUpdateInterval, onBatchUpdate, onProgress, onError, calculateEstimatedTime])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const { autoStart = true } = options

    if (autoStart && !isLoadingRef.current) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      isLoadingRef.current = false
    }
  }, [])

  return {
    ...state,
    refetch,
    getBatchHistory: () => state.batchData,
    getAverageBatchTime: () => {
      if (batchTimesRef.current.length < 2) return 0
      const times = batchTimesRef.current
      const intervals = []
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1])
      }
      return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    },
  }
}
