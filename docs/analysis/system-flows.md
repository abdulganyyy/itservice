# SYSTEM ANALYSIS — PHASE 2: DETAILED USER & SYSTEM FLOWS
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. Flow Overview & Taxonomy

V1 Core IT Service terdiri dari 4 Alur Utama (*Core Flows*) dan 2 Mekanisme Sistem Lintas-Fungsi (*Cross-Cutting Mechanisms*):

```
+---------------------------------------------------------------------------------------------------+
| V1 CORE SYSTEM FLOWS                                                                              |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ FLOW 1: Employee Self-Service Incident Reporting & Progress Tracking ]                         |
|  Employee Reports -> Visual Alert Fired -> IT Staff Receives Queue Item -> Employee Tracks Status |
|                                                                                                   |
|  [ FLOW 2: IT Staff Quick Ticket Creation & Urgent Response ]                                    |
|  Phone/Walk-up Call -> Minimal Logging (Non-blocking) -> Immediate Responded -> Queue / In-Prog   |
|                                                                                                   |
|  [ FLOW 3: IT Staff Assessment, Priority Setting, Ownership & Resolution ]                        |
|  Queue Item Opened -> Assessment (Priority set) -> Assignment -> In Progress Work -> Resolution   |
|                                                                                                   |
|  [ FLOW 4: Employee Resolution Verification, Dispute & Closure ]                                  |
|  Resolution Notice Fired -> Employee Verification -> Accepted (Closed) OR Disputed (In Progress)  |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
| CROSS-CUTTING SYSTEM MECHANISMS                                                                   |
|  - Persistent Notification Engine (Visual Badges + Audio Alerts)                                  |
|  - Traceable History Audit Log Engine                                                             |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. FLOW 1: Employee Self-Service Reporting & Tracking

Alur ini mengover jalurnya insiden yang dilaporkan secara mandiri oleh Employee melalui platform web, mulai dari pengisian masalah hingga pemantauan perkembangan (*progress tracking*).

### 2.1 User Journey Diagram (Employee Perspective)

```
[ Start: Problem Encountered ]
               │
               ▼
[ Open Platform -> Click "Report IT Problem" ]
               │
               ▼
[ Fill Summary & Description (No Priority Input) ]
               │
               ▼
[ Click "Submit Ticket" ]
               │
               ├─► Validation Error? ──► [ Show Inline Error, Keep Form Data ]
               │
               ▼ (Success)
[ Receive Submission Confirmation & Ticket ID ]
               │
               ▼
[ Redirected to Personal Dashboard / Ticket Detail ]
               │
               ▼
