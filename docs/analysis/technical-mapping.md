# TECHNICAL MAPPING SPECIFICATION & IMPLEMENTATION BLUEPRINT
**Product Working Title:** Internal IT Service Platform  
**Version:** 1.0  
**Status:** Approved Technical Blueprint  
**Target Technology Stack:** React JS (Framework) + Tailwind CSS (Styling) + shadcn/ui (Component Library) + Supabase Backend  
**Scope:** Core IT Service (V1)  

---

## 1. Executive Summary & Beginner Guidance

Dokumen ini merupakan **Technical Mapping Specification** yang menjadi jembatan logis (*technical bridge*) dari seluruh hasil *System Analysis* (Phase 1–7) menuju eksekusi implementasi fisik menggunakan **React JS, Tailwind CSS, shadcn/ui, dan Supabase**.

### 1.1 Guidance Checklist for Developers

| Guidance Question | Technical Clarification & Direction |
| :--- | :--- |
| **1. Apa tujuan Technical Mapping ini?** | Menjadi blueprint implementasi yang menerjemahkan Requirement, Use Cases, Flows, State Machine, Permissions, dan Data Model ke dalam arsitektur komponen React JS, styling Tailwind CSS, komponen shadcn/ui, dan layanan Supabase tanpa menulis kode berlebihan atau SQL DDL yang prematur. |
| **2. Apa yang sekarang sudah bisa dibuat?** | Inisialisasi project React JS (Vite), setup Tailwind CSS, konfigurasi komponen shadcn/ui, desain UI Mockup/Prototype di Google Stitch/Figma, dan pembuatan project baru di Supabase Dashboard. |
| **3. Apa yang masih belum perlu ditentukan?** | Library state management kompleks (Redux/Zustand) dan SQL DDL/RLS Policy scripts final (desain styling dan komponen sudah dibakukan menggunakan Tailwind CSS & shadcn/ui). |
| **4. Dependency teknis yang harus disiapkan?** | `@supabase/supabase-js`, `react-router-dom`, `tailwindcss`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, komponen `shadcn/ui` (Radix UI primitives), Native Web Audio API (browser-native), dan icon library (`lucide-react`). |
| **5. Bagian yang dibawa ke Google Stitch / UIUX?** | Form Self-Service (tanpa Priority), Modal Quick Ticket, Dasbor Centralized Operational Queue, Halaman Detail Tiket & Verification Loop, serta Header Navigation dengan Visual Notification Badge. |
| **6. Bagian yang nanti ditulis saat React + Supabase?** | Supabase Auth & Role mapping, Row Level Security (RLS) policies, Supabase Realtime subscriptions, serta custom React hooks (`useAuth`, `useTickets`, `useNotifications`). |

---

## 2. Frontend Architecture (React JS, Tailwind CSS, & shadcn/ui Mapping)

Struktur komponen React JS dirancang secara konseptual dan modular memanfaatkan styling Tailwind CSS dan komponen berbasis shadcn/ui:

```
src/
├── layouts/
│   ├── EmployeeLayout.jsx       # Layout navigasi & header khusus Employee (Tailwind CSS + shadcn/ui)
│   └── ITStaffLayout.jsx        # Layout navigasi & header khusus IT Staff (Queue & Alerts)
├── pages/
│   ├── EmployeeDashboardPage.jsx # Dasbor pantau progress milik Employee (UC-01, UC-08)
│   ├── SelfServiceReportPage.jsx # Form pelaporan insiden Employee (UC-01)
│   ├── ITQueuePage.jsx          # Dasbor Centralized Operational Queue IT Staff (UC-03)
│   └── TicketDetailPage.jsx     # Detail tiket, assessment, work notes, & verification
├── components/
│   ├── ui/                      # Reusable atomic UI components dari shadcn/ui
│   │   ├── button.jsx           # shadcn Button component
│   │   ├── dialog.jsx           # shadcn Modal/Dialog primitive
│   │   ├── badge.jsx            # shadcn Badge component (Status & Priority)
│   │   ├── card.jsx             # shadcn Card component
│   │   ├── input.jsx            # shadcn Input component
│   │   ├── textarea.jsx         # shadcn Textarea component
│   │   ├── select.jsx           # shadcn Select / Dropdown component
│   │   └── alert.jsx            # shadcn Alert / Toast component
│   ├── QuickTicketModal.jsx     # Modal pembuatan Quick Ticket IT Staff (menggunakan shadcn Dialog)
│   ├── NotificationPanel.jsx    # Panel list notifikasi & persistent unread badge (shadcn Popover/Card)
│   ├── AudioAlertPlayer.jsx     # Komponen penanganan Web Audio API berbasis Priority (UC-09)
│   └── HistoryTimeline.jsx      # Component penyaji Traceable History Log (UC-10)
├── hooks/
│   ├── useAuth.js               # Managing authentication & role context
│   ├── useTickets.js            # Managing ticket queries & lifecycle transitions
│   └── useNotifications.js      # Managing persistent notifications & realtime subscriptions
├── lib/
│   └── utils.js                 # Helper utility shadcn/ui (cn: clsx + tailwind-merge)
└── services/
    └── supabaseClient.js        # Supabase client singleton initialization
```

