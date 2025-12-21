"use client"

import { Zap, Lightbulb, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GlobalNavigationProps {
  user?: {
    id: string
    username: string
    role: "ADMIN" | "USER"
  }
}

export function GlobalNavigation({ user }: GlobalNavigationProps) {
  if (!user) return null

  const isAdmin = user.role === "ADMIN"

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      {/* Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="bg-background/80 backdrop-blur">
            <Zap className="h-5 w-5 mr-2" />
            Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/themes" className="cursor-pointer">
              <Lightbulb className="h-4 w-4 mr-2" />
              {isAdmin ? "Themen verwalten" : "Themen vorschlagen"}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tournament" className="cursor-pointer">
              <Zap className="h-4 w-4 mr-2" />
              Turnier Lobby
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sign Out */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => signOut({ callbackUrl: "/welcome" })}
        className="bg-background/80 backdrop-blur"
      >
        <LogOut className="h-5 w-5 mr-2" />
        Abmelden
      </Button>
    </div>
  )
}

