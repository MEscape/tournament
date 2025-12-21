
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ApiResponse } from "@/types/api.types"

// ============================================
// THEME SUGGESTIONS (User & Admin)
// ============================================

export async function suggestTheme(data: {
  title: string
  description?: string
  shop?: string
  budget?: number
  preferences?: string
}): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    await prisma.themeSuggestion.create({
      data: {
        title: data.title,
        description: data.description,
        shop: data.shop,
        budget: data.budget,
        preferences: data.preferences,
        userId: session.user.id,
      },
    })

    revalidatePath("/themes")
    return { success: true }
  } catch (error) {
    console.error("Suggest theme error:", error)
    return { success: false, error: "Fehler beim Vorschlagen des Themas" }
  }
}

export async function getMyThemeSuggestions(): Promise<
  ApiResponse<
    Array<{
      id: string
      title: string
      description: string | null
      status: string
      createdAt: Date
      reviewNote: string | null
      shop: string | null
      budget: number | null
      preferences: string | null
    }>
  >
> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Nicht angemeldet" }
    }

    const suggestions = await prisma.themeSuggestion.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: suggestions }
  } catch (error) {
    console.error("Get my suggestions error:", error)
    return { success: false, error: "Fehler beim Laden der Vorschläge" }
  }
}

export async function getApprovedThemes(): Promise<
  ApiResponse<
    Array<{
      id: string
      title: string
      description: string | null
    }>
  >
> {
  try {
    const suggestions = await prisma.themeSuggestion.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
      },
    })

    return { success: true, data: suggestions }
  } catch (error) {
    console.error("Get approved themes error:", error)
    return { success: false, error: "Fehler beim Laden der Themen" }
  }
}

// ============================================
// ADMIN ACTIONS
// ============================================

export async function getAllThemeSuggestions(): Promise<
  ApiResponse<
    Array<{
      id: string
      title: string
      description: string | null
      status: string
      createdAt: Date
      user: { username: string }
      reviewNote: string | null
      shop: string | null
      budget: number | null
      preferences: string | null
    }>
  >
> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    const suggestions = await prisma.themeSuggestion.findMany({
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: suggestions }
  } catch (error) {
    console.error("Get all suggestions error:", error)
    return { success: false, error: "Fehler beim Laden der Vorschläge" }
  }
}

export async function reviewThemeSuggestion(data: {
  suggestionId: string
  status: "APPROVED" | "REJECTED"
  reviewNote?: string
}): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    await prisma.themeSuggestion.update({
      where: { id: data.suggestionId },
      data: {
        status: data.status,
        reviewNote: data.reviewNote,
        reviewedAt: new Date(),
      },
    })

    // If approved, add to active themes
    if (data.status === "APPROVED") {
      const suggestion = await prisma.themeSuggestion.findUnique({
        where: { id: data.suggestionId },
      })

      if (suggestion) {
        await prisma.theme.upsert({
          where: { title: suggestion.title },
          update: {
            isActive: true,
            shop: suggestion.shop,
            budget: suggestion.budget,
            preferences: suggestion.preferences,
          },
          create: {
            title: suggestion.title,
            description: suggestion.description,
            shop: suggestion.shop,
            budget: suggestion.budget,
            preferences: suggestion.preferences,
          },
        })
      }
    }

    revalidatePath("/themes")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Review theme error:", error)
    return { success: false, error: "Fehler beim Review des Themas" }
  }
}

// ============================================
// ACTIVE THEMES (für Match Start)
// ============================================

export async function getActiveThemes(): Promise<
  ApiResponse<
    Array<{
      id: string
      title: string
      description: string | null
    }>
  >
> {
  try {
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
    })

    return { success: true, data: themes }
  } catch (error) {
    console.error("Get active themes error:", error)
    return { success: false, error: "Fehler beim Laden der Themen" }
  }
}

export async function createTheme(data: {
  title: string
  description?: string
}): Promise<ApiResponse<void>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Keine Berechtigung" }
    }

    await prisma.theme.create({
      data: {
        title: data.title,
        description: data.description,
      },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Create theme error:", error)
    return { success: false, error: "Fehler beim Erstellen des Themas" }
  }
}

