import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.config.{js,ts,mjs}',
                '**/types/',
                '**/*.d.ts',
                '.next/',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/components': path.resolve(__dirname, './components'),
            '@/app': path.resolve(__dirname, './app'),
            '@/types': path.resolve(__dirname, './types'),
            '@/prisma': path.resolve(__dirname, './prisma'),
        },
    },
});
