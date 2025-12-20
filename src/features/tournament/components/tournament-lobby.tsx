"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Users, Crown, LogOut, Play, UserX, Check, X, Lightbulb, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/sign-out-button"
import { useTournament } from "../tournament-provider"
import {
  toggleReady,
  kickPlayer,
  joinTournament,
  leaveTournament,
} from "../actions/tournament-actions"
import { startMatchDrawing } from "../actions/match-actions"

interface TournamentLobbyProps {
  user: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export function TournamentLobby({ user }: TournamentLobbyProps) {
  const { players, loading, stats, refresh } = useTournament()
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  const isAdmin = user.role === "ADMIN"
  const currentPlayer = players.find((p) => p.userId === user.id)
  const isJoined = !!currentPlayer

  const handleJoin = async () => {
    setActionLoading(true)
    console.log("[Lobby] Join button clicked")
    const result = await joinTournament()
    console.log("[Lobby] Join result:", result)
    if (!result.success) {
      alert(result.error)
    } else {
      console.log("[Lobby] Join successful, refreshing...")
      // Refresh manually to show update immediately
      await refresh()
    }
    setActionLoading(false)
  }

  const handleLeave = async () => {
    if (!confirm("Möchtest du das Turnier wirklich verlassen?")) return
    setActionLoading(true)
    const result = await leaveTournament()
    if (!result.success) {
      alert(result.error)
    }
    setActionLoading(false)
  }

  const handleToggleReady = async () => {
    setActionLoading(true)
    const result = await toggleReady()
    if (!result.success) {
      alert(result.error)
    }
    setActionLoading(false)
  }

  const handleKick = async (userId: string) => {
    if (!confirm("Spieler wirklich entfernen?")) return
    setActionLoading(true)
    const result = await kickPlayer(userId)
    if (!result.success) {
      alert(result.error)
    }
    setActionLoading(false)
  }

  const handleStartMatch = async () => {
    if (stats.ready !== stats.total) {
      if (
        !confirm(
          `Nicht alle Spieler sind bereit (${stats.ready}/${stats.total}). Trotzdem starten?`
        )
      ) {
        return
      }
    }

    if (stats.total < 2) {
      alert("Mindestens 2 Spieler benötigt!")
      return
    }

    setActionLoading(true)
    const result = await startMatchDrawing()
    if (result.success) {
      console.log("[Lobby] Match drawing started, navigating to bracket...")
      // Navigate to bracket with drawing animation
      router.push("/tournament/bracket")
    } else {
      alert(result.error)
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
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
        <p className="relative z-10 text-muted-foreground text-lg">Lädt...</p>
      </div>
    )
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
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-3 flex items-center gap-3">
              🎆 Tournament Lobby
            </h1>
            <p className="text-muted-foreground text-lg">
              {isAdmin ? "👑 Admin Panel" : `Willkommen, ${user.username}!`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            {!isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/themes" className="cursor-pointer">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Themen vorschlagen
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <SignOutButton />
          </div>
        </div>

        {/* Stats Bar */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Spieler</p>
                  <p className="text-2xl font-bold">
                    {stats.total} / {stats.maxPlayers}
                  </p>
                </div>
              </div>

              <div className="h-12 w-px bg-border" />

              <div className="flex items-center gap-3">
                <Check className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Bereit</p>
                  <p className="text-2xl font-bold text-green-500">{stats.ready}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <X className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Nicht Bereit</p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.total - stats.ready}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isJoined && !isAdmin && (
                <Button
                  onClick={handleJoin}
                  disabled={actionLoading || stats.total >= stats.maxPlayers}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Beitreten
                </Button>
              )}

              {isJoined && !isAdmin && (
                <>
                  <Button
                    onClick={handleToggleReady}
                    disabled={actionLoading}
                    size="lg"
                    variant={currentPlayer?.isReady ? "outline" : "default"}
                    className={
                      currentPlayer?.isReady
                        ? "border-green-500 text-green-500 hover:bg-green-500/10"
                        : "bg-primary hover:bg-primary/90"
                    }
                  >
                    {currentPlayer?.isReady ? "✓ Bereit" : "Bereit machen"}
                  </Button>

                  <Button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    size="lg"
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Verlassen
                  </Button>
                </>
              )}

              {isAdmin && (
                <Button
                  onClick={handleStartMatch}
                  disabled={actionLoading || stats.total < 2}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Match Starten
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Player Grid */}
        {players.length === 0 ? (
          <Card className="p-12 text-center bg-card/30 backdrop-blur border-dashed">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl text-muted-foreground">
              Noch keine Spieler im Turnier
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Warte darauf, dass Spieler beitreten...
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => (
              <Card
                key={player.userId}
                className={`p-4 transition-all duration-200 ${
                  player.isReady
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-card/50 border-primary/20"
                } ${player.userId === user.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={player.imageUrl}
                        alt={player.username}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {player.isReady && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{player.username}</p>
                      {player.role === "ADMIN" && (
                        <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    <Badge
                      variant={player.isReady ? "default" : "secondary"}
                      className={
                        player.isReady
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500/20 text-red-500"
                      }
                    >
                      {player.isReady ? "Bereit" : "Warte"}
                    </Badge>

                    {isAdmin && player.userId !== user.id && (
                      <Button
                        onClick={() => handleKick(player.userId)}
                        disabled={actionLoading}
                        size="sm"
                        variant="ghost"
                        className="mt-2 w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Entfernen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

