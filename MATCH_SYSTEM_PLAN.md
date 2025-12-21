# 🎯 TOURNAMENT MATCH SYSTEM - IMPLEMENTATION PLAN

## Übersicht der neuen Features:

---

## 1. BRACKET IMPROVEMENTS

### ❌ Aktuell:
- Linear von links nach rechts
- Manual Winner Selection
- Nicht kompakt

### ✅ Neu:
- **Kompakter Baum**: Links & Rechts nach innen
- **Kein Manual Selection**: Winner kommt aus Match-Ergebnis
- **Admin Overlay**: Match Start Control

---

## 2. ADMIN MATCH START OVERLAY

### Trigger:
- Admin auf Bracket Page
- Button "Match Starten" (floating)

### Overlay Inhalt:
```
┌─────────────────────────────────────┐
│   🎮 Match Konfiguration           │
├─────────────────────────────────────┤
│                                     │
│  ⏱️ Match Dauer:                   │
│  [=========>     ] 5 Min           │
│  (Slider: 1-60 Minuten)            │
│                                     │
│  🎯 Thema:                          │
│  ○ Zufällig auswählen               │
│  ○ Manuell wählen:                  │
│     [Dropdown: Genehmigte Themen]  │
│                                     │
│  [Abbrechen]  [Match Starten! 🚀]  │
└─────────────────────────────────────┘
```

### Flow:
1. Admin wählt Dauer & Thema
2. Click "Match Starten"
3. **Cinematischer Countdown** (3-2-1-GO!)
4. Alle Spieler werden weitergeleitet

---

## 3. MATCH RUNNING PAGE

### URL Structure:
```
/tournament/match/[matchId]
```

### Spieler Perspektive:

```
┌──────────────────────────────────────────────────┐
│  🎯 Thema: Silvester Einkauf @ ALDI (50€)      │
│     Präferenzen: viel Feuerwerk, keine Raketen  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ⏱️ Verbleibende Zeit: [========>    ] 3:45    │
│                                                  │
│  📝 Deine Einkaufsliste:                        │
│  ┌────────────────────────────────────────────┐ │
│  │ - Batterien (10 Stück) - 8€              │ │
│  │ - Wunderkerzen (5 Packungen) - 12€       │ │
│  │ - Feuerwerk Sortiment - 25€              │ │
│  │ - ...                                     │ │
│  │                                           │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  👤 Gegner: TestSpieler5                        │
│  ┌────────────────────────────────────────────┐ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │ (Geblurred - nicht lesbar)                │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Features:**
- ✅ Theme Display oben
- ✅ Timer mit Progress Bar
- ✅ Eigenes Textfeld (multi-line)
- ✅ Gegner Textfeld (geblurred mit CSS filter)
- ✅ Realtime Updates (eigener Text)
- ✅ Keine Inspect-Element Hacks möglich

---

### Admin Spectator Dashboard:

```
┌─────────────────────────────────────────────────────┐
│  👑 Admin Dashboard - Laufende Matches             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Match 1: TestSpieler1 vs TestSpieler2             │
│  ┌───────────────────┬──────────────────────────┐  │
│  │ TestSpieler1      │ TestSpieler2             │  │
│  │ - Batterien 8€    │ - Raketen 15€            │  │
│  │ - Feuerwerk 25€   │ - Wunderkerzen 10€       │  │
│  │ ...               │ ...                      │  │
│  └───────────────────┴──────────────────────────┘  │
│  ⏱️ 3:45                                           │
│                                                     │
│  Match 2: TestSpieler3 vs TestSpieler4             │
│  ┌───────────────────┬──────────────────────────┐  │
│  │ ...               │ ...                      │  │
│  └───────────────────┴──────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Alle Matches auf einen Blick
- ✅ Beide Listen sichtbar (nicht geblurred)
- ✅ Click auf Match → Detail View
- ✅ Realtime Updates
- ✅ Timer für alle Matches

---

## 4. QUICK ACTIONS & SIGN OUT ÜBERALL

### Locations:
- ✅ Tournament Lobby (bereits da)
- ✅ Tournament Bracket
- ✅ Match Running Page
- ✅ Themes Page
- ✅ Admin Dashboard

### Component:
```tsx
<GlobalNavigation user={user} />
```

---

## 5. REALTIME SYSTEM

### Match State:
```typescript
interface MatchState {
  matchId: string
  theme: {
    title: string
    shop: string
    budget: number
    preferences: string
  }
  duration: number // in seconds
  startedAt: number
  player1: {
    userId: string
    username: string
    list: string // Realtime updated
  }
  player2: {
    userId: string
    username: string
    list: string // Realtime updated
  }
}
```

### Tech:
- **Server-Sent Events (SSE)** für Realtime
- Oder: **Pusher** (bereits konfiguriert)
- In-Memory Store für Match States

---

## 6. DATABASE SCHEMA UPDATES

