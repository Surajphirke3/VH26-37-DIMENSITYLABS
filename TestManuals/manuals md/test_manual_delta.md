# Machine Delta DX-200
## Operator and Maintenance Manual
**Manufacturer:** DeltaWorks Industries  
**Model:** DX-200 Automated Press Brake  
**Document Number:** DW-MAN-DX200-REV2  
**Issue Date:** 2024-11-01  
**Controller Firmware:** 5.0.4

---

## 1. Specifications

| Parameter | Value |
|---|---|
| Press Force (Nominal) | 200 tonnes |
| Bending Length | 2,500 mm |
| Ram Stroke | 250 mm |
| Backgauge Axes | X, R, Z1, Z2 (4-axis CNC) |
| Mains Supply | 400 V AC, 3-phase, 50 Hz, 63 A |

---

## 2. Safety

- Only trained and authorised operators may use the DX-200. Minimum age 18 years.
- The DX-200 uses a hydraulic ram producing up to 200 tonnes of force — never place hands between the top and bottom tools.
- The front safety light curtain (Type 4, Category 4 per ISO 13849) must never be defeated or bypassed.
- Before die changes, isolate the hydraulic pump and apply LOTO to the main isolator.
- Wear cut-resistant gloves when handling sheet metal; wear safety glasses at all times.
- Do not operate the machine if the light curtain controller (Sick deTec4) shows a fault — call maintenance.
- Maximum sheet weight for manual handling: 25 kg; use the sheet support arm for heavier stock.
- Inspect top and bottom tools (punches and dies) for cracks before each shift; do not use cracked tooling.
- Keep the area behind the backgauge clear — the backgauge moves at up to 300 mm/s.
- In an emergency, press the red Emergency Stop on the front pedestal or the foot pedal guard.

---

## 3. Main Components

- **Hydraulic Ram and Cylinder:** Twin 100-tonne cylinders, servo-hydraulic proportional valve control.
- **Top Beam (Ram):** Carries upper punch tooling; guided by precision linear bearings on side frames.
- **Bottom Beam (Bed):** Fixed; carries lower die tooling held in a segmented tool clamp.
- **4-Axis CNC Backgauge:** Servo-driven X (front/back), R (height), Z1, Z2 (lateral) axes with linear encoders.
- **Hydraulic Power Unit (HPU):** 22 kW electric motor driving a variable-displacement axial piston pump.
- **Safety Light Curtain:** Sick deTec4 front guarding, 14 mm resolution, mounted on ram front face.
- **Control Cabinet:** B&R Automation PC with panel-mounted 21-inch touchscreen, Ethernet, USB.
- **Foot Pedal:** Two-stage spring-return pedal; Stage 1 = mute light curtain at slow speed; Stage 2 = high speed.
- **Crowning System:** Motorised bottom beam crowning, 7-point adjustment, compensates for ram deflection.
- **Sheet Support Arms:** Pneumatically height-adjustable, 2 × arms, 1,500 mm reach.

---

## 4. Operation

### 4.1 Start-Up Sequence
1. Turn the main isolator to ON and unlock the control cabinet door key switch.
2. Press the white CONTROL ON button on the pedestal; the HMI will boot (approximately 30 seconds).
3. Check that all Emergency Stop buttons are released (rotate clockwise).
4. Press RESET on the HMI to clear start-up alarms.
5. Enable the hydraulic pump by pressing HPU START; wait for system pressure (200 bar) to register on the gauge.
6. Reference the backgauge axes: press HOME ALL AXES on the backgauge setup screen.

### 4.2 Programming a Bending Sequence
1. On the HMI, navigate to Job Manager > New Job.
2. Enter sheet material (grade, thickness), and the machine will calculate recommended bend force and crowning offset.
3. Program each bend step: angle, backgauge position, ram depth, tool selection.
4. Save the job and perform a dry cycle (ram at slow speed, no sheet) to verify backgauge movements.

### 4.3 Performing a Bend
1. Select the saved job and press LOAD.
2. Stand in front of the machine, align the sheet to the backgauge fingers.
3. Depress the foot pedal Stage 1 — the ram descends slowly; light curtain is muted below the muting point.
4. Depress Stage 2 to apply full press speed for the final bend.
5. Release the pedal; the ram retracts and the backgauge advances to the next step position.

