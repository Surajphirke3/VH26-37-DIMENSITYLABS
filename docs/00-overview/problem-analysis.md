# Problem Analysis

## Document Purpose

This document performs a structured decomposition of the hackathon problem statement. It identifies the core problem, extracts all stated and implied requirements, classifies technical difficulty, and surfaces hidden constraints that will shape architectural decisions.

---

## 1. Core Problem Statement

Factory floor technicians need to diagnose machine faults rapidly and accurately. Their primary information source is machine manuals — documents that are typically:
- Long (100–1000+ pages per manual)
- Dense with technical tables, diagrams, and error code appendices
- Stored as scanned PDFs with variable OCR quality
- Numerous (a large factory may have dozens of machines with separate manuals)
- Not full-text searchable in an integrated way

The technician at the machine face has an error code or a symptom, needs a corrective action, and has no efficient mechanism to retrieve it. The system must bridge the gap between the technician's query and the relevant manual content.

---

## 2. Background and Context

### 2.1 The Operational Environment

Factory floor conditions introduce constraints that are not present in typical knowledge-base use cases:

- **Time pressure**: Machine downtime has a direct, measurable cost. Retrieval must be fast — seconds, not minutes.
- **Standing / mobile use**: Technicians are typically on their feet, next to equipment. The interface must work on a tablet or rugged mobile device.
- **Noise and cognitive load**: In a factory environment, a technician cannot read a lengthy AI-generated essay. Answers must be structured and scannable.
- **Safety criticality**: Incorrect troubleshooting actions (wrong procedure, wrong component, wrong sequence) can cause injury or equipment damage.

### 2.2 The Manual Corpus Characteristics

- Manuals arrive as PDF files and may be born-digital (vector text) or scanned (raster images requiring OCR).
- Error codes are referenced in multiple places: error tables (code + description), troubleshooting sections (code + cause + action), and body text (narrative references).
- Some manuals use proprietary section numbering; others use continuous page numbers; some use both.
- A single manual may cover multiple machine variants or model revisions.
- Diagrams and images are common and may contain critical information (wiring diagrams, parts diagrams) that cannot be extracted as text.

### 2.3 The Same-Code/Different-Machine Problem

This is the most technically significant aspect of the problem. In industrial equipment:

- Error codes are assigned by individual manufacturers without industry-wide standardisation.
- It is common for `E-501` to appear in both a CNC milling machine manual and a hydraulic press manual from different manufacturers, with completely different meanings.
- Even within the same manufacturer, different product lines may reuse error codes with different meanings.
- Even within the same product line, error code behaviour may differ across firmware versions.

**A system that retrieves `E-501` documentation without knowing which machine the technician is standing in front of is functionally dangerous.** Providing corrective steps for the wrong machine is not a minor UX failure — it is a safety hazard.

---

## 3. Users

| User | Environment | Query Style | Critical Need |
|---|---|---|---|
| Factory Floor Technician | Shop floor, under time pressure | Short: error codes, brief symptom descriptions | Immediate, machine-specific, actionable answer |
| Senior Maintenance Engineer | Office or workshop, more time | Multi-part, follow-up conversation | Deep diagnostic reasoning, cross-manual queries |
| Maintenance Manager | Office | Administrative | Manual upload, usage tracking, coverage verification |
| System Administrator | IT/platform context | Administrative | User management, ingestion health, system reliability |

---

## 4. Inputs the System Must Accept

| Input Type | Example | Notes |
|---|---|---|
| Error code | `E-501`, `ERR-2045`, `F0072` | Format varies by manufacturer; may include letters, digits, hyphens |
| Natural-language symptom | "The spindle is making a grinding noise and slowing down" | Requires semantic search, not keyword match |
| Natural-language question | "What is the recommended lubrication schedule for the gearbox?" | May not reference an error code at all |
| Machine identifier | "Haas VF-2", "Mazak Integrex i-400" | Used to scope retrieval |
| Follow-up question in a conversation | "What about the secondary sensor?" | Requires prior conversation context |
| PDF manual (ingestion) | `haas_vf2_operator_manual.pdf` | Admin upload, ingestion pipeline input |

---

## 5. Outputs the System Must Produce

