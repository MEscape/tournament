"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Lightbulb, Plus, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/sign-out-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  suggestTheme,
  getMyThemeSuggestions,
  getApprovedThemes,
} from "@/features/themes/actions"

interface ThemeSuggestion {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  reviewNote: string | null
}

interface ApprovedTheme {
  id: string
  title: string
  description: string | null
}

interface ThemesClientProps {
  user?: {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export function ThemesClient({ user }: ThemesClientProps) {
  const [mysuggestions, setMySuggestions] = useState<ThemeSuggestion[]>([])
  const [approvedThemes, setApprovedThemes] = useState<ApprovedTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const [approved, my] = await Promise.all([
        getApprovedThemes(),
        user ? getMyThemeSuggestions() : Promise.resolve({ success: true, data: [] }),
      ])

      if (approved.success && approved.data) {
        setApprovedThemes(approved.data)
      }
      if (my.success && my.data) {
        setMySuggestions(my.data)
      }
      setLoading(false)
    }

    loadData()
  }, [user])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Bitte Titel eingeben")
      return
    }

    setSubmitting(true)
    const result = await suggestTheme({ title, description })
    if (result.success) {
      setTitle("")
      setDescription("")
      setDialogOpen(false)
      // Reload data
      const my = await getMyThemeSuggestions()
      if (my.success && my.data) {
        setMySuggestions(my.data)
      }
    } else {
      alert(result.error)
    }
    setSubmitting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-orange-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Angenommen"
      case "REJECTED":
        return "Abgelehnt"
      default:
        return "Ausstehend"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-500"
      case "REJECTED":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-orange-500/20 text-orange-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Lädt...</p>
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
              <Lightbulb className="h-12 w-12 text-primary" />
              Themen-Vorschläge
            </h1>
            <p className="text-muted-foreground text-lg">
              Schlage neue Themen vor oder sieh dir genehmigte Themen an
            </p>
          </div>
          {user && <SignOutButton />}
        </div>

        {/* Actions */}
        <div className="mb-8">
          {user ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-5 w-5 mr-2" />
                  Thema vorschlagen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Thema vorschlagen</DialogTitle>
                  <DialogDescription>
                    Schlage ein neues Thema für zukünftige Matches vor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Titel*</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. Künstliche Intelligenz"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beschreibung (optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Kurze Beschreibung des Themas"
                      maxLength={200}
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !title.trim()}
                    className="w-full"
                  >
                    {submitting ? "Wird eingereicht..." : "Vorschlagen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
              <p className="text-muted-foreground">
                Melde dich an, um Themen vorzuschlagen
              </p>
            </Card>
          )}
        </div>

        {/* My Suggestions */}
        {user && mysuggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Meine Vorschläge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mysuggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="p-4 bg-card/50 backdrop-blur border-primary/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    {getStatusIcon(suggestion.status)}
                  </div>
                  {suggestion.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                  )}
                  <Badge className={getStatusColor(suggestion.status)}>
                    {getStatusText(suggestion.status)}
                  </Badge>
                  {suggestion.reviewNote && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Admin-Notiz: {suggestion.reviewNote}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approved Themes */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Genehmigte Themen</h2>
          {approvedThemes.length === 0 ? (
            <Card className="p-12 text-center bg-card/30 backdrop-blur border-dashed">
              <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground">
                Noch keine genehmigten Themen
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedThemes.map((theme) => (
                <Card
                  key={theme.id}
                  className="p-4 bg-green-500/10 backdrop-blur border-green-500/30"
                >
                  <h3 className="font-semibold text-lg mb-2">{theme.title}</h3>
                  {theme.description && (
                    <p className="text-sm text-muted-foreground">
                      {theme.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

