/**
 * Script per applicare lo style guide corretto per Mario Rossi
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmgnslzeu0001fnyg48ifcnxs';

    console.log('📖 Caricamento style guide da file...\n');

    // Leggi lo style guide da file
    const styleGuidePath = join(process.cwd(), 'docs', 'STYLE_GUIDE_MARIO_ROSSI.md');
    const styleGuide = readFileSync(styleGuidePath, 'utf-8');

    console.log('✅ Style guide caricato:', styleGuide.length, 'caratteri\n');

    console.log('💾 Applicazione al progetto...\n');

    const project = await prisma.project.update({
        where: { id: projectId },
        data: {
            customStyleGuide: styleGuide,
            styleGuideSource: 'manual',
            styleGuideCreatedAt: new Date(),
        },
        select: {
            bookTitle: true,
        },
    });

    console.log('✅ Style guide applicato con successo!');
    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('📝 Style guide salvato:', styleGuide.length, 'caratteri');

    console.log('\n💡 Ora puoi:');
    console.log('   1. Rigenerare i capitoli per applicare il nuovo style guide');
    console.log('   2. Lo style guide comparirà nella sezione USER PROMPT, non nel SYSTEM PROMPT');
    console.log('   3. Verificare il risultato controllando i log della generazione');
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
