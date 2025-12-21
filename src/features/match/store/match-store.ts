// ============================================
// MATCH STORE - In-Memory Active Matches
// ============================================

export interface ActiveMatchData {
  id: string
  themeId: string
  theme: {
    title: string
    shop: string | null
    budget: number | null
    preferences: string | null
  }
  duration: number // seconds
  startedAt: number
  endsAt: number
  player1: {
    userId: string
    username: string
    imageUrl: string
    list: string
  }
  player2: {
    userId: string
    username: string
    imageUrl: string
    list: string
  }
  status: "PENDING" | "RUNNING" | "COMPLETED"
}

class MatchStore {
  private matches: Map<string, ActiveMatchData> = new Map()

  // Create new match
  createMatch(data: Omit<ActiveMatchData, "id">): ActiveMatchData {
    const id = crypto.randomUUID()
    const match: ActiveMatchData = {
      id,
      ...data,
    }
    this.matches.set(id, match)
    console.log(`[MatchStore] Created match ${id}`)
    return match
  }

  // Get match by ID
  getMatch(matchId: string): ActiveMatchData | undefined {
    return this.matches.get(matchId)
  }

  // Get all matches
  getAllMatches(): ActiveMatchData[] {
    return Array.from(this.matches.values())
  }

  // Get running matches
  getRunningMatches(): ActiveMatchData[] {
    return Array.from(this.matches.values()).filter((m) => m.status === "RUNNING")
  }

  // Update player list
  updatePlayerList(matchId: string, playerId: string, list: string): boolean {
    const match = this.matches.get(matchId)
    if (!match) return false

    if (match.player1.userId === playerId) {
      match.player1.list = list
    } else if (match.player2.userId === playerId) {
      match.player2.list = list
    } else {
      return false
    }

    console.log(`[MatchStore] Updated list for player ${playerId} in match ${matchId}`)
    return true
  }

  // Update match status
  updateStatus(matchId: string, status: ActiveMatchData["status"]): boolean {
    const match = this.matches.get(matchId)
    if (!match) return false

    match.status = status
    console.log(`[MatchStore] Updated match ${matchId} status to ${status}`)
    return true
  }

  // Set winner
  setWinner(matchId: string, winnerId: string): boolean {
    const match = this.matches.get(matchId)
    if (!match) return false

    match.status = "COMPLETED"
    console.log(`[MatchStore] Match ${matchId} winner: ${winnerId}`)
    return true
  }

  // Delete match
  deleteMatch(matchId: string): boolean {
    const deleted = this.matches.delete(matchId)
    if (deleted) {
      console.log(`[MatchStore] Deleted match ${matchId}`)
    }
    return deleted
  }

  // Clear all matches
  clear(): void {
    console.log(`[MatchStore] Clearing all matches (${this.matches.size})`)
    this.matches.clear()
  }
}

// Singleton
const globalForMatchStore = globalThis as unknown as {
  matchStore: MatchStore | undefined
}

export const matchStore = globalForMatchStore.matchStore ?? new MatchStore()

if (process.env.NODE_ENV !== "production") {
  globalForMatchStore.matchStore = matchStore
}

