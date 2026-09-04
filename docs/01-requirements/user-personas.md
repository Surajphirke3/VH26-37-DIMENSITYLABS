# User Personas

## Document Purpose

This document defines the primary user personas for MechMind. Personas are grounded in the factory maintenance context and drive UI, UX, and feature prioritisation decisions. Each design choice should be evaluated against the needs of at least one of these personas.

---

## Persona 1: Raj Patel — Factory Floor Technician

### Profile

| Field | Detail |
|---|---|
| **Name** | Raj Patel |
| **Age** | 34 |
| **Role** | Maintenance Technician, Level 2 |
| **Experience** | 7 years in industrial maintenance |
| **Education** | Diploma in Electrical Engineering; City & Guilds Mechanical Maintenance |
| **Tech Comfort** | Moderate. Uses a smartphone daily. Comfortable with apps that work like a search engine. Unfamiliar with AI/ML concepts. Becomes frustrated when systems require training to use. |
| **Primary Device** | Samsung rugged tablet (10 inch), sometimes a smartphone |
| **Environment** | Machine shop floor — noisy, oily hands, poor lighting in some areas, often standing or crouching next to equipment |

### Goals

1. Get the correct corrective action for a machine fault within 2 minutes of the fault occurring.
2. Verify that the step he is about to take is the right one (does not want to make a fault worse or cause damage).
3. Know when to escalate to a senior engineer instead of attempting a fix himself.
4. Complete the repair documentation accurately at the end of the job.

### Pain Points

- Has to search through a 400-page PDF on a shared workshop PC to find an error code, while the machine is sitting idle and production line throughput drops.
- The same error code (e.g., `E-501`) appears in two different manuals on the shared drive with different procedures. He once applied the wrong procedure. It cost him two hours and a supervisor conversation.
- Senior engineers are often on different shifts or at different sites. He cannot always get a call-back in time.
- Manuals are sometimes missing from the shared drive, and he doesn't know where to get them.
- Receives AI-generated answers from generic chatbots that sound authoritative but are clearly wrong (hallucinated steps that he knows from experience are not in the manual).

### Typical Queries

- `"E-2045"` (typed immediately from the panel display)
- `"Hydraulic pressure fault on press line 3"`
- `"Spindle stall alarm haas vf2"`
- `"What does alarm 430 mean"`

### Interaction Patterns

- Single-query, single-answer interaction. Rarely asks follow-up questions in a single session.
- Reads the corrective steps section first, skips the cause section unless the steps don't work.
- Checks citations to verify the information is from the right manual before proceeding.
- If the answer confidence is low or the answer says to escalate, he escalates immediately — he trusts the system on this.
- Session duration: typically 2–5 minutes, one machine fault, one answer.

### Design Implications

- Query interface must be a single large text input, immediately visible on load — no onboarding, no dashboard.
- Answer must be displayed in large text with numbered steps, readable in poor lighting.
- Machine selection / disambiguation must be simple (one-click from a list, not a text field).
- Confidence indicator must use colour and a plain-English label (High / Medium / Low), not a decimal score.
- The system must not ask for more information than necessary — one clarifying question maximum.

---

## Persona 2: Annika Johansson — Senior Maintenance Engineer

### Profile

| Field | Detail |
|---|---|
| **Name** | Annika Johansson |
| **Age** | 48 |
| **Role** | Senior Maintenance Engineer |
| **Experience** | 22 years in industrial maintenance, specialising in CNC and robotics |
| **Education** | BEng Mechanical Engineering; additional training in Fanuc and Siemens PLC systems |
| **Tech Comfort** | High. Uses diagnostic software, oscilloscopes, and PLC programming tools regularly. Comfortable with complex interfaces. Has experimented with AI tools and understands their limitations. |
| **Primary Device** | Laptop at her desk; tablet on the floor; desktop in the engineering office |
| **Environment** | Split between engineering office and shop floor. More time for research and systematic diagnosis. |

### Goals

1. Perform root-cause analysis on recurring faults, not just immediate fault resolution.
2. Understand the relationship between different error codes on the same machine (e.g., does E-501 often precede E-503?).
3. Cross-reference multiple manuals when diagnosing a complex fault involving multiple machines.
4. Train junior technicians by showing them how to interpret manual content correctly.
5. Build a personalised knowledge base of lessons learned that supplements the manuals.

### Pain Points

- Spending significant time reformatting answers from manuals to send to technicians — MechMind should reduce this.
- Discovering that a technician applied the wrong procedure from an outdated manual version — has no visibility of which manual version is in use.
- Finding that two sections of the same manual contradict each other (version inconsistency); current tools don't surface this.
- Needing to ask follow-up questions and losing context when switching tabs or moving from the workshop to the office.

### Typical Queries

- `"E-501 haas vf2"` (initial lookup)
- `"What are all the causes listed for spindle alarms on this machine?"` (follow-up)
- `"Is there any mention of coolant pressure in relation to E-501?"` (cross-section exploration)
- `"What does the manual say about preventive maintenance intervals for the spindle motor?"` (non-fault query)
- `"Compare the E-501 description between the operator manual and the maintenance manual"` (future feature)

### Interaction Patterns

- Uses multi-turn conversation extensively. A typical session involves 4–8 turns.
- Reads the full answer including citations and source sections.
- Uses citations to look up the original manual page for deeper reading.
- Will notice and report citation errors — she is the most likely user to submit "Not Helpful" feedback with detailed comments.
- Session duration: 15–45 minutes, complex fault investigation.

### Design Implications

- Answer citations must include the exact section title and page number so she can navigate to the original document.
- Multi-turn conversation context must be persistent and clearly displayed (conversation history visible in UI).
- Confidence score should show the numeric value, not just a label — she will interpret the number.
- A "View source chunk" link that displays the raw retrieved chunk text would be high value for her.
- The system should surface contradictions between retrieved chunks when they exist, not silently pick one.

