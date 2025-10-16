/**
 * Script per verificare il contenuto del customSystemPrompt
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmgnslzeu0001fnyg48ifcnxs'; // Il tuo progetto Mario Rossi

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            aiConfig: true,
        },
    });

    if (!project) {
        console.log('❌ Progetto non trovato');
        return;
    }

    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('📝 ID:', project.id);
    console.log('\n🔧 AI Config:');
    console.log('   - useCustomPrompts:', project.aiConfig?.useCustomPrompts);
    console.log('   - Has customSystemPrompt:', !!project.aiConfig?.customSystemPrompt);

    if (project.aiConfig?.customSystemPrompt) {
        console.log('\n📄 Custom System Prompt (primi 500 caratteri):');
        console.log('━'.repeat(80));
        console.log(project.aiConfig.customSystemPrompt.substring(0, 500));
        console.log('━'.repeat(80));
        console.log(`\n... (totale ${project.aiConfig.customSystemPrompt.length} caratteri)`);

        // Cerca "Sole" o "Colette" nel prompt
        const hasSole = project.aiConfig.customSystemPrompt.includes('Sole');
        const hasColette = project.aiConfig.customSystemPrompt.includes('Colette');

        if (hasSole || hasColette) {
            console.log('\n⚠️ CONFLITTO RILEVATO!');
            console.log('   Il customSystemPrompt contiene riferimenti a Sole/Colette');
            console.log('   che non dovrebbero essere qui per questo progetto!');
        }
    }

    console.log('\n📋 Style Guides:');
    console.log('   - customStyleGuide:', project.customStyleGuide ? `SI (${project.customStyleGuide.length} chars)` : 'NO');
    console.log('   - generatedStyleGuide:', project.generatedStyleGuide ? `SI (${project.generatedStyleGuide.length} chars)` : 'NO');
    console.log('   - styleGuideSource:', project.styleGuideSource || 'none');
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
