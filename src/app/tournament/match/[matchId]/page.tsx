import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MatchClient } from "./match-client"

export default async function MatchPage({ params }: { params: { matchId: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/user-login")
  }

  return <MatchClient matchId={params.matchId} user={session.user} />
}

