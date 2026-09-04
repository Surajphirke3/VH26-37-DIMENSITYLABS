# Machine Gamma GX-100
## Operator and Maintenance Manual
**Manufacturer:** GammaTech Industrial Systems  
**Model:** GX-100 CNC Machining Center  
**Document Number:** GT-MAN-GX100-REV4  
**Issue Date:** 2025-03-15  
**Firmware Version:** 3.2.1

---

## 1. Specifications

| Parameter | Value |
|---|---|
| Spindle Speed | 200 – 12,000 RPM |
| Axis Travel (X/Y/Z) | 800 mm / 500 mm / 600 mm |
| Maximum Workpiece Weight | 350 kg |
| Coolant Tank Capacity | 120 L |
| Mains Supply | 400 V AC, 3-phase, 50 Hz, 32 A |

---

## 2. Safety

- Read this manual fully before operating the GX-100.
- Always wear appropriate PPE: safety glasses, steel-capped boots, and hearing protection.
- Never reach into the work envelope while the spindle is rotating.
- Ensure all axis guards are installed before initiating a machining cycle.
- Lockout/Tagout (LOTO) must be applied before any maintenance activity.
- The Emergency Stop button (red mushroom head) is located on the front panel and the pendant.
- Coolant fluid contains biocide; avoid skin contact and dispose per local regulations.
- Do not bypass or defeat any safety interlock switch.
- High-voltage components are present inside the electrical cabinet — authorised personnel only.
- In case of fire, use CO2 extinguisher only; do not use water near electrical enclosures.

---

## 3. Main Components

- **Spindle Assembly:** Direct-drive 11 kW motor, ISO 40 taper, liquid-cooled housing.
- **Axis Drive System:** Three-axis servo drives (X, Y, Z) with glass-scale linear encoders.
- **Automatic Tool Changer (ATC):** 24-position carousel, 8-second tool-to-tool time.
- **Coolant Pump Unit:** 0.37 kW centrifugal pump supplying flood and mist circuits.
- **Hydraulic Clamping Unit:** 70-bar circuit for workholding and ATC drawbar actuation.
- **Electrical Cabinet:** Siemens S7-1200 PLC, axis drives, 24 V DC power supplies.
- **Operator Panel:** 15-inch colour touchscreen HMI, USB port, Ethernet connectivity.
- **Chip Conveyor:** Hinge-belt type, 0.18 kW motor, discharge height 800 mm.
- **Work Light:** LED array, 24 V DC, mounted inside enclosure roof.
- **Lubrication Unit:** Centralised one-shot oil-air lubrication, 1 L reservoir.

---

## 4. Operation

### 4.1 Power-On Sequence
1. Turn the main isolator on the rear electrical cabinet to the ON position.
2. Press the green POWER ON button on the operator panel.
3. Wait for the HMI boot sequence to complete (approximately 45 seconds).
4. Release the Emergency Stop by rotating it clockwise until it pops out.
5. Press RESET to clear any start-up faults displayed on the HMI.
6. Perform the machine reference (home) cycle by pressing REF ALL AXES.

### 4.2 Loading a Part Program
1. Insert USB drive or transfer file via Ethernet to the program directory.
2. On the HMI, navigate to Program Manager > Load Program.
3. Select the required NC file and press Open.
4. Run the program in DRY RUN mode at reduced feedrate before first-off.

### 4.3 Starting a Machining Cycle
1. Clamp the workpiece securely and verify datum offsets in the Work Coordinate System table.
2. Install required tools and confirm lengths in the Tool Offset table.
3. Close the enclosure door; the door interlock must be satisfied.
4. Select AUTO mode on the mode switch.
5. Press CYCLE START to begin execution.

### 4.4 Stopping the Machine
- To pause mid-cycle: press FEED HOLD; press CYCLE START to resume.
- To stop at end of block: press SINGLE BLOCK, then CYCLE START.
- For immediate stop: press RESET to halt motion; spindle will coast to rest.
- For emergency: press the red Emergency Stop button.

