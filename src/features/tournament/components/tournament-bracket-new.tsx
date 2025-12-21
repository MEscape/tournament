"use client"

import { useState } from "react"
import Image from "next/image"
import { Trophy, Crown, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Match } from "../store/tournament-store"
import { AdminMatchOverlay } from "@/features/match/components/admin-match-overlay"
import { GlobalNavigation } from "@/components/global-navigation"

interface TournamentBracketProps {
  matches: Match[]
  totalRounds: number
  currentUser: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export function TournamentBracketNew({
  matches,
  totalRounds,
  currentUser,
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const isAdmin = currentUser.role === "ADMIN"

  // Group matches by round
  const matchesByRound: Record<number, Match[]> = {}
  matches.forEach((match) => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = []
    }
    matchesByRound[match.round].push(match)
  })

  const handleStartMatch = (match: Match) => {
    if (!match.player1 || !match.player2) return
    setSelectedMatch(match)
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

      {/* Global Navigation */}
      <GlobalNavigation user={currentUser} />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-8 pt-24">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Tournament Bracket</h1>
                <p className="text-muted-foreground">Spectator Mode - Matches verwalten</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold">Tournament Bracket</h1>
              <p className="text-muted-foreground">Du spielst als {currentUser.username}</p>
            </div>
          )}
        </div>

        {/* Bracket - Horizontal Scroll */}
        <div className="overflow-x-auto pb-8">
          <div className="inline-flex gap-8 min-w-full">
            {Array.from({ length: totalRounds }, (_, roundIndex) => {
              const roundMatches = matchesByRound[roundIndex + 1] || []

              return (
                <div key={roundIndex} className="flex-shrink-0" style={{ width: "320px" }}>
                  {/* Round Header */}
                  <div className="text-center mb-6">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {roundIndex === totalRounds - 1 ? (
                        <span className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Finale
                        </span>
                      ) : (
                        `Runde ${roundIndex + 1}`
                      )}
                    </Badge>
                  </div>

                  {/* Matches */}
                  <div className="space-y-6">
                    {roundMatches.map((match) => (
                      <Card
                        key={match.id}
                        className="p-4 bg-card/50 backdrop-blur border-primary/20"
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-xs">
                            Match {match.matchNumber}
                          </Badge>
                          {match.status === "completed" ? (
                            <Badge className="bg-green-500/20 text-green-500">
                              Abgeschlossen
                            </Badge>
                          ) : match.status === "bye" ? (
                            <Badge className="bg-blue-500/20 text-blue-500">BYE</Badge>
                          ) : (
                            <Badge className="bg-orange-500/20 text-orange-500">Pending</Badge>
                          )}
                        </div>

                        {/* Player 1 */}
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                            match.winner?.userId === match.player1?.userId
                              ? "bg-green-500/10 border border-green-500"
                              : "bg-muted/30"
                          }`}
                        >
                          {match.player1 ? (
                            <>
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={match.player1.imageUrl}
                                  alt={match.player1.username}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium truncate">{match.player1.username}</span>
                              {match.winner?.userId === match.player1.userId && (
                                <Trophy className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">TBD</span>
                          )}
                        </div>

                        {/* VS */}
                        <div className="text-center text-xs text-muted-foreground my-1">VS</div>

                        {/* Player 2 */}
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            match.winner?.userId === match.player2?.userId
                              ? "bg-green-500/10 border border-green-500"
                              : "bg-muted/30"
                          }`}
                        >
                          {match.player2 ? (
                            <>
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={match.player2.imageUrl}
                                  alt={match.player2.username}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium truncate">{match.player2.username}</span>
                              {match.winner?.userId === match.player2.userId && (
                                <Trophy className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                            </>
                          ) : match.status === "bye" ? (
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                              <span>BYE</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">TBD</span>
                          )}
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && match.status === "pending" && match.player1 && match.player2 && (
                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => handleStartMatch(match)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Match Starten
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Admin Match Overlay - nur für Admins */}
      {isAdmin && selectedMatch && (
        <AdminMatchOverlay
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          player1Id={selectedMatch.player1!.userId}
          player2Id={selectedMatch.player2!.userId}
        />
      )}
    </div>
  )
}

