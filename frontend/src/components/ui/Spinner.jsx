/** Full-page centered loading spinner */
export function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
            <p className="font-semibold text-sm">{label}</p>
        </div>
    );
}
