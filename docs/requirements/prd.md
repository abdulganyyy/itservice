> **PRD Status: Draft — Generated from Approved Phase A (Phase C Corrections Applied)**

# Product Requirements Document (PRD)
## Internal IT Service Platform

---

## 1. Document Overview

* **Product Working Title:** Internal IT Service Platform
* **Document Purpose:** Defines the functional, operational, and structural product requirements for the V1 internal IT Service platform. Serves as the authoritative source of truth for downstream System Analysis, Database Design, UI/UX Design, Frontend/Backend Development, Testing, and AI Coding Agent context.
* **Version:** 1.1 (Corrected Draft)
* **Status:** Draft — Generated from Approved Phase A (Phase C Corrections Applied)
* **Scope:** Core IT Service Workflow (V1)
* **Intended Audience:** Product Managers, UI/UX Designers, System Architects, Database Engineers, Frontend/Backend Software Developers, QA Engineers, and AI Coding Agents (e.g., Antigravity).

---

## 2. Product Overview

* **What the Product Is:** A centralized, web-based internal IT Service platform designed to manage the end-to-end lifecycle of company IT incidents and service requests.
* **Why It Exists:** To consolidate fragmented, informal IT reporting channels (phone calls, chat messages, walk-ups, direct emails) into a structured operational environment.
* **Who Uses It:** 
  1. **Employee:** Internal staff reporting IT problems and tracking resolution.
  2. **IT Staff:** Operational IT personnel conducting assessment, assignment, resolution, and ticket tracking.
* **Core Value Proposition:** Serves as the company's "single source of truth" for all IT incidents—enabling Employees to report once and monitor progress without manual follow-up, while providing IT Staff with a centralized queue and persistent notifications to reduce the risk of lost or forgotten incidents.

---

## 3. Problem Statement

Company IT issues are currently reported through fragmented, informal channels including phone calls, direct messaging, walk-ups, and unformatted emails.

### Operational Consequences
* **Inability to Track:** No single location exists to view active IT problems or verify their status.
* **Prioritization Failure:** Urgent operational issues get buried under informal chat logs or missed phone calls.
* **Distribution Bottlenecks:** Requests are tied to individual IT team members rather than a shared queue.
* **Lack of Documentation:** Incident details, steps taken, and resolutions are lost upon issue closure.
* **Zero Monitoring:** Management and staff cannot monitor ongoing IT workload or operational health.
* **Lost Historical Data:** Recurring infrastructure issues cannot be analyzed due to the absence of persistent incident records.

---

## 4. Product Goals

### V1 Operational Goals
1. **Single Entry Point:** Establish a single operational platform where every IT incident requiring IT action is logged and tracked from initiation to closure.
2. **Non-Blocking Incident Capture:** Provide a Quick Ticket mechanism for IT Staff to document urgent or phone-reported issues in seconds without delaying immediate technical response.
3. **Operational Queue Centralization:** Provide a single shared operational queue for IT Staff with clear ticket ownership to reduce the risk of lost or forgotten incidents.
4. **Transparent Employee Visibility:** Enable Employees to view status updates, progress transitions, and resolution details without needing to manually ping IT Staff.
5. **Persistent Notification Alerting:** Ensure critical operational events trigger visual alerts and priority-differentiated sound notifications that persist in an unread state until processed.

---

## 5. User Roles

The platform strictly enforces **exactly two (2) user roles**.

```
+-------------------------------------------------------------------+
|                        INTERNAL IT PLATFORM                       |
+---------------------------------+---------------------------------+
|            EMPLOYEE             |            IT STAFF             |
|  - Self-Service Reporting       |  - Operational Queue Access     |
|  - Status Progress Monitoring   |  - Quick Ticket Creation        |
|  - Resolution Verification      |  - Assessment & Priority Set    |
|  - Incident History Viewing     |  - Assignment & Resolution      |
+---------------------------------+---------------------------------+
```

> [!IMPORTANT]
> **No Admin Role:** There is NO separate Admin role in V1. There is NO separate Triage role. IT Staff possesses all necessary operational permissions required to manage IT Service operations.

### 5.1 Employee Role
* **Description:** Any company worker who encounters an IT issue or requires IT assistance.
* **Capabilities:**
  * Submit IT incident reports via Self-Service.
  * Receive visual notifications regarding ticket updates.
  * Monitor progress, status, and assigned details of reported tickets.
  * Review resolution details provided by IT Staff.
  * Perform resolution `Verification` (confirming resolution or submitting feedback).
  * View historical record of own reported tickets.

### 5.2 IT Staff Role
* **Description:** Technical operations personnel responsible for evaluating, managing, and resolving company IT issues.
* **Capabilities:**
  * Access the shared Centralized Operational Queue.
  * Create Quick Tickets on behalf of Employees during phone/direct communications.
  * Perform Initial Assessment on submitted incidents.
  * Determine and adjust ticket Priority.
  * Assign tickets to self or operational peers (pending permission rules).
  * Update ticket status along the operational lifecycle (`In Progress`, `Resolution`).
  * Document resolution notes.
  * View historical records of all system incidents.

---

## 6. Product Principles

1. **Single Source of Truth:** Every IT incident requiring IT action must eventually have a record in the platform.
2. **Respond First, Document Without Blocking:** Quick Ticket workflows must require minimal information so documentation never delays an IT Staff member's immediate response to an Employee.
3. **Employee Reports, IT Staff Assesses:** Employees describe the problem; IT Staff alone evaluates and assigns Priority.
4. **Centralized Operational Queue:** All unresolved work lives in a shared queue accessible to all IT Staff, preventing orphaned tickets.
5. **Clear Ownership:** Every actionable ticket must have a clear assignee responsible for its current state.
6. **Traceability:** Incidents maintain a clear, chronological event record from initial report through verification and closure.
7. **Persistent Notification Visibility:** Important events trigger visual and sound notifications that persist in an unread state until processed.
8. **Employee Progress Visibility:** Employees can check ticket status and progress updates anytime, eliminating repetitive status inquiry messages.
9. **V1 Simplicity:** Focus purely on core IT Service operations without enterprise workflow bloat.
10. **Historical Data Value:** Closed incidents serve as historical records for future operational context.

---

## 7. Scope

```
+-------------------------------------------------------------------+
|                            V1 SCOPE                               |
| Core IT Service: Self-Service, Quick Ticket, Operational Queue,    |
| Priority Assessment, Notifications (Visual+Sound), Lifecycle,     |
| Verification, Traceable History.                                  |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|                        FUTURE ROADMAP                             |
| 1. Asset Management  -> 2. Analytics  -> 3. Knowledge Base        |
| -> 4. AI / Intelligence                                           |
+-------------------------------------------------------------------+
```

### 7.1 In Scope — V1 (Core IT Service)
* Employee Self-Service reporting.
* IT Staff Quick Ticket reporting.
* Persistent notifications (Visual alerts + Priority-differentiated sound alerts).
* Centralized Operational Queue.
* Initial Assessment and Priority determination by IT Staff.
* Ticket Assignment and ownership tracking.
* Canonical 10-stage lifecycle management.
* Resolution & Employee Verification flow.
* Historical incident records.

### 7.2 Explicitly Out of Scope — V1
* **Separate Admin Role** (No separate administrative user management or config UI).
* **Approval Workflows** (No multi-level manager approvals).
* **AI Diagnosis / Auto-Triage** (No automated ticket classification or suggestions).
* **Chatbots / Conversational AI** (No interactive virtual assistants).
* **Auto-Assignment Rules** (No automated round-robin or load-based routing).
* **Complex SLA Systems** (No SLA breach timers, escalation matrices, or pause rules).
* **Critical Incident Module** (No dedicated Major Incident / Severity-1 workflows).
* **External System Integrations** (No Slack, Teams, Jira, or email-in parsing integrations).
* **Dedicated Triage Module** (No separate Triage role, dashboard, or queue).
* **File / Image Attachments** (No file upload handling, multipart endpoints, or object storage buckets; all incident, work note, and verification data are strictly structured text).

