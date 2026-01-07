# 🔧 Fix: out/index.html Non Viene Creato

## 🔍 Problema

Quando esegui `npm run build`, la cartella `out/` e `out/index.html` **NON vengono creati**.

## ✅ Causa

Il `next.config.js` ha `output: 'export'` **commentato**, quindi Next.js NON fa l'export statico.

**Per le app mobile con Capacitor, DEVI avere `output: 'export'` abilitato!**

## ✅ Soluzione

Ho modificato `next.config.js` per abilitare `output: 'export'`.

Ora puoi eseguire:

```bash
npm run build
```

Questo creerà la cartella `out/` con tutti i file statici.

---

## ⚠️ IMPORTANTE: API Routes

Le API routes (`app/api/...`) **NON possono essere esportate staticamente**.

Lo script `build-mobile.sh` gestisce questo spostando temporaneamente le API routes, ma se fai `npm run build` diretto, potrebbe dare errori.

**Opzione 1: Usa lo script (consigliato)**

```bash
bash build-mobile.sh
```

Questo script:
1. Sposta temporaneamente `app/api/`
2. Abilita `output: 'export'`
3. Fa il build
4. Ripristina tutto

**Opzione 2: Build manuale**

Se vuoi fare il build manualmente:

```bash
# 1. Sposta temporaneamente le API routes
mkdir -p .api-backup
mv app/api .api-backup/api

# 2. Build (ora che output: 'export' è abilitato)
npm run build

# 3. Verifica
ls -la out/index.html

# 4. Ripristina API routes (se vuoi continuare a sviluppare)
mv .api-backup/api app/api
rm -rf .api-backup
```

---

## 📱 Dopo il Build

Dopo che `out/index.html` esiste:

```bash
# Sync con Capacitor
npx cap sync android

# Poi in Android Studio:
# - Build > Clean Project
# - Build > Rebuild Project
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## ✅ Verifica

Dopo `npm run build`, verifica:

```bash
ls -la out/index.html
```

**Dovrebbe esistere!** ✅

---

## 🔄 Ripristino per Sviluppo Web

Se vuoi sviluppare per web (non mobile), puoi disabilitare l'export:

```js
// In next.config.js, commenta:
// output: 'export',
```

Ma per mobile, **deve essere abilitato**.

