# 💾 Istruzioni Backup Prima del Reset Laptop

## ✅ Checklist Pre-Reset

### 1. Backup Codice (GitHub) ✅
```bash
# Verifica che tutto sia committato
git status

# Se ci sono modifiche non committate
git add -A
git commit -m "Final commit before reset"
git push
```

**Repository:** `https://github.com/sadeghsehat-commits/cleaning-shift.git`

---

### 2. Backup Environment Variables

**File da salvare:**
- `.env.local` (contiene tutte le variabili d'ambiente)

**Variabili importanti:**
```
MONGODB_URI=mongodb://...
JWT_SECRET=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_API_URL=...
```

**Dove salvare:**
- Password manager (1Password, LastPass, etc.)
- File di testo criptato
- Cloud storage sicuro

---

### 3. Backup Database

**Se usi MongoDB Atlas:**
- Vai su MongoDB Atlas Dashboard
- Database → Export → Export Collection
- Salva i file JSON

**Se usi MongoDB locale:**
```bash
mongodump --out=/path/to/backup
# Comprimi la cartella backup
tar -czf mongodb-backup.tar.gz /path/to/backup
```

---

### 4. Backup Credenziali Vercel

**Salva:**
- Email account Vercel
- Password Vercel
- Nome progetto Vercel
- URL deploy: `https://[nome-progetto].vercel.app`

**Come trovare:**
- Vai su https://vercel.com/dashboard
- Seleziona progetto
- Settings → General → vedi URL

---

### 5. Backup File Importanti

**File da salvare:**
- `.env.local` (già menzionato)
- `package.json` (già su Git)
- Qualsiasi file di configurazione personalizzato

---

## 🔄 Dopo il Reset - Ripristino

### Step 1: Reinstallare Software

**Software necessari:**
- Node.js (versione 18+)
- npm o yarn
- Git
- MongoDB (se locale) o MongoDB Compass
- Xcode (se vuoi buildare iOS)
- Android Studio (se vuoi buildare Android)

---

### Step 2: Clonare Repository

```bash
# Clona il repository
git clone https://github.com/sadeghsehat-commits/cleaning-shift.git

# Vai nella cartella
cd cleaning-shift

# Installa dipendenze
npm install
```

---

### Step 3: Configurare Environment Variables

```bash
# Crea file .env.local
cp .env.example .env.local  # Se esiste
# Oppure crea manualmente

# Modifica .env.local con i tuoi valori salvati
nano .env.local
```

**Inserisci:**
```
MONGODB_URI=il_tuo_uri_mongodb
JWT_SECRET=il_tuo_jwt_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=la_tua_api_key (opzionale)
NEXT_PUBLIC_API_URL=https://tuo-progetto.vercel.app (per mobile)
```

---

### Step 4: Verificare Connessione Database

```bash
# Avvia app in sviluppo
npm run dev

# Apri browser
# http://localhost:3000

# Prova a fare login
# Se funziona → database connesso ✅
```

---

### Step 5: Riconnettere Vercel (se necessario)

**Se Vercel si è disconnesso:**
1. Vai su https://vercel.com/dashboard
2. Settings → Git
3. Riconnetti repository GitHub
4. Verifica che auto-deploy sia attivo

---

### Step 6: Reinstallare Dipendenze Mobile (se necessario)

```bash
# Se vuoi buildare app native
cd ios/App
pod install  # Solo se usi CocoaPods (Capacitor 8 usa SPM)
cd ../..

# Sincronizza Capacitor
npx cap sync
```

---

## 📋 File di Riferimento

Dopo il ripristino, consulta:
- `RIEPILOGO-COMPLETO-PROGETTO.md` - Panoramica completa
- `PWA-INSTALLATION-GUIDE.md` - Installazione PWA
- `BUILD-MOBILE-APPS.md` - Build app native
- `package.json` - Dipendenze e script

---

## ⚠️ Cose da NON Dimenticare

1. **MONGODB_URI** - Senza questo, l'app non funziona
2. **JWT_SECRET** - Senza questo, login non funziona
3. **Credenziali Vercel** - Per deploy automatico
4. **Credenziali MongoDB** - Se usi Atlas
5. **API Keys** - Google Maps (se usata)

---

## 🆘 Se Qualcosa Non Funziona Dopo il Reset

1. **Verifica Node.js:**
   ```bash
   node --version  # Dovrebbe essere 18+
   npm --version
   ```

2. **Reinstalla dipendenze:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Rebuild:**
   ```bash
   rm -rf .next
   npm run build
   ```

4. **Verifica database:**
   - Controlla che MongoDB sia accessibile
   - Verifica MONGODB_URI in .env.local

5. **Controlla log:**
   ```bash
   npm run dev
   # Leggi errori nella console
   ```

---

## ✅ Verifica Finale

Dopo il ripristino, verifica che funzioni:

- [ ] `npm run dev` avvia senza errori
- [ ] Login funziona
- [ ] Database connesso
- [ ] Pagine principali caricano
- [ ] Vercel deploy funziona (se configurato)

---

**Tutto il codice è su Git. Basta clonare e configurare .env.local!** 🚀