### 4.4 Die Change Procedure
1. Apply LOTO to the main isolator.
2. Use the bottom clamp quick-release lever to free the lower die segments.
3. Support the die with the die trolley before sliding out.
4. Insert new die, clamp, and enter the new die height in the HMI tool table.

---

## 5. Fault Codes

Fault codes are displayed in the HMI alarm banner. The banner shows the code, a short description, and the time of occurrence. Press FAULT DETAIL for full information. Always record the fault code before pressing ACK (acknowledge).

---

### F001 — DC Link Voltage Too High

**Description:** The DC link bus inside the servo amplifier powering the backgauge axes has risen above 780 V DC. This is distinct from mains overvoltage (see F003). The condition is caused by regenerative energy returning from a rapidly decelerating backgauge axis being unable to dissipate fast enough. The servo amplifier shuts down all backgauge axes to protect the power stage.

**Probable Causes:**
- The braking resistor on the servo amplifier has gone open-circuit or its connecting cable is broken.
- The backgauge deceleration ramp (parameter BG.DECEL in the drive menu) is set too aggressively short.
- Mains supply voltage is already at the high end of tolerance (>440 V AC) before regeneration occurs.

**Corrective Steps:**
1. Measure the mains supply at the main isolator terminals — must be 400 V ±10% (360–440 V). If high, notify the facility electrician before proceeding.
2. Power down (LOTO) and measure the braking resistor resistance at the servo amplifier terminals R+ and RB; the nominal value is 47 Ω ±10%. Replace if open or out of tolerance (Part No. DW-BRK-RES).
3. If the resistor is healthy, open the servo drive parameter menu and increase BG.DECEL from the current value by 25% (e.g., 0.2 s → 0.25 s) to reduce peak regenerative current.
4. If the fault persists at normal mains voltage with a good braking resistor, the DC link capacitors may be degraded — request DeltaWorks service to perform a capacitance test.

*Reference: Section 7.2, Servo Amplifier; Electrical Schematic DW-SCH-DX200 Sheet 5*

---

### F002 — DC Link Voltage Too Low

**Description:** The DC link voltage has fallen below 500 V DC, indicating the mains supply is insufficient to maintain the regulated bus.

**Probable Causes:**
- Phase loss on the input supply (check F099 for phase failure indication).
- Main rectifier diode failure.
- Supply cable undersized, causing voltage drop under load.

**Corrective Steps:**
1. Measure all three phase voltages at the drive input terminals.
2. Check fuses F1, F2, F3 in the drive input fuse holder.
3. If all three phases are present and fuses intact, request a rectifier diode test from a qualified engineer.
4. Verify supply cable cross-section matches the installation drawing (minimum 16 mm² per phase).

*Reference: Section 7.2*

---

### F003 — Mains Overvoltage

**Description:** The incoming mains supply voltage has exceeded 440 V AC for more than 500 ms.

**Probable Causes:**
- Utility voltage surge.
- Neutral conductor loss creating an overvoltage condition on one or more phases.
- Transformer tap set incorrectly.

**Corrective Steps:**
1. Measure mains voltage with a calibrated voltmeter; record all three phases.
2. If voltage is persistently high, notify the facility electrical team — do not operate the machine.
3. Check transformer tap position if a site transformer is present.

*Reference: Section 7.2*

---

### F005 — HPU Motor Overtemperature

**Description:** The 22 kW hydraulic pump motor winding temperature sensor (PT100) has exceeded 130°C.

**Probable Causes:**
- Motor cooling fan failed or blocked.
- Sustained high-duty-cycle operation without rest.
- Hydraulic fluid viscosity too high (cold start with incorrect grade).

**Corrective Steps:**
1. Allow the motor to cool for 30 minutes with the HPU stopped.
2. Inspect the motor cooling fan — rotate by hand to check for binding; clean the fan guard.
3. Verify hydraulic fluid grade matches specification (ISO VG 46 AW); drain and replace if incorrect.
4. Reduce bending cycle rate to allow motor temperature to remain below 120°C.

*Reference: Section 8.3, Hydraulic Power Unit*

---

### F007 — Backgauge Axis X Following Error

**Description:** The X-axis backgauge servo following error has exceeded 2 mm.

**Probable Causes:**
- Mechanical obstruction against the backgauge fingers.
- Servo encoder cable damaged or unseated.
- Servo drive gain parameters incorrect after firmware update.

