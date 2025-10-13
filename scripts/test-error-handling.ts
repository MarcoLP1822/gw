/**
 * Script di test per il sistema di gestione errori
 * Simula vari scenari di errore per verificare il comportamento
 */

import {
    ApiError,
    ApiErrors,
    ErrorType,
    ErrorSeverity,
    parseOpenAIError,
    handleApiError,
    getErrorMessage
} from '../lib/errors/api-errors';

console.log('🧪 Testing Error Handling System\n');

// Test 1: Creazione errori con factory functions
console.log('='.repeat(60));
console.log('Test 1: Factory Functions');
console.log('='.repeat(60));

const validationError = ApiErrors.validation('Campo obbligatorio mancante');
console.log('✅ Validation Error:', validationError.toJSON());

const notFoundError = ApiErrors.notFound('Progetto', 'abc123');
console.log('✅ Not Found Error:', notFoundError.toJSON());

const apiKeyError = ApiErrors.invalidApiKey();
console.log('✅ Invalid API Key:', apiKeyError.toJSON());

const quotaError = ApiErrors.quotaExceeded();
console.log('✅ Quota Exceeded:', quotaError.toJSON());

const rateLimitError = ApiErrors.rateLimit(60);
console.log('✅ Rate Limit:', rateLimitError.toJSON());

const prerequisiteError = ApiErrors.prerequisiteNotMet("Genera prima l'outline", {
    projectId: 'xyz789',
    step: 'outline'
});
console.log('✅ Prerequisite Not Met:', prerequisiteError.toJSON());

// Test 2: Parsing errori OpenAI
console.log('\n' + '='.repeat(60));
console.log('Test 2: OpenAI Error Parsing');
console.log('='.repeat(60));

// Simula errore 401 (API Key invalida)
const mockOpenAI401 = {
    message: 'Invalid API Key provided',
    status: 401,
};
const parsed401 = parseOpenAIError(mockOpenAI401);
console.log('✅ OpenAI 401:', parsed401.toJSON());

// Simula errore 429 (Quota exceeded)
const mockOpenAI429 = {
    message: 'You exceeded your current quota, please check your plan',
    status: 429,
};
const parsed429 = parseOpenAIError(mockOpenAI429);
console.log('✅ OpenAI 429:', parsed429.toJSON());

// Simula errore timeout
const mockOpenAITimeout = {
    message: 'Request timed out',
    status: 504,
};
const parsedTimeout = parseOpenAIError(mockOpenAITimeout);
console.log('✅ OpenAI Timeout:', parsedTimeout.toJSON());

// Test 3: Handler centralizzato
console.log('\n' + '='.repeat(60));
console.log('Test 3: Centralized Error Handler');
console.log('='.repeat(60));

// ApiError già creato
const handledApiError = handleApiError(apiKeyError);
console.log('✅ Handled ApiError:', handledApiError.toJSON());

// Error standard
const standardError = new Error('Something went wrong');
const handledStandardError = handleApiError(standardError);
console.log('✅ Handled Standard Error:', handledStandardError.toJSON());

// Errore sconosciuto
const unknownError = 'String error';
const handledUnknownError = handleApiError(unknownError);
console.log('✅ Handled Unknown Error:', handledUnknownError.toJSON());

// Test 4: Messaggi user-friendly
console.log('\n' + '='.repeat(60));
console.log('Test 4: User-Friendly Messages');
console.log('='.repeat(60));

const errorCodes = [
    ErrorType.API_KEY_INVALID,
    ErrorType.API_QUOTA_EXCEEDED,
    ErrorType.API_RATE_LIMIT,
    ErrorType.API_TIMEOUT,
    ErrorType.PREREQUISITE_NOT_MET,
    ErrorType.NOT_FOUND,
    ErrorType.VALIDATION_ERROR,
];

errorCodes.forEach(code => {
    console.log(`✅ ${code}:`);
    console.log(`   ${getErrorMessage(code)}`);
});

// Test 5: Proprietà errori
console.log('\n' + '='.repeat(60));
console.log('Test 5: Error Properties');
console.log('='.repeat(60));

const testError = ApiErrors.rateLimit(60);
console.log('✅ Error Properties:');
console.log('   - Code:', testError.code);
console.log('   - Status Code:', testError.statusCode);
console.log('   - Severity:', testError.severity);
console.log('   - Retryable:', testError.retryable);
console.log('   - Message:', testError.message);

// Test 6: Severità
console.log('\n' + '='.repeat(60));
console.log('Test 6: Error Severity');
console.log('='.repeat(60));

const severityExamples = [
    { name: 'Validation (LOW)', error: ApiErrors.validation('Test') },
    { name: 'Timeout (MEDIUM)', error: ApiErrors.timeout('Test') },
    { name: 'Database (HIGH)', error: ApiErrors.database('Test') },
    { name: 'API Key (CRITICAL)', error: ApiErrors.invalidApiKey() },
];

severityExamples.forEach(({ name, error }) => {
    console.log(`✅ ${name}:`, error.severity);
});

// Test 7: Context
console.log('\n' + '='.repeat(60));
console.log('Test 7: Error Context');
console.log('='.repeat(60));

const errorWithContext = ApiErrors.prerequisiteNotMet('Completa il capitolo precedente', {
    projectId: 'proj_123',
    chapterNumber: 5,
    requiredChapter: 4,
    status: 'pending'
});
console.log('✅ Error with Context:', errorWithContext.toJSON());

// Test 8: Retryable errors
console.log('\n' + '='.repeat(60));
console.log('Test 8: Retryable Errors');
console.log('='.repeat(60));

const retryableErrors = [
    { name: 'Rate Limit', error: ApiErrors.rateLimit() },
    { name: 'Timeout', error: ApiErrors.timeout('operation') },
    { name: 'External API', error: ApiErrors.externalApi('OpenAI') },
];

const nonRetryableErrors = [
    { name: 'Invalid API Key', error: ApiErrors.invalidApiKey() },
    { name: 'Quota Exceeded', error: ApiErrors.quotaExceeded() },
    { name: 'Validation', error: ApiErrors.validation('Test') },
];

console.log('✅ Retryable:');
retryableErrors.forEach(({ name, error }) => {
    console.log(`   - ${name}: ${error.retryable}`);
});

console.log('✅ Non-Retryable:');
nonRetryableErrors.forEach(({ name, error }) => {
    console.log(`   - ${name}: ${error.retryable}`);
});

// Test 9: JSON serialization
console.log('\n' + '='.repeat(60));
console.log('Test 9: JSON Serialization');
console.log('='.repeat(60));

const errorForAPI = ApiErrors.invalidApiKey();
const serialized = JSON.stringify(errorForAPI.toJSON(), null, 2);
console.log('✅ Serialized Error:');
console.log(serialized);

// Test 10: Stack trace
console.log('\n' + '='.repeat(60));
console.log('Test 10: Stack Trace');
console.log('='.repeat(60));

try {
    throw ApiErrors.validation('Test error with stack');
} catch (error) {
    if (error instanceof ApiError) {
        console.log('✅ Error caught correctly');
        console.log('   - Name:', error.name);
        console.log('   - Has Stack:', !!error.stack);
        console.log('   - Stack Preview:', error.stack?.split('\n')[0]);
    }
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!');
console.log('='.repeat(60));
