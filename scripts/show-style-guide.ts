/**
 * Script per mostrare il customStyleGuide salvato
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmgnslzeu0001fnyg48ifcnxs';

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            bookTitle: true,
            customStyleGuide: true,
            styleGuideSource: true,
        },
    });

    if (!project) {
        console.log('❌ Progetto non trovato');
        return;
    }

    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('📝 Source:', project.styleGuideSource);
    console.log('\n📄 Custom Style Guide:');
    console.log('═'.repeat(80));
    console.log(project.customStyleGuide || '(vuoto)');
    console.log('═'.repeat(80));

    if (project.customStyleGuide) {
        const hasSole = project.customStyleGuide.includes('Sole');
        const hasColette = project.customStyleGuide.includes('Colette');
        const hasMario = project.customStyleGuide.includes('Mario');

        console.log('\n🔍 Analisi contenuto:');
        console.log('   - Contiene "Sole":', hasSole ? '⚠️ SI' : '✅ NO');
        console.log('   - Contiene "Colette":', hasColette ? '⚠️ SI' : '✅ NO');
        console.log('   - Contiene "Mario":', hasMario ? '✅ SI' : '❌ NO');

        if ((hasSole || hasColette) && !hasMario) {
            console.log('\n❌ PROBLEMA CONFERMATO:');
            console.log('   Il customStyleGuide contiene lo style guide sbagliato!');
            console.log('   Dovrebbe essere per Mario Rossi, ma contiene Sole/Colette.');
        } else if (hasMario) {
            console.log('\n✅ Style guide corretto per Mario Rossi');
        }
    }
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
