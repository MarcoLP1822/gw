import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.DATABASE_URL = 'file:./test.db';
process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Extend expect with custom matchers if needed
expect.extend({
    toBeValidProject(received) {
        const pass =
            typeof received === 'object' &&
            received !== null &&
            'id' in received &&
            'title' in received &&
            'status' in received;

        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received} not to be a valid project`
                    : `expected ${received} to be a valid project with id, title, and status`,
        };
    },
});
