"use client"

import type React from "react"

import { BarChart2, Home, Menu, Users, CreditCard, BookOpen } from "lucide-react"
import { useState } from "react"
import { useNavigation } from "@/contexts/navigation-context"
import DynamicLogo from "@/components/dynamic-logo"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { currentPage, setCurrentPage } = useNavigation()

  function handleNavigation(page: "dashboard" | "analytics" | "clients" | "checkouts") {
    setCurrentPage(page)
    setIsMobileMenuOpen(false)
  }

  function NavItem({
    page,
    icon: Icon,
    children,
  }: {
    page: "dashboard" | "analytics" | "clients" | "checkouts"
    icon: any
    children: React.ReactNode
  }) {
    const isActive = currentPage === page

    return (
      <button
        onClick={() => handleNavigation(page)}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
          isActive
            ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-medium"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
            fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
            lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="h-20 px-4 flex items-center justify-center border-b border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center gap-3">
              <DynamicLogo
                width={192}
                height={56}
                className="transition-all duration-300 ease-in-out hover:scale-105"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overview
                </div>
                <div className="space-y-1">
                  <NavItem page="dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem page="analytics" icon={BarChart2}>
                    Analytics
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Gestão
                </div>
                <div className="space-y-1">
                  <NavItem page="clients" icon={Users}>
                    Clients
                  </NavItem>
                  <NavItem page="checkouts" icon={CreditCard}>
                    Checkouts
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Recursos
                </div>
                <div className="space-y-1">
                  <a
                    href="https://doc.pauloenterprise.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4 mr-3 flex-shrink-0" />
                    Documentação
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
