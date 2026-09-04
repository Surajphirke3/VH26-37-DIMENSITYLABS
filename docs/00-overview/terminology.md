# Terminology

## Purpose

This glossary defines terms used throughout MechMind documentation. Terms are divided into three categories: domain terms (factory maintenance context), AI/ML system terms (RAG pipeline), and MechMind-specific terms. Understanding these definitions is required for consistent communication across the team and with stakeholders.

---

## Domain Terms

### Error Code
A short alphanumeric identifier that a machine's control system displays when it detects an abnormal condition. Error codes are defined by the machine manufacturer and documented in the service or operator manual. The same error code string (e.g., `E-501`) may have entirely different meanings on different machines. Also referred to as: fault code, alarm code, error number.

### Machine Model
The specific product model identifier for a piece of industrial equipment. Example: "Haas VF-2", "Mazak Integrex i-400", "Fanuc 30i-B CNC Controller". A single machine model may be covered by one or more manuals (operator manual, maintenance manual, programming manual).

### Machine Manual
A technical document produced by the machine manufacturer that covers operation, maintenance, troubleshooting, and repair of a specific machine model. In MechMind, manuals are the sole source of ground truth for answers.

### Corrective Action
The specific steps a technician should take to resolve a fault condition described by an error code or symptom. Corrective actions are documented in the troubleshooting sections of machine manuals.

### Probable Cause
The reason a fault condition occurred. A single error code may have multiple probable causes listed in the manual (e.g., `E-501` may list overtemperature, faulty sensor, or blocked cooling duct as probable causes).

### Safety Warning
A caution, warning, or danger note in a manual that indicates a safety hazard associated with a procedure or condition. MechMind must surface safety warnings prominently whenever they appear in retrieved content.

### Technician
A person working on the factory floor who is responsible for diagnosing and repairing machine faults. Technicians are the primary users of MechMind.

### Maintenance Manager
A person responsible for overseeing maintenance operations, managing technician assignments, and ensuring machine availability. In MechMind, maintenance managers may also upload manuals.

---

## AI and ML System Terms

### RAG (Retrieval-Augmented Generation)
An architecture pattern where a language model's output is grounded in documents retrieved from an external knowledge store at query time, rather than relying solely on information encoded in the model's parameters during training. In MechMind, the knowledge store is the indexed collection of machine manuals.

### Chunk
A discrete unit of text extracted from a manual and stored in the vector store. Chunks are the atomic units of retrieval. A chunk typically represents a paragraph, a set of related sentences, or a table row (or set of rows). Each chunk is stored with its source metadata: manual name, machine model, section title, page number, and a unique chunk ID.

### Chunk ID
A unique identifier assigned to each chunk at ingestion time. Chunk IDs are used in citations to trace a specific statement in an answer back to a specific location in a specific manual.

### Embedding
A numerical vector representation of a text chunk (or query) that encodes its semantic meaning. Embeddings are produced by an embedding model and stored in the vector store. The distance between two embeddings in vector space is a proxy for semantic similarity.

### Embedding Model
The model responsible for converting text into embeddings. MechMind uses a pretrained dense embedding model (e.g., `text-embedding-3-small`, `bge-large-en-v1.5`) for this purpose. The same model must be used for both ingestion-time chunk embedding and query-time query embedding.

### Vector Store
A specialised database that stores embeddings and supports fast nearest-neighbour search. MechMind uses the vector store to find chunks whose embeddings are closest to the query embedding. Examples: Chroma, Qdrant, Pinecone, Weaviate.

### Semantic Search
Retrieval based on meaning similarity, using embedding vectors. A semantic search for "spindle overheating" will find chunks describing "high temperature at the cutting tool" even if the words do not match exactly. Semantic search alone may not reliably find exact token matches like specific error codes.

### Sparse Retrieval / BM25
A keyword-based retrieval method (Best Match 25) that scores documents based on term frequency and inverse document frequency (TF-IDF variant). BM25 excels at exact token matching and is used in MechMind to reliably retrieve chunks containing specific error codes. Contrasted with dense (semantic) retrieval.

### Hybrid Retrieval
The combination of semantic search and sparse (BM25) retrieval. Hybrid retrieval returns results that are relevant either by meaning (semantic) or by exact term match (sparse). The two result sets are merged using a ranking fusion algorithm. MechMind uses hybrid retrieval to handle both natural-language symptom queries and exact error code lookups.

### Reciprocal Rank Fusion (RRF)
A rank aggregation algorithm used in hybrid retrieval to merge two ranked lists (semantic results and BM25 results) into a single unified ranking. RRF assigns each document a score of `1 / (k + rank)` in each list and sums these scores across lists. It is robust to scale differences between the two retrieval systems.

### Reranking
A second-pass relevance scoring step applied to the initial retrieval results. A reranking model (typically a cross-encoder) computes a relevance score for each (query, chunk) pair and reorders the retrieved chunks by this score. Reranking is more accurate than the initial retrieval but too slow to apply to the entire corpus; it is applied only to the top-N retrieved chunks.

### Cross-Encoder
A model architecture used for reranking that takes both the query and a candidate chunk as joint input and produces a relevance score. Cross-encoders are more accurate than bi-encoders (used for embedding) but require a separate inference call per (query, chunk) pair, making them suitable only for the reranking stage.

