const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Funzione per determinare il tipo di commit
function getCommitType(message) {
    const msg = message.toLowerCase();
    
    // Feature keywords
    if (msg.match(/^feat:|^feature:|implementat|aggiunt|nuov/)) {
        return 'feature';
    }
    
    // Bugfix keywords
    if (msg.match(/^fix:|risolto|bug|errore|correzione/)) {
        return 'bugfix';
    }
    
    // Improvement keywords
    if (msg.match(/^improve:|migliora|ottimizza|aggiorna|potenzia/)) {
        return 'improvement';
    }
    
    // Breaking change keywords
    if (msg.match(/^breaking:|breaking change|major/)) {
        return 'breaking';
    }
    
    // Default to improvement
    return 'improvement';
}

// Funzione per categorizzare il commit
function categorizeCommit(message) {
    const msg = message.toLowerCase();
    
    if (msg.match(/ui|ux|design|interfaccia|responsive|layout/)) {
        return 'UI/UX';
    }
    if (msg.match(/ai|gpt|model|prompt|reasoning/)) {
        return 'AI Configuration';
    }
    if (msg.match(/progetto|project|client/)) {
        return 'Gestione Progetti';
    }
    if (msg.match(/capitol|chapter/)) {
        return 'Capitoli';
    }
    if (msg.match(/export|docx|pdf/)) {
        return 'Export';
    }
    if (msg.match(/consistency|coerenza/)) {
        return 'Consistency Check';
    }
    if (msg.match(/versioning|undo|history/)) {
        return 'Versioning';
    }
    if (msg.match(/deployment|deploy|vercel/)) {
        return 'Deployment';
    }
    if (msg.match(/doc|readme|changelog/)) {
        return 'Documentazione';
    }
    
    return 'Generale';
}

// Funzione per incrementare la versione
function incrementVersion(currentVersion, type) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    if (type === 'breaking' || type === 'feature') {
        // Feature o breaking = minor bump (per ora, major solo su richiesta)
        return `${major}.${minor + 1}.0`;
    } else {
        // Improvement o bugfix = patch bump
        return `${major}.${minor}.${patch + 1}`;
    }
}

// Funzione per formattare la data
function formatDate() {
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                   'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const date = new Date();
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Ottieni l'ultimo commit (escludi quelli con [skip ci])
function getLatestCommits() {
    try {
        // Ottieni gli ultimi 5 commit che non contengono [skip ci]
        const commits = execSync('git log -5 --pretty=format:"%H|%s" --no-merges', { encoding: 'utf-8' });
        return commits.split('\n')
            .map(line => {
                const [hash, message] = line.split('|');
                return { hash, message };
            })
            .filter(commit => !commit.message.includes('[skip ci]'));
    } catch (error) {
        console.error('Error getting commits:', error);
        return [];
    }
}

// Leggi il file changelog attuale
function readChangelog() {
    const changelogPath = path.join(process.cwd(), 'app', 'changelog', 'page.tsx');
    return fs.readFileSync(changelogPath, 'utf-8');
}

// Estrai l'ultima versione dal changelog
function extractLatestVersion(content) {
    const match = content.match(/version:\s*'(\d+\.\d+\.\d+)'/);
    return match ? match[1] : '1.0.0';
}

// Estrai le entry esistenti del changelog
function extractChangelogEntries(content) {
    const match = content.match(/const changelog: ChangelogEntry\[\] = \[([\s\S]*?)\n\];/);
    if (!match) return [];
    
    // Parse delle entry esistenti (semplificato)
    return match[1];
}

// Crea una nuova entry del changelog
function createChangelogEntry(commits, currentVersion) {
    if (commits.length === 0) return null;
    
    // Determina il tipo principale (prende il più "importante")
    const types = commits.map(c => getCommitType(c.message));
    const mainType = types.includes('feature') ? 'feature' : 
                     types.includes('breaking') ? 'breaking' : 
                     types.includes('bugfix') ? 'bugfix' : 'improvement';
    
    // Incrementa versione
    const newVersion = incrementVersion(currentVersion, mainType);
    
    // Raggruppa commits per categoria
    const categorized = {};
    commits.forEach(commit => {
        const category = categorizeCommit(commit.message);
        if (!categorized[category]) {
            categorized[category] = [];
        }
        // Pulisci il messaggio (rimuovi prefissi tipo "feat:", "fix:", ecc)
        let cleanMessage = commit.message
            .replace(/^(feat|fix|improve|feature|bugfix|chore|docs):\s*/i, '')
            .trim();
        
        // Capitalizza prima lettera
        cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
        
        categorized[category].push(cleanMessage);
    });
    
    // Genera l'entry
    const changes = Object.entries(categorized).map(([category, items]) => {
        const itemsString = items.map(item => `                    '${item}',`).join('\n');
        return `            {
                category: '${category}',
                items: [
${itemsString}
                ],
            }`;
    }).join(',\n');
    
    return `    {
        version: '${newVersion}',
        date: '${formatDate()}',
        type: '${mainType}',
        changes: [
${changes}
        ],
    }`;
}

// Aggiorna il file changelog
function updateChangelog() {
    const commits = getLatestCommits();
    
    if (commits.length === 0) {
        console.log('No new commits to add to changelog');
        return;
    }
    
    console.log(`Found ${commits.length} new commit(s):`);
    commits.forEach(c => console.log(`  - ${c.message}`));
    
    const content = readChangelog();
    const currentVersion = extractLatestVersion(content);
    console.log(`Current version: ${currentVersion}`);
    
    const newEntry = createChangelogEntry(commits, currentVersion);
    
    if (!newEntry) {
        console.log('No entry to add');
        return;
    }
    
    // Inserisci la nuova entry all'inizio dell'array
    const updatedContent = content.replace(
        /const changelog: ChangelogEntry\[\] = \[/,
        `const changelog: ChangelogEntry[] = [\n${newEntry},`
    );
    
    // Scrivi il file aggiornato
    const changelogPath = path.join(process.cwd(), 'app', 'changelog', 'page.tsx');
    fs.writeFileSync(changelogPath, updatedContent, 'utf-8');
    
    console.log(`✅ Changelog updated with new version ${newEntry.match(/version: '([^']+)'/)[1]}`);
}

// Esegui
try {
    updateChangelog();
} catch (error) {
    console.error('Error updating changelog:', error);
    process.exit(1);
}
