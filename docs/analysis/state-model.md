# SYSTEM ANALYSIS — PHASE 3: STATE MACHINE & LIFECYCLE ANALYSIS
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. Domain Concept Separation: Ticket State vs Notification State

> [!WARNING]
> **PENTING — Pemisahan Tiga Konsep State yang Sering Tercampur:**
> Sebelum mendesain State Machine, kita harus secara eksplisit membedakan 3 konsep state di dalam sistem ini:
> 1. **Ticket Lifecycle State:** Status operasional dari tiket insiden itu sendiri (misal: `Operational Queue`, `In Progress`, `Verification`, `Closed`).
> 2. **Notification Event:** Kejadian pemicu yang memancar (*fired event*) saat terjadi perubahan pada tiket (misal: `EVENT_RESOLUTION_SUBMITTED`).
> 3. **Notification Record State:** Status dari rekaman notifikasi di sisi pengguna (misal: `unread` vs `read`).
>
> Ketiganya **BUKAN** konsep yang sama dan tidak boleh disatukan menjadi satu variabel tunggal.

```
+---------------------------------------------------------------------------------------------------+
| THREE DISTINCT STATE DOMAINS                                                                      |
+------------------------------------+----------------------------------+---------------------------+
| TICKET LIFECYCLE STATE             | NOTIFICATION EVENT               | NOTIFICATION RECORD STATE |
+------------------------------------+----------------------------------+---------------------------+
| Position of ticket in operational  | Instantaneous event fired on     | Persistence state of user |
| workflow (10 Canonical Stages).    | state changes or key updates.    | alert (Persistent unread).|
| Example: 'In Progress'             | Example: 'EVENT_PRIORITY_SET'    | Example: 'unread' / 'read'|
+------------------------------------+----------------------------------+---------------------------+
```

---

## 2. Canonical 10-Stage Ticket Lifecycle Overview

PRD mendefinisikan kanonikal 10 tahapan lifecycle untuk insiden IT V1 sebagai berikut:

```
 (1) Report ──► (2) Notification ──► (3) Operational Queue ──► (4) Initial Assessment
                                                                          │
                                                                          ▼
 (10) Closed ◄── (9) Verification ◄── (8) Employee Notice ◄── (7) Resolution ◄── (6) In Progress ◄── (5) Assignment
```

### Semantik Detail 10 Tahapan Lifecycle:

| # | Lifecycle Stage Name | Responsible Actor | Meaning / Domain Purpose | Entry Condition | Exit Condition |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | `Report` | Employee / IT Staff | Tiket baru saja disubmit; record awal telah dibuat di sistem. | Form disubmit via Self-Service atau Quick Ticket. | Record ID & Metadata dasar berhasil disimpan. |
| **2** | `Notification` | System | Pemicuan alert visual awal dan penyiapan event notifikasi ke IT Staff. | Tiket berhasil dibuat di stage `Report`. | Alert record tercipta di database. |
| **3** | `Operational Queue` | System / IT Staff | Tiket berada di antrean bersama (*shared queue*) menunggu evaluasi IT Staff. | Alert awal selesai dipicu. | IT Staff membuka tiket untuk evaluasi. |
| **4** | `Initial Assessment` | IT Staff | IT Staff mengevaluasi deskripsi insiden dan menetapkan Priority. | IT Staff memilih tiket dari Operational Queue. | Priority (`Low`/`Med`/`High`) berhasil ditetapkan. |
| **5** | `Assignment` | IT Staff | Menentukan personel IT Staff penanggung jawab (*Assignee*). | Priority telah ditetapkan pada Initial Assessment. | Assignee ID terisi (*Self-assign* / *Peer-assign*). |
| **6** | `In Progress` | IT Staff | Penanganan teknis insiden aktif dilakukan oleh IT Staff assignee. | Ticket ownership / Assignee resmi terisi. | Perbaikan teknis selesai & *Resolution Notes* terisi. |
| **7** | `Resolution` | IT Staff | Perbaikan teknis selesai dan dokumentasi solusi berhasil dicatat. | IT Staff mengklik *Submit Resolution* dengan *Resolution Notes*. | Solusi tersimpan; siap memicu notifikasi ke pelapor. |
| **8** | `Employee Notification` | System | Pemicuan alert visual penyelesaian kepada Employee pelapor. | Tiket berpindah ke status `Resolution`. | Notifikasi penyelesaian berhasil terkirim ke Employee. |
| **9** | `Verification` | Employee / System | Tiket menunggu konfirmasi perbaikan dari Employee (Accept / Dispute) atau batas waktu auto-close 48 jam. | Notifikasi penyelesaian terkirim ke Employee. | Employee mengonfirmasi *Accept*, *Dispute*, atau batas waktu 48 jam terlewati. |
| **10** | `Closed` | System / Employee | Lifecycle insiden selesai; tiket dikunci menjadi *historical record*. | Employee memilih *Confirm & Close* (Accept) atau auto-close 48 jam dieksekusi sistem. | State final (Terminal State). Tidak dapat diubah. |

