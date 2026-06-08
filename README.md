See live website - quikx.live
# 🛠️ RepairBharat - Enterprise Decoupled B2C & B2B Repair Operating System

RepairBharat is a production-grade, multi-franchise "Repair Operating System" designed to optimize, track, and scale electronic device repair services across India. Seamlessly connecting B2C Customers, B2B Shop Owners, and Bench Technicians, the platform supports real-time Kanban milestone pipeline transition rules, automated spares inventory warnings, and CGST/SGST-compliant billing.

---

## 🚀 Key Technological Innovations

### 1. Google Places API & Proximity Telemetry
To support zero-latency, high-trust workshop discovery, the customer Discovery portal features robust integration with Google Places API coordinates:
* **Spherical Distance Approximation**: Uses the **Spherical Law of Cosines** to calculate spatial distances (in kilometers) between the customer's coordinates (defaulted to Central Mumbai) and verified repair branches:
  $$d = \arccos(\sin(\phi_1)\sin(\phi_2) + \cos(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)) \times R$$
* **Trigonometric Proximity Radar projection**: Renders an interactive, SVG-powered **Proximity Radar Map Visualizer**. Branches are mathematically mapped into radial coordinate vectors $(\theta, r)$ relative to the client's position:
  $$\theta = \text{atan2}(\text{lat}_{\text{branch}} - \text{lat}_{\text{user}}, \text{lng}_{\text{branch}} - \text{lng}_{\text{user}})$$
  $$r = r_{\text{min}} + \left(\frac{d_{\text{branch}}}{d_{\text{max}}}\right) \times (r_{\text{max}} - r_{\text{min}})$$
* **Real-time Directions**: Every certified workshop listing and radar info card features dynamic deep-links directly routing to Google Maps navigation (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).
* **Operational Status Indicators**: Automatically displays dynamic "Open Now" states based on current local times and coordinates.

### 2. High-Fidelity Mobile-First Stitch UI
* **Tailwind HSL Design Tokens**: Fully standard Tailwind configuration mapping Stitch-locked light/dark HSL colors, margins, and spacing tokens directly in `index.html`.
* **Zero-Footprint Styling**: Replaced all heavy, unoptimized modular CSS files, compressing the frontend production-bundle CSS footprint to a mere **`0.30 kB`** (a **98.8%** reduction!).
* **Material Symbols**: Integrated Google Material Symbols (Outlined) for a uniform, responsive, lightweight layout.
* **Ergonomic Touch Targets**: Minimum `48px` tap zones (`h-touch-target` / `h-11`) configured across input fields, dropdown selectors, category chips, and booking triggers to eliminate user fatigue on small viewports.

---

## 🏗️ Decoupled 6-App Backend Services

The Django DRF backend consists of six standalone services to allow multi-tenant, enterprise franchise scaling:
1. **`core` Service**: Houses base `TimeStampedModel` mixins and global validation assets (e.g. GSTIN, phone formats).
2. **`organizations` Service**: Decouples multi-franchise structures into parent `Organization` groups and localized `Branch` offices.
3. **`providers` Service**: Elevates technician identity tracking, establishing skill matrices and support for both in-house and freelance/independent technician profiles.
4. **`devices` Service**: Manages customer hardware registrations, categorizing devices by brand, model, and serial tracking data.
5. **`workflow` Service**: Manages custom Kanban pipelines (`WorkflowStage` records) where milestones, colors, and order rules are stored in the database instead of being hardcoded in scripts.
6. **`repairs` Service**: Mounts versioned `RepairOrder` objects connecting branches, technicians, devices, and dynamic status updates.

---

## 📂 Project Directory Structure

```
RepairBharat/
├── README.md                  # Enterprise documentation center
├── backend/                   # Django DRF service application
│   ├── RepairBharat/          # Core django configuration & routing
│   ├── accounts/              # Unified registration, profiles & authentication
│   ├── billing/               # CGST & SGST compliant tax invoice calculator
│   ├── core/                  # Shared base utilities and abstract models
│   ├── devices/               # Registered customer hardware metadata
│   ├── inventory/             # Spares stock management and alert thresholds
│   ├── organizations/         # Decoupled franchise organizations & physical branches
│   ├── providers/             # Skill matrices, verified technician registries
│   ├── repairs/               # central RepairOrder lifecycle manager
│   ├── workflow/              # Dynamic database-driven Kanban pipeline stages
│   ├── seed_data.py           # Re-seed database with premium sandbox setups
│   └── requirements.txt       # Backend dependencies
├── frontend/                  # React & Vite client application
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── assets/            # App images & styles
│   │   ├── pages/
│   │   │   ├── login.jsx      # Mobile-linear authentication panel
│   │   │   ├── Signup.jsx     # Extended signup registration
│   │   │   └── Dashboard.jsx  # Unified B2C & B2B core workplace engine
│   │   ├── services/
│   │   │   ├── api.jsx        # API caller layers, Place maps calculations
│   │   │   └── contexts.jsx   # User details context hook
│   │   ├── App.jsx            # client routing and base configuration
│   │   └── main.jsx           # Vite application entry point
│   ├── index.html             # Tailwind CDN config & design tokens
│   └── package.json           # Frontend dependencies
```

---

## 🔑 Sandbox Test Credentials

Use these verified credentials on your local dev environment to explore different workstation views:

| Username | Password | User Role | Features & Actions |
| :--- | :--- | :--- | :--- |
| **`customer1`** | `password123` | B2C Client | Browse nearby workshops by repair type, interact with the Proximity Radar, book secure repairs, and track milestones. |
| **`owner1`** | `password123` | Shop Admin | Monitor ERP bento boards, assign bench techs, adjust spares inventory catalogs, and generate compliant invoices. |
| **`tech1`** | `password123` | Specialist | View allocated job sheet workbench queues, log service details, and advance repair stages. |

---

## ⚙️ Installation & Local Setup

### Prerequisites
Confirm your local system has `python3` (v3.10+), `node` (v18+), and `npm` installed.

### 1. Spin up the Django Backend
```bash
# Navigate to the backend directory
cd backend/

# Activate the virtual environment
source venv/bin/activate

# Apply migrations
python3 manage.py makemigrations core organizations providers devices repairs workflow inventory billing accounts
python3 manage.py migrate

# Seed database with verified workshops, status stages, and items
python3 seed_data.py

# Boot backend development server
python3 manage.py runserver 0.0.0.0:8000
```

### 2. Boot up the React Client
```bash
# Navigate to the frontend directory
cd ../frontend/

# Install dependencies
npm install

# Run Vite dev server with network bridging
npm run dev -- --host 0.0.0.0
```

---

> [!NOTE]
> All systems utilize dynamic client fallbacks (`window.location.hostname`) to support cross-device testing over standard WSL bridging networks without manual configurations.
