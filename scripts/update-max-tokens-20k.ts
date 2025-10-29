import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMaxTokens() {
    try {
        console.log('🔄 Updating maxTokens to 20000 for all AI configs...');
        
        // Update all configs with maxTokens < 20000
        const result = await prisma.projectAIConfig.updateMany({
            where: {
                maxTokens: {
                    lt: 20000
                }
            },
            data: {
                maxTokens: 20000
            }
        });
        
        console.log(`✅ Updated ${result.count} AI configs`);
        
        // Show current state
        const configs = await prisma.projectAIConfig.findMany({
            select: {
                id: true,
                projectId: true,
                model: true,
                maxTokens: true,
                reasoningEffort: true,
                verbosity: true
            }
        });
        
        console.log('\n📊 Current AI configs:');
        configs.forEach((config: any) => {
            console.log(`  - Project ${config.projectId}: ${config.model}, ${config.maxTokens} tokens, ${config.reasoningEffort}/${config.verbosity}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}updateMaxTokens();
