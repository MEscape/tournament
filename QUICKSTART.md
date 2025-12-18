# Quick Start Guide

## 🚀 Lokale Entwicklung starten (ohne Vercel)

### 1. PostgreSQL lokal installieren

**Windows (mit Chocolatey):**
```bash
choco install postgresql
```

**Oder Docker:**
```bash
docker run --name tournament-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tournament -p 5432:5432 -d postgres
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Environment Variables konfigurieren

Kopiere `.env.example` zu `.env`:

```bash
copy .env.example .env
```

Bearbeite `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tournament?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="lWoH0VANYbrvYmaB4R+BSUzmXA6YFPr9ixZk5QSvuTg="
BLOB_READ_WRITE_TOKEN=""
WEBSOCKET_PORT="3001"
```

**NEXTAUTH_SECRET generieren:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Datenbank Setup

```bash
# Prisma Client generieren
npx prisma generate

# Schema in DB pushen
npx prisma db push

# Admin User erstellen
npm run db:seed
```

**Output:**
```
✅ Admin user created: admin
✅ Test access codes created:
  - <uuid-code-1>
  - <uuid-code-2>
🎉 Seeding completed!
```

### 5. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## ⚠️ Hinweis zu Vercel Blob

Image Upload funktioniert nur mit einem gültigen `BLOB_READ_WRITE_TOKEN` von Vercel.

**Für lokale Tests ohne Vercel Blob:**
1. Registrierung wird einen Fehler beim Image Upload werfen
2. Du kannst die App trotzdem testen mit dem Admin Dashboard

**Um Image Upload lokal zu testen:**
```bash
# Vercel Projekt erstellen und Blob Token holen
vercel link
vercel env pull .env.local
```

## 📋 Standard Login Daten

Nach dem Seed:
- **Username:** `admin`
- **Email:** `admin@tournament.com`
- **Role:** ADMIN

## 🎯 Nächste Schritte

1. **Admin Dashboard testen:** http://localhost:3000/admin
2. **Access Code generieren** im Admin Dashboard
3. **User Registrierung testen:** http://localhost:3000/register

## 🔧 Nützliche Commands

```bash
# Prisma Studio (DB GUI)
npx prisma studio

# Schema Änderungen anwenden
npx prisma db push

# Datenbank zurücksetzen
npx prisma db push --force-reset
npm run db:seed
```

## 🌐 Production Deployment

Siehe [VERCEL_SETUP.md](./VERCEL_SETUP.md) für Vercel Deployment Anleitung.

