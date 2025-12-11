# ============================================
# AURA AGI - ONE-CLICK LAUNCHER (PowerShell)
# ============================================

Write-Host "🧠 ═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    AURA AGI - LAUNCHING FULL STACK     " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env from env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Add your OpenRouter API key to .env" -ForegroundColor Red
    Write-Host "   Edit .env and set: OPENROUTER_API_KEY=your_key_here" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Press Enter to continue (or Ctrl+C to exit and configure)"
}

Write-Host "📦 Checking Docker..." -ForegroundColor Cyan
try {
    docker --version | Out-Null
    Write-Host "✅ Docker found!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Launching Aura AGI..." -ForegroundColor Cyan
Write-Host "   - Database: SurrealDB on port 8000" -ForegroundColor White
Write-Host "   - Backend: FastAPI on port 8080" -ForegroundColor White
Write-Host "   - Frontend: Next.js on port 3000" -ForegroundColor White
Write-Host ""

# Launch with docker-compose
docker-compose -f docker-compose.unified.yml up --build

Write-Host ""
Write-Host "👋 Aura AGI stopped." -ForegroundColor Yellow
Write-Host ""
Write-Host "To restart: .\launch-aura.ps1" -ForegroundColor Cyan

