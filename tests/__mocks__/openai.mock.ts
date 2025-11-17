import { vi } from 'vitest';

// Mock OpenAI client
export const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn(),
        },
    },
};

// Mock chat completion response factory
export function createMockChatCompletion(content: string, model = 'gpt-4o-mini') {
    return {
        id: 'chatcmpl-test-id',
        object: 'chat.completion',
        created: Date.now(),
        model,
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content,
                },
                finish_reason: 'stop',
            },
        ],
        usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300,
        },
    };
}

// Mock streaming response
export function createMockStreamingResponse(content: string) {
    const chunks = content.split(' ');
    let index = 0;

    return {
        [Symbol.asyncIterator]: async function* () {
            for (const chunk of chunks) {
                yield {
                    id: 'chatcmpl-test-stream',
                    object: 'chat.completion.chunk',
                    created: Date.now(),
                    model: 'gpt-4o-mini',
                    choices: [
                        {
                            index: 0,
                            delta: {
                                content: chunk + ' ',
                            },
                            finish_reason: null,
                        },
                    ],
                };
            }
            // Final chunk
            yield {
                id: 'chatcmpl-test-stream',
                object: 'chat.completion.chunk',
                created: Date.now(),
                model: 'gpt-4o-mini',
                choices: [
                    {
                        index: 0,
                        delta: {},
                        finish_reason: 'stop',
                    },
                ],
            };
        },
    };
}

// Mock OpenAI constructor
vi.mock('openai', () => {
    return {
        default: vi.fn(() => mockOpenAI),
    };
});

export default mockOpenAI;
