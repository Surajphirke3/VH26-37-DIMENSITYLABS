# Machine Epsilon EP-750
## Operator and Maintenance Manual
**Manufacturer:** Epsilon Robotics GmbH  
**Model:** EP-750 5-Axis Robotic Machining Cell  
**Document Number:** ER-MAN-EP750-REV3  
**Issue Date:** 2025-07-22  
**Robot Controller Software:** RobotOS 7.4.2

---

## 1. Specifications

| Parameter | Value |
|---|---|
| Robot Payload | 750 kg |
| Reach (Maximum) | 3,200 mm |
| Positioning Repeatability | ±0.05 mm |
| Spindle Motor Power | 22 kW, HSK-A63 interface |
| Mains Supply | 400 V AC, 3-phase, 50 Hz, 100 A |

---

## 2. Safety

- The EP-750 robotic cell operates within a fenced safety zone — never enter the cell while the robot is in AUTO mode.
- The cell perimeter is protected by a Sick S3000 safety laser scanner in addition to gate interlock switches.
- Personnel entering the cell for maintenance must apply LOTO to the main isolator and the robot controller key switch.
- The teach pendant has a three-position enabling switch: released or fully pressed = stop; middle position only = robot motion allowed during manual teach mode.
- Do not exceed a manual jogging speed of 250 mm/s while inside the cell, even in teach mode.
- Residual stored energy in the robot servo capacitor banks is present for up to 90 seconds after power-off — wait before touching internal drive components.
- The spindle produces chip ejection hazards — always close the chip guard panels before starting a machining cycle.
- Tool changes are performed by the automated tool changer rack; never manually reach into the tool change zone while the robot is homed to the change position.
- Hydraulic counterbalance pressure of 180 bar is present in the robot J2 and J3 joints — do not disassemble joints without first venting the counterbalance circuit.
- An audible pre-motion warning (3-second horn) sounds before AUTO mode cycles start — confirm all personnel are clear.

---

## 3. Main Components

- **6-Axis Robot Arm:** Epsilon ER-750, forged steel arms, hollow-wrist design for cable routing.
- **Robotic Spindle Head:** Electrically driven spindle, HSK-A63, 0–18,000 RPM, liquid-cooled.
- **Automatic Tool Change (ATC) Rack:** 40-position chain magazine, servo-driven, mounted on the cell rear wall.
- **Tool Length Measurement Station:** Blum TC52 laser measuring system, 0–300 mm tool length range.
- **Centralised Lubrication System:** Bijur Delimon EPS-II, servo-driven pump, 2 L reservoir, 18 distribution points.
- **Robot Controller Cabinet:** Epsilon RC-7 controller, EtherCAT bus, 21-inch colour pendant with Windows-embedded HMI.
- **Safety Laser Scanner:** Sick S3000, 270° scan range, 5 m protective field, 7 m warning field.
- **Workholding Table:** Hydraulic 4-jaw chuck on indexable rotary table, 1,200 mm diameter.
- **Coolant and Chip Management:** Through-spindle coolant (TSC), 70-bar pump, chip conveyor, mist extractor.
- **Calibration Artefact:** UNIPOINT reference sphere mounted permanently on the cell base plate for TCP calibration.

---

## 4. Operation

### 4.1 Cell Start-Up
1. Turn the main isolator to ON on the exterior of the cell enclosure.
2. Turn the key switch on the robot controller cabinet to the ON position.
3. Press the green POWER ON button on the controller cabinet front; wait for RobotOS to fully load (approximately 60 seconds).
4. Release all Emergency Stop buttons (rotate clockwise).
5. On the teach pendant, navigate to System > Drive Enable and press ENABLE to energise the servo drives.
6. Perform robot calibration: System > Calibration > Run Auto-Calibration. The robot will move to the reference sphere and update its TCP.
7. Reference the ATC chain magazine: ATC > Home Magazine.

### 4.2 Loading a Machining Program
1. Transfer the robot machining program (.epx file) to the controller via USB or the shop floor network.
2. Navigate to Program Manager > Load, select the program, and press Open.
3. Verify the tool list in the program matches the tools loaded in the ATC rack.
4. Run the program in SIMULATION mode on the pendant before first execution to check for reach and collision warnings.

