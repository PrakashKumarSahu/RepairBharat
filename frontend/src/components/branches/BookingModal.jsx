import { Modal } from "../ui/Modal";

/**
 * BookingModal — customer-facing modal to book a repair at a selected branch.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Object}   selectedBranch
 * @param {Object}   form
 * @param {Function} onFormChange
 * @param {Function} onSubmit
 */
export function BookingModal({ open, onClose, selectedBranch, form, onFormChange, onSubmit }) {
    const set = (field, value) => onFormChange({ ...form, [field]: value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set("device_image", reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={selectedBranch ? `Book Repair at ${selectedBranch.name}` : "Book Repair"}
            maxWidth="max-w-lg"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-cat">
                            Device Category
                        </label>
                        <select
                            id="book-cat"
                            value={form.device_category}
                            onChange={(e) => set("device_category", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                        >
                            <option value="Smartphone">Smartphone</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Smartwatch">Smartwatch</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-priority">
                            Priority
                        </label>
                        <select
                            id="book-priority"
                            value={form.priority}
                            onChange={(e) => set("priority", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                        >
                            <option value="low">Standard</option>
                            <option value="medium">Medium</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-brand">
                            Device Brand *
                        </label>
                        <input
                            id="book-brand"
                            type="text"
                            placeholder="Apple, Samsung..."
                            value={form.device_brand}
                            onChange={(e) => set("device_brand", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-model">
                            Device Model *
                        </label>
                        <input
                            id="book-model"
                            type="text"
                            placeholder="iPhone 14, Galaxy S24..."
                            value={form.device_model}
                            onChange={(e) => set("device_model", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="book-serial">
                        Serial / IMEI (optional)
                    </label>
                    <input
                        id="book-serial"
                        type="text"
                        placeholder="Device serial number"
                        value={form.device_serial}
                        onChange={(e) => set("device_serial", e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="book-issue">
                        Issue Description *
                    </label>
                    <textarea
                        id="book-issue"
                        rows="3"
                        placeholder="Describe the problem: cracked screen, not charging, overheating..."
                        value={form.issue_reported}
                        onChange={(e) => set("issue_reported", e.target.value)}
                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="book-image">
                        Device Photo (optional)
                    </label>
                    <input
                        id="book-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-xs text-outline border border-outline border-dashed rounded-lg p-2 bg-surface cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/15 file:text-primary hover:file:bg-primary/20"
                    />
                    {form.device_image && (
                        <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-outline">
                            <img src={form.device_image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => set("device_image", "")}
                                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                            >
                                <span className="material-symbols-outlined text-[12px] block">close</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>Submit Repair Booking</span>
                </button>
            </form>
        </Modal>
    );
}
