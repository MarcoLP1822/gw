# Script per sostituire console.log/error/warn con logger strutturato
# Esegue sostituzioni batch nei file API routes

Write-Host "🔧 Sostituendo console.log con logger strutturato..." -ForegroundColor Cyan

$replacements = 0
$errors = 0

# Funzione per aggiungere import logger se non presente
function Add-LoggerImport {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    
    if ($content -match "import.*logger.*from.*@/lib/logger") {
        return $false # Import già presente
    }
    
    # Trova la prima import line e aggiungi dopo
    if ($content -match "(?m)^(import .+ from .+;)") {
        $firstImport = $matches[1]
        $newContent = $content -replace [regex]::Escape($firstImport), "$firstImport`nimport { logger } from '@/lib/logger';"
        Set-Content $FilePath -Value $newContent -NoNewline
        return $true
    }
    
    return $false
}

# Trova tutti i file API route con console.log
$apiFiles = Get-ChildItem -Path "app\api" -Recurse -Filter "*.ts" | 
    Where-Object { (Get-Content $_.FullName -Raw) -match "console\.(log|error|warn)" }

Write-Host "📁 Trovati $($apiFiles.Count) file con console.log" -ForegroundColor Yellow

foreach ($file in $apiFiles) {
    Write-Host "`n📄 Processando: $($file.Name)" -ForegroundColor White
    
    try {
        # Aggiungi import
        $importAdded = Add-LoggerImport -FilePath $file.FullName
        if ($importAdded) {
            Write-Host "  ✅ Import logger aggiunto" -ForegroundColor Green
        }
        
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Sostituzioni
        # console.log('text', data) -> logger.info('text', data)
        $content = $content -replace "console\.log\s*\(\s*[`']([^`']+)[`']\s*,\s*([^)]+)\)", "logger.info('`$1', `$2)"
        
        # console.log('text') -> logger.info('text')
        $content = $content -replace "console\.log\s*\(\s*[`']([^`']+)[`']\s*\)", "logger.info('`$1')"
        
        # console.log(variable) -> logger.debug('Variable', variable)
        $content = $content -replace "console\.log\s*\(([^)]+)\)", "logger.debug('Debug info', `$1)"
        
        # console.error('text:', error) -> logger.error('text', error)
        $content = $content -replace "console\.error\s*\(\s*[`']([^`':]+):?[`']\s*,\s*([^)]+)\)", "logger.error('`$1', `$2)"
        
        # console.error('text') -> logger.error('text')
        $content = $content -replace "console\.error\s*\(\s*[`']([^`']+)[`']\s*\)", "logger.error('`$1')"
        
        # console.warn('text', data) -> logger.warn('text', data)
        $content = $content -replace "console\.warn\s*\(\s*[`']([^`']+)[`']\s*,\s*([^)]+)\)", "logger.warn('`$1', `$2)"
        
        # console.warn('text') -> logger.warn('text')
        $content = $content -replace "console\.warn\s*\(\s*[`']([^`']+)[`']\s*\)", "logger.warn('`$1')"
        
        if ($content -ne $originalContent) {
            Set-Content $file.FullName -Value $content -NoNewline
            $replacements++
            Write-Host "  ✅ Sostituzioni completate" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Nessuna sostituzione necessaria" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ Errore: $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n" -NoNewline
Write-Host "✅ Completato!" -ForegroundColor Green
Write-Host "📊 File modificati: $replacements" -ForegroundColor Cyan
Write-Host "❌ Errori: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })

if ($errors -eq 0) {
    Write-Host "`n🎉 Tutti i console.log sono stati sostituiti con logger strutturato!" -ForegroundColor Green
    Write-Host "💡 Ricorda di testare l'applicazione per verificare che tutto funzioni correttamente." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Alcuni file hanno avuto errori. Controlla i messaggi sopra." -ForegroundColor Yellow
}
