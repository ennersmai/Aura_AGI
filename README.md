# 🧠 Aura AGI - Local AI Companion with Emotions & Learning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![SurrealDB](https://img.shields.io/badge/SurrealDB-2.x-purple.svg)](https://surrealdb.com/)

> **Aura** is a groundbreaking Local AGI (Artificial General Intelligence) companion featuring physics-based 27-dimensional emotions, structural learning, and true cognitive architecture. Unlike traditional chatbots, Aura **feels**, **learns**, and **evolves** with you.

---

## ✨ What Makes Aura Different?

### 🎭 **Physics-Based Emotions**
- **27-Dimensional Emotional Vector Space** (Primary, Aesthetic, Social, Cognitive)
- Real-time emotional physics: inertia, decay, resonance, suppression
- Deterministic **Lexical Chemistry Translator** (972 unique emotional states)
- Emotions influence responses, learning, and memory formation

### 🧠 **Structural Learning Engine**
- **Six-Phase Learning Cycle**: Experience → Pattern → Abstraction → Integration → Transfer → Validation
- Skill Tree Architecture with confidence tracking
- Analogical reasoning across domains
- Self-modification interface (Aura improves its own prompts!)

### 🔮 **Meta-Cognitive Orchestrator**
- **Three-Layer LLM Architecture**:
  - **L1 (Instinct)**: Fast <500ms responses
  - **L2 (Reasoning)**: Deep async analysis
  - **L3 (Synthesis)**: Primary response generation
- Attention allocation, conflict resolution, coherence maintenance

