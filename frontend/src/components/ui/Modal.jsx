/**
 * Modal — accessible overlay wrapper with backdrop blur.
 *
 * @param {boolean}   open      - Whether modal is visible
 * @param {Function}  onClose   - Called when backdrop is clicked
 * @param {string}    title     - Modal header title
 * @param {ReactNode} children  - Modal body content
 * @param {string}    maxWidth  - Tailwind max-w class (default: "max-w-lg")
 */
export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className={`bg-surface rounded-xl border border-outline-variant shadow-md p-6 ${maxWidth} w-full relative animate-scaleIn text-left my-8 max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4 shrink-0">
                    <h3 className="font-bold text-lg text-primary">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-on-surface hover:text-primary"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 pr-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