### 4.3 Running a Machining Cycle
1. Close and latch all cell door guards; confirm the safety scanner is unobstructed.
2. On the controller cabinet, turn the mode switch to AUTO.
3. Press CYCLE START; the 3-second horn will sound before motion begins.
4. Monitor the cycle from outside the cell using the HMI status display.

### 4.4 Emergency Procedures
- Press any red Emergency Stop button (3 located around the cell perimeter, 1 on the teach pendant) to immediately stop all robot and spindle motion.
- If a person is trapped inside the cell, use the manual brake release buttons on the controller cabinet (marked by joint number) to manually move the robot while holding the buttons — gravity may still apply to unbalanced joints.
- Do not re-enter the cell until power is confirmed off and residual servo energy has discharged (90-second wait).

---

## 5. Fault Codes

All fault codes appear on the teach pendant status screen and on the HMI summary panel outside the cell. Each code is logged to the fault history file at /robot/logs/fault_history.log. Use the pendant Fault Detail screen for the full description, axis state data at the time of the fault, and recommended actions.

---

### F001 — Servo Drive Communication Timeout

**Description:** The EP-750 robot controller communicates with all six axis servo drives via an EtherCAT fieldbus at a 1 ms cycle time. This fault indicates that the controller has not received a valid EtherCAT response frame from one or more servo drives within three consecutive communication cycles (3 ms total). All robot motion is stopped immediately because loss of servo feedback makes safe position control impossible. The fault identifies which drive (J1–J6 or spindle) has dropped off the bus.

**Probable Causes:**
- The EtherCAT ring cable between the affected drive and the next drive in the chain has been damaged (pinched, cut, or connector unseated) — typically caused by cable fatigue at a cable carrier entry point.
- An axis servo drive has developed an internal fault that prevents it from participating in EtherCAT communication; the drive's RUN LED will be off or flashing red.
- Electrical noise from the spindle VFD is being coupled into the EtherCAT cable, corrupting frames — more likely if the fault is intermittent and occurs during high-speed spindle acceleration.

**Corrective Steps:**
1. On the teach pendant, navigate to Diagnostics > EtherCAT Bus Status; the display shows the EtherCAT topology with each drive indicated as OPERATIONAL (green), PRE-OP (yellow), or LOST (red). Identify the first drive in the chain that shows LOST — this is the probable fault location or the drive just upstream of it.
2. Power down the robot controller (LOTO) and inspect the EtherCAT patch cable at both the upstream and downstream connectors of the identified drive; reseat RJ45 connectors firmly and check for bent pins or cracked cable jackets; replace the cable if damaged (Part No. ER-ETH-CABLE).
3. If the cable is intact, power on and check the drive front-panel LED: the Drive RUN LED must be solid green. If flashing or off, the drive has an internal error — note the LED flash code and refer to the Epsilon Servo Drive Reference Guide (Document ER-SRG-7) for the specific sub-fault; clear the sub-fault via the drive parameter menu before restarting.
4. If the fault is intermittent and correlates with spindle acceleration, install a ferrite clamp on the EtherCAT cable near the spindle VFD (clamp Part No. ER-FERRITE-28); also verify that the EtherCAT cable is routed at least 100 mm away from power cables throughout the cable carrier.

*Reference: Section 7.1, Robot Controller and EtherCAT Bus; ER-SRG-7 Servo Drive Reference Guide*

---

### F002 — Joint J1 Position Limit Exceeded

**Description:** Joint J1 has been commanded to or has reached a position outside its permitted range of ±185°.

**Probable Causes:**
- Part program contains a motion target requiring J1 to exceed its limit.
- Incorrect tool centre point (TCP) calibration resulting in different joint solutions than expected.

**Corrective Steps:**
1. Review the program motion target in question using the offline simulation.
2. Add a via-point to approach the target with a different joint configuration.
3. Re-run TCP calibration via System > Calibration > Auto-Calibration if limits are only being hit after a tool change.

*Reference: Section 7.2, Robot Kinematics*

---

### F003 — Spindle Drive Overcurrent

**Description:** The spindle VFD has detected an output current greater than 150% of the spindle motor rated current (55 A).

**Probable Causes:**
- Tool severely blunt or broken causing high cutting forces.
- Spindle motor insulation degraded.
- VFD output module (IGBT) partially failed.

