import { NextRequest, NextResponse } from 'next/server';
import { vi } from 'vitest';

/**
 * Helper per creare una mock NextRequest per i test
 */
export function createMockRequest(options: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
} = {}): NextRequest {
    const {
        method = 'GET',
        url = 'http://localhost:3000/api/test',
        body,
        headers = {},
        searchParams = {},
    } = options;

    const urlObj = new URL(url);
    Object.entries(searchParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
    });

    const requestInit: {
        method: string;
        headers: Record<string, string>;
        body?: string;
    } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestInit.body = JSON.stringify(body);
    }

    return new NextRequest(urlObj.toString(), requestInit as any);
}

/**
 * Helper per estrarre il JSON da una NextResponse
 */
export async function parseResponse<T = any>(response: NextResponse): Promise<{
    status: number;
    data: T;
    headers: Headers;
}> {
    const data = await response.json();
    return {
        status: response.status,
        data,
        headers: response.headers,
    };
}

/**
 * Helper per verificare una risposta di errore
 */
export function expectErrorResponse(
    response: NextResponse,
    expectedStatus: number,
    expectedMessage?: string
) {
    expect(response.status).toBe(expectedStatus);
    return parseResponse(response).then((parsed) => {
        expect(parsed.data).toHaveProperty('error');
        if (expectedMessage) {
            expect(parsed.data.error).toContain(expectedMessage);
        }
        return parsed.data;
    });
}

/**
 * Helper per verificare una risposta di successo
 */
export function expectSuccessResponse<T = any>(
    response: NextResponse,
    expectedStatus: number = 200
) {
    expect(response.status).toBe(expectedStatus);
    return parseResponse<T>(response).then((parsed) => {
        expect(parsed.data).not.toHaveProperty('error');
        return parsed.data;
    });
}

/**
 * Mock di fetch per simulare chiamate API esterne
 */
export function mockFetch(mockResponse: any, status = 200) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
        headers: new Headers(),
    });
}

/**
 * Helper per simulare un delay nelle risposte API (per testare loading states)
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper per testare rate limiting
 */
export function createMultipleRequests(
    count: number,
    requestFactory: () => NextRequest
): NextRequest[] {
    return Array.from({ length: count }, requestFactory);
}
