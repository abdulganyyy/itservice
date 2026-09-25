# SYSTEM ANALYSIS — PHASE 5: DOMAIN MODEL & ENTITY RELATIONSHIP ANALYSIS
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. Categorization & Classification of PRD Conceptual Entities

> [!IMPORTANT]
> **Prinsip Penting System Analysis:**
> Entitas konseptual di dalam PRD **TIDAK SECARA OTOMATIS** diubah menjadi tabel database fisik (*database tables*).
> Pemetaan harus berdasarkan analisis logis: apakah objek tersebut memiliki *identity* dan *lifecycle* sendiri (True Domain Entity), ataukah ia merupakan nilai atribut (*Value Attribute*), status alur kerja (*State Attribute*), atau sub-struktur dari proses bisnis (*Embedded Process Payload*).

```
+---------------------------------------------------------------------------------------------------+
| CLASSIFICATION OF PRD CONCEPTUAL ENTITIES                                                         |
+-------------------+-----------------------------------+-------------------------------------------+
| CATEGORY          | PRD CONCEPTUAL ENTITY             | DOMAIN ANALYSIS & CLASSIFICATION (WHY)    |
+-------------------+-----------------------------------+-------------------------------------------+
| TRUE DOMAIN       | 1. User                           | Has independent identity, lifecycle, and  |
| ENTITIES          | 2. Ticket / Incident              | behaviors. Requires primary storage       |
|                   | 3. Notification                   | representation.                           |
|                   | 4. History Record                 |                                           |
+-------------------+-----------------------------------+-------------------------------------------+
| DOMAIN VALUE      | 5. Priority                       | Attributes/Values belonging to a Ticket.  |
| ATTRIBUTES &      | 6. Status (Lifecycle Stage)       | Priority = Value ('Low'/'Med'/'High').    |
| STATES            | 7. Impact Metadata                | Status = State along 10 Canonical Stages. |
+-------------------+-----------------------------------+-------------------------------------------+
| EMBEDDED PROCESS  | 8. Assignment                     | Relationship / process attributes on      |
| SUB-STRUCTURES    | 9. Resolution                     | Ticket. Assignment binds Ticket to User.  |
|                   | 10. Verification                  | Resolution & Verification capture notes,  |
|                   |                                   | timestamps, and decision outcomes.        |
+-------------------+-----------------------------------+-------------------------------------------+
```

### Penjelasan Logis Klasifikasi:

1. **True Domain Entities (Entitas Utama):**
   * `User`, `Ticket`, `Notification`, dan `History Record` adalah objek independen yang memiliki *identity* (ID unik), siklus hidup (*lifetime*), dan relasi ke objek lain.
2. **Domain Value Attributes / States (Bukan Tabel Terpisah):**
   * `Priority` **BUKAN** entitas terpisah di V1, melainkan *Value Attribute* pada Tiket dengan nilai terdefinisi (`Low`, `Medium`, `High`).
   * `Status` **BUKAN** tabel terpisah, melainkan *State Attribute* yang menunjukkan tahapan insiden pada 10 Canonical Lifecycle Stages.
   * `Impact` adalah *Passive Secondary Metadata Attribute* opsional pada Tiket.
3. **Embedded Process Sub-structures (Proses / Sub-Proses Tiket):**
   * `Assignment` merepresentasikan relasi (*relationship binding*) antara `Ticket` dan `IT Staff (User)` yang menyimpan informasi siapa penanggung jawab tiket saat ini.
   * `Resolution` dan `Verification` adalah *sub-structures/state payloads* dari Tiket yang menyimpan penjelasan solusi, catatan dispute, dan timestamp penutupan.

---

## 2. Conceptual Entity-Relationship Diagram (ERD)

Diagram berikut menggambarkan entitas domain utama (*True Domain Entities*), relasi antar-entitas, serta kardinalitas logisnya (1:1, 1:N, N:M):

