# SYSTEM ANALYSIS — PHASE 4: PERMISSION & AUTHORIZATION MATRIX
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. Core Authorization Principles & Role Boundaries

```
+-----------------------------------------------------------------------------------+
| STRICT DUAL-ROLE AUTHORIZATION BOUNDARY                                           |
+----------------------------------------+------------------------------------------+
| EMPLOYEE ROLE                          | IT STAFF ROLE                            |
+----------------------------------------+------------------------------------------+
| - Resource Ownership Model             | - Operational Authority Model            |
| - Access scoped ONLY to OWN reported   | - Shared Operational Queue Access        |
|   tickets (Reporter == User ID).       | - Full operational control across all    |
| - Self-Service reporting & tracking.   |   system tickets.                        |
| - Verification authority (Accept/      | - Assessment, Priority, Assignment,      |
|   Dispute resolution).                 |   and Resolution capabilities.           |
+----------------------------------------+------------------------------------------+
| ABSOLUTELY NO ADMIN / TRIAGE / MANAGER ROLE IN V1 SYSTEM ARCHITECTURE             |
+-----------------------------------------------------------------------------------+
```

### Prinsip Utama Otorisasi V1:

1. **Strict Dual-Role Boundary:** Pengguna terautentikasi dievaluasi secara mutlak sebagai `Employee` atau `IT Staff`. Tidak ada role perantara atau super-user Admin.
2. **Reporter Resource Scoping (Employee):** Employee hanya memiliki hak akses *read/verify* terhadap insiden di mana `Reporter ID == Current User ID`. Employee dilarang melihat insiden milik karyawan lain.
3. **Shared Operational Access (IT Staff):** IT Staff memiliki akses operasional ke seluruh tiket insiden di dalam perusahaan melalui Centralized Operational Queue.
4. **Hybrid Collaborative Peer Operations (Option B):** Semua anggota IT Staff memiliki tingkat wewenang operasional yang setara di V1 tanpa hierarki kaku. Setiap staf IT dapat mengambil alih (*Take Over*) atau menugaskan ulang (*Reassign*) tiket dengan pencatatan audit log `TICKET_REASSIGNED`. Catatan kerja (*Work Notes*) bersifat strictly *append-only* dan *immutable*. Pengajuan solusi (*Submit Resolution*) dibatasi secara eksklusif kepada *Active Assignee* (rekan kerja wajib melakukan *Take Over* terlebih dahulu sebelum dapat menyelesaikan tiket).

---

## 2. Action-by-Action Permission Matrix

Tabel berikut memetakan setiap aksi operasional dalam sistem terhadap hak akses role `Employee` dan `IT Staff`, lengkap dengan *Guard Conditions* dan *Lifecycle Scope*-nya.

| Action ID | Action Name | Employee Allowed? | IT Staff Allowed? | Guard Conditions & Authorization Logic | Lifecycle Scope |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **ACT-01** | Submit Self-Service Incident | **YES** | **YES** | Must be authenticated user. Employee sets problem details; cannot set Priority. | `Report` |
| **ACT-02** | Create Quick Ticket | **NO** | **YES** | Restricted to `IT Staff`. Requires minimum fields (Reporter & Summary, plus optional fast-overrides). | `Report` |
| **ACT-03** | View Operational Queue | **NO** | **YES** | Restricted to `IT Staff`. Displays all active, unresolved company tickets. | `Operational Queue` |
| **ACT-04** | Perform Initial Assessment | **NO** | **YES** | Restricted to `IT Staff`. Requires setting Priority (`Low`/`Med`/`High`). | `Initial Assessment` |
| **ACT-05** | Set / Adjust Priority | **NO** | **YES** | Restricted to `IT Staff`. Can be set during Assessment or adjusted in `In Progress`. | `Initial Assessment` / `In Progress` |
| **ACT-06** | Capture Impact Metadata | **NO** | **YES** | Restricted to `IT Staff`. Passive secondary metadata capture (`Individual` / `Departmental` / `Organization-Wide`, default `NULL`). | `Initial Assessment` / `In Progress` |
| **ACT-07** | Assign Ticket Ownership | **NO** | **YES** | Restricted to `IT Staff`. Assignee must be a valid IT Staff user ID. Open to takeover/reassignment by any peer (Option B). | `Assignment` / `In Progress` |
| **ACT-08** | Add / Update Work Notes | **NO** | **YES** | Restricted to `IT Staff`. Appends progress notes to ticket timeline. Strictly append-only & immutable across all staff (Option B). | `In Progress` |
| **ACT-09** | Record Incident Resolution | **NO** | **YES** | Restricted to `IT Staff`. Restricted strictly to active Assignee (peers must Take Over first). *Resolution Notes* MUST NOT be empty (Option B). | `In Progress` -> `Resolution` |
| **ACT-10** | Verify Resolution (Accept) | **YES** *(Scoped)* | **NO** | Restricted to Employee who is the **Reporter** (`Reporter ID == User ID`). | `Verification` -> `Closed` |
| **ACT-11** | Verify Resolution (Dispute) | **YES** *(Scoped)* | **NO** | Restricted to Employee **Reporter**. *Dispute Reason* MUST NOT be empty. | `Verification` -> Dispute State |
| **ACT-12** | View Ticket Details | **YES** *(Scoped)* | **YES** | Employee: Only if `Reporter ID == User ID`. IT Staff: All tickets. | Any Lifecycle Stage |
| **ACT-13** | View Incident History Log | **YES** *(Scoped)* | **YES** | Employee: Own tickets history. IT Staff: All tickets history. | Any Lifecycle Stage |
| **ACT-14** | Receive Visual Alert Badge | **YES** *(Scoped)* | **YES** | Employee: Own ticket updates. IT Staff: Queue & assigned updates. | System-wide |
| **ACT-15** | Hear Priority Audio Alert | **YES** *(Scoped)* | **YES** | Audio plays for assessed Priority (`Low`/`Med`/`High`). Unassessed queue arrival plays neutral ping for IT Staff only (Employee remains silent). | System-wide |
| **ACT-16** | Clear Notification Unread State | **YES** | **YES** | User can only mark OWN notifications as `read` (via drawer click, contextual ticket view, or Mark All Read - Option B). | System-wide |