[ Monitor Real-time Progress (View Status, Assignee, Work Notes) without manual pinging ]
```

### 2.2 Detailed Step-by-Step System Sequence Logic

| Step | Initiator / Actor | Action / System Event | System Logic & Validation Rules | Data Mutations & State Changes | Notifications & History Generated |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | Employee | Opens "Report IT Problem" page. | Sistem memeriksa otorisasi role `Employee`. Menampilkan form tanpa kontrol pemilih Priority. | None (Read-only UI rendering). | None. |
| **1.2** | Employee | Fills Summary & Description, clicks "Submit". | Sistem memvalidasi field wajib: Summary (Non-empty) & Description (Non-empty). | None yet. | None yet. |
| **1.3** | System | Validates input payload. | If invalid: Reject submission, return inline validation errors. If valid: Proceed to record creation. | None. | None. |
| **1.4** | System | Creates Incident Record. | Menghasilkan `Ticket ID` unik UUID/Auto-increment. Menjadikan `Reporter ID = Logged-in Employee ID`. | **Status:** `Report`<br>**Priority:** Unassessed (NULL/Unset). | Writes `History Record` (`TICKET_CREATED_SELF_SERVICE`). |
| **1.5** | System | Triggers Initial Notification. | Mentransisikan stage logis ke `Notification`. Membangkitkan record notifikasi untuk seluruh pengguna `IT Staff`. | **Status:** `Notification`. | **Visual Alert:** Unread Badge added to all IT Staff header.<br>**Audio Alert:** Discrete Neutral Ping (523.25 Hz C5, 100ms) for active IT Staff sessions (Option B). |
| **1.6** | System | Transitions Ticket to Queue. | Menempatkan tiket secara otomatis ke dalam Centralized Operational Queue. | **Status:** `Operational Queue`. | Writes `History Record` (`TRANSITION_TO_OPERATIONAL_QUEUE`). |
| **1.7** | Employee | Views Personal Dashboard. | Sistem menyajikan daftar tiket milik Employee beserta status terkini (`Operational Queue`, `In Progress`, dll.), nama IT Staff yang menangani (*Assignee*), dan catatan kerja (*Work Notes*). | None (Read-only query filtered by `Reporter ID`). | Enables Employee self-service progress visibility without pinging IT Staff manually. |

> **Why This Flow Works:**
> Prinsip *"Employee Reports, IT Staff Assesses"* ditegakkan di langkah 1.1 di mana Employee sama sekali tidak diberikan dropdown Priority. Ini mencegah semua Employee menandai tiket mereka sebagai "Urgent/High Priority", sehingga penentuan skala prioritas sepenuhnya objektif di tangan IT Staff.

---

## 3. FLOW 2: IT Staff Quick Ticket Creation & Urgent Response

Alur ini dirancang khusus untuk situasi darurat di mana Employee menghubungi IT Staff melalui saluran luar (telepon, walk-up, pesan singkat), dan IT Staff harus mendokumentasikan insiden tersebut tanpa menunda pertolongan teknis langsung.

### 3.1 User Journey Diagram (IT Staff Perspective)

```
[ Urgent Phone Call / Walk-up Received ]
               │
               ▼
[ IT Staff Begins Technical Assistance / Diagnostics ]
               │
               ▼
[ Open "Quick Ticket" Modal (1-Click Action) ]
               │
               ▼
[ Enter Minimum Info: Reporter Name + Problem Summary ]
               │
               ▼
[ Click "Create Quick Ticket" ]
               │
               ▼
[ Record Saved Instantly (Non-blocking) ]
               │
               ▼
