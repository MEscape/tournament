import { auth } from "@/lib/auth"
import Image from "next/image"
import { getAllAccessCodes } from "@/features/admin/actions"
import { AccessCodesTable } from "@/features/admin/components/access-codes-table"
import { CreateCodeButton } from "@/features/admin/components/create-code-button"
import { ClearCodesButton } from "@/features/admin/components/clear-codes-button"
import { SignOutButton } from "@/components/sign-out-button"

export default async function AdminPage() {
  // Middleware hat bereits Auth geprüft, hier nur Session holen
  const session = await auth()

  // Fallback falls Middleware fehlschlägt
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Zugriff verweigert</p>
      </div>
    )
  }

  const result = await getAllAccessCodes()

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Fehler beim Laden der Access Codes</p>
      </div>
    )
  }

  const codes = result.data
  const unused = codes.filter((c) => !c.user && !c.revoked).length
  const used = codes.filter((c) => c.user).length
  const revoked = codes.filter((c) => c.revoked).length

  return (
    <div className="relative min-h-screen bg-background p-8">
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Willkommen, {session.user.username}
            </p>
          </div>
          <div className="flex gap-4">
            <CreateCodeButton />
            <ClearCodesButton />
            <SignOutButton />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-2xl font-semibold mb-2">Statistiken</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Gesamt</p>
              <p className="text-3xl font-bold text-foreground">
                {codes.length}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Nicht verwendet</p>
              <p className="text-3xl font-bold text-orange-500">{unused}</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Verwendet</p>
              <p className="text-3xl font-bold text-green-500">{used}</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Widerrufen</p>
              <p className="text-3xl font-bold text-red-500">{revoked}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Access Codes</h2>
          <AccessCodesTable codes={codes} />
        </div>
      </div>
    </div>
  )
}