| Output Type | Description |
|---|---|
| Structured answer | Probable cause, corrective steps, safety warnings — each section clearly delineated |
| Inline citations | References to specific manual, section, page, and chunk from which each statement derives |
| Clarifying question | When machine scope is ambiguous, a focused question to resolve it |
| Confidence indicator | A human-readable or numeric signal of how well the evidence supports the answer |
| Graceful refusal | When evidence is insufficient, an explanation of what is missing and what the technician should do instead |
| Ingestion confirmation | Admin notification that a manual has been processed and is queryable |

---

## 6. Required System Capabilities

### 6.1 PDF Processing
- Extract text from born-digital PDFs (text layer extraction)
- Perform OCR on scanned PDFs (image-based PDFs)
- Detect and handle tables specially (error code tables, parameter tables)
- Extract or flag embedded images (diagrams, wiring schematics)
- Associate extracted text with source metadata: manual name, machine model, section, page number

### 6.2 Chunking
- Divide extracted text into retrievable units (chunks)
- Chunks must be semantically coherent — not split mid-sentence or mid-procedure
- Chunks must preserve their source provenance (manual + page + section)
- Tables must be chunked to preserve row-column relationships, not split across chunks
- Chunk size must balance retrieval precision (smaller) against context completeness (larger)

### 6.3 Embeddings
- Convert chunks to dense vector representations for semantic similarity search
- Embedding model must handle technical vocabulary: error codes, model numbers, part names
- Embeddings must be stored in a queryable vector store

### 6.4 Hybrid Retrieval
- Semantic search (vector similarity) alone is insufficient for error codes: `E-501` and `E-502` are lexically similar but semantically unrelated in embedding space
- BM25 or similar sparse/keyword retrieval must complement semantic search
- The two retrieval signals must be combined (Reciprocal Rank Fusion or weighted merge)
- Retrieval must be filterable by machine/manual metadata

### 6.5 Reranking
- Retrieved chunks must be reranked for relevance to the specific query
- A cross-encoder or reranking model should be applied post-retrieval to improve precision
- The final set of chunks passed to the LLM must be the highest-relevance subset

### 6.6 Evidence Validation
- Before generating an answer, assess whether retrieved chunks are sufficient to support one
- Define evidence sufficiency criteria: minimum number of relevant chunks, minimum relevance score, absence of contradiction
- If evidence is insufficient, the system must refuse rather than generate

### 6.7 Context Assembly
- Construct the LLM prompt from: system instructions + retrieved chunks (with provenance) + conversation history + current query
- Manage token budget: avoid exceeding the LLM context window
- Preserve chunk provenance in the context so the LLM can produce accurate citations

### 6.8 LLM Generation
- Generate a structured answer: cause, steps, warnings, citations
- Constrain generation to the provided context — the LLM must not use parametric knowledge not present in retrieved chunks
- Produce citations in a standardised format referencing source chunk metadata

### 6.9 Hallucination Control
- Post-generation, verify that each cited source is actually present in the retrieved chunks
- Detect statements in the generated answer that are not supported by any retrieved chunk
- Flag or suppress unsupported statements

### 6.10 Machine Disambiguation
- When a query does not specify a machine (or specifies it ambiguously), detect this condition
- Query the vector store to identify which machines have documentation matching the query
- Generate a clarifying question listing the matching machines
- Resume retrieval after the technician selects

### 6.11 Conversation Management
- Maintain conversation history within a session
- Carry machine context across turns so a follow-up question does not lose the machine scope
- Handle session expiry and context loss gracefully

---

## 7. Hard Technical Areas

### 7.1 Same Error Code, Different Machines (Critical)
The retrieval pipeline must enforce machine-level filtering. Without this, the system will confidently answer with documentation from the wrong machine. This requires:
- Metadata tagging of every chunk with its source machine model(s)
- Machine-aware query construction: the query must carry a machine identifier as a filter
- Disambiguation logic when the machine identifier is missing from the query
- Testing methodology that specifically validates cross-machine isolation

### 7.2 Hybrid Retrieval Calibration
Error codes are short, alphanumeric tokens that may not embed distinctively in a semantic space. Pure vector search may rank a chunk mentioning `E-502` higher than one mentioning `E-501` if the surrounding context is more relevant. BM25 retrieval must be tuned to give strong weight to exact token matches on error codes.

### 7.3 Table Extraction and Chunking
Error code reference tables are typically formatted as multi-column tables: Code | Description | Probable Cause | Corrective Action. Standard PDF text extraction flattens these into linear text, losing the row-column structure. Chunking strategies must detect tabular content and preserve row integrity.