---

## 5. Fault Codes

Fault codes appear on the HMI status bar in red with an audible alarm. Note the code, consult this section, and follow corrective steps before clearing the fault with the RESET button.

---

### F001 — Overcurrent on Phase A

**Description:** The drive controller has detected that the instantaneous current drawn on Phase A of the spindle motor exceeds the programmed trip threshold (default 125% of rated current for more than 200 ms). The spindle drive shuts down to prevent motor winding damage.

**Probable Causes:**
- Spindle motor windings partially short-circuited due to contamination or insulation breakdown.
- Cutting tool severely blunt or broken, causing excessive cutting forces.
- Spindle drive IGBT module partially failed, producing unbalanced phase output.

**Corrective Steps:**
1. Press RESET and check whether the fault clears immediately; if not, power-cycle the machine.
2. Inspect the cutting tool in the spindle — replace if worn or broken (see Section 4.2).
3. Using a clamp meter on the spindle supply cables, measure actual phase currents while running at no-load at 1,000 RPM; Phase A must be within ±5% of Phases B and C.
4. If imbalance is confirmed, contact GammaTech service to test the spindle motor insulation resistance (must exceed 1 MΩ at 500 V DC) and inspect the drive module. See Section 7.3.

*Reference: Section 7.3, Drive Diagnostics*

---

### F002 — Overcurrent on Phase B

**Description:** Same detection logic as F001 applied to Phase B.

**Probable Causes:**
- Motor winding fault on Phase B.
- Loose connection on the Phase B supply cable terminal.
- Drive output transistor degradation.

**Corrective Steps:**
1. Check drive terminal tightness (torque to 2.5 Nm per wiring diagram GT-WD-GX100).
2. Measure insulation resistance Phase B to earth.
3. Swap drive module if insulation is healthy but fault persists.
4. Contact GammaTech service if fault recurs.

*Reference: Section 7.3, Drive Diagnostics*

---

### F003 — DC Bus Overvoltage

**Description:** The DC bus voltage inside the spindle drive has risen above 780 V DC. Typically occurs during rapid deceleration when regenerative energy is not absorbed quickly enough.

**Probable Causes:**
- Braking resistor open-circuit or disconnected.
- Excessively short deceleration ramp time programmed.
- Supply voltage persistently high.

**Corrective Steps:**
1. Measure supply line voltage — must be 400 V ±10%.
2. Measure resistance of braking resistor (nominal 22 Ω); replace if open.
3. Increase deceleration ramp time in drive parameter P0.12 by 20%.
4. If bus voltage still spikes, install a correctly rated dynamic braking module.

*Reference: Section 7.4, Electrical Cabinet*

---

### F005 — Axis X Servo Overtemperature

**Description:** The thermal sensor inside the X-axis servo drive has exceeded 85°C. Drive disabled to prevent damage.

**Probable Causes:**
- Cabinet cooling fan failed or blocked.
- Ambient temperature exceeds rated 40°C.
- Servo drive running at sustained high duty cycle.

**Corrective Steps:**
1. Check all cabinet cooling fans for rotation and airflow; clean or replace as needed.
2. Verify ambient temperature at the cabinet intake is below 40°C.
3. Reduce cycle duty cycle or increase dwell time between parts.
4. Inspect drive heatsink for dust accumulation and clean with dry compressed air.

*Reference: Section 8.1, Cooling System*

---

### F007 — ATC Carousel Position Error

**Description:** The tool carousel has failed to index to the commanded pocket position within the 5-second timeout.

**Probable Causes:**
- Carousel proximity sensor dirty or misaligned.
- ATC motor drive tripped.
- Mechanical obstruction in the carousel.

