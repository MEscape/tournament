import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimiter } from "@/lib/rate-limiter"
import { tournamentStore } from "@/features/tournament/store/tournament-store"

// Simple Polling API with Auth + Rate Limiting
export async function GET() {
  try {
    // Auth Check (Security!)
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nicht angemeldet" },
        { status: 401 }
      )
    }

    // Rate Limiting (max 30 req/min per user)
    if (!rateLimiter.check(session.user.id, { maxRequests: 30, windowMs: 60000 })) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warte einen Moment." },
        { status: 429 }
      )
    }

    const players = tournamentStore.getPlayers()
    const stats = tournamentStore.getStats()

    console.log(`[API] Tournament state - Players: ${players.length}, Stats:`, stats)

    return NextResponse.json({
      players,
      stats,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[Tournament API] Error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden des Tournament Status" },
      { status: 500 }
    )
  }
}

