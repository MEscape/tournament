import { getAllAccessCodes } from "@/app/actions/access-codes"
import { requireAdmin } from "@/lib/auth"
import { AccessCodesTable } from "@/components/access-codes-table"
import { CreateCodeButton } from "@/components/create-code-button"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const session = await requireAdmin().catch(() => {
    redirect("/welcome")
    return null
  })

  if (!session) {
    redirect("/welcome")
  }

  const result = await getAllAccessCodes()

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error loading access codes</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome, {session.user.username}
            </p>
          </div>
          <div className="flex gap-4">
            <CreateCodeButton />
            <form action="/api/auth/signout" method="POST">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-2xl font-semibold mb-2">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Total Codes</p>
              <p className="text-3xl font-bold text-foreground">
                {result.codes.length}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Unused</p>
              <p className="text-3xl font-bold text-orange-500">
                {result.codes.filter((c: { used: boolean; revoked: boolean }) => !c.used && !c.revoked).length}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Used</p>
              <p className="text-3xl font-bold text-green-500">
                {result.codes.filter((c: { used: boolean }) => c.used).length}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-muted-foreground text-sm">Revoked</p>
              <p className="text-3xl font-bold text-red-500">
                {result.codes.filter((c: { revoked: boolean }) => c.revoked).length}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Access Codes</h2>
          <AccessCodesTable codes={result.codes} />
        </div>
      </div>
    </div>
  )
}


