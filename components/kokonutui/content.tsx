"use client"

import { useNavigation } from "@/contexts/navigation-context"
import RealTimeDashboard from "@/components/real-time-dashboard"
import AnalyticsPage from "@/components/analytics/analytics-page"
import ClientsPage from "@/components/clients/clients-page"
import CheckoutsPage from "@/components/checkouts/checkouts-page"

export default function Content() {
  const { currentPage } = useNavigation()

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <RealTimeDashboard />
      case "analytics":
        return <AnalyticsPage />
      case "clients":
        return <ClientsPage />
      case "checkouts":
        return <CheckoutsPage />
      default:
        return <RealTimeDashboard />
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">{renderContent()}</div>
    </div>
  )
}
