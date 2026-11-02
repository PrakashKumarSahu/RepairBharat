import { format, parseISO, isValid } from 'date-fns';
import { getStatusLabelAndColor, formatRupee } from '../../utils/status';

const PRIORITY_STYLES = {
    high:   'bg-red-50 text-red-700',
    medium: 'bg-yellow-50 text-yellow-700',
    low:    'bg-green-50 text-green-700',
};

function safeFormat(dateStr, fmt) {
    if (!dateStr) return '';
    try {
        const d = parseISO(dateStr);
        return isValid(d) ? format(d, fmt) : '';
    } catch {
        return '';
    }
}

/**
 * TicketCard — unified expandable ticket card for all dashboard roles.
 *
 * @param {object}   ticket
 * @param {Array}    stages
 * @param {Function} onStageChange(ticket, stageCode)
 * @param {Function} onCreateInvoice(ticket)  — optional
 * @param {boolean}  expanded
 * @param {Function} onToggleExpand
 * @param {'shop_owner'|'technician'|'customer'} role
 */
export function TicketCard({ ticket, stages, onStageChange, onCreateInvoice, expanded, onToggleExpand, role }) {
    const { label: statusLabel, color: statusColor } = getStatusLabelAndColor(ticket.status_code, stages);
    const isShopOrTech = role === 'shop_owner' || role === 'technician';
    const canInvoice = isShopOrTech && !ticket.invoice && ticket.status_code !== 'cancelled';

    return (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
            {/* Summary row — always visible */}
            <button
                className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-surface-container/50 transition-colors"
                onClick={onToggleExpand}
                type="button"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-primary">{ticket.ticket_number}</span>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: statusColor }}
                        >
                            {statusLabel}
                        </span>
                        {ticket.priority && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[ticket.priority] ?? ''}`}>
                                {ticket.priority}
                            </span>
                        )}
                    </div>
                    <p className="font-semibold text-sm text-on-surface truncate">
                        {ticket.device_brand} {ticket.device_model}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">{ticket.issue_reported}</p>
                    {isShopOrTech && (
                        <p className="text-xs text-outline mt-0.5">
                            {ticket.customer_username}
                            {ticket.customer_phone ? ` · ${ticket.customer_phone}` : ''}
                        </p>
                    )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-outline">{safeFormat(ticket.created_at, 'dd MMM yyyy')}</span>
                    <span className="material-symbols-outlined text-[18px] text-outline">
                        {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                </div>
            </button>

            {/* Expanded body */}
            {expanded && (
                <div className="border-t border-outline-variant px-4 pb-4 pt-3 space-y-4">
                    {/* Cost summary */}
                    <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                        <span>Est: <strong className="text-on-surface">{formatRupee(ticket.estimated_cost)}</strong></span>
                        <span>Advance: <strong className="text-on-surface">{formatRupee(ticket.advance_paid)}</strong></span>
                        {ticket.technician_name && ticket.technician_name !== 'Not Assigned' && (
                            <span>Tech: <strong className="text-on-surface">{ticket.technician_name}</strong></span>
                        )}
                        {ticket.branch_name && (
                            <span>Branch: <strong className="text-on-surface">{ticket.branch_name}</strong></span>
                        )}
                    </div>

                    {/* Stage history timeline */}
                    {ticket.history?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Timeline</p>
                            {ticket.history.slice(0, 6).map((h) => (
                                <div key={h.id} className="flex gap-2.5 text-xs">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                                        style={{ backgroundColor: h.stage_color || '#ccc' }}
                                    />
                                    <div>
                                        <span className="font-semibold text-on-surface">{h.stage_name}</span>
                                        {h.notes && <span className="text-on-surface-variant"> — {h.notes}</span>}
                                        <span className="block text-outline text-[10px] mt-0.5">
                                            {safeFormat(h.created_at, 'dd MMM, hh:mm a')}
                                            {h.updated_by_username ? ` by ${h.updated_by_username}` : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    {isShopOrTech && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {stages
                                .filter((s) => s.code !== ticket.status_code && !s.is_terminal)
                                .map((s) => (
                                    <button
                                        key={s.code}
                                        type="button"
                                        onClick={() => onStageChange(ticket, s.code)}
                                        className="h-8 px-3 text-xs font-semibold border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container transition-colors"
                                    >
                                        → {s.name}
                                    </button>
                                ))}
                            {canInvoice && onCreateInvoice && (
                                <button
                                    type="button"
                                    onClick={() => onCreateInvoice(ticket)}
                                    className="h-8 px-3 text-xs font-semibold bg-primary text-on-primary rounded-lg shadow active:scale-95 transition-all"
                                >
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
