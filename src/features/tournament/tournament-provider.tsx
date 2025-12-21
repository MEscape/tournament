"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import type { TournamentPlayer, TournamentStatus } from "./store/tournament-store"

interface TournamentContextValue {
  players: TournamentPlayer[]
  loading: boolean
  stats: { total: number; ready: number; maxPlayers: number; status: TournamentStatus }
  refresh: () => Promise<void>
}

const TournamentContext = createContext<TournamentContextValue | null>(null)

export function useTournament() {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error("useTournament must be used within TournamentProvider")
  }
  return context
}

export function TournamentProvider({
  children,
  currentUserId
}: {
  children: React.ReactNode
  currentUserId?: string
}) {
  const [players, setPlayers] = useState<TournamentPlayer[]>([])
  const [stats, setStats] = useState({ total: 0, ready: 0, maxPlayers: 16, status: "LOBBY" as TournamentStatus })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const previousPlayerIds = useRef<Set<string>>(new Set())
  const previousStatus = useRef<TournamentStatus>("LOBBY")

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament/stream", {
        cache: "no-store"
      })

      if (!res.ok) return

      const data = await res.json()
      const newPlayers = data.players as TournamentPlayer[]
      const newPlayerIds = new Set(newPlayers.map((p: TournamentPlayer) => p.userId))
      const newStatus = data.stats.status as TournamentStatus

      // Check if current user was kicked (WICHTIG: Vor Status-Check!)
      if (currentUserId) {
        const userStillInTournament = newPlayerIds.has(currentUserId)
        const wasInTournament = previousPlayerIds.current.has(currentUserId)

        if (wasInTournament && !userStillInTournament && newStatus === "LOBBY") {
          // User was kicked - force reload
          console.log("[Provider] User was kicked! Reloading page...")
          window.location.href = "/tournament"
          return
        }
      }

      // Update state (no redirect - let pages handle navigation)
      previousPlayerIds.current = newPlayerIds
      previousStatus.current = newStatus
      setPlayers(newPlayers)
      setStats(data.stats)
      setLoading(false)
    } catch (error) {
      console.error("Polling error:", error)
    }
  }, [currentUserId, router])

  useEffect(() => {
    let mounted = true

    // Initial load (delayed to avoid cascading renders)
    setTimeout(() => {
      if (mounted) refresh()
    }, 0)

    // Poll every 1 second (faster feedback for kicks)
    const interval = setInterval(() => {
      if (mounted) refresh()
    }, 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [refresh])

  return (
    <TournamentContext.Provider value={{ players, loading, stats, refresh }}>
      {children}
    </TournamentContext.Provider>
  )
}

