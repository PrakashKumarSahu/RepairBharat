import { Modal } from "../ui/Modal";
import { formatRupee } from "../../utils/status";

/**
 * CreateInvoiceModal — GST-compliant invoice for a completed repair ticket.
 */
export function CreateInvoiceModal({
    open,
    onClose,
    activeTicket,
    laborCharges,
    onLaborChange,
    selectedSpares,
    onSparesChange,
    shopGstin,
    onShopGstinChange,
    customerGstin,
    onCustomerGstinChange,
    billingAddress,
    onBillingAddressChange,
    inventory,
    onSubmit,
}) {
    if (!activeTicket) return null;

    const spareTotal = selectedSpares.reduce(
        (sum, id) => sum + parseFloat(inventory.find((i) => i.id === id)?.selling_price || 0),
        0
    );
    const subtotal = parseFloat(laborCharges || 0) + spareTotal;
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const grandTotal = subtotal * 1.18;

    const toggleSpare = (id, checked) => {
        onSparesChange(checked ? [...selectedSpares, id] : selectedSpares.filter((s) => s !== id));
    };

    return (
        <Modal
            open={open}
            onClose={() => { onClose(); onSparesChange([]); }}
            title={
                <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span>Compile GST Invoice</span>
                </span>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <span className="text-[11px] font-bold text-outline uppercase block mb-1">Hardware Particulars</span>
                    <p className="font-bold text-sm text-on-surface">
                        {activeTicket.device_brand} {activeTicket.device_model} ({activeTicket.ticket_number})
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="labor-charges-field">
                        Labor Charges (₹) *
                    </label>
                    <input
                        id="labor-charges-field"
                        type="number"
                        step="0.01"
                        value={laborCharges}
                        onChange={(e) => onLaborChange(e.target.value)}
                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-bold text-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="shop-gstin-field">
                            Shop GSTIN *
                        </label>
                        <input
                            id="shop-gstin-field"
                            type="text"
                            value={shopGstin}
                            onChange={(e) => onShopGstinChange(e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-semibold"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-outline uppercase" htmlFor="customer-gstin-field">
                            Customer GSTIN (Optional)
                        </label>
                        <input
                            id="customer-gstin-field"
                            type="text"
                            placeholder="27BBBBB2222B2Z2"
                            value={customerGstin}
                            onChange={(e) => onCustomerGstinChange(e.target.value)}
                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-semibold"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase" htmlFor="billing-address-field">
                        Customer Billing Address *
                    </label>
                    <textarea
                        id="billing-address-field"
                        rows="2"
                        placeholder="Full physical address..."
                        value={billingAddress}
                        onChange={(e) => onBillingAddressChange(e.target.value)}
                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface font-semibold"
                        required
                    />
                </div>

                {/* Spare selection */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Spares Consumed</label>
                    <div className="max-h-[120px] overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-1 bg-surface">
                        {inventory.length === 0 ? (
                            <p className="text-xs text-outline text-center py-2 font-semibold">No spares in catalog.</p>
                        ) : (
                            inventory.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 text-xs font-bold py-1 border-b border-surface-container-high last:border-b-0"
                                >
                                    <input
                                        type="checkbox"
                                        id={`spare-inv-${item.id}`}
                                        checked={selectedSpares.includes(item.id)}
                                        onChange={(e) => toggleSpare(item.id, e.target.checked)}
                                    />
                                    <label
                                        htmlFor={`spare-inv-${item.id}`}
                                        className="flex justify-between w-full cursor-pointer text-on-surface-variant font-medium"
                                    >
                                        <span>{item.name} (SKU: {item.sku})</span>
                                        <span className="text-primary font-bold">{formatRupee(item.selling_price)}</span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Live computation */}
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant text-[12px] font-bold space-y-2">
                    <div className="flex justify-between">
                        <span className="text-on-surface-variant font-medium">Subtotal (Labor + Spares):</span>
                        <span>{formatRupee(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-outline">
                        <span className="font-medium">CGST (9.00%):</span>
                        <span>{formatRupee(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-outline">
                        <span className="font-medium">SGST (9.00%):</span>
                        <span>{formatRupee(sgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary border-t border-outline-variant pt-2">
                        <span>Total Outstanding (GST Inc.):</span>
                        <span>{formatRupee(grandTotal)}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full h-11 bg-secondary text-on-secondary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Register Compliant Invoice</span>
                </button>
            </form>
        </Modal>
    );
}
