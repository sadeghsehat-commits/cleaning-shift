# 📋 Riepilogo Completo del Progetto - Cleaning Shift Management

**Data creazione documento:** 6 Gennaio 2025  
**Progetto:** Sistema di gestione turni di pulizia per appartamenti

---

## 🎯 Panoramica del Progetto

Sistema web completo per la gestione di turni di pulizia con:
- **3 tipi di account**: Admin, Owner (Proprietario), Operator (Operatore)
- **Gestione appartamenti** con specifiche dettagliate
- **Sistema di turni** con calendario e prenotazioni
- **Notifiche push** (richiede app native)
- **PWA** (Progressive Web App) per installazione su mobile
- **App native iOS/Android** (in sviluppo con Capacitor)

---

## 📱 Funzionalità Principali Implementate

### 1. Sistema di Autenticazione e Ruoli

**Ruoli:**
- **Admin**: Accesso completo, può gestire tutto
- **Owner**: Gestisce i propri appartamenti e turni
- **Operator**: Visualizza e conferma i turni assegnati

**Funzionalità:**
- Login/Logout
- Protezione route basata su ruoli
- Session management

---

### 2. Gestione Appartamenti

**Campi base:**
- Nome, indirizzo, città, CAP, paese (sempre Italy)
- Descrizione
- Coordinate GPS (latitudine/longitudine)
- Proprietario (owner)

**Specifiche avanzate (per calcolo automatico capacità):**
- **Numero di bagni**
- **Salone:**
  - Ha divano letto? (Sì/No)
  - Capacità divano letto (1 o 2 persone)
- **Camere da letto:**
  - Array di camere
  - Ogni camera può avere:
    - Queen Bed (2 persone)
    - Single Bed (1 persona)
    - Sofa Bed 1 persona
    - Sofa Bed 2 persone

**Calcolo automatico capacità:**
- Il sistema calcola automaticamente la capacità massima basandosi sui letti
- Campo `calculatedMaxCapacity` aggiornato automaticamente
- Campo `maxCapacity` manuale rimosso (non più necessario)

**Tempo di pulizia (Admin only):**
- Campo `cleaningTime` in minuti (es: 210 = 3h 30m)
- Editabile solo da admin
- Pulsanti +30 min e -30 min per impostare
- Usato per calcolo automatico end time nei turni

**Pagine:**
- `/dashboard/apartments` - Lista appartamenti
- `/dashboard/apartments/new` - Crea nuovo appartamento
- `/dashboard/apartments/[id]/edit` - Modifica appartamento

---

### 3. Sistema Calendario e Prenotazioni

**Vecchio sistema (rimosso):**
- `scheduledDays`: array di date di check-out

**Nuovo sistema:**
- `bookings`: array di oggetti con:
  - `checkIn`: data check-in
  - `checkOut`: data check-out
  - `guestCount`: numero ospiti

**Funzionalità:**
- Selezione range date (check-in → check-out)
- Visualizzazione giorni occupati con colore chiaro
- Giorni check-out possono essere anche check-in per nuove prenotazioni
- Visualizzazione "(Out / IN)" per giorni che sono sia check-out che check-in
- Prevenzione inserimento date passate (solo owner)
- Admin può vedere tutti gli appartamenti e prenotazioni

**Pagine:**
- `/dashboard/cleaning-calendar` - Calendario prenotazioni

---

### 4. Sistema Turni (Shifts)

**Campi turno:**
- Appartamento
- Operatore (cleaner)
- Data turno
- Orario inizio (`scheduledStartTime`)
- Orario fine (`scheduledEndTime`) - opzionale
- Numero ospiti (`guestCount`) - preso da prenotazioni o inserito manualmente
- Stato: `scheduled`, `in_progress`, `completed`, `cancelled`
- Tempi effettivi: `actualStartTime`, `actualEndTime`
- Commenti: array di commenti con traduzione automatica
- Foto istruzioni: array con descrizioni traducibili
- Problemi segnalati: array con foto e descrizioni

