/**
 * Utility: compute status label + color from stage code.
 * Prefers stage data from the API. Falls back to hardcoded defaults.
 *
 * @param {string} code   - Stage code (e.g. "in_repair")
 * @param {Array}  stages - Array of stage objects from /api/workflow/stages/
 * @returns {{ label: string, color: string }}
 */
export function getStatusLabelAndColor(code, stages = []) {
    const matchingStage = stages.find((s) => s.code === code);
    if (matchingStage) {
        return {
            label: matchingStage.name,
            color: matchingStage.color_hex || "#00288e",
        };
    }

    const defaults = {
        received:         { label: "Received",           color: "#00288e" },
        diagnosing:       { label: "Diagnosing",         color: "#cca000" },
        waiting_approval: { label: "Awaiting Approval",  color: "#ff8c00" },
        in_repair:        { label: "Repairing",          color: "#007233" },
        testing:          { label: "Testing",            color: "#6f00ba" },
        ready:            { label: "Ready for Pickup",   color: "#006d30" },
        delivered:        { label: "Delivered",          color: "#444653" },
        cancelled:        { label: "Cancelled",          color: "#b00020" },
    };

    return defaults[code] ?? { label: code, color: "#00288e" };
}

/**
 * Format a Rupee value with Indian number formatting.
 * @param {number|string} value
 * @returns {string}  e.g. "₹1,23,456.00"
 */
export function formatRupee(value) {
    return `₹${parseFloat(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
