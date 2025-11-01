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
        maxOutputTokens = 20000, // Aumentato per contenuti lunghi come capitoli
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

        // DEBUG: Log completo della risposta SEMPRE
        console.log('🔍 DEBUG - Full response structure:', JSON.stringify(response, null, 2));

        // Gestisci diverse strutture di risposta
        let outputText = '';

        // Caso 1: output_text è già una stringa non vuota
        if (typeof response.output_text === 'string' && response.output_text.length > 0) {
            outputText = response.output_text;
            console.log('✅ output_text is string, length:', outputText.length);
        }
        // Caso 2: Cerca nell'array output[] (GPT-5 Responses API)
        else if (response.output && Array.isArray(response.output)) {
            console.log('🔍 Checking output array, length:', response.output.length);
            for (const item of response.output) {
                if (item.type === 'text' && item.text) {
                    outputText = item.text;
                    console.log('✅ Found text in output array, length:', outputText.length);
                    break;
                }
                // Prova anche content
                if (item.content) {
                    outputText = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
                    console.log('✅ Found content in output array, length:', outputText.length);
                    break;
                }
            }
        }
        // Caso 3: output_text è un oggetto (es. { text: "..." })
        else if (response.output_text && typeof response.output_text === 'object') {
            console.log('⚠️ output_text is object:', Object.keys(response.output_text));
            outputText = response.output_text.text ||
                response.output_text.content ||
                JSON.stringify(response.output_text);
            console.log('⚠️ Extracted text length:', outputText.length);
        }
        // Caso 4: Prova altri campi
        else {
            console.log('⚠️ output_text not found or wrong type:', typeof response.output_text);
            outputText = response.text || response.output || '';
        }

        // Se la risposta ha un array di choices (come Chat Completions)
        if (!outputText && response.choices && response.choices[0]) {
            outputText = response.choices[0].message?.content || response.choices[0].text || '';
        }

        // Debug: Log completo se non troviamo il testo
        if (!outputText) {
            console.log('⚠️ No text found in response. Full structure:', JSON.stringify(response, null, 2));
        }

        return {
            id: response.id,
            output_text: outputText,
            usage: response.usage,
            model: response.model,
        } as GPT5Response;
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
    const maxRetries = 3; // Aumentato a 3 retry
    let currentMaxTokens = options?.maxOutputTokens || 20000; // Aumentato default a 20k

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
            // Verifica che output_text sia una stringa valida
            if (!response.output_text || typeof response.output_text !== 'string') {
                throw new Error(`Invalid output_text: ${typeof response.output_text}`);
            }

            return JSON.parse(response.output_text);
        } catch (error) {
            console.error(`❌ Failed to parse JSON response (attempt ${attempt + 1}/${maxRetries + 1})`);

            // Gestisci il caso in cui output_text sia undefined o non stringa
            const outputText = response.output_text || '';
            const isValidString = typeof outputText === 'string';

            console.error('Response length:', isValidString ? outputText.length : 'N/A (not a string)');

            if (isValidString && outputText.length > 0) {
                console.error('First 500 chars:', outputText.substring(0, 500));
                console.error('Last 500 chars:', outputText.substring(Math.max(0, outputText.length - 500)));
            } else {
                console.error('Output text is empty or invalid');
            }

            console.error('Parse error:', error);

            // Prova a capire se è troncato (solo se abbiamo una stringa valida)
            const lastChar = isValidString && outputText.length > 0 ? outputText.trim().slice(-1) : '';
            const isTruncated = lastChar !== '}' && lastChar !== ']' && lastChar !== '';

            if (isTruncated && attempt < maxRetries) {
                // Retry con più token - incremento più aggressivo
                const previousTokens = currentMaxTokens;
                currentMaxTokens = Math.min(currentMaxTokens * 2, 128000); // Max 128k per GPT-5
                console.log(`🔄 JSON truncated, retrying with increased tokens: ${previousTokens} → ${currentMaxTokens}`);
                continue; // Riprova con più token
            }

            // Ultimo tentativo fallito o errore non di troncamento
            if (isTruncated) {
                const suggestedTokens = Math.min(currentMaxTokens * 2, 128000);
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
        'consistency-check': 'medium', // Balanced: accurate but cost-effective

        // Tasks complessi - high
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