```prisma
model Match {
  id            String      @id @default(cuid())
  tournamentId  String?     // Optional: Link zu Tournament
  
  // Theme
  themeId       String?
  theme         Theme?      @relation(fields: [themeId], references: [id])
  
  // Config
  duration      Int         // in seconds
  startedAt     DateTime?
  endedAt       DateTime?
  
  // Players
  player1Id     String
  player1List   String      @default("")
  
  player2Id     String
  player2List   String      @default("")
  
  // Result
  winnerId      String?
  status        MatchStatus @default(PENDING)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum MatchStatus {
  PENDING
  RUNNING
  COMPLETED
  CANCELLED
}
```

---

## 7. IMPLEMENTATION STEPS

### Phase 1: Match Start System
1. ✅ Create Admin Overlay Component
2. ✅ Theme Selection (Random + Manual)
3. ✅ Duration Slider
4. ✅ Cinematischer Countdown
5. ✅ Navigation zu Match Page

### Phase 2: Match Running Page
1. ✅ Create Match Page Component
2. ✅ Theme Display
3. ✅ Timer mit Progress Bar
4. ✅ Textfeld für Einkaufsliste
5. ✅ Blur Effect für Gegner
6. ✅ Realtime Updates (SSE/Pusher)

### Phase 3: Admin Dashboard
1. ✅ Create Admin Match Dashboard
2. ✅ Show all running matches
3. ✅ Both lists visible
4. ✅ Click for Detail View
5. ✅ Realtime Updates

### Phase 4: Global Navigation
1. ✅ Create GlobalNavigation Component
2. ✅ Add to all pages
3. ✅ Quick Actions + Sign Out

### Phase 5: Bracket Improvements
1. ✅ Redesign Bracket Layout (kompakt)
2. ✅ Remove Manual Winner Selection
3. ✅ Winner from Match Result

---

## 8. SECURITY CONSIDERATIONS

### Textfeld Protection:
```tsx
// Client Side: Blur mit CSS
<div className="blur-lg select-none pointer-events-none">
  {opponentList}
</div>

// Server Side: Niemals opponent list an client senden
// Nur bei Admin sichtbar
```

### Inspect Element Prevention:
- ✅ Opponent list nicht im DOM
- ✅ Nur placeholder text
- ✅ Server validiert alles

---

## 9. USER FLOWS

### Flow A: Player Match Start
```
Player in Lobby (ready)
    ↓
Admin startet Match
    ↓
Countdown 3-2-1
    ↓
Navigate zu /tournament/match/[matchId]
    ↓
Sehe Theme & Timer
    ↓
Schreibe Einkaufsliste (realtime)
    ↓
Timer läuft ab
    ↓
Match beendet → Zurück zu Bracket
```

### Flow B: Admin Match Control
```
Admin auf Bracket
    ↓
Click "Match Starten"
    ↓
Overlay: Wähle Duration & Theme
    ↓
Click "Starten"
    ↓
Countdown für alle
    ↓
Navigate zu Admin Dashboard
    ↓
Sehe alle Matches realtime
    ↓
Click auf Match → Detail View
```

---

## 10. FILES TO CREATE

```
src/features/match/
├── actions/
│   ├── match-actions.ts          (Start, Update, Complete)
│   └── match-realtime.ts         (SSE/Pusher)
├── components/
│   ├── admin-match-overlay.tsx   (Start Control)
│   ├── admin-dashboard.tsx       (All Matches View)
│   ├── match-player-view.tsx     (Player Perspective)
│   └── match-timer.tsx           (Timer Component)
└── store/
    └── match-store.ts            (In-Memory Match States)

src/app/tournament/match/[matchId]/
├── page.tsx                      (Entry Point)
└── match-client.tsx              (Client Component)

src/components/
└── global-navigation.tsx         (Quick Actions + Sign Out)
```

---

## 11. NEXT STEPS

1. ✅ Fix Theme Suggestion Error
2. ✅ Create Match Database Schema
3. ✅ Implement Admin Match Overlay
4. ✅ Create Match Running Page
5. ✅ Add Realtime System
6. ✅ Create Admin Dashboard
7. ✅ Add Global Navigation
8. ✅ Improve Bracket Layout

**Estimated Time:** 4-6 Hours
**Complexity:** High (Realtime + Security)

---

## 12. QUESTIONS TO CLARIFY

1. **Winner Selection:**
   - Automatisch nach Timer Ende?
   - Oder Admin wählt Winner basierend auf Listen?

2. **Multiple Matches gleichzeitig:**
   - Alle Matches gleichzeitig?
   - Oder sequenziell?

3. **Liste Format:**
   - Freitext?
   - Oder strukturiert (Artikel + Preis)?

4. **Judge System:**
   - Wer entscheidet Winner?
   - Admin?
   - Community Vote?

---

## STATUS: READY TO IMPLEMENT! 🚀

**Dependencies:**
- Pusher Account (für Realtime)
- Oder SSE Implementation
- Prisma Migration

**Let's build this!** 🎆

