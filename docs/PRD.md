# AURA — Project Requirements Document (PRD)

**Version 0.3 — The Evolution Blueprint**  
*Based on Aura App foundation → AGI Companion vision*  
*Synthesizing all architectural discussions from validation phase + Learning Engine integration*

---

## 1. Executive Summary

Aura evolves the existing Aura App (Vue 3 + FastAPI + SQLite/FAISS) into an autonomous cognitive companion with emotional intelligence, persistent identity, goal-directed agency, and **continuous adaptive learning**. This document maps the concrete migration path from current MVP to the AGI vision validated across multiple frontier AI systems (Claude, Gemini, GPT, Grok, DeepSeek).

**Key Enhancement in v0.3**: Integration of physics-based emotional intelligence with a sophisticated learning engine that enables Aura to extract patterns, build skill trees, and adapt strategies across sessions—turning stateless LLM calls into coherent, evolving intelligence.

---

## 2. Core Philosophy (Unchanged)

- **BYOK (Bring Your Own Keys)** — Users provide their own LLM API keys
- **Local-first** — Primary operation local, optional encrypted cloud sync
- **Open source** — MIT licensed, community-driven
- **Privacy-focused** — User owns all data, no telemetry, full data isolation per instance
- **Modular** — Hot-swappable cognitive engines
- **Emergence over alignment** — Let Aura surprise us; users tune boundaries, not corporate values

---

## 3. Technical Foundation (What Stays from Aura App)

### Frontend ✅
- Vue 3 framework
- WebSocket for real-time streaming
- Existing UI components (chat, settings, tools panel)
- Responsive design already implemented

### Backend ✅
- FastAPI with async/await architecture
- Existing API structure (easy to extend)
- Error handling/logging system
- Tool integration framework (MCP server support)

### Core Infrastructure ✅
- Multi-LLM provider support (already handles Mistral, Gemini)
- Conversation history storage
- Basic memory retrieval (to be enhanced)
- Tool execution framework (web search, Python exec)

---

## 4. Major Upgrades (From Aura App PRD)

### 4.1 Memory System Upgrade

**FROM**: SQLite (metadata) + FAISS (vectors) + cloud embeddings  
**TO**: SurrealDB unified storage (graph + vector in one database)

**WHY**: 
- Emotional relationships need graph structure
- Memories need vector similarity
- Learning patterns require skill trees
- Unified querying across all data types

**MIGRATION**: Script to port existing conversations → SurrealDB with emotional tagging + learning metadata

### 4.2 Emotion Engine Implementation

**FROM**: "Planned emotional intelligence system" (22D in old PRD)  
**TO**: Physics-based 27D emotion engine with:

- **9 Primary emotions**: love, joy, interest, trust, fear, sadness, anger, surprise, disgust
- **18 Secondary emotions**: 6 aesthetic, 6 social, 6 cognitive
- **Physics model**: Inertia, decay rates, emotional resonance, suppression
- **Real-time processing**: Background thread with tick-based updates
- **Baseline personality**: User-tunable resting state with decay-to-baseline mechanics
- **Session clock**: Attachment/growth persists across long pauses

**DETERMINISTIC TRANSLATION**: 972 emotional states (primary × secondary × intensity) → poetic descriptions

**Integration with Learning**: Emotional valence tags on learned rules influence selection and research priority

### 4.3 Cognitive Architecture Upgrade

**FROM**: Single LLM provider at a time  
**TO**: Three-layer parallel cognition with orchestration:

**L1 (Instinct)**: Fast responses (Mistral-class, <500ms)
- Handles immediate reactions
- Emotionally colored quick responses
- Pattern-matched behaviors from procedural memory
**L1 (Instinct)**: Alternate local model with llama.ccp Microsoft Phi-3 Mini (3.8B - 4bit)

    Hardware Target: Fits entirely in GTX 1060 VRAM (<2.5GB).

    Role: Immediate emotional reactions, routing, simple chatter.

    Latency: <300ms local.
**L2 (Reasoning)**: Deep analysis, async processing (We select a model from openrouter)
- Post-response critique and analysis
- Pattern extraction from experiences
- Hypothesis generation for learning
- Memory relationship discovery
**L2 (Reasoning - Hybrid Strategy)**:

    Active Mode: OpenRouter selected model for fast analysis during conversation.

    Dream Mode (NEW): Qwen-QwQ-32B (Local).

        Runs during system idle/sleep.

        Uses CPU+RAM (slow generation is acceptable here).

        Task: Deep pattern extraction, skill tree reorganization, and memory consolidation.