### 7.3 Future Roadmap
The product will evolve along the following sequential roadmap post-V1:
1. **Asset Management:** Linking tickets to physical/digital assets to build Asset History.
2. **Analytics:** Operational metrics, workload reporting, and incident trend analysis.
3. **Knowledge Base:** Article publishing, self-help solutions, and resolution documentation.
4. **AI / Intelligence:** Automated diagnosis, smart ticket routing, and predictive insights.
5. **Attachments & Rich Media:** Support for diagnostic screenshot uploads, system log attachments, and multi-file evidence during reporting and verification.

---

## 8. Functional Requirements

### 8.1 Reporting & Ticket Creation

#### FR-01: Single Incident Record Consolidation
* **Description:** System must allow all IT incidents requiring IT action to be logged as traceable records.
* **Actor:** Employee, IT Staff
* **Trigger:** User initiates incident creation (Self-Service or Quick Ticket).
* **Expected Behavior:** System generates a unique incident record and introduces it into the workflow.
* **Business Rules:** Incidents must be trackable from creation to closure.
* **Acceptance Criteria:** Every submitted incident receives a unique identifier and appears in historical records.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-02: Strict Dual-Role Access Boundaries
* **Description:** System strictly limits permissions to `Employee` and `IT Staff` roles.
* **Actor:** System / All Users
* **Trigger:** Authentication / Page Navigation.
* **Expected Behavior:** System grants role-appropriate access. IT Staff receives operational capabilities; Employees receive self-service reporting and tracking capabilities.
* **Business Rules:** No separate Admin role exists. No separate Triage role exists.
* **Acceptance Criteria:** Unauthenticated users cannot access system functions. Users see only functionality permitted by their assigned role.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-03: Employee Self-Service Reporting
* **Description:** Enables Employees to submit IT problem reports directly through the platform.
* **Actor:** Employee
* **Trigger:** Employee clicks "Report IT Problem".
* **Expected Behavior:** System renders the reporting interface, accepts problem information, creates an incident record, and introduces it into the workflow.
* **Business Rules:** Employee provides problem details; Employee does NOT set Priority.
* **Acceptance Criteria:** Submitted reports generate a new incident record in the Operational Queue.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-04: Non-Blocking IT Staff Quick Ticket Creation
* **Description:** Enables IT Staff to create an incident record on behalf of an Employee with minimal information.
* **Actor:** IT Staff
* **Trigger:** IT Staff receives phone call, chat, or walk-up report.
* **Expected Behavior:** System allows rapid submission of an incident record without requiring complete details up-front.
* **Business Rules:** Documenting a Quick Ticket must NOT block or delay immediate technical response to the Employee ("Respond first, document without blocking").
* **Acceptance Criteria:** Quick Ticket can be created rapidly with minimal input fields.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-05: Minimal Quick Ticket Input Boundary
* **Description:** Quick Ticket interface enforces only the minimum required inputs to ensure non-blocking creation.
* **Actor:** IT Staff
* **Trigger:** Quick Ticket form open.
* **Expected Behavior:** System accepts minimum information and defers optional/extended fields to later lifecycle stages.
* **Business Rules:** Minimum required inputs are strictly defined as: (1) Reporter Employee (`reporter_id`), and (2) Incident Summary (`summary`, 5-150 chars). Optional fast-overrides are provided in the UI: immediate self-assignment toggle (`assign_to_me`), immediate priority pill selection (`Low`/`Med`/`High`), and immediate work note. If no separate description is provided, the system automatically populates `description` with `summary` to satisfy data integrity without blocking technical response.
* **Acceptance Criteria:** Form validates successfully with only Reporter Employee and Summary provided; optional overrides apply if specified.
* **Classification:** Confirmed Decision
* **Priority:** High

---

### 8.2 Assessment & Priority Management

#### FR-06: Employee Problem Communication Scope
* **Description:** Limits Employee reporting input to describing the observed problem.
* **Actor:** Employee
* **Trigger:** Incident creation form loading.
* **Expected Behavior:** Employee form excludes Priority selection controls.
* **Business Rules:** Employee is not responsible for determining or setting Priority.
* **Acceptance Criteria:** Self-Service reporting form does not display Priority selection options to Employees.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-07: IT Staff Initial Assessment & Priority Determination
* **Description:** Allows IT Staff to evaluate incoming incidents and assign/adjust Priority.
* **Actor:** IT Staff
* **Trigger:** IT Staff selects an incident during `Initial Assessment`.
* **Expected Behavior:** IT Staff evaluates problem context and sets the appropriate Priority level.
* **Business Rules:** IT Staff alone determines and adjusts Priority. No dedicated Triage module exists; assessment occurs in standard IT workflow.
* **Acceptance Criteria:** IT Staff can update Priority from the queue or ticket detail view.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-08: Secondary Impact Metadata Capture
* **Description:** System supports recording Impact as passive secondary metadata.
* **Actor:** IT Staff
* **Trigger:** Incident assessment or update.
* **Expected Behavior:** System stores optional Impact metadata attached to the record.
* **Business Rules:** Impact is NOT a primary V1 feature and does not trigger complex workflow logic or escalation rules. It exists solely as secondary metadata to support future data analytics. Standard values are resolved via Option A (Standard 3-Tier ITIL Scope): `Individual` (Single User / Workstation), `Departmental` (Team / Specific Business Unit), and `Organization-Wide` (Enterprise / Core Infrastructure), with NULL/None as the default optional state.
* **Acceptance Criteria:** Impact field stores metadata without enforcing complex workflow routing rules.
* **Classification:** Confirmed Decision
* **Priority:** Medium

---

### 8.3 Operational Queue & Ownership

#### FR-09: Centralized Operational Queue Management
* **Description:** Provides a consolidated queue displaying all active, unresolved IT incidents to IT Staff.
* **Actor:** IT Staff
* **Trigger:** IT Staff opens Operational Queue view.
* **Expected Behavior:** Displays unassigned and active incidents with status, priority, reporter, and ownership context.
* **Business Rules:** Centralized queue ensures all actionable incidents remain visible to reduce the risk of lost or forgotten tickets.
* **Acceptance Criteria:** All non-closed incidents appear in the shared IT Staff view.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-10: Single Clear Ticket Ownership & Assignment
* **Description:** Tracks ticket assignment to specific IT Staff members to establish clear accountability.
* **Actor:** IT Staff
* **Trigger:** IT Staff assigns ticket to self or peer.
* **Expected Behavior:** System updates ticket assignee state, records event change, and updates operational queue display.
* **Business Rules:** Every active ticket in progress must have a single clear assignee. Reassignment and operational permission rules are resolved via Option B (Hybrid Collaborative with Explicit Takeover): any IT Staff can take over or reassign tickets with audit logging, work notes are strictly append-only/immutable, and resolution submission is restricted to the active assignee (peers must perform explicit Take Over before submitting resolution).
* **Acceptance Criteria:** Assignee name is visible on ticket details and queue lists.
* **Classification:** Confirmed Decision
* **Priority:** High

---

### 8.4 Ticket Lifecycle & Workflow

#### FR-11: Canonical Ten-Stage Lifecycle Management
* **Description:** System defines the canonical 10-stage operational ticket lifecycle.
* **Actor:** System, Employee, IT Staff
* **Trigger:** Workflow state transition actions.
* **Expected Behavior:** Defines the canonical stages: `Report` → `Notification` → `Operational Queue` → `Initial Assessment` → `Assignment` → `In Progress` → `Resolution` → `Employee Notification` → `Verification` → `Closed`.
* **Business Rules:** The 10 stages define the canonical V1 lifecycle. Entry behavior for Quick Ticket is resolved via Option C (conditional direct `In Progress` when self-assigned, or `Operational Queue` when unassigned). Verification dispute returns directly to `In Progress` (Option 1). Unresponsive verification auto-closes after 48 hours (Option 2). Closed state is immutable (Option 1).
* **Acceptance Criteria:** System maintains state validity and logs state transitions in ticket history.
* **Classification:** Confirmed Decision
* **Priority:** High

---

### 8.5 Notifications

