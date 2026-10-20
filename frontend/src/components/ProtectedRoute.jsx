import { Navigate } from 'react-router-dom';
import { useUserContext } from '../services/contexts';

/**
 * Wraps a route that requires authentication.
 * - Shows a spinner while the auth context is resolving (user === undefined).
 * - Redirects to /login if no authenticated user is found.
 * - Renders children once authenticated.
 */
export function ProtectedRoute({ children }) {
    const { user } = useUserContext();

    // Context initialises user as null synchronously, then fetches from API.
    // During that async fetch window we keep user as null — so redirect would
    // fire prematurely. Guard against this with a localStorage peek: if a token
    // exists we optimistically wait for the profile fetch before deciding.
    const hasToken = Boolean(localStorage.getItem('token'));

    if (user === null && hasToken) {
        // Profile fetch is still in flight — show a loading spinner
        return (
            <div className="flex h-screen w-full items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                    <p className="text-xs text-outline font-medium">Loading workspace…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
