const { PrismaClient } = require('@prisma/client');

async function readConsistencyReport() {
  const prisma = new PrismaClient();
  
  try {
    const report = await prisma.consistencyReport.findFirst({
      where: { projectId: 'cmgkqzrdw0003fnc8pjuzxqbs' },
      orderBy: { createdAt: 'desc' }
    });
    
    if (report) {
      console.log('\n📊 CONSISTENCY REPORT COMPLETO:');
      console.log('='.repeat(60));
      console.log('🎯 Overall Score:', report.overallScore);
      console.log('📅 Created:', report.createdAt);
      console.log('\n📋 REPORT DETAILS:');
      console.log(JSON.stringify(report.report, null, 2));
      console.log('='.repeat(60));
    } else {
      console.log('❌ Nessun consistency report trovato');
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

readConsistencyReport();