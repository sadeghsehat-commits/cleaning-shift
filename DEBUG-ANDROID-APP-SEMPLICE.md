# 🔍 Debug Android App - Guida Semplice

## ✅ Buone Notizie!

L'URL funziona nel browser del telefono, quindi il problema è solo nella rilevazione dell'app mobile. Ho migliorato la rilevazione - ora dovrebbe funzionare!

---

## 📱 Risposta alla Tua Domanda: "app" o "capacitor-android"?

**✅ Devi buildare "app" (non "capacitor-android")**

In Android Studio, nella barra in alto vedi un dropdown con "app" - questo è CORRETTO!

- ✅ **"app"** = Il progetto Android principale (quello che devi buildare)
- ❌ **"capacitor-android"** = Solo le librerie Capacitor (non buildare questo)

**Quindi continua a usare "app" come stai facendo!**

---

## 🔧 Debug Semplice (Senza Collegare il Telefono)

### Metodo 1: Aggiungi Alert nell'App (Più Semplice)

Ho aggiunto più logging. Dopo il rebuild, l'app mostrerà in console:
- `📱 Mobile app detected! Using remote API URL: ...`
- `📍 Location: ...`
- `🔍 Protocol: ...`
- `🔍 Hostname: ...`

**Ma per vedere questi log, devi collegare il telefono.** Vedi Metodo 2.

### Metodo 2: Collegare il Telefono (Per Vedere i Log)

**Step 1: Abilita USB Debugging sul Telefono**

1. **Vai su Impostazioni** sul telefono
2. **Vai su "Informazioni sul telefono"** o "Info dispositivo"
3. **Tocca 7 volte su "Numero build"** (attiva Opzioni sviluppatore)
4. **Torna indietro** > **Opzioni sviluppatore**
5. **Attiva "USB Debugging"**

**Step 2: Collega il Telefono al Computer**

1. **Collega il telefono** al computer con il cavo USB
2. **Sul telefono**, quando appare la notifica USB:
   - Tocca la notifica
   - Seleziona **"File Transfer"** o **"MTP"** (non "MIDI" come nella foto!)
   - Vedi la foto che hai inviato - devi cambiare da "MIDI" a **"File Transfer"**

**Step 3: Apri Chrome DevTools**

1. **Apri Chrome** sul computer (non sul telefono!)
2. **Vai su:** `chrome://inspect`
3. **Dovresti vedere** il tuo telefono nella lista
4. **Clicca su "inspect"** sotto il tuo telefono
5. Si aprirà una finestra con i log dell'app

**Step 4: Vedi i Log**

1. **Vai su "Console"** nella finestra DevTools
2. **Apri l'app** sul telefono
3. **Dovresti vedere** i log che ho aggiunto:
   - `📱 Mobile app detected! Using remote API URL: ...`
   - Se vedi questo, l'app sta usando l'URL corretto!

**Step 5: Vedi le Chiamate API**

1. **Vai su "Network"** nella finestra DevTools
2. **Apri l'app** sul telefono
3. **Dovresti vedere** chiamate a `https://cleaning-shift-manager.vercel.app/api/auth/me`
4. **Clicca sulla chiamata** per vedere se c'è un errore

---

## 🚀 Rebuild Completo (IMPORTANTE!)

**Devi fare un rebuild completo per applicare le modifiche:**

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# 1. Pulisci TUTTO
rm -rf .next out android/app/build

# 2. Build dell'app
npm run build

# 3. Sincronizza con Android
npx cap sync android
```

**Poi in Android Studio:**
1. **Build** > **Clean Project**
2. **Build** > **Rebuild Project**
3. **Assicurati che "app" sia selezionato** nel dropdown in alto (non "capacitor-android")
4. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
5. **Installa il NUOVO APK** sul telefono (disinstalla quello vecchio prima!)

---

## 🔍 Cosa Cercare nei Log

Dopo aver collegato il telefono e aperto Chrome DevTools:

### Se Vedi Questo (✅ BUONO):
```
📱 Mobile app detected! Using remote API URL: https://cleaning-shift-manager.vercel.app
📍 Location: capacitor://localhost/...
🔍 Protocol: capacitor:
🔍 Hostname: localhost
```

**Significa:** L'app sta usando l'URL corretto! Se ancora "Loading...", il problema è altrove (CORS, autenticazione, ecc.)

### Se Vedi Questo (❌ PROBLEMA):
```
🌐 Web browser detected, using relative URLs
```

**Significa:** L'app pensa di essere in un browser web. Questo è il problema!

### Se Vedi Errori (❌ PROBLEMA):
```
Failed to fetch
Network Error
CORS error
```

**Significa:** C'è un problema di connessione o CORS. Controlla:
- Connessione internet attiva
- URL Vercel accessibile
- CORS configurato su Vercel

---

## 🔧 Se Non Riesci a Collegare il Telefono

**Alternativa: Aggiungi Alert Temporaneo**

Posso aggiungere un alert temporaneo nell'app che mostra:
- Quale URL sta usando
- Se ha rilevato mobile o web
- Eventuali errori

Vuoi che lo aggiunga? Così puoi vedere cosa succede senza collegare il telefono.

---

## ✅ Checklist

Prima di testare:

- [ ] Rebuild completo fatto (`rm -rf .next out && npm run build`)
- [ ] `npx cap sync android` completato
- [ ] APK ricostruito in Android Studio (Clean + Rebuild + Build APK)
- [ ] **"app" selezionato** nel dropdown (non "capacitor-android")
- [ ] Nuovo APK installato sul telefono
- [ ] USB Debugging abilitato sul telefono
- [ ] Telefono collegato al computer
- [ ] Chrome DevTools aperto (`chrome://inspect`)

---

**Ora fai il rebuild completo e dimmi cosa vedi nei log! 🚀**

Se non riesci a collegare il telefono, posso aggiungere un alert temporaneo nell'app per vedere cosa succede.

