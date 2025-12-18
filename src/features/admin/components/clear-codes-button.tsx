"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { clearAllCodes } from "@/features/admin/actions"

export function ClearCodesButton() {
  const router = useRouter()
  const [clearing, setClearing] = useState(false)

  const handleClear = async () => {
    if (
      !confirm(
        "Möchtest du wirklich alle nicht verwendeten Codes löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      )
    ) {
      return
    }

    setClearing(true)
    const result = await clearAllCodes()

    if (result.success) {
      alert(`${result.data?.count || 0} Codes wurden gelöscht`)
      router.refresh()
    } else {
      alert(result.error || "Fehler beim Löschen der Codes")
    }

    setClearing(false)
  }

  return (
    <Button
      onClick={handleClear}
      disabled={clearing}
      variant="outline"
      className="border-destructive text-destructive hover:bg-destructive hover:text-white"
    >
      {clearing ? "Wird gelöscht..." : "Alle Codes löschen"}
    </Button>
  )
}