**Corrective Steps:**
1. Clear any sheet or scrap from the backgauge travel path.
2. Inspect the X-axis encoder cable connector at the servo motor.
3. Check servo drive status via the drive display; clear any sub-faults.
4. Run the backgauge calibration routine via HMI Setup > Backgauge Calibration.

*Reference: Section 7.3, Backgauge System*

---

### F010 — Ram Angle Measurement Discrepancy

**Description:** The two linear scales measuring ram position (left and right side) differ by more than 0.15 mm, indicating a possible ram twist or scale fault.

**Probable Causes:**
- One of the two ram position scales is contaminated or damaged.
- Unequal hydraulic pressure in the left and right cylinders.
- Ram guide clearance excessive due to wear.

**Corrective Steps:**
1. Clean both ram linear scale read heads with isopropyl alcohol.
2. Check left and right cylinder pressure independently via the hydraulic gauge valves.
3. Inspect ram guide gibs; adjust or replace if clearance exceeds 0.05 mm.
4. Contact DeltaWorks service if fault persists after steps 1–3.

*Reference: Section 7.1, Ram and Hydraulic System*

---

### F011 — Temperature Sensor Short Circuit

**Description:** A short circuit has been detected on one of the machine's PT100 resistance temperature sensors. The affected sensor is reporting a resistance of less than 5 Ω, which corresponds to a temperature below −200°C — clearly an electrical fault rather than a real temperature reading. The control system disables the corresponding thermal protection channel and raises this alarm to prevent a dangerous undetected overtemperature condition elsewhere in the machine.

**Probable Causes:**
- The PT100 sensor wiring has been crushed or pinched, shorting the two signal wires together (common in areas near the hydraulic ram or cable drag chains).
- Coolant or hydraulic fluid has entered the sensor terminal head, causing a low-resistance short between the sensor leads.
- The sensor itself has internally failed with a short circuit between measurement elements (less common but possible after prolonged exposure to vibration).

**Corrective Steps:**
1. On the HMI, navigate to Diagnostics > Temperature Sensors to identify which channel is reporting the short (HPU motor, hydraulic oil, or cabinet ambient).
2. Power down the machine (LOTO) and disconnect the identified sensor's cable at the control cabinet terminal block; measure resistance between the two signal wires with a multimeter — a healthy PT100 reads approximately 100 Ω at 0°C (109 Ω at 25°C). A reading below 10 Ω confirms a short.
3. If the short is in the cable, trace the cable route and look for crush points, particularly inside the ram drag chain and at the sensor terminal head; repair or replace the cable.
4. If the cable measures correctly but the fault persists when reconnected, the sensor element itself is shorted — replace the sensor (Part No. DW-PT100-HYD for hydraulic oil sensor, DW-PT100-MOT for HPU motor sensor).

*Reference: Section 7.4, Control Cabinet; Electrical Schematic DW-SCH-DX200 Sheet 9*

---

### F015 — Hydraulic Oil Temperature High

**Description:** The hydraulic oil temperature has exceeded 60°C. Machine operation is restricted to slow speed to reduce heat generation.

**Probable Causes:**
- Oil cooler heat exchanger blocked or failed.
- Cooling water flow to the oil cooler insufficient.
- Relief valve bypassing at high pressure continuously.

**Corrective Steps:**
1. Check the oil cooler for blockage — clean the air-cooled fins if applicable, or verify cooling water flow if water-cooled.
2. Monitor the oil temperature trend: if rising rapidly, stop the HPU.
3. Listen for continuous relief valve bypass noise (constant high-pitched hiss); if present, check system pressure setpoint.
4. Allow oil to cool to below 50°C before resuming full-speed operation.

*Reference: Section 8.3*

---

### F020 — Light Curtain Fault

**Description:** The Sick deTec4 safety light curtain controller has reported an internal device fault (not a simple beam interruption).

**Probable Causes:**
- Light curtain emitter or receiver head damaged or misaligned beyond tolerance.
- Contamination (oil mist) on the optical lens surface.
- Internal controller fault within the deTec4.

**Corrective Steps:**
1. Clean the emitter and receiver lenses with a lint-free cloth and isopropyl alcohol.
2. Check alignment: the green LED on the receiver must be solid green; flashing indicates misalignment.
3. Power-cycle the light curtain by cycling the safety relay supply breaker (F-CB4 in the cabinet).
4. If the fault persists, refer to the Sick deTec4 manual for diagnostic LED codes; replace the controller if indicated.

