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

    const accessCode = await prisma.accessCode.findUnique({
      where: { code: validated.code },
      include: {
        user: true,
      },
    })

    if (!accessCode) {
      return {
        isValid: false,
        error: "Access code nicht gefunden",
      }
    }

    if (accessCode.user) {
      return {
        isValid: false,
        error: "Access code wurde bereits verwendet",
      }
    }

    if (accessCode.revoked) {
      return {
        isValid: false,
        error: "Access code wurde widerrufen",
      }
    }

    return {
      isValid: true,
      codeId: accessCode.id,
    }
  } catch {
    return {
      isValid: false,
      error: "Ungültiger Access Code",
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
    // Validate input
    const validated = registrationSchema.omit({ imageUrl: true }).parse({
      accessCode: data.accessCode,
      username: data.username,
      password: data.password,
    })

    // Check username availability
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.username },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Username bereits vergeben",
      }
    }

    // Upload image
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
    } catch {
      return {
        success: false,
        error: "Bild-Upload fehlgeschlagen",
      }
    }

    // Validate access code again
    const codeValidation = await validateAccessCode(validated.accessCode)
    if (!codeValidation.isValid || !codeValidation.codeId) {
      return {
        success: false,
        error: codeValidation.error,
      }
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 10)

    // Atomic transaction: Create user with access code link
    const result = await prisma.$transaction(
      async (tx) => {
        // Check code again (race condition prevention)
        const accessCode = await tx.accessCode.findUnique({
          where: { id: codeValidation.codeId },
          include: { user: true },
        })

        if (!accessCode || accessCode.user || accessCode.revoked) {
          throw new Error("Access code ist nicht mehr verfügbar")
        }

        // Create user
        const user = await tx.user.create({
          data: {
            username: validated.username,
            password: hashedPassword,
            imageUrl,
            role: "USER",
            accessCodeId: accessCode.id,
          },
        })

        return { user }
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    )

    revalidatePath("/admin")

    return {
      success: true,
      data: { userId: result.user.id },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registrierung fehlgeschlagen",
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