---

## 3. Formal State Transition Matrix

Tabel berikut menentukan **semua transisi status yang valid dan invalid** di dalam sistem. Transisi apa pun yang tidak tercantum sebagai `VALID` dianggap `INVALID` dan harus ditolak oleh sistem.

| Current State (From) | Target State (To) | Transition Validity | Actor Responsible | Trigger / Guard Condition | System Action & Payload |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Report` | `Notification` | **VALID** | System | Ticket creation form valid & saved. | Generate Ticket ID, set Reporter ID. |
| `Report` (Quick Ticket) | `In Progress` | **VALID** *(Fast-Override)* | IT Staff | IT Staff creates Quick Ticket with "Assign to me immediately" checked. | Assignee ID set to IT Staff; Status set to `In Progress`; logs `QUICK_TICKET_CREATED`. |
| `Notification` | `Operational Queue` | **VALID** | System | Initial notification records created. | Place ticket in shared IT Staff queue list. |
| `Operational Queue` | `Initial Assessment` | **VALID** | IT Staff | IT Staff opens ticket details. | Set status to `Initial Assessment`. |
| `Initial Assessment` | `Assignment` | **VALID** | IT Staff | Priority set to `Low`, `Medium`, or `High`. | Update Priority field; fire Priority Sound Alert. |
| `Assignment` | `In Progress` | **VALID** | IT Staff | Assignee ID is set (Non-null). | Update Assignee ID field. |
| `In Progress` | `Resolution` | **VALID** | IT Staff | Technical fix complete AND `Resolution Notes` non-empty. | Save Resolution Notes. |
| `Resolution` | `Employee Notice` | **VALID** | System | Resolution notes saved. | Trigger notification event to Employee. |
| `Employee Notice` | `Verification` | **VALID** | System | Notification delivered to Employee. | Present Verification buttons on Employee UI; initialize 48h auto-close timer. |
| `Verification` | `Closed` | **VALID** | Employee / System | Employee clicks *Confirm & Close* (Accept) OR 48-Hour Inactivity Timeout expires (Option 2). | Lock ticket record; set Closed Timestamp; log `VERIFICATION_ACCEPTED` or `VERIFICATION_AUTO_CLOSED`. |
| `Verification` | `In Progress` *(Dispute Rework)* | **VALID** | Employee | Employee clicks *Issue Still Persists* AND `Dispute Reason` non-empty. | Save Dispute Feedback; retain previous Assignee ID; set status to `In Progress`; notify IT Staff. |
| `In Progress` | `Assignment` | **VALID** *(Re-assign)* | IT Staff | IT Staff re-assigns ticket to peer. | Update Assignee ID; log reassignment history. |
| `In Progress` | `Initial Assessment` | **VALID** *(Priority Shift)* | IT Staff | IT Staff adjusts Priority level during work. | Update Priority; log `PRIORITY_ADJUSTED`; fire Audio Alert. |
| `Report` | `Closed` | **INVALID** | Any | Illegal jump; violates canonical lifecycle. | Reject transition (`400 Bad Request`). |
| `Operational Queue` | `Closed` | **INVALID** | Any | Cannot close ticket without assessment & resolution. | Reject transition (`400 Bad Request`). |
| `In Progress` | `Closed` | **INVALID** | Any | Cannot bypass `Resolution` and `Verification`. | Reject transition (`400 Bad Request`). |
| `Closed` | Any State | **INVALID** | Any | Terminal state; closed tickets are locked forever. | Reject transition (`400 Bad Request`). |

---

## 4. State Invariants & Guard Conditions

State Invariants adalah aturan kebenaran mutlak (*absolute truth rules*) yang harus **SELALU** dipertahankan oleh sistem di setiap state. Guard Conditions adalah kondisi yang wajib dipenuhi **SEBELUM** transisi status diizinkan terjadi.

```
+---------------------------------------------------------------------------------------------------+
| CORE STATE INVARIANTS & GUARDS                                                                    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ INVARIANT 1: Clear Ownership Invariant ]                                                       |
|  IF Ticket Status == 'In Progress' THEN Assignee ID MUST NOT BE NULL.                             |
|                                                                                                   |
|  [ INVARIANT 2: Verified Resolution Invariant ]                                                   |
|  No ticket can reach 'Closed' status without passing through 'Verification' stage.               |
|                                                                                                   |
|  [ INVARIANT 3: Mandatory Resolution Notes Guard ]                                               |
|  Transition ('In Progress' -> 'Resolution') REJECTED IF Resolution Notes is EMPTY.               |
|                                                                                                   |
|  [ INVARIANT 4: Mandatory Dispute Reason Guard ]                                                  |
|  Transition ('Verification' -> Dispute State) REJECTED IF Dispute Reason is EMPTY.                |
|                                                                                                   |
|  [ INVARIANT 5: Terminal Closed State Invariant ]                                                 |
|  ONCE Ticket Status == 'Closed', NO FURTHER FIELD MUTATIONS ARE PERMITTED.                        |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Penjelasan Logis Invariabel & Guard Conditions:

