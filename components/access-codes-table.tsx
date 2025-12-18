"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { revokeAccessCode } from "@/app/actions/access-codes"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface AccessCode {
  id: string
  code: string
  used: boolean
  revoked: boolean
  createdAt: Date
  usedAt: Date | null
  createdBy: {
    username: string
  }
  usedBy: {
    username: string
  } | null
}

interface AccessCodesTableProps {
  codes: AccessCode[]
}

export function AccessCodesTable({ codes }: AccessCodesTableProps) {
  const router = useRouter()
  const [revoking, setRevoking] = useState<string | null>(null)

  const handleRevoke = async (codeId: string) => {
    if (!confirm("Are you sure you want to revoke this access code?")) {
      return
    }

    setRevoking(codeId)
    const result = await revokeAccessCode(codeId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to revoke code")
    }

    setRevoking(null)
  }

  const getStatus = (code: AccessCode): "unused" | "used" | "revoked" => {
    if (code.revoked) return "revoked"
    if (code.used) return "used"
    return "unused"
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="text-foreground">Code</TableHead>
            <TableHead className="text-foreground">Status</TableHead>
            <TableHead className="text-foreground">Created At</TableHead>
            <TableHead className="text-foreground">Created By</TableHead>
            <TableHead className="text-foreground">Used At</TableHead>
            <TableHead className="text-foreground">Used By</TableHead>
            <TableHead className="text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No access codes yet. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            codes.map((code) => (
              <TableRow key={code.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">{code.code}</TableCell>
                <TableCell>
                  <StatusBadge status={getStatus(code)} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(code.createdAt), "dd.MM.yyyy HH:mm")}
                </TableCell>
                <TableCell>{code.createdBy.username}</TableCell>
                <TableCell className="text-muted-foreground">
                  {code.usedAt
                    ? format(new Date(code.usedAt), "dd.MM.yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell>{code.usedBy?.username || "-"}</TableCell>
                <TableCell className="text-right">
                  {!code.revoked && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(code.id)}
                      disabled={revoking === code.id}
                    >
                      {revoking === code.id ? "Revoking..." : "Revoke"}
                    </Button>
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

