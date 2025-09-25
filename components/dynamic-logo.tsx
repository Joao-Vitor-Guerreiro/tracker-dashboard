"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"

interface DynamicLogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
}

export default function DynamicLogo({
  width = 192,
  height = 56,
  className = "",
  alt = "Braynex Logo",
}: DynamicLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`} style={{ width, height }} />
    )
  }

  // Determine which logo to use based on the current theme
  const currentTheme = resolvedTheme || theme
  const logoSrc =
    currentTheme === "dark"
      ? "/images/braynex-logo-final.png" // Dark theme usa o logo original
      : "/images/braynex-logo-dark-theme.png" // Light theme usa o novo logo fornecido

  return (
    <div className={`relative transition-all duration-300 ease-in-out ${className}`}>
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="object-contain transition-opacity duration-300 ease-in-out"
        priority
        style={{
          filter: currentTheme === "dark" ? "none" : "none",
        }}
      />
    </div>
  )
}
