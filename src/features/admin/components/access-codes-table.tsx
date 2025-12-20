"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { revokeAccessCode } from "@/features/admin/actions"
import type { AccessCodeWithRelations } from "@/types/auth.types"

interface AccessCodesTableProps {
  codes: AccessCodeWithRelations[]
}

export function AccessCodesTable({ codes }: AccessCodesTableProps) {
  const router = useRouter()
  const [revoking, setRevoking] = useState<string | null>(null)
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleRevoke = async (codeId: string) => {
    if (!confirm("Möchtest du diesen Access Code wirklich widerrufen?")) {
      return
    }

    setRevoking(codeId)
    const result = await revokeAccessCode(codeId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Fehler beim Widerrufen")
    }

    setRevoking(null)
  }

  const toggleCodeVisibility = (codeId: string) => {
    setVisibleCodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(codeId)) {
        newSet.delete(codeId)
      } else {
        newSet.add(codeId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(codeId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      alert("Fehler beim Kopieren")
    }
  }

  const maskCode = () => {
    return "••••-••••-••••-••••"
  }

  const getStatusBadge = (code: AccessCodeWithRelations) => {
    if (code.revoked) {
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white">
          Widerrufen
        </Badge>
      )
    }
    if (code.user) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Verwendet
        </Badge>
      )
    }
    return (
      <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
        Nicht verwendet
      </Badge>
    )
  }

  const getTypeBadge = (code: AccessCodeWithRelations) => {
    if (code.isAdminCode) {
      return (
        <Badge className="bg-purple-600 hover:bg-purple-700 text-white ml-2">
          Admin
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="text-foreground">Code</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Erstellt am</TableHead>
            <TableHead className="text-foreground">Erstellt von</TableHead>
            <TableHead className="text-foreground">Verwendet von</TableHead>
            <TableHead className="text-foreground text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                Noch keine Access Codes. Erstelle einen um loszulegen.
              </TableCell>
            </TableRow>
          ) : (
            codes.map((code) => (
              <TableRow key={code.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="select-none">
                      {visibleCodes.has(code.id) ? code.code : maskCode()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCodeVisibility(code.id)}
                      className="h-8 w-8 p-0"
                      title={visibleCodes.has(code.id) ? "Code verstecken" : "Code anzeigen"}
                    >
                      {visibleCodes.has(code.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code, code.id)}
                      className="h-8 w-8 p-0"
                      title="Code kopieren"
                    >
                      {copiedCode === code.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusBadge(code)}
                    {getTypeBadge(code)}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(code.createdAt), "dd.MM.yyyy HH:mm")}
                </TableCell>
                <TableCell>{code.createdBy.username}</TableCell>
                <TableCell>
                  {code.user ? code.user.username : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {!code.revoked && !code.user && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(code.id)}
                      disabled={revoking === code.id}
                    >
                      {revoking === code.id ? "Wird widerrufen..." : "Widerrufen"}
                    </Button>
                  )}
                  {(code.revoked || code.user) && (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