**Corrective Steps:**
1. Inspect the carousel for tool holders protruding abnormally or foreign objects.
2. Clean the carousel index sensor with a lint-free cloth and verify the LED indicator is active.
3. Reset the ATC drive fault via the HMI Diagnostics > ATC menu.
4. Manually jog the carousel using the ATC JOG buttons to verify smooth rotation.

*Reference: Section 6.2, ATC Maintenance*

---

### F010 — Z-Axis Following Error Excessive

**Description:** The difference between the commanded Z-axis position and the actual position reported by the linear encoder has exceeded 0.5 mm for more than 100 ms.

**Probable Causes:**
- Z-axis servo drive fault or reduced gain.
- Encoder scale contaminated with coolant or chips.
- Ballscrew preload nut loose, causing backlash.

**Corrective Steps:**
1. Clean the Z-axis linear encoder read head and glass scale with isopropyl alcohol.
2. Check servo drive for any secondary alarm via the drive keypad.
3. Verify ballscrew coupling bolts are torqued to 12 Nm.
4. Run a Z-axis servo tuning cycle via HMI Diagnostics > Axis Tuning.

*Reference: Section 7.5, Axis Servo System*

---

### F011 — Encoder Feedback Loss on Axis X

**Description:** The GX-100 has lost communication with the linear encoder on the X-axis. The controller cannot confirm axis position, and all motion is inhibited to prevent a crash. This fault is specific to the X-axis glass-scale encoder; refer to F012 and F013 for Y and Z respectively.

**Probable Causes:**
- Encoder read-head cable damaged, pinched, or connector unseated.
- Encoder read head physically separated from the scale due to mechanical impact.
- Electrical noise on the encoder signal lines from a nearby EMC source.

**Corrective Steps:**
1. Power down the machine (LOTO) and inspect the X-axis encoder cable along its full routing; look for cuts, kinks, or coolant ingress at connectors — reseat or replace as required.
2. Verify the read head is within the specified 0.2 mm gap from the glass scale; adjust the mounting bracket if necessary.
3. Check the encoder cable shield is bonded to earth at one end only (drive end) to eliminate ground loops.
4. After reassembly, power on and perform REF ALL AXES to re-establish the reference datum; if fault persists, replace the encoder read head (Part No. GT-ENC-X100).

*Reference: Section 7.5, Axis Servo System; Spare Parts Table 2*

---

### F012 — Encoder Feedback Loss on Axis Y

**Description:** Same as F011, affecting the Y-axis linear encoder.

**Probable Causes:** As F011, applied to Y-axis cabling and read head.

**Corrective Steps:**
1. Inspect Y-axis encoder cable routing inside the Y-axis drag chain.
2. Reseat connectors at both the encoder and the drive end.
3. Verify read-head gap and alignment.
4. Replace encoder if cable is intact and fault persists (Part No. GT-ENC-Y100).

*Reference: Section 7.5*

---

### F015 — Hydraulic Pressure Low

**Description:** The hydraulic system pressure has fallen below 55 bar for more than 3 seconds.

**Probable Causes:**
- Hydraulic fluid level low.
- Hydraulic pump worn or seized.
- Pressure relief valve stuck open.

**Corrective Steps:**
1. Check the hydraulic fluid level sight glass on the reservoir; top up with ISO VG 46 mineral oil if below MIN mark.
2. Listen for abnormal pump noise; if squealing, stop and call service immediately.
3. Check the pressure relief valve setting; adjust to 70 bar using the adjustment screw.
4. Bleed the hydraulic circuit of air if system was recently drained.

*Reference: Section 8.3, Hydraulic System*

---

### F020 — Chip Conveyor Overload

**Description:** The chip conveyor motor has drawn excess current, triggering the motor protection relay.

**Probable Causes:**
- Conveyor jammed with swarf or a large chip.
- Conveyor belt damaged or stretched, causing slippage on drive sprocket.
- Motor protection relay set too low.

