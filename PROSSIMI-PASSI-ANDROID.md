# 🚀 Prossimi Passi - Build APK Android

## ✅ Step 1 Completato: URL Vercel Configurato

Ho aggiunto al file `.env.local`:
```
NEXT_PUBLIC_API_URL=https://cleaning-shift-manager.vercel.app
```

**Nota:** Se il tuo URL Vercel è diverso (ad esempio un dominio personalizzato), puoi verificarlo:
1. Vai su https://vercel.com/sadegh-sehats-projects/cleaning-shift-manager
2. Clicca su **"Domains"** nella barra laterale
3. Vedrai l'URL del deploy (es: `cleaning-shift-manager.vercel.app` o un dominio personalizzato)

---

## 📋 STEP 2: Rebuild dell'App Web

Ora devi ricompilare l'app con la nuova configurazione.

### 2.1 Apri il Terminale

Apri il terminale sul tuo Mac e vai nella directory del progetto:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### 2.2 Pulisci i Build Precedenti (Opzionale ma Consigliato)

```bash
rm -rf .next out
```

Questo rimuove i file di build precedenti per assicurarti di avere un build pulito.

### 2.3 Build dell'App Web

```bash
npm run build
```

**Cosa succede:**
- Next.js compila l'app con la nuova configurazione
- Genera la cartella `out/` con i file statici
- Questo processo richiede **1-3 minuti**

**Aspetta che finisca.** Vedrai messaggi come:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**⚠️ Se vedi errori**, fermati e risolvili prima di continuare.

### 2.4 Sincronizza con Android

```bash
npx cap sync android
```

**Cosa succede:**
- Capacitor copia i file dalla cartella `out/` al progetto Android
- Aggiorna i file di configurazione Android
- Questo processo richiede **10-30 secondi**

**Dovresti vedere:**
```
✔ Copying web assets from out to android/app/src/main/assets/public
✔ Copying native bridge
✔ Syncing web platform
```

---

## 📋 STEP 3: Aprire Android Studio

### 3.1 Apri Android Studio

**Opzione A: Da Terminale (Più Veloce)**
```bash
npm run android
```

Questo comando:
- Apre Android Studio automaticamente
- Carica il progetto Android

**Opzione B: Manualmente**
1. Apri **Android Studio** (dalla cartella Applications)
2. Clicca su **"Open"** o **"Open an Existing Project"**
3. Naviga fino a: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android`
4. Clicca su **"OK"** o **"Open"**

### 3.2 Attendi che Android Studio Carichi il Progetto

**La prima volta può richiedere 5-10 minuti:**
- Android Studio scaricherà le dipendenze (Gradle)
- Gradle sincronizzerà il progetto
- Vedrai una barra di progresso in basso

**Aspetta che finisca.** Vedrai:
- ✅ "Gradle sync finished" in basso
- ✅ Nessun errore rosso nella barra di stato

**Se vedi errori:**
- Clicca sull'icona con due frecce circolari: **"Sync Project with Gradle Files"**
- Oppure: **File** > **Sync Project with Gradle Files**

---

## 📋 STEP 4: Build APK in Android Studio

### 4.1 Build APK (Debug - per Test)

**Metodo 1: Menu Build (Più Semplice)**
1. Clicca su **"Build"** nella barra del menu in alto
2. Seleziona **"Build Bundle(s) / APK(s)"**
3. Clicca su **"Build APK(s)"**
4. Aspetta che finisca (**1-3 minuti**)

**Metodo 2: Gradle (Alternativo)**
1. Apri il pannello **"Gradle"** a destra
   - Se non lo vedi: **View** > **Tool Windows** > **Gradle**
2. Espandi: **android** > **Tasks** > **build**
3. Doppio click su **"assembleDebug"**
4. Aspetta che finisca

### 4.2 Notifica di Completamento

**Quando il build è completato:**
- Android Studio mostrerà una notifica: **"APK(s) generated successfully"**
- Clicca su **"locate"** per aprire la cartella con l'APK

**Se non vedi la notifica:**
- Vai manualmente alla cartella (vedi Step 4.3)

### 4.3 Trova l'APK

**Il file APK sarà in:**
```
/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/build/outputs/apk/debug/app-debug.apk
```

**Come trovarlo:**

**Metodo 1: Da Android Studio**
- Clicca su **"locate"** nella notifica

**Metodo 2: Da Finder**
1. Apri **Finder**
2. Premi `Cmd+Shift+G` (Vai alla cartella)
3. Incolla: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/build/outputs/apk/debug/`
4. Premi **Invio**
5. Vedrai il file `app-debug.apk`

