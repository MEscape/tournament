"use server"

import { signIn as nextAuthSignIn } from "@/lib/auth"
import type { LoginCredentials, AuthResult } from "@/types/auth.types"
import { loginSchema } from "./validation"

export async function loginAction(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    const validated = loginSchema.parse(credentials)

    const result = await nextAuthSignIn("credentials", {
      username: validated.username,
      password: validated.password,
      redirect: false,
    })

    if (result?.error) {
      return {
        success: false,
        error: "Ungültige Anmeldedaten",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten",
    }
  }
}

