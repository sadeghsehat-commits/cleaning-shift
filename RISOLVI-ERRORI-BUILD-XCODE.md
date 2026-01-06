# 🔧 Risolvi Errori Build Xcode - Guida Completa

## 🚨 "Build Failed" - Come Risolvere

Vedo che il build è fallito. Ecco come risolvere passo per passo:

---

## 📋 STEP 1: Vedi l'Errore Specifico

### 1.1 Apri il Pannello degli Errori
1. **In Xcode, in basso**, vedrai un pannello (se non è visibile, clicca sul pulsante in basso a sinistra)
2. Cerca la scheda **"Issues"** o **"Error"** (icona con X rossa)
3. **Clicca su quella scheda**

### 1.2 Leggi l'Errore
- Vedrai una lista di errori (in rosso) e warning (in giallo)
- **Clicca sul primo errore** per vedere i dettagli
- **Scrivi qui l'errore completo** che vedi (o fai uno screenshot)

---

## 📋 STEP 2: Problemi Comuni e Soluzioni

### Problema 1: "No such module 'Capacitor'"
**Causa**: Le dipendenze iOS non sono installate

**Soluzione**:
1. **Apri Terminal** (puoi cercarlo con Cmd+Spazio)
2. **Copia e incolla questi comandi** uno alla volta:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee/ios/App
pod install
```

3. Attendi che finisca (può richiedere 2-5 minuti)
4. Quando vedi "Pod installation complete!", torna in Xcode
5. **Chiudi Xcode completamente** (Cmd+Q)
6. **Riapri Xcode** e riprova il build

---

### Problema 2: "Missing public folder" o "out directory not found"
**Causa**: Il build statico non è stato fatto

**Soluzione**:
1. **Apri Terminal**
2. **Copia e incolla**:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-native-simple.sh
```

3. Attendi che finisca (vedrai "✅ Build successful!")
4. Torna in Xcode
5. **Prova di nuovo**: Product → Archive

---

### Problema 3: "Signing for App requires a development team"
**Causa**: Non hai configurato il team di sviluppo

**Soluzione**:
1. In Xcode, vai su **"Signing & Capabilities"** (scheda accanto a "General")
2. Spunta **"Automatically manage signing"**
3. Sotto "Team", clicca sul menu a tendina
4. Se non vedi team:
   - Clicca **"Add Account..."**
   - Inserisci il tuo Apple ID
   - Inserisci la password
   - Xcode creerà un team gratuito
5. Seleziona il team dal menu
6. Riprova il build

---

### Problema 4: "Bundle identifier already exists"
**Causa**: Il nome dell'app è già usato

**Soluzione**:
1. In Xcode, vai su **"Signing & Capabilities"**
2. Trova **"Bundle Identifier"**
3. Cambia l'ultima parte, esempio:
   - Da: `com.cleanshift.app`
   - A: `com.tuonome.cleanshift` (usa il tuo nome)
4. Riprova il build

---

### Problema 5: "Command PhaseScriptExecution failed"
**Causa**: Script di build fallito

**Soluzione**:
1. Vai su **"Build Phases"** (scheda in alto)
2. Espandi **"Run Script"** o **"Copy Pods Resources"**
3. Controlla se ci sono errori
4. **Oppure**: Prova a pulire il build:
   - **Product → Clean Build Folder** (Cmd+Shift+K)
   - Poi riprova: **Product → Archive**

---

## 📋 STEP 3: Procedura Completa di Fix

### 3.1 Installa le Dipendenze iOS
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee/ios/App
pod install
```

### 3.2 Rebuild il Progetto Web
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
./build-native-simple.sh
```

### 3.3 Sincronizza Capacitor
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
npx cap sync ios
```

### 3.4 Riapri Xcode
1. **Chiudi Xcode completamente** (Cmd+Q)
2. **Riapri Xcode**
3. Apri il progetto: `ios/App/App.xcworkspace` (NON .xcodeproj!)
   - Se hai aperto .xcodeproj, chiudilo
   - Apri .xcworkspace invece

### 3.5 Riprova il Build
1. **Product → Clean Build Folder** (Cmd+Shift+K)
2. **Product → Archive**

---

## 📋 STEP 4: Verifica che Tutto Sia Corretto

### Checklist Pre-Build:
- [ ] Hai eseguito `pod install` in `ios/App/`
- [ ] Hai eseguito `./build-native-simple.sh` e ha funzionato
- [ ] Hai eseguito `npx cap sync ios`
- [ ] Hai aperto `App.xcworkspace` (NON .xcodeproj)
- [ ] Hai configurato il Team in "Signing & Capabilities"
- [ ] Non ci sono errori rossi nel pannello Issues

---

## 🆘 Se Niente Funziona

### Opzione 1: Mostrami l'Errore
1. In Xcode, vai sul pannello errori (in basso)
2. **Clicca sul primo errore rosso**
3. **Copia il messaggio completo** e incollalo qui
4. Oppure fai uno screenshot dell'errore

### Opzione 2: Rebuild Completo
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Rimuovi tutto e ricostruisci
rm -rf ios/App/Pods ios/App/Podfile.lock
rm -rf out .next

# Rebuild
./build-native-simple.sh

# Reinstalla dipendenze iOS
cd ios/App
pod install
cd ../..

# Sincronizza
npx cap sync ios
```

Poi riapri Xcode e riprova.

---

## 📝 Note Importanti

1. **Sempre apri .xcworkspace**, NON .xcodeproj
   - Il file corretto è: `ios/App/App.xcworkspace`

2. **Dopo pod install**, chiudi e riapri Xcode

3. **Se cambi qualcosa nel progetto web**, devi rifare:
   - `./build-native-simple.sh`
   - `npx cap sync ios`

---

## 🎯 Prossimi Passi

1. **Vedi l'errore specifico** in Xcode (pannello in basso)
2. **Prova le soluzioni sopra** in ordine
3. **Se non funziona**, dimmi esattamente quale errore vedi

**Dimmi quale errore vedi nel pannello Issues di Xcode!** 🔍