1. **Clear Ownership Invariant (Guard pada Stage `In Progress`):**
   * *Logika:* Sistem tidak mengizinkan tiket berada pada status `In Progress` jika kolom `Assignee ID` kosong.
   * *Why:* Prinsip *"Clear Ownership"* — Setiap pekerjaan teknis yang aktif harus memiliki penanggung jawab yang jelas dari IT Staff.

2. **Verified Resolution Invariant (Guard pada Stage `Closed`):**
   * *Logika:* Transisi langsung dari `Report`, `Operational Queue`, atau `In Progress` ke `Closed` secara mutlak dilarang. Satu-satunya jalan menuju `Closed` adalah melalui stage `Verification` (baik dikonfirmasi langsung oleh Employee via *Confirm & Close*, maupun ditutup otomatis oleh sistem setelah masa tenggang verifikasi 48 jam terlewati tanpa tanggapan — Opsi 2).
   * *Why:* Prinsip *"Employee Verification"* — IT Staff tidak boleh menutup tiket secara sepihak dan setiap tiket wajib melalui masa evaluasi verifikasi.

3. **Mandatory Resolution Notes Guard (Guard pada Stage `Resolution`):**
   * *Logika:* Saat IT Staff mentransisikan tiket dari `In Progress` ke `Resolution`, sistem memeriksa ketersediaan teks `Resolution Notes`. Jika kosong, transisi dibatalkan dan sistem mengembalikan inline validation error.
   * *Why:* Menjamin bahwa Employee menerima penjelasan konkret mengenai apa yang telah diperbaiki sebelum mereka melakukan verifikasi.

4. **Mandatory Dispute Reason Guard (Guard pada Stage `Dispute`):**
   * *Logika:* Saat Employee memilih *Issue Still Persists* pada stage `Verification`, sistem mengecek kolom `Dispute Reason`. Transisi ditolak jika Employee tidak memberikan alasan mengapa masalah dianggap belum selesai.
   * *Why:* IT Staff membutuhkan umpan balik yang jelas untuk melakukan perbaikan lanjutan tanpa menduga-duga.

5. **Terminal Locked State Invariant:**
   * *Logika:* Setelah tiket mencapai status `Closed`, seluruh atribut tiket (Summary, Priority, Assignee, Resolution Notes, dll.) dikunci secara permanen menjadi *Read-Only*.
   * *Why:* Menjaga integritas data historis (*Traceable History*).