```
                     +--------------------------+
                     |          USER            |
                     |--------------------------|
                     | PK  User_ID              |
                     |     Full_Name            |
                     |     Email                |
                     |     Role (Employee/IT)   |
                     +--------------------------+
                       │ 1                  │ 1
                       │                    │
             (Reports) │ 1:N      (Assigns) │ 1:N (Optional)
                       ▼                    ▼
+---------------------------------------------------------------+
|                      TICKET / INCIDENT                        |
|---------------------------------------------------------------|
| PK  Ticket_ID                                                 |
| FK  Reporter_ID (Ref: USER.User_ID)                           |
| FK  Assignee_ID (Ref: USER.User_ID, Optional)                 |
|     Summary                                                   |
|     Description                                               |
|     Priority (Unassessed / Low / Medium / High)               |
|     Status (10 Canonical Stages)                              |
|     Impact_Metadata (Individual / Departmental / Org-Wide)    |
|     Resolution_Notes (Optional, Mandatory at Resolution)      |
|     Verification_Feedback (Optional, Mandatory on Dispute)  |
|     Created_At                                                |
|     Closed_At                                                 |
+---------------------------------------------------------------+
         │ 1                                  │ 1
         │                                    │
   (Triggers) │ 1:N                     (Logs) │ 1:N
         ▼                                    ▼
+--------------------------------+  +--------------------------------+
|          NOTIFICATION          |  |         HISTORY RECORD         |
|--------------------------------|  |--------------------------------|
| PK  Notification_ID            |  | PK  History_ID                 |
| FK  Target_User_ID (Ref: USER) |  | FK  Ticket_ID (Ref: TICKET)    |
| FK  Source_Ticket_ID (Ref:TCKT)|  | FK  Actor_ID (Ref: USER)       |
|     Event_Type                 |  |     Event_Type                 |
|     Visual_Badge_Active (Bool) |  |     Change_Payload (Old/New)   |
|     Audio_Priority_Context     |  |     Created_At                 |
|     Persistent_Unread_State    |  +--------------------------------+
|     Created_At                 |
+--------------------------------+
```

---

## 3. Detailed Specifications of True Domain Entities

Berikut adalah spesifikasi logis terperinci untuk 4 *True Domain Entities* dalam sistem V1:

### 3.1 Entity: USER
* **Makna Bisnis:** Pengguna terautentikasi dalam organisasi (Employee atau IT Staff).
* **Invariabel Identitas:** `User_ID` bersifat unik global. Setiap User wajib memiliki tepat satu `Role`.

| Attribute Name | Logical Data Type | Optionality | Domain Meaning & Constraints |
| :--- | :--- | :--- | :--- |
| `User_ID` | Identifier (UUID/Text) | Mandatory | Unique identity of the user. |
| `Full_Name` | String / Text | Mandatory | Display name of the user. |
| `Email` | String / Text | Mandatory | Corporate email identity. |
| `Role` | Enum Value | Mandatory | Must be strictly `Employee` or `IT Staff` *(FR-02)*. |

* **Relasi Domain:**
  * 1 `User` (Employee) dapat melaporkan **N** `Ticket` (*1:N as Reporter*).
  * 1 `User` (IT Staff) dapat ditunjuk mengerjakan **N** `Ticket` (*1:N as Assignee*).
  * 1 `User` dapat menerima **N** `Notification` (*1:N as Recipient*).

---

### 3.2 Entity: TICKET / INCIDENT (Core Entity)
* **Makna Bisnis:** Objek transaksi utama yang merepresentasikan insiden IT yang dilaporkan hingga selesai.
* **Invariabel Identitas:** Every ticket MUST have a `Reporter_ID`. Active tickets in `In Progress` MUST have a non-null `Assignee_ID`.

| Attribute Name | Logical Data Type | Optionality | Domain Meaning & Constraints |
| :--- | :--- | :--- | :--- |
| `Ticket_ID` | Identifier (UUID/Text) | Mandatory | Unique reference code for the incident. |
| `Reporter_ID` | Reference (User_ID) | Mandatory | User ID of the reporting Employee/Staff. |
| `Assignee_ID` | Reference (User_ID) | Optional | IT Staff ID assigned to work on ticket. Null until assignment. |
| `Summary` | String / Text | Mandatory | Short problem title. Mandatory on submission. |
| `Description` | String / Text | Mandatory | Detailed problem explanation. |
| `Priority` | Enum Value | Optional | `Unassessed` / `Low` / `Medium` / `High`. Set by IT Staff. |
| `Status` | Enum Value | Mandatory | Current stage along 10 Canonical Stages (`Report` -> `Closed`). |
| `Impact_Metadata` | Enum / String | Optional | Secondary metadata (Option A: `Individual`, `Departmental`, `Organization-Wide`, default `NULL`). Does NOT drive workflow. |
| `Resolution_Notes` | String / Text | Optional | Fix details. **Mandatory** when moving to `Resolution`. |
| `Verification_Feedback`| String / Text | Optional | Feedback on accept/dispute. **Mandatory** on Dispute. |
| `Created_At` | Timestamp | Mandatory | System creation timestamp. |
| `Closed_At` | Timestamp | Optional | Timestamp when status reaches `Closed`. |

* **Relasi Domain:**
  * 1 `Ticket` memiliki **N** `Notification` (*1:N*).
  * 1 `Ticket` memiliki **N** `History Record` (*1:N*).

---

### 3.3 Entity: NOTIFICATION
* **Makna Bisnis:** Peringatan visual dan audio yang ditujukan kepada pengguna mengenai kejadian pada tiket.
* **Invariabel Domain:** Flag `Persistent_Unread_State` bertahan lintas sesi hingga diubah pengguna *(FR-15)*.

