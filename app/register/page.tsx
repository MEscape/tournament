"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { validateAccessCode, registerUser } from "@/app/actions/registration"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [accessCode, setAccessCode] = useState("")
  const [codeValidated, setCodeValidated] = useState(false)
  const [validating, setValidating] = useState(false)

  const [username, setUsername] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState("")

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidating(true)

    const result = await validateAccessCode(accessCode)

    if (result.success) {
      setCodeValidated(true)
      setStep(2)
    } else {
      setError(result.error || "Invalid access code")
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

    if (!username || !imageFile) {
      setError("Please fill in all required fields")
      return
    }

    setRegistering(true)

    const result = await registerUser({
      accessCode,
      username,
      imageFile,
    })

    if (result.success) {
      // Erfolgreiche Registrierung
      alert("Registration successful! You can now login.")
      router.push("/welcome")
    } else {
      setError(result.error || "Registration failed")
    }

    setRegistering(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-card border-border">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 1 ? "Enter Access Code" : "Complete Registration"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1
                ? "Step 1 of 2"
                : "Step 2 of 2 - All fields are required"}
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
                  placeholder="Enter your access code"
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
                {validating ? "Validating..." : "Continue"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/welcome")}
              >
                Back
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
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-20 characters, letters, numbers, _ and - only
                </p>
              </div>

              <div>
                <Label htmlFor="image">
                  Profile Image <span className="text-red-500">*</span>
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
                        alt="Preview"
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
                disabled={registering || !username || !imageFile}
              >
                {registering ? "Registering..." : "Complete Registration"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep(1)
                  setCodeValidated(false)
                }}
                disabled={registering}
              >
                Back to Step 1
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}