#### FR-12: Core Sound Notifications Across Priorities
* **Description:** System triggers an audio alert for notification events associated with defined Priority levels.
* **Actor:** System / All Users
* **Trigger:** Priority-assessed notification event occurrence.
* **Expected Behavior:** System plays a sound alert corresponding to the ticket's Priority level once Priority exists.
* **Business Rules:** All Priority levels MUST have sound notifications. Sound is a core feature, not visual polish. Sound behavior prior to Priority assessment is resolved via Option B: newly created unassessed tickets trigger a discrete, subtle neutral awareness ping (523 Hz C5, 100ms) for IT Staff active sessions only; Employee submission remains silent (visual confirmation only).
* **Acceptance Criteria:** Notification events for assessed priorities generate an audio notification call in the active UI session; new unassessed tickets generate a neutral queue ping for IT Staff.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-13: Differentiated Priority Sound Characteristics
* **Description:** Audio alerts must possess distinct sound characteristics based on Priority.
* **Actor:** System
* **Trigger:** Audio notification playback.
* **Expected Behavior:** Plays sound with audio characteristics corresponding to Low, Medium, or High Priority.
* **Business Rules:** Sound characteristics MUST differ by Priority. Specifications are resolved as Web Audio API synthesis (Option B): Low Priority uses Single Chime 440 Hz (180ms), Medium Priority uses Dual Ascending Chime 587.3 Hz -> 880 Hz (260ms), and High Priority uses Triple Urgent Arpeggio 880 Hz -> 1046.5 Hz -> 1318.5 Hz (350ms).
* **Acceptance Criteria:** Low, Medium, and High Priority events trigger audibly distinct sound patterns.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-14: Visual Notification Alerts
* **Description:** System provides visual indicators for new and unread notification events.
* **Actor:** User (Employee / IT Staff)
* **Trigger:** System event addressed to user.
* **Expected Behavior:** Displays visual alerts (badges, banners, or list indicators) in the user interface.
* **Business Rules:** Visual alerts must clearly indicate that an event requires attention.
* **Acceptance Criteria:** Unread alerts display visual badge indicators in the UI header/navigation.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-15: Persistent Unread Notification State
* **Description:** Unread notifications retain their unread state across user sessions until processed.
* **Actor:** System / User
* **Trigger:** Application reload, re-login, or view transition.
* **Expected Behavior:** Unread badges and notification list items remain marked as unread until explicit view or acknowledgment action occurs.
* **Business Rules:** Unread notification state MUST persist across sessions. Transition triggers from `unread` to `read` are resolved as Option B (Contextual Auto-Acknowledge on Navigation + Drawer Explicit Controls): (1) clicking an individual item in the Notification Drawer navigates to the ticket and marks that item as read, (2) visiting a ticket detail page directly automatically acknowledges and marks all unread notifications for that ticket and user as read, and (3) clicking "Mark All Read" in the drawer bulk-updates all user notifications. Merely opening the drawer does not clear unread badges.
* **Acceptance Criteria:** Logging out and back in does not automatically clear unread notification badges.
* **Classification:** Confirmed Decision
* **Priority:** High

---

### 8.6 Verification, History & Closure

#### FR-16: Employee Progress & Status Visibility
* **Description:** Provides Employees with direct visibility into current ticket status and progress updates.
* **Actor:** Employee
* **Trigger:** Employee views ticket dashboard or detail page.
* **Expected Behavior:** System presents current status, priority, assigned IT Staff, and progress updates.
* **Business Rules:** Reduces the need for Employees to repeatedly follow up with IT Staff manually. Real-time synchronization is a design choice, not a strict requirement.
* **Acceptance Criteria:** Ticket status, progress notes, and assignee are visible on the Employee ticket view.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-17: Resolution & Employee Verification Workflow
* **Description:** Requires a resolution step by IT Staff followed by an Employee Verification stage before final closure.
* **Actor:** IT Staff, Employee
* **Trigger:** IT Staff marks ticket `Resolution`; Employee interacts with `Verification`.
* **Expected Behavior:** IT Staff records resolution details → Ticket state becomes `Resolution` → Employee is notified → Ticket state becomes `Verification` → Employee verifies or disputes.
* **Business Rules:** Employee Verification is a mandatory lifecycle stage. When an Employee disputes a resolution, the workflow behavior is resolved as Option 1 (Direct Rework): the ticket transitions back to `In Progress` retained under the previous IT Staff assignee, accompanied by mandatory `verification_feedback` (Dispute Reason), and an alert notification is dispatched to that IT Staff member. If an Employee is unresponsive during Verification, the behavior is resolved as Option 2 (Automated 48-Hour Auto-Close Window): an automated timer of 48 hours is initialized upon entering Verification; if no response is received within 48 hours, the system automatically transitions the ticket to `Closed` with audit log `VERIFICATION_AUTO_CLOSED`.
* **Acceptance Criteria:** Ticket cannot transition directly from `In Progress` to `Closed` without passing through `Resolution` and `Verification`; disputed tickets transition back to `In Progress` under the existing assignee.
* **Classification:** Confirmed Decision
* **Priority:** High

#### FR-18: Incident History & Traceable Event Records
* **Description:** Retains a historical record of created, updated, verified, and closed tickets.
* **Actor:** System / All Users
* **Trigger:** Ticket lifecycle event.
* **Expected Behavior:** System records key events (creation, priority change, assignment, status change, resolution notes, verification) attached to the ticket record.
* **Business Rules:** Historical records preserve chronological traceability of important ticket events and changes without requiring a compliance-grade audit module in V1.
* **Acceptance Criteria:** Closed tickets remain searchable in historical records with event timeline intact.
* **Classification:** Confirmed Decision
* **Priority:** High

---

## 9. Reporting Details

### 9.1 Employee Self-Service
* **Initiator:** Employee.
* **Purpose:** Direct reporting of IT problems encountered during daily work.
* **Submission Behavior:** Upon submission, the platform creates an incident record and introduces it into the operational workflow.
* **User Information Provided:** Problem description and summary details.
* **Data Exclusions:** Priority selection controls are excluded from Employee Self-Service.

### 9.2 IT Staff Quick Ticket
* **Initiator:** IT Staff (on behalf of an Employee).
* **Purpose:** Rapid incident documentation during phone calls, direct messages, or walk-ups.
* **Operational Principle:** "Respond first, document without blocking."
* **Creation Constraint:** Form fields are constrained to minimum required information so logging never delays technical response.
* **Workflow Relationship:** Quick Ticket creates a formal record that enters the operational system. Minimum required fields are confirmed as: (1) Reporter Employee (`reporter_id`) and (2) Incident Summary (`summary`), with optional fast-overrides for immediate assignment, priority, and initial work note (`description` defaults to `summary`). Initial workflow state is resolved as Conditional (Option C): if the "Assign to me immediately" toggle is selected, the ticket transitions directly to `In Progress` assigned to the creating IT Staff member; otherwise, it enters the `Operational Queue` as an unassigned ticket.

---

## 10. Notification Requirements

Notification is a **core functional requirement** of the platform.

```
+-------------------------------------------------------------------+
|                        NOTIFICATION SYSTEM                        |
+---------------------------------+---------------------------------+
|          VISUAL ALERTS          |           AUDIO ALERTS          |
|  - Banner / Badge Indicators    |  - Sound plays on ALL Priority  |
|  - Persistent Unread State      |    levels (once assessed)       |
|    across user browser sessions |  - Sound characteristics differ |
|                                 |    by Priority (Low: 440Hz,     |
|                                 |    Med: 587->880Hz, High: Arp)  |
+---------------------------------+---------------------------------+
```

### 10.1 Confirmed Notification Behaviors
* **All Priorities Covered:** Every Priority level triggers a sound notification once Priority is determined.
* **Priority Differentiated Sound:** Sound characteristics MUST differ based on Priority (Low vs. Medium vs. High).
* **Audio Synthesis Specifications [RESOLVED - Option B]:** Synthesized via native browser Web Audio API:
  * **Low Priority:** Single Chime 440 Hz (A4, Sine wave, 180ms, gentle gain envelope).
  * **Medium Priority:** Dual Ascending Chime 587.3 Hz (D5) -> 880 Hz (A5), 120ms each (Sine wave, 260ms total).
  * **High Priority (Urgent Beacon):** Triple Fast Arpeggio 880 Hz (A5) -> 1046.5 Hz (C6) -> 1318.5 Hz (E6), 100ms each (Triangle/Sine wave, 350ms total, fast decay).
