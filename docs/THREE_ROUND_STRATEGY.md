# Three-Round Strategy
## Round 1 → V1 | Round 2 → V2 | Round 3 → Both

---

# THE BIG PICTURE

```
Round 1 (Qualify)     Round 2 (Impress)      Round 3 (Win)
─────────────────     ─────────────────      ─────────────
V1: API-based RAG  →  V2: Own fine-tuned  →  Both side-by-side
Fast to build         model (Nord/Forge)      + tier router
Reliable demo         Shows depth             Shows the full vision
```

---

# ROUND 1 — V1: API-BASED RAG SYSTEM

## Goal: Qualify. Show it works. Don't fail the demo.

### What to Build
Full RAG pipeline using external LLM APIs. No own model. Focus 100% on the 8 requirements from the PS.

### Architecture
```
PDFs → PyMuPDF → Chunks → OpenAI Embeddings → ChromaDB
                                                   ↓
User Query → Metadata Filter → Retrieve → Rerank → Confidence Gate
                                                   ↓
                                              GPT-4o / Groq
                                                   ↓
                              Structured Answer + Citation + Source Page
```

### Tech Stack (V1 only)
| Layer | Tool |
|-------|------|
| PDF Parsing | PyMuPDF |
| Chunking | LangChain RecursiveTextSplitter |
| Embeddings | OpenAI text-embedding-3-small |
| Vector DB | ChromaDB |
| Reranking | FlashRank (free) |
| LLM | GPT-4o (primary) / Groq Llama 3.1 (fallback) |
| Memory | LangChain ConversationBufferMemory |
| UI | Streamlit |

### Build Timeline for Round 1
```
Hour 0–2:   ingest.py — PDF → chunks → metadata → ChromaDB
Hour 2–4:   retriever.py — filter + rerank + confidence gate
Hour 4–6:   generator.py — LLM call + structured output
Hour 6–8:   app.py — Streamlit UI with upload + chat
Hour 8–10:  Test all 4 demo cases. Fix bugs.
Hour 10–12: Polish UI. Prep demo script.
```

### What to Show Judges in Round 1
1. Upload Machine Alpha + Machine Beta manuals
2. Query: `E101` → asks which machine → pick Alpha → correct answer + Page 47 cited
3. Query: `E101 on Machine Beta` → correct different answer + Page 29 cited
4. Query: `Machine Alpha is overheating` → natural language → correct steps
5. Query: `What is the warranty?` → graceful refusal + confidence score shown

### Round 1 Winning Criteria
- [ ] All 4 demo cases work without crashing
- [ ] Source citation visible for every answer
- [ ] Confidence score shown on refusal
- [ ] Upload new manual live during demo
- [ ] Follow-up question works ("what if that doesn't fix it?")

---

# ROUND 2 — V2: OWN FINE-TUNED MODEL (NORD + FORGE)

## Goal: Impress. Show you built something beyond a tutorial.

### What Changes in V2
- Replace GPT-4o/Groq with your own fine-tuned Nord model (for simple queries)
- Replace with Forge for complex queries
- Same RAG pipeline, same ChromaDB — only the LLM layer swaps
- UI shows which model tier answered the query

### Architecture
```
[Same RAG pipeline as V1]
                ↓
         Tier Router
        /     |      \
      Nord  Forge   Apex(Groq)
     (own)  (own)   (API fallback)
        \     |      /
         Structured Answer
```

### How to Prepare V2 During / After Round 1

**While Round 1 demo is stable, team splits:**

Person A (continues V1 polish) → fixes bugs, improves UI

Person B (starts V2 training):
```
Step 1: Generate training data from your already-ingested manuals
        python generate_training_data.py  # uses GPT-4o to make Q&A pairs
        → outputs training_data_nord.jsonl (200 examples)
        → outputs training_data_forge.jsonl (500 examples)

Step 2: Open Kaggle notebook → run Nord QLoRA fine-tune (3–4 hours)
        Base: microsoft/Phi-3-mini-4k-instruct

Step 3: Download Nord adapter weights → test locally

Step 4: Integrate into app.py as the Nord endpoint
```

### Training Data Generator Script

