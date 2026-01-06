# 🔧 Fix: App Mobile Mostra "Loading..." e Lampeggia

## 🔍 Problema Identificato

L'app mobile mostra "Loading..." perché:
1. Le variabili d'ambiente `NEXT_PUBLIC_*` non sono sempre disponibili nell'app mobile statica
2. La rilevazione di Capacitor potrebbe non funzionare correttamente
3. Le chiamate API potrebbero non raggiungere il server Vercel

## ✅ Soluzione Implementata

Ho modificato `lib/api-config.ts` per:
1. **Usare un URL hardcoded** per l'app mobile (più affidabile)
2. **Migliorare la rilevazione** di app mobile vs web
3. **Aggiungere logging** per debug

L'URL è ora hardcoded a: `https://cleaning-shift-manager.vercel.app`

## 🚀 Prossimi Passi

### STEP 1: Rebuild dell'App

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# 1. Pulisci build precedenti
rm -rf .next out

# 2. Build dell'app
npm run build

# 3. Sincronizza con Android
npx cap sync android
```

### STEP 2: Rebuild APK in Android Studio

1. **Apri Android Studio** (se non è già aperto)
2. **Build** > **Clean Project**
3. **Build** > **Rebuild Project**
4. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
5. **Installa il nuovo APK** sul telefono

### STEP 3: Verifica

1. **Apri l'app** sul telefono
2. **Dovresti vedere la pagina di login** (non più "Loading...")
3. **Prova a fare login**

## 🔍 Debug: Verifica Errori

Se ancora non funziona, controlla i log Android:

### Metodo 1: Via ADB (se hai il telefono collegato)

```bash
# Collega il telefono via USB
# Abilita "USB Debugging" nelle impostazioni sviluppatore

# Vedi i log in tempo reale
adb logcat | grep -i "capacitor\|api\|error\|cleanshift"
```

### Metodo 2: Via Chrome DevTools (se l'app è in debug)

1. Sul telefono: **Impostazioni** > **Opzioni sviluppatore** > **USB Debugging** (attivo)
2. Collega il telefono al computer
3. Apri Chrome: `chrome://inspect`
4. Clicca su "inspect" sotto il tuo dispositivo
5. Vai su **Console** per vedere gli errori

### Metodo 3: Log nell'App

L'app ora logga in console:
- `📱 Mobile app detected, using API URL: ...`
- Se vedi questo, l'app sta usando l'URL corretto

## 🔧 Troubleshooting

### Problema: Ancora "Loading..."

**Verifica:**
1. L'URL Vercel è accessibile dal telefono?
   - Apri il browser sul telefono
   - Vai su: `https://cleaning-shift-manager.vercel.app`
   - Dovresti vedere la pagina di login

2. Le chiamate API funzionano?
   - Apri Chrome DevTools (vedi sopra)
   - Vai su **Network** tab
   - Prova a fare login
   - Controlla se le chiamate a `/api/auth/me` falliscono

3. CORS è configurato correttamente?
   - Vercel di default permette CORS
   - Se vedi errori CORS, potrebbe essere un problema di configurazione Vercel

### Problema: "Network Error" o "Failed to fetch"

**Possibili cause:**
1. **Connessione internet** - Verifica che il telefono sia connesso
2. **URL non accessibile** - Verifica che l'URL Vercel funzioni
3. **Firewall/VPN** - Disattiva temporaneamente per test

### Problema: L'app si chiude subito

**Possibili cause:**
1. **Errore JavaScript** - Controlla i log Android
2. **Memoria insufficiente** - Chiudi altre app
3. **Versione Android** - Verifica compatibilità

## 📝 Note Importanti

- ⚠️ Dopo ogni modifica a `lib/api-config.ts`, devi fare **rebuild completo**
- ⚠️ L'URL è ora **hardcoded** nel codice - se cambi URL Vercel, devi modificare `lib/api-config.ts`
- ⚠️ Per cambiare l'URL in futuro, modifica `MOBILE_API_URL` in `lib/api-config.ts`

## ✅ Checklist

Prima di testare:

- [ ] Rebuild completo fatto (`rm -rf .next out && npm run build`)
- [ ] `npx cap sync android` completato
- [ ] APK ricostruito in Android Studio
- [ ] Nuovo APK installato sul telefono
- [ ] URL Vercel accessibile dal browser del telefono
- [ ] Connessione internet attiva sul telefono

---

**Dopo il rebuild, l'app dovrebbe funzionare! 🚀**

