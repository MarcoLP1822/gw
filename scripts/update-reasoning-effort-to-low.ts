import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating reasoning effort from medium to low...');

    const result = await prisma.projectAIConfig.updateMany({
        where: {
            reasoningEffort: 'medium',
        },
        data: {
            reasoningEffort: 'low',
        },
    });

    console.log(`✅ Updated ${result.count} AI configs`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
