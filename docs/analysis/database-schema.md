# DATABASE SCHEMA SPECIFICATION
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Logical & Relational Database Design  
**Scope:** Core IT Service (V1)  

---

## 1. Schema Overview & Mapping Strategy

Spesifikasi skema basis data ini diturunkan secara langsung dari **Phase 5 (Domain Model & ERD)** dan **Phase 6 (Data Requirements)**. 

Berdasarkan hasil analisis domain, hanya **4 True Domain Entities** yang dipetakan menjadi tabel basis data fisik:
1. `users` (Menyimpan identitas & role pengguna)
2. `tickets` (Menyimpan entitas insiden utama, status 10 stage, priority, dan catatan proses)
3. `notifications` (Menyimpan peringatan visual & audio beserta persistent unread state)
4. `ticket_history` (Menyimpan log audit kronologis kejadian append-only)

> [!IMPORTANT]
> Konsep `Priority`, `Status`, `Impact`, `Assignment`, `Resolution`, dan `Verification` **TIDAK** dijadikan tabel terpisah, melainkan dipetakan sebagai kolom atribut, nilai enum/CHECK constraint, dan payload terstruktur pada tabel `tickets`.

```
+---------------------------------------------------------------------------------------------------+
| PHYSICAL DATABASE RELATIONAL SCHEMA                                                               |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  +--------------------+             +------------------------------------+                        |
|  |       users        |             |              tickets               |                        |
|  |--------------------|             |------------------------------------|                        |
|  | PK  id             |1           *| PK  id                             |                        |
|  |     full_name      |<------------| FK  reporter_id                    |                        |
|  |     email          | (Reports)   | FK  assignee_id (Nullable)         |                        |
|  |     role           |1           *|     summary                        |                        |
|  +--------------------+<------------|     description                    |                        |
|                             (Assigns)|     priority (Nullable Enum)       |                        |
|                                     |     status (10 Stage Enum)         |                        |
|                                     |     impact_metadata (Nullable)     |                        |
|                                     |     resolution_notes (Nullable)    |                        |
|                                     |     verification_feedback (Null)   |                        |
|                                     |     created_at / closed_at         |                        |
|                                     +------------------------------------+                        |
|                                               │ 1                  │ 1                            |
|                                     (Triggers)│ 1:N          (Logs)│ 1:N                          |
|                                               ▼                    ▼                              |
|                                     +-------------------+  +-------------------+                  |
|                                     |   notifications   |  |  ticket_history   |                  |
|                                     |-------------------|  |-------------------|                  |
|                                     | PK  id            |  | PK  id            |                  |
|                                     | FK  target_user_id|  | FK  ticket_id     |                  |
|                                     | FK  source_ticket |  | FK  actor_id      |                  |
|                                     |     event_type    |  |     event_type    |                  |
|                                     |     visual_badge  |  |     change_payload|                  |
|                                     |     audio_priority|  |     created_at    |                  |
|                                     |     unread_state  |  +-------------------+                  |
|                                     |     created_at    |                                         |
|                                     +-------------------+                                         |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Table Specifications

### 2.1 Table: `users`
Menyimpan identitas terautentikasi dan role pengguna di dalam organisasi.

| Column Name | Physical Data Type | Constraints | Default Value | Description & Domain Rules |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique user identifier. |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | None | Full display name of the user. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | None | Corporate email identity. |
| `role` | `VARCHAR(20)` | `NOT NULL, CHECK (role IN ('Employee', 'IT Staff'))` | None | Strictly enforces the two V1 roles *(FR-02)*. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `CURRENT_TIMESTAMP` | Record creation timestamp. |

---

### 2.2 Table: `tickets`
Tabel transaksi utama yang mengelola insiden IT, status lifecycle, priority, dan catatan penyelesaian.

| Column Name | Physical Data Type | Constraints | Default Value | Description & Domain Rules |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique ticket reference code. |
| `reporter_id` | `UUID` | `NOT NULL, FK -> users(id)` | None | ID of the Employee/Staff who reported the incident. |
| `assignee_id` | `UUID` | `NULLABLE, FK -> users(id)` | `NULL` | ID of the assigned IT Staff. Null until assignment. |
| `summary` | `VARCHAR(150)` | `NOT NULL` | None | Short problem summary (Min 5 chars). |
| `description` | `TEXT` | `NOT NULL` | None | Detailed problem description. |
| `priority` | `VARCHAR(15)` | `NULLABLE, CHECK (priority IN ('Low', 'Medium', 'High'))` | `NULL` | Priority level. Null until Initial Assessment *(FR-07)*. |
| `status` | `VARCHAR(30)` | `NOT NULL, CHECK (status IN ('Report', 'Notification', 'Operational Queue', 'Initial Assessment', 'Assignment', 'In Progress', 'Resolution', 'Employee Notification', 'Verification', 'Closed'))` | `'Report'` | Tracks ticket position along 10 Canonical Stages *(FR-11)*. |
| `impact_metadata` | `VARCHAR(50)` | `NULLABLE, CHECK (impact_metadata IN ('Individual', 'Departmental', 'Organization-Wide'))` | `NULL` | Passive secondary metadata (Option A): `Individual`, `Departmental`, `Organization-Wide`. |
| `resolution_notes` | `TEXT` | `NULLABLE` | `NULL` | Fix explanation. **Mandatory** on stage `Resolution`. |
| `verification_feedback` | `TEXT` | `NULLABLE` | `NULL` | Employee feedback. **Mandatory** on Dispute. |
| `verification_started_at` | `TIMESTAMPTZ` | `NULLABLE` | `NULL` | Timestamp when stage `Verification` begins. Drives 48h auto-close timer (Option 2). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `CURRENT_TIMESTAMP` | Incident creation timestamp. |
| `closed_at` | `TIMESTAMPTZ` | `NULLABLE` | `NULL` | Timestamp when status reaches `Closed`. |

---

### 2.3 Table: `notifications`
Menyimpan indikator notifikasi visual badge dan audio context berbasis persistent unread state.

| Column Name | Physical Data Type | Constraints | Default Value | Description & Domain Rules |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique notification ID. |
| `target_user_id` | `UUID` | `NOT NULL, FK -> users(id)` | None | Recipient user ID. |
| `source_ticket_id` | `UUID` | `NOT NULL, FK -> tickets(id) ON DELETE CASCADE` | None | Associated ticket ID. |
| `event_type` | `VARCHAR(50)` | `NOT NULL` | None | Event code (e.g., `EVENT_TICKET_CREATED`, `EVENT_RESOLVED`). |
| `visual_badge_active`| `BOOLEAN` | `NOT NULL` | `TRUE` | `TRUE` = Active visual badge in UI header. |
| `audio_priority_context` | `VARCHAR(15)` | `NULLABLE, CHECK (audio_priority_context IN ('Low', 'Medium', 'High'))` | `NULL` | Priority sound context. Null if unassessed. |
| `persistent_unread_state` | `VARCHAR(15)` | `NOT NULL, CHECK (persistent_unread_state IN ('unread', 'read'))` | `'unread'` | **Persistent Unread State** across sessions *(FR-15)*. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `CURRENT_TIMESTAMP` | Alert creation timestamp. |

---

### 2.4 Table: `ticket_history`
Menyimpan rekam jejak audit log kronologis kejadian pada tiket insiden (Append-Only).

| Column Name | Physical Data Type | Constraints | Default Value | Description & Domain Rules |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | `gen_random_uuid()` | Unique history entry ID. |
| `ticket_id` | `UUID` | `NOT NULL, FK -> tickets(id) ON DELETE CASCADE` | None | Target ticket ID. |
| `actor_id` | `UUID` | `NOT NULL, FK -> users(id)` | None | User ID of the actor performing the action. |
| `event_type` | `VARCHAR(50)` | `NOT NULL` | None | Event code (e.g., `PRIORITY_ASSESSED`, `TICKET_ASSIGNED`). |
| `change_payload` | `JSONB` | `NOT NULL` | `{}` | Stores old vs new values or text notes payload. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | `CURRENT_TIMESTAMP` | Event timestamp. |

---

## 3. Database Indexes for Performance Optimization

Untuk menjamin efisiensi query pada antrean operasional (*Operational Queue*) dan panel notifikasi, indeks berikut dispesifikasikan:

```sql
-- Index for Employee Personal Dashboard (Query tickets reported by specific Employee)
CREATE INDEX idx_tickets_reporter_id ON tickets (reporter_id);

