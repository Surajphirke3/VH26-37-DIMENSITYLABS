# Manual Strategy — What to Do (No Manuals Provided)

---

## The Answer: Do BOTH

You need to:
1. **Pre-load 2–3 demo manuals yourself** (for your live demo)
2. **Build an upload feature** so judges can add their own manuals in real-time

This is actually the BEST approach — it shows the system works out of the box AND is extensible.

---

## PART 1: The Demo Manuals You Pre-Load (Do This)

### Strategy: Use FREE, publicly available real manuals

These are real factory/machine manuals, freely downloadable as PDFs:

| Manual | Machine | Where to Get |
|--------|---------|--------------|
| Fanuc Series 0i Maintenance Manual | CNC Machine (Fanuc) | fanuc.eu → Resources → Manuals |
| Siemens SINAMICS G120 Fault List | Drive / Motor Controller | support.industry.siemens.com |
| Allen-Bradley PowerFlex 525 Manual | AC Drive | literature.rockwellautomation.com |

**Why these?** They all have overlapping error codes (E.g., F001, F011 exist in all three with different meanings). Perfect for the ambiguity demo case.

### If you can't download them in time: CREATE fake manuals

Create 2 simple PDF files yourself with overlapping error codes:

**Machine Alpha Manual (machine_alpha.pdf)**
```
MACHINE ALPHA — Operations & Fault Manual

Section 5: Fault Codes

E101 — DC Bus Overvoltage
  Meaning: The DC bus voltage has exceeded 420V.
  Cause: Deceleration rate too high, or line voltage spike.
  Action:
    1. Measure DC bus voltage at terminals T1-T2.
    2. Increase deceleration time (Parameter P2.04 → set to 8.0s).
    3. Install braking resistor if issue persists.
  Page: 47, Section 5.1

E202 — Temperature Sensor Fault
  Meaning: Motor temperature sensor open or short circuit.
  Cause: Damaged sensor cable or failed sensor.
  Action:
    1. Check cable continuity at connector J7.
    2. Replace sensor TMP-A2 if reading is -40°C or 999°C.
  Page: 53, Section 5.2
```

**Machine Beta Manual (machine_beta.pdf)**
```
MACHINE BETA — Service & Maintenance Manual

Section 3: Alarm Codes

E101 — Spindle Encoder Signal Lost
  Meaning: The spindle encoder is not sending position feedback.
  Cause: Loose encoder cable at CN5, or encoder failure.
  Action:
    1. Power down the machine completely.
    2. Reseat encoder cable at connector CN5.
    3. Check cable shielding for damage.
    4. Replace encoder ENC-B1 if signal is still absent.
  Page: 29, Section 3.7

E202 — Coolant Level Low
  Meaning: Coolant reservoir below minimum level sensor.
  Cause: Coolant leak or evaporation over time.
  Action:
    1. Inspect all coolant lines for leaks.
    2. Refill reservoir to MAX marking.
    3. Run coolant pump test (Menu → Diagnostics → Pump Test).
  Page: 34, Section 3.9
```

Notice: **E101 and E202 exist in both manuals with completely different meanings.** This is your killer demo case.

---

## PART 2: Build an Upload Feature in the UI

Add this to your Streamlit app so judges can upload their own manuals live:

```python
# In app.py — sidebar upload section
with st.sidebar:
    st.header("📂 Load Manuals")
    
    # Show already-loaded manuals
    st.subheader("Pre-loaded Manuals")
    st.success("✅ Machine Alpha Manual")
    st.success("✅ Machine Beta Manual")
    
    # Upload new manual
    st.subheader("Upload New Manual")
    machine_name = st.text_input("Machine Name", placeholder="e.g. Machine Gamma")
    uploaded_file = st.file_uploader("Upload PDF Manual", type="pdf")
    
    if uploaded_file and machine_name:
        if st.button("Ingest Manual"):
            with st.spinner(f"Processing {uploaded_file.name}..."):
                # Save temp file
                import tempfile, os
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(uploaded_file.read())
                    tmp_path = tmp.name
                
                # Ingest it
                machine_id = machine_name.lower().replace(" ", "_")
                ingest_manual(tmp_path, machine_id, f"{machine_name} Manual")
                os.unlink(tmp_path)
            
            st.success(f"✅ {machine_name} manual loaded!")
            st.rerun()
```

---

## PART 3: Demo Flow for Judges (Use This Script)

### Step 1 — Show pre-loaded manuals
"We've pre-loaded two manuals: Machine Alpha and Machine Beta. Both have the error code E101, but it means completely different things on each machine."

### Step 2 — Exact code query
Type: `E101`
System asks: "Which machine? I found E101 in Machine Alpha and Machine Beta."
Select Machine Beta.
System returns: Encoder Signal Lost, Page 29, Section 3.7 ✅

### Step 3 — Natural language query
Type: `Machine Alpha is making a high-pitched noise and stopped`
System returns relevant fault codes from Alpha's manual ✅

### Step 4 — Upload a new manual live
Upload a third PDF in front of judges.
Type a question from that new manual.
System answers it instantly. ✅ (Shows real-time extensibility)

### Step 5 — Graceful refusal
Type: `What is the warranty period for Machine Beta?`
System: "Insufficient information. Confidence: 0.38 (threshold: 0.75)" ✅

---

## Summary: What You Need to Prepare

| Item | Action |
|------|--------|
| Demo Manual 1 | Create `machine_alpha.pdf` with fake but realistic content |
| Demo Manual 2 | Create `machine_beta.pdf` with overlapping codes (E101, E202) |
| Demo Manual 3 (optional) | Download a real Fanuc / Siemens manual for bonus points |
| Upload UI | Build sidebar uploader in Streamlit (code above) |
| Pre-ingestion | Run `ingest.py` on both demo manuals before the demo |
| Backup | Keep ChromaDB folder backed up — if it corrupts, you lose everything |

---

## One Rule: Never Demo Without Pre-Ingested Manuals

Always run `python ingest.py` before your presentation and verify the DB exists.
If ChromaDB is empty, every query will fail. This is the #1 way teams crash their demo.
