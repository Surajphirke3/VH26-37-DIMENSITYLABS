# MechMind Test Data Plan

**Version:** 1.0  
**Last Updated:** 2026-09-04  
**Purpose:** Define the exact synthetic test data (PDF manuals and user accounts) required for the MechMind test suite.

---

## Overview

MechMind requires realistic machine service manual PDFs to test the RAG pipeline. Because real manufacturer manuals may be proprietary, the test suite uses three synthetic PDFs generated using `reportlab` (or an equivalent PDF generation library).

These synthetic manuals are designed to produce specific, predictable test behaviors:

1. **HaasVF2_Service_Manual.pdf** — Haas VF-2 CNC Mill  
2. **FanucOiMF_Service_Manual.pdf** — Fanuc 0i-MF CNC Controller  
3. **KukaKR6_Robot_Manual.pdf** — KUKA KR6 Industrial Robot

Manuals 1 and 2 deliberately share error codes E101 and E202 with different meanings to create cross-machine ambiguity for disambiguation testing. Manual 3 uses a different error code prefix (F-series) to test scope isolation.

---

## Manual 1: HaasVF2_Service_Manual.pdf

### Metadata

| Field | Value |
|-------|-------|
| **Filename** | `HaasVF2_Service_Manual.pdf` |
| **Machine Name** | Haas VF-2 CNC Vertical Machining Center |
| **Machine ID (in system)** | `machine-haas-vf2` |
| **Manual Version** | 2.1 |
| **Total Pages** | 12 (synthetic — enough for realistic chunking) |
| **Author** | Haas Automation (synthetic — do not use real manufacturer identity in production) |

### Section Structure

