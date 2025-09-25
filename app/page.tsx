"use client"

import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"
import { Loader2 } from "lucide-react"
import { NavigationProvider } from "@/contexts/navigation-context"
import { DateFilterProvider } from "@/contexts/date-filter-context"
import Layout from "@/components/kokonutui/layout"
import Content from "@/components/kokonutui/content"

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <NavigationProvider>
      <DateFilterProvider>
        <Layout>
          <Content />
        </Layout>
      </DateFilterProvider>
    </NavigationProvider>
  )
}
