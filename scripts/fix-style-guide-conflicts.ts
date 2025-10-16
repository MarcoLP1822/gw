/**
 * Script per pulire i conflitti tra style guide e custom system prompts
 * 
 * Problema: Alcuni progetti hanno uno style guide nel customSystemPrompt
 * che causa duplicazione con lo style guide nel user prompt.
 * 
 * Soluzione: Questo script pulisce customSystemPrompt quando esiste
 * un customStyleGuide attivo.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Cercando progetti con potenziali conflitti...\n');

    // Trova tutti i progetti con customStyleGuide o generatedStyleGuide
    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { customStyleGuide: { not: null } },
                { generatedStyleGuide: { not: null } },
            ],
        },
        include: {
            aiConfig: true,
        },
    });

    console.log(`📊 Trovati ${projects.length} progetti con style guide\n`);

    let fixedCount = 0;

    for (const project of projects) {
        const hasCustomStyleGuide = !!project.customStyleGuide;
        const hasGeneratedStyleGuide = !!project.generatedStyleGuide;
        const hasCustomSystemPrompt = project.aiConfig?.useCustomPrompts && !!project.aiConfig?.customSystemPrompt;

        console.log(`\n📘 Progetto: ${project.bookTitle} (${project.id})`);
        console.log(`   - Custom Style Guide: ${hasCustomStyleGuide ? '✅' : '❌'}`);
        console.log(`   - Generated Style Guide: ${hasGeneratedStyleGuide ? '✅' : '❌'}`);
        console.log(`   - Custom System Prompt: ${hasCustomSystemPrompt ? '⚠️ SI' : '✅ NO'}`);

        if (hasCustomSystemPrompt && (hasCustomStyleGuide || hasGeneratedStyleGuide)) {
            console.log(`   🔧 Pulizia custom system prompt per evitare conflitti...`);

            try {
                await prisma.projectAIConfig.update({
                    where: { projectId: project.id },
                    data: {
                        useCustomPrompts: false,
                        customSystemPrompt: null,
                    },
                });

                console.log(`   ✅ Conflitto risolto!`);
                fixedCount++;
            } catch (error) {
                console.error(`   ❌ Errore durante la pulizia:`, error);
            }
        } else {
            console.log(`   ✅ Nessun conflitto rilevato`);
        }
    }

    console.log(`\n\n✨ Completato!`);
    console.log(`📊 Progetti analizzati: ${projects.length}`);
    console.log(`🔧 Conflitti risolti: ${fixedCount}`);
    console.log(`\n💡 Ora lo style guide sarà usato solo nel user prompt, non nel system prompt.`);
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