**Calcolo automatico end time:**
- Se l'appartamento ha `cleaningTime` impostato
- Quando si seleziona l'appartamento → calcola end time
- Quando si cambia start time → ricalcola end time
- Admin può modificare manualmente con +30/-30 min

**Validazioni:**
- Operatore non può avere turni sovrapposti
- Minimo 90 minuti tra turni dello stesso operatore
- Operatore non disponibile (permesso, malattia, ferie) → non visibile

**Pagine:**
- `/dashboard/shifts` - Lista turni
- `/dashboard/shifts/new` - Crea nuovo turno
- `/dashboard/shifts/[id]` - Dettagli turno
- `/dashboard/shifts/[id]/edit` - Modifica turno

---

### 5. Weekly Schedule (Programma Settimanale)

**Visualizzazione:**
- Tabella con colonne: Date, Appartamenti (raggruppati per owner)
- Righe: Operatori
- Celle: Turni con:
  - Nome operatore
  - Numero ospiti (con icona 👤)
  - Orario turno (dinamico):
    - Se completato: mostra `actualEndTime`
    - Se in progress: mostra `actualStartTime`
    - Se scheduled: mostra `scheduledStartTime`

**Colori:**
- **Arancione chiaro** (`bg-orange-50`): Scheduled
- **Verde smeraldo** (`bg-emerald-200`): In Progress
- **Grigio chiaro** (`bg-gray-100`): Completed

**Funzionalità:**
- Header date fisso (sticky) quando si scrolla
- Mostra solo turni confermati (`confirmedSeen.confirmed === true`)
- Legenda colori
- Responsive per mobile
- Rimossi email owner e date range dal header

**Pagine:**
- `/dashboard/schedule` - Programma settimanale

---

### 6. Sistema Richieste Indisponibilità

**Per Operatori:**
- Calendario per selezionare giorni
- Dropdown motivo: "Malattia", "Ferie", "Permesso"
- Invio richiesta ad admin

**Per Admin:**
- Visualizza tutte le richieste
- Approva/Rifiuta richieste
- Filtra per stato e motivo

**Funzionalità:**
- Quando operatore è indisponibile → non appare nella lista operatori disponibili
- Validazione: operatore non può avere turni sovrapposti o con meno di 90 minuti di gap

**Pagine:**
- `/dashboard/unavailability` - Richiedi indisponibilità (operatori)
- `/dashboard/unavailability-requests` - Gestisci richieste (admin)

---

### 7. Report Operatori

**Report Lavoro Operatori:**
- Giorni lavorati
- Giorni di indisponibilità per motivo:
  - Malattia
  - Ferie
  - Permesso
- Report settimanale e mensile

**Pagine:**
- `/dashboard/reports/operator-work-days` - Report lavoro operatori

---

### 8. Sistema Commenti

**Funzionalità:**
- Tutti gli account possono aggiungere commenti ai turni
- Commenti multipli (array)
- Ordinati per tempo (più recenti prima)
- Traduzione automatica usando Google Translate (gratuito)
- Admin può eliminare commenti

**API:**
- `POST /api/shifts/[id]/comments` - Aggiungi commento
- `DELETE /api/shifts/[id]/comments/[commentId]` - Elimina commento (admin only)

---

### 9. Traduzione Automatica

**Implementazione:**
- File: `lib/translate.ts`
- Usa endpoint gratuito non ufficiale di Google Translate
- Traduce:
  - Descrizioni foto istruzioni
  - Commenti turni
  - Problemi segnalati

**Lingue supportate:**
- Inglese (default)
- Italiano
- Arabo
- Ucraino

---

### 10. Notifiche

**Tipi notifiche:**
- Nuovo turno assegnato
- Turno confermato da operatore (solo per operatore)
- Richiesta cambio orario
- Richiesta indisponibilità
- Altri eventi

**Nota importante:**
- Le notifiche push native funzionano solo con app native (.ipa/.apk)
- PWA non supporta notifiche push native completamente