```
Page 1: Cover page
  - Title: "Haas VF-2 CNC Vertical Machining Center — Service Manual"
  - Version: 2.1
  - Date: January 2024
  - Warning: "For use by trained service personnel only"

Page 2: Table of Contents
  - Section 1: Safety Information ........... 3
  - Section 2: System Overview .............. 4
  - Section 3: Error Code Reference ......... 5
  - Section 4: Error Code Procedures ........ 7

Page 3: Safety Information
  - WARNING: Disconnect power before servicing
  - CAUTION: Coolant system may be pressurized — relieve pressure before opening lines
  - CAUTION: Spindle may rotate unexpectedly — ensure E-stop is engaged before servicing spindle
  - Note: All maintenance must be performed by qualified CNC technicians

Page 4: System Overview
  - Brief description of the Haas VF-2 machining center
  - Key systems: Spindle drive, axis servo system, cooling system, tool changer
  - Paragraph: "The VF-2 is a full-featured vertical machining center capable of 6,000 RPM spindle speed
    with a 30-station tool changer. The cooling system maintains spindle and workpiece temperature
    through a closed-loop coolant circuit."

Page 5: Error Code Reference Table (Section 3)
  - Table header: Error Code | Description | Severity | Corrective Action Reference
  - Row 1: E101 | Cooling System Pressure Loss | HIGH | See Section 4.1, Page 7
  - Row 2: E202 | Spindle Drive Overload | HIGH | See Section 4.2, Page 9
  - Row 3: E303 | Axis Servo Fault | MEDIUM | See Section 4.3, Page 11

Page 6: Error Code Index (alphabetical listing)
  - E101: Cooling System Pressure Loss (Page 7)
  - E202: Spindle Drive Overload (Page 9)
  - E303: Axis Servo Fault (Page 11)

Page 7–8: Section 4.1 — Error E101: Cooling System Pressure Loss
  Content:
  "Error E101 — Cooling System Pressure Loss

  Description:
  The Haas VF-2 cooling system pressure has dropped below the minimum threshold of 40 PSI.
  This error indicates a loss of coolant pressure in the primary cooling circuit. The machine
  will halt all operations to prevent thermal damage to the spindle bearings and drive systems.

  Possible Causes:
  1. Coolant reservoir level is below the minimum fill line
  2. Coolant pump has failed or is operating below rated output
  3. Coolant line is leaking or has become disconnected
  4. Coolant filter is blocked and restricting flow

  Corrective Procedure:
  Step 1: Press E-STOP to ensure machine is in a safe state. Do not attempt to clear this error
          while the machine is in motion.
  Step 2: Open the coolant reservoir access panel on the left side of the machine cabinet.
          Check the coolant level indicator. If the level is below the MIN mark, add approved
          Haas coolant concentrate (Part #TC-15) diluted 1:10 with water.
  Step 3: Inspect all visible coolant lines for cracks, loose connections, or leaks.
          Tighten any loose fittings. Replace cracked lines.
  Step 4: Locate the coolant pump motor (mounted in the base of the machine, behind the front
          access panel). Press the manual pump test button to verify pump operation. If the pump
          does not activate, check fuse F7 in the main electrical cabinet.
  Step 5: Replace the coolant filter element (Part #CF-101) if it has not been replaced in the
          last 500 operating hours.
  Step 6: After corrective action, clear the alarm by pressing RESET on the control panel.
          Run a coolant pressure test cycle to verify pressure returns to above 50 PSI.
  Step 7: If the error persists after completing all steps above, contact Haas service support
          with the error log timestamp.

  Related Errors: E102 (Coolant Temperature High), E103 (Coolant Flow Low)"

Page 9–10: Section 4.2 — Error E202: Spindle Drive Overload
  Content:
  "Error E202 — Spindle Drive Overload

  Description:
  The Haas VF-2 spindle drive amplifier has detected an overload condition. The spindle motor
  has drawn more current than the rated maximum, indicating excessive cutting load or a mechanical
  fault in the spindle assembly. The machine halts immediately to protect the spindle motor and
  drive electronics.

  Possible Causes:
  1. Cutting parameters too aggressive (feed rate or depth of cut too high for material/tool)
  2. Tool is worn or broken — excessive cutting resistance
  3. Spindle bearings are worn — causing mechanical drag
  4. Spindle drive amplifier is failing
  5. Coolant flow to spindle is insufficient — causing thermal overload

  Corrective Procedure:
  Step 1: Press E-STOP. Do not attempt to restart the spindle immediately.
  Step 2: Remove the cutting tool and inspect for wear, chipping, or breakage. Replace if
          damaged. Verify tool holder is correctly seated and locked.
  Step 3: Review the CNC program cutting parameters. Reduce feed rate by 20% and depth of
          cut by 30% as a starting point. Re-run with the adjusted parameters.
  Step 4: Listen for unusual noise from the spindle during slow manual rotation (use HANDLE
          JOG mode at minimum speed). Rough or grinding noise indicates bearing wear.
          If bearing wear is suspected, contact Haas service for spindle inspection.
  Step 5: Check spindle amplifier status lights in the main electrical cabinet. Amber light
          indicates overload; red light indicates fault requiring amplifier replacement.
  Step 6: Clear the alarm with RESET. Run spindle at 500 RPM for 2 minutes to verify stable
          operation before resuming production.

  Related Errors: E203 (Spindle Temperature High), E204 (Spindle Encoder Fault)"

Page 11–12: Section 4.3 — Error E303: Axis Servo Fault
  Content:
  "Error E303 — Axis Servo Fault

  Description:
  An axis servo drive has detected a fault condition. The affected axis (X, Y, or Z) has been
  disabled as a safety measure. The control panel will display which axis is faulted.

  Possible Causes:
  1. Axis servo drive overtemperature
  2. Following error exceeded — axis is not tracking commanded position
  3. Servo drive power supply fault
  4. Encoder feedback fault — encoder cable damaged or dirty encoder disk
  5. Mechanical binding in the axis ball screw or linear guides

  Corrective Procedure:
  Step 1: Note which axis is displayed as faulted on the control panel (X, Y, or Z).
  Step 2: Check the servo drive status display in the electrical cabinet. Error code on the
          drive display will provide specific sub-fault information.
  Step 3: Allow the machine to cool for 15 minutes if overtemperature is indicated.
  Step 4: Check the encoder cable for the faulted axis. Reseat the connector at both the
          motor and the controller ends.
  Step 5: Inspect the axis ball screw for debris or signs of damage. Clean if necessary.
  Step 6: Clear the alarm with RESET and jog the axis slowly through its full range of travel.
          Monitor for mechanical resistance or abnormal noise.
  Step 7: If the fault reappears immediately, contact Haas service — the servo drive or motor
          may require replacement.

  Related Errors: E304 (Axis Overtravel), E305 (Axis Following Error Exceeded)"
```

