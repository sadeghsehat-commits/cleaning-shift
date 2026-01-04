# Come Deployare le Modifiche su Vercel

## Situazione Attuale
Il tuo progetto è già deployato su Vercel, ma le modifiche locali non sono ancora state pubblicate.

## Opzione 1: Usa GitHub (CONSIGLIATO - Gratuito)

### Passo 1: Crea Account GitHub (se non ce l'hai)
1. Vai su https://github.com
2. Clicca "Sign up"
3. Crea un account gratuito (non serve carta di credito)

### Passo 2: Crea un Nuovo Repository su GitHub
1. Dopo il login, clicca sul simbolo "+" in alto a destra
2. Seleziona "New repository"
3. Nome repository: `cleaning-shift-manager` (o un nome a tua scelta)
4. Scegli "Private" o "Public" (consiglio Private per progetti personali)
5. **NON** spuntare "Add README" o altri file
6. Clicca "Create repository"

### Passo 3: Inizializza Git Localmente
Apri il terminale nella cartella del progetto e esegui:

```bash
# Vai nella cartella del progetto
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Inizializza Git
git init

# Aggiungi tutti i file
git add .

# Fai il primo commit
git commit -m "Initial commit with check-in/check-out calendar feature"
```

### Passo 4: Collega il Repository Locale a GitHub
GitHub ti mostrerà i comandi da eseguire. Sostituisci `YOUR_USERNAME` con il tuo username GitHub:

```bash
# Aggiungi il repository remoto
git remote add origin https://github.com/YOUR_USERNAME/cleaning-shift-manager.git

# Rinomina il branch principale (se necessario)
git branch -M main

# Fai push del codice
git push -u origin main
```

Ti chiederà username e password GitHub (usa un Personal Access Token invece della password - vedi sotto).

### Passo 5: Crea Personal Access Token (per autenticazione)
1. Vai su GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clicca "Generate new token (classic)"
3. Nome: `Vercel Deploy`
4. Seleziona scadenza (consiglio 90 giorni o No expiration)
5. Seleziona scope: spunta `repo` (tutti i permessi sotto repo)
6. Clicca "Generate token"
7. **COPIA IL TOKEN** (lo vedi solo una volta!)

Quando Git ti chiede la password, incolla questo token invece della password.

### Passo 6: Collega Vercel a GitHub
1. Vai su https://vercel.com e fai login
2. Vai al tuo progetto (Cleaning Shift Manager)
3. Vai in Settings → Git
4. Clicca "Connect Git Repository"
5. Seleziona GitHub e autorizza Vercel
6. Scegli il repository che hai appena creato
7. Vercel farà automaticamente un nuovo deploy!

## Opzione 2: Deploy Manuale (Più Semplice ma Meno Automatico)

Se preferisci non usare Git, puoi fare deploy manuale:

1. Vai su https://vercel.com
2. Seleziona il tuo progetto
3. Vai su "Deployments"
4. Clicca "..." (tre punti) su un deployment recente
5. Seleziona "Redeploy" (ma questo usa il codice vecchio)

**NOTA**: Il deploy manuale da Vercel non funziona per aggiornare il codice. Devi usare Git o l'opzione 3.

## Opzione 3: Test Locale Prima

Prima di deployare, puoi testare le modifiche localmente:

```bash
# Avvia il server di sviluppo
npm run dev
```

Poi apri http://localhost:3000 nel browser e vedrai le modifiche localmente!

## Domande Frequenti

**Q: Devo pagare per GitHub?**  
A: No, GitHub è gratuito per repository pubblici e privati.

**Q: GitLab invece di GitHub?**  
A: Sì, funziona anche GitLab! Il processo è simile.

**Q: Posso usare Vercel CLI?**  
A: Sì, ma richiede anche Git. È più complicato per iniziare.

**Q: Le modifiche sono perse se non faccio commit?**  
A: No, sono ancora nel tuo computer. Ma fai backup regolari!

## Suggerimento
Dopo aver collegato GitHub a Vercel, ogni volta che fai `git push`, Vercel farà automaticamente un nuovo deploy. Molto comodo!

