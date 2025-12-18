"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  validateAccessCode,
  registerUser,
} from "@/features/registration/actions"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [accessCode, setAccessCode] = useState("")
  const [validating, setValidating] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState("")

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidating(true)

    const result = await validateAccessCode(accessCode)

    if (result.isValid) {
      setStep(2)
    } else {
      setError(result.error || "Ungültiger Access Code")
    }

    setValidating(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password || !imageFile) {
      setError("Bitte fülle alle Pflichtfelder aus")
      return
    }

    setRegistering(true)

    const result = await registerUser({
      accessCode,
      username,
      password,
      imageFile,
    })

    if (result.success) {
      alert("Registrierung erfolgreich! Du kannst dich jetzt anmelden.")
      router.push("/login")
    } else {
      setError(result.error || "Registrierung fehlgeschlagen")
    }

    setRegistering(false)
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
              {step === 1 ? "Access Code eingeben" : "Registrierung abschließen"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1
                ? "Schritt 1 von 2"
                : "Schritt 2 von 2 - Alle Felder sind Pflicht"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Gib deinen Access Code ein"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={validating || !accessCode}
              >
                {validating ? "Wird validiert..." : "Weiter"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/welcome")}
              >
                Zurück
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Wähle einen Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                  autoComplete="username"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-20 Zeichen, nur Buchstaben, Zahlen, _ und -
                </p>
              </div>

              <div>
                <Label htmlFor="password">
                  Passwort <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sicheres Passwort wählen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mindestens 6 Zeichen
                </p>
              </div>

              <div>
                <Label htmlFor="image">
                  Profilbild <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                  required
                />
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                      <Image
                        src={imagePreview}
                        alt="Vorschau"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={registering || !username || !password || !imageFile}
              >
                {registering ? "Wird registriert..." : "Registrierung abschließen"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep(1)
                  setError("")
                }}
                disabled={registering}
              >
                Zurück zu Schritt 1
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}

