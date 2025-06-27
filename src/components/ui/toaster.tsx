"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/ui/icons"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

const useToaster = () => {
  const { toast } = useToast()

  const showToast = React.useCallback(
    (type: ToastType, options: ToastOptions = {}) => {
      const { title = "", description = "", duration = 5000 } = options
      
      const variants = {
        success: {
          title: title || "Success!",
          variant: "default" as const,
          icon: <Icons.check className="h-4 w-4 text-green-500" />,
        },
        error: {
          title: title || "Error!",
          variant: "destructive" as const,
          icon: <Icons.x className="h-4 w-4" />,
        },
        info: {
          title: title || "Info",
          variant: "default" as const,
          icon: <Icons.info className="h-4 w-4 text-blue-500" />,
        },
        warning: {
          title: title || "Warning",
          variant: "default" as const,
          icon: <Icons.alertCircle className="h-4 w-4 text-yellow-500" />,
        },
      }

      const { variant, ...rest } = variants[type]

      toast({
        ...rest,
        description,
        duration,
        variant,
        className: "group [&>button]:text-foreground",
      })
    },
    [toast]
  )

  return showToast
}

export { useToaster }
export type { ToastType, ToastOptions }
