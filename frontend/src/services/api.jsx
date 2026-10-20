import axios from "axios";

const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If in production build, default to relative paths to support Nginx routing seamlessly
    if (import.meta.env.PROD) {
        return "";
    }
    if (typeof window !== "undefined" && window.location) {
        if (window.location.port === "8001" || window.location.port === "80" || window.location.port === "") {
            return "";
        }
        return `http://${window.location.hostname}:8000`;
    }
    return "http://localhost:8000";
};

// Helper for JWT authentication headers
const getAuthHeaders = () => {
    const tokenItem = localStorage.getItem("token");
    if (!tokenItem) return {};
    try {
        const parsed = JSON.parse(tokenItem);
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsed.key}`
        };
    } catch (e) {
        return {};
    }
};

export const api = axios.create({
    baseURL: getApiUrl(),
});

api.interceptors.request.use((config) => {
    const headers = getAuthHeaders();
    if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
    }
    return config;
});

export const signup = async (data) => {
    const url = `${getApiUrl()}/accounts/register/`;
    try {
        const response = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 201) {
            return {
                message: "created",
                status: 201
            };
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return {
                message: "error",
                status: 400,
                data: error.response.data
            };
        }
        return {
            message: "Network error",
            status: 500
        };
    }
};

export const signin = async (data) => {
    const url = `${getApiUrl()}/accounts/login/`;
    try {
        const response = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 200) {
            const item = {
                key: response.data.access,
                expiration: Date.now() + 259200000 // 3 days
            };
            localStorage.setItem("token", JSON.stringify(item));
            return {
                status: 200
            };
        }
    } catch (error) {
        return {
            status: 401
        };
    }
};

export const getUserDetails = async (key) => {
    const token = key || (JSON.parse(localStorage.getItem("token"))?.key);
    if (!token) return null;
    const url = `${getApiUrl()}/accounts/profile/`;
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        localStorage.removeItem("token");
        return null;
    }
};

export const fetchCustomers = async () => {
    const url = `${getApiUrl()}/accounts/customers/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

// ── Organizations / Decoupled Branches APIs ──
/**
 * Fetches branches and calculates real distances using the Haversine formula.
 * @param {Object} filters - Optional filters: city, specialty, search, all, repair_type
 * @param {Object|null} userCoords - User's GPS position: { lat, lng }.
 *                                   Falls back to Mumbai (19.0760, 72.8777) when null.
 */
export const fetchBranches = async (filters = {}, userCoords = null) => {
    const url = `${getApiUrl()}/api/orgs/branches/`;
    const params = new URLSearchParams();
    if (filters.city) params.append("city", filters.city);
    if (filters.specialty) params.append("specialty", filters.specialty);
    if (filters.search) params.append("search", filters.search);
    if (filters.all) params.append("all", "true");

    const response = await axios.get(`${url}?${params.toString()}`);
    let data = response.data;

    // Use the actual user GPS position if provided, otherwise fall back to Mumbai
    const userLat = userCoords?.lat ?? 19.0760;
    const userLng = userCoords?.lng ?? 72.8777;

    data = data.map((b) => {
        // Use real branch coordinates from the database (set when branch is registered)
        const branchLat = parseFloat(b.latitude) || userLat;
        const branchLng = parseFloat(b.longitude) || userLng;

        // Haversine formula for accurate great-circle distance in km
        const R = 6371;
        const dLat = (branchLat - userLat) * Math.PI / 180;
        const dLng = (branchLng - userLng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) *
            Math.cos(branchLat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
            ...b,
            latitude: branchLat,
            longitude: branchLng,
            distance: parseFloat(distance.toFixed(1)),
            // Prefer rating from the API (may be enriched by Google Places on the backend)
            rating: parseFloat(b.rating) || 4.5,
            reviews_count: b.reviews_count || 0,
        };
    });

    // Filter by repair type if selected
    if (filters.repair_type) {
        data = data.filter(b =>
            b.specialties.toLowerCase().includes(filters.repair_type.toLowerCase()) ||
            b.name.toLowerCase().includes(filters.repair_type.toLowerCase())
        );
    }

    // Sort: closest distance first, then highest rating
    data.sort((x, y) => {
        if (x.distance !== y.distance) return x.distance - y.distance;
        return y.rating - x.rating;
    });

    return data;
};


export const createBranch = async (data) => {
    const url = `${getApiUrl()}/api/orgs/branches/`;
    const response = await axios.post(url, data, { headers: getAuthHeaders() });
    return response.data;
};

// ── Scaled Repairs (RepairOrders) APIs ──
export const fetchTickets = async () => {
    const url = `${getApiUrl()}/api/repairs/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

export const createTicket = async (data) => {
    const url = `${getApiUrl()}/api/repairs/`;
    const response = await axios.post(url, data, { headers: getAuthHeaders() });
    return response.data;
};

export const updateTicket = async (ticketId, data) => {
    const url = `${getApiUrl()}/api/repairs/${ticketId}/`;
    const response = await axios.patch(url, data, { headers: getAuthHeaders() });
    return response.data;
};

// ── Providers (Verified Technicians) API ──
export const fetchTechnicians = async () => {
    const url = `${getApiUrl()}/api/providers/technicians/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

// ── Inventory APIs ──
export const fetchInventory = async (branchId = "") => {
    let url = `${getApiUrl()}/api/inventory/`;
    if (branchId) url += `?branch=${branchId}`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

export const addInventoryItem = async (data) => {
    const url = `${getApiUrl()}/api/inventory/`;
    const response = await axios.post(url, data, { headers: getAuthHeaders() });
    return response.data;
};

export const updateInventoryItem = async (itemId, data) => {
    const url = `${getApiUrl()}/api/inventory/${itemId}/`;
    const response = await axios.patch(url, data, { headers: getAuthHeaders() });
    return response.data;
};

// ── Billing APIs ──
export const fetchInvoices = async () => {
    const url = `${getApiUrl()}/api/billing/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

export const createInvoice = async (data) => {
    const url = `${getApiUrl()}/api/billing/`;
    const response = await axios.post(url, data, { headers: getAuthHeaders() });
    return response.data;
};

// ── Workflow Stages API ──
export const fetchStages = async () => {
    const url = `${getApiUrl()}/api/workflow/stages/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

// ── Shop Search & Join Request API Helpers ──
export const fetchShops = async (search = "") => {
    const url = `${getApiUrl()}/api/providers/shops/?search=${search}`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

export const fetchJoinRequests = async () => {
    const url = `${getApiUrl()}/api/providers/join-requests/`;
    const response = await axios.get(url, { headers: getAuthHeaders() });
    return response.data;
};

export const createJoinRequest = async (shopId) => {
    const url = `${getApiUrl()}/api/providers/join-requests/`;
    const response = await axios.post(url, { shop: shopId }, { headers: getAuthHeaders() });
    return response.data;
};

export const updateJoinRequest = async (requestId, status) => {
    const url = `${getApiUrl()}/api/providers/join-requests/`;
    const response = await axios.patch(url, { request_id: requestId, status: status }, { headers: getAuthHeaders() });
    return response.data;
};

export const updateTechnician = async (techId, data) => {
    const url = `${getApiUrl()}/api/providers/technicians/${techId}/`;
    const response = await axios.patch(url, data, { headers: getAuthHeaders() });
    return response.data;
};

export const fetchPublicTicket = async (ticketNumber) => {
    const url = `${getApiUrl()}/api/repairs/public-track/${ticketNumber}/`;
    const response = await axios.get(url);
    return response.data;
};

// ── Notifications ────────────────────────────────────────────────────────────
export const fetchNotifications = async () => {
    const res = await api.get('/api/notifications/');
    return res.data;
};

export const fetchUnreadNotificationCount = async () => {
    const res = await api.get('/api/notifications/unread-count/');
    return res.data.count;
};

export const markNotificationsRead = async () => {
    const res = await api.post('/api/notifications/mark-read/');
    return res.data;
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const fetchAnalyticsKPIs = async () => {
    const res = await api.get('/api/analytics/kpis/');
    return res.data;
};

export const fetchRevenueOverTime = async (range = '30d') => {
    const res = await api.get(`/api/analytics/revenue/?range=${range}`);
    return res.data;
};

export const fetchTicketStatusSummary = async () => {
    const res = await api.get('/api/analytics/tickets/status-summary/');
    return res.data;
};

export const fetchTechnicianPerformance = async () => {
    const res = await api.get('/api/analytics/technicians/performance/');
    return res.data;
};

export const fetchLowStockSummary = async () => {
    const res = await api.get('/api/analytics/inventory/low-stock/');
    return res.data;
};

export const fetchActivityLog = async () => {
    const res = await api.get('/api/audit-log/');
    return res.data;
};