**Corrective Steps:**
1. Inspect the spindle tool — replace if worn or broken.
2. Perform a spindle motor insulation test (minimum 2 MΩ at 500 V DC).
3. Check VFD fault sub-codes and contact Epsilon Robotics service if insulation is healthy.

*Reference: Section 7.3, Spindle System*

---

### F005 — Robot Axis Overtemperature (Joint J3)

**Description:** The J3 servo drive temperature sensor has exceeded 90°C.

**Probable Causes:**
- Sustained high-load cycles without adequate rest.
- Controller cabinet cooling fan blocked.
- Servo drive thermal compound dried out on the heatsink.

**Corrective Steps:**
1. Reduce cycle duty; allow the drive to cool to below 70°C.
2. Clean the controller cabinet cooling fans and air filters.
3. Contact Epsilon service to re-apply thermal compound if the drive runs hot even at low duty.

*Reference: Section 8.1, Thermal Management*

---

### F007 — ATC Chain Position Error

**Description:** The ATC chain magazine has not indexed to the correct tool pocket position within the 8-second timeout.

**Probable Causes:**
- Broken tool holder or oversized tool preventing chain movement.
- ATC chain servo drive tripped.
- Chain index sensor contaminated.

**Corrective Steps:**
1. Stop the cell and manually inspect the ATC chain for jammed tool holders.
2. Clean the chain index proximity sensor.
3. Reset the ATC servo drive fault via ATC > Diagnostics > Reset Drive on the pendant.
4. Jog the chain manually via ATC > Manual Jog to verify free movement.

*Reference: Section 6.3, ATC System*

---

### F010 — TCP Calibration Invalid

**Description:** The automatic TCP calibration cycle has produced a result that deviates more than 0.3 mm from the previous stored TCP value.

**Probable Causes:**
- Robot arm has suffered a collision causing mechanical displacement.
- Reference calibration sphere has moved from its fixture.
- The new tool installed is physically different from the tool the program expects.

**Corrective Steps:**
1. Verify the reference sphere mounting bolts are tightened to 25 Nm.
2. Visually inspect the robot arm joints for signs of collision damage.
3. Confirm the correct tool is installed in the spindle and repeat calibration: System > Calibration > Auto-Calibration.
4. If deviations exceed 0.5 mm after a confirmed collision, perform a full joint mastering procedure.

*Reference: Section 7.4, Calibration*

---

### F011 — Lubrication Pressure Below Threshold

**Description:** The Bijur Delimon EPS-II centralised lubrication system has failed to reach the minimum distribution pressure of 25 bar during a lubrication cycle. This means lubricant has not been confirmed as delivered to one or more of the 18 bearing distribution points on the robot arm joints and the ATC mechanism. Continued operation without lubrication will cause accelerated wear on the robot joint harmonic drives and linear guides, potentially resulting in catastrophic gearbox failure.

**Probable Causes:**
- The lubrication oil reservoir has run dry (reservoir capacity is 2 L; nominal consumption is approximately 8 ml per 8-hour shift).
- A distribution line between the pump and one of the 18 lube points is cracked, disconnected, or blocked with congealed lubricant — common at lube points inside the robot wrist after long periods of inactivity.
- The Bijur EPS-II pump piston or pump check valve has failed, preventing the pump from building pressure even with a full reservoir.

**Corrective Steps:**
1. Check the reservoir level on the Bijur EPS-II unit (mounted on the controller cabinet rear panel): the level must be above the MIN mark. If below MIN or empty, fill with Klüber Isoflex NBU 15 grease or the equivalent specified in the lube schedule — do not substitute with different grease grades.
2. After filling, trigger a manual lubrication cycle: on the teach pendant navigate to System > Lubrication > Manual Cycle. Observe the pressure gauge on the Bijur unit — it should rise to 30–40 bar within 15 seconds and the cycle completion LED should illuminate. If the gauge does not rise, the pump or check valve has failed (proceed to step 4).
3. If the gauge rises but the fault persists, there is likely a blocked or disconnected distribution line. Power down (LOTO), trace each lube line from the distributor manifold to the robot arm, checking for kinks, cracks, or pulled fittings — repair or replace the damaged section (lube line Part No. ER-LUBE-LINE-4).
4. If the gauge does not rise after filling, the pump requires service — disassemble the Bijur EPS-II pump head per the Bijur EPS-II service manual and replace the pump piston seal kit and check valves (Part No. ER-LUBE-PUMP-KIT). This procedure requires a qualified maintenance technician.

