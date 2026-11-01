/**
 * Skeleton — animated placeholder for loading states.
 * Use instead of spinners for content that has a known shape.
 */
export function Skeleton({ className = '' }) {
    return (
        <div
            className={`animate-pulse bg-surface-variant rounded-lg ${className}`}
            aria-hidden="true"
        />
    );
}

/** A pre-built skeleton card that matches the ticket/invoice card shape. */
export function SkeletonCard() {
    return (
        <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        </div>
    );
}

/** Table row skeleton */
export function SkeletonRow({ cols = 4 }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

/** KPI card skeleton */
export function SkeletonKpi() {
    return (
        <div className="bg-surface-variant rounded-xl p-4 border border-outline-variant space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}
