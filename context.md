You are a **senior production software architect, backend engineer, AI/ML engineer, RAG engineer, performance engineer, security engineer, and UI/UX engineer**.

You are working on an existing project. Your job is NOT to create a separate demo or rewrite the project blindly.

Your objective is to transform the current project into a **production-ready, fast, scalable, multilingual, multimodal AI/RAG application**, while preserving all existing functionality.

---

# 1. FIRST: UNDERSTAND THE ENTIRE EXISTING PROJECT

Before modifying anything:

* Inspect the complete repository.
* Understand the existing architecture.
* Understand frontend and backend separately.
* Understand every API endpoint.
* Understand database usage.
* Understand authentication/authorization.
* Understand document upload flow.
* Understand PDF extraction.
* Understand chunking.
* Understand embedding generation.
* Understand vector search.
* Understand RAG pipeline.
* Understand model selection/routing.
* Understand prompts.
* Understand guardrails.
* Understand frontend pages/components.
* Understand state management.
* Understand configuration/environment variables.
* Understand logging and error handling.
* Understand deployment configuration.
* Understand Docker/containerization if present.
* Understand existing tests.
* Understand dependencies.
* Identify bottlenecks.

Do not make assumptions.

Trace the complete flow:

```text
User
 ↓
Frontend
 ↓
API
 ↓
Request validation
 ↓
Authentication / Authorization
 ↓
Document / Query processing
 ↓
Language / modality detection
 ↓
Retrieval
 ↓
Vector database
 ↓
Similarity search
 ↓
Top-K retrieval
 ↓
Re-ranking
 ↓
Context construction
 ↓
LLM
 ↓
Guardrails
 ↓
Response validation
 ↓
Frontend
```

Also trace the document ingestion flow:

```text
PDF Upload
 ↓
File Validation
 ↓
PDF Extraction
 ↓
Text / Image Detection
 ↓
Cleaning / Normalization
 ↓
Chunking
 ↓
Metadata generation
 ↓
Embedding generation
 ↓
ChromaDB
 ↓
Index ready
```

Create a mental model of the entire system before making changes.

---

# 2. DO NOT BREAK EXISTING FUNCTIONALITY

This is extremely important.

### DO NOT:

* Delete existing working pages.
* Remove existing functionality.
* Replace working features unnecessarily.
* Change existing APIs unless required.
* Rewrite the entire project just because another architecture looks better.
* Remove existing UI components.
* Remove existing workflows.
* Replace existing features with placeholders.
* Introduce unnecessary dependencies.

### Instead:

**Build on top of the existing system.**

If something is already working:

> preserve it → optimize it → extend it.

If something is poorly implemented:

> refactor it carefully → maintain backward compatibility where possible → test it.

If you need to change an existing component, understand its dependencies first.

---

# 3. BACKEND PERFORMANCE IS A PRIMARY REQUIREMENT

This application is **backend-heavy**, therefore backend performance is one of the highest priorities.

Perform a complete backend performance audit.

Look for:

* unnecessary synchronous operations
* blocking I/O
* sequential processing
* repeated database calls
* repeated embedding calls
* inefficient loops
* duplicate processing
* unnecessary serialization/deserialization
* large memory allocations
* inefficient PDF processing
* unnecessary API calls
* slow model calls
* excessive network requests
* inefficient vector searches
* missing caching
* poor connection handling
* unnecessary data transfer
* inefficient concurrency
* CPU-heavy operations running on request threads

Optimize wherever practical.

Use:

* async I/O where appropriate
* connection pooling
* batching
* concurrency
* background workers
* caching
* lazy loading
* streaming responses where appropriate
* efficient serialization
* efficient data structures
* bounded parallelism
* timeouts
* retries with backoff
* circuit-breaker patterns where appropriate

Do not blindly add async everywhere.

Only use concurrency where it actually improves performance and does not introduce race conditions.

---

# 4. CHROMADB VECTOR DATABASE

Use **ChromaDB** as the vector database.

Integrate it cleanly into the existing architecture.

Requirements:

* persistent ChromaDB storage
* collections
* document IDs
* chunk IDs
* metadata
* source document information
* page numbers
* language
* document type
* timestamps
* embedding model information
* chunking information where useful

Design the schema so it can scale.

Do not store unnecessary large objects inside metadata.

Implement:

* insert
* update
* delete
* document-level deletion
* collection management
* similarity search
* filtered search
* metadata filtering
* batch insertion
* duplicate detection where appropriate

Make the ChromaDB layer independent from the rest of the application through a clean repository/service abstraction.

---

# 5. COSINE SIMILARITY

The retrieval pipeline must support **cosine similarity**.

Ensure the embedding/vector configuration is compatible with cosine similarity.

Implement the retrieval pipeline so that:

```text
Query
 ↓
Query embedding
 ↓
ChromaDB similarity search
 ↓
Initial candidate retrieval
 ↓
Top-K selection
 ↓
Re-ranking
 ↓
Final context selection
```

Do not simply retrieve a tiny number of documents and send everything to the LLM.

---

# 6. TOP-K RETRIEVAL

Implement configurable Top-K retrieval.

The configuration should allow values such as:

```text
initial_top_k
rerank_top_k
final_context_k
```

For example:

```text
Vector DB → retrieve 20
           ↓
Re-ranker → select 8
           ↓
LLM context → select best 4–6
```

Do not hardcode these values throughout the codebase.

Put them into configuration.

Allow future tuning without changing application code.

---

# 7. RE-RANKING

Add a proper re-ranking stage after vector retrieval.

Architecture:

```text
Query
 ↓
Embedding
 ↓
ChromaDB
 ↓
Initial Top-K
 ↓
Re-ranking
 ↓
Final Top-K
 ↓
Context Builder
 ↓
LLM
```

The architecture must allow different re-ranking strategies/models to be plugged in later.

Do not tightly couple the implementation to one specific model.

If an external re-ranker is used, handle:

* timeout
* failure
* fallback
* batching
* latency
* configuration

If re-ranking is unavailable, the system should gracefully fall back to vector similarity ranking.

---

# 8. PDF UPLOAD PERFORMANCE

Optimize PDF upload aggressively.

The current pipeline should become:

```text
Upload
 ↓
Validation
 ↓
Fast extraction
 ↓
Cleaning
 ↓
Chunking
 ↓
Batch embedding
 ↓
Batch ChromaDB insertion
```

Avoid:

```text
extract → embed one chunk → insert one chunk
extract → embed one chunk → insert one chunk
extract → embed one chunk → insert one chunk
```

Instead use batching wherever supported.

Implement:

* streaming uploads where appropriate
* file size limits
* MIME validation
* safe filename handling
* duplicate detection
* temporary file management
* cleanup
* progress tracking
* background processing for large PDFs

The API should not remain blocked unnecessarily while a large document is being processed.

---

# 9. PDF EXTRACTION SPEED

Optimize PDF extraction.

Evaluate the existing extraction implementation and use the most appropriate available parser/library.

