# 📱 Guida Completa: Build APK Android - Passo per Passo

## 🎯 Obiettivo
Creare un file APK installabile sul telefono Android che si connette al server Vercel.

---

## 📋 STEP 1: Configurare l'URL Vercel

### 1.1 Trova il tuo URL Vercel

1. **Apri il browser** (Chrome, Safari, Firefox, ecc.)
2. **Vai su:** https://vercel.com/dashboard
3. **Accedi** con il tuo account (se non sei loggato)
4. **Nella dashboard**, vedrai una lista di progetti
5. **Clicca sul progetto** "cleaning-shift" (o il nome che hai dato al progetto)
6. **Nella pagina del progetto**, in alto vedrai l'URL del deploy:
   - Esempio: `https://cleaning-shift-xyz.vercel.app`
   - Oppure: `https://cleaning-shift-manager.vercel.app`
   - **COPIA QUESTO URL** (clicca destro > Copy, oppure seleziona e Cmd+C / Ctrl+C)

### 1.2 Aggiungi l'URL al file .env.local

1. **Apri il terminale** (Terminal su Mac, o Command Prompt/PowerShell su Windows)

2. **Vai nella directory del progetto:**
   ```bash
   cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
   ```

3. **Controlla se il file `.env.local` esiste:**
   ```bash
   ls -la .env.local
   ```
   
   Se il file esiste, continua. Se non esiste, verrà creato.

4. **Apri il file `.env.local` con un editor:**
   
   **Su Mac:**
   ```bash
   nano .env.local
   ```
   
   **Oppure con Visual Studio Code:**
   ```bash
   code .env.local
   ```
   
   **Oppure con TextEdit:**
   ```bash
   open -a TextEdit .env.local
   ```

