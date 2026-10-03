# Full Backend Architecture & Frontend Analysis Report

**Project:** ICEM Smart Notice Portal  
**Scope:** One Unified Shared Backend for **Admin Portal** and **Student** Frontends  
**Date:** October 2024  
**Author:** Antigravity AI  

---

## Table of Contents
1. [Supabase Inspection & Architecture Comparison](#1-supabase-inspection--architecture-comparison)
   - [1.1 Does Either Frontend Currently Use Supabase?](#11-does-either-frontend-currently-use-supabase)
   - [1.2 Architecture Comparison: Custom Node.js + Express vs. Supabase](#12-architecture-comparison-custom-nodejs--express-vs-supabase)
   - [1.3 Is a Separate Node.js + Express Backend Actually Needed?](#13-is-a-separate-nodejs--express-backend-actually-needed)
2. [Features Detected in Admin Portal](#2-features-detected-in-admin-portal)
   - [2.1 Pages and Routing](#21-pages-and-routing)
   - [2.2 Authentication & Session Flow](#22-authentication--session-flow)
   - [2.3 Notice Management Workbench](#23-notice-management-workbench)
   - [2.4 Dashboard Banner & Featured Events Manager](#24-dashboard-banner--featured-events-manager)
   - [2.5 Components & Utilities Breakdown](#25-components--utilities-breakdown)
3. [Features Detected in Student Portal](#3-features-detected-in-student-portal)
   - [3.1 Pages and Routing](#31-pages-and-routing)
   - [3.2 Layout & Navigation](#32-layout--navigation)
   - [3.3 Dashboard View & Widgets](#33-dashboard-view--widgets)
   - [3.4 Dedicated Notices View & Filter Bar](#34-dedicated-notices-view--filter-bar)
   - [3.5 Notice Detail View & User Interactions](#35-notice-detail-view--user-interactions)
   - [3.6 Events & Cultural View](#36-events--cultural-view)
   - [3.7 Secondary Views & Modals](#37-secondary-views--modals)
4. [Backend APIs Required by Both Frontends](#4-backend-apis-required-by-both-frontends)
   - [4.1 Authentication & User Management Endpoints](#41-authentication--user-management-endpoints)
   - [4.2 Notice Management Endpoints](#42-notice-management-endpoints)
   - [4.3 Student Notice Interaction Endpoints](#43-student-notice-interaction-endpoints)
   - [4.4 Banners & Campus Events Endpoints](#44-banners--campus-events-endpoints)
   - [4.5 College Documents & Resources Endpoints](#45-college-documents--resources-endpoints)
   - [4.6 Academic Timetable Endpoints](#46-academic-timetable-endpoints)
   - [4.7 Newsletter Subscription Endpoints](#47-newsletter-subscription-endpoints)
   - [4.8 File Upload Endpoints](#48-file-upload-endpoints)
5. [Database Tables / Models Required (Prisma Schema)](#5-database-tables--models-required-prisma-schema)
6. [Relationships Between the Database Models](#6-relationships-between-the-database-models)
7. [Authentication and Authorization Requirements](#7-authentication-and-authorization-requirements)
   - [7.1 JWT Token Strategy](#71-jwt-token-strategy)
   - [7.2 Password Security](#72-password-security)
   - [7.3 Middleware Architecture](#73-middleware-architecture)
8. [Roles and Permissions Required](#8-roles-and-permissions-required)
9. [File-Upload Requirements](#9-file-upload-requirements)
   - [9.1 Current Frontend Implementation](#91-current-frontend-implementation)
   - [9.2 Backend Multer Specification](#92-backend-multer-specification)
10. [Recommended Backend Folder Structure](#10-recommended-backend-folder-structure)
11. [Missing, Inconsistent, or Unclear Requirements](#11-missing-inconsistent-or-unclear-requirements)

---

## 1. Supabase Inspection & Architecture Comparison

### 1.1 Does Either Frontend Currently Use Supabase?
**Finding: NO.** Neither the Admin Portal nor the Student application currently uses, installs, imports, or configures Supabase in any capacity.

#### Detailed Inspection Evidence:
1. **Dependency Analysis:**
   - [`Admin Portal/package.json`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/package.json): Lists only `clsx`, `lucide-react`, `react`, `react-dom`, and `tailwind-merge`. Zero backend or Supabase client libraries.
   - [`Student/package.json`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/package.json): Lists identical frontend UI dependencies (`clsx`, `lucide-react`, `react`, `react-dom`, `tailwind-merge`).
   - Neither `package-lock.json` contains `@supabase/supabase-js`, `@supabase/gotrue-js`, or any related packages.
2. **Source Code Text Search:**
   - Full recursive grep for `supabase` across all directories returned **0 results**.
3. **Configuration & Environment Files:**
   - No `.env`, `.env.local`, or `.env.production` files exist in the repository.
   - There are no Supabase URLs or anonymous public API keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the source code.
4. **Git Commit History:**
   - `git log -S "supabase"` shows no past commits ever introduced or removed Supabase.
5. **Current State of Data Storage in the Frontends:**
   - Both applications are **100% client-side React applications**.
   - Data is sourced from static mock files: [`Student/src/data/mockNotices.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/data/mockNotices.ts) and [`Admin Portal/src/data/mockAdminNotices.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/data/mockAdminNotices.ts).
   - Local state persistence uses browser storage: `localStorage` (`icem_notices_v1`, `icem_student_dashboard_banners`, `icem_admin_auth`, `icem_admin_user`) and `sessionStorage` (`icem_admin_authenticated`).
   - Cross-tab/cross-window messaging uses browser `BroadcastChannel` APIs (`icem_notices_channel` and `icem_banner_sync_channel`).

---

### 1.2 Architecture Comparison: Custom Node.js + Express vs. Supabase

| Evaluation Criteria | Option A: Custom Node.js + Express + Prisma + PostgreSQL | Option B: Supabase (Backend-as-a-Service) |
|---|---|---|
| **Architecture Type** | Traditional Custom REST API Server | Managed Cloud/BaaS Platform (PostgREST + GoTrue + Storage) |
| **API Code Required** | Requires developing Express routes, controllers, middleware, and services. | Minimal server code; frontends use `@supabase/supabase-js` client directly. |
| **Data Schema & ORM** | PostgreSQL database managed with Prisma ORM (declarative schema, migrations, types, seed scripts). | PostgreSQL database managed in Supabase SQL editor/Dashboard with table migrations. |
| **Authentication Flow** | Custom JWT (access + refresh tokens) + `bcrypt` password hashing + Express auth middleware. | Built-in Supabase Auth (email/password, JWT, session refresh, user metadata). |
| **Authorization & Roles** | Role middleware (`requireRole('ADMIN')`, `requireRole('STUDENT')`) evaluated in Node.js server. | PostgreSQL Row-Level Security (RLS) policies written in SQL directly on database tables. |
| **File Uploads** | Express Multer middleware saving to local disk storage (`uploads/`) or custom S3 adapter. | Built-in Supabase Storage buckets with public URLs, access policies, and size limits. |
| **Realtime Sync** | Requires adding Socket.IO/SSE or client polling for multi-user real-time updates. | Built-in Realtime engine subscribing to PostgreSQL changes over WebSockets out of the box. |
| **Data Adaptation & Normalization** | Very flexible: Controller/service layer easily normalizes mismatched fields between Admin and Student. | Client-side adaptation required, or custom PostgreSQL database views/stored procedures needed. |
| **Local Offline Development** | 100% local; runs with a standard local PostgreSQL database instance without internet access. | Requires internet access for Supabase Cloud, or running the heavyweight Supabase CLI Docker stack locally. |
| **Hosting & Deployment** | Node server (Render, Railway, VPS, Fly.io) + PostgreSQL instance (Supabase, Neon, Railway, RDS). | Hosted on Supabase Cloud (free tier available) or self-hosted Supabase Docker container. |
| **Vendor Dependency** | Zero vendor lock-in. Full portability of Node.js code and standard PostgreSQL. | Dependent on Supabase client conventions, RLS mechanics, and Supabase cloud infrastructure. |

---

### 1.3 Is a Separate Node.js + Express Backend Actually Needed?

- **Strictly speaking, no single architecture is "mandatory"**: Both options can fulfill the project requirements.
- **Why a separate Node.js + Express backend is the recommended choice here:**
  1. **Discrepancy Normalization:** The Admin Portal and Student Portal currently have diverging property names (e.g. `isImportant` vs `important`, `isUrgent` vs `urgent`, HTML `content` vs JSON `fullBody`). A custom Express API cleanly acts as an adapter, shielding the database while serving both frontends without breaking existing components.
  2. **Controlled Business Logic:** Administrative tasks (e.g. calculating stats, generating formatted reference numbers `REF-2024-XXX`, auto-formatting deadlines, aggregating calendar notices) are encapsulated in dedicated backend services.
  3. **Standard Enterprise Stack:** Express + TypeScript + PostgreSQL + Prisma ORM is standard, easy to maintain, fully testable, and runs cleanly in any environment without external cloud dependencies.
- **When Supabase would be favored instead:**
  - If the priority is to avoid writing and maintaining an Express server codebase, utilizing Supabase's managed Postgres, Auth, and Storage directly from the React apps.

---

## 2. Features Detected in Admin Portal

### 2.1 Pages and Routing
Hash-based client routing implemented in [`Admin Portal/src/App.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/App.tsx):
- `#/dashboard` or `#/manage-notices` (default): Main administrative notice workbench and feed.
- `#/create-notice`: Dedicated notice composition view.
- `#/dashboard-banner` or `#/banners`: Dashboard banner and featured event manager.
- `#/category/:category`: Filtered administrative notice list by category.
- Portal switcher linking to the Student Portal (`http://localhost:5173` or `5174`).

### 2.2 Authentication & Session Flow
Located in [`Admin Portal/src/views/AdminLoginView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminLoginView.tsx):
- Login form with Username and Password fields.
- Password visibility toggle (Eye/EyeOff icons).
- "Fill Demo Credentials" action pre-populating `admin` / `admin123`.
- Hardcoded accepted users: `admin`, `icemadmin`, `administrator`, `faculty`.
- Hardcoded accepted passwords: `admin123`, `admin`, `icem@2024`, `password`.
- Simulation of network delay (600ms) with animated loading spinner.
- Persists session in `localStorage('icem_admin_auth') = 'true'`, `sessionStorage('icem_admin_authenticated') = 'true'`, and user metadata in `localStorage('icem_admin_user')`.
- Displays institutional branding and link back to Student Portal.
- Authenticated admin profile badge with initials "CA" in [`Admin Portal/src/components/AdminSidebar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/AdminSidebar.tsx).

### 2.3 Notice Management Workbench
Located in [`Admin Portal/src/views/AdminNoticeWorkbench.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminNoticeWorkbench.tsx):
- **Notice Creation and Editing Fields:**
  - `refNo`: Reference number (auto-generated e.g. `REF-2024-XXX`).
  - `title`: Notice title string.
  - `category`: Select dropdown (`Academics`, `Examination`, `Placement & Training`, `Events & Cultural`, `Administration`).
  - `status`: Select dropdown (`Published`, `Archived`).
  - `department`: Issuing department name string.
  - `departmentKey`: Dropdown key (`tpo`, `exam`, `comp`, `it`, `admin`, `all`).
  - `issuedBy`: Issuing authority (`Training & Placement Officer`, `Controller of Examinations`, `Dean Academics`, `Registrar Office`, `Head of Industry Relations`, `Cultural Committee Head`, `Chief Librarian`, `Director of Physical Education`, `Principal Office`, `College Admin`).
  - `targetAudience`: Dropdown (`All Enrolled Students`, `BE Final Yr (All Branches)`, `TE & BE Students`, `SE & TE Students`, `FE, SE, TE, BE Students`, `TE (Comp, IT)`, `All Branch Students`, `Faculty & Students`, `All Students & Staff`).
  - `academicYear`: String input (e.g. `AY 2024-25`).
  - `date`: Published date string (formatted as `Oct 24, 2024` or ISO `YYYY-MM-DD`).
  - `time`: Published time string (12-hour or 24-hour format).
  - `summary`: Short summary string.
  - `content`: Formatted body using [`Admin Portal/src/components/RichTextEditor.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/RichTextEditor.tsx) producing HTML markup (`<b>`, `<i>`, `<u>`, `<ol>`, `<ul>`, `<a>`).
  - `isImportant`: Boolean priority flag.
  - `isUrgent`: Boolean urgency flag.
  - `actionRequired`: Boolean flag indicating if students must act by a deadline.
  - `actionDeadlineDate` & `actionDeadlineTime`: Date and time inputs combined into `actionDeadline` string (e.g. `Oct 26, 2024 · 05:00 PM`).
  - `actionDescription`: Action description instructions.
- **Attachment Handling:**
  - Drag-and-drop file upload zone and file input picker.
  - Formats: PDF (`.pdf`), Excel (`.xls`, `.xlsx`, `.csv`), Word (`.doc`, `.docx`), Images (`.jpg`, `.jpeg`, `.png`, `.webp`).
  - Formats file size dynamically (KB / MB).
  - Currently saves **metadata only** in frontend state (`{ name, size, type }`).
- **Administrative Operations:**
  - Create new notice.
  - Edit notice (pre-populates form, date pickers, rich text editor).
  - Status toggle (`Published` ↔ `Archived`).
  - Delete notice with confirmation dialog.
- **List, Search & Filter Controls:**
  - Search query matching title, summary, department, authority.
  - Category filter dropdown.
  - Department filter dropdown.
  - Status tabs (`All`, `Published`, `Action Required`).
  - Mini-calendar date picker for filtering notices by publication date.
  - Pagination controls (default 5 items per page).
  - Header statistics counters in [`Admin Portal/src/components/AdminHeader.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/AdminHeader.tsx) displaying Total Notices and Published Notices.
- **Persistence & Synchronization:**
  - Reads and writes to `localStorage('icem_notices_v1')`.
  - Dispatches `CustomEvent('icem-notices-update')` and broadcasts updates across tabs via `BroadcastChannel('icem_notices_channel')`.

### 2.4 Dashboard Banner & Featured Events Manager
Located in [`Admin Portal/src/views/AdminBannerManager.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminBannerManager.tsx):
- Manages high-profile banners and featured events for the Student dashboard.
- Form inputs:
  - `title`: Event/banner title.
  - `tag`: Category tag (`HACKATHON`, `WORKSHOP`, `TECH FEST`, `PLACEMENT`, `CONFERENCE`, `ANNOUNCEMENT`).
  - `image`: Image source selection:
    1. Preset image selector (Hackathon, AI Workshop, Robotics, Placement Drive, Conference).
    2. Direct image URL input.
    3. Local image upload (`FileReader.readAsDataURL` converting image to Base64 data URL).
  - `shortDescription`: Brief summary text.
  - `registrationUrl`: External/internal URL link.
  - `actionText`: Action button label (e.g. `Register`, `View Details`).
  - `deadlineText`: Deadline display label (e.g. `Registration closes Sept 20`).
  - `startDate` & `endDate`: Date range strings.
  - `venue`: Physical or virtual venue location string.
  - `status`: Select input (`open`, `closing-soon`, `closed`).
  - `isFeatured`: Boolean toggle.
  - `isActive`: Boolean toggle controlling visibility on the student portal.
- Operations:
  - Create new banner.
  - Edit banner.
  - Toggle Active/Inactive status.
  - Delete banner.
  - Reset to default institutional presets.
- Persistence: Saved in `localStorage('icem_student_dashboard_banners')` and broadcast via `BroadcastChannel('icem_banner_sync_channel')`.

### 2.5 Components & Utilities Breakdown
- [`AdminHeader.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/AdminHeader.tsx): Top navigation bar with search bar, total/published notice badges, and "Create Notice" button.
- [`AdminSidebar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/AdminSidebar.tsx): Left drawer with institutional branding, category navigation, admin badge, and student portal switcher.
- [`RichTextEditor.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/components/RichTextEditor.tsx): Custom `contentEditable` HTML editor with toolbar (bold, italic, underline, list, clean format) and keyboard shortcuts.
- [`noticeStorage.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/utils/noticeStorage.ts): LocalStorage abstraction and date/time formatting helpers (`isoToDisplayDate`, `displayDateToIso`, `time12To24`, `time24To12`).
- [`bannerStorage.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/utils/bannerStorage.ts): LocalStorage and BroadcastChannel abstraction for dashboard banners.
- [`adminNotice.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/types/adminNotice.ts) & [`adminBanner.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/types/adminBanner.ts): TypeScript interface definitions.

---

## 3. Features Detected in Student Portal

### 3.1 Pages and Routing
Hash-based client routing in [`Student/src/App.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/App.tsx):
- `#/dashboard` or `#/notices`: Primary student portal dashboard.
- `#/notices/:category`: Category-filtered feeds (`exam`, `placement`, `general`, `events`, `all`).
- `#/notices-table`: Full tabular notice view.
- `#/notice/:id`: Notice detail page with attachments and related circulars.
- `#/timetable`: Weekly academic timetable view.
- `#/events`: Dedicated cultural and campus events view.
- `#/admin-login`: Admin login entry screen.

### 3.2 Layout & Navigation
- [`Header.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/layout/Header.tsx): Fixed top navigation with mobile menu toggle, global search input with `Ctrl+K` shortcut, institutional badge, and "Admin Portal" entry link.
- [`Sidebar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/layout/Sidebar.tsx): Collapsible navigation drawer containing:
  - Institutional logo and branding.
  - Category navigation tabs with live item count chips (`All Notices`, `Exam Notices`, `Placement Notices`, `General Notices`, `Events & Cultures`).
  - Email Newsletter Subscription card with input validation and subscribed state.
- [`SplashScreen.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/layout/SplashScreen.tsx): Full-viewport animated opening screen displaying college emblem and loading indicator.

### 3.3 Dashboard View & Widgets
Located in [`Student/src/views/DashboardView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/DashboardView.tsx):
- **Action Required Ticker ([`ActionRequiredBanner.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/layout/ActionRequiredBanner.tsx)):** Infinite horizontal marquee showing urgent items (`ActionItem[]`) with deadline date chips; clicking opens notice detail.
- **Notice Feed Table ([`NoticeFeedTable.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/NoticeFeedTable.tsx)):** Responsive table with type icons, subject, urgent badge, category/issuer/attachment chips, department, and date.
- **Notice Calendar ([`NoticeCalendar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/NoticeCalendar.tsx)):**
  - Interactive Google Calendar-style month grid.
  - Events categorized by distinct color chips (Exam: amber, Placement: blue, Academic: emerald, Events: purple, Admin: indigo).
  - Popover modal showing all notices scheduled on a selected day.
  - Month navigation and date normalizer supporting relative dates ("Today", "Yesterday").
- **Featured Events Carousel ([`FeaturedEvents.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/FeaturedEvents.tsx)):** Carousel synchronizing live banner updates from the Admin Portal via `localStorage('icem_student_dashboard_banners')` and `BroadcastChannel('icem_banner_sync_channel')`.
- **Important Notices Bulletin ([`ImportantNotices.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/ImportantNotices.tsx)):** Marquee bulletin ticker for important announcements.
- **Data Refresh Button:** Simulates synchronization with the central college database with animated spinner and toast notification.

### 3.4 Dedicated Notices View & Filter Bar
Located in [`Student/src/views/NoticesView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/NoticesView.tsx):
- Filter Bar ([`NoticeFilterBar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/notices/NoticeFilterBar.tsx)):
  - Keyword search input.
  - Subcategory pills (All, Administrative, Academic, Events, Sports, Library).
  - Department dropdown filter (`all`, `ce`, `it`, `mech`, `civil`).
  - "Important Only" toggle checkbox.
  - Reset filters button and dynamic result counter.

### 3.5 Notice Detail View & User Interactions
Located in [`Student/src/views/NoticeDetailView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/NoticeDetailView.tsx):
- Breadcrumb navigation and back button.
- Header card showing category badge, publication date, target audience, issuing officer, and deadline alerts.
- Body content rendering supporting:
  - Structured JSON format (`fullBody`: salutation, introduction, sections with paragraphs/items, callout box).
  - HTML or plain text `content`.
- **Attachments Section:**
  - Displays file name, size, type icon (`pdf`, `excel`, `image`, `doc`).
  - "Preview" button launching [`AttachmentModal.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/notices/AttachmentModal.tsx).
  - "Download" button.
- **User Action Controls:**
  - **Acknowledge Notice:** Toggle button ("Acknowledge Notice" ↔ "Acknowledged ✓") currently stored in React state.
  - **Bookmark Notice:** Toggle bookmark button ("Bookmark" ↔ "Saved") currently stored in React state.
  - **Share Notice:** Copies notice URL to clipboard with confirmation indicator.
- **Related Notices Panel:** Automatically suggests 3 related circulars matching category or department.
- **Department Contact Desk:** Displays physical campus location (e.g. Block B, Room 304) and office timings.

### 3.6 Events & Cultural View
Located in [`Student/src/views/EventsCultureView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/EventsCultureView.tsx):
- Category tabs: `All Events`, `Cultural Events`, `College Events`, `Festivals`, `Competitions`, `Workshops`, `Student Activities`.
- Grid of event cards with cover images, category badges, "Closing Soon" flags, short descriptions, dates, venue, and deadline text.
- Event Details Modal: Full-screen overlay showing event banner image, long description, venue, time, registration button, and associated notice link (`noticeId`).

### 3.7 Secondary Views & Modals
- [`SecondaryViews.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/SecondaryViews.tsx): Contains `TimetableView` displaying `ScheduleItem[]` (time, period, subject, details, type).
- [`RecentUpdatesWidget.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/RecentUpdatesWidget.tsx): Recent updates feed + launchers for Docs and Help modals.
- [`DocsModal.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/modals/DocsModal.tsx): Downloadable college forms, scholarship forms, anti-ragging affidavits (`CollegeDocument[]`) with search and download feedback.
- [`HelpModal.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/modals/HelpModal.tsx): FAQs, campus contacts, and student support details.

---

## 4. Backend APIs Required by Both Frontends

The backend will expose a unified API under `/api/v1` serving both the Admin Portal and Student Portal.

### 4.1 Authentication & User Management Endpoints
- **`POST /api/v1/auth/login`**
  - **Access:** Public
  - **Request Body:** `{ "usernameOrEmail": "admin", "password": "password123" }`
  - **Response:** `{ "token": "jwt...", "refreshToken": "...", "user": { "id": "...", "username": "admin", "role": "ADMIN", "department": "Administration" } }`
- **`POST /api/v1/auth/register`**
  - **Access:** Public (for students) / Admin-only (for administrative staff)
  - **Request Body:** `{ "username": "student01", "email": "student01@icem.ac.in", "password": "...", "fullName": "Kaustubh ...", "role": "STUDENT", "department": "ce", "academicYear": "AY 2024-25" }`
  - **Response:** `{ "message": "User registered successfully", "user": { ... } }`
- **`GET /api/v1/auth/me`**
  - **Access:** Authenticated (Bearer Token)
  - **Response:** Current user profile, role, and permissions.
- **`POST /api/v1/auth/refresh-token`**
  - **Access:** Public
  - **Request Body:** `{ "refreshToken": "..." }`
  - **Response:** `{ "token": "new_jwt...", "refreshToken": "new_refresh..." }`
- **`POST /api/v1/auth/logout`**
  - **Access:** Authenticated
  - **Response:** `{ "message": "Logged out successfully" }`

### 4.2 Notice Management Endpoints
- **`GET /api/v1/notices`**
  - **Access:** Public / All (Filters automatically by `status='PUBLISHED'` for guests/students; admins can pass `?status=all|published|archived`)
  - **Query Parameters:** `search`, `category`, `department`, `departmentKey`, `status`, `isImportant`, `isUrgent`, `actionRequired`, `date`, `month`, `year`, `page` (default 1), `limit` (default 10).
  - **Response:** `{ "notices": Notice[], "total": 45, "page": 1, "totalPages": 5 }`
- **`GET /api/v1/notices/stats`**
  - **Access:** ADMIN
  - **Response:** `{ "totalNotices": 45, "publishedNotices": 38, "archivedNotices": 7, "actionRequiredCount": 5 }`
- **`GET /api/v1/notices/action-required`**
  - **Access:** Public / All
  - **Response:** Returns active notices where `actionRequired = true` for display in the marquee ticker [`ActionRequiredBanner.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/layout/ActionRequiredBanner.tsx).
- **`GET /api/v1/notices/calendar`**
  - **Access:** Public / All
  - **Query Parameters:** `?year=2024&month=10`
  - **Response:** Notices mapped by date for Google Calendar rendering in [`NoticeCalendar.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/NoticeCalendar.tsx).
- **`GET /api/v1/notices/:id`**
  - **Access:** Public / All
  - **Response:** Complete notice object, attachments array, related notices array, and if a student is authenticated, `bookmarked: boolean` and `acknowledged: boolean`.
- **`POST /api/v1/notices`**
  - **Access:** ADMIN
  - **Request Body:** Complete notice payload (refNo, title, category, status, department, departmentKey, summary, content, issuedBy, targetAudience, academicYear, date, time, isImportant, isUrgent, actionRequired, actionDeadline, actionDescription, attachments).
  - **Response:** `{ "message": "Notice published", "notice": Notice }`
- **`PUT /api/v1/notices/:id`**
  - **Access:** ADMIN
  - **Request Body:** Updated notice fields.
  - **Response:** `{ "message": "Notice updated", "notice": Notice }`
- **`PATCH /api/v1/notices/:id/status`**
  - **Access:** ADMIN
  - **Request Body:** `{ "status": "Published" | "Archived" }`
  - **Response:** `{ "message": "Status updated", "notice": Notice }`
- **`DELETE /api/v1/notices/:id`**
  - **Access:** ADMIN
  - **Response:** `{ "message": "Notice deleted successfully" }`

### 4.3 Student Notice Interaction Endpoints
- **`POST /api/v1/notices/:id/acknowledge`**
  - **Access:** STUDENT
  - **Response:** `{ "acknowledged": true, "acknowledgedAt": "2024-10-24T10:00:00Z" }`
- **`POST /api/v1/notices/:id/bookmark`**
  - **Access:** STUDENT
  - **Response:** `{ "bookmarked": true }` (toggles true/false)
- **`GET /api/v1/student/bookmarks`**
  - **Access:** STUDENT
  - **Response:** List of notices bookmarked by the authenticated student.
- **`GET /api/v1/student/acknowledgements`**
  - **Access:** STUDENT
  - **Response:** List of notice IDs acknowledged by the authenticated student.

### 4.4 Banners & Campus Events Endpoints
- **`GET /api/v1/banners`**
  - **Access:** Public / All (returns active banners only `isActive = true`)
  - **Query Parameters:** `?category=&status=&featured=true`
  - **Response:** Array of banners/events for [`FeaturedEvents.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/dashboard/FeaturedEvents.tsx) and [`EventsCultureView.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/EventsCultureView.tsx).
- **`GET /api/v1/banners/admin`**
  - **Access:** ADMIN (returns all banners including inactive)
  - **Response:** All banners for [`AdminBannerManager.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminBannerManager.tsx).
- **`POST /api/v1/banners`**
  - **Access:** ADMIN
  - **Request Body:** Banner fields (title, tag, category, image, shortDescription, longDescription, registrationUrl, actionText, deadlineText, startDate, endDate, time, venue, isFeatured, status, isActive, noticeId).
  - **Response:** `{ "message": "Banner created", "banner": Banner }`
- **`PUT /api/v1/banners/:id`**
  - **Access:** ADMIN
  - **Request Body:** Updated banner fields.
  - **Response:** `{ "message": "Banner updated", "banner": Banner }`
- **`PATCH /api/v1/banners/:id/status`**
  - **Access:** ADMIN
  - **Response:** `{ "message": "Banner status toggled", "banner": Banner }`
- **`DELETE /api/v1/banners/:id`**
  - **Access:** ADMIN
  - **Response:** `{ "message": "Banner deleted", "id": "..." }`
- **`POST /api/v1/banners/reset`**
  - **Access:** ADMIN
  - **Response:** `{ "message": "Banners reset to institutional presets", "banners": Banner[] }`

### 4.5 College Documents & Resources Endpoints
- **`GET /api/v1/documents`**
  - **Access:** Public / All
  - **Query Parameters:** `?search=&category=`
  - **Response:** List of official downloadable documents (`CollegeDocument[]`) for [`DocsModal.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/components/modals/DocsModal.tsx).
- **`POST /api/v1/documents`**
  - **Access:** ADMIN
  - **Payload:** `multipart/form-data` with document file and metadata.
  - **Response:** `{ "message": "Document added", "document": CollegeDocument }`
- **`DELETE /api/v1/documents/:id`**
  - **Access:** ADMIN
  - **Response:** `{ "message": "Document deleted" }`

### 4.6 Academic Timetable Endpoints
- **`GET /api/v1/timetable`**
  - **Access:** Public / All
  - **Query Parameters:** `?department=ce&day=Tuesday`
  - **Response:** List of schedule items (`ScheduleItem[]`) for [`SecondaryViews.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/views/SecondaryViews.tsx).

### 4.7 Newsletter Subscription Endpoints
- **`POST /api/v1/subscriptions`**
  - **Access:** Public / All
  - **Request Body:** `{ "email": "student@icem.ac.in" }`
  - **Response:** `{ "message": "Subscribed successfully" }`

### 4.8 File Upload Endpoints
- **`POST /api/v1/upload/attachments`**
  - **Access:** ADMIN
  - **Payload:** `multipart/form-data` (Multiple files: `files`)
  - **Response:** Array of uploaded attachment records:
    ```json
    [
      {
        "name": "Exam_Schedule.pdf",
        "originalName": "Exam_Schedule.pdf",
        "fileUrl": "/uploads/notices/1729000000-uuid.pdf",
        "fileType": "pdf",
        "fileSize": "1.4 MB",
        "mimeType": "application/pdf"
      }
    ]
    ```
- **`POST /api/v1/upload/banner-image`**
  - **Access:** ADMIN
  - **Payload:** `multipart/form-data` (Single file: `image`)
  - **Response:** `{ "imageUrl": "/uploads/banners/1729000000-uuid.jpg" }`

---

## 5. Database Tables / Models Required (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  STUDENT
}

enum NoticeStatus {
  PUBLISHED
  ARCHIVED
}

enum FileType {
  PDF
  EXCEL
  IMAGE
  DOC
}

enum BannerStatus {
  OPEN
  CLOSING_SOON
  CLOSED
}

enum ScheduleType {
  LECTURE
  LAB
  BREAK
}

model User {
  id              String                  @id @default(uuid())
  username        String                  @unique
  email           String                  @unique
  passwordHash    String
  fullName        String
  role            Role                    @default(STUDENT)
  department      String?
  academicYear    String?
  avatarUrl       String?
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt

  // Relationships
  authoredNotices Notice[]                @relation("NoticeAuthor")
  acknowledgements NoticeAcknowledgement[]
  bookmarks       NoticeBookmark[]
  authoredBanners BannerEvent[]           @relation("BannerAuthor")
  uploadedDocs    CollegeDocument[]       @relation("DocUploader")

  @@map("users")
}

model Notice {
  id                String                  @id @default(uuid())
  refNo             String                  @unique
  title             String
  category          String
  status            NoticeStatus            @default(PUBLISHED)
  summary           String
  content           String                  // HTML string from RichTextEditor
  fullBody          Json?                   // Structured JSON body (salutation, sections, callouts)
  issuedBy          String
  department        String
  departmentKey     String                  // Normalized key e.g. 'tpo', 'exam', 'comp', 'it', 'admin', 'all'
  targetAudience    String
  academicYear      String?                 @default("AY 2024-25")
  date              String                  // Formatted date string
  time              String?                 // Formatted time string
  isImportant       Boolean                 @default(false)
  isUrgent          Boolean                 @default(false)
  actionRequired    Boolean                 @default(false)
  actionDeadline    String?
  actionDescription String?

  createdById       String?
  createdBy         User?                   @relation("NoticeAuthor", fields: [createdById], references: [id], onDelete: SetNull)

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  // Relationships
  attachments       NoticeAttachment[]
  acknowledgements  NoticeAcknowledgement[]
  bookmarks         NoticeBookmark[]
  linkedBanners     BannerEvent[]

  @@index([category])
  @@index([departmentKey])
  @@index([status])
  @@index([isImportant])
  @@index([actionRequired])
  @@map("notices")
}

model NoticeAttachment {
  id            String    @id @default(uuid())
  noticeId      String
  notice        Notice    @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  name          String
  originalName  String
  fileUrl       String
  fileType      FileType  @default(PDF)
  fileSize      String
  mimeType      String?
  createdAt     DateTime  @default(now())

  @@index([noticeId])
  @@map("notice_attachments")
}

model NoticeAcknowledgement {
  id             String    @id @default(uuid())
  noticeId       String
  userId         String
  acknowledgedAt DateTime  @default(now())

  notice         Notice    @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([noticeId, userId])
  @@map("notice_acknowledgements")
}

model NoticeBookmark {
  id        String    @id @default(uuid())
  noticeId  String
  userId    String
  createdAt DateTime  @default(now())

  notice    Notice    @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([noticeId, userId])
  @@map("notice_bookmarks")
}

model BannerEvent {
  id               String       @id @default(uuid())
  title            String
  tag              String
  category         String?      @default("College Events")
  image            String
  shortDescription String
  longDescription  String?
  registrationUrl  String?
  actionText       String?      @default("Register")
  deadlineText     String
  startDate        String?
  endDate          String?
  time             String?
  venue            String?
  isFeatured       Boolean      @default(true)
  status           BannerStatus @default(OPEN)
  isActive         Boolean      @default(true)

  noticeId         String?
  notice           Notice?      @relation(fields: [noticeId], references: [id], onDelete: SetNull)

  createdById      String?
  createdBy        User?        @relation("BannerAuthor", fields: [createdById], references: [id], onDelete: SetNull)

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([isActive])
  @@index([status])
  @@map("banner_events")
}

model CollegeDocument {
  id           String    @id @default(uuid())
  title        String
  category     String
  fileType     FileType  @default(PDF)
  fileSize     String
  description  String?
  downloadUrl  String
  lastUpdated  String?

  uploadedById String?
  uploadedBy   User?     @relation("DocUploader", fields: [uploadedById], references: [id], onDelete: SetNull)

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("college_documents")
}

model ScheduleItem {
  id          String       @id @default(uuid())
  time        String
  period      String       // 'AM' | 'PM'
  subject     String
  details     String
  type        ScheduleType @default(LECTURE)
  colorBorder String?      @default("primary")
  department  String?      @default("ce")
  dayOfWeek   String?      @default("Tuesday")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("schedule_items")
}

model NewsletterSubscription {
  id           String    @id @default(uuid())
  email        String    @unique
  isActive     Boolean   @default(true)
  subscribedAt DateTime  @default(now())

  @@map("newsletter_subscriptions")
}
```

---

## 6. Relationships Between the Database Models

```
┌─────────────────────────────────┐
│              User               │
│  (id, username, passwordHash)   │
└───────────────┬─────────────────┘
                │
                │ 1:N (created author)
                ▼
┌─────────────────────────────────┐       1:N (Cascade)      ┌─────────────────────────┐
│             Notice              ├─────────────────────────►│    NoticeAttachment     │
│  (id, refNo, title, content)    │                          │(noticeId, fileUrl, size)│
└───────┬─────────────────┬───────┘                          └─────────────────────────┘
        │                 │
        │ 1:N (Join)      │ 1:N (Join)
        ▼                 ▼
┌──────────────────┐ ┌──────────────────┐
│NoticeAcknowledge │ │  NoticeBookmark  │
│(noticeId, userId)│ │(noticeId, userId)│
└──────────────────┘ └──────────────────┘
        ▲                 ▲
        │                 │
        └────────┬────────┘
                 │ N:1
        ┌────────┴────────┐
        │      User       │
        └─────────────────┘
```

1. **`User` (1) ── (N) `Notice`:** An administrator user can author notices. If the author user account is removed, `createdById` is set to NULL (`SetNull`) so institutional notices are not lost.
2. **`Notice` (1) ── (N) `NoticeAttachment`:** A single notice can contain zero or more file attachments. Deletion of a notice cascades (`Cascade`) and deletes all associated attachment records and files.
3. **`User` & `Notice` ── `NoticeAcknowledgement` (`M : N` Join Table):** A student can acknowledge multiple notices; each notice can be acknowledged by multiple students. A unique constraint on `[noticeId, userId]` guarantees a student can only acknowledge each notice once.
4. **`User` & `Notice` ── `NoticeBookmark` (`M : N` Join Table):** A student can bookmark multiple notices. A unique constraint on `[noticeId, userId]` prevents duplicate bookmarks.
5. **`Notice` (1) ── (N) `BannerEvent` (Optional):** An event banner can optionally associate with an official notice circular via `noticeId` (`SetNull` on delete).
6. **`User` (1) ── (N) `BannerEvent`:** Admin author tracking.
7. **`User` (1) ── (N) `CollegeDocument`:** Admin uploader tracking.

---

## 7. Authentication and Authorization Requirements

### 7.1 JWT Token Strategy
- **Access Tokens:** Signed using `jsonwebtoken` with secret `JWT_SECRET`, expiring in 1 hour. Carries payload:
  ```json
  {
    "id": "uuid",
    "username": "admin",
    "email": "admin@icem.ac.in",
    "role": "ADMIN",
    "department": "Administration"
  }
  ```
- **Refresh Tokens:** Signed using `JWT_REFRESH_SECRET`, expiring in 7 days, stored in the database or secure HTTP-only cookies to renew access tokens.

### 7.2 Password Security
- Passwords hashed using `bcrypt` (10 to 12 salt rounds) prior to database insertion.
- Passwords are never returned in responses or logged in console/log streams.

### 7.3 Middleware Architecture
1. **`authenticateJWT`:**
   - Reads `Authorization: Bearer <token>` header.
   - Verifies signature and expiration.
   - Verifies user existence in database.
   - Injects sanitized user object into `req.user`.
2. **`optionalAuth`:**
   - Inspects `Authorization` header if present.
   - If present and valid, attaches `req.user`.
   - If absent, continues execution as a guest. This allows unauthenticated students to browse notices publicly while allowing logged-in students to see their personal bookmark/acknowledgement flags.
3. **`requireRole(roles: Role[])`:**
   - Checks `req.user.role`.
   - Returns `403 Forbidden` if user role does not match requirements.

---

## 8. Roles and Permissions Required

| Action / Capability | GUEST (Unauthenticated) | STUDENT (Authenticated) | ADMIN (Authenticated) |
|---|:---:|:---:|:---:|
| Browse & search published notices | Yes | Yes | Yes |
| View notice details & calendar | Yes | Yes | Yes |
| Download attachments & official documents | Yes | Yes | Yes |
| View active banners & campus events | Yes | Yes | Yes |
| Subscribe email newsletter | Yes | Yes | Yes |
| Acknowledge notice | No | Yes | Yes (Test) |
| Bookmark notice & view saved list | No | Yes | No |
| Create, edit, and delete notices | No | No | Yes |
| Toggle notice status (Publish / Archive) | No | No | Yes |
| View archived notices in workbench | No | No | Yes |
| Upload notice attachments | No | No | Yes |
| Manage banners (Create, Edit, Toggle, Delete, Reset) | No | No | Yes |
| Upload & delete official documents | No | No | Yes |

---

## 9. File-Upload Requirements

### 9.1 Current Frontend Implementation
- **Admin Notice Workbench:** Currently files selected in [`AdminNoticeWorkbench.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminNoticeWorkbench.tsx) are processed only in browser memory, extracting `{ name: file.name, size: formattedSize, type: fileType }`. No actual binary file is uploaded or persisted.
- **Admin Banner Manager:** Currently in [`AdminBannerManager.tsx`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/views/AdminBannerManager.tsx), uploaded images are converted to large Base64 data strings using `FileReader.readAsDataURL(file)`. This causes localStorage bloat and is inefficient for network transmission.

### 9.2 Backend Multer Specification
- **Engine:** `multer.diskStorage` storing files in structured local directories:
  - `uploads/notices/` (Notice circular attachments: PDF, DOC, XLS, images)
  - `uploads/banners/` (Banner cover graphics: JPG, PNG, WEBP)
  - `uploads/documents/` (Official institutional forms: PDF, DOC)
- **File Validation:**
  - Allowed MIME types:
    - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`
    - Images: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
  - Max file size:
    - Attachments: 15MB per file (up to 5 files per notice).
    - Banner images: 5MB per file.
- **Naming Convention:** Unique sanitized naming: `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`.
- **Static Delivery:** Served via `express.static(path.join(__dirname, '../uploads'))` with appropriate headers:
  - Inline preview for PDFs and Images (`Content-Disposition: inline`).
  - Attachment download trigger for documents (`Content-Disposition: attachment; filename="..."`).

---

## 10. Recommended Backend Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma             # Complete Prisma ORM schema
│   ├── seed.ts                   # Seed script populating default admin, notices & presets
│   └── migrations/               # Prisma migration history
├── src/
│   ├── config/
│   │   ├── env.ts                # Validated environment variables (Zod/dotenv)
│   │   ├── prisma.ts             # Prisma client singleton instance
│   │   └── constants.ts          # Default categories, departments, roles
│   ├── controllers/
│   │   ├── auth.controller.ts    # Login, registration, token refresh, me
│   │   ├── notice.controller.ts  # CRUD notices, stats, calendar, action items
│   │   ├── student.controller.ts # Bookmarks, acknowledgements
│   │   ├── banner.controller.ts  # CRUD banners, active toggle, presets reset
│   │   ├── document.controller.ts# College documents & forms
│   │   ├── timetable.controller.ts# Academic timetable schedules
│   │   ├── subscription.controller.ts # Email subscriptions
│   │   └── upload.controller.ts  # File upload handlers (Multer)
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # authenticateJWT, optionalAuth
│   │   ├── role.middleware.ts    # requireRole(['ADMIN', 'STUDENT'])
│   │   ├── upload.middleware.ts  # Multer storage, size limits & mime-type filters
│   │   ├── validate.middleware.ts# Request body validation (Zod schemas)
│   │   └── error.middleware.ts   # Centralized error & 404 handler
│   ├── routes/
│   │   ├── index.ts              # API router mounting /api/v1/*
│   │   ├── auth.routes.ts
│   │   ├── notice.routes.ts
│   │   ├── student.routes.ts
│   │   ├── banner.routes.ts
│   │   ├── document.routes.ts
│   │   ├── timetable.routes.ts
│   │   ├── subscription.routes.ts
│   │   └── upload.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── notice.service.ts
│   │   ├── banner.service.ts
│   │   └── file.service.ts
│   ├── types/
│   │   ├── express.d.ts          # Augmented Express.Request with req.user
│   │   └── index.ts              # Shared TypeScript interfaces & DTOs
│   ├── utils/
│   │   ├── jwt.ts                # Token sign, verify & refresh helpers
│   │   ├── password.ts           # bcrypt hash & compare helpers
│   │   └── apiResponse.ts        # Standardized JSON response helpers
│   ├── app.ts                    # Express app configuration (CORS, Helmet, JSON, static)
│   └── server.ts                 # HTTP server bootstrap & graceful shutdown
├── uploads/                      # Uploaded files directory (.gitignore except .gitkeep)
│   ├── notices/
│   ├── banners/
│   └── documents/
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 11. Missing, Inconsistent, or Unclear Requirements

Before implementing the shared backend, please review these essential discrepancies found across the two frontends:

### 11.1 Student Authentication & Account Creation
- **Observation:** The Student Portal has no Student Login or Registration page. The only login page in the Student Portal is `AdminLoginView` (which redirects to the Admin Portal). However, the Student Portal contains features that logically require an authenticated student identity (such as *Acknowledge Notice* and *Bookmark Notice*).
- **Question for Decision:** 
  1. Do you want to keep the Student Portal completely open/public without a student login requirement (with bookmarks/acknowledgements saved in localStorage)?  
  2. Or do you want us to add a simple Student Login/Signup modal or screen so that student bookmarks and acknowledgements are saved to the PostgreSQL database per student?

### 11.2 Notice Field Name Discrepancies
- **Important flag:**
  - Admin Portal uses `isImportant: boolean` ([`adminNotice.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/types/adminNotice.ts#L32)).
  - Student Portal uses `important: boolean` ([`notice.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/types/notice.ts#L62)).
- **Urgent flag:**
  - Admin Portal uses `isUrgent: boolean` ([`adminNotice.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Admin%20Portal/src/types/adminNotice.ts#L33)).
  - Student Portal uses `urgent: boolean` ([`notice.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/types/notice.ts#L63)).
- **Content vs. FullBody:**
  - Admin Portal generates HTML string in `content` using `RichTextEditor`.
  - Student Portal supports both `content` (string) and `fullBody` (a structured object with `salutation`, `introduction`, `sections: [{ title, items, paragraphs }]`, and `callout`).
- **Proposed Solution:** The backend model will standardize on `isImportant` and `isUrgent`, and provide both `content` (HTML) and optional `fullBody` (JSON) to guarantee backward compatibility with both frontends.

### 11.3 Notice Category Naming Discrepancies
- **Admin Portal categories:** `Academics`, `Examination`, `Placement & Training`, `Events & Cultural`, `Administration`.
- **Student Portal categories:** `Academic`, `Examination` (or `Exam`), `Placement`, `Events`, `Administrative` (or `Admin`), `General`, `Sports`, `Library`.
- **Proposed Solution:** Standardize backend storage using canonical category strings (e.g. `Academics`, `Examination`, `Placement`, `Events`, `Administration`, `Sports`, `Library`) and add a mapping layer so filtering works identically across both applications.

### 11.4 Department Keys Discrepancy
- **Admin Portal department keys:** `tpo`, `exam`, `comp`, `it`, `admin`, `all`.
- **Student Portal department keys:** `ce`, `it`, `mech`, `civil`, `all`.
- **Proposed Solution:** Unify department keys into a comprehensive list: `tpo`, `exam`, `admin`, `comp` (or `ce`), `it`, `mech`, `civil`, `all`.

### 11.5 Banner vs. Event Unification
- Admin Portal manages `DashboardBanner` (fields: `id`, `title`, `tag`, `image`, `shortDescription`, `registrationUrl`, `actionText`, `deadlineText`, `startDate`, `endDate`, `venue`, `status`, `isActive`).
- Student Portal has `FeaturedEvents` (dashboard banner) AND `EventsCultureView` (which expects additional fields: `category`, `longDescription`, `time`, `noticeId`).
- **Proposed Solution:** The `BannerEvent` database table will store all combined fields so the Admin Portal can manage items for both the Student Dashboard Carousel and the dedicated Events & Culture page.

### 11.6 Secondary Data Sources (Documents & Timetable)
- In the Student Portal, `mockCollegeDocuments` (forms for download) and `mockScheduleItems` (weekly timetable) are currently static hardcoded arrays in [`Student/src/data/mockNotices.ts`](file:///c:/Users/kaustubh/OneDrive/Attachments/Desktop/NEW%20NOTICE%20PROJECT/Updated-Notice/Student/src/data/mockNotices.ts).
- Should these be seeded into the PostgreSQL database and made fully dynamic via the backend?