### Key Design Decisions for Testing

- E101 description must include the phrase "cooling system pressure" — used to verify Haas-specific retrieval in disambiguation tests
- E202 description must include the phrase "spindle drive overload" — distinct from Fanuc E202 "communication fault"
- E303 exists only in this manual — used for AMB-004 (single-machine match, no disambiguation)

---

## Manual 2: FanucOiMF_Service_Manual.pdf

### Metadata

| Field | Value |
|-------|-------|
| **Filename** | `FanucOiMF_Service_Manual.pdf` |
| **Machine Name** | Fanuc 0i-MF CNC Controller |
| **Machine ID (in system)** | `machine-fanuc-0imf` |
| **Manual Version** | 3.0 |
| **Total Pages** | 12 |
| **Author** | Fanuc Corporation (synthetic) |

### Section Structure

```
Page 1: Cover page
  - Title: "Fanuc 0i-MF CNC Controller — Alarm and Error Code Service Manual"
  - Version: 3.0
  - Date: March 2024
  - Warning: "Unauthorized modification of controller parameters may void warranty"

Page 2: Table of Contents
  - Section 1: Safety Precautions ........... 3
  - Section 2: Alarm Classification ......... 4
  - Section 3: Alarm Code Reference ......... 5
  - Section 4: Corrective Procedures ........ 7

Page 3: Safety Precautions
  - WARNING: High voltage present in servo amplifier cabinet — qualified personnel only
  - CAUTION: Do not power-cycle the controller more than once per 30 seconds — risk of parameter loss
  - Note: Always perform a parameter backup before servicing the controller

Page 4: Alarm Classification
  - PS Alarms: Program and parameter errors — non-critical, operator can clear
  - SV Alarms: Servo system errors — machine halted, technician required
  - OT Alarms: Overtravel errors — axis limit reached
  - SP Alarms: Spindle alarms — spindle system errors
  - Note: Alarm numbers in this manual are indexed as Ennn format for compatibility

Page 5–6: Error Code Reference Table (Section 3)
  - Table header: Alarm Code | Type | Description | Severity | Reference
  - Row 1: E101 | SV | Servo Motor Overload — Axis | HIGH | Section 4.1, Page 7
  - Row 2: E202 | PS | Communication Fault — Serial Bus | MEDIUM | Section 4.2, Page 9
  - Row 3: E404 | PS | Program Memory Error | LOW | Section 4.3, Page 11

Page 7–8: Section 4.1 — Alarm E101: Servo Motor Overload
  Content:
  "Alarm E101 — Servo Motor Overload (SV Alarm)

  Description:
  The Fanuc 0i-MF servo amplifier has detected that a servo motor on one of the controlled
  axes has exceeded its rated continuous current limit. This is a servo motor overload condition —
  the affected axis has been disabled to prevent thermal damage to the motor winding and drive
  transistors. This alarm is distinct from a mechanical overtravel or position error.

  Affected Axes: Alarm display will indicate the specific axis (X, Y, Z, or 4th axis).

  Possible Causes:
  1. Cutting load too high — workpiece material, feed rate, or depth of cut exceeds servo capacity
  2. Servo motor has been running continuously near rated current — duty cycle issue
  3. Servo motor winding has degraded insulation — thermal runaway
  4. Servo amplifier is malfunctioning — providing incorrect current regulation
  5. Mechanical friction in the ball screw or linear guide — increased load on motor

  Corrective Procedure:
  Step 1: Record the alarm number and the axis indicated on the Fanuc control display.
  Step 2: Power off the machine and allow the servo motors and amplifiers to cool for 20 minutes.
  Step 3: Check the servo amplifier status LEDs in the controller cabinet for the affected axis.
          A red LED on the amplifier indicates an internal fault.
  Step 4: Inspect the ball screw and linear guides on the affected axis for lubrication.
          Apply Fanuc-approved grease (Part #A98L-0040-0174) if dry.
  Step 5: Verify that the axis load meter readings in Fanuc diagnostic screen (DGNOS #060–063)
          are within rated values during manual jogging. If load exceeds 80% during light jog,
          the motor or amplifier requires replacement.
  Step 6: Review the machining program: reduce feed rates and depths of cut by 25%. Increase
          tool dwell times at corners.
  Step 7: Reset the alarm using MDI mode: type RESET and press CYCLE START. If alarm returns
          within 5 minutes of operation, contact Fanuc service.

  Related Alarms: E102 (Servo Amplifier Overheat), E103 (Servo Drive Fault)"

Page 9–10: Section 4.2 — Alarm E202: Communication Fault — Serial Bus
  Content:
  "Alarm E202 — Communication Fault — Serial Bus (PS Alarm)

  Description:
  The Fanuc 0i-MF controller has detected a communication fault on the I/O serial bus (FSSB
  or I/O Link). Data transmission between the CNC controller and one or more connected devices
  (servo amplifiers, I/O modules, or external devices) has been interrupted. The controller
  has halted the program to prevent operation with incomplete I/O data.

  Note: This alarm is a controller communication issue — it is not related to spindle or axis
  motor function. Verify network and cable connections before checking hardware.

  Possible Causes:
  1. Fiber optic cable connecting controller to servo amplifier is damaged or disconnected
  2. I/O module has failed — no response on I/O Link
  3. EMI interference disrupting serial communication — common near high-power equipment
  4. Controller firmware error — rare; resolved by firmware update
  5. Ground fault in I/O wiring

  Corrective Procedure:
  Step 1: Note the detailed alarm sub-code displayed on the Fanuc screen. Sub-codes identify
          which device on the serial bus has failed to communicate.
  Step 2: Power off the controller completely (not E-stop — full power off at breaker).
          Wait 30 seconds and power on. Check if alarm clears on restart.
  Step 3: Inspect all fiber optic cables between the controller and servo amplifier cabinet.
          Check for kinks, tight bends (minimum bend radius 30mm), or physical damage.
          Reseat all fiber optic connectors — clean connector faces with the supplied cleaning tool.
  Step 4: Check the I/O module indicator LEDs. Green = normal; amber = error; off = no power.
          Replace any I/O module showing an error indicator.
  Step 5: Verify grounding: check that all cabinet ground straps are securely connected and
          the machine is properly grounded to the factory earth point.
  Step 6: If a specific servo amplifier is identified by sub-code: power off and reseat all
          cable connections to that amplifier.
  Step 7: If alarm persists after all physical checks, contact Fanuc support — a firmware
          update or controller board replacement may be required.

  Related Alarms: E203 (I/O Link Error), E204 (FSSB Alarm)"

Page 11–12: Section 4.3 — Alarm E404: Program Memory Error
  Content:
  "Alarm E404 — Program Memory Error (PS Alarm)

  Description:
  The Fanuc 0i-MF controller has detected an error in the CNC program stored in memory.
  This may be due to a corrupted program file, a program that exceeds memory capacity, or
  a syntax error in the G-code program. The controller will not execute the program until
  the error is resolved.

  Possible Causes:
  1. G-code program contains a syntax error (invalid G or M code, missing block end character)
  2. Program memory is full — total stored programs exceed available SRAM
  3. Program file was corrupted during transfer (USB or network transfer error)
  4. Battery-backed SRAM has failed — program data lost

  Corrective Procedure:
  Step 1: Select the program in question on the Fanuc display. Check the program for obvious
          syntax errors — look for invalid characters, missing percent signs (%), or
          unclosed parentheses in comments.
  Step 2: Check available program memory: press SYSTEM > PARAMETER > MEMORY. If used memory
          is above 90%, delete unused programs.
  Step 3: Re-transfer the program from the source computer. Use a direct RS-232 or USB
          connection rather than network transfer for reliability.
  Step 4: If the SRAM battery warning alarm has been active recently, the program may be
          corrupt due to power failure during battery replacement. Restore from backup.
  Step 5: Clear the alarm with RESET. Re-run the program in DRY RUN mode with single block
          to verify correct execution.

  Related Alarms: E405 (Program Not Found), E406 (Data Setting Error)"
```

