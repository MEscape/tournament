import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TournamentProvider } from "@/features/tournament/tournament-provider"
import { TournamentLobby } from "@/features/tournament/components/tournament-lobby"
import { tournamentStore } from "@/features/tournament/store/tournament-store"

export default async function TournamentPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Server-side check: Wenn Tournament läuft, redirect zu bracket
  const currentStatus = tournamentStore.getStatus()
  if (currentStatus === "DRAWING" || currentStatus === "RUNNING" || currentStatus === "FINISHED") {
    redirect("/tournament/bracket")
  }

  return (
    <TournamentProvider currentUserId={session.user.id}>
      <TournamentLobby user={session.user} />
    </TournamentProvider>
  )
}