* **Visual Alerts:** Visual notifications (badges/banners) must clearly indicate attention is required.
* **Persistent Unread State:** Unread notification state persists across sessions until processed.

### 10.2 Resolved Notification Specifications
* **Pre-Assessment Notification Sound [RESOLVED - Option B]:** Newly created unassessed incidents trigger a discrete neutral awareness ping (523 Hz C5, 100ms) for IT Staff active sessions; Employee submission remains silent (visual confirmation only).
* **Audio Specifications [RESOLVED]:** Resolved via Option B (Web Audio API parametric synthesis).
* **State Transition Triggers [RESOLVED - Option B]:** Resolved via Option B (Contextual Auto-Acknowledge on Navigation + Drawer Explicit Controls): direct notification click, smart auto-read upon visiting the ticket detail page, or bulk "Mark All Read" button. Merely opening the drawer does not clear unread states.
* **Delivery Channels & Recipients [RESOLVED - Option A]:** Delivery is strictly self-contained within the application via visual header badges, notification center drawer, contextual banners, and Web Audio API alerts. External channels (SMTP email, Slack, SMS) are deferred to Roadmap (V2) per Sec 7.2. Recipient binding rules are confirmed in Section 22 Event Matrix.

---

## 11. Priority and Initial Assessment

```
[ Employee Reports Problem ]
           │ (No Priority Input)
           ▼
[ IT Staff Initial Assessment ]
           │
           ├─► Determines / Adjusts PRIORITY (Low / Medium / High)
           └─► Captures Optional IMPACT (Metadata for Future Analytics: Individual / Departmental / Organization-Wide)
```

### 11.1 Assessment Ownership
* **Employee Responsibility:** Communicating problem details clearly. Employees do **NOT** determine Priority.
* **IT Staff Responsibility:** Evaluating problem severity during `Initial Assessment` and setting or adjusting Priority.

### 11.2 Role of Impact Metadata
* Impact exists solely as secondary metadata attached to the record.
* Impact is **NOT** a primary V1 workflow driver and does **NOT** trigger complex escalation logic.
* Purpose is strictly to support future data analytics and platform intelligence. Specific Impact metadata options are resolved via Option A (Standard 3-Tier ITIL Scope): `Individual` (Single User / Workstation), `Departmental` (Team / Specific Business Unit), `Organization-Wide` (Enterprise / Core Infrastructure Outage), with default `NULL`.

### 11.3 Triage Operational Context
* There is **NO dedicated Triage Module**, Triage Dashboard, or Triage Role in V1.
* Initial assessment is executed as a standard step in IT Staff's everyday queue workflow.

---

## 12. Operational Queue

### 12.1 Purpose & Access
* A unified, shared operational view listing all active, unresolved IT incidents.
* Accessible to all members of `IT Staff`.

### 12.2 Key Queue Characteristics
* **Centralization:** All incidents requiring IT action enter the operational queue.
* **Visibility:** Displays ticket summary, reporter, priority, status, creation timestamp, and assigned owner.
* **Ownership Tracking:** Clearly indicates whether a ticket is unassigned or assigned to a specific IT Staff member.
* **Unresolved Work Retention:** Incidents remain in the active operational view until moved to `Closed`.

---

## 13. Ticket Lifecycle

The 10 stages define the **canonical V1 lifecycle**. Entry behavior for Quick Ticket is resolved via Option C (conditional direct `In Progress` when self-assigned, or `Operational Queue` when unassigned). Verification dispute returns directly to `In Progress` (Option 1). Unresponsive verification auto-closes after 48 hours (Option 2). Closed state is immutable (Option 1).

```
 1. Report
    │  (Employee submits Self-Service OR IT Staff submits Quick Ticket)
    ▼
 2. Notification
    │  (Visual alert triggered; Discrete neutral ping for IT Staff: 523 Hz C5)
    ▼
 3. Operational Queue
    │  (Incident lands in centralized IT Staff view)
    ▼
 4. Initial Assessment
    │  (IT Staff evaluates context & determines/adjusts Priority)
    ▼
 5. Assignment
    │  (Ticket assigned to specific IT Staff owner)
    ▼
 6. In Progress
    │  (Technical work actively conducted)
    ▼
 7. Resolution
    │  (IT Staff records resolution details)
    ▼
 8. Employee Notification
    │  (Employee notified of resolution)
    ▼
 9. Verification
    │  (Employee confirms resolution or provides dispute feedback)
    ▼
10. Closed
       (Incident finalized into historical records)
```

### Stage Details

| # | Stage | Responsible Actor | Action | Expected System Behavior | Relevant Data | Next Stage Transition |
|---|---|---|---|---|---|---|
| 1 | `Report` | Employee / IT Staff | User submits incident details. | Generates record ID, timestamps entry. | Reporter, Problem Summary | `Notification` |
| 2 | `Notification` | System | System fires alerts to relevant users. | Triggers visual badge and discrete neutral awareness ping (523 Hz) for IT Staff. | Ticket ID | `Operational Queue` |
| 3 | `Operational Queue` | System / IT Staff | System places ticket in active queue view. | Ticket visible in shared IT Staff list. | Status: Queue, Unassigned | `Initial Assessment` |
| 4 | `Initial Assessment` | IT Staff | IT Staff opens and evaluates incident. | IT Staff reviews problem & sets Priority. | Priority, Impact metadata | `Assignment` |
| 5 | `Assignment` | IT Staff | IT Staff assigns ticket to an owner. | Assignee recorded; state updated. | Assignee User ID | `In Progress` |
| 6 | `In Progress` | IT Staff | IT Staff works on resolving the problem. | Progress updates/notes captured. | Work Notes | `Resolution` |
| 7 | `Resolution` | IT Staff | IT Staff submits resolution details. | Resolution recorded; state updated. | Resolution Notes | `Employee Notification` |
| 8 | `Employee Notification` | System | System sends resolution notification to Employee. | Triggers visual alert / notification event to reporter. | Resolution Summary | `Verification` |
| 9 | `Verification` | Employee / System | Employee reviews resolution. | Employee accepts (to `Closed`) or disputes (returns to `In Progress` under existing assignee). If unresponsive after 48h, system auto-closes (Option 2). | Verification Feedback | `Closed` (if accepted or 48h timeout) / `In Progress` (if disputed) |
| 10 | `Closed` | System / IT Staff | Ticket finalized into historical records. | State locked; stored in searchable history. | Full Incident Record | Lifecycle Complete |

---

## 14. Employee Experience

```
[ Report Issue ] ──► [ Receive Notification ] ──► [ Monitor Progress ] ──► [ Review Resolution ] ──► [ Verify / Close ]
```

### Key Experience Journey
1. **Reporting:** Employee logs problem via simple Self-Service interface.
2. **Confirmation:** System provides ticket confirmation and visual notification.
3. **Progress Monitoring:** Employee checks current status and progress updates anytime on their personal dashboard without calling/messaging IT.
4. **Resolution Notice:** Employee receives a visual notification when IT Staff completes work.
5. **Verification & Closure:** Employee tests the fix, interacts with the `Verification` stage, and the ticket enters `Closed` history.

---

## 15. IT Staff Experience

```
[ Receive Alert ] ──► [ Queue Review ] ──► [ Assess Priority ] ──► [ Assign Owner ] ──► [ Resolve ] ──► [ History Record ]
```

### Key Experience Journey
1. **Notification Receive:** IT Staff receives visual alerts and audio notifications when incident events occur.
2. **Queue Management:** IT Staff reviews the centralized Operational Queue showing all active company incidents.
3. **Assessment & Priority:** IT Staff evaluates incident context, sets/adjusts Priority, and captures secondary Impact metadata.
4. **Ownership & Work:** IT Staff assigns ticket to self or peer, moves state to `In Progress`, and documents progress.
5. **Resolution:** IT Staff enters resolution notes, triggering Employee Notification and Verification.
6. **Zero Lost Incidents:** Consolidated queue and persistent alerts ensure no reported incident is misplaced or forgotten.

