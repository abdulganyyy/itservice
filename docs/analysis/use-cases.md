# SYSTEM ANALYSIS — PHASE 1: DOMAIN & USE CASE ANALYSIS
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved  
**Scope:** Core IT Service (V1)  

---

## 1. System Boundary

System Boundary mendefinisikan batasan tegas antara apa yang menjadi tanggung jawab internal IT Service Platform (**Inside System Boundary**) dan apa yang berada di luar kontrol atau operasional platform (**Outside System Boundary**).

```
+-----------------------------------------------------------------------------------+
| OUTSIDE SYSTEM BOUNDARY                                                           |
|                                                                                   |
|  +-------------------+        +-------------------+        +-------------------+  |
|  | Phone Calls /     |        | Physical Walk-up  |        | Direct Chat /     |  |
|  | Direct Voice      |        | Interactions      |        | Messaging Apps    |  |
|  +-------------------+        +-------------------+        +-------------------+  |
|            │                            │                            │            |
|            └────────────────────────────┼────────────────────────────┘            |
|                                         ▼ (Manual entry via Quick Ticket)         |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | INSIDE SYSTEM BOUNDARY (Internal IT Service Platform V1)                    |  |
|  |                                                                             |  |
|  |  +-----------------------+   +------------------------+                     |  |
|  |  | Self-Service Engine   |   | Quick Ticket Engine    |                     |  |
|  |  +-----------------------+   +------------------------+                     |  |
|  |              │                            │                                 |  |
|  |              └───────────────┬────────────┘                                 |  |
|  |                              ▼                                              |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | Operational Queue & Lifecycle Management Engine (10 Canonical Stages) |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                              │                                              |  |
|  |              ┌───────────────┴────────────┐                                 |  |
|  |              ▼                            ▼                                 |  |
|  |  +-----------------------+   +------------------------+                     |  |
|  |  | Notification System   |   | Traceable History Log  |                     |  |
|  |  | (Visual + Sound Alert)|   | (Chronological Events) |                     |  |
|  |  +-----------------------+   +------------------------+                     |  |
|  +-----------------------------------------------------------------------------+  |
|                                         ▲                                         |
|                                         │ (Authentication & Boundary Rules)       |
|  +--------------------------------------+--------------------------------------+  |
|  | External Identity Provider / User Authentication Authority                  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Inside System Boundary (Apa yang ada di dalam Sistem):
1. **Self-Service Incident Reporting:** Antarmuka dan logika pembuatan tiket mandiri oleh Employee.
2. **Quick Ticket Logging:** Mechanism pembuatan record cepat oleh IT Staff tanpa mengganggu immediate response.
3. **Centralized Operational Queue:** Queue bersama yang menampilkan seluruh insiden aktif/unresolved bagi IT Staff.
4. **Lifecycle & State Machine Engine:** Pengelolaan transisi status insiden sepanjang 10 canonical stages (`Report` hingga `Closed`).
5. **Assessment & Priority Engine:** Logika penilaian dan penetapan Priority oleh IT Staff serta penyimpanan Impact metadata.
6. **Assignment & Ownership Tracking:** Pencatatan dan pembaruan kepemilikan tiket (assignee).
7. **Notification Engine:** Generasi dan penyajian visual alert (badges/banners), pemutaran priority-differentiated sound alerts, dan pengelolaan persistent unread state.
8. **Verification & Dispute Engine:** Pengelolaan tahapan konfirmasi dan feedback dari Employee sebelum closure.
9. **Traceable History Engine:** Pencatatan kronologis kejadian/perubahan pada tiket.

### Outside System Boundary (Apa yang ada di luar Sistem):
1. **Channel Komunikasi Informal:** Obrolan telepon langsung, percakapan walk-up, atau pesan chat pribadi (komunikasi ini terjadi di luar sistem, lalu di-input ke sistem via Quick Ticket).
2. **Sistem Autentikasi Pengguna Primer:** Identity Provider perusahaan yang melakukan autentikasi kredensial (sistem hanya menerima identitas pengguna yang terverifikasi dan role-nya).
3. **Hardware / Asset Physical Inventory (V1):** Pengelolaan fisik barang IT, garansi, atau spesifikasi perangkat lunak (ditunda ke Roadmap Phase 1: Asset Management).
4. **Pengiriman Notifikasi Eksternal (Email/SMS/Slack):** Komunikasi eksternal di luar in-app visual/audio alert berada di luar core V1 dan secara resmi ditangguhkan ke Roadmap V2 (Opsi A).

---

## 2. Actors

Sistem secara ketat hanya mengenal **TEPAT DUA (2) Human Actors** dan **SATU (1) Automated System Actor**.

```
+-----------------------------------------------------------------------------------+
| ACTORS IN V1 SYSTEM                                                               |
+-----------------------+-----------------------+-----------------------------------+
| Employee (Human)      | IT Staff (Human)      | System (Automated Process)        |
| - Submits problems    | - Assesses incidents  | - Triggers visual & sound alerts  |
| - Tracks progress     | - Sets Priority       | - Manages persistent unread state |
| - Verifies resolution | - Logs Quick Tickets  | - Enforces state transitions      |
| - Views own history   | - Resolves & assigns  | - Logs historical event records   |
+-----------------------+-----------------------+-----------------------------------+
```

### 1. Employee (Human Actor)
* **Definisi:** Karyawan internal perusahaan yang mengalami masalah IT atau membutuhkan bantuan teknis.
* **Tanggung Jawab Operasional:** Melaporkan insiden secara akurat melalui Self-Service, memantau perkembangan status tiket secara mandiri, serta melakukan verifikasi (konfirmasi/dispute) setelah IT Staff menyelesaikan pekerjaan.
* **Batasan Role:** Employee **TIDAK BISA** menentukan Priority, tidak dapat mengakses Operational Queue milik IT Staff, dan tidak dapat mengubah state tiket secara langsung selain melalui aksi Verification.

### 2. IT Staff (Human Actor)
* **Definisi:** Personel operasional IT yang bertugas mengevaluasi, mengelola, mengerjakan, dan menyelesaikan insiden IT perusahaan.
* **Tanggung Jawab Operasional:** Mengakses Operational Queue, membuat Quick Ticket atas nama Employee saat menerima laporan langsung/telepon, melakukan Initial Assessment, menentukan/menyesuaikan Priority, mengambil/mengalokasikan ownership (assignee), memperbarui progress kerja, serta mencatat deskripsi solusi (resolution notes).
* **Batasan Role:** Memegang seluruh kapabilitas operasional IT dalam V1 (tidak ada hierarki Admin/Triage terpisah).

### 3. System (Automated System Actor)
* **Definisi:** Komponen internal platform yang mengeksekusi logika otomatis berdasarkan kejadian (*events*) dan aturan bisnis (*business rules*).
* **Tanggung Jawab Operasional:** Memvalidasi batasan transisi status (*state invariants*), membangkitkan visual dan audio notifications saat event terjadi, menjaga *persistent unread state*, serta secara otomatis mencatat setiap event penting ke dalam *Traceable History Record*.

---

## 3. Use Case Inventory

Berikut adalah daftar lengkap Use Case yang mencakup seluruh cakupan produk V1 Core IT Service.

| ID | Use Case Name | Primary Actor | Purpose | Trigger | Preconditions | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Submit Self-Service Incident | Employee | Melaporkan masalah IT secara mandiri via platform. | Employee mengklik tombol "Report IT Problem". | Employee terautentikasi ke dalam platform. | Tiket baru dibuat (Stage: `Report`), notifikasi dipicu, dan masuk ke Operational Queue. |
| **UC-02** | Create Quick Ticket | IT Staff | Mencatat insiden atas nama Employee secara cepat tanpa mengganggu respon teknis langsung. | IT Staff menerima telepon, walk-up, atau pesan mendesak dari Employee. | IT Staff terautentikasi ke dalam platform. | Tiket insiden minimal berhasil dibuat dan masuk ke workflow operasional. |
| **UC-03** | View Operational Queue | IT Staff | Memantau seluruh insiden perusahaan yang aktif/unresolved dalam satu tampilan terpusat. | IT Staff membuka dasbor/navigasi Operational Queue. | IT Staff terautentikasi. | Sistem menampilkan daftar seluruh tiket aktif beserta status, priority, reporter, dan assignee. |
| **UC-04** | Perform Initial Assessment & Set Priority | IT Staff | Mengevaluasi konteks masalah dan menetapkan/menyesuaikan tingkat Priority tiket. | IT Staff memilih tiket pada stage `Operational Queue` / `Initial Assessment`. | Tiket berada pada stage yang memungkinkan assessment; user adalah IT Staff. | Priority tiket ditetapkan (`Low`/`Medium`/`High`), Impact metadata opsional dicatat, event dicatat di history. |
| **UC-05** | Assign Ticket Ownership | IT Staff | Menetapkan IT Staff yang bertanggung jawab atas pengerjaan tiket (*clear ownership*). | IT Staff mengambil tiket (*self-assign*) atau mengalokasikannya ke rekan IT Staff. | Tiket belum memiliki assignee atau butuh re-assignment; user adalah IT Staff. | Field Assignee diperbarui, status berpindah ke `In Progress`, dan event dicatat di history. |
| **UC-06** | Update Progress & Work Notes | IT Staff | Mencatat catatan perkembangan pengerjaan teknis pada tiket. | IT Staff menambahkan catatan kerja pada tiket yang sedang dikerjakan. | Tiket berada pada status `In Progress`; user adalah IT Staff. | Work notes tersimpan pada tiket dan dapat dilihat oleh Employee & IT Staff. |
| **UC-07** | Record Incident Resolution | IT Staff | Mencatat detail solusi teknis yang telah diterapkan dan menyelesaikan pengerjaan. | IT Staff menyelesaikan tindakan perbaikan dan mengklik "Submit Resolution". | Tiket dalam status `In Progress`; resolution notes wajib diisi. | Tiket berpindah ke stage `Resolution`, notifikasi dikirim ke Employee, dan stage siap menuju `Verification`. |
| **UC-08** | Perform Employee Verification | Employee | Mengonfirmasi perbaikan insiden (Accept) atau mengajukan penolakan/sanggahan (Dispute). | Employee menerima notifikasi penyelesaian dan membuka halaman detail tiket. | Tiket berada pada stage `Verification`; user adalah reporter (Employee). | Jika Accepted: tiket berpindah ke `Closed`. Jika Disputed: tiket kembali ke `In Progress` ter-assign ke IT Staff sebelumnya. |
| **UC-09** | Receive & Manage Notifications | Employee / IT Staff | Menerima alert visual badge dan sound alert (sesuai Priority) serta mengelola unread state. | Terjadi event pada tiket yang relevan dengan actor (pembuatan, perubahan status/priority, resolusi). | User terautentikasi dan memiliki sesi UI aktif. | Alert visual ditampilkan, sound dimainkan (jika priority ada), dan unread state bertahan lintas sesi. |
| **UC-10** | View Incident History & Traceability | Employee / IT Staff | Melihat rekam jejak kronologis kejadian dan perubahan pada tiket. | User membuka tab/halaman "History Log" pada detail tiket atau tiket histori. | User terautentikasi (Employee hanya melihat tiket miliknya; IT Staff melihat seluruh tiket). | Sistem menampilkan garis waktu (*timeline*) kronologis seluruh event pada tiket. |

---

## 4. Use Case Relationships

Diagram berikut menggambarkan hubungan keterkaitan logis (`include`, `extend`, dan `dependency`) antar Use Case utama.

```
                                      ┌────────────────────────┐
                                      │    UC-09: Receive &    │
                                      │  Manage Notifications  │
                                      └────────────────────────┘
                                                   ▲
                                                   │ <<include>> (Fired on key events)
  ┌──────────────────────────┐                    │
  │ UC-01: Submit Self-      │─────────────────────┤
  │ Service Incident         │                     │
  └──────────────────────────┘                     │
               │                                   │
               │ <<dependency>> (Feeds queue)      │
               ▼                                   │
  ┌──────────────────────────┐                     │
  │ UC-03: View Operational  │                     │
  │ Queue                    │                     │
  └──────────────────────────┘                     │
               ▲                                   │
               │ <<dependency>> (Feeds queue)      │
               │                                   │
  ┌──────────────────────────┐                     │
  │ UC-02: Create Quick      │─────────────────────┤
  │ Ticket                   │                     │
  └──────────────────────────┘                     │
                                                   │
  ┌──────────────────────────┐                     │
  │ UC-04: Perform Initial   │─────────────────────┤
  │ Assessment & Set Priority│                     │
  └──────────────────────────┘                     │
               │                                   │
               │ <<dependency>> (Enables Assignment)
               ▼                                   │
  ┌──────────────────────────┐                     │
  │ UC-05: Assign Ticket     │─────────────────────┤
  │ Ownership                │                     │
  └──────────────────────────┘                     │
               │                                   │
               │ <<dependency>> (Precedes Work)    │
               ▼                                   │
  ┌──────────────────────────┐                     │
  │ UC-07: Record Incident   │─────────────────────┼──────────────────────────────┐
  │ Resolution               │                     │                              │
  └──────────────────────────┘                     │                              │
               │                                   │                              │
               │ <<dependency>> (Triggers Verification)                           │
               ▼                                   │                              │
  ┌──────────────────────────┐                     │                              │
  │ UC-08: Perform Employee  │─────────────────────┘                              │
  │ Verification             │                                                    │
  └──────────────────────────┘                                                    │
               │                                                                  │
               │ <<include>> (All events write to history)                        │
               └──────────────────────────────────────────────────────────────────┼────────┐
                                                                                  │        │
                                                                                  ▼        ▼
                                                                     ┌──────────────────────────┐
                                                                     │  UC-10: View Incident    │
                                                                     │   History & Traceability │
                                                                     └──────────────────────────┘
