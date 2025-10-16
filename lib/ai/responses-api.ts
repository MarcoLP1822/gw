/**
 * GPT-5 Responses API Wrapper
 * 
 * GPT-5 usa la nuova Responses API invece di Chat Completions.
 * Questo wrapper facilita la transizione e fornisce un'interfaccia pulita.
 * 
 * Documentazione: https://platform.openai.com/docs/guides/responses-api
 */

import { openai, logAPICall } from './openai-client';

export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';

export interface GPT5RequestOptions {
    model: string;
    input: string;
    reasoningEffort?: ReasoningEffort;
    verbosity?: Verbosity;
    maxOutputTokens?: number;
    responseFormat?: { type: 'json_object' };
    previousResponseId?: string;
}

export interface GPT5Response {
    id: string;
    output_text: string;
    usage?: {
        input_tokens?: number;
        output_tokens?: number;
        reasoning_tokens?: number;
        total_tokens?: number;
    };
    model: string;
}

/**
 * Chiama GPT-5 usando la Responses API
 */
export async function callGPT5(options: GPT5RequestOptions): Promise<GPT5Response> {
    const {
        model,
        input,
        reasoningEffort = 'medium',
        verbosity = 'medium',
        maxOutputTokens = 16000, // Aumentato per contenuti lunghi come capitoli
        responseFormat,
        previousResponseId,
    } = options;

    logAPICall('GPT-5 Responses API', model);

    const requestBody: any = {
        model,
        input,
        reasoning: {
            effort: reasoningEffort,
        },
        text: {
            verbosity,
            // In GPT-5 Responses API, response_format va dentro text.format come oggetto
            ...(responseFormat ? { format: responseFormat } : {}),
        },
        max_output_tokens: maxOutputTokens,
    };

    // Aggiungi previous_response_id per context continuity
    if (previousResponseId) {
        requestBody.previous_response_id = previousResponseId;
    }

    console.log(`🎯 GPT-5 Request:`, {
        model,
        reasoningEffort,
        verbosity,
        maxOutputTokens,
        inputLength: input.length,
    });

    try {
        const response: any = await openai.responses.create(requestBody);

        console.log(`✅ GPT-5 Response:`, {
            model: response.model,
            tokens: response.usage?.total_tokens || 'N/A',
            reasoningTokens: response.usage?.reasoning_tokens || 'N/A',
        });

        logAPICall('GPT-5 Response Received', response.model, response.usage?.total_tokens);

        return response as GPT5Response;
    } catch (error: any) {
        console.error('❌ GPT-5 Error:', error);
        throw new Error(`GPT-5 API Error: ${error.message}`);
    }
}

/**
 * Chiama GPT-5 per generazione JSON strutturato con retry automatico su troncamento
 */
export async function callGPT5JSON<T = any>(
    input: string,
    options?: Partial<GPT5RequestOptions>
): Promise<T> {
    const maxRetries = 2;
    let currentMaxTokens = options?.maxOutputTokens || 16000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await callGPT5({
            model: options?.model || 'gpt-5',
            input,
            reasoningEffort: options?.reasoningEffort,
            verbosity: options?.verbosity,
            maxOutputTokens: currentMaxTokens,
            responseFormat: { type: 'json_object' },
            previousResponseId: options?.previousResponseId,
        });

        try {
            return JSON.parse(response.output_text);
        } catch (error) {
            console.error(`❌ Failed to parse JSON response (attempt ${attempt + 1}/${maxRetries + 1})`);
            console.error('Response length:', response.output_text.length);
            console.error('First 500 chars:', response.output_text.substring(0, 500));
            console.error('Last 500 chars:', response.output_text.substring(Math.max(0, response.output_text.length - 500)));
            console.error('Parse error:', error);

            // Prova a capire se è troncato
            const lastChar = response.output_text.trim().slice(-1);
            const isTruncated = lastChar !== '}' && lastChar !== ']';

            if (isTruncated && attempt < maxRetries) {
                // Retry con più token
                const previousTokens = currentMaxTokens;
                currentMaxTokens = Math.min(currentMaxTokens * 1.5, 32000); // Max 32k per GPT-5
                console.log(`🔄 JSON truncated, retrying with increased tokens: ${previousTokens} → ${currentMaxTokens}`);
                continue; // Riprova con più token
            }

            // Ultimo tentativo fallito o errore non di troncamento
            if (isTruncated) {
                const suggestedTokens = Math.min(currentMaxTokens * 2, 32000);
                throw new Error(
                    `JSON response appears truncated (ends with '${lastChar}'). ` +
                    `Current maxOutputTokens: ${currentMaxTokens}. ` +
                    `Try increasing to ${suggestedTokens} or reduce prompt complexity.`
                );
            }

            throw new Error('Invalid JSON response from GPT-5');
        }
    }

    throw new Error('Failed to generate valid JSON after multiple retries');
}

/**
 * Determina il reasoning effort basato sulla complessità del task
 */
export function getReasoningEffortForTask(taskType: string): ReasoningEffort {
    const taskMap: Record<string, ReasoningEffort> = {
        // Tasks semplici - minimal/low
        'quick-check': 'minimal',
        'simple-validation': 'low',

        // Tasks standard - medium
        'chapter-generation': 'medium',
        'outline-generation': 'medium',
        'style-guide': 'medium',

        // Tasks complessi - high
        'consistency-check': 'high',
        'deep-analysis': 'high',
        'complex-reasoning': 'high',
    };

    return taskMap[taskType] || 'medium';
}

/**
 * Determina verbosity basata sul tipo di output
 */
export function getVerbosityForOutput(outputType: string): Verbosity {
    const verbosityMap: Record<string, Verbosity> = {
        'concise': 'low',
        'standard': 'medium',
        'detailed': 'high',

        // Tipi specifici
        'chapter': 'high', // Capitoli richiedono molto testo
        'outline': 'medium',
        'summary': 'low',
        'validation': 'low',
    };

    return verbosityMap[outputType] || 'medium';
}