---

## 16. History and Traceability

### 16.1 Historical Record Purpose
Closed incidents remain stored in the platform to serve as historical records for IT Staff and Employees.

### 16.2 Traceable Event Log
Historical records preserve chronological traceability of important ticket events and changes:
* Incident creation timestamp and reporter role.
* Initial assessment details and Priority adjustments.
* Assignment and reassignment events.
* Status lifecycle transitions.
* Resolution documentation notes.
* Verification feedback and final closure timestamp.

---

## 17. Conceptual Data Requirements

> [!NOTE]
> The entities below describe **conceptual product data requirements** only. They do NOT represent premature database schemas, SQL statements, or locked table structures.

```
+------------------+         +------------------+         +------------------+
|      USER        |         |     TICKET       |         |   NOTIFICATION   |
| - User ID        | 1     * | - Ticket ID      | 1     * | - Notification ID|
| - Name           |<--------| - Reporter ID    |<--------| - User ID        |
| - Role           |         | - Assignee ID    |         | - Ticket ID      |
| (Employee/IT)    |         | - Status (10 stg)|         | - Visual Badge   |
+------------------+         | - Priority       |         | - Priority Sound |
                             | - Summary        |         | - Unread State   |
                             | - Impact (Meta)  |         +------------------+
                             | - Resolution Note|
                             +------------------+
                                      │ 1
                                      ▼ *
                             +------------------+
                             |  HISTORY RECORD  |
                             | - History ID     |
                             | - Event Type     |
                             | - Timestamp      |
                             | - Change Log     |
                             +------------------+
```

### Conceptual Entities
1. **User:** Represents system actors (`Employee` or `IT Staff`).
2. **Ticket / Incident:** Core entity storing problem summary, 10-stage status, priority, reporter, assignee, impact metadata, and resolution details.
3. **Notification:** Entity representing visual and sound alert instances, recipient binding, priority association, and persistent unread state.
4. **Assignment:** Conceptual binding between a ticket and an IT Staff assignee.
5. **Priority:** Classification entity (`Low`, `Medium`, `High`) determined by IT Staff.
6. **Status:** Represents current stage along the 10-stage lifecycle.
7. **Resolution:** Storage of resolution details provided by IT Staff.
8. **Verification:** Record of Employee verification feedback or dispute.
9. **History Record:** Event logs preserving chronological traceability of ticket changes over time.

---

## 18. Business Rules

1. **Two Roles Boundary:** Exactly two user roles exist: `Employee` and `IT Staff`. No separate Admin role exists.
2. **No Dedicated Triage:** No separate Triage role, dashboard, or module exists in V1.
3. **Problem Reporting Scope:** Employee communicates problem details; Employee does NOT determine Priority.
4. **Assessment Responsibility:** IT Staff performs initial assessment and determines/adjusts Priority.
5. **Quick Ticket Non-Blocking Principle:** Quick Ticket must require minimum information. Documenting an incident must NEVER delay or block IT Staff's immediate technical response ("Respond first, document without blocking").
6. **Incident Record Mandatory:** All IT incidents requiring IT action must eventually have a record in the platform to eliminate informal untracked reports.
7. **Universal Sound Alerts:** Every Priority level MUST trigger a sound notification once Priority is assessed.
8. **Differentiated Sound Characteristics:** Sound characteristics MUST differ according to Priority.
9. **Visual Notification Alerts:** Notifications MUST include visual alerts.
10. **Persistent Unread State:** Unread notification state MUST persist across sessions until processed.
11. **Canonical Lifecycle Stages:** The 10 stages (`Report` → `Notification` → `Operational Queue` → `Initial Assessment` → `Assignment` → `In Progress` → `Resolution` → `Employee Notification` → `Verification` → `Closed`) define the canonical V1 lifecycle. Quick Ticket entry behavior remains TBD.
12. **Verification Requirement:** Employee Verification is a mandatory lifecycle stage before ticket closure.
13. **V1 Scope Exclusions:** Approval workflows, AI diagnosis, chatbots, auto-assignment, complex SLAs, Critical Incident modules, and external integrations are explicitly excluded from V1.
14. **Roadmap Sequence:** Asset Management, Analytics, Knowledge Base, and AI/Intelligence belong strictly to the post-V1 roadmap.

---

## 19. User Stories

### 19.1 Employee User Stories

#### US-01: Self-Service Problem Reporting
* **User Story:** As an Employee, I want to submit an IT problem report directly through the platform, so that my request is formally logged without needing to search for an IT person.
* **Acceptance Criteria:**
  * Employee can access a simple Self-Service report form.
  * Form does not display Priority options.
  * Submitting creates a new ticket and provides a confirmation ticket ID.
* **Related Requirement:** FR-01, FR-03, FR-06

#### US-02: Self-Service Progress Monitoring
* **User Story:** As an Employee, I want to view current ticket status and progress updates, so that I can track progress without sending manual follow-up messages.
* **Acceptance Criteria:**
  * Employee dashboard displays list of reported tickets.
  * Ticket detail view shows current status, assignee, priority set by IT, and progress updates.
* **Related Requirement:** FR-16

#### US-03: Resolution Verification
* **User Story:** As an Employee, I want to review resolution notes and verify that my issue is fixed, so that I can confirm completion before the ticket is closed.
* **Acceptance Criteria:**
  * Employee receives visual notification when ticket reaches `Resolution`.
  * Ticket displays resolution details and presents `Verification` action options.
* **Related Requirement:** FR-17

---

### 19.2 IT Staff User Stories

#### US-04: Non-Blocking Quick Ticket Logging
* **User Story:** As an IT Staff member, I want to create a Quick Ticket with minimum information while answering an urgent call, so that I can respond immediately without being blocked by lengthy forms.
* **Acceptance Criteria:**
  * IT Staff can open and submit a Quick Ticket form rapidly.
  * Form requires only minimum essential information.
  * Submission creates a formal ticket record in the system.
* **Related Requirement:** FR-04, FR-05

#### US-05: Centralized Queue Management
* **User Story:** As an IT Staff member, I want to view all active company incidents in a single operational queue, so that no reported issue is lost or forgotten.
* **Acceptance Criteria:**
  * Centralized Operational Queue lists all active, non-closed incidents.
  * Queue displays status, priority, reporter, assignee, and creation time.
* **Related Requirement:** FR-09

#### US-06: Initial Assessment & Priority Adjustment
* **User Story:** As an IT Staff member, I want to evaluate reported incidents and set their Priority, so that technical work is properly prioritized.
* **Acceptance Criteria:**
  * IT Staff can select a ticket in `Initial Assessment` stage.
  * IT Staff can update Priority level (`Low`, `Medium`, `High`).
  * System records priority update in ticket history.
* **Related Requirement:** FR-07

#### US-07: Audio & Visual Notification Alerts
* **User Story:** As an IT Staff member, I want to receive persistent visual alerts and priority-differentiated sound notifications, so that I am aware when incident events occur.
* **Acceptance Criteria:**
  * System displays visual badge alerts for unread notification events.
  * System plays priority-specific audio alerts for assessed incident events.
  * Unread state persists across page reloads.
* **Related Requirement:** FR-12, FR-13, FR-14, FR-15

---

## 20. User Flows

### 20.1 Employee Self-Service Flow
```
[ Start: Problem Occurs ]
           │
           ▼
[ Open Platform -> Click "Report IT Problem" ]
           │
           ▼
[ Enter Problem Description & Details ]
           │
           ▼
[ Click Submit ] ──► System Creates Record (State: Report)
           │
           ▼
[ Submission Confirmation (Visual Alert) ] ──► Notification Stage (Silent for Employee; Neutral Ping for IT Staff)
           │
           ▼
[ Ticket Appears in Operational Queue ]
           │
           ▼
[ Monitor Progress Dashboard (In Progress -> Resolution) ]
```

