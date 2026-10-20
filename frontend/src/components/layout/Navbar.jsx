import { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../../services';
import { fetchNotifications, fetchUnreadNotificationCount, markNotificationsRead } from '../../services/api';

export function Navbar({ mobileMenuOpen, onMobileMenuToggle }) {
    const { user, logout } = useUserContext();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef(null);

    const loadUnread = async () => {
        if (!user) return;
        try {
            const count = await fetchUnreadNotificationCount();
            setUnreadCount(count);
        } catch {/* silent */}
    };

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data);
        } catch {/* silent */}
    };

    useEffect(() => {
        if (!user) return;
        loadUnread();
        const interval = setInterval(loadUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = async () => {
        if (!bellOpen) await loadNotifications();
        setBellOpen((p) => !p);
    };

    const handleMarkAllRead = async () => {
        await markNotificationsRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const roleLabel = user?.role === 'shop_owner' ? 'Shop Owner' : user?.role === 'technician' ? 'Technician' : 'Customer';
    const roleColors = {
        shop_owner: 'bg-primary/10 text-primary',
        technician: 'bg-secondary/10 text-secondary',
        customer: 'bg-surface-variant text-on-surface-variant',
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-surface border-b border-outline-variant shadow-sm h-12 flex items-center px-4 gap-3">
            {/* Mobile menu toggle */}
            <button
                className="md:hidden text-on-surface"
                onClick={onMobileMenuToggle}
                aria-label="Toggle menu"
            >
                <span className="material-symbols-outlined text-[22px]">
                    {mobileMenuOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Brand */}
            <span className="font-bold text-primary text-lg tracking-tight select-none">
                RepairBharat
            </span>

            <span className="flex-1" />

            {/* Role badge */}
            {user && (
                <span className={`hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role] || ''}`}>
                    {roleLabel}
                </span>
            )}

            {/* Notification bell */}
            {user && (
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={handleBellClick}
                        className="relative text-on-surface hover:text-primary transition-colors"
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-error text-on-error text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {bellOpen && (
                        <div className="absolute right-0 top-8 w-80 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant">
                                <span className="font-semibold text-sm text-on-surface">Notifications</span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-xs text-on-surface-variant py-6">No notifications yet</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`px-4 py-3 ${n.is_read ? 'opacity-60' : 'bg-primary/5'}`}
                                        >
                                            <p className="text-xs font-semibold text-on-surface">{n.title}</p>
                                            <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                                            <p className="text-[10px] text-on-surface-variant mt-1">
                                                {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User info + logout */}
            {user && (
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs text-on-surface-variant truncate max-w-[120px]">
                        {user.username}
                    </span>
                    <button
                        onClick={logout}
                        className="text-on-surface hover:text-error transition-colors"
                        aria-label="Logout"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            )}
        </header>
    );
}

export default Navbar;