```

### Penjelasan Logika Keterkaitan (Why):
1. **`<<include>>` UC-09 (Notifications):** Setiap eksekusi Use Case pembuatan tiket (UC-01, UC-02), penilaian priority (UC-04), assignment (UC-05), resolusi (UC-07), dan verifikasi (UC-08) **secara otomatis memicu** eksekusi notifikasi sistem (Visual & Audio Alert) kepada aktor terkait.
2. **`<<include>>` UC-10 (History Log):** Setiap perubahan state atau mutasi data penting pada tiket **secara otomatis mencatat** record sejarah kronologis yang tidak dapat diubah (traceability).
3. **`<<dependency>>` Stream Flow:**
   * **UC-01 & UC-02 → UC-03:** Pelaporan insiden (Self-Service atau Quick Ticket) dibutuhkan agar tiket muncul dan dapat dikelola di Operational Queue.
   * **UC-04 → UC-05:** Assessment dan penetapan Priority melandasi alokasi kerja dan penentuan tingkat urgensi penanganan sebelum dimasukkan ke `In Progress`.
   * **UC-07 → UC-08:** Resolusi oleh IT Staff merupakan prasyarat mutlak sebelum Employee dapat melakukan konfirmasi Verification.

---

## 5. Primary Use Case Descriptions

---

### Use Case UC-01: Submit Self-Service Incident

* **Primary Actor:** Employee
* **Goal:** Melaporkan insiden IT yang dialami secara mandiri ke platform untuk mendapatkan penanganan dari IT Staff.
* **Preconditions:**
  1. Employee telah terautentikasi dan login ke platform.
  2. Employee berada pada halaman reporting Self-Service.
* **Trigger:** Employee mengklik tombol "Report IT Problem" dan mengirimkan formulir laporan.

#### Main Success Flow:
1. Employee membuka formulir *Report IT Problem*.
2. Sistem menyajikan formulir input deskripsi masalah tanpa menyediakan kontrol pemilih Priority. *(Why: Prinsip "Employee Reports, IT Staff Assesses")*.
3. Employee mengisi ringkasan masalah (*summary*) dan deskripsi detail masalah (*description*).
4. Employee mengklik tombol "Submit".
5. Sistem memvalidasi bahwa input yang diwajibkan telah terisi.
6. Sistem membuat record tiket baru dengan ID unik, menetapkan status awal ke `Report`, dan mengasosiasikan Employee sebagai *Reporter*.
7. Sistem mentransisikan tiket ke stage `Notification` dan memicu **UC-09 (Notifications)** untuk memberi tahu IT Staff via visual alert di Operational Queue.
8. Sistem mentransisikan tiket ke stage `Operational Queue`.
9. Sistem mencatat event `TICKET_CREATED_SELF_SERVICE` ke dalam **Traceable History Record**.
10. Sistem menampilkan konfirmasi sukses kepada Employee beserta Ticket ID yang baru dibuat.

#### Alternative Flows:
* **A1: Cancel Reporting:**
  1. Pada langkah 3, Employee memilih untuk membatalkan pengisian form.
  2. Sistem menutup formulir tanpa menyimpan data atau mengubah state sistem.

#### Exception Flows:
* **E1: Validation Error (Missing Required Fields):**
  1. Pada langkah 5, sistem mendeteksi deskripsi atau ringkasan masalah kosong.
  2. Sistem menolak submission, mempertahankan data yang sudah di-input oleh Employee, dan menampilkan pesan kesalahan inline *(misal: "Problem description is required")*.

* **Derived System Behavior:** Pemicuan notifikasi pada pembuatan Self-Service insiden langsung meng-generate record notifikasi dengan state *unread* bagi seluruh anggota IT Staff yang memiliki akses ke Operational Queue.

* **Resolved TBD Specifications:**
  * *TBD Item 5 [RESOLVED - Option B]:* Pre-assessment notification sound behavior (Neutral awareness ping 523.25 Hz C5 100ms untuk sesi IT Staff; silent bagi Employee).

* **Postconditions:**
  * Record tiket baru tersimpan dengan status `Operational Queue`.
  * Visual notification badge aktif pada dasbor IT Staff.
  * Entry history pertama tercatat pada tiket.

---

### Use Case UC-02: Create Quick Ticket

* **Primary Actor:** IT Staff
* **Goal:** Mencatat tiket insiden atas nama Employee secara cepat saat menerima laporan via telepon, pesan mendesak, atau walk-up, tanpa mengganggu respon teknis langsung.
* **Preconditions:**
  1. IT Staff telah terautentikasi dalam platform.
  2. IT Staff sedang berinteraksi langsung atau menerima panggilan dari Employee.
* **Trigger:** IT Staff membuka antarmuka modal/form *Quick Ticket*.

#### Main Success Flow:
1. IT Staff memilih menu/tombol cepat "Quick Ticket".
2. Sistem menampilkan antarmuka Quick Ticket yang ringkas.
3. IT Staff mengidentifikasi Employee (reporter) dan memasukkan ringkasan singkat masalah.
4. IT Staff mengklik "Create Quick Ticket".
5. Sistem memvalidasi ketersediaan input minimum yang diwajibkan.
6. Sistem membuat record tiket insiden baru.
7. IT Staff dapat melanjutkan penanganan teknis tanpa terhalang oleh pengisian form yang rumit *(Why: Prinsip "Respond First, Document Without Blocking")*.
8. Sistem memicu notifikasi relevan dan mencatat event `QUICK_TICKET_CREATED` ke dalam history log.

#### Alternative Flows:
* **A1: Direct Self-Assignment During Quick Ticket:**
  1. Pada langkah 3, IT Staff yang membuat Quick Ticket langsung menetapkan dirinya sendiri sebagai *Assignee*.
  2. Tiket tersimpan dengan status terikat ke IT Staff tersebut.

#### Exception Flows:
* **E1: Unknown Employee Identifier:**
  1. Pada langkah 5, data Employee yang dimasukkan tidak ditemukan dalam sistem.
  2. Sistem memberikan peringatan dan meminta IT Staff memilih Employee yang valid atau memilih opsi pencarian cepat.

* **Resolved TBD Specifications:**
  * *TBD Item 1 [RESOLVED - Option 2]:* Minimum required fields dibakukan menjadi: (1) `Reporter_ID` dan (2) `Summary` (5–150 karakter), dengan fast-overrides opsional: immediate self-assignment toggle, immediate priority selection, dan immediate action note (`description` otomatis diisi sama dengan `summary`).
  * *TBD Item 2 [RESOLVED - Option C]:* Quick Ticket initial workflow state bersifat kondisional: langsung `In Progress` ter-assign ke pembuat jika toggle "Assign to me" aktif, atau masuk `Operational Queue` (unassigned) jika nonaktif.

* **Postconditions:**
  * Record tiket resmi tercipta di dalam platform.
  * Dokumentasi insiden berhasil diamankan tanpa menunda respon operasional IT.

---

### Use Case UC-03: View Operational Queue

* **Primary Actor:** IT Staff
* **Goal:** Memantau seluruh insiden perusahaan yang aktif/unresolved dalam satu tampilan terpusat.
* **Preconditions:**
  1. IT Staff telah terautentikasi.
* **Trigger:** IT Staff membuka dasbor/navigasi Operational Queue.

#### Main Success Flow:
1. IT Staff memilih menu "Operational Queue".
2. Sistem mengambil data seluruh tiket yang memiliki status belum `Closed`.
3. Sistem menampilkan daftar tiket terpusat dengan informasi: Ticket ID, Summary, Reporter, Priority, Current Status, Assignee, dan Timestamp.
4. IT Staff dapat memfilter atau mengurutkan tiket berdasarkan Priority, Status, atau Assignee.

#### Exception Flows:
* **E1: Unauthorized Access Attempt:**
  1. User ber-role Employee mencoba mengakses halaman Operational Queue.
  2. Sistem menolak akses dan mengarahkan kembali ke dasbor Employee.

---

### Use Case UC-04: Perform Initial Assessment & Set Priority

* **Primary Actor:** IT Staff
* **Goal:** Mengevaluasi konteks insiden yang dilaporkan dan menetapkan tingkat Priority (`Low`, `Medium`, `High`) serta mengisi metadata Impact pendukung.
* **Preconditions:**
  1. Tiket berada dalam stage `Operational Queue` atau `Initial Assessment`.
  2. User yang mengakses adalah IT Staff.
* **Trigger:** IT Staff membuka detail tiket dari Operational Queue untuk melakukan evaluasi awal.

#### Main Success Flow:
1. IT Staff memilih tiket dari Operational Queue.
2. Sistem menampilkan detail laporan insiden yang disampaikan oleh Employee.
3. IT Staff melakukan evaluasi dampak operasional dan urgensi teknis.
4. IT Staff memilih tingkat Priority (`Low`, `Medium`, atau `High`).
5. (Opsional) IT Staff memilih nilai metadata Impact pendukung (`Individual`, `Departmental`, `Organization-Wide`, default `NULL`) untuk kebutuhan analitik di masa depan.
6. IT Staff mengonfirmasi penataan Priority.
7. Sistem meng-update nilai Priority tiket dan mentransisikan lifecycle ke stage `Assignment`.
8. Sistem mencatat event `PRIORITY_ASSESSED` (beserta nilai lama dan nilai baru) ke dalam **Traceable History Record**.
9. Sistem memicu **UC-09 (Notifications)** dengan *Priority Context* yang baru ditetapkan, sehingga mengaktifkan audio alert dengan karakteristik suara yang sesuai dengan Priority tersebut.

#### Alternative Flows:
* **A1: Priority Re-adjustment (Priority Shift During Work):**
  1. Tiket sudah berada pada stage `In Progress`.
  2. IT Staff menemukan bahwa insiden ternyata memiliki kompleksitas/dampak lebih tinggi dari perkiraan awal.
  3. IT Staff memperbarui Priority dari `Medium` ke `High`.
  4. Sistem memperbarui Priority, mencatat event `PRIORITY_ADJUSTED` di history, dan membangkitkan notifikasi suara dengan karakteristik High Priority.

#### Exception Flows:
* **E1: Unauthorized Assessment Attempt:**
  1. User ber-role Employee mencoba mengakses endpoint/kontrol penetapan Priority.
  2. Sistem menolak aksi, mengembalikan pesan kesalahan otorisasi, dan mencatat security violation attempt.

* **Derived System Behavior:** Penetapan Priority merupakan syarat mutlak agar sistem dapat memainkan suara notifikasi yang ter-diferensiasi (*Priority-Differentiated Sound Alerts*).

* **Resolved TBD Specifications:**
  * *TBD Item 3 [RESOLVED - Option B]:* Priority sound specifications dibakukan menggunakan Web Audio API: Low = 440Hz (180ms), Medium = 587.3Hz -> 880Hz (260ms), High = 880Hz -> 1046.5Hz -> 1318.5Hz (350ms).
  * *TBD Item 10 [RESOLVED - Option A]:* Impact metadata values dibakukan menjadi 3-tier ITIL scope: `Individual` (Single User / Workstation), `Departmental` (Team / Specific Business Unit), dan `Organization-Wide` (Enterprise / Core Infrastructure Outage), dengan default `NULL` (opsional, non-blocking).

* **Postconditions:**
  * Field Priority tiket terisi dengan sah.
  * Notifikasi suara berbasis priority diaktifkan untuk event selanjutnya pada tiket ini.

---

### Use Case UC-05: Assign Ticket Ownership

* **Primary Actor:** IT Staff
* **Goal:** Menetapkan IT Staff yang bertanggung jawab atas pengerjaan tiket (*clear ownership*).
* **Preconditions:**
  1. Tiket berada pada stage `Assignment` atau `In Progress`.
  2. User yang mengakses adalah IT Staff.
* **Trigger:** IT Staff memilih aksi *Assign to Me* atau memilih anggota IT Staff dari daftar penugasan.

#### Main Success Flow:
1. IT Staff membuka detail tiket.
2. IT Staff memilih opsi penugasan (Self-assign atau Assign to Peer).
3. IT Staff mengonfirmasi penugasan.
4. Sistem memperbarui data Assignee pada tiket.
5. Sistem mentransisikan status tiket dari `Assignment` ke `In Progress`.
6. Sistem mencatat event `TICKET_ASSIGNED` ke dalam **Traceable History Record**.
7. Sistem memicu **UC-09 (Notifications)** untuk memberi tahu Assignee yang ditunjuk (jika di-assign ke peer).

#### Alternative Flows:
* **A1: Take Over Active Ticket (Option B):**
  1. Tiket sudah berada pada status `In Progress` dengan penugasan ke Staf B.
  2. Staf A membuka tiket dan mengeklik tombol "Take Over Ticket".
  3. Sistem meminta konfirmasi serah terima singkat (opsional: handover note).
  4. Sistem memperbarui Assignee menjadi Staf A, mencatat event `TICKET_REASSIGNED` (memuat old assignee dan new assignee), dan mengirimkan notifikasi ke Staf B.
* **A2: Release Ticket Back to Operational Queue:**
  1. IT Staff memilih aksi "Release" pada tiket aktif.
  2. Sistem mengosongkan Assignee (`assignee_id = NULL`), mengembalikan tiket ke status `Operational Queue`, dan mencatat event `TICKET_RELEASED` ke audit history.

---

### Use Case UC-06: Update Progress & Work Notes

* **Primary Actor:** IT Staff
* **Goal:** Mencatat catatan perkembangan pengerjaan teknis pada tiket.
* **Preconditions:**
  1. Tiket berada dalam status `In Progress`.
  2. User adalah IT Staff.
* **Trigger:** IT Staff menambahkan catatan kerja pada tiket.

#### Main Success Flow:
1. IT Staff membuka detail tiket `In Progress`.
2. IT Staff memasukkan catatan perbaikan/perkembangan terbaru pada kolom *Work Notes*.
3. IT Staff mengklik "Save Progress".
4. Sistem menyimpan catatan perkembangan dan memperbarui timestamp aktivitas.
5. Sistem mencatat event `WORK_NOTE_ADDED` pada **Traceable History Record**.
6. Progress update dapat dipantau oleh Employee via dasbor (*Prinsip: Employee Progress Visibility*).

* **Derived System Behavior:** Catatan kerja (*Work Notes*) bersifat strictly *append-only* dan *immutable*. Setiap penambahan catatan mencatat identitas author (`author_id = current_user.id`) dan timestamp. Tidak ada staf yang dapat mengedit atau menghapus catatan kerja rekan lain maupun miliknya sendiri (Opsi B).

---

### Use Case UC-07: Record Incident Resolution

* **Primary Actor:** IT Staff
* **Goal:** Mencatat detail solusi teknis yang telah diterapkan dan menyelesaikan pengerjaan.
* **Preconditions:**
  1. Tiket berada dalam status `In Progress`.
  2. Tiket memiliki Assignee aktif, dan user yang mengeksekusi resolusi adalah Assignee tersebut (`ticket.assignee_id == current_user.id`) sesuai prinsip *Single Clear Ownership* (Opsi B).
* **Trigger:** IT Staff mengklik tombol "Resolve Ticket" atau "Submit Resolution".

#### Main Success Flow:
1. IT Staff membuka tiket yang sedang dikerjakannya (`In Progress`).
2. IT Staff memilih aksi *Record Resolution*.
3. Sistem menyajikan input teks *Resolution Notes*.
4. IT Staff menginput penjelasan detail mengenai langkah perbaikan yang telah dilakukan.
5. IT Staff mengklik "Submit Resolution".
6. Sistem memvalidasi bahwa *Resolution Notes* tidak kosong.
7. Sistem memperbarui status tiket menjadi `Resolution`.
8. Sistem mentransisikan tiket melalui stage `Employee Notification`.
9. Sistem memicu **UC-09 (Notifications)** untuk mengirimkan visual alert dan notification event kepada Employee (Reporter).
10. Sistem mentransisikan status tiket secara otomatis ke stage `Verification`.
11. Sistem mencatat event `RESOLUTION_SUBMITTED` beserta rincian catatan solusi ke dalam **Traceable History Record**.

#### Exception Flows:
* **E1: Empty Resolution Notes:**
  1. IT Staff mencoba menyimpan resolusi tanpa mengisi catatan penjelasan perbaikan.
  2. Sistem menolak transisi status dan menampilkan peringatan: *"Resolution notes are mandatory before marking ticket as resolved"*.

* **E2: Non-Assignee Peer Attempts Resolution (Option B):**
  1. Anggota IT Staff yang bukan Assignee resmi membuka tiket rekan dan mencoba mencatat resolusi.
  2. Sistem membatasi formulir resolusi pada UI dan menyajikan tombol primer *"Take Over Ticket"*.
  3. Pengguna wajib melakukan pengalihan kepemilikan (*Take Over*) terlebih dahulu sebelum diizinkan mengisi dan men-submit *Resolution Notes*.

* **Postconditions:**
  * Tiket berpindah dari `In Progress` ke `Verification`.
  * Employee menerima notifikasi visual bahwa insiden telah diselesaikan oleh IT Staff.
  * Tiket menunggu konfirmasi verifikasi dari Employee.

---

### Use Case UC-08: Perform Employee Verification

* **Primary Actor:** Employee
* **Goal:** Mengonfirmasi bahwa solusi dari IT Staff telah menyelesaikan masalah (*Accept*) atau menyatakan masalah masih terjadi (*Dispute*).
* **Preconditions:**
  1. Tiket berada dalam stage `Verification`.
  2. User yang mengakses adalah Employee yang melaporkan insiden (*Reporter*).
* **Trigger:** Employee membuka tiket dari notifikasi penyelesaian atau dasbor personal.

#### Main Success Flow (Accepted Resolution):
1. Employee melihat rincian *Resolution Notes* yang ditulis oleh IT Staff.
2. Employee menguji/memeriksa kembali perangkat/layanan IT yang sebelumnya bermasalah.
3. Employee mengonfirmasi bahwa masalah telah teratasi dan memilih aksi **"Confirm & Close" (Accept)**.
4. (Opsional) Employee memberikan feedback singkat.
5. Sistem memperbarui status tiket menjadi `Closed`.
6. Sistem mencatat event `VERIFICATION_ACCEPTED` dan `TICKET_CLOSED` ke dalam **Traceable History Record**.
7. Tiket terkunci dari perubahan operasional lebih lanjut dan masuk ke dalam arsip histori.

#### Alternative Flows (Disputed Resolution & Inactivity Timeout):
* **A1: Dispute Resolution (Issue Still Persists):**
  1. Pada langkah 3, Employee menemukan bahwa masalah belum teratasi sepenuhnya dan memilih aksi **"Issue Still Persists" (Dispute)**.
  2. Sistem mewajibkan Employee memasukkan alasan/feedback penolakan (*Dispute Feedback*).
  3. Employee mengklik "Submit Dispute".
  4. Sistem mencatat event `VERIFICATION_DISPUTED` beserta feedback ke dalam **Traceable History Record**.
  5. Sistem memicu **UC-09 (Notifications)** untuk memberi tahu IT Staff (Assignee) bahwa resolusi ditolak.
  6. Sistem mengembalikan status tiket ke `In Progress` dengan kepemilikan tetap pada IT Staff penanggung jawab sebelumnya.
* **A2: 48-Hour Inactivity Auto-Close (Option 2):**
  1. Tiket berada di stage `Verification` selama 48 jam tanpa adanya respons konfirmasi dari Employee.
  2. Sistem otomasi mengeksekusi penutupan otomatis tiket menuju status `Closed`.
  3. Sistem mencatat event `VERIFICATION_AUTO_CLOSED` (`{"trigger": "48H_TIMEOUT", "actor": "SYSTEM_AUTOMATION"}`) ke **Traceable History Record**.
  4. Sistem mengirimkan notifikasi penutupan informatif kepada Employee.

#### Exception Flows:
* **E1: Non-Reporter Verification Attempt:**
  1. User Employee lain (bukan reporter tiket tersebut) mencoba mengklik aksi verifikasi.
  2. Sistem menolak otorisasi aksi dan menampilkan pesan bahwa verifikasi hanya dapat dilakukan oleh pelapor insiden.

* **Resolved TBD Specifications:**
  * *TBD Item 4 [RESOLVED - Option 1]:* Verification dispute destination dibakukan kembali ke `In Progress` dengan kepemilikan dipertahankan pada IT Staff penanggung jawab sebelumnya.
  * *TBD Item 8 [RESOLVED - Option 2]:* Unresponsive Employee verification behavior dibakukan dengan automated 48-hour auto-close window.

* **Postconditions:**
  * Jika Accept / 48h Inactivity Timeout: Tiket resmi berada pada status final `Closed`.
  * Jika Dispute: Tiket kembali masuk ke workflow penanganan IT Staff dengan catatan dispute.

---

### Use Case UC-09: Receive & Manage Notifications

* **Primary Actor:** Employee, IT Staff, System
* **Goal:** Menyajikan peringatan visual (*visual badge/banner*) dan audio alert berbasis priority secara andal, serta mempertahankan kondisi unread (*persistent unread state*) hingga diproses.
* **Preconditions:** User terautentikasi dan memiliki sesi UI aktif di platform.
* **Trigger:** Terjadi kejadian berstatus notifikasi (misal: tiket baru, perubahan priority, tiket di-assign, resolusi selesai, atau dispute).

#### Main Success Flow:
1. System Actor mendeteksi adanya event perubahan pada tiket.
2. Sistem mengidentifikasi target penerima notifikasi (*Recipient Binding*).
3. Sistem membuat record notifikasi baru dengan status `unread`.
4. Sistem memperbarui indikator **Visual Alert Badge** pada header/navigasi UI pengguna penerima.
5. Sistem mengevaluasi apakah tiket telah memiliki tingkat Priority yang dinilai.
6. Jika Priority telah ada (`Low`, `Medium`, atau `High`), sistem memicu pemutaran **Audio Notification Alert** pada browser pengguna dengan karakteristik suara yang sesuai dengan Priority tersebut.
7. Pengguna melihat indikator visual unread.
8. Pengguna menutup browser atau beralih halaman, lalu login kembali di sesi lain.
9. Sistem tetap menampilkan indikator *unread badge* *(Why: Persistent Unread State across sessions)*.
10. Pengguna melakukan aksi interaksi pemrosesan (misal: membuka detail tiket/notifikasi).
11. Sistem mentransisikan status notifikasi dari `unread` ke `read` (Opsi B: melalui klik item drawer, auto-read kontekstual saat tiket dibuka, atau tombol "Mark All Read").

#### Exception Flows:
* **E1: Audio Playback Blocked by Browser Policy:**
  1. Pada langkah 6, kebijakan autoplay browser menahan eksekusi audio sebelum pengguna melakukan interaksi gestur di halaman web.
  2. Sistem menangkap penanganan exception audio, mempertahankan visual alert badge secara utuh, dan memicu audio saat interaksi pertama pengguna terjadi.

* **Resolved TBD Specifications:**
  * *TBD Item 3 [RESOLVED - Option B]:* Priority sound specifications dibakukan (Web Audio API: Low 440Hz, Med 587->880Hz, High 880->1046->1318Hz).
  * *TBD Item 5 [RESOLVED - Option B]:* Pre-assessment notification sound behavior (Neutral awareness ping 523.25 Hz C5 100ms untuk sesi IT Staff; silent bagi Employee).
  * *TBD Item 7 [RESOLVED - Option B]:* Notification read/acknowledged transition triggers (Contextual auto-read pada navigasi tiket, klik item drawer, atau tombol "Mark All Read").
  * *TBD Item 9 [RESOLVED - Option A]:* Notification delivery channels & recipient rules (Murni in-app visual & Web Audio API; external email/Slack ditangguhkan ke Roadmap V2; aturan penerima difinalisasi pada Notification Event Matrix).

* **Postconditions:**
  * Event operasional tersampaikan secara visual dan auditori tanpa ada insiden yang terlewat.

---

### Use Case UC-10: View Incident History & Traceability

* **Primary Actor:** Employee, IT Staff
* **Goal:** Melihat rekam jejak kronologis kejadian dan perubahan pada tiket.
* **Preconditions:** User terautentikasi (Employee hanya melihat tiket miliknya; IT Staff melihat seluruh tiket).
* **Trigger:** User membuka tab/halaman "History Log" pada detail tiket atau tiket histori.

#### Main Success Flow:
1. User mengklik tab "History Log" pada tiket.
2. Sistem mengambil seluruh *History Record* yang terikat pada Ticket ID tersebut.
3. Sistem menyajikan daftar urut kronologis event (*creation*, *priority assessment*, *assignment*, *work notes*, *resolution*, *verification*, *closure*).
4. User dapat melihat siapa actor yang melakukan perubahan, timestamp kejadian, dan payload detail perubahan.

---

## 6. Domain Concepts

Berikut adalah konsep-konsep domain utama (*Domain Concepts*) yang diidentifikasi dari PRD V1.

```
+-----------------------------------------------------------------------------------+
| CONCEPTUAL DOMAIN MODEL OVERVIEW                                                  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------------+         +------------------+         +------------------+  |
|  |       USER       |         | INCIDENT / TICKET|         |   NOTIFICATION   |  |
|  |------------------|         |------------------|         |------------------|  |
|  | - User ID        | 1     * | - Ticket ID      | 1     * | - Notification ID|  |
|  | - Full Name      |<--------| - Title/Summary  |<--------| - Target User ID |  |
|  | - Organizational | (Report)| - Description    |         | - Source TicketID|  |
|  |   Role           |         | - Priority (Assg)|         | - Visual Badge   |  |
|  |   (Employee /    | 1     * | - Impact (Meta)  |         |   State          |  |
|  |    IT Staff)     |<--------| - Status (10Stg) |         | - Audio Priority |  |
|  +------------------+ (Assign)| - Work Notes     |         |   Context        |  |
|                               | - Resolution Note|         | - Persistence    |  |
|                               +------------------+         |   State (Unread) |  |
|                                        │ 1                 +------------------+  |
|                                        │                                          |
|                                        ▼ *                                        |
|                               +------------------+                                |
|                               |  HISTORY RECORD  |                                |
|                               |------------------|                                |
|                               | - History EventID|                                |
|                               | - Event Type     |                                |
|                               | - Actor ID       |                                |
|                               | - Timestamp      |                                |
|                               | - Change Details |                                |
|                               +------------------+                                |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### 1. User (Domain Entity)
* **Makna Bisnis:** Subjek atau individu yang teridentifikasi dalam organisasi yang berinteraksi dengan platform.
* **Attribut Utama:** `User ID`, `Name`, `Email/Identity`, `Role` (`Employee` atau `IT Staff`).
* **Invarian Logis:** Setiap User **wajib** memiliki tepat 1 role yang sah. Tidak ada pengguna tanpa role atau ber-role ganda.