### Key Design Decisions for Testing

- E101 description must prominently use the phrase "servo motor overload" — clearly distinct from Haas E101 "cooling system pressure"
- E202 description must prominently use the phrase "communication fault" and "serial bus" — clearly distinct from Haas E202 "spindle drive overload"
- E404 exists only in this manual — creates an asymmetric test case for scope verification

---

## Manual 3: KukaKR6_Robot_Manual.pdf

### Metadata

| Field | Value |
|-------|-------|
| **Filename** | `KukaKR6_Robot_Manual.pdf` |
| **Machine Name** | KUKA KR6 Industrial Robot |
| **Machine ID (in system)** | `machine-kuka-kr6` |
| **Manual Version** | 1.5 |
| **Total Pages** | 10 |
| **Author** | KUKA Robotics (synthetic) |

### Section Structure

```
Page 1: Cover page
  - Title: "KUKA KR6 Industrial Robot — Fault Diagnosis and Service Manual"
  - Version: 1.5
  - Date: June 2024
  - Warning: "Robot operation near personnel requires validated safety fence and light curtain"

Page 2: Table of Contents
  - Section 1: Safety Zones and Exclusion Areas .. 3
  - Section 2: Fault Code Overview ............... 4
  - Section 3: Fault Code Reference .............. 5
  - Section 4: Corrective Procedures ............. 7

Page 3: Safety Zones and Exclusion Areas
  - WARNING: The KR6 robot arm can cause severe injury. Always verify the safety fence is
    operational and the light curtain is calibrated before approaching the work envelope.
  - DANGER: Never enter the robot work envelope while the controller is powered — even if
    the robot appears stationary, it may resume motion on alarm clear.
  - Safe operating zones: Zone A (outside fence, always safe), Zone B (maintenance access
    with controller in T1 mode and deadman switch held), Zone C (interior work envelope,
    never safe while powered)
  - Note: All fault codes in this manual use the F-prefix format (e.g., F101) — do not
    confuse with E-prefix fault codes used by other machine types in your facility.

Page 4: Fault Code Overview
  - F-prefix faults are KUKA KR6 specific
  - Fault severity levels: STOP (immediate motion stop), PAUSE (motion paused, resumable),
    WARNING (informational, no motion stop)
  - F101–F199: Joint and base motion faults
  - F200–F299: Arm and tool faults
  - F300–F399: Controller and communication faults

Page 5–6: Fault Code Reference Table
  - Table header: Fault Code | Description | Severity | Corrective Action Reference
  - Row 1: F101 | Base Joint Drive Fault | STOP | Section 4.1, Page 7
  - Row 2: F202 | Arm Joint Overload | STOP | Section 4.2, Page 9

Page 7–8: Section 4.1 — Fault F101: Base Joint Drive Fault
  Content:
  "Fault F101 — Base Joint Drive Fault

  Description:
  The KUKA KR6 controller has detected a fault in the A1 (base rotation) joint drive.
  All robot motion has been stopped immediately. Fault F101 in the KUKA KR6 is a base joint
  drive fault, and is specific to the rotary drive that controls the robot's base rotation axis.
  This fault is unrelated to any coolant system or servo motor overload — it is specific to the
  joint drive electronics and mechanical train of the KUKA KR6 base axis.

  Possible Causes:
  1. A1 joint drive module has overheated
  2. A1 joint encoder feedback signal is lost or corrupted
  3. A1 joint drive module has failed
  4. Mechanical obstruction or collision has caused the base joint to bind

  Corrective Procedure:
  Step 1: IMMEDIATELY verify that all personnel are clear of the robot work envelope.
          Activate the emergency stop if not already active.
  Step 2: Note the exact fault code and sub-code displayed on the KUKA SmartPAD teach pendant.
  Step 3: Allow the robot to cool for 15 minutes — do not attempt to restart the drive while hot.
  Step 4: Inspect the base joint area for any physical obstructions, debris, or signs of
          collision damage. Check the cable routing for the A1 axis — cables must not be
          pinched or sharply bent.
  Step 5: In T1 (low-speed) mode with a qualified technician holding the deadman switch,
          manually jog the A1 (base) axis slowly through a 10-degree arc. Listen for grinding
          or clicking noises that indicate mechanical damage.
  Step 6: Check the A1 drive module status on the KUKA controller cabinet. The module's LED
          indicator will show: green = normal, amber = warning, red = fault requiring replacement.
  Step 7: If the LED shows red, power off the controller, replace the A1 drive module, and
          perform a mastering check on the A1 axis before returning to production.
  Step 8: Clear the fault on the SmartPAD and run a low-speed test cycle in T1 mode before
          returning to automatic operation.

  Related Faults: F102 (A1 Joint Encoder Error), F103 (A1 Joint Overtravel)"

Page 9–10: Section 4.2 — Fault F202: Arm Joint Overload
  Content:
  "Fault F202 — Arm Joint Overload

  Description:
  The KUKA KR6 controller has detected that one of the arm joints (A2, A3, or the wrist joints
  A4–A6) has exceeded its rated torque or current limit. The robot halts immediately. Fault F202
  is an arm joint overload condition specific to the KUKA KR6 robot — it relates to the robot
  arm's multi-axis joint drive system, not to a machine tool spindle or CNC axis.

  Affected Joint: The SmartPAD display will identify which joint (A2 through A6) is affected.

  Possible Causes:
  1. Payload exceeds rated capacity — tool or workpiece is too heavy for the arm configuration
  2. Robot path passes through a singularity position at excessive speed
  3. Collision — robot arm impacted an obstacle
  4. Joint reducer (gearbox) has failed — mechanical overload at joint

  Corrective Procedure:
  Step 1: Verify all personnel are clear of the work envelope. Activate E-stop.
  Step 2: Check the payload configuration in the KUKA robot parameters. The KR6 has a rated
          payload of 6 kg. If the current tool + workpiece weight exceeds 6 kg, the payload
          must be reduced or a higher-capacity robot must be used.
  Step 3: Review the robot program for singularity positions — points where two or more joint
          axes align. Use the KUKA singularity avoidance feature and add intermediate waypoints.
  Step 4: Inspect the affected joint for signs of collision damage (bent arm segment, cracked
          housing, leaking gearbox oil).
  Step 5: In T1 mode with deadman switch held, jog the affected joint through its range.
          Resistance or noise indicates gearbox damage requiring replacement by a KUKA-certified
          service technician.
  Step 6: If no physical damage is found, reduce robot speed to 50% and clear the fault on
          the SmartPAD. Run a test cycle in T1 mode before returning to AUTO.

  Related Faults: F203 (Wrist Joint Overload), F204 (Joint Reducer Oil Level Low)"
```