| Attribute Name | Logical Data Type | Optionality | Domain Meaning & Constraints |
| :--- | :--- | :--- | :--- |
| `Notification_ID` | Identifier (UUID/Text) | Mandatory | Unique identity of the notification record. |
| `Target_User_ID` | Reference (User_ID) | Mandatory | User ID of the recipient. |
| `Source_Ticket_ID` | Reference (Ticket_ID) | Mandatory | Ticket ID associated with this event alert. |
| `Event_Type` | String / Enum | Mandatory | Event code (e.g., `EVENT_TICKET_CREATED`, `EVENT_RESOLVED`). |
| `Visual_Badge_Active` | Boolean | Mandatory | `True` = Render visual badge indicator on UI. |
| `Audio_Priority_Context`| Enum Value | Optional | Priority context (`Low`/`Med`/`High`) for audio playback. |
| `Persistent_Unread_State`| Enum / Boolean | Mandatory | `unread` / `read`. Persists across logins until processed. |
| `Created_At` | Timestamp | Mandatory | Timestamp when alert was fired. |

---

### 3.4 Entity: HISTORY RECORD
* **Makna Bisnis:** Rekam jejak kronologis kejadian perubahan atribut dan status pada tiket insiden (*Traceable History*).
* **Invariabel Domain:** Record bersifat *Append-Only* (tidak dapat diedit atau dihapus).

| Attribute Name | Logical Data Type | Optionality | Domain Meaning & Constraints |
| :--- | :--- | :--- | :--- |
| `History_ID` | Identifier (UUID/Text) | Mandatory | Unique identity of the history log entry. |
| `Ticket_ID` | Reference (Ticket_ID) | Mandatory | Target ticket ID. |
| `Actor_ID` | Reference (User_ID) | Mandatory | User ID of the actor who performed the action. |
| `Event_Type` | String / Enum | Mandatory | Audit event code (e.g., `PRIORITY_ASSESSED`, `WORK_NOTE_ADDED`). |
| `Change_Payload` | JSON / Text Structure | Mandatory | Stores `Old Value` vs `New Value` or text notes. |
| `Created_At` | Timestamp | Mandatory | Exact timestamp of event occurrence. |

---

## 4. Derived Concepts & Future Roadmap Extension Points

```
+-----------------------------------------------------------------------------------+
| FUTURE ROADMAP LINKAGE ARCHITECTURE PRESERVATION                                  |
+-----------------------------------------------------------------------------------+
| V1 CORE TICKET ENTITY                                                             |
| [ Ticket_ID | Summary | Reporter_ID | Status | Priority | ... ]                   |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼ (Future Optional Binding in Post-V1)
+-----------------------------------------------------------------------------------+
| 1. ASSET MANAGEMENT MODULE (Roadmap Step 1)                                       |
| [ Asset_ID | Asset_Name | Serial_Number | Associated_Ticket_History_Link ]        |
+-----------------------------------------------------------------------------------+
```

### 1. Derived Concepts (Konsep Terhitung / Dynamic Concepts):
* **`Unread Notification Count`:** Jumlah rekaman `Notification` di mana `Target_User_ID == Current_User` DAN `Persistent_Unread_State == 'unread'`.
* **`Active Queue Items`:** Seluruh `Ticket` di mana `Status != 'Closed'`.

### 2. Architectural Preservation for Future Roadmap:
* **Asset History Readiness (Roadmap Step 1):** Pada V1, tidak ada UI atau entitas `Asset`. Namun, struktur domain `Ticket` dirancang bersih tanpa *hardcoded assumptions* yang akan menyulitkan penambahan relasi opsional `FK Asset_ID (Optional)` di masa depan untuk membangun *Asset History*.

---

## Technical Summary Phase 5

Pada Phase 5 ini, Model Konseptual Domain dan Relasi Entitas telah didefinisikan secara matang:
1. **Klasifikasi Entitas:** Mengisolasi 4 *True Domain Entities* (`User`, `Ticket`, `Notification`, `History Record`) dan mendefinisikan `Priority`, `Status`, `Assignment`, `Resolution`, dan `Verification` sebagai atribut/sub-struktur logis.
2. **Conceptual ERD:** Menyajikan diagram relasi dan kardinalitas murni logis tanpa menyentuh Supabase SQL atau skema fisik.
3. **Spesifikasi Detail Entitas:** Mendefinisikan tipe data bisnis, opsionalitas, dan invariabel domain untuk setiap atribut entitas utama.
4. **Preservasi Arsitektur:** Memastikan kesiapan struktur domain V1 untuk dihubungkan dengan modul *Asset Management* pada roadmap pasca-V1.