### 20.2 IT Staff Quick Ticket Flow
```
[ Start: Urgent Phone Call / Direct Request ]
           │
           ▼
[ IT Staff Begins Immediate Technical Response ]
           │
           ▼
[ Open Quick Ticket Form ]
           │
           ▼
[ Enter Minimum Information (Reporter & Summary, plus Fast Overrides) ]
           │
           ▼
[ Submit Record ] ──► Ticket Saved (Status: 'In Progress' if Self-Assigned, else 'Operational Queue')
           │
           ▼
[ Technical Work Conducted without Delay ]
```

### 20.3 IT Staff Operational Workflow
```
[ Receive Visual Alert / Sound Notification ]
           │
           ▼
[ Open Centralized Operational Queue ]
           │
           ▼
[ Select Incident -> Initial Assessment Stage ]
           │
           ▼
[ Determine / Adjust Priority (Low / Medium / High) ]
           │
           ▼
[ Assign Owner -> Move State to "In Progress" ]
           │
           ▼
[ Perform Fix -> Record Resolution Notes -> Move State to "Resolution" ]
```

### 20.4 Employee Verification Flow
```
[ Receive Resolution Notification (Visual Alert) ]
           │
           ▼
[ Open Ticket -> Review IT Resolution Notes ]
           │
           ▼
[ Enter Verification Stage ]
           │
           ├─► [ Confirm Fixed ] ──► Ticket Moves to CLOSED State
           │
           └─► [ Dispute Resolution ] ──► Return to 'In Progress' State (Retained Assignee)
```

---

## 21. State Model

The platform defines the **10 canonical lifecycle states**. Specific entry and transition behavior for Quick Ticket is resolved via Option C (Conditional State Entry).

```
+--------------------+-----------------------+-------------------+------------------------------------+
| CURRENT STATE      | ALLOWED TRANSITION    | ACTOR RESPONSIBLE | CONDITION / TRIGGER                |
+--------------------+-----------------------+-------------------+------------------------------------+
| 1. Report          | -> Notification       | System            | Ticket form successfully submitted |
| 2. Notification    | -> Operational Queue  | System            | Visual alert generated             |
| 3. Operational Queue| -> Initial Assessment| IT Staff          | IT Staff selects ticket for review |
| 4. Initial Assessment| -> Assignment       | IT Staff          | Priority determined/adjusted       |
| 5. Assignment      | -> In Progress        | IT Staff          | IT Staff assigned to ticket        |
| 6. In Progress     | -> Resolution         | IT Staff          | Technical fix completed & documented|
| 7. Resolution      | -> Employee Notice    | System            | Resolution notes saved             |
| 8. Employee Notice | -> Verification       | System            | Alert delivered to Employee        |
| 9. Verification    | -> Closed             | Employee / System | Employee confirms fix OR 48h timeout (Option 2)    |
|                    | -> In Progress (Dispute)| Employee        | Employee disputes fix with reason                  |
| 10. Closed         | (Final State)         | System / Employee | Incident finalized into history                    |
+--------------------+-----------------------+-------------------+----------------------------------------------------+
```

> [!NOTE]
> Key operational state transitions have been formally resolved: Quick Ticket initial entry (Option C: Conditional State Entry), Verification dispute destination (Option 1: Direct Rework to In Progress), and Unresponsive employee verification behavior (Option 2: 48-Hour Auto-Close Window).

---

## 22. Notification Event Matrix

| Event | Trigger | Target Recipient | Priority Context | Visual Alert | Sound | Unread Behavior | Classification |
|---|---|---|---|---|---|---|---|
| New Self-Service Incident | Self-Service submission | IT Staff | Pre-assessment | Banner & Badge | Discrete Neutral Ping (523 Hz C5, IT Staff only) | Persistent unread state until processed | Confirmed Decision |
| Quick Ticket Created | IT Staff Quick Ticket | Employee Reporter | Pre-assessment | Visual Alert | Silent / Visual confirmation only | Persistent unread state until processed | Confirmed Decision |
| Priority Updated | IT Staff sets Priority | Assigned IT Staff & Employee Reporter | Assessed Priority | Badge Update | Audio Alert (Differs by Priority) | Persistent unread state until processed | Confirmed Decision |
| Ticket Assigned | Assignee updated | Assigned IT Staff & Employee Reporter | Assessed Priority | Badge Update | Audio Alert (Differs by Priority) | Persistent unread state until processed | Confirmed Decision |
| Resolution Reached | IT Staff saves Resolution | Employee Reporter | Assessed Priority | Banner & Badge | Audio Alert (Differs by Priority) | Persistent unread state until processed | Confirmed Decision |
| Verification Submitted | Employee verifies/disputes | Assigned IT Staff | Assessed Priority | Badge Update | Audio Alert (Differs by Priority) | Persistent unread state until processed | Confirmed Decision |
| Verification Auto-Closed | 48h timeout expired | Employee Reporter & Assigned IT Staff | Assessed Priority | Badge Update | Silent / Informational | Persistent unread state until processed | Confirmed Decision |

---

## 23. Requirements Traceability

| Product Goal | Requirement ID | User Story ID | Workflow Stage | Acceptance Criteria |
|---|---|---|---|---|
| Single Source of Truth | FR-01, FR-03 | US-01 | `Report` | Every IT incident generates a unique, trackable record. |
| Strict Two-Role Boundary | FR-02 | US-01, US-05 | System Wide | Only Employee and IT Staff roles exist; no Admin role. |
| Non-Blocking Response | FR-04, FR-05 | US-04 | `Report` | Quick Ticket requires minimum inputs without delaying IT response. |
| IT Staff Priority Control | FR-06, FR-07 | US-01, US-06 | `Initial Assessment` | Employee describes problem; IT Staff determines Priority. |
| Centralized IT Queue | FR-09, FR-10 | US-05 | `Operational Queue` | Shared queue lists all unresolved incidents to prevent lost tickets. |
| Persistent Notification | FR-12, FR-13, FR-14, FR-15 | US-07 | `Notification` | Visual alerts + Priority-differentiated sounds persist across sessions. |
| Employee Visibility | FR-16 | US-02 | `In Progress` | Current ticket status visible on Employee dashboard without manual follow-up. |
| Verified Resolution | FR-17 | US-03 | `Resolution` / `Verification` | Mandatory resolution and verification stages before closure. |
| Traceable Incident History | FR-18 | US-02, US-05 | `Closed` | Chronological event history retained for past incidents. |

---

## 24. Non-Functional Requirements

### NFR-01: Form Ergonomics & Simplicity
* **Description:** Incident submission interfaces (Self-Service and Quick Ticket) must be intuitive and minimalist.
* **Acceptance Criteria:** Forms contain no redundant input controls; Quick Ticket can be filled swiftly.
* **Classification:** Confirmed Decision

### NFR-02: Notification Responsiveness
* **Description:** Visual and audio notifications should trigger promptly upon notification events.
* **Acceptance Criteria:** Notification alerts update active UI sessions cleanly.
* **Classification:** Assumption

### NFR-03: Responsive Multi-Device Interface
* **Description:** Platform layout should adapt effectively across standard desktop browsers and mobile screen sizes.
* **Acceptance Criteria:** UI elements remain accessible across varied viewport widths.
* **Classification:** Recommendation

### NFR-04: Session Security & Role Authorization
* **Description:** System strictly enforces role-based access control based on user authentication.
* **Acceptance Criteria:** Users cannot perform actions outside their assigned role (`Employee` or `IT Staff`).
* **Classification:** Confirmed Decision

### NFR-05: Operational Reliability & Availability
* **Description:** Platform should remain operational during company business hours to receive reports.
* **Acceptance Criteria:** Operational queue and reporting interfaces are consistently accessible.
* **Classification:** Assumption

### NFR-06: Maintainable UI Component Structure
* **Description:** Frontend UI design should maintain clean component separation for ease of future roadmap extension.
* **Acceptance Criteria:** Navigation, forms, lists, and notification indicators are cleanly modularized.
* **Classification:** Recommendation