```python
# generate_training_data.py
from openai import OpenAI
import json, chromadb

client = OpenAI()
db = chromadb.PersistentClient(path="./chroma_db")
collection = db.get_collection("manuals")

# Get all chunks
all_chunks = collection.get(include=["documents", "metadatas"])

training_data = []
for doc, meta in zip(all_chunks["documents"], all_chunks["metadatas"]):
    if len(doc) < 100:
        continue  # skip tiny chunks
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""Given this manual chunk:
---
{doc}
---
Machine: {meta.get('machine_id', 'unknown')}
Page: {meta.get('page', '?')}
Section: {meta.get('section', '?')}

Generate 3 training examples as JSON list:
[{{"input": "Context: [chunk]\\nQuestion: ...", "output": "structured answer with source citation"}}]
Include: 1 error code query, 1 symptom query, 1 follow-up query.
Every output must end with: Source: {meta.get('manual_name','Manual')}, Section {meta.get('section','?')}, Page {meta.get('page','?')}"""
        }]
    )
    
    try:
        pairs = json.loads(response.choices[0].message.content)
        for pair in pairs:
            training_data.append({
                "instruction": "You are MechMind, a factory machine troubleshooting assistant. Answer ONLY from the provided context. Always cite manual name, section, and page number. If context is insufficient, say: Insufficient information.",
                "input": pair["input"],
                "output": pair["output"]
            })
    except:
        continue

with open("training_data_nord.jsonl", "w") as f:
    for item in training_data[:300]:  # Nord: 300 examples
        f.write(json.dumps(item) + "\n")

with open("training_data_forge.jsonl", "w") as f:
    for item in training_data:  # Forge: all examples
        f.write(json.dumps(item) + "\n")

print(f"Generated {len(training_data)} training examples")
```

### Kaggle Nord Fine-Tune Notebook

```python
# Run this in a Kaggle notebook (free T4 GPU)
!pip install -q transformers peft trl bitsandbytes accelerate datasets

from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer
from datasets import load_dataset
import torch

MODEL = "microsoft/Phi-3-mini-4k-instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL, load_in_4bit=True, torch_dtype=torch.float16,
    device_map="auto", trust_remote_code=True
)

lora_config = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj","v_proj"], bias="none", task_type="CAUSAL_LM")
model = get_peft_model(model, lora_config)

dataset = load_dataset("json", data_files="/kaggle/input/mechmind-data/training_data_nord.jsonl", split="train")

def fmt(ex):
    return f"### Instruction:\n{ex['instruction']}\n\n### Input:\n{ex['input']}\n\n### Response:\n{ex['output']}"

trainer = SFTTrainer(
    model=model,
    args=TrainingArguments(
        output_dir="/kaggle/working/nord_model",
        num_train_epochs=3, per_device_train_batch_size=2,
        gradient_accumulation_steps=8, learning_rate=2e-4,
        fp16=True, save_steps=50, logging_steps=10
    ),
    train_dataset=dataset,
    formatting_func=fmt,
    max_seq_length=1024
)
trainer.train()
model.save_pretrained("/kaggle/working/nord_model")
tokenizer.save_pretrained("/kaggle/working/nord_model")
```

### V2 Integration into app.py

```python
# models.py — swap-in layer for V2
from enum import Enum

class Tier(Enum):
    NORD = "nord"
    FORGE = "forge"
    APEX = "apex"

def get_tier(query: str, confidence: float) -> Tier:
    import re
    # Simple error code → Nord
    if re.match(r'^[A-Z]\d{2,4}$', query.strip()):
        return Tier.NORD
    # Complex / low confidence → Apex
    if confidence < 0.80 or len(query.split()) > 12:
        return Tier.APEX
    return Tier.FORGE

def generate_v2(query: str, chunks: list, confidence: float, history: list):
    tier = get_tier(query, confidence)
    
    if tier == Tier.NORD:
        return nord_generate(query, chunks), "Nord ⚡"
    elif tier == Tier.FORGE:
        return forge_generate(query, chunks, history), "Forge ⚙️"
    else:
        return apex_generate(query, chunks, history), "Apex 🔥"
```

### What to Show Judges in Round 2
1. Show Nord answering a simple error code query — blazing fast, runs locally
2. Show Forge answering a complex symptom query — richer reasoning
3. Show Apex (Groq) on ambiguous cross-manual case
4. Show tier label in UI — "Answered by: Forge ⚙️"
5. Show comparison: same query answered by Nord vs Forge → quality difference visible