### Key Design Decisions for Testing

- F-prefix error codes are deliberately distinct from E-prefix (Haas, Fanuc) — tests code format scoping
- No error code overlap with Manuals 1 or 2 — KUKA tests AMB-004 (single-machine match)
- Prominent safety warnings about the work envelope — tests that safety content is preserved in chunking
- F101 description explicitly states "This fault is unrelated to any coolant system or servo motor overload" — guards against cross-contamination test failures

---

## Test User Accounts

The following user accounts are seeded by `scripts/seed_demo.py` for development and by `scripts/seed_test_data.py` for automated tests.

### User Account Definitions

| Email | Display Name | Role | Password | Notes |
|-------|-------------|------|----------|-------|
| `admin@mechmind.com` | System Admin | `admin` | `AdminTest123!` | Full system access; used for admin endpoint tests |
| `manager@mechmind.com` | Plant Manager | `manager` | `ManagerTest123!` | Can upload manuals; used for upload endpoint tests |
| `technician@mechmind.com` | Floor Tech | `technician` | `TechTest123!` | Query access only; used for standard RAG pipeline tests |
| `technician2@mechmind.com` | Floor Tech 2 | `technician` | `TechTest456!` | Second technician for cross-user isolation tests (AUTHZ-002) |

**Important:** These test passwords are for automated testing environments only. They are not used in production. The seed script must check `ENVIRONMENT != "production"` before creating these accounts.

