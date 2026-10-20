import { Modal } from "../ui/Modal";

/**
 * WalkinModal — used by shop_owner and technician to create walk-in repair tickets.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Object}   form         - walkinForm state object
 * @param {Function} onFormChange - setter for walkinForm
 * @param {Function} onSubmit     - form submit handler
 * @param {Array}    customers    - list of customer objects
 * @param {Array}    branches     - list of branch objects (filtered to local)
 */
export function WalkinModal({ open, onClose, form, onFormChange, onSubmit, customers, branches }) {
    const set = (field, value) => onFormChange({ ...form, [field]: value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set("device_image", reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <Modal open={open} onClose={onClose} title="Register Walk-in Repair Order" maxWidth="max-w-xl">
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-customer">
                            Customer *
                        </label>
                        <select
                            id="walk-customer"
                            value={form.customer}
                            onChange={(e) => set("customer", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.username} ({c.phone || "No phone"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-branch">
                            Branch *
                        </label>
                        <select
                            id="walk-branch"
                            value={form.branch}
                            onChange={(e) => set("branch", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                            required
                        >
                            <option value="">Select Branch</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-cat">
                            Device Category
                        </label>
                        <select
                            id="walk-cat"
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
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-priority">
                            Priority *
                        </label>
                        <select
                            id="walk-priority"
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
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-brand">
                            Hardware Brand *
                        </label>
                        <input
                            id="walk-brand"
                            type="text"
                            placeholder="Apple, OnePlus..."
                            value={form.device_brand}
                            onChange={(e) => set("device_brand", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-model">
                            Hardware Model *
                        </label>
                        <input
                            id="walk-model"
                            type="text"
                            placeholder="iPhone 14, OnePlus 11..."
                            value={form.device_model}
                            onChange={(e) => set("device_model", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-serial">
                            Serial / IMEI
                        </label>
                        <input
                            id="walk-serial"
                            type="text"
                            placeholder="Serial number"
                            value={form.device_serial}
                            onChange={(e) => set("device_serial", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-cost">
                            Estimated Cost (₹) *
                        </label>
                        <input
                            id="walk-cost"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 4500.00"
                            value={form.estimated_cost}
                            onChange={(e) => set("estimated_cost", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-advance">
                            Advance Paid (₹)
                        </label>
                        <input
                            id="walk-advance"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.advance_paid}
                            onChange={(e) => set("advance_paid", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-issue">
                        Reported Defect / Failure *
                    </label>
                    <textarea
                        id="walk-issue"
                        rows="2"
                        placeholder="Touch bleeding, thermal issue, battery swelling..."
                        value={form.issue_reported}
                        onChange={(e) => set("issue_reported", e.target.value)}
                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-image">
                        Device Intake Image
                    </label>
                    <input
                        id="walk-image"
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
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Establish Repair Workload</span>
                </button>
            </form>
        </Modal>
    );
}
