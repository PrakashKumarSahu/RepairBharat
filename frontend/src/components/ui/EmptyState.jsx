/**
 * EmptyState — centered empty-list placeholder with icon, message, and optional CTA.
 *
 * @param {string} icon    - Material Symbols icon name
 * @param {string} message - Short descriptive text
 * @param {ReactNode} cta  - Optional call-to-action element (button / link)
 */
export function EmptyState({ icon = "inbox", message, cta }) {
    return (
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container text-center shadow-sm">
            <span className="material-symbols-outlined text-[64px] text-outline mb-2">{icon}</span>
            <p className="font-semibold text-on-surface-variant">{message}</p>
            {cta && <div className="mt-4">{cta}</div>}
        </div>
    );
}