### NFR-07: Historical Record Traceability
* **Description:** Historical ticket records preserve chronological traceability of important ticket events and changes.
* **Acceptance Criteria:** System maintains accurate historical log records of key ticket state changes.
* **Classification:** Confirmed Decision

---

## 25. Edge Cases

1. **Employee Reports then Calls IT:** Employee submits Self-Service ticket, then immediately calls IT Staff directly. IT Staff should be able to locate the existing ticket in the Operational Queue rather than duplicating it via Quick Ticket. *(Workflow handling: TBD)*
2. **Quick Ticket Under Live Phone Call:** IT Staff creates Quick Ticket while on a live call. System must allow saving with minimum information without forcing complete assessment. *(Confirmed Decision)*
3. **Priority Shift During Work:** IT Staff discovers issue is higher severity during `In Progress` stage. System allows Priority update, triggering updated Priority sound/visual notification. *(Confirmed Decision)*
4. **Ownership Reassignment:** Ticket needs to be transferred from one IT Staff member to another. *(Resolved - Option B: Hybrid Collaborative with Explicit Takeover and audit logging)*
5. **Employee Rejects Resolution:** Employee tests fix during `Verification` stage and marks it as unresolved. Ticket transitions back to `In Progress` assigned to the previous IT Staff member with mandatory dispute feedback. *(Resolved - Option 1)*
6. **Unresponsive Employee at Verification:** Employee receives resolution notification but never responds or verifies fix. *(Resolved - Option 2: Automated 48-Hour Auto-Close Window initialized upon entering Verification; system auto-closes if no response)*
7. **Persistent Notification Across Devices/Logins:** User logs out with unread notifications, then logs in on another session. Notification retains persistent unread state. *(Confirmed Decision)*
8. **Multiple Quick Updates Before Employee View:** IT Staff updates status twice in rapid succession. System maintains notification queue integrity without dropping events. *(Confirmed Decision)*

---

## 26. Error / Exception Scenarios

1. **Invalid User Input:** User submits empty required fields. System displays localized inline validation errors without clearing entered data.
2. **Unauthorized Role Action:** Employee attempts to access IT Staff Operational Queue or Priority adjustment endpoint. System denies request and presents unauthorized access notice.
3. **Unavailable Ticket Record:** User attempts to open a ticket ID that does not exist or has been deleted. System presents a clear "Ticket Not Found" message with queue return link.
4. **Notification Audio Delivery Block:** Browser context restricts audio playback before user interaction. System maintains visual alert indicator while queuing audio capability.
5. **Workflow Transition Violation:** User attempts invalid state jump (e.g., `Report` directly to `Closed`). System rejects state change and enforces valid lifecycle path.
6. **Data Persistence Failure:** Network interruption during form submission. System displays non-destructive error prompt allowing retry without data loss.

---

## 27. Future Roadmap Considerations

```
+-------------------------------------------------------------------+
|                           V1 CORE PLATFORM                        |
|                     (Tickets, Queue, Notifications)               |
+-------------------------------------------------------------------+
                                  │
                                  ▼ (Future Linkage)
+-------------------------------------------------------------------+
|                        1. ASSET MANAGEMENT                        |
|  - Associate tickets with hardware/software assets                |
|  - Build cumulative "Asset History" over time                     |
+-------------------------------------------------------------------+
                                  │
                                  ▼ (Future Linkage)
+-------------------------------------------------------------------+
|                           2. ANALYTICS                            |
|  - Utilize ticket timeline & Impact metadata for trend analysis   |
+-------------------------------------------------------------------+
                                  │
                                  ▼ (Future Linkage)
+-------------------------------------------------------------------+
|                        3. KNOWLEDGE BASE                          |
|  - Convert resolved ticket histories into solution articles       |
+-------------------------------------------------------------------+
                                  │
                                  ▼ (Future Linkage)
+-------------------------------------------------------------------+
|                     4. AI / INTELLIGENCE                          |
|  - Automated incident classification & predictive insights        |
+-------------------------------------------------------------------+
```

### Architectural Preservation Guidelines
* **V1 Independence:** V1 functions completely independently of future roadmap modules.
* **Asset History Linkage:** V1 ticket structures should avoid design choices that would impede linking tickets to an asset entity in the future.
* **Analytics Readiness:** Passive Impact metadata and timestamps captured in V1 support future analytics processing without changing V1 UX.

---

## 28. Assumptions

*(Copied verbatim from Approved Phase A)*

1. **User Role Identification:** Users authenticate using their organizational identity, which identifies them as either an `Employee` or `IT Staff`.
2. **In-App Workspace Scope:** Visual alerts and sound notifications operate within the platform's application workspace.
3. **Operational Queue Accessibility:** The centralized Operational Queue is visible to IT Staff to manage incoming work.
4. **Self-Service Baseline Data:** Self-Service reporting captures sufficient initial problem information from the Employee for IT Staff to perform an initial assessment.

---

## 29. Recommendations

*(Copied verbatim from Approved Phase A & NFR Reclassifications)*

1. **UX Focus for Quick Ticket:**
   * *Recommendation:* During UI design, streamline the Quick Ticket interface so IT Staff can submit an urgent record in seconds (e.g., entering only who called and a brief summary).
   * *Reason:* Directly supports the principle that documentation must not block immediate incident response.
2. **Verification Stage User Input:**
   * *Recommendation:* Provide a simple feedback prompt for the Employee at the `Verification` stage to accept the resolution or state why the issue remains unresolved.
   * *Reason:* Ensures clear communication when closing the feedback loop between Employee and IT Staff.
3. **Clear Unread Visual Cues:**
   * *Recommendation:* Design prominent visual badges for unread notifications that remain active across sessions until the user interacts with the notification or ticket.
   * *Reason:* Ensures important operational events are easily noticed by both Employees and IT Staff.
4. **Responsive Multi-Device Interface (NFR-03):**
   * *Recommendation:* Design layout so UI adapts effectively across standard desktop browsers and mobile screen sizes.
   * *Reason:* Enhances usability for IT Staff on varied devices without enforcing premature responsive constraints as rigid requirements.

---

## 30. TBD / Open Questions

### High Priority (Required for PRD / Workflow definition)
1. **Quick Ticket Minimum Fields [RESOLVED - Option 2]:** Minimum required inputs are strictly (1) Reporter Employee (`reporter_id`) and (2) Incident Summary (`summary`, 5-150 chars). Optional fast-overrides include immediate self-assignment toggle (`assign_to_me`), immediate priority pill selection (`Low`/`Med`/`High`), and initial work note. The system automatically populates `description` with `summary` to satisfy data integrity without blocking technical response.
2. **Quick Ticket Initial Workflow State [RESOLVED - Option C (Conditional State Entry)]:** Determined dynamically based on the "Assign to me immediately" toggle: (1) If checked: ticket transitions directly to `In Progress` with `assignee_id` bound to the creating IT Staff member and optional priority. (2) If unchecked: ticket enters `Operational Queue` unassigned (`assignee_id = NULL`) for shared queue pickup.
3. **Priority Sound Specifications [RESOLVED - Option B (Melodic/Rhythmic Web Audio API Synthesis)]:** Synthesized via native browser Web Audio API: (1) Low = Single Chime 440 Hz (180ms), (2) Medium = Dual Ascending Chime 587.3 Hz -> 880 Hz (260ms), (3) High = Triple Urgent Arpeggio 880 Hz -> 1046.5 Hz -> 1318.5 Hz (350ms).
4. **Verification Dispute Workflow [RESOLVED - Option 1 (Direct Rework)]:** Transitions back to `In Progress` with ownership retained by the previous IT Staff assignee, requiring mandatory `verification_feedback` (Dispute Reason), and firing an alert notification directly to that IT Staff member.
5. **Pre-Assessment Notification Priority & Sound [RESOLVED - Option B (Discrete Neutral Awareness Ping)]:** Unassessed incident entries trigger a subtle, low-volume neutral awareness ping (523.25 Hz C5, 100ms) for IT Staff active sessions to announce queue arrival without false urgency; Employee submission remains completely silent (visual confirmation only).

