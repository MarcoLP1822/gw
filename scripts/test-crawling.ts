/**
 * Test Script for Web Crawling Feature
 * 
 * Usage: npx tsx scripts/test-crawling.ts
 */

import { crawlWebsite, extractFromWebsite } from '../lib/content-extraction/web-extractor';

async function testCrawling() {
    const testUrl = 'https://www.youcanprint.it';

    console.log('='.repeat(80));
    console.log('TEST 1: Estrazione Homepage (senza crawling)');
    console.log('='.repeat(80));

    try {
        const result1 = await extractFromWebsite(testUrl);
        console.log('\n✅ Risultati:');
        console.log(`   - Parole estratte: ${result1.wordCount}`);
        console.log(`   - Titolo: ${result1.metadata.title}`);
        console.log(`   - Descrizione: ${result1.metadata.description?.substring(0, 100)}...`);
        console.log(`   - Anteprima testo: ${result1.text.substring(0, 200)}...\n`);
    } catch (error) {
        console.error('❌ Errore:', error);
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST 2: Crawling Multi-Livello (depth=2, maxPages=10)');
    console.log('='.repeat(80));

    try {
        const result2 = await crawlWebsite(testUrl, {
            maxDepth: 2,
            maxPages: 10,
        });

        console.log('\n✅ Risultati:');
        console.log(`   - Parole totali: ${result2.wordCount}`);
        console.log(`   - Titolo: ${result2.metadata.title}`);
        console.log(`   - Descrizione: ${result2.metadata.description?.substring(0, 100)}...`);
        console.log(`   - Anteprima testo: ${result2.text.substring(0, 300)}...\n`);

        // Conta quante pagine sono state incluse
        const pageMatches = result2.text.match(/=== Pagina \d+:/g);
        console.log(`   - Pagine incluse: ${pageMatches?.length || 0}`);

    } catch (error) {
        console.error('❌ Errore:', error);
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETATI');
    console.log('='.repeat(80));
}

// Run test
testCrawling().catch(console.error);
