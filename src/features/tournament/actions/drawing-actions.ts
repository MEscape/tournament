"use server"

import { auth } from "@/lib/auth"
import { tournamentStore, type TournamentPlayer } from "../store/tournament-store"
import type { Match } from "../store/tournament-store"
import type { ApiResponse } from "@/types/api.types"

// Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Calculate number of rounds needed for bracket
function calculateRounds(playerCount: number): number {
  return Math.ceil(Math.log2(playerCount))
}
function createInitialMatches(players: TournamentPlayer[]): Match[] {
  const shuffled = shuffleArray(players)
  const matches: Match[] = []

  // Pair up players
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      // Normal match: 2 players
      matches.push({
        id: crypto.randomUUID(), // ← Unique ID statt match-1, match-2
        round: 1,
        matchNumber: i / 2 + 1,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        winner: null,
        status: "pending"
      })
    } else {
      // Bye: Player gets free pass to next round
      matches.push({
        id: crypto.randomUUID(), // ← Unique ID
        round: 1,
        matchNumber: i / 2 + 1,
        player1: shuffled[i],
        player2: null, // Bye
        winner: shuffled[i],
        status: "bye"
      })
    }
  }

  return matches
}

export async function startMatchDrawing(): Promise<ApiResponse<{
  matches: Match[]
  totalRounds: number
}>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    // WICHTIG: Prüfe ob Matches bereits existieren
    const existingMatches = tournamentStore.getMatches()
    if (existingMatches.length > 0) {
      // Matches wurden bereits ausgelost - return existing
      console.log(`[Drawing] Matches already drawn (${existingMatches.length}), returning existing`)
      return {
        success: true,
        data: {
          matches: existingMatches,
          totalRounds: tournamentStore.getTotalRounds()
        }
      }
    }

    const players = tournamentStore.getPlayers()
    const stats = tournamentStore.getStats()

    // Validation
    if (stats.total < 2) {
      return { success: false, error: "Mindestens 2 Spieler benötigt" }
    }

    // Admin kann trotzdem starten, auch wenn nicht alle bereit sind
    // Frontend zeigt bereits Warnung via confirm()

    // Create matches
    const matches = createInitialMatches(players)
    const totalRounds = calculateRounds(players.length)

    // Set tournament status to DRAWING and save matches
    tournamentStore.setStatus("DRAWING")
    tournamentStore.setMatches(matches, totalRounds)

    console.log(`[Match Drawing] Created ${matches.length} matches for ${players.length} players`)

    return {
      success: true,
      data: {
        matches,
        totalRounds
      }
    }
  } catch (error) {
    console.error("Match drawing error:", error)
    return { success: false, error: "Fehler beim Auslosen" }
  }
}


