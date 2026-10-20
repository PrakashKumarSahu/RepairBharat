import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useUserContext } from '../../services';
import {
    fetchBranches, fetchTickets, fetchTechnicians, fetchInventory,
    fetchInvoices, fetchCustomers, fetchJoinRequests, fetchStages,
    fetchShops, createTicket, createInvoice, updateTicket,
    createJoinRequest
} from '../../services/api';
import { getStatusLabelAndColor, formatRupee } from '../../utils/status';
import { usePolling } from '../../hooks/usePolling';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Spinner } from '../../components/ui/Spinner';
import { QrSuccessModal } from '../../components/tickets/QrSuccessModal';
import { StageTransitionModal } from '../../components/tickets/StageTransitionModal';
import { WalkinModal } from '../../components/tickets/WalkinModal';
import { InvoicePrintView } from '../../components/billing/InvoicePrintView';

export default function TechnicianDashboard() {
    const { user } = useUserContext();

    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [stages, setStages] = useState([]);

    const [activeTab, setActiveTab] = useState('queue');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState(null);

    // GPS
    const [userLat, setUserLat] = useState(19.0760);
    const [userLng, setUserLng] = useState(72.8777);
    const [locationMethod, setLocationMethod] = useState('default');
    const [locationProviderInfo, setLocationProviderInfo] = useState('Default Initial Center (Mumbai Hub)');

    // Stage notes
    const [showStageNotesModal, setShowStageNotesModal] = useState(false);
    const [stageNotesTicketId, setStageNotesTicketId] = useState(null);
    const [stageNotesCode, setStageNotesCode] = useState('');
    const [stageNotesInput, setStageNotesInput] = useState('');

    // Walkin
    const [showWalkinModal, setShowWalkinModal] = useState(false);
    const [walkinForm, setWalkinForm] = useState({
        customer: '', branch: '', device_category: 'Smartphone',
        device_brand: '', device_model: '', device_serial: '',
        issue_reported: '', priority: 'medium', estimated_cost: '0.00',
        advance_paid: '0.00', device_image: ''
    });

    // Diagnostics
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [diagNotes, setDiagNotes] = useState('');
    const [repairStatus, setRepairStatus] = useState('diagnosing');

    // QR
    const [showSuccessQrModal, setShowSuccessQrModal] = useState(false);
    const [successTicketNumber, setSuccessTicketNumber] = useState('');
    const [successDeviceName, setSuccessDeviceName] = useState('');

    // Shop search for unlinked technician
    const [shopsSearchResults, setShopsSearchResults] = useState([]);
    const [shopSearchInput, setShopSearchInput] = useState('');

    // Invoice print
    const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
    const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);
    const [showManualInvoiceModal, setShowManualInvoiceModal] = useState(false);
    const [manualInvoiceForm, setManualInvoiceForm] = useState({ shop_gstin: '27AAAAA1111A1Z1', customer_name: '', customer_phone: '', customer_gstin: '', billing_address: '', labor_charges: '0.00', payment_method: 'upi', payment_status: 'paid', items: [] });

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [branchData, ticketData, techData, invData, stageData, custData, invList, reqData] = await Promise.all([
                fetchBranches({}),
                fetchTickets(),
                fetchTechnicians(),
                fetchInventory(),
                fetchStages(),
                fetchCustomers(),
                fetchInvoices(),
                fetchJoinRequests()
            ]);
            setBranches(branchData);
            setTickets(ticketData);
            setTechnicians(techData);
            setInventory(invData);
            setStages(stageData);
            setCustomers(custData);
            setInvoices(invList);
            setJoinRequests(reqData);
        } catch (_) {
            toast.error('Unable to load records. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboardData(); }, []);

    usePolling(async () => {
        try {
            const [t, inv, invList, req] = await Promise.all([fetchTickets(), fetchInventory(), fetchInvoices(), fetchJoinRequests()]);
            setTickets(t); setInventory(inv); setInvoices(invList); setJoinRequests(req);
        } catch (_) {}
    }, 10000);

    // Derived
    const techDetails = technicians.find(t => t.username === user?.username);
    const techActiveRepairs = tickets.filter(t => t.status_code !== 'ready' && t.status_code !== 'delivered' && t.status_code !== 'cancelled');
    const techCompletedRepairs = tickets.filter(t => (t.technician_name === user?.username || !t.assigned_technician) && (t.status_code === 'ready' || t.status_code === 'delivered'));

    const getIncentive = (ticket) => {
        const base = 250;
        const priorityBonus = ticket.priority === 'high' ? 100 : ticket.priority === 'medium' ? 50 : 0;
        const commission = parseFloat(ticket.estimated_cost || 0) * 0.10;
        return base + priorityBonus + commission;
    };

    const totalIncentivesEarned = techCompletedRepairs.reduce((acc, t) => acc + getIncentive(t), 0);

    const handleMoveStage = (ticketId, stageCode) => {
        setStageNotesTicketId(ticketId); setStageNotesCode(stageCode); setStageNotesInput(''); setShowStageNotesModal(true);
    };

    const submitStageNotesTransition = async (e) => {
        e.preventDefault();
        if (!stageNotesTicketId || !stageNotesCode) return;
        try {
            const stageObj = stages.find(s => s.code === stageNotesCode);
            await updateTicket(stageNotesTicketId, { status_code: stageNotesCode, stage_notes: stageNotesInput || `Repair transitioned to ${stageObj?.name || 'next stage'}` });
            toast.success('Pipeline milestone updated.');
            setShowStageNotesModal(false); setStageNotesTicketId(null); setStageNotesInput(''); setStageNotesCode('');
            await loadDashboardData();
        } catch (_) {
            toast.error('Failed to update milestone.');
        }
    };

    const handleTechnicianSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTicket) { toast.error('Select a job sheet first.'); return; }
        try {
            await updateTicket(selectedTicket.id, { diagnostics_notes: diagNotes, status_code: repairStatus });
            toast.success('Diagnostic logs & workflow stage updated!');
            setSelectedTicket(null); setDiagNotes('');
            const freshTickets = await fetchTickets(); setTickets(freshTickets);
        } catch (_) {
            toast.error('Failed updating technical workstation.');
        }
    };

    const handleCreateWalkinSubmit = async (e) => {
        e.preventDefault();
        if (!walkinForm.customer || !walkinForm.branch || !walkinForm.device_brand || !walkinForm.device_model || !walkinForm.issue_reported) {
            toast.error('Please fill all required fields.'); return;
        }
        try {
            const payload = { ...walkinForm, device_serial: walkinForm.device_serial || 'N/A' };
            if (techDetails) payload.assigned_technician = techDetails.id;
            const res = await createTicket(payload);
            toast.success('Walk-in repair order created successfully!');
            setShowWalkinModal(false);
            setSuccessTicketNumber(res.ticket_number);
            setSuccessDeviceName(`${res.device_brand || walkinForm.device_brand} ${res.device_model || walkinForm.device_model}`);
            setShowSuccessQrModal(true);
            setWalkinForm({ customer: '', branch: '', device_category: 'Smartphone', device_brand: '', device_model: '', device_serial: '', issue_reported: '', priority: 'medium', estimated_cost: '0.00', advance_paid: '0.00', device_image: '' });
            loadDashboardData();
        } catch (_) {
            toast.error('Failed to register walk-in repair order.');
        }
    };

    const handleSearchShops = async (e) => {
        e.preventDefault();
        if (!shopSearchInput.trim()) { toast.error('Enter a shop name or Shop ID.'); return; }
        try {
            const results = await fetchShops(shopSearchInput);
            setShopsSearchResults(results);
            if (results.length === 0) toast.error('No registered shops matched your criteria.');
            else toast.success(`Found ${results.length} matching shops.`);
        } catch (_) {
            toast.error('Search failed.');
        }
    };

    const handleRequestToJoinShop = async (shopId) => {
        try {
            await createJoinRequest(shopId);
            toast.success('Join request submitted successfully. Awaiting approval!');
            const freshReqs = await fetchJoinRequests(); setJoinRequests(freshReqs);
        } catch (_) {
            toast.error('Duplicate request or shop join issue.');
        }
    };

    const handleAutoFetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLat(position.coords.latitude);
                    setUserLng(position.coords.longitude);
                    setLocationMethod('device_gps');
                    setLocationProviderInfo('W3C Device GPS Telemetry (HTML5 Location Service API)');
                    toast.success('Device telemetry coordinates fetched successfully!');
                },
                () => { toast.error('GPS blocked or unavailable.'); },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else { toast.error('Geolocation API not supported.'); }
    };

    const manualSubtotal = parseFloat(manualInvoiceForm.labor_charges || 0) + manualInvoiceForm.items.reduce((s, item) => s + parseFloat(item.price || 0) * parseInt(item.qty || 1), 0);
    const manualGst = manualSubtotal * 0.18;
    const manualGrandTotal = manualSubtotal + manualGst;

    const handleManualInvoiceSubmit = async (e) => {
        e.preventDefault();
        if (!manualInvoiceForm.customer_name || !manualInvoiceForm.billing_address) { toast.error('Complete customer name and billing address.'); return; }
        try {
            const res = await createInvoice({ ticket: null, labor_charges: parseFloat(manualInvoiceForm.labor_charges || 0).toFixed(2), shop_gstin: manualInvoiceForm.shop_gstin, customer_gstin: manualInvoiceForm.customer_gstin, billing_address: manualInvoiceForm.billing_address, payment_method: manualInvoiceForm.payment_method, payment_status: manualInvoiceForm.payment_status, manual_items: { customer_name: manualInvoiceForm.customer_name, customer_phone: manualInvoiceForm.customer_phone, items: manualInvoiceForm.items } });
            toast.success('Manual GST invoice generated!');
            setShowManualInvoiceModal(false);
            const freshInvs = await fetchInvoices(); setInvoices(freshInvs);
            setSelectedPreviewInvoice(res); setShowInvoicePreviewModal(true);
        } catch (_) { toast.error('Manual invoice compilation failed.'); }
    };

    const locationControlPanel = (
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm space-y-3 text-left animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <span className="material-symbols-outlined animate-pulse">location_on</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-extrabold text-outline uppercase tracking-wider block">Active Operating Coordinates Center</span>
                        <p className="font-bold text-sm text-on-surface flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-primary font-extrabold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Lat: {userLat.toFixed(6)}</span>
                            <span className="font-mono text-primary font-extrabold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Lng: {userLng.toFixed(6)}</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleAutoFetchLocation} className="px-3.5 h-10 bg-primary hover:bg-primary-container text-on-primary hover:text-primary rounded-lg font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">my_location</span>
                        <span>Auto GPS</span>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-outline-variant font-bold border-t border-surface-container pt-2.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                <span>Telemetry Engine: <strong className="text-secondary uppercase">{locationMethod === 'device_gps' ? 'Active GPS Fetch' : 'Default Initial Center'}</strong></span>
                <span className="text-[10px] text-outline font-semibold">| {locationProviderInfo}</span>
            </div>
        </div>
    );

    return (
        <>
            <Toaster position="top-center" />
            <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
                <Navbar mobileMenuOpen={mobileMenuOpen} onMobileMenuToggle={() => setMobileMenuOpen(p => !p)} />
                <div className="flex flex-1 pt-12">
                    <Sidebar activeTab={activeTab} onTabChange={setActiveTab} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
                    <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto max-w-5xl mx-auto space-y-md w-full pb-16">
                        {loading ? <Spinner label="Accessing workstation database..." /> : (
                            <>
                                {locationControlPanel}

                                {/* ── QUEUE TAB ── */}
                                {activeTab === 'queue' && (() => {
                                    // Not linked to a shop
                                    if (!techDetails || !techDetails.shop) {
                                        return (
                                            <div className="space-y-6 animate-fadeIn text-left">
                                                <div>
                                                    <h2 className="font-headline-xl text-[28px] font-bold text-primary">Unlinked Technician Workstation</h2>
                                                    <p className="font-body-md text-on-surface-variant">Search by Shop ID or name to request linking with a B2B franchise workspace.</p>
                                                </div>

                                                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm space-y-4">
                                                    <h3 className="font-bold text-md text-primary flex items-center gap-1">
                                                        <span className="material-symbols-outlined">search</span>
                                                        <span>Lookup B2B Shop Franchises</span>
                                                    </h3>
                                                    <form onSubmit={handleSearchShops} className="flex gap-2">
                                                        <input type="text" placeholder="Enter Shop name, owner username, or Shop ID..." value={shopSearchInput} onChange={(e) => setShopSearchInput(e.target.value)} className="flex-1 h-11 border border-outline rounded-lg text-sm bg-surface px-3 outline-none focus:border-primary transition-colors" />
                                                        <button type="submit" className="h-11 px-5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow active:scale-95 transition-all">Search</button>
                                                    </form>
                                                    {shopsSearchResults.length > 0 && (
                                                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                                            {shopsSearchResults.map(shop => {
                                                                const hasPending = joinRequests.some(r => r.shop === shop.id && r.status === 'pending');
                                                                const hasApproved = joinRequests.some(r => r.shop === shop.id && r.status === 'approved');
                                                                return (
                                                                    <div key={shop.id} className="bg-surface-container-low p-4 rounded-xl border border-surface-container flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-shadow">
                                                                        <div>
                                                                            <h4 className="font-bold text-sm text-primary">{shop.shop_name}</h4>
                                                                            <p className="text-[11px] text-outline font-semibold">ID: {shop.id} | Owner: {shop.owner_username}</p>
                                                                            <p className="text-xs text-on-surface-variant mt-1">{shop.shop_address}</p>
                                                                        </div>
                                                                        <button disabled={hasPending || hasApproved} onClick={() => handleRequestToJoinShop(shop.id)} className={`w-full h-9 rounded-lg font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm ${hasApproved ? 'bg-secondary/20 text-secondary cursor-not-allowed' : hasPending ? 'bg-primary/20 text-primary cursor-not-allowed animate-pulse' : 'bg-primary text-on-primary hover:bg-primary/95'}`}>
                                                                            <span className="material-symbols-outlined text-[16px]">{hasApproved ? 'check_circle' : hasPending ? 'hourglass_empty' : 'group_add'}</span>
                                                                            <span>{hasApproved ? 'Linked' : hasPending ? 'Awaiting Response' : 'Request to Join'}</span>
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Join Requests Ledger */}
                                                <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                                    <div className="p-4 border-b border-surface-container">
                                                        <h3 className="font-bold text-sm text-primary">Active Join Requests Ledger</h3>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse text-xs">
                                                            <thead>
                                                                <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline uppercase">
                                                                    <th className="p-3">Shop ID / Name</th>
                                                                    <th className="p-3">ERP Owner</th>
                                                                    <th className="p-3">Submitted On</th>
                                                                    <th className="p-3">Verification Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {joinRequests.length === 0 ? (
                                                                    <tr><td colSpan="4" className="p-6 text-center text-on-surface-variant font-semibold">No join requests submitted yet.</td></tr>
                                                                ) : (
                                                                    joinRequests.map(r => (
                                                                        <tr key={r.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                            <td className="p-3"><p className="font-bold text-on-surface">{r.shop_name}</p><p className="text-[10px] text-outline font-semibold">Shop ID: {r.shop}</p></td>
                                                                            <td className="p-3 font-medium text-on-surface-variant">{r.owner_username}</td>
                                                                            <td className="p-3 text-outline">{new Date(r.created_at).toLocaleDateString()}</td>
                                                                            <td className="p-3">
                                                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${r.status === 'approved' ? 'bg-success/10 text-success border-success/20' : r.status === 'rejected' ? 'bg-error/10 text-error border-error/20' : 'bg-warning/10 text-warning border-warning/20 animate-pulse'}`}>
                                                                                    {r.status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Linked technician view
                                    return (
                                        <div className="space-y-6 animate-fadeIn text-left">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <h2 className="font-headline-xl text-[28px] font-bold text-primary">Workstation Repairs Queue</h2>
                                                    <p className="font-body-md text-on-surface-variant">Allocated repair orders demanding technical diagnostics and service.</p>
                                                </div>
                                                <button onClick={() => { if (branches.length === 0) { toast.error('Establish a physical workstation branch first.'); return; } setWalkinForm({ customer: customers[0]?.id || '', branch: branches.find(b => b.is_local_db)?.id || '', device_category: 'Smartphone', device_brand: '', device_model: '', device_serial: '', issue_reported: '', priority: 'medium', estimated_cost: '0.00', advance_paid: '0.00', device_image: '' }); setShowWalkinModal(true); }} className="h-11 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all self-start md:self-auto">
                                                    <span className="material-symbols-outlined text-[18px]">add_box</span>
                                                    <span>Book New Repair Job</span>
                                                </button>
                                            </div>

                                            {/* Metrics Scorecard */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Credential Verification</span>
                                                        <span className={`material-symbols-outlined text-[20px] ${techDetails.is_verified ? 'text-secondary' : 'text-amber-500 animate-pulse'}`}>{techDetails.is_verified ? 'verified' : 'pending_actions'}</span>
                                                    </div>
                                                    <div>
                                                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${techDetails.is_verified ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20 animate-pulse'}`}>{techDetails.is_verified ? 'Verified Staff' : 'Unverified Status'}</span>
                                                        <p className="text-[10px] text-outline font-semibold mt-1 truncate">{techDetails.is_verified ? 'Authorized B2B operator' : 'Awaiting owner verification'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Active Workstation</span>
                                                        <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-on-surface truncate">{techDetails.shop_name}</p>
                                                        <p className="text-[11px] text-outline font-semibold truncate uppercase">{techDetails.branch_name}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Jobs Completed</span>
                                                        <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-on-surface mt-1">{techCompletedRepairs.length} <span className="text-xs text-outline font-semibold">devices serviced</span></p>
                                                </div>
                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-success shadow-sm flex flex-col justify-between h-28">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Incentives Earned</span>
                                                        <span className="material-symbols-outlined text-success text-[20px]">payments</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-success mt-1">₹{totalIncentivesEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-outline font-semibold">bonus commission</span></p>
                                                </div>
                                            </div>

                                            {/* Active Job Queue */}
                                            <div>
                                                <h3 className="font-bold text-lg text-primary mb-3">Allocated Active Queue</h3>
                                                {techActiveRepairs.length === 0 ? (
                                                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container text-center shadow-sm max-w-lg mx-auto mt-6">
                                                        <span className="material-symbols-outlined text-[64px] text-outline mb-2">done_all</span>
                                                        <p className="font-semibold text-on-surface-variant text-sm">No active repair workloads. Take a well-deserved stand down.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {techActiveRepairs.map((t) => {
                                                            const sObj = getStatusLabelAndColor(t.status_code, stages);
                                                            const isExpanded = expandedTicketId === t.id;
                                                            return (
                                                                <div key={t.id} className="bg-surface-container-lowest rounded-xl p-5 border border-surface-container shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                                                                    <div>
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="font-bold text-md text-on-surface">{t.device_brand} {t.device_model}</h4>
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <p className="text-[11px] text-outline font-semibold">ID: {t.ticket_number}</p>
                                                                                    <button onClick={() => { setSuccessTicketNumber(t.ticket_number); setSuccessDeviceName(`${t.device_brand} ${t.device_model}`); setShowSuccessQrModal(true); }} className="text-primary flex items-center gap-0.5 text-[10px] font-bold">
                                                                                        <span className="material-symbols-outlined text-[13px]">qr_code_2</span>
                                                                                        <span>QR Code</span>
                                                                                    </button>
                                                                                </div>
                                                                                {t.device_image && (
                                                                                    <div className="mt-2 w-14 h-14 rounded border border-outline overflow-hidden bg-surface-container">
                                                                                        <img src={t.device_image} alt="Device Intake" className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span style={{ color: sObj.color, borderColor: sObj.color, backgroundColor: `${sObj.color}10` }} className="px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase">{sObj.label}</span>
                                                                        </div>
                                                                        <p className="text-xs text-on-surface-variant font-semibold mt-2">
                                                                            <strong className="text-primary font-bold">Issue:</strong> {t.issue_reported}
                                                                        </p>

                                                                        {/* History */}
                                                                        <div className="mt-3 border-t border-outline-variant/50 pt-2">
                                                                            <button onClick={() => setExpandedTicketId(isExpanded ? null : t.id)} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                                                                                <span className="material-symbols-outlined text-[14px]">{isExpanded ? 'unfold_less' : 'unfold_more'}</span>
                                                                                <span>{isExpanded ? 'Hide Cycle History' : 'View Repair Cycle History'}</span>
                                                                            </button>
                                                                            {isExpanded && t.history && (
                                                                                <div className="mt-3 pl-2 space-y-3 border-l-2 border-outline-variant/60 animate-fadeIn">
                                                                                    {t.history.map((hist, idx) => (
                                                                                        <div key={hist.id || idx} className="relative pl-3">
                                                                                            <span style={{ backgroundColor: hist.stage_color || '#7c6cff' }} className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border border-surface"></span>
                                                                                            <p className="font-bold text-xs text-on-surface">{hist.stage_name}</p>
                                                                                            <p className="text-[10px] text-outline font-semibold">{new Date(hist.created_at).toLocaleString()} by {hist.updated_by_username}</p>
                                                                                            <p className="text-xs text-on-surface-variant font-medium mt-0.5">{hist.notes}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-2">
                                                                        <select value={t.status_code} onChange={(e) => handleMoveStage(t.id, e.target.value)} className="h-10 border border-outline rounded-lg text-xs font-bold bg-surface px-2 cursor-pointer focus:ring-1 focus:ring-primary flex-1 shadow-sm">
                                                                            {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                                                                        </select>
                                                                        <button onClick={() => { setSelectedTicket(t); setDiagNotes(t.diagnostics_notes || ''); setRepairStatus(t.status_code); setActiveTab('diagnostics'); }} className="h-10 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center justify-center gap-1 text-xs shadow-sm active:scale-95 transition-transform">
                                                                            <span className="material-symbols-outlined text-[16px]">construction</span>
                                                                            <span>Bench</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Completed Ledger */}
                                            <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm mt-6">
                                                <div className="p-4 border-b border-surface-container flex justify-between items-center">
                                                    <h3 className="font-bold text-sm text-primary">My Serviced Ledger & Incentives Sheet</h3>
                                                    <span className="text-xs font-bold bg-success/10 text-success px-2 py-0.5 rounded">Compliant Payouts</span>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse text-xs">
                                                        <thead>
                                                            <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline uppercase">
                                                                <th className="p-3">Device / ID</th>
                                                                <th className="p-3">Completed On</th>
                                                                <th className="p-3 text-center">Priority</th>
                                                                <th className="p-3 text-right">Job Cost</th>
                                                                <th className="p-3 text-right">Computed Incentive</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {techCompletedRepairs.length === 0 ? (
                                                                <tr><td colSpan="5" className="p-6 text-center text-on-surface-variant font-semibold">No jobs completed yet in this billing cycle.</td></tr>
                                                            ) : (
                                                                techCompletedRepairs.map((t) => (
                                                                    <tr key={t.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                        <td className="p-3"><p className="font-bold text-on-surface">{t.device_brand} {t.device_model}</p><p className="text-[10px] text-outline font-semibold">{t.ticket_number}</p></td>
                                                                        <td className="p-3 text-outline">{new Date(t.updated_at).toLocaleDateString()}</td>
                                                                        <td className="p-3 text-center">
                                                                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${t.priority === 'high' ? 'bg-error/10 text-error border-error/20' : t.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{t.priority}</span>
                                                                        </td>
                                                                        <td className="p-3 text-right font-medium">₹{parseFloat(t.estimated_cost).toFixed(2)}</td>
                                                                        <td className="p-3 text-right font-bold text-success">₹{getIncentive(t).toFixed(2)}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* ── DIAGNOSTICS TAB ── */}
                                {activeTab === 'diagnostics' && (
                                    <div className="space-y-6">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">Technical Diagnostics Bench</h2>
                                            <p className="font-body-md text-on-surface-variant">Update active logs, track parts consumed, and advance stages.</p>
                                        </div>
                                        {!selectedTicket ? (
                                            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container text-center shadow-sm">
                                                <span className="material-symbols-outlined text-[64px] text-outline mb-2">handyman</span>
                                                <p className="font-semibold text-on-surface-variant">Select an active job sheet from your queue first.</p>
                                                <button onClick={() => setActiveTab('queue')} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all text-sm inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">assignment</span>
                                                    <span>Open Job Queue</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
                                                <div className="flex justify-between items-center pb-4 border-b border-surface-container mb-6">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-primary">{selectedTicket.device_brand} {selectedTicket.device_model}</h3>
                                                        <p className="text-xs text-outline font-semibold mt-0.5">Ticket Workload: {selectedTicket.ticket_number}</p>
                                                    </div>
                                                    <button onClick={() => setSelectedTicket(null)} className="text-on-surface hover:text-primary">
                                                        <span className="material-symbols-outlined text-[24px]">close</span>
                                                    </button>
                                                </div>
                                                <form onSubmit={handleTechnicianSubmit} className="space-y-5 text-left">
                                                    <div>
                                                        <span className="text-[11px] font-bold text-outline uppercase block mb-1">Issue Reported by Client</span>
                                                        <p className="p-3 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface-variant font-medium">{selectedTicket.issue_reported}</p>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="font-bold text-xs text-outline uppercase" htmlFor="tech-diag-notes">Diagnostic Service Notes *</label>
                                                        <textarea id="tech-diag-notes" value={diagNotes} onChange={(e) => setDiagNotes(e.target.value)} rows="4" placeholder="Describe diagnostic parameters, actions taken, thermal behaviors, parts replaced, and quality checks completed..." className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm p-3 bg-surface" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="font-bold text-xs text-outline uppercase" htmlFor="tech-stage-select">Update Workflow Stage</label>
                                                        <select id="tech-stage-select" value={repairStatus} onChange={(e) => setRepairStatus(e.target.value)} className="w-full h-11 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-surface px-2 font-bold text-primary">
                                                            {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <button type="submit" className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-sm shadow">
                                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                                        <span>Save Diagnostic Logs & Advance Stage</span>
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── BILLING TAB (same as shop owner) ── */}
                                {activeTab === 'billing' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">GST Invoices & Financial Analytics</h2>
                                            <p className="font-body-md text-on-surface-variant">Real-time tracking of CGST/SGST collected and printable B2B tax invoice logs.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Total Revenue</span><span className="material-symbols-outlined text-primary text-[20px]">currency_rupee</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">₹{invoices.reduce((s, inv) => s + parseFloat(inv.grand_total || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">GST Collected</span><span className="material-symbols-outlined text-secondary text-[20px]">percent</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">₹{invoices.reduce((s, inv) => s + parseFloat(inv.cgst || 0) + parseFloat(inv.sgst || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-tertiary-container shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Invoices Compiled</span><span className="material-symbols-outlined text-tertiary-container text-[20px]">receipt_long</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">{invoices.length} <span className="text-xs text-outline font-semibold">records</span></p>
                                            </div>
                                        </div>
                                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-surface-container flex justify-between items-center flex-wrap gap-2">
                                                <h3 className="font-bold text-md text-primary">Compiled Invoices Registry</h3>
                                                <button onClick={() => { setManualInvoiceForm({ shop_gstin: '27AAAAA1111A1Z1', customer_name: '', customer_phone: '', customer_gstin: '', billing_address: '', labor_charges: '0.00', payment_method: 'upi', payment_status: 'paid', items: [] }); setShowManualInvoiceModal(true); }} className="h-9 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center gap-1.5 text-xs shadow active:scale-95 transition-all">
                                                    <span className="material-symbols-outlined text-[15px]">add_card</span>
                                                    <span>Manual GST Generator</span>
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[12px] uppercase">
                                                            <th className="p-3">Invoice Number / Date</th>
                                                            <th className="p-3">Hardware Client</th>
                                                            <th className="p-3 text-right">Labour Fees</th>
                                                            <th className="p-3 text-right">Grand Total</th>
                                                            <th className="p-3 text-center">Status</th>
                                                            <th className="p-3 text-center">GST Invoice</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {invoices.length === 0 ? (
                                                            <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant font-semibold">No invoices generated yet.</td></tr>
                                                        ) : (
                                                            invoices.map((inv) => (
                                                                <tr key={inv.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                    <td className="p-3"><p className="font-bold text-on-surface">{inv.invoice_number}</p><p className="text-[11px] text-outline font-semibold mt-0.5">{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : 'N/A'}</p></td>
                                                                    <td className="p-3"><p className="font-semibold text-on-surface">{inv.device}</p><p className="text-[11px] text-outline font-semibold mt-0.5">Ticket: {inv.ticket_number}</p></td>
                                                                    <td className="p-3 text-right font-medium text-on-surface-variant">₹{inv.labor_charges}</td>
                                                                    <td className="p-3 text-right font-extrabold text-primary">₹{inv.grand_total}</td>
                                                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${inv.payment_status === 'paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>{inv.payment_status}</span></td>
                                                                    <td className="p-3 text-center">
                                                                        <button onClick={() => { setSelectedPreviewInvoice(inv); setShowInvoicePreviewModal(true); }} className="px-3 py-1 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg text-[11px] font-bold inline-flex items-center gap-1 active:scale-95 transition-transform shadow-sm">
                                                                            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                                                            <span>Print PDF 📄</span>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>

                {/* Modals */}
                <StageTransitionModal open={showStageNotesModal} onClose={() => setShowStageNotesModal(false)} stageCode={stageNotesCode} stages={stages} notes={stageNotesInput} onNotesChange={setStageNotesInput} onSubmit={submitStageNotesTransition} />
                <WalkinModal open={showWalkinModal} onClose={() => setShowWalkinModal(false)} form={walkinForm} onFormChange={setWalkinForm} onSubmit={handleCreateWalkinSubmit} customers={customers} branches={branches} />
                <InvoicePrintView open={showInvoicePreviewModal} onClose={() => setShowInvoicePreviewModal(false)} invoice={selectedPreviewInvoice} />
                <QrSuccessModal open={showSuccessQrModal} onClose={() => setShowSuccessQrModal(false)} ticketNumber={successTicketNumber} deviceName={successDeviceName} />
            </div>
        </>
    );
}