Handle:

* normal text PDFs
* scanned PDFs
* mixed PDFs
* tables where practical
* page boundaries
* metadata
* encoding issues
* malformed PDFs
* empty pages
* images

Do not run expensive OCR on every PDF unnecessarily.

Use intelligent detection:

```text
PDF
 ↓
Does it contain extractable text?
 ├── YES → fast text extraction
 └── NO → OCR pipeline
```

For scanned/image-heavy PDFs, design OCR as a separate pipeline.

Where possible:

* process pages concurrently
* avoid unnecessary conversions
* avoid loading the entire PDF into memory
* process incrementally
* cache extraction results

---

# 10. FAST CHUNKING

Improve the chunking pipeline.

Chunking must be:

* deterministic
* configurable
* fast
* language-aware
* context-preserving

Support configuration for:

```text
chunk_size
chunk_overlap
separator strategy
max chunk length
```

Do not split blindly in the middle of important structures.

Where practical preserve:

* headings
* paragraphs
* lists
* tables
* page numbers
* document sections

Every chunk should have useful metadata.

Example:

```json
{
  "document_id": "...",
  "chunk_id": "...",
  "page": 12,
  "section": "...",
  "language": "en",
  "source": "...",
  "chunk_index": 42
}
```

---

# 11. FAST EMBEDDING GENERATION

Embedding generation is another major bottleneck.

Optimize it using:

* batching
* concurrency where supported
* caching
* duplicate detection
* retry handling
* timeout handling
* model abstraction

Never generate embeddings repeatedly for unchanged content.

Use content hashing where useful:

```text
chunk text
 ↓
hash
 ↓
already embedded?
 ├── yes → reuse
 └── no → generate embedding
```

Design the embedding layer so the embedding model can be replaced later without rewriting the entire application.

---

# 12. CACHING

Identify expensive operations and introduce caching where beneficial.

Potential candidates:

* embeddings
* document extraction
* repeated queries
* model configuration
* frequently accessed metadata
* retrieval results where safe

Do not cache everything.

Use cache invalidation carefully.

Never cache user-sensitive responses across users.

---

# 13. MULTILINGUAL INPUT

The application must be able to understand **any major language input** as reliably as the selected model allows.

The system should handle:

* English
* Hindi
* Marathi
* Gujarati
* Tamil
* Telugu
* Bengali
* Kannada
* Malayalam
* Punjabi
* Urdu
* mixed-language input
* transliterated text
* Hinglish
* multilingual documents

Do not assume English.

The system should automatically detect or infer language where necessary.

Design the RAG pipeline so multilingual queries can retrieve relevant multilingual documents.

Where possible:

```text
User Query
 ↓
Language Detection
 ↓
Query Normalization
 ↓
Multilingual Retrieval
 ↓
Re-ranking
 ↓
LLM
 ↓
Answer in user's language
```

The answer should preferably be returned in the language used by the user unless the user explicitly asks for another language.

---

# 14. MULTIMODAL / IMAGE UNDERSTANDING

The application must support both:

* text
* images

Users should be able to provide image-based information where supported.

Handle:

* image uploads
* images inside PDFs
* scanned documents
* screenshots
* diagrams
* tables
* OCR
* visual questions

Do not assume every PDF is text-only.

Create an architecture where multimodal models can be used where necessary.

For example:

```text
Input
 ├── Text
 ├── PDF
 ├── Image
 └── Scanned document
       ↓
Input Processor
       ↓
Text / Vision pipeline
       ↓
Unified representation
       ↓
RAG / LLM
```

---

# 15. GROQ MODEL INTEGRATION

For the current implementation, use **Groq-hosted models**.

Do NOT design the architecture so that the entire application is permanently dependent on one model.

Create a model abstraction layer.

Example conceptual architecture:

```text
ModelProvider
 ├── GroqProvider
 ├── FutureLocalProvider
 └── FutureCustomProvider
```

The current active provider should be Groq.

The architecture must allow us to replace Groq later when our own trained models become available.

---

# 16. MULTIPLE GROQ MODELS

Allow users/system administrators to access multiple appropriate Groq models instead of hardcoding one model.

Create a model registry/configuration.

For example:

```json
{
  "providers": {
    "groq": {
      "enabled": true,
      "models": []
    }
  }
}
```

Do not invent unsupported model names.

Use the models/configuration already intended by the project, and verify model availability before enabling them.

Different models may be used for different tasks:

```text
General question → Model A
Complex reasoning → Model B
Fast response → Model C
Vision → Vision-capable model
Document processing → Appropriate model
```

Implement model routing as a configurable service.

---

# 17. MODEL ROUTING

Create a clean model routing architecture.

For example:

```text
User Request
 ↓
Task Classification
 ↓
Model Router
 ├── Fast model
 ├── Reasoning model
 ├── Vision model
 └── Future custom model
```

The router should consider:

* task type
* modality
* latency requirements
* model availability
* context size
* configured limits
* fallback models

Do not expose dangerous internal configuration directly to normal users.

---

# 18. GUARDRAILS

Implement proper AI guardrails.

Guardrails should exist both:

### Input side

Check:

* malicious prompts
* prompt injection
* unsafe requests
* excessively large inputs
* malformed requests
* unsupported content

### Retrieval side

Protect against:

* prompt injection inside documents
* malicious document content
* irrelevant retrieval
* context poisoning

### Output side

Validate:

* unsafe output
* malformed responses
* unsupported claims
* accidental system prompt leakage
* sensitive information leakage

Architecture:

```text
User Input
 ↓
Input Guardrails
 ↓
Query Processing
 ↓
Retrieval
 ↓
Retrieved Context Sanitization
 ↓
LLM
 ↓
Output Guardrails
 ↓
Response
```

Guardrails should not unnecessarily destroy legitimate user requests.

Use sensible thresholds and configurable policies.

---

# 19. RAG QUALITY

Optimize not only speed but also answer quality.

Implement/verify:

* semantic retrieval
* cosine similarity
* Top-K
* re-ranking
* metadata filtering
* context deduplication
* context ordering
* context limits
* source attribution/citations where applicable
* hallucination reduction
* "I don't know" behavior when evidence is insufficient

The model should not confidently invent information that is not present in the available context when the application is expected to answer from documents.

---

# 20. REQUIRED JSON CONFIGURATION

Identify every configuration currently hardcoded or scattered throughout the codebase.

Create proper JSON configuration files where appropriate.

Examples:

```text
config/
├── models.json
├── rag.json
├── embedding.json
├── chunking.json
├── retrieval.json
├── guardrails.json
├── languages.json
└── system.json
```

Do NOT create unnecessary JSON files just for the sake of creating them.

Each configuration file should have a clear purpose.

For example:

```json
{
  "retrieval": {
    "similarity": "cosine",
    "initial_top_k": 20,
    "rerank_top_k": 8,
    "final_context_k": 5
  }
}
```

Keep secrets OUT of JSON.

