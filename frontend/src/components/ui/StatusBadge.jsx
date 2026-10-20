/**
 * StatusBadge — renders a colored pill for repair order stages.
 * Accepts either a stage object { label, color } or a raw code string
 * (used with the getStatusLabelAndColor helper).
 */
export function StatusBadge({ label, color }) {
    return (
        <span
            style={{
                color,
                borderColor: color,
                backgroundColor: `${color}10`,
            }}
            className="px-3 py-1 rounded-full font-bold text-[12px] border uppercase tracking-wider inline-block text-center"
        >
            {label}
        </span>
    );
}
