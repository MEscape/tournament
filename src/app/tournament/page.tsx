import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { TournamentProvider } from "@/features/tournament/tournament-provider"
import { TournamentLobby } from "@/features/tournament/components/tournament-lobby"

export default async function TournamentPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/user-login")
  }

  return (
    <TournamentProvider currentUserId={session.user.id}>
      <TournamentLobby user={session.user} />
    </TournamentProvider>
  )
}

