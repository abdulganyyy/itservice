# SYSTEM ANALYSIS — PHASE 9: IMPLEMENTATION PLAN
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved Implementation Roadmap  
**Scope:** Core IT Service (V1)  

---

## 1. Overview & Phased Strategy

Implementation Plan ini dirancang secara sekuensial (berurutan) berdasarkan *Implementation Dependencies* yang telah didefinisikan pada Phase 8 (`technical-mapping.md`). 

Strategi pembangunan dibagi menjadi **8 Fase Eksekusi**, di mana setiap fase memiliki target kapabilitas (*deliverables*), pengujian (*verification milestone*), dan kriteria selesai (*Definition of Done*).

```
+---------------------------------------------------------------------------------------------------+
| PHASED IMPLEMENTATION ROADMAP                                                                     |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ STAGE 1: Environment & Foundation ]                                                            |
|  React JS Vite Init + Tailwind CSS & shadcn/ui Setup + Supabase Client Config + React Router       |
|                                                                                                   |
|  [ STAGE 2: Database Schema & RLS Security Deployment ]                                           |
|  Deploy Tables (users, tickets, notifications, history) + Execute RLS Policies + Seed Data        |
|                                                                                                   |
|  [ STAGE 3: Authentication & Role-Based Layout Shells ]                                           |
|  Auth Context Provider + EmployeeLayout + ITStaffLayout + Protected Routes                        |
|                                                                                                   |
|  [ STAGE 4: Incident Ingestion (Self-Service & Quick Ticket) ]                                    |
|  Self-Service Form (No Priority) + Quick Ticket Modal (Non-blocking)                              |
|                                                                                                   |
|  [ STAGE 5: Centralized Queue & Lifecycle Operations ]                                            |
|  IT Operational Queue + Initial Assessment (Priority Set) + Ownership Assignment + Work Notes     |
|                                                                                                   |
|  [ STAGE 6: Resolution & Employee Verification Loop ]                                             |
|  Resolution Notes Submission + Verification Screen + Confirm & Close / Dispute Handling           |
|                                                                                                   |
|  [ STAGE 7: Persistent Realtime Notifications & Audio Alert Engine ]                              |
|  Supabase Realtime Channel + Persistent Unread Badge + Priority Web Audio API Player              |
|                                                                                                   |
|  [ STAGE 8: Traceable History Audit Log & System Hardening ]                                      |
|  Append-Only History Component + Edge Case Handling + Final End-to-End DoD Validation             |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Detailed Execution Phases & Milestones

---

### STAGE 1: Environment & Project Foundation
* **Goal:** Menyiapkan struktur project frontend React JS, konfigurasi Tailwind CSS, inisialisasi komponen shadcn/ui, dan inisialisasi client Supabase.
* **Tasks:**
  1. Inisialisasi project React JS menggunakan Vite (`npm create vite@latest`).
  2. Setup Tailwind CSS (konfigurasi `tailwind.config.js`, PostCSS, dan direktif `@tailwind`).
  3. Inisialisasi dan konfigurasi component library shadcn/ui (`npx shadcn@latest init` atau setup utility `cn`, Radix UI primitives, `tailwind-merge`, `clsx`, dan styling design tokens).
  4. Instalasi dependency utama: `@supabase/supabase-js`, `react-router-dom`, `lucide-react`, serta komponen dasar shadcn/ui (`button`, `dialog`, `badge`, `card`, `input`, `select`, `textarea`, `alert`).
  5. Membuat modul `src/services/supabaseClient.js`.
* **Deliverable:** Project React JS dengan Tailwind CSS dan shadcn/ui yang dapat dijalankan secara lokal (`npm run dev`) dengan Supabase Client siap pakai.
* **Verification:** Test render komponen shadcn/ui dengan styling Tailwind CSS dan uji konektivitas awal `supabaseClient` ke project Supabase.

---

### STAGE 2: Database Schema & RLS Security Deployment
* **Goal:** Menerapkan skema tabel fisik dan aturan keamanan RLS di Supabase Backend berdasarkan `database-schema.md` & `permissions.md`.
* **Tasks:**
  1. Eksekusi DDL pembuat tabel di Supabase SQL Editor (`users`, `tickets`, `notifications`, `ticket_history`).
  2. Eksekusi RLS Security Policies:
     - Employee Data Isolation (`reporter_id = auth.uid()`).
     - IT Staff Shared Queue Access (`role = 'IT Staff'`).
     - Scoped Notifications (`target_user_id = auth.uid()`).
  3. Memuat data awal (*Seed Data*): 1 User Employee dan 2 User IT Staff untuk testing.
* **Deliverable:** Database Supabase dengan 4 tabel aktif, RLS Policies terpasang, dan Seed Users.
* **Verification:** Uji otorisasi RLS dari Supabase Dashboard / API Client (Employee tidak bisa membaca tiket karyawan lain).

---

### STAGE 3: Authentication & Role-Based Layout Shells
* **Goal:** Membangun alur login dan pembatasan antarmuka navigasi berbasis role menggunakan layout Tailwind CSS dan komponen navigasi shadcn/ui.
* **Tasks:**
  1. Membuat `AuthContext` dan `useAuth` hook untuk mengelola sesi login Supabase Auth.
  2. Membuat `EmployeeLayout` menggunakan Tailwind CSS dan komponen shadcn/ui (Header navigasi Self-Service & Notifications).
  3. Membuat `ITStaffLayout` menggunakan Tailwind CSS dan komponen shadcn/ui (Header navigasi Queue, Quick Ticket Button, & Notifications).
  4. Konfigurasi `ProtectedRoutes` pada React Router berdasarkan `user.role`.
* **Deliverable:** Aplikasi React JS dapat membedakan layar navigasi dengan styling Tailwind CSS dan komponen shadcn/ui setelah login sebagai Employee atau IT Staff.
* **Verification:** Login sebagai Employee menampilkan `EmployeeLayout`; login sebagai IT Staff menampilkan `ITStaffLayout`.

---

### STAGE 4: Incident Ingestion (Self-Service & Quick Ticket)
* **Goal:** Membangun subsistem pelaporan masalah mandiri dan pelaporan telepon instan.
* **Tasks:**
  1. **Self-Service Page (`SelfServiceReportPage.jsx`):**
     - Form input Summary & Description (Priority field **EKSPLISIT DITUTUP/TIDAK ADA**).
     - Submit handler: Membuat record di `public.tickets` (Status: `Report` -> `Operational Queue`).
  2. **Quick Ticket Modal (`QuickTicketModal.jsx`):**
     - Modal dialog ringkas non-blocking menggunakan komponen `Dialog` dari shadcn/ui di `ITStaffLayout`.
     - Input Reporter Name + Summary menggunakan komponen `Input` & `Button` shadcn/ui.
     - Submit handler: Membuat record tiket baru secara instan.
* **Deliverable:** Tiket baru berhasil dibuat via Self-Service maupun Quick Ticket (shadcn/ui modal) dan tersimpan di basis data.
* **Verification:** Tiket yang disubmit muncul di basis data Supabase dengan status `Operational Queue`.

---

### STAGE 5: Centralized Queue & Lifecycle Operations
* **Goal:** Membangun dasbor queue bersama bagi IT Staff, evaluasi Priority, penugasan ownership, dan pembaruan work notes.
* **Tasks:**
  1. **IT Queue View (`ITQueuePage.jsx`):**
     - Menampilkan seluruh tiket aktif (`status != Closed`).
     - Filter berdasarkan Status, Priority, dan Assignee.
  2. **Ticket Detail & Initial Assessment (`TicketDetailPage.jsx`):**
     - Kontrol penetapan Priority (`Low`/`Medium`/`High`) dan optional Impact metadata (`Individual`/`Departmental`/`Organization-Wide`, Option A).
     - Penugasan ownership (*Assignee Selection / Self-Assign*).
     - Input *Work Notes* untuk memperbarui catatan perkembangan perbaikan teknis.
* **Deliverable:** IT Staff dapat melihat antrean, menetapkan Priority, mengambil alih kepemilikan tiket, dan mencatat work notes.
* **Verification:** Penetapan Priority mentransisikan tiket ke stage `Assignment` -> `In Progress` dan mengisi field `assignee_id`.

---

### STAGE 6: Resolution & Employee Verification Loop
* **Goal:** Membangun alur pencatatan solusi oleh IT Staff dan loop verifikasi oleh Employee sebelum closure.
* **Tasks:**
  1. **Resolution Submission:**
     - IT Staff menginput *Resolution Notes* (Mandatory Non-Empty).
     - Transisi status dari `In Progress` -> `Resolution` -> `Verification`.
  2. **Employee Verification View:**
     - Employee pelapor melihat *Resolution Notes* dari IT Staff.
     - Tombol **Confirm & Close (Accept):** Mentransisikan tiket ke `Closed` (Terminal state).
     - Tombol **Issue Still Persists (Dispute):** Meminta *Dispute Reason* (Mandatory Non-Empty) dan mentransisikan kembali ke `In Progress` dengan kepemilikan tetap pada staf IT penanggung jawab sebelumnya.
* **Deliverable:** Siklus lengkap dari resolusi teknis hingga penutupan resmi tiket teruji secara utuh.
* **Verification:** Tiket yang disetujui berpindah ke status `Closed` dan terkunci dari suntingan (*Read-Only*).

---

### STAGE 7: Persistent Realtime Notifications & Audio Alert Engine
* **Goal:** Mengintegrasikan pemicuan notifikasi instan, persistent unread state, dan pemutaran audio berbasis Priority.
* **Tasks:**
  1. **Realtime Subscription (`useNotifications.js`):**
     - Mendengarkan event `INSERT` pada `public.notifications` untuk `target_user_id = auth.uid()`.
  2. **Visual Alert Badges (`NotificationPanel.jsx`):**
     - Indikator unread badge bertanda merah pada header menggunakan komponen `Badge` dari shadcn/ui. Status `unread` bertahan di DB meskipun browser di-refresh.
  3. **Audio Alert Player (`AudioAlertPlayer.jsx`):**
     - Menggunakan Native Web Audio API untuk memainkan nada audio yang ter-diferensiasi berdasarkan Priority (`Low`/`Med`/`High`).
* **Deliverable:** Visual alert badge memperbarui tampilan secara realtime dan audio alert berbunyi sesuai Priority tiket.
* **Verification:** Perubahan status tiket memicu pemicuan visual badge dan audio alert pada sesi browser penerima yang aktif.

---

### STAGE 8: Traceable History Audit Log & System Hardening
* **Goal:** Menampilkan garis waktu sejarah kejadian (*history timeline*) dan validasi kriteria selesainya sistem (DoD).
* **Tasks:**
  1. **History Timeline Component (`HistoryTimeline.jsx`):**
     - Komponen append-only yang menampilkan urutan kronologis kejadian pada detail tiket.
  2. **Edge Case & Guard Hardening:**
     - Verifikasi browser autoplay audio fallback.
     - Verifikasi pencegahan akses API ilegal oleh Employee.
  3. **Definition of Done (DoD) Verification:**
     - Uji coba skenario end-to-end dari pelaporan hingga closure.
* **Deliverable:** Sistem terverifikasi 100% memenuhi seluruh kriteria DoD PRD V1.
* **Verification:** Seluruh Acceptance Criteria MVP (Section 31 PRD) lulus uji.

---

## 3. Definition of Done (DoD) Summary Matrix

| Milestone Phase | Technical DoD Criteria | Verification Method |
| :--- | :--- | :--- |
| **Stage 1 & 2** | React JS, Tailwind CSS, & shadcn/ui environment ready; DB tables created with strict CHECK constraints & RLS security guards. | Dev server verification & Supabase RLS test scripts. |
| **Stage 3 & 4** | Employee can submit Self-Service without Priority; IT Staff can submit Quick Ticket rapidly. | End-to-end form submit testing. |
| **Stage 5** | IT Staff can access shared queue, assess Priority, and set clear Assignee ownership. | Operational queue workflow test. |
| **Stage 6** | Resolution requires notes; Employee can Accept to Close or Dispute with mandatory reason. | Verification loop lifecycle test. |
| **Stage 7** | Unread visual badges persist across browser reloads; Priority audio alerts fire on events. | Realtime & Web Audio API browser test. |
| **Stage 8** | History log displays chronological event timeline; closed tickets are locked read-only. | History audit & lock test. |

---

## Technical Summary Phase 9

Pada Phase 9 ini, Rencana Implementasi (*Implementation Plan*) telah disusun secara terstruktur:
1. **8 Stage Roadmap:** Membagi pengerjaan menjadi 8 tahapan berurutan dari setup environment hingga DoD hardening.
2. **Task & Deliverables:** Menentukan tugas spesifik, luaran, dan metode verifikasi untuk setiap stage.
3. **DoD Matrix:** Memetakan kriteria selesainya sistem terhadap pengujian teknis.

---

### Siap Melanjutkan ke Phase 10

Selanjutnya, kami siap melanjutkan ke **PHASE 10 — TESTING STRATEGY** untuk mendesain Strategi Pengujian (Unit Testing, Integration Testing, End-to-End Workflow Testing, dan User Acceptance Testing Scenario).
