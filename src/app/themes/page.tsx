import { auth } from "@/lib/auth"
import { ThemesClient } from "./themes-client"

export default async function ThemesPage() {
  const session = await auth()

  return <ThemesClient user={session?.user} />
}

