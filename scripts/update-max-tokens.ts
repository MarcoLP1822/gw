/**
 * Script per aggiornare maxTokens a 16000 per tutti i progetti GPT-5
 * Risolve il problema del JSON troncato
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMaxTokens() {
    try {
        console.log('🔧 Aggiornamento maxTokens per progetti GPT-5...\n');

        // Trova tutti i progetti con gpt-5 che hanno maxTokens < 16000
        const configs = await prisma.projectAIConfig.findMany({
            where: {
                model: {
                    startsWith: 'gpt-5'
                }
            },
            include: {
                Project: {
                    select: {
                        id: true,
                        bookTitle: true
                    }
                }
            }
        });

        console.log(`📊 Trovati ${configs.length} progetti con GPT-5\n`);

        let updatedCount = 0;

        for (const config of configs) {
            const currentMaxTokens = config.maxTokens || 4000;

            console.log(`\n📦 Progetto: ${config.Project.bookTitle}`);
            console.log(`   ID: ${config.Project.id}`);
            console.log(`   Modello: ${config.model}`);
            console.log(`   Max Tokens attuale: ${currentMaxTokens}`);

            if (currentMaxTokens < 16000) {
                await prisma.projectAIConfig.update({
                    where: { id: config.id },
                    data: { maxTokens: 16000 }
                });

                console.log(`   ✅ Aggiornato a: 16000 token`);
                updatedCount++;
            } else {
                console.log(`   ⏭️  Già configurato correttamente`);
            }
        }

        console.log(`\n✨ Completato!`);
        console.log(`   Aggiornati: ${updatedCount} progetti`);
        console.log(`   Totali: ${configs.length} progetti`);

    } catch (error) {
        console.error('❌ Errore:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateMaxTokens()
    .then(() => {
        console.log('\n🎉 Script completato con successo!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script fallito:', error);
        process.exit(1);
    });
