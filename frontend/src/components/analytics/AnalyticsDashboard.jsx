import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import {
    fetchAnalyticsKPIs,
    fetchRevenueOverTime,
    fetchTicketStatusSummary,
    fetchTechnicianPerformance,
    fetchLowStockSummary,
} from '../../services/api';
import { formatRupee } from '../../utils/status';
import { SkeletonKpi } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

const CHART_COLORS = ['#00288e', '#1a56db', '#e3a008', '#0ea5e9', '#10b981', '#ef4444', '#8b5cf6'];

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

function StatusDonut({ data }) {
    if (!data?.length) return <EmptyState icon="donut_large" message="No ticket data yet" />;
    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="status_code"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <RechartsTooltip
                    formatter={(value, name) => [value, String(name).replace(/_/g, ' ')]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '12px' }}
                />
                <Legend
                    formatter={(value) => String(value).replace(/_/g, ' ')}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

function RevenueBarChart({ data, range, onRangeChange }) {
    if (!data?.length) return <p className="text-xs text-on-surface-variant py-4">No revenue data for this period.</p>;
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
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => { try { return format(parseISO(v), 'dd MMM'); } catch { return v; } }}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <RechartsTooltip
                        formatter={(v) => [formatRupee(v), 'Revenue']}
                        labelFormatter={(label) => { try { return format(parseISO(label), 'dd MMM yyyy'); } catch { return label; } }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#00288e" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-on-surface-variant mt-1">Daily paid revenue (₹). Hover bars for detail.</p>
        </div>
    );
}

function AnalyticsDashboard() {
    const [revenueRange, setRevenueRange] = useState('30d');

    const { data: kpis = {}, isPending: kpisLoading } = useQuery({
        queryKey: ['analytics-kpis'],
        queryFn: fetchAnalyticsKPIs,
        refetchInterval: 60_000,
    });

    const { data: revenueData = [] } = useQuery({
        queryKey: ['analytics-revenue', revenueRange],
        queryFn: () => fetchRevenueOverTime(revenueRange),
    });

    const { data: statusSummary = [] } = useQuery({
        queryKey: ['analytics-status'],
        queryFn: fetchTicketStatusSummary,
        refetchInterval: 60_000,
    });

    const { data: techPerf = [] } = useQuery({
        queryKey: ['analytics-tech'],
        queryFn: fetchTechnicianPerformance,
        refetchInterval: 120_000,
    });

    const { data: lowStock = { items: [] } } = useQuery({
        queryKey: ['analytics-lowstock'],
        queryFn: fetchLowStockSummary,
        refetchInterval: 120_000,
    });

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {kpisLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)
                ) : (
                    <>
                        <KpiCard label="Total Revenue (Paid)" value={formatRupee(kpis.total_revenue_paid)} icon="currency_rupee" colorClass="text-primary" />
                        <KpiCard label="Open Tickets" value={kpis.open_tickets ?? '—'} icon="confirmation_number" colorClass="text-yellow-600" sub="Awaiting action" />
                        <KpiCard label="Delivered Today" value={kpis.delivered_today ?? '—'} icon="check_circle" colorClass="text-green-600" />
                        <KpiCard label="Low Stock Items" value={kpis.low_stock_count ?? '—'} icon="inventory_2" colorClass="text-red-600" sub="Below threshold" />
                    </>
                )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface border border-outline-variant rounded-xl p-4">
                    <h3 className="font-bold text-sm text-on-surface mb-3">Ticket Status Breakdown</h3>
                    <StatusDonut data={statusSummary} />
                </div>
                <div className="bg-surface border border-outline-variant rounded-xl p-4">
                    <h3 className="font-bold text-sm text-on-surface mb-3">Revenue Trend</h3>
                    <RevenueBarChart data={revenueData} range={revenueRange} onRangeChange={setRevenueRange} />
                </div>
            </div>

            {/* Tech performance + Low stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techPerf.length > 0 && (
                    <div className="bg-surface border border-outline-variant rounded-xl p-4">
                        <h3 className="font-bold text-sm text-on-surface mb-3">Technician Performance</h3>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-outline uppercase font-bold text-[10px] border-b border-outline-variant">
                                    <th className="py-2 text-left">Technician</th>
                                    <th className="py-2 text-right">Closed</th>
                                    <th className="py-2 text-right">Verified</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {techPerf.map((t) => (
                                    <tr key={t.technician_id}>
                                        <td className="py-2 font-medium text-on-surface">{t.display_name}</td>
                                        <td className="py-2 text-right font-bold text-primary">{t.closed_tickets}</td>
                                        <td className="py-2 text-right">
                                            <span className={`material-symbols-outlined text-[16px] ${t.is_verified ? 'text-green-600' : 'text-on-surface-variant'}`}>
                                                {t.is_verified ? 'verified' : 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {lowStock.items?.length > 0 && (
                    <div className="bg-surface border border-outline-variant rounded-xl p-4">
                        <h3 className="font-bold text-sm text-on-surface mb-1">
                            Low Stock Alert
                            <span className="ml-2 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                {lowStock.items.length} items
                            </span>
                        </h3>
                        <div className="space-y-2 mt-3">
                            {lowStock.items.slice(0, 8).map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-on-surface truncate">{item.name}</span>
                                    <span className="font-bold text-red-600 shrink-0 ml-2">{item.stock_level} left</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { AnalyticsDashboard };
export default AnalyticsDashboard;
