# 🔧 Fix Android APK Loading Issue

## Problema
L'APK Android mostra solo "Loading..." e la pagina lampeggia. Questo succede perché l'app mobile sta cercando di fare chiamate API a `/api/...` che non esistono nell'app statica.

## Soluzione

### Step 1: Configurare l'URL API Vercel

1. **Trova il tuo URL Vercel:**
   - Vai su https://vercel.com/dashboard
   - Seleziona il tuo progetto
   - Copia l'URL (es: `https://cleaning-shift-xyz.vercel.app`)

2. **Aggiungi al file `.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=https://tuo-progetto.vercel.app
   ```

### Step 2: Aggiornare tutte le chiamate API

Le chiamate API devono usare `apiUrl()` da `lib/api-config.ts` invece di `/api/...` direttamente.

**Esempio:**
```typescript
// ❌ SBAGLIATO (non funziona in mobile)
fetch('/api/auth/me')

// ✅ CORRETTO (funziona in web e mobile)
import { apiUrl } from '@/lib/api-config';
fetch(apiUrl('/api/auth/me'))
```

### Step 3: Rebuild dell'app Android

```bash
# 1. Assicurati che NEXT_PUBLIC_API_URL sia configurato
# 2. Build dell'app web
npm run build

# 3. Sincronizza con Android
npx cap sync android

# 4. Apri Android Studio
npm run android

# 5. In Android Studio:
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - Oppure: Run > Run 'app'
```

## File già aggiornati

✅ `app/page.tsx` - Usa `apiUrl()` per `/api/auth/me`
✅ `components/LoginForm.tsx` - Usa `apiUrl()` per login/register

## File da aggiornare

I seguenti file devono essere aggiornati per usare `apiUrl()`:

- `app/dashboard/page.tsx`
- `app/dashboard/shifts/new/page.tsx`
- `app/dashboard/apartments/page.tsx`
- `app/dashboard/apartments/new/page.tsx`
- `app/dashboard/apartments/[id]/edit/page.tsx`
- `app/dashboard/schedule/page.tsx`
- `app/dashboard/history/page.tsx`
- `app/dashboard/notifications/page.tsx`
- E tutti gli altri file che fanno chiamate a `/api/...`

## Script automatico (opzionale)

Puoi usare lo script `scripts/update-api-calls.sh` per aggiornare automaticamente, ma **verifica manualmente** i risultati:

```bash
./scripts/update-api-calls.sh
```

## Verifica

Dopo aver aggiornato:

1. **Rebuild:**
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Test locale (opzionale):**
   ```bash
   # Avvia server locale per test
   npm run dev
   # In un altro terminale, testa l'APK
   ```

3. **Build APK:**
   - Apri Android Studio
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Installa l'APK sul telefono
   - Verifica che l'app carichi correttamente

## Troubleshooting

### L'app mostra ancora "Loading..."

1. **Verifica che `NEXT_PUBLIC_API_URL` sia configurato:**
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```

2. **Verifica che l'URL sia corretto:**
   - Apri l'URL nel browser
   - Dovresti vedere la pagina di login

3. **Controlla i log Android:**
   ```bash
   adb logcat | grep -i "capacitor\|api\|error"
   ```

### Le chiamate API falliscono

1. **Verifica CORS su Vercel:**
   - Le API devono permettere richieste dall'app mobile
   - Vercel di default permette CORS, ma verifica

2. **Verifica che l'URL API sia accessibile:**
   ```bash
   curl https://tuo-progetto.vercel.app/api/auth/me
   ```

## Note importanti

- ⚠️ **NEXT_PUBLIC_API_URL** deve essere configurato prima del build
- ⚠️ Le variabili `NEXT_PUBLIC_*` sono embeddate al build time
- ⚠️ Dopo aver cambiato `.env.local`, devi fare **rebuild completo**