[ IT Staff Continues Technical Resolution ]
```

### 3.2 Detailed Step-by-Step System Sequence Logic

| Step | Initiator / Actor | Action / System Event | System Logic & Validation Rules | Data Mutations & State Changes | Notifications & History Generated |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1** | IT Staff | Clicks "Quick Ticket" global shortcut button. | Sistem menampilkan form modal ringkas (modal dialog) tanpa memuat formulir kompleks. | None (UI rendering). | None. |
| **2.2** | IT Staff | Selects Reporter (Employee) and inputs brief Summary (plus optional fast-overrides). | Form hanya mewajibkan *Minimum Required Fields* (Reporter & Summary) dengan opsi fast-override (Self-Assign, Priority, Work Note) agar pengisian selesai dalam hitungan detik. | None yet. | None. |
| **2.3** | IT Staff | Clicks "Submit Quick Ticket". | Sistem memvalidasi field minimal (Summary min 5 chars, valid Reporter). Field description otomatis di-copy dari summary jika tidak diisi terpisah. | None. | None. |
| **2.4** | System | Saves Quick Ticket Record. | Membikin record tiket dengan `Created_By_Role = IT_Staff` atas nama Reporter yang dipilih. Mengevaluasi toggle "Assign to me". | **Status:** `In Progress` (jika Assign to me checked) atau `Operational Queue` (jika unchecked). | Writes `History Record` (`QUICK_TICKET_CREATED`). |
| **2.5** | System | Evaluates Initial Assignment & Notifications. | Jika toggle aktif: Assignee terisi ID pembuat, priority terisi (atau medium fallback). Notifikasi dikirimkan ke Reporter (Employee) bahwa tiket telah dibuatkan oleh IT. | **Assignee ID:** IT Staff pembuat (jika checked) atau `NULL` (jika unchecked). | **Visual Alert:** Delivered to Employee.<br>**Audio Alert:** Silent (visual confirmation only for Employee). |

> **Derived System Behavior:**
> Pembuatan Quick Ticket harus menjamin *zero form blocking*. Jika koneksi lambat atau data belum lengkap, sistem harus mampu menyimpan draft/minimal record tanpa memutus alur percakapan telepon IT Staff dengan Employee.
>
> **Resolved Product Specifications:**
> * *TBD Item 1 [RESOLVED - Option 2]:* Minimum fields dibakukan menjadi: `Reporter Employee` dan `Incident Summary` (dengan fast-overrides opsional: Self-Assign, Priority, dan Initial Work Note).
> * *TBD Item 2 [RESOLVED - Option C]:* Initial workflow state bersifat kondisional: langsung `In Progress` jika toggle "Assign to me" aktif, atau masuk `Operational Queue` jika nonaktif.

---

## 4. FLOW 3: IT Staff Queue Review, Assessment, Assignment & Resolution

Ini adalah core operational workflow di mana IT Staff mengevaluasi insiden, menetapkan Priority, mengambil alih kepemilikan tiket, mengerjakan perbaikan, dan mencatat penyelesaian.

### 4.1 Sequence Diagram (Queue to Resolution)

```
Employee / System           Operational Queue             IT Staff                Ticket State & History
        │                           │                         │                             │
        │─── 1. Incident Created ──►│                         │                             │
        │                           │─── 2. Visual Alert ────►│                             │ [State: Operational Queue]
        │                           │    & Persistent Unread  │                             │
        │                           │                         │─── 3. Open Ticket ─────────►│
        │                           │                         │    from Queue               │ [State: Initial Assessment]
        │                           │                         │                             │
        │                           │                         │─── 4. Assess Priority ─────►│ [State: Assignment]
        │                           │                         │    (Low/Med/High + Impact)  │ [History: PRIORITY_ASSESSED]
        │                           │                         │                             │ [Sound Fired: Priority Spec]
        │                           │                         │                             │
        │                           │                         │─── 5. Assign Owner ────────►│ [State: In Progress]
        │                           │                         │    (Self or Peer)           │ [History: TICKET_ASSIGNED]
        │                           │                         │                             │
        │                           │                         │─── 6. Save Work Notes ─────►│ [Work Notes Updated]
        │                           │                         │                             │ [History: WORK_NOTE_ADDED]
        │                           │                         │                             │
        │                           │                         │─── 7. Record Resolution ───►│ [State: Resolution]
        │                           │                         │    (Mandatory Resolution)   │ [History: RESOLUTION_SUBMITTED]
        │                           │                         │                             │
        │                           │                         │                             │─── State Auto-Transition:
        │                           │                         │                             │    Resolution ──► Verification
