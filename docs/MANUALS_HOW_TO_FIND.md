# How to Find Real Machine Manuals
## Round 1: Mock Data | Round 2+3: Real Manuals

---

# ROUND 1 — MOCK DATA (Build This First, Today)

Don't waste time finding real manuals for Round 1. Make 2 fake PDFs with intentional overlapping codes.

## Create Mock Manuals Right Now

### Option A: Use Word / Google Docs → Export as PDF
Copy this content into two separate documents and save as PDF:

**machine_alpha.pdf** (paste this, save as PDF):
```
MACHINE ALPHA — Operations & Fault Code Manual
Manufacturer: AlphaTech Industries | Model: AT-2000 | Version: 3.1

SECTION 5: FAULT CODES

E101 — DC Bus Overvoltage
  Description: DC bus voltage exceeded 420V threshold.
  Probable Causes: Deceleration rate too high; line voltage spike; braking resistor failure.
  Corrective Action:
    Step 1: Measure DC bus voltage at terminals T1-T2 (must be below 420V DC)
    Step 2: Navigate to Parameter P2.04 and increase deceleration time to minimum 8.0 seconds
    Step 3: Inspect braking resistor for continuity using multimeter
    Step 4: If voltage spike suspected, install line filter LF-100A
  Section: 5.1 | Page: 47

E202 — Motor Temperature Sensor Open Circuit
  Description: Temperature sensor TMP-A2 is reading open or short circuit.
  Probable Causes: Damaged sensor cable; failed sensor; loose connector at J7.
  Corrective Action:
    Step 1: Power down machine completely
    Step 2: Check cable continuity at connector J7 (pins 3 and 4)
    Step 3: If reading shows -40°C or 999°C, replace sensor TMP-A2
    Step 4: Re-run motor thermal test from Diagnostics menu
  Section: 5.2 | Page: 53

E303 — Spindle Speed Deviation
  Description: Actual spindle speed deviates more than 10% from commanded speed.
  Probable Causes: Worn spindle belt; incorrect belt tension; spindle motor fault.
  Corrective Action:
    Step 1: Check spindle belt tension (must be 45-55 N at midpoint)
    Step 2: Inspect belt for wear or cracking — replace if worn
    Step 3: Run spindle motor diagnostic (Menu → Test → Spindle)
  Section: 5.3 | Page: 61
```

**machine_beta.pdf** (paste this, save as PDF):
```
MACHINE BETA — Service & Maintenance Manual
Manufacturer: BetaCorp Systems | Model: BC-500X | Revision: 2.4

SECTION 3: ALARM CODES

E101 — Spindle Encoder Signal Lost
  Description: Spindle encoder is not transmitting position feedback to controller.
  Probable Causes: Loose encoder cable at CN5; shielding damage; encoder failure.
  Corrective Action:
    Step 1: Power down machine completely and wait 30 seconds
    Step 2: Reseat encoder cable at connector CN5 (verify latch clicks)
    Step 3: Inspect cable shielding along entire run for damage or pinching
    Step 4: Test encoder output with oscilloscope on pins A and B — 5V square wave expected
    Step 5: If signal absent after steps 1-4, replace encoder ENC-B1
  Section: 3.7 | Page: 29

E202 — Coolant Level Below Minimum
  Description: Coolant reservoir level below minimum sensor threshold.
  Probable Causes: Coolant leak in circuit; evaporation over extended period; sensor fault.
  Corrective Action:
    Step 1: Inspect all coolant lines and joints for visible leaks
    Step 2: Check pump outlet pressure (must be 2.5-3.5 bar)
    Step 3: Refill reservoir to MAX marking using approved coolant mix (30% concentrate)
    Step 4: Run pump test from Diagnostics (Menu → Diagnostics → Coolant → Pump Test)
    Step 5: If level sensor reads LOW when tank is full, replace sensor CS-22
  Section: 3.9 | Page: 34

E303 — Tool Changer Timeout
  Description: Tool changer did not complete cycle within 8-second timeout window.
  Probable Causes: Mechanical jam in carousel; pneumatic pressure low; solenoid failure.
  Corrective Action:
    Step 1: Check air supply pressure (must be 6-8 bar at machine inlet)
    Step 2: Manually rotate carousel to inspect for physical obstruction
    Step 3: Test solenoid valve SV-7 with 24V DC — check for audible click
  Section: 3.11 | Page: 41
```

Notice: E101, E202, E303 exist in BOTH manuals with completely different meanings. Perfect for ambiguity demo.

---

# ROUND 2 & 3 — REAL MANUALS (Free, Legal Downloads)

## Category 1: Siemens (Best for Overlapping Fault Codes)

Siemens publishes all their manuals free directly on their support portal.

