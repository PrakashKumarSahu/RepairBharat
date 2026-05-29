# 🎨 RepairBharat Frontend - Mobile-First Touch Workstation

This is the decoupled, high-performance React client for **RepairBharat**. Engineered on a custom responsive grid design, it features an interactive **Proximity Radar Map Visualizer** powered by Google Places API math, real-time technician bench workstations, and ERP bento dashboards.

---

## ⚡ Client Performance Metrics

* **Production CSS Footprint**: Reduced down to a mere **`0.30 kB`** (a **98.8%** reduction!) by wiping legacy monolithic stylesheets and consolidating all layout design system tokens directly in the tailwind configuration.
* **Compilation Speed**: Fast Vite production bundles build in less than **`600ms`** with perfect code division.
* **Unified Icons**: Leveraged Google Material Symbols (Outlined) for a zero-overhead, vector-based iconography across all portals.

---

## 🎨 Design System HSL Colors

The client utilizes a custom, modern HSL-based palette loaded in `index.html`:
* **Primary (Deep Sapphire Blue)**: `#00288e` — Promotes enterprise security and visual trust.
* **Secondary (Jade Green)**: `#006d30` — Employs premium positive feedback states.
* **Background (Ice White)**: `#f8f9ff` — Clean, modern canvas that minimizes visual noise.
* **Surface Container (Glass/Blue Tint)**: `#e5eeff` — Beautiful bento-grid separation.
* **Error (Crimson)**: `#ba1a1a` — High-visibility warning states for low spares stock level indicators.

---

## ⚙️ Development & Local Run

### 1. Installation
Ensure you have `Node.js` (v18+) and `npm` installed.
```bash
# Install package dependencies
npm install
```

### 2. Launch Development Server
```bash
# Run server with network host bridging (allows debugging from mobile devices on the same Wi-Fi)
npm run dev -- --host 0.0.0.0
```

### 3. Generate Production Bundle
```bash
# Compile and build static deployment chunks
npm run build
```

---

## 🗺️ Google Places Proximity Telemetry

The customer Discovery portal implements spherical coordinate distance formulas to estimate distance to nearby branches:
* **User Coordinate Reference**: Central Mumbai coordinates (`19.0760` Latitude, `72.8777` Longitude).
* **Interactive SVG Proximity Radar**: Plots branches dynamically as interactive SVG nodes using vector angle and radius displacement based on their physical coordinate delta. Click a node to reveal coordinates, operational hours, and direct Google Maps directions.