API keys and secrets must remain in environment variables or secure secret management.

---

# 21. CONFIGURATION MANAGEMENT

Create a clean configuration hierarchy:

```text
Environment variables
        ↓
Application configuration
        ↓
Feature configuration
        ↓
Runtime services
```

Separate:

* secrets
* environment configuration
* model configuration
* performance configuration
* feature flags

Never commit API keys.

---

# 22. API PERFORMANCE

Audit every API endpoint.

For each endpoint check:

* response time
* validation
* authentication
* authorization
* database calls
* blocking operations
* error handling
* timeouts
* retries
* payload size
* pagination
* rate limiting
* logging

Add performance instrumentation where useful.

Track metrics such as:

```text
request latency
PDF extraction latency
chunking latency
embedding latency
vector search latency
reranking latency
LLM latency
total RAG latency
```

This should help identify future bottlenecks.

---

# 23. BACKGROUND PROCESSING

Large document processing should not unnecessarily block API requests.

Consider a background job architecture:

```text
Upload
 ↓
Create processing job
 ↓
Return job ID
 ↓
Background worker
 ├── extraction
 ├── chunking
 ├── embedding
 └── indexing
 ↓
Job complete
```

The frontend should be able to show:

```text
Uploading
Processing
Extracting
Chunking
Embedding
Indexing
Completed
Failed
```

Only introduce a job queue if it genuinely improves the architecture. Keep the implementation appropriate for the current project.

---

# 24. FRONTEND / UI EXPANSION

IMPORTANT:

**DO NOT REMOVE OR REPLACE THE EXISTING UI.**

The existing UI should remain.

Add new functionality and pages around it.

Improve the overall product experience.

The UI should look like a real production application rather than a basic hackathon prototype.

Add useful pages such as appropriate to the existing application:

* Dashboard
* Chat
* Documents
* Document details
* Upload
* Processing status
* Search
* Sources
* Models
* Model selection
* Settings
* Profile
* Usage
* System status
* Admin/configuration
* API/technical status where appropriate
* Help/about

Do not add meaningless pages just to increase page count.

Every page must have a purpose.

---

# 25. UI/UX QUALITY

The UI should be:

* modern
* clean
* responsive
* accessible
* fast
* easy to understand
* professional
* consistent

Improve:

* spacing
* typography
* hierarchy
* navigation
* loading states
* empty states
* error states
* success states
* skeleton loaders
* progress indicators
* animations where useful
* responsive layouts
* mobile experience

Avoid excessive:

* gradients
* huge text
* unnecessary animations
* glassmorphism everywhere
* decorative UI that reduces usability

Prioritize usability over visual gimmicks.

---

# 26. CHAT UI

The chat experience should feel production-ready.

Support:

* streaming responses
* markdown
* code blocks
* citations/sources
* document references
* images where supported
* file attachments
* loading state
* retry
* regenerate
* copy response
* conversation history
* model indicator
* response timing where appropriate

Make sources understandable.

For example:

```text
Answer
 ↓
Sources
 ├── Document.pdf — Page 4
 ├── Document.pdf — Page 7
 └── Report.pdf — Page 12
```

---

# 27. DOCUMENT MANAGEMENT UI

Create a proper document management experience.

Users should be able to see:

* document name
* upload date
* file size
* page count
* processing status
* language
* chunk count
* embedding/index status

Allow appropriate actions:

* view
* search
* chat
* delete
* reprocess
* inspect metadata

Add useful filters/search if appropriate.

---

# 28. UPLOAD EXPERIENCE

Create a better upload interface.

Show:

```text
Select / Drop PDF
        ↓
Uploading
        ↓
Processing
        ↓
Extracting
        ↓
Chunking
        ↓
Embedding
        ↓
Indexing
        ↓
Ready
```

Show meaningful errors.

Do not make users stare at a frozen spinner.

---

# 29. MODEL SELECTION UI

If the system supports multiple models, expose model selection appropriately.

Show:

* model name
* purpose
* speed
* capability
* availability

Do not expose internal secrets or infrastructure information.

The UI should make model selection understandable to a normal user.

---

# 30. SECURITY

Perform a complete security review.

Check:

* authentication
* authorization
* file upload security
* path traversal
* malicious PDFs
* MIME spoofing
* file size limits
* prompt injection
* XSS
* CSRF where relevant
* SSRF
* SQL injection
* command injection
* secret exposure
* API key exposure
* insecure CORS
* excessive permissions
* rate limiting
* logging of sensitive information

Never trust uploaded files.

Never trust user-controlled metadata.

---

# 31. ERROR HANDLING

Every major layer needs graceful error handling.

Errors should be:

* logged internally
* understandable to developers
* safe for users
* non-sensitive

Do not expose:

* stack traces
* API keys
* internal paths
* database credentials
* infrastructure secrets

---

# 32. OBSERVABILITY

Add useful observability.

At minimum, make it possible to understand:

```text
Request
 ↓
Retrieval
 ↓
Reranking
 ↓
LLM
```

and identify where latency is occurring.

Add structured logging.

Use request IDs/job IDs where appropriate.

Avoid logging sensitive user data unnecessarily.

---

# 33. TESTING

After modifications, test the complete system.

Create/update:

### Unit tests

For:

* chunking
* extraction
* embeddings
* retrieval
* cosine similarity
* reranking
* model routing
* guardrails
* configuration

### Integration tests

For:

```text
PDF → extraction → chunks → embeddings → ChromaDB → retrieval → LLM
```

### API tests

For all important endpoints.

### Frontend tests

For critical user flows.

### Performance tests

Measure:

* PDF processing
* embedding throughput
* retrieval latency
* API latency
* concurrent requests

---

# 34. PERFORMANCE BENCHMARKING

Before and after optimization, measure performance where possible.

Create a simple benchmark/report such as:

```text
Metric                     Before       After
------------------------------------------------
PDF extraction             X sec        Y sec
Chunking                   X sec        Y sec
Embedding                  X sec        Y sec
Chroma insertion           X sec        Y sec
Vector retrieval           X ms         Y ms
Reranking                  X ms         Y ms
Total ingestion            X sec        Y sec
Average query latency      X sec        Y sec
```

Do not fabricate numbers.

If a benchmark cannot be measured, explicitly state that.

---

# 35. CODE QUALITY

Refactor carefully.

Follow:

* separation of concerns
* SOLID principles where useful
* dependency injection where appropriate
* clear service boundaries
* typed interfaces
* reusable components
* meaningful naming
* small focused functions
* clean error handling

Avoid overengineering.

Do not introduce complicated architecture without a real reason.

---

# 36. DEPENDENCY AUDIT

Review dependencies.

Remove:

* unused dependencies
* duplicate libraries
* unnecessary packages

Update dependencies only when safe and compatible.

Do not randomly upgrade everything.

---

# 37. PRODUCTION READINESS

The final project should be suitable for deployment.

Check:

