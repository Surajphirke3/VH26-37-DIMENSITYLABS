# Goals and Non-Goals

## Purpose

This document establishes explicit boundaries for the MechMind system. It prevents scope creep, aligns stakeholder expectations, and guides architectural decisions by clarifying what the system is and is not responsible for.

---

## Goals (What MechMind WILL Do)

| ID | Goal | Description |
|---|---|---|
| G-01 | Machine Manual Ingestion | Accept machine manuals in PDF format, extract text and metadata, and store them in a retrievable index. |
| G-02 | Error Code Lookup | Accept an error code as a query and return the probable cause, corrective action, and safety warnings sourced from the relevant manual. |
| G-03 | Natural Language Query | Accept a symptom or question in plain English and return relevant troubleshooting content from manuals. |
| G-04 | Machine-Scoped Retrieval | Scope all retrieval to the specific machine identified by the user, preventing cross-machine answer contamination. |
| G-05 | Machine Disambiguation | Detect when a query is ambiguous across multiple machines and ask a clarifying question before generating an answer. |
| G-06 | Structured Answer Format | Return answers in a consistent, structured format: probable cause, corrective steps, safety warnings, citations. |
| G-07 | Source Citations | Include inline citations in every answer, referencing the manual name, section, and page number from which each piece of information was drawn. |
| G-08 | Evidence-Gated Generation | Refuse to generate an answer if retrieved evidence is insufficient, contradictory, or of insufficient relevance, and explain why. |
| G-09 | Confidence Scoring | Attach a confidence indicator to each answer reflecting the strength of the retrieved evidence. |
| G-10 | Multi-Turn Conversation | Maintain conversation context across multiple turns within a session, preserving machine scope and conversation history. |
| G-11 | Graceful Refusal | When the query cannot be answered from available manuals, respond with an explicit refusal that explains what information is missing and where the technician should look instead. |
| G-12 | Hybrid Retrieval | Combine keyword (sparse) and semantic (dense) retrieval to handle both exact error code lookups and natural language symptom queries. |
| G-13 | Reranking | Apply a reranking step after initial retrieval to surface the most relevant chunks before passing them to the LLM. |
| G-14 | Hallucination Detection | Post-generation, verify that every assertion in the answer is grounded in a retrieved chunk and flag unsupported statements. |
| G-15 | Admin Manual Upload | Provide an administrative interface for uploading new manuals and monitoring ingestion status. |
| G-16 | Session Management | Manage user sessions including context isolation between users and session expiry handling. |
| G-17 | OCR Support | Process scanned PDF manuals using OCR to extract text where no text layer exists. |
| G-18 | Table-Aware Chunking | Handle tabular content in manuals (especially error code tables) such that row-column relationships are preserved in chunks. |
| G-19 | Observability | Log all queries, retrieved chunks, confidence scores, and answers to support audit, quality monitoring, and debugging. |
| G-20 | Follow-Up Question Suggestions | After an answer, suggest related follow-up questions the technician might ask to continue diagnosis. |

---

## Non-Goals (What MechMind Will NOT Do)

| ID | Non-Goal | Explanation | Who Handles It Instead |
|---|---|---|---|
| NG-01 | Live Machine Sensor Integration | MechMind will not connect to machine PLCs, SCADA systems, IoT sensors, or any live data feeds. It operates exclusively on static manual content. | MES / SCADA system or dedicated IoT platform |
| NG-02 | Autonomous Diagnosis Without Human Evidence | MechMind will not read live machine state and autonomously conclude what is wrong. It provides evidence-grounded information to support a human decision, not replace it. | The technician or engineer |
| NG-03 | Replacing Certified Technicians | MechMind is decision support, not a replacement for a qualified maintenance technician. Safety-critical operations require human verification. | Certified maintenance personnel |
| NG-04 | Executing Repair Actions | MechMind will not send commands to machines, order parts, or create work orders. It answers questions; it does not act in the physical world. | CMMS (Computerised Maintenance Management System) |
| NG-05 | Maintenance Scheduling | MechMind will not generate or manage preventive maintenance schedules. It can answer questions about recommended maintenance intervals (from manuals), but it will not schedule tasks. | CMMS / ERP system |
| NG-06 | Parts Inventory Management | MechMind will not check whether a replacement part is in stock or place parts orders. | ERP / inventory management system |
| NG-07 | Training Certification | MechMind will not track technician qualifications, assign training, or certify completion of procedures. | HR / LMS system |
| NG-08 | Multi-Language Support (v1) | The initial version will process manuals and answer queries in English only. Multi-language support is a future roadmap item. | Future version |
| NG-09 | Diagram and Image Interpretation | MechMind will not interpret electrical wiring diagrams, part schematics, or other images embedded in manuals. It will flag that relevant diagrams exist and reference their location, but will not analyse their content. | Human engineer reviewing the manual |
| NG-10 | Manual Authoring or Editing | MechMind will not create, edit, or annotate machine manuals. It is a read-only query system. | Technical writers / manufacturers |
| NG-11 | Predictive Maintenance | MechMind will not predict future failures based on historical query patterns or machine data. | Predictive maintenance / ML platforms |
| NG-12 | Integration with External Knowledge Bases | MechMind will not query external sources (internet, manufacturer databases, forums) for information. All answers are grounded exclusively in uploaded manuals. This is by design for safety and auditability. | Not applicable by design |
| NG-13 | Answer Feedback Loop to Model Training | MechMind will not use technician feedback to fine-tune the underlying LLM in real time. Feedback is logged for human review only. | Offline model evaluation and improvement cycle |
| NG-14 | Cross-Tenant Data Access | In a multi-tenant deployment, MechMind will not allow one factory's query to retrieve documentation from another factory's manual corpus. | Platform-level tenant isolation |
| NG-15 | Guaranteed 100% Recall | MechMind does not guarantee that every relevant passage in a manual will be retrieved for every query. Retrieval is a best-effort process constrained by embedding quality, chunking decisions, and query specificity. | System is designed for high recall, but completeness is not guaranteed |

---

## Boundary Diagram (Narrative)

MechMind sits between two worlds: the document world (PDFs, text, manuals) and the human decision world (the technician at the machine). It is a read-only intelligence layer. It does not reach into the physical world (machines, sensors, actuators) and it does not produce physical-world actions (commands, orders, schedules).

Its job is precisely this: given a question about a specific machine, find the most relevant and credible content in the available manuals, present it in a structured and cited format, and say clearly when it cannot find a credible answer.

Everything outside that boundary — scheduling, execution, live data, certification, parts ordering — is handled by systems that MechMind may eventually integrate with, but does not replace.
