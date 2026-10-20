import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../services";

const NAV_CONFIG = {
    customer: [
        { tab: "repairs",   icon: "handyman",   label: "My Active Repairs" },
        { tab: "workshops", icon: "explore",     label: "Discover Workshops" },
    ],
    shop_owner: [
        { tab: "erp",       icon: "dashboard",              label: "Master ERP Control" },
        { tab: "inventory", icon: "precision_manufacturing", label: "Spares Inventory" },
        { tab: "billing",   icon: "receipt_long",            label: "GST Billing & Invoices" },
        { tab: "analytics", icon: "analytics",               label: "Analytics & Reports" },
    ],
    technician: [
        { tab: "queue",       icon: "assignment",   label: "My Active Queue" },
        { tab: "diagnostics", icon: "construction", label: "Diagnostics Bench" },
        { tab: "billing",     icon: "receipt_long", label: "GST Billing & Invoices" },
    ],
};

/**
 * Sidebar navigation (desktop + mobile overlay).
 *
 * @param {string}   activeTab     - Currently active tab identifier
 * @param {Function} onTabChange   - Called with new tab string
 * @param {boolean}  mobileOpen    - Mobile sidebar is visible
 * @param {Function} onMobileClose - Called to close the mobile sidebar
 */
export function Sidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }) {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    const tabs = NAV_CONFIG[user?.role] ?? [];

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login", { replace: true });
    };

    const NavLinks = ({ onClickTab }) => (
        <nav className="flex flex-col gap-1">
            {tabs.map(({ tab, icon, label }) => (
                <button
                    key={tab}
                    onClick={() => {
                        onTabChange(tab);
                        onClickTab?.();
                    }}
                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                        activeTab === tab
                            ? "bg-primary text-on-primary shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    <span>{label}</span>
                </button>
            ))}
            {user?.role === 'customer' && (
                <button
                    onClick={() => {
                        navigate('/devices');
                        onClickTab?.();
                    }}
                    className="flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all text-on-surface-variant hover:bg-surface-container"
                >
                    <span className="material-symbols-outlined text-[20px]">devices</span>
                    <span>My Registered Devices</span>
                </button>
            )}
        </nav>
    );

    const Footer = () => (
        <div className="border-t border-outline-variant pt-3 space-y-2">
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 bg-surface hover:bg-error-container/20 text-error rounded-lg font-bold transition-all text-xs border border-error/20"
            >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
            </button>
            <p className="text-[10px] text-outline font-semibold text-center">RepairBharat v3.1.0</p>
        </div>
    );

    const ProfileSpot = () => (
        <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
                {user?.username?.substring(0, 1).toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <p className="font-bold text-sm text-primary truncate">{user?.username}</p>
                <p className="text-[11px] text-on-surface-variant font-semibold truncate uppercase">
                    {user?.role?.replace("_", " ")}
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant p-4 sticky top-12 h-[calc(100vh-48px)] justify-between">
                <div className="space-y-6">
                    <ProfileSpot />
                    <NavLinks />
                </div>
                <Footer />
            </aside>

            {/* Mobile overlay sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/60"
                        onClick={onMobileClose}
                    />
                    <aside className="relative flex flex-col w-64 bg-surface max-w-xs h-full p-4 z-50 justify-between">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                                <span className="font-bold text-primary">Workstation Options</span>
                                <button onClick={onMobileClose} aria-label="Close menu">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                            <NavLinks onClickTab={onMobileClose} />
                        </div>
                        <Footer />
                    </aside>
                </div>
            )}
        </>
    );
}
