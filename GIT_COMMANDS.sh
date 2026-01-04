#!/bin/bash
# Script per fare commit e push delle modifiche su GitHub
# Esegui questi comandi uno alla volta nel Terminal

# 1. Vai nella cartella del progetto (se non ci sei già)
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# 2. Inizializza Git (solo la prima volta)
git init

# 3. Aggiungi tutti i file modificati
git add .

# 4. Fai commit delle modifiche
git commit -m "Update calendar to check-in/check-out dates"

# 5. Collega al repository GitHub (sostituisci con il tuo URL)
# Dopo aver creato il repository su GitHub, GitHub ti mostrerà l'URL
# Sostituisci sadeghsehat-commits con il tuo username se diverso
git remote add origin https://github.com/sadeghsehat-commits/cleaning-shift.git

# 6. Rinomina il branch principale
git branch -M main

# 7. Fai push del codice su GitHub
git push -u origin main

echo "✅ Completato! Ora collega Vercel a GitHub."

