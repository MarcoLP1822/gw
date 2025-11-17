# Script di Update Dipendenze
# Aggiorna le dipendenze outdated in modo sicuro

Write-Host "🔄 Aggiornamento Dipendenze Ghost Writing App" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Backup package.json
Write-Host "📦 Backup package.json..." -ForegroundColor Yellow
Copy-Item package.json package.json.backup
Write-Host "✅ Backup creato: package.json.backup" -ForegroundColor Green
Write-Host ""

# Aggiorna dipendenze principali
Write-Host "📥 Aggiornamento dipendenze principali..." -ForegroundColor Yellow
Write-Host ""

$updates = @(
    @{name="openai"; version="^6.9.0"; type="prod"},
    @{name="prisma"; version="^6.19.0"; type="dev"},
    @{name="@prisma/client"; version="^6.19.0"; type="prod"},
    @{name="lucide-react"; version="^0.554.0"; type="prod"},
    @{name="@types/node"; version="^20.19.25"; type="dev"},
    @{name="autoprefixer"; version="^10.4.22"; type="dev"},
    @{name="msw"; version="^2.12.2"; type="dev"},
    @{name="unpdf"; version="^1.4.0"; type="prod"},
    @{name="vitest"; version="^4.0.10"; type="dev"}
)

foreach ($update in $updates) {
    $flag = if ($update.type -eq "dev") { "--save-dev" } else { "" }
    Write-Host "  → $($update.name)@$($update.version)" -ForegroundColor Cyan
    npm install "$($update.name)@$($update.version)" $flag --legacy-peer-deps
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Installato" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Errore nell'installazione" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "🔍 Verifico dipendenze..." -ForegroundColor Yellow
npm list --depth=0

Write-Host ""
Write-Host "🧪 Eseguo test di verifica..." -ForegroundColor Yellow
npm run build 2>&1 | Select-Object -First 20

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful! Dipendenze aggiornate correttamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prossimi passi:" -ForegroundColor Cyan
    Write-Host "  1. Testa l'applicazione: npm run dev" -ForegroundColor White
    Write-Host "  2. Esegui i test: npm test" -ForegroundColor White
    Write-Host "  3. Se tutto OK, elimina backup: Remove-Item package.json.backup" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Build fallita. Ripristino backup..." -ForegroundColor Red
    Copy-Item package.json.backup package.json -Force
    npm install
    Write-Host "✅ Backup ripristinato" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Le dipendenze non sono state aggiornate. Controlla i log sopra." -ForegroundColor Yellow
}
