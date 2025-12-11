# Aura Backend - AGI Companion Core

**Version 0.3.0** - The Genesis Build

## Overview

Aura is a local-first AGI companion with physics-based emotional intelligence, adaptive learning, and autonomous agency. This backend implements the cognitive architecture described in the PRD and FRDs.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           Meta-Cognitive Orchestrator                │
│     (Attention, Conflict Resolution, Coherence)      │
└────────────┬────────────────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
│  EMOTION  │ │ LEARNING │ │   GOAL   │
│  ENGINE   │ │  ENGINE  │ │  ENGINE  │
└───────────┘ └──────────┘ └──────────┘
      │             │             │
      └─────────────┴─────────────┘
                    │
              ┌─────┴─────┐
              │ SurrealDB │
              └───────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.12+
- OpenRouter API Key

### Setup

1. Clone and navigate:
```bash
cd Aura-Core/aura-app
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

3. Start services:
```bash
docker-compose up --build
```

4. Initialize database schema:
```bash
docker-compose exec api python -m aura.scripts.init_db
```

5. Access API:
- API: http://localhost:8080
- Docs: http://localhost:8080/docs
- SurrealDB: http://localhost:8000

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
uvicorn aura.main:app --reload
```

### Testing

```bash
pytest tests/
pytest tests/ --cov=aura --cov-report=html
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

## API Endpoints

### Health
- `GET /health` - Service health check

### Emotion
- `GET /emotion/current` - Get current emotional state
- `POST /emotion/influence` - Apply emotional influence
- `GET /emotion/history` - Emotional timeline

### Learning
- `POST /learning/experience` - Log interaction experience
- `GET /learning/rules` - Retrieve learned rules
- `GET /learning/skills` - Query skill tree

### Chat
- `POST /chat/message` - Send message (orchestrated response)
- `WS /chat/stream` - WebSocket streaming

## Project Structure

```
aura-app/
├── src/aura/           # Core application
│   ├── engines/        # Cognitive engines
│   ├── orchestrator/   # Meta-cognitive coordinator
│   ├── llm/           # LLM layer abstraction
│   ├── api/           # FastAPI routes
│   ├── models/        # Pydantic models
│   └── db/            # Database client
├── tests/             # Test suite
├── scripts/           # Utility scripts
└── docker-compose.yml # Infrastructure
```

## License

MIT License - See LICENSE file

## Documentation

See `/docs` for detailed architecture and FRDs:
- `PRD.md` - Product Requirements
- `Emotion_engine_Translation_layer_FRD.md` - Emotion system
- `Learning_engine_FRD.md` - Learning architecture
- `Cognitive_architecture_PRD.md` - Orchestration design

