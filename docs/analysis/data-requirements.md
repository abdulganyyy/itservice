# SYSTEM ANALYSIS — PHASE 6: DATA REQUIREMENTS ANALYSIS
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. Input & Output Data Payloads per Use Case

Tabel di bawah menentukan spesifikasi data masukan (*Input Payload*) dan data keluaran (*Output Payload*) untuk setiap Use Case operasional V1:

```
+---------------------------------------------------------------------------------------------------+
| INPUT / OUTPUT PAYLOAD STRUCTURE OVERVIEW                                                         |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ UC-01: Self-Service Incident ]                                                                 |
|  Input : { Reporter_ID, Summary, Description } (NO Priority Field!)                               |
|  Output: { Ticket_ID, Status: 'Report', Created_At }                                              |
|                                                                                                   |
|  [ UC-02: Quick Ticket Creation ]                                                                 |
|  Input : { Reporter_ID, Summary, (Optional: Assign_To_Me, Priority, Work_Note) }                  |
|  Output: { Ticket_ID, Status: ('In Progress' if Assign_To_Me else 'Operational Queue'), Creator } |
|                                                                                                   |
|  [ UC-04: Initial Assessment & Priority ]                                                         |
|  Input : { Ticket_ID, Priority: 'Low'|'Med'|'High', Impact_Metadata: (Optional) }               |
|  Output: { Ticket_ID, Priority, Status: 'Assignment', Priority_Audio_Trigger: TRUE }              |
|                                                                                                   |
|  [ UC-07: Incident Resolution ]                                                                   |
|  Input : { Ticket_ID, Resolution_Notes: (Mandatory Non-Empty) }                                   |
|  Output: { Ticket_ID, Status: 'Resolution' -> 'Verification', Resolution_Timestamp }              |
|                                                                                                   |
|  [ UC-08: Employee Verification ]                                                                 |
|  Input : { Ticket_ID, Decision: 'Accept'|'Dispute', Dispute_Reason: (Mandatory if Dispute) }      |
|  Output: { Ticket_ID, Status: ('Closed' if Accept else 'In Progress'), Retained_Assignee }        |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Rincian Payload Spesifik Use Case:

| Use Case ID | Use Case Name | Required Input Data Payload | Data Validation & Constraints | Resulting Output Data Payload |
| :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Submit Self-Service | `Reporter_ID` (User)<br>`Summary` (String)<br>`Description` (String) | `Summary` & `Description` MUST NOT be empty. Priority control is **EXCLUDED**. | `Ticket_ID` (Generated)<br>`Status` (`Report`)<br>`Created_At` (Timestamp) |
| **UC-02** | Create Quick Ticket | `Reporter_ID` (User)<br>`Summary` (String, 5-150 chars)<br>*(Optional: Assign_To_Me, Priority, Work_Note)* | Non-blocking minimal check (`Summary` 5-150 chars, valid `Reporter_ID`). Description auto-filled with Summary if omitted. | `Ticket_ID` (Generated)<br>`Status` (`In Progress` if `Assign_To_Me` checked, else `Operational Queue`)<br>`Created_By` (IT Staff ID) |
| **UC-03** | View Queue | `User_ID` (IT Staff)<br>`Queue_Filter` (Optional) | User MUST be `IT Staff`. Queries active tickets (`Status != Closed`). | List of Ticket Records: `{ Ticket_ID, Summary, Reporter_Name, Priority, Status, Assignee_Name, Created_At }` |
| **UC-04** | Perform Assessment | `Ticket_ID` (Ticket)<br>`Priority` (Enum)<br>`Impact_Metadata` (Optional) | `Priority` MUST be one of: `Low`, `Medium`, `High`. User MUST be `IT Staff`. | `Ticket_ID`<br>`Priority` (Assessed)<br>`Status` (`Assignment`)<br>Fires `Audio Alert` trigger payload |
| **UC-05** | Assign Ownership | `Ticket_ID` (Ticket)<br>`Assignee_ID` (IT Staff User) | `Assignee_ID` MUST be valid IT Staff user ID. | `Ticket_ID`<br>`Assignee_ID`<br>`Status` (`In Progress`) |
| **UC-06** | Update Work Notes | `Ticket_ID` (Ticket)<br>`Work_Note_Text` (String) | `Work_Note_Text` MUST NOT be empty. | Appended `Work_Notes` object with Timestamp & Author ID. |
| **UC-07** | Record Resolution | `Ticket_ID` (Ticket)<br>`Resolution_Notes` (String) | **MANDATORY:** `Resolution_Notes` MUST NOT be empty. Ticket must be `In Progress`. | `Ticket_ID`<br>`Status` (`Resolution` -> `Verification`)<br>`Resolution_Notes` |
| **UC-08** | Perform Verification | `Ticket_ID` (Ticket)<br>`Decision` (`Accept`/`Dispute`/`Timeout`)<br>`Dispute_Reason` (String, if Dispute) | If `Decision == Dispute`, `Dispute_Reason` **MUST NOT be empty**. Scoped to Reporter (or System 48h timeout). | If Accept / 48h Timeout: `Status` (`Closed`)<br>If Dispute: `Status` (`In Progress` under existing assignee) |
| **UC-09** | Manage Notifications| `User_ID` (User)<br>`Action` (`Fetch`/`MarkRead`) | Scoped to `User_ID`. | `{ Unread_Count, Notification_List: [{ ID, Source_Ticket_ID, Visual_Badge, Audio_Priority, Persistent_Unread }] }` |
| **UC-10** | View History Log | `Ticket_ID` (Ticket) | Access authorization check. | List of History Records: `{ History_ID, Actor_Name, Event_Type, Change_Payload, Timestamp }` |

---

## 2. Field-Level Validation Rules & Inline Error Specs

Tabel berikut menentukan aturan validasi tingkat field (*Field-Level Validation Rules*) serta pesan kesalahan inline (*Inline Error Messaging*) yang harus disajikan ke pengguna saat validasi gagal:

| Field Name | Target Form / Use Case | Validation Rules & Constraints | Fail Scenario | Localized Error Message (NFR-01 Ergonomics) |
| :--- | :--- | :--- | :--- | :--- |
| `Summary` | UC-01, UC-02 | Non-empty text, String length 5–150 characters. | Text empty or < 5 chars. | *"Problem summary is required (minimum 5 characters)."* |
| `Description` | UC-01 | Non-empty text, String length 10–2000 characters. | Text empty or < 10 chars. | *"Please provide a detailed description of the IT problem."* |
| `Priority` | UC-04 | Must be one of explicit enum values: `Low`, `Medium`, `High`. | Unselected or invalid value. | *"Please select a valid Priority level (Low, Medium, or High)."* |
| `Assignee_ID` | UC-05 | Must be a valid existing `User_ID` with `Role == IT_Staff`. | Invalid User ID or non-IT user. | *"Ticket must be assigned to a valid IT Staff member."* |
| `Resolution_Notes` | UC-07 | Non-empty text, minimum 10 characters explaining fix. | Text empty or < 10 chars. | *"Resolution notes are mandatory before submitting resolution."* |
| `Dispute_Reason` | UC-08 (Dispute Path) | Non-empty text when Employee selects *Issue Still Persists*. | Dispute selected but text empty. | *"Please explain why the issue remains unresolved before submitting dispute."* |

---

## 3. Data Nullability & Default Value Matrix by Lifecycle Stage

Tabel ini menunjukkan perubahan penanganan nilai kosong (*Nullability*) dan nilai bawaan (*Default Values*) untuk atribut-atribut utama tiket seiring berjalannya insiden melalui 10 Tahapan Lifecycle.

| Attribute Name | Stage 1–3 (`Report` to `Queue`) | Stage 4–5 (`Assessment` to `Assignment`) | Stage 6 (`In Progress`) | Stage 7–9 (`Resolution` to `Verification`) | Stage 10 (`Closed`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Ticket_ID` | **NOT NULL** (Auto UUID) | **NOT NULL** | **NOT NULL** | **NOT NULL** | **NOT NULL** |
| `Reporter_ID` | **NOT NULL** (Current User) | **NOT NULL** | **NOT NULL** | **NOT NULL** | **NOT NULL** |
| `Priority` | **NULL** (*Unassessed*) | **NOT NULL** (`Low`/`Med`/`High`) | **NOT NULL** | **NOT NULL** | **NOT NULL** (Locked) |
| `Assignee_ID` | **NULL** (*Unassigned*) | **NULL** -> **NOT NULL** | **NOT NULL** (*Clear Ownership*) | **NOT NULL** | **NOT NULL** (Locked) |
| `Status` | `Report` -> `Queue` | `Assessment` -> `Assignment` | `In Progress` | `Resolution` -> `Verification` | `Closed` (Terminal) |
| `Resolution_Notes` | **NULL** | **NULL** | **NULL** | **NOT NULL** (Mandatory) | **NOT NULL** (Locked) |
| `Verification_Feedback`| **NULL** | **NULL** | **NULL** | Optional / **NOT NULL** if Dispute | Optional / Locked |
| `Verification_Started_At`| **NULL** | **NULL** | **NULL** | **NOT NULL** (on entry to `Verification`) | **NOT NULL** (Locked) |
| `Closed_At` | **NULL** | **NULL** | **NULL** | **NULL** | **NOT NULL** (Timestamp) |

