"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost"
  showIcon?: boolean
}

export function SignOutButton({ variant = "outline", showIcon = false }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/welcome" })
  }

  return (
    <Button variant={variant} onClick={handleSignOut}>
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Abmelden
    </Button>
  )
}

