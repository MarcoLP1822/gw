// Verify correct gpt-5-mini model
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('\n📊 Checking AI Config models...\n');
    
    const configs = await prisma.projectAIConfig.findMany({
        include: {
            project: {
                select: {
                    bookTitle: true,
                    authorName: true
                }
            }
        }
    });

    console.log(`Found ${configs.length} AI configurations:\n`);
    
    configs.forEach((config, idx) => {
        console.log(`${idx + 1}. Project: ${config.project.bookTitle}`);
        console.log(`   Author: ${config.project.authorName}`);
        console.log(`   Model: ${config.model}`);
        console.log(`   Temperature: ${config.temperature}`);
        console.log(`   Max Tokens: ${config.maxTokens}\n`);
    });

    const correctModel = configs.filter(c => c.model === 'gpt-5-mini');
    const wrongModel = configs.filter(c => c.model !== 'gpt-5-mini');

    console.log('='.repeat(60));
    console.log(`✅ Correct model (gpt-5-mini): ${correctModel.length}`);
    console.log(`❌ Wrong model: ${wrongModel.length}`);
    if (wrongModel.length > 0) {
        wrongModel.forEach(c => {
            console.log(`   - ${c.project.bookTitle}: ${c.model}`);
        });
    }
    console.log('='.repeat(60));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
