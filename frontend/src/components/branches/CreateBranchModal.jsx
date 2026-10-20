import { Modal } from "../ui/Modal";

/**
 * CreateBranchModal — shop owner form to register a new physical branch.
 */
export function CreateBranchModal({ open, onClose, form, onFormChange, onSubmit }) {
    const set = (field, value) => onFormChange({ ...form, [field]: value });

    return (
        <Modal open={open} onClose={onClose} title="Register New Branch Location" maxWidth="max-w-lg">
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-name">
                        Branch Name *
                    </label>
                    <input
                        id="branch-name"
                        type="text"
                        placeholder="e.g. RepairBharat Andheri Service Center"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-city">
                            City *
                        </label>
                        <input
                            id="branch-city"
                            type="text"
                            placeholder="Mumbai"
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-phone">
                            Phone *
                        </label>
                        <input
                            id="branch-phone"
                            type="text"
                            placeholder="9820098200"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-address">
                        Full Address *
                    </label>
                    <textarea
                        id="branch-address"
                        rows="2"
                        placeholder="Shop No. 4, Ground Floor, Andheri West, Mumbai..."
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-specialties">
                        Specialties (comma-separated)
                    </label>
                    <input
                        id="branch-specialties"
                        type="text"
                        placeholder="Mobiles, Laptops, Tablets"
                        value={form.specialties}
                        onChange={(e) => set("specialties", e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-lat">
                            Latitude
                        </label>
                        <input
                            id="branch-lat"
                            type="number"
                            step="0.000001"
                            value={form.latitude}
                            onChange={(e) => set("latitude", parseFloat(e.target.value))}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-lng">
                            Longitude
                        </label>
                        <input
                            id="branch-lng"
                            type="number"
                            step="0.000001"
                            value={form.longitude}
                            onChange={(e) => set("longitude", parseFloat(e.target.value))}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="branch-gst">
                        GST Number
                    </label>
                    <input
                        id="branch-gst"
                        type="text"
                        placeholder="27AAAAA1111A1Z1"
                        value={form.gst_number}
                        onChange={(e) => set("gst_number", e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none uppercase"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full h-11 bg-secondary text-on-secondary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                    <span>Register Branch</span>
                </button>
            </form>
        </Modal>
    );
}
