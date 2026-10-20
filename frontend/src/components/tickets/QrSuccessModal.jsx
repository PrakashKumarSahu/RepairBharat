import { Modal } from "../ui/Modal";

/**
 * QR code success modal shown after a ticket is created.
 * Displays a QR code linking to the public tracking page.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   ticketNumber
 * @param {string}   deviceName
 */
export function QrSuccessModal({ open, onClose, ticketNumber, deviceName }) {
    if (!open) return null;

    const trackingUrl = `${window.location.origin}/track/${ticketNumber}`;

    return (
        <Modal open={open} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center gap-5 py-2">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <span
                        className="material-symbols-outlined text-[40px] text-success"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        check_circle
                    </span>
                </div>

                <div>
                    <h3 className="font-bold text-xl text-on-surface">Repair Order Registered!</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Your <strong className="text-primary">{deviceName}</strong> has been logged in the system.
                    </p>
                </div>

                {/* QR Code via Google Charts API */}
                <div className="bg-white p-3 rounded-xl border border-outline-variant shadow-sm">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(trackingUrl)}`}
                        alt="Ticket QR Code"
                        className="w-[160px] h-[160px]"
                    />
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Ticket Number</p>
                    <p className="font-mono font-extrabold text-lg text-primary bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
                        {ticketNumber}
                    </p>
                </div>

                <p className="text-xs text-on-surface-variant font-medium max-w-[280px] leading-relaxed">
                    Scan this QR code or visit{" "}
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">
                        RepairBharat Track
                    </a>{" "}
                    to monitor your repair status in real-time.
                </p>

                <button
                    onClick={onClose}
                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">done</span>
                    <span>Done</span>
                </button>
            </div>
        </Modal>
    );
}