**Corrective Steps:**
1. Stop the machine and remove swarf accumulation at the chip discharge end.
2. Manually turn the conveyor drive sprocket — it should rotate without high resistance.
3. Inspect conveyor belt condition; replace if links are broken (Part No. GT-CNV-BELT).
4. Reset the motor protection relay on the electrical cabinet door panel.

*Reference: Section 8.4, Chip Conveyor*

---

### F025 — Coolant Level Low

**Description:** The coolant tank float switch indicates the coolant volume has dropped below the minimum safe level. Coolant pump will be disabled automatically.

**Probable Causes:**
- Coolant consumed by evaporation during extended production.
- Coolant leak at a pipe joint or pump seal.
- Float switch stuck in the low position.

**Corrective Steps:**
1. Inspect visible coolant pipework and pump area for drips or pooling.
2. Top up the coolant tank with correctly mixed coolant solution (5–8% concentration).
3. Press the float switch manually — it should move freely; replace if stuck (Part No. GT-FLOAT-01).
4. After topping up, press RESET to re-enable the coolant pump.

*Reference: Section 8.2, Coolant System*

---

### F030 — Coolant Pump Motor Overload

**Description:** The thermal overload relay protecting the 0.37 kW coolant pump motor has tripped. The coolant supply to the cutting zone is stopped. Continued machining without coolant risks tool and workpiece damage.

**Probable Causes:**
- Coolant pump impeller blocked by swarf or debris drawn in from the tank.
- Coolant has become too viscous due to incorrect mixture or low temperature.
- Motor protection relay set current threshold below the motor's rated 0.9 A full-load current.

**Corrective Steps:**
1. Switch the machine to MANUAL mode and disable the coolant pump from the HMI.
2. Power down (LOTO) and remove the pump strainer basket from the tank; clean thoroughly under running water and reinstall.
3. Check coolant concentration using a refractometer — if concentration exceeds 10%, dilute to the recommended 5–8% range to restore correct viscosity.
4. Locate the motor protection relay (F-Q3) inside the electrical cabinet; verify the set current dial reads 0.9 A and reset the relay by pressing the blue RESET button.

*Reference: Section 8.2, Coolant System; Electrical Schematic GT-SCH-GX100 Sheet 7*

---

### F035 — Lubrication Fault

**Description:** The one-shot lubrication system has failed to confirm a successful lubrication cycle within the programmed interval.

**Probable Causes:**
- Lubrication oil reservoir empty.
- Blocked distribution manifold or lube line.
- Pressure switch faulty.

**Corrective Steps:**
1. Check the 1 L reservoir level; fill with recommended way oil (ISO VG 68).
2. Trigger a manual lube cycle via HMI Diagnostics > Lubrication; confirm the pressure gauge reaches 3–5 bar.
3. Inspect lube lines at each axis bearing block for blockage or disconnection.
4. Replace pressure switch if gauge reads correct but fault persists (Part No. GT-LPS-01).

*Reference: Section 8.5, Lubrication System*

---

### F040 — ATC Tool Clamp Fault

**Description:** The drawbar position sensor has not confirmed a clamped or unclamped state within 2 seconds of a tool change command.

**Probable Causes:**
- Drawbar sensor dirty or misaligned.
- Hydraulic pressure insufficient to actuate drawbar.
- Tool holder retention stud worn.

**Corrective Steps:**
1. Clean the drawbar sensor target and verify sensor LED is illuminated in the clamped state.
2. Check hydraulic pressure (minimum 65 bar for ATC operation).
3. Test clamp/unclamp cycle via HMI Diagnostics > ATC Clamp Test.
4. Replace retention stud if tool pull-out force is less than 8 kN (tested with pull stud gauge).

*Reference: Section 6.2, ATC Maintenance*

---

### F045 — Spindle Orientation Timeout

**Description:** The spindle has not reached the orientation position (defined by the Cs-axis marker pulse) within 10 seconds of an M19 command.

