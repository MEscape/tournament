# Vercel Setup Anleitung

## 🚀 Vercel mit lokalem Projekt verbinden

### 1. Vercel CLI installieren (falls noch nicht geschehen)

```bash
npm i -g vercel
```

### 2. Vercel Login

```bash
vercel login
```

### 3. Projekt mit Vercel verbinden

```bash
vercel link
```

Folge den Anweisungen:
- **Set up and deploy?** → YES
- **Which scope?** → Wähle dein Vercel Team/Account
- **Link to existing project?** → NO (falls neu)
- **What's your project's name?** → tournament (oder eigener Name)
- **In which directory is your code located?** → ./

### 4. Vercel Postgres Database hinzufügen

1. Öffne Vercel Dashboard: https://vercel.com/dashboard
2. Navigiere zu deinem Projekt
3. Gehe zu **Storage** Tab
4. Klicke auf **Create Database**
5. Wähle **Postgres**
6. Erstelle die Datenbank
7. Die `DATABASE_URL` wird automatisch als Environment Variable gesetzt

### 5. Vercel Blob Storage hinzufügen

1. Im Vercel Dashboard → **Storage**
2. Klicke auf **Create Database** → **Blob**
3. Erstelle den Blob Storage
4. `BLOB_READ_WRITE_TOKEN` wird automatisch gesetzt

### 6. Environment Variables setzen

Im Vercel Dashboard → Settings → Environment Variables:

```
NEXTAUTH_URL=https://deine-domain.vercel.app
NEXTAUTH_SECRET=<generiere-mit-openssl-rand-base64-32>
DATABASE_URL=<automatisch-gesetzt-durch-postgres>
BLOB_READ_WRITE_TOKEN=<automatisch-gesetzt-durch-blob>
```

**NEXTAUTH_SECRET generieren:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 7. Environment Variables lokal pullen

```bash
vercel env pull .env.local
```

Dies lädt alle Vercel Environment Variables in `.env.local`

### 8. Datenbank Schema pushen

```bash
npx prisma db push
```

### 9. Datenbank seeden (Admin User erstellen)

```bash
npm run db:seed
```

### 10. Development Server starten

```bash
npm run dev
```

Öffne http://localhost:3000

### 11. Zu Vercel deployen

```bash
vercel --prod
```

## 📝 Nach dem ersten Deploy

1. Öffne die Vercel URL
2. Navigiere zur Admin-Seite
3. Login mit dem Admin User (siehe Seed Output)
4. Generiere Access Codes
5. Teile Access Codes mit neuen Usern

## 🔧 Development Workflow

```bash
# Lokale Entwicklung
npm run dev

# Schema Änderungen
npx prisma db push
npx prisma generate

# Preview Deploy
vercel

# Production Deploy
vercel --prod
```

## 🗄️ Datenbank verwalten

```bash
# Prisma Studio öffnen (GUI für DB)
npx prisma studio

# Database Browser (nur mit Vercel Postgres)
vercel db browse
```

## ⚠️ Wichtige Hinweise

1. **Environment Variables**: 
   - Lokale Entwicklung: `.env` oder `.env.local`
   - Production: Vercel Dashboard

2. **Database**:
   - Lokale Dev: Eigene Postgres DB
   - Production: Vercel Postgres

3. **Image Upload**:
   - Funktioniert nur mit Vercel Blob Token
   - Lokale Entwicklung: Vercel Blob Token aus `.env.local`

4. **Admin User**:
   - Nach Seed: Username `admin`
   - **Wichtig**: In Production echten Admin erstellen!

## 🐛 Troubleshooting

### Vercel Link funktioniert nicht
```bash
rm -rf .vercel
vercel link
```

### Environment Variables nicht verfügbar
```bash
vercel env pull .env.local --force
```

### Database Connection Error
Prüfe ob `DATABASE_URL` korrekt in Vercel gesetzt ist

### Prisma Client Error
```bash
npx prisma generate
npm run dev
```