```

### 4.2 Detailed System Interaction Logic

| Step | Actor | System Action / Trigger | Logika Sistem & Aturan Invariabel | Perubahan State & Data | Output Notifikasi & Histori |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1** | IT Staff | Opens Centralized Operational Queue. | Sistem menampilkan seluruh tiket aktif (`Status != Closed`). Mengurutkan secara default berdasarkan creation time / Priority. | None (Read Query). | None. |
| **3.2** | IT Staff | Selects a ticket to conduct `Initial Assessment`. | Sistem mentransisikan tiket ke stage `Initial Assessment`. Membuka kontrol penentuan Priority untuk IT Staff. | **Status:** `Initial Assessment`. | Writes `History Record` (`ASSESSMENT_STARTED`). |
| **3.3** | IT Staff | Selects Priority (`Low` / `Medium` / `High`) & optional Impact metadata. | Sistem mewajibkan pemilihan Priority. Field Impact disimpan sebagai secondary metadata (`Individual` / `Departmental` / `Organization-Wide`, default `NULL`) tanpa escalation logic. | **Priority:** `Low`/`Medium`/`High`<br>**Impact:** `Individual`/`Departmental`/`Organization-Wide`/`NULL`<br>**Status:** `Assignment`. | **History:** `PRIORITY_ASSESSED` (Old Value vs New Value).<br>**Audio Alert:** Plays priority sound (Low: 440Hz, Med: 587->880Hz, High: 880->1046->1318Hz) via Web Audio API. |
| **3.4** | IT Staff | Assigns ticket ownership to self or peer (or takes over active ticket). | Sistem memvalidasi ketersediaan pengguna IT Staff. Menetapkan Assignee untuk menjamin *Clear Ownership*. Rekan kerja dapat mengambil alih (*Take Over*) tiket aktif dengan pencatatan serah terima (Opsi B). | **Assignee ID:** IT Staff User ID.<br>**Status:** `In Progress`. | **History:** `TICKET_ASSIGNED` / `TICKET_REASSIGNED`.<br>**Visual Alert:** Badge updated on Assignee's UI panel. |
| **3.5** | IT Staff | Enters technical progress notes (*Work Notes*). | Sistem mengizinkan penambahan catatan perkembangan secara berulang selama masa pengerjaan teknis. Catatan bersifat append-only dan immutable (Opsi B). | **Work Notes:** Appended with timestamp and IT Staff ID. | **History:** `WORK_NOTE_ADDED`.<br>**Employee View:** Updated on Employee progress dashboard. |
| **3.6** | IT Staff (Assignee) | Clicks "Submit Resolution" and enters Resolution Notes. | Sistem memvalidasi bahwa caller adalah **Assignee aktif** (`ticket.assignee_id == current_user.id`; rekan harus *Take Over* terlebih dahulu) dan *Resolution Notes* **TIDAK BOLEH KOSONG**. | **Resolution Notes:** Text content.<br>**Status:** `Resolution`. | **History:** `RESOLUTION_SUBMITTED`. |
| **3.7** | System | Auto-transitions to Employee Notification & Verification. | Sistem mentransisikan status melalui stage `Employee Notification` secara otomatis menuju stage `Verification`. | **Status:** `Verification`. | **History:** `TRANSITION_TO_VERIFICATION`.<br>**Visual Alert:** Persistent banner/badge delivered to Employee (Reporter). |

> **Edge Case Handling (Priority Shift During Work):**
> Jika pada langkah 3.5 IT Staff menemukan bahwa insiden ternyata lebih parah dari dugaan awal, IT Staff dapat mengubah Priority (misal dari `Low` menjadi `High`). 
> * **Logika Sistem:** Sistem memperbarui atribut Priority, mencatat histori `PRIORITY_ADJUSTED`, dan membangkitkan notifikasi suara dengan karakteristik **High Priority Sound Alert** ke sesi aktif IT Staff.

---

## 5. FLOW 4: Employee Verification, Dispute & Final Closure

Verification adalah *mandatory lifecycle stage* sebelum tiket dapat secara resmi ditutup. Aksi ini memberikan hak penuh kepada Employee untuk mengonfirmasi kelayakan perbaikan atau menolaknya.

### 5.1 User Journey & Alternative Branching Diagram

```
[ Receive Visual Alert: Resolution Ready ]
                    │
                    ▼
[ Employee Opens Ticket Detail ]
                    │
                    ▼
[ Reviews IT Resolution Notes & Tests Fix ]
                    │
                    ├────────────────────────────────────────┐
                    ▼ (Accepted)                             ▼ (Disputed)
[ Click "Confirm & Close" ]              [ Click "Issue Still Persists" ]
                    │                                        │
                    ▼                                        ▼