> **Derived System Behavior:**
> Pemisahan `EmployeeLayout` dan `ITStaffLayout` menjamin bahwa pembatasan akses UI *(FR-02)* dilakukan secara ketat pada lapisan navigasi tingkat atas.

---

## 3. Supabase Technical Mapping

Pemetaan 4 *True Domain Entities* dari Phase 5 ke dalam skema fisik Supabase Backend:

```
+---------------------------------------------------------------------------------------------------+
| SUPABASE BACKEND MAPPING                                                                          |
+-------------------+---------------------------+---------------------------------------------------+
| DOMAIN ENTITY     | SUPABASE PHYSICAL TABLE   | SUPABASE FEATURE & LOGIC USED                     |
+-------------------+---------------------------+---------------------------------------------------+
| User              | public.users              | Supabase Auth (auth.users) + Role Column          |
| Ticket / Incident | public.tickets            | Database Constraints & Status CHECK (10 Stages)   |
| Notification      | public.notifications      | Supabase Realtime Subscription + Persistent State |
| History Record    | public.ticket_history     | Append-Only Row Level Security                    |
+-------------------+---------------------------+---------------------------------------------------+
```

### Authentication & Role Association Logic:
* Supabase Auth mengelola kredensial login pada `auth.users`.
* Tabel `public.users` mereferensikan `auth.users(id)` dan menyimpan atribut `role IN ('Employee', 'IT Staff')`.
* Sesi authentication (`useAuth`) membaca role pengguna saat login untuk menentukan akses UI dan akses data RLS.

---

## 4. Permission to Supabase RLS Mapping

Aturan otorisasi dari `permissions.md` diterjemahkan menjadi 3 Logika Row Level Security (RLS) di Supabase:

```
+-----------------------------------------------------------------------------------+
| SUPABASE ROW LEVEL SECURITY (RLS) LOGIC MAP                                       |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ RLS POLICY 1: Employee Data Isolation Guard ]                                  |
|  FOR Employee Role:                                                               |
|  ALLOW SELECT / UPDATE ON tickets WHERE reporter_id = auth.uid()                  |
|  (Employee HANYA BISA membaca/memverifikasi tiket di mana ia sebagai Reporter)    |
|                                                                                   |
|  [ RLS POLICY 2: IT Staff Shared Queue Access ]                                   |
|  FOR IT Staff Role:                                                               |
|  ALLOW SELECT / UPDATE ON tickets WHERE auth.jwt() -> role = 'IT Staff'           |
|  (IT Staff BISA membaca dan mengelola seluruh tiket di Operational Queue)          |
|                                                                                   |
|  [ RLS POLICY 3: Notification & History Scoping ]                                 |
|  ALLOW SELECT ON notifications WHERE target_user_id = auth.uid()                  |
|  (Pengguna HANYA BISA membaca record notifikasi yang ditujukan kepada dirinya)    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 5. Notification to Realtime Mapping

Notifikasi memisahkan *Data Persistence* di Supabase dan *Realtime Delivery* di React Client:

```
[ Domain Event Fired (e.g. Ticket Priority Set to 'High') ]
                           │
                           ▼
[ Insert Record into 'public.notifications' Table ]
  - persistent_unread_state = 'unread'
  - visual_badge_active = TRUE
  - audio_priority_context = 'High'
                           │
                           ▼ (Supabase Realtime Channel Stream)
