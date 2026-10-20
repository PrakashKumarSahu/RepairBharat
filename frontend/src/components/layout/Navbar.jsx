import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../services";

const ROLE_LABEL = {
    shop_owner: "ERP Admin",
    technician: "Workstation Tech",
    customer: "Customer Client",
};

/**
 * Top application bar (fixed, z-50).
 * Shows brand logo, user info, profile menu dropdown.
 *
 * @param {boolean}  mobileMenuOpen   - Whether mobile sidebar is open
 * @param {Function} onMobileMenuToggle
 */
export function Navbar({ mobileMenuOpen, onMobileMenuToggle }) {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    const [showProfileMenu, setShowProfileMenu] = React.useState(false);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".profile-menu-container")) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login", { replace: true });
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-surface dark:bg-inverse-surface shadow-sm flex justify-between items-center px-margin-mobile h-touch-target">
            <div className="flex items-center gap-sm">
                <button
                    onClick={onMobileMenuToggle}
                    className="md:hidden flex items-center justify-center p-1 text-primary hover:bg-surface-container rounded-lg"
                    aria-label="Toggle navigation menu"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>
                <span
                    className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    handyman
                </span>
                <h1 className="font-headline-lg text-[22px] font-bold text-primary dark:text-primary-fixed">
                    RepairBharat
                </h1>
            </div>

            <div className="flex items-center gap-md">
                <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-bold text-on-surface">{user?.username}</span>
                    <span className="text-[11px] text-on-surface-variant font-semibold uppercase">
                        {ROLE_LABEL[user?.role] ?? user?.role}
                    </span>
                </div>

                {/* Profile action menu */}
                <div className="relative profile-menu-container">
                    <button
                        onClick={() => setShowProfileMenu((prev) => !prev)}
                        className="w-8 h-8 rounded-full overflow-hidden bg-primary-container border border-outline flex items-center justify-center font-bold text-primary text-sm shadow-sm cursor-pointer"
                        aria-label="Open profile menu"
                    >
                        {user?.username?.substring(0, 2).toUpperCase()}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-full pt-2 w-48 z-50 animate-fadeIn">
                            <div className="bg-surface shadow-md rounded-xl border border-outline-variant p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 p-2 text-sm text-error hover:bg-error-container rounded-lg font-bold transition-all text-left cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