**Probable Causes:**
- Spindle orientation sensor gap out of specification.
- Spindle brake not releasing.
- Drive orientation parameter incorrect.

**Corrective Steps:**
1. Verify the spindle orientation sensor gap is 0.5 ± 0.1 mm.
2. Confirm the spindle brake solenoid is energised (24 V across coil terminals) when release is commanded.
3. Check drive parameter P6.02 (orientation speed) is set to 30 RPM.
4. Manually rotate the spindle by hand after LOTO to confirm free rotation.

*Reference: Section 7.3*

---

### F050 — Work Coordinate System Offset Overrange

**Description:** A requested G54–G59 offset would move an axis beyond its software travel limit.

**Probable Causes:**
- Incorrect datum setting.
- Wrong work offset register edited.
- Program coordinates do not match fixture position.

**Corrective Steps:**
1. Review the work offset table on the HMI and compare against the setup sheet.
2. Re-probe the workpiece datum using the on-machine probing cycle.
3. Verify the part program uses the correct G-code offset (e.g., G54 vs G55).

*Reference: Section 4.3, Work Coordinate Setup*

---

### F055 — Feed Override at Zero

**Description:** A motion command was issued while the feed override potentiometer or slider is set to 0%.

**Probable Causes:**
- Operator has set the feed override to 0% accidentally.
- Feed override input signal fault.

**Corrective Steps:**
1. Increase the feed override to at least 10% and press CYCLE START.
2. If the display shows >0% but the fault persists, check the override signal wiring at the HMI I/O board.

*Reference: Section 4.1, Operator Panel*

---

### F060 — Axis Soft Limit Exceeded (Positive)

**Description:** A motion command would move the specified axis beyond its positive software travel limit.

**Probable Causes:**
- Part program contains a move beyond machine limits.
- Work offset datum set incorrectly, shifting the program too far positive.

**Corrective Steps:**
1. Check the program move values against the axis travel specification in Section 1.
2. Adjust work offset datum so the entire toolpath falls within the machine travel envelope.
3. Use the HMI's 3D simulation to verify toolpath before running on the machine.

*Reference: Section 5, Fault Codes; Section 1, Specifications*

---

### F061 — Axis Soft Limit Exceeded (Negative)

**Description:** Same as F060 for the negative travel direction.

**Probable Causes:** As F060, in the negative axis direction.

**Corrective Steps:** As F060.

*Reference: Section 5, Fault Codes*

---

### F070 — PLC Communication Fault

**Description:** The CNC controller has lost cyclic communication with the Siemens S7-1200 PLC. Machine motion is inhibited.

**Probable Causes:**
- Ethernet cable between CNC and PLC loose or damaged.
- PLC in STOP state due to a program fault.
- IP address conflict on the machine network.

**Corrective Steps:**
1. Check PLC status LEDs: RUN (green) should be on; if STOP (yellow) is on, connect TIA Portal and upload diagnostics.
2. Inspect the Ethernet patch cable between the CNC controller and PLC switch port; replace if damaged.
3. Confirm no IP address conflicts via HMI Network Settings > Ping Test.
4. Power-cycle the PLC only (do not power-cycle the whole machine) and wait for READY.

*Reference: Section 7.6, PLC and HMI*

---

### F080 — Axis Drive Not Ready

**Description:** One or more servo drives have not asserted the READY signal within 5 seconds of machine power-on.

**Probable Causes:**
- 24 V DC control supply fault.
- Drive in fault state from a previous alarm that was not cleared.
- Drive enable signal wiring open.

**Corrective Steps:**
1. Check the 24 V DC power supply output on terminals X5.1 and X5.2 — must be 24 V ±10%.
2. Check each drive status via the drive front keypad; clear any displayed sub-faults.
3. Inspect the drive ENABLE wiring per schematic GT-SCH-GX100 Sheet 4.
4. Replace the 24 V power supply if output voltage is out of tolerance.

*Reference: Section 7.4*

---