*Reference: Section 8.4, Lubrication System; Bijur Delimon EPS-II Service Manual (supplied with machine)*

---

### F015 — Through-Spindle Coolant Pressure Fault

**Description:** The through-spindle coolant pressure has dropped below 60 bar with the TSC pump running, or failed to reach 60 bar within 10 seconds of activation.

**Probable Causes:**
- TSC pump filter clogged.
- Spindle rotary union seal worn.
- TSC pump motor tripped.

**Corrective Steps:**
1. Replace the TSC pump in-line filter element (Part No. ER-TSC-FILT).
2. Inspect the spindle rotary union for coolant leakage around the body; replace seals if leaking (Part No. ER-RU-SEAL).
3. Reset the TSC pump motor overload relay in the control cabinet.
4. Verify coolant tank level is above MIN.

*Reference: Section 8.2, Coolant System*

---

### F020 — Safety Scanner Protective Field Breach

**Description:** The Sick S3000 laser scanner has detected an object or person within the defined 5 m protective field. All robot and spindle motion is immediately stopped.

**Probable Causes:**
- A person has entered the protective field area.
- A workpiece, tooling, or debris has fallen into the scan field.
- Reflective surfaces (new equipment added nearby) are causing false reflections.

**Corrective Steps:**
1. Visually inspect the cell perimeter and the scan field for people, objects, or debris.
2. Remove any obstructions from the scan field.
3. If the fault is a false positive due to reflections, adjust the scanner sensitivity via the Sick CDS configuration software — do not increase the minimum object size threshold above the validated value.
4. Press RESET on the controller cabinet front panel to clear the fault after confirming the field is clear.

*Reference: Section 6.2, Safety Scanner*

---

### F025 — Rotary Table Clamp Fault

**Description:** The hydraulic workholding chuck on the rotary table has not confirmed a clamped state within 3 seconds of a clamp command.

**Probable Causes:**
- Hydraulic pressure insufficient for chuck actuation.
- Clamp position sensor contaminated.
- Chuck jaw mechanism jammed with chips.

**Corrective Steps:**
1. Check hydraulic pressure at the rotary table gauge — must be ≥140 bar for reliable clamping.
2. Clean the clamp confirmation sensor on the chuck body.
3. Remove chips from the chuck jaw slots with compressed air.
4. Test manual clamp via Pendant > I/O > Rotary Table > Clamp.

*Reference: Section 8.3, Rotary Table Hydraulics*

---

### F030 — Tool Length Measurement Error

**Description:** The Blum TC52 laser tool measurement station has returned a tool length reading that is either outside the valid measurement range (0–300 mm) or differs from the previously stored tool length for that tool number by more than 0.5 mm. A discrepancy of this magnitude indicates either the wrong tool is in the spindle, the tool has broken during machining, or the laser measurement station itself has a fault. The EP-750 will not allow the machining cycle to proceed with an unverified tool length, as an incorrect length offset causes incorrect Z-axis depth and can result in workpiece scrap or a robot arm collision with the fixture.

**Probable Causes:**
- The tool in the spindle is broken or missing its cutting tip — a broken tool will measure shorter than the stored value (most common cause).
- The Blum TC52 laser beam is blocked by coolant droplets, coolant mist, or a chip resting on the transmitter or receiver window.
- The tool presented to the measurement station is a different tool number than the one stored in the tool table (operator loaded tools in wrong pockets during a manual tool change).

