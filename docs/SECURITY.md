# 🔒 Security Best Practices - Ghost Writing App

## 📋 Overview

Questo documento elenca le best practices di sicurezza da implementare nell'applicazione Ghost Writing.

---

## 🚨 Priorità Critiche (PRE-PRODUZIONE)

### 1. Authentication & Authorization

#### ✅ Implementare NextAuth.js

```bash
npm install next-auth
```

**Setup Base:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### ✅ Protected API Routes

```typescript
// lib/auth.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ApiErrors } from "@/lib/errors/api-errors"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw ApiErrors.unauthorized()
  }
  
  return session
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const session = await requireAuth()
  
  // Query only user's own data
  const projects = await prisma.project.findMany({
    where: { userId: session.user.id }
  })
  
  return NextResponse.json({ success: true, projects })
}
```

#### ✅ Row Level Security

```typescript
// lib/db-helpers.ts
export async function getUserProjects(userId: string) {
  return await prisma.project.findMany({
    where: { userId } // Always filter by userId
  })
}

export async function getUserProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      userId // Verify ownership
    }
  })
  
  if (!project) {
    throw ApiErrors.notFound('Project', projectId)
  }
  
  return project
}
```

---

## 🔐 Environment Variables Security

### ✅ Setup Corretto

**MAI committare .env nel repository**

```bash
# .gitignore
.env
.env*.local
.env.production
```

**Variables Checklist:**

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://..." # Connection pooling
DIRECT_URL="postgresql://..."   # Migrations only

# OpenAI (REQUIRED)
OPENAI_API_KEY="sk-proj-..."

# NextAuth (REQUIRED for production)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="..." # Generate: openssl rand -base64 32

# Google OAuth (if using)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Vercel Blob (if using uploads)
BLOB_READ_WRITE_TOKEN="..."

# Sentry (optional - monitoring)
SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."

# Environment
NODE_ENV="production"
```

### ✅ Validation

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
```

---

## 🛡️ Input Validation

### ✅ Zod Schemas

```bash
npm install zod
```

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const ProjectFormSchema = z.object({
  authorName: z.string()
    .min(1, 'Nome autore obbligatorio')
    .max(100, 'Nome autore troppo lungo'),
  
  bookTitle: z.string()
    .min(1, 'Titolo libro obbligatorio')
    .max(200, 'Titolo libro troppo lungo'),
  
  company: z.string()
    .min(1, 'Azienda obbligatoria')
    .max(100, 'Nome azienda troppo lungo'),
  
  estimatedPages: z.number()
    .int()
    .min(50, 'Minimo 50 pagine')
    .max(500, 'Massimo 500 pagine')
    .optional(),
    
  // ... altri campi
})

export type ValidatedProjectForm = z.infer<typeof ProjectFormSchema>
```

### ✅ API Route con Validation

```typescript
// app/api/projects/route.ts
import { ProjectFormSchema } from '@/lib/validation/schemas'
import { ApiErrors } from '@/lib/errors/api-errors'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    // Validate input
    const validated = ProjectFormSchema.parse(body)
    
    // Create project with validated data
    const project = await prisma.project.create({
      data: {
        ...validated,
        userId: session.user.id,
      }
    })
    
    return NextResponse.json({ success: true, project })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrors.validation(error.errors[0].message).toJSON(),
        { status: 400 }
      )
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
  }
}
```

---

## 🚦 Rate Limiting

### ✅ Implementazione (vedi lib/rate-limit.ts)

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting BEFORE any processing
    await rateLimit(request, RateLimitPresets.AI_GENERATION)
    
    // ... rest of handler
  } catch (error) {
    // Rate limit errors are handled by ApiError
    const apiError = handleApiError(error)
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
  }
}
```

### ✅ Configurazioni Consigliate

```typescript
// Per generazione AI (costoso)
AI_GENERATION: {
  interval: 60000,        // 1 minuto
  uniqueTokenPerInterval: 2  // Max 2 chiamate
}

// Per upload file
FILE_UPLOAD: {
  interval: 60000,
  uniqueTokenPerInterval: 5
}

// Per lettura dati (GET)
READ_API: {
  interval: 60000,
  uniqueTokenPerInterval: 30
}

// Per scrittura dati (POST/PUT)
WRITE_API: {
  interval: 60000,
  uniqueTokenPerInterval: 15
}
```

---

## 🔍 Security Headers

### ✅ Middleware con Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP (Content Security Policy)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 🗄️ Database Security

### ✅ Prisma Best Practices

```typescript
// ❌ BAD - SQL Injection risk
const projects = await prisma.$queryRaw`
  SELECT * FROM Project WHERE title = ${userInput}
`

// ✅ GOOD - Safe with Prisma
const projects = await prisma.project.findMany({
  where: { 
    bookTitle: { contains: userInput },
    userId: session.user.id // Always filter by user
  }
})
```

### ✅ Connection Security

```bash
# Use SSL for database connections
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Use connection pooling
DATABASE_URL="postgresql://...?pgbouncer=true&connect_timeout=15"
```

---

## 🔑 API Keys Security

### ✅ OpenAI API Key Protection

```typescript
// lib/ai/openai-client.ts
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required')
}

if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Invalid OPENAI_API_KEY format')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 60000,
})
```

### ✅ Vercel Environment Variables

In Vercel Dashboard:
1. Settings > Environment Variables
2. Add all required variables
3. Set correct scope (Production, Preview, Development)
4. Enable "Sensitive" flag for secrets

---

## 📊 Monitoring & Logging

### ✅ Sentry Integration

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }
    return event
  },
})
```

### ✅ Structured Logging (vedi lib/logger.ts)

```typescript
import { logger } from '@/lib/logger'

// Log without sensitive data
logger.info('User login', { 
  userId: user.id,
  // ❌ DON'T log: password, apiKey, tokens
})

logger.error('API call failed', error, {
  endpoint: '/api/projects',
  method: 'POST',
  // ❌ DON'T log: request body with sensitive data
})
```

---

## ✅ Pre-Production Checklist

- [ ] NextAuth.js configurato e funzionante
- [ ] Tutte le API routes protette con `requireAuth()`
- [ ] Row-level security implementata (filter by userId)
- [ ] Environment variables validate con Zod
- [ ] Input validation con Zod schemas
- [ ] Rate limiting su tutte le API routes
- [ ] Security headers configurati in middleware
- [ ] HTTPS enabled (automatic su Vercel)
- [ ] Database connections use SSL
- [ ] OpenAI API key validata e protetta
- [ ] Sensitive data filtrata dai log
- [ ] Error monitoring configurato (Sentry)
- [ ] CORS configurato correttamente
- [ ] File uploads validati (type, size)
- [ ] SQL injection protected (use Prisma ORM)
- [ ] XSS protection (React auto-escape)

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [Vercel Security](https://vercel.com/docs/security)

---

**Last Updated**: 17 Novembre 2025  
**Version**: 1.0  
**Status**: ⚠️ Requires implementation before production
