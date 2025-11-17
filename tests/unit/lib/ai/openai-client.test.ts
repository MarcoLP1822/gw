import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock OpenAI module before importing anything else
vi.mock('openai', () => {
    return {
        default: class MockOpenAI {
            chat = {
                completions: {
                    create: vi.fn(),
                },
            };
        },
    };
});

// Now import after mock is set up
import { DEFAULT_MODEL, DEFAULT_CONFIG, logAPICall } from '@/lib/ai/openai-client';

describe('OpenAI Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    }); describe('Configuration', () => {
        it('should export DEFAULT_MODEL', () => {
            expect(DEFAULT_MODEL).toBeDefined();
            expect(typeof DEFAULT_MODEL).toBe('string');
        });

        it('should export DEFAULT_CONFIG with correct structure', () => {
            expect(DEFAULT_CONFIG).toBeDefined();
            expect(DEFAULT_CONFIG).toHaveProperty('model');
            expect(DEFAULT_CONFIG).toHaveProperty('reasoning');
            expect(DEFAULT_CONFIG).toHaveProperty('text');
            expect(DEFAULT_CONFIG).toHaveProperty('max_output_tokens');
        });

        it('should have reasoning effort set to medium', () => {
            expect(DEFAULT_CONFIG.reasoning.effort).toBe('medium');
        });

        it('should have text verbosity set to medium', () => {
            expect(DEFAULT_CONFIG.text.verbosity).toBe('medium');
        });

        it('should have max_output_tokens set to 20000', () => {
            expect(DEFAULT_CONFIG.max_output_tokens).toBe(20000);
        });
    });

    describe('logAPICall', () => {
        it('should log API call without tokens', () => {
            const consoleSpy = vi.spyOn(console, 'log');
            logAPICall('test-operation', 'gpt-4o-mini');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[OpenAI API]')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('test-operation')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('gpt-4o-mini')
            );

            consoleSpy.mockRestore();
        });

        it('should log API call with tokens', () => {
            const consoleSpy = vi.spyOn(console, 'log');
            logAPICall('test-operation', 'gpt-4o-mini', 1500);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Tokens: 1500')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Module Structure', () => {
        it('should export DEFAULT_MODEL constant', () => {
            expect(DEFAULT_MODEL).toBeDefined();
            expect(typeof DEFAULT_MODEL).toBe('string');
            expect(DEFAULT_MODEL.length).toBeGreaterThan(0);
        });

        it('should export DEFAULT_CONFIG object', () => {
            expect(DEFAULT_CONFIG).toBeDefined();
            expect(typeof DEFAULT_CONFIG).toBe('object');
            expect(DEFAULT_CONFIG).toHaveProperty('model');
        });

        it('should export logAPICall function', () => {
            expect(logAPICall).toBeDefined();
            expect(typeof logAPICall).toBe('function');
        });
    });
});
