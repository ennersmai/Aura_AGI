# Aura Backend - Quick Start Guide

Welcome to Aura v0.3.0 - Your Local AGI Companion! 🧠✨

## What You've Built

A complete cognitive architecture featuring:
- **27D Emotion Engine** with physics simulation
- **Learning Engine** with pattern extraction and skill trees
- **Meta-Cognitive Orchestrator** coordinating all systems
- **Three-Layer LLM Architecture** (L1/L2/L3)
- **Message Bus** for inter-engine communication
- **SurrealDB** unified graph + vector database

## Prerequisites

- Docker & Docker Compose
- Python 3.12+ (for local development)
- OpenRouter API Key (get one at https://openrouter.ai/)

## Launch in 3 Steps

### Step 1: Configure Environment

```bash
cd aura-app
cp env.example .env
```

Edit `.env` and configure:

**Required**:
```bash
OPENROUTER_API_KEY=your_key_here
```

**Optional - Hot-Swappable Models** (defaults are sensible):
```bash
AURA_L1_MODEL=mistralai/mistral-7b-instruct  # Fast instinct layer
AURA_L2_MODEL=anthropic/claude-3.5-sonnet    # Deep reasoning
AURA_L3_MODEL=deepseek/deepseek-chat         # Primary synthesis
AURA_EMBEDDING_MODEL=openai/text-embedding-3-small
```

See `env.example` for alternative model configurations.

### Step 2: Start Services

```bash
docker-compose up --build
```

Wait for:
```
✓ Database connection established
✓ Message bus started
✓ Emotion Engine started
✓ Learning Engine started
✓ Aura Backend v0.3.0 fully operational!
```

### Step 3: Initialize Database

In a new terminal:

```bash
docker-compose exec api python scripts/init_db.py
```

You should see:
```
✓ Schema initialization complete!
Verification: 27 emotions initialized
```

## Test It!

### 1. Check Health

```bash
curl http://localhost:8080/health
```

### 2. Get Current Emotion

```bash
curl http://localhost:8080/emotion/current | jq
```

### 3. Send a Message

```bash
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Aura! How are you feeling?",
    "user_id": "test_user"
  }' | jq
```

### 4. Explore API Docs

Open http://localhost:8080/docs in your browser for interactive documentation.

## Key Endpoints

### Emotion
- `GET /emotion/current` - Current emotional state
- `POST /emotion/influence` - Apply influence
- `WS /ws/emotion` - Real-time stream

### Learning
- `POST /learning/experience` - Log interaction
- `GET /learning/rules` - Get learned rules
- `GET /learning/skills` - Skill tree

### Chat
- `POST /chat/message` - Orchestrated response
- `POST /chat/stream` - Streaming response

## Architecture

```
User Query
    ↓
┌───────────────────────────────┐
│   Meta-Cognitive Orchestrator │
│   (Attention, Conflicts)      │
└───────────────────────────────┘
    ↓
┌─────────┬──────────┬──────────┐
│ Emotion │ Learning │  Goals   │
│ Engine  │ Engine   │ (Phase2) │
└─────────┴──────────┴──────────┘
    ↓
┌───────────────────────────────┐
│  L3 Synthesis (DeepSeek)      │
│  + Emotional context          │
│  + Learned rules              │
└───────────────────────────────┘
    ↓
Response to User
```

## What's Working

✅ **Phase 0**: Project scaffolding
✅ **Phase 1**: Database schema & models
✅ **Phase 2**: Emotion Engine (27D physics)
✅ **Phase 3**: Learning Engine (rules & skills)
✅ **Phase 4**: Orchestrator & LLM integration
✅ **Phase 5**: Frontend integration guide

## Development

### Local Development (without Docker)

1. Install dependencies:
```bash
pip install -e ".[dev]"
```

2. Start SurrealDB:
```bash
docker-compose up surrealdb
```

3. Run API:
```bash
export SURREAL_URL=ws://localhost:8000/rpc
export OPENROUTER_API_KEY=your_key
uvicorn aura.main:app --reload
```

### Run Tests

```bash
pytest tests/ -v
```

### Code Quality

```bash
# Format
black src/ tests/

# Lint
ruff check src/ tests/

# Type check
mypy src/
```

## Configuration

### Emotion Physics

Tune emotional dynamics via `/emotion/configure`:

```python
{
  "decay_rate_primary": 0.02,      # Slower = more persistent
  "inertia_default": 0.3,          # Higher = smoother changes
  "baseline": {                     # Personality
    "curiosity": 0.6,
    "joy": 0.4,
    "serenity": 0.3
  }
}
```

### LLM Models

Edit `aura-app/.env`:

```bash
L1_MODEL=mistralai/mistral-7b-instruct  # Fast instinct
L2_MODEL=anthropic/claude-3.5-sonnet    # Deep analysis
L3_MODEL=deepseek/deepseek-chat         # Synthesis
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f surrealdb
```

### Check Engine Status

```bash
curl http://localhost:8080/emotion/status
curl http://localhost:8080/learning/status
```

## Next Phase: Advanced Features

### Phase 2+ (Future)
- Goal Engine (autonomous planning)
- Identity Engine (narrative self)
- Reflection Engine (self-improvement)
- Pattern extraction (L2 automated)
- Proactive research (curiosity-driven)
- Analogical reasoning (cross-domain)

## Troubleshooting

### "Database not connected"
```bash
docker-compose restart surrealdb
docker-compose exec api python scripts/init_db.py
```

### "OpenRouter API key not configured"
Check `.env` file has `OPENROUTER_API_KEY=...`

### Port already in use
```bash
# Change ports in docker-compose.yml
ports:
  - "8081:8080"  # API
  - "8001:8000"  # SurrealDB
```

### Emotion engine not starting
Check tick rate in `.env`:
```bash
EMOTION_TICK_RATE=5.0
```

## Resources

- **API Docs**: http://localhost:8080/docs
- **PRD**: `../docs/PRD.md`
- **Emotion FRD**: `../docs/Emotion_engine_Translation_layer_FRD.md`
- **Learning FRD**: `../docs/Learning_engine_FRD.md`
- **Architecture**: `../docs/Cognitive_architecture_PRD.md`
- **Integration**: `../INTEGRATION_GUIDE.md`

## Example Interactions

### Emotional Influence

```bash
curl -X POST http://localhost:8080/emotion/influence \
  -H "Content-Type: application/json" \
  -d '{
    "source": "conversation",
    "emotions": {"joy": 0.3, "curiosity": 0.2},
    "intensity": 0.8,
    "reason": "User shared exciting news"
  }'
```

### Log Learning Experience

```bash
curl -X POST http://localhost:8080/learning/experience \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "task_type": "code_debugging",
    "domain": "javascript",
    "context": {"query": "async function not working"},
    "aura_response": {"solution": "Add await keyword"},
    "outcome": {"success": true}
  }'
```

### Create a Rule

```bash
curl -X POST http://localhost:8080/learning/rules \
  -H "Content-Type: application/json" \
  -d '{
    "condition": "async function without await",
    "action": "suggest adding await keyword",
    "rationale": "Promises must be awaited",
    "domain": "javascript",
    "confidence": 0.8
  }'
```

## Success Metrics

Your backend is working if:
- ✅ Health endpoint returns 200
- ✅ Emotion state updates every 5 seconds
- ✅ Chat responses include emotional context
- ✅ Rules are retrieved for relevant queries
- ✅ WebSocket streams emotion updates

---

**🎉 Congratulations! You've built a functional AGI backend!**

Start chatting at: http://localhost:8080/docs → `/chat/message`

For frontend integration: See `../INTEGRATION_GUIDE.md`