### 2. Incident / Ticket (Core Domain Entity)
* **Makna Bisnis:** Entitas utama yang merepresentasikan suatu masalah atau kebutuhan bantuan layanan IT yang dilaporkan dan membutuhkan tindakan operasional IT.
* **Attribut Utama:** `Ticket ID`, `Summary`, `Description`, `Reporter ID` (User), `Assignee ID` (User - optional), `Current Status` (Lifecycle State), `Priority` (Value), `Impact Metadata` (Optional Value), `Resolution Notes`, `Creation Timestamp`, `Closure Timestamp`.
* **Invarian Logis:** Every ticket must have a clear Reporter. Every active ticket in `In Progress` must have an assigned IT Staff owner (*Clear Ownership*). Ticket status transitions must follow the strict lifecycle logic.

### 3. Priority (Domain Value / Attribute)
* **Makna Bisnis:** Klasifikasi tingkat urgensi dan dampak operasional dari suatu insiden yang ditentukan **khusus oleh IT Staff**.
* **Nilai Terdefinisi:** `Low`, `Medium`, `High`.
* **Semantik Domain:** Priority mengendalikan diferensiasi suara notifikasi (*Priority-Differentiated Sound Alert*) dan urutan prioritas penanganan pada Operational Queue.

### 4. Status / Lifecycle Stage (Domain State Attribute)
* **Makna Bisnis:** Indikator posisi insiden dalam alur kerja operasional 10 tahapan kanonikal (`Report`, `Notification`, `Operational Queue`, `Initial Assessment`, `Assignment`, `In Progress`, `Resolution`, `Employee Notification`, `Verification`, `Closed`).
* **Semantik Domain:** Mengontrol aksi apa yang boleh dilakukan dan siapa aktor yang berhak mengeksekusi aksi pada stage tersebut.

