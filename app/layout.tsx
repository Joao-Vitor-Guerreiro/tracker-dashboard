import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Braynex - Tracker", // Ensured title is updated
  description: "Dashboard de vendas e analytics",
  icons: {
    icon: "/favicon-braynex.png", // Points to the new PNG favicon
    shortcut: "/favicon-braynex.png",
    apple: "/favicon-braynex.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Ensuring all link tags point to the new PNG favicon */}
        <link rel="icon" href="/favicon-braynex.png" sizes="any" />
        <link rel="icon" href="/favicon-braynex.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon-braynex.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <AuthProvider>
            <Providers>{children}</Providers>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