---

## Persona 3: Derek Okafor — Maintenance Manager

### Profile

| Field | Detail |
|---|---|
| **Name** | Derek Okafor |
| **Age** | 52 |
| **Role** | Maintenance and Facilities Manager |
| **Experience** | 15 years in maintenance management; previously a technician for 8 years |
| **Education** | HND Mechanical Engineering; IOSH Managing Safely; NEBOSH Certificate |
| **Tech Comfort** | Moderate. Comfortable with ERP and CMMS dashboards. Has limited patience for complex interfaces but understands what the system does technically. Prefers summary views over raw data. |
| **Primary Device** | Desktop in office; laptop for site visits |
| **Environment** | Management office; periodic shop floor walkthroughs; weekly maintenance review meetings |

### Goals

1. Ensure technicians have access to accurate, up-to-date troubleshooting information at all times.
2. Upload new machine manuals promptly when new equipment is purchased.
3. Identify which machines have the highest fault query frequency (a proxy for reliability issues).
4. Ensure that the system's knowledge base is current — old manual versions are replaced when manufacturers issue updates.
5. Demonstrate to senior management that the system is reducing average time-to-resolution for machine faults.

### Pain Points

- Has no visibility of how often technicians are consulting manuals or how accurate the information they are finding is.
- When a new machine is installed, there is a gap of days before the manual is available to technicians on the shared drive. This delay is avoidable.
- Auditors have asked for evidence of which procedure a technician followed when a machine fault led to an incident. Currently there is no such evidence unless the technician self-reported.
- Junior technicians sometimes act on incorrect or outdated information. He needs a mechanism to ensure the knowledge base is current.

### Typical Queries

- "Upload a new manual" (administrative action, not a troubleshooting query)
- "Which machines have no manuals indexed?" (coverage gap check)
- "How many queries were made last week and what was the refusal rate?" (operational metrics)
- Occasional troubleshooting queries when doing a floor walkthrough: "What's E-430 on the conveyor?"

### Interaction Patterns

- Uses the admin interface weekly for manual management.
- Reviews the operational dashboard monthly for trends.
- Uses the query interface occasionally on floor walkthroughs — similar pattern to Raj but less frequent.
- Shares query audit records with safety managers when required.
- Provides written feedback to the system administrator about coverage gaps.

### Design Implications

- Admin interface must support manual upload with machine model tagging in under 5 minutes per manual, without technical knowledge of the ingestion pipeline.
- Manual coverage list (which machines have indexed manuals) must be accessible from the admin dashboard.
- Ingestion status and error reporting must be non-technical: "Processing — 45% complete" and "Failed — Page 122 could not be read" rather than technical error codes.
- Operational metrics must be presented as business KPIs: "Average time-to-answer", "Refusal rate", "Most-queried machines".

---

## Persona 4: Fatima Al-Hassan — System Administrator

### Profile

| Field | Detail |
|---|---|
| **Name** | Fatima Al-Hassan |
| **Age** | 31 |
| **Role** | IT Systems Administrator (also supports MechMind as platform owner) |
| **Experience** | 6 years in IT administration; 2 years managing cloud-hosted internal tools |
| **Education** | BSc Computer Science; AWS Solutions Architect Associate certification |
| **Tech Comfort** | Very high. Comfortable with APIs, Docker, cloud consoles, log aggregation tools, and monitoring dashboards. Understands LLM and vector database concepts at a high level. |
| **Primary Device** | Desktop with multiple monitors; CLI/terminal is primary interface for infrastructure tasks |
| **Environment** | IT office; remote access to all systems via VPN |

### Goals

1. Keep the MechMind platform running reliably with minimal downtime.
2. Monitor system performance and act on alerts before users are impacted.
3. Onboard new users (technicians, engineers) and assign correct roles.
4. Manage vector store health: monitor chunk count, detect index corruption, coordinate re-ingestion when needed.
5. Update the embedding model or LLM model without downtime when a better option becomes available.
6. Ensure security compliance: TLS, encrypted storage, access log auditing, and token rotation.

### Pain Points

- Receives no proactive notification when ingestion fails — finds out only when the maintenance manager reports that a new manual is not returning results.
- Has no easy way to inspect the vector store contents — verifying that a specific manual's chunks are present requires direct database queries.
- Model updates require careful coordination: changing the embedding model invalidates all existing embeddings and requires full re-ingestion — this process is not currently documented or automated.
- LLM API rate limits cause intermittent query failures during peak hours; there is no circuit breaker or retry logic.

### Typical Actions

- User management: create accounts, assign roles, reset passwords, deactivate departed employees.
- Review system logs for errors after a technician reports a problem.
- Monitor ingestion job queue and restart failed jobs.
- Apply security patches to the application and container images.
- Rotate API keys for the LLM provider and vector store.
- Run a vector store health check to verify chunk counts per manual.

### Interaction Patterns

- Does not use the troubleshooting query interface (not her role).
- Uses the admin API and admin UI daily.
- Reviews system logs and metrics weekly.
- Interacts with deployment infrastructure (Docker, cloud console) on an as-needed basis.
- Primary communication channel for system issues: alerting system sends to Slack or email.

### Design Implications

- API must provide admin-level endpoints for: user CRUD, manual CRUD, ingestion job management, system health status.
- Metrics endpoint must be Prometheus-compatible for integration with existing monitoring stack.
- Ingestion failure alerts must be automated and informative (include manual name, error type, failed page range).
- A re-ingestion script or UI action must be available for re-indexing a manual after an embedding model change.
- API key rotation must not require application restart (keys loaded from environment variables or a secret store, not hardcoded).