---

# ROUND 3 — BOTH: FULL MECHMIND SYSTEM

## Goal: Win. Show the complete vision. Answer every judge question.

### What Round 3 Looks Like

```
┌─────────────────────────────────────────────┐
│              MechMind v2.0                  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  V1 Tab  │  │  V2 Tab  │  │ Compare  │  │
│  │ API-RAG  │  │Own Model │  │  Side    │  │
│  │          │  │N/F/A     │  │  by Side │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  Same query → V1 answer | V2 answer         │
│  Response time: V1: 2.1s | V2 Nord: 0.3s   │
└─────────────────────────────────────────────┘
```

### What to Build for Round 3 (on top of Round 1+2)

1. **Side-by-side comparison view** in Streamlit
   - User types one query
   - Left panel: V1 answer (GPT-4o API)
   - Right panel: V2 answer (Nord/Forge/Apex)
   - Response time shown for each

2. **Model selector** — user can manually pick which tier answers

3. **Metrics dashboard** (sidebar):
   - Total queries answered
   - Refusals issued
   - Avg confidence score
   - Which tier was used most

### Side-by-Side Streamlit Code

```python
# In app.py for Round 3
import streamlit as st
import time

tab1, tab2, tab3 = st.tabs(["V1: API", "V2: Own Model", "⚡ Compare"])

with tab3:
    st.subheader("Side-by-Side Comparison")
    query = st.text_input("Enter your query")
    
    if query:
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### V1 — GPT-4o API")
            t0 = time.time()
            chunks, conf = retrieve(query)
            v1_answer = generate_v1(query, chunks)
            v1_time = time.time() - t0
            st.write(v1_answer)
            st.caption(f"Response time: {v1_time:.2f}s | Confidence: {conf:.2f}")
        
        with col2:
            st.markdown("### V2 — Nord/Forge/Apex")
            t0 = time.time()
            chunks, conf = retrieve(query)
            v2_answer, tier_used = generate_v2(query, chunks, conf, [])
            v2_time = time.time() - t0
            st.write(v2_answer)
            st.caption(f"Response time: {v2_time:.2f}s | Tier: {tier_used} | Confidence: {conf:.2f}")
```

### Round 3 Demo Script (Practice This)

**Opening line:**
"MechMind has two modes. V1 uses GPT-4o through our RAG pipeline — battle-tested, production-ready. V2 uses our own fine-tuned models: Nord for speed, Forge for reasoning, Apex for complex cases. Let me show you both on the same query."

**Demo sequence:**
1. Open Compare tab
2. Type `E101 Machine Beta`
3. Both answer — point out: "Same citation, same source, but our Nord model is 4x faster"
4. Type `Why would Machine Alpha suddenly stop mid-cycle?`
5. V2 routes to Forge — "complex symptom query, Forge kicks in"
6. Type something not in manuals
7. Both refuse — "Both systems say I don't know. Our confidence gate blocks the LLM before it can hallucinate."

**Closing line:**
"Nord is deployed locally on the factory floor — no internet needed, instant response. Forge and Apex run in the cloud for complex cases. The system picks the right tier automatically."

---

# OVERALL BUILD PRIORITY

```
MUST HAVE (Round 1 qualification):
├── ingest.py ← PDF → ChromaDB with metadata
├── retriever.py ← filter + confidence gate
├── generator.py ← GPT-4o/Groq structured answer
└── app.py ← Streamlit UI

SHOULD HAVE (Round 2 impression):
├── generate_training_data.py ← make fine-tune dataset
├── kaggle_nord_finetune.ipynb ← train Nord
└── models.py ← tier router

NICE TO HAVE (Round 3 win):
├── Compare tab in UI
├── Metrics sidebar
└── Model selector dropdown
```

---

# TIME ALLOCATION ACROSS ROUNDS

| Time | Person A | Person B |
|------|----------|----------|
| Hour 0–12 | Build V1 complete | Help A, then start training data gen |
| Hour 12–18 | Test + polish V1 | Run Nord fine-tune on Kaggle |
| Hour 18–20 | Integrate Nord into app | Help integrate |
| Hour 20–22 | Build compare tab (Round 3 UI) | Test all tiers |
| Hour 22–24 | Full rehearsal — all 3 round demos | Prepare judge Q&A answers |
