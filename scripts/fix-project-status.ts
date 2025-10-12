/**
 * Script per correggere lo status dei progetti che sono stati completati
 * ma sono rimasti bloccati in "draft"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProjectStatus() {
    console.log('🔧 Fixing project status...\n');

    try {
        // Trova tutti i progetti
        const projects = await prisma.project.findMany({
            include: {
                outline: true,
                chapters: true,
            },
        });

        for (const project of projects) {
            const outlineStructure = project.outline?.structure as any;
            const totalChapters = outlineStructure?.chapters?.length || 0;
            const completedChapters = project.chapters.filter(
                ch => ch.status === 'completed'
            ).length;

            let newStatus = project.status;
            let reason = '';

            if (!project.outline) {
                newStatus = 'draft';
                reason = 'No outline yet';
            } else if (completedChapters === 0) {
                newStatus = 'generating_outline';
                reason = 'Outline exists but no chapters';
            } else if (completedChapters < totalChapters) {
                newStatus = 'generating_chapters';
                reason = `${completedChapters}/${totalChapters} chapters completed`;
            } else if (completedChapters === totalChapters && totalChapters > 0) {
                newStatus = 'completed';
                reason = `All ${totalChapters} chapters completed`;
            }

            if (newStatus !== project.status) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: { status: newStatus },
                });

                console.log(`✅ Updated project "${project.bookTitle}"`);
                console.log(`   Status: ${project.status} → ${newStatus}`);
                console.log(`   Reason: ${reason}`);
                console.log(`   Chapters: ${completedChapters}/${totalChapters}\n`);
            } else {
                console.log(`⏭️  Project "${project.bookTitle}" already has correct status: ${project.status}`);
                console.log(`   Chapters: ${completedChapters}/${totalChapters}\n`);
            }
        }

        console.log('✅ All project statuses have been checked and fixed!');
    } catch (error) {
        console.error('❌ Error fixing project status:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
fixProjectStatus()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