---

## 4. Data Integrity & Persistence Constraints

Untuk menjamin keandalan data (*Data Integrity*) pada seluruh sistem, 4 aturan keabsahan data berikut diimplementasikan:

```
+---------------------------------------------------------------------------------------------------+
| CORE DATA INTEGRITY CONSTRAINTS                                                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ CONSTRAINT 1: Append-Only History Audit Log ]                                                  |
|  Records in HISTORY RECORD entity CANNOT be updated or deleted. INSERT-ONLY operations permitted. |
|                                                                                                   |
|  [ CONSTRAINT 2: Persistent Unread Notification State ]                                           |
|  Notification.Persistent_Unread_State remains 'unread' until an explicit user read action occurs. |
|  Logging out or reloading browser MUST NOT clear unread state.                                    |
|                                                                                                   |
|  [ CONSTRAINT 3: Clear Ownership Mandatory Assignee ]                                             |
|  System MUST REJECT transitioning ticket to 'In Progress' IF Assignee_ID is NULL.                 |
|                                                                                                   |
|  [ CONSTRAINT 4: Read-Only Terminal Closed State ]                                                |
|  WHEN Ticket.Status == 'Closed', ALL TICKET FIELDS BECOME PERMANENTLY READ-ONLY (LOCKED).         |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## Technical Summary Phase 6

Pada Phase 6 ini, Kebutuhan Data telah didefinisikan secara presisi:
1. **Input/Output Payloads:** Memetakan payload data masukan dan keluaran secara mendalam untuk 10 Use Cases.
2. **Aturan Validasi & Inline Error:** Menentukan aturan constraint field dan pesan kesalahan yang ramah pengguna (*NFR-01 Ergonomics*).
3. **Matriks Nullability:** Menyajikan pergeseran penanganan nilai `NULL` menjadi `NOT NULL` untuk atribut `Priority`, `Assignee_ID`, dan `Resolution_Notes` di sepanjang tahapan lifecycle.
4. **Data Integrity Guards:** Mengunci aturan *Append-only Audit Log*, *Persistent Unread Notification State*, *Clear Ownership Constraint*, dan *Read-Only Terminal Locked Closed State*.
