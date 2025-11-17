# Quick Health Check per Ghost Writing App
# Verifica rapida dello stato dell'applicazione

Write-Host ""
Write-Host "🏥 Ghost Writing App - Health Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$checks = @()
$warnings = @()
$errors = @()

# 1. Check Node.js version
Write-Host "📦 Checking Node.js..." -NoNewline
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$Matches[1]
    if ($majorVersion -ge 18) {
        Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        $checks += "Node.js version OK"
    } else {
        Write-Host " ⚠️  $nodeVersion (recommended: 18+)" -ForegroundColor Yellow
        $warnings += "Node.js version below recommended"
    }
}

# 2. Check if .env exists
Write-Host "🔐 Checking .env file..." -NoNewline
if (Test-Path .env) {
    Write-Host " ✅ Found" -ForegroundColor Green
    $checks += ".env file exists"
    
    # Check required variables
    $envContent = Get-Content .env -Raw
    $requiredVars = @("DATABASE_URL", "DIRECT_URL", "OPENAI_API_KEY")
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            Write-Host "  ⚠️  Missing: $var" -ForegroundColor Yellow
            $warnings += "Missing env variable: $var"
        }
    }
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += ".env file missing"
    Write-Host "  💡 Run: Copy-Item .env.example .env" -ForegroundColor Yellow
}

# 3. Check node_modules
Write-Host "📚 Checking dependencies..." -NoNewline
if (Test-Path node_modules) {
    Write-Host " ✅ Installed" -ForegroundColor Green
    $checks += "Dependencies installed"
} else {
    Write-Host " ❌ Not found" -ForegroundColor Red
    $errors += "Dependencies not installed"
    Write-Host "  💡 Run: npm install" -ForegroundColor Yellow
}

# 4. Check Prisma client
Write-Host "🗄️  Checking Prisma..." -NoNewline
if (Test-Path node_modules\.prisma\client) {
    Write-Host " ✅ Generated" -ForegroundColor Green
    $checks += "Prisma client generated"
} else {
    Write-Host " ⚠️  Not generated" -ForegroundColor Yellow
    $warnings += "Prisma client needs generation"
    Write-Host "  💡 Run: npx prisma generate" -ForegroundColor Yellow
}

# 5. Check for TypeScript errors
Write-Host "🔍 Checking TypeScript..." -NoNewline
$tscOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ No errors" -ForegroundColor Green
    $checks += "TypeScript check passed"
} else {
    Write-Host " ❌ Errors found" -ForegroundColor Red
    $errors += "TypeScript compilation errors"
    Write-Host $tscOutput | Select-Object -First 10
}

# 6. Check build
Write-Host "🏗️  Testing build..." -NoNewline
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ Success" -ForegroundColor Green
    $checks += "Build successful"
} else {
    Write-Host " ❌ Failed" -ForegroundColor Red
    $errors += "Build failed"
}

# 7. Check outdated packages
Write-Host "📦 Checking for updates..." -NoNewline
$outdated = npm outdated 2>&1 | Measure-Object -Line
if ($outdated.Lines -gt 0) {
    Write-Host " ⚠️  $($outdated.Lines) packages outdated" -ForegroundColor Yellow
    $warnings += "Outdated packages found"
    Write-Host "  💡 Run: .\scripts\update-dependencies.ps1" -ForegroundColor Yellow
} else {
    Write-Host " ✅ All up to date" -ForegroundColor Green
    $checks += "All packages up to date"
}

# Summary
Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ Passed: $($checks.Count)" -ForegroundColor Green
Write-Host "⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Errors: $($errors.Count)" -ForegroundColor Red

Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! App is healthy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to start:" -ForegroundColor Cyan
    Write-Host "  npm run dev   - Start development server" -ForegroundColor White
    Write-Host "  npm run build - Build for production" -ForegroundColor White
    Write-Host "  npm test      - Run tests" -ForegroundColor White
} elseif ($errors.Count -eq 0) {
    Write-Host "⚠️  App is functional but has warnings." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} else {
    Write-Host "❌ App has critical errors that need fixing." -ForegroundColor Red
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
}

Write-Host ""