[ React Client Listens via 'useNotifications' Hook ]
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
[ Update Visual Badge Count UI ]  [ Trigger AudioAlertPlayer Component ]
(Persists across browser sessions)(Plays High Priority Audio Alert via Web Audio API)
```

> **Technical Consideration:**
> Menyimpan status notifikasi di basis data `public.notifications` memastikan indikator *unread* **selalu persistent** *(FR-15)*. Supabase Realtime bertindak sebagai pengirim sinyal instan saat sesi browser sedang aktif. Pemutaran suara menggunakan Web Audio API native browser *(FR-12, FR-13)*.

---

## 6. State Management Strategy

Untuk menjaga kesederhanaan arsitektur tanpa over-engineering, state dikelompokkan menjadi 5 kategori berbasis fitur bawaan React dan Supabase Client:

1. **Authentication State:** Dikelola via React Context (`AuthContext` / `useAuth`), menyimpan data identitas dan role pengguna.
2. **Server Data State:** Dikelola via `useTickets` hook (mengambil data queue, detail tiket, dan history dari Supabase Client).
3. **Persistent Notification State:** Dikelola via `useNotifications` hook, melacak jumlah unread badges dan daftar alert.
4. **Form State:** Dikelola via local component `useState` pada form Self-Service dan modal Quick Ticket.
5. **UI State:** Dikelola via local `useState` (misalnya visibilitas modal Quick Ticket atau tab aktif).

---

## 7. Domain to Technical Traceability Matrix

Tabel berikut menunjukkan *traceability* lengkap dari Requirement awal hingga Komponen React / Supabase:

| Requirement ID | Use Case ID | System Flow | Lifecycle State | Permission Guard | Data Model Entity | Supabase Table | React Component / Hook |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-03** (Self-Service) | `UC-01` | Flow 1 | `Report` | Employee Allowed | `Ticket` | `public.tickets` | `SelfServiceReportPage.jsx` |
| **FR-04** (Quick Ticket) | `UC-02` | Flow 2 | `In Progress` / `Operational Queue` (Option C) | IT Staff Only | `Ticket` | `public.tickets` | `QuickTicketModal.jsx` |
| **FR-09** (IT Queue) | `UC-03` | Flow 3 | `Operational Queue`| IT Staff Only | `Ticket` | `public.tickets` | `ITQueuePage.jsx` |
| **FR-07** (Priority Set) | `UC-04` | Flow 3 | `Initial Assessment`| IT Staff Only | `Ticket` | `public.tickets` | `TicketDetailPage.jsx` |
| **FR-10** (Assignment) | `UC-05` | Flow 3 | `Assignment` | IT Staff Only | `Ticket` | `public.tickets` | `useTickets.js` |
| **FR-17** (Resolution) | `UC-07` | Flow 3 | `Resolution` | IT Staff Only | `Ticket` | `public.tickets` | `TicketDetailPage.jsx` |
| **FR-17** (Verification) | `UC-08` | Flow 4 | `Verification` | Reporter Employee | `Ticket` | `public.tickets` | `TicketDetailPage.jsx` |
| **FR-12..15** (Notif) | `UC-09` | Cross-Cutting| Any State | Target Recipient | `Notification` | `public.notifications`| `NotificationPanel` & `AudioAlertPlayer` |
| **FR-18** (History Log) | `UC-10` | Cross-Cutting| Any State | Scoped Access | `History Record` | `public.ticket_history`| `HistoryTimeline.jsx` |

---

## 8. Sequential Implementation Blueprint (Dependencies)

Berikut adalah urutan langkah implementasi teknis yang disarankan:

```
[ STEP 1: Supabase Setup & Auth Configuration ]
(Create project, configure Auth & Users table with Roles)
                       │
                       ▼
[ STEP 2: Database Schema & RLS Policies Deployment ]
(Deploy tickets, notifications, & history tables + RLS Security Guards)
                       │
                       ▼
[ STEP 3: React JS, Tailwind CSS & shadcn/ui Shell Setup ]
(Init React Vite app, configure Tailwind CSS & shadcn/ui, setup React Router & Auth Context)
                       │
                       ▼
[ STEP 4: Incident Ingestion & Operational Queue ]
(Build Self-Service form, Quick Ticket modal, & IT Queue View)
                       │
                       ▼
[ STEP 5: Assessment, Assignment & Resolution Workflow ]
(Implement Priority selection, Assignee binding, & Resolution notes)
                       │
                       ▼
[ STEP 6: Employee Verification & Closure Loop ]
(Implement Confirm & Close and Dispute logic)
                       │
                       ▼
[ STEP 7: Realtime Notifications & Audio Alert Integration ]
(Connect Supabase Realtime, Persistent Unread Badges, & Web Audio API)
```

---

## Technical Summary

Dokumen `technical-mapping.md` ini telah membakukan blueprint implementasi fisik:
1. Menyediakan panduan praktis untuk developer pemula mengenai apa yang harus dibuat dan apa yang tidak perlu di-over-engineer.
2. Memetakan arsitektur React JS dengan styling Tailwind CSS dan komponen shadcn/ui (Layouts, Pages, Components, Hooks, Services).
3. Memetakan entitas domain ke tabel Supabase, aturan RLS Security, dan Supabase Realtime Stream.
4. Menyediakan matriks *Domain to Technical Traceability* yang utuh dari Requirement hingga komponen React JS & shadcn/ui.
5. Menentukan urutan langkah pengerjaan (*Sequential Implementation Blueprint*).
