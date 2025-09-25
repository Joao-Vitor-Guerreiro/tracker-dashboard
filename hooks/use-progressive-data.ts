"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getAllSalesProgressive, getAllClientsProgressive, type ProgressiveLoadingCallbacks } from "@/lib/api"
import type { Sale, Client } from "@/types"

interface UseProgressiveDataState<T> {
  data: T[]
  isLoading: boolean
  isLoadingMore: boolean
  isComplete: boolean
  error: Error | null
  progress: { current: number; total: number }
}

interface UseProgressiveDataOptions {
  autoStart?: boolean
  onError?: (error: Error) => void
}

export function useProgressiveSales(options: UseProgressiveDataOptions = {}) {
  const [state, setState] = useState<UseProgressiveDataState<Sale>>({
    data: [],
    isLoading: false,
    isLoadingMore: false,
    isComplete: false,
    error: null,
    progress: { current: 0, total: 0 },
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)

  // Memoize the error callback to prevent infinite loops
  const onErrorCallback = useCallback(
    (error: Error) => {
      options.onError?.(error)
    },
    [options.onError],
  )

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) {
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isLoadingRef.current = true

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isLoadingMore: false,
      isComplete: false,
      error: null,
      data: [],
    }))

    const callbacks: ProgressiveLoadingCallbacks<Sale> = {
      onInitialData: (initialData) => {
        setState((prev) => ({
          ...prev,
          data: initialData,
          isLoading: false,
          isLoadingMore: true,
        }))
      },
      onDataUpdate: (newData, allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
        }))
      },
      onProgress: (current, total) => {
        setState((prev) => ({
          ...prev,
          progress: { current, total },
        }))
      },
      onComplete: (allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
          isLoadingMore: false,
          isComplete: true,
        }))
        isLoadingRef.current = false
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
          isLoadingMore: false,
        }))
        isLoadingRef.current = false
        onErrorCallback(error)
      },
    }

    try {
      await getAllSalesProgressive(callbacks)
    } catch (error) {
      console.error("Error in progressive sales loading:", error)
      isLoadingRef.current = false
    }
  }, [onErrorCallback])

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
  }, []) // Remove options from dependencies to prevent infinite loop

  return {
    ...state,
    refetch,
  }
}

export function useProgressiveClients(options: UseProgressiveDataOptions = {}) {
  const [state, setState] = useState<UseProgressiveDataState<Client>>({
    data: [],
    isLoading: false,
    isLoadingMore: false,
    isComplete: false,
    error: null,
    progress: { current: 0, total: 0 },
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)

  // Memoize the error callback to prevent infinite loops
  const onErrorCallback = useCallback(
    (error: Error) => {
      options.onError?.(error)
    },
    [options.onError],
  )

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) {
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isLoadingRef.current = true

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isLoadingMore: false,
      isComplete: false,
      error: null,
      data: [],
    }))

    const callbacks: ProgressiveLoadingCallbacks<Client> = {
      onInitialData: (initialData) => {
        setState((prev) => ({
          ...prev,
          data: initialData,
          isLoading: false,
          isLoadingMore: true,
        }))
      },
      onDataUpdate: (newData, allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
        }))
      },
      onProgress: (current, total) => {
        setState((prev) => ({
          ...prev,
          progress: { current, total },
        }))
      },
      onComplete: (allData) => {
        setState((prev) => ({
          ...prev,
          data: allData,
          isLoadingMore: false,
          isComplete: true,
        }))
        isLoadingRef.current = false
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
          isLoadingMore: false,
        }))
        isLoadingRef.current = false
        onErrorCallback(error)
      },
    }

    try {
      await getAllClientsProgressive(callbacks)
    } catch (error) {
      console.error("Error in progressive clients loading:", error)
      isLoadingRef.current = false
    }
  }, [onErrorCallback])

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
  }, []) // Remove options from dependencies to prevent infinite loop

  return {
    ...state,
    refetch,
  }
}