[ (Optional) Provide Feedback ]          [ MANDATORY: Fill Dispute Reason ]
                    │                                        │
                    ▼                                        ▼
[ System Updates Status to CLOSED ]      [ System Logs Verification Dispute ]
                    │                                        │
                    ▼                                        ▼
[ Ticket Finalized & Archived ]          [ System Transitions to 'In Progress' ]
                                         (Retained Previous Assignee)
                                                             │
                                                             ▼
                                         [ IT Staff Notified via Alert & Sound ]
```

### 5.2 Detailed Step-by-Step System Sequence Logic

| Step | Actor | Action / System Event | Logika Validasi & Aturan Bisnis | Perubahan Data & State | Output Notifikasi & Histori |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4.1** | Employee | Opens ticket in `Verification` stage. | Sistem memeriksa apakah pengguna adalah *Reporter* asli tiket ini. Jika bukan, kontrol verifikasi di-disable. | None (Read Query & Authorization Check). | None. |
| **4.2a** | Employee | **[PATH A: ACCEPT]** Clicks "Confirm & Close". | Employee mengonfirmasi bahwa masalah sudah tuntas. Feedback opsional dapat disertakan. | **Status:** `Closed`.<br>**Closed Timestamp:** Current Time. | **History:** `VERIFICATION_ACCEPTED` & `TICKET_CLOSED`.<br>**Notification:** Visual alert badge cleared. |
| **4.2b** | Employee | **[PATH B: DISPUTE]** Clicks "Issue Still Persists". | Sistem **MEWAJIBKAN** input *Dispute Reason*. Submission ditolak jika kolom alasan penolakan kosong. | **Dispute Feedback:** Text content. | **History:** `VERIFICATION_DISPUTED` (includes dispute notes). |
| **4.2c** | System | **[PATH C: 48H TIMEOUT]** Auto-closes unresponsive ticket. | Jika Employee tidak merespons dalam 48 jam sejak stage Verification dimulai, sistem otomatis menutup tiket (Opsi 2). | **Status:** `Closed`.<br>**Closed Timestamp:** Current Time. | **History:** `VERIFICATION_AUTO_CLOSED` (Trigger: 48h timeout).<br>**Notification:** Informational closure notice to Employee. |
| **4.3b** | System | Processes Dispute Transition. | Sistem mengembalikan tiket ke stage `In Progress` dengan kepemilikan tetap pada staf IT penanggung jawab sebelumnya. | **Status:** `In Progress`.<br>**Assignee ID:** Retained previous assignee.<br>**Verification Feedback:** Saved. | **Visual Alert:** Delivered directly to previous IT Staff Assignee.<br>**Audio Alert:** Priority sound alert fired to IT Staff. |

> **Resolved Product Specifications:**
> * *TBD Item 4 [RESOLVED - Option 1]:* Dispute Destination State dibakukan kembali ke `In Progress` dengan kepemilikan dipertahankan pada IT Staff penanggung jawab sebelumnya.
> * *TBD Item 8 [RESOLVED - Option 2]:* Unresponsive Employee Verification Behavior dibakukan dengan batas waktu otomasi 48 jam (Automated 48-Hour Auto-Close Window). Jika tidak ada konfirmasi atau sanggahan dalam kurun 48 jam, tiket otomatis ditutup ke status `Closed` dengan event `VERIFICATION_AUTO_CLOSED`.

---

## 6. CROSS-CUTTING SYSTEM MECHANISMS

Selain 4 alur utama di atas, terdapat 2 mekanisme logika sistem yang berjalan secara independen di seluruh tahapan lifecycle.

### 6.1 Persistent Notification Engine Logic

Notifikasi bukan sekadar elemen visual, melainkan *domain capability* dengan aturan logika sebagai berikut:

```
[ System Event Occurs (e.g., Ticket Created, Priority Assessed, Resolution Submitted) ]
                                          │
                                          ▼
                      [ Bind Event to Recipient User ID(s) ]
                                          │
                                          ▼
                      [ Create Notification Record in DB ]
                         - Unread State = TRUE
                         - Visual Badge State = ACTIVE
                                          │
                                          ├────────────────────────────────────────┐
                                          ▼                                        ▼
                      [ Render Visual Alert Indicator Badge ]     [ Check Priority Context ]
                      (Persists across reloads & logins)                           │
                                                                                   ├─► Priority Exists? ──► [ Fire Audio Alert (Differs by Priority) ]
                                                                                   │
                                                                                   └─► Unassessed? ──────► [ Discrete Neutral Ping (523 Hz C5, IT Staff only) ]
