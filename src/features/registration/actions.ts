"use server"

import { hash } from "bcrypt"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { accessCodeSchema, registrationSchema } from "./validation"
import type { ApiResponse } from "@/types/api.types"
import type { AccessCodeStatus } from "@/types/auth.types"

export async function validateAccessCode(
  code: string
): Promise<AccessCodeStatus> {
  try {
    const validated = accessCodeSchema.parse({ code })

    // OPTIMIERT: Nur die minimal benötigten Felder laden
    const accessCode = await prisma.accessCode.findUnique({
      where: { code: validated.code },
      select: {
        id: true,
        revoked: true,
        user: {
          select: { id: true }, // Nur prüfen ob User existiert
        },
      },
    })

    if (!accessCode) {
      return {
        isValid: false,
        error: "Access Code nicht gefunden",
      }
    }

    if (accessCode.user) {
      return {
        isValid: false,
        error: "Access Code wurde bereits verwendet",
      }
    }

    if (accessCode.revoked) {
      return {
        isValid: false,
        error: "Access Code wurde widerrufen",
      }
    }

    return {
      isValid: true,
      codeId: accessCode.id,
    }
  } catch {
    return {
      isValid: false,
      error: "Ungültiger Access Code Format",
    }
  }
}

export async function registerUser(data: {
  accessCode: string
  username: string
  password: string
  imageFile: File
}): Promise<ApiResponse<{ userId: string }>> {
  try {
    // Validate input (Client-side validation, kein DB-Hit)
    const validationResult = registrationSchema.omit({ imageUrl: true }).safeParse({
      accessCode: data.accessCode,
      username: data.username,
      password: data.password,
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    const validated = validationResult.data

    // Hash password BEFORE DB-Checks (kann parallel laufen)
    const hashedPassword = await hash(validated.password, 10)

    // Upload image BEFORE DB-Checks (spart DB-Read bei Upload-Fehler)
    let imageUrl: string
    try {
      const blob = await put(
        `profiles/${validated.username}-${Date.now()}.${data.imageFile.type.split("/")[1]}`,
        data.imageFile,
        {
          access: "public",
        }
      )
      imageUrl = blob.url
    } catch (uploadError) {
      console.error("Upload error:", uploadError)
      return {
        success: false,
        error: "Bild konnte nicht hochgeladen werden. Bitte versuche es mit einem kleineren Bild.",
      }
    }

    // OPTIMIERT: Atomic transaction mit nur 2 DB-Queries (statt 4)
    const result = await prisma.$transaction(
      async (tx) => {
        // Query 1: Check username UND access code in EINEM Query
        const [existingUser, accessCode] = await Promise.all([
          tx.user.findUnique({
            where: { username: validated.username },
            select: { id: true }, // Nur ID für Existenz-Check
          }),
          tx.accessCode.findUnique({
            where: { code: validated.accessCode },
            select: {
              id: true,
              revoked: true,
              isAdminCode: true,
              user: {
                select: { id: true }, // Nur ID für Existenz-Check
              },
            },
          }),
        ])

        // Validierungen mit klaren Fehlermeldungen
        if (existingUser) {
          throw new Error(`Username "${validated.username}" ist bereits vergeben. Bitte wähle einen anderen.`)
        }

        if (!accessCode) {
          throw new Error("Access Code nicht gefunden")
        }

        if (accessCode.user) {
          throw new Error("Access Code wurde bereits verwendet")
        }

        if (accessCode.revoked) {
          throw new Error("Access Code wurde widerrufen")
        }

        // Query 2: Create user (mit role basierend auf isAdminCode)
        const user = await tx.user.create({
          data: {
            username: validated.username,
            password: hashedPassword,
            imageUrl,
            role: accessCode.isAdminCode ? "ADMIN" : "USER",
            accessCodeId: accessCode.id,
          },
          select: {
            id: true,
            username: true,
            role: true,
          },
        })

        return { user }
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: "Serializable", // Höchste Isolation für Race Conditions
      }
    )

    // Revalidation nur wenn nötig (Admin muss es sehen)
    if (result.user.role === "ADMIN" || result.user.role === "USER") {
      revalidatePath("/admin")
    }

    return {
      success: true,
      data: { userId: result.user.id },
    }
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Registrierung fehlgeschlagen. Bitte versuche es erneut.",
    }
  }
}

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })
    return { available: !existingUser }
  } catch {
    return { available: false }
  }
}

