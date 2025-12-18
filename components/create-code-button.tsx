"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createAccessCode } from "@/app/actions/access-codes"
import { useRouter } from "next/navigation"

export function CreateCodeButton() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    const result = await createAccessCode()

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to create access code")
    }

    setCreating(false)
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={creating}
      className="bg-primary hover:bg-primary/90"
    >
      {creating ? "Creating..." : "Generate New Code"}
    </Button>
  )
}

