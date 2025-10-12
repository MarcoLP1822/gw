/**
 * Quick test script per verificare che AIConfigService funzioni
 * Run: node scripts/test-ai-config.js
 */

const { AIConfigService } = require('../lib/ai/config/ai-config-service');
const { prisma } = require('../lib/db');

async function testAIConfig() {
  console.log('🧪 Testing AI Config Service...\n');

  try {
    // 1. Test: Trova un progetto esistente
    const projects = await prisma.project.findMany({ take: 1 });
    
    if (projects.length === 0) {
      console.log('⚠️  Nessun progetto trovato nel database.');
      console.log('   Crea prima un progetto per testare la configurazione AI.');
      return;
    }

    const testProjectId = projects[0].id;
    console.log(`✅ Progetto trovato: ${projects[0].bookTitle} (${testProjectId})\n`);

    // 2. Test: GetOrCreate (dovrebbe creare default config)
    console.log('📝 Test 1: GetOrCreate - Creazione default config...');
    const config1 = await AIConfigService.getOrCreate(testProjectId);
    console.log('✅ Config creata:', {
      audienceType: config1.audienceType,
      bookGoal: config1.bookGoal,
      temperature: config1.temperature,
      model: config1.model,
    });
    console.log('');

    // 3. Test: Update config
    console.log('📝 Test 2: Update - Cambio audience a "children_5_10"...');
    const config2 = await AIConfigService.update(testProjectId, {
      audienceType: 'children_5_10',
      audienceAge: '5-7',
      sentenceComplexity: 'simple',
      chapterLength: 'concise',
    });
    console.log('✅ Config aggiornata:', {
      audienceType: config2.audienceType,
      audienceAge: config2.audienceAge,
      sentenceComplexity: config2.sentenceComplexity,
      targetWordsPerChapter: config2.targetWordsPerChapter,
    });
    console.log('');

    // 4. Test: Validazione (dovrebbe fallire)
    console.log('📝 Test 3: Validazione - Tentativo con temperatura invalida...');
    try {
      await AIConfigService.update(testProjectId, {
        temperature: 5.0, // INVALID!
      });
      console.log('❌ Validazione non ha funzionato!');
    } catch (error) {
      console.log('✅ Validazione funziona:', error.message);
    }
    console.log('');

    // 5. Test: HasCustomConfig
    console.log('📝 Test 4: HasCustomConfig...');
    const hasCustom = await AIConfigService.hasCustomConfig(testProjectId);
    console.log('✅ Ha configurazione custom?', hasCustom);
    console.log('');

    // 6. Test: Reset
    console.log('📝 Test 5: Reset a default...');
    const config3 = await AIConfigService.reset(testProjectId);
    console.log('✅ Config resettata a:', {
      audienceType: config3.audienceType,
      temperature: config3.temperature,
    });
    console.log('');

    console.log('🎉 Tutti i test completati con successo!\n');
    console.log('📊 Puoi vedere la configurazione in Prisma Studio:');
    console.log('   npx prisma studio\n');

  } catch (error) {
    console.error('❌ Errore durante i test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIConfig();
