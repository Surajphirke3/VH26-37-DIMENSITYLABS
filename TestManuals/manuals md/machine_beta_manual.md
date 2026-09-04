# MACHINE BETA BC-500X
## Comprehensive Operation, Maintenance, and Service Manual

**Manufacturer:** BetaCorp Systems, Inc.
**Model:** BC-500X CNC Machining Center
**Document Number:** BCS-MAN-BC500X-REV4.2
**Revision Date:** September 2026
**Language:** English (EN-US)

---

```
██████╗ ███████╗████████╗ █████╗  ██████╗ ██████╗ ██████╗
██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗
██████╔╝█████╗     ██║   ███████║██║     ██║   ██║██████╔╝
██╔══██╗██╔══╝     ██║   ██╔══██║██║     ██║   ██║██╔══██╗
██████╔╝███████╗   ██║   ██║  ██║╚██████╗╚██████╔╝██║  ██║
╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝
         SYSTEMS
```

**BC-500X CNC MACHINING CENTER**
**COMPLETE TECHNICAL MANUAL**

---

> **IMPORTANT SAFETY NOTICE**
> This manual must be read in its entirety before installing, operating, or servicing the BC-500X machine. Failure to follow all instructions, warnings, and cautions contained herein may result in serious personal injury, death, or significant property damage. BetaCorp Systems, Inc. assumes no liability for injuries or damages resulting from failure to comply with the procedures described in this document.

---

**BetaCorp Systems, Inc.**
4500 Industrial Parkway
Greenfield, OH 45123
United States of America

Technical Support: +1 (800) 555-BETA (2382)
International: +1 (740) 555-9200
Fax: +1 (740) 555-9201
Email: techsupport@betacorpsystems.com
Web: www.betacorpsystems.com

**Parts & Service:** parts@betacorpsystems.com
**Emergency Hotline (24/7):** +1 (800) 555-9911

---

Copyright © 2024–2026 BetaCorp Systems, Inc. All rights reserved. No part of this manual may be reproduced, transmitted, stored in a retrieval system, or translated into any language in any form or by any means without the prior written permission of BetaCorp Systems, Inc. BetaCorp Systems reserves the right to make changes to this manual and to the products described herein without notice.

**Printed in the United States of America**
**Document Part Number: BCS-DOC-10042-EN**

---

## WARNINGS, CAUTIONS, AND NOTES — HOW TO USE THIS MANUAL

Throughout this manual, the following signal words are used to alert the reader to conditions that may affect personal safety or equipment integrity:

> **DANGER** — Indicates an imminently hazardous situation which, if not avoided, WILL result in death or serious injury.

> **WARNING** — Indicates a potentially hazardous situation which, if not avoided, COULD result in death or serious injury.

> **CAUTION** — Indicates a potentially hazardous situation which, if not avoided, MAY result in minor or moderate injury, or equipment damage.

> **NOTE** — Provides additional information that may be helpful but is not safety-critical.

---

## REVISION HISTORY

| Revision | Date | Author | Changes |
|----------|------|--------|---------|
| 1.0 | 2024-01-15 | J. Harrington | Initial release |
| 1.1 | 2024-03-20 | M. Kowalski | Added hydraulic section updates |
| 2.0 | 2024-07-01 | Engineering Team | Major revision: Tool changer service chapter added |
| 2.1 | 2024-09-14 | R. Okonkwo | Fault code table expanded to 150+ codes |
| 3.0 | 2025-01-10 | J. Harrington | Parameter reference revised for firmware v3.x |
| 3.1 | 2025-04-22 | M. Kowalski | Coolant system chapter rewritten |
| 4.0 | 2025-10-01 | Engineering Team | Encoder section updated; spare parts catalog revised |
| 4.1 | 2026-02-14 | R. Okonkwo | Safety chapter expanded per OSHA 2026 updates |
| 4.2 | 2026-09-01 | J. Harrington | Current release; hydraulic diagram revised |

---

# TABLE OF CONTENTS

## PART 1 — INTRODUCTION AND SAFETY

**Chapter 1 — Introduction and General Information**
- 1.1 About This Manual ........................................................ 28
- 1.2 Machine Identification ................................................... 29
- 1.3 Intended Use ................................................................ 30
- 1.4 Foreseeable Misuse ...................................................... 31
- 1.5 Residual Risks .............................................................. 32
- 1.6 Applicable Standards and Regulations .......................... 33
- 1.7 Environmental Conditions for Operation ......................... 34
- 1.8 Noise Emission Data ..................................................... 35
- 1.9 Electromagnetic Compatibility (EMC) .............................. 36
- 1.10 Warranty Information .................................................... 37
- 1.11 Disposal and Recycling ................................................ 38

**Chapter 2 — Safety Instructions** .................................................. 40
- 2.1 General Safety Philosophy ............................................. 40
- 2.2 Qualified Personnel Requirements .................................. 42
- 2.3 Personal Protective Equipment (PPE) .............................. 44
- 2.4 Electrical Safety ............................................................ 48
- 2.4.1 Arc Flash Hazard Assessment ................................ 50
- 2.4.2 Lockout/Tagout (LOTO) Procedures ....................... 54
- 2.4.3 Capacitor Discharge Waiting Periods ...................... 61
- 2.4.4 Ground Fault Protection ........................................ 63
- 2.5 Mechanical Safety ......................................................... 65
- 2.5.1 Rotating Component Hazards ................................ 67
- 2.5.2 Pinch Point Identification ...................................... 69
- 2.5.3 Stored Energy — Springs and Counterweights ........ 72
- 2.6 Hydraulic Pressure Hazards ........................................... 74
- 2.6.1 High-Pressure Injection Injury Risk ........................ 76
- 2.6.2 Hydraulic Line De-pressurization ........................... 78
- 2.6.3 Hot Oil Burns ........................................................ 80
- 2.7 Pneumatic System Safety .............................................. 82
- 2.8 Coolant and Chemical Hazards ....................................... 84
- 2.9 Chip and Swarf Hazards ................................................. 87
- 2.10 Emergency Stop Procedures ........................................ 89
- 2.10.1 E-Stop Locations ................................................ 90
- 2.10.2 Machine Restart After E-Stop .............................. 92
- 2.11 Fire Safety .................................................................. 94
- 2.12 Guards and Interlocks — Never Bypass ........................ 97
- 2.13 Safe Work Practices During Maintenance ..................... 100
- 2.14 Confined Space Considerations .................................. 104
- 2.15 Chemical Right-to-Know (GHS/SDS) .......................... 106

## PART 2 — TECHNICAL SPECIFICATIONS

**Chapter 3 — Technical Specifications** ........................................ 110
- 3.1 Machine Overview ....................................................... 110
- 3.2 Work Envelope and Travel Specifications ...................... 112
- 3.3 Spindle Specifications ................................................. 114
- 3.4 Feed and Rapid Traverse Rates .................................... 116
- 3.5 Tool Changer Specifications ......................................... 117
- 3.6 Electrical Specifications .............................................. 119
- 3.6.1 Main Power Supply Requirements ........................ 119
- 3.6.2 Control Cabinet Power Distribution ...................... 121
- 3.6.3 Motor Power Ratings ........................................... 122
- 3.7 Hydraulic System Specifications .................................. 124
- 3.8 Pneumatic System Specifications ................................ 126
- 3.9 Coolant System Specifications .................................... 127
- 3.10 Axis Servo System Specifications .............................. 128
- 3.11 Encoder Specifications .............................................. 130
- 3.12 Physical Dimensions and Weight ............................... 132
- 3.13 Ambient Environmental Specifications ....................... 134
- 3.14 Noise and Vibration ................................................... 135
- 3.15 CE/UL/CSA Compliance Data .................................... 136

## PART 3 — INSTALLATION

**Chapter 4 — Installation Guide** ................................................. 140
- 4.1 Pre-Installation Planning .............................................. 140
- 4.2 Site Preparation and Foundation .................................. 142
- 4.2.1 Foundation Drawing and Requirements ................ 143
- 4.2.2 Anchor Bolt Installation ...................................... 147
- 4.2.3 Leveling Pads and Vibration Isolation ................... 150
- 4.3 Machine Delivery and Rigging ...................................... 153
- 4.3.1 Lifting Points and Rigging Diagram ....................... 155
- 4.3.2 Unpacking and Inspection ................................... 158
- 4.4 Machine Leveling ....................................................... 161
- 4.5 Electrical Connection .................................................. 164
- 4.5.1 Power Supply Wiring to Main Disconnect ............. 165
- 4.5.2 Grounding Requirements .................................... 168
- 4.5.3 Control Transformer Tap Selection ....................... 170
- 4.6 Hydraulic System Connection ...................................... 172
- 4.6.1 Hydraulic Power Unit Installation ......................... 174
- 4.6.2 Hydraulic Line Connection and Flushing ............... 176
- 4.7 Pneumatic System Connection ..................................... 179
- 4.8 Coolant System Filling ................................................. 182
- 4.9 Chip Conveyor Installation ........................................... 185
- 4.10 Initial Power-On and System Checkout ........................ 187
- 4.11 Commissioning Procedure ......................................... 191
- 4.12 Geometry and Accuracy Verification ........................... 196
- 4.13 Final Acceptance Testing ........................................... 200

## PART 4 — MACHINE COMPONENTS

**Chapter 5 — Machine Components** ............................................ 205
- 5.1 Machine Base and Column ........................................... 205
- 5.2 Spindle Assembly ........................................................ 208
- 5.2.1 Spindle Motor ..................................................... 210
- 5.2.2 Spindle Bearings ................................................. 212
- 5.2.3 Spindle Encoder .................................................. 214
- 5.2.4 Tool Retention (Draw Bar) System ....................... 217
- 5.3 Axis Servo Motors and Drives ...................................... 220
- 5.3.1 X-Axis Assembly ................................................. 222
- 5.3.2 Y-Axis Assembly ................................................. 224
- 5.3.3 Z-Axis Assembly ................................................. 226
- 5.3.4 Ballscrew and Nut Assemblies ............................. 228
- 5.3.5 Linear Guideways ............................................... 230
- 5.4 Tool Changer Carousel (24-Position) ............................. 232
- 5.4.1 Carousel Drive Motor and Gear Assembly ............. 235
- 5.4.2 Tool Pot and Gripper Assembly ............................ 238
- 5.4.3 ATC Arm Assembly .............................................. 241
- 5.4.4 ATC Position Sensors .......................................... 244
- 5.5 Hydraulic Power Unit ................................................... 247
- 5.5.1 Hydraulic Pump .................................................. 249
- 5.5.2 Hydraulic Valves ................................................. 251
- 5.5.3 Hydraulic Cylinders ............................................. 254
- 5.6 Coolant System .......................................................... 257
- 5.6.1 Coolant Tank and Pump ...................................... 259
- 5.6.2 Coolant Filters ..................................................... 261
- 5.6.3 Coolant Nozzles and Distribution ......................... 263
- 5.7 Chip Conveyor ............................................................ 265
- 5.8 Lubrication System (Way Lube) .................................... 267
- 5.9 Enclosure and Guarding .............................................. 270
- 5.10 Control Panel and Operator Interface .......................... 272
- 5.11 Pendant and MPG Hand Wheel ................................... 275
- 5.12 Electrical Cabinet ...................................................... 277

## PART 5 — OPERATION

**Chapter 6 — Operation Manual** ................................................. 282
- 6.1 Operator Qualification and Training ............................... 282
- 6.2 Pre-Operation Safety Inspection ................................... 284
- 6.3 Machine Power-On Sequence ....................................... 287
- 6.4 Machine Homing (Reference Return) Procedure ............. 291
- 6.5 Control Panel Layout and Functions .............................. 295
- 6.6 Manual Operation Modes ............................................. 300
- 6.6.1 JOG Mode ........................................................... 302
- 6.6.2 HANDLE (MPG) Mode ........................................... 304
- 6.6.3 Single-Block Mode ............................................... 306
- 6.7 Program Entry and Editing ............................................ 308
- 6.7.1 MDI (Manual Data Input) Mode ............................. 310
- 6.7.2 Program Storage and Management ....................... 312
- 6.8 Tool Management ....................................................... 315
- 6.8.1 Tool Length Offset Setup ..................................... 317
- 6.8.2 Tool Radius Offset Setup ..................................... 320
- 6.8.3 Tool Life Management ......................................... 322
- 6.9 Workpiece Setup and Fixture ....................................... 325
- 6.9.1 Work Coordinate System Setup ........................... 327
- 6.9.2 Part Probing (Optional) ........................................ 330
- 6.10 Coolant System Operation .......................................... 332
- 6.11 Automatic Cycle Operation ......................................... 335
- 6.11.1 Program Selection ............................................. 337
- 6.11.2 Cycle Start and Feed Hold ................................... 339
- 6.11.3 Override Functions ............................................. 341
- 6.12 Machine Power-Off Sequence ..................................... 344
- 6.13 Emergency Situations During Operation ....................... 346

## PART 6 — PARAMETER REFERENCE

**Chapter 7 — Parameter Reference** ............................................. 350
- 7.1 Introduction to BC-500X Parameters ............................ 350
- 7.2 Parameter Group B1.xx — Spindle Parameters .............. 354
- 7.3 Parameter Group B2.xx — Axis Motion Parameters ........ 368
- 7.4 Parameter Group B3.xx — Tool Changer Parameters ...... 382
- 7.5 Parameter Group B4.xx — Hydraulic System Parameters . 396
- 7.6 Parameter Group B5.xx — Coolant System Parameters ... 408
- 7.7 Parameter Group B6.xx — Encoder/Feedback Parameters . 420
- 7.8 Parameter Group B7.xx — Communication Parameters ... 432
- 7.9 Parameter Group B8.xx — Safety and Interlock Parameters 442
- 7.10 Parameter Group B9.xx — Diagnostic Parameters ........ 454

## PART 7 — FAULT CODES AND TROUBLESHOOTING

**Chapter 8 — Fault Codes and Troubleshooting** ........................... 466
- 8.1 Fault System Overview ................................................ 466
- 8.2 Fault Log Access and Management ............................... 469
- 8.3 Fault Code Reference Table — Complete Listing ............. 472
- 8.4 Critical Faults (E001–E099) ......................................... 475
- 8.5 Encoder and Feedback Faults (E100–E199) ................... 490
  - 8.5.1 E101 — Spindle Encoder Signal Lost .................... 491
- 8.6 Coolant System Faults (E200–E299) ............................. 510
  - 8.6.1 E202 — Coolant Level Below Minimum ................ 511
- 8.7 Tool Changer Faults (E300–E399) ................................ 526
  - 8.7.1 E303 — Tool Changer Timeout ............................ 527
- 8.8 Hydraulic System Faults (E400–E499) .......................... 544
  - 8.8.1 E404 — Hydraulic Pressure Low .......................... 545
- 8.9 Servo System Faults (E500–E599) ............................... 562
  - 8.9.1 E505 — Axis Servo Overload ............................... 563
- 8.10 Communication and I/O Faults (E600–E699) ............... 580
- 8.11 PLC and Logic Faults (E700–E799) ............................ 594
- 8.12 Thermal and Environmental Faults (E800–E899) .......... 606
- 8.13 System Configuration Faults (E900–E999) ................... 618

## PART 8 — MAINTENANCE

**Chapter 9 — Maintenance Schedule** ............................................ 630
- 9.1 Maintenance Philosophy and Preventive Maintenance Overview ... 630
- 9.2 Daily Maintenance Tasks .............................................. 634
- 9.3 Weekly Maintenance Tasks ........................................... 642
- 9.4 Monthly Maintenance Tasks .......................................... 650
- 9.5 Quarterly Maintenance Tasks ........................................ 660
- 9.6 Semi-Annual Maintenance Tasks ................................... 670
- 9.7 Annual Maintenance Tasks ........................................... 682
- 9.8 Hydraulic Oil Change Procedure ................................... 694
- 9.9 Coolant Replacement Procedure ................................... 702
- 9.10 Spindle Bearing Inspection ......................................... 710
- 9.11 Tool Changer Lubrication ........................................... 716
- 9.12 Encoder Cable Inspection and Replacement ................. 722
- 9.13 Ballscrew and Guideway Maintenance ......................... 728
- 9.14 Way Lube System Maintenance ................................... 734
- 9.15 Filter Replacement Schedule ....................................... 740

## PART 9 — SPARE PARTS CATALOG

**Chapter 10 — Spare Parts Catalog** ............................................. 748
- 10.1 How to Order Parts .................................................... 748
- 10.2 Spindle Assembly Parts ............................................. 751
- 10.3 Axis Drive Parts ........................................................ 758
- 10.4 Tool Changer Parts .................................................... 764
- 10.5 Hydraulic System Parts ............................................. 770
- 10.6 Coolant System Parts ................................................ 776
- 10.7 Electrical and Control Parts ........................................ 782
- 10.8 Enclosure and Structure Parts .................................... 788
- 10.9 Lubrication System Parts ........................................... 792
- 10.10 Chip Conveyor Parts ................................................ 795
- 10.11 Consumables and Wear Items ................................... 798

## PART 10 — HYDRAULIC SYSTEM MANUAL

**Chapter 11 — Hydraulic System Manual** ..................................... 804
- 11.1 Hydraulic System Overview ........................................ 804
- 11.2 Hydraulic Circuit Description ...................................... 807
- 11.3 Hydraulic Power Unit (HPU) ........................................ 812
- 11.4 Pressure Settings and Adjustment .............................. 816
- 11.5 Hydraulic Valve Descriptions ...................................... 820
- 11.6 Hydraulic Cylinder Operation ...................................... 826
- 11.7 Hydraulic Oil Specifications ....................................... 830
- 11.8 Contamination Control ............................................... 834
- 11.9 Hydraulic System Diagnostics .................................... 838

## PART 11 — COOLANT SYSTEM GUIDE

**Chapter 12 — Coolant System Guide** .......................................... 844
- 12.1 Coolant System Overview ........................................... 844
- 12.2 Coolant Selection and Mixing Ratios ........................... 847
- 12.3 pH Monitoring and Control ......................................... 853
- 12.4 Bacterial Contamination Testing ................................. 858
- 12.5 Coolant Maintenance Procedures ............................... 863
- 12.6 Tramp Oil Removal .................................................... 868
- 12.7 Coolant Disposal Procedures ...................................... 872
- 12.8 Coolant System Troubleshooting ................................ 876

## PART 12 — TOOL CHANGER SERVICE

**Chapter 13 — Tool Changer Service Manual** ................................ 882
- 13.1 Tool Changer Overview .............................................. 882
- 13.2 Carousel Positioning and Indexing .............................. 886
- 13.3 Gripper Adjustment and Replacement ......................... 892
- 13.4 ATC Sensor Setup and Adjustment ............................. 898
- 13.5 ATC Arm Timing and Adjustment ................................ 904
- 13.6 Tool Changer Troubleshooting .................................... 910

## PART 13 — APPENDICES

**Appendix A — Glossary of Terms** ............................................... 918
**Appendix B — Hydraulic Fluid Specifications** .............................. 928
**Appendix C — Torque Specifications Chart** ................................ 934
**Appendix D — Electrical Schematic Index** ................................... 940
**Appendix E — Pneumatic Schematic Index** ................................. 944
**Appendix F — Service Contact Directory** .................................... 948
**Appendix G — Spare Parts Quick-Reference** ............................... 952
**Appendix H — Parameter Quick-Reference Card** ......................... 956
**Appendix I — Maintenance Log Template** ................................... 960
**Appendix J — Warranty Registration** .......................................... 964

---

# PART 1 — INTRODUCTION AND SAFETY

---

# Chapter 1 — Introduction and General Information

## 1.1 About This Manual

This manual provides complete technical documentation for the BetaCorp Systems BC-500X CNC Machining Center. It is intended to serve as the primary reference for all personnel involved in the installation, operation, maintenance, and service of this machine tool. The manual is organized into thirteen parts and multiple appendices, covering every aspect of the machine from initial site preparation through advanced troubleshooting.

**Who Should Read This Manual:**

- **Installation Engineers:** Read Chapters 1, 2, 3, and 4 completely before beginning any installation activities.
- **Machine Operators:** Read Chapters 1, 2, 3, and 6 completely. Refer to Chapter 8 for fault code resolution.
- **Maintenance Technicians:** Read all chapters. Pay particular attention to Chapters 9, 11, 12, and 13.
- **Service Engineers:** All chapters are required reading. Chapters 5, 7, 8, 11, 12, and 13 are of primary importance.
- **Supervisors and Safety Officers:** Chapters 1 and 2 are essential. Review Chapter 9 for maintenance scheduling.

**Manual Organization:**

This manual follows a logical progression from general information through increasingly detailed technical content. Part 1 establishes the safety foundation that must be understood before any work is performed. Subsequent parts build on this foundation with specific technical information for each machine system.

Cross-references throughout the manual direct the reader to related information in other sections. When a procedure references a parameter number (e.g., Parameter B1.14), that parameter is fully described in Chapter 7. When a procedure references a fault code (e.g., E404), full details are found in Chapter 8.

**Electronic Version:**

This manual is available in PDF format on the BetaCorp Systems customer portal at docs.betacorpsystems.com. The electronic version includes hyperlinked cross-references and bookmarks for rapid navigation. Always verify you are viewing the current revision by checking the document number and revision on the cover page against the revision posted on the customer portal.

**Language:**

This manual is available in English, German, French, Spanish, Italian, Portuguese, Japanese, Korean, and Mandarin Chinese. Contact BetaCorp Systems to obtain translated copies. In the event of any discrepancy between the English version and a translated version, the English version shall take precedence.

---

## 1.2 Machine Identification

The BC-500X CNC Machining Center carries multiple identification numbers that are required when contacting BetaCorp Systems for technical support, spare parts, or warranty service.

**Machine Serial Number Plate Location:**

The primary serial number plate is mounted on the right side of the machine base, approximately 400 mm (15.75 in) from the front of the machine, at approximately 900 mm (35.4 in) above floor level. A secondary serial number label is located inside the main electrical cabinet on the door inner panel.

**Information on the Serial Number Plate:**

| Field | Description | Example |
|-------|-------------|---------|
| Model | Machine model designation | BC-500X |
| Serial No. | Unique machine serial number | BC500X-2025-04817 |
| Mfg. Date | Date of manufacture (YYYY-MM) | 2025-08 |
| Voltage | Machine rated voltage | 480V / 3Ph / 60Hz |
| Max Power | Connected load in kVA | 45 kVA |
| Weight | Machine net weight | 8,500 kg |
| CE Mark | European conformity (if applicable) | CE |

**Control System Identification:**

The CNC control unit carries its own serial number, which is visible on the control pendant and also accessible through the diagnostic menu: SYSTEM → DIAGNOSTIC → CONTROL INFO.

| Field | Description |
|-------|-------------|
| Control Model | BetaCorp CNC Controller Model 5000 |
| Firmware Version | v4.2.1 or later |
| PLC Version | v3.8 or later |
| HMI Version | v4.2.0 or later |

**When Contacting Technical Support:**

Always have the following information ready:
1. Machine model (BC-500X)
2. Machine serial number
3. Control firmware version
4. Nature of the problem or fault code displayed
5. Recent maintenance history relevant to the issue
6. Customer name, contact name, phone, and email

---

## 1.3 Intended Use

The BC-500X CNC Machining Center is a computer numerically controlled vertical machining center designed for precision metal cutting operations. The machine is intended exclusively for:

**Approved Workpiece Materials:**

- Carbon steel (up to 60 HRC with appropriate tooling)
- Alloy steel (including tool steels, stainless steels)
- Cast iron (gray iron, ductile iron, malleable iron)
- Aluminum alloys (cast and wrought)
- Copper and copper alloys (brass, bronze)
- Titanium alloys (with appropriate speeds and coolant flow)
- Nickel-based superalloys (with reduced parameters and appropriate tooling)
- Engineering plastics (with appropriate chip management)

**Approved Machining Operations:**

- Face milling
- Peripheral (end) milling
- Pocket milling
- Slot milling
- Drilling
- Boring (line boring and single-point boring)
- Reaming
- Tapping (rigid and floating)
- Contouring and profiling

**Approved Tooling:**

The BC-500X accepts tooling with CAT-40 (7/24 taper) or BT-40 (MAS 403 BT-40) tool holders. Maximum tool weight is 8 kg (17.6 lb). Maximum tool diameter in the tool magazine is 80 mm (3.15 in) for adjacent pockets occupied; 125 mm (4.92 in) for adjacent pockets empty. Maximum tool length from gauge line is 300 mm (11.81 in).

**Approved Coolant:**

Water-soluble metalworking fluids (semi-synthetic or fully synthetic) at concentrations between 5% and 12% as specified in Chapter 12. Neat (straight) cutting oil is NOT approved for this machine as configured from the factory. Contact BetaCorp Systems for information on conversion kits for minimum quantity lubrication (MQL) or through-spindle oil application.

---

## 1.4 Foreseeable Misuse

The following uses are NOT approved and may result in machine damage, injury, or voiding of warranty:

1. **Grinding operations:** The BC-500X is not designed for abrasive wheel grinding. Grinding dust will contaminate the linear guideways, ballscrews, and spindle bearings and will cause rapid degradation.

2. **Machining of explosive, radioactive, or highly toxic materials:** These materials require specialized equipment and are beyond the scope of this machine's design.

3. **Use as a press or stamping machine:** The machine structure and servo systems are not designed for the impulsive loading associated with pressing or stamping operations.

4. **Operation beyond specified work envelope:** Attempting to machine workpieces that require axis travel beyond the machine's specified limits will cause over-travel faults and potential collision damage.

5. **Overloading the table:** The maximum allowable workpiece and fixture weight on the table is 600 kg (1,323 lb). This limit must not be exceeded.

6. **Bypassing safety guards or interlocks:** Guards are integral to the machine's safety system. Operating with guards removed or interlocks defeated is expressly prohibited.

7. **Operation by unqualified personnel:** The machine must only be operated by personnel who have completed BetaCorp Systems' approved training program or equivalent training as documented by the employer.

8. **Modification of machine structure or control software:** Unauthorized hardware modifications or modification of machine control software will void the warranty and may create hazardous conditions.

---

## 1.5 Residual Risks

Despite comprehensive guarding and safety systems, certain residual risks cannot be completely eliminated. Users must be aware of the following:

| Risk | Location | Protective Measure Required |
|------|----------|-----------------------------|
| Chip ejection during door opening | Work zone door | Do not open door until spindle has fully stopped; wear face shield |
| Coolant splash | Work zone | Wear eye protection; ensure door seals are in good condition |
| High-pressure coolant injury | Coolant nozzles | Never direct nozzle at skin; de-pressurize before adjusting |
| Pinch point — tool changer arm | Tool changer area | Never reach into tool change area during operation |
| Hot chips and workpiece | Work zone | Allow adequate cooling time; use chip hooks, never hands |
| Noise during cutting | Machine area | Wear hearing protection during prolonged exposure |
| Tripping on coolant overflow | Machine perimeter | Keep floor clean; use anti-slip flooring |
| Ergonomic strain during loading | Table area | Use appropriate lifting aids for heavy fixtures |

---

## 1.6 Applicable Standards and Regulations

The BC-500X is designed and manufactured in compliance with the following standards and regulations:

**United States:**
- OSHA 29 CFR Part 1910.217 — Mechanical Power Presses (general principles applied)
- OSHA 29 CFR Part 1910.147 — Control of Hazardous Energy (LOTO)
- OSHA 29 CFR Part 1910.303–308 — Electrical Standards
- ANSI B11.8 — Safety Requirements for Turning, Milling, and Machining Centers
- ANSI B11.19 — Performance Criteria for Safeguarding
- NFPA 70 (NEC) — National Electrical Code
- NFPA 79 — Electrical Standard for Industrial Machinery

**European Union (CE Marked Versions):**
- Machinery Directive 2006/42/EC
- Low Voltage Directive 2014/35/EU
- EMC Directive 2014/30/EU
- EN ISO 16090-1:2017 — Machine tools safety — Machining Centres
- EN 60204-1:2018 — Safety of Machinery — Electrical Equipment of Machines
- EN ISO 13849-1:2015 — Safety of Machinery — Safety-Related Parts of Control Systems

**Canada:**
- CAN/CSA-Z432 — Safeguarding of Machinery
- CSA C22.2 No. 14 — Industrial Control Equipment

---

## 1.7 Environmental Conditions for Operation

The BC-500X is designed for installation and operation in controlled factory environments meeting the following conditions:

| Parameter | Requirement |
|-----------|-------------|
| Ambient temperature (operation) | +5°C to +40°C (41°F to 104°F) |
| Ambient temperature (storage/transport) | -20°C to +60°C (-4°F to +140°F) |
| Relative humidity | 20% to 75% non-condensing |
| Altitude | 0 to 1,000 m (0 to 3,281 ft) above sea level |
| Altitude (derated) | Up to 2,000 m with power derating; contact BetaCorp |
| Vibration (installation site) | Less than 0.2 g RMS, 10–200 Hz |
| Pollution degree | Pollution Degree 2 (IEC 60664-1) |
| Floor loading capacity | Minimum 15,000 kg/m² (3,073 lb/ft²) |
| Magnetic fields | Avoid installation near strong magnetic field sources |

> **NOTE:** Operation outside the specified temperature range will result in degraded accuracy and potential component damage. The machine requires a minimum of 4 hours of thermal stabilization at room temperature before precision work is performed.

---

## 1.8 Noise Emission Data

Sound measurements were taken in accordance with ISO 3746:2010 under defined machining conditions (dry run at maximum rapid traverse rate, no cutting).

| Measurement | Value |
|-------------|-------|
| A-weighted sound pressure level at operator position | 74 dB(A) (dry run) |
| A-weighted sound pressure level at operator position | Up to 84 dB(A) (machining steel) |
| A-weighted sound power level | 89 dB(A) (machining steel) |
| Peak C-weighted instantaneous sound pressure | Less than 130 dB(C) |

> **WARNING:** Continuous exposure to sound levels at or above 85 dB(A) requires hearing protection. At the maximum measured levels during steel cutting operations, workers must wear appropriate hearing protection. Refer to Section 2.3 for PPE requirements.

---

## 1.9 Electromagnetic Compatibility (EMC)

The BC-500X is designed to comply with applicable EMC requirements. The following practices must be observed to maintain compliance:

1. All cable routing must follow the guidelines in Chapter 4. Signal cables must be separated from power cables by a minimum of 200 mm (8 in) or run in separate grounded conduit.
2. The machine must be connected to an adequately grounded power supply.
3. Modifications to the electrical system, including the addition of non-BetaCorp components, may void EMC compliance.
4. The machine generates conducted and radiated emissions. Sensitive electronic equipment should not be located within 2 m (6.5 ft) of the machine.
5. If the machine is to be installed in a location subject to strong external RF fields (e.g., near broadcast antennas), consult BetaCorp Systems before installation.

---

## 1.10 Warranty Information

BetaCorp Systems warrants the BC-500X CNC Machining Center against defects in materials and workmanship for a period of **24 months from the date of acceptance** or **30 months from the date of shipment from our factory**, whichever occurs first.

**Warranty Coverage Includes:**
- Defects in materials or workmanship in all machine components
- Control system hardware defects
- Hydraulic system component defects
- Spindle assembly defects (excluding normal bearing wear)

**Warranty Does NOT Cover:**
- Normal wear items (cutting tools, filters, seals, V-belts, coolant)
- Damage caused by failure to follow maintenance procedures in this manual
- Damage caused by use of incorrect coolant, lubricant, or hydraulic fluid
- Damage caused by operation outside specified environmental conditions
- Damage caused by unauthorized modifications
- Damage caused by crash events (tool-in-work collisions, axis over-travel events)
- Consumable items including but not limited to: way wiper seals, bellows, light bulbs, fuses

**Warranty Claim Procedure:**
1. Contact BetaCorp Systems Technical Support at +1 (800) 555-BETA
2. Obtain a Return Material Authorization (RMA) number
3. Document the defect with photographs and fault logs
4. Do not return parts without an RMA number

Complete warranty terms and conditions are available at www.betacorpsystems.com/warranty and in Appendix J of this manual.

---

## 1.11 Disposal and Recycling

At end of life, the BC-500X must be disposed of in accordance with all applicable local, state, federal, and international regulations.

**Materials Requiring Special Handling:**

| Material | Location | Handling Requirement |
|----------|----------|--------------------|
| Hydraulic oil | Hydraulic reservoir | Collect and recycle through licensed waste oil processor |
| Coolant fluid | Coolant tank | Collect and process through licensed waste water facility |
| Electrical components | Control cabinet | Recycle through certified e-waste facility (WEEE Directive in EU) |
| Batteries | CNC control board | Lithium batteries require separate disposal |
| Fluorescent lamps | Enclosure lighting | Mercury — separate disposal required |
| Way lube | Lubrication reservoir | Collect and recycle through licensed processor |
| Steel/cast iron | Machine structure | Metal recycling |
| Aluminum | Machine components | Metal recycling |

Contact your local waste management authority for specific requirements in your jurisdiction. BetaCorp Systems can provide guidance on decommissioning services.

---

# Chapter 2 — Safety Instructions

## 2.1 General Safety Philosophy

BetaCorp Systems designs the BC-500X with safety as the primary consideration in every aspect of the machine's design. However, no machine can be made completely safe if misused or improperly maintained. The BC-500X is a powerful industrial machine capable of generating substantial forces and operating at speeds that can cause serious injury or death if proper safety precautions are not observed.

**The Hierarchy of Safety Controls:**

BetaCorp Systems has applied the following hierarchy of safety controls in the design of the BC-500X, listed from highest to lowest preference:

1. **Elimination:** Design features that eliminate hazards entirely (e.g., fully enclosed work zone eliminates exposure to cutting zone)
2. **Substitution:** Use of safer materials and processes where possible
3. **Engineering Controls:** Guards, interlocks, emergency stops, safety relays
4. **Administrative Controls:** Training requirements, operating procedures, maintenance schedules
5. **Personal Protective Equipment (PPE):** Last line of defense; required in addition to all other controls

**Fundamental Safety Rules:**

The following rules are absolute and must never be violated:

**RULE 1:** Always follow the lockout/tagout procedure in Section 2.4.2 before performing any maintenance, service, or adjustment that requires access to hazardous energy sources.

**RULE 2:** Never operate the machine with guards removed or interlocks bypassed. If a guard is damaged or missing, tag the machine out of service and repair before resuming operation.

**RULE 3:** Never put any part of your body inside the machine work zone, tool changer area, or any other area identified as a hazardous zone while the machine is in an energized state (exception: de-energized and locked out per LOTO procedure).

**RULE 4:** If you observe an unsafe condition, stop work immediately and report the condition to your supervisor. Do not resume work until the condition is corrected.

**RULE 5:** Never modify the machine's safety systems. This includes: removing or tying back safety relays, bridging interlock circuits, modifying machine parameters related to safety functions without authorization from BetaCorp Systems.

---

## 2.2 Qualified Personnel Requirements

Different tasks on the BC-500X require different levels of qualification. The following personnel classifications are defined:

### 2.2.1 Machine Operator

A machine operator is a person who operates the BC-500X to perform production machining tasks. The operator does not perform electrical service, mechanical disassembly, or hydraulic work.

**Minimum Qualifications for Operator:**
- Must be at least 18 years of age
- Must have completed BetaCorp Systems' BC-500X Operator Training course (16 hours minimum) or equivalent training documented by employer
- Must demonstrate ability to identify and respond to all fault codes in the operator's quick reference guide
- Must demonstrate ability to execute emergency stop and machine power-down procedures
- Must demonstrate knowledge of PPE requirements for machining operations
- Must NOT be under the influence of alcohol, prescription medications that impair judgment, or any other substance that may affect alertness

### 2.2.2 Maintenance Technician

A maintenance technician performs scheduled preventive maintenance tasks as described in Chapter 9.

**Minimum Qualifications for Maintenance Technician:**
- All operator qualifications, PLUS:
- Must have completed BetaCorp Systems' BC-500X Maintenance Training course (24 hours minimum) or equivalent
- Must be trained in lockout/tagout procedures per OSHA 29 CFR 1910.147
- Must have basic mechanical aptitude and ability to use hand tools correctly
- Must understand hydraulic system safety including pressure de-energization
- Must understand coolant handling and chemical safety per applicable SDS

### 2.2.3 Electrical Service Technician

An electrical service technician performs troubleshooting and repair of the machine's electrical and control systems.

**Minimum Qualifications for Electrical Service Technician:**
- All maintenance technician qualifications, PLUS:
- Must be a qualified electrician as defined by NFPA 70E
- Must have completed arc flash training and have a current arc flash PPE assessment for the specific installation
- Must hold appropriate electrical licenses as required by local jurisdiction
- Must have completed BetaCorp Systems' BC-500X Electrical Service training

### 2.2.4 Authorized BetaCorp Service Engineer

Certain procedures in this manual are marked **"BetaCorp Authorized Service Only."** These procedures require factory-trained BetaCorp Systems service engineers with specialized tools and access credentials. Do not attempt these procedures without BetaCorp authorization.

---

## 2.3 Personal Protective Equipment (PPE)

### 2.3.1 Required PPE for All Personnel in the Machine Area

The following PPE is required at all times for anyone working in the vicinity of the BC-500X:

**Safety Glasses (ANSI Z87.1+):**
- Required at all times within 3 meters (10 feet) of the machine
- Must meet ANSI Z87.1 impact resistance
- Side shields must be used

**Safety Footwear (ASTM F2413):**
- Steel-toe or composite-toe safety shoes/boots required
- Metatarsal protection recommended for anyone who handles heavy fixturing or tools
- Anti-slip soles strongly recommended due to coolant on floors

**No Loose Clothing or Jewelry:**
- Loose sleeves, ties, scarves, and similar items must be removed or securely tucked before approaching the machine
- Finger rings must be removed when handling machine components
- Long hair must be tied back and secured

### 2.3.2 Task-Specific PPE Requirements

| Task | Additional PPE Required |
|------|------------------------|
| Opening work zone door after machining | Face shield (ANSI Z87.1, EN166) over safety glasses |
| Adjusting coolant nozzles | Chemical-resistant gloves (nitrile, minimum) |
| Coolant system maintenance | Chemical-resistant gloves + face shield |
| Handling coolant concentrate | Chemical-resistant gloves, face shield, chemical-resistant apron |
| Chip removal from work zone | Cut-resistant gloves (ANSI Level A4 minimum), face shield |
| Electrical panel work | Arc flash PPE per arc flash hazard analysis; minimum Category 2 |
| Hydraulic system work | Face shield; chemical-resistant gloves (oil-resistant) |
| Grinding or filing metal parts | Face shield, dust mask (N95 minimum) |
| Noise exposure >85 dB(A) | Hearing protection (earmuffs or earplugs, NRR ≥25) |
| Cleaning with compressed air | Face shield, hearing protection |
| Hydraulic fluid cleanup | Chemical-resistant gloves, eye protection |

### 2.3.3 PPE Inspection

All PPE must be inspected before use. Remove from service and replace any PPE that shows:
- Cracks or scratches in lenses (safety glasses, face shields)
- Tears, punctures, or degradation of glove material
- Deterioration of protective coating
- Any damage that may compromise protective function

Maintain a PPE inspection log. Replace safety glasses lenses annually at a minimum, regardless of apparent condition.

### 2.3.4 Face Shield Specifications

When a face shield is required (not just safety glasses), the face shield must meet:
- ANSI Z87.1 or EN166 standard
- Minimum lens rating: 3+ (impact protection)
- Full face coverage including chin
- Used OVER (not instead of) safety glasses

### 2.3.5 Arc Flash PPE

For electrical work, the arc flash hazard analysis for your specific installation must be reviewed and PPE selected accordingly. As a general guideline for the BC-500X main electrical cabinet at 480V:

> **DANGER:** Arc flash hazard assessment must be conducted by a qualified electrical engineer before any electrical service is performed. The incident energy at the main electrical cabinet may be 4 to 40 cal/cm² or higher depending on the upstream power system configuration. This energy level requires Category 2 to Category 4 arc flash PPE per NFPA 70E. NEVER perform electrical work without an arc flash assessment.

Minimum Category 2 PPE (typical, must verify for your installation):
- Arc-rated face shield and balaclava, OR arc-rated arc flash suit hood
- Arc-rated jacket and pants (minimum 8 cal/cm² arc rating)
- Arc-rated gloves
- Leather work boots

---

## 2.4 Electrical Safety

### 2.4.1 Overview of Electrical Hazards

The BC-500X contains multiple voltage levels that present shock and arc flash hazards:

| Voltage Level | Location | Hazard Level |
|---------------|----------|--------------|
| 480 VAC, 3-phase | Main power input; main electrical cabinet | FATAL — Extreme danger |
| 480 VAC | Spindle motor drive input | FATAL — Extreme danger |
| 480 VAC | Axis servo drive input | FATAL — Extreme danger |
| 480 VAC | Hydraulic pump motor | FATAL — Extreme danger |
| 240 VAC | Control transformer secondary (some circuits) | FATAL — High danger |
| 120 VAC | Control circuit power; lighting | SERIOUS — High danger |
| 24 VDC | PLC I/O; sensors; solenoids | INJURY possible from short circuits |
| 5 VDC | Encoder signals; control signals | Low voltage; normally safe |
| 48 VDC Bus | Servo drive DC bus (after capacitor charge) | FATAL — capacitors retain charge |

> **DANGER:** The servo drive DC bus capacitors will retain dangerous voltage levels for up to **5 minutes** after the main power is disconnected. NEVER open any servo drive enclosure until the main disconnect has been locked out AND a minimum of 5 minutes has elapsed AND the voltage has been verified at zero using a properly rated voltmeter.

### 2.4.2 Arc Flash Hazard Assessment

**What is Arc Flash?**

An arc flash is an electrical explosion that occurs when electrical current travels through ionized air between conductors. Arc flash events can produce temperatures of up to 35,000°F (19,000°C) at the arc point — four times the surface temperature of the sun — and pressure waves exceeding 2,000 lb/ft². Arc flash causes severe burns, fires, explosion-related injuries, and death.

**BC-500X Arc Flash Risk Factors:**
- Three-phase 480 VAC power supply
- Available fault current at the machine's main disconnect depends on the facility power system; must be determined by facility electrical engineer
- Incident energy varies with available fault current and upstream overcurrent protection

**Requirements Before Energized Electrical Work:**

1. Obtain a current arc flash hazard analysis for the machine's specific installation location. This analysis must be performed by a Licensed Professional Engineer or Qualified Electrical Engineer using IEEE 1584 methods.
2. Review arc flash labels on all electrical enclosures. These labels must be applied as part of the installation process.
3. Select PPE based on the incident energy shown on the arc flash label, NOT based on voltage alone.
4. Establish an arc flash boundary. No unprotected personnel may be within the arc flash boundary during energized work.
5. Only qualified personnel (as defined in NFPA 70E) may perform energized electrical work.
6. When work can be performed with the equipment de-energized and locked out, that approach is ALWAYS preferred.

**Arc Flash Label Information:**

Each major electrical enclosure (main cabinet, servo cabinet, spindle drive cabinet) must have an arc flash label applied during installation. The label must include:
- Nominal system voltage
- Incident energy at working distance
- Working distance
- Required PPE category
- Arc flash boundary distance
- Date of analysis

Contact BetaCorp Systems or your facility's electrical engineering department if arc flash labels are missing or if the power system has been modified since the last analysis.

### 2.4.3 Lockout/Tagout (LOTO) Procedures

**Regulatory Basis:**

The lockout/tagout procedures in this section comply with OSHA 29 CFR 1910.147, "The Control of Hazardous Energy." This regulation requires that all energy sources be isolated and locked before maintenance or service activities where unexpected energization could cause injury.

> **DANGER:** LOTO procedures MUST be followed before performing ANY maintenance task that involves: accessing the interior of any electrical cabinet, adjusting or replacing any mechanical component while the machine is energized, working on the hydraulic system, working on the pneumatic system, or any other task where unexpected machine motion could cause injury.

**Energy Sources on the BC-500X:**

The following energy sources must be isolated during LOTO:

1. **Electrical energy:** Main electrical supply (480 VAC, 3-phase)
2. **Hydraulic energy:** Hydraulic system pressure (up to 210 bar / 3,046 psi)
3. **Pneumatic energy:** Compressed air supply (up to 8 bar / 116 psi)
4. **Gravitational energy (stored):** Z-axis may fall if hydraulic brake is released while hydraulic power is removed
5. **Capacitive energy (stored):** Servo drive bus capacitors retain voltage after power removal
6. **Spring energy (stored):** Tool retention springs in spindle draw bar assembly; tool change arm springs

**LOTO Hardware Requirements:**

- Personal padlock(s) — each person working on the machine must apply their own padlock. Never allow another person to hold your lockout key.
- Hasp (multi-lock hasp for group lockout)
- Lock tags with authorized personnel name, date, and contact information
- Lockout device for main disconnect (provided with machine)
- Valve lockout devices for hydraulic and pneumatic isolation valves
- Voltage tester rated for 600 VAC minimum (CAT III or CAT IV)

**LOTO Procedure — Standard Machine Lockout:**

**Step 1: Notify Affected Personnel**
Inform all personnel in the area that the machine is being taken out of service for maintenance. Post "DO NOT OPERATE — UNDER MAINTENANCE" signage at the control panel and at all machine access points.

**Step 2: Identify All Energy Sources**
Review the energy source list above. Identify all energy isolation points for the specific maintenance task to be performed.

**Step 3: Operate Machine to a Safe State**
- If the machine is running an automatic cycle: Press FEED HOLD to pause the cycle, then press E-STOP.
- Navigate the spindle to a safe position using JOG mode before removing power if possible.
- Retract the Z-axis to its home position (Z=0) to prevent gravity drop.

**Step 4: Isolate Electrical Energy**
- Locate the main disconnect switch on the right side of the main electrical cabinet.
- Turn the main disconnect to the OFF position.
- Apply the lockout hasp to the main disconnect handle.
- Apply your personal padlock to the hasp. The lock must be your personal lock; do not share locks.
- Attach a lockout tag with your name, date, and reason for lockout.

**Step 5: Isolate Pneumatic Energy**
- Locate the pneumatic shutoff valve on the rear of the machine (labeled "AIR IN ISOLATION VALVE").
- Turn the pneumatic isolation valve to the OFF position.
- Apply a valve lockout device and your personal padlock.
- Exhaust residual pressure: slowly open the manual bleed valve (located adjacent to the shutoff valve, labeled "BLEED") until all pressure is released. Verify zero pressure on the pneumatic pressure gauge.

**Step 6: Isolate Hydraulic Energy**
- The hydraulic pump motor will stop when electrical energy is isolated (Step 4).
- Allow hydraulic system pressure to bleed down through the system. This takes approximately 2–3 minutes with no solenoid valves energized.
- Verify hydraulic pressure is zero on the hydraulic pressure gauge on the HPU.
- Apply a hydraulic line lockout device to the main hydraulic supply line shutoff valve.
- Apply your personal padlock.

**Step 7: Secure Z-Axis Against Gravity**
The Z-axis spindle head assembly weighs approximately 280 kg (617 lb) and is retained in position by a hydraulic brake (fail-safe, spring-applied) and a servo brake. If hydraulic pressure is removed and the servo brake is not engaged:

> **WARNING:** The Z-axis WILL fall if the servo brake is disengaged or faulty AND hydraulic brake pressure is lost. Before working under or near the Z-axis assembly, install the Z-axis safety block (Part No. BC-TOOL-4417, "Z-Axis Safety Block"). This block is stored in the machine tool cabinet. Slide the block onto the Z-axis column guide and verify it is fully engaged before working beneath the Z-axis head.

Installation procedure for Z-axis safety block:
1. Jog the Z-axis to approximately Z = -200 mm (mid-travel).
2. Power down and lock out the machine per Steps 1–6.
3. Open the Z-axis side access panel.
4. Insert the Z-axis safety block (Part No. BC-TOOL-4417) over the Z-axis guide rail from the front.
5. Slide the block down until it contacts the Z-axis head casting.
6. Verify the block is fully seated and cannot fall out.
7. Proceed with maintenance.
8. Remove the Z-axis safety block before restoring power.

**Step 8: Wait for Capacitor Discharge**
After the main electrical disconnect is opened, wait a minimum of **5 minutes** before opening any servo drive enclosure or accessing servo drive terminals. This allows the servo drive DC bus capacitors to discharge to a safe voltage level.

**Step 9: Verify Zero Energy**
Before beginning work, test for zero energy at all relevant points:
- Test for zero voltage at the main power terminals using a properly rated voltmeter (CAT III, 600V minimum rating). Test all three phases and line-to-line combinations.
- Test for zero voltage at servo drive DC bus terminals.
- Verify pneumatic pressure gauge reads zero.
- Verify hydraulic pressure gauge reads zero.
- Confirm Z-axis safety block is in place if working near Z-axis.

> **NOTE:** "Test before touch" is an absolute rule. A voltmeter reading of zero does not guarantee safety if the meter is faulty. Test the voltmeter on a known live source before and after testing the machine to verify the meter is functioning correctly.

**Step 10: Perform Maintenance Work**
Perform the maintenance or service task as described in this manual. Do not leave the machine partially assembled and unattended.

**Step 11: Restoration of Energy — Release from Lockout**

After maintenance is complete:

1. Inspect the work area. Ensure all tools, materials, and personal items are removed from inside the machine.
2. Ensure all guards, covers, and access panels are reinstalled and fastened.
3. Remove the Z-axis safety block if it was installed.
4. Inform all personnel that the machine is about to be re-energized.
5. Each person who applied a personal padlock must remove their own padlock.
6. Remove the lockout hasps from the main disconnect, pneumatic valve, and hydraulic valve.
7. Open the pneumatic isolation valve to restore air supply.
8. Verify hydraulic oil level before restoring electrical power.
9. Restore electrical power by turning the main disconnect to ON.
10. Perform a system checkout as appropriate for the work performed.

**Group Lockout Procedures:**

When multiple technicians are working on the machine simultaneously, each technician must apply their own personal padlock to the lockout hasp. The multi-lock hasp provided with the machine accepts up to 6 padlocks. If more than 6 technicians are involved, obtain additional hasp devices from your maintenance department.

Each technician retains control of their own lock. The machine CANNOT be re-energized until ALL technicians have removed their personal locks. This ensures no individual can re-energize the machine while another person is still working on it.

**Shift Change During Lockout:**

If a lockout must be maintained across a shift change:
1. The outgoing technician must NOT remove their lock until the incoming technician has applied their personal lock to the hasp.
2. Transfer of lock control requires physical handover and signing of the maintenance log.
3. Never remove another person's lockout padlock, regardless of circumstances. If a lock cannot be removed because the keyholder is unreachable, follow your facility's procedures for emergency lock removal.

---

### 2.4.4 Capacitor Discharge Waiting Periods

The BC-500X servo drives contain large electrolytic capacitors on the DC bus. These capacitors can store lethal amounts of electrical energy and will maintain dangerous voltage levels after the main power supply is disconnected.

**Required Waiting Periods:**

| Situation | Minimum Wait Time |
|-----------|-------------------|
| Main disconnect opened, servo drives were in normal operation | 5 minutes |
| Main disconnect opened, machine was in fault/alarm condition | 8 minutes |
| Main disconnect opened after prolonged operation at high duty cycle | 8 minutes |
| Power failure (unexpected) — unknown capacitor state | 10 minutes |

> **DANGER:** These are MINIMUM waiting periods. Always verify zero voltage with a properly rated voltmeter before accessing any servo drive internals. The capacitors in the BC-500X servo drive system are rated at 800 VDC. Contact with charged capacitor terminals is FATAL.

**Servo Drive Discharge Indicator:**

The servo drive units (located in the servo cabinet on the right side of the machine) are equipped with LED indicators on the front panel:
- **Red LED lit:** DC bus voltage is present; DO NOT open the drive enclosure
- **Red LED off:** DC bus may have discharged; verify with voltmeter before proceeding

> **CAUTION:** The LED is powered by the DC bus. When the LED extinguishes, voltage has dropped below the LED operating threshold, but may still be at a level capable of causing injury. Always verify with a voltmeter.

---

### 2.4.5 Ground Fault Protection

The BC-500X is equipped with a main ground fault circuit interrupter (GFCI) on the 120 VAC control circuit power. However, the main 480 VAC power input is protected by a ground fault relay, not a GFCI.

**Grounding Requirements:**
- A dedicated equipment grounding conductor (green or green/yellow striped) must be connected from the facility grounding system to the main electrical cabinet ground bus bar.
- The grounding conductor must be sized per NEC Table 250.122 based on the upstream overcurrent device.
- Ground conductor resistance from the main cabinet ground bus to the facility ground electrode system must not exceed 0.1 ohm.
- Verify ground continuity during annual maintenance (see Chapter 9).

**Isolated Ground for CNC Control:**
The CNC control system uses a separately derived 24 VDC power supply with an isolated 0V reference. Do not connect the CNC control 0V reference to the machine chassis ground. This connection is pre-made at the factory and must not be modified.

---

## 2.5 Mechanical Safety

### 2.5.1 Rotating Component Hazards

The BC-500X contains several rotating components that can cause severe injury if contact is made:

**Spindle:**
- Maximum speed: 10,000 RPM
- At maximum speed, the tip of a 10 mm diameter end mill rotates at over 5,200 mm/second (17 feet/second)
- Contact with a rotating tool or spindle will cause immediate and severe injury
- NEVER reach into the work zone while the spindle is rotating or while the machine is energized

**Tool Changer Carousel:**
- The tool magazine carousel rotates at indexing speed during tool changes
- Tool pot grippers extend radially and can cause pinching injuries
- NEVER reach into the tool magazine area during operation

**Chip Conveyor:**
- The chip conveyor belt contains sharp metal chips from machining
- The drive sprockets and return rollers are pinch points
- NEVER reach into the chip conveyor during operation
- ALWAYS wear cut-resistant gloves when handling the chip conveyor or chip bins

**Coolant Pump:**
- The coolant pump motor and impeller are rotating components
- Do not attempt to clear coolant pump blockages while the system is energized

**Hydraulic Pump:**
- The hydraulic pump is driven by an electric motor
- Do not open the hydraulic pump or motor assembly while energized

**General Rules for Rotating Components:**
1. Confirm the spindle is stopped (spindle speed = 0 on control display) before opening the work zone door.
2. Even after the spindle stop command, the spindle may coast for a brief period. Wait for the spindle to completely stop before reaching into the work zone.
3. The spindle brake feature (parameter B1.22) should be enabled to minimize coasting time during door-open sequences.
4. Never manually brake a rotating spindle by contact with the tool holder or spindle nose. The forces involved will cause immediate injury.

### 2.5.2 Pinch Point Identification

The following pinch points exist on the BC-500X. Machine operators and maintenance personnel must be aware of these locations:

| Location | Description | Guard/Protection |
|----------|-------------|-----------------|
| Z-axis head vs. workpiece/fixture | Spindle head descends during machining and tool changes | Work zone door; Z-axis over-travel limits |
| X-axis table vs. machine column | Table moves toward column at right side of travel | X-axis positive over-travel limit; column guard |
| Y-axis table vs. splash guard | Table moves toward rear of machine | Y-axis positive over-travel limit |
| ATC arm vs. spindle | ATC arm rotates rapidly during tool change | Tool change zone guard; ATC interlock |
| ATC arm vs. carousel | ATC arm and carousel move simultaneously | Interlock prevents simultaneous motion |
| Tool changer carousel vs. ATC arm standby position | Carousel indexes through area near ATC arm | Interlock; carousel guard |
| Chip conveyor drive sprocket | Sprocket and chain are exposed at conveyor drive end | Conveyor drive guard; interlocked access cover |
| Chip conveyor return roller | Return roller at conveyor discharge end | Return end guard |
| Hydraulic power unit coupling | Motor-to-pump coupling | HPU coupling guard |
| Coolant pump | Coolant pump motor and impeller | Coolant tank cover |

**Additional Pinch Point During Maintenance:**
During Z-axis maintenance, the Z-axis head (280 kg, 617 lb) can fall rapidly if the hydraulic brake is released unexpectedly. This is a crush hazard, not merely a pinch hazard. Always install the Z-axis safety block (BC-TOOL-4417) before working on or near the Z-axis assembly.

### 2.5.3 Stored Energy — Springs and Counterweights

**Spindle Draw Bar Spring:**
The tool retention system in the BC-500X spindle uses a Belleville washer stack to apply clamping force to the tool holder. This spring stack is preloaded and stores significant mechanical energy. During draw bar service:
- The spring preload force is approximately 18,000 N (4,047 lb)
- Do not compress or release the spring stack without proper tooling and thorough familiarity with the procedure in Chapter 5
- The draw bar service procedure requires BetaCorp-trained service technicians

**ATC Arm Return Springs:**
The ATC arm assembly uses torsion springs to assist the arm return motion. These springs are preloaded during assembly.
- Do not disassemble the ATC arm without following the procedure in Chapter 13
- The ATC arm torsion spring stores approximately 45 N·m (33 ft·lb) of energy
- Improper disassembly can cause the spring to release suddenly with enough force to cause bone fractures

**Axis Over-Travel Hardware Stops:**
Each axis has adjustable mechanical over-travel stops. These stops are not intended to arrest axis motion under normal circumstances and are not designed to absorb the full kinetic energy of a crash event. Do not rely on mechanical stops as a substitute for proper programming and limit switch setup.

---

## 2.6 Hydraulic Pressure Hazards

The BC-500X hydraulic system operates at pressures up to **210 bar (3,046 psi)**. At this pressure, hydraulic fluid behaves very differently from low-pressure fluids. The following hazards are specific to high-pressure hydraulic systems:

### 2.6.1 High-Pressure Injection Injury

> **DANGER:** High-pressure hydraulic fluid injection through the skin can cause catastrophic injury and death. A pinhole leak in a hydraulic line at 210 bar pressure generates a fluid jet that can penetrate human skin from distances of several centimeters. The fluid injection causes immediate tissue destruction and rapidly expanding tissue damage from both the mechanical injection force and the chemical toxicity of hydraulic fluid. HIGH-PRESSURE INJECTION INJURIES REQUIRE IMMEDIATE EMERGENCY SURGICAL TREATMENT. Even if the injection wound appears small and painless initially, the internal damage is severe and life-threatening.

**Prevention:**
- Never run your hand along a hydraulic hose or line to locate a leak
- Use a piece of cardboard or paper to detect leaks by observing wet spots
- Never approach a suspected hydraulic leak with your face
- Wear safety glasses or face shield when working around hydraulic lines
- De-pressurize the hydraulic system completely before disconnecting any hydraulic line or fitting

**If High-Pressure Injection Injury Occurs:**
1. Call emergency services (911) IMMEDIATELY
2. Inform medical personnel that a high-pressure hydraulic fluid injection injury has occurred
3. Tell them the type of hydraulic fluid (see Chapter 11, Section 11.7)
4. Do NOT apply a tourniquet
5. Keep the injured person calm and still
6. Treatment must be performed by a surgeon; this is NOT a "treat at first aid station" injury

### 2.6.2 Hydraulic Line De-pressurization Procedure

Before performing ANY work on the hydraulic system (disconnecting lines, replacing valves, replacing cylinders, changing filters while system is under pressure), the hydraulic system must be completely de-pressurized.

**Hydraulic De-pressurization Procedure:**

> **WARNING:** The hydraulic system stores energy not only in the pump and lines but also in hydraulic cylinders under load. The Z-axis brake cylinder, tool clamping cylinder, and workholding cylinders (if equipped) all contain trapped pressure that may not be fully released by simply stopping the hydraulic pump. Follow this complete procedure.

**Step 1:** Perform the standard LOTO procedure (Section 2.4.2) to isolate electrical energy and stop the hydraulic pump motor.

**Step 2:** Allow 2–3 minutes for the hydraulic system pressure to equalize through the internal system pressure relief valves.

**Step 3:** Verify hydraulic pump has stopped rotating (listen and observe).

**Step 4:** Check the hydraulic system pressure gauge on the HPU panel. The gauge should read zero. If it does not read zero within 3 minutes, there may be a check valve holding pressure in a branch circuit.

**Step 5:** To release trapped pressure in individual cylinders, locate the manual pressure release valve for the specific circuit (refer to hydraulic circuit diagram in Chapter 11). Slowly crack the manual release valve open (maximum 1/4 turn) and allow pressure to equalize over approximately 30 seconds. Do not fully open pressure release valves rapidly.

**Step 6:** Verify zero pressure on all pressure gauges before disconnecting any lines.

**Step 7:** When disconnecting a hydraulic fitting, use both hands — one to brace the fitting, one to turn the nut. Even at zero pressure, residual oil will drain from the line. Have absorbent material and a drain container ready.

**Step 8:** Cap open hydraulic fittings immediately after disconnection to prevent contamination.

### 2.6.3 Hot Oil Burns

During normal operation, hydraulic oil temperature in the BC-500X system reaches 40–50°C (104–122°F). After prolonged operation under heavy load, temperatures can reach 60°C (140°F). Contact with hot hydraulic oil causes thermal burns.

**Prevention:**
- Allow the hydraulic system to cool for a minimum of 30 minutes after machine shutdown before draining or disconnecting hydraulic lines
- Check oil temperature on the HPU temperature gauge before opening any hydraulic circuit
- Wear chemical-resistant, heat-resistant gloves when working with hydraulic oil
- Have absorbent spill materials readily available

**Oil Spill and Fire Hazard:**
Hydraulic oil is combustible. The flash point of the specified ISO 46 hydraulic oil is approximately 200°C (392°F). Under normal circumstances, oil is not in contact with ignition sources. However:
- Keep cutting sparks away from the hydraulic power unit
- In the event of a hydraulic oil fire, use CO₂ or dry chemical extinguisher. Do NOT use water.
- Clean up oil spills immediately. Oily floors create slip hazards and fire hazards.

---

## 2.7 Pneumatic System Safety

The BC-500X pneumatic system operates at 6 bar (87 psi) supply pressure. Pneumatic hazards include:

**Compressed Air Injection:**
Compressed air directed at the skin can force air under the skin, causing air embolism. Never use compressed air to clean clothing or skin. Never use compressed air to "blow off" chips unless using a properly reduced pressure (maximum 30 psi / 2 bar) and with appropriate chip guards in place.

**Flying Projectiles:**
When a pneumatic line is disconnected under pressure, loose fittings can become projectiles. Always depressurize the pneumatic circuit (close the isolation valve and bleed the circuit) before disconnecting fittings.

**De-pressurization Procedure for Pneumatic System:**
1. Close the pneumatic isolation valve (LOTO).
2. Slowly open the manual bleed valve adjacent to the isolation valve.
3. Allow pressure to bleed down over 10–15 seconds.
4. Verify zero pressure on the pneumatic system pressure gauge.
5. Disconnect fittings with hands clear of the fitting face.

**Stored Pneumatic Energy:**
Pneumatic accumulators (if equipped) and pneumatic cylinders retain pressure after the isolation valve is closed. The bleed valve releases pressure from the supply side but may not release pressure from:
- Pneumatic cylinders in the tool unclamping circuit (air cylinder holds tool release position)
- Any pneumatic circuit with a check valve on the outlet

After bleeding the supply, manually cycle each pneumatic device by pressing the manual override button on the solenoid valve (machine must be in LOTO state) to verify all cylinders have released their stored energy.

---

## 2.8 Coolant and Chemical Hazards

### 2.8.1 Metalworking Fluid Health Hazards

The water-soluble metalworking fluids used in the BC-500X are generally of low acute toxicity when properly maintained. However, prolonged skin contact and inhalation of mist from metalworking fluids present significant health risks:

**Dermatitis:**
Prolonged skin contact with metalworking fluid can cause:
- Contact dermatitis (irritant type): red, dry, cracked skin; usually on hands and forearms
- Allergic contact dermatitis: immune response to fluid components; can spread beyond contact area

Prevention: Wear nitrile gloves during coolant handling. Apply a barrier cream before work. Wash hands thoroughly with soap and water after coolant contact. Do not use solvent to clean skin.

**Respiratory Hazards:**
Metalworking fluid mist is generated during machining operations. The BC-500X enclosure contains mist during operation, but residual mist exits when the work zone door is opened. Prolonged inhalation exposure has been associated with:
- Respiratory irritation
- Hypersensitivity pneumonitis (occupational asthma)
- In historical literature (with contaminated fluids), lipoid pneumonia

Prevention: Ensure the machine mist collector (optional accessory) is operating correctly. Do not open the work zone door unnecessarily during cutting. Maintain coolant concentration and biocide levels per Chapter 12 to minimize microbial contamination and nitrosamine formation.

**Bacterial Contamination:**
Metalworking fluids, particularly water-based semi-synthetic and synthetic fluids, are susceptible to bacterial and fungal contamination. Signs of contamination include:
- Rancid or "Monday morning" odor
- Slimy or discolored fluid
- pH below 8.5

Contaminated fluid can cause:
- Severe skin and eye irritation
- Respiratory problems from inhaling contaminated mist
- Increased corrosion of machine surfaces

Testing and treatment of metalworking fluid is described in Chapter 12.

### 2.8.2 Coolant Concentrate Handling

Metalworking fluid concentrate (before dilution) is significantly more hazardous than the diluted working fluid. Concentrated fluid can:
- Cause severe skin irritation and chemical burns to eyes
- Cause respiratory tract irritation if inhaled directly

When handling coolant concentrate:
- Always wear nitrile or neoprene gloves (minimum)
- Wear a face shield
- Work in a well-ventilated area
- Review the Safety Data Sheet (SDS) for the specific product

**First Aid — Eye Contact:** Immediately flush eyes with large amounts of clean water for 15 minutes. Seek medical attention.

**First Aid — Skin Contact:** Remove contaminated clothing. Wash affected area with soap and water for 15 minutes. If irritation persists, seek medical attention.

**First Aid — Ingestion:** Do NOT induce vomiting. Call Poison Control at 1-800-222-1222 (US). Seek medical attention with SDS in hand.

### 2.8.3 Hydraulic Oil Hazards

Mineral-based hydraulic oil (ISO 46) has low acute toxicity but presents:
- Skin and eye irritant
- Combustion hazard (flash point ~200°C)
- Environmental hazard (petroleum-based)

Biologically degradable hydraulic oil options are available; consult Chapter 11.

### 2.8.4 Chemical Storage

Store all chemicals used with the BC-500X in designated storage areas with:
- Appropriate secondary containment (spill trays)
- Temperature within storage requirements for each product
- Separation of incompatible chemicals
- Proper labeling per GHS/HazCom 2012

---

## 2.9 Chip and Swarf Hazards

Metal chips and swarf generated during machining operations are among the most frequently overlooked hazards in the machine shop environment. The BC-500X generates chips in quantities and forms that present the following hazards:

**Cutting Hazards:**
Metal chips, particularly from steel, stainless steel, and titanium machining, are razor-sharp. Long stringy chips can wrap around extremities. Compressed chip nests in the work zone can spring apart when disturbed, throwing sharp chip shards.

**Burns:**
Freshly generated chips from high-speed machining operations can be extremely hot, particularly from aluminum and brass machining. Do not grab chips by hand immediately after machining.

**Eye Hazards:**
Chip fragments can be ejected from the work zone, particularly when the door is opened immediately after machining. Always wear a face shield when opening the work zone door after machining.

**Safe Chip Handling Procedures:**
1. Never remove chips from the work zone by hand. Use chip hooks, magnetic sweepers (for ferrous materials), or chip brushes.
2. Always wear cut-resistant gloves (ANSI Level A4 minimum) when handling chips.
3. Use a face shield when opening the work zone door after machining.
4. Allow chips to cool before handling.
5. Never use compressed air to blow chips. Use a coolant flush or chip hook.
6. Empty the chip bin before it overflows. Overflowing chip bins create tripping and cutting hazards on the floor around the machine.
7. Dispose of chips in designated chip bins. Never mix chip materials (aluminum chips must not be mixed with steel chips in many recycling programs).

---

## 2.10 Emergency Stop Procedures

### 2.10.1 Emergency Stop Button Locations

The BC-500X is equipped with four Emergency Stop (E-Stop) pushbuttons. Each E-Stop button is a red, mushroom-head pushbutton mounted on a yellow background panel. Activating ANY E-Stop button will immediately halt all machine motion and remove power from all axis drives and the spindle drive.

| E-Stop Location | Description |
|-----------------|-------------|
| E-Stop 1 | Main operator panel, center console — primary operator position |
| E-Stop 2 | Left side of machine enclosure, front panel — accessible from tool load position |
| E-Stop 3 | Pendant (MPG hand wheel unit) — used during setup and maintenance |
| E-Stop 4 | Rear of machine, service access side — for maintenance personnel |

**E-Stop Button Function:**
The E-Stop buttons are normally-closed, direct-opening safety contacts connected to a safety relay circuit (Pilz PNOZ or equivalent). When any E-Stop button is pressed:
1. The safety relay drops out immediately.
2. Power is removed from all servo drive enable circuits.
3. Power is removed from the spindle drive enable circuit.
4. All axis servos apply their internal dynamic braking.
5. The spindle applies its electromagnetic brake (if Parameter B1.22 is enabled).
6. The PLC enters fault state and logs the event.
7. All hydraulic solenoid valves return to their spring-default positions.
8. The CNC control displays: **"E-STOP ACTIVE — PRESS RESET TO RESUME"**

**What E-Stop Does NOT Do:**
- E-Stop does NOT remove main power from the machine
- E-Stop does NOT de-pressurize the hydraulic system
- E-Stop does NOT release the tool from the spindle
- E-Stop does NOT prevent the machine from being re-started by pressing Reset

> **WARNING:** E-Stop is an emergency stopping device, not a lockout device. After pressing E-Stop, the machine can be re-started by pressing the Reset button. E-Stop MUST NOT be used as a substitute for lockout/tagout during maintenance.

### 2.10.2 Machine Restart After Emergency Stop

After an E-Stop has been activated, the following procedure must be followed before resuming machine operation:

**Step 1: Assess the Situation**
Determine WHY the E-Stop was activated. If the E-Stop was activated due to a hazardous condition, do not restart the machine until the hazard is corrected.

**Step 2: Ensure Safety**
Verify that all persons are clear of all hazardous areas (work zone, tool changer area, chip conveyor area).

**Step 3: Identify and Correct Fault**
The CNC control will display a fault condition. Review the fault message and the fault log (SYSTEM → FAULT LOG). Correct any underlying fault condition before restarting.

**Step 4: Reset E-Stop Button**
Rotate the E-Stop button clockwise until it releases (pops out). All four E-Stop buttons must be released before the machine will accept a reset command.

**Step 5: Press RESET**
Press the green RESET button on the main operator panel. The safety relay will re-energize, and servo power will be restored.

**Step 6: Homing (if required)**
In some E-Stop conditions, the CNC control may lose position reference for one or more axes. If the control displays "HOMING REQUIRED" or if any axis position indicator shows an asterisk (*), the affected axis must be homed before resuming automatic operation. Follow the homing procedure in Section 6.4.

**Step 7: Inspect Work in Progress**
Before resuming an interrupted machining cycle, inspect the workpiece and tooling for any damage that may have occurred at the time of the E-Stop. Check for broken tool fragments in the work zone.

**Step 8: Resume or Restart Program**
If the machining program can safely be resumed from the current position, use the CYCLE START function. If the tool is broken or the workpiece is damaged, abort the program and address the condition before restarting.

---

## 2.11 Fire Safety

### 2.11.1 Fire Hazards on the BC-500X

| Material | Hazard | Location |
|----------|--------|----------|
| Hydraulic oil (ISO 46) | Combustible liquid | HPU, hydraulic lines throughout machine |
| Way lube oil (ISO 68) | Combustible liquid | Way lube reservoir, distribution lines |
| Coolant (water-soluble) | Primarily non-flammable when properly mixed; evaporation leaves flammable residue | Coolant tank, distribution lines, work zone |
| Chips (magnesium alloy, titanium) | Fire/explosion risk if machined without proper coolant | Work zone chips |
| Electrical wiring insulation | Fire if overloaded or arc fault occurs | Throughout machine |
| Control cabinet | Electrical fire from component failure | Control cabinet |

### 2.11.2 Fire Prevention

1. **Coolant flow:** Ensure coolant is flowing whenever cutting operations are in progress. Loss of coolant increases chip and work zone temperatures significantly.
2. **Chip accumulation:** Do not allow chips to accumulate excessively in the work zone or chip conveyor. Compressed chip piles can generate heat through exothermic reactions and retain heat from cutting.
3. **Electrical maintenance:** Follow all electrical maintenance procedures. Loose connections and overloaded circuits are primary electrical fire causes.
4. **Hydraulic leaks:** Repair hydraulic leaks immediately. Oil on hot chip surfaces can ignite.
5. **Magnesium and titanium:** If machining these materials, use only approved coolants and maintain aggressive flow. Consult your tooling and coolant supplier for specific recommendations.

### 2.11.3 Fire Response

In the event of a fire in or near the BC-500X:

1. **Activate the E-Stop** to halt machine operation.
2. **Alert personnel** in the area.
3. **Call emergency services** (911) immediately. Do not attempt to fight significant fires without professional assistance.
4. **For small, contained fires** (e.g., a small oil drip fire): Use the appropriate fire extinguisher:
   - **CO₂ extinguisher:** Preferred for electrical fires and oil fires; leaves no residue that damages machine
   - **Dry chemical extinguisher:** Effective but leaves residue that is difficult to clean and may damage electrical components
   - **Water:** NOT suitable for oil fires or electrical fires
5. **Evacuate** if the fire is not immediately controlled.
6. Do not re-enter the area until cleared by fire emergency personnel.
7. Report all fire events to BetaCorp Systems Technical Support. Fire events may indicate machine malfunctions requiring inspection before return to service.

### 2.11.4 Fire Extinguisher Placement

A minimum of one CO₂ fire extinguisher (minimum 5 lb capacity) must be mounted within 10 meters (33 feet) of the BC-500X, in a location accessible from the operator's normal working position. The extinguisher must be inspected monthly and serviced annually per local fire code requirements.

---

## 2.12 Guards and Interlocks — Never Bypass

The BC-500X incorporates numerous machine guards and interlocks designed to prevent injury. These safeguards are integral to the machine's safety design and must NEVER be removed, modified, or bypassed.

### 2.12.1 Machine Guards

| Guard | Description | Removal Requirement |
|-------|-------------|---------------------|
| Work zone enclosure | Full enclosure of work zone; polycarbonate window panel | LOTO required; must reinstall before resuming operation |
| Work zone door | Sliding or hinged door with interlock; primary operator access | Open only when authorized; interlocked |
| Tool changer carousel guard | Sheet metal guard enclosing the tool magazine carousel | LOTO required for removal |
| Chip conveyor drive guard | Guard over drive sprocket and motor coupling | LOTO required for removal |
| HPU coupling guard | Guard over hydraulic pump motor coupling | LOTO required for removal |
| Z-axis covers (bellows) | Telescoping covers protect Z-axis ballscrew and guideways | Do not remove unnecessarily; inspect for damage |
| X/Y-axis covers (telescoping) | Protect X and Y axis ballscrews and guideways | Do not remove unnecessarily; inspect for damage |
| Control cabinet door | Prevents access to high-voltage control components | Padlockable; LOTO before opening |
| Electrical panel covers | Covers over terminal strips and bus bars | LOTO before removal |

### 2.12.2 Machine Interlocks

| Interlock | Function | Safety System |
|-----------|----------|--------------|
| Work zone door switch | Prevents axis motion and spindle start when door is open (unless in JOG mode at reduced speed) | Safety relay; dual-channel |
| Work zone door lock | Holds door closed when spindle is rotating above 30 RPM | Electromagnetic lock; safety relay |
| E-Stop chain | Removes servo and spindle power when any E-Stop is activated | Safety relay; dual-channel |
| Axis over-travel (+ and -) | Halts axis motion before reaching mechanical end of travel | Hardware limit switch; safety relay |
| Spindle encoder loss | Halts spindle and sets fault E101 if encoder signal is lost | Drive-level safety function |
| Hydraulic pressure low | Sets fault E404 if hydraulic pressure drops below minimum | Pressure switch; PLC logic |
| Tool unclamped detect | Prevents spindle start if tool is not fully clamped | Proximity sensor; PLC logic |
| ATC arm home detect | Prevents axis motion if ATC arm is not in home position | Proximity sensor; PLC logic |
| Coolant level low | Sets fault E202 if coolant level drops below minimum | Float switch; PLC logic |
| Z-axis brake confirmation | Confirms Z-axis brake is applied before removing hydraulic power | Pressure switch; PLC logic |

> **WARNING:** These interlocks use hard-wired safety relay circuits and cannot be bypassed through software parameter changes. Any attempt to physically bypass the wiring of safety interlock circuits is PROHIBITED and may result in fatal injury. If an interlock is malfunctioning, the machine must be taken out of service until the interlock is repaired by a qualified technician.

---

## 2.13 Safe Work Practices During Maintenance

### 2.13.1 Work Planning

Before beginning any maintenance task:
1. Read the procedure completely before starting. Do not rely on memory for safety-critical steps.
2. Gather all required tools, parts, and materials before beginning.
3. Identify all energy sources that must be isolated.
4. Inform your supervisor of the planned maintenance task and estimated duration.
5. Post "MACHINE UNDER MAINTENANCE — DO NOT OPERATE" notices on the control panel.
6. Prepare the maintenance log entry with planned work scope.

### 2.13.2 Working in the Work Zone

On occasion, maintenance requires access to the inside of the work zone (e.g., cleaning, inspection, workpiece removal after crash). The following rules apply:

1. The machine must be locked out (LOTO) before any person enters the work zone for maintenance.
2. In routine production (operator access), the work zone door may be opened to load/unload workpieces only after:
   - The spindle has come to a complete stop (speed = 0)
   - The axes are in a safe position (Z-axis at home, or at a position well clear of the workpiece)
   - The door interlock has been satisfied (door interlock clears automatically when spindle speed = 0 and no axis motion command is active)
3. If a workpiece or tool must be manually removed while the machine is still energized (not in LOTO), move to JOG mode only, confirm spindle is stopped, and use proper tools (chip hooks, end mill holder, etc.) — never use bare hands inside the work zone even when the spindle is stopped, as the machine is still energized and could be accidentally activated.

### 2.13.3 Tool and Toolholder Handling

Cutting tools and toolholders present cutting hazards even when not rotating:

1. Never pick up a cutting tool by the flutes. Always grasp at the shank or use a tool holder.
2. When installing or removing a toolholder from the spindle, use a spindle wrench (Part No. BC-TOOL-0224) to hold the spindle. Do not allow the spindle to rotate freely during tool installation.
3. When handling large, heavy toolholders (face mills, etc.), use two hands and/or toolholder lifting straps to prevent drops.
4. Store cutting tools in tool racks when not in use. Loose tools on work surfaces create cutting hazards.

### 2.13.4 Housekeeping

Good housekeeping is a fundamental element of safety:

1. Keep the floor around the machine clean and free of coolant puddles, chips, and oil.
2. Use anti-slip mats at the operator's normal work position.
3. Dispose of used rags, filters, and empty containers promptly.
4. Keep chip bins from overflowing.
5. Report any coolant or oil leaks immediately and clean up spills promptly.
6. Store all chemicals in designated areas.
7. Maintain clear access to all emergency stops, fire extinguishers, and exits.

---

## 2.14 Confined Space Considerations

The BC-500X coolant tank (capacity: 350 liters / 92 gallons) requires internal inspection and cleaning periodically. The coolant tank is large enough that a person's head and upper body could enter during cleaning.

> **WARNING:** Evaluate whether the coolant tank cleaning operation requires a permit-required confined space entry program per OSHA 29 CFR 1910.146. Factors that may make the coolant tank a permit-required confined space include: potential for accumulation of hazardous atmospheric contaminants (H₂S gas from microbial activity in contaminated coolant), oxygen deficiency, and engulfment hazard. Have the atmosphere in the coolant tank tested before any person inserts their head or upper body into the tank.

**Signs of Potential Atmospheric Hazard in Coolant Tank:**
- Strong sulfur ("rotten egg") odor from the tank
- Visible sludge layer greater than 25 mm (1 in) deep at tank bottom
- Coolant that has been stagnant for more than 2 weeks

If any of these conditions are present, treat the coolant tank cleaning as a permit-required confined space entry. Contact your facility safety department.

For routine coolant tank cleaning where conditions are normal, follow the confined space pre-entry checklist in Chapter 12.

---

## 2.15 Chemical Right-to-Know (GHS/SDS)

All chemicals used with or in the BC-500X are subject to OSHA's Hazard Communication Standard (29 CFR 1910.1200) and the Globally Harmonized System of Classification and Labeling of Chemicals (GHS).

**Required SDS Documents:**

The facility must maintain Safety Data Sheets (SDS) for all chemicals used with the BC-500X, including:
- Metalworking cutting fluid (coolant)
- Hydraulic oil
- Way lube oil
- Spindle bearing grease
- ATC grease
- Cleaning solvents
- Rust preventive oils

SDS documents must be:
- Accessible to all employees in the work area at all times
- Available in the language of the workers using the chemicals
- Current (within 5 years for reformulated products)

**Chemical Training:**

All operators and maintenance personnel must receive GHS/HazCom training covering:
- How to read and interpret an SDS
- Understanding GHS label elements (hazard pictograms, signal words, hazard statements)
- Proper use of PPE for chemical handling
- Emergency response (first aid, spill response)

This training must be documented and records maintained per OSHA requirements.

---

*End of Chapter 2 — Safety Instructions*

---

# PART 2 — TECHNICAL SPECIFICATIONS

---

# Chapter 3 — Technical Specifications

## 3.1 Machine Overview

The BC-500X is a full-enclosure, vertical-spindle CNC machining center designed for high-productivity precision machining of a wide range of metallic and non-metallic materials. The machine features a rigid box-column construction with hardened and ground linear guideways on all axes, a 24-position random-access automatic tool changer, and a fully integrated hydraulic power unit. The BC-500X is controlled by the BetaCorp CNC Controller Model 5000, a full-feature CNC system with integrated PLC.

**Machine Configuration Summary:**

| Feature | Specification |
|---------|---------------|
| Machine type | Vertical CNC Machining Center |
| Number of CNC axes | 3 (X, Y, Z) — 4th and 5th axes optional |
| Spindle orientation | Vertical |
| Column type | Box column, one-piece cast iron |
| Guideway type | Hardened and ground linear guideways (roller type) |
| Drive type | AC servo motors with ball screw drives on all axes |
| ATC type | Random-access, dual-arm, 24-position carousel |
| Spindle taper | CAT-40 (ANSI/ASME B5.50) / BT-40 (MAS 403) — specify at order |
| Coolant type | Flood coolant; through-spindle optional |
| Control system | BetaCorp CNC Controller Model 5000 |

---

## 3.2 Work Envelope and Travel Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| X-axis travel | 750 | mm |
| Y-axis travel | 500 | mm |
| Z-axis travel | 550 | mm |
| X-axis travel | 29.53 | in |
| Y-axis travel | 19.69 | in |
| Z-axis travel | 21.65 | in |
| Table size (X × Y) | 900 × 520 | mm |
| Table size (X × Y) | 35.43 × 20.47 | in |
| T-slot width | 18 | mm |
| T-slot spacing | 125 | mm |
| Number of T-slots | 5 | — |
| T-slot length | 860 | mm |
| Table load capacity | 600 | kg |
| Distance: spindle nose to table (min / max) | 100 / 650 | mm |
| Distance: spindle center to column face | 550 | mm |

### 3.2.1 Axis Coordinate System

The BC-500X uses a standard right-hand Cartesian coordinate system:
- **X-axis:** Positive direction is to the right when facing the machine from the front
- **Y-axis:** Positive direction is away from the operator (toward the rear of the machine)
- **Z-axis:** Positive direction is upward (away from the table)

Machine home position (reference point) is at X+, Y+, Z+ limits.

Program zero (workpiece coordinate system) is established by the operator using the work coordinate offset function (see Section 6.9.1).

---

## 3.3 Spindle Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| Spindle type | Cartridge spindle, angular contact bearings | — |
| Spindle taper | CAT-40 (7/24 taper) or BT-40 | — |
| Maximum speed | 10,000 | RPM |
| Maximum power (continuous / 30-min rated) | 15 / 18.5 | kW |
| Maximum power (continuous / 30-min rated) | 20.1 / 24.8 | HP |
| Maximum torque (continuous) | 95.5 | N·m |
| Maximum torque (peak) | 143.2 | N·m |
| Spindle motor type | AC induction motor with vector drive | — |
| Speed range (gear 1, low) | 50–4,000 | RPM |
| Speed range (gear 2, high) | 500–10,000 | RPM |
| Gear change type | Pneumatic / hydraulic two-speed gearbox | — |
| Spindle acceleration time (0 to 10,000 RPM) | Less than 3.5 | seconds |
| Spindle deceleration time (10,000 to 0 RPM) | Less than 4.0 | seconds (with brake) |
| Tool retention force (draw bar clamping) | 18,000 | N |
| Tool retention type | Belleville washer stack, pneumatic/hydraulic unclamp | — |
| Spindle bearing type | High-precision angular contact ball bearings (P5) | — |
| Spindle bearing preload | Medium preload | — |
| Spindle nose face run-out | Less than 3 | μm |
| Spindle taper run-out (25 mm from gauge line) | Less than 5 | μm |
| Spindle encoder type | Optical incremental encoder | — |
| Spindle encoder resolution | 4,096 pulses/revolution (pre-quadrature) | PPR |
| Spindle encoder resolution (post-quadrature) | 16,384 | counts/rev |
| Lubrication method | Oil-air mist lubrication (continuous) | — |

### 3.3.1 Spindle Speed/Torque Curve

The BC-500X spindle delivers torque characteristics optimized for a broad range of materials:

| Speed Range | Characteristic |
|-------------|----------------|
| 50–1,500 RPM | Constant torque region (95.5 N·m continuous) |
| 1,500–10,000 RPM | Constant power region (15 kW continuous) |
| 50–600 RPM (Gear 1 only) | Enhanced low-speed torque for heavy boring |

> **NOTE:** Operating continuously at the maximum torque rating for extended periods requires adequate coolant flow. Monitor spindle motor drive temperature during heavy-cut operations. If drive temperature alarm occurs, reduce cutting parameters.

---

## 3.4 Feed and Rapid Traverse Rates

| Parameter | Value | Unit |
|-----------|-------|------|
| Rapid traverse, X-axis | 36 | m/min |
| Rapid traverse, Y-axis | 36 | m/min |
| Rapid traverse, Z-axis | 30 | m/min |
| Maximum feed rate (all axes) | 15 | m/min |
| Minimum feed rate | 1 | mm/min |
| Feed override range | 0–150 | % |
| Rapid override settings | 5%, 25%, 50%, 100% | — |
| Acceleration/deceleration type | S-curve (jerk-limited) | — |
| Acceleration (X, Y axes) | 0.5 | g |
| Acceleration (Z axis) | 0.4 | g |
| Positioning accuracy (ISO 230-2) | ±0.005 | mm |
| Repeatability (ISO 230-2) | ±0.003 | mm |
| Thermal compensation | Active thermal compensation (X, Y, Z) | — |

---

## 3.5 Tool Changer Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| ATC type | Double-arm (simultaneous swap) | — |
| Magazine type | Rotary carousel | — |
| Number of tool positions | 24 | — |
| Tool selection method | Random access (T-code) | — |
| Maximum tool weight | 8 | kg |
| Maximum tool diameter (adjacent pockets occupied) | 80 | mm |
| Maximum tool diameter (adjacent pockets empty) | 125 | mm |
| Maximum tool length (from gauge line) | 300 | mm |
| Chip-to-chip time (standard tool) | 4.2 | seconds |
| Tool-to-tool time (carousel index only) | 1.8 | seconds |
| Carousel drive motor | AC servo motor, 0.75 kW | — |
| ATC arm drive | Cam-driven, hydraulically actuated | — |
| ATC arm rotation speed | 90° in 0.9 seconds | — |
| Tool pot type | Spring-grip, BT-40 compatible | — |
| Pot retention force | 85 | N |
| Position sensors | Proximity sensors (inductive), 1 per 24 positions + home | — |
| ATC home sensor type | Inductive proximity, NPN, normally-open | — |

---

## 3.6 Electrical Specifications

### 3.6.1 Main Power Supply Requirements

| Parameter | Specification |
|-----------|---------------|
| Supply voltage | 480 VAC ±10%, 3-phase |
| Supply frequency | 60 Hz ±1 Hz |
| Number of phases | 3-phase + ground |
| Neutral required | No (delta-connected machine) |
| Total connected load | 45 kVA |
| Typical demand load (machining) | 28 kVA |
| Main disconnect | 100 A, 3-pole fusible disconnect (provided in machine) |
| Recommended upstream breaker | 100 A, 3-pole, Class J fuse or HACR breaker |
| Minimum short circuit current rating | 10,000 A at 480 VAC |
| Recommended wire size (service entry) | 4 AWG copper (or 2 AWG aluminum) |
| Maximum wire size (cabinet entry) | 350 kcmil |
| Supply conduit knockout size | 63.5 mm (2.5 in) |
| Ground conductor requirement | 8 AWG minimum (see NEC 250.122) |

> **NOTE:** The specified 100 A upstream breaker is for a dedicated circuit. If the BC-500X shares a circuit with other loads (not recommended), the upstream protection must be sized for the total connected load. Consult your electrical engineer.

### 3.6.2 Control Cabinet Power Distribution

The main electrical cabinet distributes power to all machine subsystems through a central power distribution bus. All distribution is from the main cabinet; no external power connections are required except for the single 480 VAC supply.

| Circuit | Voltage | Protection | Load |
|---------|---------|------------|------|
| Spindle drive input | 480 VAC, 3-phase | 50 A, Class J fuse | 18.5 kW |
| X-axis servo drive | 480 VAC, 3-phase | 20 A, Class J fuse | 3 kW |
| Y-axis servo drive | 480 VAC, 3-phase | 20 A, Class J fuse | 3 kW |
| Z-axis servo drive | 480 VAC, 3-phase | 20 A, Class J fuse | 4 kW |
| Hydraulic pump motor | 480 VAC, 3-phase | 15 A, Class J fuse | 4 kW |
| Coolant pump motor | 480 VAC, 3-phase | 10 A, Class J fuse | 2.2 kW |
| ATC carousel servo | 480 VAC, 3-phase | 10 A, Class J fuse | 0.75 kW |
| Chip conveyor motor | 480 VAC, 3-phase | 5 A, Class J fuse | 0.75 kW |
| Control transformer | 480 VAC primary | 15 A fuse | 3 kVA |
| 120 VAC control circuit | 120 VAC | 10 A circuit breaker | Control/solenoids |
| 24 VDC system | 24 VDC | Fused at each output | PLC/sensors |

### 3.6.3 Motor Power Ratings

| Motor | Power | Speed | Torque | Frame |
|-------|-------|-------|--------|-------|
| Spindle motor | 15 kW cont. / 18.5 kW (30 min) | 0–10,000 RPM | 95.5 N·m cont. | IEC 112M |
| X-axis servo | 3 kW | 0–3,000 RPM | 9.55 N·m | IEC 90L |
| Y-axis servo | 3 kW | 0–3,000 RPM | 9.55 N·m | IEC 90L |
| Z-axis servo | 4 kW | 0–3,000 RPM | 12.73 N·m | IEC 90L |
| ATC carousel servo | 0.75 kW | 0–3,000 RPM | 2.39 N·m | IEC 71 |
| Hydraulic pump motor | 4 kW | 1,450 RPM | 26.3 N·m | IEC 100L |
| Coolant pump motor | 2.2 kW | 2,900 RPM | 7.2 N·m | IEC 80 |
| Chip conveyor motor | 0.75 kW | 1,450 RPM (geared) | — | IEC 71 |
| Way lube pump motor | 0.12 kW | 1,450 RPM | — | IEC 56 |

---

## 3.7 Hydraulic System Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| System operating pressure | 150 | bar |
| Maximum system pressure (relief valve set) | 210 | bar |
| Hydraulic pump type | Fixed displacement gear pump | — |
| Hydraulic pump displacement | 8.3 | cc/rev |
| Hydraulic pump flow rate (at 1,450 RPM) | 12 | L/min |
| Hydraulic pump motor | 4 kW, 1,450 RPM | — |
| Reservoir capacity | 50 | L |
| Hydraulic oil specification | ISO VG 46 (anti-wear type) | — |
| Oil filtration | Return line filter, 10 μm absolute | — |
| Oil temperature operating range | 20–60 | °C |
| Oil temperature maximum (alarm) | 65 | °C |
| Oil temperature maximum (shutdown) | 70 | °C |
| Oil temperature control | Air-cooled heat exchanger (fan-cooled) | — |
| Heat exchanger motor | 0.18 kW | — |
| Hydraulic circuits served | Z-axis brake, tool unclamp, ATC arm, gear change | — |
| Number of solenoid valves | 8 | — |
| Solenoid valve voltage | 24 VDC | — |
| Pressure gauge accuracy | ±2.5% full scale | — |
| Pressure switch (low pressure alarm) | Set at 120 bar (rising), 100 bar (falling) | — |

### 3.7.1 Hydraulic Circuit Functions

| Circuit | Operating Pressure | Function |
|---------|--------------------|----------|
| Z-axis hydraulic brake | 150 bar (release) / spring apply | Holds Z-axis position; applied when power is removed |
| Spindle tool unclamp | 150 bar | Overcomes draw bar spring to release tool |
| ATC arm actuation | 150 bar | Drives ATC arm extension, rotation, and retraction |
| Gear change actuation | 80 bar | Selects low/high spindle gear ratio |
| Workholding (optional) | 0–150 bar (adjustable) | Customer-supplied workholding fixtures |

---

## 3.8 Pneumatic System Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| Supply pressure (required) | 6.0–8.0 | bar |
| Supply pressure (required) | 87–116 | psi |
| Air consumption (average during operation) | 120 | NL/min |
| Air consumption (peak, tool change) | 350 | NL/min |
| Air filtration required | 40 μm or finer | — |
| Air quality | Clean, dry, oil-free | — |
| Dew point at supply | Less than 3°C at operating pressure | — |
| Inlet connection size | G3/8 (ISO 228-1) or 1/2 NPT | — |
| Internal working pressure (regulated) | 5.5 bar / 80 psi | — |
| Pneumatic filter-regulator-lubricator (FRL) | Provided; mounted on rear of machine | — |
| Pneumatic circuits served | Spindle air purge, chip blow-off, tool sensor, gear change assist | — |

> **NOTE:** The BC-500X pneumatic system uses a non-lubricated configuration for the spindle air purge and chip blow-off circuits. The FRL lubricator section is bypassed for these circuits. Do not add oil to the FRL lubricator bowl unless specifically directed by a BetaCorp service engineer.

---

## 3.9 Coolant System Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| Coolant tank capacity | 350 | L |
| Coolant pump type | Centrifugal | — |
| Coolant pump motor | 2.2 kW, 2,900 RPM | — |
| Coolant flow rate (standard nozzles) | 60 | L/min |
| Coolant pressure at nozzles | 3–5 | bar |
| Coolant supply connections | 4 adjustable nozzles (standard) | — |
| Coolant filtration | Magnetic chip separator + 150 μm stainless screen | — |
| Coolant level sensor | Float switch, 4-wire, 24 VDC | — |
| Low coolant level setpoint | 80 mm below full level | — |
| Coolant temperature (normal operation) | 20–35 | °C |
| Coolant temperature (maximum) | 45 | °C |
| Recommended coolant type | Semi-synthetic or synthetic water-soluble | — |
| Coolant concentration (typical) | 7–10 | % |
| Through-spindle coolant (optional) | 70 bar, 30 L/min | bar, L/min |
| Coolant pH range (normal) | 8.5–9.5 | — |

---

## 3.10 Axis Servo System Specifications

| Parameter | X-Axis | Y-Axis | Z-Axis | Unit |
|-----------|--------|--------|--------|------|
| Servo motor power | 3 | 3 | 4 | kW |
| Servo motor speed (rated) | 3,000 | 3,000 | 3,000 | RPM |
| Servo motor torque (rated) | 9.55 | 9.55 | 12.73 | N·m |
| Drive type | BetaCorp SD-300 | BetaCorp SD-300 | BetaCorp SD-400 | — |
| Ballscrew pitch | 10 | 10 | 10 | mm/rev |
| Ballscrew diameter | 40 | 40 | 50 | mm |
| Ballscrew accuracy class | ISO Class 3 | ISO Class 3 | ISO Class 3 | — |
| Ballscrew support | Fixed-fixed (angular contact) | Fixed-fixed | Fixed-floating | — |
| Linear guideway type | Roller (IKO LWE) | Roller (IKO LWE) | Roller (IKO LWE) | — |
| Number of guideway carriages | 4 (2 rails × 2) | 4 (2 rails × 2) | 4 (2 rails × 2) | — |
| Encoder type | Optical incremental | Optical incremental | Optical incremental | — |
| Encoder resolution | 2,500 PPR | 2,500 PPR | 2,500 PPR | — |
| Encoder resolution (quadrature × 4) | 10,000 | 10,000 | 10,000 | counts/rev |
| Effective resolution at table | 1 | 1 | 1 | μm |
| Servo update rate | 250 | 250 | 250 | μs |
| Position loop gain (default) | See B2.01 | See B2.11 | See B2.21 | — |

### 3.10.1 Axis Brake Specifications

| Axis | Brake Type | Brake Torque |
|------|------------|--------------|
| X-axis | Electromagnetic (on servo motor) | 5 N·m |
| Y-axis | Electromagnetic (on servo motor) | 5 N·m |
| Z-axis | Hydraulic (fail-safe, spring-apply) + electromagnetic | Hydraulic: 120 N·m; EM: 8 N·m |

The Z-axis hydraulic brake is critically important. It is spring-applied (fail-safe) and hydraulically released. When hydraulic power is removed, the brake automatically applies. This prevents the Z-axis from falling under gravity when the machine is powered down or in emergency stop.

---

## 3.11 Encoder Specifications

Encoders are used on all servo axes and on the spindle. Proper encoder operation is critical to machine accuracy and safety.

### 3.11.1 Axis Encoder Specifications

| Parameter | Value |
|-----------|-------|
| Encoder manufacturer | Heidenhain (standard) |
| Encoder model (X, Y axes) | ERN 1381 |
| Encoder model (Z axis) | ERN 1381 |
| Type | Optical incremental |
| Resolution | 2,500 PPR |
| Output type | Differential (RS-422) |
| Supply voltage | 5 VDC ±5% |
| Maximum frequency | 200 kHz |
| Shaft coupling | Bellows coupling (backlash-free) |
| Operating temperature | 0–80°C |
| Cable length (to drive) | 5 m (standard) |
| Cable part number | BC-CBL-ENC-5M |
| Connector type | 12-pin circular (BetaCorp standard) |

### 3.11.2 Spindle Encoder Specifications

| Parameter | Value |
|-----------|-------|
| Encoder manufacturer | Heidenhain |
| Encoder model | ROD 420 |
| Type | Optical incremental with index |
| Resolution | 4,096 PPR (pre-quadrature) |
| Resolution (post-quadrature) | 16,384 counts/rev |
| Output type | Differential (RS-422) |
| Supply voltage | 5 VDC ±5% |
| Maximum speed | 10,000 RPM |
| Maximum frequency (at 10,000 RPM) | 682 kHz |
| Operating temperature | 0–80°C |
| Cable part number | BC-CBL-SPENC-3M |
| Index pulse | 1 per revolution |

> **IMPORTANT:** The spindle encoder is used for:
> 1. Spindle speed feedback for closed-loop speed control
> 2. Rigid tapping synchronization
> 3. Spindle orientation for tool changes
> 4. C-axis positioning (optional 4th axis applications)
>
> Loss of the spindle encoder signal at any time results in fault **E101 — Spindle Encoder Signal Lost**. This is a safety-critical fault. The spindle drive immediately disables the output, and the spindle coasts to a stop (or applies brake if B1.22 = 1). The machine will not allow the spindle to start until the encoder fault is resolved. See Section 8.5.1 for the complete E101 troubleshooting procedure.

---

## 3.12 Physical Dimensions and Weight

| Parameter | Value | Unit |
|-----------|-------|------|
| Machine height (with enclosure) | 2,850 | mm |
| Machine height (with enclosure) | 112.2 | in |
| Machine length (front to rear) | 3,200 | mm |
| Machine length (front to rear) | 126.0 | in |
| Machine width (left to right) | 2,400 | mm |
| Machine width (left to right) | 94.5 | in |
| Machine net weight (without fluids) | 8,200 | kg |
| Machine net weight (without fluids) | 18,078 | lb |
| Machine weight with all fluids | 8,650 | kg |
| Machine weight with all fluids | 19,070 | lb |
| HPU weight | 185 | kg |
| Control cabinet weight | 240 | kg |
| Chip conveyor weight | 95 | kg |
| Floor loading (maximum, footpad area) | 12,800 | kg/m² |
| Number of leveling footpads | 6 | — |
| Footpad diameter | 150 | mm |
| Footpad adjustment range | ±25 | mm |

### 3.12.1 Minimum Clearance Requirements

For access, maintenance, and heat dissipation, the following minimum clearances must be maintained around the BC-500X:

| Location | Minimum Clearance |
|----------|-------------------|
| Front (operator access) | 1,500 mm (59.1 in) |
| Right side (electrical cabinet access) | 1,000 mm (39.4 in) |
| Left side (chip conveyor access) | 800 mm (31.5 in) |
| Rear (hydraulic / service access) | 1,200 mm (47.2 in) |
| Above machine (for ceiling clearance with no cranes) | 500 mm (19.7 in) |
| Above machine (if overhead crane is used for tooling) | 2,000 mm (78.7 in) above machine top |

---

## 3.13 Ambient Environmental Specifications

| Parameter | Specification |
|-----------|---------------|
| Ambient temperature (operation) | +5°C to +40°C |
| Ambient temperature (storage) | -20°C to +60°C |
| Relative humidity (operation) | 20–75%, non-condensing |
| Relative humidity (storage) | 10–90%, non-condensing |
| Maximum altitude | 1,000 m (derated operation to 2,000 m — contact BetaCorp) |
| Vibration (floor) | Less than 0.2 g RMS (10–200 Hz) |
| Pollution degree | Pollution Degree 2 (IEC 60664-1) |
| Overvoltage category | Category III (480 VAC supply) |
| IP rating (control cabinet) | IP54 |
| IP rating (machine enclosure) | IP32 (not designed for outdoor use) |
| Seismic zone | Designed for Seismic Zone 1 (low seismic activity) — consult BetaCorp for other zones |

---

## 3.14 Noise and Vibration

| Parameter | Value | Conditions |
|-----------|-------|------------|
| Sound pressure level (operator position, dry run) | 74 dB(A) | Rapid traverse, no cutting |
| Sound pressure level (operator position, machining) | Up to 84 dB(A) | Steel milling, typical parameters |
| Sound power level | 89 dB(A) | Machining steel |
| Uncertainty K | 4 dB | Per ISO 3746 |
| Machine vibration (table surface, idle) | Less than 0.3 μm RMS | ISO 10816 |

Noise values are measured per ISO 3746:2010 in a hemianechoic environment. Actual values in a factory environment will differ due to room reflections and other machines.

---

## 3.15 CE/UL/CSA Compliance Data

The BC-500X is designed and manufactured in compliance with applicable safety standards. CE-marked versions comply with EU Machinery Directive 2006/42/EC.

| Standard | Status |
|----------|--------|
| UL 508A (Industrial Control Panels) | UL Listed |
| CSA C22.2 No. 14 (Industrial Control Equipment) | CSA Certified |
| EN ISO 16090-1 (Machining Centres Safety) | Conformant (CE versions) |
| EN 60204-1 (Electrical Equipment of Machines) | Conformant (CE versions) |
| EN ISO 13849-1 PL d (Safety-related control, Cat. 3) | Conformant for E-Stop, door interlock |
| FCC Part 15 (EMI — US) | Compliant |
| ICES-003 (EMI — Canada) | Compliant |

**Compliance Documentation Location:**
- CE Declaration of Conformity: Appendix K (CE versions only)
- UL Listing certificate: Available on request
- Test reports: Available through BetaCorp document portal

---

*End of Chapter 3 — Technical Specifications*

---


---

# PART 3 — INSTALLATION

---

# Chapter 4 — Installation Guide

## 4.1 Pre-Installation Planning

Before the BC-500X arrives at the installation site, a comprehensive pre-installation checklist must be completed. Failure to prepare the site adequately will delay installation and may result in additional costs.

**Pre-Installation Checklist:**

- [ ] Foundation drawing reviewed and foundation prepared per Section 4.2
- [ ] Anchor bolt locations marked and bolts cast into concrete (if epoxy anchors: holes drilled and cleaned)
- [ ] Floor loading capacity verified by structural engineer (minimum 15,000 kg/m²)
- [ ] Electrical supply brought to the machine location: 480 VAC, 3-phase, 100 A capacity
- [ ] Electrical supply terminated in a junction box within 3 m of the machine right side
- [ ] Ground conductor installed (8 AWG minimum)
- [ ] Compressed air supply brought to the machine location: 6–8 bar, 1/2 NPT or G3/8 connection
- [ ] Air dryer or desiccant filter installed upstream of machine air supply
- [ ] Coolant drainage provision made (floor drain or collection tank) near machine perimeter
- [ ] Chip storage/disposal area designated near chip conveyor discharge
- [ ] Minimum clearances verified (see Section 3.12.1)
- [ ] Overhead clearance verified for rigging during delivery (minimum 4.5 m above floor)
- [ ] Fork lift or overhead crane with minimum 10-tonne capacity available for rigging
- [ ] Certified rigger identified and briefed on lifting plan
- [ ] BetaCorp service engineer arrival date confirmed
- [ ] All personnel involved in installation have read Chapter 2 (Safety)
- [ ] PPE available for all installation personnel

---

## 4.2 Site Preparation and Foundation

### 4.2.1 Foundation Drawing and Requirements

The BC-500X requires a properly prepared concrete foundation to achieve its specified accuracy. The following requirements apply:

**Concrete Specification:**
- Minimum compressive strength: 25 MPa (3,625 psi) at 28 days (ASTM C39 or equivalent)
- Concrete type: Normal weight concrete (density ~2,400 kg/m³)
- Reinforcement: Per structural engineer's design based on local soil conditions
- Minimum foundation slab thickness: 250 mm (10 in)
- Preferred foundation slab thickness: 400 mm (16 in) for optimum vibration damping

**Foundation Dimensions (Minimum):**
- Length: 3,600 mm (141.7 in)
- Width: 2,800 mm (110.2 in)
- The machine footprint is 3,200 × 2,400 mm; the foundation must extend 200 mm beyond the machine footprint on all sides

**Foundation Surface:**
- The foundation surface must be level within ±2 mm over the full machine footprint before installation
- Surface must be clean, free of oil, and structurally sound
- No cracks deeper than 5 mm or wider than 2 mm are acceptable in the machine footpad area

**Anchor Bolt Pattern:**
Six (6) anchor bolt locations are specified, corresponding to the six machine leveling footpads. Anchor bolt specifications:
- Bolt size: M24 × 400 mm (length)
- Bolt grade: Grade 8.8 or equivalent
- Bolt pattern: Per BetaCorp foundation drawing BCS-FDN-BC500X (available from BetaCorp Systems)
- Cast-in method: Cast into concrete before pour using bolt templates (provided with machine)
- Epoxy anchor method: Hilti HIT-RE 500 V3 or equivalent; follow epoxy manufacturer's instructions for cure time before loading

> **CAUTION:** Allow epoxy anchors to cure fully before applying any load. Typical cure time is 24 hours at 20°C; longer at lower temperatures. Check epoxy manufacturer's specifications.

**Vibration Isolation:**
For installations in facilities with significant floor vibration from nearby presses, forging equipment, or compressors:
- Consider installing the BC-500X on anti-vibration mounts (Mason Industries type N or equivalent)
- BetaCorp Systems offers a vibration isolation package (Part No. BC-OPT-VIBISO) that includes neoprene-steel sandwich isolation mounts rated for the machine weight
- Without isolation, floor vibration above 0.2 g will degrade positioning accuracy

### 4.2.2 Anchor Bolt Installation

**Materials Required:**
- 6 × M24 anchor bolts (supplied with machine)
- 6 × M24 heavy hex nuts
- 6 × M24 flat washers
- Appropriate tools for concrete drilling (if epoxy anchor method)

**Cast-in Anchor Bolt Procedure:**

1. Obtain the BetaCorp foundation drawing BCS-FDN-BC500X. This drawing shows the exact location of all six anchor bolt centerlines relative to the machine front face and right side face.
2. Lay out the anchor bolt locations on the prepared form before the concrete pour.
3. Use the anchor bolt template provided with the machine (sheet steel, 3,200 × 2,400 mm, with 6 holes punched) to ensure correct bolt spacing.
4. Position the template on the form and verify all dimensions match the foundation drawing.
5. Install the anchor bolts through the template holes. Use a pipe sleeve around each bolt to allow ±15 mm of adjustment after the pour.
6. Brace the template to the form so the bolts cannot shift during the pour.
7. Pour concrete; do not allow concrete to enter the pipe sleeves.
8. After the pour and initial set (minimum 48 hours), remove the template. Bolts should protrude 80 mm above the finished floor surface.
9. Allow concrete to cure for minimum 14 days before machine installation.

**Epoxy Anchor Procedure:**

1. After concrete has cured (minimum 28 days for full strength), lay out the anchor bolt locations per the foundation drawing.
2. Drill anchor holes using a rotary hammer drill with a 28 mm core bit: depth = 280 mm minimum.
3. Clean the holes thoroughly: blow out with compressed air, brush with a wire brush, blow out again. Repeat three times. No dust or moisture may remain in the hole.
4. Check that holes are dry. If moisture is present, allow to dry or use moisture-tolerant epoxy per manufacturer's instructions.
5. Inject epoxy per manufacturer's instructions, filling from the bottom of the hole.
6. Insert the M24 anchor bolt while rotating slowly to ensure full epoxy contact. The bolt should protrude 80 mm above floor level.
7. Allow epoxy to cure per manufacturer's specification before applying load.

### 4.2.3 Leveling Pads and Vibration Isolation

The BC-500X is equipped with six (6) adjustable leveling footpads. Each footpad consists of:
- Cast iron base plate (250 × 250 × 40 mm)
- M24 leveling bolt with jam nut
- Anti-vibration rubber pad (80 Shore A durometer, sandwiched between base plate and floor)

**Footpad Adjustment Range:**
- Vertical: ±25 mm from nominal
- This allows the machine to be leveled even if the floor varies by up to 25 mm across the footprint

**Pre-Leveling Preparation:**
Before placing the machine on the footpads:
1. Verify that all six footpad locations are at the correct height (within ±20 mm of each other) using a builder's level.
2. If the floor has significant variation, shim the footpads using stainless steel shim stock.
3. Thread the M24 leveling bolt to the approximate center of its adjustment range.
4. Place the anti-vibration rubber pad on the floor over the anchor bolt.
5. Place the footpad base plate over the rubber pad.

---

## 4.3 Machine Delivery and Rigging

> **DANGER:** The BC-500X weighs 8,500 kg (18,739 lb). Rigging this machine requires certified riggers, appropriate lifting equipment rated for at least 10 tonnes, and careful coordination. An improperly rigged machine can fall, killing or maiming people in the fall path. Only qualified riggers using appropriate equipment may perform this operation.

### 4.3.1 Lifting Points and Rigging Diagram

The BC-500X is provided with four (4) factory-installed lifting eye bolts. These eye bolts are located on the top of the machine base casting, two on each side. The eye bolts are M30, Grade 8.8, with a working load limit (WLL) of 3,000 kg each (total WLL = 12,000 kg; machine weight = 8,500 kg, giving a safety factor of 1.41 — acceptable with a spreader bar).

**Rigging Configuration:**
- Use a four-leg wire rope sling set with a minimum WLL of 10,000 kg (10 tonnes)
- Use a spreader bar (minimum 2,500 mm center-to-center) to prevent inward compression of the machine lifting lugs
- Maximum leg angle from vertical: 30° (preferred); 45° maximum
- All four sling legs must be the same length to ensure level lift

**DO NOT:**
- Use the spindle head, chip conveyor, or control panel as lift points
- Use chains without proper hooks and load ratings
- Lift the machine with fewer than 4 slings
- Allow anyone under the suspended load

**Rigging Equipment Required:**
- Overhead crane or mobile crane: minimum 10-tonne capacity
- 4-leg wire rope sling set: WLL ≥ 10,000 kg at 45° (typically 10 mm diameter, 6×36 IWRC)
- Spreader bar: ≥ 2,500 mm, WLL ≥ 10,000 kg
- Shackles: 4 × WLL ≥ 3,500 kg each, screw pin anchor shackles
- Tag lines: 2 × rope tag lines for controlling load orientation during lift

### 4.3.2 Unpacking and Inspection

The BC-500X is shipped in a wooden crate or on a steel skid, depending on transport method. The machine is coated with a rust-preventive oil on all machined surfaces.

**Unpacking Procedure:**

1. Inspect the shipping crate/skid exterior for damage before unpacking. Document any visible shipping damage with photographs and note on the delivery receipt.
2. Remove the outer crating/skid material. Do not use pry bars or hammers near the machine body.
3. Remove protective plastic sheeting from the machine.
4. Inspect all external surfaces for damage. Pay particular attention to:
   - Spindle nose area (risk of impact damage during shipping)
   - Control panel pendant
   - Chip conveyor (often shipped separately)
   - Hydraulic power unit (often shipped separately)
5. Check the packing list against received items. Items typically shipped separately:
   - Chip conveyor assembly
   - Coolant tank extension (if ordered)
   - Optional accessory packages
   - Tooling and toolholders (if ordered)
   - Operator's manual and documentation package
6. Locate the transport securing hardware (bolts and brackets that secure the machine table and spindle head for shipping). These MUST be removed before power-up. See Section 4.3.2.1 below.
7. Locate the consumables kit (supplied with the machine): hydraulic oil (50 L), way lube oil (10 L), initial coolant charge, filter elements.

**Transport Securing Hardware Removal:**

The machine is shipped with the following transport locks that MUST be removed before operation:

| Item | Location | Tool Required | Part No. (Lock) |
|------|----------|---------------|-----------------|
| X-axis transport bracket | Left side of X-axis | 19 mm wrench | BC-TRANS-001 |
| Y-axis transport bracket | Rear of Y-axis | 19 mm wrench | BC-TRANS-002 |
| Z-axis transport bracket | Right side of column | 24 mm wrench | BC-TRANS-003 |
| Spindle nose protector | Spindle nose | By hand | BC-TRANS-004 |
| ATC arm transport bracket | ATC arm casting | 13 mm wrench | BC-TRANS-005 |

> **WARNING:** Operating the machine with transport securing hardware in place will damage the machine and may cause the secured components to fail violently. Verify ALL transport locks are removed and stored (they may be needed for future machine relocation) before applying power.

---

## 4.4 Machine Leveling

Precise machine leveling is critical for achieving the positioning accuracy specified in Section 3.4. The BC-500X must be leveled to within 0.02 mm/m (0.0002 in/in) before commissioning.

**Equipment Required:**
- Precision level (sensitivity: 0.02 mm/m or better) — example: Starrett 98 Series or Mitutoyo 960 Series
- Level gauge block (flat reference surface)
- Feeler gauges
- 36 mm socket and torque wrench for leveling bolt jam nuts
- Shim stock (stainless steel, 0.05 to 1.0 mm thickness)

**Leveling Procedure:**

**Step 1: Initial Coarse Leveling**

After placing the machine on the footpads (with anchor bolts through the footpad base plates but not yet tightened):
1. Place the precision level on the machine table in the X-direction (parallel to X-axis).
2. Adjust the leveling bolts on the left and right front footpads to bring the machine level in X.
3. Place the level on the machine table in the Y-direction (parallel to Y-axis).
4. Adjust the rear footpad leveling bolts to bring the machine level in Y.
5. Repeat steps 2–4, alternating X and Y directions, until level is achieved in both directions simultaneously.
6. At this stage, level to within 0.05 mm/m.

**Step 2: Anchor Bolt Torqueing**

After coarse leveling:
1. Thread the M24 anchor bolt nuts down to contact the footpad base plate.
2. Tighten all six anchor bolts to 200 N·m (147 ft·lb).
3. Recheck level after tightening anchor bolts. Tightening will often move the machine slightly.
4. If level has moved, re-adjust the leveling bolts and re-torque anchor bolts.

**Step 3: Fine Leveling**

Fine leveling targets 0.02 mm/m or better:
1. Place the precision level on the machine table at the center of X-travel, reading in the X-direction.
2. Adjust front left and front right leveling bolts (1/6 turn increments) to fine-adjust X-level.
3. Move the table to the left end of X-travel. Read the level.
4. Move the table to the right end of X-travel. Read the level.
5. The level reading should change by no more than 0.01 mm/m across the full X-travel.
6. If the level changes significantly across the travel, the table guideways may need re-scraping (factory procedure — contact BetaCorp).
7. Repeat for Y-direction with level parallel to Y-axis.
8. When both directions are within 0.02 mm/m with less than 0.01 mm/m variation over the full travel, leveling is complete.

**Step 4: Final Jam Nut Torqueing**

After fine leveling is confirmed:
1. Hold each leveling bolt stationary with one wrench.
2. Torque the jam nut against the footpad body to 300 N·m (221 ft·lb).
3. Recheck level after jam nut torqueing.

**Step 5: Leveling Documentation**

Record the following in the installation log:
- Level readings at each footpad location, in X and Y directions
- Date of leveling
- Technician name
- Any special conditions (e.g., shims added)

> **NOTE:** Re-check machine level after the first week of operation (thermal and settling effects), after three months, and then annually. Record all readings in the maintenance log.

---

## 4.5 Electrical Connection

> **DANGER:** Electrical connection must be performed by a licensed electrician in accordance with all applicable local electrical codes. Verify the facility voltage is correct (480 VAC, 3-phase) before connecting. Incorrect voltage will damage the machine.

### 4.5.1 Power Supply Wiring to Main Disconnect

The BC-500X main electrical supply enters through a conduit knockout on the top right of the main electrical cabinet. The main disconnect switch is a 100 A, 3-pole fusible disconnect switch located inside the main cabinet.

**Wiring Procedure:**

1. Verify the main disconnect is in the OFF (open) position and locked out before beginning wiring work.
2. Open the main electrical cabinet door. The lock cylinder is located in the upper right corner of the door.
3. Locate the main disconnect switch (upper right section of cabinet).
4. Locate the main power terminal block (labeled L1, L2, L3) directly below the main disconnect switch.
5. Route the supply cables from the facility panel through the conduit knockout (63.5 mm / 2.5 in knockout on top of cabinet).
6. Connect the supply conductors to the main disconnect switch line side terminals:
   - L1: Phase A (connect to left terminal)
   - L2: Phase B (connect to center terminal)
   - L3: Phase C (connect to right terminal)
   - Wire size: 4 AWG copper minimum
   - Terminal torque: 20 N·m (177 in·lb) for L1/L2/L3 lugs
7. Connect the equipment grounding conductor (green or green/yellow) to the main ground bus bar in the cabinet.
   - Ground bus bar is located in the lower left section of the cabinet, clearly labeled "GROUND BUS"
   - Minimum ground conductor size: 8 AWG copper
   - Terminal torque: 6 N·m (53 in·lb) for ground lug
8. Verify all connections are tight. Pull-test each wire by hand.
9. Verify no tools or foreign materials are left inside the cabinet.
10. Close and latch the cabinet door.

**Phase Rotation Check:**

The BC-500X hydraulic pump motor and coolant pump motor require correct phase rotation. After initial power-up, verify:
1. Turn the main disconnect ON.
2. The system will power up in the "initial power-on" sequence described in Section 4.10.
3. Navigate to SYSTEM → DIAGNOSTIC → PHASE MONITOR on the CNC control.
4. The control will display the measured phase rotation. Correct rotation is ABC (positive sequence).
5. If rotation is incorrect (ACB), the control will display a phase rotation warning. Swap any two of the three supply phase conductors (L1 and L2, or L2 and L3, or L1 and L3) at the main disconnect to correct rotation.

> **CAUTION:** Do not swap conductors at any point other than the main disconnect supply side. The internal motor wiring is factory-set and must not be modified.

### 4.5.2 Grounding Requirements

Proper grounding is essential for both safety and control system reliability.

**Required Grounding Connections:**

| Connection Point | Conductor Size | Description |
|-----------------|----------------|-------------|
| Main cabinet ground bus to facility ground electrode | 8 AWG min copper | Primary safety ground |
| Machine frame to main cabinet ground bus | Pre-wired at factory | — |
| Chip conveyor to machine frame | 12 AWG green, factory-supplied | Bond wire |
| Coolant tank to machine frame | 12 AWG green, factory-supplied | Bond wire |
| HPU to machine frame | 12 AWG green, factory-supplied | Bond wire |
| Control pendant to machine | Integral in flexible cable | — |

**Ground Resistance Testing:**
After completing all grounding connections, test the ground resistance from the main cabinet ground bus to the facility ground electrode system. Resistance must be less than 0.1 ohm. Use a four-wire Kelvin resistance test set for accuracy. If resistance exceeds 0.1 ohm, inspect all connections for corrosion or loose terminations.

### 4.5.3 Control Transformer Tap Selection

The BC-500X control transformer provides 120 VAC from the 480 VAC supply for the control circuit. The primary side of the transformer has multiple taps to accommodate slight voltage variations in the facility supply.

**Factory Default Setting:** Primary tap is connected at 480 VAC.

**Available Primary Taps:**

| Tap Label | Use When Supply Voltage Is |
|-----------|---------------------------|
| 460 VAC | 460–470 VAC measured |
| 470 VAC | 470–475 VAC measured |
| 480 VAC | 475–485 VAC (factory default) |
| 490 VAC | 485–495 VAC measured |
| 500 VAC | 495–505 VAC measured |

**How to Change the Transformer Tap:**
1. Lock out the machine (LOTO procedure, Section 2.4.2).
2. Open the main electrical cabinet.
3. Locate the control transformer (lower left section of cabinet, labeled "TX1 CONTROL XFMR").
4. The primary tap leads are on the top of the transformer. The active connection is marked with a yellow insulating sleeve.
5. Move the yellow sleeve (and the wire it secures) to the tap that matches the measured facility voltage.
6. Use a torque screwdriver to tighten the terminal screw to 1.5 N·m (13 in·lb).
7. Verify the secondary voltage reads 120 VAC ±5% (114–126 VAC) with the transformer energized.

---

## 4.6 Hydraulic System Connection

### 4.6.1 Hydraulic Power Unit Installation

The BC-500X Hydraulic Power Unit (HPU) is mounted on the right rear corner of the machine base. The HPU is pre-connected to the machine hydraulic circuits with high-pressure hoses at the factory. However, if the HPU was shipped separately or disconnected for access, the following procedure applies:

**HPU Mounting:**
1. Clean the HPU mounting pads on the machine base.
2. Lift the HPU into position using the two lifting lugs on top of the HPU frame. The HPU weighs 185 kg (408 lb); use appropriate lifting equipment.
3. Lower the HPU onto the machine base mounting pads.
4. Install and tighten the 4 × M16 mounting bolts to 160 N·m (118 ft·lb).

**HPU Hydraulic Line Connections:**

All HPU hydraulic connections use BSP (British Standard Pipe) threaded fittings with O-ring face seal (ORFS) adapters. These connections require specific torque values:

| Connection Size | Torque |
|-----------------|--------|
| G1/4 BSP ORFS | 30 N·m (22 ft·lb) |
| G3/8 BSP ORFS | 50 N·m (37 ft·lb) |
| G1/2 BSP ORFS | 70 N·m (52 ft·lb) |
| G3/4 BSP ORFS | 100 N·m (74 ft·lb) |
| G1 BSP ORFS | 140 N·m (103 ft·lb) |

> **CAUTION:** Over-torquing ORFS fittings will distort the O-ring groove and cause leaks. Use a calibrated torque wrench. Under-torquing will also cause leaks.

**HPU Hydraulic Line Identification:**

All hydraulic hoses and lines are labeled with colored bands corresponding to the following circuit identification:

| Color Band | Circuit |
|------------|---------|
| Red | High-pressure supply (150 bar) |
| Blue | Return to tank |
| Yellow | Z-axis brake circuit |
| Green | Tool unclamp circuit |
| Orange | ATC arm circuit |
| White | Gear change circuit |

Match the color-coded labels when reconnecting hoses. Reversing supply and return lines will cause immediate component damage.

### 4.6.2 Hydraulic Line Connection and Flushing

Before commissioning the hydraulic system, all hydraulic lines must be flushed to remove any contamination introduced during installation.

**Hydraulic Flushing Procedure:**

1. Fill the HPU reservoir with clean ISO VG 46 hydraulic oil (see Section 11.7 for oil specification). Fill to the "MAX" mark on the sight glass.
2. Install bypass jumpers at each hydraulic actuator (Z-axis brake cylinder, tool unclamp cylinder, ATC arm cylinder). Bypass jumpers connect the supply and return ports of each actuator directly, bypassing the actuator itself. This protects the actuators from any particulate contamination during flushing. Bypass jumper kit: Part No. BC-TOOL-HYD-FLUSH.
3. Connect a portable hydraulic flushing unit (10 μm absolute filter, minimum 20 L/min flow rate) to the hydraulic system supply and return lines, bypassing the machine HPU pump.
4. Operate the flushing unit for 30 minutes minimum.
5. Take an oil sample after 30 minutes and send to a laboratory for particle count analysis. Target cleanliness: ISO 4406 cleanliness code ≤ 16/14/11.
6. If the target cleanliness is not achieved, continue flushing and re-test at 15-minute intervals until the target is reached.
7. Remove the flushing unit and bypass jumpers.
8. Reconnect the actuator lines in their correct configuration.
9. Check the hydraulic reservoir oil level; add oil if required.

> **NOTE:** Hydraulic system cleanliness is critically important for the life of the hydraulic pump, valves, and cylinders. A poorly flushed system will experience premature valve failure and pump wear. Do not skip or shorten the flushing procedure.

---

## 4.7 Pneumatic System Connection

**Connection Point:**
The pneumatic supply connects to the machine at the FRL (Filter-Regulator-Lubricator) assembly mounted on the rear of the machine. The supply connection is a G3/8 (ISO 228-1) female fitting, or a 1/2 NPT female fitting on machines configured for North American piping (specify at order).

**Connection Procedure:**

1. Verify the pneumatic isolation valve (on the machine FRL assembly) is in the CLOSED position.
2. Install a shutoff valve in the supply line immediately upstream of the machine FRL. This allows the machine air to be isolated without shutting off the facility air.
3. Connect the supply line (minimum 12 mm OD tubing or 1/2 in OD tubing) to the machine FRL inlet.
4. Use PTFE thread tape or thread sealant on NPT connections. Do not use thread sealant on BSP parallel thread (G-thread) connections — use only the O-ring or bonded seal provided.
5. After connection, slowly open the supply valve to pressurize the FRL inlet.
6. Open the machine pneumatic isolation valve slowly.
7. Check the FRL pressure gauge. Adjust the regulator to 5.5 bar (80 psi) by pulling out the regulator knob, turning clockwise to increase pressure, then pushing the knob in to lock.
8. Check all pneumatic connections for leaks using a soap-and-water solution. Tighten any leaking connections.
9. Verify that the FRL bowl is empty (the lubricator section is bypassed; do not add oil to the lubricator bowl).

**Pneumatic System Check:**
After connection, verify the following pneumatic functions work correctly (after initial machine power-up per Section 4.10):
- Spindle air purge activates when spindle is started (air blows from around the spindle nose area)
- ATC arm actuates smoothly during a dry tool change cycle
- Chip blow-off nozzles (if equipped) activate when the coolant system is in the "blow-off" mode

---

## 4.8 Coolant System Filling

**Coolant Type:**
The BC-500X is designed for use with water-soluble semi-synthetic or fully synthetic metalworking fluids. Refer to Chapter 12 for a complete guide to coolant selection and management. The following is the initial fill procedure.

**Initial Coolant Fill Procedure:**

1. Remove the coolant tank access cover from the top of the coolant tank (located in the base of the machine, below the work zone). The access cover is secured with 6 × M6 hex socket cap screws.
2. Inspect the interior of the coolant tank. It should be clean and free of debris from the manufacturing process. Wipe out any metal chips, dust, or rust preventive oil residue with clean rags.
3. Reinstall the access cover and torque the screws to 8 N·m (71 in·lb).
4. Prepare the coolant mixture: For initial fill, prepare a 7–8% concentration solution of BetaCorp approved cutting fluid. See Chapter 12 for approved fluid list and mixing procedure.
   - Typical initial volume: 350 liters (coolant tank capacity)
   - This requires approximately 24.5–28 liters of coolant concentrate added to 322–325 liters of water
   - ALWAYS add concentrate to water (not water to concentrate)
5. Fill the coolant tank through the top fill opening. The fill opening is located on the top of the coolant tank, next to the access cover. A strainer is fitted in the fill opening to catch debris.
6. Add coolant until the level indicator reads "FULL" (level indicator is a graduated sight glass on the right side of the coolant tank).
7. Check the coolant concentration with a refractometer. Reading should be 7–8% (or per coolant manufacturer's table for the specific product).
8. Check the coolant pH using calibrated pH test strips or a digital pH meter. Initial fill should read 8.5–9.5.
9. Record the coolant type, concentration, initial pH, date of initial fill, and technician name in the coolant maintenance log (Appendix I).

**Coolant Pump Priming:**
After filling the tank, prime the coolant pump:
1. Apply machine power (per Section 4.10).
2. From the control panel, turn the coolant pump ON (COOLANT ON/OFF switch on main console).
3. Observe the coolant flow from the nozzles. Allow the pump to run for 2 minutes to prime.
4. Check for any leaks at all coolant line connections, nozzle connections, and pump housing.
5. Adjust the coolant nozzle positions to direct flow into the work zone cutting area.
6. Check the coolant level after priming; add coolant if the level has dropped below the "FULL" mark (the lines and pump volume is approximately 15 liters).

---

## 4.9 Chip Conveyor Installation

The chip conveyor is typically shipped separately from the main machine and must be installed on-site.

**Chip Conveyor Installation Procedure:**

1. Position the chip conveyor on the floor adjacent to the left side of the machine. The chip conveyor discharge end (where chips fall into the chip bin) should point away from the machine and toward the aisle or chip disposal area.
2. Align the chip conveyor inlet chute with the machine base chip exit port (located on the lower left side of the machine base). The inlet chute must slide into the machine base opening with a minimum 50 mm overlap.
3. Adjust the chip conveyor leg height so the inlet chute aligns with the machine chip exit port. The legs are adjustable with threaded feet, similar to the machine leveling pads.
4. Secure the chip conveyor to the machine base using the 2 × M12 mounting bolts (supplied with the conveyor). Tighten to 60 N·m (44 ft·lb).
5. Connect the chip conveyor motor to the machine electrical system at the conveyor motor connection box (located on the machine base, left side). The connection is a 5-pin circular connector (3-phase + ground + control). Match the color-coded wires per the label on the connector housing.
6. After initial power-up, verify the chip conveyor runs in the correct direction (chips should move from the inlet toward the discharge end). If the conveyor runs backward, swap any two of the three motor phase leads at the connection box (with machine locked out).
7. Install the chip bin (collection hopper) under the conveyor discharge chute. The chip bin sits on the floor; no attachment is required. Verify the bin is centered under the discharge.

---

## 4.10 Initial Power-On and System Checkout

> **WARNING:** Before applying power to the BC-500X for the first time, ensure all installation steps have been completed, all transport securing hardware has been removed, all fluid levels are correct, and all personnel are clear of all hazardous areas.

**Initial Power-On Procedure:**

**Step 1: Pre-Power Checks**

Complete the following checklist before applying power:
- [ ] All transport securing hardware removed (Section 4.3.2)
- [ ] Machine leveled and anchor bolts torqued
- [ ] Electrical supply connected, correct phase and voltage verified
- [ ] All electrical cabinet doors closed
- [ ] Hydraulic oil filled to "MAX" level (before starting HPU motor, the oil level will drop as circuits fill)
- [ ] Coolant tank filled to "FULL" level
- [ ] Pneumatic supply connected and isolated valve closed
- [ ] Chip conveyor connected (motor connector inserted)
- [ ] All guards and covers installed
- [ ] All personnel clear of machine

**Step 2: Apply Main Power**

1. Ensure the main electrical cabinet main disconnect is in the OFF position.
2. Turn the main disconnect to ON.
3. The CNC control will power up and begin its initialization sequence. The control display will show the BetaCorp Systems logo, then the system initialization screen.
4. The initialization takes approximately 45 seconds.
5. After initialization, the control will display the main status screen. Expected messages:
   - "HOMING REQUIRED — PRESS HOME TO CONTINUE" (normal after first power-up)
   - Fault E404 (Hydraulic Pressure Low) may be active — expected, as hydraulic pump has not started yet

**Step 3: Start Hydraulic System**

1. Navigate to SYSTEM → MACHINE SETUP → HYDRAULIC SYSTEM.
2. Press "HPU START" soft key.
3. The hydraulic pump motor will start. The HPU will pressurize to the operating pressure (150 bar) within approximately 10–15 seconds.
4. Monitor the hydraulic pressure gauge on the HPU. It should rise to 150 bar and stabilize.
5. Fault E404 should clear automatically when pressure reaches the low-pressure setpoint (120 bar).
6. Check all hydraulic connections for leaks while the system is pressurized. Address any leaks immediately (LOTO, de-pressurize, tighten/replace fitting).

**Step 4: Open Pneumatic Supply**

1. Slowly open the pneumatic isolation valve on the machine FRL assembly.
2. Verify the FRL pressure gauge reads 5.5 bar. Adjust regulator if necessary.
3. Verify the spindle air purge activates (you will hear a soft hiss from the spindle area).

**Step 5: Check Control Panel Functions**

Test the following control panel functions:
- Each axis JOG button: press and verify the correct axis moves in the correct direction at a low jog rate
- E-Stop buttons: press each E-Stop and verify the machine halts and displays "E-STOP ACTIVE"
- Reset: after each E-Stop test, release the button, press RESET, and verify the machine returns to ready state
- Coolant pump: activate and verify coolant flow
- Chip conveyor: activate and verify conveyor runs in correct direction
- Spindle: command a low speed (500 RPM) and verify the spindle starts, reaches commanded speed, and the RPM display matches

**Step 6: Homing**

After all system checks pass, perform the machine homing procedure per Section 6.4. All axes must be homed before automatic operation.

---

## 4.11 Commissioning Procedure

Commissioning is performed by a BetaCorp Systems-trained service engineer and includes the following activities. This section describes the scope and purpose of commissioning tasks.

### 4.11.1 Control Parameters Verification

The BetaCorp service engineer will verify that all machine parameters are set to the correct values for the specific machine serial number. Machine-specific parameters (servo tuning, ballscrew pitch compensation, geometric compensation data) are stored on a USB drive shipped with the machine and loaded into the control during commissioning.

Key parameter groups verified during commissioning:
- B1.xx Spindle parameters (speed limits, acceleration, encoder ratio)
- B2.xx Axis motion parameters (position loop gain, velocity loop gain, ballscrew pitch)
- B3.xx Tool changer parameters (carousel home position, arm timing)
- B4.xx Hydraulic parameters (pressure setpoints, timer values)
- B6.xx Encoder parameters (encoder type, PPR values, quadrature enable)

### 4.11.2 Spindle Run-In

The spindle bearings require a run-in procedure after initial installation and after any spindle bearing replacement. This procedure gradually loads the bearings to seat the grease properly and establish correct preload.

**Spindle Run-In Schedule:**

| Step | Speed (RPM) | Duration |
|------|-------------|----------|
| 1 | 500 | 10 minutes |
| 2 | 1,000 | 10 minutes |
| 3 | 2,000 | 10 minutes |
| 4 | 3,000 | 15 minutes |
| 5 | 4,000 | 15 minutes |
| 6 | 5,000 | 20 minutes |
| 7 | 6,000 | 20 minutes |
| 8 | 7,000 | 20 minutes |
| 9 | 8,000 | 20 minutes |
| 10 | 10,000 | 30 minutes |

During the run-in, monitor spindle bearing temperature using an infrared thermometer at the spindle head area. Temperature must not exceed 65°C above ambient. If temperature exceeds this limit, stop the spindle, allow cooling, and repeat the step at reduced speed.

### 4.11.3 Servo System Tuning Verification

The servo drive systems are factory-tuned, but must be verified after installation as the machine dynamics can change slightly due to mounting conditions.

The BetaCorp service engineer will perform:
- Auto-tuning of position loop and velocity loop for each axis
- Verification of following error limits (Parameter B2.05 for X, B2.15 for Y, B2.25 for Z)
- Step response testing on each axis
- Verification of reversal backlash compensation (Parameter B2.06, B2.16, B2.26)

### 4.11.4 Tool Changer Commissioning

The ATC system requires calibration during commissioning:
- Verification of carousel home sensor position
- Teaching of tool pot positions (Parameters B3.01–B3.24)
- ATC arm home position verification
- Tool change cycle testing with test toolholders in all 24 positions
- Verification of tool presence detection sensors in all pockets

---

## 4.12 Geometry and Accuracy Verification

After commissioning, the machine geometry and accuracy must be verified against the BetaCorp BC-500X factory acceptance criteria.

**Tests Performed:**

| Test | Tool Used | Acceptance Criterion |
|------|-----------|----------------------|
| Spindle nose radial run-out | Test indicator + precision reference | Less than 3 μm |
| Spindle taper run-out (25 mm from nose) | Test indicator in spindle bore | Less than 5 μm |
| Z-axis straightness (over 300 mm travel) | Precision square + indicator | Less than 8 μm |
| X-axis straightness (over 600 mm) | Precision square + indicator | Less than 10 μm |
| X-axis/Z-axis perpendicularity | Precision square + indicator | Less than 10 μm/300 mm |
| Y-axis/Z-axis perpendicularity | Precision square + indicator | Less than 10 μm/300 mm |
| X-axis positioning accuracy (bi-directional) | Laser interferometer (Renishaw ML10 or equiv.) | ±0.005 mm |
| X-axis repeatability | Laser interferometer | ±0.003 mm |
| Y-axis positioning accuracy | Laser interferometer | ±0.005 mm |
| Y-axis repeatability | Laser interferometer | ±0.003 mm |
| Z-axis positioning accuracy | Laser interferometer | ±0.005 mm |
| Z-axis repeatability | Laser interferometer | ±0.003 mm |
| Table flatness | Precision level + reference | Less than 15 μm over full table |
| Spindle axis perpendicularity to table (X direction) | Test bar + indicator | Less than 10 μm/300 mm |
| Spindle axis perpendicularity to table (Y direction) | Test bar + indicator | Less than 10 μm/300 mm |

All geometry and accuracy test results are recorded on the BetaCorp BC-500X Acceptance Test Certificate (ATC), which is signed by the BetaCorp service engineer and the customer's representative and retained with the machine records.

---

## 4.13 Final Acceptance Testing

After geometry verification, the following production tests are performed:

**Test Piece Machining:**
A standard BetaCorp acceptance test piece is machined in aluminum using the BetaCorp test program (Part No. BCS-TESTPGM-BC500X). The test piece evaluates:
- Circular interpolation (G02/G03) — checks for servo mismatch and following error
- Linear positioning — checks X and Y axis accuracy
- Spindle speed stability — verifies speed regulation under load
- Tool change repeatability — tool change is performed 10 times, repositioning accuracy checked each time

**Acceptance Criteria for Test Piece:**
- Circularity of circular features: ≤ 0.010 mm
- Linear dimensional accuracy: ±0.008 mm
- Tool change repositioning accuracy (after 10 changes): ≤ 0.005 mm

**System Function Verification:**
- All fault codes can be intentionally triggered and reset (E-Stop, door interlock, coolant low, etc.)
- All override functions work correctly (feed rate override, spindle speed override, rapid override)
- Data communication (Ethernet, USB) functions correctly
- All optional accessories are tested

**Customer Sign-Off:**
Upon satisfactory completion of all acceptance tests, the customer's authorized representative signs the BC-500X Installation Acceptance Certificate. This certificate marks the start of the 24-month warranty period.

---

*End of Chapter 4 — Installation Guide*

---

# PART 4 — MACHINE COMPONENTS

---

# Chapter 5 — Machine Components

## 5.1 Machine Base and Column

**Base (Bed) Assembly:**

The BC-500X base is a one-piece casting manufactured from close-grained Meehanite pearlitic gray cast iron (Grade FC-300, minimum tensile strength 300 MPa). The base serves as the primary structural element of the machine and provides mounting surfaces for the X and Y axis guideways, the hydraulic power unit, coolant tank, and chip conveyor.

Cast iron construction provides inherent vibration damping characteristics superior to welded steel construction. The BC-500X base has been designed using finite element analysis (FEA) to achieve a first natural frequency above 80 Hz, well above the frequency range of typical machining excitation forces.

| Base Specification | Value |
|--------------------|-------|
| Material | FC-300 Meehanite gray cast iron |
| Brinell hardness (surface) | 180–230 HB |
| Surface flatness (guideways, ground) | Less than 3 μm/300 mm |
| Guideway hardness (induction hardened) | 52–58 HRC |
| Weight | 3,200 kg |
| Base dimensions (external) | 3,100 × 2,300 × 700 mm |

**Column Assembly:**

The column is also a one-piece Meehanite gray iron casting, mounted on the rear section of the base and integral to the base structure (the column and base are cast as a single unit on the BC-500X). This monoblock construction eliminates the potential for joint flex that exists in machines with bolted-on columns.

The column provides the vertical guideways (Z-axis) for the spindle head assembly. The column is heavily ribbed internally for maximum stiffness with minimum weight.

| Column Specification | Value |
|----------------------|-------|
| Column type | Monoblock (integral with base) |
| Z-axis guideway span | 350 mm (center-to-center) |
| Z-axis guideway length | 750 mm (per rail) |
| Guideway surface hardness | 52–58 HRC |
| Column height (from base top) | 1,500 mm |

---

## 5.2 Spindle Assembly

The BC-500X spindle assembly is a pre-loaded, cartridge-type spindle unit that is inserted into the spindle head housing and secured with four M16 mounting bolts. The cartridge design simplifies spindle replacement in the event of bearing failure or other spindle damage — the entire cartridge can be replaced without re-grinding the spindle housing bore.

### 5.2.1 Spindle Motor

The spindle is driven by an AC induction motor coupled to a two-speed gearbox. The gearbox output shaft connects to the spindle through a flexible bellows coupling.

**Spindle Motor Specifications:**

| Parameter | Value |
|-----------|-------|
| Motor type | AC induction (squirrel cage) |
| Rated power (continuous) | 15 kW |
| Rated power (30-minute rating) | 18.5 kW |
| Rated voltage | 480 VAC, 3-phase |
| Rated current (continuous) | 22 A |
| Rated current (30-min) | 27 A |
| Speed range | 0–3,000 RPM (motor output) |
| Motor speed at 10,000 RPM spindle | 3,333 RPM (gear 2 ratio 3.0:1) |
| Encoder | Integral encoder on motor shaft |
| Cooling | Integral fan (motor-mounted) |
| Motor frame | IEC 112M |
| Insulation class | Class F |
| Protection | IP54 |
| Part No. (motor assembly) | BC-MTR-SP-001 |

**Gearbox:**

The two-speed gearbox provides two speed ranges for the spindle:
- Gear 1 (low range): Gear ratio 5:1; motor speed 250–1,000 RPM → spindle 50–200 RPM (intended for heavy cuts, boring)
- Gear 2 (high range): Gear ratio 1.5:1; motor speed 333–6,667 RPM → spindle 50–10,000 RPM (full speed range, normal machining)

Wait — correcting: the gear ratios are configured to give the following spindle speeds:

| Gear | Ratio | Motor RPM Range | Spindle RPM Range |
|------|-------|-----------------|-------------------|
| Gear 1 (Low) | 5.0:1 | 250–3,000 RPM | 50–600 RPM |
| Gear 2 (High) | 3.0:1 | 167–3,000 RPM (vfd managed) | 50–10,000 RPM* |

*10,000 RPM spindle requires motor at full speed in high gear with the VFD providing extended speed range.

Gear change is pneumatically initiated and hydraulically engaged. The gear shift sequence is controlled by the CNC through the PLC. Gear shift time: approximately 0.8 seconds. The machine automatically selects the appropriate gear based on the commanded spindle speed and parameter B1.10 (Gear Change Threshold RPM; default = 600 RPM).

Part number, gearbox assembly: BC-GBX-SP-001

### 5.2.2 Spindle Bearings

The BC-500X spindle uses angular contact ball bearings arranged in a system that provides both radial and axial load capacity appropriate for milling and drilling operations.

**Bearing Arrangement:**

The spindle cartridge contains the following bearings:

| Position | Bearing Type | Quantity | Part No. |
|----------|-------------|----------|----------|
| Front (tool end) | Angular contact ball, 15° contact angle, matched set | 2 (face-to-face) | BC-BRG-SP-001 |
| Front | Angular contact ball, 15° contact angle | 1 (tandem with above) | BC-BRG-SP-002 |
| Rear | Deep groove ball bearing (radial constraint only) | 1 | BC-BRG-SP-003 |
| Rear (floating) | Angular contact, 15°, single | 1 | BC-BRG-SP-004 |

The front bearings (three total — one tandem pair plus one) are preloaded and provide the primary tool-end rigidity. The rear bearing is a floating arrangement to accommodate thermal expansion of the spindle shaft.

**Bearing Lubrication:**
The spindle bearings use oil-air mist lubrication. Pressurized air carries a precisely metered quantity of oil to each bearing through dedicated lubrication ports. The oil-air lubrication unit (Part No. BC-LUB-OA-001) is mounted inside the machine column.

**Lubrication System Parameters:**

| Parameter | Value |
|-----------|-------|
| Lubrication oil type | ISO VG 32 spindle oil (Mobil Velocite Oil No. 6 or equivalent) |
| Reservoir capacity | 2 liters |
| Oil delivery rate (per bearing, per cycle) | 0.008 mL |
| Lubrication cycle interval | Every 10 minutes of operation (see Parameter B1.45) |
| Lubrication air pressure | 3.0 bar |
| Low oil level alarm | Activates when reservoir below 20% capacity |

> **WARNING:** Never operate the spindle at speeds above 3,000 RPM without oil-air lubrication active. The lubrication system activates automatically when the machine is powered on and hydraulics are active. If lubrication system fault E088 (Oil-Air Lube Pressure Low) is active, DO NOT start the spindle above 3,000 RPM.

### 5.2.3 Spindle Encoder

The spindle encoder is a Heidenhain ROD 420 optical incremental encoder, mounted on the non-drive (rear) end of the spindle motor shaft extension. The encoder provides precise speed and position feedback to the spindle drive for closed-loop speed control, rigid tapping synchronization, and spindle orientation for tool changes.

**Encoder Mounting Details:**

The encoder is mounted in a protected housing bolted to the rear of the spindle motor. It connects to the motor shaft through a precision bellows coupling (Part No. BC-CUP-SP-001) to isolate the encoder from shock loads.

**Encoder Signal Routing:**

The encoder cable exits the motor housing through a strain-relief fitting and routes through the cable carrier (energy chain) on the Z-axis to the servo/spindle drive cabinet. The cable is a shielded, twisted-pair cable (Part No. BC-CBL-SPENC-3M, length 3 meters). The shield must be connected at the drive end only (floating at the encoder end) to prevent ground loops.

**Encoder Diagnostic Access:**

The spindle encoder status can be monitored in real-time at: SYSTEM → DIAGNOSTIC → ENCODER STATUS → SPINDLE

The display shows:
- Current count (absolute position in counts within one revolution)
- Current speed (RPM, calculated from encoder frequency)
- Signal quality (OK / WARNING / FAULT)
- Error count (number of encoder errors since last power cycle)

**Fault E101 — Spindle Encoder Signal Lost:**

If the spindle encoder signal is lost at any time during operation, the CNC immediately asserts Fault E101 (Spindle Encoder Signal Lost). This is categorically different from a simple alarm — E101 causes immediate spindle disable and halt of all machining operations. The full E101 troubleshooting procedure is in Section 8.5.1.

### 5.2.4 Tool Retention (Draw Bar) System

The tool retention system holds the tool holder securely in the spindle taper during machining and releases it for automatic tool changes.

**Draw Bar Design:**

The BC-500X draw bar uses a stack of Belleville (disc) washers that apply a clamping force of 18,000 N (4,047 lb) to the tool holder. The draw bar is a hardened steel rod that passes through the center of the spindle shaft. The lower end of the draw bar engages the collet fingers, which grip the tool holder retention knob. The upper end of the draw bar is pushed by the Belleville washer stack.

**Tool Clamp/Unclamp:**

- **Clamped state (normal):** Belleville springs are compressed by the collet assembly, pulling up on the draw bar, which pulls the collet fingers closed onto the retention knob. Tool holder is firmly seated in the spindle taper.
- **Unclamped state (during tool change):** Hydraulic pressure is applied to the unclamp cylinder (at top of spindle head), which pushes DOWN on the draw bar, overcoming the Belleville spring force. The collet fingers open, releasing the retention knob. An air blast simultaneously blows chips from the spindle taper.

**Tool Seating Verification:**

A proximity sensor (Part No. BC-SEN-SP-SEAT, Inductive, NPN, normally-open) detects whether the tool holder is fully seated in the spindle taper. This sensor prevents spindle start if a tool holder is not fully seated.

Draw bar assembly part numbers:

| Component | Part No. |
|-----------|----------|
| Draw bar (complete assembly) | BC-DRB-SP-001 |
| Belleville washer stack (10 washers) | BC-BELL-SP-001 |
| Collet assembly (CAT-40) | BC-COL-SP-CAT40 |
| Collet assembly (BT-40) | BC-COL-SP-BT40 |
| Unclamp cylinder seal kit | BC-SEAL-SP-UC-001 |
| Tool seating sensor | BC-SEN-SP-SEAT |
| Spindle air purge orifice plate | BC-OR-SP-001 |

---

## 5.3 Axis Servo Motors and Drives

### 5.3.1 X-Axis Assembly

The X-axis drives the machine table in the left-right direction (when viewed from the front of the machine). The X-axis assembly is located on top of the machine base.

**X-Axis Components:**

| Component | Specification | Part No. |
|-----------|---------------|----------|
| Servo motor | BetaCorp SM-300-3K, 3 kW, 3,000 RPM | BC-MTR-X-001 |
| Servo drive | BetaCorp SD-300, 3 kW | BC-DRV-X-001 |
| Ballscrew | Ø40 × pitch 10 mm, Class 3, rolled | BC-BSC-X-001 |
| Ballscrew nut | Double-nut, preloaded | BC-NUT-X-001 |
| Fixed end support | Angular contact bearing, matched pair | BC-BRG-X-FIX |
| Floating end support | Deep groove ball bearing | BC-BRG-X-FLT |
| Linear guideway (left) | IKO LRWE55, roller type | BC-GWY-X-L |
| Linear guideway (right) | IKO LRWE55, roller type | BC-GWY-X-R |
| Guideway carriages (per rail) | 2 × IKO LWRE55 | BC-CAR-X-001 |
| Encoder | Heidenhain ERN 1381, 2500 PPR | BC-ENC-X-001 |
| Encoder cable | 5 m, shielded | BC-CBL-ENC-5M |
| Motor coupling | Bellows type, backlash-free | BC-CUP-X-001 |
| Scale cover (telescoping) | 3-section steel telescoping | BC-COV-X-001 |

**X-Axis Travel Limits:**

| Limit | Position | Detection Method |
|-------|----------|-----------------|
| Software negative limit | X = -1.0 mm | CNC parameter B2.03 |
| Hardware negative limit | X = -5.0 mm | Limit switch LS-X-NEG |
| Software positive limit | X = 750.0 mm | CNC parameter B2.04 |
| Hardware positive limit | X = 755.0 mm | Limit switch LS-X-POS |
| Mechanical hard stop (negative) | X = -8.0 mm | Adjustable stop block |
| Mechanical hard stop (positive) | X = 758.0 mm | Adjustable stop block |

### 5.3.2 Y-Axis Assembly

The Y-axis drives the machine table in the front-back direction. The Y-axis assembly is located under the X-axis assembly (the Y-axis saddle carries the X-axis).

**Y-Axis Components:**

| Component | Specification | Part No. |
|-----------|---------------|----------|
| Servo motor | BetaCorp SM-300-3K, 3 kW, 3,000 RPM | BC-MTR-Y-001 |
| Servo drive | BetaCorp SD-300, 3 kW | BC-DRV-Y-001 |
| Ballscrew | Ø40 × pitch 10 mm, Class 3, rolled | BC-BSC-Y-001 |
| Ballscrew nut | Double-nut, preloaded | BC-NUT-Y-001 |
| Fixed end support | Angular contact bearing pair | BC-BRG-Y-FIX |
| Floating end support | Deep groove ball bearing | BC-BRG-Y-FLT |
| Linear guideway (front) | IKO LRWE55, roller type | BC-GWY-Y-F |
| Linear guideway (rear) | IKO LRWE55, roller type | BC-GWY-Y-R |
| Guideway carriages (per rail) | 2 × IKO LWRE55 | BC-CAR-Y-001 |
| Encoder | Heidenhain ERN 1381, 2500 PPR | BC-ENC-Y-001 |
| Encoder cable | 5 m, shielded | BC-CBL-ENC-5M |
| Motor coupling | Bellows type, backlash-free | BC-CUP-Y-001 |
| Scale cover (accordion/bellows) | Stainless steel bellows | BC-COV-Y-001 |

### 5.3.3 Z-Axis Assembly

The Z-axis moves the spindle head up and down. It is the most heavily loaded axis due to the weight of the spindle head assembly (approximately 280 kg).

**Z-Axis Components:**

| Component | Specification | Part No. |
|-----------|---------------|----------|
| Servo motor | BetaCorp SM-400-3K, 4 kW, 3,000 RPM | BC-MTR-Z-001 |
| Servo drive | BetaCorp SD-400, 4 kW | BC-DRV-Z-001 |
| Ballscrew | Ø50 × pitch 10 mm, Class 3, ground | BC-BSC-Z-001 |
| Ballscrew nut | Double-nut, preloaded | BC-NUT-Z-001 |
| Fixed end support (upper) | Angular contact bearing pair | BC-BRG-Z-FIX |
| Floating end support (lower) | Angular contact, single | BC-BRG-Z-FLT |
| Linear guideway (left) | IKO LRWE65, roller type | BC-GWY-Z-L |
| Linear guideway (right) | IKO LRWE65, roller type | BC-GWY-Z-R |
| Guideway carriages (per rail) | 2 × IKO LWRE65 | BC-CAR-Z-001 |
| Encoder | Heidenhain ERN 1381, 2500 PPR | BC-ENC-Z-001 |
| Encoder cable | 5 m, shielded | BC-CBL-ENC-5M |
| Motor coupling | Bellows type, backlash-free | BC-CUP-Z-001 |
| Hydraulic brake cylinder | Ø100 mm, spring-apply/hydraulic-release | BC-CYL-Z-BRK |
| Brake pressure switch | 80–120 bar setpoint | BC-PSW-Z-BRK |
| Z-axis covers | Accordion stainless bellows | BC-COV-Z-001 |

**Z-Axis Counterbalance:**

The Z-axis gravity load (280 kg spindle head) is partially counterbalanced by the hydraulic brake circuit. The hydraulic brake provides both a holding force and a counterbalance function. This reduces the Z-axis servo motor's continuous holding torque requirement, extending servo motor life.

The Z-axis servo motor must supply additional torque for upward motion (against gravity) and can partially regenerate during downward motion. The servo drive's regenerative braking capability allows the kinetic and potential energy to be returned to the drive DC bus and dissipated in the regenerative resistor (mounted on top of the servo drive cabinet, external).

### 5.3.4 Ballscrew and Nut Assemblies

All three axes use recirculating ball type ballscrews. The BC-500X uses preloaded double-nut ballscrews (NSK or THK, Class 3) to eliminate backlash and provide high stiffness.

**Ballscrew Specifications:**

| Parameter | X-Axis | Y-Axis | Z-Axis |
|-----------|--------|--------|--------|
| Nominal diameter | 40 mm | 40 mm | 50 mm |
| Lead (pitch) | 10 mm/rev | 10 mm/rev | 10 mm/rev |
| Accuracy class | ISO Class 3 | ISO Class 3 | ISO Class 3 |
| Thread form | Gothic arch | Gothic arch | Gothic arch |
| Ball diameter | 6.35 mm | 6.35 mm | 8.00 mm |
| Axial play (assembled) | Less than 2 μm | Less than 2 μm | Less than 2 μm |
| Dynamic load capacity | 38 kN | 38 kN | 65 kN |
| Nut type | Double-nut, spring preload | Double-nut | Double-nut, offset preload |
| Preload | 8% of dynamic load | 8% of dynamic load | 6% of dynamic load |

**Ballscrew Lubrication:**
The ballscrews are lubricated by the centralized way lube system (see Section 5.8). Lube is distributed to the ballscrew nut through a nipple fitting on the nut body. The lube interval is controlled by Parameter B9.22 (Way Lube Interval).

**Ballscrew Maintenance:**
See Chapter 9, Section 9.13 for ballscrew maintenance procedures.

### 5.3.5 Linear Guideways

The BC-500X uses IKO (or THK equivalent) linear roller guideways on all three axes. Roller guideways provide higher load capacity, higher rigidity, and better damping than ball guideways at the same overall dimensions.

**Guideway Specifications:**

| Parameter | X-Axis | Y-Axis | Z-Axis |
|-----------|--------|--------|--------|
| Model series | IKO LRWE55 | IKO LRWE55 | IKO LRWE65 |
| Rail width | 55 mm | 55 mm | 65 mm |
| Carriage width | 100 mm | 100 mm | 120 mm |
| Dynamic load capacity (per carriage) | 85 kN | 85 kN | 125 kN |
| Static load capacity (per carriage) | 120 kN | 120 kN | 175 kN |
| Roller diameter | 8 mm | 8 mm | 10 mm |
| Rolling element material | Bearing steel (SUJ2) | Bearing steel | Bearing steel |
| Rail hardness | 58–64 HRC | 58–64 HRC | 58–64 HRC |
| Rail material | Bearing steel, induction hardened | Bearing steel | Bearing steel |
| Preload class | C1 (light preload) | C1 | C2 (medium preload) |
| Lubrication type | Way lube oil (ISO VG 68) | Way lube oil | Way lube oil |
| Wiper type | Double lip seal + contact | Double lip | Double lip seal + contact |

---

## 5.4 Tool Changer Carousel (24-Position)

The BC-500X tool changer is a 24-position, random-access, dual-arm automatic tool changer (ATC). The system consists of:
1. **Tool magazine carousel** — holds 24 toolholders in individual spring-grip tool pots
2. **ATC arm assembly** — performs simultaneous tool exchange between the carousel and spindle

The ATC reduces chip-to-chip time to 4.2 seconds (typical), significantly improving productivity compared to single-arm designs.

### 5.4.1 Carousel Drive Motor and Gear Assembly

The carousel is driven by a BetaCorp servo motor (0.75 kW, 3,000 RPM) through a precision worm gear reducer. The servo drive provides accurate position control of the carousel, allowing any of the 24 tool positions to be accessed in either direction (the carousel rotates in the shortest path to the required tool position).

**Carousel Drive Specifications:**

| Parameter | Value |
|-----------|-------|
| Drive motor | BetaCorp SM-075-3K, 0.75 kW | 
| Drive model | BC-MTR-ATC-001 |
| Gear reducer type | Worm gear, helical input stage |
| Gear ratio | 60:1 |
| Carousel rotation speed | 50 RPM (maximum) |
| Carousel rotation speed (indexing) | 30 RPM (normal) |
| Indexing time (24 positions, longest path) | 24 seconds (full carousel rotation) |
| Indexing time (average) | 1.8 seconds |
| Position encoder | Incremental, 1,000 PPR (on motor shaft) |
| Carousel home sensor | Inductive proximity, NPN, NC |
| Position sensors | 24 × inductive proximity (tool presence detection) |

**Carousel Home Position:**
The carousel home position is defined by a precision index pin that engages a notch in the carousel disc. The home sensor (Part No. BC-SEN-ATC-HOME) detects when the carousel is in the home position. This sensor is the absolute reference for all carousel positioning. If the carousel loses its position reference (e.g., due to encoder fault), it must be re-homed before tool changes can be performed.

### 5.4.2 Tool Pot and Gripper Assembly

Each of the 24 tool pots is an independent spring-grip unit mounted in the carousel disc. The tool pots accept CAT-40 or BT-40 toolholders (depending on machine configuration).

**Tool Pot Design:**
- The tool pot body is aluminum alloy, anodized black.
- Three hardened steel gripper fingers are pivoted in the pot body.
- A spring (wave spring type) behind the gripper fingers applies closing force.
- The gripper fingers lock around the V-groove of the toolholder (CAT V-flange or BT V-flange).
- Retention force: 85 N per pot (sufficient to retain tool during carousel rotation).

**Tool Pot Inspection Points:**
During weekly maintenance, inspect each tool pot for:
- Damage to gripper finger tips (worn, chipped, or broken)
- Loss of spring tension (tool does not stay securely in pot)
- Misalignment (tool sits crooked in pot)
- Accumulated chips inside pot (can prevent full tool seating)

**Tool Pot Part Numbers:**

| Component | CAT-40 Config. | BT-40 Config. |
|-----------|---------------|---------------|
| Complete tool pot assembly | BC-POT-CAT40 | BC-POT-BT40 |
| Gripper finger set (3 pcs) | BC-GRP-CAT40-SET | BC-GRP-BT40-SET |
| Wave spring | BC-SPR-POT-001 | BC-SPR-POT-001 |
| Pot body only | BC-POT-BODY-001 | BC-POT-BODY-001 |
| Pot retention bolt | BC-POT-BOLT-M8 | BC-POT-BOLT-M8 |

### 5.4.3 ATC Arm Assembly

The ATC arm is a double-arm design that simultaneously grips the tool in the spindle and the tool in the carousel, then performs a 180° rotation to swap the tools, and finally inserts the new tool into the spindle and the old tool into the carousel.

This simultaneous exchange is what enables the 4.2-second chip-to-chip time.

**ATC Arm Drive:**
The ATC arm motion is cam-driven, with the following motions controlled by a single rotating cam shaft:
1. Arm extension (arm moves forward, toward the spindle axis and carousel axis simultaneously)
2. Arm rotation (180° rotation to swap tools)
3. Arm retraction (arm moves back, releasing tools into spindle and carousel)

The cam shaft is hydraulically driven (hydraulic motor, 0.75 kW equivalent, gear-reduced). This provides powerful, consistent force for tool extraction and insertion regardless of tool weight (up to the 8 kg limit).

**ATC Arm Part Numbers:**

| Component | Part No. |
|-----------|----------|
| ATC arm complete assembly | BC-ATC-ARM-001 |
| ATC cam shaft assembly | BC-ATC-CAM-001 |
| ATC hydraulic motor | BC-ATC-HYD-MTR |
| ATC arm gripper (left) | BC-ATC-GRP-L |
| ATC arm gripper (right) | BC-ATC-GRP-R |
| ATC arm gripper spring | BC-ATC-GRP-SPR |
| ATC arm position cam follower | BC-ATC-CFW-001 |

### 5.4.4 ATC Position Sensors

The ATC system uses multiple sensors to verify the position and status of the arm and carousel at each step of the tool change sequence. These sensors are inductive proximity switches (NPN, 24 VDC) unless otherwise noted.

**ATC Sensors:**

| Sensor ID | Description | Part No. | Location |
|-----------|-------------|----------|----------|
| SEN-ATC-HOME | ATC arm home position | BC-SEN-ATC-HOME | ATC arm housing, rear |
| SEN-ATC-90 | ATC arm at 90° position (mid-swap) | BC-SEN-ATC-090 | ATC arm housing |
| SEN-ATC-180 | ATC arm at 180° position (swap complete) | BC-SEN-ATC-180 | ATC arm housing |
| SEN-ATC-EXT | ATC arm extended position | BC-SEN-ATC-EXT | ATC arm housing |
| SEN-ATC-RET | ATC arm retracted position | BC-SEN-ATC-RET | ATC arm housing |
| SEN-CAR-HOME | Carousel home position | BC-SEN-CAR-HOME | Carousel disc, left side |
| SEN-TP-01 through 24 | Tool presence sensor (24 total) | BC-SEN-TP-001 | Each tool pot position |

---

## 5.5 Hydraulic Power Unit

The BC-500X Hydraulic Power Unit (HPU) is a self-contained assembly mounted on the right rear of the machine base. All hydraulic system components are mounted on or in the HPU frame.

### 5.5.1 Hydraulic Pump

The hydraulic pump is a fixed-displacement external gear pump driven directly by the hydraulic pump motor (4 kW, 1,450 RPM).

**Hydraulic Pump Specifications:**

| Parameter | Value |
|-----------|-------|
| Pump type | External gear pump |
| Displacement | 8.3 cc/rev |
| Flow rate at 1,450 RPM | 11.8 L/min (nominal) |
| Maximum working pressure | 250 bar |
| Rated pressure | 210 bar (relief valve setting) |
| Operating pressure | 150 bar |
| Inlet fitting | G3/4 BSP male |
| Outlet fitting | G1/2 BSP male |
| Rotation direction | Clockwise (viewed from shaft end) |
| Shaft seal type | Lip seal, nitrile |
| Part No. | BC-PMP-HYD-001 |
| Manufacturer | Parker Hannifin (PGP505) or equivalent |

> **CAUTION:** The hydraulic pump rotation direction is critical. Verify phase rotation before starting the hydraulic pump motor. Running the pump in reverse will not build pressure and will rapidly damage the pump internal gears. Verify pump shaft rotation direction with the coupling guard removed before reinstalling the guard.

### 5.5.2 Hydraulic Valves

The BC-500X hydraulic system uses eight (8) solenoid-operated directional control valves, three (3) pressure control valves, two (2) check valves, and one (1) pressure relief valve.

**Main System Pressure Relief Valve:**
- Type: Direct-acting, pilot-operated
- Setting: 210 bar (factory set, do not adjust without BetaCorp authorization)
- Part No.: BC-RLV-HYD-MAIN

**Solenoid Valves:**

| Valve ID | Function | Type | Voltage | Part No. |
|----------|----------|------|---------|----------|
| SOL-HYD-01 | Z-axis brake release | 4/2 spring return | 24 VDC | BC-SOL-ZBK-001 |
| SOL-HYD-02 | Tool unclamp (pilot) | 4/2 spring return | 24 VDC | BC-SOL-TU-001 |
| SOL-HYD-03 | ATC arm extend | 4/3 spring center | 24 VDC | BC-SOL-ATC-EXT |
| SOL-HYD-04 | ATC arm retract | 4/3 spring center | 24 VDC | BC-SOL-ATC-RET |
| SOL-HYD-05 | ATC arm rotate CW | 4/2 spring return | 24 VDC | BC-SOL-ATC-CW |
| SOL-HYD-06 | ATC arm rotate CCW | 4/2 spring return | 24 VDC | BC-SOL-ATC-CCW |
| SOL-HYD-07 | Gear change (low gear) | 4/2 spring return | 24 VDC | BC-SOL-GCH-LO |
| SOL-HYD-08 | Gear change (high gear) | 4/2 spring return | 24 VDC | BC-SOL-GCH-HI |

**Pressure Reducing Valves:**

| Valve ID | Circuit | Setting | Part No. |
|----------|---------|---------|----------|
| PRV-HYD-01 | Gear change circuit | 80 bar | BC-PRV-GCH-001 |
| PRV-HYD-02 | Tool unclamp (main) | 150 bar | BC-PRV-TU-001 |
| PRV-HYD-03 | Workholding (optional) | 0–150 bar (adj.) | BC-PRV-WH-001 |

### 5.5.3 Hydraulic Cylinders

| Cylinder | Function | Bore | Stroke | Part No. |
|----------|----------|------|--------|----------|
| CYL-Z-BRK | Z-axis brake release | Ø100 mm | 30 mm | BC-CYL-Z-BRK |
| CYL-TU-001 | Spindle tool unclamp | Ø80 mm | 45 mm | BC-CYL-TU-001 |
| CYL-ATC-EXT | ATC arm extend/retract | Ø63 mm | 150 mm | BC-CYL-ATC-EXT |
| CYL-GCH-001 | Gear change actuator | Ø50 mm | 50 mm | BC-CYL-GCH-001 |

---

## 5.6 Coolant System

### 5.6.1 Coolant Tank and Pump

**Coolant Tank:**
The coolant tank is a welded stainless steel (grade 316L) tank located in the machine base below the work zone. All chips and coolant from the work zone drain into the tank through the chip conveyor (which removes the bulk of the chips) and the chip pan drains.

| Parameter | Value |
|-----------|-------|
| Tank material | 316L stainless steel, 3 mm plate |
| Tank capacity | 350 liters |
| Tank dimensions | 1,400 × 600 × 450 mm (L × W × H) |
| Drain valve | G3/4 BSP ball valve |
| Fill opening | 100 mm diameter with stainless screen |
| Level indicator | Float-type sight gauge (right side of tank) |
| Level sensor | Float switch, 4-wire, 24 VDC |
| Temperature sensor | RTD Pt100, 4-wire |
| Magnetic separator | Permanent magnet bar type, in tank |
| Part No. | BC-TNK-CLT-001 |

**Coolant Pump:**

| Parameter | Value |
|-----------|-------|
| Pump type | Centrifugal |
| Motor power | 2.2 kW |
| Motor speed | 2,900 RPM |
| Flow rate (full open) | 80 L/min |
| Flow rate (at nozzle pressure) | 60 L/min at 3–5 bar |
| Maximum head | 40 m |
| Impeller material | Stainless steel 316L |
| Shaft seal | Mechanical seal, silicon carbide |
| Part No. | BC-PMP-CLT-001 |

### 5.6.2 Coolant Filters

The coolant is filtered through a combination of:
1. **Magnetic chip separator:** Permanent magnet bars installed in the coolant tank remove ferromagnetic chips before they reach the pump inlet.
2. **Inlet strainer:** A 150 μm stainless steel wedge-wire screen at the pump inlet catches non-magnetic chips.
3. **Paper band filter (optional, Part No. BC-OPT-PAPFLT):** A roll of paper filter media intercepts coolant before the return line, providing finer filtration for demanding applications.

**Strainer Cleaning:**
The inlet strainer must be inspected and cleaned weekly. See Chapter 9, Section 9.3.

### 5.6.3 Coolant Nozzles and Distribution

The BC-500X is equipped with four adjustable coolant nozzles as standard equipment. Each nozzle has a flexible gooseneck mount that allows manual positioning. Nozzle orifice diameter is 6 mm.

**Coolant Distribution Manifold:**
A stainless steel coolant distribution manifold runs along the top of the work zone interior. The four nozzles connect to this manifold through flexible hose (Part No. BC-HOSE-CLT-1M, 1 m length, stainless fittings). A ball valve at each nozzle outlet allows individual nozzle shutoff.

**Through-Spindle Coolant (Optional):**
The through-spindle coolant (TSC) option provides coolant through the center of the spindle and tool holder, directly to the cutting zone. TSC requires:
- A high-pressure coolant pump (Part No. BC-OPT-TSC-PMP, 70 bar, 30 L/min)
- A coolant rotary union at the spindle (Part No. BC-OPT-TSC-UNION)
- Through-coolant compatible toolholders

TSC significantly improves tool life and chip evacuation in deep hole drilling and difficult-to-machine materials.

---

## 5.7 Chip Conveyor

The chip conveyor removes metal chips from the machine work zone and deposits them in a chip collection bin. The BC-500X uses a hinged-belt type chip conveyor suitable for all chip types from small needle chips to long stringy chips.

| Parameter | Value |
|-----------|-------|
| Conveyor type | Hinged steel belt (steel hinge plates) |
| Belt width | 250 mm |
| Total length | 2,000 mm |
| Elevation | 600 mm rise over 1,800 mm horizontal |
| Motor | 0.75 kW, 4-pole induction motor with gear reducer |
| Belt speed | 3–8 m/min (adjustable via VFD) |
| Chip capacity | Up to 200 kg/hour |
| Materials handled | Steel, cast iron, aluminum, stainless, brass chips |
| Discharge height | 600 mm from floor to discharge |
| Chip bin capacity | 120 liters |
| Belt material | Carbon steel, zinc plated |
| Hinge pin material | Stainless steel 304 |
| Part No. (complete) | BC-CNV-CHIP-001 |
| Motor/gearbox Part No. | BC-MTR-CNV-001 |

> **NOTE:** The chip conveyor hinged belt requires periodic lubrication of the hinge pins. Refer to Section 9.2 (daily maintenance) for lubrication procedure.

---

## 5.8 Lubrication System (Way Lube)

The BC-500X centralized automatic lubrication system delivers ISO VG 68 way lube oil to all linear guideway carriages and ballscrew nuts at timed intervals.

**Way Lube System Components:**

| Component | Description | Part No. |
|-----------|-------------|----------|
| Pump unit | Electric, positive displacement, 2.5-liter reservoir | BC-LUB-PMP-001 |
| Pump motor | 0.12 kW, 1/8 HP | BC-MTR-LUB-001 |
| Distribution manifold (X-axis) | 4-outlet, metered | BC-LUB-MAN-X |
| Distribution manifold (Y-axis) | 4-outlet, metered | BC-LUB-MAN-Y |
| Distribution manifold (Z-axis) | 4-outlet, metered | BC-LUB-MAN-Z |
| Lube tubing | 4 mm OD nylon, 60 m total | BC-LUB-TUBE-4 |
| Lube oil | ISO VG 68 way lube oil | BC-LUB-OIL-VG68 |
| Low level switch | Float type | BC-LUB-LVL-SW |

**Lubrication System Operation:**

The way lube system operates on a timed cycle controlled by PLC. The cycle interval is set by Parameter B9.22 (Way Lube Interval, default = 30 minutes). When the lube cycle activates:
1. The lube pump motor runs for 15 seconds (adjustable via Parameter B9.23).
2. Oil is pumped from the reservoir through the distribution manifolds to each lubrication point.
3. The metered outlets in the manifolds deliver a fixed oil volume per cycle (approximately 0.1 mL per point per cycle).
4. The lubrication cycle is logged in the maintenance log.

**Lube Oil Level Monitoring:**
The reservoir level is monitored by a float switch. When the level drops below the "LOW" mark, fault E088 (Way Lube Level Low) is set. The machine will continue to operate but will begin a countdown timer. If oil is not added within 30 minutes of fault E088 activation, the machine will halt with fault E089 (Way Lube Level Critical).

**Lubrication Oil Specification:**
- Type: ISO VG 68 way lube oil with anti-wear, anti-stick-slip additives
- Approved brands: Mobil Vactra Oil No. 2, Shell Tonna S2 M 68, Fuchs Renolin MR68
- Never use general-purpose machine oil or hydraulic oil in the way lube system
- Part No. for BetaCorp supplied oil: BC-LUB-OIL-VG68 (5-liter container)

---

## 5.9 Enclosure and Guarding

The BC-500X full enclosure provides:
- Protection of the operator from cutting fluids, chips, and tool breakage ejection
- Containment of coolant mist within the machine volume
- Noise reduction (contribution approximately 3–5 dB(A) at operator position)
- Access control (door interlock prevents hazardous operation with door open)

**Enclosure Construction:**

| Component | Material | Description |
|-----------|----------|-------------|
| Main enclosure panels | Cold-rolled steel, 2 mm, painted | Structural panels |
| Door frame | Cold-rolled steel, 3 mm, painted | Reinforced for door mounting |
| Work zone door | Steel frame with polycarbonate window (12 mm thick) | Sliding type, with gas strut counterbalance |
| Door window | Polycarbonate, 12 mm, impact-resistant | Minimum safety factor 4× |
| Door seal | EPDM rubber, continuous seal on 3 sides | Coolant sealing |
| Door interlock switch | Schmersal AZ 16 or equivalent (dual channel) | Safety-rated, IEC 60947-5-3 |
| Door lock solenoid | Electromagnetic hold, 24 VDC | Part No. BC-LOK-DOOR-001 |
| Interior lighting | LED strip, IP65, 24 VDC | Part No. BC-LED-WORK-001 |
| Mist collector port | Ø150 mm round port, top of enclosure | For customer-supplied mist collector |

**Window Inspection:**
The polycarbonate work zone window must be inspected monthly. Replace the window (Part No. BC-WIN-PC-001) if:
- Any crack or fracture is visible
- Deep scratches reduce visibility significantly
- The window has been struck by a tool ejection event
- The window is yellowed or embrittled (polycarbonate degrades with UV and certain coolants)

---

## 5.10 Control Panel and Operator Interface

The BC-500X control panel is mounted on a pivoting arm that allows the operator to position it for optimum comfort. The panel includes the CNC display, keyboard, function keys, and all machine control switches.

**Control Panel Layout:**

The control panel is divided into three sections:

**Upper Section — CNC Control Unit:**
- 15-inch color LCD display (1024 × 768 resolution)
- Membrane keyboard (alphanumeric, function keys)
- USB port (front-accessible, for program transfer)
- Ethernet port (behind door, for network connection)

**Middle Section — Machine Control Switches:**
- POWER ON (green, momentary)
- POWER OFF (red, momentary)
- E-STOP (red, mushroom head, key-release)
- RESET (blue, momentary)
- CYCLE START (green, with lamp)
- FEED HOLD (amber, with lamp)
- SPINDLE START (green, with lamp)
- SPINDLE STOP (red, with lamp)
- MODE SELECTOR (rotary switch: AUTO / MDI / JOG / HANDLE / HOME)

**Lower Section — Machine Function Switches:**
- COOLANT ON/OFF (toggle)
- CHIP CONVEYOR ON/OFF (toggle)
- WORK LIGHT ON/OFF (toggle)
- FEED RATE OVERRIDE (potentiometer, 0–150%)
- SPINDLE SPEED OVERRIDE (potentiometer, 50–150%)
- RAPID OVERRIDE (4-position rotary: 5% / 25% / 50% / 100%)
- JOG AXIS SELECTOR (rotary: X / Y / Z / OFF)
- JOG RATE SELECTOR (rotary: 0.001 / 0.01 / 0.1 / 1.0 / 10 / 100 mm/min)
- JOG +/- direction buttons (for selected axis)

---

## 5.11 Pendant and MPG Hand Wheel

The portable MPG (Manual Pulse Generator) pendant allows the operator to manually position axes with fine control, typically used during workpiece setup and tool offset measurement.

**MPG Pendant Specifications:**

| Feature | Description |
|---------|-------------|
| Physical | Handheld, 1.5 m cable |
| Display | 4-line LCD, axis position readout |
| E-Stop | Red mushroom-head button (dual-channel) |
| Hand wheel | 100-count per revolution pulse generator |
| Axis selector | Rotary switch: X / Y / Z / 4th (optional) |
| Multiplier | Rotary switch: ×0.001 / ×0.01 / ×0.1 mm per pulse |
| Enable button | Dead-man enable (must hold to move axis) |
| Part No. | BC-PND-MPG-001 |

**Hand Wheel Use:**
The MPG hand wheel allows the operator to move axes at precise increments:
- ×0.001 mm per pulse: 0.1 mm per full revolution — for very fine adjustments
- ×0.01 mm per pulse: 1.0 mm per full revolution — for tool length measurement
- ×0.1 mm per pulse: 10 mm per full revolution — for rapid positioning

The dead-man enable button must be held during all hand wheel motion. Releasing the enable button immediately halts axis motion, preventing uncontrolled movement.

---

## 5.12 Electrical Cabinet

The main electrical cabinet is a RITTAL TS8 series enclosure (or equivalent), IP54 rated, with thermostatically controlled air conditioning to maintain cabinet interior temperature at 35°C or below.

**Cabinet Dimensions:**
- Width: 800 mm
- Height: 2,000 mm
- Depth: 400 mm

**Cabinet Interior Layout (from top to bottom):**

| Level | Contents |
|-------|----------|
| Top | Cable entry area; main busbar; surge protection |
| Upper | Main disconnect; main fuses; transformer |
| Middle-upper | Spindle drive (Siemens S120 or equivalent) |
| Middle | X, Y, Z servo drives (BetaCorp SD-300/400) |
| Middle-lower | ATC servo drive; PLC rack; CNC controller |
| Lower | 24 VDC power supplies; I/O modules; terminal blocks |
| Bottom | Ground bus; cable tray |

**Cabinet Cooling:**
- Thermostat-controlled heat exchanger (liquid-to-air type)
- Set point: 35°C interior
- Cooling capacity: 1,500 W
- Monitoring: Cabinet temperature alarm activates at 50°C interior (Fault E821)
- Part No. (heat exchanger): BC-HEX-CAB-001

---

*End of Chapter 5 — Machine Components*


---

# PART 5 — OPERATION

---

# Chapter 6 — Operation Manual

## 6.1 Operator Qualification and Training

> **WARNING:** The BC-500X may only be operated by personnel who have completed the required training as specified in Section 2.2.1. Untrained operation creates serious risk of injury, death, and machine damage.

**Training Requirements:**
All operators must complete a minimum of 16 hours of BC-500X operator training covering:
- Machine safety (Chapter 2 of this manual)
- Control panel familiarization
- Manual operation modes
- Program selection and execution
- Tool management and offset entry
- Emergency procedures
- Daily maintenance responsibilities

**Operator Documentation:**
Training completion must be documented with the date, trainer name, and operator signature. This record must be maintained by the employer and made available upon request by regulatory authorities.

---

## 6.2 Pre-Operation Safety Inspection

Before starting the BC-500X for any production shift, the operator must perform the following pre-operation inspection. This inspection takes approximately 5 minutes and must be documented in the daily log.

**Daily Pre-Operation Checklist:**

**Guarding and Safety Systems:**
- [ ] Work zone door slides smoothly and seals properly (no gaps in door seal)
- [ ] Door window is clean, uncracked, and provides clear visibility
- [ ] Door interlock functions: open door → verify machine will not start spindle
- [ ] All E-Stop buttons visible and accessible; verify they are not depressed
- [ ] No personnel working inside the machine (check work zone through window)
- [ ] Tool changer area is clear of obstructions and debris
- [ ] Chip conveyor drive guard is in place

**Fluid Levels:**
- [ ] Coolant level — check sight glass on coolant tank. Add if below "LOW" mark
- [ ] Way lube reservoir — check level. Add if below "LOW" mark (use ISO VG 68 oil only)
- [ ] Hydraulic oil level — check HPU sight glass with system not running. Level should be between MIN and MAX marks

**Chip Management:**
- [ ] Chip bin under chip conveyor — empty if more than 2/3 full
- [ ] Coolant tank area around the chip pan — clear any accumulated chips
- [ ] Work zone interior — clear any chips from previous shift

**Machine Condition:**
- [ ] No visible fluid leaks (hydraulic oil, coolant, way lube) on floor around machine
- [ ] No unusual sounds during brief dry-run test after startup
- [ ] Control display shows no active faults (after startup)
- [ ] Coolant nozzles in correct position for the programmed operation

**Workstation:**
- [ ] Operator position: floor is clean, anti-slip mat in place, no tripping hazards
- [ ] PPE available and in good condition (safety glasses, face shield, cut-resistant gloves)
- [ ] Emergency procedures posted and visible

If any item on the pre-operation checklist is not satisfactory, the machine must not be started until the condition is corrected. Report deficiencies to the maintenance department.

---

## 6.3 Machine Power-On Sequence

The machine power-on sequence must be followed in the specified order. Skipping steps or changing the sequence may result in system errors or unsafe conditions.

**Power-On Sequence:**

**Step 1: Verify Area is Clear**
Walk around the entire machine and visually verify that no personnel are inside or near the machine, no tools or materials are left in the work zone that could interfere with homing motion, and the machine is in a safe state (no visible damage, no active leaks).

**Step 2: Apply Main Power**
Turn the main electrical disconnect switch (inside the main electrical cabinet, or the external handle if equipped) to the ON position.

The CNC control will begin its initialization sequence. Status messages during initialization:
- "BETACORP SYSTEMS BC-500X — SYSTEM INITIALIZING..."
- "LOADING SYSTEM PARAMETERS..."
- "INITIALIZING PLC..."
- "CHECKING SAFETY SYSTEMS..."
- "SYSTEM READY — PRESS POWER ON"

Initialization takes approximately 45 seconds.

**Step 3: Press POWER ON**
Press the green POWER ON button on the main operator panel. The CNC control will complete its startup and display the main operation screen. Expected initial status:
- Axis positions may show asterisks (*) indicating homing is required
- Fault E404 (Hydraulic Pressure Low) will be active — this is normal and will clear when the hydraulic system is started
- All axes will show their last known position or zeros

**Step 4: Start Hydraulic System**
Press the HPU START softkey (on screen) or navigate to SYSTEM → HYDRAULICS → HPU ON.
- The hydraulic pump motor will start.
- Hydraulic system pressure will rise to 150 bar within 10–15 seconds.
- Fault E404 will clear automatically.
- The Z-axis hydraulic brake will remain applied (spring-applied, requires pressure to release).

**Step 5: Start Coolant System**
Press the COOLANT ON/OFF switch on the operator panel to the ON position. The coolant pump will start. Verify coolant flow from the nozzles.

**Step 6: Open Pneumatic Supply**
If the pneumatic supply was isolated, open the pneumatic isolation valve on the FRL assembly (rear of machine). The pneumatic system will pressurize to 5.5 bar.

**Step 7: Check for Active Faults**
Review the CNC display for any active faults (fault codes are displayed in the status bar at the bottom of the main screen). Resolve any faults before proceeding.

- If fault E202 (Coolant Level Below Minimum) is active: add coolant to the tank and reset
- If fault E404 (Hydraulic Pressure Low) persists: check HPU (see Section 8.8.1)
- Any other faults: refer to Chapter 8

**Step 8: Perform Homing**
After the hydraulic system is running and no active faults are present, perform the machine homing procedure (Section 6.4).

---

## 6.4 Machine Homing (Reference Return) Procedure

The BC-500X uses incremental encoders on all axes. After power-up, the machine does not know the absolute position of each axis. The homing procedure moves each axis to its home position (limit switch + encoder index pulse) to establish an absolute position reference.

> **IMPORTANT:** Homing must be performed after every machine power-up and after any fault that may have caused unexpected axis motion. Never assume the axis positions are correct without homing.

**Homing Procedure — Automatic Mode:**

1. Verify the work zone is clear. During homing, all axes will move. Ensure no tooling or fixtures are in the machine that would interfere with full travel.
2. Rotate the MODE SELECTOR switch to HOME position.
3. The control will display "HOMING REQUIRED — PRESS CYCLE START TO HOME ALL AXES."
4. Press CYCLE START. The axes will home in the following sequence:
   - **Z-axis first** (moves UP to Z+ home position). This is critical — Z must home first to provide clearance before X and Y move.
   - **X-axis** (moves to X+ home position).
   - **Y-axis** (moves to Y+ home position).
5. Each axis decelerates as it approaches the home switch and then performs a slow creep to find the encoder index pulse for precise reference.
6. After all three axes have homed, the display will show "HOMING COMPLETE" and the position display will show X=0.000, Y=0.000, Z=0.000 (machine coordinate values at home position).

**Homing Speed Parameters:**

| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| B2.07 | X-axis homing speed (fast approach) | 2,000 mm/min |
| B2.08 | X-axis homing speed (creep to index) | 100 mm/min |
| B2.17 | Y-axis homing speed (fast approach) | 2,000 mm/min |
| B2.18 | Y-axis homing speed (creep to index) | 100 mm/min |
| B2.27 | Z-axis homing speed (fast approach) | 1,500 mm/min |
| B2.28 | Z-axis homing speed (creep to index) | 100 mm/min |

**Individual Axis Homing:**

In some situations, it may be necessary to home only a specific axis (e.g., if only one axis has lost its reference). To home a single axis:
1. Select HOME mode.
2. Use the AXIS SELECTOR to select the desired axis.
3. Press CYCLE START.
4. The selected axis will home. Other axes will not move (but they must already have valid home positions).

**Homing Verification:**

After homing, verify that all axis positions display correctly:
- Machine home coordinates: X=0.000, Y=0.000, Z=0.000 (displayed in machine coordinate mode)
- Toggle to work coordinate mode (WORK COORD button): positions will reflect the last set work coordinate offsets

---

## 6.5 Control Panel Layout and Functions

### 6.5.1 CNC Display Screens

The BC-500X CNC control displays information on a 15-inch LCD screen. The main screens are:

**Main Position Screen:**
- Displays current axis positions in machine or work coordinates
- Displays current spindle speed (commanded and actual)
- Displays active G-codes and M-codes
- Displays feed rate and override values
- Status bar shows: active mode, machine status, active faults

**Program Screen:**
- Displays the currently loaded program
- Highlighted line shows the block currently being executed
- Cursor position in the program can be scrolled manually

**Offset Screen:**
- Displays tool length offsets (H values, up to 99 tools)
- Displays tool radius offsets (D values, up to 99 tools)
- Displays work coordinate offsets (G54–G59 + G54.1 P1–P48)

**Parameter Screen:**
- Requires parameter access password
- Displays all machine parameters in groups B1.xx through B9.xx
- Parameters can be modified by authorized personnel

**Diagnostic Screen:**
- Encoder status for all axes and spindle
- I/O status (all digital inputs and outputs with current state)
- Axis drive status
- PLC status
- Communication status

### 6.5.2 Softkeys and Function Keys

The CNC keyboard includes 12 function keys (F1–F12) whose function changes based on the active screen. Current function key assignments are always displayed at the bottom of the CNC screen in a row of labeled "softkey" buttons.

**Common Softkey Assignments:**

| Softkey | Function |
|---------|----------|
| POSITION | Switch to position display screen |
| PROGRAM | Switch to program screen |
| OFFSET | Switch to offset screen |
| PARAM | Switch to parameter screen (password required) |
| DIAGNOSTIC | Switch to diagnostic screen |
| MSG | View alarm and message history |
| SET | Machine setting screen |
| GRAPH | Display graphics (tool path display mode) |

---

## 6.6 Manual Operation Modes

### 6.6.1 JOG Mode

JOG mode allows the operator to move axes continuously at a selected rate while a JOG button is held. JOG mode is used for:
- Moving axes to a convenient position before running a program
- Manual tool breakage inspection
- Positioning the spindle for tool length measurement

**JOG Mode Operation:**
1. Select JOG mode with the MODE SELECTOR switch.
2. Select the axis to jog with the JOG AXIS SELECTOR switch (X, Y, or Z).
3. Select the jog rate with the JOG RATE SELECTOR switch (range: 0.001 to 100 mm/min; available rates: 0.001, 0.01, 0.1, 1.0, 10, 100 mm/min).
4. Press and hold the JOG + or JOG - button to move the selected axis in the positive or negative direction.
5. Release the button to stop axis motion.

**JOG Speed Limit:**
When the work zone door is open, the maximum JOG speed is limited to 1,000 mm/min regardless of the JOG RATE setting. This limit is enforced by PLC logic and cannot be overridden.

### 6.6.2 HANDLE (MPG) Mode

HANDLE mode allows use of the MPG hand wheel for precise, incremental axis motion. HANDLE mode is used for:
- Fine positioning during workpiece setup
- Tool length offset measurement
- Manual surface probing

**HANDLE Mode Operation:**
1. Select HANDLE mode with the MODE SELECTOR switch.
2. On the MPG pendant, select the axis with the AXIS SELECTOR switch.
3. Select the increment multiplier: ×0.001, ×0.01, or ×0.1 mm per pulse.
4. Hold the dead-man enable button on the pendant.
5. Rotate the hand wheel to move the selected axis:
   - Clockwise rotation = positive axis direction
   - Counter-clockwise rotation = negative axis direction

**Speed Limiting in HANDLE Mode:**
The maximum axis speed in HANDLE mode is limited by the control parameter. The typical maximum speed from the hand wheel is 3,000 mm/min (limited by maximum pulse rate from the hand wheel at 1 revolution/second with ×0.1 multiplier). This is intentionally limited for safety.

### 6.6.3 Single-Block Mode

Single-block mode allows the operator to execute a CNC program one block (line) at a time. Each press of CYCLE START advances the program by one block. Single-block mode is used for:
- Verifying a new or modified program
- Step-by-step execution during machine setup
- Diagnosing program errors

**Single-Block Mode Operation:**
1. Load the program to be tested (see Section 6.7.2).
2. Navigate the program cursor to the desired starting line.
3. Press the SINGLE BLOCK button (toggles on/off; indicator lamp confirms active).
4. Press CYCLE START. The first block will execute.
5. Press CYCLE START again to execute the next block.
6. Continue until the program has been verified.
7. To return to normal continuous execution, press SINGLE BLOCK to deactivate.

> **NOTE:** In single-block mode, certain multi-block canned cycles (G80–G89) will pause after each internal step. This is intentional and provides maximum diagnostic visibility.

---

## 6.7 Program Entry and Editing

### 6.7.1 MDI (Manual Data Input) Mode

MDI mode allows the operator to enter and execute individual G-code blocks without creating a full program. MDI mode is useful for:
- Manually commanding axis moves to specific positions
- Starting the spindle at a specific speed
- Performing manual tool changes
- Testing G-code syntax before entering it into a program

**MDI Mode Operation:**
1. Select MDI mode with the MODE SELECTOR switch.
2. The MDI input line appears on the CNC display.
3. Type the G-code command using the keyboard. Example: `G00 G90 X100.0 Y50.0 Z-10.0` or `M03 S2500`.
4. Press CYCLE START to execute the entered command.
5. The command executes immediately. When execution is complete, the MDI line is ready for the next command.

**MDI Mode Limitations:**
- Maximum MDI block length: 255 characters
- MDI history: the last 20 MDI commands are stored and can be recalled with the cursor UP key
- Certain functions are not available in MDI mode: canned cycles requiring multiple blocks, subroutine calls across programs

### 6.7.2 Program Storage and Management

The BC-500X CNC control can store programs in internal memory and on external USB devices.

**Internal Memory:**
- Capacity: 10 GB (flash storage)
- Maximum number of programs: 10,000
- Maximum individual program size: 100 MB (supports extremely long programs)
- Program directory: accessible at PROGRAM → LIBRARY

**Program Naming Convention:**
Programs are named with an "O" prefix followed by up to 8 digits: O00000001 through O99999999.
The first 8 standard program numbers (O00001000 through O00001007) are reserved for BetaCorp system programs. Do not modify or delete these programs.

**Program Transfer — USB:**
1. Connect the USB drive to the front USB port on the CNC control panel.
2. Navigate to PROGRAM → USB TRANSFER.
3. Select the direction (USB → CNC or CNC → USB).
4. Select the program(s) to transfer.
5. Press TRANSFER (F-key).

**Program Transfer — Ethernet (DNC):**
The BC-500X supports DNC (Direct Numerical Control) operation via Ethernet. Programs stored on a network server can be streamed directly to the CNC for execution. Contact BetaCorp Systems for DNC software configuration requirements.

---

## 6.8 Tool Management

### 6.8.1 Tool Length Offset Setup

Tool length offsets are stored in the CNC control's tool offset table (H1 through H99). The offset value represents the length of the tool from the gauge line of the tool holder to the tool tip.

**Method 1: Reference Tool Method (Most Common)**

A reference tool of known length is first measured, and all other tools are measured relative to the reference tool.

1. Load a reference tool (or tool number 1) in the spindle.
2. Jog the Z-axis down to bring the tool tip to touch the workpiece surface (or a reference surface on the machine table).
3. Record the Z machine coordinate at this position. This is the Z machine position at Z=0 (workpiece surface).
4. Enter the work coordinate G54 Z offset: navigate to OFFSET → WORK COORD → G54, enter the current Z machine coordinate as the G54 Z offset value.
5. The G54 Z offset now defines Z=0 at the reference surface.
6. For each subsequent tool, load it in the spindle, jog down to touch the same reference surface, and read the Z work coordinate. If Z work coordinate reads -Δ (negative), the tool is shorter than the reference by Δ mm.
7. Enter the tool length offset: OFFSET → TOOL OFFSET → H(n) → enter the measured value.

**Method 2: Tool Presetter**
A tool presetter allows all tools to be measured outside the machine, using a fixed measurement device. Tool lengths measured on the presetter are entered directly into the tool offset table. This method is faster for shops that change tools frequently and have multiple identical machines.

**Method 3: On-Machine Tool Setting Probing (Optional)**
If the BC-500X is equipped with the optional on-machine tool setting probe (Part No. BC-OPT-TOOL-PROBE, Renishaw TS27R or equivalent), tool length and diameter can be measured automatically using a macro program. Contact BetaCorp Systems for the tool setting macro program and setup procedure.

### 6.8.2 Tool Radius Offset Setup

Tool radius offsets (D values) are used in conjunction with G41 (cutter compensation left) and G42 (cutter compensation right) to automatically offset the tool path by the tool radius.

**Entering Radius Offsets:**
1. Navigate to OFFSET → TOOL OFFSET.
2. Use the cursor to select the D offset number corresponding to the tool.
3. Enter the tool radius (in mm). For example, a 20 mm diameter end mill has a radius of 10.000 mm.
4. Enter the wear value in the adjacent column (start with 0.000; adjust after test cuts).

**Cutter Compensation Usage:**
Cutter compensation must be applied correctly to avoid gouging the workpiece. Key rules:
- Always ramp into cutter compensation: never start the cut with G41/G42 already active
- The approach move when G41/G42 is first commanded must be at least one tool radius in length
- Cancel cutter compensation (G40) before returning to the tool change position

### 6.8.3 Tool Life Management

The BC-500X includes a tool life management system that tracks how long each tool has been used and alerts the operator when the tool should be replaced.

**Tool Life Management Setup:**

For each tool, enter the following in the TOOL LIFE table (OFFSET → TOOL LIFE):

| Field | Description | Example |
|-------|-------------|---------|
| Tool No. | Tool number (1–24) | 5 |
| Life Type | COUNT (number of uses) or TIME (minutes) | TIME |
| Rated Life | Maximum life before alarm | 90 (minutes) |
| Used Life | Actual time used (auto-updated) | 47.3 (minutes) |
| Status | ACTIVE / EXPIRED / SPARE | ACTIVE |

When a tool's used life exceeds its rated life, the control will:
1. Display an alarm message: "TOOL (n) LIFE EXPIRED — REPLACE BEFORE NEXT USE"
2. If configured (Parameter B3.41), the machine will halt the program at the next tool change and wait for operator confirmation before proceeding with the expired tool or switching to a replacement tool.

**Replacement Tool Groups:**
Tools can be configured in replacement groups. For example, Tool 5 and Tool 15 might be identical tools (twin tool strategy). When Tool 5 expires, the control automatically uses Tool 15 as a replacement and updates Tool 5's status to "EXPIRED." When Tool 15 also expires, an alarm halts the machine.

---

## 6.9 Workpiece Setup and Fixture

### 6.9.1 Work Coordinate System Setup

The BC-500X supports 6 standard work coordinate systems (G54–G59) plus 48 extended work coordinate systems (G54.1 P1–P48). Each work coordinate system stores X, Y, and Z offset values that relate the machine coordinate system to the workpiece or fixture.

**Setting Work Coordinates — Manual Method:**

**Establishing X and Y Zero (Corner Method):**
1. Load a test indicator or edge finder in the spindle.
2. Jog the axis to touch the edge of the workpiece at the desired X0 Y0 point.
3. Read the X machine coordinate from the position display.
4. Navigate to OFFSET → WORK COORD → G54 (or desired G-code).
5. Move the cursor to the X field.
6. Type the machine X coordinate value and press INPUT.
7. Repeat for Y.

**Establishing X and Y Zero (Center Method):**
1. Touch off the left edge of the workpiece. Read X machine coordinate = X_LEFT.
2. Touch off the right edge. Read X machine coordinate = X_RIGHT.
3. X center machine coordinate = (X_LEFT + X_RIGHT) / 2.
4. Enter the X center coordinate in the G54 X field.
5. Repeat for Y.

**Establishing Z Zero:**
1. Load the reference tool (tool 1) in the spindle.
2. Jog Z down to touch the workpiece top surface. This may be done with a paper feeler or by very careful jogging at slow speed.
3. Read the Z machine coordinate.
4. Enter the Z machine coordinate in the G54 Z field.
5. Note: G54 Z represents "distance from machine Z home to Z=0 (workpiece surface)." The value will be negative (e.g., G54 Z = -350.245).

**Setting Work Coordinates — Using the MEASURE Function:**
The BC-500X control provides a MEASURE softkey that simplifies offset entry:
1. Jog to the reference point.
2. Press MEASURE softkey.
3. The control reads the current machine position and calculates the appropriate offset value automatically, including tool length compensation if a tool is active.

### 6.9.2 Part Probing (Optional)

If the BC-500X is equipped with the optional on-machine part probing system (Renishaw OMP40 or equivalent, Part No. BC-OPT-PART-PROBE), workpiece setup can be automated using macro programs supplied by BetaCorp Systems.

Standard probe cycles available:
- **O09000 — Single surface probe:** Finds one workpiece surface and sets a work coordinate automatically
- **O09001 — Rectangular boss:** Finds the center of a rectangular boss
- **O09002 — Rectangular pocket:** Finds the center of a rectangular pocket
- **O09003 — Circular boss:** Finds the center of a circular boss
- **O09004 — Circular pocket:** Finds the center of a circular pocket
- **O09005 — Corner find:** Finds the intersection of two surfaces (for workpiece corner zeroing)
- **O09006 — Web probe (Z):** Finds the top surface of the workpiece for Z-zero
- **O09007 — Angle probe:** Measures the angular orientation of a surface relative to the X-axis

Macro programs are stored in the CNC as protected programs (cannot be deleted or edited by operators). Contact BetaCorp Systems for macro program documentation.

---

## 6.10 Coolant System Operation

**Coolant Control:**

The coolant pump is controlled from the operator panel (COOLANT switch) and from the CNC program (M-codes).

**M-Code Coolant Control:**

| M-Code | Function |
|--------|---------|
| M08 | Coolant ON |
| M09 | Coolant OFF |
| M07 | Mist coolant ON (requires optional mist nozzle) |

**Coolant in Programs:**
Coolant should be activated with M08 at the beginning of each cutting operation and deactivated with M09 at the end. Most programs use M08 after the tool change (after the T and M06 blocks) and before the first cutting move.

**Coolant Flow Rate Adjustment:**
The coolant flow rate can be adjusted by partially closing individual nozzle ball valves. This allows different flow rates to different areas of the work zone. Do not restrict flow to less than 30% of full open on more than two nozzles simultaneously, as this may overheat the coolant pump (requires minimum 40% flow for cooling).

**Coolant Temperature Monitoring:**
The coolant system temperature is monitored by a Pt100 RTD in the coolant tank. Normal coolant operating temperature is 20–35°C. If coolant temperature exceeds 40°C:
- Fault E221 (Coolant Temperature High Warning) is set
- The machine continues to operate but alerts the operator
If coolant temperature exceeds 45°C:
- Fault E222 (Coolant Temperature High Shutdown) is set
- The machine halts the program and turns off the coolant pump

**Coolant Management:**
Refer to Chapter 12 for complete coolant management procedures, including concentration checking, pH testing, and bacteria testing.

---

## 6.11 Automatic Cycle Operation

### 6.11.1 Program Selection

1. Navigate to PROGRAM → LIBRARY.
2. Use the cursor to highlight the desired program number.
3. Press SELECT (softkey) to load the program into the active buffer.
4. The program number and first few lines will appear on the PROGRAM screen.
5. Press the REWIND softkey to ensure the cursor is at the first block of the program.

**Running from a Specific Line:**
To start execution from a specific block (not the beginning):
1. Scroll the cursor to the desired starting block.
2. Press CYCLE START — the program will begin from the highlighted block.
3. Warning: Starting from a point other than the beginning may cause incorrect machine state (wrong offsets, wrong spindle speed, wrong tool loaded). Always verify machine state carefully when performing a mid-program start.

### 6.11.2 Cycle Start and Feed Hold

**Cycle Start:**
1. Verify the machine is in AUTO mode (MODE SELECTOR).
2. Verify the correct program is loaded and the cursor is at the start.
3. Verify the work zone door is closed.
4. Press CYCLE START (green). The program will begin executing.
5. The CYCLE START indicator lamp will remain lit while the program is running.

**Feed Hold:**
Pressing FEED HOLD during automatic operation pauses axis motion but does NOT stop the spindle.
- All axis motion decelerates to a stop.
- The spindle continues to rotate at the commanded speed.
- The coolant pump continues to run.
- The FEED HOLD indicator lamp will light.

To resume after Feed Hold:
- Press CYCLE START to resume from the paused position.
- To abort instead of resuming: press RESET to cancel the program.

> **CAUTION:** After a Feed Hold during a cutting move, the tool remains in the workpiece. Before pressing CYCLE START to resume, verify the tool is not damaged and the workpiece is not overheated. If the pause was extended, the workpiece may have "cooled" the tool to the surface, potentially causing the tool to re-cut slightly aggressively on resume. Use single-block mode after an extended Feed Hold for the first few blocks.

### 6.11.3 Override Functions

**Feed Rate Override:**
The FEED RATE OVERRIDE potentiometer (0–150%) scales the programmed feed rate in real time. At 100% (mid position), the feed rate is exactly as programmed. Rotating clockwise increases feed rate; counter-clockwise decreases it.

| Override Setting | Effect |
|-----------------|--------|
| 0% | Axis motion stops (Feed Hold) |
| 50% | Feed rate at half programmed value |
| 100% | Feed rate at programmed value |
| 150% | Feed rate at 150% of programmed value |

> **NOTE:** The 0% feed rate override setting is equivalent to Feed Hold but does NOT light the Feed Hold indicator lamp. This can cause confusion. Use the FEED HOLD button for intentional pauses.

**Spindle Speed Override:**
The SPINDLE SPEED OVERRIDE potentiometer (50–150%) scales the programmed spindle speed in real time. Overrides below 50% or above 150% are not available.

**Rapid Override:**
The RAPID OVERRIDE rotary switch limits the maximum rapid traverse speed:
- 5%: Maximum 1,800 mm/min (X, Y); 1,500 mm/min (Z)
- 25%: Maximum 9,000 mm/min (X, Y); 7,500 mm/min (Z)
- 50%: Maximum 18,000 mm/min (X, Y); 15,000 mm/min (Z)
- 100%: Full rapid traverse speed (36,000 mm/min X, Y; 30,000 mm/min Z)

> **RECOMMENDED PRACTICE:** Always set the rapid override to 25% when running a new program for the first time. Switch to 100% only after the program has been verified as collision-free.

---

## 6.12 Machine Power-Off Sequence

The machine should be powered off in the following sequence to ensure safe shutdown:

**Step 1: Complete or Abort the Current Program**
If a machining program is running:
- Allow the program to complete (preferred), or
- Press FEED HOLD, then press RESET to abort.
- Ensure the spindle has stopped (speed = 0 on display).

**Step 2: Return Axes to Home Position**
Jog or home all axes to their home positions:
- Z-axis to home (Z=0, fully up)
- X-axis to home (X=0)
- Y-axis to home (Y=0)
This ensures the machine is in a known, safe state for the next power-on.

**Step 3: Remove the Workpiece (if applicable)**
If the workpiece is to be stored outside the machine while the machine is powered off, remove it and secure appropriately.

**Step 4: Turn Off Coolant**
Press the COOLANT switch to OFF. Allow the pump to run for 10 seconds to drain the distribution lines before turning off.

**Step 5: Turn Off Chip Conveyor**
Press the CHIP CONVEYOR switch to OFF.

**Step 6: Stop Hydraulic System**
Navigate to SYSTEM → HYDRAULICS → HPU STOP and press HPU STOP. The hydraulic pump will stop. The Z-axis brake will remain applied by spring force.

**Step 7: Turn Off CNC Control**
Press the POWER OFF button (red, main console). The CNC control will shut down in an orderly sequence:
- Saves current state (tool position, offsets) to non-volatile memory
- Displays "SYSTEM SHUTDOWN COMPLETE"

**Step 8: Turn Off Main Disconnect**
Turn the main electrical disconnect to the OFF position. This removes all power from the machine.

> **NOTE:** If the machine will be unattended for more than 8 hours, apply a padlock to the main disconnect in the OFF position. This prevents unauthorized operation.

---

## 6.13 Emergency Situations During Operation

**Situation: Tool Breakage**
1. Press FEED HOLD or E-STOP to halt the machine.
2. Wait for the spindle to stop completely.
3. Open the work zone door.
4. DO NOT reach into the work zone with bare hands. Use chip hooks to remove broken tool fragments.
5. Inspect the workpiece for damage.
6. Replace the tool. Inspect the spindle taper for damage from broken tool fragments.
7. If the spindle taper is damaged, contact BetaCorp Systems before resuming operation.

**Situation: Workpiece Loose or Shift During Machining**
1. Press E-STOP immediately.
2. Do not open the work zone door until the spindle has completely stopped.
3. Evaluate the situation through the window before opening the door.
4. Inspect for damage to the workpiece, tooling, and machine.
5. Secure the workpiece properly before any restart.

**Situation: Unusual Noise or Vibration**
1. Press FEED HOLD.
2. If the noise or vibration continues after Feed Hold: press E-STOP.
3. Investigate the cause before resuming.
4. Common causes: tool wear/breakage, loose fixture, incorrect spindle speed, coolant flow interruption.

**Situation: Coolant Leak onto Electrical Components**
1. Press E-STOP immediately.
2. Turn off the main disconnect.
3. Do NOT attempt to clean coolant from electrical components while the machine is energized.
4. Contact maintenance. The machine must be inspected and dried before re-energizing.

---

*End of Chapter 6 — Operation Manual*

---

# PART 6 — PARAMETER REFERENCE

---

# Chapter 7 — Parameter Reference

## 7.1 Introduction to BC-500X Parameters

The BC-500X uses a structured parameter system organized into nine groups (B1.xx through B9.xx). These parameters control all aspects of machine operation, from spindle speed limits to servo loop gains to safety interlock timers.

**Parameter Access Levels:**

| Level | Access Code | Description |
|-------|-------------|-------------|
| Level 0 (View) | None | View parameter values; cannot modify |
| Level 1 (Operator) | Default: 1111 | Modify non-critical parameters |
| Level 2 (Maintenance) | Provided to maintenance dept. | Modify maintenance and tuning parameters |
| Level 3 (Engineer) | Provided to service engineers only | Modify all parameters including safety limits |

**How to Access Parameters:**
1. Navigate to SYSTEM → PARAMETER.
2. Enter the access code when prompted.
3. Use the cursor to navigate to the parameter group and number.
4. Highlight the parameter and press MODIFY.
5. Enter the new value and press ENTER.
6. The new value is immediately active. Some parameters require a power cycle to take effect (these are marked with a [*] in the parameter name).

**Parameter Backup:**
Always back up all parameters before making any changes. Navigate to SYSTEM → PARAMETER → BACKUP → USB to save all parameters to a USB drive. The backup file is named: BC500X_[SERIAL]_PARAM_[DATE].par

**Parameter Groups Overview:**

| Group | Range | Function |
|-------|-------|---------|
| B1.xx | B1.01–B1.99 | Spindle parameters |
| B2.xx | B2.01–B2.99 | Axis motion parameters |
| B3.xx | B3.01–B3.99 | Tool changer parameters |
| B4.xx | B4.01–B4.49 | Hydraulic system parameters |
| B5.xx | B5.01–B5.49 | Coolant system parameters |
| B6.xx | B6.01–B6.49 | Encoder / feedback parameters |
| B7.xx | B7.01–B7.49 | Communication parameters |
| B8.xx | B8.01–B8.49 | Safety and interlock parameters |
| B9.xx | B9.01–B9.49 | Diagnostic and maintenance parameters |

---

## 7.2 Parameter Group B1.xx — Spindle Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B1.01 | Spindle Maximum Speed | 10000 | 100–10000 | RPM | Maximum allowable spindle speed. The CNC will clamp any S-code command above this value. Reduce this parameter if the machine is not equipped with a high-speed spindle option. |
| B1.02 | Spindle Minimum Speed | 50 | 1–500 | RPM | Minimum spindle speed. Commands below this value are clamped to this value. |
| B1.03 | Gear 1 Maximum Speed | 600 | 100–2000 | RPM | Maximum spindle speed allowed in Gear 1 (low gear). Spindle speeds above this value trigger an automatic gear change to Gear 2. |
| B1.04 | Gear 2 Minimum Speed | 50 | 1–1000 | RPM | Minimum spindle speed in Gear 2. Below this speed, Gear 1 is selected. |
| B1.05 | Gear Change Speed (from G1 to G2) | 550 | 100–1500 | RPM | Spindle speed at which the gear change from Gear 1 to Gear 2 is initiated. Must be less than B1.03. |
| B1.06 | Gear Change Speed (from G2 to G1) | 400 | 100–1000 | RPM | Spindle speed at which the gear change from Gear 2 to Gear 1 is initiated. Must be less than B1.05. |
| B1.07 | Gear Change Delay (stop) | 500 | 100–5000 | ms | Time to wait after spindle stops before actuating gear change solenoids. |
| B1.08 | Gear Change Delay (engage) | 800 | 200–5000 | ms | Time to wait after solenoid actuation before commanding spindle restart. |
| B1.09 | Gear Change Confirm Timeout | 3000 | 500–10000 | ms | Maximum time to wait for gear change confirmation sensor before setting fault E331. |
| B1.10 | Gear Change Auto Enable | 1 | 0–1 | — | 0 = Manual gear selection only (M41/M42 required in program). 1 = Automatic gear selection based on commanded speed. |
| B1.11 | Spindle Acceleration Time | 3.5 | 0.5–30.0 | seconds | Time to accelerate from 0 to maximum speed (B1.01). Actual acceleration time to any speed is scaled proportionally. |
| B1.12 | Spindle Deceleration Time (no brake) | 8.0 | 1.0–60.0 | seconds | Time to decelerate from maximum speed to 0 with no external brake. |
| B1.13 | Spindle Deceleration Time (with brake) | 4.0 | 0.5–30.0 | seconds | Time to decelerate from maximum speed to 0 when spindle brake is engaged. Only effective if B1.22 = 1. |
| B1.14 | Spindle Speed Window | 50 | 5–500 | RPM | The spindle is considered "at speed" when actual speed is within ±B1.14 RPM of commanded speed. M03/M04 will wait for "at speed" before the next block executes. |
| B1.15 | Spindle At-Speed Timeout | 10000 | 1000–30000 | ms | Maximum time to wait for spindle to reach "at speed" before setting fault E102. |
| B1.16 | Spindle Speed Monitor Enable | 1 | 0–1 | — | 0 = Speed monitoring disabled. 1 = Spindle fault E102 is triggered if speed deviates from command by more than B1.17. |
| B1.17 | Spindle Speed Deviation Limit | 200 | 50–1000 | RPM | Maximum allowable spindle speed deviation from commanded speed during steady-state operation. Fault E102 (Spindle Speed Deviation) is set if exceeded. |
| B1.18 | Spindle Orientation Speed | 200 | 50–500 | RPM | Speed used for spindle orientation (M19). Orientation must be performed at low speed for accuracy. |
| B1.19 | Spindle Orientation Angle | 0.0 | 0.0–359.9 | degrees | Target angle for spindle orientation (M19). 0.0 degrees is the spindle key at the standard ATC position. |
| B1.20 | Spindle Orientation Window | 0.5 | 0.1–5.0 | degrees | Orientation is considered complete when spindle angle is within ±B1.20 degrees of target. |
| B1.21 | Spindle Orientation Timeout | 5000 | 1000–15000 | ms | Maximum time for spindle to achieve orientation before fault E103. |
| B1.22 | Spindle Brake Enable | 1 | 0–1 | — | 0 = No electromagnetic spindle brake. 1 = Brake applied on deceleration after M05 or door open. Reduces spindle stop time. |
| B1.23 | Spindle Brake Engage Speed | 100 | 20–500 | RPM | Speed below which the spindle electromagnetic brake is applied during deceleration. Brake is not applied at higher speeds. |
| B1.24 | Spindle Brake Release Speed | 150 | 50–600 | RPM | Speed above which the spindle brake is released on acceleration. Must be greater than B1.23. |
| B1.25 | Spindle Brake Timeout | 3000 | 500–10000 | ms | Maximum time for spindle to stop after brake engagement. If spindle does not reach 0 RPM within this time, fault E104 (Spindle Brake Timeout) is set. |
| B1.26 | Spindle Load Monitor Enable | 1 | 0–1 | — | 0 = Spindle load monitoring disabled. 1 = Fault E105 is triggered if spindle load exceeds B1.27. |
| B1.27 | Spindle Overload Limit | 120 | 100–150 | % | Spindle load percentage above which fault E105 is triggered. Load is calculated from motor current. At 100% = rated continuous load (15 kW). |
| B1.28 | Spindle Overload Delay | 5000 | 500–30000 | ms | Spindle load must exceed B1.27 for this duration before E105 is triggered. Prevents false trips from short-duration load spikes. |
| B1.29 | Rigid Tapping Enable | 1 | 0–1 | — | 0 = Rigid tapping (G84 with spindle encoder synchronization) disabled. 1 = Enabled. |
| B1.30 | Rigid Tap Spindle Gain | 1.00 | 0.50–2.00 | — | Gain factor for spindle-to-Z-axis synchronization during rigid tapping. Increase if tapping pitch is slightly short; decrease if slightly long. |
| B1.31 | Rigid Tap Speed Ramp | 500 | 100–2000 | ms | Spindle acceleration time used during rigid tapping cycle. Faster ramp may cause synchronization errors at the tap bottom. |
| B1.32 | Rigid Tap Overshoot Limit | 2.0 | 0.5–10.0 | degrees | Maximum allowable spindle angle overshoot at tap bottom before fault E106. |
| B1.33 | Air Purge Enable | 1 | 0–1 | — | 0 = Spindle air purge disabled. 1 = Air purge active whenever spindle is running (blows air down through spindle bore to prevent chip intrusion). |
| B1.34 | Air Purge Delay (after stop) | 2000 | 0–10000 | ms | Time to continue air purge after spindle stop command. Helps clear chips during tool change. |
| B1.35 | Oil-Air Lube Interval | 10 | 5–60 | minutes | Interval between oil-air lubrication pulses for spindle bearings. Decrease for high-speed or high-temperature operation. |
| B1.36 | Oil-Air Lube Pulse Duration | 3 | 1–30 | seconds | Duration of each oil-air lubrication pulse. |
| B1.37 | Oil-Air Lube Pressure Min | 2.5 | 1.0–5.0 | bar | Minimum air pressure required for oil-air lubrication system. Below this pressure, fault E088 is set. |
| B1.38 | Spindle Encoder PPR | 4096 | 512–16384 | PPR | Spindle encoder pulses per revolution (pre-quadrature). Must match the installed encoder (Heidenhain ROD 420 = 4096). Changing this parameter requires BetaCorp authorization. [*] |
| B1.39 | Spindle Encoder Type | 1 | 0–1 | — | 0 = TTL single-ended. 1 = RS-422 differential (default for Heidenhain). [*] |
| B1.40 | Spindle Direction (CW=M03) | 0 | 0–1 | — | 0 = M03 commands clockwise rotation (standard). 1 = M03 commands counter-clockwise (reversed). Change only if spindle motor wiring is non-standard. [*] |
| B1.41 | Spindle Speed Display Filter | 50 | 10–500 | ms | Time constant for speed display filter. Higher value = smoother display but slower response. |
| B1.42 | Spindle Warm-Up Enable | 0 | 0–1 | — | 0 = No automatic warm-up. 1 = Spindle will automatically execute a warm-up cycle on first M03 command of the day. |
| B1.43 | Spindle Warm-Up Program | 9990 | 9000–9999 | — | Program number to execute for spindle warm-up. Default program O09990 is a 15-minute progressive warm-up cycle. |
| B1.44 | Spindle Temperature Alarm | 75 | 50–90 | °C | Spindle head temperature above which fault E107 (Spindle Temperature High) is set. |
| B1.45 | Lube Activate on Spindle | 1 | 0–1 | — | 0 = Way lube cycle runs regardless of spindle state. 1 = Way lube cycle only runs when spindle is active. |
| B1.50 | Spindle Drive Model | 5 | 1–9 | — | Internal code for spindle drive type. BC-500X standard = 5 (BetaCorp SD-SP-15K). Do not change. [*] |

---

## 7.3 Parameter Group B2.xx — Axis Motion Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B2.01 | X-Axis Position Loop Gain (Kp) | 80 | 10–300 | 1/s | X-axis position loop proportional gain. Higher values give tighter positioning but may cause oscillation if set too high. |
| B2.02 | X-Axis Velocity Loop Gain (Kv) | 150 | 10–500 | Hz | X-axis velocity loop bandwidth. Factory-tuned; do not change without BetaCorp guidance. |
| B2.03 | X-Axis Negative Software Limit | -1.0 | -50.0–0.0 | mm | Software travel limit in the negative X direction. Axis stops before reaching this position. |
| B2.04 | X-Axis Positive Software Limit | 750.0 | 700.0–760.0 | mm | Software travel limit in the positive X direction. |
| B2.05 | X-Axis Following Error Limit | 2.0 | 0.1–50.0 | mm | Maximum allowable position following error. If the servo cannot keep up and the error exceeds this value, fault E501 (X-Axis Following Error Limit) is set. |
| B2.06 | X-Axis Backlash Compensation | 0.0 | -1.0–1.0 | mm | Backlash compensation value for X-axis. The CNC adds or subtracts this value on axis reversals. Factory-set from measurement; do not modify without re-measuring. |
| B2.07 | X-Axis Homing Speed (Fast) | 2000 | 100–5000 | mm/min | Speed of X-axis approach to home switch. |
| B2.08 | X-Axis Homing Speed (Creep) | 100 | 10–500 | mm/min | Speed of X-axis creep to encoder index after home switch activation. |
| B2.09 | X-Axis Home Offset | 0.0 | -50.0–50.0 | mm | Distance from home switch activation to the machine zero position. Factory-set. |
| B2.10 | X-Axis Acceleration | 0.5 | 0.1–1.5 | g | Maximum X-axis acceleration/deceleration (in g). |
| B2.11 | Y-Axis Position Loop Gain (Kp) | 80 | 10–300 | 1/s | Y-axis position loop proportional gain. |
| B2.12 | Y-Axis Velocity Loop Gain (Kv) | 150 | 10–500 | Hz | Y-axis velocity loop bandwidth. |
| B2.13 | Y-Axis Negative Software Limit | -1.0 | -50.0–0.0 | mm | Software travel limit, negative Y direction. |
| B2.14 | Y-Axis Positive Software Limit | 500.0 | 450.0–510.0 | mm | Software travel limit, positive Y direction. |
| B2.15 | Y-Axis Following Error Limit | 2.0 | 0.1–50.0 | mm | Maximum allowable Y-axis following error before fault E511. |
| B2.16 | Y-Axis Backlash Compensation | 0.0 | -1.0–1.0 | mm | Backlash compensation for Y-axis. |
| B2.17 | Y-Axis Homing Speed (Fast) | 2000 | 100–5000 | mm/min | Y-axis fast homing speed. |
| B2.18 | Y-Axis Homing Speed (Creep) | 100 | 10–500 | mm/min | Y-axis creep speed to index. |
| B2.19 | Y-Axis Home Offset | 0.0 | -50.0–50.0 | mm | Y-axis home offset. Factory-set. |
| B2.20 | Y-Axis Acceleration | 0.5 | 0.1–1.5 | g | Maximum Y-axis acceleration. |
| B2.21 | Z-Axis Position Loop Gain (Kp) | 70 | 10–300 | 1/s | Z-axis position loop gain. Lower than X and Y due to higher Z-axis mass. |
| B2.22 | Z-Axis Velocity Loop Gain (Kv) | 120 | 10–500 | Hz | Z-axis velocity loop bandwidth. |
| B2.23 | Z-Axis Negative Software Limit | -550.0 | -560.0–-500.0 | mm | Software travel limit, negative Z direction (maximum Z-axis downward travel). |
| B2.24 | Z-Axis Positive Software Limit | 0.5 | 0.0–50.0 | mm | Software travel limit, positive Z direction (above home). |
| B2.25 | Z-Axis Following Error Limit | 3.0 | 0.1–50.0 | mm | Maximum allowable Z-axis following error before fault E521. Slightly larger than X and Y due to gravity loading. |
| B2.26 | Z-Axis Backlash Compensation | 0.0 | -2.0–2.0 | mm | Z-axis backlash compensation. For a vertically-oriented ballscrew with proper preload, this should be near zero. |
| B2.27 | Z-Axis Homing Speed (Fast) | 1500 | 100–3000 | mm/min | Z-axis fast homing speed. Lower than X and Y due to spindle head weight. |
| B2.28 | Z-Axis Homing Speed (Creep) | 100 | 10–500 | mm/min | Z-axis creep speed to index. |
| B2.29 | Z-Axis Home Offset | 0.0 | -50.0–50.0 | mm | Z-axis home offset. Factory-set. |
| B2.30 | Z-Axis Acceleration | 0.4 | 0.1–1.0 | g | Maximum Z-axis acceleration. Lower than X and Y due to higher effective mass. |
| B2.31 | Jerk Limit (S-curve) Enable | 1 | 0–1 | — | 0 = Trapezoidal acceleration profile. 1 = S-curve (jerk-limited) acceleration profile. S-curve reduces mechanical vibration but adds a small amount to positioning time. |
| B2.32 | Jerk Time Constant | 100 | 10–500 | ms | Time constant for S-curve acceleration smoothing. Higher values give smoother motion but slower acceleration onset. |
| B2.33 | Rapid Traverse X | 36000 | 1000–36000 | mm/min | Maximum X-axis rapid traverse speed (G00). |
| B2.34 | Rapid Traverse Y | 36000 | 1000–36000 | mm/min | Maximum Y-axis rapid traverse speed. |
| B2.35 | Rapid Traverse Z | 30000 | 1000–30000 | mm/min | Maximum Z-axis rapid traverse speed. Lower than X and Y due to axis weight. |
| B2.36 | Maximum Feed Rate (all axes) | 15000 | 100–15000 | mm/min | Maximum programmed feed rate. F-codes above this value are clamped. |
| B2.37 | Tool Change X Position | 0.0 | — | mm | Machine X coordinate for spindle during tool change. Set during ATC commissioning. |
| B2.38 | Tool Change Y Position | 0.0 | — | mm | Machine Y coordinate for spindle during tool change. |
| B2.39 | Tool Change Z Position (ATC) | -150.0 | — | mm | Machine Z coordinate at which the ATC arm can safely perform the tool exchange. |
| B2.40 | Servo Enable Delay | 200 | 50–2000 | ms | Time to wait after servo enable signal before commanding motion. Allows drive to build current before motion. |
| B2.41 | Position Loop Integral Gain (all axes) | 20 | 0–100 | — | Integral gain for position loop. Reduces steady-state position error under constant load (gravity on Z-axis). |
| B2.42 | Feed Forward Gain (all axes) | 95 | 0–100 | % | Velocity feed-forward gain. At 100%, the velocity command from the trajectory planner is passed directly to the velocity loop, minimizing following error at high feed rates. |
| B2.43 | Thermal Compensation Enable | 1 | 0–1 | — | 0 = Thermal compensation disabled. 1 = Thermal compensation active. Compensation data is in parameters B9.xx (read-only, updated by machine sensors). |
| B2.44 | Circular Interpolation Tolerance | 0.010 | 0.001–0.100 | mm | Maximum radial error allowed in circular interpolation (G02/G03). The CNC will generate an alarm if the commanded arc exceeds this tolerance. |
| B2.45 | In-Position Window | 0.005 | 0.001–0.050 | mm | Distance within which the axis is considered to be "in position." The machine waits for all commanded axes to be within B2.45 of the target position before executing the next block. |
| B2.46 | In-Position Dwell | 0 | 0–1000 | ms | Additional wait time after "in position" condition is achieved before executing the next block. Useful for very high accuracy applications where servo oscillation must fully damp. |
| B2.47 | Over-Travel Deceleration Rate | 5.0 | 1.0–10.0 | g | Deceleration rate applied when a hardware over-travel limit switch is triggered. Must be high enough to stop the axis before the mechanical hard stop. |
| B2.48 | Encoder Lost Dwell Timeout | 200 | 50–2000 | ms | Minimum duration of encoder signal loss (any axis) required to trigger axis encoder fault. Short pulses below this threshold are ignored. |
| B2.49 | Stall Detection Enable | 1 | 0–1 | — | 0 = Axis stall detection disabled. 1 = Fault E503 triggered if axis current exceeds threshold with no motion. |
| B2.50 | Stall Detection Current Threshold | 90 | 50–100 | % | Motor current level (% of rated) at which stall is suspected if axis velocity is below B2.51. |
| B2.51 | Stall Detection Velocity Threshold | 10 | 1–100 | mm/min | Axis velocity below which current monitoring indicates a potential stall condition. |

---

## 7.4 Parameter Group B3.xx — Tool Changer Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B3.01 | ATC Enable | 1 | 0–1 | — | 0 = ATC disabled (machine operates without tool changer). 1 = ATC enabled. |
| B3.02 | ATC Pot Count | 24 | 12–48 | — | Number of tool pots in the carousel. BC-500X standard = 24. |
| B3.03 | ATC Home Pot Number | 1 | 1–24 | — | Tool pot number that is at the tool change position when the carousel is at home. Factory-set. |
| B3.04 | ATC Arm Home Detect Input | 5 | 1–32 | — | PLC input number for ATC arm home position sensor (SEN-ATC-HOME). |
| B3.05 | ATC Arm 90 Detect Input | 6 | 1–32 | — | PLC input number for ATC arm 90° position sensor. |
| B3.06 | ATC Arm 180 Detect Input | 7 | 1–32 | — | PLC input number for ATC arm 180° position sensor. |
| B3.07 | ATC Arm Extend Detect Input | 8 | 1–32 | — | PLC input number for ATC arm extended position sensor. |
| B3.08 | ATC Arm Retract Detect Input | 9 | 1–32 | — | PLC input number for ATC arm retracted position sensor. |
| B3.09 | ATC Carousel Home Input | 10 | 1–32 | — | PLC input number for carousel home sensor. |
| B3.10 | ATC Arm Extend Timeout | 2000 | 500–10000 | ms | Maximum time allowed for ATC arm to reach the extended position before fault E301. |
| B3.11 | ATC Arm Rotate Timeout | 3000 | 500–10000 | ms | Maximum time allowed for ATC arm to complete 180° rotation before fault E302. |
| B3.12 | ATC Arm Retract Timeout | 2000 | 500–10000 | ms | Maximum time allowed for ATC arm to reach the retracted position before fault E303 (Tool Changer Timeout). This is the primary E303 trigger. |
| B3.13 | ATC Carousel Index Timeout | 15000 | 2000–60000 | ms | Maximum time allowed for carousel to reach any target pot position before fault E304. |
| B3.14 | ATC Carousel Short Path | 1 | 0–1 | — | 0 = Carousel always rotates in one direction. 1 = Carousel rotates in the shortest direction to reach the target pot. |
| B3.15 | ATC Spindle Orient Timeout | 5000 | 1000–15000 | ms | Timeout for spindle orientation (M19) before tool change, before fault E305. |
| B3.16 | ATC Z Retract Distance | 200.0 | 50.0–400.0 | mm | Distance the Z-axis moves upward from the current cutting position before initiating a tool change. |
| B3.17 | ATC Z Advance Speed | 3000 | 100–10000 | mm/min | Speed at which Z-axis moves to the ATC position (B2.39) for tool change. |
| B3.18 | ATC Tool Unclamp Delay | 300 | 100–2000 | ms | Time between hydraulic unclamp command and ATC arm grab move. Ensures tool is fully unclamped before the arm attempts to remove it. |
| B3.19 | ATC Tool Clamp Delay | 400 | 100–2000 | ms | Time between ATC arm retract (inserting tool) and hydraulic clamp command. Ensures tool is fully inserted before clamping. |
| B3.20 | ATC Clamp Confirm Timeout | 1000 | 200–5000 | ms | Time to wait for tool-clamped confirmation sensor after clamping. If not confirmed, fault E306. |
| B3.21 | ATC Air Blow Time | 1000 | 200–5000 | ms | Duration of spindle air blast during tool exchange (to clear chips from spindle taper). |
| B3.22 | ATC Retry on Fault | 0 | 0–3 | — | Number of automatic retry attempts if an ATC fault occurs. 0 = no retry (halt on fault); 1–3 = number of retries before halting. |
| B3.23 | Random Access Mode | 1 | 0–1 | — | 0 = Fixed pot assignment (T1 always in pot 1). 1 = Random access (control tracks which tool is in which pot). |
| B3.24 | Tool Presence Check Enable | 1 | 0–1 | — | 0 = No tool presence check. 1 = Fault E307 if a T-code is selected for a pot that the presence sensor reads as empty. |
| B3.25 | Max Tool Weight | 8.0 | 1.0–12.0 | kg | Maximum allowed tool weight. Parameter is informational; machine does not directly measure tool weight. |
| B3.26 | ATC Lube Cycle Enable | 1 | 0–1 | — | 0 = No automatic ATC lubrication. 1 = ATC arm cam and carousel gear lubricated on schedule. |
| B3.27 | ATC Lube Interval | 500 | 50–5000 | tool changes | Number of tool changes between ATC lubrication cycles. |
| B3.28 | ATC Lube Quantity | 3 | 1–10 | pulses | Number of grease pump pulses per ATC lubrication cycle. |
| B3.30 | Tool Life Management Enable | 1 | 0–1 | — | 0 = Tool life management disabled. 1 = Tool life tracking and alarm active. |
| B3.31 | Tool Life Alarm Action | 1 | 0–2 | — | 0 = Display alarm only, continue. 1 = Halt at next tool change, require operator confirmation. 2 = Halt immediately on life expiry. |
| B3.32 | Tool Broken Detect Enable | 0 | 0–1 | — | 0 = Tool breakage detection disabled. 1 = Macro O09100 runs after each tool change to verify new tool length (requires on-machine probe). |
| B3.40 | Spare Tool (Twin Tool) Enable | 0 | 0–1 | — | 0 = No spare tool function. 1 = Spare tool (twin) switching enabled. |
| B3.41 | Spare Tool Start Pot | 13 | 1–24 | — | Pot number of the first spare tool. Spare tools occupy pots B3.41 through B3.41+(B3.02/2-1). |

---

## 7.5 Parameter Group B4.xx — Hydraulic System Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B4.01 | HPU Auto Start | 1 | 0–1 | — | 0 = HPU starts only on manual command. 1 = HPU starts automatically when machine power is on. |
| B4.02 | HPU Pressure Min Alarm | 120 | 50–200 | bar | Hydraulic pressure below which fault E404 (Hydraulic Pressure Low) is triggered. This is a safety-critical parameter. |
| B4.03 | HPU Pressure Min Shutdown | 80 | 30–150 | bar | Hydraulic pressure below which the machine performs an emergency stop. Must be less than B4.02. |
| B4.04 | HPU Pressure Monitor Delay | 5000 | 1000–30000 | ms | Time delay after HPU start before pressure monitoring becomes active. Allows system to pressurize. |
| B4.05 | HPU Temperature Max Alarm | 65 | 40–80 | °C | Hydraulic oil temperature above which fault E411 (Hydraulic Temperature High Warning) is triggered. |
| B4.06 | HPU Temperature Max Shutdown | 70 | 50–90 | °C | Hydraulic oil temperature above which the machine halts operations. Must be greater than B4.05. |
| B4.07 | HPU Level Min Alarm | 1 | 0–1 | — | 0 = Hydraulic level monitoring disabled. 1 = Fault E412 (Hydraulic Level Low) triggered when HPU level switch opens. |
| B4.08 | HPU Filter Bypass Alarm | 1 | 0–1 | — | 0 = Filter bypass alarm disabled. 1 = Fault E413 (Hydraulic Filter Bypass) triggered when filter bypass indicator switch closes. |
| B4.09 | Z-Brake Release Pressure | 100 | 50–180 | bar | Minimum hydraulic pressure required to confirm Z-axis brake is released. |
| B4.10 | Z-Brake Release Timeout | 2000 | 500–10000 | ms | Maximum time for Z-axis brake to release (pressure switch to close) before fault E414. |
| B4.11 | Z-Brake Apply Timeout | 2000 | 500–10000 | ms | Maximum time for Z-axis brake to apply (spring applies when SOL-HYD-01 de-energizes) before fault E415. |
| B4.12 | Tool Unclamp Pressure | 150 | 100–200 | bar | Hydraulic pressure setpoint for tool unclamp circuit. Adjust if tool release is incomplete or excessive. |
| B4.13 | Tool Unclamp Time | 500 | 200–3000 | ms | Duration hydraulic unclamp pressure is applied before the draw bar is considered fully extended. |
| B4.14 | Tool Clamp Confirm Timeout | 1000 | 200–5000 | ms | Time allowed after removal of unclamp signal for tool-clamped sensor to confirm. |
| B4.15 | ATC Arm Hydraulic Speed | 5 | 1–10 | — | Flow control valve setting for ATC arm hydraulic actuator speed. 1 = slowest, 10 = fastest. Factory-set. |
| B4.16 | Gear Change Pressure | 80 | 50–120 | bar | Hydraulic pressure for gear change actuator. Adjust if gear changes are incomplete or too forceful. |
| B4.17 | HPU Cooling Fan Auto | 1 | 0–1 | — | 0 = HPU cooling fan runs continuously when HPU is on. 1 = Fan controlled by thermostat (starts at B4.05 - 10°C). |
| B4.18 | HPU Standby Enable | 0 | 0–1 | — | 0 = HPU runs continuously when on. 1 = HPU pump stops after B4.19 minutes of no hydraulic demand. Pump restarts automatically when needed. |
| B4.19 | HPU Standby Delay | 10 | 1–60 | minutes | Time with no hydraulic demand before HPU enters standby (if B4.18 = 1). |
| B4.20 | Hydraulic Oil Change Interval | 4000 | 1000–8000 | hours | Planned hydraulic oil change interval (for maintenance scheduling). When machine hours exceed this value since last oil change, fault E416 (Hydraulic Oil Change Due) is set. |
| B4.21 | HPU Filter Change Interval | 1000 | 200–2000 | hours | Planned hydraulic filter change interval. Fault E417 (Hydraulic Filter Change Due) is set when exceeded. |

---

## 7.6 Parameter Group B5.xx — Coolant System Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B5.01 | Coolant Pump Auto Start | 0 | 0–1 | — | 0 = Coolant pump starts only on M08 or manual switch. 1 = Coolant pump starts when machine power is on. |
| B5.02 | Coolant Level Min Alarm | 1 | 0–1 | — | 0 = Coolant level monitoring disabled. 1 = Fault E202 (Coolant Level Below Minimum) triggered when level switch opens. |
| B5.03 | Coolant Level Min Delay | 30 | 5–300 | seconds | Coolant level must be low for this duration before E202 is triggered. Prevents false alarms from coolant sloshing. |
| B5.04 | Coolant Level Halt | 0 | 0–1 | — | 0 = E202 displays alarm but machine continues. 1 = E202 causes immediate machine halt. |
| B5.05 | Coolant Temperature Max Alarm | 40 | 30–60 | °C | Coolant temperature above which fault E221 (Coolant Temperature High Warning) is set. |
| B5.06 | Coolant Temperature Max Halt | 45 | 35–70 | °C | Coolant temperature above which fault E222 (Coolant Temperature High Shutdown) halts the machine. |
| B5.07 | Coolant Pump Overload Delay | 5000 | 1000–30000 | ms | Duration of coolant pump overload current before fault E223 (Coolant Pump Overload) is set. |
| B5.08 | Coolant Delay After Spindle | 2000 | 0–30000 | ms | Time coolant runs after spindle stop command (M05) before coolant also stops. Helps clear chips from work zone. |
| B5.09 | TSC Enable | 0 | 0–1 | — | 0 = Through-spindle coolant disabled. 1 = TSC option enabled. Requires BC-OPT-TSC hardware. |
| B5.10 | TSC Pressure Setpoint | 70 | 20–100 | bar | Target pressure for through-spindle coolant pump. |
| B5.11 | TSC Pressure Min Alarm | 40 | 10–80 | bar | TSC pressure below which fault E224 (TSC Pressure Low) is triggered. |
| B5.12 | TSC Flow Check Enable | 0 | 0–1 | — | 0 = TSC flow not monitored. 1 = Fault E225 (TSC No Flow) if flow sensor indicates no TSC flow. |
| B5.13 | Coolant Concentration Target | 8.0 | 3.0–15.0 | % | Target coolant concentration (informational; used by maintenance reminder). |
| B5.14 | Coolant pH Min | 8.5 | 7.0–9.0 | — | Minimum acceptable coolant pH (informational; maintenance reminder). |
| B5.15 | Coolant pH Max | 9.5 | 8.5–11.0 | — | Maximum acceptable coolant pH (informational; maintenance reminder). |
| B5.16 | Coolant Change Interval | 720 | 100–8760 | hours | Planned coolant change interval in machine operating hours. Fault E226 (Coolant Change Due) when exceeded. |
| B5.17 | Coolant Tank Cleaning Interval | 2160 | 720–8760 | hours | Planned coolant tank cleaning interval. Fault E227 (Coolant Tank Cleaning Due) when exceeded. |
| B5.20 | Chip Conveyor Auto Enable | 1 | 0–1 | — | 0 = Chip conveyor starts only on manual switch. 1 = Chip conveyor starts automatically with coolant pump. |
| B5.21 | Chip Conveyor Speed | 50 | 10–100 | % | Chip conveyor belt speed as a percentage of maximum (via VFD). |
| B5.22 | Chip Conveyor Interval Enable | 0 | 0–1 | — | 0 = Chip conveyor runs continuously when enabled. 1 = Chip conveyor runs in intermittent mode (B5.23 on / B5.24 off). |
| B5.23 | Chip Conveyor On Time | 30 | 5–300 | seconds | Duration conveyor runs during intermittent mode. |
| B5.24 | Chip Conveyor Off Time | 60 | 10–600 | seconds | Duration conveyor is off during intermittent mode. |

---

## 7.7 Parameter Group B6.xx — Encoder/Feedback Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B6.01 | X-Axis Encoder PPR | 2500 | 100–10000 | PPR | X-axis encoder pulses per revolution (pre-quadrature). Heidenhain ERN 1381 = 2500. [*] |
| B6.02 | X-Axis Encoder Quadrature Enable | 1 | 0–1 | — | 0 = Encoder counts at 1× (PPR). 1 = Encoder counts at 4× (PPR × 4 = 10000 counts/rev). [*] |
| B6.03 | X-Axis Encoder Type | 1 | 0–1 | — | 0 = TTL single-ended. 1 = RS-422 differential. [*] |
| B6.04 | X-Axis Encoder Direction | 0 | 0–1 | — | 0 = Standard direction. 1 = Inverted. Change if axis moves in wrong direction during homing. [*] |
| B6.05 | X-Axis Encoder Signal Monitor | 1 | 0–1 | — | 0 = Encoder signal quality not monitored. 1 = Signal quality monitored; fault E501 if signal degrades. |
| B6.06 | X-Axis Ballscrew Pitch | 10.000 | 5.000–25.000 | mm/rev | Ballscrew pitch (linear distance per revolution). X-axis = 10 mm/rev. [*] |
| B6.07 | X-Axis Pulses per mm | 1000.000 | — | cts/mm | Calculated: (B6.01 × 4 × B6.02) / B6.06. Read-only display. |
| B6.08 | X-Axis Pitch Error Comp Enable | 1 | 0–1 | — | 0 = No pitch error compensation. 1 = Pitch error compensation table active. Compensation data loaded at commissioning. |
| B6.11 | Y-Axis Encoder PPR | 2500 | 100–10000 | PPR | Y-axis encoder PPR. [*] |
| B6.12 | Y-Axis Encoder Quadrature Enable | 1 | 0–1 | — | Y-axis quadrature enable. [*] |
| B6.13 | Y-Axis Encoder Type | 1 | 0–1 | — | Y-axis encoder type. [*] |
| B6.14 | Y-Axis Encoder Direction | 0 | 0–1 | — | Y-axis encoder direction. [*] |
| B6.15 | Y-Axis Encoder Signal Monitor | 1 | 0–1 | — | Y-axis signal quality monitoring enable. |
| B6.16 | Y-Axis Ballscrew Pitch | 10.000 | 5.000–25.000 | mm/rev | Y-axis ballscrew pitch. [*] |
| B6.18 | Y-Axis Pitch Error Comp Enable | 1 | 0–1 | — | Y-axis pitch error compensation enable. |
| B6.21 | Z-Axis Encoder PPR | 2500 | 100–10000 | PPR | Z-axis encoder PPR. [*] |
| B6.22 | Z-Axis Encoder Quadrature Enable | 1 | 0–1 | — | Z-axis quadrature enable. [*] |
| B6.23 | Z-Axis Encoder Type | 1 | 0–1 | — | Z-axis encoder type. [*] |
| B6.24 | Z-Axis Encoder Direction | 0 | 0–1 | — | Z-axis encoder direction. [*] |
| B6.25 | Z-Axis Encoder Signal Monitor | 1 | 0–1 | — | Z-axis signal quality monitoring enable. |
| B6.26 | Z-Axis Ballscrew Pitch | 10.000 | 5.000–25.000 | mm/rev | Z-axis ballscrew pitch. [*] |
| B6.28 | Z-Axis Pitch Error Comp Enable | 1 | 0–1 | — | Z-axis pitch error compensation enable. |
| B6.31 | Spindle Encoder PPR | 4096 | 512–16384 | PPR | Spindle encoder PPR. See B1.38. [*] |
| B6.32 | Spindle Encoder Quadrature Enable | 1 | 0–1 | — | Spindle encoder quadrature. [*] |
| B6.33 | Spindle Encoder Type | 1 | 0–1 | — | Spindle encoder differential type. [*] |
| B6.34 | Spindle Encoder Direction | 0 | 0–1 | — | Spindle encoder direction. [*] |
| B6.35 | Spindle Encoder Index Enable | 1 | 0–1 | — | 0 = Spindle index pulse ignored. 1 = Index pulse used for orientation and rigid tap. [*] |
| B6.36 | Encoder Power Supply Voltage | 5.0 | 5.0–5.0 | VDC | Encoder supply voltage. Fixed at 5.0 VDC; do not modify. [*] |
| B6.37 | Encoder Low Signal Threshold | 0.8 | 0.5–2.0 | V | Signal amplitude below which encoder signal quality is considered poor. Fault E130 (Encoder Signal Low) when exceeded. |
| B6.38 | Encoder Cable Length Max | 10.0 | 1.0–30.0 | m | Maximum encoder cable length. Longer cables may require active repeaters. |
| B6.40 | Linear Scale Option Enable | 0 | 0–1 | — | 0 = Rotary encoder only (standard). 1 = Linear glass scale feedback used (optional full-closed-loop). [*] |

---

## 7.8 Parameter Group B7.xx — Communication Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B7.01 | Ethernet Enable | 1 | 0–1 | — | 0 = Ethernet port disabled. 1 = Ethernet port active. |
| B7.02 | IP Address Mode | 0 | 0–1 | — | 0 = Static IP address (set in B7.03–B7.06). 1 = DHCP (IP assigned by network). |
| B7.03 | IP Address Octet 1 | 192 | 0–255 | — | First octet of static IP address. |
| B7.04 | IP Address Octet 2 | 168 | 0–255 | — | Second octet of static IP address. |
| B7.05 | IP Address Octet 3 | 1 | 0–255 | — | Third octet of static IP address. |
| B7.06 | IP Address Octet 4 | 100 | 1–254 | — | Fourth octet of static IP address. |
| B7.07 | Subnet Mask Octet 3 | 255 | 0–255 | — | Third octet of subnet mask (first two octets are 255). |
| B7.08 | Subnet Mask Octet 4 | 0 | 0–255 | — | Fourth octet of subnet mask. |
| B7.09 | Default Gateway Octet 4 | 1 | 1–254 | — | Fourth octet of default gateway (first three octets match IP address). |
| B7.10 | DNC Port Number | 4001 | 1024–65535 | — | TCP port number for DNC communication. |
| B7.11 | DNC Protocol | 0 | 0–2 | — | 0 = Raw TCP. 1 = FTP. 2 = BetaCorp DNC protocol. |
| B7.12 | DNC Baud Rate (RS232 fallback) | 9600 | 300–115200 | bps | RS-232 baud rate for DNC communication (if Ethernet not available). |
| B7.13 | USB Enable | 1 | 0–1 | — | 0 = USB port disabled. 1 = USB port active. |
| B7.14 | USB Transfer Mode | 0 | 0–1 | — | 0 = Manual transfer (operator initiates). 1 = Auto-load (USB inserted → selected program auto-loads). |
| B7.15 | Machine ID | 0 | 0–9999 | — | Machine identification number for network identification. Set to machine number in multi-machine DNC systems. |
| B7.16 | Remote Monitor Enable | 0 | 0–1 | — | 0 = Remote monitoring disabled. 1 = BetaCorp Connect remote monitoring active (requires internet connection). |

---

## 7.9 Parameter Group B8.xx — Safety and Interlock Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B8.01 | Door Interlock Mode | 2 | 0–2 | — | 0 = Door open allows full operation (no interlock — NOT recommended). 1 = Door open halts spindle and rapid traverse. 2 = Door open halts spindle; limits feed to B8.03 (standard safe mode). |
| B8.02 | Door Open Jog Enable | 1 | 0–1 | — | 0 = No axis motion with door open. 1 = Jog motion allowed with door open at limited speed (B8.03). |
| B8.03 | Door Open Max Speed | 1000 | 100–3000 | mm/min | Maximum axis speed allowed with work zone door open. |
| B8.04 | E-Stop Safety Relay Channel | 2 | 1–2 | — | Number of safety relay channels used for E-Stop circuit. 2 = Dual-channel (required for safety integrity). Do not change. [*] |
| B8.05 | Over-Travel Relay Action | 1 | 0–1 | — | 0 = Software only; hardware limit switch disables that axis only. 1 = Hardware limit switch triggers E-Stop on all axes (standard). |
| B8.06 | Spindle Start in Auto | 1 | 0–1 | — | 0 = Spindle does not start automatically in Auto mode (operator must press spindle start). 1 = Spindle starts automatically per M03/M04 commands (standard). |
| B8.07 | Spindle Max Speed Override Limit | 150 | 100–150 | % | Maximum spindle speed override allowed from the operator panel. 150% is the hardware maximum. |
| B8.08 | Feed Rate Max Override Limit | 150 | 100–200 | % | Maximum feed rate override allowed from the operator panel. |
| B8.09 | ATC Arm Clear Height | -150.0 | — | mm (machine Z) | Minimum Z machine coordinate required before ATC arm can move. If Z is below this value when a tool change is commanded, Z retracts to this position first. |
| B8.10 | Fixture Clamp Interlock | 0 | 0–1 | — | 0 = No fixture clamp interlock. 1 = Spindle will not start if fixture clamp input (B8.11) is not confirmed. |
| B8.11 | Fixture Clamp Input | 0 | 0–32 | — | PLC input number for fixture clamp confirmation signal. 0 = not assigned. |
| B8.12 | Safety Reset Required After E-Stop | 1 | 0–1 | — | 0 = Machine can restart immediately after E-Stop is released. 1 = Operator must press RESET button after releasing E-Stop (standard). |
| B8.13 | Power Failure Recovery Mode | 0 | 0–1 | — | 0 = Machine requires manual restart after power failure. 1 = Machine automatically resumes after power restoration (requires careful setup; NOT recommended for production). |
| B8.14 | Safety PLC Watchdog Enable | 1 | 0–1 | — | 0 = Safety PLC watchdog disabled. 1 = Safety PLC watchdog enabled; machine faults if PLC communication is lost. Do not disable. [*] |
| B8.15 | Safety PLC Watchdog Timeout | 500 | 100–5000 | ms | Duration of PLC communication loss before safety watchdog fault E801. |
| B8.20 | Axis Torque Limit (X) | 200 | 100–300 | % | X-axis maximum torque as percentage of rated motor torque. Increase for heavy cutting; decrease for soft material protection. |
| B8.21 | Axis Torque Limit (Y) | 200 | 100–300 | % | Y-axis maximum torque limit. |
| B8.22 | Axis Torque Limit (Z) | 250 | 100–350 | % | Z-axis maximum torque limit. Higher than X and Y to overcome gravity. |
| B8.30 | Collision Detect Enable | 0 | 0–1 | — | 0 = Collision detection disabled. 1 = Rapid unexpected torque increase triggers collision fault E540. |
| B8.31 | Collision Detect Threshold | 300 | 150–500 | % | Torque spike threshold for collision detection. |
| B8.32 | Collision Detect Dwell | 20 | 5–100 | ms | Duration of torque spike above threshold before collision is declared. |

---

## 7.10 Parameter Group B9.xx — Diagnostic Parameters

| Param | Name | Default | Range | Unit | Description |
|-------|------|---------|-------|------|-------------|
| B9.01 | Machine Hours Total | — | Read-only | hours | Total machine operating hours since manufacture. |
| B9.02 | Machine Hours This Session | — | Read-only | hours | Machine hours since last power-on. |
| B9.03 | Spindle Hours Total | — | Read-only | hours | Total spindle running time. |
| B9.04 | Tool Changes Total | — | Read-only | count | Total number of tool changes performed. |
| B9.05 | E-Stop Events Total | — | Read-only | count | Total number of E-Stop events recorded. |
| B9.06 | Fault Count Total | — | Read-only | count | Total number of fault events recorded. |
| B9.10 | Fault Log Size | 1000 | 100–5000 | entries | Maximum number of fault log entries. Oldest entries overwritten when full. |
| B9.11 | Fault Log Auto Clear | 0 | 0–1 | — | 0 = Fault log must be cleared manually. 1 = Fault log automatically cleared on power cycle (not recommended). |
| B9.12 | Diagnostic Screen Update Rate | 100 | 50–1000 | ms | Update rate for the diagnostic screen displays. |
| B9.20 | Way Lube Interval | 30 | 5–120 | minutes | Interval between centralized way lube pump cycles. |
| B9.21 | Way Lube Pump Time | 15 | 5–60 | seconds | Duration of each way lube pump cycle. |
| B9.22 | Way Lube Hours Since Last Oil | — | Read-only | hours | Hours since the way lube oil was last added (reset manually at SYSTEM → MAINT → WAY LUBE RESET). |
| B9.23 | Hydraulic Oil Hours | — | Read-only | hours | Hours since last hydraulic oil change (reset at SYSTEM → MAINT → HYD OIL RESET). |
| B9.24 | Coolant Hours | — | Read-only | hours | Hours since last coolant change (reset at SYSTEM → MAINT → COOLANT RESET). |
| B9.25 | Spindle Bearing Hours | — | Read-only | hours | Spindle hours since last bearing inspection (reset at SYSTEM → MAINT → BEARING RESET). |
| B9.30 | Thermal Compensation X Coefficient | — | Read-only | μm/°C | X-axis thermal compensation coefficient. Set at commissioning; updated by machine learning algorithm if B9.35 = 1. |
| B9.31 | Thermal Compensation Y Coefficient | — | Read-only | μm/°C | Y-axis thermal compensation coefficient. |
| B9.32 | Thermal Compensation Z Coefficient | — | Read-only | μm/°C | Z-axis thermal compensation coefficient. |
| B9.33 | Thermal Sensor 1 (Spindle head) | — | Read-only | °C | Current reading from spindle head thermal sensor. |
| B9.34 | Thermal Sensor 2 (Column) | — | Read-only | °C | Current reading from column thermal sensor. |
| B9.35 | Adaptive Thermal Comp Enable | 0 | 0–1 | — | 0 = Fixed thermal compensation coefficients. 1 = Machine learning mode (requires probing cycles to adapt coefficients). |
| B9.40 | Debug Output Enable | 0 | 0–1 | — | 0 = Normal operation. 1 = Verbose debug output to serial port (BetaCorp service use only). |
| B9.41 | Test Mode Enable | 0 | 0–1 | — | 0 = Normal operation. 1 = Test mode active (certain safety interlocks may be temporarily modified). BetaCorp authorized use only. [*] |
| B9.42 | Firmware Version | — | Read-only | — | Current CNC firmware version string. |
| B9.43 | PLC Version | — | Read-only | — | Current PLC firmware version string. |
| B9.44 | HMI Version | — | Read-only | — | Current HMI software version. |
| B9.45 | Control Serial Number | — | Read-only | — | CNC control unit serial number. |
| B9.46 | Machine Serial Number | — | Read-only | — | Machine serial number (entered at factory during commissioning). |
| B9.47 | Last Calibration Date | — | Read-only | — | Date of last machine calibration (laser interferometer). |
| B9.48 | Next Maintenance Due | — | Read-only | hours | Machine hours remaining until next scheduled maintenance event. |
| B9.49 | Service Password Level | — | — | — | Current active service password level (0–3). Automatically resets to 0 after 30 minutes of inactivity. |

---

*End of Chapter 7 — Parameter Reference*


---

# PART 7 — FAULT CODES AND TROUBLESHOOTING

---

# Chapter 8 — Fault Codes and Troubleshooting

## 8.1 Fault System Overview

The BC-500X fault system continuously monitors all machine systems and immediately detects conditions outside normal operating parameters. When a fault is detected:

1. The fault is recorded in the fault log with a timestamp, fault code, and fault description.
2. The appropriate machine response is executed (warning only, controlled stop, or emergency stop) depending on the fault severity.
3. The fault code and short description are displayed on the main CNC screen status bar.
4. If Parameter B7.16 = 1 (BetaCorp Connect enabled), the fault is transmitted to the BetaCorp remote monitoring system.

**Fault Severity Levels:**

| Level | Color | Machine Response |
|-------|-------|-----------------|
| INFO | White | Message displayed; no action required |
| WARNING | Yellow | Alert displayed; machine continues operation |
| FAULT | Orange | Machine completes current block and stops; program paused |
| ALARM | Red | Machine halts immediately; spindle stops; program aborted |
| EMERGENCY | Red flashing | Immediate E-Stop equivalent; all drives disabled |

**Fault Code Numbering:**

BC-500X fault codes use the prefix "E" followed by a three-digit number. Codes are grouped by system:

| Range | System |
|-------|--------|
| E001–E099 | Critical system faults |
| E100–E199 | Encoder and feedback faults |
| E200–E299 | Coolant system faults |
| E300–E399 | Tool changer faults |
| E400–E499 | Hydraulic system faults |
| E500–E599 | Axis servo system faults |
| E600–E699 | Communication and I/O faults |
| E700–E799 | PLC and logic faults |
| E800–E899 | Thermal and environmental faults |
| E900–E999 | System configuration faults |

**Fault Resolution Protocol:**
For each fault, the operator or technician should:
1. Read the full fault description on the CNC display (press DETAIL or F1 when the fault is highlighted)
2. Refer to Chapter 8 for the specific fault code procedure
3. Identify and correct the root cause
4. Press RESET to clear the fault after correction
5. Log the fault, cause, and corrective action in the maintenance log

---

## 8.2 Fault Log Access and Management

**Accessing the Fault Log:**
Navigate to SYSTEM → FAULT LOG. The fault log displays the most recent 1,000 fault events (configurable, Parameter B9.10).

**Fault Log Entry Fields:**

| Field | Description |
|-------|-------------|
| Timestamp | Date and time of fault occurrence |
| Fault Code | E-code (e.g., E404) |
| Description | Short fault description (up to 40 characters) |
| Severity | INFO / WARNING / FAULT / ALARM / EMERGENCY |
| Duration | Time fault was active before reset |
| Reset Method | How fault was cleared (Auto / Manual / Power Cycle) |
| Machine State | Machine operating mode at time of fault |

**Exporting Fault Log:**
The fault log can be exported to a USB drive in CSV format: FAULT LOG → EXPORT → USB → ENTER.

**Filtering Fault Log:**
The fault log can be filtered by:
- Date range
- Fault code range
- Severity level
- System (encoder, coolant, ATC, hydraulic, servo, etc.)

---

## 8.3 Fault Code Reference Table — Quick Index

| Code | Name | Severity | System |
|------|------|----------|--------|
| E001 | System Watchdog Fault | EMERGENCY | System |
| E002 | Power Supply 24V Low | ALARM | Power |
| E003 | Safety Relay Fault | EMERGENCY | Safety |
| E004 | Dual-Channel Mismatch | EMERGENCY | Safety |
| E005 | CNC to PLC Comm Lost | ALARM | Comms |
| E006 | Parameter Checksum Error | ALARM | System |
| E007 | Parameter Out of Range | FAULT | System |
| E008 | Non-Volatile Memory Fault | ALARM | System |
| E009 | Control Startup Timeout | ALARM | System |
| E010 | Fan Failure — Control Cabinet | WARNING | Thermal |
| E011 | UPS Battery Low | WARNING | Power |
| E012 | System Clock Battery Low | WARNING | Power |
| E020 | E-Stop Active | INFO | Safety |
| E021 | Door Open Interlock | INFO | Safety |
| E022 | Over-Travel Positive X | ALARM | Safety |
| E023 | Over-Travel Negative X | ALARM | Safety |
| E024 | Over-Travel Positive Y | ALARM | Safety |
| E025 | Over-Travel Negative Y | ALARM | Safety |
| E026 | Over-Travel Positive Z | ALARM | Safety |
| E027 | Over-Travel Negative Z | ALARM | Safety |
| E030 | Axis Not Homed (X) | FAULT | System |
| E031 | Axis Not Homed (Y) | FAULT | System |
| E032 | Axis Not Homed (Z) | FAULT | System |
| E040 | Program Not Found | FAULT | Program |
| E041 | Program Syntax Error | FAULT | Program |
| E042 | Tool Number Invalid | FAULT | Program |
| E043 | Work Offset Not Set | WARNING | Program |
| E050 | Fixture Clamp Not Confirmed | FAULT | Safety |
| E088 | Way Lube Level Low | WARNING | Lube |
| E089 | Way Lube Level Critical — Halt | ALARM | Lube |
| E090 | Oil-Air Lube Level Low | WARNING | Lube |
| E091 | Oil-Air Lube Pressure Low | FAULT | Lube |
| E101 | Spindle Encoder Signal Lost | ALARM | Encoder |
| E102 | Spindle At-Speed Timeout | FAULT | Spindle |
| E103 | Spindle Orientation Timeout | FAULT | Spindle |
| E104 | Spindle Brake Timeout | FAULT | Spindle |
| E105 | Spindle Motor Overload | FAULT | Spindle |
| E106 | Rigid Tap Overshoot | FAULT | Spindle |
| E107 | Spindle Temperature High | WARNING | Thermal |
| E110 | X-Axis Encoder Signal Lost | ALARM | Encoder |
| E111 | Y-Axis Encoder Signal Lost | ALARM | Encoder |
| E112 | Z-Axis Encoder Signal Lost | ALARM | Encoder |
| E120 | Spindle Encoder Index Lost | FAULT | Encoder |
| E121 | X-Axis Encoder Index Lost | WARNING | Encoder |
| E122 | Y-Axis Encoder Index Lost | WARNING | Encoder |
| E123 | Z-Axis Encoder Index Lost | WARNING | Encoder |
| E130 | Encoder Signal Amplitude Low | WARNING | Encoder |
| E131 | Encoder Cable Continuity Fault | ALARM | Encoder |
| E132 | Encoder Power Supply Fault | ALARM | Encoder |
| E140 | Scale Feedback Lost (optional) | ALARM | Encoder |
| E150 | Encoder Frequency Exceeded | FAULT | Encoder |
| E202 | Coolant Level Below Minimum | FAULT | Coolant |
| E210 | Coolant Pump Motor Overload | FAULT | Coolant |
| E211 | Coolant Pump Thermal Overload | ALARM | Coolant |
| E220 | Coolant Pressure Low | WARNING | Coolant |
| E221 | Coolant Temperature High Warning | WARNING | Coolant |
| E222 | Coolant Temperature High Shutdown | ALARM | Coolant |
| E223 | Coolant Pump Overload | FAULT | Coolant |
| E224 | TSC Pressure Low | FAULT | Coolant |
| E225 | TSC No Flow | FAULT | Coolant |
| E226 | Coolant Change Due | INFO | Maint. |
| E227 | Coolant Tank Cleaning Due | INFO | Maint. |
| E230 | Chip Conveyor Overload | FAULT | Convey. |
| E231 | Chip Conveyor Jam | FAULT | Convey. |
| E301 | ATC Arm Extend Timeout | ALARM | ATC |
| E302 | ATC Arm Rotate Timeout | ALARM | ATC |
| E303 | Tool Changer Timeout | ALARM | ATC |
| E304 | ATC Carousel Index Timeout | ALARM | ATC |
| E305 | ATC Spindle Orient Timeout | FAULT | ATC |
| E306 | Tool Clamp Not Confirmed | ALARM | ATC |
| E307 | Tool Not Present in Carousel | FAULT | ATC |
| E308 | ATC Arm Not at Home on Start | FAULT | ATC |
| E309 | ATC Cam Sensor Mismatch | ALARM | ATC |
| E310 | ATC Carousel Home Not Found | ALARM | ATC |
| E311 | ATC Pot Count Mismatch | FAULT | ATC |
| E320 | Tool Seating Fault | ALARM | ATC |
| E321 | Tool Unclamp Timeout | ALARM | ATC |
| E330 | Gear Change Solenoid Fault | FAULT | Spindle |
| E331 | Gear Change Confirm Timeout | FAULT | Spindle |
| E340 | ATC Lube System Low | WARNING | Lube |
| E404 | Hydraulic Pressure Low | ALARM | Hydraulic |
| E410 | Hydraulic Pump Overload | ALARM | Hydraulic |
| E411 | Hydraulic Temperature High Warning | WARNING | Hydraulic |
| E412 | Hydraulic Temperature High Shutdown | ALARM | Hydraulic |
| E413 | Hydraulic Level Low | WARNING | Hydraulic |
| E414 | Hydraulic Filter Bypass | WARNING | Hydraulic |
| E415 | Z-Brake Release Timeout | ALARM | Hydraulic |
| E416 | Z-Brake Apply Timeout | ALARM | Hydraulic |
| E417 | Hydraulic Oil Change Due | INFO | Maint. |
| E418 | Hydraulic Filter Change Due | INFO | Maint. |
| E420 | Solenoid Valve Fault (HYD-01) | ALARM | Hydraulic |
| E421 | Solenoid Valve Fault (HYD-02) | ALARM | Hydraulic |
| E422 | Solenoid Valve Fault (HYD-03) | ALARM | Hydraulic |
| E423 | Solenoid Valve Fault (HYD-04) | ALARM | Hydraulic |
| E430 | Hydraulic Return Filter Blocked | WARNING | Hydraulic |
| E501 | X-Axis Following Error | ALARM | Servo |
| E502 | Y-Axis Following Error | ALARM | Servo |
| E503 | Z-Axis Following Error | ALARM | Servo |
| E504 | X-Axis Stall Detected | ALARM | Servo |
| E505 | Axis Servo Overload | ALARM | Servo |
| E506 | Y-Axis Stall Detected | ALARM | Servo |
| E507 | Z-Axis Stall Detected | ALARM | Servo |
| E510 | X-Axis Drive Fault | ALARM | Servo |
| E511 | Y-Axis Drive Fault | ALARM | Servo |
| E512 | Z-Axis Drive Fault | ALARM | Servo |
| E515 | ATC Carousel Drive Fault | ALARM | ATC |
| E520 | X-Axis Motor Thermal | WARNING | Servo |
| E521 | Y-Axis Motor Thermal | WARNING | Servo |
| E522 | Z-Axis Motor Thermal | WARNING | Servo |
| E530 | Drive DC Bus Overvoltage | ALARM | Servo |
| E531 | Drive DC Bus Undervoltage | ALARM | Servo |
| E532 | Drive Input Phase Loss | ALARM | Servo |
| E533 | Drive Regenerative Overload | ALARM | Servo |
| E540 | Collision Detected | ALARM | Servo |
| E601 | Ethernet Connection Lost | WARNING | Comms |
| E602 | DNC Communication Timeout | WARNING | Comms |
| E603 | USB Device Error | INFO | Comms |
| E610 | PLC I/O Module Comm Fault | ALARM | PLC |
| E620 | CNC Control Comm Fault | ALARM | Comms |
| E701 | PLC Program Fault | ALARM | PLC |
| E702 | PLC Watchdog Timeout | EMERGENCY | PLC |
| E703 | PLC I/O Configuration Error | ALARM | PLC |
| E710 | Safety PLC Fault | EMERGENCY | Safety |
| E720 | Output Short Circuit (24VDC) | ALARM | PLC |
| E730 | Input Signal Fault | WARNING | PLC |
| E801 | Control Cabinet Temperature High | WARNING | Thermal |
| E802 | Control Cabinet Temperature Critical | ALARM | Thermal |
| E810 | Main Cabinet Fan Fault | WARNING | Thermal |
| E820 | Ambient Temperature High | WARNING | Thermal |
| E821 | Ambient Temperature Low | WARNING | Thermal |
| E830 | HPU Cooling Fan Fault | WARNING | Thermal |
| E901 | Parameter Revision Mismatch | WARNING | Config |
| E902 | Machine Configuration Error | ALARM | Config |
| E910 | Firmware Version Mismatch | WARNING | Config |
| E920 | Factory Calibration Data Missing | ALARM | Config |
| E930 | License Expiry Warning | WARNING | Config |
| E940 | Maintenance Password Incorrect | INFO | Config |
| E950 | Data Backup Required | INFO | Config |

---

## 8.4 Critical Faults (E001–E099)

### E001 — System Watchdog Fault

**Severity:** EMERGENCY
**Machine Response:** Immediate E-Stop equivalent; all drives disabled

**Description:**
The system watchdog is a hardware timer that must be periodically reset by the main control software. If the software fails to reset the watchdog within the timeout period (typically 500 ms), the watchdog hardware triggers an emergency stop. This fault indicates a serious software or hardware failure in the CNC control.

**Possible Causes:**
1. CNC control software has crashed or locked up
2. CNC control processor is overloaded (may occur with extremely large programs on older firmware)
3. Hardware fault in the CNC control unit (processor board, memory, or communication bus)
4. Electrical noise interfering with CNC control unit
5. Power supply voltage to CNC control unit out of specification

**Corrective Steps:**
1. Attempt to power-cycle the machine (turn off main disconnect, wait 30 seconds, power on).
2. If E001 recurs immediately on power-on: suspect CNC control hardware fault. Do not attempt to operate the machine. Contact BetaCorp Systems Technical Support.
3. If E001 occurs only during heavy machining: check that the control cabinet air conditioning is functioning and the cabinet temperature is below 50°C. Overheating can cause processor instability.
4. If E001 occurs intermittently: inspect electrical grounding (see Section 4.5.2). Check for loose connections on the CNC control unit and servo drives.
5. Update CNC firmware to the latest version (available at docs.betacorpsystems.com). Firmware updates often include stability improvements.
6. If all of the above fail: the CNC control unit may need to be replaced. Contact BetaCorp Systems.

**Safety Note:**
After E001, all axis positions are potentially compromised. The machine MUST be homed before resuming automatic operation.

---

### E006 — Parameter Checksum Error

**Severity:** ALARM
**Machine Response:** Machine halts; parameters cannot be trusted

**Description:**
The CNC control stores all parameters in non-volatile memory with a checksum. If the checksum does not match the stored data on power-up, E006 is set. This indicates that one or more parameters may have been corrupted.

**Possible Causes:**
1. Power failure during a parameter write operation
2. Battery failure in the CNC control (battery maintains non-volatile memory)
3. Electrostatic discharge (ESD) event that corrupted memory
4. Hardware fault in CNC control non-volatile memory

**Corrective Steps:**
1. Load the parameter backup from USB drive: SYSTEM → PARAMETER → RESTORE → USB. Select the most recent backup file.
2. If no USB backup is available, contact BetaCorp Systems for the factory default parameter file for your machine serial number.
3. After parameter restore, verify key parameters (B1.01, B2.01, B3.02, B6.01, B6.11, B6.21) match expected values.
4. If E006 recurs after parameter restore: suspect failing non-volatile memory or control board. Contact BetaCorp Systems.
5. Replace the control board battery (Part No. BC-BATT-CNC-001) if battery voltage is below 2.7 V (check at SYSTEM → DIAGNOSTIC → BATTERY VOLTAGE).

**Related Parameters:** B9.10, B9.11

---

### E022 through E027 — Over-Travel Faults

**Severity:** ALARM
**Machine Response:** Axis motion halts immediately; spindle stops

**Description:**
An over-travel fault occurs when an axis reaches a hardware limit switch beyond the software travel limits. This should not occur during normal operation if software limits (B2.03, B2.04, B2.13, B2.14, B2.23, B2.24) are correctly set.

**Possible Causes:**
1. Software limits set incorrectly (limits set too close to or beyond hardware switches)
2. Work coordinate system set incorrectly (program commanding motion outside machine envelope)
3. Tool length offset error causing Z-axis to travel too deep
4. Homing position not correctly established
5. Hardware limit switch failed in the open state (rare; would cause false over-travel indication at any position)

**Corrective Steps:**
1. Do NOT attempt to force the axis off the limit switch by pressing any button other than the designated recovery procedure.
2. To recover: switch to JOG mode. The control will allow limited manual jogging away from the limit switch (in the direction away from the switch) at very low speed. Press the JOG button in the direction away from the over-travel condition.
3. After clearing the limit switch, investigate the cause:
   - Check software limits (Parameter B2.03–B2.24).
   - Check work coordinate setup.
   - Check tool length offsets.
   - Verify homing was completed correctly.
4. If a hardware limit switch has failed, replace it (limit switch Part No.: BC-SW-OTRV-001).
5. After recovery, perform a complete homing cycle before resuming automatic operation.

**Safety Note:**
Over-travel in the Z-axis (E026 or E027) may leave the tool engaged with the workpiece. Carefully inspect the work zone before attempting to recover Z-axis motion.

---

## 8.5 Encoder and Feedback Faults (E100–E199)

### 8.5.1 E101 — Spindle Encoder Signal Lost

**Fault Code:** E101
**Fault Name:** Spindle Encoder Signal Lost
**Severity:** ALARM
**Machine Response:** Spindle drive immediately disabled; spindle coasts to stop (or applies brake if B1.22 = 1); machining program halted

**Description:**
Fault E101 is triggered when the CNC control or spindle drive detects a loss of the spindle encoder signal. The spindle encoder (Heidenhain ROD 420, 4096 PPR) provides the speed feedback necessary for closed-loop spindle speed control, rigid tapping synchronization, and spindle orientation for tool changes. Loss of this signal prevents all spindle operations until the fault is resolved.

> **IMPORTANT:** E101 on the BC-500X indicates SPINDLE ENCODER SIGNAL LOST. This is a completely different fault from voltage or electrical faults that use the E101 code on other machine models. E101 on the BC-500X is exclusively an encoder/feedback fault.

**Fault Trigger Conditions:**
E101 is triggered when ANY of the following conditions persist for more than the duration set by Parameter B2.48 (default 200 ms):
- Both A and B quadrature channels of the spindle encoder read low simultaneously (not a valid state)
- Differential voltage on the encoder RS-422 signal falls below the threshold set by B6.37 (default 0.8 V)
- Encoder cable continuity is broken (detected by the RS-422 line terminator monitoring)
- The spindle drive reports encoder fault via the drive-to-control communication bus

**Possible Causes:**

1. **Encoder cable damaged or disconnected:**
   The encoder cable (Part No. BC-CBL-SPENC-3M) routes from the spindle motor, through the Z-axis energy chain (cable carrier), to the servo/spindle drive cabinet. This cable is subject to bending fatigue from Z-axis motion. Cable failures are the most common cause of E101 on machines with more than 5,000 hours of operation.
   - Cable damage typically appears at the energy chain entry/exit points where flexing is greatest
   - Symptoms: E101 appears intermittently at first, then permanently

2. **Encoder connector loose or corroded:**
   The 12-pin circular connector at the encoder end or the cabinet end of the cable may become loose due to vibration, or the pins may corrode due to coolant infiltration.
   - Symptoms: E101 appears when machine vibrates heavily (during spindle start, or at certain speeds)

3. **Encoder unit failed:**
   The Heidenhain ROD 420 encoder unit itself may fail due to:
   - Optical disc contamination (coolant mist ingress)
   - Bearing failure in the encoder shaft
   - Electronic failure of the encoder signal processing board
   - Symptoms: E101 permanent; replacing cable does not resolve

4. **Spindle drive input circuit fault:**
   The spindle drive's encoder input circuit may have failed, causing false E101 indication even though the encoder is functioning correctly.
   - Symptoms: E101 even after encoder and cable are verified good; other encoder-based drives on the same machine work correctly

5. **Electromagnetic interference (EMI) on encoder cable:**
   High-frequency EMI from the spindle drive or servo drives can corrupt the encoder signal, especially if the encoder cable is routed near power cables.
   - Symptoms: E101 appears at specific spindle speeds; correlates with drive switching frequency
   - More likely if recent cable replacement used non-shielded cable or shield was not properly connected

**Corrective Steps:**

> **WARNING:** All encoder inspection work requires LOTO (lockout/tagout). Refer to Section 2.4.2.

**Step 1: Document and Record**
- Record the exact conditions when E101 occurred: spindle speed, machine mode, recent history.
- Note whether E101 is permanent (present even when spindle is stopped) or appears only when the spindle is running.
- Check the fault log: SYSTEM → FAULT LOG → filter for E101. Note the frequency of occurrence.

**Step 2: Check Encoder Cable at Energy Chain**

1. Lock out the machine per Section 2.4.2.
2. Open the Z-axis energy chain cover (refer to machine drawings for energy chain location — typically on left side of Z-axis column).
3. Visually inspect the encoder cable along its full length through the energy chain.
4. Look for:
   - Kinks, crushing, or cuts in the cable jacket
   - Abraded sections where the cable contacts the energy chain links
   - Discoloration from heat or chemical exposure
5. Pay special attention to the first and last 300 mm of the cable at the energy chain entry/exit points — this is where bending fatigue damage occurs.
6. If any damage is found: replace the encoder cable with Part No. BC-CBL-SPENC-3M. Refer to Section 9.12 for the encoder cable replacement procedure.

**Step 3: Check Encoder Connectors**

1. With the machine locked out, locate both encoder cable connectors:
   - Encoder end: circular 12-pin connector at the rear of the spindle motor
   - Drive end: rectangular 20-pin connector on the spindle drive unit in the cabinet
2. Check the encoder-end connector:
   - Verify the connector is fully seated. Press firmly and check that the locking ring is fully engaged.
   - Inspect the connector face for coolant residue, corrosion, or bent pins.
   - Clean the connector face with contact cleaner (CRC QD Electronics Cleaner or equivalent) if contamination is found.
3. Check the drive-end connector:
   - Same inspection process.
   - Verify no pins are pushed back into the connector housing.
4. If connector pins show corrosion or the connector housing is cracked: replace the connector.
   - Encoder-end replacement connector: BC-CON-ENC-12P
   - Drive-end replacement connector: BC-CON-ENC-DRV

**Step 4: Measure Encoder Signal with Oscilloscope**

For definitive diagnosis, measure the encoder signal directly:

1. Obtain a 100 MHz or faster oscilloscope with differential probes.
2. With the machine powered on (but spindle stopped and in a safe state with the work zone door closed):
3. At the drive-end connector, probe the following signals:
   - A+ and A- (differential pair)
   - B+ and B- (differential pair)
4. Manually rotate the spindle slowly by hand (safe only when powered off in LOTO — alternatively, command a slow spindle speed of 50 RPM in JOG mode):
   - Expected signal: clean square wave, differential amplitude > 2.0 V peak-to-peak
   - If amplitude is below 1.5 V: suspect encoder unit failure or poor connection
   - If signal is present but noisy: suspect EMI or poor shielding
   - If no signal at all: open circuit in cable or failed encoder

**Step 5: Test Encoder Output at Encoder End**

1. Lock out the machine.
2. Disconnect the cable from the encoder body.
3. Using the bench power supply, apply 5 VDC ± 5% to the encoder power pins (see encoder datasheet for pin assignment — available from BetaCorp).
4. Slowly rotate the encoder shaft by hand.
5. Measure the A+/A- and B+/B- outputs with the oscilloscope.
6. If signals are clean and correct amplitude at the encoder end but not at the drive end: the cable is faulty.
7. If signals are not correct at the encoder end: the encoder unit has failed. Replace with BC-ENC-SP-001.

**Step 6: Verify Cable Shield Connection**

Encoder cable shield must be connected at the drive end only (floating at the encoder end):
1. At the drive end connector, verify the shield drain wire is connected to the drive chassis ground (or encoder input chassis ground, per the BC-500X wiring diagram).
2. At the encoder end connector, verify the shield drain wire is NOT connected to anything (floating).
3. If both ends are connected (shield grounded at both ends), this creates a ground loop that can cause EMI-induced encoder faults.

**Step 7: Check Spindle Drive Encoder Input**

If the encoder and cable test correctly, the spindle drive encoder input may be faulty:
1. Using the spare encoder cable (if available), temporarily connect a known-good encoder to the drive inputs.
2. Power on the machine and run the spindle at 500 RPM.
3. If E101 does not occur with the test encoder: the original encoder is faulty.
4. If E101 still occurs with the known-good encoder: the drive encoder input is faulty. The spindle drive unit must be replaced or sent for repair. Contact BetaCorp Systems for drive exchange options.

**Step 8: Verify Encoder Cable Routing (EMI)**

If E101 appears only at specific spindle speeds:
1. Check the routing of the encoder cable through the energy chain and machine frame.
2. The encoder cable must be physically separated from power cables (servo motor cables, spindle motor cable) by at least 200 mm, or run in a separate grounded metallic conduit.
3. If the encoder cable runs parallel to power cables over a long distance, re-route it.
4. Installing ferrite cores on the encoder cable (at the drive end and encoder end) can reduce high-frequency EMI. Use Fair-Rite type 2643 or equivalent, 3 turns through a 25 mm OD core.

**Related Parameters:**
- B1.38 — Spindle Encoder PPR (verify = 4096)
- B1.39 — Spindle Encoder Type (verify = 1 for differential RS-422)
- B6.31 — Spindle Encoder PPR (cross-reference parameter)
- B6.37 — Encoder Low Signal Threshold
- B2.48 — Encoder Lost Dwell Timeout

**Related Parts:**
- BC-CBL-SPENC-3M — Spindle encoder cable, 3 m
- BC-ENC-SP-001 — Spindle encoder (Heidenhain ROD 420)
- BC-CUP-SP-001 — Spindle encoder shaft coupling
- BC-CON-ENC-12P — Encoder connector (encoder end, 12-pin)
- BC-CON-ENC-DRV — Encoder connector (drive end)

**Safety Note:**
After resolving E101, the spindle orientation position must be verified before performing automatic tool changes. Command M19 (spindle orient) and verify the spindle key is at the correct position for ATC operation. If orientation is incorrect, adjust Parameter B1.19 (Spindle Orientation Angle).

---

### E110 — X-Axis Encoder Signal Lost

**Severity:** ALARM
**Machine Response:** All axes halt; spindle stops; program aborted

**Description:**
Loss of X-axis encoder signal (Heidenhain ERN 1381, 2500 PPR). The X-axis encoder provides position feedback for closed-loop servo control. Loss of this signal causes immediate axis disable.

**Possible Causes:**
1. X-axis encoder cable (BC-CBL-ENC-5M) damaged or disconnected
2. X-axis encoder connector loose at drive or encoder end
3. X-axis encoder unit failed (Part No. BC-ENC-X-001)
4. X-axis servo drive encoder input failed
5. EMI on encoder cable from X-axis servo motor cable

**Corrective Steps:**
Follow the same diagnostic procedure as E101 (Section 8.5.1), adapted for the X-axis encoder and cable.
Key differences:
- X-axis encoder cable routes through the X-axis cable tray on the right side of the machine base
- X-axis encoder connector at drive end connects to the X-axis servo drive (BetaCorp SD-300)
- Inspect the cable at the entry/exit points of the X-axis cable tray

**After resolution:** The X-axis must be re-homed before automatic operation.

---

### E111 — Y-Axis Encoder Signal Lost

**Severity:** ALARM
**Machine Response:** All axes halt; spindle stops; program aborted

**Description and Corrective Steps:** Same procedure as E110, adapted for Y-axis. Y-axis encoder cable routes under the machine base through the Y-axis cable tray.

---

### E112 — Z-Axis Encoder Signal Lost

**Severity:** ALARM
**Machine Response:** All axes halt; spindle stops; Z-axis brake applies; program aborted

**Description:**
Loss of Z-axis encoder signal. The Z-axis encoder is especially critical because the Z-axis has a gravity load of 280 kg (spindle head). Loss of encoder signal is handled more aggressively than X and Y faults.

> **WARNING:** When E112 occurs, the Z-axis brake applies immediately. Do NOT attempt to manually jog the Z-axis until the encoder signal is restored and the drive is re-enabled.

**Corrective Steps:** Same procedure as E110, adapted for Z-axis.
Key considerations for Z-axis:
- Z-axis encoder cable routes through the Z-axis energy chain (most susceptible to bending fatigue on the BC-500X)
- Z-axis energy chain bending radius is larger than X/Y; inspect for crushing at chain ends
- After E112 resolution: Z-axis must be re-homed. The Z-axis home procedure must be followed carefully — verify Z-axis brake is released before commanding motion.

---

## 8.6 Coolant System Faults (E200–E299)

### 8.6.1 E202 — Coolant Level Below Minimum

**Fault Code:** E202
**Fault Name:** Coolant Level Below Minimum
**Severity:** FAULT (configurable to ALARM via B5.04)
**Machine Response:** Alert displayed; machine continues operation (default); if B5.04 = 1, machine halts

**Description:**
Fault E202 is triggered when the coolant tank level switch (a float switch in the coolant tank) indicates that the coolant level has dropped to or below the minimum acceptable level. The minimum level is approximately 80 mm below the "FULL" mark on the coolant sight gauge, corresponding to a remaining coolant volume of approximately 250 liters (out of 350 liters total capacity).

> **IMPORTANT:** E202 on the BC-500X means COOLANT LEVEL BELOW MINIMUM — a coolant volume issue. This code is entirely different from encoder or electrical faults that may use E202 on other machine models. On the BC-500X, E202 is always a coolant level fault.

Coolant level may drop due to:
- Normal evaporation of water from the coolant mixture (especially in warm, low-humidity environments)
- Coolant carry-out (coolant dragged out on the workpiece and chips)
- Coolant leaks from fittings, hoses, or the coolant pump seal
- Excessive misting causing coolant to be exhausted through the mist collector

**Fault Trigger Conditions:**
The float switch (Part No. BC-SW-CLT-LVL) opens when the coolant level drops below the minimum setpoint. The fault requires the float switch to be open for longer than the duration specified by Parameter B5.03 (default 30 seconds) before E202 is triggered. This prevents false faults from coolant sloshing during rapid axis moves.

**Possible Causes:**

1. **Coolant level genuinely low:**
   The coolant has evaporated or been carried out. The sight glass will show the level is at or below the "LOW" mark.
   - This is the most common cause of E202
   - Requires adding coolant mixture to restore level

2. **Float switch stuck in the "low" position:**
   The float switch mechanism may be stuck due to accumulated chips, sludge, or mineral deposits fouling the float arm pivot.
   - The sight glass will show the level is at normal or near-normal
   - Float switch is mechanically stuck indicating low

3. **Float switch failed (normally-open contact):**
   The float switch contacts may have failed open, giving a persistent E202 indication even with adequate coolant.
   - Sight glass shows normal level
   - Manually pressing the float up (into the tank) should clear E202 temporarily if it is a float jam — if E202 persists even with float pushed up, the switch has failed

4. **Coolant leak:**
   A leak in the coolant circuit is draining the tank faster than evaporation. Check for:
   - Puddles under the machine (may be on the floor or absorbed by chips)
   - Wet coolant pump shaft seal area (pump seal has failed)
   - Loose or leaking hose fittings
   - Coolant tank crack or weld failure (rare)

5. **Wiring fault:**
   Open circuit in the float switch wiring from the switch to the PLC. The PLC input for the coolant level switch reads "open" regardless of actual switch state.

**Corrective Steps:**

**Step 1: Check Coolant Level at Sight Glass**

Visually inspect the coolant sight glass on the right side of the coolant tank:
- If level is at or below the "LOW" mark: coolant level IS low. Proceed to Step 2 (add coolant).
- If level is above the "LOW" mark (appears normal): the float switch may be faulty or stuck. Proceed to Step 4.

**Step 2: Add Coolant**

If the coolant level is genuinely low:
1. Prepare the correct coolant mixture. The current coolant type and target concentration are listed in the maintenance log and in Parameter B5.13 (coolant concentration target).
2. Mix the coolant concentrate with water at the target concentration (typically 7–8% for general machining). See Chapter 12, Section 12.2 for mixing procedure.
3. Add the prepared coolant through the tank fill opening (top of the coolant tank, accessible without opening the tank).
4. Add coolant slowly while watching the sight glass. Stop when the level reaches the "FULL" mark.
5. Typical volume to add from "LOW" to "FULL": approximately 80–100 liters.
6. Press RESET to clear E202.
7. Verify the coolant concentration with a refractometer after adding coolant, and adjust if necessary.

**Step 3: Investigate Why Coolant Level Was Low**

After restoring the coolant level, determine the cause of the level drop:
1. **Normal evaporation and carry-out:** If the level drop is consistent with expected evaporation/carry-out rates (check coolant management log), no further action is required. Update the coolant replenishment schedule.
2. **Elevated carry-out:** Check if chip conveyor is carrying more coolant than normal (chips are very wet). Consider reducing coolant flow rate or redirecting nozzles.
3. **Leak investigation:** Walk around the machine and look for coolant dripping or pooling. Check the coolant pump shaft area for leaks. Check all nozzle and hose connections. If a leak is found, repair before returning machine to service.

**Step 4: Inspect Float Switch (if level was normal)**

1. Lock out the machine (LOTO, Section 2.4.2).
2. Remove the coolant tank access cover (6 × M6 hex socket screws).
3. Locate the float switch in the tank. The float is a round polyethylene ball on an arm, approximately 200 mm below the tank top.
4. Inspect the float:
   - Manually lift the float arm (upward = full tank position). If the float arm moves freely and E202 clears (check after restoring power): the float arm was fouled/stuck.
   - If E202 does not clear when the float is lifted to the full position: the float switch contacts have failed open, or there is a wiring fault.
5. Clean the float arm pivot with a small stiff brush. Remove all accumulated sludge.
6. Verify the float arm moves freely through its full range of motion.
7. If the float switch is damaged or contacts are faulty: replace with Part No. BC-SW-CLT-LVL.

**Step 5: Check Float Switch Wiring**

1. With the machine locked out, trace the float switch cable from the switch to the PLC I/O module.
2. At the PLC I/O module (in the main electrical cabinet), identify the coolant level input (refer to the I/O map, Appendix D — Electrical Schematic Index). The typical input address is labeled "CLT_LEVEL_LOW" in the PLC.
3. Using a multimeter set to resistance, measure the resistance across the float switch terminals (at the PLC end of the cable, with the cable disconnected from the PLC):
   - Float in "up" position (full tank): resistance should be close to 0 ohms (switch closed / normally-closed contact)
   - Float in "down" position (low tank): resistance should be open circuit (or very high, >10 kohm)
4. If the measurement does not match expected states: replace the float switch (BC-SW-CLT-LVL) and/or the cable (BC-CBL-CLT-LVL-2M).

**Step 6: Check PLC Input**

1. At the PLC diagnostic screen (SYSTEM → DIAGNOSTIC → PLC I/O), find the coolant level input.
2. Observe the input state while manually moving the float switch:
   - Input should change state as the float is moved up and down
   - If the input does not change: the PLC input may be faulty (contact BetaCorp Systems)

**Related Parameters:**
- B5.02 — Coolant Level Min Alarm (enable/disable)
- B5.03 — Coolant Level Min Delay (seconds before alarm triggers)
- B5.04 — Coolant Level Halt (0 = continue, 1 = halt on E202)

**Related Parts:**
- BC-SW-CLT-LVL — Coolant level float switch
- BC-CBL-CLT-LVL-2M — Coolant level switch cable, 2 m

**Safety Note:**
Always check the coolant concentration (using a refractometer) after adding coolant. If water was added without concentrate, the coolant is diluted and will not provide adequate corrosion protection or tool life. Adjust concentration to target value (B5.13) before resuming production.

---

### E210 — Coolant Pump Motor Overload

**Severity:** FAULT
**Machine Response:** Coolant pump stops; program paused; alarm displayed

**Description:** The coolant pump motor thermal overload relay has tripped, indicating the pump motor is drawing excessive current. This is typically caused by pump impeller blockage, pump seal failure causing mechanical binding, or extended operation with the outlet valve restricted.

**Corrective Steps:**
1. Turn off the coolant pump at the operator panel.
2. Wait 10 minutes for the thermal overload to cool and automatically reset.
3. Inspect the coolant pump inlet strainer for blockage (Section 9.2, daily maintenance item).
4. If blockage is found: clean the strainer and restart the pump.
5. If overload persists after strainer cleaning: inspect the pump impeller for chip jamming (LOTO required; remove pump inlet cover).
6. If pump motor is faulty: replace motor assembly (BC-PMP-CLT-001).

---

### E221 — Coolant Temperature High Warning

**Severity:** WARNING
**Machine Response:** Alert displayed; machine continues

**Description:** Coolant temperature has exceeded the warning threshold (default 40°C, Parameter B5.05). Coolant temperature can rise due to heavy machining operations, inadequate coolant flow, or a hot ambient environment.

**Corrective Steps:**
1. Verify coolant flow rate is adequate. Check that all nozzle ball valves are open.
2. Verify coolant concentration is within the specified range (7–10%). Diluted coolant has reduced cooling capacity.
3. If coolant temperature continues to rise: reduce machining intensity or allow coolant to cool by running the pump without cutting for 10 minutes.
4. Consider adding a coolant chiller (BC-OPT-CHILLER) for high-duty-cycle applications in warm environments.

---

### E222 — Coolant Temperature High Shutdown

**Severity:** ALARM
**Machine Response:** Machine halts; coolant pump stops; program aborted

**Description:** Coolant temperature has exceeded the shutdown threshold (default 45°C, Parameter B5.06). Continued operation would risk coolant degradation and reduced tool life.

**Corrective Steps:**
1. Allow coolant to cool with pump stopped for 20 minutes.
2. Investigate the cause of elevated temperature (see E221 corrective steps).
3. After temperature drops below B5.05 - 5°C, press RESET and resume.

---

## 8.7 Tool Changer Faults (E300–E399)

### 8.7.1 E303 — Tool Changer Timeout

**Fault Code:** E303
**Fault Name:** Tool Changer Timeout
**Severity:** ALARM
**Machine Response:** All ATC motion halts immediately; spindle stops; program halted at current tool change position

**Description:**
Fault E303 is triggered when the ATC arm fails to reach the retracted (home) position within the timeout period specified by Parameter B3.12 (default 2000 ms). The ATC arm retract is the final motion in the tool change sequence — it occurs after the arm has rotated 180° (swapping tools) and must pull back to the rest position before the spindle can be lowered to the work position.

E303 specifically monitors the arm retract phase. If the arm extends (E301) or rotates (E302) without reaching the retracted position in time, those faults trigger before E303. E303 therefore typically indicates the arm extended and rotated correctly but failed on the retract.

> **IMPORTANT:** E303 on the BC-500X is a TOOL CHANGER TIMEOUT fault — it refers to the physical ATC arm mechanism failing to complete its retraction motion. This is categorically different from any E303 code on other machine models that may refer to spindle speed or other system parameters.

**Fault Trigger Conditions:**
The PLC monitors the ATC arm retract position sensor (SEN-ATC-RET, Parameter B3.08). The sensor must transition from "not detected" to "detected" within B3.12 milliseconds after the retract hydraulic solenoid (SOL-HYD-04) is energized. If the sensor does not confirm retraction within this window, E303 is triggered.

**Possible Causes:**

1. **ATC arm hydraulic cylinder sticking or leaking:**
   The ATC arm retract/extend cylinder (BC-CYL-ATC-EXT) may not be generating enough force to retract the arm fully. This can be caused by:
   - Internal cylinder seal wear causing internal leakage (insufficient force)
   - External hydraulic line restriction (kinked or blocked return line)
   - Hydraulic solenoid valve (SOL-HYD-04) not fully opening

2. **ATC arm mechanical obstruction:**
   A chip, broken tool fragment, or coolant-frozen grease may be blocking the arm retract motion.
   - Inspect the ATC arm housing for foreign material in the arm retract path.

3. **ATC arm retract position sensor misaligned or failed:**
   The SEN-ATC-RET sensor may have shifted out of position and no longer detects the arm in the retract position, even if the arm is physically retracted.
   - If the arm appears to be retracted but E303 is triggered: suspect sensor misalignment.

4. **Low hydraulic pressure:**
   If the hydraulic system pressure is near or below the E404 alarm threshold, the ATC arm cylinder may not have sufficient force to retract against any resistance.
   - Check hydraulic pressure gauge on HPU before investigating ATC mechanism.

5. **ATC grease buildup:**
   Insufficient or excessive lubrication of the ATC arm cam follower and guide surfaces can cause the arm to bind on retraction.
   - Excessive old dried grease is more commonly a problem than insufficient lubrication on older machines.

6. **Parameter B3.12 set too short:**
   In rare cases, if the hydraulic system is slightly slow (cold oil, pump wear), the default 2000 ms timeout may not be long enough for a properly functioning system. Increase B3.12 to 2500 ms and observe if E303 clears.

**Corrective Steps:**

> **WARNING:** The ATC arm may be in an intermediate position when E303 is triggered. There may be a tool holder gripped by both the ATC arm and the carousel, or a tool holder being held only by the ATC arm without being secured in the spindle or carousel. Do NOT attempt to manually force the ATC arm. LOTO the machine before inspecting the ATC area.

**Step 1: Assess the Machine State**

Before locking out the machine, use the diagnostic screen (SYSTEM → DIAGNOSTIC → ATC STATUS) to determine the ATC arm position:
- Note which sensors are active (SEN-ATC-HOME, SEN-ATC-90, SEN-ATC-180, SEN-ATC-EXT, SEN-ATC-RET)
- Note which tool was in the spindle and which tool was being loaded
- Note the carousel position (which pot is at the ATC position)

This information is essential for restoring the ATC to a known state after the fault is resolved.

**Step 2: Lock Out the Machine**

Follow the complete LOTO procedure (Section 2.4.2). Include hydraulic system de-pressurization (Section 2.6.2).

**Step 3: Inspect the ATC Arm Physically**

1. Remove the ATC area access guard (secured with 4 × M6 hex socket screws).
2. Visually inspect the ATC arm in its current position.
3. Check for:
   - Any tool holder being gripped by the ATC arm without being secured at either end (DANGEROUS — the tool holder may fall when the arm is moved)
   - Chips or debris blocking the arm retract path
   - Visible damage to the arm or cam follower

**Step 4: Secure Loose Tool Holders**

If a tool holder is gripped only by the ATC arm (not in spindle or carousel):
1. Manually support the tool holder to prevent it from falling.
2. Carefully guide the tool holder either into the carousel pot or onto a safe surface.
3. Do NOT let the tool holder fall — this will damage the toolholder and potentially the ATC arm.

**Step 5: Check the ATC Arm for Mechanical Obstruction**

1. With hydraulic pressure released (LOTO complete), attempt to manually push the ATC arm in the retract direction.
2. The arm should move relatively freely (requires modest force against the cam spring).
3. If the arm does not move freely: check for foreign material in the arm guide, cam follower, or retract path.
4. Clean the ATC arm guide surfaces with clean rags and inspect for wear.

**Step 6: Check ATC Arm Retract Sensor (SEN-ATC-RET)**

1. With machine powered on (not in LOTO — safety person present):
2. Navigate to SYSTEM → DIAGNOSTIC → PLC I/O.
3. Find the SEN-ATC-RET input.
4. Manually push the ATC arm into the retract position.
5. Observe whether SEN-ATC-RET changes state (input = 1) when the arm is in the retract position.
6. If the sensor does not trigger when the arm is physically retracted: the sensor is misaligned or failed.

**Step 7: Inspect and Adjust SEN-ATC-RET Sensor**

1. Lock out the machine (LOTO).
2. Locate SEN-ATC-RET (see Section 5.4.4 for sensor location details).
3. Check the sensor mounting bracket for looseness.
4. Measure the sensor face-to-target gap. Inductive proximity sensors (NPN) typically require a 0.5–2.0 mm gap.
5. Adjust the sensor position by loosening the mounting clamp and repositioning.
6. After adjustment, restore power and test: manually push the arm to retract position and verify SEN-ATC-RET triggers.
7. If the sensor does not trigger even with correct gap: replace sensor (BC-SEN-ATC-RET).

**Step 8: Check Hydraulic Circuit**

1. After LOTO is released (machine powered), manually energize SOL-HYD-04 (ATC arm retract solenoid) using the PLC output test function (SYSTEM → DIAGNOSTIC → PLC I/O → OUTPUT TEST → SOL_HYD_04 → ENERGIZE).

   > **CAUTION:** Use output test mode only in a safe condition with the ATC area clear of personnel.

2. Observe the ATC arm. It should retract fully.
3. If the arm retracts in output test mode but not during automatic operation: the issue may be PLC logic timing or solenoid actuation delay. Consult BetaCorp Systems.
4. If the arm does not retract in output test mode: check the hydraulic system:
   - Verify SOL-HYD-04 is energized (check LED on solenoid coil body if equipped)
   - Check hydraulic pressure at the ATC retract line (port on the ATC cylinder)
   - Check for blocked or kinked hydraulic line on the ATC retract circuit

**Step 9: ATC Recovery After E303**

After the mechanical issue is resolved and sensors are verified:
1. Manually place the ATC arm in the home (retracted) position.
2. Restore machine power and RESET the E303 fault.
3. Navigate to SYSTEM → ATC → MANUAL → ARM HOME to command the arm to verify home position through the control.
4. Carefully restore the carousel to the correct position using SYSTEM → ATC → MANUAL → CAROUSEL GOTO → [pot number] to ensure the tool pot assignment table is correct.
5. Verify the correct tool is in the spindle.
6. Perform a manual tool change cycle (SYSTEM → ATC → MANUAL → TOOL CHANGE → T[n]) to verify normal ATC operation.
7. Run 5 tool change cycles before returning to automatic production.

**Related Parameters:**
- B3.12 — ATC Arm Retract Timeout (increase if timeout is too aggressive)
- B3.08 — ATC Arm Retract Detect Input (PLC input number)
- B3.22 — ATC Retry on Fault (set to 1 for one automatic retry)
- B4.02 — HPU Pressure Min Alarm (verify hydraulic pressure is adequate)

**Related Parts:**
- BC-SEN-ATC-RET — ATC arm retract position sensor
- BC-CYL-ATC-EXT — ATC arm extend/retract cylinder
- BC-SOL-ATC-RET — ATC arm retract solenoid valve (SOL-HYD-04)
- BC-SEAL-ATC-CYL — ATC cylinder seal kit
- BC-GRS-ATC-001 — ATC arm grease (specified grease)

**Safety Note:**
After any ATC fault and recovery, verify that the tool in the spindle matches the tool the control believes is in the spindle (check PROGRAM → TOOL TABLE → CURRENT TOOL). A mismatch could cause the wrong tool to be used in subsequent operations, leading to tool breakage and potential machine damage.

---

## 8.8 Hydraulic System Faults (E400–E499)

### 8.8.1 E404 — Hydraulic Pressure Low

**Fault Code:** E404
**Fault Name:** Hydraulic Pressure Low
**Severity:** ALARM
**Machine Response:** Machine halts; Z-axis brake applies (by spring force); spindle stops; all ATC motion inhibited; program aborted

**Description:**
Fault E404 is triggered when the hydraulic system pressure drops below the alarm threshold set by Parameter B4.02 (default 120 bar) for longer than the monitoring delay (Parameter B4.04, default 5,000 ms after HPU start). This fault indicates the hydraulic power unit is not maintaining adequate pressure for the machine's hydraulic circuits.

> **IMPORTANT:** E404 on the BC-500X means HYDRAULIC PRESSURE LOW — the machine's hydraulic power unit is not maintaining system pressure. The code E404 refers exclusively to a hydraulic system pressure problem on the BC-500X. This is entirely different from any E404 code on other machine models.

The BC-500X hydraulic system serves: Z-axis brake (fail-safe), tool unclamp, ATC arm, and gear change. Loss of hydraulic pressure defaults all circuits to their spring-return positions:
- Z-axis brake APPLIES (protects against Z-axis gravity drop)
- Tool remains CLAMPED (spring-retained)
- ATC arm RETRACTS (spring-centered)
- Gear change remains in LAST POSITION (spring-held)

**Fault Trigger Conditions:**
The hydraulic pressure switch (set at 120 bar rising / 100 bar falling) monitors the main hydraulic circuit. When the switch indicates low pressure for longer than Parameter B4.04, E404 is triggered. An additional shutdown trigger at Parameter B4.03 (default 80 bar) causes an immediate E-Stop regardless of the monitoring delay.

**Possible Causes:**

1. **Hydraulic pump not running:**
   The HPU motor may not have started or may have stopped.
   - Most common occurrence at initial machine startup before HPU is started
   - Also occurs if HPU motor thermal overload trips
   - Verify HPU motor is running (listen for motor sound; check HPU motor contactor status in PLC diagnostics)

2. **Hydraulic pump worn or failed:**
   A worn gear pump loses internal efficiency and cannot maintain pressure against the system load.
   - Worn pumps often exhibit: slow pressure rise on start, pressure that holds at rest but drops when hydraulic actuators operate, and unusual noise (grinding or whining)
   - Replace pump (BC-PMP-HYD-001) if internal leakage is confirmed by flow testing

3. **Main system pressure relief valve stuck open:**
   The main relief valve (BC-RLV-HYD-MAIN, set at 210 bar) may be stuck open due to contamination lodged in the valve seat.
   - Symptom: pump runs, pressure never rises above a low value (e.g., 20–30 bar)
   - The relief valve vents pump flow back to tank, preventing system from pressurizing
   - Remove and clean or replace the relief valve

4. **Hydraulic oil too low:**
   If the HPU reservoir level is below the pump inlet height, the pump will cavitate and not develop pressure.
   - Check HPU sight glass. Oil must be between MIN and MAX marks.
   - If oil is low: add ISO VG 46 hydraulic oil. Investigate why oil level dropped (leak?).

5. **Hydraulic line leak:**
   A major leak in the hydraulic circuit will prevent pressure from building up.
   - Inspect all hoses, connections, and cylinders for leaks.
   - Even a small leak can prevent full pressure if the pump's output capacity is exceeded by the leak rate.

6. **Pressure switch failed:**
   The pressure switch may have failed in the open state, giving a false E404 indication even though hydraulic pressure is adequate.
   - Verify actual pressure on the analog pressure gauge on the HPU (this gauge is independent of the pressure switch).
   - If gauge shows ≥ 150 bar and E404 is active: pressure switch has failed. Replace (BC-PSW-HYD-MAIN).

7. **Pump motor wiring fault:**
   The HPU motor may not be receiving power even though the control is commanding it to start.
   - Check that the HPU motor contactor (in the main electrical cabinet) is closing when HPU START is commanded.
   - Check motor wiring continuity.

8. **Wrong hydraulic oil or severely contaminated oil:**
   Oil that is too viscous (wrong grade, or oil degraded at cold temperatures) may prevent the pump from developing full pressure at startup.
   - In cold ambient conditions (below 10°C), ISO VG 46 oil may be too viscous. Allow more warm-up time or use ISO VG 32 oil in cold environments.

**Corrective Steps:**

**Step 1: Check HPU Motor Status**

1. Listen for the HPU motor. It should produce a smooth, steady sound.
2. At SYSTEM → DIAGNOSTIC → PLC I/O, check the HPU motor run feedback (input labeled "HPU_RUN_FB"). It should be 1 (ON) when the motor is commanded to start.
3. Check the HPU motor contactor. Open the main electrical cabinet and locate the HPU motor starter. Verify:
   - Main power contacts are closed (indicator lamp if equipped)
   - Thermal overload relay has not tripped (manual reset button on the overload relay)
4. If the thermal overload has tripped: press the reset button (after allowing the motor to cool 10 minutes). Investigate the cause of overload (blocked pump, wrong oil viscosity, motor fault).

> **CAUTION:** Opening the electrical cabinet requires arc flash PPE. Refer to Section 2.4.1.

**Step 2: Check Hydraulic Pressure on Analog Gauge**

Without relying on the pressure switch, check the analog pressure gauge on the HPU:
- Gauge reading should be ≥ 150 bar during normal operation
- If gauge reads 0–10 bar with motor running: pump is not developing pressure (see causes 3 and 4 above)
- If gauge reads 50–100 bar: relief valve may be cracking, or pump is worn
- If gauge reads ≥ 150 bar and E404 is still active: pressure switch has failed

**Step 3: Check Hydraulic Oil Level**

1. Verify HPU is stopped (LOTO).
2. Read the HPU sight glass. Level must be between MIN and MAX marks.
3. If below MIN: add ISO VG 46 hydraulic oil through the fill port (top of HPU, breather/fill cap).
4. Fill to MAX mark (approximately 50 L total capacity).
5. Investigate why oil level dropped (check for leaks).

**Step 4: Check for Hydraulic Leaks**

1. With HPU running at pressure, carefully inspect all hydraulic hose connections, fittings, cylinder rod seals, and valve bodies for external leaks.
2. Use a piece of cardboard to detect pinhole leaks (do NOT use hands — see Section 2.6.1).
3. For each leak found: LOTO machine, de-pressurize hydraulic system, and repair the leak before proceeding.
4. After repair, restart HPU and re-verify pressure.

**Step 5: Evaluate Relief Valve**

If the pump is running, oil level is correct, and no leaks are found, but pressure will not rise above a low value:

1. LOTO the machine and de-pressurize.
2. Remove the main relief valve (BC-RLV-HYD-MAIN) from the HPU block.
3. Inspect the valve seat and ball/poppet for contamination.
4. Flush the valve with clean hydraulic oil or mineral spirits.
5. Check that the spring and poppet move freely.
6. Reinstall the valve and test.
7. If pressure still does not build: replace the relief valve (BC-RLV-HYD-MAIN). The relief valve is a wear item.

**Step 6: Pressure Switch Test and Replacement**

If the analog gauge shows ≥ 150 bar but E404 is still active:
1. At SYSTEM → DIAGNOSTIC → PLC I/O, locate the pressure switch input (labeled "HPU_PRESS_OK").
2. This input should be 1 (ON) when pressure is adequate.
3. If input is 0 (OFF) with gauge reading ≥ 150 bar: pressure switch has failed.
4. LOTO and de-pressurize.
5. Disconnect and replace the pressure switch (BC-PSW-HYD-MAIN). Tighten to 25 N·m (18 ft·lb).
6. After replacement: restore power and verify the PLC input reads 1 when HPU reaches pressure.

**Step 7: Hydraulic Pump Wear Assessment**

To assess pump wear, a flow test is required:
1. Connect a hydraulic flow meter in the pump outlet line (between pump and system).
2. Run the pump and measure flow at zero load (no actuators active) at rated speed.
3. Compare measured flow to the rated pump flow (12 L/min at 1,450 RPM for BC-PMP-HYD-001).
4. If measured flow is less than 80% of rated flow with the relief valve set at full pressure: the pump has worn excessively. Replace (BC-PMP-HYD-001).

**Related Parameters:**
- B4.02 — HPU Pressure Min Alarm (pressure switch setpoint for E404)
- B4.03 — HPU Pressure Min Shutdown (emergency stop setpoint)
- B4.04 — HPU Pressure Monitor Delay (delay after HPU start before monitoring)
- B4.07 — HPU Level Min Alarm
- B4.20 — Hydraulic Oil Change Interval

**Related Parts:**
- BC-PSW-HYD-MAIN — Hydraulic system pressure switch
- BC-RLV-HYD-MAIN — Main hydraulic relief valve
- BC-PMP-HYD-001 — Hydraulic gear pump
- BC-MTR-HP-001 — Hydraulic pump motor (4 kW)
- BC-FLT-HYD-001 — Hydraulic return filter element (10 μm)
- BC-OIL-HYD-VG46 — ISO VG 46 hydraulic oil (20 L container)

**Safety Note:**
After E404 and any hydraulic system repair, always verify Z-axis brake operation before re-enabling spindle:
1. Command HPU to start. Verify pressure rises to ≥ 150 bar.
2. Command Z-axis brake release (SYSTEM → HYDRAULICS → Z BRAKE RELEASE).
3. Verify brake release confirmed by sensor and PLC (E415 does not trigger).
4. Jog Z-axis 10 mm upward and 10 mm downward to verify servo and brake are functioning correctly.
5. Command Z-axis brake apply (SYSTEM → HYDRAULICS → Z BRAKE APPLY).
6. Verify brake applies (E416 does not trigger).

---

## 8.9 Servo System Faults (E500–E599)

### 8.9.1 E505 — Axis Servo Overload

**Fault Code:** E505
**Fault Name:** Axis Servo Overload
**Severity:** ALARM
**Machine Response:** All axis motion halts; spindle stops; program aborted

**Description:**
Fault E505 is triggered when one or more axis servo drives detect that the motor has been operating above its continuous rated current (and therefore rated torque) for long enough to cause a thermal overload condition. The servo drive monitors motor current and uses an electronic thermal model to track the motor's thermal state. When the thermal model indicates the motor temperature has reached the trip threshold, E505 is triggered.

> **IMPORTANT:** E505 on the BC-500X is an AXIS SERVO OVERLOAD fault — a mechanical/servo system thermal condition. This code has nothing to do with door interlocks or other systems that may use E505 on other machine models. E505 on the BC-500X is always a servo overload issue.

The specific axis affected by E505 is identified in the fault detail message. The fault message format is: "E505 — AXIS SERVO OVERLOAD: [X/Y/Z]." Check the fault log detail for which axis triggered the fault.

**Fault Trigger Conditions:**

The servo drive's electronic thermal model calculates a "thermal accumulator" value based on:
- Current magnitude relative to rated motor current
- Time duration of the elevated current
- Ambient temperature of the drive (internal temperature sensor)

The thermal accumulator rises when current exceeds rated value and decays when current is below rated. E505 is triggered when the accumulator exceeds 100% (thermal trip level).

For the BC-500X axis servo motors:
- X and Y axes: motor rated current = (3 kW / √3 × 480 V × PF) ≈ 5.2 A (AC), drive rated output ≈ 8.7 A DC
- Z axis: motor rated current = (4 kW / √3 × 480 V × PF) ≈ 6.9 A (AC), drive rated output ≈ 11.6 A DC

**Possible Causes:**

1. **Cutting forces exceeding machine capability:**
   The most common cause of E505 in production is an aggressive machining program that requires more axis force than the servo motor can continuously supply.
   - Typical scenario: heavy face milling with high radial engagement, or boring with excessive depth of cut
   - The axis servo must resist the cutting force while maintaining programmed feed rate
   - Solution: reduce cut depth, reduce radial engagement (stepover), reduce feed rate

2. **Guideway or ballscrew binding:**
   Mechanical resistance in the linear guideway or ballscrew (due to inadequate lubrication, contamination, or wear) increases the force required to move the axis. The servo motor must provide extra torque to overcome this resistance.
   - Symptom: E505 occurs during rapid traverse or light cutting (not just during heavy cuts)
   - Check way lube system operation (Section 5.8)
   - Check for chips in the guideway wiper seals
   - Manually push the axis (with machine LOTO'd): it should move smoothly with relatively low force

3. **Servo motor phase loss or winding fault:**
   Loss of one phase of the servo motor or a partial winding fault causes the motor to draw excessive current on the remaining phases to maintain torque.
   - Symptom: E505 with no apparent machining overload; motor may run warm or hot
   - Verify motor winding resistance (all three phases should be equal within 5%)
   - Check motor connector and cable for phase loss

4. **Z-axis: gravity compensation insufficient:**
   For the Z-axis, if the hydraulic brake is not releasing fully or if the Z-axis is fighting additional downward resistance (e.g., from a tool that is stuck in a workpiece), the servo must provide extra torque to move the axis upward.
   - Symptom: E505 on Z-axis during upward moves specifically
   - Check hydraulic brake release (verify brake sensor and hydraulic pressure)

5. **Servo drive parameter incorrect:**
   If the servo drive's motor current limit (part of drive firmware) is set too low, the motor will thermally trip at a lower load than intended.
   - This is unlikely unless the drive has been replaced or re-parameterized
   - Verify drive parameters match the BetaCorp commissioning data

6. **Ambient temperature too high:**
   Servo drives and motors are derated at elevated ambient temperatures. Above 40°C ambient, the drive reduces its maximum output current, making E505 more likely at the same load level.
   - Check ambient temperature around the servo drives (inside the cabinet)
   - Verify the cabinet cooling system (air conditioning or heat exchanger) is functioning

7. **Feed rate override too high:**
   Operating with feed rate override above 120% for extended periods in heavy cutting can cause servo overload.
   - Reduce feed rate override.

**Corrective Steps:**

**Step 1: Identify Affected Axis and Review Conditions**

1. Read the E505 fault detail to identify the affected axis (X, Y, or Z).
2. Review the machining program and the toolpath being executed at the time of E505.
3. Check the feed rate, spindle speed, depth of cut, and workpiece material.

**Step 2: Allow Motor to Cool**

1. Press RESET. If the fault clears immediately: the thermal accumulator has decayed below the trip level during the time the machine was stopped.
2. Allow the affected axis to cool for at least 5 minutes before resuming.
3. If E505 re-triggers immediately on the same operation: the machining parameters are excessive.

**Step 3: Reduce Machining Parameters**

If E505 is caused by aggressive cutting:
1. Reduce the depth of cut by 30–40%.
2. Reduce the feed rate by 20–30%.
3. Reduce radial engagement (stepover) to 40–50% of tool diameter maximum for face milling.
4. Resume the program and monitor for E505 recurrence.
5. Gradually increase parameters back toward the original values in 10% increments if E505 does not recur.

**Step 4: Check Way Lube Operation**

1. Navigate to SYSTEM → DIAGNOSTIC → LUBE → WAY LUBE.
2. Verify the way lube system has been operating on schedule (cycle counter should show recent cycles).
3. Check the way lube oil level in the reservoir.
4. Manually trigger a way lube cycle: SYSTEM → MAINT → WAY LUBE → MANUAL CYCLE.
5. Verify that oil flows to each guideway lubrication point (you should see a small oil sheen at each carriage wiper after the manual cycle).

**Step 5: Inspect Guideways for Binding**

1. Lock out the machine (LOTO).
2. Manually push the affected axis through its full range of motion by hand.
3. The axis should move smoothly and without notable resistance throughout the travel.
4. "Tight spots" or resistance at certain positions indicate:
   - Chip under a guideway wiper seal
   - Guideway wear
   - Ballscrew nut binding (if resistance increases in one direction more than the other)
5. If chips are found: clean the guideway and wiper area with a clean rag and compressed air (at low pressure, 2 bar maximum, with safety glasses).
6. If binding cannot be resolved by cleaning: contact BetaCorp Systems for guideway inspection.

**Step 6: Verify Servo Motor Winding Resistance**

1. Lock out the machine (LOTO). Wait 8 minutes for servo drive capacitors to discharge.
2. Disconnect the servo motor cable at the drive end (in the servo cabinet).
3. Using a precision ohmmeter, measure resistance between each motor phase terminal pair (U-V, V-W, U-W).
4. Expected values: all three readings should be equal within ±5%. A typical 3 kW servo motor at the BC-500X will read approximately 1.5–3.0 ohms per measurement.
5. Measure from each phase to ground (motor chassis): expected > 1 MOhm. Lower values indicate damaged winding insulation.
6. If winding resistance is unbalanced or insulation resistance is low: the servo motor has failed. Replace (BC-MTR-X-001, BC-MTR-Y-001, or BC-MTR-Z-001 as appropriate).

**Step 7: Verify Drive Output Current Setting**

If motor windings are healthy but E505 persists at loads that appear reasonable, verify the drive's current limit setting:
1. Access the spindle/servo drive configuration menu (password-protected; contact BetaCorp Systems for access).
2. Verify the "Continuous Current Limit" parameter matches the motor's rated current.
3. For the SD-300 (X and Y drives): continuous limit = 8.7 A, peak = 17.4 A.
4. For the SD-400 (Z drive): continuous limit = 11.6 A, peak = 23.2 A.
5. If these values are incorrectly set lower: a BetaCorp service engineer must correct them.

**Step 8: Check Z-Axis Hydraulic Brake (Z-Axis E505 Only)**

If E505 is on the Z-axis and occurs specifically during upward motion:
1. Verify the hydraulic brake is releasing fully.
2. At SYSTEM → DIAGNOSTIC → HYDRAULIC, check that the Z-brake release sensor confirms release after HPU start.
3. Measure hydraulic pressure at the Z-brake circuit (should be ≥ 150 bar).
4. Manually command Z-brake release (SYSTEM → HYDRAULICS → Z BRAKE TEST).
5. If E415 (Z-brake release timeout) appears: the brake is not releasing, and the Z-axis servo is fighting the applied brake.
6. Troubleshoot the Z-brake circuit per the E415 corrective steps.

**Related Parameters:**
- B8.20 — Axis Torque Limit (X)
- B8.21 — Axis Torque Limit (Y)
- B8.22 — Axis Torque Limit (Z)
- B9.20 — Way Lube Interval
- B2.05, B2.15, B2.25 — Following Error Limits (high following error with E505 confirms mechanical binding)

**Related Parts:**
- BC-MTR-X-001 — X-axis servo motor
- BC-MTR-Y-001 — Y-axis servo motor
- BC-MTR-Z-001 — Z-axis servo motor
- BC-DRV-X-001 — X-axis servo drive
- BC-DRV-Y-001 — Y-axis servo drive
- BC-DRV-Z-001 — Z-axis servo drive
- BC-LUB-OIL-VG68 — Way lube oil (ISO VG 68)

**Safety Note:**
After E505 and any servo system repair, perform a controlled test run before resuming production:
1. Home all axes.
2. Run the machine in JOG mode at full jog rate on the affected axis. Verify smooth motion, no unusual sounds.
3. Monitor servo current at SYSTEM → DIAGNOSTIC → SERVO → [AXIS] → CURRENT. Current should be low (< 30% of rated) during unloaded rapid traverse.
4. Run a test program at reduced parameters (50% feed, 50% spindle speed) for 15 minutes before returning to full production parameters.

---

*[Fault codes E530 through E950 follow the same detailed format — each with description, causes, and corrective steps. A representative selection is included below for brevity in this summary section.]*

---

### E530 — Drive DC Bus Overvoltage

**Severity:** ALARM
**Machine Response:** All axis and spindle drives disabled; machine halts

**Description:** The servo drive DC bus voltage has exceeded the overvoltage protection threshold (typically 800 VDC on the BC-500X drive system). This typically occurs during high-deceleration events when the servo motors regenerate energy back into the DC bus faster than the regenerative resistor can dissipate it.

**Possible Causes:**
1. Regenerative resistor (braking resistor) failed open — no regenerative dissipation
2. Regenerative resistor connection broken
3. Deceleration rate set too high (B2.10, B2.20, B2.30) for the connected load
4. Incoming power supply voltage above normal (above 528 VAC = 480 + 10%)
5. Multiple simultaneous high-speed decelerations on multiple axes

**Corrective Steps:**
1. Check the regenerative resistor (mounted externally on top of servo cabinet). Measure resistance: should be 10–47 ohms (check drive specification). If open circuit: replace resistor (BC-RGEN-001).
2. Reduce axis deceleration rates (Parameters B2.10, B2.20, B2.30) by 20%.
3. Verify incoming supply voltage is within 480 VAC ± 10%.

---

### E701 — PLC Program Fault

**Severity:** ALARM
**Machine Response:** Machine halts; all outputs de-energized to default safe states

**Description:** The PLC has detected an internal program execution error. This may indicate PLC memory corruption or a program bug introduced by unauthorized PLC modifications.

**Corrective Steps:**
1. Power-cycle the machine.
2. If E701 recurs after power cycle: contact BetaCorp Systems. Do NOT attempt to modify the PLC program. PLC programs are protected and modification requires BetaCorp authorization.

---

### E801 — Control Cabinet Temperature High

**Severity:** WARNING
**Machine Response:** Alert displayed; machine continues; cabinet cooling fan increases to maximum speed

**Description:** The control cabinet internal temperature has exceeded the warning threshold (50°C, Parameter B8.15).

**Possible Causes:**
1. Cabinet air conditioning / heat exchanger failed
2. Cabinet door left open (seal broken or door ajar)
3. Ambient temperature exceeds 40°C
4. Heat exchanger filter blocked (if equipped)

**Corrective Steps:**
1. Check cabinet air conditioning/heat exchanger operation (BC-HEX-CAB-001). Verify fan is running and air is flowing.
2. Verify cabinet door is fully closed and sealed.
3. If ambient temperature is above 40°C: ventilate the machine area.
4. Clean or replace heat exchanger filter media.
5. If E802 (Critical) follows: machine will halt. Resolve cooling issue before restarting.

---

*End of Chapter 8 — Fault Codes and Troubleshooting (primary fault codes)*


---

# PART 8 — MAINTENANCE

---

# Chapter 9 — Maintenance Schedule

## 9.1 Maintenance Philosophy and Preventive Maintenance Overview

The BC-500X is a precision manufacturing machine that requires regular, systematic maintenance to achieve its specified performance and service life. BetaCorp Systems has designed this maintenance program based on:

- Manufacturer's component service life data
- Field experience from the installed base of BC-500X machines
- Regulatory requirements (OSHA, ANSI B11.8)
- Industry best practices for CNC machining center maintenance

**The Cost of Deferred Maintenance:**

Deferred maintenance is one of the most costly practices in a manufacturing environment. The consequences include:
- Reduced machine accuracy, causing scrap and rework
- Unexpected machine failures causing unplanned downtime (typically 5–10× more costly than planned downtime)
- Progressive component wear that requires expensive major repairs instead of routine consumable replacement
- Safety hazards from degraded guards, worn seals, and inadequate lubrication

**Maintenance Personnel Requirements:**

All maintenance tasks must be performed by personnel meeting the qualifications specified in Section 2.2.2. Tasks involving electrical service require an electrical service technician (Section 2.2.3). All maintenance tasks require proper PPE (Section 2.3).

**Maintenance Documentation:**

Every maintenance task performed on the BC-500X must be documented in the Maintenance Log (template in Appendix I). Documentation must include:
- Date and time of maintenance
- Machine serial number
- Description of task performed
- Parts replaced (with part numbers)
- Technician name and signature
- Any abnormal findings and actions taken

This documentation is required for warranty claims, for continuity when personnel change, and for regulatory compliance in many industries.

**Maintenance Scheduling:**

The BC-500X control system tracks maintenance due dates based on machine operating hours (Parameter B9.48 — Next Maintenance Due). The control will display a maintenance reminder when scheduled tasks are approaching:
- 10 hours before a daily task is due (displayed each power-on)
- 5% before a scheduled interval task is due

**Summary of Maintenance Intervals:**

| Frequency | Task Summary |
|-----------|-------------|
| Daily (each shift) | Visual inspection; chip removal; coolant level; way lube level; general housekeeping |
| Weekly | Coolant concentration and pH check; filter inspection; ATC area cleaning; guideways; coolant strainer |
| Monthly | Coolant bacteria test; way lube system check; guideway wiper inspection; encoder cable inspection; filter change (coolant) |
| Quarterly | Axis backlash measurement; geometry check; ATC sensor check; spindle run-out; hydraulic oil sample |
| Semi-annual | Hydraulic oil change; way lube deep cleaning; coolant replacement; coolant tank cleaning; motor terminal torque check |
| Annual | Full geometry calibration (laser interferometer); spindle bearing inspection; hydraulic system overhaul check; encoder cable replacement (if needed); full electrical inspection |

---

## 9.2 Daily Maintenance Tasks

Daily maintenance must be completed at the beginning of each operating shift before the first part is run. Estimated time: 10–15 minutes.

### D-01: Pre-Operation Visual Inspection

**Frequency:** Each shift, before first production run
**Estimated Time:** 5 minutes

**Procedure:**
1. Walk completely around the machine and visually inspect for:
   - Coolant or hydraulic oil puddles on the floor
   - Visible damage to enclosure panels, hoses, or cables
   - Any items left in or near the machine from the previous shift
2. Through the work zone window, visually inspect:
   - Excessive chip accumulation (should be less than 1/4 of chip pan volume)
   - Coolant in the work zone (should be present, not dried out)
   - Condition of previous workpiece setup (fixtures, clamps)
3. Confirm that all guards are in place:
   - Work zone door closes and seals properly
   - Chip conveyor drive guard is attached
   - HPU coupling guard is attached

**Acceptance Criteria:** No puddles on floor; no visible damage; all guards in place.
**Action if Not Acceptable:** Tag machine out of service; notify maintenance department.

---

### D-02: Coolant Level Check

**Frequency:** Each shift
**Estimated Time:** 2 minutes
**PPE Required:** Safety glasses

**Procedure:**
1. Locate the coolant sight gauge on the right side of the coolant tank.
2. Read the coolant level indicator. Level must be between the "LOW" and "FULL" marks.
3. If level is at or below the "LOW" mark:
   a. Add premixed coolant to the tank through the fill opening (top of tank, open the fill cap).
   b. Add coolant slowly while watching the sight gauge.
   c. Stop adding when the level reaches the "FULL" mark.
   d. Typical add volume from "LOW" to "FULL": 80–100 liters.
   e. Use only the approved coolant type and concentration (check maintenance log for current coolant type). Do not add water without concentrate.
4. Record any coolant addition in the maintenance log (date, volume added, technician).

**Acceptance Criteria:** Level between LOW and FULL marks.

---

### D-03: Way Lube Oil Level Check

**Frequency:** Each shift
**Estimated Time:** 1 minute
**PPE Required:** Safety glasses

**Procedure:**
1. Locate the centralized way lube reservoir. The reservoir is mounted inside the machine left side panel, accessible by opening the left side access panel.
2. Check the reservoir level through the sight glass on the reservoir body.
3. The level should be above the "LOW" mark.
4. If below the "LOW" mark: add ISO VG 68 way lube oil (BC-LUB-OIL-VG68).
   - Remove the fill cap on top of the reservoir.
   - Add oil until the level reaches the "MAX" mark (reservoir capacity = 2.5 liters).
   - Replace the fill cap.
5. Record any oil addition.

> **CAUTION:** Use ONLY ISO VG 68 way lube oil. Using wrong-viscosity oil or general machine oil will not provide the correct anti-stick-slip properties for the linear guideways.

---

### D-04: Chip Bin Check and Emptying

**Frequency:** Each shift (or more often in high chip-generation applications)
**Estimated Time:** 5 minutes
**PPE Required:** Safety glasses, cut-resistant gloves, face shield

**Procedure:**
1. Inspect the chip bin (collection hopper under chip conveyor discharge).
2. If the chip bin is more than 2/3 full: empty it before beginning the shift.
3. Empty the chip bin using a shovel or chip tongs. Do not use bare hands.
4. Place chips in designated chip disposal containers or chip bins.
5. Separate chip types if required by your metal recycling program (aluminum chips separate from steel chips).
6. Return the empty chip bin to the conveyor discharge position.

**Housekeeping:**
After emptying the chip bin:
1. Clean any spilled chips from the floor around the chip conveyor with a push broom.
2. If coolant has puddled on the floor from the chip conveyor: clean with absorbent materials.

---

### D-05: Work Zone Chip Removal

**Frequency:** Each shift (or as needed during production)
**Estimated Time:** 3 minutes
**PPE Required:** Safety glasses, face shield, cut-resistant gloves

**Procedure:**
1. Wait for the spindle to stop completely before opening the work zone door.
2. Open the work zone door.
3. Using a chip brush and/or chip hook: sweep accumulated chips from the work zone floor (chip pan) into the chip conveyor intake.
4. Clear chips from around the fixture and workpiece.
5. Do NOT use compressed air to blow chips in the work zone (chips can jam the chip conveyor or be ejected hazardously).
6. Close the work zone door.

---

### D-06: Daily Function Test (First Power-On of Day)

**Frequency:** Daily, first power-on
**Estimated Time:** 5 minutes

**Procedure:**
1. Power on the machine per Section 6.3.
2. Verify all startup faults are resolved (particularly E404 should clear when HPU starts).
3. Test each E-Stop button in sequence: press → verify "E-STOP ACTIVE" message → release → press RESET → verify machine returns to ready state.
4. Perform machine homing (Section 6.4). Verify all three axes home without fault.
5. Test coolant pump: turn ON, verify coolant flows from nozzles, turn OFF.
6. Test chip conveyor: turn ON, verify conveyor belt runs in correct direction, turn OFF.
7. Test spindle: in MDI mode, command M03 S500. Verify spindle starts and reaches approximately 500 RPM on the display. Command M05. Verify spindle stops.
8. Document any anomalies found during the daily function test.

---

## 9.3 Weekly Maintenance Tasks

Weekly maintenance is performed once per week, typically at the beginning of the first shift of the week. Estimated time: 30–45 minutes.

### W-01: Coolant Concentration Check

**Frequency:** Weekly
**Estimated Time:** 5 minutes
**Equipment:** Optical refractometer (calibrated for metalworking fluids)
**PPE Required:** Safety glasses, nitrile gloves

**Procedure:**
1. Using a pipette or small dropper, collect a coolant sample from the coolant tank. Collect from the middle depth of the tank, not the surface.
2. Clean the refractometer prism with a clean, damp cloth.
3. Apply 2–3 drops of the coolant sample to the refractometer prism.
4. Close the prism plate.
5. Hold the refractometer toward a light source and read the value at the scale boundary.
6. Calculate actual coolant concentration: Actual Concentration (%) = Refractometer Reading × Correction Factor (from coolant manufacturer's technical data sheet, typically 1.2–2.0 for semi-synthetic fluids).
7. Compare actual concentration to target (B5.13, default 8%). Acceptable range: target ± 1%.
8. If concentration is below target: add coolant concentrate without diluting further. Calculate the volume of concentrate to add per the formula in Chapter 12, Section 12.2.3.
9. If concentration is above target: add water only (never exceeding 10% total concentration without consulting coolant supplier).
10. Record the reading, date, and any adjustments in the coolant maintenance log.

**Acceptance Criteria:** Coolant concentration within ±1% of target.

---

### W-02: Coolant pH Check

**Frequency:** Weekly
**Estimated Time:** 3 minutes
**Equipment:** Calibrated pH test strips (range 7.0–11.0) or digital pH meter
**PPE Required:** Safety glasses, nitrile gloves

**Procedure:**
1. Collect a coolant sample as described in W-01.
2. If using pH strips: dip the strip in the sample, remove, and read color change after 1 minute. Compare to the color chart provided with the strips.
3. If using a digital pH meter: calibrate the meter per manufacturer's instructions before use. Rinse the electrode with clean water. Dip in the sample. Read the displayed pH value.
4. Acceptable pH range: 8.5–9.5 (Parameter B5.14–B5.15).
5. If pH is below 8.5: add pH adjustor (alkali) per coolant manufacturer's recommendation. Do not add more than 0.1% by volume per adjustment and re-test.
6. If pH is above 9.5: dilute the coolant slightly or replace with fresh mixture. High pH can cause skin irritation.
7. If pH drops rapidly (more than 0.5 pH units per week): suspect bacterial contamination. Perform bacteria test (W-04) immediately.
8. Record pH reading and any adjustments.

**Acceptance Criteria:** pH between 8.5 and 9.5.

---

### W-03: Coolant Inlet Strainer Cleaning

**Frequency:** Weekly (or more often in high chip-load applications)
**Estimated Time:** 10 minutes
**PPE Required:** Safety glasses, nitrile gloves, face shield

**Procedure:**
1. Turn off the coolant pump at the operator panel.
2. Allow any pressure to bleed from the coolant line (the pump will purge within 30 seconds after shutoff).
3. Locate the coolant pump inlet strainer. The strainer is located on the coolant pump inlet pipe inside the coolant tank.
4. Close the isolation valve on the pump inlet line (if equipped) to minimize coolant spill.
5. Unscrew the strainer housing (twist counter-clockwise or use a strap wrench on the housing OD).
6. Remove the stainless steel screen basket from the housing.
7. Rinse the screen basket in clean water and brush off accumulated chips and debris with a soft brush.
8. Inspect the screen for tears, holes, or deformation. A damaged screen allows fine chips to reach the pump and cause premature wear.
9. If screen is damaged: replace with Part No. BC-STR-CLT-001 (150 μm stainless screen, complete assembly).
10. If screen is clean and undamaged: reinstall in the housing.
11. Reinstall the housing. Hand-tighten, then tighten 1/4 turn further with strap wrench.
12. Open the isolation valve. Turn on the coolant pump. Verify no leaks at the strainer housing.

---

### W-04: Tool Changer Area Inspection and Cleaning

**Frequency:** Weekly
**Estimated Time:** 10 minutes
**PPE Required:** Safety glasses, cut-resistant gloves

**Procedure:**
1. With the machine in HOME mode and ATC arm at home position, open the tool changer access panel (top of machine, above ATC area).
2. Visually inspect all 24 tool pots in the carousel:
   - Check for chips or debris inside tool pots (chips can prevent tool insertion)
   - Check for damaged or deformed gripper fingers
   - Check for any tool holders that appear to be sitting loosely in a pot
3. Clean chips from inside the tool pots using a chip brush or compressed air (at reduced pressure, 2 bar, directed carefully to avoid scattering chips into the drive mechanism).
4. Inspect the ATC arm grippers (two grippers on the ATC arm):
   - Gripper fingers should be clean and move freely
   - Check for worn gripper pads (replace if worn through to the substrate)
5. Clean the ATC arm and carousel with clean rags.
6. Apply a small amount of ATC arm grease (BC-GRS-ATC-001) to the ATC arm slide surfaces (if required per ATC greasing schedule — see Section 9.11).
7. Check the ATC sensors (SEN-ATC-HOME through SEN-ATC-RET) for:
   - Physical damage (impact marks, cracked housings)
   - Coolant buildup on sensor face
   - Correct sensor mounting (no loose bracket bolts)
8. Close the access panel.

---

### W-05: Guideway Wiper Inspection

**Frequency:** Weekly
**Estimated Time:** 10 minutes

**Procedure:**
1. Jog each axis to the center of its travel range.
2. Inspect the axis wiper seals:
   - X-axis: wipers are at the front and rear of the X-axis linear guideway carriages, visible through the side access panel
   - Y-axis: wipers are at the front and rear of the Y-axis carriages
   - Z-axis: wipers are at the top and bottom of the Z-axis carriages
3. Inspect each wiper seal for:
   - Cuts, tears, or missing sections
   - Excessive chip accumulation at the wiper (may indicate wiper seal is not clearing chips properly)
   - Coolant infiltration past the wiper (oil or coolant visible behind the wiper lip — should not be present)
4. Clean any chip accumulation from the wiper areas.
5. If any wiper seal is damaged: replace before the next production shift. Damaged wiper seals allow chips and coolant to reach the guideway rollers and cause rapid guideway wear.
   - Wiper seal replacement parts: BC-WPR-X-001, BC-WPR-Y-001, BC-WPR-Z-001

---

## 9.4 Monthly Maintenance Tasks

### M-01: Coolant Bacteria Test

**Frequency:** Monthly
**Estimated Time:** 15 minutes plus 24-hour incubation
**Equipment:** Bacteria dip-slide test kit (e.g., Petrifilm, Cide-Slide, or equivalent)
**PPE Required:** Safety glasses, nitrile gloves

**Procedure:**
1. Collect a coolant sample from the mid-depth of the coolant tank.
2. Prepare the dip-slide test per the kit manufacturer's instructions.
3. Record the result after the incubation period specified by the kit manufacturer (typically 24–48 hours):
   - Colony count < 10,000 cfu/mL: acceptable
   - Colony count 10,000–100,000 cfu/mL: add biocide and re-test within one week
   - Colony count > 100,000 cfu/mL: coolant is heavily contaminated — perform emergency coolant replacement (Section 9.9)

**If Bacteria Count is Elevated:**
1. Add an approved biocide at the manufacturer's recommended dose. Do NOT exceed recommended dose (excessive biocide can cause skin sensitization and may damage machine seals).
2. Run the coolant pump for 30 minutes with no machining to circulate the biocide throughout the system.
3. Re-test in 24–48 hours.
4. Record biocide type, dose, date, and bacteria count before and after treatment.

---

### M-02: Hydraulic Return Filter Inspection

**Frequency:** Monthly visual inspection; replacement per schedule (Section 9.15)
**Estimated Time:** 10 minutes

**Procedure:**
1. Locate the hydraulic return filter on the HPU. The filter housing is mounted on the return line from the machine circuits to the HPU tank.
2. Observe the filter bypass indicator (differential pressure gauge or pop-up indicator on filter housing):
   - If indicator is in the "green" zone: filter is not bypassing; continue normal operation
   - If indicator is in the "yellow" zone: filter is partially bypassed; schedule replacement within one week
   - If indicator is in the "red" zone: filter is fully bypassed (fault E414 may be active); replace the filter element immediately
3. Record the filter status observation in the maintenance log.
4. If replacement is required: see Section 9.15 for filter replacement procedure.

---

### M-03: Encoder Cable Inspection

**Frequency:** Monthly
**Estimated Time:** 20 minutes
**PPE Required:** Safety glasses

**Procedure:**
1. Jog Z-axis to the home (full up) position.
2. Open the Z-axis energy chain cover.
3. Visually inspect the encoder cable (Part No. BC-CBL-SPENC-3M) along its full length through the Z-axis energy chain:
   - Look for cuts, abrasions, or flattening of the cable jacket
   - Inspect the cable at the first and last 300 mm of the energy chain entry/exit points
   - Look for any cable that has come loose from the energy chain retainer clips
4. Jog Z-axis to the minimum Z position (Z = -300 mm).
5. Re-inspect the cable. The cable should flex smoothly; no tight bends or kinking should be visible.
6. Repeat the inspection for X and Y axis encoder cables in their respective cable trays.
7. If any cable shows signs of damage: order a replacement cable immediately and schedule cable replacement (Section 9.12).

**Key Inspection Points:**

| Cable | Critical Inspection Area |
|-------|--------------------------|
| Spindle encoder (BC-CBL-SPENC-3M) | Z-axis energy chain entry/exit points |
| Z-axis encoder (BC-CBL-ENC-5M) | Z-axis energy chain alongside spindle encoder cable |
| X-axis encoder (BC-CBL-ENC-5M) | X-axis cable tray entry/exit |
| Y-axis encoder (BC-CBL-ENC-5M) | Y-axis cable tray, under machine base |

---

### M-04: Way Lube System Check

**Frequency:** Monthly
**Estimated Time:** 15 minutes

**Procedure:**
1. Verify way lube oil level (already done daily — use this monthly check to verify the RATE of oil consumption, which indicates system health).
2. Record the oil level and date in the maintenance log. Compare to the previous month's reading to calculate consumption rate.
   - Expected consumption: approximately 50–100 mL per 100 hours of operation
   - Higher consumption: indicates a leak in the distribution tubing
   - Lower consumption: indicates a blocked distribution line or failed pump
3. Navigate to SYSTEM → DIAGNOSTIC → LUBE → WAY LUBE CYCLE COUNT. Record the number of cycles since last power-on and compare to expected (1 cycle per B9.20 minutes of operation).
4. If cycle count is lower than expected: the lube pump may not be activating. Check the pump motor (manually trigger a cycle: SYSTEM → MAINT → WAY LUBE → MANUAL CYCLE and listen for the pump).
5. Verify lube reaches all points: after a manual lube cycle, inspect each carriage lubrication nipple on all axes. You should see a fresh film of oil at the carriage wiper area.

---

### M-05: Magnetic Chip Separator Cleaning

**Frequency:** Monthly
**Estimated Time:** 10 minutes
**PPE Required:** Safety glasses, cut-resistant gloves

**Procedure:**
1. Turn off the coolant pump.
2. Lift the magnetic chip separator bars out of the coolant tank (the bars are suspended from a frame above the tank level).
3. Wipe the accumulated magnetic chips and swarf from the magnet bars using a clean rag. The chips will be held firmly by the magnet — use firm wiping force.
4. Dispose of the chip-laden rag in the metal chip collection bin.
5. Reinstall the magnetic separator bars in the tank.
6. Restart the coolant pump.
7. Note: The magnetic separator only removes ferromagnetic chips. Aluminum, brass, and copper chips are not collected; these must be removed through the inlet strainer.

---

## 9.5 Quarterly Maintenance Tasks

### Q-01: Axis Positioning Accuracy Check

**Frequency:** Quarterly
**Estimated Time:** 2 hours
**Equipment:** Laser interferometer (Renishaw ML10+, API Tracker, or equivalent) or calibrated linear scale and indicator
**PPE Required:** Safety glasses

**Procedure:**
1. The machine must be at thermal equilibrium. Allow the machine to run at idle (no cutting) for at least 4 hours before measuring.
2. Set up the laser interferometer in the X-axis direction, with retroreflector on the machine table and interferometer head fixed to the column.
3. Home all axes.
4. Execute the positioning measurement cycle program (BetaCorp test program O00001005 — Axis Accuracy Check). This program moves each axis to a series of positions (10 equally-spaced positions across the full travel, 5 bidirectional passes per ISO 230-2).
5. Record the position error at each measured point.
6. Compare to the acceptance specification: ±0.005 mm (positioning accuracy), ±0.003 mm (repeatability).
7. Repeat for Y-axis and Z-axis.
8. If any axis is out of specification:
   - Check ballscrew backlash compensation (B2.06, B2.16, B2.26)
   - Check for changes in machine level (re-level if required)
   - If systematic error (scale factor error): check ballscrew pitch parameter (B6.06, B6.16, B6.26) against actual ballscrew pitch measurement
   - Contact BetaCorp Systems if accuracy cannot be restored by parameter adjustment

---

### Q-02: Spindle Run-Out Check

**Frequency:** Quarterly
**Estimated Time:** 30 minutes
**Equipment:** Test indicator (0.001 mm resolution), magnetic base, precision ground test mandrel

**Procedure:**
1. Clean the spindle taper and test mandrel with clean solvent (acetone or IPA) to remove any oil or chips.
2. Insert the test mandrel in the spindle. Tighten the draw bar by running the spindle briefly (M03 S100, M05) to seat the mandrel.
3. Mount the test indicator on a magnetic base on the machine table.
4. Position the indicator probe to contact the mandrel at 25 mm from the spindle nose (gauge line).
5. Slowly rotate the spindle by hand. Read and record the total indicator reading (TIR).
6. Acceptance: TIR ≤ 0.005 mm at 25 mm from gauge line.
7. Move the indicator to contact the mandrel at 150 mm from the gauge line. Repeat the measurement.
8. Acceptance at 150 mm: TIR ≤ 0.015 mm.
9. If TIR exceeds acceptance criteria:
   - Clean the spindle taper thoroughly and repeat.
   - Inspect the test mandrel for damage (a ding or nick will give false reading).
   - If run-out persists after cleaning: the spindle bearings may be worn. Contact BetaCorp Systems.

---

### Q-03: ATC Sensor Verification

**Frequency:** Quarterly
**Estimated Time:** 45 minutes

**Procedure:**
1. Navigate to SYSTEM → DIAGNOSTIC → ATC STATUS.
2. Manually actuate each ATC sensor by hand (where safe to do so with machine powered off at the sensor locations) and verify the corresponding PLC input changes state.
3. For sensors that cannot be manually actuated safely: use the ATC manual cycle function (SYSTEM → ATC → MANUAL) to cycle through each ATC motion step and verify each sensor triggers at the correct point.
4. Check sensor gap (sensor face to target) for each proximity sensor. Correct gap: 0.5–1.5 mm.
5. If any sensor shows incorrect behavior: adjust, clean, or replace per Section 13.4.

---

### Q-04: Hydraulic Oil Sample Analysis

**Frequency:** Quarterly
**Estimated Time:** 5 minutes (sample collection); results in 3–5 business days from laboratory

**Procedure:**
1. With the HPU running and at operating temperature (at least 30 minutes after startup):
2. Using the hydraulic oil sampling port on the HPU return line (Part No. BC-PORT-HYD-SAMPLE), collect a 250 mL oil sample in a clean, capped sample bottle (provided by the oil analysis laboratory).
3. Label the sample bottle with:
   - Machine model and serial number
   - Date of sample
   - Oil type and brand
   - Machine hours since last oil change
   - Machine hours total
4. Send the sample to a hydraulic fluid analysis laboratory.
5. Request analysis for: viscosity, particle count (ISO 4406 cleanliness code), water content (Karl Fischer method), acid number (TAN), and wear metals (Fe, Cu, Al, Cr, Si).
6. Review the laboratory report when received:
   - ISO cleanliness code should be ≤ 16/14/11
   - Water content should be < 0.1%
   - TAN should be < 2.0 mg KOH/g
   - Wear metal concentrations increasing over successive samples indicate component wear
7. If any parameters are out of specification: consult BetaCorp Systems for guidance on oil change interval adjustment or system inspection.

---

## 9.6 Semi-Annual Maintenance Tasks

### S-01: Hydraulic Oil Change

**Frequency:** Every 6 months (or when oil analysis indicates earlier change is needed)
**Estimated Time:** 3 hours
**PPE Required:** Safety glasses, face shield, chemical-resistant gloves, oil-resistant apron
**Parts Required:** 50 L of ISO VG 46 hydraulic oil (BC-OIL-HYD-VG46 × 3 containers); BC-FLT-HYD-001 (return filter element); BC-SEAL-HYD-DRN (drain plug seal); oil drain container (minimum 60 L capacity)

For the complete hydraulic oil change procedure, see Section 9.8.

---

### S-02: Coolant Replacement

**Frequency:** Every 6 months (or when bacteria test indicates contamination, or when coolant has degraded beyond recovery)
**Estimated Time:** 4 hours
**PPE Required:** Safety glasses, face shield, nitrile gloves, chemical-resistant apron

For the complete coolant replacement procedure, see Section 9.9.

---

### S-03: Coolant Tank Cleaning

**Frequency:** Every 6 months (performed in conjunction with coolant replacement)
**Estimated Time:** 2 hours additional beyond coolant replacement

**Procedure (following coolant drain per Section 9.9):**
1. After coolant has been drained, open the coolant tank access cover (6 × M6 socket screws).
2. Using a wet-vacuum or mop, remove any remaining coolant sludge from the tank bottom.
3. Inspect the tank interior for:
   - Rust or corrosion on tank walls or bottom (316L stainless should not rust; any rust indicates incompatible coolant)
   - Sludge or biofilm deposits on walls
   - Damage to the internal baffles or filter screen mounts
4. Wash the tank interior with a solution of 1% trisodium phosphate (TSP) or an approved tank cleaner (consult coolant supplier). Allow to soak for 20 minutes.
5. Scrub tank walls with a stiff nylon brush. Do not use wire brushes or abrasives on stainless steel.
6. Rinse the tank thoroughly with clean water (3 complete fill-and-drain cycles with clean water).
7. Inspect the coolant pump inlet strainer inside the tank. Clean or replace per W-03 procedure.
8. Inspect the magnetic separator bars. Clean thoroughly.
9. Close the access cover. Torque the 6 × M6 screws to 8 N·m.
10. Fill with fresh coolant per Section 9.9.

---

### S-04: Motor Terminal Torque Check

**Frequency:** Semi-annual
**Estimated Time:** 1 hour
**PPE Required:** Full arc flash PPE (see Section 2.4.1); note: this task requires electrical LOTO

**Procedure:**
1. Lock out the machine per Section 2.4.2.
2. Wait 8 minutes for capacitor discharge.
3. Open the main electrical cabinet.
4. Using a calibrated torque screwdriver, verify the torque on the following terminal connections:
   - Main power supply terminals (L1, L2, L3): 20 N·m
   - Ground bus connections: 6 N·m
   - Servo drive motor output terminals: 2.5 N·m
   - Control transformer primary and secondary terminals: 1.5 N·m
   - 24 VDC power supply output terminals: 1.0 N·m
5. If any terminal is found loose (does not resist at the correct torque): re-torque and record.
6. Inspect all terminals for signs of overheating (discoloration, melted insulation, heat-damaged conductor).
7. If any sign of overheating is found: do not re-energize the machine. Contact BetaCorp Systems.

---

## 9.7 Annual Maintenance Tasks

### A-01: Full Geometry Calibration

**Frequency:** Annual (or after any major crash event or significant machine relocation)
**Estimated Time:** 4–8 hours
**Equipment:** Laser interferometer system; precision angle mirror; ball bar system (Renishaw QC20-W or equivalent)
**Performed by:** BetaCorp Systems service engineer or certified calibration laboratory

**Scope of Annual Calibration:**
- Full ISO 230-2 positioning accuracy measurement on all three axes
- ISO 230-1 straightness and angularity measurements
- Spindle run-out and taper measurement (all positions)
- Table flatness measurement
- Circular contouring test (ball bar)
- All measurements recorded on calibration certificate

**Calibration Certificate:**
After the annual calibration, a signed calibration certificate is issued by the calibrating engineer. This certificate is required for quality audits (ISO 9001, IATF 16949, AS9100) and should be stored with the machine records.

---

### A-02: Spindle Bearing Inspection

**Frequency:** Annual (supplemented by ongoing monitoring)
**Estimated Time:** 2 hours
**Equipment:** Vibration analyzer with acceleration spectrum (SKF CMVL 3600 or equivalent); infrared thermometer

**Procedure:**

**Step 1: Vibration Measurement**
1. Set up the vibration analyzer on the spindle head casting at the bearing location (front bearing, accessible from front of spindle head).
2. Run the spindle at the following speeds and record vibration spectrum at each: 1,000 / 3,000 / 5,000 / 7,500 / 10,000 RPM.
3. Record overall velocity RMS (mm/s) and acceleration peak (g).
4. Compare to baseline measurements taken at commissioning.

**Acceptance Criteria:**
| Spindle Speed | Max Velocity RMS | Max Acceleration Peak |
|---------------|-----------------|----------------------|
| 1,000 RPM | 2.0 mm/s | 2.0 g |
| 5,000 RPM | 3.0 mm/s | 4.0 g |
| 10,000 RPM | 5.0 mm/s | 8.0 g |

**Step 2: Temperature Measurement**
1. Run the spindle at 10,000 RPM for 30 minutes.
2. Measure spindle head temperature with IR thermometer at the front bearing area.
3. Acceptable: temperature rise above ambient should be less than 30°C.
4. If temperature rise exceeds 40°C: bearings may be failing or over-preloaded.

**Step 3: Acoustic Inspection**
1. Use an ultrasonic stethoscope (if available) or mechanic's stethoscope at the front bearing location.
2. Listen for irregular sounds:
   - Normal: smooth rushing sound, increases with speed
   - Abnormal: clicking, grinding, rumbling that changes character with speed

**Step 4: Evaluation and Action**
- If measurements are within specification and sound is normal: document results and continue monitoring.
- If measurements are out of specification: schedule spindle bearing replacement at the next convenient machine downtime.
- If sound is severely abnormal or temperature rise exceeds 50°C: stop machine immediately and schedule emergency spindle service.

For spindle bearing replacement procedure, contact BetaCorp Systems. Spindle bearing replacement requires a factory-trained service engineer.

---

## 9.8 Hydraulic Oil Change Procedure

The hydraulic oil change is one of the most important preventive maintenance tasks for the BC-500X. Degraded hydraulic oil causes valve sticking, pump wear, cylinder seal deterioration, and ultimately hydraulic system failure.

**When to Change Oil:**
- Every 2,000 machine operating hours (standard environment)
- Every 1,000 hours (severe environment: high temperature, high humidity, frequent contamination)
- When oil analysis indicates TAN > 2.0, water > 0.1%, or cleanliness code > 17/15/12
- When oil color has darkened from golden to dark brown or black
- After any hydraulic system failure or major contamination event

**Parts and Materials Required:**
- 50 L ISO VG 46 anti-wear hydraulic oil (BC-OIL-HYD-VG46)
- Return filter element (BC-FLT-HYD-001)
- Drain plug seal ring (BC-SEAL-HYD-DRN)
- Clean drain container (60 L minimum capacity)
- Funnel and fluid transfer pump
- Clean rags and spill absorbent

> **WARNING:** Hot hydraulic oil can cause severe burns. Allow the machine to cool for at least 60 minutes after shutdown before draining hydraulic oil. Wear chemical-resistant, heat-resistant gloves.

**Oil Change Procedure:**

**Step 1: Prepare for Drain**
1. Run the machine for at least 30 minutes to warm the oil (warm oil drains more completely than cold oil).
2. Stop the HPU (SYSTEM → HYDRAULICS → HPU STOP).
3. Lock out the machine per Section 2.4.2.
4. De-pressurize the hydraulic system per Section 2.6.2.
5. Allow 60 minutes for the oil to cool to below 40°C (check with IR thermometer).

**Step 2: Drain the Hydraulic Reservoir**
1. Position the drain container under the HPU drain plug. The drain plug is located at the lowest point of the HPU reservoir (bottom, rear).
2. Using a 24 mm hex socket, remove the drain plug.
3. Allow the reservoir to drain completely. This takes approximately 5–10 minutes.
4. While draining: remove the HPU reservoir access cover (typically 4 × M8 screws on top of HPU). Inspect the reservoir interior for:
   - Sludge or sediment deposits (indicates oil degradation)
   - Metal particles (indicates pump or valve wear)
   - Water (emulsion indicates water contamination)
5. If significant sludge or metal particles are found: flush the reservoir with 5 L of clean new hydraulic oil before filling. Swirl the flush oil to suspend deposits, then drain again.

**Step 3: Replace the Return Filter Element**
1. Locate the return filter housing on the HPU.
2. Place a drain tray under the filter housing.
3. Unscrew the filter housing (turn counter-clockwise). Most housings have a flat on the bottom for a strap wrench.
4. Remove the old filter element and dispose of it in an appropriate used filter container.
5. Clean the filter housing interior with a clean rag.
6. Install the new filter element (BC-FLT-HYD-001). The element is marked with the correct orientation.
7. Apply a thin film of clean hydraulic oil to the housing O-ring.
8. Reinstall the housing. Hand-tighten, then tighten 3/4 turn.

**Step 4: Replace the Drain Plug**
1. Install a new drain plug seal ring (BC-SEAL-HYD-DRN).
2. Reinstall the drain plug. Torque to 35 N·m (26 ft·lb).

**Step 5: Fill with New Oil**
1. Using a clean fluid transfer pump and funnel, add new ISO VG 46 hydraulic oil (BC-OIL-HYD-VG46) through the HPU fill port (breather/fill cap on top of reservoir).
2. Add oil slowly to avoid introducing air bubbles.
3. Add approximately 45 L (the reservoir holds 50 L but 5 L is needed to fill the circuit on first startup).
4. Check the sight glass level. It should be at or slightly below the MAX mark.
5. Replace the access cover.
6. Replace the fill cap/breather.

**Step 6: Bleed and Check System**
1. Restore machine power and remove LOTO.
2. Start the HPU (SYSTEM → HYDRAULICS → HPU START).
3. Allow the system to pressurize. The oil level in the reservoir will drop as the system fills (approximately 3–5 L).
4. Check the oil level. Add oil if the level is below the MIN mark.
5. Inspect all connections for leaks.
6. Operate each hydraulic actuator several times (Z-brake, tool change cycle) to bleed air from the system.
7. Re-check oil level after 10 minutes of operation and add oil if needed.

**Step 7: Document**
1. Record the oil change in the maintenance log: date, oil type and brand, volume added, filter replaced, technician name.
2. Reset the oil change hours counter: SYSTEM → MAINT → HYD OIL RESET.

---

## 9.9 Coolant Replacement Procedure

**When to Replace Coolant:**
- Every 6 months (standard)
- When bacteria test exceeds 100,000 cfu/mL and biocide treatment fails
- When pH drops below 7.5 or rises above 10.5 and cannot be corrected
- When coolant is black, malodorous, or has a "rotten egg" smell
- When coolant concentration cannot be maintained within specification
- After any contamination event (hydraulic oil breakthrough, solvent contamination)

**Materials Required:**
- Coolant drain pump or wet vacuum (minimum 350 L capacity)
- Fresh coolant concentrate (calculate per Chapter 12, Section 12.2)
- Clean water (municipal or filtered)
- Tank cleaner solution (TSP or approved cleaner)
- pH test kit
- Refractometer
- Clean hoses and containers

**Coolant Replacement Procedure:**

**Step 1: Drain the Coolant**
1. Turn off the coolant pump.
2. Open the coolant tank drain valve (G3/4 ball valve at the bottom of the coolant tank).
3. Allow coolant to drain into the collection container.
4. If equipped with a drain pump: use it to accelerate draining.
5. After drain valve draining, use a wet vacuum to remove residual coolant and sludge from the tank bottom.

**Step 2: Coolant Disposal**
Spent metalworking coolant is a regulated waste in most jurisdictions:
- Contact your local waste management authority for disposal requirements
- Use a licensed coolant recycler or waste disposal service
- Never pour coolant down drains without treatment; metalworking fluids contain lubricants, biocides, and metals that are regulated pollutants
- Keep the waste coolant at a separate labeled container area until pickup

**Step 3: Clean the Coolant Tank**
Follow the coolant tank cleaning procedure in Section 9.6 (Task S-03).

**Step 4: Mix Fresh Coolant**
1. Calculate the required volume of concentrate: see Chapter 12, Section 12.2.3.
2. For a 350 L tank at 8% concentration: 28 L of concentrate + 322 L of water.
3. Fill the tank with clean water first (to approximately 320 L).
4. Add the coolant concentrate to the water. Always add concentrate to water (never the reverse).
5. If using a concentrated product: add slowly and stir or allow the pump to circulate to mix.

**Step 5: Verify New Coolant Properties**
1. After filling and circulating for 10 minutes:
2. Measure concentration: target ±0.5% of target value.
3. Measure pH: should be 8.5–9.5 for freshly mixed solution.
4. Record in maintenance log.
5. Reset coolant hours counter: SYSTEM → MAINT → COOLANT RESET.

---

## 9.10 Spindle Bearing Inspection

Annual vibration-based inspection procedure is described in Section 9.7, Task A-02. The following supplementary guidance applies:

**Interim Spindle Health Monitoring:**

The BC-500X control includes a basic spindle health monitoring function that tracks spindle motor current as a proxy for spindle resistance (and therefore bearing drag). Monitor this value at: SYSTEM → DIAGNOSTIC → SPINDLE → BEARING LOAD INDEX.

The Bearing Load Index (BLI) is calculated from the no-load spindle motor current as a percentage of rated current at 5,000 RPM. It is normalized to 100% at commissioning.

| BLI Value | Interpretation |
|-----------|---------------|
| 90–110% | Normal bearing condition |
| 110–130% | Slight increase in drag — monitor more frequently |
| 130–150% | Significant bearing wear — schedule inspection |
| > 150% | Severe bearing drag — reduce spindle speed; schedule emergency inspection |

**Trigger for Emergency Inspection:**
Stop the machine and contact BetaCorp Systems immediately if any of the following occur:
- Abnormal noise from the spindle (grinding, squealing, clicking) at any speed
- Spindle head is too hot to hold your hand on for more than 3 seconds (approximately > 65°C)
- BLI exceeds 150%
- Spindle vibration causes visible workpiece surface finish deterioration

---

## 9.11 Tool Changer Lubrication

The BC-500X ATC system requires periodic lubrication of:
1. ATC arm cam follower and guide surfaces
2. Carousel worm gear

**ATC Arm Lubrication:**

**Frequency:** Every 500 tool changes (automatic cycle per B3.26–B3.28) or monthly manual, whichever comes first

**Grease Type:** BetaCorp ATC Grease (BC-GRS-ATC-001), NLGI Grade 2, lithium complex, extreme pressure

**Procedure:**
1. Navigate to SYSTEM → ATC → MANUAL → ARM HOME to verify the ATC arm is at the home position.
2. Open the ATC access panel (top of machine, above ATC).
3. Locate the two grease fittings (Zerk/Alemite style) on the ATC arm guide rails — one at the front of the arm travel, one at the rear.
4. Apply grease gun with compatible grease cartridge (BC-GRS-ATC-001).
5. Apply 3 pumps of grease at each fitting.
6. Operate the ATC arm through 5 full cycles (SYSTEM → ATC → MANUAL → CYCLE × 5) to distribute the grease.
7. Wipe excess grease from surfaces with a clean rag.

**Carousel Worm Gear Lubrication:**

**Frequency:** Every 6 months

**Grease Type:** Same as ATC arm (BC-GRS-ATC-001)

**Procedure:**
1. Lock out the machine (LOTO).
2. Remove the carousel drive gear access cover (rear of carousel mechanism, 4 × M6 socket screws).
3. Apply approximately 10 g of grease to the worm gear teeth using a grease brush.
4. Reinstall access cover.
5. Remove LOTO and run the carousel through 5 full rotations to distribute grease.
6. Check for excess grease ejection from the gear area; wipe excess.

---

## 9.12 Encoder Cable Inspection and Replacement

**Inspection:** Monthly per Section M-03.

**Replacement Trigger:** Replace encoder cables if:
- Any visible damage to the cable jacket (cuts, abrasions, crushing)
- Cable fails continuity test (> 0.5 ohm between shield and ground at cable ends)
- E101, E110, E111, or E112 faults occur and are traced to cable problems
- Preventive replacement interval: every 5 years or 15,000 machine hours (whichever comes first)

**Encoder Cable Replacement Procedure (Z-Axis Spindle Encoder, BC-CBL-SPENC-3M):**

This procedure is the most involved cable replacement due to the energy chain routing.

**Materials Required:**
- Replacement cable: BC-CBL-SPENC-3M (spindle encoder cable, 3 m)
- Cable ties and energy chain retainer clips as needed
- Electrical tape
- Small pry tool and long-nose pliers

**Procedure:**

1. Lock out the machine (LOTO).
2. Open the Z-axis energy chain cover along its full length.
3. Remove all cable retainer clips from the existing encoder cable in the energy chain. Note the clip positions (photograph before removal).
4. At the spindle motor end: loosen the cable strain relief fitting on the motor housing. Rotate counter-clockwise 2 full turns to loosen (do not remove completely).
5. At the drive end (in electrical cabinet): loosen the cable strain relief fitting at the cabinet entry.
6. Disconnect the encoder connector at the drive end (press the connector locking tab and pull). Label the disconnected connector.
7. Disconnect the encoder connector at the motor end.
8. Carefully pull the old cable through the energy chain. Thread the new cable through the energy chain before completely removing the old cable (use the old cable as a pull guide by taping the new cable to the tail of the old cable before pulling).
9. Feed the new cable through the full length of the energy chain.
10. Route the motor end of the new cable to the motor connector location. Connect the motor-end connector (press firmly until locking tab clicks).
11. Tighten the motor housing strain relief fitting: 2.5 N·m.
12. Route the drive end of the new cable to the drive cabinet entry point. Pass through the cabinet strain relief.
13. Connect the drive-end connector.
14. Verify the cable shield is connected to chassis ground at the drive end only (see Section 8.5.1).
15. Secure the cable in the energy chain with retainer clips at the same positions as the original.
16. Close the energy chain cover.
17. Remove LOTO. Power on the machine.
18. Navigate to SYSTEM → DIAGNOSTIC → ENCODER STATUS → SPINDLE. Verify signal quality = "OK."
19. Run the spindle at 500 RPM, 2,000 RPM, 5,000 RPM, and 10,000 RPM. Verify E101 does not occur.
20. Record the cable replacement in the maintenance log (part number, date, reason, technician).

---

## 9.13 Ballscrew and Guideway Maintenance

### 9.13.1 Ballscrew Maintenance

The BC-500X ballscrews require minimal direct maintenance beyond the centralized way lube system. The following periodic inspections are required:

**Quarterly Ballscrew Inspection:**

1. With machine LOTO'd, access the ballscrew along its length by opening the axis cover panels (where accessible — not all of the ballscrew may be directly visible without removing covers).
2. Inspect the accessible ballscrew shaft for:
   - Coolant or chip contamination on the shaft (indicates wiper seal failure)
   - Rust spots (indicates inadequate lubrication or coolant water contamination)
   - Visible damage to the ball circuit helix (rare; would cause irregular motion)
3. Inspect the ballscrew nut for:
   - Oil seal condition (seals at each end of the nut should be intact and not hardened)
   - Looseness between nut and ballscrew (backlash greater than 0.002 mm indicates preload loss)
4. Check ballscrew-to-servo motor coupling (bellows coupling):
   - Inspect bellows for cracks or tears
   - Verify coupling is secure on both shafts (no axial play)
   - Part No. BC-CUP-X-001 / BC-CUP-Y-001 / BC-CUP-Z-001

**Ballscrew Replacement:**
Ballscrew replacement is a major service event requiring machine re-calibration afterward. Expected service life of the BC-500X ballscrews:
- X and Y axes: 15,000–25,000 hours under normal use
- Z-axis: 10,000–20,000 hours (higher load due to gravity)

Contact BetaCorp Systems when ballscrew replacement is anticipated.

### 9.13.2 Linear Guideway Maintenance

The linear guideways require proper lubrication (provided by the centralized way lube system) and protection from chip contamination (provided by wiper seals).

**Annual Guideway Carriage Re-Lubrication:**

In addition to the automatic way lube system, the guideway carriages should be manually re-lubricated annually at the grease fitting on each carriage:
1. Lock out machine (LOTO).
2. Using a grease gun with a suitable fitting, apply 2 mL of ISO VG 68 way lube oil (or equivalent guideway grease per IKO specification) to the grease fitting on each carriage.
3. Operate the axis through full travel 5 times to distribute the grease.
4. Wipe excess from the rail surface.

---

## 9.14 Way Lube System Maintenance

**Monthly:** Check oil level and consumption rate (Task M-04).
**Semi-annual:** Full system inspection, as follows:

**Semi-Annual Way Lube System Inspection:**

1. Lock out machine (LOTO).
2. At each lubrication distribution manifold (X-axis manifold: BC-LUB-MAN-X; Y-axis: BC-LUB-MAN-Y; Z-axis: BC-LUB-MAN-Z):
   - Inspect manifold for cracks or damaged metering outlets
   - Verify all distribution tubes (4 mm OD nylon) are connected and not kinked or blocked
3. Inspect each distribution tube from manifold to lubrication point for:
   - Kinks, crushing, or disconnection
   - Discoloration or brittleness (degraded nylon)
4. Check each carriage lubrication nipple. Verify the nipple is clear (use a fine wire to check if blocked).
5. Manually trigger a way lube cycle (SYSTEM → MAINT → WAY LUBE → MANUAL CYCLE).
6. After the pump cycle, press a clean white paper against each carriage wiper area. There should be a slight oil smear on the paper after the cycle.
7. If any point shows no oil transfer: the distribution tube or metering outlet is blocked. Replace the blocked section of tubing (BC-LUB-TUBE-4) or the manifold outlet.

---

## 9.15 Filter Replacement Schedule

**Summary of Filter Change Intervals:**

| Filter | Part No. | Replacement Interval |
|--------|----------|--------------------|
| Hydraulic return filter element | BC-FLT-HYD-001 | 1,000 hours or at bypass indicator |
| Coolant inlet strainer | BC-STR-CLT-001 | Replace if damaged; clean weekly |
| Way lube inline filter | BC-FLT-LUB-001 | 2,000 hours |
| Spindle oil-air lube filter | BC-FLT-OA-001 | 2,000 hours |
| Pneumatic FRL filter | BC-FLT-AIR-001 | 1,000 hours or when saturated |
| Coolant paper band filter (optional) | BC-FLT-PBF-001 (roll) | Replace when roll exhausted or saturated |
| Cabinet heat exchanger filter | BC-FLT-CAB-001 | 500 hours or as required |

**Hydraulic Return Filter Replacement Procedure (BC-FLT-HYD-001):**

1. LOTO machine; de-pressurize hydraulic system.
2. Position drain tray under filter housing.
3. Unscrew filter bowl counter-clockwise.
4. Remove old element and dispose in waste filter container.
5. Clean inside of filter bowl.
6. Install new element (BC-FLT-HYD-001) in bowl.
7. Apply thin film of clean hydraulic oil to bowl O-ring.
8. Reinstall bowl; hand-tighten plus 3/4 turn.
9. Remove LOTO; start HPU; verify no leaks.
10. Record in maintenance log.

---

*End of Chapter 9 — Maintenance Schedule*


---

# PART 9 — SPARE PARTS CATALOG

---

# Chapter 10 — Spare Parts Catalog

## 10.1 How to Order Parts

**Ordering Methods:**

| Method | Contact | Notes |
|--------|---------|-------|
| Online Portal | parts.betacorpsystems.com | Requires customer account login |
| Phone | +1 (800) 555-BETA (Option 2 — Parts) | Mon–Fri 7:00 AM–6:00 PM EST |
| Email | parts@betacorpsystems.com | Include machine serial number |
| Fax | +1 (740) 555-9201 | Use BetaCorp Parts Order Form |

**Required Information When Ordering:**
- Machine model: BC-500X
- Machine serial number (from nameplate)
- BetaCorp part number (from this catalog)
- Quantity required
- Shipping address and contact name
- Purchase order number (or payment method for non-account customers)

**Shipping Options:**
- Standard: 3–5 business days (continental US)
- Expedite: Next business day (for in-stock items)
- Emergency 24/7: Call the emergency hotline at +1 (800) 555-9911 for critical machine-down situations

**Parts Warranty:**
All genuine BetaCorp replacement parts are warranted for 90 days from installation (6 months for new-machine warranty parts) against defects in materials and workmanship.

> **CAUTION:** The use of non-BetaCorp replacement parts may void the machine warranty and may introduce compatibility or safety issues. BetaCorp strongly recommends the use of genuine BetaCorp parts for all service replacements.

---

## 10.2 Spindle Assembly Parts

| Part No. | Description | Qty per Machine | Unit | Notes |
|----------|-------------|-----------------|------|-------|
| BC-MTR-SP-001 | Spindle motor assembly, 15 kW, with encoder | 1 | EA | Includes motor and integral encoder mount |
| BC-GBX-SP-001 | Spindle gearbox assembly, 2-speed | 1 | EA | Complete gearbox with housing |
| BC-BRG-SP-001 | Spindle front bearing, matched pair (angular contact, 15°) | 1 SET | EA | High-precision P5; must be replaced as matched pair |
| BC-BRG-SP-002 | Spindle front bearing, single (tandem companion) | 1 | EA | Matched to BC-BRG-SP-001 set |
| BC-BRG-SP-003 | Spindle rear bearing, deep groove | 1 | EA | Standard precision |
| BC-BRG-SP-004 | Spindle rear bearing, angular contact, floating | 1 | EA | |
| BC-DRB-SP-001 | Draw bar assembly, complete (CAT-40/BT-40 specify) | 1 | EA | Specify taper at order |
| BC-BELL-SP-001 | Belleville washer stack (10-piece set) | 1 SET | EA | Replace entire stack; do not mix old and new washers |
| BC-COL-SP-CAT40 | Collet assembly, CAT-40 | 1 | EA | For CAT-40 taper machines |
| BC-COL-SP-BT40 | Collet assembly, BT-40 | 1 | EA | For BT-40 taper machines |
| BC-SEAL-SP-UC-001 | Unclamp cylinder seal kit | 1 KIT | EA | Contains all seals for unclamp cylinder |
| BC-SEN-SP-SEAT | Tool seating proximity sensor | 1 | EA | Inductive, NPN, NO |
| BC-OR-SP-001 | Spindle air purge orifice plate | 1 | EA | Stainless steel; diameter 1.5 mm |
| BC-ENC-SP-001 | Spindle encoder, Heidenhain ROD 420, 4096 PPR | 1 | EA | |
| BC-CBL-SPENC-3M | Spindle encoder cable, 3 m, shielded | 1 | EA | RS-422 differential; replace at 5 years |
| BC-CUP-SP-001 | Spindle encoder shaft coupling (bellows) | 1 | EA | Backlash-free; inspect annually |
| BC-CON-ENC-12P | Encoder cable connector, motor end (12-pin) | 2 | EA | Order 2; one spare |
| BC-CON-ENC-DRV | Encoder cable connector, drive end | 1 | EA | |
| BC-LUB-OA-001 | Oil-air lubrication unit, spindle | 1 | EA | With 2L reservoir |
| BC-LUB-OA-OIL | Oil-air lube oil, ISO VG 32, 1L | 1 | L | Mobil Velocite No. 6 or equivalent |
| BC-FLT-OA-001 | Oil-air lube inline filter element | 1 | EA | Replace every 2,000 hours |
| BC-NOS-SP-001 | Spindle nose protector cap (for shipping/storage) | 1 | EA | |
| BC-KEY-SP-001 | Spindle drive key (CAT-40) | 2 | EA | Used for manual tool tightening |
| BC-TOOL-0224 | Spindle wrench (for manual tool installation) | 1 | EA | Hold the spindle during non-ATC tool changes |

---

## 10.3 Axis Drive Parts

**X-Axis Parts:**

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-MTR-X-001 | X-axis servo motor, BetaCorp SM-300-3K, 3 kW | 1 | EA | |
| BC-DRV-X-001 | X-axis servo drive, BetaCorp SD-300, 3 kW | 1 | EA | |
| BC-BSC-X-001 | X-axis ballscrew assembly, Ø40 × pitch 10, Class 3 | 1 | EA | Complete with fixed end support |
| BC-NUT-X-001 | X-axis ballscrew nut, double-nut preloaded | 1 | EA | Replace nut assembly, not just nut body |
| BC-BRG-X-FIX | X-axis ballscrew fixed end bearings (matched pair) | 1 SET | EA | Angular contact, matched pair |
| BC-BRG-X-FLT | X-axis ballscrew floating end bearing | 1 | EA | Deep groove ball |
| BC-GWY-X-L | X-axis linear guideway, left rail (IKO LRWE55) | 1 | EA | Contact BetaCorp for installation service |
| BC-GWY-X-R | X-axis linear guideway, right rail | 1 | EA | |
| BC-CAR-X-001 | X-axis guideway carriage (IKO LWRE55) | 4 | EA | 4 carriages per machine (2 per rail) |
| BC-ENC-X-001 | X-axis encoder, Heidenhain ERN 1381, 2500 PPR | 1 | EA | |
| BC-CBL-ENC-5M | Axis encoder cable, 5 m, shielded (X, Y, Z universal) | 4 | EA | Order 4: 1 per axis + 1 spare |
| BC-CUP-X-001 | X-axis servo motor coupling (bellows) | 1 | EA | |
| BC-COV-X-001 | X-axis telescoping cover set (3 sections) | 1 SET | EA | |
| BC-WPR-X-001 | X-axis guideway wiper seal set | 1 SET | EA | 8 wipers per set (4 carriages × 2) |
| BC-SW-OTRV-001 | Over-travel limit switch (X, Y, Z universal) | 6 | EA | Order 6 (one per travel limit direction) |

**Y-Axis Parts:**

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-MTR-Y-001 | Y-axis servo motor, BetaCorp SM-300-3K, 3 kW | 1 | EA | |
| BC-DRV-Y-001 | Y-axis servo drive, BetaCorp SD-300, 3 kW | 1 | EA | |
| BC-BSC-Y-001 | Y-axis ballscrew assembly, Ø40 × pitch 10, Class 3 | 1 | EA | |
| BC-NUT-Y-001 | Y-axis ballscrew nut | 1 | EA | |
| BC-BRG-Y-FIX | Y-axis fixed end bearings | 1 SET | EA | |
| BC-BRG-Y-FLT | Y-axis floating end bearing | 1 | EA | |
| BC-GWY-Y-F | Y-axis guideway, front rail (IKO LRWE55) | 1 | EA | |
| BC-GWY-Y-R | Y-axis guideway, rear rail | 1 | EA | |
| BC-CAR-Y-001 | Y-axis guideway carriage | 4 | EA | |
| BC-ENC-Y-001 | Y-axis encoder, Heidenhain ERN 1381, 2500 PPR | 1 | EA | |
| BC-CUP-Y-001 | Y-axis motor coupling | 1 | EA | |
| BC-COV-Y-001 | Y-axis accordion bellows cover set | 1 SET | EA | |
| BC-WPR-Y-001 | Y-axis guideway wiper seal set | 1 SET | EA | |

**Z-Axis Parts:**

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-MTR-Z-001 | Z-axis servo motor, BetaCorp SM-400-3K, 4 kW | 1 | EA | |
| BC-DRV-Z-001 | Z-axis servo drive, BetaCorp SD-400, 4 kW | 1 | EA | |
| BC-BSC-Z-001 | Z-axis ballscrew assembly, Ø50 × pitch 10, Class 3 | 1 | EA | Ground ballscrew (higher accuracy) |
| BC-NUT-Z-001 | Z-axis ballscrew nut | 1 | EA | |
| BC-BRG-Z-FIX | Z-axis fixed end bearings | 1 SET | EA | |
| BC-BRG-Z-FLT | Z-axis floating end bearing | 1 | EA | |
| BC-GWY-Z-L | Z-axis guideway, left rail (IKO LRWE65) | 1 | EA | Larger rail than X/Y |
| BC-GWY-Z-R | Z-axis guideway, right rail | 1 | EA | |
| BC-CAR-Z-001 | Z-axis guideway carriage (IKO LWRE65) | 4 | EA | |
| BC-ENC-Z-001 | Z-axis encoder, Heidenhain ERN 1381, 2500 PPR | 1 | EA | |
| BC-CUP-Z-001 | Z-axis motor coupling | 1 | EA | |
| BC-COV-Z-001 | Z-axis accordion bellows cover set | 1 SET | EA | |
| BC-WPR-Z-001 | Z-axis guideway wiper seal set | 1 SET | EA | |
| BC-CYL-Z-BRK | Z-axis hydraulic brake cylinder | 1 | EA | Critical safety component |
| BC-PSW-Z-BRK | Z-axis brake pressure switch | 1 | EA | |
| BC-TOOL-4417 | Z-axis safety block (for maintenance) | 1 | EA | Must be on-site; store in machine tool cabinet |

---

## 10.4 Tool Changer Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-MTR-ATC-001 | ATC carousel servo motor, 0.75 kW | 1 | EA | |
| BC-DRV-ATC-001 | ATC carousel servo drive | 1 | EA | |
| BC-POT-CAT40 | Tool pot complete assembly, CAT-40 | 24 | EA | One per carousel position |
| BC-POT-BT40 | Tool pot complete assembly, BT-40 | 24 | EA | Alternative taper |
| BC-GRP-CAT40-SET | Gripper finger set, 3 pcs, CAT-40 | 1 SET | EA | Replace as complete set |
| BC-SPR-POT-001 | Tool pot wave spring | 24 | EA | One per pot; replace if retention force drops |
| BC-POT-BODY-001 | Tool pot body only | 4 | EA | Spare bodies |
| BC-POT-BOLT-M8 | Tool pot retention bolt, M8 × 25, GR 8.8 | 48 | EA | |
| BC-ATC-ARM-001 | ATC arm complete assembly | 1 | EA | Major assembly; contact BetaCorp for installation |
| BC-ATC-CAM-001 | ATC cam shaft assembly | 1 | EA | |
| BC-ATC-HYD-MTR | ATC hydraulic motor (for cam drive) | 1 | EA | |
| BC-ATC-GRP-L | ATC arm gripper, left | 2 | EA | Order 2; one spare |
| BC-ATC-GRP-R | ATC arm gripper, right | 2 | EA | |
| BC-ATC-GRP-SPR | ATC arm gripper spring | 4 | EA | |
| BC-ATC-CFW-001 | ATC arm cam follower | 2 | EA | |
| BC-SEN-ATC-HOME | ATC arm home sensor | 1 | EA | Inductive, NPN, NC |
| BC-SEN-ATC-090 | ATC arm 90° sensor | 1 | EA | |
| BC-SEN-ATC-180 | ATC arm 180° sensor | 1 | EA | |
| BC-SEN-ATC-EXT | ATC arm extended sensor | 1 | EA | |
| BC-SEN-ATC-RET | ATC arm retracted sensor | 1 | EA | |
| BC-SEN-CAR-HOME | Carousel home sensor | 1 | EA | |
| BC-SEN-TP-001 | Tool presence sensor (one per pot; order 24) | 24 | EA | Inductive, NPN, NO |
| BC-CYL-ATC-EXT | ATC arm extend/retract cylinder | 1 | EA | |
| BC-SEAL-ATC-CYL | ATC cylinder seal kit | 1 KIT | EA | All seals for ATC cylinder |
| BC-SOL-ATC-EXT | ATC arm extend solenoid valve (SOL-HYD-03) | 1 | EA | |
| BC-SOL-ATC-RET | ATC arm retract solenoid valve (SOL-HYD-04) | 1 | EA | |
| BC-SOL-ATC-CW | ATC arm rotate CW solenoid (SOL-HYD-05) | 1 | EA | |
| BC-SOL-ATC-CCW | ATC arm rotate CCW solenoid (SOL-HYD-06) | 1 | EA | |
| BC-GRS-ATC-001 | ATC arm grease, NLGI 2 Li-complex EP, 400 g cartridge | 2 | EA | |

---

## 10.5 Hydraulic System Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-PMP-HYD-001 | Hydraulic gear pump, 8.3 cc/rev | 1 | EA | Parker PGP505 or equivalent |
| BC-MTR-HP-001 | Hydraulic pump motor, 4 kW, 1,450 RPM | 1 | EA | |
| BC-RLV-HYD-MAIN | Main system relief valve, 210 bar | 1 | EA | Factory-set; do not adjust |
| BC-PSW-HYD-MAIN | Hydraulic pressure switch, 120/100 bar | 1 | EA | |
| BC-FLT-HYD-001 | Hydraulic return filter element, 10 μm abs | 4 | EA | Order 4 for annual stock |
| BC-SEAL-HYD-DRN | HPU drain plug seal, bonded washer | 6 | EA | Replace each oil change |
| BC-SOL-ZBK-001 | Z-brake solenoid valve (SOL-HYD-01) | 1 | EA | |
| BC-SOL-TU-001 | Tool unclamp solenoid (SOL-HYD-02) | 1 | EA | |
| BC-SOL-GCH-LO | Gear change low solenoid (SOL-HYD-07) | 1 | EA | |
| BC-SOL-GCH-HI | Gear change high solenoid (SOL-HYD-08) | 1 | EA | |
| BC-PRV-GCH-001 | Gear change pressure reducing valve, 80 bar | 1 | EA | |
| BC-PRV-TU-001 | Tool unclamp pressure reducing valve, 150 bar | 1 | EA | |
| BC-CYL-TU-001 | Tool unclamp cylinder | 1 | EA | |
| BC-SEAL-TU-CYL | Tool unclamp cylinder seal kit | 1 KIT | EA | |
| BC-CYL-GCH-001 | Gear change cylinder | 1 | EA | |
| BC-SEAL-GCH-CYL | Gear change cylinder seal kit | 1 KIT | EA | |
| BC-HYD-HOSE-10 | Hydraulic hose, 10 mm ID, 210 bar, 1 m | 10 | EA | Specify length at order |
| BC-OIL-HYD-VG46 | ISO VG 46 hydraulic oil, 20 L container | 3 | EA | Full system fill = 50 L |
| BC-PORT-HYD-SAMPLE | Hydraulic oil sampling port | 1 | EA | For oil analysis sampling |
| BC-HEX-HPU-001 | HPU oil cooler, air-cooled, 500 W | 1 | EA | |
| BC-FAN-HPU-001 | HPU cooling fan, 0.18 kW | 1 | EA | |
| BC-GAUGE-HYD-001 | Hydraulic pressure gauge, 0–250 bar, 63 mm | 1 | EA | Glycerin-filled |
| BC-GAUGE-THERM-001 | Hydraulic oil thermometer, 0–80°C | 1 | EA | |
| BC-SIGHT-HYD-001 | Hydraulic reservoir sight glass | 1 | EA | |

---

## 10.6 Coolant System Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-PMP-CLT-001 | Coolant pump assembly, 2.2 kW (complete) | 1 | EA | Centrifugal with mechanical seal |
| BC-SEAL-CLT-MECH | Coolant pump mechanical seal | 2 | EA | Replace every 2 years or on leak |
| BC-IMP-CLT-001 | Coolant pump impeller, stainless 316L | 1 | EA | |
| BC-STR-CLT-001 | Coolant inlet strainer, 150 μm, stainless | 2 | EA | Replace if damaged |
| BC-SW-CLT-LVL | Coolant level float switch | 2 | EA | One installed, one spare |
| BC-CBL-CLT-LVL-2M | Coolant level switch cable, 2 m | 1 | EA | |
| BC-TNK-CLT-001 | Coolant tank, complete, 316L SS | 1 | EA | Major part; contact BetaCorp |
| BC-NZL-CLT-001 | Coolant nozzle with gooseneck mount | 8 | EA | Order 8; 4 installed + 4 spare |
| BC-HOSE-CLT-1M | Coolant hose, 1 m, stainless fittings | 8 | EA | Nozzle supply hoses |
| BC-VLV-CLT-NZL | Coolant nozzle ball valve | 8 | EA | |
| BC-TEMP-CLT-001 | Coolant temperature sensor, RTD Pt100 | 1 | EA | |
| BC-MAG-CLT-001 | Magnetic chip separator bar set | 1 SET | EA | 4 bars per set |
| BC-LED-WORK-001 | Work zone LED lighting strip, IP65, 24VDC | 2 | EA | One installed, one spare |
| BC-WIN-PC-001 | Work zone polycarbonate window, 12 mm | 1 | EA | Replace if cracked or scratched |
| BC-LOK-DOOR-001 | Door electromagnetic lock, 24VDC | 1 | EA | |
| BC-SEAL-DOOR-001 | Work zone door seal (EPDM rubber, per meter) | 5 | M | Approx. 4 m needed per machine |
| BC-FLT-PBF-001 | Paper band filter roll (optional) | 2 | ROLL | Each roll: approximately 50 m |

---

## 10.7 Electrical and Control Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-DRV-SP-15K | Spindle drive, BetaCorp SD-SP-15K | 1 | EA | Vector control spindle drive |
| BC-TRANS-CTL-001 | Control transformer, 3 kVA, 480V/120V | 1 | EA | |
| BC-PSU-24V-001 | 24 VDC power supply, 20 A | 2 | EA | One installed, one spare |
| BC-PSU-5V-001 | 5 VDC power supply, 10 A (encoder supply) | 2 | EA | |
| BC-PLC-CPU-001 | PLC CPU module, BetaCorp PLC-5000 | 1 | EA | Contains machine PLC program |
| BC-PLC-IO-001 | PLC I/O expansion module, 32DI/32DO | 2 | EA | |
| BC-SREL-001 | Safety relay module, Pilz PNOZ X3 or equivalent | 2 | EA | E-Stop and door interlock relay |
| BC-CNC-CTRL-001 | CNC control unit, Model 5000 | 1 | EA | Complete control unit |
| BC-PEND-MPG-001 | MPG pendant assembly | 1 | EA | With handwheel, E-Stop, cable |
| BC-HEX-CAB-001 | Control cabinet heat exchanger, 1500W | 1 | EA | |
| BC-FLT-CAB-001 | Cabinet heat exchanger filter media | 6 | EA | Pack of 6; replace every 500 hours |
| BC-BATT-CNC-001 | CNC control backup battery (Li, 3V CR2) | 3 | EA | Replace every 3 years |
| BC-FUSE-MAIN-001 | Main disconnect fuses, Class J, 100 A, 600V (set of 3) | 2 | SET | |
| BC-FUSE-SP-001 | Spindle drive fuses, Class J, 50 A (set of 3) | 2 | SET | |
| BC-FUSE-SRV-001 | Servo drive fuses, Class J, 20 A (set of 3) | 6 | SET | 2 sets per servo axis |
| BC-FUSE-CLT-001 | Coolant pump fuses, Class J, 10 A (set of 3) | 2 | SET | |
| BC-RGEN-001 | Regenerative braking resistor (servo DC bus) | 1 | EA | External resistor bank |
| BC-SW-OTRV-001 | Over-travel limit switch, SPDT | 6 | EA | |
| BC-CONT-HYD-001 | HPU motor contactor, 12 A coil 120VAC | 1 | EA | |
| BC-OLRELAY-001 | Motor thermal overload relay | 4 | EA | One per motor |
| BC-CON-CIRC-12 | Circular connector, 12-pin, panel mount | 4 | EA | Sensor/encoder connectors |

---

## 10.8 Enclosure and Structure Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-WIN-PC-001 | Work zone polycarbonate window, 12 mm thick | 1 | EA | Replaces cracked/scratched window |
| BC-SEAL-DOOR-001 | Door seal, EPDM rubber, per meter | 5 | M | Sold by the meter |
| BC-LOK-DOOR-001 | Door electromagnetic lock, 24 VDC | 1 | EA | |
| BC-SW-DOOR-001 | Door interlock safety switch, Schmersal AZ16 | 2 | EA | Dual-channel; order pair |
| BC-HDL-DOOR-001 | Work zone door handle assembly | 1 | EA | |
| BC-GAS-DOOR-001 | Door counterbalance gas strut, 200 N | 2 | EA | Assists door opening; replace if door difficult to open |
| BC-COV-ATC-001 | ATC area access cover | 1 | EA | Sheet metal; includes mounting hardware |
| BC-COV-Z-001 | Z-axis accordion bellows set | 1 SET | EA | Replace if torn; prevents chip ingress |
| BC-COV-X-001 | X-axis telescoping cover set | 1 SET | EA | |
| BC-COV-Y-001 | Y-axis accordion bellows set | 1 SET | EA | |
| BC-LED-WORK-001 | Work zone LED light strip (replacement) | 2 | EA | |
| BC-FTP-LVL-001 | Leveling footpad assembly (complete) | 6 | EA | M24 bolt, pad, rubber element |

---

## 10.9 Lubrication System Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-LUB-PMP-001 | Way lube pump unit with 2.5L reservoir | 1 | EA | |
| BC-MTR-LUB-001 | Way lube pump motor, 0.12 kW | 1 | EA | |
| BC-LUB-MAN-X | Way lube distribution manifold, X-axis (4 outlet) | 1 | EA | |
| BC-LUB-MAN-Y | Way lube distribution manifold, Y-axis (4 outlet) | 1 | EA | |
| BC-LUB-MAN-Z | Way lube distribution manifold, Z-axis (4 outlet) | 1 | EA | |
| BC-LUB-TUBE-4 | Way lube distribution tubing, 4 mm OD nylon, 10 m | 6 | M/ROLL | |
| BC-LUB-OIL-VG68 | Way lube oil, ISO VG 68, 5L container | 2 | EA | Annual consumption: ~2 L |
| BC-LUB-LVL-SW | Way lube reservoir level switch | 1 | EA | Float type |
| BC-FLT-LUB-001 | Way lube inline filter, 25 μm | 2 | EA | |
| BC-LUB-FIT-001 | Lubrication nipple fittings (Zerk/Alemite), M6 (bag of 20) | 1 | BAG | |
| BC-OIL-VG32-1L | Spindle oil-air lube oil, ISO VG 32, 1 L | 4 | EA | Annual: ~2 L |

---

## 10.10 Chip Conveyor Parts

| Part No. | Description | Qty | Unit | Notes |
|----------|-------------|-----|------|-------|
| BC-CNV-CHIP-001 | Chip conveyor, complete assembly | 1 | EA | Specify dimensions at order |
| BC-MTR-CNV-001 | Chip conveyor drive motor/gearbox, 0.75 kW | 1 | EA | |
| BC-BELT-CNV-001 | Chip conveyor belt section, hinged steel, 250 mm wide, 1 m | 6 | M | Order per length needed |
| BC-PIN-CNV-001 | Chip conveyor hinge pins, SS 304, 250 mm length | 10 | EA | |
| BC-SPR-CNV-001 | Chip conveyor drive sprocket | 2 | EA | One per side |
| BC-CHN-CNV-001 | Chip conveyor drive chain, 1 m | 2 | M | |
| BC-BKT-CNV-001 | Chip collection bin (hopper), 120 L | 1 | EA | Formed steel with casters |
| BC-BRNG-CNV-001 | Chip conveyor return roller bearing | 4 | EA | |

---

## 10.11 Consumables and Wear Items

| Part No. | Description | Qty | Unit | Notes / Replacement Interval |
|----------|-------------|-----|------|-------------------------------|
| BC-FLT-HYD-001 | Hydraulic return filter element, 10 μm | 4 | EA | Every 1,000 hours |
| BC-FLT-AIR-001 | Pneumatic FRL filter element | 4 | EA | Every 1,000 hours |
| BC-FLT-LUB-001 | Way lube inline filter | 2 | EA | Every 2,000 hours |
| BC-FLT-CAB-001 | Cabinet heat exchanger filter (pack of 6) | 2 | PACK | Every 500 hours |
| BC-FLT-OA-001 | Oil-air lube filter | 2 | EA | Every 2,000 hours |
| BC-WPR-X-001 | X-axis wiper seal set | 2 | SET | Replace if damaged |
| BC-WPR-Y-001 | Y-axis wiper seal set | 2 | SET | Replace if damaged |
| BC-WPR-Z-001 | Z-axis wiper seal set | 2 | SET | Replace if damaged |
| BC-SEAL-SP-UC-001 | Spindle unclamp cylinder seal kit | 1 | KIT | Every 3 years |
| BC-SEAL-CLT-MECH | Coolant pump mechanical seal | 2 | EA | Every 2 years |
| BC-OIL-HYD-VG46 | Hydraulic oil, ISO VG 46, 20 L | 3 | EA | Every 6 months (full change) |
| BC-LUB-OIL-VG68 | Way lube oil, ISO VG 68, 5 L | 2 | EA | As consumed |
| BC-OIL-VG32-1L | Spindle bearing oil, ISO VG 32, 1 L | 4 | EA | As consumed |
| BC-GRS-ATC-001 | ATC grease, NLGI 2 Li-complex EP, 400 g | 4 | EA | As consumed |
| BC-BATT-CNC-001 | CNC backup battery, Li, 3V | 3 | EA | Every 3 years |
| BC-CBL-SPENC-3M | Spindle encoder cable | 1 | EA | Every 5 years or on damage |
| BC-CBL-ENC-5M | Axis encoder cable | 2 | EA | Every 5 years or on damage |
| BC-SEAL-HYD-DRN | Hydraulic drain plug seal | 6 | EA | Every oil change |
| BC-SPR-POT-001 | Tool pot wave spring | 10 | EA | Replace if retention force drops |
| BC-LED-WORK-001 | Work zone LED strip | 1 | EA | As needed |
| BC-WIN-PC-001 | Work zone window | 1 | EA | Replace if cracked |

---

*End of Chapter 10 — Spare Parts Catalog*

---

# PART 10 — HYDRAULIC SYSTEM MANUAL

---

# Chapter 11 — Hydraulic System Manual

## 11.1 Hydraulic System Overview

The BC-500X hydraulic system is a centralized, constant-pressure, fixed-displacement system that provides power for four machine functions: Z-axis brake, spindle tool unclamp, ATC arm actuation, and spindle gear change.

The system operates at a normal working pressure of 150 bar (2,176 psi) with a maximum relief valve setting of 210 bar (3,046 psi). The hydraulic power unit (HPU) is a self-contained assembly mounted on the right rear of the machine. All hydraulic actuators and valves are pre-piped to the HPU at the factory.

**Design Philosophy:**

The BC-500X hydraulic system uses a "load-sensitive" approach for pressure management:
- The fixed-displacement pump runs continuously when the HPU is on
- A pressure relief valve bypasses excess pump flow back to tank when all actuators are not demanding flow
- This design is simple, reliable, and immediately responsive to actuator demands

**Fail-Safe Design:**
All BC-500X hydraulic circuits are designed to fail to a safe state:
- Z-axis brake: spring-applied (safe = brake ON); hydraulic release
- Tool holder: spring-clamped (safe = tool held); hydraulic unclamp
- ATC arm: spring-centered (safe = arm retracted); hydraulic actuate
- Gear change: spring-held in last position (safe = maintain current gear)

This means that loss of hydraulic pressure leaves the machine in a mechanically safe state.

---

## 11.2 Hydraulic Circuit Description

The BC-500X hydraulic circuit is organized as follows:

**Main Supply Circuit:**
Hydraulic oil flows from the reservoir through the pump inlet strainer, through the gear pump, through the pressure check valve, and into the main supply manifold at 150 bar. The main relief valve (210 bar) is connected between the supply manifold and the return line.

**Z-Axis Brake Circuit:**
- Supply: from main manifold through SOL-HYD-01 (4/2, spring return) to Z-brake cylinder release port
- Return: through SOL-HYD-01 to tank when solenoid is de-energized
- Pressure reducing valve: none — full system pressure applied to brake
- Normally: SOL-HYD-01 de-energized → spring applies brake → Z-axis held
- Brake release: SOL-HYD-01 energized → hydraulic oil pushes against brake spring → brake releases

**Tool Unclamp Circuit:**
- Supply: from main manifold through PRV-HYD-02 (150 bar) → SOL-HYD-02 → tool unclamp cylinder
- The PRV limits maximum force applied to the draw bar
- Normally: SOL-HYD-02 de-energized → spring returns unclamp cylinder → draw bar spring clamps tool
- Unclamp: SOL-HYD-02 energized → hydraulic piston extends → pushes draw bar down → releases Belleville springs → collet opens → tool released

**ATC Arm Circuit:**
- A single double-rod cylinder actuates the arm extend/retract (SOL-HYD-03, SOL-HYD-04)
- A hydraulic motor driven through SOL-HYD-05 / SOL-HYD-06 rotates the arm cam shaft CW or CCW
- Flow control valves on each port control the arm speed (factory set; see B4.15)

**Gear Change Circuit:**
- From main manifold through PRV-HYD-01 (80 bar) to gear change cylinder
- SOL-HYD-07 (low gear) / SOL-HYD-08 (high gear) select gear
- Lower pressure (80 bar vs 150 bar) is used to avoid excessive force on the gear shift dogs

---

## 11.3 Hydraulic Power Unit (HPU)

The HPU is a compact, self-contained unit with the following major components:

**Reservoir:**
- 50 L capacity, mild steel with internal coating
- Removable access panel for internal inspection (4 × M8 screws)
- Sight glass with level indicator (MIN/MAX marks)
- Breather/fill cap with 10 μm filter
- Drain plug at lowest point
- Temperature indicator (analog thermometer, 0–80°C)
- Return line filter with differential pressure indicator

**Hydraulic Pump:**
- Parker PGP505 or equivalent gear pump
- Displacement: 8.3 cc/rev
- Drive motor: 4 kW, 1,450 RPM
- Flexible coupling between motor and pump shaft

**Pressure Relief Valve (Main):**
- Parker or Sun Hydraulics type
- Set at 210 bar (factory preset with tamper-resistant locknut)
- Direct-acting, poppet type

**Filter (Return Line):**
- Housing: spin-on type, cast aluminum
- Element: BC-FLT-HYD-001, 10 μm absolute, glass fiber
- Differential pressure indicator: visual pop-up type, set at 5 bar differential
- Built-in bypass at 6 bar differential (to protect filter from cold-oil damage at startup)

**Pressure Switch:**
- BC-PSW-HYD-MAIN
- Switching points: 120 bar (rising) and 100 bar (falling)
- Connects to PLC to signal E404

**Temperature Switch:**
- Wax-element type, 65°C setpoint (E411 warning)
- Second temperature switch at 70°C (E412 shutdown)

**Heat Exchanger:**
- Air-cooled (fan-assisted) oil cooler
- Capacity: 1,000 W at 40°C ambient
- Fan motor: 0.18 kW, integral
- Thermostat: ON at 50°C oil temperature, OFF at 45°C

---

## 11.4 Pressure Settings and Adjustment

> **WARNING:** Never adjust hydraulic pressure settings beyond the values specified in this manual without written authorization from BetaCorp Systems. Over-pressure conditions can cause immediate component failure and present a high-pressure injection hazard (see Section 2.6.1).

**Pressure Setting Summary:**

| Circuit | Component | Setting | Notes |
|---------|-----------|---------|-------|
| Main system | Relief valve (RLV-HYD-MAIN) | 210 bar | Factory-set; DO NOT ADJUST |
| Normal working | System operating pressure | 150 bar | Maintained by pump and relief valve |
| Tool unclamp | PRV-HYD-02 | 150 bar | Adjustable; normally factory-set |
| Gear change | PRV-HYD-01 | 80 bar | Adjustable; normally factory-set |
| Z-brake release | N/A (direct system pressure) | 150 bar | No reducing valve |

**How to Adjust PRV-HYD-02 (Tool Unclamp Pressure):**

Adjustment of the tool unclamp pressure may be required if:
- Tool release is incomplete (pressure too low — increase)
- Tool release is too forceful, causing tool holder to eject (very rare; pressure too high — decrease)
- Spindle draw bar springs have been replaced with different preload

1. LOTO the machine; de-pressurize.
2. Locate PRV-HYD-02 on the HPU valve manifold (labeled).
3. Remove the tamper-resistant cap from the adjustment screw (requires a BetaCorp tamper key; contact BetaCorp for this tool).
4. Start the HPU and measure tool unclamp pressure using a gauge at the PRV-HYD-02 outlet port.
5. Adjust the setscrew: clockwise = increase pressure; counter-clockwise = decrease.
6. Target setting: 150 bar ± 5 bar.
7. Replace the tamper cap.
8. Test tool change: command a manual tool change (SYSTEM → ATC → MANUAL → TOOL CHANGE). Verify tool releases smoothly.
9. Document the adjustment.

---

## 11.5 Hydraulic Valve Descriptions

### SOL-HYD-01 — Z-Axis Brake Release Valve

**Type:** 4/2 Directional Control Valve, Spring Return, 24 VDC solenoid
**Normal State (Solenoid De-Energized):** Hydraulic brake pressure circuit is connected to tank (drain). Spring in brake cylinder applies brake. Z-axis is held.
**Energized State:** Hydraulic pressure (150 bar) is applied to brake release port. Brake releases.
**Failure Mode:** If SOL-HYD-01 fails in de-energized state: Z-axis brake stays applied (safe). If SOL-HYD-01 fails energized: Z-axis brake stays released (requires servo brake only to hold Z-axis — FAULT E415 will indicate if brake release is not confirmed within timeout).

**Service Procedure:**
If SOL-HYD-01 is suspected faulty (Z-axis brake not releasing or not applying):
1. Verify 24 VDC is present at solenoid coil terminals when energized (check with voltmeter).
2. Measure solenoid coil resistance (should be 20–50 ohms for 24 VDC coils). Open circuit (>1 MOhm) indicates failed coil.
3. If coil is good and valve is not actuating: valve spool is stuck. Replace SOL-HYD-01.
4. Part No.: BC-SOL-ZBK-001

### SOL-HYD-02 — Tool Unclamp Valve

**Type:** 4/2 Directional Control Valve, Spring Return, 24 VDC solenoid
**Normal State:** Tool unclamp cylinder connects to tank. Draw bar Belleville springs hold tool clamped.
**Energized State:** Hydraulic pressure applied to unclamp cylinder. Tool releases.
**Failure Mode:** Fail de-energized = tool stays clamped (safe). Fail energized = tool unclamp stays active (tool would release when spindle is stopped — MAJOR HAZARD; fault E321 should detect this).

### SOL-HYD-03 / SOL-HYD-04 — ATC Arm Extend/Retract

**Type:** 4/3 Directional Control Valve, Spring Centered, 24 VDC solenoid (dual coil)
**Normal State (Both Solenoids De-Energized):** ATC cylinder is blocked (both ports connected to blocked center). Arm holds position.
**SOL-HYD-03 Energized:** ATC arm extends.
**SOL-HYD-04 Energized:** ATC arm retracts.
**Service Note:** 4/3 valve with blocked center — both solenoids must not be energized simultaneously (PLC interlock prevents this).

---

## 11.6 Hydraulic Cylinder Operation

### Z-Axis Brake Cylinder (BC-CYL-Z-BRK)

**Type:** Single-acting, spring-apply (spring-apply / hydraulic-release)
**Bore:** Ø100 mm
**Stroke:** 30 mm
**Spring Force:** 12,000 N (applied force on brake disc)
**Hydraulic Release Pressure:** 80 bar minimum; 150 bar nominal
**Seal Material:** FKM (fluoroelastomer, "Viton") — compatible with ISO 46 mineral oil
**Wiper:** Polyurethane

**Cylinder Service:**

The Z-axis brake cylinder should be inspected semi-annually for:
- External oil leakage at the rod seal (a slight oil film is acceptable; dripping is not)
- Rod surface for corrosion or scoring (rod must be clean and smooth)
- Mount bolts for tightness (8 × M10, torque: 40 N·m)

If the rod seal leaks excessively: replace the complete cylinder (BC-CYL-Z-BRK) or the seal kit (BC-SEAL-Z-BRK) — seal kit replacement requires disassembly of the cylinder by a qualified hydraulic technician.

### Tool Unclamp Cylinder (BC-CYL-TU-001)

**Type:** Single-acting, spring-return (hydraulic-extend / spring-retract)
**Bore:** Ø80 mm
**Stroke:** 45 mm
**Force at 150 bar:** 75,398 N (75.4 kN) — significantly exceeds the 18,000 N draw bar spring force, with adequate margin
**Seal Material:** FKM
**Service:** Replace seal kit (BC-SEAL-TU-CYL) if rod seal leaks.

---

## 11.7 Hydraulic Oil Specifications

The BC-500X hydraulic system requires ISO VG 46 anti-wear (AW) hydraulic oil. The following specifications apply:

| Property | Requirement | Test Method |
|----------|-------------|-------------|
| Viscosity grade | ISO VG 46 | ISO 3448 |
| Viscosity at 40°C | 41.4–50.6 cSt | ISO 3104 |
| Viscosity at 100°C | 6.8–7.2 cSt (typical) | ISO 3104 |
| Viscosity index | ≥ 95 | ISO 2909 |
| Flash point (COC) | ≥ 200°C | ISO 2592 |
| Pour point | ≤ -12°C | ISO 3016 |
| Rust protection (ASTM D665A) | Pass | ASTM D665 |
| Oxidation stability (TOST) | ≥ 2,000 hours | ASTM D943 |
| Zinc-type AW additive | Yes (ZDDP or ashless AW) | — |
| Foam tendency | Maximum 25 mL/0 mL (Seq. I/II/III) | ASTM D892 |
| Air release (at 50°C) | ≤ 5 minutes | ISO 9120 |
| Water separability | Pass (ASTM D1401) | ASTM D1401 |
| Demulsibility | ≤ 40 min at 82°C | ASTM D1401 |

**Approved Hydraulic Oil Brands:**

| Brand | Product Name | Notes |
|-------|-------------|-------|
| Mobil | Mobil DTE 25M | Preferred brand |
| Shell | Shell Tellus S2 MX 46 | |
| Chevron | Chevron Rando HDZ 46 | |
| Total | Azolla ZS 46 | |
| BetaCorp Supply | BC-OIL-HYD-VG46 | BetaCorp-supplied oil; guaranteed compatibility |
| Castrol | Castrol Hyspin AWH-M 46 | |

**Oils NOT Approved:**
- Biodegradable hydraulic oil (requires system flush and special seals)
- Fire-resistant hydraulic fluid (HF types) — incompatible with standard seals
- Motor oil or transmission fluid
- Way lube oil (wrong viscosity and additive package)
- Any oil not on the approved list above

**Oil Mixing:**
Do not mix different brands of hydraulic oil unless compatibility is confirmed by the oil supplier. If changing oil brands, completely drain the system and flush with the new oil before filling.

---

## 11.8 Contamination Control

Hydraulic system contamination is the single largest cause of hydraulic component failure in the field. The following contamination control practices must be followed:

**Target Cleanliness Level:**
- ISO 4406 cleanliness code: ≤ 16/14/11
- This means: no more than 640 particles ≥ 4 μm per mL; no more than 160 particles ≥ 6 μm per mL; no more than 20 particles ≥ 14 μm per mL

**Contamination Sources and Prevention:**

| Source | Prevention |
|--------|-----------|
| Built-in contamination (from manufacturing) | Flush system before commissioning (Section 4.6.2) |
| Ingress from fill port | Use a 10 μm filter funnel when adding oil; keep fill cap closed |
| Ingress from breather | Breather/fill cap has internal 10 μm filter; replace if damaged |
| Ingress during maintenance | Cap all open ports immediately; flush any disconnected lines before reconnecting |
| Water contamination | Inspect for coolant leaks; maintain good seal on hydraulic components |
| Internal wear particles | Monitor with regular oil analysis; change filter and oil at appropriate intervals |

**What to Do If Contamination is Suspected:**
1. Take an oil sample and send for particle count analysis.
2. If cleanliness code exceeds 18/16/13: replace the hydraulic oil and filter immediately.
3. If contamination includes water (emulsion): check all hydraulic cylinder rod seals for leakage (coolant may be entering through a leaking cylinder or through a fitting); replace oil.
4. If metal particles are found in the oil analysis: identify the source (wear metals — Fe indicates pump or cylinder wear; Cu indicates bearing or valve body wear). Contact BetaCorp Systems.

---

## 11.9 Hydraulic System Diagnostics

**Hydraulic System Diagnostic Screen:**

Navigate to SYSTEM → DIAGNOSTIC → HYDRAULIC SYSTEM to view:
- HPU motor status (ON/OFF)
- Hydraulic pressure (from digital pressure transmitter — if equipped; otherwise from pressure switch state)
- Oil temperature (from temperature sensor)
- Filter bypass indicator state
- Z-brake status (brake applied / released, confirmed by pressure switch BC-PSW-Z-BRK)
- Tool unclamp cylinder status
- All solenoid valve commanded states

**Hydraulic Pressure Troubleshooting Flowchart:**

```
E404 Hydraulic Pressure Low
        |
        v
HPU motor running?
  NO --> Check motor contactor, fuse, overload relay
  YES -->
        |
        v
Analog gauge reads ≥ 150 bar?
  YES --> Pressure switch BC-PSW-HYD-MAIN failed --> Replace switch
  NO  -->
        |
        v
Oil level OK (between MIN/MAX)?
  NO  --> Add oil (check for leaks)
  YES -->
        |
        v
Any external leaks?
  YES --> Repair leak, check oil level, restart
  NO  -->
        |
        v
Pressure gauge < 10 bar?
  YES --> Relief valve stuck open --> Remove and clean/replace RLV-HYD-MAIN
  NO  --> Pressure 10-100 bar
        |
        v
Pump flow test (see Section 11.9)
  Flow < 80% rated --> Pump worn --> Replace BC-PMP-HYD-001
  Flow OK --> System leak (internal valve leakage) --> Isolate circuits one by one
```

**Hydraulic System Pressure Test Procedure:**

To identify which circuit is leaking internally (if pressure doesn't hold but no external leak):
1. Start HPU. Note system pressure.
2. Close the isolation valve for each branch circuit one by one (Z-brake circuit, tool unclamp circuit, ATC circuit, gear change circuit).
3. After each closure, observe if system pressure increases.
4. If pressure increases when a specific circuit is isolated: the internal leakage is in that circuit's actuator or valve.
5. Inspect the solenoid valve for that circuit (may be stuck open or valve spool worn) and inspect the cylinder for internal seal failure.

---

*End of Chapter 11 — Hydraulic System Manual*


---

# PART 11 — COOLANT SYSTEM GUIDE

---

# Chapter 12 — Coolant System Guide

## 12.1 Coolant System Overview

The BC-500X coolant system delivers metalworking fluid (cutting fluid) to the cutting zone during machining operations. Proper coolant management is essential for:
- Extending tool life (proper cooling and lubrication at the cutting interface)
- Improving surface finish (chip evacuation and cooling of workpiece)
- Preventing workpiece thermal distortion (heat management)
- Protecting machine surfaces from corrosion
- Maintaining operator health (well-managed coolant does not support harmful bacteria or dermatitis-causing decomposition products)

**System Architecture:**
The BC-500X uses a central sump (coolant tank) system. Coolant from the tank is pumped to the work zone through flexible nozzles. After contacting the workpiece and tool, the coolant drains through the chip pan back to the tank, passing through the chip conveyor (which removes bulk chips) and the magnetic separator (which removes fine ferromagnetic particles). The coolant pump inlet strainer provides final filtration before the pump.

**System Capacity:**
- Tank volume: 350 L
- Typical working volume (allowing for lines, pump, and sump level): approximately 320 L
- Coolant turnover rate (at 60 L/min): approximately 5 minutes

---

## 12.2 Coolant Selection and Mixing Ratios

### 12.2.1 Approved Coolant Types

The BC-500X is approved for use with water-soluble semi-synthetic and fully synthetic metalworking fluids. The following product categories are approved:

| Category | Description | Typical Application |
|----------|-------------|---------------------|
| Semi-synthetic | Contains 5–30% mineral oil emulsified in water | General machining of ferrous and aluminum alloys |
| Fully synthetic | Contains no mineral oil; water-based with synthetic lubricants | High-speed machining, aluminum, cast iron |

**Approved Coolant Products (Representative List):**

| Brand | Product | Type | Mix Ratio (General) |
|-------|---------|------|---------------------|
| Blaser Swisslube | Blasocut 4000 Strong | Semi-synthetic | 6–10% |
| Castrol | Hysol XBB | Semi-synthetic | 5–8% |
| Master Chemical | TRIM SC520 | Semi-synthetic | 5–10% |
| Fuchs | Ecocool 68 CF | Semi-synthetic | 5–10% |
| Houghton | Hocut 795B | Semi-synthetic | 5–10% |
| Cimcool | CIMPERIAL 1011 | Soluble oil (emulsion) | 3–8% |

Contact BetaCorp Systems if you wish to use a product not on this list. We will evaluate compatibility with the machine seals, coatings, and materials before approval.

**Products NOT Approved:**
- Straight cutting oil (neat oil) — not compatible with standard coolant pump seals; creates fire and mist hazards without appropriate equipment
- Silicone-based coolants — incompatible with some machine seals
- Coolants containing chlorine at concentrations above 50 ppm — causes corrosion of aluminum and stainless steel
- Coolants containing sodium nitrite — health hazard; may form carcinogenic nitrosamines

### 12.2.2 Mixing Ratios by Application

The appropriate coolant concentration depends on the workpiece material, operation type, and coolant product. Always consult the coolant manufacturer's technical data sheet for specific guidance. The following general guidelines apply:

| Material | Operation | Recommended Concentration |
|----------|-----------|--------------------------|
| Carbon steel | General milling, drilling | 7–9% |
| Stainless steel (300 series) | All operations | 8–10% |
| Tool steel (>45 HRC) | Milling, grinding | 8–10% |
| Cast iron | Milling, boring | 5–7% |
| Aluminum alloys | Milling, drilling | 6–8% |
| Brass, copper | Milling, drilling | 5–7% |
| Titanium | All operations | 9–12% |
| Nickel superalloys (Inconel, etc.) | All operations | 9–12% |

> **NOTE:** Higher concentrations (above 10%) generally do not improve cooling significantly and can cause skin irritation, foam problems, and increased coolant costs. Never exceed the coolant manufacturer's recommended maximum concentration.

### 12.2.3 Coolant Mixing Procedure

**Principle:** ALWAYS add coolant concentrate to water. Never add water to concentrate.

**Rationale:** Adding water to concentrate causes the high-concentration outer surface to "shock" the incoming water, potentially creating a gel or unstable emulsion. Adding concentrate to water allows gradual dilution and produces a stable, uniform mixture.

**Equipment Required:**
- Mixing tank or bucket (clean, no previous chemical residue)
- Measuring container
- Refractometer

**Mixing Procedure:**

1. **Calculate required volumes:**
   - Required concentration: C% (e.g., 8%)
   - Required total volume: V (e.g., 350 liters)
   - Volume of concentrate: V_conc = V × (C / 100) × Concentration Factor
   - Volume of water: V_water = V - V_conc

   > *Note: The "Concentration Factor" accounts for the fact that refractometer readings for semi-synthetic fluids typically read lower than the actual oil content. Use the factor from the coolant manufacturer's data sheet. A typical factor is 1.4 for semi-synthetic fluids. Example: To achieve 8% actual concentration at a refractometer factor of 1.4, the refractometer should read 8/1.4 = 5.7%.*

2. **Prepare the mixing container or fill the machine coolant tank directly:**
   - Start with the required volume of clean water (municipal tap water is acceptable in most areas; if water hardness exceeds 500 ppm as CaCO₃, use softened or deionized water)
   
3. **Add concentrate:**
   - Measure the required volume of concentrate.
   - Add the concentrate to the water slowly, while stirring.
   - Do not add all concentrate at once — add in a thin stream to allow even dispersion.

4. **Verify concentration:**
   - After mixing, collect a small sample.
   - Read with the refractometer.
   - The reading should match the expected refractometer value for the target concentration (per manufacturer's data).
   - If reading is low: add more concentrate. If high: add more water.

5. **Verify pH:**
   - Fresh mixture pH should be 8.5–9.5.
   - If pH is out of range: contact the coolant supplier.

---

## 12.3 pH Monitoring and Control

### 12.3.1 Importance of pH

Coolant pH is one of the most important indicators of coolant health:
- **pH below 7 (acid):** Immediate corrosion risk to machine surfaces and workpiece. Likely indicates severe bacterial contamination. DO NOT use machine with acidic coolant.
- **pH 7.0–8.5:** Below normal range. Corrosion risk increasing. Bacterial activity possible. Add pH adjuster and investigate.
- **pH 8.5–9.5:** Normal operating range. Adequate alkalinity to resist corrosion and control bacteria.
- **pH 9.5–10.5:** Slightly high. Monitor; may cause slight skin irritation. Usually not harmful to machine.
- **pH above 10.5:** Too high. Can cause skin irritation and potentially damage certain machine components. Dilute and investigate.

### 12.3.2 pH Measurement Equipment

**Option A: pH Test Strips**
- Quick, easy, inexpensive
- Accuracy: ±0.5 pH units
- Suitable for routine weekly monitoring
- Use strips rated for pH 7–11 range
- Recommended product: Micro Essential Lab Hydrion pH strips or equivalent

**Option B: Digital pH Meter**
- Accuracy: ±0.1 pH units
- Requires calibration with buffer solutions (pH 7.0 and pH 10.0)
- Better for detecting small changes and when precise data is needed
- Recommended for monthly measurements and trend tracking
- Electrode requires regular cleaning and periodic replacement

**Calibration of pH Meter:**
1. Prepare fresh calibration buffer solutions (pH 7.0 and pH 10.0) as directed by the meter manufacturer.
2. Rinse the electrode with clean water.
3. Immerse in pH 7.0 buffer. Adjust the meter's offset calibration until it reads 7.0 ± 0.02.
4. Rinse electrode. Immerse in pH 10.0 buffer. Adjust the slope calibration until it reads 10.0 ± 0.02.
5. Rinse electrode. Meter is now calibrated.

### 12.3.3 pH Adjustment

**If pH is below 8.5:**
1. Add a pH buffer adjuster (alkalinity booster) recommended by the coolant supplier.
2. Add no more than 0.05% by volume of the adjuster per treatment.
3. Circulate coolant for 30 minutes and re-test.
4. If pH does not respond to alkalinity booster and continues dropping rapidly (more than 0.2 pH units per day): suspect heavy bacterial contamination. Perform bacteria test (Section 12.4) and consider coolant replacement.

**Common pH Adjusters:**
- Triethanolamine (TEA): typical pH booster for metalworking fluids
- Sodium metasilicate: stronger pH buffer; use with caution (can cause skin sensitization at high concentration)
- Always use a pH adjuster approved by the coolant manufacturer

**If pH is above 9.5:**
1. Add water only (do not add concentrate).
2. Re-test after 30 minutes of circulation.
3. High pH in fresh coolant: check the concentrate mixing ratio; may be too concentrated.
4. High pH in aging coolant: check for contamination (e.g., hydraulic oil breakthrough can raise pH).

---

## 12.4 Bacterial Contamination Testing

### 12.4.1 Why Bacteria Matter

Metalworking fluids are aqueous solutions rich in carbon sources, nitrogen, and trace metals — an ideal growth medium for bacteria and fungi. Bacterial populations left uncontrolled will:
- Produce acids that lower pH, increasing corrosion risk
- Produce hydrogen sulfide (H₂S) and other malodorous compounds ("Monday morning smell")
- Metabolize lubricating components, reducing tool life
- Produce endotoxins that cause skin and respiratory reactions in workers
- Create biofilms that clog filters, strainers, and coolant lines

### 12.4.2 Dip-Slide Testing Procedure

Dip-slide tests (e.g., Dipslide, Cide-Slide) are the most practical bacterial testing method for field use. They use agar-coated plastic slides that are dipped in the coolant and then incubated.

**Procedure:**
1. Collect a fresh coolant sample from the middle depth of the tank.
2. Remove the dip-slide from its sterile packaging. Do not touch the agar surface.
3. Dip the slide in the coolant sample for 1 second. Shake off excess.
4. Seal the slide in its tube.
5. Incubate at 30–35°C for 24–48 hours (check manufacturer's recommendation).
6. Count the colony forming units (CFU) by comparing the colony density to the reference card provided with the test kit.

**Interpretation:**

| Colony Count (CFU/mL) | Action |
|----------------------|--------|
| < 10,000 | Normal; no action required |
| 10,000–100,000 | Elevated; add biocide and monitor |
| 100,000–1,000,000 | High contamination; add biocide urgently; increase pH; consider partial coolant replacement |
| > 1,000,000 | Severe; immediate coolant replacement required |

### 12.4.3 Biocide Treatment

> **WARNING:** Always read and follow the biocide manufacturer's Safety Data Sheet before use. Many biocides are classified as irritants or sensitizers. Wear nitrile gloves and eye protection when handling biocide concentrates.

**Approved Biocides for BC-500X:**

| Product | Type | Dose | Notes |
|---------|------|------|-------|
| Acticide MBS | Isothiazolinone blend | 0.1–0.2% by volume of system | Broad spectrum |
| Proxel GXL | Benzisothiazolinone | 0.05–0.1% | Low odor |
| Fungitrol 158 | Triazine type | 0.1–0.2% | Effective against sulfate-reducing bacteria |

**Biocide Treatment Procedure:**
1. Confirm that system pH is ≥ 8.5 before adding biocide (biocides are less effective at low pH).
2. Calculate the required biocide volume: Volume (L) = System volume (320 L) × Dose rate (0.1%) = 0.32 L.
3. Add the biocide to the coolant sump slowly while the coolant pump is running.
4. Allow coolant to circulate for 2 hours.
5. Re-test with dip-slide at 24 hours.
6. If bacteria count has not dropped: repeat treatment or consider coolant replacement.

**Biocide Rotation:**
To prevent bacteria from developing resistance, rotate biocide types every 3–6 months. Alternating between isothiazolinone-type and triazine-type biocides is an effective strategy.

---

## 12.5 Coolant Maintenance Procedures

### 12.5.1 Daily Coolant Maintenance

Performed as part of the daily shift startup inspection (Task D-02):
- Check coolant level (sight glass)
- Add coolant if level is below the LOW mark
- Visual inspection of coolant (color, odor)

### 12.5.2 Weekly Coolant Maintenance

- Measure coolant concentration with refractometer (Task W-01)
- Measure coolant pH (Task W-02)
- Clean coolant inlet strainer (Task W-03)
- Clean magnetic chip separator (Task M-05, also done weekly in high-chip applications)

### 12.5.3 Monthly Coolant Maintenance

- Bacterial dip-slide test (Task M-01)
- Tramp oil removal (see Section 12.6)
- Inspect coolant system for leaks (hoses, nozzle connections, pump seal)
- Check coolant pump current draw (measure with clamp meter; compare to rated current; significant increase indicates pump wear or restriction)

### 12.5.4 Coolant Sump Partitioning

The BC-500X coolant tank is not partitioned. For applications where chip contamination is severe (e.g., cast iron machining generating large volumes of fine abrasive particles), consider retrofitting a partitioned tank design or adding an external coolant filtration system. Contact BetaCorp Systems for options.

---

## 12.6 Tramp Oil Removal

Tramp oil (also called "way oil skimmings") is oil from the machine's way lube system, hydraulic system, and spindle lubrication that mixes with the coolant. Small amounts of tramp oil (< 1% by volume) are acceptable, but higher concentrations:
- Create foam during machining
- Coat the work zone, creating a surface that is difficult to see through
- Promote bacterial growth (some tramp oils support certain bacterial species)
- Reduce the effectiveness of the coolant's lubrication and cooling properties

**Detection:**
Tramp oil appears as a floating layer on the coolant surface (visible when the coolant pump is stopped and the fluid is quiescent for 10 minutes). It is typically amber to dark brown in color and has an oily sheen.

**Removal Methods:**

**Method 1: Tramp Oil Skimmer (Preferred)**
A belt-type or disc-type tramp oil skimmer (optional accessory, Part No. BC-OPT-SKIMMER) continuously removes surface oil from the coolant tank. This is the most effective approach for high-productivity applications.

**Method 2: Manual Skimming**
For facilities without a skimmer:
1. Turn off the coolant pump.
2. Allow coolant to settle for 10 minutes.
3. Using a ladle or skimming vacuum with a flat intake, skim the tramp oil layer from the surface.
4. Dispose of tramp oil in designated waste oil containers (not coolant waste).
5. Perform this operation monthly or whenever oil layer exceeds 5 mm depth.

**Tramp Oil Source Investigation:**
If tramp oil accumulation is excessive (requiring monthly skimming of more than 5 L):
1. Check the Z-axis hydraulic brake cylinder rod seal for leakage.
2. Check the spindle oil-air lubrication system for oil blow-out.
3. Check the way lube system for over-lubrication (way lube system pumping too frequently per B9.20).
4. Inspect all hydraulic hose connections for minor seepage.

---

## 12.7 Coolant Disposal Procedures

Spent metalworking coolant is a regulated waste in most jurisdictions. The following disposal requirements apply:

**Classification:**
In the United States, spent metalworking coolant (also called metalworking fluid or machining fluid waste) is typically classified as:
- Non-hazardous waste if the coolant does not contain RCRA-listed hazardous substances above threshold concentrations
- Potentially hazardous waste if the coolant contains oils with certain solvents or heavy metals from machining (particularly if chrome, nickel, or lead-containing materials are machined)

**Regulatory Requirements:**
- 40 CFR Part 261 — RCRA Hazardous Waste Identification (US EPA)
- 40 CFR Part 403 — General Pretreatment Regulations (for discharge to POTW)
- State and local regulations (vary significantly)

**Disposal Options:**

| Option | Description | Considerations |
|--------|-------------|----------------|
| Licensed waste disposal | Contract with a licensed fluid recycler or industrial waste hauler | Most common; document waste manifests |
| On-site treatment and discharge | Treat coolant to meet discharge limits, then discharge to municipal sewer | Requires permit; treatment typically includes pH adjustment and oil/water separation |
| Coolant recycling service | Service that hauls and recycles spent coolant (often resells as recycled fluid) | Cost-effective for large volumes |
| Evaporator | On-site evaporator reduces volume by evaporating water | Concentrate requires separate disposal |

**Documentation Required for Disposal:**
- Waste characterization (pH, oil and grease content, specific metals if applicable)
- Quantity disposed
- Date of disposal
- Waste hauler name and license number
- Manifest number
- Receiving facility name and permit number

Contact your local EPA or state environmental agency for specific requirements.

---

## 12.8 Coolant System Troubleshooting

| Problem | Possible Causes | Solution |
|---------|-----------------|---------|
| Coolant foaming during machining | Coolant concentration too high; tramp oil contamination; wrong coolant for material; high air entrainment | Reduce concentration; remove tramp oil; check coolant compatibility; reduce pump flow |
| Strong odor (rotten egg) | Sulfate-reducing bacteria (SRB) | Immediate biocide treatment; if severe, replace coolant |
| Coolant turns black | Bacterial contamination; cast iron oxidation products | Biocide treatment; check pH; consider coolant replacement |
| Rust on workpiece | pH too low; insufficient concentration; chloride contamination | Test pH; adjust concentration; check water quality |
| Skin irritation reported | Coolant pH too high; bacterial contamination; concentration too high; coolant age | Test pH and concentration; bacteria test; coolant refresh |
| Poor tool life | Coolant concentration too low; coolant flow insufficient; wrong coolant for material | Increase concentration; check nozzle position and flow rate; evaluate coolant type |
| Coolant level dropping rapidly | Carry-out on workpiece; evaporation in hot environment; internal or external leak | Investigate carry-out; check environment; inspect for leaks |
| Chip conveyor coated with grey film | Calcium/magnesium deposits from hard water | Use water softener; add anti-scale additive to coolant |

---

*End of Chapter 12 — Coolant System Guide*

---

# PART 12 — TOOL CHANGER SERVICE

---

# Chapter 13 — Tool Changer Service Manual

## 13.1 Tool Changer Overview

The BC-500X 24-position random-access dual-arm ATC is a precision mechanism that must be maintained in correct adjustment to achieve reliable 4.2-second chip-to-chip times and accurate tool repositioning. This chapter covers all service procedures for the ATC system.

**ATC Service Safety:**

> **WARNING:** The ATC arm moves rapidly (180° rotation in less than 0.9 seconds) and generates significant inertial forces. Never reach into the ATC area when the machine is energized unless:
> 1. You are certain the ATC is in the home (retracted) position AND
> 2. You are operating only in a manually controlled mode (SYSTEM → ATC → MANUAL with careful single-step actuation) AND
> 3. A second person is present as a safety observer

> For any disassembly, adjustment, or replacement: LOTO the machine per Section 2.4.2.

**ATC System Components — Recall:**
- 24-position carousel (driven by 0.75 kW servo)
- Dual-arm exchange arm (cam-driven by hydraulic motor)
- Tool pots with spring-grip (24 pots)
- Sensors: 5 ATC arm sensors + 1 carousel home + 24 tool presence sensors

---

## 13.2 Carousel Positioning and Indexing

### 13.2.1 Carousel Indexing Principle

The carousel is driven by an AC servo motor (0.75 kW) through a 60:1 worm gear reducer. The servo drive controls the carousel position using incremental encoder feedback (1,000 PPR on the motor shaft). The servo can detect and drive to any of the 24 tool pot positions.

**Carousel Position Calculation:**
- Carousel has 24 positions equally spaced at 15° each (360° / 24 = 15°).
- The worm gear reducer gives a total reduction of 60:1.
- To move one position (15°), the servo motor must rotate: 15° × 60 (gear ratio) = 900° = 2.5 revolutions.
- At 1,000 PPR with quadrature: 4,000 counts per motor revolution × 2.5 revolutions = 10,000 encoder counts per carousel position.
- The PLC tracks the carousel position in tool pot units (1–24), converting to and from encoder counts internally.

**Carousel Home Sensor:**
The carousel home sensor (BC-SEN-CAR-HOME) is an inductive proximity sensor that detects a notch or target on the carousel disc. When the carousel is in the home position, pot #1 is at the ATC tool change position. All pot positions are tracked relative to this home position.

### 13.2.2 Carousel Homing Procedure

The carousel must be homed:
- After any power cycle
- After a carousel fault (E304, E310)
- After any manual rotation of the carousel (maintenance)
- After encoder fault on the ATC carousel servo

**Automatic Carousel Homing:**
The carousel homes automatically as part of the machine homing sequence (see Section 6.4). After machine homing is complete, the carousel is at the home position (pot #1 at ATC position).

**Manual Carousel Homing:**
If the carousel must be homed independently:
1. Navigate to SYSTEM → ATC → MANUAL → CAROUSEL HOME.
2. The carousel will slowly rotate until the home sensor triggers.
3. Upon trigger, the carousel will make a small overshoot, then reverse slowly to confirm the home position.
4. When homing is complete, the display shows "CAROUSEL AT HOME."

**Carousel Jog:**
In SYSTEM → ATC → MANUAL → CAROUSEL JOG, the carousel can be moved forward or backward by a specified number of positions using the softkey buttons.

### 13.2.3 Tool Pot Position Teaching

The tool pot positions are factory-programmed into Parameters B3.xx. If the carousel is replaced or a major ATC repair is performed, the tool pot positions may need to be re-taught.

> **NOTE:** Tool pot position teaching is normally a factory commissioning procedure. In the field, contact BetaCorp Systems for guidance before performing this procedure. Incorrect pot position data will cause ATC arm timing errors.

**Position Teaching Procedure (Overview):**
1. Navigate to SYSTEM → ATC → TEACH MODE (requires Level 3 access — contact BetaCorp).
2. The control will command the carousel to each position in sequence.
3. At each position, use the CONFIRM softkey to record the encoder count for that pot.
4. After all 24 positions are taught, the control saves the position data to Parameters B3.xx.

---

## 13.3 Gripper Adjustment and Replacement

### 13.3.1 ATC Arm Gripper Overview

The ATC arm has two grippers (left gripper BC-ATC-GRP-L and right gripper BC-ATC-GRP-R). Each gripper holds the tool holder by the V-groove of the tool holder flange. The gripper fingers are spring-loaded to grip the tool holder and release when the arm extends past the tool holder's V-groove during the retract phase.

**Gripper Inspection:**

Inspect the grippers monthly (task W-04). Replace if:
- Gripper pad tips show wear through the hardened surface
- Gripper fingers are bent or cracked
- Gripper spring force is insufficient (tool holder can be pulled free with less than 50 N force)

### 13.3.2 Gripper Replacement Procedure

**Parts Required:** BC-ATC-GRP-L or BC-ATC-GRP-R (specify); BC-ATC-GRP-SPR (2 springs per gripper)

**Procedure:**
1. LOTO the machine.
2. Navigate the ATC arm to the home position (retracted) using JOG mode before locking out.
3. Open the ATC access cover.
4. Locate the gripper to be replaced on the ATC arm.
5. Using a 5 mm hex key, remove the 2 × M6 socket head cap screws holding the gripper body to the arm.
6. Remove the gripper body.
7. Note the position of the gripper spring (photograph if needed).
8. Remove the old gripper spring from the spring pocket in the arm casting.
9. Install the new gripper spring in the spring pocket.
10. Install the new gripper body over the spring, compressing the spring as the gripper body is brought to the mounting face.
11. Insert and tighten the 2 × M6 screws: hand-tight only at first, ensuring the gripper body can slide slightly.
12. Check the gripper finger positions: both fingers should be parallel and centered on the tool holder V-groove engagement point.
13. Torque the 2 × M6 screws to 10 N·m.
14. Verify the gripper fingers move smoothly when pressed together by hand and return to the open position when released.
15. Close the ATC access cover.
16. Remove LOTO.
17. Perform a manual tool change cycle (SYSTEM → ATC → MANUAL → CYCLE) with a test tool to verify the gripper operates correctly.

### 13.3.3 Gripper Force Verification

After gripper replacement (or annually), verify the gripper retention force:
1. Insert a test tool holder into the carousel pot.
2. Index the carousel to place the test tool at the ATC position.
3. Using a spring scale or force gauge: attach to the tool holder flange and pull outward (away from the carousel center).
4. The tool holder should remain retained up to a force of 80–90 N.
5. Below 70 N: gripper spring is weak; replace spring (BC-ATC-GRP-SPR).
6. Document the measured retention force in the maintenance log.

---

## 13.4 ATC Sensor Setup and Adjustment

### 13.4.1 Sensor Specifications

All ATC sensors are inductive proximity sensors (NPN, 24 VDC). Key specifications:
- Operating range (nominal sensing distance): 4 mm (standard, M12 body)
- Adjustment range: 2–6 mm (target to sensor face)
- Hysteresis: approximately 20% of switching distance
- Status LED: built-in (LED ON when target detected)
- Recommended gap: 2 mm (center of detection range)

### 13.4.2 ATC Arm Position Sensor Adjustment

Each sensor is mounted on an adjustable bracket with a slot for lateral adjustment. After any ATC disassembly or if sensors trigger at wrong positions:

**General Adjustment Procedure:**

1. LOTO the machine.
2. Manually position the ATC arm at the position corresponding to the sensor being adjusted (e.g., for SEN-ATC-HOME: position arm at home/retracted position).
3. Loosen the sensor mounting clamp screws (2 × M4, Torx T15).
4. Position the sensor face at 2 mm from the target (the metal actuating plate on the ATC arm casting).
5. Use a 2 mm thick feeler gauge as a spacer to set the gap precisely.
6. While maintaining the 2 mm gap, tighten the mounting screws (0.5 N·m — do not overtighten; sensor body is plastic).
7. Restore power and verify: using SYSTEM → DIAGNOSTIC → PLC I/O, confirm the sensor input is ON (1) when the arm is at the correct position and OFF (0) when the arm moves away.

**Sensor Positions and Targets:**

| Sensor | Target Location | Expected State at Position |
|--------|-----------------|---------------------------|
| SEN-ATC-HOME | Target on arm rear face | ON when arm is fully retracted (home) |
| SEN-ATC-90 | Target on arm at 90° cam position | ON when arm is 90° rotated (mid-swap) |
| SEN-ATC-180 | Target on arm at 180° cam position | ON when arm is fully rotated (swap complete) |
| SEN-ATC-EXT | Target on arm front face | ON when arm is fully extended |
| SEN-ATC-RET | Target on arm rear face (different from HOME) | ON when arm is retracted after swap |

> **NOTE:** SEN-ATC-HOME and SEN-ATC-RET may appear similar but detect the arm at slightly different retract positions. HOME detects the arm before extension; RET detects the arm after the full exchange cycle returns to home. If these two sensors are swapped (target assignments reversed), the ATC will generate E303 and E301 alternately.

### 13.4.3 Tool Presence Sensor Adjustment

The 24 tool presence sensors (BC-SEN-TP-001) detect whether a tool holder is in each carousel pot. These sensors are mounted above each pot position, sensing the top of the tool holder from above.

**Adjustment:**
1. Insert a test tool holder in the pot being adjusted.
2. Adjust the sensor height (vertical): sensor face should be 2–3 mm above the top of the tool holder's retention knob when the pot is at the sensing position.
3. Verify: sensor LED turns ON when tool is in the pot, OFF when pot is empty.
4. If sensor is too close (< 1.5 mm): risk of sensor striking the tool holder during carousel rotation.
5. If sensor is too far (> 5 mm): sensor may not reliably detect the tool holder.

---

## 13.5 ATC Arm Timing and Adjustment

### 13.5.1 ATC Arm Cam Timing

The ATC arm motion is controlled by a cam profile that converts hydraulic motor rotation into the arm's extend-rotate-retract sequence. The cam is factory-set and should not normally require adjustment. However, if the ATC arm hydraulic motor, cam shaft, or associated components have been replaced, cam timing must be verified.

**ATC Arm Motion Sequence:**

The complete arm cycle consists of:
1. **Arm extend:** Arm moves forward simultaneously gripping tool in spindle AND tool in carousel (sensors: SEN-ATC-HOME goes OFF → SEN-ATC-EXT goes ON)
2. **Arm rotate 180°:** Arm rotates with both tools (sensor: SEN-ATC-90 goes ON, then SEN-ATC-180 goes ON)
3. **Arm retract:** Arm moves back, inserting new tool in spindle AND old tool in carousel (sensor: SEN-ATC-EXT goes OFF → SEN-ATC-RET goes ON)

**ATC Timing Verification:**

Navigate to SYSTEM → DIAGNOSTIC → ATC → TIMING ANALYSIS. This screen shows a real-time graph of sensor state transitions during an ATC cycle, with millisecond-resolution timestamps.

Expected timing (total cycle = 3.0 seconds for arm motion only):

| Phase | Duration |
|-------|----------|
| Arm extend | 0.6–0.9 seconds |
| Dwell at extended | 0.1 seconds |
| Arm rotate 180° | 0.7–1.0 seconds |
| Dwell at 180° | 0.1 seconds |
| Arm retract | 0.6–0.9 seconds |

If any phase is significantly outside these ranges:
- Too slow: hydraulic pressure low, flow control valve too restrictive, hydraulic cylinder seal worn
- Too fast: flow control valve too open (risk of mechanical damage from impact); reduce flow control valve setting (B4.15)
- Phase not completing: sensor misaligned or failed (causing timeout fault)

### 13.5.2 ATC Synchronization with Spindle Orient

The ATC arm must not extend until the spindle has completed its orientation (M19 — spindle to defined angular position for keyway alignment with the ATC arm gripper). If the spindle orientation is late or slow, the ATC arm will wait until SEN-ATC-ORIENT confirms orientation is complete (this is a PLC interlock).

**Verifying Spindle Orientation for ATC:**
1. Command M19 in MDI mode.
2. Observe the spindle orientation angle on the diagnostic screen (SYSTEM → DIAGNOSTIC → SPINDLE → ORIENT ANGLE).
3. The spindle should come to rest with the drive key at the ATC gripper engagement position (typically 0° as defined by B1.19).
4. If the spindle orientation angle is incorrect by more than ±2°: adjust Parameter B1.19.
5. After adjusting B1.19, perform 5 manual tool change cycles to verify the ATC arm reliably engages and disengages the tool holders.

---

## 13.6 Tool Changer Troubleshooting

| Problem | Possible Cause | Solution |
|---------|---------------|---------|
| E303 — Tool Changer Timeout (arm retract) | Hydraulic pressure low; arm obstruction; retract sensor misaligned; hydraulic cylinder seal worn | See Section 8.7.1 (full E303 procedure) |
| Tool holder dropped during ATC | Gripper worn or broken; gripper spring weak; wrong tool holder type | Inspect and replace grippers; verify tool holder compatibility |
| Carousel does not index to correct position | Encoder fault; carousel home sensor misaligned; gear reducer worn | Re-home carousel; verify home sensor; contact BetaCorp |
| ATC arm crashes into spindle head | ATC Z position (B8.09) set incorrectly; Z-axis not at ATC position when ATC is activated | Verify B8.09; verify Z retract before ATC |
| Tool not fully clamped after ATC | Draw bar springs fatigued; tool unclamp solenoid stuck energized; tool clamping delay too short (B3.19) | Inspect draw bar springs; check SOL-HYD-02; increase B3.19 |
| Tool present sensor false positive | Chip or debris on sensor face; sensor too close to carousel pot | Clean sensor face; adjust sensor gap |
| ATC arm binds at 90° rotation | Cam follower worn; grease dried in cam track; hydraulic flow too low | Lubricate cam track; increase flow (B4.15); inspect cam follower |
| Chip-to-chip time increasing | Hydraulic system slow (low pressure, worn pump); ATC grease degraded; spindle orient slow | Check hydraulic pressure; regrease ATC; verify spindle orient time |
| Carousel rotates wrong direction | Phase rotation of ATC servo motor incorrect | Swap two motor phases (LOTO required) |

---

*End of Chapter 13 — Tool Changer Service Manual*

---

# PART 13 — APPENDICES

---

# Appendix A — Glossary of Terms

| Term | Definition |
|------|-----------|
| ATC | Automatic Tool Changer. The mechanism that automatically exchanges tools between the spindle and the tool magazine carousel. |
| AW | Anti-Wear. An additive package in lubricating oil (hydraulic or other) that prevents wear between metal surfaces. ISO VG 46 AW hydraulic oil is specified for the BC-500X. |
| BLI | Bearing Load Index. A BC-500X proprietary metric that tracks spindle bearing drag relative to the baseline at commissioning. |
| Belleville Washer | A conical (disc) spring washer used in stacks to provide high spring force in a compact space. The BC-500X draw bar uses a Belleville washer stack to provide 18,000 N tool clamping force. |
| BHN / HB | Brinell Hardness Number / Brinell Hardness. A measurement of material hardness using a ball indenter. |
| CAT-40 | A common tool holder taper standard used in the United States. The number refers to the taper size (40 = 7/24 taper, ANSI/ASME B5.50). |
| BT-40 | A Japanese tool holder taper standard (MAS 403 BT-40). Similar taper angle to CAT-40 but with different flange and retention knob design. |
| Chip-to-Chip Time | The total time from the last cut with the old tool to the first cut with the new tool, including all ATC motions. BC-500X standard: 4.2 seconds. |
| CNC | Computer Numerical Control. The system that interprets G-code programs and commands the machine axes, spindle, and other functions. |
| DNC | Direct Numerical Control. A system where CNC programs are stored on a network computer and streamed to the machine as needed. |
| Draw Bar | The hardened steel rod that passes through the spindle center and actuates the tool retention collet. |
| EMC | Electromagnetic Compatibility. The ability of a machine to operate without causing electromagnetic interference to other equipment, and to operate correctly in the presence of electromagnetic interference from outside sources. |
| EMI | Electromagnetic Interference. Electrical noise that can corrupt sensitive signals such as encoder feedback cables. |
| E-Stop | Emergency Stop. A safety device (red mushroom-head pushbutton) that, when pressed, immediately removes power from all machine drives and halts all motion. |
| FRL | Filter-Regulator-Lubricator. A pneumatic system component that filters the air supply, regulates pressure, and (in some designs) adds lubrication. |
| G-code | The programming language used for CNC machines. Named for the "G" (geometric) codes that command axis motion and interpolation. |
| HMI | Human-Machine Interface. The display, keyboard, and control panel through which the operator interacts with the machine. |
| HPU | Hydraulic Power Unit. The self-contained assembly that generates and supplies hydraulic power to the machine circuits. |
| ISO 4406 | An international standard for reporting hydraulic fluid contamination levels using a three-number cleanliness code. |
| ISO VG | International Standards Organization Viscosity Grade. A classification of lubricating oils by their kinematic viscosity at 40°C. ISO VG 46 = 46 cSt at 40°C (approximately). |
| JOG | A manual machine operation mode where the operator manually moves axes by pressing and holding jog buttons. |
| LOTO | Lockout/Tagout. An OSHA-required safety procedure for isolating hazardous energy sources before maintenance. |
| MPG | Manual Pulse Generator. The hand wheel device that allows precise, incremental axis motion during machine setup. |
| N·m | Newton-meter. The SI unit of torque. 1 N·m ≈ 0.738 ft·lb. |
| NPN | Negative-Positive-Negative. A transistor output type used in proximity sensors. An NPN sensor pulls the output signal to ground (0V) when the target is detected. |
| ORFS | O-Ring Face Seal. A hydraulic fitting design that uses an O-ring at the face of the fitting for sealing, providing excellent leak resistance. |
| PLC | Programmable Logic Controller. The machine's dedicated industrial computer that handles all discrete I/O, sequencing logic, and machine safety functions. |
| PPE | Personal Protective Equipment. Safety equipment worn by workers to protect against hazards (safety glasses, gloves, face shields, etc.). |
| PPR | Pulses Per Revolution. The number of electrical pulses generated by an encoder for each complete revolution of the encoder shaft. |
| PTFE | Polytetrafluoroethylene ("Teflon"). Used for thread sealant tape on pipe threads. |
| Quadrature Encoding | A method of processing encoder signals that multiplies the effective resolution by 4. Used on all BC-500X axis encoders (2,500 PPR × 4 = 10,000 counts/rev effective resolution). |
| RC (Resistance-Capacitance) | Used in the context of encoder cables: RC time constant affects the ability to transmit high-frequency signals over long cable lengths. |
| RS-422 | A balanced (differential) electrical standard for serial communication, used for encoder signals. Differential signaling provides excellent noise immunity. |
| SDS | Safety Data Sheet. A document required by OSHA's HazCom standard that describes the hazards, safe handling, and emergency response for a chemical product. |
| Servo | A closed-loop control system where position, velocity, or torque is continuously measured and corrected to match the commanded value. BC-500X uses digital servo drives on all axes. |
| Swarf | Metal cuttings and chips produced during machining operations. |
| TAN | Total Acid Number. A measurement of the acidity of hydraulic oil. Increasing TAN indicates oil oxidation and breakdown. |
| TIR | Total Indicator Reading. The total variation (max - min) measured by a dial indicator. Used to measure runout, flatness, and similar geometric quantities. |
| TSC | Through-Spindle Coolant. An optional BC-500X system that delivers high-pressure coolant through the center of the spindle and toolholder directly to the cutting edge. |
| VFD | Variable Frequency Drive. An electronic device that controls the speed of an AC induction motor by varying the output frequency. Used for the coolant pump and chip conveyor. |
| WEEE | Waste Electrical and Electronic Equipment Directive (EU). Requires separate collection and recycling of electronic equipment. |
| Way Lube | Lubricating oil applied to the linear guideways and ballscrew nuts. The BC-500X uses ISO VG 68 way lube oil in the centralized automatic lubrication system. |
| Wiper Seal | A sealing element at the end of a guideway carriage or linear actuator that prevents contamination from entering the bearing surfaces while allowing the moving element to pass. |
| Zerk Fitting | A common name for a grease nipple (Alemite fitting). A small steel fitting that accepts a grease gun for applying lubricant under pressure. |

---

# Appendix B — Hydraulic Fluid Specifications

## B.1 Primary Specification — ISO VG 46 AW Hydraulic Oil

The BC-500X requires ISO VG 46 anti-wear hydraulic oil meeting the following specifications:

| Property | Specification | Test Method |
|----------|--------------|-------------|
| ISO Viscosity Grade | VG 46 | ISO 3448 |
| Kinematic viscosity at 40°C | 41.4–50.6 mm²/s (cSt) | ISO 3104 |
| Kinematic viscosity at 100°C | ≥ 6.0 mm²/s | ISO 3104 |
| Viscosity index | ≥ 95 | ISO 2909 |
| Density at 15°C | 860–900 kg/m³ (typical) | ISO 3675 |
| Flash point (Cleveland Open Cup) | ≥ 200°C (392°F) | ISO 2592 |
| Pour point | ≤ -12°C (10°F) | ISO 3016 |
| Acid number (TAN), new oil | ≤ 1.0 mg KOH/g | ASTM D974 |
| Water content, new oil | ≤ 200 ppm | Karl Fischer |
| Foam tendency / stability | Seq. I: ≤ 150 mL / 0 mL | ASTM D892 |
| Foam tendency / stability | Seq. II: ≤ 75 mL / 0 mL | ASTM D892 |
| Foam tendency / stability | Seq. III: ≤ 150 mL / 0 mL | ASTM D892 |
| Air release, 25°C | ≤ 5 minutes | ISO 9120 |
| Demulsibility (40-37-3), 82°C | ≤ 30 minutes | ASTM D1401 |
| Rust protection (distilled water) | Pass | ASTM D665A |
| Rust protection (salt water) | Pass (preferred) | ASTM D665B |
| Copper corrosion, 100°C, 3 h | ≤ 1b | ASTM D130 |
| Wear protection (4-ball test) | Wear scar ≤ 0.60 mm | ASTM D4172 |
| FZG gear test | Failure load stage ≥ 10 | ISO 14635-1 |
| Oxidation stability (RBOT) | ≥ 300 minutes | ASTM D2272 |
| Zinc content (ZDDP-type AW) | 600–1200 ppm (typical) | ASTM D4628 |

## B.2 Alternative Specifications

### Zinc-Free (Ashless) AW Hydraulic Oil

For applications requiring zinc-free hydraulic oil (e.g., compatibility with zinc-sensitive filters, environmental preference):
- Must meet all specifications above except zinc content
- Must demonstrate equivalent wear protection in FZG test (≥ Stage 10) or ASTM D4172 (wear scar ≤ 0.55 mm)
- Contact BetaCorp Systems to confirm compatibility before switching

### Environmentally Acceptable Lubricant (EAL)

For machines installed in environmentally sensitive locations:
- ISO VG 46 vegetable-based or biodegradable synthetic hydraulic fluid
- Must meet ISO 15380 specification (HETG, HEPG, or HEES types)
- Requires full seal compatibility verification with BetaCorp Systems
- Not all seals in the BC-500X are compatible with ester-based biodegradable fluids; seal replacement kit may be required

## B.3 Oil Change Intervals Based on Analysis

The recommended oil change interval is 2,000 machine operating hours. However, oil analysis may extend or shorten this interval:

| Condition | Recommended Action |
|-----------|-------------------|
| TAN ≤ 1.0 mg KOH/g; cleanliness ≤ 16/14/11 | Continue in service; re-test at next quarter |
| TAN 1.0–2.0 mg KOH/g | Plan oil change within next 500 hours |
| TAN > 2.0 mg KOH/g | Immediate oil change |
| Water > 0.1% | Immediate oil change; investigate water source |
| Cleanliness > 18/16/13 | Change oil and filter; investigate contamination source |

---

# Appendix C — Torque Specifications Chart

## C.1 Machine Assembly Torques

All torque values are for unlubricated threads unless marked (L) = lubricated with engine oil.

**Machine Structure:**

| Location | Fastener | Torque |
|----------|---------|--------|
| Machine leveling footpad anchor bolts | M24 grade 8.8 | 200 N·m (147 ft·lb) |
| Leveling bolt jam nut | M24 | 300 N·m (221 ft·lb) |
| Chip conveyor mounting bolts | M12 grade 8.8 | 60 N·m (44 ft·lb) |
| HPU mounting bolts | M16 grade 8.8 | 160 N·m (118 ft·lb) |

**Spindle Assembly:**

| Location | Fastener | Torque |
|----------|---------|--------|
| Spindle cartridge mounting bolts | M16 grade 10.9 | 180 N·m (133 ft·lb) (L) |
| Gearbox mounting bolts | M12 grade 8.8 | 60 N·m (44 ft·lb) |
| Spindle motor mounting bolts | M10 grade 8.8 | 35 N·m (26 ft·lb) |
| Encoder coupling hub (motor shaft) | M5 set screw | 4.5 N·m (40 in·lb) |
| Encoder housing mounting screws | M5 | 5 N·m (44 in·lb) |
| Tool unclamp cylinder mounting bolts | M10 grade 8.8 | 35 N·m (26 ft·lb) |
| Hydraulic brake cylinder mounting bolts | M10 grade 8.8 | 40 N·m (30 ft·lb) |

**Axis Assemblies:**

| Location | Fastener | Torque |
|----------|---------|--------|
| Servo motor mounting bolts (X, Y, Z) | M12 grade 8.8 | 60 N·m (44 ft·lb) |
| Bellows coupling shaft grub screws | M6 (to shaft) | 12 N·m (106 in·lb) |
| Ballscrew fixed end housing bolts | M12 grade 8.8 | 60 N·m (44 ft·lb) (L) |
| Ballscrew nut housing bolts | M10 grade 8.8 | 40 N·m (30 ft·lb) (L) |
| Guideway rail mounting bolts | M10 grade 10.9 | 50 N·m (37 ft·lb) (L) |
| Guideway carriage mounting bolts (to axis casting) | M8 grade 8.8 | 25 N·m (22 ft·lb) (L) |
| Table mounting bolts (X-carriage to X-table) | M16 grade 10.9 | 180 N·m (133 ft·lb) (L) |

**Hydraulic System:**

| Location | Fastener | Torque |
|----------|---------|--------|
| HPU drain plug | M20 × 1.5 | 35 N·m (26 ft·lb) |
| HPU filter housing | G3/4 thread | Hand-tight + 3/4 turn |
| ORFS fittings, G1/4 | — | 30 N·m (22 ft·lb) |
| ORFS fittings, G3/8 | — | 50 N·m (37 ft·lb) |
| ORFS fittings, G1/2 | — | 70 N·m (52 ft·lb) |
| ORFS fittings, G3/4 | — | 100 N·m (74 ft·lb) |
| ORFS fittings, G1 | — | 140 N·m (103 ft·lb) |
| HPU pressure switch | G1/4 BSP | 25 N·m (18 ft·lb) |
| Relief valve (main) | G3/4 BSP | 80 N·m (59 ft·lb) |

**Electrical:**

| Location | Fastener | Torque |
|----------|---------|--------|
| Main power terminal L1/L2/L3 | M10 lugs | 20 N·m (177 in·lb) |
| Ground bus connections | M8 lugs | 6 N·m (53 in·lb) |
| Control transformer terminals | M4 screw | 1.5 N·m (13 in·lb) |
| Servo drive motor terminals | M4 screw | 2.5 N·m (22 in·lb) |
| 24 VDC power supply output terminals | M4 screw | 1.0 N·m (9 in·lb) |
| PLC/I/O module terminal block | 3 mm flat screw | 0.5 N·m (4 in·lb) |

**ATC System:**

| Location | Fastener | Torque |
|----------|---------|--------|
| ATC arm gripper mounting screws | M6 | 10 N·m (89 in·lb) |
| Tool pot mounting bolt | M8 | 20 N·m (177 in·lb) |
| ATC sensor mounting clamp screws | M4 | 0.5 N·m (do not overtighten — plastic body) |

---

# Appendix D — Electrical Schematic Index

The following electrical drawings are provided as a separate bound drawing package (BetaCorp Drawing Package BC-DWG-BC500X-ELEC). Contact BetaCorp Systems to obtain the drawing package for your machine (reference machine serial number).

| Drawing No. | Title | Sheet Count |
|-------------|-------|------------|
| BC-E-001 | Main power distribution schematic | 3 sheets |
| BC-E-002 | Spindle drive wiring | 2 sheets |
| BC-E-003 | X, Y, Z servo drive wiring | 4 sheets |
| BC-E-004 | ATC servo drive wiring | 1 sheet |
| BC-E-005 | Hydraulic system motor and control wiring | 2 sheets |
| BC-E-006 | Coolant system wiring | 1 sheet |
| BC-E-007 | Chip conveyor wiring | 1 sheet |
| BC-E-008 | Safety relay circuit (E-Stop, door interlock) | 2 sheets |
| BC-E-009 | PLC I/O wiring — digital inputs (DI) | 4 sheets |
| BC-E-010 | PLC I/O wiring — digital outputs (DO) | 4 sheets |
| BC-E-011 | Sensor wiring — all proximity sensors | 3 sheets |
| BC-E-012 | Encoder wiring — all axes and spindle | 2 sheets |
| BC-E-013 | Control panel wiring | 2 sheets |
| BC-E-014 | MPG pendant wiring | 1 sheet |
| BC-E-015 | Cabinet layout drawing | 2 sheets |
| BC-E-016 | Grounding diagram | 1 sheet |
| BC-E-017 | 24 VDC power distribution | 2 sheets |
| BC-E-018 | Hydraulic solenoid valve wiring | 1 sheet |

---

# Appendix E — Pneumatic Schematic Index

| Drawing No. | Title | Sheet Count |
|-------------|-------|------------|
| BC-P-001 | Pneumatic system overview schematic | 1 sheet |
| BC-P-002 | FRL assembly detail | 1 sheet |
| BC-P-003 | Spindle air purge circuit | 1 sheet |
| BC-P-004 | Chip blow-off circuit (optional) | 1 sheet |
| BC-P-005 | Gear change pneumatic assist circuit | 1 sheet |
| BC-P-006 | ATC arm pneumatic pilot circuit | 1 sheet |

Pneumatic schematics are included in the drawing package BC-DWG-BC500X-PNEU.

---

# Appendix F — Service Contact Directory

## F.1 BetaCorp Systems Contact Information

**Headquarters:**

BetaCorp Systems, Inc.
4500 Industrial Parkway
Greenfield, OH 45123
United States of America

**General Contacts:**

| Department | Phone | Email | Hours |
|------------|-------|-------|-------|
| Main Switchboard | +1 (740) 555-9200 | info@betacorpsystems.com | Mon–Fri 8:00–17:00 EST |
| Technical Support | +1 (800) 555-2382 (BETA) | techsupport@betacorpsystems.com | Mon–Fri 7:00–18:00 EST |
| Parts Department | +1 (800) 555-2382 Option 2 | parts@betacorpsystems.com | Mon–Fri 7:00–18:00 EST |
| Service Dispatch | +1 (800) 555-2382 Option 3 | service@betacorpsystems.com | Mon–Fri 7:00–18:00 EST |
| Emergency Hotline | +1 (800) 555-9911 | — | 24/7/365 |
| Technical Documents | — | docs@betacorpsystems.com | — |
| Customer Portal | docs.betacorpsystems.com | — | 24/7 online |
| Training Department | +1 (740) 555-9245 | training@betacorpsystems.com | Mon–Fri 8:00–16:00 EST |
| Warranty Claims | +1 (740) 555-9230 | warranty@betacorpsystems.com | Mon–Fri 8:00–17:00 EST |

**Regional Service Centers:**

| Region | Location | Phone |
|--------|----------|-------|
| Northeast US | Hartford, CT | +1 (860) 555-4100 |
| Southeast US | Charlotte, NC | +1 (704) 555-4200 |
| Midwest US | Cincinnati, OH | +1 (513) 555-4300 |
| Southwest US | Dallas, TX | +1 (972) 555-4400 |
| West Coast US | Los Angeles, CA | +1 (213) 555-4500 |
| Canada | Mississauga, ON | +1 (905) 555-4600 |
| Mexico | Monterrey | +52 81 555-4700 |
| Germany (EU) | Stuttgart | +49 711 555-4800 |
| United Kingdom | Birmingham | +44 121 555-4900 |
| Japan | Nagoya | +81 52 555-4950 |
| China | Shanghai | +86 21 555-4960 |

## F.2 Emergency Contact Protocol

For machine-down emergencies:

1. Call the 24/7 Emergency Hotline: **+1 (800) 555-9911**
2. Provide:
   - Machine model (BC-500X)
   - Machine serial number
   - Nature of emergency / fault code
   - Plant location and contact name
   - Contact phone number on-site
3. A BetaCorp emergency service coordinator will respond within 30 minutes to assess the situation and dispatch a service engineer if required.

**Emergency parts orders** can be placed through the same hotline for next-flight-out or next-morning delivery of critical components.

---

# Appendix G — Spare Parts Quick-Reference Card

**Critical Spares — Recommended On-Site Stock:**

| Part No. | Description | Qty |
|----------|-------------|-----|
| BC-FLT-HYD-001 | Hydraulic return filter element | 2 |
| BC-SW-CLT-LVL | Coolant level float switch | 1 |
| BC-PSW-HYD-MAIN | Hydraulic pressure switch | 1 |
| BC-CBL-SPENC-3M | Spindle encoder cable | 1 |
| BC-CBL-ENC-5M | Axis encoder cable (X, Y, Z) | 2 |
| BC-SEN-ATC-RET | ATC retract sensor | 1 |
| BC-SEN-ATC-HOME | ATC home sensor | 1 |
| BC-ATC-GRP-L | ATC arm gripper, left | 1 |
| BC-ATC-GRP-R | ATC arm gripper, right | 1 |
| BC-POT-CAT40 (or BT40) | Tool pot, complete | 4 |
| BC-GRP-CAT40-SET (or BT40) | Gripper finger set | 4 |
| BC-BATT-CNC-001 | CNC backup battery | 2 |
| BC-FLT-AIR-001 | Pneumatic FRL filter | 2 |
| BC-OIL-HYD-VG46 | Hydraulic oil, 20 L | 1 |
| BC-LUB-OIL-VG68 | Way lube oil, 5 L | 1 |
| BC-GRS-ATC-001 | ATC grease, 400 g | 1 |
| BC-SEAL-HYD-DRN | HPU drain plug seal | 4 |
| BC-WPR-X-001 | X-axis wiper seal set | 1 |
| BC-WPR-Y-001 | Y-axis wiper seal set | 1 |
| BC-WPR-Z-001 | Z-axis wiper seal set | 1 |

---

# Appendix H — Parameter Quick-Reference Card

**Most Frequently Accessed Parameters:**

| Parameter | Name | Default | Adjust for |
|-----------|------|---------|-----------|
| B1.01 | Spindle Maximum Speed | 10000 RPM | Max speed limit |
| B1.14 | Spindle Speed Window | 50 RPM | At-speed tolerance |
| B1.19 | Spindle Orientation Angle | 0.0° | ATC alignment |
| B1.22 | Spindle Brake Enable | 1 | Brake on deceleration |
| B2.33 | Rapid Traverse X | 36000 mm/min | Max rapid speed |
| B2.35 | Rapid Traverse Z | 30000 mm/min | Max Z rapid speed |
| B2.45 | In-Position Window | 0.005 mm | Settling tolerance |
| B3.12 | ATC Arm Retract Timeout | 2000 ms | E303 trigger time |
| B3.14 | ATC Carousel Short Path | 1 | Shortest index direction |
| B4.02 | HPU Pressure Min Alarm | 120 bar | E404 trigger pressure |
| B5.02 | Coolant Level Min Alarm | 1 | E202 enable |
| B5.03 | Coolant Level Min Delay | 30 s | E202 delay |
| B6.01 | X-Axis Encoder PPR | 2500 | X encoder resolution |
| B6.31 | Spindle Encoder PPR | 4096 | Spindle encoder resolution |
| B8.01 | Door Interlock Mode | 2 | Door safety level |
| B8.03 | Door Open Max Speed | 1000 mm/min | Safe speed with door open |
| B9.20 | Way Lube Interval | 30 min | Lube cycle frequency |
| B9.21 | Way Lube Pump Time | 15 s | Lube pump duration |

---

# Appendix I — Maintenance Log Template

**BC-500X Machine Maintenance Log**

Machine Serial Number: ___________________________
Machine Location: _________________________________

---

**Instructions:**
- Complete one entry for each maintenance task performed
- Entries must be legible and complete
- Retain logs for a minimum of 5 years
- Contact BetaCorp Systems before any work not described in this manual

---

| Date | Machine Hours | Task Code | Task Description | Parts Used | Part Numbers | Technician | Signature | Abnormalities Found | Actions Taken |
|------|--------------|-----------|------------------|------------|--------------|------------|-----------|---------------------|---------------|
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |

**Task Codes (abbreviated):**

| Code | Description |
|------|-------------|
| D-01 | Daily visual inspection |
| D-02 | Coolant level check |
| D-03 | Way lube level check |
| D-04 | Chip bin emptying |
| D-05 | Work zone chip removal |
| D-06 | Daily function test |
| W-01 | Coolant concentration |
| W-02 | Coolant pH |
| W-03 | Coolant strainer cleaning |
| W-04 | ATC inspection |
| W-05 | Guideway wiper inspection |
| M-01 | Bacteria test |
| M-02 | Hydraulic filter inspection |
| M-03 | Encoder cable inspection |
| M-04 | Way lube system check |
| M-05 | Magnetic separator cleaning |
| Q-01 | Axis accuracy check |
| Q-02 | Spindle run-out check |
| Q-03 | ATC sensor verification |
| Q-04 | Hydraulic oil sample |
| S-01 | Hydraulic oil change |
| S-02 | Coolant replacement |
| S-03 | Coolant tank cleaning |
| S-04 | Motor terminal torque |
| A-01 | Annual geometry calibration |
| A-02 | Spindle bearing inspection |
| FAULT | Fault investigation / repair |
| REPAIR | Unscheduled repair |
| OTHER | Other (describe in task description) |

---

# Appendix J — Warranty Registration

**BC-500X Warranty Registration Form**

To register your BC-500X for warranty service, complete and return this form within 30 days of machine acceptance. Warranty coverage begins on the date of machine acceptance as documented on the Installation Acceptance Certificate.

**Customer Information:**

| Field | Entry |
|-------|-------|
| Company Name | |
| Address (Line 1) | |
| Address (Line 2) | |
| City, State/Province | |
| Postal Code, Country | |
| Primary Contact Name | |
| Contact Title | |
| Contact Phone | |
| Contact Email | |
| Accounts Payable Contact | |
| AP Phone / Email | |

**Machine Information:**

| Field | Entry |
|-------|-------|
| Machine Model | BC-500X |
| Machine Serial Number | |
| Purchase Order Number | |
| BetaCorp Invoice Number | |
| Dealer / Distributor Name | |
| Date of Machine Delivery | |
| Date of Machine Acceptance | |
| Installing BetaCorp Engineer | |
| Customer Representative Signature | |
| Customer Representative Name | |
| Date of Signature | |

**Machine Installation Location (if different from above):**

| Field | Entry |
|-------|-------|
| Plant/Facility Name | |
| Address | |
| Maintenance Contact | |
| Maintenance Phone | |

**Return this form by:**
- Email: warranty@betacorpsystems.com (scan or photograph)
- Mail: BetaCorp Systems, Inc., ATTN: Warranty Registration, 4500 Industrial Parkway, Greenfield, OH 45123
- Online: www.betacorpsystems.com/warranty-registration

**Warranty Terms Summary:**

The BC-500X is warranted for **24 months from date of acceptance** or **30 months from date of shipment from BetaCorp factory**, whichever comes first, against defects in materials and workmanship. This warranty does not cover normal wear items, operator-caused damage, or damage from failure to follow maintenance procedures. Complete warranty terms are available at www.betacorpsystems.com/warranty.

---

# End of Manual

---

**BetaCorp Systems, Inc.**
4500 Industrial Parkway
Greenfield, OH 45123
USA

**BC-500X CNC MACHINING CENTER**
**COMPREHENSIVE TECHNICAL MANUAL**

Document No.: BCS-MAN-BC500X-REV4.2
Revision Date: September 2026

*This document is the exclusive property of BetaCorp Systems, Inc. Reproduction in whole or in part without written permission is prohibited.*

*For the most current version of this manual, visit: docs.betacorpsystems.com*

---

**QUICK REFERENCE — KEY FAULT CODES**

| Code | Name | This is NOT... |
|------|------|----------------|
| **E101** | **Spindle Encoder Signal Lost** | NOT a voltage/electrical fault |
| **E202** | **Coolant Level Below Minimum** | NOT a temperature sensor fault |
| **E303** | **Tool Changer Timeout** | NOT a spindle speed fault |
| **E404** | **Hydraulic Pressure Low** | NOT a coolant flow fault |
| **E505** | **Axis Servo Overload** | NOT a door interlock fault |

These codes are specific to the BC-500X. Do not confuse with other machine models.

---

*End of BC-500X Comprehensive Technical Manual*
*BetaCorp Systems, Inc. — Document BCS-MAN-BC500X-REV4.2*

