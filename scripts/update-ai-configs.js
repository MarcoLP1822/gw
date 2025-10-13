/**
 * Script per aggiornare automaticamente il modello AI in tutti i progetti
 * 
 * Esegui con: node scripts/update-ai-configs.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NEW_MODEL = 'gpt-5-mini-2025-08-07';

async function updateAIConfigs() {
    console.log('\n🔧 AGGIORNAMENTO CONFIGURAZIONI AI\n');
    console.log('='.repeat(60));

    try {
        // 1. Conta configurazioni da aggiornare
        const configsToUpdate = await prisma.projectAIConfig.count({
            where: {
                model: {
                    not: NEW_MODEL
                }
            }
        });

        console.log(`\n📊 Configurazioni da aggiornare: ${configsToUpdate}`);

        if (configsToUpdate === 0) {
            console.log('\n✅ Tutte le configurazioni usano già il modello corretto!');
            console.log(`   Modello: ${NEW_MODEL}`);
            return;
        }

        // 2. Mostra configurazioni attuali
        console.log('\n📋 Configurazioni attuali:\n');
        const currentConfigs = await prisma.projectAIConfig.findMany({
            where: {
                model: {
                    not: NEW_MODEL
                }
            },
            include: {
                project: {
                    select: {
                        bookTitle: true,
                        authorName: true,
                    }
                }
            }
        });

        currentConfigs.forEach((config, index) => {
            console.log(`   ${index + 1}. "${config.project.bookTitle}"`);
            console.log(`      Modello attuale: ${config.model}`);
            console.log(`      Autore: ${config.project.authorName}\n`);
        });

        // 3. Chiedi conferma (in ambiente interattivo)
        console.log(`⚠️  Stai per aggiornare ${configsToUpdate} configurazioni a:`);
        console.log(`   Nuovo modello: ${NEW_MODEL}\n`);

        // 4. Esegui l'aggiornamento
        console.log('🔄 Aggiornamento in corso...\n');

        const result = await prisma.projectAIConfig.updateMany({
            where: {
                model: {
                    not: NEW_MODEL
                }
            },
            data: {
                model: NEW_MODEL,
                updatedAt: new Date(),
            }
        });

        console.log(`✅ Aggiornate ${result.count} configurazioni!\n`);

        // 5. Verifica finale
        console.log('📊 Verifica finale:\n');
        const finalConfigs = await prisma.projectAIConfig.findMany({
            include: {
                project: {
                    select: {
                        bookTitle: true,
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        finalConfigs.forEach((config, index) => {
            const icon = config.model === NEW_MODEL ? '✅' : '❌';
            console.log(`   ${icon} "${config.project.bookTitle}"`);
            console.log(`      Modello: ${config.model}`);
            console.log(`      Aggiornato: ${config.updatedAt.toLocaleString('it-IT')}\n`);
        });

        // 6. Statistiche finali
        const stats = await prisma.projectAIConfig.groupBy({
            by: ['model'],
            _count: {
                model: true
            }
        });

        console.log('📈 STATISTICHE FINALI:\n');
        stats.forEach(stat => {
            const icon = stat.model === NEW_MODEL ? '✅' : '⚠️';
            console.log(`   ${icon} ${stat.model}: ${stat._count.model} progetti`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ Aggiornamento completato con successo!\n');

    } catch (error) {
        console.error('\n❌ Errore durante l\'aggiornamento:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Esegui l'aggiornamento
updateAIConfigs();
