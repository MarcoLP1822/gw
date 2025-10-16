/**
 * Script per verificare quali capitoli sono stati generati
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = 'cmgnslzeu0001fnyg48ifcnxs';

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            chapters: {
                orderBy: { chapterNumber: 'asc' },
                select: {
                    chapterNumber: true,
                    title: true,
                    status: true,
                    wordCount: true,
                    generatedAt: true,
                },
            },
        },
    });

    if (!project) {
        console.log('❌ Progetto non trovato');
        return;
    }

    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('📊 Totale capitoli:', project.chapters.length);
    console.log('\n📝 Capitoli generati:\n');

    project.chapters.forEach(ch => {
        const status = ch.status === 'completed' ? '✅' :
            ch.status === 'generating' ? '⏳' :
                ch.status === 'error' ? '❌' : '⏸️';

        console.log(`${status} Cap ${ch.chapterNumber}: ${ch.title}`);
        console.log(`   Status: ${ch.status} | ${ch.wordCount} parole`);
        console.log(`   Generato: ${ch.generatedAt ? new Date(ch.generatedAt).toLocaleString() : 'N/A'}\n`);
    });

    console.log('\n💡 Per generare lo style guide automaticamente:');
    console.log('   1. Assicurati che i capitoli 1 e 2 siano completati');
    console.log('   2. Vai in Settings > Style Guide');
    console.log('   3. Clicca "Genera da Capitoli 1 e 2"');
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