```

#### Aturan Logika Notifikasi:
1. **Visual Badge Persistence:** Record notifikasi disimpan dengan flag `unread = true`. Selama flag ini bernilai `true`, badge notifikasi pada header UI pengguna akan **tetap muncul**, meskipun pengguna melakukan logout, refresh browser, atau berpindah perangkat *(FR-15)*.
2. **Audio Alert Differentiation:** Suara notifikasi terdiferensiasi berdasarkan Priority (`Low`: 440 Hz, `Medium`: 587->880 Hz, `High`: arpeggio 880->1046->1318 Hz). Untuk insiden baru yang belum dinilai (unassessed pre-priority), sistem memainkan neutral awareness ping (523.25 Hz C5, 100ms) untuk sesi IT Staff, sedangkan sisi Employee hening / silent *(FR-12, FR-13, Option B)*.
3. **Read vs Acknowledged Transition [RESOLVED - Option B]:** Transisi dari `unread` menjadi `read` dipicu melalui 3 mekanisme: (1) Mengklik item notifikasi di drawer (navigasi ke tiket dan mark read), (2) Auto-read kontekstual saat membuka halaman detail tiket terkait dari sumber mana pun (menghapus phantom badge untuk tiket yang sedang dilihat), atau (3) Tombol "Mark All Read" di drawer. Sekadar membuka laci notifikasi tidak menghapus badge. Di database status berupa `unread` vs `read`, sedangkan "Clear Acknowledged" di UI menyembunyikan kartu-kartu yang sudah dibaca dari tampilan laci.
4. **Delivery Channels & Recipient Rules [RESOLVED - Option A]:** Seluruh notifikasi dikirimkan secara mandiri in-app (Visual Header Badge, Contextual Banner, Notification Center Drawer, dan Web Audio API). Kanal eksternal (Email SMTP, Slack, SMS) secara formal ditangguhkan ke Roadmap V2. Aturan pengikatan penerima (Recipient Binding) difinalisasi pada Notification Event Matrix (PRD Sec 22).

### 6.2 Traceable History Audit Log Engine Logic

Setiap event signifikan pada lifecycle tiket mewajibkan pembuatan record histori kronologis yang bersifat *append-only* (tidak dapat diubah atau dihapus).

#### Event Logging Matrix:

| System Event Code | Triggering Action | Captured Payload Metadata | Access Visibility |
| :--- | :--- | :--- | :--- |
| `TICKET_CREATED_SELF_SERVICE` | Employee submits UC-01 | Reporter ID, Initial Summary, Description, Timestamp | Employee & IT Staff |
| `QUICK_TICKET_CREATED` | IT Staff submits UC-02 | Created By IT Staff ID, Reporter ID, Summary, Timestamp | Employee & IT Staff |
| `PRIORITY_ASSESSED` | IT Staff sets UC-04 | IT Staff ID, Priority Value (`Low`/`Med`/`High`), Impact Metadata | Employee & IT Staff |
| `PRIORITY_ADJUSTED` | IT Staff changes Priority | IT Staff ID, Old Priority Value, New Priority Value, Reason | Employee & IT Staff |
| `TICKET_ASSIGNED` | IT Staff assigns UC-05 | Actor ID, Assignee IT Staff ID, Timestamp | Employee & IT Staff |
| `WORK_NOTE_ADDED` | IT Staff updates UC-06 | IT Staff ID, Work Note Text Content, Timestamp | Employee & IT Staff |
| `RESOLUTION_SUBMITTED` | IT Staff resolves UC-07 | IT Staff ID, Resolution Notes Text Content, Timestamp | Employee & IT Staff |
| `VERIFICATION_ACCEPTED` | Employee verifies UC-08 | Employee ID, Confirmation Feedback, Closure Timestamp | Employee & IT Staff |
| `VERIFICATION_DISPUTED` | Employee disputes UC-08 | Employee ID, Dispute Reason Text Content, Timestamp | Employee & IT Staff |

---

## 7. Edge Cases & Exception Flow Matrix

Berikut adalah pemetaan logika sistem saat menghadapi kasus-kasus khusus (*Edge Cases*) yang diidentifikasi pada PRD Section 25 & 26:

| Edge Case / Exception Scenario | System Interaction & Logic Handling | Relevant Decision / Policy Status |
| :--- | :--- | :--- |
| **1. Employee Reports via Self-Service, then immediately calls IT Staff directly.** | IT Staff dapat membuka Operational Queue dan melakukan pencarian berdasarkan nama Employee/Summary. Jika tiket sudah ada di queue, IT Staff mengambil tiket tersebut tanpa perlu membuat Quick Ticket baru (mencegah duplikasi record). | **Workflow Handling:** Standard Queue Lookup *(Confirmed Decision)*. |
| **2. Multiple Rapid Updates by IT Staff before Employee opens notification.** | Sistem memproses setiap event notifikasi secara terurut (*queued events*). Badge visual tetap bernilai `unread`, dan daftar notifikasi menampilkan seluruh rentetan perubahan tanpa menimpa (*overwrite*) event sebelumnya. | **Notification Integrity:** Preserved *(Confirmed Decision)*. |
| **3. Browser Autoplay Restrictions Block Notification Sound.** | Jika browser menahan eksekusi audio otomatis, Sistem menangkap exception JavaScript audio, mempertahankan indikator visual alert badge secara menonjol, dan memainkan nada notifikasi saat pengguna pertama kali berinteraksi (klik) di halaman web. | **Audio Fallback Logic:** Visual Alert Priority *(Confirmed Decision)*. |
| **4. Employee Attempts Unauthorized Access to IT Queue / Assessment API.** | Sistem mengeksekusi role-based guard check. Jika `Role != IT_Staff`, sistem memblokir request, mengembalikan HTTP Status `403 Forbidden`, dan mengarahkan pengguna ke dasbor Employee. | **Security Policy:** Strictly Enforced *(FR-02)*. |

---

## Technical Summary Phase 2

Pada Phase 2 ini, seluruh alur kerja operasional telah diterjemahkan menjadi **logika urutan sistem yang presisi**:
1. **Flow 1 (Self-Service):** Memastikan pembatasan input Priority dari sisi Employee dan generasi visual notification badge ke IT Staff Queue.
2. **Flow 2 (Quick Ticket):** Menjamin alur kerja non-blocking bagi IT Staff saat menerima panggilan mendesak, dengan input minimum reporter & summary (Opsi 2) dan conditional state entry (Opsi C).
3. **Flow 3 (Operational Queue & Assessment):** Memetakan transisi status dari `Operational Queue` → `Initial Assessment` → `Assignment` → `In Progress` → `Resolution` beserta pemicuan suara berbasis Priority.
4. **Flow 4 (Verification & Dispute):** Memetakan alur konfirmasi penyelesaian (Accept) dan alur sanggahan (Dispute) secara eksplisit.
5. **Cross-Cutting Engines:** Mengunci logika *Persistent Visual Badges*, *Priority-Differentiated Sound Triggering*, dan *Append-only Event History Logging*.