*Reference: Section 6.1, Safety System; Sick deTec4 Operating Instructions*

---

### F025 — Crowning Axis Fault

**Description:** The motorised crowning adjustment has failed to reach the target position within 15 seconds.

**Probable Causes:**
- One of the 7 crowning wedge motors has stalled or its motor protection relay has tripped.
- Crowning wedge jammed due to debris or lack of lubrication.
- Encoder feedback fault on a crowning axis.

**Corrective Steps:**
1. Navigate to HMI Diagnostics > Crowning Axes to identify the specific wedge motor in fault.
2. Reset the relevant motor protection relay inside the control cabinet.
3. Apply a small amount of molybdenum grease to the crowning wedge sliding surface.
4. Manually command the wedge to move via Diagnostics jog; if it moves but cannot hold position, check the encoder.

*Reference: Section 8.5, Crowning System*

---

### F030 — Door Safety Switch Open

**Description:** The rear guard door safety switch has detected that the rear guard door is open (or its switch has failed open-circuit). The DX-200 will not initiate a ram cycle while the rear guard door is open, as this zone is accessible by the backgauge and presents a crushing hazard. This is a hard safety stop — it cannot be bypassed or overridden during normal production.

**Probable Causes:**
- The rear guard door has been physically opened (for die retrieval or maintenance access) and not properly closed and latched.
- The door safety switch (Schmersal AZ 16, positively operated) actuator key is missing or broken, preventing the switch from engaging even when the door is closed.
- The wiring to the door safety switch has been damaged or a connector is loose, causing the circuit to read as open even with the door physically latched.

**Corrective Steps:**
1. Physically inspect the rear guard door — ensure it is fully closed and the latch engages; listen for the click of the latch mechanism. If the door does not latch, inspect the latch cam and striker for deformation and realign or replace.
2. With the door closed, check the safety switch status on the HMI Diagnostics > Safety Inputs screen — the "Rear Door" input should show a logic-1 (closed) state. If still logic-0 with door latched, proceed to step 3.
3. Inspect the Schmersal AZ 16 switch actuator key on the door edge — it must be fully inserted; if bent or broken, replace it (Part No. DW-KEY-AZ16). Check that the switch actuator hole is clean and unobstructed.
4. If the actuator key and door are intact, power down (LOTO) and check continuity in the safety switch cable from the switch terminals to safety relay K2 (terminals A1, A2 per schematic DW-SCH-DX200 Sheet 3); repair any open circuit found. Do not short-circuit or tape the switch — this violates ISO 13849 and creates a serious safety risk.

*Reference: Section 2, Safety; Section 6.1, Safety System; Schematic DW-SCH-DX200 Sheet 3*

---

### F035 — Foot Pedal Fault

**Description:** The foot pedal safety contact signals are inconsistent — both Stage 1 and Stage 2 contacts are simultaneously active, which is mechanically impossible.

**Probable Causes:**
- Foot pedal internal contact mechanism damaged.
- Water or contamination inside the pedal body short-circuiting contacts.
- Pedal cable wiring fault.

**Corrective Steps:**
1. Release the foot pedal completely and check whether the fault clears.
2. Inspect the pedal body for signs of damage or contamination ingress; dry out if wet.
3. Test pedal contacts in isolation using a multimeter per the wiring diagram.
4. Replace the foot pedal assembly if contacts are internally damaged (Part No. DW-PEDAL-01).

*Reference: Section 6.1*

---

### F040 — Backgauge Home Position Loss

**Description:** The backgauge reference position (established at start-up by homing) has been invalidated, typically because a servo fault occurred that may have allowed uncontrolled movement.

**Probable Causes:**
- Servo drive fault interrupted the backgauge mid-cycle.
- Power failure during a backgauge move.
- Reference mark on the encoder scale not found during homing.

**Corrective Steps:**
1. On the HMI, press HOME ALL AXES to run the homing sequence.
2. Visually confirm the backgauge travels to the hard stop and retreats to the home position marker.
3. If homing fails, inspect the X-axis reference mark sensor for contamination.
4. Re-enter the backgauge calibration offset values from the machine data sheet stored in the control cabinet.

*Reference: Section 7.3*

---

### F045 — Tool Table Data Corrupt

