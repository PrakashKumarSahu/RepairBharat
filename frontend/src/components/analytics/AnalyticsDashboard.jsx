import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    fetchAnalyticsKPIs,
    fetchRevenueOverTime,
    fetchTicketStatusSummary,
    fetchTechnicianPerformance,
    fetchLowStockSummary,
} from '../../services/api';
import { formatRupee } from '../../utils/status';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';

function KpiCard({ label, value, icon, sub, colorClass = 'text-primary' }) {
    return (
        <div className="bg-surface-variant rounded-xl p-4 flex flex-col gap-1 border border-outline-variant">
            <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${colorClass}`}>{icon}</span>
                <span className="text-xs text-on-surface-variant font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
            {sub && <p className="text-xs text-on-surface-variant">{sub}</p>}
        </div>
    );
}

function DonutChart({ data }) {
    // Simple SVG donut
    const total = data.reduce((s, d) => s + d.count, 0);
    if (!total) return <p className="text-xs text-on-surface-variant">No data</p>;
    const COLORS = ['#00288e', '#1a56db', '#e3a008', '#0ea5e9', '#10b981', '#ef4444', '#8b5cf6'];
    let cumulative = 0;
    const radius = 50;
    const cx = 60;
    const cy = 60;
    const circumference = 2 * Math.PI * radius;

    const slices = data.map((d, i) => {
        const pct = d.count / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const offset = cumulative * circumference;
        cumulative += pct;
        return { ...d, dash, gap, offset, color: COLORS[i % COLORS.length], pct };
    });

    return (
        <div className="flex items-center gap-4">
            <svg width="120" height="120" viewBox="0 0 120 120">
                {slices.map((s, i) => (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={radius}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="18"
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                ))}
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">{total}</text>
            </svg>
            <div className="flex flex-col gap-1">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-on-surface-variant capitalize">{s.status_code?.replace('_', ' ') || s.label}</span>
                        <span className="font-semibold text-on-surface ml-auto">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RevenueChart({ data, range, onRangeChange }) {
    if (!data || data.length === 0) return <p className="text-xs text-on-surface-variant py-4">No revenue data for this period.</p>;
    const max = Math.max(...data.map((d) => d.revenue), 1);
    return (
        <div>
            <div className="flex gap-2 mb-3">
                {['30d', '90d'].map((r) => (
                    <button
                        key={r}
                        onClick={() => onRangeChange(r)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            range === r
                                ? 'bg-primary text-on-primary border-primary'
                                : 'border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <div className="flex items-end gap-0.5 h-32 overflow-x-auto pb-1">
                {data.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-0.5 min-w-[18px]" title={`${d.date}: ₹${d.revenue.toLocaleString()}`}>
                        <div
                            className="w-3.5 bg-primary rounded-t hover:bg-primary/80 transition-colors"
                            style={{ height: `${Math.max(2, (d.revenue / max) * 120)}px` }}
                        />
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Daily paid revenue (₹). Hover bars for detail.</p>
        </div>
    );
}

export function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [ticketStatus, setTicketStatus] = useState([]);
    const [techPerf, setTechPerf] = useState([]);
    const [lowStock, setLowStock] = useState({ count: 0, items: [] });
    const [revenueRange, setRevenueRange] = useState('30d');

    const load = async (range = revenueRange) => {
        setLoading(true);
        try {
            const [k, rev, ts, tp, ls] = await Promise.all([
                fetchAnalyticsKPIs(),
                fetchRevenueOverTime(range),
                fetchTicketStatusSummary(),
                fetchTechnicianPerformance(),
                fetchLowStockSummary(),
            ]);
            setKpis(k);
            setRevenueData(rev.data || []);
            setTicketStatus(ts.data || []);
            setTechPerf(tp.data || []);
            setLowStock(ls);
        } catch (err) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleRangeChange = (r) => {
        setRevenueRange(r);
        load(r);
    };

    if (loading) return <Spinner label="Loading analytics..." />;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-on-surface">Analytics & Reporting</h2>

            {/* KPI Cards */}
            {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KpiCard label="Total Tickets" value={kpis.total_tickets} icon="confirmation_number" />
                    <KpiCard label="Open Tickets" value={kpis.open_tickets} icon="pending" colorClass="text-secondary" />
                    <KpiCard label="Closed This Month" value={kpis.closed_this_month} icon="check_circle" colorClass="text-success" />
                    <KpiCard label="Total Revenue (Paid)" value={formatRupee(kpis.total_revenue_paid)} icon="currency_rupee" colorClass="text-primary" />
                </div>
            )}

            {/* Low Stock Alert */}
            {lowStock.count > 0 && (
                <div className="bg-error/10 border border-error/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                        <span className="font-semibold text-error text-sm">{lowStock.count} item{lowStock.count !== 1 ? 's' : ''} low on stock</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStock.items.slice(0, 8).map((item) => (
                            <span key={item.id} className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full border border-error/20">
                                {item.name} ({item.stock_level}/{item.low_stock_threshold})
                            </span>
                        ))}
                        {lowStock.items.length > 8 && (
                            <span className="text-xs text-error">+{lowStock.items.length - 8} more</span>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue chart */}
                <div className="bg-surface border border-outline-variant rounded-xl p-4">
                    <h3 className="font-semibold text-sm text-on-surface mb-3">Revenue Over Time</h3>
                    <RevenueChart data={revenueData} range={revenueRange} onRangeChange={handleRangeChange} />
                </div>

                {/* Ticket status donut */}
                <div className="bg-surface border border-outline-variant rounded-xl p-4">
                    <h3 className="font-semibold text-sm text-on-surface mb-3">Tickets by Status</h3>
                    <DonutChart data={ticketStatus} />
                </div>
            </div>

            {/* Technician Performance */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4">
                <h3 className="font-semibold text-sm text-on-surface mb-3">Technician Performance</h3>
                {techPerf.length === 0 ? (
                    <EmptyState icon="engineering" message="No technician performance data yet." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-outline-variant text-left">
                                    <th className="pb-2 font-semibold text-on-surface-variant">Technician</th>
                                    <th className="pb-2 font-semibold text-on-surface-variant text-right">Closed Tickets</th>
                                    <th className="pb-2 font-semibold text-on-surface-variant text-right">Verified</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {techPerf.map((t) => (
                                    <tr key={t.technician_id}>
                                        <td className="py-2 font-medium text-on-surface">{t.display_name}</td>
                                        <td className="py-2 text-right">
                                            <span className="font-bold text-primary">{t.closed_tickets}</span>
                                        </td>
                                        <td className="py-2 text-right">
                                            {t.is_verified ? (
                                                <span className="text-success material-symbols-outlined text-[16px]">verified</span>
                                            ) : (
                                                <span className="text-on-surface-variant material-symbols-outlined text-[16px]">pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
