import React from 'react';
import Modal from '../ui/Modal';

export function AddInventoryModal({ open, onClose, form, onFormChange, onSubmit, branches }) {
    if (!open) return null;

    const handleChange = (field, value) => {
        onFormChange(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => handleChange('image', reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Register Catalog Spare Part" maxWidth="max-w-lg">
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Branch */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-branch">
                        Assigned Branch *
                    </label>
                    <select
                        id="inv-branch"
                        value={form.branch}
                        onChange={(e) => handleChange('branch', e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none focus:ring-1 focus:ring-primary"
                        required
                    >
                        <option value="">Select Branch...</option>
                        {(branches || []).filter(b => b.is_local_db).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Category & Name */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-category">
                            Category *
                        </label>
                        <select
                            id="inv-category"
                            value={form.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="Display">Display</option>
                            <option value="Battery">Battery</option>
                            <option value="Camera">Camera</option>
                            <option value="Motherboard">Motherboard</option>
                            <option value="Charging Port">Charging Port</option>
                            <option value="Speaker">Speaker</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-name">
                            Part Name *
                        </label>
                        <input
                            id="inv-name"
                            type="text"
                            placeholder="e.g. iPhone 14 OLED Display"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>
                </div>

                {/* SKU */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-sku">
                        SKU / Part Code
                    </label>
                    <input
                        id="inv-sku"
                        type="text"
                        placeholder="e.g. APL-IP14-DSP-OLED"
                        value={form.sku}
                        onChange={(e) => handleChange('sku', e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-purchase-price">
                            Purchase Price (₹)
                        </label>
                        <input
                            id="inv-purchase-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.purchase_price}
                            onChange={(e) => handleChange('purchase_price', e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-selling-price">
                            Selling Price (₹) *
                        </label>
                        <input
                            id="inv-selling-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.selling_price}
                            onChange={(e) => handleChange('selling_price', e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-stock">
                            Stock Quantity *
                        </label>
                        <input
                            id="inv-stock"
                            type="number"
                            min="0"
                            value={form.stock_level}
                            onChange={(e) => handleChange('stock_level', parseInt(e.target.value) || 0)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-threshold">
                            Low Stock Threshold
                        </label>
                        <input
                            id="inv-threshold"
                            type="number"
                            min="0"
                            value={form.low_stock_threshold}
                            onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-image">
                        Part Image
                    </label>
                    <input
                        id="inv-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-xs text-outline border border-outline border-dashed rounded-lg p-2 bg-surface cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/15 file:text-primary hover:file:bg-primary/20"
                    />
                    {form.image && (
                        <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-outline">
                            <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => handleChange('image', '')}
                                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                            >
                                <span className="material-symbols-outlined text-[12px] block">close</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                    <span>Register Catalog Part</span>
                </button>
            </form>
        </Modal>
    );
}
