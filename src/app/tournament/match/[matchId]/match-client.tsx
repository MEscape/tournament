"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Clock, ShoppingCart, Euro, List as ListIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { GlobalNavigation } from "@/components/global-navigation"
import { getMatchState, updatePlayerList } from "@/features/match/actions/match-actions"
import type { ActiveMatchData } from "@/features/match/store/match-store"

interface MatchClientProps {
  matchId: string
  user: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export function MatchClient({ matchId, user }: MatchClientProps) {
  const router = useRouter()
  const [match, setMatch] = useState<ActiveMatchData | null>(null)
  const [isPlayer1, setIsPlayer1] = useState(false)
  const [myList, setMyList] = useState("")
  const [remainingTime, setRemainingTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAdmin = user.role === "ADMIN"
  const isPlayer = match?.player1.userId === user.id || match?.player2.userId === user.id

  // Load match state
  const loadMatch = useCallback(async () => {
    const result = await getMatchState(matchId)
    if (!result.success) {
      alert(result.error)
      router.push("/tournament/bracket")
      return
    }

    setMatch(result.data!.match)
    setIsPlayer1(result.data!.isPlayer1)
    setRemainingTime(result.data!.remainingTime)

    // Set initial list only if not already set
    if (loading) {
      if (result.data!.isPlayer1) {
        setMyList(result.data!.match.player1.list)
      } else if (result.data!.match.player2.userId === user.id) {
        setMyList(result.data!.match.player2.list)
      }
      setLoading(false)
    }
  }, [matchId, router, user.id, loading])

  // Save list
  const saveList = useCallback(async () => {
    if (saving) return
    setSaving(true)

    await updatePlayerList({
      matchId,
      list: myList,
    })

    setSaving(false)
  }, [matchId, myList, saving])

  // Load initial state
  useEffect(() => {
    loadMatch()
  }, [loadMatch])

  // Auto-save list every 2 seconds
  useEffect(() => {
    if (!isPlayer || !match) return

    const interval = setInterval(() => {
      if (myList !== (isPlayer1 ? match.player1.list : match.player2.list)) {
        saveList()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [myList, isPlayer, match, isPlayer1, saveList])

  // Timer countdown
  useEffect(() => {
    if (!match || match.status !== "RUNNING") return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((match.endsAt - now) / 1000))
      setRemainingTime(remaining)

      if (remaining === 0) {
        // Time's up!
        setTimeout(() => {
          router.push("/tournament/bracket")
        }, 2000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [match, router])

  // Polling for updates (but not initial load)
  useEffect(() => {
    if (!match || loading) return

    const interval = setInterval(() => {
      loadMatch()
    }, 3000)

    return () => clearInterval(interval)
  }, [match, loading, loadMatch])

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Lädt Match...</p>
      </div>
    )
  }

  const progressPercent = (remainingTime / match.duration) * 100
  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  const opponent = isPlayer1 ? match.player2 : match.player1

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
      <GlobalNavigation user={user} />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-8 pt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Theme Header */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{match.theme.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {match.theme.shop && (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{match.theme.shop}</span>
                    </div>
                  )}
                  {match.theme.budget && (
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span>{(match.theme.budget / 100).toFixed(2)} €</span>
                    </div>
                  )}
                  {match.theme.preferences && (
                    <div className="flex items-center gap-2">
                      <ListIcon className="h-4 w-4" />
                      <span>{match.theme.preferences}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Timer */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-semibold">Verbleibende Zeit</span>
              </div>
              <div className="text-3xl font-mono font-bold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </Card>

          {/* Player Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My List (or Player 1 if Admin) */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={isPlayer ? user.imageUrl : match.player1.imageUrl}
                    alt={isPlayer ? user.username : match.player1.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold">
                    {isPlayer ? "Deine Einkaufsliste" : match.player1.username}
                  </h2>
                  {saving && <p className="text-xs text-muted-foreground">Speichert...</p>}
                </div>
              </div>

              {isPlayer && !isAdmin ? (
                <Textarea
                  value={myList}
                  onChange={(e) => setMyList(e.target.value)}
                  placeholder="Schreibe deine Einkaufsliste hier...&#10;Beispiel:&#10;- Batterien (10 Stück) - 8€&#10;- Wunderkerzen (5 Packungen) - 12€&#10;- Feuerwerk Sortiment - 25€"
                  className="min-h-[400px] font-mono text-sm"
                  disabled={remainingTime === 0}
                />
              ) : (
                <div className="min-h-[400px] p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                  {match.player1.list || "Noch nichts geschrieben..."}
                </div>
              )}
            </Card>

            {/* Opponent List (blurred for players) */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={opponent.imageUrl}
                    alt={opponent.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold">{opponent.username}</h2>
                </div>
              </div>

              {isAdmin ? (
                // Admin sees full list
                <div className="min-h-[400px] p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                  {opponent.list || "Noch nichts geschrieben..."}
                </div>
              ) : (
                // Players see blurred placeholder
                <div className="relative min-h-[400px]">
                  <div className="absolute inset-0 p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap blur-lg select-none pointer-events-none">
                    ████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████&#10;████████████████████████
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur px-6 py-3 rounded-lg">
                      <p className="text-muted-foreground font-semibold">
                        Liste des Gegners ist verborgen
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Time's Up Message */}
          {remainingTime === 0 && (
            <Card className="p-6 bg-primary/20 backdrop-blur text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Zeit abgelaufen!</h2>
              <p className="text-muted-foreground">Weiterleitung zum Bracket...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

