import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center font-sans">
            <span className="material-symbols-outlined text-[80px] text-primary mb-4 opacity-60">search_off</span>
            <h1 className="text-5xl font-bold text-on-surface mb-2">404</h1>
            <p className="text-lg font-semibold text-on-surface-variant mb-1">Page Not Found</p>
            <p className="text-sm text-outline mb-8 max-w-xs">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex gap-3">
                <Link
                    to="/dashboard"
                    className="h-11 px-6 bg-primary text-on-primary rounded-lg font-bold text-sm flex items-center gap-2 shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard
                </Link>
                <Link
                    to="/login"
                    className="h-11 px-6 border border-outline text-on-surface rounded-lg font-bold text-sm flex items-center gap-2"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