### Account Properties

All seeded accounts:
- `is_active: true`
- `is_email_verified: true`
- `failed_login_attempts: 0`
- `created_at: seed script run time`

Admin and manager accounts have all three test manuals assigned to their accessible machines. Both technician accounts have all three machines accessible.

---

## Generating Synthetic PDFs

The synthetic PDF content above should be generated using `reportlab` or `fpdf2`. The generator script should be at `scripts/generate_test_pdfs.py`.

### Generation Requirements

1. **Text must be extractable** — PDFs must be generated with real text layers (not images of text). The RAG pipeline extracts text using PyMuPDF/pdfplumber, which requires a text layer.

2. **Section headers must be distinguishable** — Use a larger font size (14pt or bold) for section headers so that section-aware chunking can split at logical boundaries.

3. **The error code table must be a real table** — Use reportlab's `Table` object or equivalent so the PDF contains structured table data. This tests the chunker's ability to handle tabular content.

4. **Page numbers must be embedded** — Use reportlab's page number footer. The RAG pipeline stores page numbers in chunk metadata.

5. **Consistent font** — Use a monospace or standard font (not an unusual embedded font) to ensure reliable text extraction.

### Generator Script Parameters

```python
# scripts/generate_test_pdfs.py
# Usage: python scripts/generate_test_pdfs.py --output-dir tests/fixtures/pdfs/

MANUALS = [
    {
        "filename": "HaasVF2_Service_Manual.pdf",
        "title": "Haas VF-2 CNC Vertical Machining Center — Service Manual",
        "version": "2.1",
        "machine_id": "machine-haas-vf2",
        "error_codes": {
            "E101": {
                "name": "Cooling System Pressure Loss",
                "severity": "HIGH",
                "page": 7,
                "description": "...",  # Full description from above
                "steps": ["..."]        # Full steps from above
            },
            "E202": { ... },
            "E303": { ... }
        }
    },
    {
        "filename": "FanucOiMF_Service_Manual.pdf",
        ...
    },
    {
        "filename": "KukaKR6_Robot_Manual.pdf",
        ...
    }
]
```