### Medium Priority (Required for functional scope clarity)
6. **IT Staff Granular Operational Permissions [RESOLVED - Option B (Hybrid Collaborative with Explicit Takeover)]:** Granular permissions across IT Staff peers operate on a single clear ownership model with open operational agility: (1) Any IT Staff can Take Over or Reassign active tickets (logging `TICKET_REASSIGNED` with audit history). (2) Work Notes are strictly append-only and immutable for all staff (no edits or deletions). (3) Ticket Resolution submission is restricted exclusively to the active Assignee (peers must explicitly click "Take Over" before resolving). (4) Ticket closure remains strictly within Employee Verification/System rules.
7. **Notification State Transitions [RESOLVED - Option B (Contextual Auto-Acknowledge on Navigation + Drawer Explicit Controls)]:** Unread notifications transition to `read` (`visual_badge_active = FALSE`) through 3 distinct triggers: (1) Clicking an individual notification item in the drawer (marks item read and navigates to ticket), (2) Contextual auto-read: opening a ticket detail view directly (via Queue, Dashboard, or direct link) automatically marks all unread notifications for that specific ticket and user as read, eliminating phantom badges, and (3) Bulk "Mark All Read" button in the drawer. Merely opening the notification drawer does not clear unread badges. Database uses 2 canonical states (`unread` vs `read`), while "Clear Acknowledged" in UI dismisses read cards from the drawer viewport.
8. **Unresponsive Employee Verification Behavior [RESOLVED - Option 2 (Automated 48-Hour Auto-Close Window)]:** Tickets entering `Verification` initialize a 48-hour auto-close timer (`verification_started_at = NOW()`). If the Employee does not confirm (`Accept`) or dispute (`Dispute`) within 48 hours, the system automatically transitions the ticket to `Closed`, logs audit event `VERIFICATION_AUTO_CLOSED` (`{"trigger": "48H_INACTIVITY_TIMEOUT", "actor": "SYSTEM_AUTOMATION"}`), and sends a closure notice to the Employee. This prevents zombie queue buildup, preserves Invariant 2, and aligns with the UI reference repository artifact.
9. **Notification Delivery Channels & Recipients [RESOLVED - Option A (Strictly In-App Visual & Audio Alerts)]:** Notifications in V1 are strictly self-contained within the web platform (persistent header badges, notification center drawer, contextual banners, and Web Audio API parametric sound chimes). External delivery channels (SMTP outbound email, SMS, Slack webhooks) are explicitly deferred to the V2 Roadmap, preserving the core V1 scope boundary (Section 7.2). Recipient bindings are fully finalized: IT Staff receives queue and unassessed alerts; Assigned IT Staff receives assignment, priority shift, dispute, and closure events; Employee Reporter receives creation confirmation, technician assignment visibility, resolution verification prompts, and closure notices.
10. **Impact Metadata Definition [RESOLVED - Option A (Standard 3-Tier ITIL Scope)]:** Impact is strictly a secondary, passive metadata field stored as a VARCHAR(100) / ENUM with 3 canonical values: (1) `Individual` (Single User / Workstation), (2) `Departmental` (Team / Specific Business Unit), and (3) `Organization-Wide` (Enterprise / Core Infrastructure Outage), with a default of `NULL`/None. It is completely optional, non-blocking, and does not alter ticket routing, SLA calculations, or priority matrices in V1.

### Low Priority (Can be decided during design refinement)
11. **Attachments Support [RESOLVED - Option A (Strictly Text-Only in V1 / Deferred to Roadmap V2)]:** V1 strictly enforces a text-only operational scope (`summary`, `description`, `work_notes`, `resolution_notes`, `verification_feedback`). There is no file upload infrastructure, multipart handling, or object storage bucket dependencies in V1. UI references containing attachment buttons are treated as disabled/hidden or annotated as Roadmap V2 features. Multi-format file and image attachment capabilities are formally deferred to Roadmap V2 (Section 7.3).
12. **Ticket Re-opening Policy [RESOLVED - Option 1 (Strictly Final / Immutable Closed State — Always Create New Ticket)]:** The `Closed` state is strictly terminal, final, and immutable. Once a ticket reaches `Closed` (via Employee verification confirmation or 48-hour auto-close timeout), it is locked permanently as a read-only historical record and can NEVER be reopened (`Closed -> Any State` is strictly prohibited, enforcing Invariant 5). If an issue recurs or persists after closure, the Employee must report a new ticket. The closed ticket detail UI provides a convenience shortcut button ("Report Recurring Issue") that opens the standard report form pre-populated with context and an automated backward reference note: "Recurrence of closed incident #INC-XXXX".

---

## 31. MVP Acceptance Criteria

V1 Core IT Service is considered functionally complete when:

1. **Dual Role Authorization:** System enforces access for `Employee` and `IT Staff` roles without any Admin role dependency.
2. **Self-Service & Quick Ticket Creation:** Employees can report problems via Self-Service; IT Staff can log Quick Tickets rapidly without blocking immediate response.
3. **IT Staff Priority Control:** Priority is assigned and modified exclusively by IT Staff during initial assessment.
4. **Centralized Operational Queue:** IT Staff can view, access, and manage all unresolved company incidents in a single queue view.
5. **Persistent Visual & Sound Notifications:** Visual alerts display persistently until processed; every Priority level triggers audibly distinct sound alerts once assessed.
6. **Canonical Lifecycle Execution:** Tickets define the 10 canonical lifecycle stages from `Report` to `Closed`.
7. **Resolution Verification Loop:** Resolved tickets present a `Verification` stage to Employees prior to final closure.
8. **Incident History Retention:** System maintains a searchable historical log preserving chronological traceability of past incidents.

---

## 32. Definition of Done (DoD)

V1 is complete when all deliverables meet the following criteria:

* **Requirements:** 100% of confirmed functional requirements (FR-01 to FR-18) are fulfilled without scope creep.
* **UI/UX:** Complete user interfaces delivered for Employee Self-Service, IT Staff Operational Queue, Quick Ticket modal, Notification panel, and Ticket Detail views.
* **Frontend:** Interactive web interface built with React JS, Tailwind CSS, and shadcn/ui components, implementing dual-role views, visual alert updates, audio notification triggers, and lifecycle stage transitions.
* **Backend:** Application logic executing workflow transitions, role permission validation, and persistent notification queue management.
* **Database:** Conceptual data entities translated into persistent database storage supporting incident records, history logs, and user roles.
* **Authentication/Authorization:** Identity mechanism mapping authenticated users to either `Employee` or `IT Staff` roles.
* **Notifications:** Visual alert badge persistence and Priority-differentiated audio playback verified across browser sessions.
* **Testing:** End-to-end verification of Employee reporting, Quick Ticket creation, queue management, priority updates, resolution, verification, and historical logging.
* **Documentation:** System architecture documentation and user guide completed.
* **Deployment Readiness:** Environment configured and validated for operational release.

---

## PRD Validation Status

* **Status:** PASS (Phase C Corrections Applied)
* **Confirmed Requirements:** 21 (18 Functional Requirements + 3 Non-Functional Requirements)
* **Assumptions:** 6 (4 Core Assumptions + 2 Non-Functional Assumptions)
* **Recommendations:** 5 (3 Core Recommendations + 1 NFR Reclassification + 1 NFR Component Recommendation)
* **Remaining TBD Count:** 12 (5 High Priority, 5 Medium Priority, 2 Low Priority)

### Audit Statement
> **Validation Correction Audit Passed:** All 11 Phase C correction directives have been applied. Pre-assessment notification sound behavior is explicitly marked as TBD; canonical 10-stage lifecycle language is updated without resolving Quick Ticket entry flow; Notification Event Matrix distinguishes confirmed vs. TBD events; unread state persistence is strictly separated from read/acknowledged TBD triggers; audio confirmation on self-service submission is removed; "real-time" language is replaced with "current status and progress updates"; unalterable audit log claims are replaced with historical traceability; mobile responsiveness is reclassified as a recommendation; and missing TBDs (Ticket Re-opening, Impact Values, Pre-Assessment Notification Priority) are incorporated. No scope expansion or code generation occurred.
