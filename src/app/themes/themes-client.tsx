"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Lightbulb, Plus, CheckCircle, XCircle, Clock, ShoppingCart, Euro, List, Crown } from "lucide-react"
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
  getAllThemeSuggestions,
  reviewThemeSuggestion,
} from "@/features/themes/actions"

interface ThemeSuggestion {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  reviewNote: string | null
  shop: string | null
  budget: number | null
  preferences: string | null
}

interface ApprovedTheme {
  id: string
  title: string
  description: string | null
}

interface AllSuggestion extends ThemeSuggestion {
  user: { username: string }
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
  const [allSuggestions, setAllSuggestions] = useState<AllSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [shop, setShop] = useState("")
  const [budget, setBudget] = useState("")
  const [preferences, setPreferences] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user?.role === "ADMIN"

  useEffect(() => {
    const loadData = async () => {
      const results = await Promise.all([
        getApprovedThemes(),
        user ? getMyThemeSuggestions() : Promise.resolve({ success: true, data: [] }),
        isAdmin ? getAllThemeSuggestions() : Promise.resolve({ success: true, data: [] }),
      ])

      const [approved, my, all] = results

      if (approved.success && approved.data) {
        setApprovedThemes(approved.data)
      }
      if (my.success && my.data) {
        setMySuggestions(my.data)
      }
      if (all.success && all.data) {
        setAllSuggestions(all.data)
      }
      setLoading(false)
    }

    loadData()
  }, [user, isAdmin])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Bitte Titel eingeben")
      return
    }

    setSubmitting(true)
    const result = await suggestTheme({
      title,
      description: description || undefined,
      shop: shop || undefined,
      budget: budget ? parseInt(budget) * 100 : undefined, // Convert Euro to Cent
      preferences: preferences || undefined,
    })
    if (result.success) {
      setTitle("")
      setDescription("")
      setShop("")
      setBudget("")
      setPreferences("")
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

  const handleReview = async (suggestionId: string, status: "APPROVED" | "REJECTED") => {
    const result = await reviewThemeSuggestion({ suggestionId, status })
    if (result.success) {
      // Reload all data
      const [all, approved] = await Promise.all([
        getAllThemeSuggestions(),
        getApprovedThemes(),
      ])
      if (all.success && all.data) {
        setAllSuggestions(all.data)
      }
      if (approved.success && approved.data) {
        setApprovedThemes(approved.data)
      }
    } else {
      alert(result.error)
    }
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                Thema vorschlagen
              </Button>
            </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neues Thema vorschlagen</DialogTitle>
                  <DialogDescription>
                    Schlage eine Einkaufsliste für zukünftige Matches vor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Titel der Einkaufsliste*</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. Silvester Einkauf 2025"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop">Laden (optional)</Label>
                    <Input
                      id="shop"
                      value={shop}
                      onChange={(e) => setShop(e.target.value)}
                      placeholder="z.B. ALDI, LIDL, Rewe"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget in € (optional)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="1"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="z.B. 50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferences">Präferenzen (optional)</Label>
                    <Input
                      id="preferences"
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="z.B. nur Batterien, viel Feuerwerk, keine Raketen"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Zusätzliche Beschreibung (optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Weitere Details zur Einkaufsliste"
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
        </div>

        {/* Admin: Pending Suggestions */}
        {isAdmin && allSuggestions.filter((s) => s.status === "PENDING").length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-orange-500 flex items-center gap-2">
              <Crown className="h-6 w-6" />
              Ausstehende Vorschläge ({allSuggestions.filter((s) => s.status === "PENDING").length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSuggestions
                .filter((s) => s.status === "PENDING")
                .map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="p-4 bg-orange-500/10 backdrop-blur border-orange-500/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                      <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    </div>

                    {/* Einkaufslisten Details */}
                    <div className="space-y-2 mb-3 text-sm">
                      {suggestion.shop && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{suggestion.shop}</span>
                        </div>
                      )}
                      {suggestion.budget && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Euro className="h-4 w-4" />
                          <span>{(suggestion.budget / 100).toFixed(2)} €</span>
                        </div>
                      )}
                      {suggestion.preferences && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <List className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{suggestion.preferences}</span>
                        </div>
                      )}
                      {suggestion.description && (
                        <p className="text-muted-foreground text-xs italic mt-2">
                          {suggestion.description}
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      Von: {suggestion.user.username}
                    </div>

                    {/* Review Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-green-500 text-green-500 hover:bg-green-500/20"
                        onClick={() => handleReview(suggestion.id, "APPROVED")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Annehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500/20"
                        onClick={() => handleReview(suggestion.id, "REJECTED")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Ablehnen
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

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

