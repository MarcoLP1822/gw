/**
 * Script di verifica rapida del modello AI utilizzato
 * 
 * Esegui con: node scripts/verify-ai-model.js
 * O con: npm run verify-model (se aggiungi il comando in package.json)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAIModel() {
    console.log('\n🔍 VERIFICA MODELLO AI IN USO\n');
    console.log('='.repeat(60));

    try {
        // 1. Controlla le configurazioni AI dei progetti
        console.log('\n📋 1. CONFIGURAZIONI AI DEI PROGETTI:');
        const aiConfigs = await prisma.projectAIConfig.findMany({
            include: {
                project: {
                    select: {
                        bookTitle: true,
                        authorName: true,
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (aiConfigs.length === 0) {
            console.log('   ⚠️  Nessuna configurazione AI trovata');
        } else {
            aiConfigs.forEach(config => {
                console.log(`\n   📚 Progetto: "${config.project.bookTitle}"`);
                console.log(`      Autore: ${config.project.authorName}`);
                console.log(`      🤖 Modello: ${config.model}`);
                console.log(`      Temperature: ${config.temperature}`);
                console.log(`      Max Tokens: ${config.maxTokens}`);
                console.log(`      Ultimo aggiornamento: ${config.updatedAt.toLocaleString('it-IT')}`);
            });
        }

        // 2. Controlla gli ultimi log di generazione
        console.log('\n\n📊 2. ULTIMI LOG DI GENERAZIONE:');
        const recentLogs = await prisma.generationLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: {
                        bookTitle: true,
                    }
                }
            }
        });

        if (recentLogs.length === 0) {
            console.log('   ⚠️  Nessun log di generazione trovato');
        } else {
            recentLogs.forEach(log => {
                const statusIcon = log.success ? '✅' : '❌';
                console.log(`\n   ${statusIcon} ${log.step.toUpperCase()}`);
                console.log(`      Progetto: "${log.project.bookTitle}"`);
                console.log(`      🤖 Modello: ${log.aiModel}`);
                console.log(`      Tokens: ${log.totalTokens} (prompt: ${log.promptTokens}, completion: ${log.completionTokens})`);
                console.log(`      Durata: ${(log.duration / 1000).toFixed(2)}s`);
                console.log(`      Data: ${log.createdAt.toLocaleString('it-IT')}`);
                if (!log.success && log.errorMessage) {
                    console.log(`      ⚠️  Errore: ${log.errorMessage}`);
                }
            });
        }

        // 3. Controlla gli outline generati
        console.log('\n\n📝 3. OUTLINE GENERATI:');
        const outlines = await prisma.outline.findMany({
            take: 5,
            orderBy: { generatedAt: 'desc' },
            include: {
                project: {
                    select: {
                        bookTitle: true,
                    }
                }
            }
        });

        if (outlines.length === 0) {
            console.log('   ⚠️  Nessun outline trovato');
        } else {
            outlines.forEach(outline => {
                console.log(`\n   📖 Progetto: "${outline.project.bookTitle}"`);
                console.log(`      🤖 Modello: ${outline.aiModel}`);
                console.log(`      Capitoli: ${outline.totalChapters}`);
                console.log(`      Data: ${outline.generatedAt.toLocaleString('it-IT')}`);
            });
        }

        // 4. Controlla i capitoli generati
        console.log('\n\n📄 4. ULTIMI CAPITOLI GENERATI:');
        const chapters = await prisma.chapter.findMany({
            take: 10,
            orderBy: { generatedAt: 'desc' },
            include: {
                project: {
                    select: {
                        bookTitle: true,
                    }
                }
            }
        });

        if (chapters.length === 0) {
            console.log('   ⚠️  Nessun capitolo trovato');
        } else {
            chapters.forEach(chapter => {
                console.log(`\n   📄 Capitolo ${chapter.chapterNumber}`);
                console.log(`      Progetto: "${chapter.project.bookTitle}"`);
                console.log(`      🤖 Modello: ${chapter.aiModel || 'N/A'}`);
                console.log(`      Parole: ${chapter.wordCount}`);
                console.log(`      Data: ${chapter.generatedAt.toLocaleString('it-IT')}`);
            });
        }

        // 5. Statistiche modelli usati
        console.log('\n\n📈 5. STATISTICHE MODELLI USATI:');
        const modelStats = await prisma.generationLog.groupBy({
            by: ['aiModel'],
            _count: {
                aiModel: true
            },
            _sum: {
                totalTokens: true
            }
        });

        if (modelStats.length === 0) {
            console.log('   ⚠️  Nessuna statistica disponibile');
        } else {
            modelStats.forEach(stat => {
                console.log(`\n   🤖 Modello: ${stat.aiModel}`);
                console.log(`      Chiamate: ${stat._count.aiModel}`);
                console.log(`      Tokens totali: ${stat._sum.totalTokens?.toLocaleString('it-IT') || 'N/A'}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Verifica completata\n');

        // Verifica se c'è ancora il vecchio modello in uso
        const oldModelInUse = modelStats.some(stat => 
            stat.aiModel && (
                stat.aiModel.includes('gpt-4o-mini') || 
                stat.aiModel === 'gpt-5-mini'
            )
        );

        if (oldModelInUse) {
            console.log('⚠️  ATTENZIONE: Rilevato uso di modelli vecchi!');
            console.log('   Potrebbe essere necessario aggiornare le configurazioni AI.');
            console.log('   Esegui questo SQL per aggiornare:');
            console.log(`   UPDATE "AIConfig" SET model = 'gpt-5-mini-2025-08-07';`);
        } else if (modelStats.length > 0) {
            console.log('✅ Tutti i log mostrano l\'uso del modello corretto!');
        }

    } catch (error) {
        console.error('\n❌ Errore durante la verifica:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Esegui la verifica
verifyAIModel();