**Metodo 3: Da Terminale**
```bash
open android/app/build/outputs/apk/debug/
```

---

## 📋 STEP 5: Installare APK sul Telefono Android

### 5.1 Trasferisci l'APK sul Telefono

**Metodo A: Via USB (Consigliato)**
1. Collega il telefono al computer con un cavo USB
2. Sul telefono, quando appare la notifica, seleziona **"File Transfer"** o **"MTP"**
3. Sul computer, apri la cartella del telefono
4. Copia `app-debug.apk` nella cartella **Download** del telefono

**Metodo B: Via Email/Cloud**
1. Invia l'APK a te stesso via email
2. Oppure caricalo su Google Drive
3. Scaricalo sul telefono

### 5.2 Installa l'APK sul Telefono

1. **Sul telefono**, apri il file manager (File Manager, Files, ecc.)
2. **Vai alla cartella** dove hai salvato l'APK (Download, ecc.)
3. **Tocca** il file `app-debug.apk`
4. **Se appare un avviso** "Installa app da fonti sconosciute":
   - Clicca su **"Impostazioni"** o **"Settings"**
   - Attiva **"Consenti da questa fonte"** o **"Allow from this source"**
   - Torna indietro e tocca di nuovo l'APK
5. **Clicca su "Installa"** o **"Install"**
6. **Aspetta** che l'installazione finisca (10-30 secondi)
7. **Clicca su "Apri"** o **"Open"** quando finisce

### 5.3 Verifica l'Installazione

1. **Cerca l'app** nella lista delle app (dovrebbe chiamarsi "CleanShift")
2. **Apri l'app**
3. **Dovresti vedere la pagina di login** (non più "Loading...")
4. **Prova a fare login** - dovrebbe funzionare! 🎉

---

## 🔧 Troubleshooting Rapido

### Problema: "Gradle sync failed"
**Soluzione:** 
- **File** > **Invalidate Caches / Restart** > **Invalidate and Restart**

### Problema: "Build failed"
**Soluzione:**
1. Verifica che `NEXT_PUBLIC_API_URL` sia in `.env.local`:
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```
2. Rebuild completo:
   ```bash
   rm -rf .next out
   npm run build
   npx cap sync android
   ```
3. In Android Studio: **Build** > **Clean Project** > **Rebuild Project**

### Problema: L'app mostra ancora "Loading..."
**Soluzione:**
1. Verifica che l'URL Vercel sia corretto:
   - Apri https://cleaning-shift-manager.vercel.app nel browser
   - Dovresti vedere la pagina di login
2. Se l'URL è diverso, aggiorna `.env.local` e rifai il build

### Problema: "Install blocked" sul telefono
**Soluzione:**
- **Impostazioni** > **Sicurezza** > Attiva **"Origini sconosciute"**
- Oppure, quando installi l'APK, clicca su **"Impostazioni"** nell'avviso

---

## ✅ Checklist Finale

Prima di considerare completato:

- [ ] `NEXT_PUBLIC_API_URL` è configurato in `.env.local` ✅ (già fatto)
- [ ] `npm run build` è completato senza errori
- [ ] `npx cap sync android` è completato
- [ ] Android Studio ha aperto il progetto senza errori
- [ ] APK è stato generato con successo
- [ ] APK è installato sul telefono
- [ ] L'app si apre e mostra la pagina di login (non "Loading...")
- [ ] Il login funziona correttamente

---

## 📚 Riferimenti

- **Guida completa:** `GUIDA-COMPLETA-ANDROID-APK.md`
- **Troubleshooting:** `FIX-ANDROID-APK-LOADING.md`
- **Build APK:** `BUILD-ANDROID-APK-FIXED.md`

---

**Ora puoi iniziare con lo STEP 2! 🚀**

Esegui i comandi in ordine:
1. `rm -rf .next out` (opzionale)
2. `npm run build`
3. `npx cap sync android`
4. `npm run android`

Buona fortuna! 🎉