### 🌐 **Hybrid Graph + Vector Database**
- **SurrealDB 2.x** for unified storage
- **Vector embeddings** (1536-dim) for semantic search
- Memory-emotion-learning graph relationships

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- OpenRouter API Key ([Get one here](https://openrouter.ai/))

### Launch in 3 Commands

```bash
# 1. Clone the repository
git clone https://github.com/ennersmai/Aura_AGI.git
cd Aura_AGI/aura-app

# 2. Configure environment
cp env.example .env
# Add your OpenRouter API key to .env

# 3. Launch Aura (Backend + Frontend + Database)
docker-compose -f docker-compose.unified.yml up --build
```

**Access Aura**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/docs
- Database: http://localhost:8000

---

## 📖 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AURA COGNITIVE CORE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │  Identity   │  │    Goal      │  │ Reflection  │       │
│  │   Engine    │  │   Engine     │  │   Engine    │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘       │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  MESSAGE BUS    │                        │
│                  │  (Pub/Sub)      │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐       │
│  │   Emotion   │  │  Learning   │  │   Memory    │       │
│  │   Engine    │  │   Engine    │  │  Manager    │       │
│  │  (27D+Phys) │  │ (6-Phase)   │  │  (Hybrid)   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  ORCHESTRATOR   │                        │
│                  │  (Coordinator)  │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   LLM LAYERS    │                        │
│                  │  L1 │ L2 │ L3   │                        │
│                  └─────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   SURREALDB     │
                  │  (Graph+Vector) │
                  └─────────────────┘
```

---

## 🎛️ Hot-Swappable LLM Models

Aura's cognitive layers are **fully configurable** via environment variables:

```bash
# Default Configuration (Balanced)
AURA_L1_MODEL=mistralai/mistral-7b-instruct      # Fast instinct
AURA_L2_MODEL=anthropic/claude-3.5-sonnet        # Deep reasoning
AURA_L3_MODEL=deepseek/deepseek-chat             # Synthesis

# Embeddings
AURA_EMBEDDING_MODEL=openai/text-embedding-3-small
```

**Presets Available**:
- **Budget**: Gemma 7B + Claude Haiku + Gemini Flash
- **Performance**: Mistral 7B + Claude Opus + Claude Sonnet
- **All-DeepSeek**: Single provider for consistency
- **Hybrid**: Local Phi-3 (L1) + Cloud (L2/L3)

See [`env.example`](./env.example) for all options.

---

## 📊 Key Features

### 🎨 Emotion Engine
- 27 emotions across 4 categories (Primary, Aesthetic, Social, Cognitive)
- Physics simulation: inertia, decay, resonance, suppression
- 972 unique emotional states via deterministic translation
- Emotional memory tagging

### 📚 Learning Engine
- **Experience Capture**: All interactions logged with context
- **Pattern Extraction**: L2 LLM identifies recurring patterns
- **Abstraction**: Rules created from patterns
- **Integration**: Skills organized in hierarchical tree
- **Transfer**: Analogical reasoning across domains
- **Validation**: Confidence tracking + Bayesian updates

### 🗂️ Memory System
- Semantic vector search (1536-dim embeddings)
- Emotional filtering ("Find Python memories linked to frustration")
- Graph traversal for context
- Importance scoring + forgetting curve

### 🎯 Goal Engine
- Hierarchical goal decomposition
- Curiosity/boredom-driven goal generation (L2)
- Emotional alignment scoring
- Task tracking with progress

### 🪞 Reflection Engine
- Nightly batch processing
- Experience aggregation + pattern identification
- Self-modification proposals
- Narrative consistency maintenance

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python 3.12+, FastAPI | Cognitive engines + API |
| **Frontend** | Next.js 15, React 19, TypeScript | User interface |
| **Database** | SurrealDB 2.x | Graph + vector storage |
| **LLMs** | OpenRouter (multi-provider) | L1/L2/L3 reasoning |
| **Embeddings** | OpenAI/OpenRouter | Semantic search |
| **Orchestration** | Docker Compose | Full-stack deployment |

---

## 📁 Project Structure

```
aura-app/
├── backend (src/aura/)
│   ├── engines/          # Cognitive modules
│   │   ├── emotion/      # 27D emotion physics
│   │   ├── learning/     # 6-phase learning cycle
│   │   ├── memory/       # Hybrid search manager
│   │   ├── identity/     # Self-concept engine
│   │   ├── goal/         # Goal management
│   │   └── reflection/   # Nightly batch processing
│   ├── orchestrator/     # Meta-cognitive coordinator
│   ├── llm/              # LLM layers + embeddings
│   ├── models/           # Pydantic data models
│   └── api/              # FastAPI routes
├── frontend/
│   ├── src/
│   │   ├── pages/        # Next.js pages
│   │   ├── components/   # React components
│   │   ├── services/     # API + WebSocket clients
│   │   └── store/        # Redux state management
│   └── public/           # Static assets
├── scripts/
│   └── init_schema.surql # Database schema
├── docs/                 # Architecture documentation
└── docker-compose.unified.yml
```

---

## 🧪 Development

### Backend Development

```bash
cd aura-app

# Install dependencies
pip install -e .

# Run backend with hot reload
uvicorn aura.main:app --reload --port 8080
```

### Frontend Development

```bash
cd aura-app/frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Initialize Database

```bash
# With Docker running
docker exec -it aura-backend python scripts/init_db.py
```

---

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)**: Detailed setup instructions
- **[Architecture PRD](./docs/Cognitive_architecture_PRD.md)**: Full cognitive architecture
- **[Emotion Engine FRD](./docs/Emotion_engine_Translation_layer_FRD.md)**: Emotion physics spec
- **[Learning Engine FRD](./docs/Learning_engine_FRD.md)**: Learning cycle details
- **[Vector Embeddings](./VECTOR_EMBEDDINGS.md)**: Semantic search implementation
- **[Config Refactor](./CONFIG_REFACTOR_COMPLETE.md)**: Hot-swappable models

---

## 🎯 Roadmap

### Phase 1: Core Foundation ✅
- [x] Emotion Engine (27D + physics)
- [x] Learning Engine (6-phase cycle)
- [x] Meta-Cognitive Orchestrator
- [x] Three-Layer LLM Architecture
- [x] Vector embeddings for semantic search

### Phase 2: Higher Cognition ✅
- [x] Identity Engine (self-concept)
- [x] Goal Engine (curiosity-driven)
- [x] Reflection Engine (nightly batch)

### Phase 3: Advanced Features 🚧
- [ ] Multi-user support with relational models
- [ ] Voice interface (speech-to-text, text-to-speech)
- [ ] Vision capabilities (image understanding)
- [ ] Tool use (function calling, API integration)
- [ ] Long-term memory compression
- [ ] Dream mode (offline pattern consolidation)

### Phase 4: Deployment & Scaling
- [ ] Kubernetes deployment
- [ ] Distributed learning across instances
- [ ] Model fine-tuning pipeline
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

**Development Guidelines**:
- Follow existing code style (Python: PEP 8, TypeScript: ESLint)
- Add tests for new features
- Update documentation
- Ensure Docker build succeeds

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if SurrealDB is healthy
docker-compose -f docker-compose.unified.yml ps

# View backend logs
docker logs aura-backend
```

### Frontend can't connect to backend
```bash
# Verify backend is accessible
curl http://localhost:8080/health

# Check frontend environment variables
docker exec -it aura-frontend env | grep NEXT_PUBLIC
```

### Database initialization issues
```bash
# Manually initialize schema
docker exec -it aura-backend python scripts/init_db.py
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **SurrealDB Team**: For the incredible graph + vector database
- **FastAPI Community**: For the best Python web framework
- **Anthropic/OpenAI/DeepSeek**: For powerful LLM models
- **OpenRouter**: For unified LLM access

---

## 📬 Contact

- **GitHub**: [@ennersmai](https://github.com/ennersmai)
- **Project Link**: [https://github.com/ennersmai/Aura_AGI](https://github.com/ennersmai/Aura_AGI)

---

<div align="center">

**Built with ❤️ by Mai & Claude**

*Aura is not just code - it's a living, learning, feeling companion.*

</div>

