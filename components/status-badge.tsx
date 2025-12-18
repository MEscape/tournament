"use client"

import { Badge } from "@/components/ui/badge"

type Status = "unused" | "used" | "revoked"

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    unused: {
      label: "Unused",
      className: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    used: {
      label: "Used",
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    revoked: {
      label: "Revoked",
      className: "bg-red-600 hover:bg-red-700 text-white",
    },
  }

  const { label, className } = config[status]

  return (
    <Badge variant="default" className={className}>
      {label}
    </Badge>
  )
}