| Manual | What's In It | Direct Download |
|--------|-------------|-----------------|
| SINAMICS G120 — Drive Controller | F-codes (F001, F011, F030...) with full cause + remedy | [Download PDF](https://support.industry.siemens.com/cs/attachments/70983838/LH11_0113_eng.pdf) |
| SINAMICS S120/S150 — List Manual | Complete fault + alarm list for S120 series | [Download PDF](https://support.industry.siemens.com/cs/attachments/109781807/S120_S150_list_man_0620_en-US.pdf) |
| SINAMICS G120C — List Manual | G120C fault codes — different meaning from G120 for same codes | [Download PDF](https://support.industry.siemens.com/cs/attachments/99683780/G120C_List_Manual_LH13_0414_eng.pdf) |
| SINUMERIK 840D Alarms Manual | CNC alarm codes, diagnostics | [Download PDF](https://support.industry.siemens.com/cs/attachments/109748391/840Dsl_alarms_diagnostics_man_0517_en-US.pdf) |

**Why Siemens is perfect:** G120 and S120 share many fault code numbers (F001, F011) but they mean different things on each drive model. Built-in ambiguity demo case — real data.

## Category 2: Fanuc (CNC Machines)

| Manual | Where to Get |
|--------|-------------|
| Fanuc Series 0i Maintenance Manual | [cncmanual.com/fanuc](https://cncmanual.com/fanuc/) — search "0i maintenance" |
| Fanuc 16/18/21 Alarm Codes | [cncmanual.com/fanuc/fanuc-16-18-20-21-manuals](https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/) |
| Any Fanuc manual | [manuals.plus/category/fanuc](https://manuals.plus/category/fanuc) |

## Category 3: Allen-Bradley / Rockwell (PLC + Drives)

| Manual | Where to Get |
|--------|-------------|
| PowerFlex 525 Fault Codes | [ManualsLib — PowerFlex 525](https://www.manualslib.com) → search "PowerFlex 525" |
| PowerFlex 400 Fault Codes | [Direct PDF](https://wireless-telemetry.com/PDF/PowerFlex400_Fault_Codes.pdf) |
| PowerFlex 4M User Manual | [ManualsLib](https://www.manualslib.com/manual/1389390/Allen-Bradley-Powerflex-4m.html) |

## Category 4: Any Machine — General Sources

| Site | What It Has | Cost |
|------|------------|------|
| [ManualsLib.com](https://www.manualslib.com/brand/cnc/) | 195,000+ industrial manuals, searchable by model | Free |
| [CNCManual.com](https://cncmanual.com/) | CNC + PLC manuals, direct PDF downloads | Free |
| [ControlManuals.com](http://controlmanuals.com/files/Machinery/CNC-p1.html) | Automation + CNC ebooks | Free |
| [IndustrialManuals.com](https://industrialmanuals.com/) | Factory machinery PDFs — lathes, mills, presses | Free (some paid) |
| [AoteWell.com/download](https://www.aotewell.com/download) | Siemens + ABB + Allen-Bradley docs | Free |
| [Manuals.plus](https://manuals.plus/) | No login needed, model number search | Free |

---

# WHICH MANUALS TO ACTUALLY USE (Recommended Set)

## For Round 2 Demo — Download These 3

| # | Manual | Why | Get It |
|---|--------|-----|--------|
| 1 | Siemens SINAMICS G120 | Real fault codes F001–F999 with causes + remedies | [Link](https://support.industry.siemens.com/cs/attachments/70983838/LH11_0113_eng.pdf) |
| 2 | Siemens SINAMICS S120 | Same F-code numbers, different meanings = perfect ambiguity | [Link](https://support.industry.siemens.com/cs/attachments/109781807/S120_S150_list_man_0620_en-US.pdf) |
| 3 | PowerFlex 400 Fault Codes | Different manufacturer, different code format | [Link](https://wireless-telemetry.com/PDF/PowerFlex400_Fault_Codes.pdf) |

This gives you:
- 3 real machine manuals
- Built-in overlapping codes (G120 vs S120)
- Different manufacturers (Siemens vs Rockwell)
- All codes have real causes + remedies = rich training data

---

# HOW TO INGEST REAL MANUALS

These are large PDFs (300–1000 pages). Follow this process:

```bash
# 1. Download all 3 PDFs into /manuals folder
mkdir -p manuals/round2

# 2. Run ingestion with correct machine IDs
python ingest.py --pdf manuals/round2/sinamics_g120.pdf \
                 --machine_id sinamics_g120 \
                 --manual_name "Siemens SINAMICS G120 Drive" 

python ingest.py --pdf manuals/round2/sinamics_s120.pdf \
                 --machine_id sinamics_s120 \
                 --manual_name "Siemens SINAMICS S120/S150 Drive"

python ingest.py --pdf manuals/round2/powerflex400.pdf \
                 --machine_id powerflex_400 \
                 --manual_name "Allen-Bradley PowerFlex 400 Drive"

# 3. Verify chunks stored correctly
python -c "
import chromadb
db = chromadb.PersistentClient('./chroma_db')
col = db.get_collection('manuals')
print('Total chunks:', col.count())
# Check machine IDs present
results = col.get(where={'machine_id': 'sinamics_g120'}, limit=5)
print('G120 chunks:', len(results['ids']))
"
```

---

# AMBIGUITY DEMO WITH REAL MANUALS

Once G120 and S120 are ingested, test this:

```
Query: "F011"
→ System: "Found F011 in multiple manuals. Which machine?"
→ User: "Siemens G120"
→ Answer: [G120's F011 meaning — correct for G120]

Query: "F011 on S120"  
→ Answer: [S120's F011 meaning — different from G120]
```

This is a REAL demo with real manufacturer data. Judges will be impressed.

---

# SUMMARY

| Round | Manual Type | Action |
|-------|-------------|--------|
| Round 1 | Mock (2 fake PDFs) | Create from scratch using text above |
| Round 2 | Real (Siemens G120 + S120 + PowerFlex) | Download 3 free PDFs, run ingest.py |
| Round 3 | Real + Mock side by side | Show both systems handling real manuals |
