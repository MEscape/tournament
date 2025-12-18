"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import type { ApiResponse } from "@/types/api.types"
import type { AccessCodeWithRelations } from "@/types/auth.types"

export async function createAccessCode(): Promise<
  ApiResponse<AccessCodeWithRelations>
> {
  try {
    const session = await requireAdmin()

    const accessCode = await prisma.accessCode.create({
      data: {
        code: uuidv4(),
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { username: true },
        },
        user: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
    })

    revalidatePath("/admin")

    return {
      success: true,
      data: accessCode,
    }
  } catch (error) {
    console.error("Create access code error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Code konnte nicht erstellt werden",
    }
  }
}

export async function revokeAccessCode(
  codeId: string
): Promise<ApiResponse<void>> {
  try {
    await requireAdmin()

    // Prüfe ob Code bereits verwendet wurde
    const code = await prisma.accessCode.findUnique({
      where: { id: codeId },
      include: { user: true },
    })

    if (!code) {
      return {
        success: false,
        error: "Code nicht gefunden",
      }
    }

    if (code.user) {
      return {
        success: false,
        error: "Verwendete Codes können nicht widerrufen werden",
      }
    }

    if (code.revoked) {
      return {
        success: false,
        error: "Code wurde bereits widerrufen",
      }
    }

    await prisma.accessCode.update({
      where: { id: codeId },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    })

    revalidatePath("/admin")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Revoke access code error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Code konnte nicht widerrufen werden",
    }
  }
}

export async function clearAllCodes(): Promise<ApiResponse<{ count: number }>> {
  try {
    await requireAdmin()

    // Lösche nur nicht verwendete Codes
    const result = await prisma.accessCode.deleteMany({
      where: {
        user: null, // Kein User zugeordnet = nicht verwendet
      },
    })

    revalidatePath("/admin")

    return {
      success: true,
      data: { count: result.count },
    }
  } catch (error) {
    console.error("Clear codes error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Codes konnten nicht gelöscht werden",
    }
  }
}

export async function getAllAccessCodes(): Promise<
  ApiResponse<AccessCodeWithRelations[]>
> {
  try {
    await requireAdmin()

    const codes = await prisma.accessCode.findMany({
      include: {
        createdBy: {
          select: { username: true },
        },
        user: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: codes,
    }
  } catch (error) {
    console.error("Get access codes error:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Codes konnten nicht geladen werden",
    }
  }
}

