/**
 * Script per verificare i modelli GPT-5 supportati
 */

const SUPPORTED_MODELS = [
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-5-pro'
] as const;

type SupportedModel = typeof SUPPORTED_MODELS[number];

interface ModelInfo {
    name: string;
    description: string;
    bestFor: string;
    pricing: 'premium' | 'balanced' | 'economy' | 'ultra-premium';
}

const MODEL_INFO: Record<SupportedModel, ModelInfo> = {
    'gpt-5': {
        name: 'GPT-5',
        description: 'Il migliore per coding e task agentic',
        bestFor: 'Contenuti complessi, qualità massima',
        pricing: 'premium'
    },
    'gpt-5-mini': {
        name: 'GPT-5 mini',
        description: 'Veloce ed economico per task ben definiti',
        bestFor: 'Generazione libri, ottimo rapporto qualità/prezzo',
        pricing: 'balanced'
    },
    'gpt-5-nano': {
        name: 'GPT-5 nano',
        description: 'Il più veloce ed economico',
        bestFor: 'Progetti semplici, budget limitati',
        pricing: 'economy'
    },
    'gpt-5-pro': {
        name: 'GPT-5 pro',
        description: 'Versione più potente di GPT-5',
        bestFor: 'Risposte più intelligenti e precise',
        pricing: 'ultra-premium'
    }
};

function verifyModel(model: string): boolean {
    return SUPPORTED_MODELS.includes(model as SupportedModel);
}

function getModelInfo(model: string): ModelInfo | null {
    if (verifyModel(model)) {
        return MODEL_INFO[model as SupportedModel];
    }
    return null;
}

// Test
console.log('🔍 Verifica Modelli GPT-5 Supportati\n');
console.log('═'.repeat(60));

SUPPORTED_MODELS.forEach(model => {
    const info = getModelInfo(model);
    if (info) {
        console.log(`\n✅ ${info.name}`);
        console.log(`   Descrizione: ${info.description}`);
        console.log(`   Ideale per: ${info.bestFor}`);
        console.log(`   Pricing: ${info.pricing}`);
    }
});

console.log('\n' + '═'.repeat(60));

// Test modelli non supportati
const invalidModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
console.log('\n❌ Modelli NON supportati:');
invalidModels.forEach(model => {
    const isValid = verifyModel(model);
    console.log(`   ${model}: ${isValid ? '✅ OK' : '❌ Non supportato'}`);
});

console.log('\n✨ Verifica completata!\n');
