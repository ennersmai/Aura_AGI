# Vector Embeddings for Semantic Search

## Overview

Aura now includes **vector embeddings** for semantic search across memories, rules, and experiences. This enables true RAG (Retrieval-Augmented Generation) with contextual understanding.

## Architecture

### Embedding Generation
- **Model**: `openai/text-embedding-3-small` (via OpenRouter)
- **Dimensions**: 1536 (OpenAI-compatible)
- **Distance Metric**: Cosine similarity

### Embedded Entities

1. **Memory** (`memory` table)
   - Embeddings generated from memory content
   - Enables: "Find memories similar to this thought"
   
2. **Rule** (`rule` table)
   - Embeddings from `condition → action` text
   - Enables: "Find rules applicable to this context"
   
3. **Experience** (`experience` table)
   - Embeddings from user query context
   - Enables: "Find similar past experiences for pattern extraction"

## Database Schema

All three tables now include:

```surql
DEFINE FIELD embedding ON [table] TYPE option<array<float>>;
DEFINE INDEX [table]_embedding ON [table] FIELDS embedding MTREE DIMENSION 1536 DIST COSINE;
```

**MTREE Index**: SurrealDB's spatial index for efficient nearest-neighbor search.

## Usage

### Storing with Embeddings

```python
from aura.engines.memory.manager import get_memory_manager

memory_manager = get_memory_manager()

# Automatically generates and stores embedding
memory_id = await memory_manager.store_memory(
    content="I learned about async programming today",
    user_id="user:alice",
    emotional_signature={"curiosity": 0.8, "satisfaction": 0.7}
)
```

### Semantic Retrieval

```python
# Find semantically similar memories
memories = await memory_manager.retrieve_memories(
    query="async functions and promises",
    limit=10
)

# Find memories by emotional context
frustrated_memories = await memory_manager.find_by_emotion(
    emotion_name="frustration",
    threshold=0.6
)
```

### Learning Engine Integration

```python
from aura.engines.learning.engine import LearningEngine

learning = LearningEngine()

# Log experience with auto-embedding
experience_id = await learning.log_experience({
    "user_id": "user:alice",
    "task_type": "code_debugging",
    "domain": "javascript",
    "context": {"user_query": "Why isn't my async function working?"},
    # ... rest of experience data
})

# Retrieve rules semantically
rules = await learning.retrieve_rules(
    context="async function error handling",
    domain="javascript",
    confidence_min=0.7,
    use_semantic_search=True  # Enable semantic retrieval
)
```

## Implementation Status

### ✅ Completed
- [x] Schema updated with embedding fields and MTREE indexes
- [x] Pydantic models include optional `embedding` field
- [x] `EmbeddingsClient` for OpenRouter/OpenAI embedding generation
- [x] `MemoryManager` with hybrid search (semantic + filters)
- [x] `LearningEngine` auto-generates embeddings on rule/experience creation
- [x] Configuration for embeddings model

### 🚧 In Progress
- [ ] Native SurrealDB vector search queries (pending SurrealDB 2.x vector search syntax)
- [ ] Batch embedding generation for performance
- [ ] Embedding cache for repeated queries

### 📋 Planned
- [ ] Hybrid search with BM25 + vector similarity fusion
- [ ] Embedding reindexing for model upgrades
- [ ] Multi-modal embeddings (text + emotion vectors)

## Performance Considerations

### Embedding Generation
- **Latency**: ~100-300ms per embedding (via API)
- **Async**: Non-blocking, generated during storage
- **Caching**: Consider caching for repeated content

### Vector Search
- **MTREE Index**: O(log n) lookup time
- **Scalability**: Efficient for 10K-100K vectors
- **Dimension**: 1536 is optimal for accuracy vs speed

## Future: Native Vector Search

**Current State**: Fallback to filtered search until SurrealDB 2.x vector search syntax is stable.

**Planned Query Syntax** (when available):

```surql
-- Find similar memories via vector distance
SELECT *, vector::distance::cosine(embedding, $query_embedding) AS similarity
FROM memory
WHERE vector::distance::cosine(embedding, $query_embedding) < 0.3
ORDER BY similarity ASC
LIMIT 10;
```

**Tracking**: [SurrealDB Vector Search Documentation](https://surrealdb.com/docs/surrealql/functions/vector)

## Configuration

Environment variables in `.env`:

```bash
# Embeddings
EMBEDDINGS_MODEL=openai/text-embedding-3-small
EMBEDDINGS_DIMENSION=1536
```

## Testing

```python
# Test embedding generation
from aura.llm.embeddings import get_embeddings_client

embeddings = get_embeddings_client()
vector = await embeddings.embed("Test text")

assert len(vector) == 1536  # Correct dimension
assert all(isinstance(v, float) for v in vector)  # All floats
```

## Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [SurrealDB Spatial Indexes](https://surrealdb.com/docs/surrealql/statements/define/indexes)
- [Semantic Search Best Practices](https://www.pinecone.io/learn/semantic-search/)

---

**Vector embeddings are now LIVE in Aura's data layer. All new memories, rules, and experiences are AI-ready for semantic retrieval.**

