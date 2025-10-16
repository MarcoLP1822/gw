#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * 
 * Verifica che tutti i requisiti per il deployment siano soddisfatti
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment requirements...\n');

let errors = [];
let warnings = [];

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  errors.push(`Node.js version ${nodeVersion} is too old. Required: 18+`);
} else {
  console.log('✅ Node.js version:', nodeVersion);
}

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  console.log('✅ package.json exists');
  
  // Check postinstall script
  if (packageJson.scripts?.postinstall?.includes('prisma generate')) {
    console.log('✅ postinstall script configured');
  } else {
    warnings.push('Missing "postinstall": "prisma generate" script in package.json');
  }
  
  // Check essential dependencies
  const requiredDeps = ['next', '@prisma/client', 'openai', 'react'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep]) {
      console.log(`✅ ${dep} installed`);
    } else {
      errors.push(`Missing required dependency: ${dep}`);
    }
  });
} catch (error) {
  errors.push('Cannot read package.json: ' + error.message);
}

// Check Prisma schema
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Prisma schema exists');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('env("DATABASE_URL")')) {
    console.log('✅ DATABASE_URL configured in schema');
  }
  if (schemaContent.includes('env("DIRECT_URL")')) {
    console.log('✅ DIRECT_URL configured in schema');
  }
} else {
  errors.push('Prisma schema not found');
}

// Check vercel.json
const vercelJsonPath = path.join(__dirname, '../vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  console.log('✅ vercel.json exists');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    if (vercelConfig.buildCommand) {
      console.log('✅ Build command configured:', vercelConfig.buildCommand);
    }
  } catch (error) {
    warnings.push('vercel.json is not valid JSON');
  }
} else {
  warnings.push('vercel.json not found (optional but recommended)');
}

// Check .env.example
const envExamplePath = path.join(__dirname, '../.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists');
} else {
  warnings.push('.env.example not found');
}

// Check gitignore
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env')) {
    console.log('✅ .env files ignored in git');
  } else {
    errors.push('.env files not ignored in .gitignore - SECURITY RISK!');
  }
  if (gitignoreContent.includes('node_modules')) {
    console.log('✅ node_modules ignored in git');
  }
} else {
  errors.push('.gitignore not found');
}

// Check essential Next.js files
const essentialFiles = [
  'next.config.mjs',
  'tsconfig.json',
  'app/layout.tsx',
  'app/page.tsx'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    errors.push(`Missing essential file: ${file}`);
  }
});

// Check if migrations exist
const migrationsDir = path.join(__dirname, '../prisma/migrations');
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f !== 'migration_lock.toml');
  if (migrations.length > 0) {
    console.log(`✅ ${migrations.length} database migration(s) found`);
  } else {
    warnings.push('No database migrations found');
  }
} else {
  warnings.push('Migrations directory not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed! Ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Go to https://vercel.com/new');
  console.log('3. Import your repository');
  console.log('4. Add environment variables');
  console.log('5. Deploy!\n');
  process.exit(0);
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log('   - ' + warning));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS (must fix before deployment):');
  errors.forEach(error => console.log('   - ' + error));
  console.log('\nFix these errors and run this script again.\n');
  process.exit(1);
}

if (warnings.length > 0 && errors.length === 0) {
  console.log('\n⚠️  You can deploy, but consider fixing warnings.\n');
  process.exit(0);
}
