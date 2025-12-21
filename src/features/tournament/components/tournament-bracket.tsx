"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Crown, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/sign-out-button"

interface Player {
  userId: string
  username: string
  imageUrl: string
  role: "ADMIN" | "USER"
}

interface Match {
  id: string
  round: number
  matchNumber: number
  player1: Player | null
  player2: Player | null
  winner: Player | null
  status: "pending" | "completed" | "bye"
}

interface TournamentBracketProps {
  matches: Match[]
  totalRounds: number
  currentUser: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
  onSelectWinner?: (matchId: string, winnerId: string) => void
}

export function TournamentBracket({
  matches,
  totalRounds,
  currentUser,
  onSelectWinner,
}: TournamentBracketProps) {
  const isAdmin = currentUser.role === "ADMIN"
  const isPlayer = matches.some(
    (m) => m.player1?.userId === currentUser.id || m.player2?.userId === currentUser.id
  )
  const isSpectator = isAdmin || !isPlayer

  // Group matches by round
  const matchesByRound: Match[][] = []
  for (let round = 1; round <= totalRounds; round++) {
    matchesByRound.push(matches.filter((m) => m.round === round))
  }

  const handleSelectWinner = (matchId: string, winnerId: string) => {
    if (onSelectWinner && isAdmin) {
      onSelectWinner(matchId, winnerId)
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-3 flex items-center gap-3">
              <Trophy className="h-12 w-12 text-primary" />
              Tournament Bracket
            </h1>
            <p className="text-muted-foreground text-lg">
              {isSpectator ? (
                <>
                  <Crown className="inline h-5 w-5 mr-2" />
                  Spectator Mode
                </>
              ) : (
                `Viel Erfolg, ${currentUser.username}!`
              )}
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Bracket */}
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-max">
            {matchesByRound.map((roundMatches, roundIndex) => (
              <div key={roundIndex} className="flex flex-col justify-around gap-4 min-w-[300px]">
                {/* Round Header */}
                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {roundIndex === totalRounds - 1 ? (
                      <span className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Finale
                      </span>
                    ) : (
                      `Runde ${roundIndex + 1}`
                    )}
                  </Badge>
                </div>

                {/* Matches */}
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isAdmin={isAdmin}
                    currentUserId={currentUser.id}
                    onSelectWinner={handleSelectWinner}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Player Info (if participating) */}
        {!isSpectator && (
          <div className="fixed bottom-8 right-8 bg-card/90 backdrop-blur border-2 border-primary rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                <Image
                  src={currentUser.imageUrl}
                  alt={currentUser.username}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Du spielst als</p>
                <p className="font-bold text-foreground">{currentUser.username}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Match Card Component
function MatchCard({
  match,
  isAdmin,
  currentUserId,
  onSelectWinner,
}: {
  match: Match
  isAdmin: boolean
  currentUserId: string
  onSelectWinner: (matchId: string, winnerId: string) => void
}) {
  const isUserMatch =
    match.player1?.userId === currentUserId || match.player2?.userId === currentUserId
  const isCompleted = match.status === "completed"
  const isBye = match.status === "bye"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-card border-2 rounded-xl p-4 ${
        isUserMatch ? "border-primary shadow-lg shadow-primary/20" : "border-border"
      }`}
    >
      {/* Player 1 */}
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          match.winner?.userId === match.player1?.userId
            ? "bg-green-500/20 border-2 border-green-500"
            : "bg-secondary"
        }`}
      >
        {match.player1 && (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={match.player1.imageUrl}
                alt={match.player1.username}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold flex-1">{match.player1.username}</span>
            {match.winner?.userId === match.player1.userId && (
              <Trophy className="h-5 w-5 text-green-500" />
            )}
            {isAdmin && !isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectWinner(match.id, match.player1!.userId)}
                className="text-xs"
              >
                Winner
              </Button>
            )}
          </>
        )}
        {!match.player1 && <span className="text-muted-foreground italic">TBD</span>}
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center my-2">
        <span className="text-xs font-bold text-muted-foreground">VS</span>
      </div>

      {/* Player 2 */}
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          match.winner?.userId === match.player2?.userId
            ? "bg-green-500/20 border-2 border-green-500"
            : "bg-secondary"
        }`}
      >
        {match.player2 && (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={match.player2.imageUrl}
                alt={match.player2.username}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold flex-1">{match.player2.username}</span>
            {match.winner?.userId === match.player2.userId && (
              <Trophy className="h-5 w-5 text-green-500" />
            )}
            {isAdmin && !isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectWinner(match.id, match.player2!.userId)}
                className="text-xs"
              >
                Winner
              </Button>
            )}
          </>
        )}
        {!match.player2 && !isBye && (
          <span className="text-muted-foreground italic">TBD</span>
        )}
        {isBye && <span className="text-muted-foreground italic">BYE</span>}
      </div>

      {/* Match Status */}
      {isCompleted && (
        <div className="mt-3 text-center">
          <Badge variant="default" className="bg-green-500">
            Abgeschlossen
          </Badge>
        </div>
      )}
    </motion.div>
  )
}

