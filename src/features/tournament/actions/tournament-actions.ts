"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { tournamentStore } from "../store/tournament-store"
import type { ApiResponse } from "@/types/api.types"

const MAX_PLAYERS = 16

export async function joinTournament(): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    // Admins cannot join - they are spectators only
    if (session.user.role === "ADMIN") {
      return { success: false, error: "Admins können nicht am Turnier teilnehmen" }
    }

    console.log(`[Action] User ${session.user.username} attempting to join tournament`)

    const success = tournamentStore.addPlayer({
      userId: session.user.id,
      username: session.user.username,
      imageUrl: session.user.imageUrl,
      role: session.user.role,
      isReady: false,
      joinedAt: Date.now(),
    })

    if (!success) {
      const stats = tournamentStore.getStats()
      console.log(`[Action] Join failed for ${session.user.username}. Stats:`, stats)
      if (stats.total >= MAX_PLAYERS) {
        return { success: false, error: "Turnier ist voll (max 16 Spieler)" }
      }
      return { success: false, error: "Du bist bereits im Turnier" }
    }

    console.log(`[Action] User ${session.user.username} successfully joined!`)
    revalidatePath("/tournament")
    return { success: true }
  } catch (error) {
    console.error("Join error:", error)
    return { success: false, error: "Fehler beim Beitreten" }
  }
}

export async function toggleReady(): Promise<ApiResponse<{ isReady: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    const player = tournamentStore.getPlayer(session.user.id)
    if (!player) {
      return { success: false, error: "Nicht im Turnier" }
    }

    const newReadyState = !player.isReady
    tournamentStore.updatePlayer(session.user.id, { isReady: newReadyState })

    revalidatePath("/tournament")
    return { success: true, data: { isReady: newReadyState } }
  } catch (error) {
    console.error("Toggle ready error:", error)
    return { success: false, error: "Fehler beim Ändern des Status" }
  }
}

export async function leaveTournament(): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    tournamentStore.removePlayer(session.user.id)

    revalidatePath("/tournament")
    return { success: true }
  } catch (error) {
    console.error("Leave error:", error)
    return { success: false, error: "Fehler beim Verlassen" }
  }
}

export async function kickPlayer(userId: string): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    tournamentStore.removePlayer(userId)

    revalidatePath("/tournament")
    return { success: true }
  } catch (error) {
    console.error("Kick error:", error)
    return { success: false, error: "Fehler beim Entfernen" }
  }
}



