# Tournament - Admin Panel & Registration System

Eine moderne Web-App mit Next.js (App Router, TypeScript) als Admin-Panel + User-Registration-System.

## 🚀 Tech Stack

- **Next.js** (App Router) mit TypeScript
- **Tailwind CSS v4** + **shadcn/ui** Komponenten
- **NextAuth.js** (Session-basiert)
- **PostgreSQL** mit **Prisma** ORM
- **Vercel Blob** für Image Upload
- **Socket.IO** für Realtime Updates
- **Dark Mode Only** mit Rot/Schwarz Design

## 🎨 Features

### Admin Dashboard
- ✅ Access Codes generieren (UUID v4)
- ✅ Access Codes revoken (auch wenn unused)
- ✅ Übersicht aller Codes mit Status (unused/used/revoked)
- ✅ Realtime Updates via WebSocket
- ✅ Geschützt durch NextAuth (Admin-Only)

### User Registration
- ✅ 2-Schritt Registrierung
  - Schritt 1: Access Code Validierung
  - Schritt 2: Username + Profilbild (beide PFLICHT)
- ✅ Server-seitige Validierung mit Zod
- ✅ Atomare Transaction (User + Access Code)
- ✅ Image Upload zu Vercel Blob
- ✅ Realtime Notification an Admin

### Security
- ✅ Alle Actions serverseitig
- ✅ Zod Validation
- ✅ Prisma Transactions (Race Condition Prevention)
- ✅ NextAuth Session Management
- ✅ Admin Role Checks

## 📦 Installation

### 1. Dependencies installieren

\`\`\`bash
npm install
\`\`\`

### 2. Datenbank Setup

**Option A: Lokale PostgreSQL**

\`\`\`bash
# .env anpassen mit deiner lokalen DB
DATABASE_URL="postgresql://user:password@localhost:5432/tournament?schema=public"
\`\`\`

**Option B: Vercel Postgres (empfohlen für Production)**

1. Vercel Project erstellen
2. Vercel Postgres Database hinzufügen
3. Environment Variables automatisch gesetzt

### 3. Prisma Setup

\`\`\`bash
# Prisma Client generieren
npx prisma generate

# Datenbank Schema pushen
npx prisma db push

# Seed ausführen (erstellt Admin User)
npm run db:seed
\`\`\`

### 4. Environment Variables

Erstelle `.env` Datei:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tournament"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Vercel Blob (nach Vercel Setup)
BLOB_READ_WRITE_TOKEN=""

# WebSocket
WEBSOCKET_PORT="3001"
\`\`\`

### 5. Entwicklungsserver starten

\`\`\`bash
npm run dev
\`\`\`

Öffne [http://localhost:3000](http://localhost:3000)

## 🌐 Vercel Deployment

### 1. Vercel CLI installieren

\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Project mit Vercel verbinden

\`\`\`bash
vercel link
\`\`\`

### 3. Vercel Postgres hinzufügen

1. Gehe zu deinem Vercel Dashboard
2. Navigiere zu deinem Project → Storage
3. Erstelle eine neue Postgres Database
4. Environment Variables werden automatisch gesetzt

### 4. Vercel Blob Storage hinzufügen

1. Vercel Dashboard → Storage → Blob
2. Blob Storage erstellen
3. `BLOB_READ_WRITE_TOKEN` wird automatisch gesetzt

### 5. Prisma Migrationen ausführen

\`\`\`bash
# Nach DB Setup
vercel env pull .env.local
npx prisma db push
npm run db:seed
\`\`\`

### 6. Deploy

\`\`\`bash
vercel --prod
\`\`\`

## 👤 Standard Admin Login

Nach dem Seed:
- **Username**: `admin`
- **Email**: `admin@tournament.com`

**Wichtig**: In Production solltest du einen echten Admin-User erstellen!

## 🗄️ Datenbank Schema

### User
- `id` (String, CUID)
- `email` (String?, Unique)
- `username` (String, Unique, NOT NULL)
- `imageUrl` (String, NOT NULL)
- `role` (Enum: ADMIN | USER)
- `createdAt` (DateTime)

### AccessCode
- `id` (String, CUID)
- `code` (String, UUID, Unique)
- `used` (Boolean)
- `revoked` (Boolean)
- `createdAt` (DateTime)
- `usedAt` (DateTime?)
- `createdById` (String → User)
- `usedById` (String? → User)

## 🔧 Entwicklung

### Prisma Commands

\`\`\`bash
# Schema Änderungen anwenden
npx prisma db push

# Prisma Studio öffnen (DB GUI)
npx prisma studio

# Migration erstellen
npx prisma migrate dev --name your-migration-name
\`\`\`

### TypeScript Types generieren

\`\`\`bash
npm run prisma:generate
\`\`\`

## 📁 Projekt Struktur

\`\`\`
tournament/
├── app/
│   ├── actions/           # Server Actions
│   ├── admin/             # Admin Dashboard
│   ├── api/               # API Routes (NextAuth)
│   ├── register/          # Registration Flow
│   ├── welcome/           # Landing Page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # shadcn/ui Components
│   ├── access-codes-table.tsx
│   ├── create-code-button.tsx
│   └── status-badge.tsx
├── lib/
│   ├── auth.ts            # NextAuth Config
│   ├── prisma.ts          # Prisma Client
│   ├── validations.ts     # Zod Schemas
│   └── websocket.ts       # WebSocket Server
├── prisma/
│   ├── schema.prisma      # Database Schema
│   └── seed.ts            # Seed Script
├── middleware.ts          # Route Protection
└── .env
\`\`\`

## 🎨 Design

- **Dark Mode Only** (kein Light Mode)
- **Primärfarbe**: Rot (`oklch(0.55 0.22 25)`)
- **Background**: Schwarz
- **Status Colors**:
  - Unused: Orange
  - Used: Grün
  - Revoked: Rot

## 🔐 Security Features

- ✅ Server-only Business Logic
- ✅ Zod Input Validation
- ✅ Prisma Transactions
- ✅ NextAuth Session Management
- ✅ Admin Role Checks
- ✅ Access Code Revoke Prevention
- ✅ Race Condition Protection

## 📝 TODO / Erweiterungen

- [ ] WebSocket Server implementieren (aktuell vorbereitet)
- [ ] Rate Limiting für Access Code Validierung
- [ ] Email Notifications
- [ ] Admin User Management UI
- [ ] Access Code Bulk Operations
- [ ] Analytics Dashboard

## 🐛 Troubleshooting

### Prisma Client Error

\`\`\`bash
npx prisma generate
\`\`\`

### Database Connection Error

Prüfe `DATABASE_URL` in `.env`

### NextAuth Error

Prüfe `NEXTAUTH_SECRET` (min. 32 Zeichen)

### Vercel Blob Upload Error

Prüfe `BLOB_READ_WRITE_TOKEN` in Environment Variables

## 📄 License

MIT

