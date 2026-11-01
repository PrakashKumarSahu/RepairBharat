/**
 * Pagination — renders previous / page numbers / next controls.
 *
 * @param {number}   currentPage
 * @param {number}   totalPages
 * @param {Function} onPageChange  - called with new page number
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) pages.push(i);

    return (
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
                aria-label="Previous page"
            >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {left > 1 && (
                <>
                    <PageBtn page={1} current={currentPage} onClick={onPageChange} />
                    {left > 2 && <span className="text-outline text-sm px-1">…</span>}
                </>
            )}

            {pages.map(p => (
                <PageBtn key={p} page={p} current={currentPage} onClick={onPageChange} />
            ))}

            {right < totalPages && (
                <>
                    {right < totalPages - 1 && <span className="text-outline text-sm px-1">…</span>}
                    <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
                aria-label="Next page"
            >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
        </div>
    );
}

function PageBtn({ page, current, onClick }) {
    return (
        <button
            onClick={() => onClick(page)}
            className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                page === current
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface hover:bg-surface-container'
            }`}
        >
            {page}
        </button>
    );
}