---

## 3. State-by-State Role Access Matrix

Tabel berikut menunjukkan kapabilitas hak akses masing-masing Role berdasarkan 10 Tahapan Lifecycle Tiket.

| Lifecycle Stage | Employee Access Rights | IT Staff Access Rights | Stage Access Boundary & Invariants |
| :--- | :--- | :--- | :--- |
| **1. Report** | **Create & Submit** (Self-Service) | **Create & Submit** (Quick Ticket) | Form submission phase. Priority field disabled for Employee. |
| **2. Notification** | **Read Notice** (Creation confirm) | **Receive Alert** (New Queue item) | System automated dispatch stage. No manual user edits. |
| **3. Operational Queue** | **NO ACCESS** | **Full Access** (View list & filter) | Centralized view reserved exclusively for IT Staff. |
| **4. Initial Assessment** | **NO ACCESS** | **Full Access** (Evaluate & Set Priority) | Priority determination phase. Reserved for IT Staff. |
| **5. Assignment** | **Read Status** (View pending assign) | **Full Access** (Assign self or peer) | Ownership allocation phase. Assigned IT Staff ID set. |
| **6. In Progress** | **Read-Only Progress Tracking** | **Full Access** (Work notes & Priority shift) | Active technical work. Assignee MUST NOT be null. |
| **7. Resolution** | **Read-Only Resolution Notes** | **Full Access** (Submit resolution notes) | IT Staff documents fix details. Notes mandatory. |
| **8. Employee Notice** | **Receive Resolution Notice** | **Read Status** | System automated notification dispatch to Reporter. |
| **9. Verification** | **Full Access** (Accept or Dispute) | **Read Status** (Awaiting Verification) | Reserved for Reporter Employee to verify fix. |
| **10. Closed** | **Read-Only History Access** | **Read-Only History Access** | Terminal state. Record locked for both roles. |

---

## 4. Granular IT Staff Permission Boundaries [RESOLVED - Option B (Hybrid with Explicit Takeover)]

PRD menetapkan aturan hak akses terperinci antar-rekan IT Staff *(IT Staff Granular Operational Permissions)* dibakukan menggunakan **Opsi B (Hybrid Collaborative Model with Explicit Takeover)**:

```
                           +-------------------------------------------------------+
                           |  IT STAFF GRANULAR OPERATIONAL PERMISSIONS (OPTION B) |
                           +-------------------------------------------------------+
                                                       │
         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
[ Boundary 1: Re-assignment & Takeover ]     [ Boundary 2: Work Note Immutability ]        [ Boundary 3: Resolution Ownership ]
Any IT Staff can Take Over, Reassign to       Any IT Staff can append notes.                Only active Assignee can submit
peer, or Release ticket. Every change         Notes are strictly IMMUTABLE &                resolution. Peers must Take Over
logs TICKET_REASSIGNED audit event.           Append-Only. No edit/delete allowed.          ticket before resolving.
```

### Rincian Aturan Operasional Hak Akses IT Staff:

1. **Re-assignment & Takeover Boundary:**
   * **Unassigned Ticket:** Setiap anggota `IT Staff` dapat mengambil kepemilikan (*Self-Assign*) atau menugaskan tiket ke rekan (*Assign to Peer*).
   * **Active Ticket Assigned to Peer:** Jika tiket sedang dikerjakan Staf B, Staf A **dapat mengambil alih (*Take Over*)** atau mengalihkan ke Staf C (*Reassign Peer*). Sistem memvalidasi aksi, memperbarui `assignee_id`, dan mencatat event audit `TICKET_REASSIGNED` (memuat `old_assignee_id`, `new_assignee_id`, dan handover note).
   * **Release to Queue:** IT Staff dapat melepas kepemilikan kembali ke pool antrean umum (`assignee_id = NULL`), mengembalikan tiket ke status `Operational Queue`.
