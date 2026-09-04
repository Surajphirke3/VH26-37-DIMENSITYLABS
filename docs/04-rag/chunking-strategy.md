# Chunking Strategy — MechMind

## Overview

MechMind uses **semantic chunking**, not fixed token-size chunking. Fixed-size chunking is inappropriate for machine manuals because it routinely splits error code entries, table rows, and warning blocks mid-content — destroying the semantic unit that the retrieval system must match against technician queries.

Every chunk in MechMind corresponds to a **logically complete unit of meaning**: a section, a single error code entry, a table block, or a safety warning. This design ensures that when a technician queries "what does E101 mean and how do I fix it?", the retrieved chunk contains the full error entry — code, description, causes, and corrective steps — rather than a truncated fragment.

---

## Chunk Types

### 1. Section Chunks

**Definition:** One chunk per logical section, bounded by headings of the same or higher level.

**Boundaries:**
- Start: the heading line (H1, H2, or H3 detected in Stage 4)
- End: the line immediately before the next heading of equal or higher level, or the end of the document

**Size constraints:**
- Soft maximum: 800 tokens
- Soft minimum: 100 tokens
- If a section exceeds 800 tokens: split at the nearest paragraph boundary below 800 tokens and create an overlap chunk for continuity (see Overlap Chunks)
- If a section is below 100 tokens AND has no special block types (error codes, warnings): merge with the adjacent section chunk and record both section paths in `section_path`

**Content included in chunk text:**
- The heading text (first line of the chunk, used for context during embedding)
- All body text in the section
- Inline references to figures or tables are preserved as text ("see Figure 3.1")
- Actual tables and warning blocks within the section are extracted as their own chunk types (they are NOT included in the section chunk text)

**When section chunks are not created:**
- A section that consists entirely of a single large table generates only a table chunk, not a section chunk
- A section that consists entirely of error code entries generates only error_code chunks

---

### 2. Error Code Chunks

**Definition:** One dedicated chunk per error code entry.

**This is the most important chunk type in MechMind.** Error code entries are the primary content that technicians query. They must never be split.

**Entry boundary detection:**
An error code entry begins when the error code detection regex matches (see Detection Patterns section below) and ends at:
- The next error code match at the same indentation level
- The next heading of any level
- The end of the table row (if entries are organized in a table)

**Required content for an error code chunk:**
Every error code chunk must include ALL of the following fields, even if some must be sourced from multiple adjacent paragraphs:
1. **Code** — the error code identifier (e.g., `E101`)
2. **Description** — what the error means
3. **Probable causes** — one or more causes listed
4. **Corrective steps** — the sequence of actions to resolve the error

If any of these four fields is split across page boundaries (e.g., "corrective steps" continues on the next page), the chunker reads forward across pages to complete the entry before closing the chunk.

**Size override:** Error code chunks have NO enforced token maximum. If an entry requires 1,200 tokens to capture all four required fields, the chunk is 1,200 tokens. Integrity of the entry is more important than size uniformity.

**Special case — error code tables:**
Many machine manuals organize error codes in a tabular format:

| Code | Description | Cause | Action |
|------|-------------|-------|--------|
| E101 | Cooling fault | Pump failure | Check pump |
| E102 | Motor overload | Excessive load | Reduce load |

In this case, each row becomes its own error_code chunk. The column headers are embedded into the chunk text so the chunk is self-contained:

```
Error Code: E101
Description: Cooling fault
Probable Cause: Pump failure
Corrective Action: Check pump
Source Table Headers: Code | Description | Cause | Action
```

---

### 3. Table Chunks

**Definition:** Each table in the document is extracted as one or more chunks.

**Chunking rule:**
- If the table has 10 or fewer rows: the entire table is one chunk
- If the table has more than 10 rows: the table is split into blocks of 8 rows, with the header row repeated at the top of each block chunk for context

**Text representation of tables:**
Tables are not stored as raw delimited text. Each table is converted to a **natural language row format** before embedding:

For a table with headers `[Code, Description, Cause, Action]` and a row `[E101, Cooling fault, Pump failure, Check pump]`, the text representation is:

```
Table: Error Code Reference (Chapter 7, Page 214)
Row: Code = E101 | Description = Cooling fault | Cause = Pump failure | Action = Check pump
```

**Rationale for this format:**
- Natural language row format is more semantically meaningful to the embedding model than pipe-delimited CSV
- Column header context is preserved in every row's text
- A technician searching for "E101 cooling" will match the embedding of this row even if they do not know the table structure

**Column header embedding:**
If column headers cannot be reliably detected (e.g., the first row is not visually distinct), the chunk is flagged with `has_ambiguous_headers = true` in metadata, and the raw text representation is used without the `Column = Value` format.

---

### 4. Warning/Note Chunks

