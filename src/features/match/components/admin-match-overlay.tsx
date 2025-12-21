"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Play, X, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getActiveThemes } from "@/features/themes/actions"
import { startMatch, startMatchCountdown } from "@/features/match/actions/match-actions"

interface Theme {
  id: string
  title: string
  description: string | null
}

interface AdminMatchOverlayProps {
  open: boolean
  onClose: () => void
  player1Id: string
  player2Id: string
}

export function AdminMatchOverlay({
  open,
  onClose,
  player1Id,
  player2Id,
}: AdminMatchOverlayProps) {
  const router = useRouter()
  const [duration, setDuration] = useState([5]) // minutes
  const [themeMode, setThemeMode] = useState<"random" | "manual">("random")
  const [selectedThemeId, setSelectedThemeId] = useState<string>("")
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const loadThemes = useCallback(async () => {
    const result = await getActiveThemes()
    if (result.success && result.data) {
      setThemes(result.data)
      if (result.data.length > 0) {
        setSelectedThemeId(result.data[0].id)
      }
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadThemes()
    }
  }, [open, loadThemes])

  const handleStart = async () => {
    if (themes.length === 0) {
      alert("Keine Themen verfügbar!")
      return
    }

    setLoading(true)

    // Select theme
    let themeId = selectedThemeId
    if (themeMode === "random") {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)]
      themeId = randomTheme.id
    }

    // Create match
    const result = await startMatch({
      player1Id,
      player2Id,
      themeId,
      duration: duration[0],
    })

    if (!result.success) {
      alert(result.error)
      setLoading(false)
      return
    }

    const matchId = result.data!.matchId

    // Start countdown
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          return null
        }
        return prev - 1
      })
    }, 1000)

    // After countdown, start match and navigate
    setTimeout(async () => {
      await startMatchCountdown(matchId)
      router.push(`/tournament/match/${matchId}`)
    }, 3500)
  }

  if (countdown !== null) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-9xl font-black text-primary animate-pulse">
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <p className="text-muted-foreground mt-4">Match startet...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            Match Konfiguration
          </DialogTitle>
          <DialogDescription>
            Wähle Dauer und Thema für das Match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Slider */}
          <div className="space-y-3">
            <Label>Match Dauer: {duration[0]} Minuten</Label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Spieler haben {duration[0]} Minuten Zeit ihre Einkaufsliste zu erstellen
            </p>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Thema Auswahl</Label>
            <div className="flex gap-2">
              <Button
                variant={themeMode === "random" ? "default" : "outline"}
                onClick={() => setThemeMode("random")}
                className="flex-1"
              >
                <Dices className="h-4 w-4 mr-2" />
                Zufällig
              </Button>
              <Button
                variant={themeMode === "manual" ? "default" : "outline"}
                onClick={() => setThemeMode("manual")}
                className="flex-1"
              >
                Manuell
              </Button>
            </div>

            {themeMode === "manual" && (
              <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Thema wählen" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {themeMode === "random" && (
              <p className="text-xs text-muted-foreground">
                Ein zufälliges Thema wird ausgewählt ({themes.length} verfügbar)
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleStart} className="flex-1" disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            {loading ? "Starte..." : "Match Starten!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

