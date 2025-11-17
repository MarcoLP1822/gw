# 🧪 Testing Guide

## Overview

Questo progetto utilizza **Vitest** come framework di testing, con **React Testing Library** per i componenti e **Mock Service Worker (MSW)** per il mocking delle API.

## Struttura dei Test

```
tests/
├── __mocks__/              # Mock globali riutilizzabili
│   ├── prisma.mock.ts      # Mock Prisma Client
│   ├── openai.mock.ts      # Mock OpenAI API
│   ├── vercel-blob.mock.ts # Mock Vercel Blob
│   └── next-cache.mock.ts  # Mock Next.js cache
├── fixtures/               # Dati di test riutilizzabili
│   ├── projects.ts
│   ├── chapters.ts
│   ├── ai-configs.ts
│   └── documents.ts
├── helpers/                # Utility per i test
│   ├── db-helpers.ts
│   ├── api-helpers.ts
│   ├── render-helpers.tsx
│   └── assertion-helpers.ts
├── unit/                   # Unit tests
│   ├── lib/
│   │   ├── ai/
│   │   └── services/
│   └── components/
└── integration/            # Integration tests
    └── api/
```

## Comandi Disponibili

```bash
# Esegui tutti i test una volta
npm test

# Esegui i test in watch mode (sviluppo)
npm run test:watch

# Esegui i test con interfaccia UI
npm run test:ui

# Genera report di coverage
npm run test:coverage
```

## Scrivere Test

### Unit Test per Funzioni

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/my-module';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Test per Componenti React

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Integration Test per API Routes

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/my-route/route';
import { createMockRequest, expectSuccessResponse } from '@/tests/helpers/api-helpers';

describe('API: /api/my-route', () => {
  it('should return data', async () => {
    const request = createMockRequest({ method: 'GET' });
    const response = await GET(request);
    const data = await expectSuccessResponse(response);
    expect(data).toBeDefined();
  });
});
```

## Mock e Fixtures

### Utilizzare Mock del Database

```typescript
import { prismaMock } from '@/tests/__mocks__/prisma.mock';
import { mockProject } from '@/tests/fixtures/projects';

// Mock di una query
prismaMock.project.findUnique.mockResolvedValue(mockProject as any);
```

### Utilizzare Mock di OpenAI

```typescript
import { mockOpenAI, createMockChatCompletion } from '@/tests/__mocks__/openai.mock';

mockOpenAI.chat.completions.create.mockResolvedValue(
  createMockChatCompletion('AI response content')
);
```

## Best Practices

1. **Isolamento**: Ogni test deve essere indipendente
2. **Naming**: Usa nomi descrittivi per i test
3. **Arrange-Act-Assert**: Organizza i test in queste 3 fasi
4. **Mock Minimali**: Mocka solo ciò che serve
5. **Fixtures Riutilizzabili**: Usa i fixture per dati comuni

## Coverage Goals

Il progetto mira a mantenere:
- **70%** di copertura delle linee
- **70%** di copertura delle funzioni
- **70%** di copertura dei branch
- **70%** di copertura degli statement

## Debugging Test

```bash
# Esegui un singolo file di test
npm test tests/unit/lib/my-file.test.ts

# Esegui test che matchano un pattern
npm test -- --grep="myFunction"

# Esegui test con output verbose
npm test -- --reporter=verbose
```

## Risorse Utili

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