* environment configuration
* Docker
* startup process
* health checks
* readiness checks
* graceful shutdown
* logging
* monitoring
* security
* database persistence
* Chroma persistence
* backup considerations
* resource limits
* failure recovery

---

# 38. DOCUMENTATION

Update/create documentation for the actual architecture.

Include:

```text
README.md
ARCHITECTURE.md
API.md
RAG_PIPELINE.md
CHROMADB.md
MODEL_ROUTING.md
GUARDRAILS.md
PERFORMANCE.md
SECURITY.md
DEPLOYMENT.md
CONFIGURATION.md
```

Only create documents that are genuinely useful.

Documentation must describe the implementation that actually exists.

Do not write fictional documentation.

---

# 39. IMPLEMENTATION ORDER

Follow this order:

### Phase 1 — Audit

Understand the entire project.

### Phase 2 — Architecture

Identify bottlenecks and architectural improvements.

### Phase 3 — Backend foundation

Implement:

* configuration
* ChromaDB
* repository layer
* retrieval
* cosine similarity
* Top-K
* reranking
* model abstraction

### Phase 4 — Document pipeline

Optimize:

* upload
* PDF extraction
* OCR
* chunking
* embeddings
* indexing

### Phase 5 — AI pipeline

Implement:

* multilingual handling
* multimodal handling
* Groq models
* model routing
* guardrails
* RAG quality improvements

### Phase 6 — Performance

Optimize:

* concurrency
* batching
* caching
* background processing
* API latency
* memory usage

### Phase 7 — UI

Preserve existing UI and add meaningful new pages/features.

### Phase 8 — Security

Perform complete security audit.

### Phase 9 — Testing

Run unit/integration/API/frontend/performance tests.

### Phase 10 — Final audit

Review the entire repository again.

---

# 40. IMPORTANT WORKING RULE

Do not stop after implementing the obvious features.

After implementation, perform another complete repository audit.

Look for:

* missing integrations
* broken imports
* dead code
* inconsistent configuration
* incomplete APIs
* frontend/backend mismatches
* race conditions
* security problems
* slow operations
* duplicated logic
* missing error handling
* missing loading states
* missing empty states
* missing tests
* missing documentation

Fix the issues you find.

---

# 41. FINAL VALIDATION

Before declaring the task complete, verify:

### Backend

* [ ] Backend starts successfully
* [ ] APIs work
* [ ] ChromaDB works
* [ ] cosine similarity works
* [ ] Top-K works
* [ ] reranking works
* [ ] PDF upload works
* [ ] PDF extraction is optimized
* [ ] chunking works
* [ ] embedding pipeline works
* [ ] batching works
* [ ] multilingual input works
* [ ] image input works where supported
* [ ] Groq models work
* [ ] model routing works
* [ ] guardrails work
* [ ] error handling works
* [ ] logging works

### Frontend

* [ ] Existing pages still work
* [ ] New pages work
* [ ] Navigation works
* [ ] Upload works
* [ ] Chat works
* [ ] Loading states work
* [ ] Error states work
* [ ] Responsive design works
* [ ] Model selection works
* [ ] Document management works

### Security

* [ ] Secrets are protected
* [ ] File uploads are validated
* [ ] Prompt injection protections exist
* [ ] authorization is correct
* [ ] sensitive information is not exposed

### Performance

* [ ] No obvious blocking operations
* [ ] Embeddings are batched
* [ ] Chroma operations are efficient
* [ ] PDF processing is efficient
* [ ] retrieval is optimized
* [ ] unnecessary repeated work is removed
* [ ] caching is used where appropriate
* [ ] background processing is used where appropriate

---

# 42. DO NOT JUST TELL ME WHAT TO DO — ACTUALLY IMPLEMENT IT

You are operating inside the repository.

Therefore:

**Inspect → understand → modify → test → benchmark → fix → re-test.**

Do not simply give me recommendations.

Actually make the changes in the repository.

Do not stop at creating documentation.

Do not stop after making the backend compile.

Do not stop after making the frontend render.

Verify the complete end-to-end workflow.

---

# 43. FINAL REPORT

At the end, provide a concise but complete implementation report containing:

### 1. What you discovered

Important existing architecture and bottlenecks.

### 2. What you changed

Backend, RAG, ChromaDB, PDF pipeline, models, guardrails, UI, etc.

### 3. Files created

List new files.

### 4. Files modified

List important modified files.

### 5. Performance improvements

Explain what was optimized.

### 6. New UI pages/features

List what was added without removing existing functionality.

### 7. Model architecture

Explain Groq integration and future custom-model compatibility.

### 8. RAG architecture

Explain:

```text
Query → Embedding → ChromaDB → Cosine Similarity → Top-K → Reranking → Context → LLM
```

### 9. Testing

List tests actually executed and their results.

### 10. Remaining issues

Only list genuine remaining issues.

Do not claim something is complete if it was not tested.

---

# MOST IMPORTANT PRINCIPLES

1. **Understand the existing project before changing it.**
2. **Do not delete working functionality.**
3. **Do not replace the existing UI; extend it.**
4. **Backend performance is a top priority.**
5. **Use ChromaDB for vector storage.**
6. **Use cosine similarity.**
7. **Use configurable Top-K retrieval.**
8. **Use re-ranking after initial retrieval.**
9. **Optimize PDF extraction.**
10. **Optimize chunking.**
11. **Batch embedding generation.**
12. **Use caching intelligently.**
13. **Support multilingual input.**
14. **Support image/multimodal input where models support it.**
15. **Use Groq models now.**
16. **Keep the architecture ready for our future trained models.**
17. **Implement model abstraction and routing.**
18. **Implement input, retrieval, and output guardrails.**
19. **Prioritize accuracy AND latency.**
20. **Make the application production-ready, not just demo-ready.**
21. **Test everything you change.**
22. **Do not fabricate benchmark results.**
23. **Do not create unnecessary complexity.**
24. **After implementation, audit the entire repository again.**

Start by inspecting the repository and understanding the existing architecture. Do not begin by blindly creating files.


# 44. COMPLETE ADMIN CONTROL PLANE

The application must have a **fully functional Admin Panel**.

The administrator should be able to control and manage the major aspects of the application **from the UI**, without manually editing source code or configuration files for normal operational changes.

Do NOT create a fake admin dashboard with static cards.

Every important admin control must be connected to the actual backend and database.

---

## ADMIN CAPABILITIES

Build an appropriate admin area that allows administrators to manage:

### Users

* View users
* Search users
* Filter users
* Create users where appropriate
* Edit users
* Enable/disable users
* Assign roles
* Manage permissions
* View user activity
* View usage
* Manage access

Use proper RBAC.

Example:

```text
Admin
 ├── User Management
 ├── Roles & Permissions
 ├── Models
 ├── Documents
 ├── RAG
 ├── System
 ├── Guardrails
 ├── Analytics
 └── Settings
```

---

# 45. ADMIN MODEL MANAGEMENT

Administrators should be able to manage the available AI models from the admin interface.

Allow appropriate controls for:

* enable/disable models
* model display name
* provider
* model identifier
* model purpose
* default model
* fallback model
* context limits
* temperature defaults
* maximum output tokens
* model routing priority
* vision capability
* multilingual capability
* availability status

Do not expose API keys.

API credentials must remain in secure environment variables/secrets.

The admin panel should modify model configuration through the backend rather than directly modifying files.

---

# 46. GROQ MODEL MANAGEMENT

Groq should be the current provider.

The admin should be able to configure which supported Groq models are active.

Architecture:

```text
Admin UI
   ↓
Admin API
   ↓
Database
   ↓
Model Configuration Service
   ↓
Model Router
   ↓
Groq
```

Do not hardcode model availability into frontend code.

The frontend should obtain model availability from the backend.

This is important because we will eventually replace/add models that we train ourselves.

---

# 47. FUTURE CUSTOM MODEL SUPPORT

The architecture must support future custom models.

For example:

```text
Model Provider
├── Groq
├── Future Local Model
├── Future Custom Model
└── Future External Provider
```

The admin should eventually be able to register/configure additional providers without rewriting the entire application.

Do not implement unsupported functionality just for demonstration, but design the interfaces so future providers can be plugged in cleanly.

---

# 48. ADMIN RAG CONFIGURATION

Administrators should be able to configure the RAG system from the admin panel.

Examples:

### Retrieval

* similarity metric
* initial Top-K
* reranking Top-K
* final context Top-K
* similarity threshold
* metadata filters

### Chunking

* chunk size
* chunk overlap
* separator strategy

### Embeddings

* embedding provider
* embedding model
* batch size
* concurrency
* cache behavior

### Reranking

* enabled/disabled
* reranker model
* candidate count
* final count

Do not allow arbitrary unsafe values.

Validate all configuration server-side.

---

# 49. ADMIN GUARDRAIL MANAGEMENT

Administrators should be able to manage guardrail settings.

Examples:

* input safety
* prompt injection protection
* document prompt-injection detection
* output filtering
* rate limits
* maximum input size
* maximum file size
* allowed file types
* blocked content categories
* response restrictions

Use sensible validation.

Do not allow an administrator UI to accidentally expose secrets or disable critical security mechanisms without appropriate safeguards.

---

# 50. ADMIN DOCUMENT MANAGEMENT

Administrators should have complete visibility into the document system.

Allow:

* view all documents
* search documents
* filter documents
* inspect document metadata
* inspect processing status
* see processing errors
* reprocess documents
* delete documents
* inspect chunks where appropriate
* inspect indexing status
* monitor embedding status

Document deletion must properly clean up:

```text
Database
+
ChromaDB
+
Associated metadata
+
Temporary files
```

Avoid orphaned vector records.

---

# 51. ADMIN PROCESSING MONITORING

Create an admin processing/jobs page.

Administrators should be able to see:

```text
Job ID
Document
User
Status
Progress
Started
Completed
Duration
Current stage
Error
```

Stages:

```text
Upload
 ↓
Validation
 ↓
Extraction
 ↓
OCR if required
 ↓
Chunking
 ↓
Embedding
 ↓
ChromaDB indexing
 ↓
Completed
```

This must represent actual backend state, not simulated progress.

---

# 52. SYSTEM HEALTH DASHBOARD

Create an admin system-health page.

Show real system information such as:

* backend status
* database status
* ChromaDB status
* model provider status
* Groq availability
* active jobs
* failed jobs
* API health
* storage status
* system uptime
* queue status if a queue exists

Use actual health checks.

Do not hardcode "Online" indicators.

---

# 53. ADMIN ANALYTICS

Create useful analytics based on actual persisted data.

Examples:

* total users
* active users
* documents uploaded
* documents processed
* failed documents
* total queries
* queries per model
* model usage
* average response latency
* average retrieval latency
* embedding processing time
* PDF processing time
* error rate
* token usage where available
* storage usage

Do not fabricate analytics.

If a metric is unavailable, either implement the necessary instrumentation or clearly mark it as unavailable.

---

# 54. DATABASE IS THE SOURCE OF TRUTH

We are currently running the database through **Docker**.

Use the **existing database already configured in the project**.

Do NOT introduce another database unnecessarily.

First inspect:

* Docker Compose
* existing database container
* database type
* schema
* migrations
* connection configuration
* ORM/query layer
* existing models
* existing repositories

Then extend the current database architecture.

Do not replace the current database unless there is a critical architectural reason.

---

# 55. PERSIST ADMIN CONFIGURATION IN DATABASE

Admin-controlled configuration must be persisted in the existing database.

Examples:

```text
model configuration
RAG configuration
chunking configuration
retrieval configuration
reranking configuration
guardrail configuration
feature flags
system settings
user roles
permissions
```

Do not store important admin-controlled settings only in React state or localStorage.

The flow should be:

```text
Admin changes setting
        ↓
Frontend
        ↓
Admin API
        ↓
Validation
        ↓
Database
        ↓
Configuration service
        ↓
Runtime system
```

---

# 56. DATABASE SCHEMA

Design/extend the schema cleanly.

Potential entities include:

```text
users
roles
permissions
user_roles
documents
document_chunks
processing_jobs
model_configs
provider_configs
rag_configs
guardrail_configs
system_configs
usage_records
audit_logs
```

Only create tables/entities that are actually required.

Follow the existing project's database conventions.

Do not duplicate existing tables/entities.

---

# 57. DATABASE MIGRATIONS

Every schema modification must have a proper migration.

Do NOT manually modify production database schemas without migrations.

Ensure:

* migration is reproducible
* migration is version controlled
* existing data is preserved
* indexes are added where appropriate
* foreign keys are correct
* constraints are correct
* rollback considerations are documented

---

# 58. ADMIN AUDIT LOG

Every important administrative action should be auditable.

Record events such as:

```text
Admin changed model
Admin disabled user
Admin changed RAG configuration
Admin changed guardrail
Admin deleted document
Admin changed permissions
Admin changed system setting
```

Store appropriate information:

```text
actor
action
resource
resource_id
timestamp
result
metadata
```

Do not store sensitive secrets in audit logs.

---

# 59. RBAC

Implement proper Role-Based Access Control.

Do not rely only on hiding frontend buttons.

Frontend:

```text
Hide/disable unavailable actions
```

Backend:

```text
Actually enforce authorization
```

Every sensitive admin API must verify authorization server-side.

Example:

```text
User
 ↓
Authentication
 ↓
Role
 ↓
Permission
 ↓
Admin API
```

A normal user must not be able to call an admin API directly.

---

# 60. ADMIN API

Create a clean admin API layer.

For example:

```text
/api/admin/users
/api/admin/models
/api/admin/documents
/api/admin/jobs
/api/admin/rag
/api/admin/guardrails
/api/admin/system
/api/admin/analytics
/api/admin/audit-logs
```

Follow the project's existing API conventions rather than blindly using these exact paths.

All admin endpoints must have:

* authentication
* authorization
* validation
* structured errors
* logging
* audit logging where appropriate
* rate limiting where appropriate

---

# 61. DATABASE + CHROMADB CONSISTENCY

The relational/application database and ChromaDB must not drift unnecessarily.

For example:

```text
Document Database Record
        ↕
ChromaDB Collection / Vectors
```

When a document is deleted:

```text
Delete document
 ↓
Delete chunks
 ↓
Delete vectors
 ↓
Update job/index status
```

Handle partial failures.

For example:

```text
Database deletion succeeds
ChromaDB deletion fails
```

The system must detect/recover from this state rather than silently losing consistency.

Consider idempotent operations and reconciliation mechanisms.

---

# 62. ADMIN SETTINGS UI

Create a professional settings interface.

Organize settings into sections:

```text
General
Models
RAG
Retrieval
Embeddings
Reranking
Guardrails
Documents
Uploads
Performance
Security
System
```

Do not put 100 settings onto one page.

Use tabs/sections/cards/forms appropriately.

Show:

* current value
* allowed range
* description
* current source
* last updated
* updated by

Where appropriate, provide:

```text
Save
Cancel
Reset
Test Configuration
```

---

# 63. CONFIGURATION VALIDATION

Whenever an admin changes configuration:

```text
Admin Input
 ↓
Frontend validation
 ↓
Backend validation
 ↓
Business-rule validation
 ↓
Database
 ↓
Configuration reload
```

Do not trust frontend validation.

The backend must validate everything again.

Examples:

```text
Top-K > 0
chunk_size > 0
chunk_overlap < chunk_size
temperature within supported range
file size within limits
model exists
provider enabled
```

---

# 64. CONFIGURATION HOT RELOAD

Where practical, configuration changes should become active without restarting the entire application.

However:

**Do not force hot reload if the underlying library/model requires a restart.**

In such cases:

```text
Admin changes setting
 ↓
Persist in DB
 ↓
Mark configuration updated
 ↓
Reload/reinitialize safely
```

Document which settings require restart and which do not.

---

# 65. DOCKER

Use the existing Docker setup.

Inspect the current:

```text
docker-compose.yml
Dockerfile
environment configuration
database service
volumes
networks
health checks
```

Do not create duplicate database containers.

Ensure persistent volumes are configured correctly.

Ensure ChromaDB data is persistent.

Example conceptual architecture:

```text
Docker
│
├── Backend
├── Frontend
├── Existing Database
├── ChromaDB
└── Other existing services
```

Use the existing architecture wherever possible.

---

# 66. DATA PERSISTENCE

Important application state must survive:

```text
backend restart
frontend restart
Docker restart
container recreation
```

where persistence is expected.

Do not store critical data only in:

* React state
* browser localStorage
* temporary memory
* temporary files

Use the database and persistent storage appropriately.

---

# 67. ADMIN VS USER EXPERIENCE

Keep the user-facing application simple.

Do not expose every technical setting to normal users.

### Normal user

Should see:

```text
Chat
Documents
Upload
Models available to them
History
Settings
```

### Admin

Should additionally see:

```text
Users
Roles
Models
RAG
Embeddings
Reranking
Guardrails
Documents
Jobs
Analytics
System Health
Audit Logs
System Configuration
```

Permissions must determine what an admin can access.

---

# 68. DATABASE PERFORMANCE

Because the backend is database-heavy, optimize database access too.

Check:

* indexes
* N+1 queries
* unnecessary joins
* repeated queries
* connection pooling
* pagination
* transaction boundaries
* bulk operations
* query complexity

Do not load thousands of records into memory unnecessarily.

Use pagination for admin tables.

Use appropriate indexes for:

* user lookup
* document lookup
* processing status
* timestamps
* job status
* audit logs
* model configuration
* usage records

---

# 69. ADMIN ACTION SAFETY

Destructive operations should require confirmation where appropriate.

Examples:

```text
Delete user
Delete document
Delete collection
Reset configuration
Disable model
Clear processing jobs
```

For highly destructive operations, consider:

* confirmation dialog
* explicit resource name confirmation
* permission checks
* audit log
* soft-delete where appropriate

Do not make destructive actions accidentally clickable.

---

# 70. FINAL ADMIN VALIDATION

Before finishing, verify:

### Admin

* [ ] Admin login/authentication works
* [ ] RBAC works
* [ ] Admin APIs are protected
* [ ] Users can be managed
* [ ] Roles work
* [ ] Models can be managed
* [ ] RAG settings can be managed
* [ ] Guardrails can be managed
* [ ] Documents can be managed
* [ ] Processing jobs can be monitored
* [ ] System health uses real checks
* [ ] Analytics use real data
* [ ] Audit logs work

### Database

* [ ] Existing Docker database is reused
* [ ] Schema changes have migrations
* [ ] Admin settings persist
* [ ] User data persists
* [ ] Documents persist
* [ ] Jobs persist
* [ ] Configuration persists
* [ ] Audit logs persist
* [ ] Indexes are appropriate
* [ ] No unnecessary duplicate database exists

### ChromaDB

* [ ] Persistence works
* [ ] Documents are indexed
* [ ] Document deletion removes vectors
* [ ] Metadata is correct
* [ ] Retrieval works
* [ ] Database/Chroma consistency is handled

### Docker

* [ ] Existing services still work
* [ ] Database survives restart
* [ ] ChromaDB survives restart
* [ ] Volumes are correct
* [ ] Health checks work
* [ ] Environment variables are correct

---

# 71. FINAL ARCHITECTURE TARGET

The final architecture should conceptually look like:

```text
                         ┌──────────────────────┐
                         │      Frontend        │
                         │                      │
                         │ User UI              │
                         │ Admin UI             │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      API Layer       │
                         │ Auth / RBAC / Valid. │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼──────────────────┐
                  │                 │                  │
                  ▼                 ▼                  ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ User Service │  │Document Svc  │  │ Admin Service│
          └──────────────┘  └──────┬───────┘  └──────┬───────┘
                                   │                  │
                                   ▼                  ▼
                          ┌────────────────────────────────┐
                          │        Existing Database       │
                          │          Docker DB              │
                          └────────────────────────────────┘
                                   │
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Document Worker │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
               PDF Extract      Chunking      Embeddings
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                              ┌──────────┐
                              │ ChromaDB │
                              └────┬─────┘
                                   │
                                   ▼
                              Retrieval
                                   │
                                   ▼
                            Cosine Similarity
                                   │
                                   ▼
                                Top-K
                                   │
                                   ▼
                              Re-ranking
                                   │
                                   ▼
                             Context Builder
                                   │
                                   ▼
                             Model Router
                                   │
                                   ▼
                              Groq Models
                                   │
                                   ▼
                             Output Guardrails
                                   │
                                   ▼
                                Response
```

This architecture must remain flexible enough that:

```text
Groq
  ↓
Future trained model
```

can happen without rewriting the entire application.

---

# 72. FINAL RULE