**Definition:** Standalone chunks for blocks beginning with `WARNING`, `CAUTION`, `NOTE`, `DANGER`, or `IMPORTANT`.

**Rationale:** Safety-critical content must never be buried inside a larger section chunk where it might be truncated or missed. Warning chunks are indexed separately and are retrieved alongside procedural chunks when the query involves procedures.

**Boundary detection:**
- Start: the keyword (`WARNING`, `CAUTION`, etc.) line
- End: the next blank line followed by body text that does not continue the warning, OR the next heading, OR another warning keyword

**Content:** Warning chunks include the full text of the warning block. They are NOT summarized or truncated.

**Metadata flag:** All warning chunks have `chunk_type = "warning"` and `is_safety_critical = true`. The generation stage is instructed to always include warning chunk content in the corresponding corrective steps if the warning chunk is retrieved alongside a procedural chunk.

---

### 5. Overlap Chunks

**Definition:** A 15% overlap chunk that bridges adjacent section chunks.

**Purpose:** Section chunking creates hard boundaries at headings. A technician's query might span information at the end of one section and the beginning of the next. Overlap chunks ensure this boundary region is retrievable.

**Construction:**
- When section chunk N has 800 tokens and is split from section chunk N+1, an overlap chunk is created
- The overlap chunk contains the last 15% of section chunk N's text (approximately 120 tokens) concatenated with the first 15% of section chunk N+1's text
- Total overlap chunk size: approximately 240 tokens
- `section_path` of an overlap chunk references both sections: `"Chapter 3 > Error Codes" + "Chapter 3 > Diagnostic Procedures"`

**Important:** Overlap chunks are supplementary. They are never the primary retrieval result for an error code query. If an error_code chunk and an overlap chunk both match a query, the error_code chunk is ranked higher.

---

## Chunking Algorithm Pseudocode

```
function chunk_document(structured_doc, machine_id, manual_id):
    chunks = []
    current_section = null
    section_text_buffer = []

    for page in structured_doc.pages:
        for block in page.blocks:

            # Handle heading blocks
            if block.type == HEADING:
                if current_section is not null:
                    # Finalize the current section
                    finalized = finalize_section_chunk(
                        current_section, section_text_buffer, machine_id, manual_id
                    )
                    chunks.extend(finalized)  # may produce 1 or 2 chunks + overlap
                current_section = block
                section_text_buffer = [block.text]

            # Handle error code blocks
            elif block.type == ERROR_CODE_BLOCK:
                error_chunk = create_error_code_chunk(block, current_section, machine_id, manual_id)
                chunks.append(error_chunk)
                # Do NOT add to section_text_buffer; error code has its own chunk

            # Handle table blocks
            elif block.type == TABLE:
                table_chunks = create_table_chunks(block, current_section, machine_id, manual_id)
                chunks.extend(table_chunks)
                # Do NOT add to section_text_buffer

            # Handle warning blocks
            elif block.type == WARNING:
                warning_chunk = create_warning_chunk(block, current_section, machine_id, manual_id)
                chunks.append(warning_chunk)
                # Do NOT add to section_text_buffer

            # Handle regular body text
            else:
                if current_section is not null:
                    section_text_buffer.append(block.text)

    # Finalize last section
    if current_section is not null and section_text_buffer:
        finalized = finalize_section_chunk(
            current_section, section_text_buffer, machine_id, manual_id
        )
        chunks.extend(finalized)

    # Generate overlap chunks for adjacent sections
    section_chunks = [c for c in chunks if c.chunk_type == "section"]
    for i in range(len(section_chunks) - 1):
        overlap = create_overlap_chunk(section_chunks[i], section_chunks[i+1])
        chunks.append(overlap)

    return chunks


function finalize_section_chunk(heading, text_buffer, machine_id, manual_id):
    full_text = join(text_buffer)
    token_count = count_tokens(full_text)

    if token_count <= 800:
        return [create_section_chunk(heading, full_text, token_count, machine_id, manual_id)]
    else:
        # Split at paragraph boundary closest to 800-token mark
        split_point = find_paragraph_split(full_text, max_tokens=800)
        chunk_a_text = full_text[:split_point]
        chunk_b_text = full_text[split_point:]
        chunk_a = create_section_chunk(heading, chunk_a_text, count_tokens(chunk_a_text), machine_id, manual_id)
        chunk_b = create_section_chunk(heading, chunk_b_text, count_tokens(chunk_b_text), machine_id, manual_id)
        return [chunk_a, chunk_b]


function create_error_code_chunk(block, current_section, machine_id, manual_id):
    # block may span multiple sub-blocks; collect until all 4 fields found
    code = extract_error_code(block.text)
    description = extract_description(block)
    causes = extract_causes(block)
    steps = extract_steps(block)

    text = format_error_code_chunk(code, description, causes, steps)
    error_codes_present = [code]

    return Chunk(
        chunk_id = new_uuid(),
        manual_id = manual_id,
        machine_id = machine_id,
        chunk_type = "error_code",
        text = text,
        section_path = build_section_path(current_section),
        error_codes_present = error_codes_present,
        token_count = count_tokens(text),
        page_start = block.page_start,
        page_end = block.page_end
    )
```

