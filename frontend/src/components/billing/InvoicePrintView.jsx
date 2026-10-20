import React from 'react';
import Modal from '../ui/Modal';

export function InvoicePrintView({ open, onClose, invoice }) {
    if (!open || !invoice) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const formatRupee = (val) =>
        parseFloat(val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        });

    const handlePrint = () => window.print();

    return (
        <Modal open={open} onClose={onClose} title="Invoice Preview" maxWidth="max-w-2xl">
            <div id="invoice-print-area" className="space-y-5 text-sm text-on-surface">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-outline-variant pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>handyman</span>
                            <h2 className="font-headline-xl text-2xl font-bold text-primary">RepairBharat</h2>
                        </div>
                        <p className="text-[11px] text-outline font-semibold mt-1">B2B GST Compliant Tax Invoice</p>
                        {invoice.shop_gstin && (
                            <p className="text-[11px] font-mono text-outline">Shop GSTIN: {invoice.shop_gstin}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-on-surface text-lg">{invoice.invoice_number}</p>
                        <p className="text-[11px] text-outline font-semibold">Date: {formatDate(invoice.created_at)}</p>
                        {invoice.ticket_number && (
                            <p className="text-[11px] text-outline font-mono">Ticket: {invoice.ticket_number}</p>
                        )}
                    </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                        <span className="font-bold text-outline uppercase tracking-wider block">Bill To</span>
                        <p className="font-semibold text-on-surface">{invoice.billing_address || 'N/A'}</p>
                        {invoice.customer_gstin && (
                            <p className="font-mono text-outline">GSTIN: {invoice.customer_gstin}</p>
                        )}
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="font-bold text-outline uppercase tracking-wider block">Payment</span>
                        <p className="font-semibold text-on-surface capitalize">{invoice.payment_method || 'N/A'}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            invoice.payment_status === 'paid'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-error-container text-on-error-container'
                        }`}>
                            {invoice.payment_status || 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Charges Table */}
                <div className="border border-outline-variant rounded-xl overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[11px] uppercase">
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-surface-container">
                                <td className="p-3 font-semibold">Labour Charges</td>
                                <td className="p-3 text-right font-medium">₹{formatRupee(invoice.labor_charges)}</td>
                            </tr>
                            {parseFloat(invoice.spares_value || 0) > 0 && (
                                <tr className="border-b border-surface-container">
                                    <td className="p-3 font-semibold">Spares / Parts Value</td>
                                    <td className="p-3 text-right font-medium">₹{formatRupee(invoice.spares_value)}</td>
                                </tr>
                            )}
                            <tr className="border-b border-surface-container">
                                <td className="p-3 text-outline font-semibold">CGST @ 9%</td>
                                <td className="p-3 text-right text-outline font-medium">₹{formatRupee(invoice.cgst)}</td>
                            </tr>
                            <tr className="border-b border-surface-container">
                                <td className="p-3 text-outline font-semibold">SGST @ 9%</td>
                                <td className="p-3 text-right text-outline font-medium">₹{formatRupee(invoice.sgst)}</td>
                            </tr>
                            <tr className="bg-primary/5">
                                <td className="p-3 font-extrabold text-primary text-base">Grand Total</td>
                                <td className="p-3 text-right font-extrabold text-primary text-lg">₹{formatRupee(invoice.grand_total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] text-outline text-center font-semibold border-t border-outline-variant pt-3">
                    This is a system-generated GST invoice. Subject to RepairBharat Terms & Conditions.
                    All prices are inclusive of applicable taxes.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handlePrint}
                        className="flex-1 h-11 bg-primary text-on-primary rounded-lg font-bold flex items-center justify-center gap-1.5 text-sm shadow active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        <span>Print Invoice</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="h-11 px-5 bg-surface border border-outline rounded-lg font-bold text-on-surface text-sm hover:bg-surface-container transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
