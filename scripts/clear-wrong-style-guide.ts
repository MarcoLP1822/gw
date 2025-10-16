/**
 * Script per cancellare il customStyleGuide sbagliato
 * Questo permetterà al sistema di rigenerarlo o di usare quello corretto
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmgnslzeu0001fnyg48ifcnxs';

    console.log('🗑️  Rimozione customStyleGuide errato...\n');

    const project = await prisma.project.update({
        where: { id: projectId },
        data: {
            customStyleGuide: null,
            styleGuideSource: null,
            styleGuideCreatedAt: null,
        },
        select: {
            bookTitle: true,
            customStyleGuide: true,
            generatedStyleGuide: true,
        },
    });

    console.log('✅ Custom style guide rimosso con successo!');
    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('📝 Custom Style Guide:', project.customStyleGuide || '(rimosso)');
    console.log('📝 Generated Style Guide:', project.generatedStyleGuide ? 'Presente' : 'Assente');

    console.log('\n💡 Cosa fare ora:');
    console.log('   1. Vai nella pagina del progetto');
    console.log('   2. Clicca su "Settings" > "Style Guide"');
    console.log('   3. Inserisci manualmente lo style guide corretto per Mario Rossi');
    console.log('   4. Oppure genera automaticamente lo style guide da documenti caricati');
    console.log('   5. Rigenera i capitoli per applicare il nuovo style guide');
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
