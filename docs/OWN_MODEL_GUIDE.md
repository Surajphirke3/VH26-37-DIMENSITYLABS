# Building Your Own Model Tier System
## Nord (Low) · Forge (Mid) · Apex (High)
### For MechMind — VCET HackC++thon 2026

---

# FIRST: THE HONEST TRUTH

Training a model from scratch = months + millions of dollars + thousands of GPUs.
That is NOT what you do for a hackathon or even a startup MVP.

**What you ACTUALLY do:** Fine-tune an existing open-source model on your domain data.

Think of it like this:
- Base model = a person who went to school for 10 years (pre-trained on internet)
- Fine-tuning = giving that person a 2-week intensive course on factory manuals
- Result = your "own" model — it now speaks your domain, follows your format, refuses correctly

That's how every company does it. Google, Meta, OpenAI — all fine-tuning base models for specific use cases.

---

# THE THREE-TIER PLAN

## Nord — Low Tier (Fast, Lightweight, Local)
- **Base:** `TinyLlama-1.1B` or `Phi-3-mini (3.8B)`
- **Purpose:** Quick lookups, error code matching, simple Q&A
- **Runs on:** A laptop CPU, Raspberry Pi, edge device on factory floor
- **Trade-off:** Less accurate on complex reasoning, faster response
- **Fine-tuned on:** Error code → meaning pairs from manuals

## Forge — Mid Tier (Balanced, Cloud)
- **Base:** `Llama 3.1-8B` or `Mistral-7B`
- **Purpose:** Multi-step troubleshooting, follow-up conversation, cause analysis
- **Runs on:** Single consumer GPU (RTX 3060 or Google Colab free T4)
- **Trade-off:** Good reasoning, moderate speed
- **Fine-tuned on:** Full troubleshooting Q&A pairs with source citations

## Apex — High Tier (Best Quality, Cloud)
- **Base:** `Llama 3.1-70B` or `Mixtral-8x7B`
- **Purpose:** Complex cross-document reasoning, ambiguity resolution, safety-critical answers
- **Runs on:** Multi-GPU server or Groq API (fast inference)
- **Trade-off:** Best accuracy, higher latency, higher cost
- **Fine-tuned on:** Edge cases, ambiguity scenarios, multi-manual cross-referencing

---

# PART 1 — HOW TO GET THE BASE MODEL

## Option A: HuggingFace (Easiest)

```bash
pip install transformers huggingface-hub

# Download Nord base
from huggingface_hub import snapshot_download
snapshot_download("microsoft/Phi-3-mini-4k-instruct", local_dir="./models/nord_base")

# Download Forge base
snapshot_download("meta-llama/Meta-Llama-3.1-8B-Instruct", local_dir="./models/forge_base")

# Download Apex base
snapshot_download("meta-llama/Meta-Llama-3.1-70B-Instruct", local_dir="./models/apex_base")
```

**Note for Llama models:** You need to accept Meta's license at huggingface.co/meta-llama first. Free, takes 1 minute.

## Option B: Ollama (Simplest, for local testing)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull phi3:mini          # Nord base
ollama pull llama3.1:8b        # Forge base
ollama pull llama3.1:70b       # Apex base (needs ~40GB RAM)
```

---

# PART 2 — HOW TO CREATE YOUR TRAINING DATA

This is the most important step. Your model is only as good as your training data.

## What Fine-Tuning Data Looks Like

Every example is a pair: **Input (instruction + context) → Output (answer)**

```json
{
  "instruction": "You are MechMind, a factory machine troubleshooting assistant. Answer only from the provided manual context. Always cite the source.",
  "input": "Manual context: [E101 - DC Bus Overvoltage: Occurs when DC bus exceeds 420V. Fix: Increase decel time P2.04. Page 47 Section 5.3]\n\nQuestion: What does E101 mean on Machine Alpha?",
  "output": "**Error E101 — DC Bus Overvoltage**\n\nMeaning: The DC bus voltage has exceeded the 420V threshold.\n\nProbable Cause: Deceleration rate is set too aggressively.\n\nCorrective Steps:\n1. Measure DC bus voltage at terminals T1-T2\n2. Navigate to Parameter P2.04 and increase deceleration time to 8.0s\n3. If voltage persists above 420V, inspect braking resistor\n\nSource: Machine Alpha Operations Manual, Section 5.3, Page 47"
}
```

## How Many Examples Do You Need?

| Tier | Min Examples | Ideal |
|------|-------------|-------|
| Nord | 200 | 500 |
| Forge | 500 | 2000 |
| Apex | 1000 | 5000+ |

## How to Create Training Data (3 Methods)

### Method 1: Generate from your manuals (fastest)
```python
# Use GPT-4o to generate Q&A pairs from your manual chunks
from openai import OpenAI
client = OpenAI()

