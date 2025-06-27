"use client"

import { useEffect, useState } from "react"
import { ToastProvider as Toast } from "@radix-ui/react-toast"
import { Toast as ToastPrimitive } from "@/components/ui/toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Toast>
      {children}
      <ToastPrimitive />
    </Toast>
  )
}