**Corrective Steps:**
1. Visually inspect the tool currently in the spindle from outside the cell — if the tool tip is visibly broken or absent, use the ATC to return it to its magazine pocket, then load the replacement tool of the same number. Re-run the tool measurement cycle: ATC > Measure Tool > Measure Current Tool.
2. If the tool appears intact, navigate to Diagnostics > Tool Measurement on the pendant and run a Laser Self-Test — the system fires the laser without a tool present and checks beam integrity. If the self-test fails, the laser windows are obstructed: blow off both the transmitter (left side of the measurement station) and receiver (right side) windows with clean, dry compressed air, then wipe with a lint-free cloth. Repeat the self-test.
3. If the laser self-test passes but the tool still measures incorrectly, verify that the tool installed in the pocket matches the tool definition in the tool table: compare the physical tool length (measured with calipers) against the stored nominal length in ATC > Tool Table > Select Tool. If there is a mismatch, update the tool table with the correct nominal length and re-measure.
4. If all tools are correct and the laser is clean but fault continues, check the Blum TC52 mounting bracket for looseness or impact damage — the station must be within ±0.5 mm of its calibrated position relative to the robot base. Remount if necessary and run the laser station calibration cycle: ATC > Calibrate Measurement Station.

*Reference: Section 6.4, Tool Length Measurement; Blum TC52 Operating Manual (supplied with machine)*

---

### F035 — EtherCAT Bus Cycle Overrun

**Description:** The robot controller has missed one or more EtherCAT bus cycle deadlines, indicating processor overload.

**Probable Causes:**
- Too many background tasks running simultaneously on the controller PC (e.g., virus scan, backup).
- Controller PC CPU or memory failing.
- RobotOS software version incompatibility.

**Corrective Steps:**
1. Check Task Manager on the controller PC (connect a keyboard and monitor): close any non-Epsilon processes.
2. Disable Windows Update from running during production hours via the system scheduler.
3. Contact Epsilon Robotics to verify the installed RobotOS version is compatible with the controller hardware revision.

*Reference: Section 7.1*

---

### F040 — Joint Mastering Data Lost

**Description:** The absolute position reference (mastering) for one or more robot joints has been lost, typically because the battery in the joint encoder module has discharged completely.

**Probable Causes:**
- Encoder battery discharged (typical battery life 3–5 years).
- Encoder unit replaced without transferring mastering data.

**Corrective Steps:**
1. Replace the encoder backup battery for the affected joint (Part No. ER-BATT-ENC, 3.6 V lithium).
2. Perform a full joint mastering procedure using the mastering dial gauge and reference marks per Section 7.4.
3. After mastering, run a test cycle in SIMULATION mode to verify robot positions are correct before machining.

*Reference: Section 7.4, Calibration*

---

### F045 — Chip Conveyor Fault

**Description:** The chip conveyor drive has tripped on overload or the jam detection torque limit has been reached.

**Probable Causes:**
- Long stringy chips have wrapped around the conveyor drive shaft.
- Conveyor belt link pin sheared.
- Drive motor protection relay tripped.

**Corrective Steps:**
1. Stop the machining cell and isolate (LOTO).
2. Manually clear chip accumulation at the conveyor head using chip hooks — wear cut-resistant gloves.
3. Inspect belt link pins at the drive sprocket; replace any sheared pins (Part No. ER-CNV-PIN).
4. Reset the motor overload relay on the electrical cabinet door and restart the conveyor in manual mode to verify free movement.

*Reference: Section 8.5, Chip Conveyor*

---

### F050 — TSC Flow Switch Fault

**Description:** The through-spindle coolant flow switch has not confirmed coolant flow within 5 seconds of the TSC pump starting, even though the pressure gauge shows nominal pressure.

**Probable Causes:**
- Flow switch paddle worn or stuck.
- Air lock in the coolant supply line.

**Corrective Steps:**
1. Purge air from the TSC circuit by running the pump for 60 seconds with the tool removed from the spindle.
2. Inspect the flow switch paddle via the sight glass — it must rotate freely when coolant is flowing.
3. Replace the flow switch if paddle is seized (Part No. ER-TSC-FLOW).

*Reference: Section 8.2*

---

### F055 — Workpiece Probe Stylus Not Deployed

**Description:** A probing routine has been called in the part program but the on-spindle probing stylus has not extended to the active position within 2 seconds of the deploy command.

**Probable Causes:**
- Probe battery discharged (wireless probe).
- Probe activation signal (IR or radio) not received by the probe body.
- Probe receiver antenna blocked or misaligned.

**Corrective Steps:**
1. Replace the probe body battery (refer to probe manufacturer instructions, Part No. ER-PROBE-BATT).
2. Check the probe receiver unit mounted on the cell enclosure — verify the LED is indicating signal reception.
3. Clear any metallic obstruction between the spindle and the probe receiver.