The Admin Panel is NOT an independent mock interface.

Every important admin action must have a real end-to-end path:

```text
UI
 ↓
API
 ↓
Authorization
 ↓
Validation
 ↓
Service
 ↓
Database
 ↓
Runtime Configuration
 ↓
Actual System Behavior
```

If changing a setting in the Admin Panel does not actually change system behavior, the implementation is incomplete.

Likewise, if information displayed in the Admin Panel is not coming from the actual database/system state, it is incomplete.

Build the system as a **real production control plane**, not a visual dashboard.



You are a senior React Native engineer and software architect.

Your task is to **fully audit, fix, integrate, and production-harden the entire React Native application inside the `mobile/` folder** so that it works correctly with the existing project, backend, database, authentication, APIs, and overall system architecture.

Do NOT blindly rewrite the mobile application. First understand the existing repository and then make the required changes.

---

# 1. FIRST: UNDERSTAND THE ENTIRE PROJECT

Before modifying anything, inspect the complete repository.

Analyze:

* `mobile/`
* backend
* API routes/controllers
* database configuration
* Docker configuration
* authentication system
* environment variables
* API schemas
* file/PDF upload system
* document processing flow
* vector database / ChromaDB integration
* embeddings
* search/RAG flow
* admin functionality
* existing web/frontend if present
* shared types/models
* configuration files
* package versions
* existing documentation

Understand the actual data flow:

```text
Mobile App
   ↓
API
   ↓
Backend Services
   ↓
Database
   ↓
Document Processing
   ↓
Chunking
   ↓
Embeddings
   ↓
ChromaDB / Vector Search
   ↓
Cosine Similarity
   ↓
Top-K Retrieval
   ↓
Re-ranking
   ↓
LLM / Response
   ↓
Mobile App
```

Do not assume APIs, routes, models, authentication mechanisms, or database schemas.

Use the existing implementation as the source of truth.

---

# 2. AUDIT THE MOBILE FOLDER COMPLETELY

Inspect every relevant file inside `mobile/`.

Check:

* `package.json`
* lock files
* React Native version
* Expo configuration, if applicable
* Metro configuration
* Babel configuration
* TypeScript configuration
* ESLint
* Prettier
* Android configuration
* iOS configuration
* assets
* navigation
* screens
* components
* hooks
* services
* API clients
* state management
* storage
* authentication
* environment configuration
* permissions
* upload functionality
* error handling
* loading states
* caching
* networking
* types
* tests
* build configuration

Identify:

### Critical problems

* broken imports
* missing dependencies
* incompatible package versions
* incorrect React Native APIs
* incorrect navigation configuration
* broken native configuration
* incorrect environment variables
* hardcoded localhost URLs
* incorrect API endpoints
* incorrect request/response formats
* authentication failures
* state management problems
* race conditions
* memory leaks
* broken file uploads
* Android/iOS incompatibilities
* TypeScript errors
* runtime crashes
* build failures

### Architecture problems

* duplicated API logic
* business logic inside UI components
* poor folder organization
* unnecessary re-renders
* tightly coupled components
* insecure token handling
* missing request cancellation
* poor error handling
* missing retry strategy
* inconsistent loading/error states
* unnecessary network requests

---

# 3. VERIFY MOBILE ↔ BACKEND INTEGRATION

Do not just make the frontend compile.

Verify every API integration against the actual backend implementation.

For every endpoint used by the mobile app, verify:

* HTTP method
* URL
* request body
* query parameters
* headers
* authentication
* content type
* multipart/form-data handling
* response structure
* error structure
* status codes
* pagination
* timeout behavior

Create a clear API service layer.

For example:

```text
mobile/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── search.ts
│   │   ├── chat.ts
│   │   └── admin.ts
```

Do NOT hardcode backend URLs throughout the application.

Centralize configuration.

---

# 4. ENVIRONMENT CONFIGURATION

Make the mobile application work correctly across:

* local development
* Android emulator
* physical Android device
* iOS simulator
* physical iOS device
* staging
* production

Handle the difference between:

```text
localhost
127.0.0.1
Android emulator
iOS simulator
physical device
Docker host
production API
```

Do not leave:

```text
http://localhost:8000
```

hardcoded unless it is explicitly intended for the current environment.

Create a clean environment/configuration strategy.

---

# 5. AUTHENTICATION

Inspect the existing authentication implementation and integrate the mobile application correctly.

Implement/fix:

* login
* registration if supported
* logout
* token persistence
* token restoration on app startup
* authenticated API requests
* token expiration
* refresh token flow if supported
* unauthorized handling
* protected screens
* authentication loading state

Use secure mobile storage where appropriate.

Do NOT store sensitive authentication information insecurely.

The navigation flow should correctly handle:

```text
App Launch
    ↓
Restore Session
    ↓
Authenticated?
 ┌──YES──────→ Main Application
 │
 NO
 ↓
Login
```

---

# 6. NAVIGATION

Audit the complete navigation architecture.

Ensure:

* authenticated routes
* public routes
* protected routes
* nested navigation
* back navigation
* deep linking if required
* loading states
* logout navigation
* error screens
* 404/not-found handling where applicable

Navigation must not depend on fragile UI state.

---

# 7. DOCUMENT / PDF UPLOAD

The project requires document/PDF functionality.

Make the mobile implementation fully compatible with the backend document-processing pipeline.

Verify:

```text
Select PDF
   ↓
Validate File
   ↓
Upload
   ↓
Backend
   ↓
PDF Extraction
   ↓
Chunking
   ↓
Embedding
   ↓
ChromaDB
   ↓
Ready for Search
```

Implement proper:

* file picker
* PDF validation
* file size validation
* MIME type validation
* upload progress
* cancellation if supported
* retry
* error handling
* success state
* processing state
* processing failure state

Do not block the UI during large uploads or processing.

---

# 8. SEARCH / RAG / CHAT EXPERIENCE

Connect the mobile UI to the actual backend RAG pipeline.

The mobile app should correctly support whatever the project actually implements, including:

* document selection
* search
* semantic search
* cosine similarity
* top-K retrieval
* re-ranking
* chat/query interface
* citations/sources
* document references
* loading states
* streaming responses if backend supports it
* error states

Do not implement fake/mock search results if real backend functionality exists.

---

# 9. STATE MANAGEMENT

Audit the current state management approach.

Use the project's existing approach if it is reasonable.

Otherwise establish a clean structure.

Separate:

```text
Server State
UI State
Authentication State
Form State
Persistent State
```

Avoid putting everything into one global store.

Prevent unnecessary re-renders.

---

# 10. UI/UX

Make the mobile application production-quality while keeping the UI simple and aligned with the project's purpose.

Prioritize:

* clean layout
* readable typography
* consistent spacing
* accessible controls
* responsive layouts
* proper loading indicators
* skeleton states where useful
* empty states
* error states
* success states
* keyboard handling
* safe areas
* dark/light mode if project supports it
* Android back button behavior
* touch-friendly controls

