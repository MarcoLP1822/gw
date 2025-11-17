/**
 * Script per testare l'API GET /api/projects/[id]
 * Verifica che i dati vengano normalizzati correttamente
 */

async function testProjectAPI() {
    console.log('🔍 Testing project API endpoint...\n');

    const projectId = 'cmhg7hbey0005fnk4y0x5y3x7'; // L'AMORE NON DOVREBBE FARE COSÌ MALE

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const url = `${baseUrl}/api/projects/${projectId}`;

        console.log(`📡 Calling: GET ${url}\n`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log(`✅ Response received (${response.status})\n`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📘 Project: ${data.project.bookTitle}`);
        console.log(`   ID: ${data.project.id}`);
        console.log(`   Status: ${data.project.status}\n`);

        // Check Outline (uppercase)
        if (data.project.Outline) {
            console.log(`✅ Outline (uppercase) exists:`);
            const outline = data.project.Outline.structure;
            console.log(`   - Title: ${outline?.title || 'N/A'}`);
            console.log(`   - Chapters: ${outline?.chapters?.length || 0}`);
        } else {
            console.log(`❌ Outline (uppercase) NOT found`);
        }

        // Check outline (lowercase - normalized)
        if (data.project.outline) {
            console.log(`\n✅ outline (lowercase - normalized) exists:`);
            const outline = data.project.outline.structure;
            console.log(`   - Title: ${outline?.title || 'N/A'}`);
            console.log(`   - Chapters: ${outline?.chapters?.length || 0}`);
            console.log(`   - Generated at: ${data.project.outline.generatedAt || 'N/A'}`);
        } else {
            console.log(`\n❌ outline (lowercase) NOT found`);
        }

        // Check Chapters
        console.log(`\n📖 Chapters: ${data.project.Chapter?.length || 0}`);
        const completedChapters = data.project.Chapter?.filter((ch: any) => ch.status === 'completed').length || 0;
        console.log(`   Completed: ${completedChapters}`);

        // Check ConsistencyReport array
        if (data.project.ConsistencyReport && data.project.ConsistencyReport.length > 0) {
            console.log(`\n✅ ConsistencyReport (array) exists:`);
            console.log(`   - Count: ${data.project.ConsistencyReport.length}`);
            console.log(`   - Overall Score: ${data.project.ConsistencyReport[0].overallScore}/100`);
        } else {
            console.log(`\n❌ ConsistencyReport (array) NOT found or empty`);
        }

        // Check consistencyReport (normalized)
        if (data.project.consistencyReport) {
            console.log(`\n✅ consistencyReport (normalized) exists:`);
            console.log(`   - Overall Score: ${data.project.consistencyReport.overallScore}/100`);
            console.log(`   - Created at: ${data.project.consistencyReport.createdAt}`);

            if (data.project.consistencyReport.report) {
                const report = data.project.consistencyReport.report;
                console.log(`   - Has report data: YES`);
                if (report.narrative) console.log(`     • Narrative Score: ${report.narrative.score}`);
                if (report.style) console.log(`     • Style Score: ${report.style.score}`);
                if (report.consistency) console.log(`     • Consistency Score: ${report.consistency.score}`);
            }
        } else {
            console.log(`\n❌ consistencyReport (normalized) NOT found`);
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`\n✅ API test completed successfully`);

    } catch (error) {
        console.error('\n❌ Error testing API:', error);
        if (error instanceof Error) {
            console.error('   Error message:', error.message);
        }
        process.exit(1);
    }
}

testProjectAPI();
