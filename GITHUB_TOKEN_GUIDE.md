# Guida: Come Creare e Usare GitHub Personal Access Token

## Quando Git Chiede le Credenziali

Quando esegui `git push -u origin main` nel Terminal, vedrai qualcosa tipo:

```
Username for 'https://github.com': 
Password for 'https://github.com': 
```

## Passo 1: Crea il Personal Access Token

1. **Vai su GitHub.com** e fai login
2. **Clicca sulla tua foto profilo** (in alto a destra)
3. **Clicca "Settings"** (impostazioni)
4. **Nella barra laterale sinistra**, scorrere fino in fondo e clicca **"Developer settings"**
5. **Clicca "Personal access tokens"** → **"Tokens (classic)"**
6. **Clicca "Generate new token"** → **"Generate new token (classic)"**
7. **Note**: scrivi `Vercel Deploy` (o un nome a scelta)
8. **Expiration**: scegli "90 days" o "No expiration"
9. **Seleziona scope**: spunta la casella **`repo`** (seleziona tutto sotto "repo")
10. **Scorri in basso** e clicca **"Generate token"** (verde)
11. **IMPORTANTE: COPIA IL TOKEN SUBITO!** (è una lunga stringa tipo `ghp_xxxxxxxxxxxxxxxxxxxx`)
   - Lo vedi solo questa volta!
   - Salvalo temporaneamente in un file di testo

## Passo 2: Usa il Token quando Git Chiede la Password

Quando il Terminal mostra:
```
Username for 'https://github.com': 
```

1. **Incolla il tuo username GitHub**: `sadeghsehat-commits`
2. Premi **Invio**
3. Quando chiede:
   ```
   Password for 'https://github.com': 
   ```
4. **NON inserire la password di GitHub!**
5. **Incolla il Personal Access Token** che hai appena copiato
6. Premi **Invio**

**NOTA**: Il Terminal NON mostrerà nulla quando digiti/incolli la password (è normale per sicurezza!)

## Passo 3: Verifica che Funzioni

Dopo aver inserito username e token, dovresti vedere qualcosa tipo:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/sadeghsehat-commits/cleaning-shift.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Se vedi errori, vedi la sezione "Problemi Comuni" qui sotto.

## Passo 4: Prossimi Passi

Dopo che il push è completato con successo:

1. **Vai su GitHub.com** → Vai al repository `cleaning-shift`
2. **Verifica che i file ci siano** (dovresti vedere tutti i file del progetto)
3. **Vai su Vercel.com** → Dashboard del tuo progetto
4. **Settings** → **Git**
5. **Connect Git Repository**
6. **Autorizza Vercel** ad accedere a GitHub (se richiesto)
7. **Seleziona il repository** `sadeghsehat-commits/cleaning-shift`
8. **Vercel farà automaticamente il deploy!**

## Problemi Comuni

### Errore: "Authentication failed"
- Il token potrebbe essere scaduto o non valido
- Crea un nuovo token e riprova
- Assicurati di aver copiato TUTTO il token (inizia con `ghp_`)

### Errore: "Repository not found"
- Verifica che il repository esista su GitHub
- Verifica che l'URL sia corretto: `https://github.com/sadeghsehat-commits/cleaning-shift.git`
- Verifica che il repository sia accessibile (non privato se non hai i permessi)

### Il Terminal non mostra nulla quando incolli la password
- **È normale!** Il Terminal nasconde la password per sicurezza
- Incolla il token e premi Invio, anche se non vedi nulla

### "remote origin already exists"
- Se hai già fatto `git remote add origin`, salta questo comando
- Oppure rimuovi il remote esistente: `git remote remove origin` e riprova

## Suggerimenti

- Salva il token in un posto sicuro (password manager)
- Se scade, creane uno nuovo e ripeti il processo
- Dopo aver collegato Vercel a GitHub, ogni `git push` farà deploy automatico!