### Context Window
The maximum amount of text (measured in tokens) that an LLM can process in a single prompt-response cycle. MechMind must manage its context budget to ensure that the system prompt, conversation history, retrieved chunks, and instructions all fit within this limit.

### Token
The basic unit of text processed by LLMs. A token is approximately 3–4 characters or 0.75 words in English. Token counts are used for context window budget management and API cost estimation.

### LLM (Large Language Model)
The generative model responsible for producing the final answer in MechMind. The LLM receives a prompt containing the system instructions, retrieved chunks, conversation history, and current query, and generates a structured answer. The LLM is not the source of truth — retrieved chunks are.

### Parametric Knowledge
Information encoded in an LLM's model weights during training. This is distinct from retrieved (contextual) knowledge. MechMind's answer generation is intentionally designed to suppress parametric knowledge and rely only on retrieved chunks. Use of parametric knowledge for answer generation is the primary failure mode leading to hallucinations in this system.

### Hallucination
A statement in an LLM-generated answer that is not supported by the provided retrieved context (chunks) and may be factually incorrect. Hallucination occurs because LLMs blend parametric and contextual knowledge. In MechMind, hallucination on corrective action steps is a safety hazard.

### Grounded Answer
An answer in which every substantive statement can be traced to a specific retrieved chunk, and the corresponding citation is accurate. Grounded answers contrast with hallucinated answers.

### Context Assembly
The process of constructing the final LLM prompt from: system prompt, conversation history (prior turns), retrieved and reranked chunks (with provenance metadata), and the current user query. Context assembly must also manage the token budget.

### System Prompt
The fixed set of instructions passed to the LLM at the beginning of every request. In MechMind, the system prompt instructs the LLM to: answer only from provided context, produce a structured output format, include citations using chunk IDs, and refuse when context is insufficient.

---

## MechMind-Specific Terms

### Machine Scope
The specific machine model to which a retrieval query is restricted. If a query has a machine scope of "Haas VF-2", the vector store filter ensures only chunks sourced from Haas VF-2 manuals are retrieved. Machine scope is the primary mechanism for preventing cross-machine answer contamination.

### Machine Disambiguation
The process of identifying and resolving ambiguity in machine scope. If a query contains an error code that appears in multiple machines' manuals and the user has not specified which machine they are working on, MechMind triggers a disambiguation flow: it asks the user a focused clarifying question listing the candidate machines.

### Ambiguity Detection
The detection of cases where a query is underspecified — typically when the error code or symptom appears in more than one machine's manual — and machine scope has not been established. Ambiguity detection triggers the disambiguation flow.

### Evidence Sufficiency
A binary or graded assessment of whether the retrieved chunks are sufficient to support an answer. Evidence is considered sufficient if: at least one chunk scores above the relevance threshold, the chunks provide enough information to address the query, and no two retrieved chunks directly contradict each other. When evidence is insufficient, MechMind refuses to answer.

### Confidence Score
A numeric score (0.0–1.0) attached to each answer, derived from the reranker relevance scores of the supporting chunks. A confidence score of 0.90 indicates that the retrieved evidence is highly relevant to the query. A score below 0.60 triggers a refusal.

### Refusal
A response in which MechMind declines to generate an answer because evidence is insufficient. A refusal is not a system failure — it is a designed safety behaviour. A refusal response must: state that the query could not be answered from available manuals, explain why (no relevant chunks found / relevance threshold not met / contradictory evidence), suggest what the technician should do instead (consult original manual, contact manufacturer, escalate to senior engineer).

### Citation
A structured reference in an answer pointing to the specific chunk(s) used to generate a statement. A citation includes: Manual name, Machine model, Section title, Page number, Chunk ID. Example: `[Haas VF-2 Operator Manual, Section 12.3 "Spindle Alarms", p. 217, Chunk ID: hvf2-p217-02]`

### Provenance
The complete metadata trail associated with a chunk or an answer statement, allowing it to be traced back to its origin document, section, and page. Provenance is established at ingestion time and preserved through the retrieval and generation pipeline.

### Ingestion Pipeline
The sequence of operations that processes a newly uploaded PDF manual into queryable chunks stored in the vector store. Stages: PDF upload → text extraction / OCR → chunking → metadata tagging → embedding → vector store insertion.

### Session
A single interaction context for a user, bounded by login and logout (or session token expiry). Within a session, conversation history is maintained and machine scope carries across turns. Sessions are isolated — two users in concurrent sessions do not share context.

### Follow-Up Question
A user query posed in a conversation turn after the first answer, referencing or extending the prior context. Follow-up questions may omit previously established information (machine scope, error code) that MechMind must infer from conversation history.

### Relevance Threshold
The minimum reranker score a retrieved chunk must achieve for the evidence to be considered sufficient. Chunks below this threshold are excluded from context assembly. If no chunks meet the threshold, a refusal is issued. Default value: 0.60 (configurable).

### Table Row Chunk
A special chunk type produced from tabular content in a manual (e.g., an error code table). Each row of the table is stored as a separate chunk, preserving the relationship between the error code, description, probable cause, and corrective action columns.

### Hallucination Check
A post-generation validation step that compares each statement in the generated answer against the retrieved chunks to verify that the statement is supported by at least one chunk. Statements that cannot be matched to a retrieved chunk are flagged or removed before the answer is returned to the user.
