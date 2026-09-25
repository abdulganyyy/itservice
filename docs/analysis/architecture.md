# SYSTEM ANALYSIS — PHASE 7: LOGICAL SYSTEM ARCHITECTURE
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  
**Target Frontend Stack:** React JS + Tailwind CSS + shadcn/ui  

---

## 1. High-Level Architectural Layering

Sistem V1 dibagi menjadi 4 Lapisan Logis (*Logical Layers*) yang terisolasi dengan tanggung jawab yang jelas (*Separation of Concerns*):

```
+---------------------------------------------------------------------------------------------------+
| LOGICAL SYSTEM ARCHITECTURAL LAYERS                                                               |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ LAYER 1: PRESENTATION & USER EXPERIENCE LAYER ]                                               |
|  - Employee Self-Service View      - IT Staff Operational Queue View                              |
|  - Notification Panel & Visual Badges - Priority Audio Alert Player Component                     |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
                                          │
                                          ▼ (Action Calls / Commands)
+---------------------------------------------------------------------------------------------------+
|  [ LAYER 2: APPLICATION & WORKFLOW MANAGEMENT LAYER ]                                            |
|  - Role & Ownership Security Guard Engine                                                         |
|  - 10-Stage Lifecycle State Machine Controller                                                    |
|  - Quick Ticket Non-Blocking Form Engine                                                          |
|  - Resolution & Verification Flow Controller                                                      |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
                                          │
                                          ▼ (Domain Events Fired)
+---------------------------------------------------------------------------------------------------+
|  [ LAYER 3: DOMAIN EVENT & NOTIFICATION ENGINE LAYER ]                                            |
|  - Recipient Binding & Dispatcher                                                                 |
|  - Persistent Unread State Manager                                                                |
|  - Priority-Differentiated Sound Alert Resolver                                                   |
|  - Append-Only History Audit Event Logger                                                         |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
                                          │
                                          ▼ (Persistence Abstraction Calls)
+---------------------------------------------------------------------------------------------------+
|  [ LAYER 4: DATA PERSISTENCE ABSTRACTION LAYER ]                                                 |
|  - Incident Repository Interface      - User & Role Authorization Repository                      |
|  - Notification Repository Interface  - Traceable History Audit Log Repository                    |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Penjelasan Logis Layering:

1. **Layer 1: Presentation & User Experience Layer**
   * Menyajikan antarmuka pengguna yang terisolasi berdasarkan Role (`Employee` vs `IT Staff`) menggunakan **React JS**, styling **Tailwind CSS**, dan komponen **shadcn/ui**. Menangani rendering visual alert badges dan pemutaran priority audio alerts pada sesi UI aktif.
2. **Layer 2: Application & Workflow Management Layer**
   * Otak dari alur kerja operasional. Mengeksekusi 3 lapisan *Security Guard* (Role, Ownership, State), mengontrol transisi 10 canonical stages, dan memvalidasi aturan kebenaran mutlak (*State Invariants*).
3. **Layer 3: Domain Event & Notification Engine Layer**
   * Mengatur pemicuan kejadian (*domain events*). Ketika tiket mengalami perubahan, layer ini menentukan target penerima notifikasi, mengelola *persistent unread state*, dan mencatat log audit ke histori.
4. **Layer 4: Data Persistence Abstraction Layer**
   * Antarmuka penyimpanan data abstrak yang mengisolasi logika aplikasi dari implementasi basis data fisik.

---

## 2. Logical Subsystem & Component Definitions

Berikut adalah 5 Subsistem Logis (*Logical Subsystems*) utama yang menyusun platform V1:

```
+---------------------------------------------------------------------------------------------------+
| LOGICAL SUBSYSTEMS & COMPONENT BOUNDARIES                                                         |
+-------------------+-----------------------------------+-------------------------------------------+
| SUBSYSTEM         | COMPONENT NAME                    | RESPONSIBILITY & LOGICAL BOUNDARY         |
+-------------------+-----------------------------------+-------------------------------------------+
| 1. Incident       | - Self-Service Incident Component | Validates & captures Employee reports.    |
|    Ingestion      | - Quick Ticket Minimal Logger     | Executes rapid non-blocking IT logging.   |
+-------------------+-----------------------------------+-------------------------------------------+
| 2. Queue &        | - Centralized Queue Manager       | Aggregates active unresolved tickets.     |
|    Assignment     | - Ownership & Assignment Engine   | Manages IT Staff assignee bindings.       |
+-------------------+-----------------------------------+-------------------------------------------+
| 3. Lifecycle      | - Canonical State Controller      | Enforces valid 10-stage transitions.      |
|    Engine         | - Assessment & Priority Evaluator | Handles IT Staff priority determination.  |
|                   | - Verification & Dispute Module   | Manages Employee accept/dispute loop.     |
+-------------------+-----------------------------------+-------------------------------------------+
| 4. Persistent     | - Visual Alert Badge Controller   | Manages persistent unread UI badges.      |
|    Notification   | - Priority Audio Sound Dispatcher | Resolves & plays priority-based audio.    |
|                   | - Recipient Binding Engine        | Routes alerts to specific target users.   |
+-------------------+-----------------------------------+-------------------------------------------+
| 5. Traceable      | - Chronological Audit Logger      | Appends immutable event log records.      |
|    History        | - History Timeline Provider       | Serves chronological event streams.       |
+-------------------+-----------------------------------+-------------------------------------------+
```

---

## 3. Event-Driven Inter-Component Communication Flow

Sistem menggunakan alur komunikasi berbasis kejadian (*Event-Driven Architecture*) untuk menjamin bahwa pembaruan tiket secara otomatis memicu notifikasi dan pencatatan audit log tanpa merusak modul utama.

```
[ User Action (e.g., IT Staff Sets Priority to 'High') ]
                           │
                           ▼
          [ Layer 2: Application Workflow Layer ]
          - Evaluates Role Security Guard (Pass)
          - Evaluates State Transition Guard (Pass)
          - Mutates Ticket Entity Priority = 'High', Status = 'Assignment'
                           │
                           ▼
          [ Emit Domain Event: EVENT_PRIORITY_ASSESSED ]
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
[ Layer 3: Notification Engine ]  [ Layer 3: History Audit Logger ]
- Target: Employee & Queue        - Payload: { Old: NULL, New: 'High' }
- Creates Unread Notification     - Writes Immutable History Record
- Triggers HIGH PRIORITY AUDIO
  Sound Alert to Active Sessions
