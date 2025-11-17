import { prisma } from '@/lib/db';

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Try to fetch all projects
        console.log('\n📊 Fetching all projects...');
        const projects = await prisma.project.findMany({
            take: 5,
            select: {
                id: true,
                bookTitle: true,
                authorName: true,
                status: true,
            }
        });

        console.log(`✅ Found ${projects.length} projects:`);
        projects.forEach(p => {
            console.log(`  - ${p.bookTitle} (${p.status}) - ID: ${p.id}`);
        });

        // Test fetching a single project with all relations
        if (projects.length > 0) {
            const testId = projects[0].id;
            console.log(`\n🔍 Testing detailed fetch for project: ${testId}`);

            const project = await prisma.project.findUnique({
                where: { id: testId },
                include: {
                    Outline: true,
                    Chapter: {
                        orderBy: {
                            chapterNumber: 'asc'
                        }
                    },
                    _count: {
                        select: {
                            Chapter: true,
                            GenerationLog: true
                        }
                    }
                }
            });

            if (project) {
                console.log('✅ Project fetched successfully');
                console.log(`  - Outline: ${project.Outline ? 'Yes' : 'No'}`);
                console.log(`  - Chapters: ${project._count.Chapter}`);
                console.log(`  - Generation Logs: ${project._count.GenerationLog}`);
            } else {
                console.log('❌ Project not found');
            }
        }

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

testConnection();
