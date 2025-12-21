"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DrawingAnimation } from "@/features/tournament/components/drawing-animation"
import { TournamentBracketNew } from "@/features/tournament/components/tournament-bracket-new"
import { tournamentStore } from "@/features/tournament/store/tournament-store"
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

  // Initialize state from store immediately
  const initialStatus = tournamentStore.getStatus()
  const storeMatches = tournamentStore.getMatches()
  const storeTotalRounds = tournamentStore.getTotalRounds()

  const [loading, setLoading] = useState(true)
  const [showDrawing, setShowDrawing] = useState(initialStatus === "DRAWING")
  const [matches] = useState<Match[]>(storeMatches)
  const [totalRounds] = useState(storeTotalRounds)

  useEffect(() => {
    // Initial validation nur einmal - danach keine Redirects mehr!
    // Das verhindert redirect loops wenn der Store sich ändert

    if (initialStatus === "LOBBY") {
      console.log("[Bracket] Status is LOBBY - redirecting to lobby")
      router.push("/tournament")
      return
    }

    if (storeMatches.length === 0) {
      console.log("[Bracket] No matches found - redirecting to lobby")
      router.push("/tournament")
      return
    }

    // Validation erfolgreich - setze loading auf false
    setLoading(false)
    console.log("[Bracket] Initialized successfully with status:", initialStatus)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Nur einmal beim Mount!

  const handleDrawingComplete = () => {
    setShowDrawing(false)
    tournamentStore.setStatus("RUNNING")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Lädt Bracket...</p>
      </div>
    )
  }

  if (showDrawing && tournamentStore.getStatus() === "DRAWING") {
    return <DrawingAnimation matches={matches} onComplete={handleDrawingComplete} />
  }

  return (
    <TournamentBracketNew
      matches={matches}
      totalRounds={totalRounds}
      currentUser={user}
    />
  )
}

