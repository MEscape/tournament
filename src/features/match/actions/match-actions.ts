"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { matchStore } from "../store/match-store"
import type { ApiResponse } from "@/types/api.types"
import type { ActiveMatchData } from "../store/match-store"

// ============================================
// START MATCH
// ============================================

export async function startMatch(data: {
  player1Id: string
  player2Id: string
  themeId: string
  duration: number // in minutes
}): Promise<ApiResponse<{ matchId: string }>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    // Get theme
    const theme = await prisma.theme.findUnique({
      where: { id: data.themeId },
    })

    if (!theme) {
      return { success: false, error: "Thema nicht gefunden" }
    }

    // Get players (from tournament store - they should be TournamentPlayer objects)
    const { tournamentStore } = await import("@/features/tournament/store/tournament-store")
    const player1 = tournamentStore.getPlayer(data.player1Id)
    const player2 = tournamentStore.getPlayer(data.player2Id)

    if (!player1 || !player2) {
      return { success: false, error: "Spieler nicht gefunden" }
    }

    // Create match in memory
    const now = Date.now()
    const durationSeconds = data.duration * 60
    const match = matchStore.createMatch({
      themeId: theme.id,
      theme: {
        title: theme.title,
        shop: theme.shop,
        budget: theme.budget,
        preferences: theme.preferences,
      },
      duration: durationSeconds,
      startedAt: now,
      endsAt: now + durationSeconds * 1000,
      player1: {
        userId: player1.userId,
        username: player1.username,
        imageUrl: player1.imageUrl,
        list: "",
      },
      player2: {
        userId: player2.userId,
        username: player2.username,
        imageUrl: player2.imageUrl,
        list: "",
      },
      status: "PENDING", // Will be set to RUNNING after countdown
    })

    // Save to database removed - we keep everything in-memory!
    // Only matchStore is used for active matches

    return {
      success: true,
      data: { matchId: match.id },
    }
  } catch (error) {
    console.error("Start match error:", error)
    return { success: false, error: "Fehler beim Starten des Matches" }
  }
}

// ============================================
// UPDATE PLAYER LIST (Realtime)
// ============================================

export async function updatePlayerList(data: {
  matchId: string
  list: string
}): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    const success = matchStore.updatePlayerList(data.matchId, session.user.id, data.list)

    if (!success) {
      return { success: false, error: "Match nicht gefunden" }
    }

    // In-memory only - no database update needed

    return { success: true }
  } catch (error) {
    console.error("Update player list error:", error)
    return { success: false, error: "Fehler beim Aktualisieren" }
  }
}

// ============================================
// GET MATCH STATE (für Player)
// ============================================

export async function getMatchState(matchId: string): Promise<
  ApiResponse<{
    match: ActiveMatchData
    isPlayer1: boolean
    remainingTime: number
  }>
> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    const match = matchStore.getMatch(matchId)
    if (!match) {
      return { success: false, error: "Match nicht gefunden" }
    }

    const isPlayer1 = match.player1.userId === session.user.id
    const isPlayer2 = match.player2.userId === session.user.id

    if (!isPlayer1 && !isPlayer2 && session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    const now = Date.now()
    const remainingTime = Math.max(0, Math.floor((match.endsAt - now) / 1000))

    return {
      success: true,
      data: {
        match,
        isPlayer1,
        remainingTime,
      },
    }
  } catch (error) {
    console.error("Get match state error:", error)
    return { success: false, error: "Fehler beim Laden" }
  }
}

// ============================================
// GET ALL MATCHES (für Admin Dashboard)
// ============================================

export async function getAllActiveMatches(): Promise<ApiResponse<ActiveMatchData[]>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    const matches = matchStore.getAllMatches()

    return {
      success: true,
      data: matches,
    }
  } catch (error) {
    console.error("Get all matches error:", error)
    return { success: false, error: "Fehler beim Laden" }
  }
}

// ============================================
// START MATCH COUNTDOWN (set to RUNNING)
// ============================================

export async function startMatchCountdown(matchId: string): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    matchStore.updateStatus(matchId, "RUNNING")

    // In-memory only - no database update needed

    return { success: true }
  } catch (error) {
    console.error("Start countdown error:", error)
    return { success: false, error: "Fehler beim Starten" }
  }
}