5. **Aggiungi questa riga** (sostituisci `https://tuo-progetto.vercel.app` con l'URL che hai copiato):
   ```
   NEXT_PUBLIC_API_URL=https://cleaning-shift-xyz.vercel.app
   ```
   
   **Esempio completo del file `.env.local`:**
   ```
   MONGODB_URI=mongodb://...
   JWT_SECRET=...
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   NEXT_PUBLIC_API_URL=https://cleaning-shift-xyz.vercel.app
   ```

6. **Salva il file:**
   - Se usi `nano`: premi `Ctrl+X`, poi `Y`, poi `Enter`
   - Se usi TextEdit o VS Code: `Cmd+S` (Mac) o `Ctrl+S` (Windows)

7. **Verifica che sia stato salvato:**
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```
   
   Dovresti vedere: `NEXT_PUBLIC_API_URL=https://tuo-progetto.vercel.app`

---

## 📋 STEP 2: Rebuild dell'App Web

### 2.1 Assicurati di essere nella directory corretta

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### 2.2 Pulisci i build precedenti (opzionale ma consigliato)

```bash
rm -rf .next out
```

Questo rimuove i file di build precedenti per assicurarti di avere un build pulito.

### 2.3 Build dell'app web

```bash
npm run build
```

**Cosa succede:**
- Next.js compila l'app
- Genera la cartella `out/` con i file statici
- Questo processo può richiedere 1-3 minuti

**Aspetta che finisca.** Vedrai messaggi come:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**Se vedi errori**, fermati e risolvili prima di continuare.

### 2.4 Sincronizza con Android

```bash
npx cap sync android
```

**Cosa succede:**
- Capacitor copia i file dalla cartella `out/` al progetto Android
- Aggiorna i file di configurazione Android
- Questo processo richiede 10-30 secondi

**Dovresti vedere:**
```
✔ Copying web assets from out to android/app/src/main/assets/public
✔ Copying native bridge
✔ Syncing web platform
```

---

## 📋 STEP 3: Aprire Android Studio

### 3.1 Verifica che Android Studio sia installato

**Su Mac:**
```bash
open -a "Android Studio"
```

**Oppure:**
- Vai su **Applications** (Applicazioni)
- Cerca **Android Studio**
- Clicca per aprire

**Se Android Studio non è installato:**
1. Scarica da: https://developer.android.com/studio
2. Installa seguendo le istruzioni
3. Apri Android Studio

### 3.2 Apri il progetto Android

**Opzione A: Da terminale (più veloce)**
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
npm run android
```

Questo comando:
- Apre Android Studio
- Carica automaticamente il progetto Android

**Opzione B: Manualmente**
1. Apri **Android Studio**
2. Clicca su **"Open"** o **"Open an Existing Project"**
3. Naviga fino a: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android`
4. Clicca su **"OK"** o **"Open"**

### 3.3 Attendi che Android Studio carichi il progetto

**La prima volta può richiedere 5-10 minuti:**
- Android Studio scaricherà le dipendenze
- Gradle sincronizzerà il progetto
- Vedrai una barra di progresso in basso

**Aspetta che finisca.** Vedrai:
- ✅ "Gradle sync finished"
- ✅ Nessun errore rosso nella barra di stato

**Se vedi errori:**
- Clicca su **"Sync Project with Gradle Files"** (icona con due frecce circolari)
- Oppure: **File** > **Sync Project with Gradle Files**

---

## 📋 STEP 4: Build APK in Android Studio

### 4.1 Verifica la configurazione

1. **In alto a destra**, vedrai un menu a tendina con dispositivi/emulatori
2. **Assicurati che sia selezionato** un dispositivo o emulatore (opzionale per build APK)
3. **Se non hai dispositivi**, non è un problema - puoi comunque buildare l'APK

### 4.2 Build APK (Debug - per test)

**Metodo 1: Menu Build**
1. Clicca su **"Build"** nella barra del menu in alto
2. Seleziona **"Build Bundle(s) / APK(s)"**
3. Clicca su **"Build APK(s)"**
4. Aspetta che finisca (1-3 minuti)

**Metodo 2: Gradle (alternativo)**
1. Apri il pannello **"Gradle"** a destra (se non lo vedi: **View** > **Tool Windows** > **Gradle**)
2. Espandi: **android** > **Tasks** > **build**
3. Doppio click su **"assembleDebug"**
4. Aspetta che finisca

### 4.3 Notifica di completamento

**Quando il build è completato:**
- Android Studio mostrerà una notifica: **"APK(s) generated successfully"**
- Clicca su **"locate"** o **"analyze"** per aprire la cartella

**Se non vedi la notifica:**
- Vai manualmente alla cartella (vedi Step 4.4)

### 4.4 Trova l'APK

**Il file APK sarà in:**
```
/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/build/outputs/apk/debug/app-debug.apk
```

**Come trovarlo:**

**Metodo 1: Da Android Studio**
1. Clicca su **"locate"** nella notifica
2. Si aprirà la cartella con l'APK

**Metodo 2: Da Finder (Mac)**
1. Apri **Finder**
2. Premi `Cmd+Shift+G` (Vai alla cartella)
3. Incolla: `/Users/LUNAFELICE/Desktop/Mahdiamooyee/android/app/build/outputs/apk/debug/`
4. Premi **Invio**
5. Vedrai il file `app-debug.apk`

**Metodo 3: Da terminale**
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
open android/app/build/outputs/apk/debug/
```

---

## 📋 STEP 5: Installare APK sul Telefono Android

### 5.1 Trasferisci l'APK sul telefono

**Metodo A: Via USB (consigliato)**
1. Collega il telefono al computer con un cavo USB
2. Sul telefono, quando appare la notifica, seleziona **"File Transfer"** o **"MTP"**
3. Sul computer, apri la cartella del telefono
4. Copia `app-debug.apk` nella cartella **Download** o **Documents** del telefono

**Metodo B: Via Email/Cloud**
1. Invia l'APK a te stesso via email
2. Oppure caricalo su Google Drive / Dropbox
3. Scaricalo sul telefono

**Metodo C: Via ADB (per sviluppatori)**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 5.2 Installa l'APK sul telefono

1. **Sul telefono**, apri il file manager (File Manager, Files, ecc.)
2. **Vai alla cartella** dove hai salvato l'APK (Download, Documents, ecc.)
3. **Tocca** il file `app-debug.apk`
4. **Se appare un avviso** "Installa app da fonti sconosciute":
   - Clicca su **"Impostazioni"** o **"Settings"**
   - Attiva **"Consenti da questa fonte"** o **"Allow from this source"**
   - Torna indietro e tocca di nuovo l'APK
5. **Clicca su "Installa"** o **"Install"**
6. **Aspetta** che l'installazione finisca (10-30 secondi)
7. **Clicca su "Apri"** o **"Open"** quando finisce

### 5.3 Verifica l'installazione

1. **Cerca l'app** nella lista delle app (dovrebbe chiamarsi "CleanShift")
2. **Apri l'app**
3. **Dovresti vedere la pagina di login** (non più "Loading...")
4. **Prova a fare login** - dovrebbe funzionare!

---

## 🔧 Troubleshooting

### Problema: "Gradle sync failed"

**Soluzione:**
1. In Android Studio: **File** > **Invalidate Caches / Restart**
2. Seleziona **"Invalidate and Restart"**
3. Aspetta che Android Studio si riavvii
4. Prova di nuovo

### Problema: "Build failed" con errori

**Soluzione:**
1. Controlla che `NEXT_PUBLIC_API_URL` sia configurato in `.env.local`
2. Fai un rebuild completo:
   ```bash
   rm -rf .next out
   npm run build
   npx cap sync android
   ```
3. In Android Studio: **Build** > **Clean Project**
4. Poi: **Build** > **Rebuild Project**

### Problema: L'app mostra ancora "Loading..."

**Soluzione:**
1. Verifica che `NEXT_PUBLIC_API_URL` sia corretto:
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```
2. Verifica che l'URL Vercel sia accessibile:
   - Apri l'URL nel browser
   - Dovresti vedere la pagina di login
3. Rebuild completo:
   ```bash
   rm -rf .next out
   npm run build
   npx cap sync android
   ```
4. Rebuild APK in Android Studio

### Problema: "Install blocked" sul telefono

**Soluzione:**
1. Vai su **Impostazioni** > **Sicurezza**
2. Attiva **"Origini sconosciute"** o **"Installa app sconosciute"**
3. Oppure, quando installi l'APK, clicca su **"Impostazioni"** nell'avviso e attiva per quella fonte

---

## ✅ Checklist Finale

Prima di considerare completato, verifica:

- [ ] `NEXT_PUBLIC_API_URL` è configurato in `.env.local`
- [ ] `npm run build` è completato senza errori
- [ ] `npx cap sync android` è completato
- [ ] Android Studio ha aperto il progetto senza errori
- [ ] APK è stato generato con successo
- [ ] APK è installato sul telefono
- [ ] L'app si apre e mostra la pagina di login (non "Loading...")
- [ ] Il login funziona correttamente

---

## 📚 Riferimenti

- **Guida build:** `BUILD-ANDROID-APK-FIXED.md`
- **Troubleshooting:** `FIX-ANDROID-APK-LOADING.md`
- **Riepilogo:** `ANDROID-APK-FIX-SUMMARY.md`

---

**Buona fortuna! 🚀**

Se hai problemi, controlla la sezione Troubleshooting o chiedi aiuto.

