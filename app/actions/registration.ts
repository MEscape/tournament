"use server"

import { prisma } from "@/lib/prisma"
import { accessCodeSchema, registrationSchema } from "@/lib/validations"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function validateAccessCode(code: string) {
  try {
    const validated = accessCodeSchema.parse({ code })

    const accessCode = await prisma.accessCode.findUnique({
      where: { code: validated.code },
    })

    if (!accessCode) {
      return {
        success: false,
        error: "Access code not found",
      }
    }

    if (accessCode.used) {
      return {
        success: false,
        error: "Access code already used",
      }
    }

    if (accessCode.revoked) {
      return {
        success: false,
        error: "Access code has been revoked",
      }
    }

    return {
      success: true,
      codeId: accessCode.id,
    }
  } catch (error) {
    console.error("Access code validation failed:", error)
    return {
      success: false,
      error: "Invalid access code",
    }
  }
}

export async function registerUser(data: {
  accessCode: string
  username: string
  imageFile: File
}) {
  try {
    // Validierung
    const validated = registrationSchema.omit({ imageUrl: true }).parse({
      accessCode: data.accessCode,
      username: data.username,
    })

    // Prüfe ob Username bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.username },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Username already taken",
      }
    }

    // Upload Image zu Vercel Blob
    let imageUrl: string
    try {
      const blob = await put(`profiles/${data.username}-${Date.now()}.${data.imageFile.type.split('/')[1]}`, data.imageFile, {
        access: "public",
      })
      imageUrl = blob.url
    } catch (error) {
      console.error("Image upload failed:", error)
      return {
        success: false,
        error: "Failed to upload profile image",
      }
    }

    // Validiere Access Code nochmal
    const codeValidation = await validateAccessCode(validated.accessCode)
    if (!codeValidation.success) {
      return {
        success: false,
        error: codeValidation.error,
      }
    }

    // Transaction: User erstellen + Access Code markieren
    const result = await prisma.$transaction(async (tx) => {
      // Access Code nochmal prüfen (Race Condition Prevention)
      const accessCode = await tx.accessCode.findUnique({
        where: { code: validated.accessCode },
      })

      if (!accessCode || accessCode.used || accessCode.revoked) {
        throw new Error("Access code is invalid or already used")
      }

      // User erstellen
      const user = await tx.user.create({
        data: {
          username: validated.username,
          imageUrl: imageUrl,
          role: "USER",
        },
      })

      // Access Code als used markieren
      await tx.accessCode.update({
        where: { id: accessCode.id },
        data: {
          used: true,
          usedAt: new Date(),
          usedById: user.id,
        },
      })

      return { user, accessCode }
    }, {
      maxWait: 5000,
      timeout: 10000,
    })

    // WebSocket Event wird später hinzugefügt
    revalidatePath("/admin")

    return {
      success: true,
      user: result.user,
    }
  } catch (error) {
    console.error("User registration failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    }
  }
}

export async function checkUsernameAvailability(username: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    return {
      available: !existingUser,
    }
  } catch (error) {
    return {
      available: false,
    }
  }
}