def generate_qa_pairs(manual_chunk: str, machine_id: str, n: int = 5):
    prompt = f"""
    Given this section from a factory machine manual:
    ---
    {manual_chunk}
    ---
    Generate {n} question-answer pairs for training a troubleshooting AI.
    Include: error code queries, symptom queries, follow-up questions.
    Format as JSON list: [{{"input": "...", "output": "..."}}]
    Every output must cite: manual name, section, page number.
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# Run this across all your manual chunks → instant dataset
```

### Method 2: Manual annotation (highest quality)
- Open your PDFs
- Write Q&A pairs by hand for every error code, every symptom
- Tedious but produces the cleanest data

### Method 3: Hybrid
- Generate with GPT-4o (Method 1) → review and fix bad ones manually
- Best quality/speed ratio

## Dataset Format — Save as JSONL

```python
import json

dataset = [
    {
        "instruction": "You are MechMind...",
        "input": "Context: [...]\nQuestion: What does E202 mean?",
        "output": "**Error E202 — Temperature Sensor Fault**\n..."
    },
    # ... more examples
]

with open("training_data.jsonl", "w") as f:
    for item in dataset:
        f.write(json.dumps(item) + "\n")
```

---

# PART 3 — HOW TO FINE-TUNE (THE ACTUAL TRAINING)

## Method: LoRA / QLoRA Fine-Tuning

You don't retrain the whole model. That needs 1000s of GPUs.
Instead you use **LoRA** — Low-Rank Adaptation.

Think of it like this: the model has 7 billion knobs. LoRA only adjusts ~0.1% of them (a "low-rank" adapter layer). Way cheaper, almost same result.

**QLoRA** = LoRA + quantization (4-bit). Runs on a single 16GB GPU.

## Setup

```bash
pip install transformers peft trl bitsandbytes accelerate datasets
```

## Fine-Tune Nord (Phi-3-mini) — Runs on Google Colab Free

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer
from datasets import load_dataset
import torch

# 1. Load base model in 4-bit (fits on free Colab T4 GPU)
model_name = "microsoft/Phi-3-mini-4k-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_4bit=True,        # QLoRA — uses 4GB instead of 16GB
    torch_dtype=torch.float16,
    device_map="auto"
)

# 2. LoRA config
lora_config = LoraConfig(
    r=16,              # rank — higher = more learning, more memory
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# 3. Load your dataset
dataset = load_dataset("json", data_files="training_data.jsonl", split="train")

# 4. Format function
def format_example(example):
    return f"### Instruction:\n{example['instruction']}\n\n### Input:\n{example['input']}\n\n### Response:\n{example['output']}"

# 5. Training arguments
training_args = TrainingArguments(
    output_dir="./nord_finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    save_steps=100,
    logging_steps=10,
    warmup_ratio=0.03,
    lr_scheduler_type="cosine"
)

# 6. Train
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    formatting_func=format_example,
    max_seq_length=2048
)
trainer.train()

# 7. Save
model.save_pretrained("./nord_finetuned")
tokenizer.save_pretrained("./nord_finetuned")
print("Nord model saved.")
```

## Fine-Tune Forge (Llama 3.1-8B) — Needs Colab Pro or Kaggle GPU

Same code as above, just change:
```python
model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"
```
Needs ~16GB GPU. Use Kaggle free T4x2 or Colab Pro A100.

## Fine-Tune Apex (Llama 3.1-70B) — Needs Cloud GPU

For Apex, use cloud services:
- **Lambda Labs** — $1.25/hr for A100 (cheapest)
- **RunPod** — $0.79/hr for A100
- **Google Colab Pro+** — A100 available
- **vast.ai** — cheapest rentable GPUs

Or skip fine-tuning Apex and use **Groq API** with Llama 3.1-70B + your RAG system. For a hackathon, this is sufficient and indistinguishable from a fine-tuned Apex.

---

# PART 4 — WHERE TO TRAIN (FREE COMPUTE OPTIONS)

| Platform | GPU | Free? | Good For |
|----------|-----|-------|---------|
| Google Colab Free | T4 (16GB) | Yes | Nord fine-tune |
| Google Colab Pro | A100 (40GB) | $10/mo | Forge fine-tune |
| Kaggle Notebooks | 2x T4 (32GB) | Yes (30hr/week) | Nord + Forge |
| Lambda Labs | A100 (40GB) | No ($1.25/hr) | Apex fine-tune |
| Vast.ai | Various | No (cheap) | Any tier |
| Your PC (RTX 3060+) | 12GB+ | Yes (own hardware) | Nord |

**For Hackathon:** Use Kaggle (free, 30hr/week, 2xT4) for Nord and Forge.

---

# PART 5 — HOW TO TEST YOUR MODEL

## Step 1: Basic Inference Test

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Load fine-tuned model
base_model = AutoModelForCausalLM.from_pretrained("microsoft/Phi-3-mini-4k-instruct")
model = PeftModel.from_pretrained(base_model, "./nord_finetuned")
tokenizer = AutoTokenizer.from_pretrained("./nord_finetuned")

def ask(question: str, context: str):
    prompt = f"### Instruction:\nYou are MechMind...\n\n### Input:\nContext: {context}\nQuestion: {question}\n\n### Response:\n"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.1)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Test
print(ask("What does E101 mean?", "E101: DC Bus Overvoltage. Fix: increase P2.04. Page 47."))
```

## Step 2: Evaluation Metrics

```python
# Test all 4 required demo cases
test_cases = [
    {
        "name": "Exact code query",
        "query": "E101",
        "expected_contains": ["overvoltage", "P2.04", "Page 47"],
        "should_refuse": False
    },
    {
        "name": "Natural language",
        "query": "Machine Alpha is overheating",
        "expected_contains": ["temperature", "sensor", "Section"],
        "should_refuse": False
    },
    {
        "name": "Cross-manual ambiguity",
        "query": "E101 on Machine Beta",
        "expected_contains": ["encoder", "CN5", "Machine Beta"],
        "should_refuse": False
    },
    {
        "name": "Graceful refusal",
        "query": "What is the warranty period?",
        "expected_contains": ["insufficient", "don't know"],
        "should_refuse": True
    }
]

def evaluate(model_fn, test_cases):
    results = []
    for tc in test_cases:
        output = model_fn(tc["query"])
        passed = all(keyword.lower() in output.lower() for keyword in tc["expected_contains"])
        results.append({"test": tc["name"], "passed": passed, "output": output[:200]})
    return results
```

## Step 3: Compare Tiers

Run the same test cases on Nord, Forge, and Apex. Create a table:

| Test Case | Nord | Forge | Apex |
|-----------|------|-------|------|
| Exact code | ✅ | ✅ | ✅ |
| Natural language | ⚠️ | ✅ | ✅ |
| Ambiguity | ❌ | ✅ | ✅ |
| Refusal | ✅ | ✅ | ✅ |
| Avg response time | 0.8s | 2.1s | 4.5s |

This table is GOLD for your presentation. It shows the judges why you have three tiers.

---

# PART 6 — HOW TO DEPLOY YOUR MODELS

## Nord — Local / Edge Deployment

```python
# Convert to GGUF format for edge (runs on CPU)
# pip install llama-cpp-python
from llama_cpp import Llama
llm = Llama(model_path="./nord_finetuned.gguf", n_ctx=2048)
output = llm("Your prompt here", max_tokens=512)
```

## Forge — API Deployment

```python
# Use vLLM for fast inference serving
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
    --model ./forge_finetuned \
    --port 8000

# Call it like OpenAI API
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="none")
```

## Apex — Cloud Inference

For hackathon, point Apex to Groq API (Llama 3.1-70B):
```python
from groq import Groq
client = Groq()  # free API key from console.groq.com
response = client.chat.completions.create(
    model="llama-3.1-70b-versatile",
    messages=[{"role": "user", "content": your_prompt}]
)
```

---

# PART 7 — HOW TO INTEGRATE TIERS INTO MECHMIND

```python
# Smart router — picks the right tier based on query complexity

def select_tier(query: str, confidence_score: float) -> str:
    # Simple query → Nord
    if len(query.split()) < 5 and re.match(r'^[A-Z]\d+$', query.strip()):
        return "nord"
    
    # Complex / ambiguous → Apex
    if confidence_score < 0.80 or "why" in query.lower() or len(query.split()) > 15:
        return "apex"
    
    # Everything else → Forge
    return "forge"

def answer(query: str, chunks: list, confidence: float):
    tier = select_tier(query, confidence)
    
    if tier == "nord":
        return nord_model.generate(query, chunks)
    elif tier == "forge":
        return forge_model.generate(query, chunks)
    else:
        return apex_model.generate(query, chunks)   # Groq API for hackathon
```

---

# PART 8 — HACKATHON REALITY CHECK

## What to Actually Build for the Hackathon

You have ~24 hours. Here's what's realistic:

| What | Realistic? | How |
|------|-----------|-----|
| Full RAG system | ✅ YES | Use LangChain + ChromaDB |
| Nord model (fine-tuned) | ✅ YES (6–8 hrs) | QLoRA on Kaggle free GPU |
| Forge model (fine-tuned) | ⚠️ MAYBE | Only if Kaggle works first try |
| Apex model (fine-tuned) | ❌ NO | Use Groq API instead |
| Tier routing | ✅ YES | Simple if-else classifier |
| Demo showing all 3 tiers | ✅ YES | Nord = local, Forge = API, Apex = Groq |

## What to TELL Judges

"Our system has three model tiers:
- **Nord** — our fine-tuned lightweight model for instant on-device error code lookups
- **Forge** — our mid-tier fine-tuned model for conversational troubleshooting
- **Apex** — our highest-accuracy tier using Llama 3.1-70B for complex cross-document reasoning

Nord was fine-tuned using QLoRA on our domain dataset. Forge is our next training milestone. Apex currently runs on Groq for inference speed."

This is honest, impressive, and completely achievable.

---

# PART 9 — COMPLETE TRAINING CHECKLIST

### Data Preparation
- [ ] Run manual ingestion pipeline (ingest.py)
- [ ] Generate Q&A pairs from chunks using GPT-4o
- [ ] Create 200+ examples for Nord, 500+ for Forge
- [ ] Save as `training_data_nord.jsonl` and `training_data_forge.jsonl`
- [ ] Review 10% manually for quality

### Nord Training (Kaggle / Colab Free)
- [ ] Upload dataset to Kaggle
- [ ] Run QLoRA fine-tune on Phi-3-mini (3–4 hours on T4)
- [ ] Download fine-tuned adapter weights
- [ ] Test locally

### Forge Training (Kaggle 2xT4)
- [ ] Run QLoRA on Llama 3.1-8B (6–8 hours)
- [ ] Download weights
- [ ] Test

### Apex Setup
- [ ] Get free Groq API key at console.groq.com
- [ ] Configure Apex endpoint to use `llama-3.1-70b-versatile`
- [ ] No training needed — RAG system + Groq = Apex

### Integration
- [ ] Build tier router in retriever.py
- [ ] Connect all three to Streamlit UI
- [ ] Add tier indicator in UI ("Answered by: Forge ⚙️")
- [ ] Test all 4 demo cases on each tier

---

# ONE-LINE SUMMARY

**You don't train from scratch. You take a free open-source model (Phi-3, Llama 3.1), run QLoRA fine-tuning on your manual Q&A data for free on Kaggle GPUs, and the result is YOUR model — Nord, Forge, and Apex — tailored to factory machine troubleshooting.**