**Description:** The tool and die data table stored on the HMI has a checksum mismatch, indicating data corruption.

**Probable Causes:**
- Power loss during a tool table save operation.
- HMI storage media (SSD) fault.

**Corrective Steps:**
1. On the HMI, navigate to System > Backup/Restore > Restore Tool Table from the most recent backup.
2. If no backup exists, re-enter tool dimensions manually from the physical tool documentation.
3. Immediately create a backup once data is restored: System > Backup/Restore > Backup Now.
4. Contact DeltaWorks support if restores repeatedly fail — the SSD may need replacement.

*Reference: Section 7.5, HMI and Data Management*

---

### F050 — Bend Angle Sensor Fault

**Description:** The laser-based in-process angle measurement system has returned an out-of-range or invalid reading.

**Probable Causes:**
- Laser sensor window dirty with oil or metal dust.
- Sheet surface reflectivity outside the sensor's operating range.
- Sensor cable damaged.

**Corrective Steps:**
1. Clean the angle sensor window with a lint-free lens cloth.
2. Ensure the sheet surface is free of oil film in the measurement zone.
3. If the sheet has a very shiny or very dark surface, adjust the sensor sensitivity via HMI Setup > Angle Sensor > Sensitivity.
4. Disable in-process angle measurement and use manual angle gauging if the sensor cannot be corrected before production.

*Reference: Section 7.6, Angle Measurement System*

---

### F055 — HPU Pressure Relief Valve Open

**Description:** The hydraulic system pressure has been at the relief valve setpoint (210 bar) for more than 5 continuous seconds, indicating excessive bypass.

**Probable Causes:**
- Sheet material is harder or thicker than the job specifies, requiring more force than available.
- Relief valve setpoint has drifted low.
- Proportional valve spool sticking.

**Corrective Steps:**
1. Verify the material grade and thickness match the job specification on the HMI.
2. Check the relief valve setpoint using the hydraulic test point — adjust to 210 bar if drifted.
3. Inspect the proportional valve for contamination; flush and clean if spool shows stiction.

*Reference: Section 8.3*

---

### F060 — Axis R (Ram Height) Out of Range

**Description:** The backgauge R-axis (vertical height) has been commanded to a position outside its 0–300 mm travel range.

**Probable Causes:**
- Job program references incorrect R-axis value for the installed die height.
- Die table not updated after a die change.

**Corrective Steps:**
1. Enter the correct installed die height in HMI Tool Table > Bottom Die Height.
2. Recalculate the job sequence; the R-axis target must be within 0–300 mm.

*Reference: Section 4.2*

---

### F070 — Network Communication Fault

**Description:** The DX-200 has lost communication with the factory network (Profinet or Ethernet/IP) for more than 10 seconds.

**Probable Causes:**
- Network cable disconnected or damaged.
- Factory network switch failure.
- IP address configuration error after a firmware update.

**Corrective Steps:**
1. Check the Ethernet cable from the control cabinet to the network switch.
2. Ping the machine's IP address from a factory PC to confirm connectivity.
3. Verify IP settings on the HMI: Settings > Network. Compare against the site network map.

*Reference: Section 7.5*

---

### F080 — Safety Relay Fault

**Description:** The dual-channel safety relay (Pilz PNOZ) has detected an inconsistency in its monitoring channels.

**Probable Causes:**
- One of the dual-channel E-Stop or guard switch inputs has broken a wire.
- Safety relay itself has failed after its rated 20-year service life.
- Incorrect reset sequence performed after an E-Stop event.

**Corrective Steps:**
1. Perform the correct manual reset: ensure all E-Stops are released, then press the panel RESET button.
2. Check the Pilz PNOZ LED diagnostics per the Pilz manual (supplied in the documentation envelope inside the cabinet door).
3. Measure continuity of all E-Stop and guard switch wiring at the safety relay input terminals.
4. Replace the safety relay if all inputs are healthy but the fault persists (Part No. DW-PNOZ-01).

*Reference: Section 6.1*

---

### F090 — Job Program CRC Error

**Description:** The loaded bending job program has failed its cyclic redundancy check, indicating the file may be corrupted.

**Probable Causes:**
- USB transfer incomplete or USB drive fault.
- File edited on an external PC and saved with encoding incompatible with the DX-200 controller.

