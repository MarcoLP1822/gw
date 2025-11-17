// Test API endpoint directly
async function testAPI() {
    const projectId = 'cmh0jug6b0001jj04ynu5ucke'; // From our test
    const url = `http://localhost:3000/api/projects/${projectId}`;

    console.log(`🔍 Testing API endpoint: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        console.log('📦 Response:', JSON.stringify(data, null, 2));

        if (data.success && data.project) {
            console.log('✅ API working correctly!');
            console.log(`   Project: ${data.project.bookTitle}`);
            console.log(`   Author: ${data.project.authorName}`);
            console.log(`   Chapters: ${data.project._count?.Chapter || 0}`);
        } else {
            console.log('❌ API returned error or unexpected format');
        }
    } catch (error) {
        console.error('❌ Error testing API:');
        console.error(error);
    }
}

testAPI();