### 7.4 Hallucination in Structured Output
LLMs instructed to produce structured output (JSON or templated sections) have a known tendency to fill in fields with plausible-sounding content even when the retrieved context does not support it. The corrective steps field is particularly risky. Post-generation validation must check each statement against the retrieved evidence.

### 7.5 Citation Accuracy
Generating correct citations (manual name, section, page) requires that chunk metadata is passed into and preserved through the generation step. The LLM must be prompted to reference specific chunk identifiers, and the post-processing layer must validate that referenced chunk IDs correspond to actually-retrieved chunks.

### 7.6 OCR Quality Variation
Scanned manuals may have OCR errors that corrupt error codes: `E-501` might be extracted as `E-5O1` (letter O instead of zero), causing retrieval failures. The system needs either OCR correction or fuzzy matching to handle this.

---

## 8. Bonus Features (From Problem Statement)

| Feature | Technical Implication |
|---|---|
| Multi-turn conversation | Session state management, context window management, machine-scope preservation across turns |
| Confidence scoring on answers | Quantitative signal derivable from reranker scores and evidence sufficiency metrics |
| Follow-up question suggestions | LLM-generated follow-up prompts based on answer gaps or related troubleshooting paths |
| Manual coverage gaps detection | Analysis of query logs vs. available documentation to identify frequently-queried topics with no manual coverage |
| Admin upload of new manuals | Ingestion pipeline with progress tracking and error reporting |

---

## 9. Deliverables (Hackathon Context)

Based on a standard RAG hackathon problem statement, expected deliverables include:

1. A working end-to-end system demonstrating the full pipeline from query to cited answer
2. A UI that a non-technical technician could plausibly use on a factory floor
3. Demonstration of the machine disambiguation flow (same error code, two machines)
4. Demonstration of graceful refusal (query outside manual coverage)
5. Documentation: architecture, design decisions, known limitations
6. Code repository with setup instructions

---

## 10. Success Criteria

| Criterion | Measurable Signal |
|---|---|
| Correct machine-specific answer | Answer for `E-501` on Machine A does not contain information from Machine B manual |
| Grounded answer | Every statement in the answer is traceable to a retrieved chunk |
| Citation accuracy | Cited page/section matches the actual source chunk |
| Latency | End-to-end response time under 5 seconds for 95% of queries |
| Graceful refusal | System refuses and explains when queried about topics not in any manual |
| Disambiguation | System asks a clarifying question when machine scope is ambiguous |
| Ingestion | New manual is queryable within 5 minutes of upload |

---

## 11. Safety Implications

This system operates in a safety-critical context. Key implications:

- **Wrong machine answer**: If a technician executes corrective steps from the wrong machine's manual, they may: damage the wrong component, create an electrical hazard, fail to address the actual fault (machine continues operating unsafely), or void warranty/service contracts.
- **Hallucinated corrective action**: A step that was never in any manual — generated purely from LLM parametric knowledge — could be incorrect, dangerous, or both.
- **Missing safety warning**: A manual section that includes a caution or warning note must carry that note into the answer. If chunking or generation strips out the safety warning, the technician may proceed without critical safety information.
- **False confidence**: A low-confidence answer presented as definitive may cause a technician to skip manual verification steps they would otherwise take.

**Design implication**: The system must present answers as decision support, not as authoritative commands. Every answer must be presented with its source citations and confidence level. The UI should include persistent messaging that the technician should verify with the manual or a qualified engineer for safety-critical operations.

---

## 12. Hidden Requirements (Derived by Analysis)

These requirements are not stated explicitly in the problem but are necessary for the system to function correctly:

| Hidden Requirement | Why It Is Necessary |
|---|---|
| Chunk provenance must survive the full pipeline | Citations cannot be generated at response time if provenance was not stored at ingestion time |
| Machine model normalisation | "Haas VF-2", "haas vf2", "HAAS VF2" must resolve to the same machine record |
| Error code normalisation | `E-501`, `E501`, `Error 501` must be treated as equivalent query terms |
| Context window budget management | Without token counting and truncation, the LLM prompt will overflow for complex queries |
| Hallucination detection must happen post-generation | The LLM cannot reliably self-report whether its output is grounded |
| Session isolation | Two concurrent users must not share conversation state or see each other's queries |
| Ingestion idempotency | Re-uploading the same manual must not create duplicate chunks in the vector store |
| Cross-section answers | Corrective steps for an error code may be in a different section than the error code table; the retrieval strategy must be able to retrieve both |
