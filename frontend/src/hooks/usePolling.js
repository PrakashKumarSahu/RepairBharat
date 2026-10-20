import { useEffect, useRef } from "react";

/**
 * Page Visibility-aware polling hook.
 * Stops polling when tab is hidden (saves bandwidth + CPU).
 * Resumes immediately when tab becomes visible again.
 *
 * @param {Function} callback - Async function to call on each tick
 * @param {number} intervalMs  - Polling interval in milliseconds (default: 10000)
 * @param {boolean} enabled    - Set to false to pause polling
 */
export function usePolling(callback, intervalMs = 10000, enabled = true) {
    const savedCallback = useRef(callback);

    // Always call the latest version of the callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        let timerId = null;

        const tick = () => {
            if (document.visibilityState !== "hidden") {
                savedCallback.current?.();
            }
        };

        const start = () => {
            timerId = setInterval(tick, intervalMs);
        };

        const stop = () => {
            clearInterval(timerId);
            timerId = null;
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                stop();
            } else {
                tick(); // Immediate refresh when tab becomes visible
                start();
            }
        };

        start();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [intervalMs, enabled]);
}