**Corrective Steps:**
1. Reload the job from the USB drive or network share.
2. Verify the file on a PC before transferring — open it in the DeltaWorks offline editor to check syntax.
3. If the error persists, re-create the job on the machine HMI from scratch.

*Reference: Section 4.2*

---

### F099 — Power Supply Phase Failure

**Description:** The three-phase monitoring relay (Finmotor type FIN 3P) has detected the loss of one or more incoming supply phases, or a phase sequence reversal. This fault is fundamentally different from an operator-initiated Emergency Stop. The machine shuts down the hydraulic pump motor and all servo axes immediately because single-phase operation of the 22 kW HPU motor will cause rapid overheating and motor winding failure within seconds. The phase monitor relay latches the fault — it does not auto-reset when supply is restored.

**Probable Causes:**
- A main supply fuse (F1, F2, or F3 in the main isolator) has blown, typically due to a transient fault or an upstream supply issue.
- The utility supply has lost a phase due to a network fault at the distribution board or upstream transformer.
- The main isolator or contactor (K-MAIN) has developed a faulty contact on one pole, interrupting one phase intermittently.

**Corrective Steps:**
1. Check all three incoming phase voltages at the main isolator input terminals using a calibrated voltmeter — all three must read 230 V AC line-to-neutral (400 V line-to-line). Note which phase is absent or low.
2. Inspect fuses F1, F2, and F3 in the main supply fuse holder (top of the main isolator); replace any blown fuse with an identically rated fuse (Part No. DW-FUSE-63A, gG 63 A). Do not use a higher-rated fuse.
3. If all three fuses are intact and all three phases are present at the isolator input but one phase is absent at the output, inspect the main isolator contacts and the main contactor K-MAIN for pitting or burning — contact a qualified electrician.
4. After restoring the supply, the phase monitor relay must be manually reset: open the control cabinet and press the red RESET button on the Finmotor relay; do not reset until all three phases are confirmed healthy, as the relay will immediately re-trip on a faulty supply.

*Reference: Section 2, Safety; Section 7.2, Electrical Supply; Schematic DW-SCH-DX200 Sheet 1*

---

## 6. Maintenance Schedule

| Interval | Task |
|---|---|
| Daily | Check hydraulic oil level in reservoir sight glass |
| Daily | Inspect top and bottom tooling for chips or cracks; replace if damaged |
| Daily | Test light curtain function using the test rod supplied with the machine |
| Weekly | Clean light curtain lenses with lens cloth |
| Weekly | Check backgauge finger condition and tighten mounting bolts |
| Monthly | Check hydraulic oil condition — sample and test oil quality |
| Monthly | Lubricate backgauge lead screws with Castrol LM grease |
| Monthly | Inspect all safety switch actuators and cable routing |
| Monthly | Verify Emergency Stop response time using a safety tester |
| 6-Monthly | Change hydraulic oil filter element (Part No. DW-HYD-FILT) |
| 6-Monthly | Check ram guide gib clearance; adjust if >0.05 mm |
| 6-Monthly | Inspect crowning wedge sliding surfaces; apply molybdenum grease |
| Annually | Full hydraulic hose inspection; replace any hose showing cracks or weeping |
| Annually | Safety relay functional test and log per ISO 13849 maintenance records |
| Annually | Electrical insulation test (Megger) on HPU motor |

---

## 7. Spare Parts

| Part No. | Description | Qty to Stock |
|---|---|---|
| DW-BRK-RES | Braking Resistor, 47 Ω, 1 kW | 1 |
| DW-PT100-HYD | PT100 Temperature Sensor, Hydraulic Oil | 1 |
| DW-PT100-MOT | PT100 Temperature Sensor, HPU Motor | 1 |
| DW-KEY-AZ16 | Schmersal AZ 16 Actuator Key | 2 |
| DW-PEDAL-01 | Foot Pedal Assembly | 1 |
| DW-PNOZ-01 | Pilz PNOZ X3 Safety Relay | 1 |
| DW-FUSE-63A | Main Supply Fuse, 63 A gG | 6 |
| DW-HYD-FILT | Hydraulic Return Filter Element | 2 |
| DW-SEAL-HYD | Hydraulic Cylinder Seal Kit | 1 |
| DW-ENC-BG | Backgauge Axis Encoder (universal, X/R/Z) | 1 |

For parts and service, contact DeltaWorks Industries: +49 89 4567 8900 / service@deltaworks-industries.de
