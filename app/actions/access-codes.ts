"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

export async function createAccessCode() {
  try {
    const session = await requireAdmin()
    const adminId = session.user.id

    const accessCode = await prisma.accessCode.create({
      data: {
        code: uuidv4(),
        createdById: adminId,
      },
      include: {
        createdBy: {
          select: {
            username: true,
          },
        },
      },
    })

    // WebSocket Event wird später hinzugefügt
    revalidatePath("/admin")

    return {
      success: true,
      code: accessCode,
    }
  } catch (error) {
    console.error("Failed to create access code:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create access code",
    }
  }
}

export async function revokeAccessCode(codeId: string) {
  try {
    await requireAdmin()

    const accessCode = await prisma.accessCode.update({
      where: { id: codeId },
      data: { revoked: true },
      include: {
        createdBy: {
          select: {
            username: true,
          },
        },
      },
    })

    // WebSocket Event wird später hinzugefügt
    revalidatePath("/admin")

    return {
      success: true,
      code: accessCode,
    }
  } catch (error) {
    console.error("Failed to revoke access code:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke access code",
    }
  }
}

export async function getAllAccessCodes() {
  try {
    await requireAdmin()

    const codes = await prisma.accessCode.findMany({
      include: {
        createdBy: {
          select: {
            username: true,
          },
        },
        usedBy: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      codes,
    }
  } catch (error) {
    console.error("Failed to fetch access codes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch access codes",
      codes: [],
    }
  }
}

