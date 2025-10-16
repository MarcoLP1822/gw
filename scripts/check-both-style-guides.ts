/**
 * Script per verificare se esiste un generatedStyleGuide
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
            generatedStyleGuide: true,
            styleGuideSource: true,
            styleGuideCreatedAt: true,
        },
    });

    if (!project) {
        console.log('❌ Progetto non trovato');
        return;
    }

    console.log('\n📘 Progetto:', project.bookTitle);
    console.log('\n📋 Style Guide Status:');
    console.log('━'.repeat(80));

    console.log('\n1️⃣ Custom Style Guide (manuale):');
    if (project.customStyleGuide) {
        console.log('   ✅ PRESENTE:', project.customStyleGuide.length, 'caratteri');
        console.log('   📅 Creato:', project.styleGuideCreatedAt);
        console.log('   🏷️  Source:', project.styleGuideSource);
    } else {
        console.log('   ❌ ASSENTE');
    }

    console.log('\n2️⃣ Generated Style Guide (auto da cap 1-2):');
    if (project.generatedStyleGuide) {
        console.log('   ✅ PRESENTE:', project.generatedStyleGuide.length, 'caratteri');
        console.log('   📝 Primi 200 caratteri:');
        console.log('   ', project.generatedStyleGuide.substring(0, 200));
    } else {
        console.log('   ❌ ASSENTE');
    }

    console.log('\n━'.repeat(80));
    console.log('\n💡 Comportamento Atteso:');
    console.log('   - Se ENTRAMBI assenti → Nessuno style guide usato');
    console.log('   - Se solo generatedStyleGuide → Usato quello (standard)');
    console.log('   - Se customStyleGuide presente → Usato quello (override)');
}

main()
    .catch((error) => {
        console.error('❌ Errore:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