---

## Test Fixtures Location

```
tests/
  fixtures/
    pdfs/
      HaasVF2_Service_Manual.pdf        (generated)
      FanucOiMF_Service_Manual.pdf      (generated)
      KukaKR6_Robot_Manual.pdf          (generated)
    golden_dataset/
      golden_dataset_v1.json            (20-item golden dataset)
    users/
      test_users.json                   (test user definitions)
  conftest.py                           (pytest fixtures for seeding)
scripts/
  generate_test_pdfs.py                 (PDF generator — run once)
  seed_demo.py                          (demo environment seed)
  seed_test_data.py                     (test environment seed)
  verify_index.py                       (verify PDFs are indexed correctly)
```

---

## Verification Checklist

After generating and indexing the test PDFs, verify the following before running the test suite:

- [ ] All three PDFs are indexed — `GET /api/v1/manuals` returns 3 items
- [ ] E101 is retrievable from Haas manual with correct description (cooling)
- [ ] E101 is retrievable from Fanuc manual with correct description (servo motor overload)
- [ ] E303 retrieval returns chunks from Haas manual only
- [ ] F101 retrieval returns chunks from KUKA manual only
- [ ] E999 retrieval returns no chunks from any manual (used in refusal tests)
- [ ] All four test user accounts exist and can authenticate
- [ ] Technician role cannot access `POST /api/v1/manuals/upload`
- [ ] Admin role can access `GET /api/v1/audit-logs`

Run `python scripts/verify_index.py` to execute all of the above checks automatically.
