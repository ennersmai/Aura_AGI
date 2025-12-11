#!/bin/bash
# ============================================
# AURA AGI - ONE-CLICK LAUNCHER (Bash)
# ============================================

echo "🧠 ═══════════════════════════════════════"
echo "    AURA AGI - LAUNCHING FULL STACK     "
echo "═══════════════════════════════════════"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo ""
    echo "Creating .env from env.example..."
    cp env.example .env
    echo "✅ .env created!"
    echo ""
    echo "⚠️  IMPORTANT: Add your OpenRouter API key to .env"
    echo "   Edit .env and set: OPENROUTER_API_KEY=your_key_here"
    echo ""
    read -p "Press Enter to continue (or Ctrl+C to exit and configure)"
fi

echo "📦 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker found!"
else
    echo "❌ Docker not found! Please install Docker."
    exit 1
fi

echo ""
echo "🚀 Launching Aura AGI..."
echo "   - Database: SurrealDB on port 8000"
echo "   - Backend: FastAPI on port 8080"
echo "   - Frontend: Next.js on port 3000"
echo ""

# Launch with docker-compose
docker-compose -f docker-compose.unified.yml up --build

echo ""
echo "👋 Aura AGI stopped."
echo ""
echo "To restart: ./launch-aura.sh"