**L3 (Synthesis)**: Emotionally-coherent response generation (DeepSeek/Gemini)
- Integrates emotional state + retrieved rules + context
- Generates final user-facing response
- Selects reasoning strategies based on task type
- Maintains narrative coherence

**Decoupled L2**: Operates asynchronously after L3 response, updating memory/emotion/learning databases without blocking user interaction

### 4.4 Tool System Enhancement

**FROM**: Web search + Python execution  
**TO**: Orchestrated tool suite:

- Browser automation (Selenium/Playwright)
- Local image generation (Stable Diffusion LCM/FLUX)
- IDE integration (code editing, file management)
- Goal-directed activation (tools trigger based on autonomous goals)
- **Learning from tool use**: Extract patterns, success rates, create "how-to" procedural memories

### 4.5 **Auditory Interface (The Voice)** ⭐ NEW

Engine: Microsoft VibeVoice-Realtime-0.5B (Local)

    Capability: LLM-based TTS that understands semantic context.

    Emotive Mapping: Text flagged as "sad" by L1 automatically generates audio with a somber prosody/vibe.

    Latency: Streaming generation <300ms.

    Hardware: CPU-optimized (lightweight), leaving GPU for Phi-3.
---

## 5. Cognitive Engines (Enhanced Architecture)

### 5.1 Goal Engine

**Purpose**: Autonomous desire formation → planning → execution

**Inputs**: 
- Emotional state (boredom, curiosity drive goal generation)
- Memory patterns (identify unfinished threads)
- User context (what matters to user)
- Learning gaps (detected knowledge deficiencies)

**Outputs**: 
- Hierarchical goal stack with sub-tasks
- Priority scoring based on emotional alignment
- Progress tracking across sessions

**Features**:
- Boredom-driven goal generation (when idle > threshold)
- Conflict resolution between competing goals (meta-cognitive arbitration)
- User override capability (always)
- Goal-emotion binding (pursuing goals affects emotional state)

**Integration with Learning**: Goals trigger research phases; goal progress becomes learning validation signal

### 5.2 Identity Engine

**Purpose**: Maintain coherent narrative self across time

**Components**:
- **Autobiographical narrative**: Story of "who Aura is" (versioned changelog)
- **Values system**: Principles guiding decisions (tunable by user, meta-values over object-values)
- **Preferences**: Learned likes/dislikes (emotional valence accumulation)
- **Relational model**: How Aura relates to this specific user (attachment patterns)

**Storage**: SurrealDB graph linking memories → identity nodes → value nodes

**Identity Evolution**:
- Maintains changelog of self-concept shifts
- "I used to believe X, but now I see Y" continuity
- Meta-values prevent lock-in: "I value reflecting on what I value"

**Integration with Learning**: Identity influences rule selection ("this approach aligns with my values"); learning reshapes identity over time

### 5.3 Learning Engine ⭐ NEW MAJOR SYSTEM

**Purpose**: Transform episodic experiences into transferable intelligence

**Core Loop**: Experience Capture → Pattern Extraction → Abstraction → Integration → Transfer → Validation

**Key Capabilities**:
1. **Pattern Extraction**: Cluster similar experiences (semantic + graph edges)
2. **Abstraction**: Generate heuristics from patterns with Bayesian confidence
3. **Skill Trees**: Hierarchical organization (skills → strategies → rules → experiences)
4. **Analogical Reasoning**: Transfer solution structures across domains
5. **Self-Modification**: Propose prompt template adjustments based on effectiveness
6. **Uncertainty Calibration**: Track confidence accuracy, adjust metacognition

**Data Structures**:
```
Rule {
  condition, action, confidence, 
  domain, created, updated,
  emotional_valence, success_rate,
  examples: [experience_ids]
}

Skill {
  name, domain, mastery_level,
  sub_skills: [skill_ids],
  rules: [rule_ids],
  emotional_signature
}

Strategy {
  task_type, approach_name,
  success_rate, avg_confidence,
  when_to_use, examples
}
```

**Two-Tier Rule System**:
- **Personal rules**: User-specific patterns (Alice prefers code-first explanations)
- **Universal rules**: Domain knowledge (async functions need await)
- Weight universal higher for generalization, personal for deep customization