### 5. Assignment (Domain Relationship / State)
* **Makna Bisnis:** Ikatan akuntabilitas operasional antara sebuah tiket insiden dengan seorang personel IT Staff.
* **Semantik Domain:** Menjamin bahwa tiket yang sedang dikerjakan tidak menjadi "piatu" (*orphaned ticket*) dan memiliki penanggung jawab yang jelas.

### 6. Notification (Domain Entity / Event Alert)
* **Makna Bisnis:** Rekaman kejadian peringatan yang ditujukan kepada pengguna spesifik mengenai pembaruan status insiden.
* **Attribut Utama:** `Notification ID`, `Recipient ID`, `Source Ticket ID`, `Event Type`, `Visual Alert State` (active/cleared), `Audio Alert Triggered` (boolean), `Persistent Unread State` (`unread` / `read`).
* **Semantik Domain:** Notification adalah *domain behavior* yang berdiri sendiri. Unread state wajib bertahan (*persistent*) melintasi sesi login pengguna sampai ada tindakan interaksi yang sah.

### 7. Verification (Domain Process / Sub-State)
* **Makna Bisnis:** Tahap konfirmasi kelayakan perbaikan oleh Employee sebelum tiket insiden diarsipkan secara permanen.
* **Semantik Domain:** Mencegah IT Staff menutup tiket secara sepihak tanpa persetujuan atau pengujian dari pihak pelapor.

### 8. History Record (Domain Audit Event Entity)
* **Makna Bisnis:** Catatan kejadian kronologis yang menyimpan rekam jejak perubahan status, penetapan priority, reassignment, dan catatan perbaikan pada tiket.
* **Attribut Utama:** `History ID`, `Ticket ID`, `Actor ID`, `Event Type`, `Change Payload` (Previous Value vs New Value), `Timestamp`.
* **Semantik Domain:** Menyediakan *traceability* operasional agar seluruh riwayat penanganan insiden dapat ditelusuri kembali di masa depan.