*Reference: Section 6.5, On-Machine Probing*

---

### F060 — Robot Reach Limit Warning

**Description:** The requested Cartesian target position is near or at the robot's kinematic workspace boundary. At this extreme, positioning accuracy and speed are reduced.

**Probable Causes:**
- Part program targets a position close to the maximum reach of 3,200 mm.
- Incorrect fixture offset applied, shifting the work envelope.

**Corrective Steps:**
1. Review the target position; if possible, relocate the workholding fixture closer to the robot base.
2. Verify the fixture frame offset is correctly defined in the program.
3. Consider a robot reach extension if this position is required repeatedly.

*Reference: Section 7.2*

---

### F070 — OPC-UA Server Communication Loss

**Description:** The robot controller's OPC-UA server has lost connection to the factory MES or SCADA system.

**Probable Causes:**
- Factory network outage.
- MES server offline for maintenance.
- OPC-UA certificate expired.

**Corrective Steps:**
1. Check factory network connectivity from the controller PC — ping the MES server IP.
2. If the certificate has expired (visible in Controller > OPC-UA Settings > Certificate Status), regenerate it and re-import into the MES.
3. The machine can continue to operate in standalone mode without MES connectivity; production data will buffer locally.

*Reference: Section 7.5, Factory Integration*

---

### F080 — Hydraulic Counterbalance Pressure Low

**Description:** The J2/J3 hydraulic counterbalance circuit pressure has fallen below 160 bar. The counterbalance system offsets the gravitational load on the large robot arm segments; if pressure is insufficient, the servo drives carrying J2 and J3 will be heavily overloaded to maintain position.

**Probable Causes:**
- Hydraulic counterbalance accumulator bladder ruptured, causing nitrogen pressure loss.
- Hydraulic seal in the counterbalance cylinder leaking.

**Corrective Steps:**
1. Check the counterbalance nitrogen pre-charge pressure with an accumulator charging kit — must be 155 ±5 bar.
2. If nitrogen pressure is low, recharge with dry nitrogen only — never use oxygen or compressed air.
3. If recharging does not hold, the accumulator bladder has failed; contact Epsilon Robotics for replacement (Part No. ER-ACC-J23).

*Reference: Section 8.3*

---

### F090 — Program Memory Checksum Error

**Description:** The robot part program loaded in memory has failed its CRC check.

**Probable Causes:**
- Power loss during program transfer.
- USB drive fault during file transfer.

**Corrective Steps:**
1. Delete the corrupted program from the controller.
2. Re-transfer the program from the programming PC or network share.
3. Verify the file checksum on the source PC matches the transferred file using the Epsilon Program Manager utility.

*Reference: Section 4.2*

---

### F099 — Spindle Orientation Failure

**Description:** The EP-750 spindle is required to orient to a precise angular position (defined as 0° ± 0.1°) before every automatic tool change. This orientation aligns the HSK-A63 drive key with the tool holder key slot and is also used for certain fixturing operations. This fault indicates the spindle has not reached the orientation target within the 12-second timeout window. Unlike an Emergency Stop, F099 is a machine fault — the spindle drive is still energised but motion has been inhibited. An unresolved F099 will prevent all ATC operations and any program step requiring a tool change.

**Probable Causes:**
- The spindle orientation encoder (a separate dedicated encoder fitted at the spindle motor rear shaft, independent of the spindle speed feedback encoder) has a dirty or damaged read head, preventing the controller from resolving the angular position accurately.
- The spindle brake (pneumatically released electromagnetic brake, 24 V DC coil) has not released because the solenoid valve supplying air pressure to the brake release cylinder is stuck closed or the solenoid is de-energised — the spindle cannot rotate to the orientation position if the brake is dragging.
- The orientation PID gains in the spindle controller have become mismatched after a firmware update, causing the spindle to hunt without converging on the target position.