---

## Error Code Detection Patterns

The following regex patterns are applied in order. The first match determines the canonical code format.

```
Pattern 1 (E-prefix):     \bE\d{2,4}\b
  Examples: E101, E2001, E99

Pattern 2 (ERR prefix):   \bERR[-\s]?\d{2,4}\b
  Examples: ERR-101, ERR101, ERR 101
  Normalized to: ERR-{number}

Pattern 3 (F-prefix):     \bF\d{2,4}\b
  Examples: F101, F0023
  (common in Fanuc and Siemens systems)

Pattern 4 (Fault keyword): \bFault\s+\d{2,4}\b
  Examples: Fault 101, Fault 0023
  Normalized to: F{number}

Pattern 5 (Alarm keyword): \bAlarm\s+\d{2,4}\b
  Examples: Alarm 101
  Normalized to: A{number}

Pattern 6 (Error keyword): \bError\s+\d{2,4}\b
  Examples: Error 101, Error Code 0023
  Normalized to: E{number}

Pattern 7 (P-prefix):     \bP\d{4}\b
  Examples: P0100 (Haas parameter alarms)

Pattern 8 (Generic code): \b[A-Z]\d{3,4}\b
  Examples: A101, B0023
  Used as fallback; lower confidence
```

**Normalization rules applied after detection:**
- Strip leading zeros from numeric portion: `E0101` → `E101`
- Uppercase all alphabetic prefixes
- Remove spaces between prefix and number: `E 101` → `E101`
- Store both raw form and normalized form in metadata

**Building the `error_codes_present` array:**
All patterns are applied to the full chunk text (not just the first line). A chunk may reference multiple error codes (e.g., a section that says "see also E102 and E103"). All detected codes are added to `error_codes_present`.

---

## Table-to-Text Conversion Detail

Tables require special handling because embedding models are trained on natural language, not structured grids. The conversion process is:

**Step 1:** Extract cell values from the PyMuPDF table structure (list of rows, each a list of cell strings).

**Step 2:** Identify the header row. Heuristics:
- First row where all cells are bold-weight text
- First row where cell text matches common header keywords (Code, Description, Error, Cause, Action, Step, Parameter)
- If no clear header row detected: use row index labels (Column 1, Column 2, etc.)

**Step 3:** For each data row, generate a text record using the format:
```
{header_1} = {value_1} | {header_2} = {value_2} | ... | {header_n} = {value_n}
```

**Step 4:** Prepend a table context line:
```
Table: {table_title_if_found} (Page {page_num}, {section_path})
```

**Step 5:** If the table row contains an error code value, mark the chunk as `chunk_type = "error_code"` rather than `chunk_type = "table"`. The error_code type takes precedence.

**Example conversion:**

Raw table row in PDF:
```
| E101 | Cooling system pressure loss | Coolant pump failure | 1. Check pump 2. Replace if failed |
```

Converted text representation:
```
Table: Error Code Reference (Page 214, Chapter 7 > Error Codes)
Error Code = E101 | Description = Cooling system pressure loss | Probable Cause = Coolant pump failure | Corrective Action = 1. Check pump 2. Replace if failed
```

---

## Chunk Metadata Schema

Every chunk is stored with the following complete metadata record:

```
chunk_id              UUID PRIMARY KEY
manual_id             UUID NOT NULL REFERENCES manuals(id)
machine_id            UUID NOT NULL REFERENCES machines(id)
page_start            INTEGER NOT NULL
page_end              INTEGER NOT NULL
section_path          TEXT NOT NULL
  -- Full breadcrumb: "Chapter 3 > Error Codes > E101"
chunk_type            TEXT NOT NULL
  -- Enum: section | error_code | table | warning | overlap
error_codes_present   TEXT[] NOT NULL DEFAULT '{}'
  -- GIN-indexed array of all error codes detected in this chunk
token_count           INTEGER NOT NULL
embedding_model_version TEXT NOT NULL DEFAULT 'text-embedding-004'
is_safety_critical    BOOLEAN NOT NULL DEFAULT false
has_ambiguous_headers BOOLEAN NOT NULL DEFAULT false
  -- For table chunks where headers could not be reliably detected
created_at            TIMESTAMP NOT NULL DEFAULT NOW()
```

The `vector` column (768 float32 values) is stored in the same table via pgvector's `vector(768)` type, collocated with metadata for efficient filtered ANN queries.
