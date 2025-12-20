import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username muss mindestens 3 Zeichen lang sein")
    .max(20, "Username darf maximal 20 Zeichen lang sein"),
  password: z
    .string()
    .min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
})

export const accessCodeSchema = z.object({
  code: z.string().uuid("Ungültiges Access Code Format"),
})

export const registrationSchema = z.object({
  accessCode: z.string().uuid("Ungültiger Access Code"),
  username: z
    .string()
    .min(3, "Username muss mindestens 3 Zeichen haben")
    .max(20, "Username darf maximal 20 Zeichen haben")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username darf nur Buchstaben (a-z, A-Z), Zahlen (0-9), Unterstrich (_) und Bindestrich (-) enthalten"
    ),
  password: z
    .string()
    .min(6, "Passwort muss mindestens 6 Zeichen haben")
    .max(100, "Passwort ist zu lang"),
  imageUrl: z.string().url("Ungültige Bild-URL"),
})

