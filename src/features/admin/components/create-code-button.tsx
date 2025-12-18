"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createAccessCode } from "@/features/admin/actions"

export function CreateCodeButton() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    const result = await createAccessCode()

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Fehler beim Erstellen des Access Codes")
    }

    setCreating(false)
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={creating}
      className="bg-primary hover:bg-primary/90"
    >
      {creating ? "Wird erstellt..." : "Neuen Code generieren"}
    </Button>
  )
}