-- Index for IT Staff Operational Queue (Query active unresolved tickets)
CREATE INDEX idx_tickets_status_active ON tickets (status) WHERE status != 'Closed';

-- Index for Assigned IT Staff (Query tickets assigned to specific IT Staff)
CREATE INDEX idx_tickets_assignee_id ON tickets (assignee_id) WHERE assignee_id IS NOT NULL;

-- Index for Persistent Unread Notifications (Query unread badges by Target User)
CREATE INDEX idx_notifications_unread ON notifications (target_user_id, persistent_unread_state);

-- Index for Ticket Audit Log Timeline (Query chronological history by Ticket ID)
CREATE INDEX idx_ticket_history_timeline ON ticket_history (ticket_id, created_at ASC);

-- Index for Verification Auto-Close Evaluator (Query tickets pending verification)
CREATE INDEX idx_tickets_verification_timeout ON tickets (verification_started_at) WHERE status = 'Verification';
```

---

## 4. Integrity Constraints & Business Triggers

### 1. Clear Ownership Constraint:
Sistem menolak transisi status tiket ke `In Progress` jika `assignee_id IS NULL`.

### 2. Append-Only History Constraint:
Tabel `ticket_history` secara ketat tidak mengizinkan perintah `UPDATE` atau `DELETE`. Hanya operasi `INSERT` yang diizinkan.

### 3. Read-Only Closed Ticket Constraint:
Saat `status == 'Closed'`, seluruh kolom pada baris tiket tersebut dikunci dari modifikasi data.

### 4. Verification 48-Hour Auto-Close Policy (Option 2):
Tiket yang berada pada stage `Verification` selama lebih dari 48 jam (`verification_started_at < NOW() - INTERVAL '48 HOURS'`) berhak ditutup otomatis oleh sistem ke status `Closed` dengan pencatatan event audit `VERIFICATION_AUTO_CLOSED`.

---

## Technical Summary

Dokumen `database-schema.md` ini berhasil mentranslasikan **Model Logis Phase 5 & 6** menjadi **Spesifikasi Skema Basis Data Relasional**:
1. Memetakan 4 entitas utama menjadi tabel `users`, `tickets`, `notifications`, dan `ticket_history`.
2. Menentukan tipe data fisik, kunci utama (`PRIMARY KEY`), kunci asing (`FOREIGN KEY`), dan batasan `CHECK`.
3. Menyediakan strategi pengindeksan (*indexes*) untuk mengoptimalkan performa Operational Queue dan Unread Notifications.
4. Mengunci batasan integritas data (*Clear Ownership*, *Append-Only History*, dan *Read-Only Closed State*).
