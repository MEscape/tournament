import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BracketClient } from "./bracket-client"

export default async function BracketPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/user-login")
  }

  return <BracketClient user={session.user} />
}

