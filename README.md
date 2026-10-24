# RepairBharat 🛠️

**India's Repair Operating System** — a full-stack SaaS platform for electronics repair shops. Manage franchised branches, technician workflows, GST-compliant billing, inventory, and real-time customer tracking from one dashboard.

> **Live demo:** https://quikx.live

---

## Table of Contents

1. [What It Is](#what-it-is)
2. [System Architecture](#system-architecture)
3. [Module Map](#module-map)
4. [Signal Flow: Ticket → Notification](#signal-flow-ticket--notification)
5. [Quick Start (Docker)](#quick-start-docker)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Frontend Guide](#frontend-guide)
9. [Database & Migrations](#database--migrations)
10. [Role System](#role-system)
11. [Key Configuration Files](#key-configuration-files)
12. [Sandbox Credentials](#sandbox-credentials)
13. [PWA & Offline](#pwa--offline)
14. [Deployment Notes](#deployment-notes)

---

## What It Is

RepairBharat is a multi-role ERP + B2C portal for repair shop chains:

| Role | What they can do |
|---|---|
| **Customer** | Book repairs, track ticket status in real-time via QR code or link, view device history, receive SMS/in-app notifications |
| **Technician** | Claim repair jobs, move tickets through workflow stages, log diagnostic notes, submit join requests to shops |
| **Shop Owner** | Manage branches, approve technicians, create GST-compliant invoices, track inventory, view analytics, create walk-in tickets |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                          │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   frontend   │    │   backend    │    │   postgres    │  │
│  │  React/Vite  │◄──►│ Django DRF   │◄──►│   database    │  │
│  │  port 8001   │    │  port 8000   │    │  port 5432    │  │
│  └──────────────┘    └──────────────┘    └───────────────┘  │
│        Nginx                                                  │
│   (serves /dist)                                             │
│   proxies /api/,                                             │
│   /accounts/, /admin/ → Django                               │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19 + Vite 8, Tailwind CSS (CDN), PWA with service worker
- **Backend**: Django 5 + DRF + SimpleJWT, PostgreSQL, Gunicorn, Whitenoise
- **Auth**: JWT access tokens stored in `localStorage` as `{ key: "<access_token>" }`
- **Notifications**: In-app (database-backed) + optional SMS via Fast2SMS API

---

## Module Map

### Backend (`/backend/`)

```
RepairBharat/          Django project root
├── settings.py        All configuration (DB, JWT, CORS, FAST2SMS, installed apps)
└── urls.py            Root URL dispatcher

accounts/              Custom user model, auth, role profiles
├── models.py          CustomUser, ShopOwnerProfile, TechnicianProfile (legacy)
├── views.py           Register, Login, Profile, ChangePassword, CustomerListView
├── serializers.py     RegisterSerializer, UserSerializer
└── urls.py            /accounts/register/, /accounts/login/, /accounts/profile/

organizations/         Franchise branches
├── models.py          Organization, Branch (GPS coords, specialties, GST number, rating)
├── views.py           OrganizationListCreate, BranchListCreate
│                      (Google Places enrichment when GOOGLE_PLACES_API_KEY is set)
└── urls.py            /api/orgs/organizations/, /api/orgs/branches/

providers/             Technician profiles & shop join requests
├── models.py          Skill, Technician, TechnicianJoinRequest
├── views.py           TechnicianListCreate, JoinRequestListCreateUpdate, ShopOwnerLookup
│                      TechnicianDetailView
└── urls.py            /api/providers/technicians/, /api/providers/join-requests/,
                       /api/providers/shops/

repairs/               Core repair order lifecycle
├── models.py          RepairOrder (ticket_number, status, device, customer, branch, tech)
│                      RepairOrderHistory (stage audit trail — triggers notifications)
├── views.py           RepairOrderListCreate, RepairOrderDetail,
│                      PublicRepairOrderTrackView
└── urls.py            /api/repairs/orders/, /api/repairs/orders/<id>/,
                       /api/repairs/track/<ticket_number>/

billing/               GST invoicing
├── models.py          GSTInvoice (labor_charges, CGST, SGST, grand_total,
│                                  manual_items JSON, shop_gstin, payment_status)
├── views.py           GSTInvoiceListCreate, GSTInvoiceDetail
│                      (shop_owner/technician only; customers cannot create invoices)
└── urls.py            /api/billing/invoices/, /api/billing/invoices/<id>/

inventory/             Spare parts catalogue
├── models.py          InventoryItem (branch-scoped, HSN code, GST rate,
│                                     stock_level, low_stock_threshold)
├── views.py           InventoryItemListCreate, InventoryItemDetail
└── urls.py            /api/inventory/items/, /api/inventory/items/<id>/

devices/               Customer device registry
├── models.py          Device (customer FK, brand, model, category, serial/IMEI)
├── views.py           DeviceListCreate, DeviceDetailView (GET/PATCH/DELETE)
└── urls.py            /api/devices/, /api/devices/<id>/

workflow/              Pipeline stage definitions
├── models.py          WorkflowStage (code, name, order, color_hex, is_terminal)
├── views.py           WorkflowStageListCreate (write = shop_owner only)
└── urls.py            /api/workflow/stages/

notifications/         In-app + SMS notifications
├── models.py          Notification (recipient FK, type, title, body, is_read, metadata)
├── services.py        send_repair_status_notification() — Fast2SMS HTTP integration
├── signals.py         post_save(RepairOrderHistory) → calls services.py
├── views.py           NotificationListView, mark_all_read, unread_count
│                      (get_queryset evaluates to list to avoid DRF sliced-QS crash)
└── urls.py            /api/notifications/, /api/notifications/mark-read/,
                       /api/notifications/unread-count/

analytics/             Shop owner KPI endpoints
├── views.py           revenue_over_time, ticket_status_summary,
│                      technician_performance, low_stock_summary, dashboard_kpis
└── urls.py            /api/analytics/revenue/, /api/analytics/tickets/status-summary/,
                       /api/analytics/technicians/performance/,
                       /api/analytics/inventory/low-stock/, /api/analytics/kpis/

core/                  Shared utilities
├── models.py          TimeStampedModel (abstract base), ActivityLog (audit trail)
├── audit.py           log_action() — safe anywhere, never raises exceptions
├── permissions.py     IsOwnerOfRepairOrder, IsOwnerOfInventoryItem,
│                      IsOwnerOfInvoice, IsOwnerOfTechnicianRecord
└── urls.py            /api/audit-log/ (shop_owner only, last 200 ActivityLog entries)
```

### Frontend (`/frontend/src/`)

```
App.jsx                Route definitions, ProtectedRoute guard
main.jsx               Entry point — BrowserRouter, StrictMode, UserContextProvider

pages/
├── login.jsx              JWT login form
├── Signup.jsx             Multi-role registration
├── TrackTicket.jsx        Public ticket tracker (no auth, polls every 5s)
├── DeviceManagement.jsx   Customer device registry (add / delete devices)
└── dashboard/
    ├── index.jsx              Role router → CustomerDashboard / ShopOwnerDashboard / TechnicianDashboard
    ├── CustomerDashboard.jsx  Book repairs, track tickets, browse nearby workshops
    ├── ShopOwnerDashboard.jsx ERP: tickets, billing, inventory, analytics, technicians, branches
    └── TechnicianDashboard.jsx Repair queue, diagnostics, join requests, billing

components/
├── layout/
│   ├── Navbar.jsx         Top bar; notification bell polls /api/notifications/unread-count/ every 30s
│   └── Sidebar.jsx        Tab navigation (role-aware)
├── ui/
│   ├── Modal.jsx          Base modal — default export + named export { Modal }
│   ├── StatusBadge.jsx    Colored status pill
│   ├── Spinner.jsx        Loading spinner
│   └── EmptyState.jsx     Empty state with optional CTA button
├── tickets/
│   ├── QrSuccessModal.jsx      QR code displayed on ticket creation
│   ├── StageTransitionModal.jsx Notes prompt before stage move (prop: notesInput)
│   └── WalkinModal.jsx         Walk-in ticket creation
├── branches/
│   ├── BookingModal.jsx        Customer repair booking
│   └── CreateBranchModal.jsx   Shop owner branch creation
├── billing/
│   ├── CreateInvoiceModal.jsx  GST invoice linked to ticket (prop: activeTicket)
│   └── InvoicePrintView.jsx    Print-ready invoice preview, reads manual_items JSON
├── inventory/
│   └── AddInventoryModal.jsx   Register spare part to branch
└── analytics/
    └── AnalyticsDashboard.jsx  KPI cards, donut chart, bar chart, tech performance table

services/
├── api.jsx        Axios instance with JWT interceptor + all exported API functions
├── contexts.jsx   UserContext (user object, login(), logout())
└── index.js       Re-exports useUserContext from contexts

hooks/
└── usePolling.js  Interval polling hook — auto-cancels on unmount

utils/
└── status.js      getStatusLabelAndColor(code, stages), formatRupee(value)
```

---

## Signal Flow: Ticket → Notification

```
1.  PATCH /api/repairs/orders/<id>/   { status_code: "in_repair", stage_notes: "..." }
          │
          ▼
2.  RepairOrderDetailView.perform_update()
    → resolves WorkflowStage from status_code
    → serializer.save()   (updates ticket status)
    → creates RepairOrderHistory(repair_order, stage, notes, updated_by)
          │
          ▼  (Django post_save signal)
3.  notifications.signals.notify_on_stage_change()
    → send_repair_status_notification(repair_order, new_stage_name)
          │
          ├──► Creates Notification(type=in_app) in database
          │    (visible at GET /api/notifications/)
          │
          └──► If FAST2SMS_API_KEY set AND customer.phone exists:
               POST https://www.fast2sms.com/dev/bulkV2
               Creates Notification(type=sms, status=sent) on success
```

---

## Quick Start (Docker)

### Prerequisites

- Docker + Docker Compose v2
- (Optional) Node 22 via nvm for local frontend dev

### 1. Clone & Configure

```bash
git clone https://github.com/PrakashKumarSahu/RepairBharat.git
cd RepairBharat
cp .env.example .env    # fill in your values (see Environment Variables below)
```

### 2. Build & Start

```bash
docker compose up --build
```

On first start this will:
- Launch PostgreSQL
- Run all Django migrations (all apps including `notifications` and `core`)
- Run `seed_data.py` to create default WorkflowStages
- Start Gunicorn on port 8000
- Build the Vite frontend and serve it via Nginx on port 8001

### 3. Access

| Service | URL |
|---|---|
| Frontend (SPA) | http://localhost:8001 |
| Django Admin | http://localhost:8001/admin/ |
| DRF Browsable API | http://localhost:8001/api/ |

### 4. Create Superuser (one-time)

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Environment Variables

Set in your `.env` file (or as real env vars). See `docker-compose.yml` for how they're injected into the `backend` service.

| Variable | Required | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | ✅ | Django secret key — generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DATABASE_NAME` | ✅ | PostgreSQL database name |
| `DATABASE_USER` | ✅ | PostgreSQL username |
| `DATABASE_PASSWORD` | ✅ | PostgreSQL password |
| `DATABASE_HOST` | ✅ | PostgreSQL host (`db` inside Docker Compose) |
| `DATABASE_PORT` | ✅ | PostgreSQL port (default: `5432`) |
| `FAST2SMS_API_KEY` | ⬜ | Fast2SMS API key for SMS notifications — leave blank to disable SMS |
| `GOOGLE_PLACES_API_KEY` | ⬜ | Google Places key to enrich branch listings with nearby shops from Google Maps — leave blank to show only local DB shops |
| `DJANGO_DEBUG` | ⬜ | `True` for development only. Never set in production. |

### CORS

Configured in `backend/RepairBharat/settings.py`. Add your domain to `CORS_ALLOWED_ORIGINS`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8001",
    "https://quikx.live",
    "https://www.quikx.live",
    # add your domain here
]
CORS_ALLOW_CREDENTIALS = True
```

> **Note**: `CORS_ALLOW_ALL_ORIGINS` and `CORS_ALLOW_CREDENTIALS` cannot both be `True` — browsers reject such responses. The explicit allowlist is used instead.

---

## API Reference

All endpoints require `Authorization: Bearer <access_token>` unless marked **Public**.

### Auth — `/accounts/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts/register/` | Public | Create account — body: `{username, password, email, phone, role}` |
| POST | `/accounts/login/` | Public | Obtain JWT tokens — returns `{access, refresh}` |
| GET | `/accounts/profile/` | ✅ | Current user profile |
| POST | `/accounts/change-password/` | ✅ | Change password — body: `{old_password, new_password}` |
| GET | `/accounts/customers/` | shop_owner / tech | List all customer accounts |
| POST | `/api/token/refresh/` | Public | Refresh access token — body: `{refresh}` |

### Organizations — `/api/orgs/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/orgs/organizations/` | shop_owner | List own orgs / create org |
| GET | `/api/orgs/branches/` | Public | List branches (enriched with Google Places if key set) |
| POST | `/api/orgs/branches/` | shop_owner | Create branch (auto-creates org if none exists) |

**Branch list query params**: `?all=true`, `?city=Mumbai`, `?specialty=Mobiles`, `?search=xyz`

### Repairs — `/api/repairs/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/repairs/orders/` | ✅ | List tickets (scoped by role) / Create ticket |
| GET/PATCH/DELETE | `/api/repairs/orders/<id>/` | ✅ | Ticket detail / update stage / delete |
| GET | `/api/repairs/track/<ticket_number>/` | Public | Public ticket tracking (no auth needed) |

**Create ticket body**: `branch` (required), `device_brand`, `device_model`, `device_category`, `device_serial`, `issue_reported`, `priority` (`low`/`medium`/`high`), `estimated_cost`, `advance_paid`, `device_image`, `customer` (shop_owner only — customer user ID)

**Update ticket body**: `status_code` (stage code), `stage_notes`, `assigned_technician` (Technician ID), `diagnostics_notes`, `estimated_cost`

### Providers — `/api/providers/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/providers/technicians/` | ✅ | List technicians / create technician profile |
| GET/PATCH/DELETE | `/api/providers/technicians/<id>/` | ✅ | Technician detail |
| GET | `/api/providers/shops/` | ✅ | Search shops — `?search=<name or ID>` |
| GET/POST | `/api/providers/join-requests/` | ✅ | List join requests / submit request (technician only) |
| PATCH | `/api/providers/join-requests/` | shop_owner | Approve/reject — body: `{request_id, status: "approved"\|"rejected"}` |

### Billing — `/api/billing/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/billing/invoices/` | shop_owner / tech | List invoices / create invoice |
| GET/PATCH/DELETE | `/api/billing/invoices/<id>/` | ✅ | Invoice detail |

**Create invoice body**: `ticket` (RepairOrder ID; omit for manual invoice), `labor_charges`, `labor_gst_rate`, `payment_method` (`upi`/`cash`/`card`/`net_banking`), `payment_status` (`paid`/`unpaid`), `shop_gstin`, `customer_gstin`, `billing_address`, `spares_used` (array of `{id, quantity}` — deducts from inventory stock), `manual_items` (JSON array of `{name, hsn, price, qty, gst_rate}` for manual invoices)

When a ticket invoice is created: `payment_status=paid` → ticket moves to `delivered`; `payment_status=unpaid` → ticket moves to `ready`.

### Inventory — `/api/inventory/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/inventory/items/` | shop_owner / tech | List/create items |
| GET/PATCH/DELETE | `/api/inventory/items/<id>/` | ✅ | Item detail |

**Create item body**: `branch`, `name`, `sku`, `category`, `selling_price`, `purchase_price`, `stock_level`, `low_stock_threshold`, `hsn_code`, `gst_rate`, `image`

### Devices — `/api/devices/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/devices/` | ✅ | List devices / register device |
| GET/PATCH/DELETE | `/api/devices/<id>/` | ✅ | Device detail / update / delete |

Customers see only their own devices; shop_owner/technician see all.

### Workflow — `/api/workflow/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workflow/stages/` | Public | List all stages ordered by `order` |
| POST | `/api/workflow/stages/` | shop_owner | Create custom stage |

**Built-in stage codes** (seeded by `seed_data.py`):

```
received → diagnosing → waiting_approval → in_repair → testing → ready → delivered
                                                                        ↘ cancelled
```

The `color_hex` field (not `color`) holds the hex colour string for each stage.

### Notifications — `/api/notifications/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/` | ✅ | Last 50 notifications for current user |
| POST | `/api/notifications/mark-read/` | ✅ | Mark all as read → `{status: "ok"}` |
| GET | `/api/notifications/unread-count/` | ✅ | Returns `{count: N}` |

### Analytics — `/api/analytics/` *(shop_owner only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/kpis/` | Total/open tickets, revenue, low-stock count |
| GET | `/api/analytics/revenue/?range=30d` | Daily paid revenue (`range`: `30d` or `90d`) |
| GET | `/api/analytics/tickets/status-summary/` | Ticket counts grouped by status_code |
| GET | `/api/analytics/technicians/performance/` | Per-technician closed ticket count |
| GET | `/api/analytics/inventory/low-stock/` | Items where stock ≤ low_stock_threshold |

### Audit Log — `/api/audit-log/` *(shop_owner only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit-log/` | Last 200 ActivityLog entries (action, resource, ip, timestamp) |

---

## Frontend Guide

### Authentication Flow

1. Login → `POST /accounts/login/` → store `{ key: access_token }` in `localStorage["token"]`
2. `UserContextProvider` reads token on mount → `GET /accounts/profile/` → sets `user` state
3. All API calls go through the `api` Axios instance (`src/services/api.jsx`) which injects `Authorization: Bearer <token>` via request interceptor
4. Logout → `localStorage.removeItem('token')` + redirect to `/login`

### Role-Based Dashboard Routing

`/dashboard` renders `pages/dashboard/index.jsx`, which dispatches by `user.role`:

```
customer    → CustomerDashboard.jsx
shop_owner  → ShopOwnerDashboard.jsx
technician  → TechnicianDashboard.jsx
```

### All API Functions (`src/services/api.jsx`)

Functions return data directly (unwrapped from Axios response):

```js
// Branches & Workflow
fetchBranches(filters, userCoords?)   // GET /api/orgs/branches/
fetchStages()                          // GET /api/workflow/stages/

// Tickets
fetchTickets()                         // GET /api/repairs/orders/
createTicket(data)                     // POST /api/repairs/orders/
updateTicket(id, data)                 // PATCH /api/repairs/orders/<id>/
fetchPublicTicket(ticketNumber)        // GET /api/repairs/track/<number>/ (no auth)

// Technicians & Shops
fetchTechnicians()                     // GET /api/providers/technicians/
updateTechnician(id, data)             // PATCH /api/providers/technicians/<id>/
fetchJoinRequests()                    // GET /api/providers/join-requests/
updateJoinRequest(id, status)          // PATCH /api/providers/join-requests/

// Billing & Inventory
fetchInvoices()                        // GET /api/billing/invoices/
createInvoice(data)                    // POST /api/billing/invoices/
fetchInventory(branchId?)              // GET /api/inventory/items/
addInventoryItem(data)                 // POST /api/inventory/items/

// Customers
fetchCustomers()                       // GET /api/accounts/customers/

// Devices
fetchDevices()                         // GET /api/devices/
createDevice(data)                     // POST /api/devices/
deleteDevice(id)                       // DELETE /api/devices/<id>/

// Notifications
fetchNotifications()                   // GET /api/notifications/
fetchUnreadNotificationCount()         // GET /api/notifications/unread-count/
markNotificationsRead()                // POST /api/notifications/mark-read/

// Analytics (shop_owner only)
fetchAnalyticsKPIs()                   // GET /api/analytics/kpis/
fetchRevenueOverTime(range)            // GET /api/analytics/revenue/
fetchTicketStatusSummary()             // GET /api/analytics/tickets/status-summary/
fetchTechnicianPerformance()           // GET /api/analytics/technicians/performance/
fetchLowStockSummary()                 // GET /api/analytics/inventory/low-stock/
fetchActivityLog()                     // GET /api/audit-log/

// Branches
createBranch(data)                     // POST /api/orgs/branches/
```

### Status Utilities (`src/utils/status.js`)

```js
import { getStatusLabelAndColor, formatRupee } from '../utils/status';

// Returns { label: string, color: string }
// Prefers live stage data from API; falls back to hardcoded defaults
// NOTE: backend field is color_hex (not 'color')
const { label, color } = getStatusLabelAndColor('in_repair', stages);

// Returns '₹1,23,456.00'
const text = formatRupee(invoice.grand_total);
```

### Polling Hook (`src/hooks/usePolling.js`)

```js
import { usePolling } from '../hooks/usePolling';

// Runs fn every intervalMs; cleans up automatically on unmount
usePolling(async () => {
    const tickets = await fetchTickets();
    setTickets(tickets);
}, 10000);
```

### Key Prop Contracts

| Component | Critical props |
|---|---|
| `StageTransitionModal` | `notesInput` (string), `onNotesChange` (fn), `stageCode`, `stages`, `onSubmit` |
| `CreateInvoiceModal` | `activeTicket` (object), `inventory`, `laborCharges`, `onSubmit` |
| `InvoicePrintView` | `invoice` object with: `invoice_number`, `created_at`, `labor_charges`, `manual_items` (JSON string), `cgst`, `sgst`, `grand_total`, `billing_address`, `shop_gstin`, `payment_status`, `payment_method` |

---

## Database & Migrations

### Running Migrations

Migrations run automatically at container start. To run manually:

```bash
docker compose exec backend python manage.py migrate
```

### Creating Migrations After Model Changes

```bash
docker compose exec backend python manage.py makemigrations <app_name>
docker compose exec backend python manage.py migrate
```

### All Apps With Migrations

```
accounts, billing, core, devices, inventory,
notifications, organizations, providers, repairs, workflow
```

### Key Model Relationships

```
CustomUser (accounts)
  ├── ShopOwnerProfile — 1:1 (role=shop_owner)
  │     └── Organization — FK owner
  │           └── Branch — FK organization (GPS, specialties, rating)
  ├── Technician (providers) — the authoritative tech profile
  │     ├── FK → ShopOwnerProfile (shop)
  │     └── FK → Branch
  └── Device[] — FK customer

RepairOrder (repairs)
  ├── FK → Branch
  ├── FK → CustomUser (customer)
  ├── FK → Device
  ├── FK → WorkflowStage (current status) — field: color_hex
  ├── FK → Technician (assigned_technician)
  └── RepairOrderHistory[] — stage audit trail (triggers notifications via signal)

GSTInvoice (billing)
  └── OneToOne → RepairOrder (ticket, nullable — null = manual invoice)

InventoryItem (inventory)
  └── FK → Branch

Notification (notifications)
  └── FK → CustomUser (recipient)

ActivityLog (core)
  └── FK → CustomUser (user, nullable)
```

---

## Role System

Roles are set at registration and stored on `CustomUser.role`:

| Code | Description | Profile model |
|---|---|---|
| `customer` | Books repairs, tracks tickets | None (just CustomUser) |
| `shop_owner` | Manages branches, billing, inventory, technicians | `ShopOwnerProfile` (auto-created on register) |
| `technician` | Works repair queue, logs diagnostics | `Technician` (auto-created via signal on register) |

### Technician Onboarding Flow

1. Register with `role=technician` — `Technician` profile auto-created
2. Search shops: `GET /api/providers/shops/?search=<name or ID>`
3. Submit join request: `POST /api/providers/join-requests/` with `{shop: <id>}`
4. Shop owner approves: `PATCH /api/providers/join-requests/` with `{request_id, status: "approved"}`
5. On approval: `Technician.shop`, `Technician.branch`, and `Technician.is_verified=True` are all set automatically

---

## Key Configuration Files

| File | Purpose |
|---|---|
| `backend/RepairBharat/settings.py` | Django settings: DB, JWT, CORS (explicit allowlist), INSTALLED_APPS, FAST2SMS_API_KEY, GOOGLE_PLACES_API_KEY |
| `backend/RepairBharat/urls.py` | Root URL dispatcher — all app URL includes |
| `backend/seed_data.py` | Seeds 8 default WorkflowStage records on first run |
| `docker-compose.yml` | Service definitions, port mapping, volume mounts, env var injection |
| `frontend/vite.config.js` | Vite build config — manual chunk splits (vendor-react, vendor-axios, vendor-toast) |
| `frontend/index.html` | PWA manifest link, Material Symbols font (CDN), Tailwind CSS (CDN), SW registration script |
| `frontend/public/manifest.json` | PWA manifest (name, icons at `/icons/icon-192.png` + `icon-512.png`, theme `#00288e`) |
| `frontend/public/sw.js` | Service worker — network-first for `/api/` + `/accounts/`; cache-first for static assets |

---

## Sandbox Credentials

> ⚠️ Change all passwords before any public deployment.

Register test accounts via the signup page or via the API, or create them in Django Admin after running `createsuperuser`:

```
Customer:     role=customer,    username=testcustomer,  password=Test@1234
Technician:   role=technician,  username=testtech,      password=Test@1234
Shop Owner:   role=shop_owner,  username=testshop,      password=Test@1234
```

The `seed_data.py` script creates a default organization and branch linked to the first `shop_owner` account it finds.

---

## PWA & Offline

RepairBharat is installable as a Progressive Web App:

- **Manifest**: `/public/manifest.json` — standalone display, theme `#00288e`
- **Service Worker**: `/public/sw.js`
  - API calls (`/api/`, `/accounts/`): **network-first** — returns `{error: "offline"}` JSON when network unavailable
  - Static assets: **cache-first** — served from `repairbharat-v1` cache
- **Install**: open https://quikx.live in Chrome/Edge → "Add to Home Screen"

To use real icons, replace the placeholder files at:
```
frontend/public/icons/icon-192.png   (192×192 px)
frontend/public/icons/icon-512.png   (512×512 px)
```

---

## Deployment Notes

### Production Checklist

- [ ] Set `DJANGO_SECRET_KEY` to a strong random value
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Update `CORS_ALLOWED_ORIGINS` with your domain
- [ ] Update `ALLOWED_HOSTS` in `settings.py` with your domain
- [ ] Set `FAST2SMS_API_KEY` if SMS notifications are needed
- [ ] Replace placeholder icons in `/public/icons/` with real PNGs
- [ ] Run `python manage.py collectstatic` (happens automatically in container)

### Nginx Proxy Rules

The Nginx config in the frontend container proxies:
- `/api/` → Django backend (port 8000)
- `/accounts/` → Django backend
- `/admin/` → Django backend
- All other paths → `/dist/index.html` (React SPA catch-all for client-side routing)

### Static Files

Whitenoise serves Django static files directly from Gunicorn (no separate static server needed). Files are collected to `backend/staticfiles/` at container start.

---

## Commit History

| Commit | Description |
|---|---|
| `ac64eec` | fix(audit): resolve 50 backend + 34 frontend issues — migrations, CORS, prop bugs, security |
| `515aabf` | docs: comprehensive README (first pass) |
| `0c685c6` | feat(phase4-backend): SMS notifications, analytics API, audit log, ActivityLog model |
| `01d08d5` | feat(phase4-frontend): PWA, notification bell, analytics tab, device management |
| `c7e352a` | feat(phase2): role-based dashboards, modal fixes, vite manualChunks |
| `0f37687` | feat(phase2+3): modularize UI components + backend cleanup |
| `93c1522` | fix(phase1): 12 critical bug fixes |

---

*Built by [PrakashKumarSahu](https://github.com/PrakashKumarSahu) · RepairBharat · India's Repair OS*