---

## 📱 App Mobile (iOS/Android)

### PWA (Progressive Web App)

**Stato:** ✅ Completamente configurato e funzionante

**Installazione:**
- iOS: Safari → Condividi → "Aggiungi alla schermata Home"
- Android: Chrome → Menu → "Installa app"

**File importanti:**
- `public/manifest.json` - Configurazione PWA
- `app/layout.tsx` - Meta tags PWA
- `public/icons/icon-*.png` - Icone app (8 dimensioni)

**Guida:** `PWA-INSTALLATION-GUIDE.md`

---

### App Native (.ipa/.apk)

**Stato:** ⚙️ Configurato, richiede build

**Tecnologia:** Capacitor 8.0

**Configurazione:**
- `capacitor.config.ts` - Configurazione Capacitor
- `ios/App/` - Progetto iOS (Xcode)
- `android/` - Progetto Android (Android Studio)

**Build Script:**
- `build-native-simple.sh` - Script per build statico

**Problemi noti:**
- Next.js 16 con App Router richiede gestione speciale per route dinamiche
- Build script esclude temporaneamente route dinamiche durante export

**Guida:** `BUILD-MOBILE-APPS.md`, `CREATE-IPA-APK-FILES.md`

**Problema Xcode:**
- Progetto formato aggiornato per compatibilità Xcode 12.0
- Script: `fix-xcode-format.sh`
- Guida: `FIX-XCODE-COMPATIBILITY.md`, `GUIDA-COMPLETA-IPA-STEP-BY-STEP.md`

---

## 🗄️ Database (MongoDB)

### Modelli Principali

**User:**
- name, email, password (hash), role, phone

**Apartment:**
- name, address, city, postalCode, country
- owner (ref User)
- bathrooms, salon, bedrooms
- calculatedMaxCapacity (auto)
- cleaningTime (minuti, admin only)

**CleaningSchedule:**
- apartment (ref Apartment)
- bookings: [{ checkIn, checkOut, guestCount }]

**CleaningShift:**
- apartment (ref Apartment)
- cleaner (ref User)
- scheduledDate, scheduledStartTime, scheduledEndTime
- actualStartTime, actualEndTime
- status, guestCount
- comments: [{ text, postedBy, postedAt }]
- instructionPhotos, problems
- confirmedSeen: { confirmed, confirmedAt }

**UnavailabilityRequest:**
- operator (ref User)
- dates: [Date]
- reason: 'Malattia' | 'Ferie' | 'Permesso'
- status: 'pending' | 'approved' | 'rejected'

**Notification:**
- user (ref User)
- type, message, read, createdAt

---

## 🔧 Configurazione Tecnica

### Stack Tecnologico

- **Frontend:** Next.js 16.1.1 (App Router), React 18, TypeScript
- **Backend:** Next.js API Routes
- **Database:** MongoDB con Mongoose
- **Styling:** Tailwind CSS
- **Autenticazione:** JWT (JSON Web Tokens)
- **Notifiche:** Web Push API
- **Traduzione:** Google Translate (endpoint gratuito)
- **Maps:** Google Maps API (opzionale)

### File di Configurazione Importanti

**next.config.js:**
- Configurazione PWA (next-pwa)
- Export statico per mobile (quando necessario)

**package.json:**
- Scripts: dev, build, start, ios, android, sync

**capacitor.config.ts:**
- appId: `com.cleanshift.app`
- appName: `CleanShift`
- webDir: `out`

**Environment Variables (.env.local):**
- `MONGODB_URI` - Connection string MongoDB
- `JWT_SECRET` - Secret per JWT
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - API key Google Maps (opzionale)
- `NEXT_PUBLIC_API_URL` - URL API per app mobile (se diverso da origin)

---

## 📂 Struttura File Principali

