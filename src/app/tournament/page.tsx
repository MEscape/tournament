import { auth } from "@/lib/auth"
import { SignOutButton } from "@/components/sign-out-button"
import Image from "next/image"

export default async function TournamentPage() {
  // Middleware hat bereits Auth geprüft
  const session = await auth()

  // Fallback falls Middleware fehlschlägt
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Zugriff verweigert</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={session.user.imageUrl}
                alt={session.user.username}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Willkommen, {session.user.username}!
              </h1>
              <p className="text-muted-foreground">
                Bereit für das Tournament?
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Tournament Start
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Das Tournament startet bald. Bleib dran!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Dein Status</h3>
              <p className="text-3xl font-bold text-green-500">Bereit</p>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Rang</h3>
              <p className="text-3xl font-bold text-primary">-</p>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Nächstes Match</h3>
              <p className="text-3xl font-bold text-muted-foreground">TBA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