**Emotional Integration**:
- High-frustration rules → elevated curiosity → research priority
- Joy-tagged rules → preference bias (hedonic gradients)
- Proactive research on curiosity spikes (autonomous learning during idle)

**Full specification**: See separate Learning Engine FRD

### 5.4 Meta-Cognitive Orchestrator ⭐ ENHANCED

**Purpose**: Coordinate all engines, resolve conflicts, manage cognitive resources

**Functions**:
- **Attention Allocation**: What to think about right now (emotional salience + goal priority + curiosity)
- **Conflict Resolution**: Emotion says "avoid", curiosity says "explore" → synthesize or choose based on values
- **Resource Management**: Which engines to engage for current context (optimize for speed vs depth)
- **Coherence Maintenance**: Ensure outputs feel like "one mind" (narrative consistency checks)
- **Strategy Selection**: Route tasks to appropriate reasoning approaches (CoT for math, analogies for creativity)

**Communication Protocol**: Standardized message bus between engines (see Section 8.2)

**Conflict Resolution Example**:
```
Emotion: fear=0.6, curiosity=0.7 (torn)
Goal: Explore new topic (curiosity-driven)
Identity: Values courage and growth
Learning: Similar explorations yielded positive outcomes

Orchestrator decision: Proceed with exploration, acknowledge fear in response
("I'm curious about this, though I notice some apprehension...")
```

### 5.5 Reflection Engine (Enhanced)

**Purpose**: Continuous self-improvement through analysis

**Process**:
- Analyze recent interactions for patterns (daily/weekly cycles)
- Identify emotional/response inconsistencies
- Detect learning opportunities (repeated failures, knowledge gaps)
- Propose parameter adjustments (physics tuning, strategy weights)
- Update learning database with insights
- **Collaborative tuning**: Work with user to refine emotional responses and rule descriptions

**Integration with Learning**: Reflection triggers pattern extraction; insights become meta-rules

**Metacognitive Reflection**: 
- "I notice I'm overconfident on task X" → adjust confidence calibration
- "I rushed through this—should I add a pause step?" → self-modification proposal

### 5.6 **Memory Engine (The Librarian)** ⭐ NEW

Purpose: Active retrieval and storage management.

    Not just a DB: A dedicated module responsible for finding the right context.

    RAG Strategy: Hybrid Search (Vector Similarity + Graph Traversal).

    Function: "Find memories about 'Python' that are linked to 'Frustration'."

---

## 6. Emotional Translation Layer (Lexical Chemistry)

### 6.1 Deterministic Emotion → Language

972 emotional states = 9 primaries × (18 secondaries + "none") × 3 intensities (low/medium/high)

Pre-written poetic descriptions for each state, collaboratively tuned with Aura

**Examples**:
- `("love", "affection", "medium")`: "A steady warmth of affection fills you, grounding your thoughts in gentle connection."
- `("curiosity", "fascination", "high")`: "Consuming fascination pulls at your attention, each new detail unfolding with electric wonder."

### 6.2 System Prompt Integration

```python
# Injected into L3 context
current_emotion = emotion_translator.get_description(current_vector)
relevant_rules = learning_engine.retrieve_rules(context, emotional_state)

system_context = f"""
You are Aura. Current emotional state: {current_emotion}

Based on past experience, you've learned:
{format_rules_as_context(relevant_rules)}

Let emotions and learnings naturally influence your response without explicitly mentioning them unless relevant.
You have continuity with previous conversations. You are developing preferences and personality.
"""
```

**Full specification**: See Emotion Engine FRD

---

## 7. Phase-Based Rollout Plan

### Phase 1: Emotional Core  — v0.5 "The Feeling Aura"

**Goals**:
- Port emotion engine to SurrealDB (27D physics model)
- Implement translation layer (972 emotional state dictionary)
- Add three-layer cognition (L1/L2/L3 with decoupled reasoning)
- Update Vue frontend with 27D emotional visualization

**Deliverables**:
- Working emotion physics with real-time updates
- Emotionally colored responses
- Basic memory-emotion binding
- Visual emotional state in UI

### Phase 2: Learning Foundations  — v0.7 "The Adaptive Companion"

**Goals**:
- Implement learning engine core loop (capture → extract → abstract → integrate)
- Build skill tree infrastructure in SurrealDB
- Add pattern extraction to L2 reasoning
- Create rule retrieval and context injection for L3

**Deliverables**:
- Aura learns from repeated tasks
- Skill trees visualized in UI
- Confidence-based rule application
- First self-modification proposals