---

## 5. Analysis of Unresolved TBD Lifecycle Boundaries

Berikut adalah analisis eksplisit terhadap konsekuensi logis dari keputusan TBD pada State Machine:

### 5.1 TBD Item 2: Quick Ticket Initial Workflow State Boundary [RESOLVED — Option C: Conditional State Entry]

Keputusan alur masuk awal untuk Quick Ticket telah dibakukan menggunakan **Option C (Conditional / Context-Driven State Entry Model)** yang selaras dengan kontrol UI Reference:

```
[ Quick Ticket Submitted by IT Staff ]
                  │
        ┌─────────┴─────────────────────────────────┐
        ▼ (Checkbox "Assign to me" CHECKED)         ▼ (Checkbox UNCHECKED)
[ Direct In-Progress Entry ]               [ Standard Queue Entry ]
- Status: 'In Progress'                    - Status: 'Operational Queue'
- Assignee: IT Staff Pembuat               - Assignee: NULL (Unassigned)
- Priority: Pill Terpilih (atau Medium)    - Priority: NULL (Awaiting Assessment)
- Masuk daftar kerja aktif staf pembuat    - Masuk antrean bersama untuk seluruh tim
```

#### Implikasi Sistemik yang Dibakukan:
* **Jika Checkbox Aktif (Default Penanganan Langsung):** Tiket melompati antrean unassigned dan langsung berstatus `In Progress` dengan `assignee_id = auth.uid()`. Hal ini mematuhi prinsip *"Respond first, document without blocking"* dan tetap memenuhi *Clear Ownership Invariant*.
* **Jika Checkbox Nonaktif (Pencatatan untuk Tim):** Tiket masuk ke `Operational Queue` sebagai tiket `unassigned` menunggu penilaian awal (*Initial Assessment*) oleh staf yang tersedia.

> **Status Analisis:** **RESOLVED — Option C**. State machine secara resmi mendukung kedua cabang transisi awal sesuai input modal Quick Ticket.

---

### 5.2 TBD Item 4: Verification Dispute Destination State Boundary [RESOLVED — Option 1: Direct Rework to 'In Progress']

Keputusan alur dispute verifikasi telah dibakukan menggunakan **Option 1 (Direct Rework Model)**:

```
[ Verification Stage: Employee Clicks 'Issue Still Persists' ]
                             │
                             ▼ (Dispute Reason Mandatory Non-Empty)
[ Return Directly to 'In Progress' State ]
- Target Status: 'In Progress'
- Ownership: Retained by previous IT Staff Assignee (assignee_id unchanged)
- Data Mutation: verification_feedback = Dispute Reason
- Event Fired: EVENT_RESOLUTION_DISPUTED
- Notification: High-priority visual badge & audio alert dispatched to previous Assignee
```

#### Implikasi Sistemik yang Dibakukan:
* **Preservasi Konteks:** Staf IT penanggung jawab sebelumnya langsung menerima kembali tiket tanpa kehilangan riwayat investigasi dan konfigurasi teknis yang telah dicoba.
* **Kepatuhan Invariant:** Memenuhi *Clear Ownership Invariant* karena `assignee_id` tetap valid tidak kosong.
* **Penyelarasan UI Reference:** 100% selaras dengan alur pada modal `employee_portal_dispute_resolution_modal` dan detail tiket `employee_portal_ticket_detail_verification`.

> **Status Analisis:** **RESOLVED — Option 1**. State machine secara resmi mengunci transisi `Verification -> In Progress (Retained Assignee)` saat dispute terjadi.

### 5.3 TBD Item 8: Unresponsive Employee Verification Behavior [RESOLVED — Option 2: Automated 48-Hour Auto-Close Window]

Untuk mencegah terjadinya penumpukan tiket kedaluwarsa (*zombie tickets*) di antrean dan menjaga akurasi pelaporan SLA/MTTR, perilaku verifikasi saat Employee tidak merespons dibakukan menggunakan **Opsi 2**:

```
[ Ticket Enters 'Verification' Stage ]
                  │
                  ▼ (Initialize 48-Hour Inactivity Timer)
         ┌────────┴───────────────────────────────────────────────────────┐
         │                                                                │
         ▼ (Employee Acts within 48h)                                     ▼ (No Response after 48h)
[ Accept -> Closed ] OR [ Dispute -> In Progress ]             [ System Automation Auto-Closes Ticket ]
                                                               - Status: 'Closed'
                                                               - Closed Timestamp: NOW()
                                                               - History Event: VERIFICATION_AUTO_CLOSED
                                                               - Informational Closure Notice to Employee
```

#### Implikasi Sistemik yang Dibakukan:
* **Kepatuhan Invariant 2:** Tiket tetap melewati stage `Verification` secara penuh selama masa tenggang 48 jam; penutupan dipicu oleh kedaluwarsanya masa evaluasi.
* **Penyelarasan UI Reference:** 100% selaras dengan artefak `it_staff_incident_history_traceability_archive/code.html` yang mencatat `"Persistent verification badge pushed to employee portal view with 48h auto-close timer initialized."`
* **Integritas Audit:** Event audit `VERIFICATION_AUTO_CLOSED` mencatat detail pemicu otomasi sistem secara transparan.

> **Status Analisis:** **RESOLVED — Option 2**. State machine secara resmi mengizinkan transisi `Verification -> Closed` via pemicu otomasi 48 jam.

### 5.4 TBD Item 12: Ticket Re-opening Policy [RESOLVED — Option 1: Strictly Final / Immutable Closed State]

Kebijakan pembukaan kembali tiket setelah mencapai stage `Closed` dibakukan secara tegas menggunakan **Option 1 (Strictly Final & Immutable Closed State — Always Create New Ticket)**:

```
[ Ticket Reaches 'Closed' State ]
               │
               ▼
[ Permanently Locked & Immutable (Read-Only) ]
- Transisi Keluar: INVALID (Semua transisi dari 'Closed' ditolak dengan 400 Bad Request)
- Invariant 5 Terpenuhi: Tidak ada mutasi field apa pun yang diizinkan
- Reopened Tickets: TIDAK DIDUKUNG di V1 (Zero Zombie Cycles)
- Masalah Berulang (Recurring): Employee wajib membuat tiket baru melalui shortcut "Report Recurring Issue"
```

#### Implikasi Sistemik yang Dibakukan:
* **Kepatuhan Invariant 5:** Menegakkan aturan mutlak bahwa tiket yang telah `Closed` tidak dapat diubah kembali.
* **Integritas Metrik & Audit:** Riwayat insiden dan metrik penyelesaian (MTTR) tetap murni, terisolasi, dan tidak terdistorsi oleh siklus pembukaan ulang sepihak.
* **UX Shortcut:** Detail tiket tertutup menyediakan tombol pintas pelaporan insiden baru dengan referensi teks otomatis ke tiket lama.

> **Status Analisis:** **RESOLVED — Option 1**. State machine secara resmi mengunci stage `Closed` sebagai terminal sink absolut tanpa siklus kembali.

---

## Technical Summary Phase 3

Pada Phase 3 ini, State Machine & Lifecycle Analysis telah berhasil dirumuskan secara formal:
1. **Domain Separation:** Memisahkan secara tegas antara *Ticket Lifecycle State* (10 Stages), *Notification Event*, dan *Notification Record State* (`unread`/`read`).
2. **Canonical Lifecycle & State Matrix:** Menyediakan matriks transisi status yang valid dan mengeksplisitkan transisi yang invalid untuk mencegah *illegal state jumps*.
3. **Guards & Invariants:** Mengunci aturan keselamatan sistem (*Clear Ownership*, *Verified Resolution*, *Mandatory Notes Guards*, dan *Terminal Locked Closed State*).
4. **Pembakuan Batasan Lifecycle [All Resolved]:** Quick Ticket initial entry dibakukan (Option C), Dispute destination dibakukan (Option 1), Unresponsive Employee verification auto-close dibakukan (Option 2), dan Ticket Re-opening dibakukan (Option 1).