```
app/
├── api/
│   ├── apartments/
│   │   ├── route.ts (GET, POST)
│   │   └── [id]/route.ts (GET, PATCH, DELETE)
│   ├── shifts/
│   │   ├── route.ts (GET, POST)
│   │   └── [id]/
│   │       ├── route.ts (GET, PATCH, DELETE)
│   │       ├── confirm/route.ts
│   │       └── comments/route.ts
│   ├── cleaning-schedule/route.ts
│   ├── unavailability-requests/route.ts
│   └── ...
├── dashboard/
│   ├── apartments/
│   │   ├── page.tsx (lista)
│   │   ├── new/page.tsx (crea)
│   │   └── [id]/edit/page.tsx (modifica)
│   ├── shifts/
│   │   ├── page.tsx (lista)
│   │   ├── new/page.tsx (crea)
│   │   └── [id]/page.tsx (dettagli)
│   ├── cleaning-calendar/page.tsx
│   ├── schedule/page.tsx
│   └── ...
├── layout.tsx (root layout con PWA)
└── ...

models/
├── Apartment.ts
├── CleaningShift.ts
├── CleaningSchedule.ts
├── User.ts
├── UnavailabilityRequest.ts
└── Notification.ts

lib/
├── mongodb.ts (connessione DB)
├── auth.ts (autenticazione JWT)
└── translate.ts (traduzione automatica)
```

---

## 🚀 Comandi Importanti

### Sviluppo
```bash
npm run dev          # Avvia server sviluppo
npm run build        # Build produzione
npm run start        # Avvia produzione
```

### Mobile (Capacitor)
```bash
npm run build        # Build web app
npx cap sync         # Sincronizza con iOS/Android
npm run ios          # Apri progetto iOS in Xcode
npm run android      # Apri progetto Android in Android Studio
./build-native-simple.sh  # Build completo per mobile
```

### Git
```bash
git add -A
git commit -m "Messaggio"
git push
```

---

## 📝 Note Importanti

### Permessi e Ruoli

**Admin può:**
- Tutto
- Modificare `cleaningTime` degli appartamenti
- Eliminare commenti
- Gestire richieste indisponibilità
- Vedere tutti gli appartamenti e turni

