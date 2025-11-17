/**
 * Script per testare la sincronizzazione dei dati del progetto
 * Verifica che outline e consistency report vengano recuperati correttamente
 */

import { prisma } from '../lib/db';

async function testProjectSync() {
    console.log('🔍 Testing project data synchronization...\n');

    try {
        // Trova tutti i progetti
        const projects = await prisma.project.findMany({
            include: {
                Outline: true,
                Chapter: {
                    orderBy: {
                        chapterNumber: 'asc'
                    }
                },
                ConsistencyReport: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                _count: {
                    select: {
                        Chapter: true,
                        GenerationLog: true,
                        ConsistencyReport: true
                    }
                }
            }
        });

        console.log(`📊 Found ${projects.length} projects\n`);

        for (const project of projects) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📘 Project: ${project.bookTitle}`);
            console.log(`   ID: ${project.id}`);
            console.log(`   Status: ${project.status}`);
            console.log(`   Created: ${project.createdAt.toISOString()}`);

            // Check Outline
            if (project.Outline) {
                const outline = project.Outline.structure as any;
                console.log(`\n✅ Outline exists:`);
                console.log(`   - Title: ${outline.title || 'N/A'}`);
                console.log(`   - Chapters: ${outline.chapters?.length || 0}`);
                console.log(`   - Generated at: ${project.Outline.generatedAt?.toISOString() || 'N/A'}`);
                console.log(`   - AI Model: ${project.Outline.aiModel || 'N/A'}`);
            } else {
                console.log(`\n❌ No outline found`);
            }

            // Check Chapters
            const completedChapters = project.Chapter.filter(ch => ch.status === 'completed').length;
            console.log(`\n📖 Chapters: ${completedChapters}/${project._count.Chapter} completed`);
            if (project.Chapter.length > 0) {
                console.log(`   Latest chapters:`);
                project.Chapter.slice(0, 3).forEach(ch => {
                    console.log(`   - Ch.${ch.chapterNumber}: ${ch.title.substring(0, 40)}... (${ch.status})`);
                });
            }

            // Check ConsistencyReport
            if (project.ConsistencyReport && project.ConsistencyReport.length > 0) {
                const report = project.ConsistencyReport[0];
                console.log(`\n✅ Consistency Report exists:`);
                console.log(`   - Overall Score: ${report.overallScore}/100`);
                console.log(`   - Created at: ${report.createdAt.toISOString()}`);

                const reportData = report.report as any;
                if (reportData.narrative) {
                    console.log(`   - Narrative Score: ${reportData.narrative.score || 'N/A'}`);
                }
                if (reportData.style) {
                    console.log(`   - Style Score: ${reportData.style.score || 'N/A'}`);
                }
                if (reportData.consistency) {
                    console.log(`   - Consistency Score: ${reportData.consistency.score || 'N/A'}`);
                }
            } else {
                console.log(`\n❌ No consistency report found`);
            }

            // Check for potential issues
            console.log(`\n🔍 Potential issues:`);
            const issues: string[] = [];

            if (!project.Outline && project.Chapter.length > 0) {
                issues.push('⚠️  Chapters exist but no outline');
            }

            if (project.Outline && project.Chapter.length === 0) {
                issues.push('⚠️  Outline exists but no chapters generated');
            }

            if (project.Outline) {
                const outline = project.Outline.structure as any;
                const totalChapters = outline.chapters?.length || 0;
                if (completedChapters === totalChapters && !project.ConsistencyReport.length) {
                    issues.push('⚠️  All chapters complete but no consistency report');
                }
            }

            if (project.ConsistencyReport.length > 0) {
                const reportDate = new Date(project.ConsistencyReport[0].createdAt);
                const hasNewerChapters = project.Chapter.some(ch =>
                    new Date(ch.updatedAt) > reportDate
                );
                if (hasNewerChapters) {
                    issues.push('⚠️  Consistency report may be outdated (chapters updated after report)');
                }
            }

            if (issues.length > 0) {
                issues.forEach(issue => console.log(`   ${issue}`));
            } else {
                console.log('   ✅ No issues found');
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`\n✅ Sync test completed successfully`);

    } catch (error) {
        console.error('\n❌ Error testing project sync:', error);
        if (error instanceof Error) {
            console.error('   Error message:', error.message);
            console.error('   Stack:', error.stack);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testProjectSync();