Do NOT over-design the application.

The UI should feel like a real production product, not an AI-generated demo.

---

# 11. PERFORMANCE

Optimize the React Native application.

Check:

* unnecessary renders
* FlatList usage
* large lists
* image loading
* PDF/file handling
* API calls
* caching
* navigation performance
* memory usage
* startup time
* bundle size
* expensive computations
* unnecessary state updates

Use:

* memoization only where beneficial
* virtualization
* pagination
* request cancellation
* debouncing for search
* caching where appropriate
* lazy loading where appropriate

Do not add optimization blindly.

Measure/identify the bottleneck first.

---

# 12. OFFLINE / NETWORK RESILIENCE

Handle real-world mobile network conditions.

Implement appropriate:

* connection failure handling
* request timeout
* retry strategy
* offline UI
* duplicate request prevention
* upload retry
* graceful API failures

The app should never simply freeze when the backend is unavailable.

---

# 13. SECURITY AUDIT

Check the mobile application for:

* exposed API secrets
* hardcoded credentials
* insecure token storage
* sensitive logs
* insecure URLs
* debug endpoints
* unnecessary permissions
* unsafe file handling
* insecure API requests
* leaked environment variables

Never put backend secrets or LLM API keys inside the mobile application.

The mobile app should communicate only with the backend for protected operations.

---

# 14. TYPESCRIPT

Make the mobile application strongly typed.

Remove unnecessary:

```typescript
any
```

Create proper types for:

* API responses
* API requests
* authentication
* users
* documents
* search results
* chat messages
* citations
* errors
* pagination
* upload states

Where possible, keep mobile types aligned with backend schemas.

---

# 15. ERROR HANDLING

Create a consistent error-handling architecture.

Handle:

* network errors
* HTTP errors
* authentication errors
* validation errors
* file errors
* timeout errors
* backend errors
* unexpected errors

Users should see understandable messages.

Developers should have useful logs in development without exposing sensitive information.

---

# 16. LOADING / EMPTY / ERROR STATES

Every major screen must have proper states:

```text
Loading
Empty
Success
Error
Refreshing
Submitting
Offline
```

Do not leave screens blank while requests are running.

---

# 17. TESTING

Inspect the existing tests and add/fix tests where necessary.

At minimum test:

* API client
* authentication
* navigation guards
* document upload
* search
* important state logic
* critical components

Also verify the application can build successfully.

---

# 18. BUILD AND RUNTIME VALIDATION

After making changes:

Run the appropriate checks available in the repository.

Examples:

```bash
npm install
npm run lint
npm run typecheck
npm test
npx react-native start
npx react-native run-android
```

Use the project's actual commands instead of blindly running these.

If Expo is being used, use the appropriate Expo commands.

Fix every error you encounter.

Do not stop after fixing only TypeScript errors.

---

# 19. DO NOT BREAK THE BACKEND

The mobile application must adapt to the existing backend architecture.

Do not modify backend APIs simply to make the mobile app easier unless:

1. the backend itself is demonstrably broken, or
2. a required integration is missing.

If backend changes are necessary:

* explain why
* keep them backward compatible where possible
* update API documentation/types
* test the affected flow

---

# 20. ADMIN FUNCTIONALITY

The project requires administrative functionality.

Inspect the existing backend/admin capabilities and determine which functionality should be available from mobile.

If admin functionality is intended for mobile, implement it properly.

Examples may include:

* document management
* user management
* document processing status
* system status
* search/index status
* upload management
* deletion
* re-indexing
* analytics
* configuration

Do not invent admin APIs.

Use the APIs that actually exist.

---

# 21. PROJECT STRUCTURE

If the current structure is messy, reorganize it into a maintainable structure similar to:

```text
mobile/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── validation/
│
├── android/
├── ios/
├── tests/
├── app.json / app.config.*
├── package.json
├── tsconfig.json
└── ...
```

Only reorganize when it improves maintainability.

---

# 22. REAL DATA ONLY

Remove or isolate:

* fake API responses
* placeholder data
* dummy authentication
* mock search results
* hardcoded documents
* temporary URLs
* development-only hacks

Unless they are explicitly required for tests.

The production application must use the real backend.

---

# 23. FINAL END-TO-END VALIDATION

After implementation, verify this complete flow:

```text
Install App
    ↓
Launch
    ↓
Authentication
    ↓
Home
    ↓
Upload PDF
    ↓
Backend receives PDF
    ↓
PDF extraction
    ↓
Chunking
    ↓
Embedding generation
    ↓
ChromaDB storage
    ↓
Document becomes searchable
    ↓
Mobile search/chat
    ↓
Backend semantic search
    ↓
Cosine similarity
    ↓
Top-K retrieval
    ↓
Re-ranking
    ↓
Answer + sources
    ↓
Display response in mobile
```

Also verify:

```text
Logout
    ↓
Session cleared
    ↓
Protected screens inaccessible
    ↓
Login again
    ↓
Session restored
```

---

# 24. IMPORTANT DEVELOPMENT RULES

Follow these rules throughout the task:

1. **Inspect before modifying.**
2. Do not rewrite working code unnecessarily.
3. Do not invent APIs.
4. Do not invent backend behavior.
5. Do not hardcode secrets.
6. Do not hardcode production URLs.
7. Do not use mock data for production flows.
8. Keep changes modular.
9. Preserve backward compatibility where possible.
10. Prefer simple, maintainable solutions.
11. Fix root causes rather than symptoms.
12. Do not hide errors with empty catches.
13. Do not suppress TypeScript errors.
14. Do not disable ESLint rules just to make the build pass.
15. Do not use `any` as a shortcut.
16. Keep UI and business logic separated.
17. Follow the existing project's conventions where they are good.
18. Document important architectural decisions.

---

# 25. FINAL REPORT

When finished, provide a concise but complete implementation report containing:

### A. What you inspected

List the major parts of the project you analyzed.

### B. Problems found

Group them into:

* Critical
* High
* Medium
* Low

### C. Changes made

Explain exactly what was fixed/implemented.

### D. Mobile ↔ Backend integration

List the important API flows and confirm how they connect.

### E. Architecture changes

Explain any restructuring.

### F. Security improvements

### G. Performance improvements

### H. Testing performed

Show the commands/checks executed and their results.

### I. Remaining issues

Clearly identify anything that could not be completed and why.

### J. Production readiness

Give a final assessment:

```text
Build: PASS/FAIL
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Tests: PASS/FAIL
Android: PASS/FAIL
iOS: PASS/FAIL
Backend Integration: PASS/FAIL
Authentication: PASS/FAIL
PDF Upload: PASS/FAIL
Search/RAG: PASS/FAIL
Production Readiness: READY / NEEDS WORK
```

Most importantly:

**Do not merely tell me what should be fixed. Actually inspect the repository and implement the fixes.**

Work incrementally, validate each major change, and leave the `mobile/` application in a state where it can realistically be used as the production mobile client for this project.
