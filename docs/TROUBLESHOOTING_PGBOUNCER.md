# Troubleshooting: Prisma + Supabase pgBouncer

## ❌ Problema

Errore durante le query Prisma:

```
Error: prepared statement "s0" already exists
PostgresError { code: "42P05" }
```

---

## 🔍 Causa

Questo errore si verifica quando si usa **Supabase con pgBouncer** (porta 6543) in modalità **transaction pooling**. 

Prisma tenta di creare "prepared statements" per ottimizzare le query, ma pgBouncer in transaction mode non supporta prepared statements tra transazioni diverse, causando conflitti.

---

## ✅ Soluzione

### 1. Modifica `.env`

Aggiungi i parametri corretti alla `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connect_timeout=15"
```

**Parametri importanti**:
- `pgbouncer=true` - Dice a Prisma di usare pgBouncer
- `connect_timeout=15` - Timeout per connessioni più affidabile

### 2. Riavvia il Server

Dopo aver modificato `.env`:

```bash
# Ferma il server (Ctrl+C)
# Oppure forza la chiusura:
Stop-Process -Name node -Force

# Rigenera Prisma Client
npx prisma generate

# Riavvia
npm run dev
```

---

## 📝 Configurazione Completa .env

```bash
# Connection pooling per API routes (porta 6543 pgBouncer)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-X-eu-central-X.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15"

# Direct connection per migrations (porta 5432)
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-X-eu-central-X.pooler.supabase.com:5432/postgres"
```

---

## 🔄 Alternative

### Opzione A: Usa Session Mode (non raccomandato)

In Supabase dashboard, cambia pgBouncer mode da "Transaction" a "Session".

**Contro**:
- Consuma più connessioni
- Meno scalabile
- Non raccomandato per production

### Opzione B: Usa Connection Diretta (solo dev)

Per development, puoi usare la porta 5432 direttamente:

```bash
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-X-eu-central-X.pooler.supabase.com:5432/postgres"
```

**Contro**:
- Limite di connessioni basso
- Non adatto per production
- Uso solo per test locali

---

## 🎯 Best Practice (Soluzione Implementata)

Usa la configurazione corretta con `pgbouncer=true`:

```bash
# ✅ Production-ready
DATABASE_URL="postgresql://...@HOST:6543/postgres?pgbouncer=true&connect_timeout=15"

# ✅ Per migrations
DIRECT_URL="postgresql://...@HOST:5432/postgres"
```

Questo permette:
- ✅ Connection pooling efficiente
- ✅ Scalabilità in production
- ✅ No prepared statements conflicts
- ✅ Prisma funziona correttamente

---

## 🧪 Verifica Soluzione

Dopo aver applicato la fix:

1. Server parte senza errori
2. Navighi a http://localhost:3000/progetti
3. La lista progetti si carica correttamente
4. No errori "prepared statement already exists" in console

---

## 📚 Riferimenti

- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [pgBouncer Transaction Pooling](https://www.pgbouncer.org/features.html)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)

---

## ✅ Status

**Problema risolto** ✅

La configurazione è stata corretta e il server funziona senza errori.