**Corrective Steps:**
1. Navigate to Diagnostics > Spindle Status on the teach pendant — check the "Orientation Encoder Signal" field. If it shows INVALID or NO SIGNAL, clean the spindle orientation encoder read head (located at the rear of the spindle motor housing, accessible from the rear panel of the spindle head assembly after removing 4 × M5 screws): wipe the read head glass window with isopropyl alcohol and a lint-free cloth, then power-cycle the spindle controller. If INVALID persists, replace the read head (Part No. ER-SENC-ORI).
2. Check the spindle brake release: in Diagnostics > Spindle, command a BRAKE RELEASE. Listen for the solenoid valve click (audible at the rear of the spindle head); also feel for the brake caliper disengaging — a correctly released brake allows the spindle to rotate freely by hand with less than 2 Nm of torque. If the brake does not release, measure voltage across the solenoid coil terminals (must be 24 V ±2 V DC when release is commanded); replace the solenoid valve if voltage is present but brake does not release (Part No. ER-SOL-BRK).
3. If the encoder signal is valid and the brake releases normally but orientation still times out, access the spindle orientation PID parameters via Spindle Controller > Parameters > Orientation: reset P_gain to 1.8, I_gain to 0.05, and D_gain to 0.02 (factory defaults for RobotOS 7.4.x). Run a manual orientation command (Diagnostics > Spindle > Orient Now) and observe whether the spindle converges smoothly; fine-tune P_gain upward in steps of 0.1 if hunting persists.
4. If none of the above resolves the fault, inspect the HSK-A63 tool holder currently in the spindle — an over-tightened or incorrectly seated tool holder can create a rotational resistance that prevents the spindle from fine-positioning to the orientation target. Remove the tool holder and repeat the orientation command; if F099 clears without a tool, the tool holder or spindle taper is the issue.

*Reference: Section 6.3, ATC System; Section 7.3, Spindle System; Blum TC52 Operating Manual; ER-SRG-7 Servo Drive Reference Guide*

---

## 6. Maintenance Schedule

| Interval | Task |
|---|---|
| Daily | Check lubrication reservoir level on Bijur EPS-II unit |
| Daily | Inspect spindle HSK taper for nicks or contamination; clean with lint-free cloth |
| Daily | Verify Safety Scanner protective field using the walk-test button on the scanner |
| Weekly | Clean Blum TC52 laser measurement station windows |
| Weekly | Inspect all robot arm cable carriers for wear or loose retaining clips |
| Weekly | Check TSC coolant level and concentration (target 8%) |
| Monthly | Trigger a manual lubrication cycle and verify pressure (25–40 bar) |
| Monthly | Inspect robot wrist lube distribution points — look for dry or blocked fittings |
| Monthly | Check hydraulic counterbalance nitrogen pre-charge pressure |
| 6-Monthly | Replace TSC pump filter element |
| 6-Monthly | Check encoder backup battery voltage on all 6 joints (replace below 3.2 V) |
| 6-Monthly | Perform TCP accuracy verification using calibration sphere; acceptable deviation <0.1 mm |
| Annually | Full joint harmonic drive inspection — check for backlash and oil contamination |
| Annually | Safety laser scanner validation by certified safety engineer |
| Annually | Electrical insulation test on all motor windings |

---

## 7. Spare Parts

| Part No. | Description | Qty to Stock |
|---|---|---|
| ER-ETH-CABLE | EtherCAT Patch Cable, 0.5 m, RJ45 | 5 |
| ER-SENC-ORI | Spindle Orientation Encoder Read Head | 1 |
| ER-SOL-BRK | Spindle Brake Solenoid Valve, 24 V DC | 1 |
| ER-LUBE-PUMP-KIT | Bijur EPS-II Pump Piston Seal and Check Valve Kit | 1 |
| ER-LUBE-LINE-4 | Lube Distribution Line, 4 mm OD, per metre | 5 m |
| ER-BATT-ENC | Joint Encoder Backup Battery, 3.6 V Li | 6 |
| ER-TSC-FILT | Through-Spindle Coolant Filter Element | 2 |
| ER-RU-SEAL | Spindle Rotary Union Seal Kit | 1 |
| ER-CNV-PIN | Chip Conveyor Link Pin (pack of 20) | 1 |
| ER-ACC-J23 | Hydraulic Counterbalance Accumulator Bladder, J2/J3 | 1 |

For technical support and parts, contact Epsilon Robotics GmbH: +49 711 9988 0 / support@epsilon-robotics.de