### F090 — Tool Life Expired

**Description:** The tool currently in the spindle has reached or exceeded its programmed tool life (in minutes of cutting time or number of holes drilled).

**Probable Causes:**
- Tool has reached its expected service life without being replaced.

**Corrective Steps:**
1. Replace the tool in the magazine pocket with a new tool of the same specification.
2. Reset the tool life counter via HMI Tool Manager > Select Tool > Reset Life.
3. Update the tool offset length for the new tool using the tool setter.

*Reference: Section 4.2, Tool Management*

---

### F099 — Emergency Stop Activated

**Description:** The Emergency Stop circuit has been opened. This latches the safety relay, removes power from all axis drives and the spindle drive, and applies the Z-axis brake. This is a normal safety event — it does not indicate a machine fault. All motion stops immediately. The fault is logged with a timestamp in the alarm history.

**Probable Causes:**
- An operator or bystander pressed one of the Emergency Stop buttons (front panel or pendant) intentionally or accidentally.
- Emergency Stop mushroom head mechanically damaged and not fully releasing.
- Wiring break in the E-Stop safety relay circuit (less common).

**Corrective Steps:**
1. Identify which E-Stop button was activated — visually inspect the front panel and pendant for a depressed (rotated-locked) mushroom head.
2. Rotate the activated button clockwise until it releases with an audible click and the button head rises to its normal proud position.
3. On the HMI, press RESET to reset the safety relay and clear the F099 alarm; the READY indicator should illuminate green.
4. If the fault does not clear after releasing all E-Stop buttons, check the E-Stop circuit continuity at safety relay K1 terminals 13/14 and 23/24; resistance must be <1 Ω.

*Reference: Section 2, Safety; Electrical Schematic GT-SCH-GX100 Sheet 2*

---

## 6. Maintenance Schedule

| Interval | Task |
|---|---|
| Daily | Check coolant level and concentration; inspect for leaks; clean machine exterior |
| Daily | Verify Emergency Stop function before first cycle |
| Weekly | Clean chip conveyor and check belt tension |
| Weekly | Check lubrication oil reservoir level; trigger manual lube cycle |
| Monthly | Inspect axis encoder cables and connectors for damage |
| Monthly | Clean electrical cabinet filters; check fan operation |
| Monthly | Check hydraulic fluid level and condition |
| 6-Monthly | Replace coolant; clean tank; check pump impeller |
| 6-Monthly | Grease ATC carousel bearings (grease nipples, 3 shots of Mobilgrease XHP222) |
| 6-Monthly | Inspect ballscrew and linear guideway condition |
| 6-Monthly | Verify axis geometric accuracy with ballbar test |
| Annually | Full electrical safety inspection by qualified electrician |
| Annually | Spindle bearing vibration analysis |
| Annually | Hydraulic fluid and filter change |
| Annually | Review and update tool life data |

---

## 7. Spare Parts

| Part No. | Description | Qty to Stock |
|---|---|---|
| GT-ENC-X100 | X-Axis Linear Encoder Read Head | 1 |
| GT-ENC-Y100 | Y-Axis Linear Encoder Read Head | 1 |
| GT-FLOAT-01 | Coolant Tank Float Switch | 1 |
| GT-LPS-01 | Lubrication Pressure Switch | 1 |
| GT-CNV-BELT | Chip Conveyor Belt (per metre) | 3 m |
| GT-PUMP-IMP | Coolant Pump Impeller Assembly | 1 |
| GT-FUSE-10A | 10 A Control Circuit Fuse (5 × 20 mm) | 10 |
| GT-FUSE-32A | 32 A Main Supply Fuse | 3 |
| GT-FAN-CAB | Electrical Cabinet Cooling Fan | 1 |
| GT-SEAL-HYD | Hydraulic Pump Seal Kit | 1 |

For parts ordering, contact GammaTech Parts Desk: +44 1234 567890 / parts@gammatech-industrial.com
