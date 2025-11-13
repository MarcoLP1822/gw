# 🎯 Soluzione Errore 403 - Upload File > 4.5MB

## Problema Risolto
Errore 403 durante l'upload di file da 17MB causato dal limite di 4.5MB delle Vercel Serverless Functions.

## ✅ Modifiche Implementate

### 1. **Installato Vercel Blob SDK**
```bash
npm install @vercel/blob
```

### 2. **Nuovo Endpoint per Client Upload**
`app/api/projects/[id]/documents/upload/route.ts`
- Genera token sicuri per upload client-side
- Gestisce callback al completamento
- Supporta file fino a 50MB

### 3. **Aggiornato DocumentUpload Component**
`components/DocumentUpload.tsx`
- Usa `upload()` da `@vercel/blob/client`
- Upload diretto dal browser a Vercel Blob
- Bypassa il limite di 4.5MB delle Functions

### 4. **Aggiornato DocumentService**
`lib/services/document-service.ts`
- Nuovo metodo `uploadDocumentFromBlob()`
- Scarica il file da Vercel Blob dopo l'upload
- Processa ed estrae il testo come prima

## 🔧 Configurazione Richiesta

### **Variabile d'Ambiente Necessaria**

Devi configurare `BLOB_READ_WRITE_TOKEN` su Vercel:

1. Vai a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto
3. **Storage** → **Create Database** → **Blob**
4. Crea un Blob Store
5. Copia il token `BLOB_READ_WRITE_TOKEN`
6. **Project Settings** → **Environment Variables**
7. Aggiungi:
   - Key: `BLOB_READ_WRITE_TOKEN`
   - Value: `[il-tuo-token]`
   - Ambienti: Production, Preview, Development

### **Test Locale**

Per testare in locale, aggiungi al file `.env.local`:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXX
```

⚠️ **Nota**: Il callback `onUploadCompleted` non funziona su localhost. Usa [ngrok](https://ngrok.com/) o testa su Vercel.

## 🚀 Come Funziona Ora

```
┌─────────┐     1. Seleziona File (17MB)
│ Browser │────────────────────────────────┐
└─────────┘                                │
     │                                     ▼
     │                          ┌────────────────────┐
     │    2. Richiedi Token     │  Next.js Function  │
     │──────────────────────────▶ /documents/upload  │
     │                          └────────────────────┘
     │    3. Token Sicuro                 │
     │◀───────────────────────────────────┘
     │
     │    4. Upload Diretto (NO LIMITS!)
     │─────────────────────────────────────┐
     │                                     ▼
     │                          ┌────────────────────┐
     │                          │  Vercel Blob       │
     │                          │  Storage           │
     │                          └────────────────────┘
     │                                     │
     │                          5. Webhook on Complete
     │                                     │
     │                                     ▼
     │                          ┌────────────────────┐
     │                          │  Next.js Function  │
     │                          │  Scarica & Processa│
     │                          └────────────────────┘
     │                                     │
     │    6. Completato!                   │
     │◀────────────────────────────────────┘
```

## 📝 Vantaggi

✅ **Nessun limite 4.5MB**: File fino a 50MB (configurabile)  
✅ **Più veloce**: Upload diretto senza proxy serverless  
✅ **Più affidabile**: Nessun timeout delle Functions  
✅ **Sicuro**: Token exchange per autenticazione  
✅ **Scalabile**: Vercel Blob gestisce automaticamente la scalabilità  

## 📚 Documentazione

Consulta `docs/VERCEL_BLOB_SETUP.md` per maggiori dettagli.

## 🧪 Test

1. **Deploy su Vercel** (o usa ngrok per locale)
2. Configura `BLOB_READ_WRITE_TOKEN`
3. Prova a caricare un file da 17MB
4. ✅ Dovrebbe funzionare senza errori 403!

## 🐛 Troubleshooting

### Errore 403
- Controlla che `BLOB_READ_WRITE_TOKEN` sia configurata
- Verifica che il token sia valido

### Upload non si completa
- Se su localhost, usa ngrok
- Controlla i log Vercel per webhook errors

### File troppo grande (>50MB)
Modifica il limite in `app/api/projects/[id]/documents/upload/route.ts`:
```typescript
maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
```
