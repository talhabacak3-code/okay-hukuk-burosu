"use client"

import { usePathname } from "next/navigation"

import { NavList } from "@/components/layout/nav-list"

export function ActiveNavList() {
  const pathname = usePathname()
  return <NavList pathname={pathname} />
}
