# 📱 Guida Completa: Creare File .ipa - Passo per Passo

## ✅ Xcode è Aperto - Ora Seguiamo Questi Passaggi

---

## 📋 STEP 1: Configurare il Signing (Firma Digitale)

### 1.1 Seleziona il Progetto
1. **Nella barra laterale sinistra** di Xcode, cerca e clicca su **"App"** (il progetto principale, con l'icona blu)
2. Dovresti vedere una finestra al centro con diverse schede

### 1.2 Apri la Scheda "Signing & Capabilities"
1. **In alto nella finestra centrale**, vedrai queste schede:
   - General
   - Signing & Capabilities ← **CLICCA QUI**
   - Info
   - Build Settings
   - Build Phases
   - Build Rules

2. Clicca su **"Signing & Capabilities"**

### 1.3 Configura il Team
1. Nella sezione **"Signing"**, vedrai:
   - ☐ **"Automatically manage signing"** ← **SPUNTA QUESTA CASELLA** ✅
   
2. Sotto "Team", vedrai un menu a tendina:
   - Se hai già un Apple Developer Account: seleziona il tuo team
   - Se NON hai un account: clicca su **"Add Account..."**
     - Inserisci il tuo Apple ID (email)
     - Inserisci la password
     - Xcode creerà automaticamente un team gratuito per te

3. **Bundle Identifier**: Dovrebbe essere `com.cleanshift.app`
   - Se c'è un errore (rosso), cambia l'ultima parte (es: `com.cleanshift.app2`)
   - Deve essere univoco

### 1.4 Verifica che Non Ci Siano Errori
- Se vedi un segno di spunta verde ✅ → **Perfetto!**
- Se vedi un punto esclamativo giallo ⚠️ → Leggi il messaggio e risolvi
- Se vedi una X rossa ❌ → C'è un problema, risolvilo prima di continuare

---

## 📋 STEP 2: Seleziona il Dispositivo di Build

### 2.1 Scegli "Any iOS Device"
1. **In alto nella barra degli strumenti** di Xcode, vedrai un menu a tendina che dice qualcosa come:
   - "App > My Mac"
   - "iPhone 15 Pro"
   - "Any iOS Device (arm64)" ← **Scegli questo**

2. Clicca sul menu a tendina e seleziona **"Any iOS Device (arm64)"**
   - Questo è necessario per creare un archivio (.ipa)

---

## 📋 STEP 3: Crea l'Archivio (Archive)

### 3.1 Apri il Menu "Product"
1. **In alto nella barra dei menu** di Xcode, clicca su **"Product"**

2. Nel menu a tendina, vedrai:
   - Build
   - Run
   - Test
   - Profile
   - Analyze
   - **Archive** ← **CLICCA QUI**

### 3.2 Attendi il Build
1. Xcode inizierà a compilare l'app
2. **In basso nella finestra**, vedrai una barra di progresso
3. Potrebbe richiedere **2-5 minuti** la prima volta
4. Vedrai messaggi come:
   - "Building..."
   - "Compiling..."
   - "Linking..."

### 3.3 Se Ci Sono Errori
- Se vedi errori rossi, **NON continuare**
- Leggi il messaggio di errore
- Errori comuni:
  - **"Signing requires a development team"**: Torna allo STEP 1.3 e aggiungi un team
  - **"No such module"**: Potrebbe mancare una dipendenza, ma di solito non succede
  - **"Bundle identifier already exists"**: Cambia il Bundle Identifier nello STEP 1.3

### 3.4 Quando il Build è Completato
- Vedrai un messaggio: **"Archive succeeded"** o **"Build Succeeded"**
- Si aprirà automaticamente la finestra **"Organizer"**
- Se non si apre, vai su: **Window → Organizer** (nella barra dei menu)

---

## 📋 STEP 4: Organizer - Gestisci l'Archivio

### 4.1 Verifica l'Archivio
1. Nella finestra **Organizer**, vedrai:
   - Una lista di archivi (se ne hai creati altri prima)
   - Il più recente dovrebbe essere in alto con la data di oggi

2. **Seleziona l'archivio più recente** (quello appena creato)

### 4.2 Clicca su "Distribute App"
1. **In basso a destra** nella finestra Organizer, vedrai un pulsante:
   - **"Distribute App"** ← **CLICCA QUI**

---

## 📋 STEP 5: Scegli il Metodo di Distribuzione

### 5.1 Seleziona il Metodo
Ti apparirà una finestra con 4 opzioni:

1. **App Store Connect** (per pubblicare su App Store)
2. **Ad Hoc** ← **Scegli questo per installare sul tuo iPhone**
3. **Enterprise** (solo per account Enterprise)
4. **Development** (per sviluppo)

**Scegli "Ad Hoc"** e clicca **"Next"**

### 5.2 Spiegazione Ad Hoc
- **Ad Hoc** ti permette di installare l'app su dispositivi specifici
- Puoi installare su **fino a 100 dispositivi**
- Non serve pubblicare su App Store
- Perfetto per testare l'app

---

## 📋 STEP 6: Seleziona i Dispositivi (Ad Hoc)

### 6.1 Se Hai Già Registrato il Tuo iPhone
1. Se hai già collegato il tuo iPhone a Xcode prima, vedrai una lista
2. **Seleziona il tuo iPhone** dalla lista
3. Clicca **"Next"**

### 6.2 Se NON Hai Registrato il Tuo iPhone
1. **Collega il tuo iPhone al Mac** con il cavo USB
2. **Sblocca il tuo iPhone** (inserisci il codice)
3. Sul tuo iPhone, apparirà un messaggio: **"Trust This Computer?"**
   - Clicca **"Trust"**
   - Inserisci il codice del telefono

4. In Xcode, vai su: **Window → Devices and Simulators**
5. Seleziona il tuo iPhone dalla lista a sinistra
6. Clicca su **"Use for Development"**
7. Torna alla finestra Organizer e riprova

---

## 📋 STEP 7: Opzioni di Distribuzione

### 7.1 Revisione delle Opzioni
1. Vedrai una schermata con le opzioni di distribuzione
2. **Lascia tutto come predefinito** (di solito va bene)
3. Clicca **"Next"**

### 7.2 Verifica Automatica
1. Xcode verificherà automaticamente l'archivio
2. Se tutto è OK, vedrai un segno di spunta verde ✅
3. Clicca **"Next"**

---

## 📋 STEP 8: Firma e Codifica

### 8.1 Seleziona il Metodo di Firma
1. Vedrai: **"Automatically manage signing"**
2. **Lascia selezionato** (dovrebbe essere già selezionato)
3. Clicca **"Next"**

### 8.2 Attendi la Codifica
1. Xcode creerà il file .ipa
2. Vedrai una barra di progresso
3. Attendi il completamento (1-2 minuti)

---

## 📋 STEP 9: Esporta il File .ipa

### 9.1 Scegli la Cartella di Destinazione
1. Ti apparirà una finestra per scegliere dove salvare il file
2. **Suggerimento**: Crea una cartella sul Desktop chiamata "CleanShift App"
3. Seleziona quella cartella
4. Clicca **"Export"**

### 9.2 Attendi l'Esportazione
1. Xcode esporterà il file .ipa
2. Vedrai una barra di progresso
3. Quando è finito, vedrai: **"Export Succeeded"**
4. Clicca **"Done"**

---

## 📋 STEP 10: Trova il File .ipa

### 10.1 Posizione del File
1. Vai nella cartella che hai scelto (es: Desktop → "CleanShift App")
2. Vedrai un file chiamato: **"App.ipa"** o **"CleanShift.ipa"**
3. **Questo è il file che puoi installare sul tuo iPhone!** 🎉

---

## 📋 STEP 11: Installa sul Tuo iPhone

### 11.1 Metodo 1: Usando Finder (macOS Catalina+)
1. **Collega il tuo iPhone al Mac** con il cavo USB
2. **Apri Finder**
3. **Nella barra laterale sinistra**, vedrai il tuo iPhone sotto "Dispositivi"
4. Clicca sul tuo iPhone
5. Se vedi un messaggio sul telefono: **"Trust This Computer?"** → Clicca **"Trust"**

6. **Trascina il file .ipa** nella finestra di Finder del tuo iPhone
7. Il file verrà copiato sul telefono

### 11.2 Metodo 2: Usando Xcode
1. **Collega il tuo iPhone al Mac**
2. In Xcode: **Window → Devices and Simulators**
3. Seleziona il tuo iPhone dalla lista a sinistra
4. Clicca sul pulsante **"+"** in basso
5. Seleziona il file **.ipa**
6. L'app verrà installata sul telefono

### 11.3 Metodo 3: Usando 3uTools (Mac)
1. Scarica **3uTools** da: https://www.3u.com
2. Installa e apri 3uTools
3. Collega il tuo iPhone
4. Vai su **"Apps"** → **"Install"**
5. Seleziona il file **.ipa**
6. Clicca **"Install"**

---

## 📋 STEP 12: Autorizza l'App sul Tuo iPhone

### 12.1 Prima Installazione
1. Dopo aver installato l'app, **sul tuo iPhone**:
2. Vai su **Impostazioni → Generale → Gestione profili e dispositivi**
3. Trova il tuo profilo sviluppatore (il tuo nome o email)
4. Clicca su di esso
5. Clicca **"Fidati di [tuo nome]"**
6. Conferma con **"Fidati"**

### 12.2 Apri l'App
1. Torna alla home screen del tuo iPhone
2. Cerca l'icona dell'app **"CleanShift"**
3. **Tocca l'icona** per aprire l'app
4. Se vedi un messaggio di sicurezza, vai su Impostazioni e autorizza (vedi STEP 12.1)

---

## ✅ Completato!

Ora hai:
- ✅ File .ipa creato
- ✅ App installata sul tuo iPhone
- ✅ App funzionante

---

## 🐛 Risoluzione Problemi Comuni

### Problema: "No devices registered"
**Soluzione**: 
1. Collega iPhone al Mac
2. Window → Devices and Simulators
3. Seleziona iPhone → "Use for Development"

### Problema: "Signing requires a development team"
**Soluzione**: 
1. Torna a STEP 1.3
2. Aggiungi un Apple ID come team

### Problema: "Bundle identifier already exists"
**Soluzione**: 
1. Cambia Bundle Identifier in STEP 1.3
2. Usa qualcosa di unico come: `com.tuonome.cleanshift`

### Problema: L'app si chiude subito dopo l'apertura
**Soluzione**: 
1. Vai su Impostazioni → Generale → Gestione profili
2. Autorizza il profilo sviluppatore (STEP 12.1)

---

## 📞 Supporto

Se hai problemi in qualsiasi step, dimmi:
- Quale step stai facendo
- Quale messaggio di errore vedi
- Cosa succede esattamente

**Buona fortuna!** 🚀


