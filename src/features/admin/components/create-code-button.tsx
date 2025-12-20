"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createAccessCode } from "@/features/admin/actions"

export function CreateCodeButton() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(false)
  const [isAdminCode, setIsAdminCode] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    const result = await createAccessCode(isAdminCode)

    if (result.success) {
      setOpen(false)
      setIsAdminCode(false)
      router.refresh()
    } else {
      alert(result.error || "Fehler beim Erstellen des Access Codes")
    }

    setCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          Neuen Code generieren
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Code erstellen</DialogTitle>
          <DialogDescription>
            Wähle aus, ob dieser Code Admin-Rechte verleihen soll.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="isAdmin"
            checked={isAdminCode}
            onCheckedChange={(checked: boolean) => setIsAdminCode(checked)}
          />
          <Label
            htmlFor="isAdmin"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Admin-Code (Benutzer wird Administrator)
          </Label>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Wird erstellt..." : "Code erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

