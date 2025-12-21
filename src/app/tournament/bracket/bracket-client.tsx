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

  const [loading, setLoading] = useState(true)
  const [showDrawing, setShowDrawing] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [totalRounds, setTotalRounds] = useState(0)

  useEffect(() => {
    // Lade Status und Matches DYNAMISCH aus dem Store
    const currentStatus = tournamentStore.getStatus()
    const currentMatches = tournamentStore.getMatches()
    const currentRounds = tournamentStore.getTotalRounds()

    console.log("[Bracket] Loading - Status:", currentStatus, "Matches:", currentMatches.length)

    // Validierung: Nur LOBBY ist invalid
    if (currentStatus === "LOBBY") {
      console.log("[Bracket] Status is LOBBY - redirecting to lobby")
      router.push("/tournament")
      return
    }

    // KEIN Check auf matches.length!
    // Matches können initial 0 sein - das ist OK für Drawing Animation

    // Setze State
    setMatches(currentMatches)
    setTotalRounds(currentRounds)
    setShowDrawing(currentStatus === "DRAWING")
    setLoading(false)

    console.log("[Bracket] Initialized successfully")

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

