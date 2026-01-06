# 📱 Build Android APK - Versione Corretta

## ✅ Problema Risolto

L'app mobile ora usa `apiUrl()` per tutte le chiamate API, permettendo all'app di connettersi al server Vercel invece di cercare route locali che non esistono.

## 🚀 Step per Build APK Funzionante

### Step 1: Configurare URL Vercel

1. **Trova il tuo URL Vercel:**
   - Vai su https://vercel.com/dashboard
   - Seleziona il tuo progetto
   - Copia l'URL (es: `https://cleaning-shift-xyz.vercel.app`)

2. **Aggiungi al file `.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=https://tuo-progetto.vercel.app
   ```
   
   **⚠️ IMPORTANTE:** Sostituisci `https://tuo-progetto.vercel.app` con il tuo URL Vercel reale!

### Step 2: Build dell'App Web

```bash
# Assicurati di essere nella directory del progetto
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Build dell'app (genera la cartella 'out')
npm run build
```

### Step 3: Sincronizza con Android

```bash
# Sincronizza i file con il progetto Android
npx cap sync android
```

### Step 4: Apri Android Studio

```bash
# Apri Android Studio
npm run android
```

Oppure apri manualmente:
```bash
open android
```

### Step 5: Build APK in Android Studio

1. **In Android Studio:**
   - Aspetta che il progetto si carichi completamente
   - Vai su **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
   - Oppure: **Run** > **Run 'app'** (per test su emulatore/dispositivo)

2. **Trova l'APK:**
   - Dopo il build, Android Studio mostrerà un link "locate" o "analyze"
   - L'APK sarà in: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Oppure: `android/app/build/outputs/apk/release/app-release.apk` (se hai fatto release build)

### Step 6: Installa APK sul Telefono

1. **Trasferisci l'APK:**
   - Via USB: collega il telefono e copia l'APK
   - Via email/cloud: invia l'APK a te stesso
   - Via ADB: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

2. **Installa:**
   - Sul telefono, apri il file APK
   - Permetti installazione da fonti sconosciute (se richiesto)
   - Installa l'app

## ✅ Verifica

Dopo l'installazione:

1. **Apri l'app** sul telefono
2. **Dovresti vedere la pagina di login** (non più "Loading...")
3. **Prova a fare login** - dovrebbe funzionare!

## 🔧 Troubleshooting

### L'app mostra ancora "Loading..."

1. **Verifica che `NEXT_PUBLIC_API_URL` sia configurato:**
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```
   
   Se non c'è, aggiungilo:
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://tuo-progetto.vercel.app" >> .env.local
   ```

2. **Rebuild completo:**
   ```bash
   # Rimuovi build precedenti
   rm -rf .next out
   
   # Rebuild
   npm run build
   npx cap sync android
   ```

3. **Verifica che l'URL Vercel sia corretto:**
   - Apri l'URL nel browser
   - Dovresti vedere la pagina di login

### Le chiamate API falliscono

1. **Verifica CORS su Vercel:**
   - Vercel di default permette CORS
   - Se hai problemi, verifica le impostazioni Vercel

2. **Testa l'API manualmente:**
   ```bash
   curl https://tuo-progetto.vercel.app/api/auth/me
   ```

3. **Controlla i log Android:**
   ```bash
   adb logcat | grep -i "capacitor\|api\|error"
   ```

### Build fallisce in Android Studio

1. **Verifica che Android Studio sia aggiornato**
2. **Sync Gradle:**
   - File > Sync Project with Gradle Files
3. **Clean e Rebuild:**
   - Build > Clean Project
   - Build > Rebuild Project

## 📝 Note Importanti

- ⚠️ **NEXT_PUBLIC_API_URL** deve essere configurato **prima** del build
- ⚠️ Le variabili `NEXT_PUBLIC_*` sono embeddate al build time
- ⚠️ Dopo aver cambiato `.env.local`, devi fare **rebuild completo**
- ⚠️ L'URL Vercel deve essere accessibile pubblicamente

## 🎯 File Aggiornati

Tutti i file che fanno chiamate API sono stati aggiornati per usare `apiUrl()`:

- ✅ `app/page.tsx`
- ✅ `components/LoginForm.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `app/dashboard/shifts/new/page.tsx`
- ✅ `app/dashboard/apartments/page.tsx`
- ✅ E tutti gli altri file dashboard...

## 📚 Riferimenti

- Guida completa: `FIX-ANDROID-APK-LOADING.md`
- Configurazione API: `lib/api-config.ts`

