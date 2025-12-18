"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import React from "react";

export default function WelcomePage() {
  const router = useRouter()

  const handleLogoClick = (e: React.MouseEvent) => {
    // Admin Login nur mit Shift+Klick
    if (e.shiftKey) {
      router.push("/admin-login")
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
      <Card className="relative z-10 max-w-2xl w-full p-8 bg-card/90 backdrop-blur-sm border-border">
        <div className="text-center space-y-6">
          <h1
            onClick={handleLogoClick}
            className="text-5xl font-bold text-foreground mb-4 cursor-default select-none"
            title="Shift+Klick für Admin"
          >
            Willkommen beim Einkaufslisten Turnier!
          </h1>
          <p className="text-xl text-muted-foreground">
            Tritt unserer exklusiven Community mit einem Access Code bei
          </p>

          <div className="pt-8 flex flex-col gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
              >
                Jetzt Registrieren
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg py-6 bg-background/50 backdrop-blur-sm"
              >
                Anmelden
              </Button>
            </Link>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Du benötigst einen gültigen Access Code zur Registrierung. <br />
              Codes können über Mesc und andere Bewerter angefragt werden.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              🎆 Feuerwerk Einkaufslisten Turnier 🎆
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

