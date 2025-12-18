"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/features/auth/actions"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginAction({ username, password })

      if (result.success) {
        // Admin wird zum Admin Dashboard weitergeleitet
        router.push("/admin")
        router.refresh()
      } else {
        setError(result.error || "Login fehlgeschlagen")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      {/* Content */}
      <Card className="relative z-10 max-w-md w-full p-8 bg-card/90 backdrop-blur-sm border-border">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Sichere Anmeldung mit Admin-Berechtigung
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                required
                autoComplete="username"
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                required
                autoComplete="current-password"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || !username || !password}
            >
              {loading ? "Wird angemeldet..." : "Als Admin anmelden"}
            </Button>

            <div className="text-center">
              <Link
                href="/welcome"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Zurück zur Startseite
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