```

### Sequence Interaksi Komponen Logis:
1. **Command Execution:** Aksi pengguna dikirimkan ke *Application Layer*.
2. **Guard Verification:** *Workflow Engine* memvalidasi Role, Ownership, dan State Invariant.
3. **State Mutation:** Tiket diperbarui di penyimpanan data.
4. **Event Dispatching:** Event domain (misal `EVENT_PRIORITY_ASSESSED` atau `EVENT_RESOLUTION_SUBMITTED`) dipancarkan ke bus kejadian.
5. **Notification Handler:** *Notification Engine* menangkap event, meng-generate record *unread notification*, memperbarui badge visual UI, dan memicu audio alert sesuai Priority.
6. **Audit Log Handler:** *History Audit Logger* meng-append catatan riwayat kronologis secara *read-only*.

---

## 4. Non-Functional Architectural Qualities (NFR Execution)

Arsitektur logis V1 secara eksplisit memenuhi 4 kebutuhan non-fungsional utama (*Non-Functional Requirements*):

1. **Persistent Notification Reliability (NFR-02, FR-15):**
   * Arsitektur memisahkan *Notification Record State* ke dalam tabel/penyimpanan terpisah dengan flag `persistent_unread_state`. Status *unread* disimpan di sisi backend/database, sehingga badge visual dijamin **tetap bertahan (*persistent*)** meskipun sesi browser ditutup atau pengguna berganti perangkat.
2. **Non-Blocking Ergonomics (NFR-01, FR-04):**
   * Subsistem *Quick Ticket Ingestion* mengisolasi form dari ketergantungan validasi yang rumit, memungkinkan data tersimpan dalam waktu kurang dari 1 detik tanpa memblokir respon operasional IT Staff.
3. **Traceability & Data Integrity (NFR-07, FR-18):**
   * Subsistem *Traceable History* menerapkan pola *Append-Only Event Store*, menjamin bahwa rekam jejak kejadian tidak dapat dimanipulasi atau dihapus oleh role mana pun.
4. **Role & Resource Authorization Security (NFR-04, FR-02):**
   * Lapisan *Security Guard Engine* diletakkan tepat di depan *Workflow Layer*, memastikan setiap request divalidasi otorisasi role dan kepemilikan sumber dayanya (*Reporter Scoping*) sebelum diproses.

---

## Technical Summary Phase 7

Pada Phase 7 ini, Arsitektur Sistem Logis telah berhasil dirumuskan:
1. **Layering Logis:** Membagi sistem menjadi 4 layer terisolasi (*Presentation*, *Workflow Management*, *Notification Engine*, *Persistence Abstraction*).
2. **Subsistem Logis:** Memetakan 5 subsistem utama beserta batasan tanggung jawab komponennya.
3. **Pola Event-Driven:** Mendesain alur pemicuan *Domain Event* saat terjadi perubahan tiket untuk menggerakkan notifikasi dan history audit log secara otomatis.
4. **Eksekusi NFR:** Menjamin arsitektur logis secara langsung mendukung *Persistent Unread Notifications*, *Non-blocking Quick Tickets*, *Traceable Audit Log*, dan *Strict Dual-Role Security*.
