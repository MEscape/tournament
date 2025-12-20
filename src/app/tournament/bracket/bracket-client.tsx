"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DrawingAnimation } from "@/features/tournament/components/drawing-animation"
import { TournamentBracket } from "@/features/tournament/components/tournament-bracket"
import { getTournamentState, setMatchWinner } from "@/features/tournament/actions/match-actions"
import type { Match } from "@/features/tournament/store/tournament-store"

interface BracketClientProps {
  user: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export function BracketClient({ user }: BracketClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showDrawing, setShowDrawing] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [totalRounds, setTotalRounds] = useState(0)

  useEffect(() => {
    const loadTournamentState = async () => {
      const result = await getTournamentState()

      if (!result.success || !result.data) {
        // No tournament running, redirect to lobby
        router.push("/tournament")
        return
      }

      if (result.data.status === "LOBBY") {
        // Tournament not started yet
        router.push("/tournament")
        return
      }

      setMatches(result.data.matches)
      setTotalRounds(result.data.totalRounds)
      setLoading(false)
    }

    loadTournamentState()
  }, [router])

  const handleDrawingComplete = () => {
    setShowDrawing(false)
  }

  const handleSelectWinner = async (matchId: string, winnerId: string) => {
    await setMatchWinner(matchId, winnerId)
    // Reload tournament state
    const result = await getTournamentState()
    if (result.success && result.data) {
      setMatches(result.data.matches)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Lädt...</p>
      </div>
    )
  }

  if (showDrawing) {
    return (
      <DrawingAnimation matches={matches} onComplete={handleDrawingComplete} />
    )
  }

  return (
    <TournamentBracket
      matches={matches}
      totalRounds={totalRounds}
      currentUser={user}
      onSelectWinner={handleSelectWinner}
    />
  )
}

