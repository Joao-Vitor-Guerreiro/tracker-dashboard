"use client"

import { NavigationProvider } from "@/contexts/navigation-context"
import { DateFilterProvider } from "@/contexts/date-filter-context"
import Content from "./content"
import Layout from "./layout"

export default function Dashboard() {
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
