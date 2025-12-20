// ============================================
// TOURNAMENT STORE - In-Memory State Management
// ============================================
// Alle Tournament-Daten (Players, Matches, Status) werden hier verwaltet.
// Kein Prisma - Pure In-Memory für Performance!
//
// Erweiterbarkeit:
// - Neue Status hinzufügen? → TournamentStatus enum erweitern
// - Match History? → private matchHistory: Match[] = [] hinzufügen
// - Persistence? → saveToDB() / loadFromDB() methods hinzufügen
// ============================================

// ============================================
// TYPES - Exportiert für Components/Actions
// ============================================

export interface TournamentPlayer {
  userId: string
  username: string
  imageUrl: string
  role: "ADMIN" | "USER"
  isReady: boolean
  joinedAt: number
}

export type TournamentStatus = "LOBBY" | "DRAWING" | "RUNNING" | "FINISHED"

export interface Match {
  id: string
  round: number
  matchNumber: number
  player1: TournamentPlayer | null
  player2: TournamentPlayer | null
  winner: TournamentPlayer | null
  status: "pending" | "completed" | "bye"
}

export interface TournamentStats {
  total: number
  ready: number
  maxPlayers: number
  status: TournamentStatus
}

// ============================================
// TOURNAMENT STORE CLASS
// ============================================

class TournamentStore {
  // State
  private players: Map<string, TournamentPlayer> = new Map()
  private matches: Match[] = []
  private status: TournamentStatus = "LOBBY"
  private totalRounds: number = 0

  // Config (leicht anpassbar)
  private readonly MAX_PLAYERS = 16

  // ============================================
  // PLAYER MANAGEMENT
  // ============================================

  getPlayers(): TournamentPlayer[] {
    return Array.from(this.players.values()).sort((a, b) => a.joinedAt - b.joinedAt)
  }

  getPlayer(userId: string): TournamentPlayer | undefined {
    return this.players.get(userId)
  }

  addPlayer(player: TournamentPlayer): boolean {
    // Validation
    if (this.status !== "LOBBY") {
      console.log(`[Store] Cannot join - status is ${this.status}`)
      return false
    }
    if (this.players.has(player.userId)) {
      console.log(`[Store] Player ${player.username} already joined`)
      return false
    }
    if (this.players.size >= this.MAX_PLAYERS) {
      console.log(`[Store] Tournament full`)
      return false
    }

    // Add player
    this.players.set(player.userId, player)
    console.log(`[Store] Player ${player.username} joined! Total: ${this.players.size}`)
    return true
  }

  updatePlayer(userId: string, updates: Partial<TournamentPlayer>): boolean {
    const player = this.players.get(userId)
    if (!player) return false

    Object.assign(player, updates)
    console.log(`[Store] Player ${player.username} updated`)
    return true
  }

  removePlayer(userId: string): boolean {
    if (this.status !== "LOBBY") {
      console.log(`[Store] Cannot leave - status is ${this.status}`)
      return false
    }

    const player = this.players.get(userId)
    const removed = this.players.delete(userId)
    if (removed && player) {
      console.log(`[Store] Player ${player.username} left! Total: ${this.players.size}`)
    }
    return removed
  }

  // ============================================
  // TOURNAMENT STATUS MANAGEMENT
  // ============================================

  getStatus(): TournamentStatus {
    return this.status
  }

  setStatus(status: TournamentStatus): void {
    console.log(`[Store] Status changed: ${this.status} → ${status}`)
    this.status = status
  }

  // ============================================
  // MATCH MANAGEMENT
  // ============================================

  setMatches(matches: Match[], totalRounds: number): void {
    this.matches = matches
    this.totalRounds = totalRounds
    console.log(`[Store] Set ${matches.length} matches with ${totalRounds} rounds`)
  }

  getMatches(): Match[] {
    return this.matches
  }

  getTotalRounds(): number {
    return this.totalRounds
  }

  updateMatchWinner(matchId: string, winnerId: string): boolean {
    const match = this.matches.find((m) => m.id === matchId)
    if (!match) {
      console.log(`[Store] Match ${matchId} not found`)
      return false
    }

    const winner = match.player1?.userId === winnerId ? match.player1 : match.player2
    if (!winner) {
      console.log(`[Store] Winner ${winnerId} not in match ${matchId}`)
      return false
    }

    match.winner = winner
    match.status = "completed"

    console.log(`[Store] Match ${matchId} winner: ${winner.username}`)
    return true
  }

  // ============================================
  // STATS & HELPERS
  // ============================================

  getStats(): TournamentStats {
    const total = this.players.size
    const ready = Array.from(this.players.values()).filter((p) => p.isReady).length
    return {
      total,
      ready,
      maxPlayers: this.MAX_PLAYERS,
      status: this.status,
    }
  }

  // ============================================
  // RESET & CLEANUP
  // ============================================

  reset(): void {
    console.log(
      `[Store] Reset - clearing ${this.players.size} players and ${this.matches.length} matches`
    )
    this.players.clear()
    this.matches = []
    this.totalRounds = 0
    this.status = "LOBBY"
  }

  // Deprecated - use reset()
  clear(): void {
    this.reset()
  }
}

// ============================================
// SINGLETON EXPORT (with Hot-Reload Support)
// ============================================

const globalForStore = globalThis as unknown as {
  tournamentStore: TournamentStore | undefined
}

export const tournamentStore = globalForStore.tournamentStore ?? new TournamentStore()

// In development, preserve store across hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForStore.tournamentStore = tournamentStore
}