**Owner può:**
- Gestire solo i propri appartamenti
- Creare prenotazioni (check-in/check-out)
- Vedere turni dei propri appartamenti
- Modificare numero ospiti nei turni (fino all'inizio del turno)
- NON può modificare `cleaningTime`

**Operator può:**
- Vedere turni assegnati
- Confermare turni
- Iniziare/completare turni
- Segnalare problemi
- Aggiungere commenti
- Richiedere indisponibilità

### Validazioni Importanti

1. **Turni operatori:**
   - Non possono sovrapporsi
   - Minimo 90 minuti tra turni

2. **Date prenotazioni:**
   - Owner non può creare prenotazioni per date passate
   - Check-out day può essere anche check-in day

3. **Turni:**
   - Solo turni confermati appaiono in Weekly Schedule
   - Guest count preso da `shift.guestCount` o da `booking.guestCount`

---

## 🔄 Workflow Tipico

### Admin crea turno:
1. Vai su "Create New Shift"
2. Seleziona data dal calendario
3. Seleziona owner
4. Seleziona appartamento
5. Se appartamento ha `cleaningTime` → end time calcolato automaticamente
6. Seleziona operatore (filtrato per disponibilità)
7. Modifica end time se necessario (+30/-30 min)
8. Clicca "Create Shift"

### Owner crea prenotazione:
1. Vai su "Cleaning Calendar"
2. Seleziona appartamento
3. Clicca su giorno check-in
4. Clicca su giorno check-out
5. Inserisci numero ospiti
6. Salva

### Operator conferma turno:
1. Vai su "Shifts"
2. Vedi turni assegnati
3. Clicca "I saw the shift"
4. Clicca "Confirm"
5. Turno appare in Weekly Schedule

---

## 🐛 Problemi Conosciuti e Soluzioni

### 1. Build Mobile Fallisce
**Problema:** Next.js 16 non può esportare route dinamiche staticamente  
**Soluzione:** Script `build-native-simple.sh` esclude temporaneamente route dinamiche

### 2. Xcode "Future Format"
**Problema:** Progetto Xcode in formato troppo recente  
**Soluzione:** Esegui `./fix-xcode-format.sh` per downgrade a Xcode 12.0

### 3. Notifiche Push Non Funzionano
**Problema:** PWA non supporta completamente push native  
**Soluzione:** Usa app native (.ipa/.apk) per notifiche push complete

### 4. Pagina Edit 404
**Problema:** Vercel non ha deployato  
**Soluzione:** Attendi deploy o forza con `git commit --allow-empty -m "Trigger deploy" && git push`

---

## 📚 Guide e Documentazione

- `PWA-INSTALLATION-GUIDE.md` - Come installare PWA
- `BUILD-MOBILE-APPS.md` - Come creare app native
- `CREATE-IPA-APK-FILES.md` - Guida dettagliata .ipa/.apk
- `GUIDA-COMPLETA-IPA-STEP-BY-STEP.md` - Guida passo-passo iOS
- `FIX-XCODE-COMPATIBILITY.md` - Fix problemi Xcode
- `RISOLVI-ERRORI-BUILD-XCODE.md` - Troubleshooting build
- `VERIFICA-EDIT-APARTMENT.md` - Verifica pagina edit

---

## 🔐 Credenziali e Accesso

**Nota:** Le credenziali sono nel database MongoDB. Per accedere:
- Admin: crea account via API o direttamente nel DB
- Owner/Operator: creati da admin

**Reset password:** Implementare se necessario (non ancora fatto)

---

## 🎯 Prossimi Sviluppi Possibili

1. **Reset password** - Sistema recupero password
2. **Report avanzati** - Più statistiche e report
3. **Export dati** - CSV/Excel per report
4. **Integrazione pagamenti** - Se necessario
5. **App native complete** - Risolvere problemi build
6. **Notifiche email** - Oltre a push
7. **Multi-lingua completo** - Traduzione interfaccia

---

## 📞 Supporto e Troubleshooting

### Se qualcosa non funziona:

1. **Controlla console browser** (F12 → Console)
2. **Controlla log Vercel** (Dashboard → Deployments → Logs)
3. **Verifica database** - MongoDB Atlas o locale
4. **Controlla environment variables** - `.env.local`
5. **Rebuild locale** - `rm -rf .next && npm run build`

### Comandi utili:

```bash
# Verifica connessione MongoDB
# Controlla MONGODB_URI in .env.local

# Rebuild completo
rm -rf .next out
npm run build

# Reset database (ATTENZIONE: cancella tutto!)
# Usa API endpoint /api/cleaning-schedule/delete-all (solo admin)
```

---

## ✅ Checklist Setup Completo

- [ ] MongoDB configurato e connesso
- [ ] Environment variables impostate
- [ ] Primo admin creato
- [ ] App deployata su Vercel
- [ ] PWA testata e installabile
- [ ] App native buildate (se necessario)
- [ ] Notifiche push configurate (se necessario)

---

**Ultimo aggiornamento:** 6 Gennaio 2025  
**Versione:** 1.0  
**Stato:** Funzionante, in produzione

---

## 📦 Backup e Ripristino

**Prima del reset del laptop:**

1. **Backup codice:**
   ```bash
   git push  # Assicurati che tutto sia su GitHub
   ```

2. **Backup database:**
   - Esporta da MongoDB Atlas (se usi Atlas)
   - Oppure backup locale se MongoDB locale

3. **Backup environment variables:**
   - Salva `.env.local` in un posto sicuro
   - Salva credenziali Vercel

4. **Dopo il reset:**
   ```bash
   git clone [URL_REPOSITORY]
   cd [PROJECT_NAME]
   npm install
   cp .env.local.example .env.local  # E modifica con i tuoi valori
   npm run dev
   ```

---

**Tutto il lavoro è salvato su Git. Dopo il reset, basta clonare il repository e reinstallare le dipendenze!** ✅

