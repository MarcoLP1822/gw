# Configurazione Vercel Blob per Upload di File

## Variabili d'Ambiente Richieste

Per abilitare l'upload diretto di file tramite Vercel Blob, è necessario configurare la seguente variabile d'ambiente:

### BLOB_READ_WRITE_TOKEN

Token di autenticazione per Vercel Blob Storage.

**Come ottenerlo:**

1. Vai al [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Storage** → **Create Database** → **Blob**
4. Crea un nuovo Blob Store (se non esiste già)
5. Una volta creato, vai su **Settings** del Blob Store
6. Copia il token **BLOB_READ_WRITE_TOKEN**

**Dove configurarlo:**

- **Vercel Dashboard**: Project Settings → Environment Variables
  - Aggiungi: `BLOB_READ_WRITE_TOKEN` = `[il-tuo-token]`
  - Applica a: Production, Preview, Development

- **File `.env.local` (sviluppo locale)**:
  ```bash
  BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX
  ```

## Vantaggi di Vercel Blob

✅ **Nessun limite di 4.5MB**: Bypass del limite delle Serverless Functions  
✅ **Upload diretto dal client**: Il file va direttamente dal browser a Vercel Blob  
✅ **Sicuro**: Token exchange tra server e Vercel Blob per autenticare l'upload  
✅ **Fino a 50MB**: Supporto per file fino a 50MB (configurabile)  
✅ **Nessun timeout**: Upload in background senza bloccare le funzioni serverless  

## Come Funziona

1. L'utente seleziona un file (anche da 17MB)
2. Il client chiama `/api/projects/[id]/documents/upload` per ottenere un token sicuro
3. Il file viene caricato **direttamente** da browser a Vercel Blob
4. Quando il caricamento finisce, Vercel notifica il server tramite webhook
5. Il server scarica il file da Vercel Blob, lo processa ed estrae il testo

## Test in Locale

⚠️ **Importante**: L'evento `onUploadCompleted` non funziona su `localhost` perché Vercel Blob non può raggiungere il tuo computer.

**Soluzioni**:
- Usa [ngrok](https://ngrok.com/) per esporre localhost pubblicamente
- Oppure testa direttamente su Vercel (deploy di preview)

```bash
# Esempio con ngrok
ngrok http 3000
# Usa l'URL ngrok per testare l'upload completo
```

## Troubleshooting

### Errore 403 Forbidden
- ❌ Variabile `BLOB_READ_WRITE_TOKEN` mancante o errata
- ✅ Verifica che il token sia configurato correttamente

### Upload non completato
- ❌ Testando su localhost senza ngrok
- ✅ Usa ngrok o testa su Vercel

### File troppo grande
- ❌ Limite di 50MB superato
- ✅ Modifica `maximumSizeInBytes` in `app/api/projects/[id]/documents/upload/route.ts`