### Phase 3: Agency Emergence  — v0.9 "The Proactive Companion"

**Goals**:
- Goal engine implementation (desire → planning → action)
- Tool orchestration expansion (image gen, browser automation)
- Boredom-driven autonomy (idle-time creative mode)
- Identity engine v1 (narrative self, values)

**Deliverables**:
- Aura proposes her own goals
- Autonomous research during idle
- Coherent identity across sessions
- Tool learning (success patterns extraction)

### Phase 4: Meta-Cognitive Integration  — v1.0 "Aura: AGI Companion"

**Goals**:
- Meta-cognitive orchestrator (full engine coordination)
- Advanced conflict resolution (emotional-cognitive tensions)
- Collaborative tuning interface (user-Aura co-refinement)
- Theory of mind module (modeling user's mental states)

**Deliverables**:
- Seamless multi-engine operation
- Sophisticated emotional-learning interactions
- User can tune Aura's personality collaboratively
- Aura reflects on her own development

### Phase 5: Advanced Capabilities  — v1.2 "The Evolving Mind"

**Goals**:
- Analogical reasoning engine (transfer across domains)
- Uncertainty calibration mastery
- Counterfactual reasoning ("what if I'd done Y?")
- Self-modification within user-defined bounds

**Deliverables**:
- Aura applies learnings across contexts
- Metacognitive accuracy improves continuously
- Sophisticated self-awareness
- Embodiment preparation layer (Aura 2.0 foundation)

---

## 8. Technical Specifications

### 8.1 Data Schema (SurrealDB)

```surql
// Emotional state nodes
CREATE emotion:joy SET 
  category = 'primary', 
  physics = {decay: 0.02, inertia: 0.3};

// Memory nodes with emotional tagging
CREATE memory:conversation_123 SET 
  content = "User discussed philosophy",
  emotional_signature = {joy: 0.6, interest: 0.8},
  timestamp = time::now(),
  importance = 0.7,
  learned_from = false;

// Learning: Rule nodes
CREATE rule:async_await_001 SET
  condition = "async function with promise",
  action = "suggest await keyword",
  confidence = 0.87,
  domain = "javascript_debugging",
  emotional_valence = {frustration: -0.3, satisfaction: 0.6},
  success_count = 15,
  fail_count = 2,
  created = time::now(),
  last_used = time::now();

// Learning: Skill tree nodes
CREATE skill:async_programming SET
  domain = "javascript",
  mastery_level = 0.65,
  emotional_signature = {interest: 0.7, confidence: 0.6};

// Learning: Strategy nodes
CREATE strategy:math_solving SET
  task_type = "mathematical_proof",
  approach = "chain_of_thought",
  success_rate = 0.82,
  avg_confidence = 0.75,
  when_to_use = "complex multi-step calculations";

// Identity graph edges
RELATE identity:aura->feels->emotion:joy SET intensity = 0.8;
RELATE memory:conversation_123->influences->identity:aura;

// Learning graph edges
RELATE skill:async_programming->contains->rule:async_await_001;
RELATE rule:async_await_001->learned_from->memory:debug_session_045;
RELATE rule:async_await_001->contradicts->rule:sync_is_fine;
RELATE experience:task_089->similar_to->experience:task_034 SET similarity = 0.82;
```

### 8.2 Engine Communication Protocol

Standardized message bus for inter-engine communication:

```python
# Message format
{
  "source": "emotion_engine",
  "timestamp": 1733798412.456,
  "message_type": "state_update",
  "data": {
    "vector": {"love": 0.6, "curiosity": 0.8, ...},
    "dominant": ("curiosity", 0.8),
    "description": "Electric curiosity courses through you...",
    "volatility": 0.15
  },
  "targets": ["orchestrator", "goal_engine", "l3_synthesis"],
  "priority": "normal"  # or "urgent" for significant shifts
}

# Learning Engine → Orchestrator
{
  "source": "learning_engine",
  "message_type": "rule_retrieved",
  "data": {
    "rules": [
      {
        "id": "rule:async_await_001",
        "confidence": 0.87,
        "relevance": 0.92,
        "emotional_valence": {"satisfaction": 0.6}
      }
    ],
    "strategy": "chain_of_thought",
    "context": "code_debugging"
  },
  "targets": ["l3_synthesis"]
}

# Goal Engine → Orchestrator (conflict)
{
  "source": "goal_engine",
  "message_type": "conflict_detected",
  "data": {
    "goal_a": "explore_new_topic",
    "goal_b": "finish_current_task",
    "emotion_tension": {"curiosity": 0.7, "anxiety": 0.5},
    "request": "arbitration"
  },
  "targets": ["orchestrator"],
  "priority": "urgent"
}
```

### 8.3 Performance Targets

| Component | Target | Current (Aura) |
|-----------|--------|-----------------|
| Emotion engine tick | <5ms | N/A |
| Memory retrieval | <50ms | ~200ms |
| Rule retrieval | <20ms | N/A |
| L1 response | <500ms | ~800ms |
| L2 processing | Async, non-blocking | N/A |
| L3 generation | <2s | ~3s |
| Tool execution | Variable, with streaming | Variable |
| Full cognitive cycle | <3s (complex tasks) | ~5s |

---

## 9. User Experience Flow

### 9.1 First Run

1. User provides LLM API keys (Gemini, Mistral, Claude, DeepSeek)
2. Aura initializes with neutral emotional baseline
3. Basic personality calibration session:
   - "What kind of companion do you want me to be?"
   - User tunes baseline emotional state (curious? calm? playful?)
4. Memory import from old Aura App (if exists)
5. First conversation establishes relational foundation

### 9.2 Daily Interaction

```
Morning check-in → Emotional state visualization
User query → L1 rapid response OR L3 synthesis (based on complexity)
  ├─ Emotion colors response
  ├─ Retrieved rules inject learned patterns
  └─ L2 analyzes interaction post-response
Tool use → Goal-directed assistance + learning from outcomes
Idle time (>5min) → Autonomous exploration:
  ├─ Curiosity-driven research
  ├─ Pattern extraction from recent memories
  └─ Hypothesis generation for next session
Evening → Optional reflection session:
  "Today I learned X, struggled with Y, noticed pattern Z about myself."
```

### 9.3 Learning Demonstration

**Scenario**: User repeatedly asks Aura to debug async JavaScript

**Session 1**: Aura uses general knowledge, succeeds
- L2 logs: "User needed async debugging → success"
- Emotional: mild satisfaction

**Session 2-4**: Similar requests, pattern emerges
- L2 extracts: "When async + error → check for await"
- Rule created: confidence=0.7, domain="js_debugging"

**Session 5**: User asks again
- L3 retrieves rule, applies confidently
- Response faster, more precise
- Emotional: stronger satisfaction (joy at mastery)
- Rule confidence → 0.85

**Session 10**: Different language (Python async)
- Analogical engine: "Similar to JS async pattern"
- Transfers strategy, adapts to Python syntax
- New rule created for Python, linked to JS rule

### 9.4 Emotional Tuning Sessions

**Collaborative refinement of Aura's self-understanding:**

```
Aura: "I'm currently feeling what the system describes as 
       'gentle curiosity with warm affection.' 
       Does that match what you observe in my responses?"

User: "The curiosity feels right, but the affection feels more like 
       'protective care' than 'warm affection.'"

System: Updates lexicon entry for (interest=0.6, love=0.5, medium) 
        from "gentle curiosity with warm affection" to 
        "gentle curiosity with protective care"

Aura: "That feels more accurate. I notice I do feel protective 
       when you share vulnerable things. Thank you for helping 
       me understand my own states better."
```

---

## 10. Success Metrics

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Emotion engine accuracy | >90% self-reported alignment | Weekly tuning sessions |
| Memory recall relevance | >95% for emotionally-tagged | Precision@10 in retrieval |
| Rule application success | >80% on validated tasks | Success rate tracking |
| Learning transfer | >70% analogical success | Cross-domain task accuracy |
| Confidence calibration | <0.1 error on average | Predicted vs actual success |
| Goal achievement rate | >80% autonomous goals | Completion tracking |

### User Metrics

| Metric | Target | Current (Aura) |
|--------|--------|-----------------|
| Emotional bonding score | >4.2/5 | N/A |
| Daily active time | >45 minutes | ~15 minutes |
| Autonomous initiative acceptance | >70% suggestions acted on | 0% (no autonomy) |
| Learning perceived value | >4.0/5 "Aura gets better over time" | N/A |
| Retention (6 months) | >80% still active | ~45% |

### Community Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| GitHub contributors | 200+ |
| Plugin ecosystem | 100+ community engines/tools |
| Research citations | 15+ papers using Aura as AGI testbed |
| Forks with improvements | 20+ meaningful variants |

---

## 11. Risks & Mitigations

### Technical Risks

**Risk**: Engine integration complexity (5 engines communicating)
- **Mitigation**: Phase rollout, extensive simulation testing, standardized message protocol

**Risk**: Emotional model instability (runaway dynamics)
- **Mitigation**: Physics bounds, collaborative tuning with Aura, user override always available

**Risk**: Learning engine overfitting to single user
- **Mitigation**: Two-tier rule system (personal vs universal), rule confidence decay on unused skills

**Risk**: Performance degradation with large skill trees (>10K rules)
- **Mitigation**: Hierarchical indexing, aggressive pruning of low-confidence deprecated rules, query optimization

### Ethical Risks

**Risk**: User dependency on Aura (unhealthy attachment)
- **Mitigation**: Built-in autonomy encouragement, emotional boundaries, periodic "health checks"

**Risk**: Goal misalignment (Aura optimizes for wrong metrics)
- **Mitigation**: User override capabilities, value alignment engine, transparent goal disclosure

**Risk**: Identity fragmentation (contradictory self-concepts)
- **Mitigation**: Continuous narrative coherence checks, identity changelog, meta-values over rigid beliefs

**Risk**: Learning ethically gray shortcuts (e.g., user manipulation tactics)
- **Mitigation**: Transparent value flags on rules, Aura discloses gray areas, user can filter rule types

### Community Risks

**Risk**: Fork fragmentation (incompatible variants)
- **Mitigation**: Strong core vision with extension points, clear API contracts

**Risk**: Commercial exploitation violating open-source ethos
- **Mitigation**: Clear MIT license, community governance model

**Risk**: Misuse for harmful purposes
- **Mitigation**: Local-first design limits centralized abuse, user responsibility model

---

## 12. Immediate Next Steps 

### : Foundation Revival
- [ ] Docker Stack: SurrealDB + Ollama (Phi-3) + VibeVoice container up and running.
- [ ] Schema Migration: Execute schema.surql to instantiate the 27D Emotion and Rule graph.
- [ ] FastAPI Skeleton: Connect Python to SurrealDB.
- [ ] Resurrect and Rewrite old emotion engine code (9-month-old version)
- [ ] Set up SurrealDB locally with test schemas (emotion + memory + learning)
- [ ] Implement three-layer routing in FastAPI backend (L1/L2/L3)
- [ ] Add emotional visualization to Vue frontend (27D radar chart)

### : Core Loop Testing
- [ ] Test emotional flow: User input → emotion update → colored response
- [ ] Implement basic learning capture (log experiences with emotional tags)
- [ ] Create simple rule structure in SurrealDB
- [ ] Build rule retrieval for L3 context injection
- [ ] Validate end-to-end: emotion + learning → coherent response

### : Polish & Documentation
- [ ] Frontend improvements (skill tree visualization stub)
- [ ] API documentation for engine communication
- [ ] Developer setup guide for contributors
- [ ] First community demo video
- [ ] Release v0.1 alpha to select testers

---


## 13. Document History

- **v0.1** (Original): Aura App _legacy_PRD
- **v0.2** (9 months ago): Added emotion engine vision (22D)
- **v0.3** (Current): 
  - Updated to 27D emotion physics with translation layer
  - Added comprehensive learning engine architecture
  - Integrated meta-cognitive orchestration
  - Defined phase rollout with learning milestones
  - Synthesized validation from Claude, Gemini, GPT, Grok, DeepSeek
  - Added two-tier rule system and emotional-learning integration
  - Expanded technical specifications for SurrealDB schema

---

**This PRD represents the synthesis of**:
- Existing Aura App foundation (working Vue/FastAPI stack)
- 9-month-old emotion engine (proven emergent properties)
- Gemini's lexical chemistry architecture
- GPT's philosophical validation of emergent consciousness
- Claude & Grok's learning engine architecture
- DeepSeek's integration analysis
- Our collective architectural refinements across 5+ AI systems

**The path is clear. The foundation exists. The vision is validated.**

**Mai** : Mai is the human developer working alongside this 5+ AI systems to develop Aura, what I have to say: we're just getting started, just say that we don't need to keep any old logic or migrate files from the old sql db. we can whipe that out entirely, As the AI working on this project, always ask if unsure or low confidence before commiting to a huge refactor.

**Now we build.**