2. **Work Notes & Priority Shift Boundary:**
   * **Work Notes:** Seluruh IT Staff memiliki hak menambahkan catatan kerja kolaboratif (*append-only*). **Catatan bersifat permanen (*immutable*):** tidak ada IT Staff yang dapat mengubah atau menghapus catatan kerja rekan lain maupun miliknya sendiri.
   * **Priority Shift:** Setiap IT Staff dapat memperbarui tingkat prioritas jika mendapati eskalasi urgensi teknis di lapangan.
3. **Resolution Submission Boundary:**
   * **Assignee Ownership Enforced:** Tombol dan aksi *Submit Resolution* **hanya dapat dieksekusi oleh IT Staff yang saat itu terdaftar sebagai Assignee resmi** (`ticket.assignee_id == current_user.id`).
   * Jika Staf A ingin menyelesaikan tiket milik Staf B yang berhalangan, Staf A harus mengeklik tombol **"Take Over Ticket"** terlebih dahulu. Setelah serah terima kepemilikan tercatat, Staf A dapat mengisi formulir resolusi.
4. **Ticket Closure Boundary:**
   * Penutupan tiket (`Closed`) tetap menjadi domain eksklusif alur verifikasi Employee (atau auto-closure terjadwal sistem). IT Staff tidak dapat mem-bypass proses verifikasi karyawan secara sepihak.

---

## 5. Security Enforcement Layer (Logical Guard Policy)

Untuk menjamin otorisasi dieksekusi dengan aman pada tingkat sistem, setiap request aksi wajib melewati 3 Lapisan Otorisasi (*Authorization Guards*):

```
[ Incoming User Request ]
           │
           ▼
[ Guard 1: Role Verification Check ] ──► (Fail) ──► Return 403 Forbidden (Unauthorized Role)
           │ (Pass)
           ▼
[ Guard 2: Resource Ownership Check ] ──► (Fail) ──► Return 403 Forbidden (Not Resource Owner)
           │ (Pass)
           ▼
[ Guard 3: Lifecycle State Guard ] ────► (Fail) ──► Return 400 Bad Request (Invalid State Action)
           │ (Pass)
           ▼
[ Execute Action & Mutate Data ]
```

### Rincian Lapisan Otorisasi:

1. **Guard 1: Role Verification Check (RBAC Guard)**
   * Memeriksa apakah `User.Role` memiliki izin untuk mengeksekusi `Action_ID` (misal: `ACT-03 Operational Queue` hanya diizinkan jika `Role == IT_Staff`).
2. **Guard 2: Resource Ownership Check (ABAC / Data Scoping Guard)**
   * **Employee:** Sistem memverifikasi `Ticket.Reporter_ID == Current_User_ID` untuk akses detail dan verifikasi.
   * **IT Staff:** Operasional antrean, pembacaan tiket, penambahan work notes, dan penyesuaian priority terbuka untuk seluruh IT Staff. Khusus untuk aksi `ACT-09 (Submit Resolution)`, sistem memverifikasi `Ticket.Assignee_ID == Current_User_ID`. Jika bukan assignee, aksi ditolak dan UI mewajibkan aksi *Take Over* terlebih dahulu (Opsi B).
3. **Guard 3: Lifecycle State Guard (State Machine Guard)**
   * Memeriksa apakah aksi yang diminta sesuai dengan stage tiket saat ini (misal: `ACT-09 Submit Resolution` hanya diizinkan jika status tiket adalah `In Progress`).

---

## Technical Summary Phase 4

Pada Phase 4 ini, Matriks Otorisasi dan Hak Akses telah didefinisikan secara komprehensif:
1. **Dua Role Mutlak:** Menegakkan batasan tegas tanpa membuat role Admin/Triage secara prematur.
2. **Matriks Aksi Terperinci:** Memetakan 16 aksi utama sistem terhadap hak akses role, guard conditions, dan lifecycle scope.
3. **Matriks Akses Berbasis State:** Menyajikan hak akses `Employee` dan `IT Staff` pada 10 tahapan lifecycle insiden.
4. **Granular Permission IT Staff Dibakukan [Option B]:** Menerapkan model kolaboratif hibrida dengan pengalihan terbuka (*Takeover/Reassignment*) dan kepemilikan tunggal pada fase resolusi (*Single Clear Ownership*).
5. **Security Guard Layer:** Memodelkan 3 lapisan evaluasi otorisasi (*Role Guard*, *Resource Ownership Guard*, dan *Lifecycle State Guard*).
