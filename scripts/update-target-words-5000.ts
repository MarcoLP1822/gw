import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTargetWords() {
    try {
        console.log('🔄 Updating targetWordsPerChapter to 5000 for all AI configs...');
        
        // Update all configs with targetWordsPerChapter < 5000
        const result = await prisma.projectAIConfig.updateMany({
            where: {
                targetWordsPerChapter: {
                    lt: 5000
                }
            },
            data: {
                targetWordsPerChapter: 5000
            }
        });
        
        console.log(`✅ Updated ${result.count} AI configs`);
        
        // Show current state
        const configs = await prisma.projectAIConfig.findMany({
            select: {
                id: true,
                projectId: true,
                targetWordsPerChapter: true,
                maxTokens: true
            }
        });
        
        console.log('\n📊 Current AI configs:');
        configs.forEach((config: any) => {
            console.log(`  - Project ${config.projectId}: ${config.targetWordsPerChapter} words/chapter, ${config.maxTokens} tokens`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updateTargetWords();
