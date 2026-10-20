import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useUserContext } from '../../services';
import {
    fetchBranches, fetchTickets, fetchTechnicians, fetchInventory,
    fetchInvoices, fetchCustomers, fetchJoinRequests, createBranch,
    createTicket, createInvoice, updateTicket, updateJoinRequest,
    updateTechnician, addInventoryItem
} from '../../services/api';
import { getStatusLabelAndColor, formatRupee } from '../../utils/status';
import { usePolling } from '../../hooks/usePolling';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Spinner } from '../../components/ui/Spinner';
import { QrSuccessModal } from '../../components/tickets/QrSuccessModal';
import { StageTransitionModal } from '../../components/tickets/StageTransitionModal';
import { WalkinModal } from '../../components/tickets/WalkinModal';
import { CreateBranchModal } from '../../components/branches/CreateBranchModal';
import { CreateInvoiceModal } from '../../components/billing/CreateInvoiceModal';
import { AddInventoryModal } from '../../components/inventory/AddInventoryModal';
import { InvoicePrintView } from '../../components/billing/InvoicePrintView';
import Modal from '../../components/ui/Modal';

export default function ShopOwnerDashboard() {
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

    const [activeTab, setActiveTab] = useState('erp');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState(null);
    const [selectedWorkloadBranch, setSelectedWorkloadBranch] = useState('');

    // Stage notes modal
    const [showStageNotesModal, setShowStageNotesModal] = useState(false);
    const [stageNotesTicketId, setStageNotesTicketId] = useState(null);
    const [stageNotesCode, setStageNotesCode] = useState('');
    const [stageNotesInput, setStageNotesInput] = useState('');

    // Walk-in modal
    const [showWalkinModal, setShowWalkinModal] = useState(false);
    const [walkinForm, setWalkinForm] = useState({
        customer: '', branch: '', device_category: 'Smartphone',
        device_brand: '', device_model: '', device_serial: '',
        issue_reported: '', priority: 'medium', estimated_cost: '0.00',
        advance_paid: '0.00', device_image: ''
    });

    // Branch modal
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const [branchForm, setBranchForm] = useState({
        name: '', city: 'Mumbai', address: '', phone: '',
        specialties: 'Mobiles, Laptops, Tablets',
        latitude: 19.0760, longitude: 72.8777, gst_number: ''
    });

    // Inventory modal
    const [showAddInventory, setShowAddInventory] = useState(false);
    const [inventoryForm, setInventoryForm] = useState({
        branch: '', name: '', sku: '', category: 'Display',
        stock_level: 10, low_stock_threshold: 3,
        purchase_price: '', selling_price: '',
        hsn_code: '8517', gst_rate: '18.00', image: ''
    });

    // Invoice modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [activeInvoiceTicket, setActiveInvoiceTicket] = useState(null);
    const [laborCharges, setLaborCharges] = useState('0.00');
    const [selectedSpares, setSelectedSpares] = useState([]);
    const [invoiceShopGstin, setInvoiceShopGstin] = useState('27AAAAA1111A1Z1');
    const [invoiceCustomerGstin, setInvoiceCustomerGstin] = useState('');
    const [invoiceBillingAddress, setInvoiceBillingAddress] = useState('');

    // Invoice print preview
    const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
    const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);

    // Manual invoice modal
    const [showManualInvoiceModal, setShowManualInvoiceModal] = useState(false);
    const [manualInvoiceForm, setManualInvoiceForm] = useState({
        shop_gstin: '27AAAAA1111A1Z1', customer_name: '', customer_phone: '',
        customer_gstin: '', billing_address: '', labor_charges: '0.00',
        payment_method: 'upi', payment_status: 'paid', items: []
    });

    // QR modal
    const [showSuccessQrModal, setShowSuccessQrModal] = useState(false);
    const [successTicketNumber, setSuccessTicketNumber] = useState('');
    const [successDeviceName, setSuccessDeviceName] = useState('');

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [branchData, ticketData, techData, invData, invList, custData, reqData] = await Promise.all([
                fetchBranches({}),
                fetchTickets(),
                fetchTechnicians(),
                fetchInventory(),
                fetchInvoices(),
                fetchCustomers(),
                fetchJoinRequests()
            ]);
            setBranches(branchData);
            setTickets(ticketData);
            setTechnicians(techData);
            setInventory(invData);
            setInvoices(invList);
            setCustomers(custData);
            setJoinRequests(reqData);
        } catch (error) {
            toast.error('Unable to load latest records. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboardData(); }, []);

    usePolling(async () => {
        try {
            const [t, inv, invList, req] = await Promise.all([
                fetchTickets(), fetchInventory(), fetchInvoices(), fetchJoinRequests()
            ]);
            setTickets(t);
            setInventory(inv);
            setInvoices(invList);
            setJoinRequests(req);
        } catch (_) {}
    }, 10000);

    // Derived metrics
    const openTicketsCount = tickets.filter(t => t.status_code !== 'delivered').length;
    const completedTicketsCount = tickets.filter(t => t.status_code === 'ready' || t.status_code === 'delivered').length;
    const activeTechsCount = technicians.length;
    const lowStockSparesCount = inventory.filter(i => i.stock_level <= i.low_stock_threshold).length;

    // Handlers
    const handleMoveStage = (ticketId, stageCode) => {
        setStageNotesTicketId(ticketId);
        setStageNotesCode(stageCode);
        setStageNotesInput('');
        setShowStageNotesModal(true);
    };

    const submitStageNotesTransition = async (e) => {
        e.preventDefault();
        if (!stageNotesTicketId || !stageNotesCode) return;
        try {
            const stageObj = stages.find(s => s.code === stageNotesCode);
            const res = await updateTicket(stageNotesTicketId, {
                status_code: stageNotesCode,
                stage_notes: stageNotesInput || `Repair transitioned to ${stageObj?.name || 'next stage'}`
            });
            toast.success('Pipeline milestone updated with transition notes.');
            setShowStageNotesModal(false);
            setStageNotesTicketId(null);
            setStageNotesInput('');
            await loadDashboardData();
            if (stageNotesCode === 'ready') {
                setActiveInvoiceTicket(res);
                setInvoiceBillingAddress(`${res.customer_username || 'Client'} (Contact: ${res.customer_phone || 'N/A'}), Mumbai, Maharashtra, India`);
                setShowInvoiceModal(true);
            }
            setStageNotesCode('');
        } catch (error) {
            toast.error('Failed to update milestone.');
        }
    };

    const handleAssignTechnician = async (ticketId, techId) => {
        try {
            await updateTicket(ticketId, { assigned_technician: techId === '' ? null : techId });
            toast.success('Technician assigned to workstation successfully.');
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
        } catch (_) {
            toast.error('Failed to assign technician.');
        }
    };

    const handleManageJoinRequest = async (requestId, statusValue) => {
        try {
            await updateJoinRequest(requestId, statusValue);
            toast.success(`Join request ${statusValue} successfully.`);
            loadDashboardData();
        } catch (_) {
            toast.error('Failed to update join request.');
        }
    };

    const handleToggleVerification = async (techId, currentStatus) => {
        try {
            await updateTechnician(techId, { is_verified: !currentStatus });
            toast.success('Technician verification status updated successfully.');
            loadDashboardData();
        } catch (_) {
            toast.error('Failed to toggle verification status.');
        }
    };

    const handleAddSparesInventory = async (e) => {
        e.preventDefault();
        if (!inventoryForm.branch || !inventoryForm.name || !inventoryForm.selling_price) {
            toast.error('Complete branch and spare item particulars.');
            return;
        }
        try {
            await addInventoryItem({ ...inventoryForm, purchase_price: inventoryForm.purchase_price || '0.00' });
            toast.success('New spare item registered in parts inventory.');
            setShowAddInventory(false);
            setInventoryForm({ branch: branches[0]?.id || '', name: '', sku: '', category: 'Display', stock_level: 10, low_stock_threshold: 3, purchase_price: '', selling_price: '', hsn_code: '8517', gst_rate: '18.00', image: '' });
            const freshInv = await fetchInventory();
            setInventory(freshInv);
        } catch (_) {
            toast.error('Failed registering spare parts.');
        }
    };

    const handleCreateInvoiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createInvoice({
                ticket: activeInvoiceTicket.id,
                labor_charges: parseFloat(laborCharges).toFixed(2),
                spares_used: selectedSpares.map(id => ({ id, quantity: 1 })),
                shop_gstin: invoiceShopGstin || '27AAAAA1111A1Z1',
                customer_gstin: invoiceCustomerGstin || '',
                billing_address: invoiceBillingAddress || (activeInvoiceTicket.customer_username + ', Mumbai')
            });
            toast.success('GST invoice generated successfully!');
            setShowInvoiceModal(false);
            setSelectedSpares([]);
            setLaborCharges('0.00');
            setSelectedPreviewInvoice(res);
            setShowInvoicePreviewModal(true);
            loadDashboardData();
        } catch (_) {
            toast.error('Invoice compilation failed.');
        }
    };

    const handleManualInvoiceSubmit = async (e) => {
        e.preventDefault();
        if (!manualInvoiceForm.customer_name || !manualInvoiceForm.billing_address) {
            toast.error('Complete customer name and billing address.');
            return;
        }
        try {
            const res = await createInvoice({
                ticket: null,
                labor_charges: parseFloat(manualInvoiceForm.labor_charges || 0).toFixed(2),
                shop_gstin: manualInvoiceForm.shop_gstin || '27AAAAA1111A1Z1',
                customer_gstin: manualInvoiceForm.customer_gstin || '',
                billing_address: manualInvoiceForm.billing_address,
                payment_method: manualInvoiceForm.payment_method,
                payment_status: manualInvoiceForm.payment_status,
                manual_items: {
                    customer_name: manualInvoiceForm.customer_name,
                    customer_phone: manualInvoiceForm.customer_phone,
                    items: manualInvoiceForm.items
                }
            });
            toast.success('Custom manual GST invoice generated successfully!');
            setShowManualInvoiceModal(false);
            const freshInvs = await fetchInvoices();
            setInvoices(freshInvs);
            setSelectedPreviewInvoice(res);
            setShowInvoicePreviewModal(true);
        } catch (_) {
            toast.error('Manual invoice compilation failed.');
        }
    };

    const handleCreateBranchSubmit = async (e) => {
        e.preventDefault();
        if (!branchForm.name || !branchForm.city || !branchForm.address || !branchForm.phone) {
            toast.error('Please provide all required branch details.');
            return;
        }
        try {
            await createBranch(branchForm);
            toast.success('New physical branch registered successfully!');
            setShowAddBranchModal(false);
            setBranchForm({ name: '', city: 'Mumbai', address: '', phone: '', specialties: 'Mobiles, Laptops, Tablets', latitude: 19.0760, longitude: 72.8777, gst_number: '' });
            loadDashboardData();
        } catch (_) {
            toast.error('Branch registration failed. Check GST parameters.');
        }
    };

    const handleCreateWalkinSubmit = async (e) => {
        e.preventDefault();
        if (!walkinForm.customer || !walkinForm.branch || !walkinForm.device_brand || !walkinForm.device_model || !walkinForm.issue_reported) {
            toast.error('Please select customer, branch, and fill required device parameters.');
            return;
        }
        try {
            const res = await createTicket({ ...walkinForm, device_serial: walkinForm.device_serial || 'N/A' });
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

    const addManualItem = () => {
        setManualInvoiceForm(prev => ({
            ...prev,
            items: [...prev.items, { name: '', hsn: '8517', price: '0.00', qty: 1, gst_rate: '18' }]
        }));
    };

    const removeManualItem = (idx) => {
        setManualInvoiceForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const updateManualItem = (idx, field, value) => {
        setManualInvoiceForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        }));
    };

    const manualSubtotal = parseFloat(manualInvoiceForm.labor_charges || 0) +
        manualInvoiceForm.items.reduce((s, item) => s + parseFloat(item.price || 0) * parseInt(item.qty || 1), 0);
    const manualGst = manualSubtotal * 0.18;
    const manualGrandTotal = manualSubtotal + manualGst;

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
                                {/* ── ERP TAB ── */}
                                {activeTab === 'erp' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Master Station Control Panel</h2>
                                                <p className="font-body-md text-on-surface-variant">Real-time shop operations oversight and workflow allocation.</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button onClick={() => setShowAddBranchModal(true)} className="h-11 px-4 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                                                    <span>Register Branch</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (branches.length === 0) { toast.error('Please register a branch location first.'); return; }
                                                        setWalkinForm({ customer: customers[0]?.id || '', branch: branches.find(b => b.is_local_db)?.id || '', device_category: 'Smartphone', device_brand: '', device_model: '', device_serial: '', issue_reported: '', priority: 'medium', estimated_cost: '0.00', advance_paid: '0.00', device_image: '' });
                                                        setShowWalkinModal(true);
                                                    }}
                                                    className="h-11 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_box</span>
                                                    <span>Book Walk-in Repair</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Pending Join Requests */}
                                        {joinRequests.filter(r => r.status === 'pending').length > 0 && (
                                            <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm space-y-3 animate-fadeIn text-left mb-6">
                                                <h3 className="font-bold text-md text-primary flex items-center gap-1">
                                                    <span className="material-symbols-outlined">badge</span>
                                                    <span>Pending Technician Join Requests ({joinRequests.filter(r => r.status === 'pending').length})</span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {joinRequests.filter(r => r.status === 'pending').map(req => (
                                                        <div key={req.id} className="bg-surface p-4 rounded-xl border border-outline-variant flex flex-col justify-between gap-3 shadow-sm">
                                                            <div>
                                                                <h4 className="font-bold text-sm text-on-surface">{req.technician_name}</h4>
                                                                <p className="text-[11px] text-outline font-semibold">Experience: {req.experience_years} Years</p>
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {(req.skills_summary || []).map((sk, idx) => (
                                                                        <span key={idx} className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-secondary/10">{sk}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleManageJoinRequest(req.id, 'approved')} className="flex-1 h-9 bg-success text-on-success hover:bg-success/90 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform">
                                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    <span>Grant Link</span>
                                                                </button>
                                                                <button onClick={() => handleManageJoinRequest(req.id, 'rejected')} className="flex-1 h-9 bg-error text-on-error hover:bg-error/90 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform">
                                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                                    <span>Reject</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {branches.length === 0 ? (
                                            <div className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container text-center shadow-sm max-w-lg mx-auto mt-10 space-y-4">
                                                <span className="material-symbols-outlined text-[72px] text-primary">storefront</span>
                                                <h3 className="font-bold text-xl text-on-surface">Establish Your Physical Franchise</h3>
                                                <p className="text-sm text-on-surface-variant leading-relaxed">Register your first physical office to begin cataloging inventory, assigned technicians, walk-in repairs, and GST invoice logs.</p>
                                                <button onClick={() => setShowAddBranchModal(true)} className="px-5 h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all inline-flex items-center gap-1.5 text-sm shadow">
                                                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                                                    <span>Register Branch</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* KPI Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {[
                                                        { label: 'Active Workloads', value: `${openTicketsCount}`, sub: 'orders in transit', icon: 'engineering', color: 'border-primary', iconColor: 'text-primary' },
                                                        { label: 'Verified Techs', value: `${activeTechsCount}`, sub: 'on shop benched', icon: 'group', color: 'border-secondary', iconColor: 'text-secondary' },
                                                        { label: 'Jobs Completed', value: `${completedTicketsCount}`, sub: 'devices serviced', icon: 'check_circle', color: 'border-success', iconColor: 'text-success' },
                                                        { label: 'Low Spares Warnings', value: `${lowStockSparesCount}`, sub: 'under thresholds', icon: 'inventory_2', color: 'border-error', iconColor: 'text-error' }
                                                    ].map((kpi) => (
                                                        <div key={kpi.label} className={`bg-surface-container-lowest p-5 rounded-xl border border-surface-container ${kpi.color} border-l-4 shadow-sm flex flex-col justify-between h-28`}>
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-[12px] font-bold text-outline uppercase">{kpi.label}</span>
                                                                <span className={`material-symbols-outlined ${kpi.iconColor} text-[20px]`}>{kpi.icon}</span>
                                                            </div>
                                                            <p className="text-3xl font-bold text-on-surface mt-1">{kpi.value} <span className="text-xs text-outline font-semibold">{kpi.sub}</span></p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* ERP Tickets Table */}
                                                <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                                    <div className="p-4 border-b border-surface-container flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                        <h3 className="font-bold text-md text-primary">Repair Order Workloads</h3>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <select
                                                                value={selectedWorkloadBranch}
                                                                onChange={(e) => setSelectedWorkloadBranch(e.target.value)}
                                                                className="h-9 border border-outline rounded-lg text-xs font-bold bg-surface px-2 outline-none cursor-pointer focus:ring-1 focus:ring-primary shadow-sm"
                                                            >
                                                                <option value="">All Branches</option>
                                                                {branches.filter(b => b.is_local_db).map(b => (
                                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                                ))}
                                                            </select>
                                                            <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                                <span>Real-Time Sync</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse text-sm">
                                                            <thead>
                                                                <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[12px] uppercase">
                                                                    <th className="p-3">Device / ID</th>
                                                                    <th className="p-3">Reported Issue</th>
                                                                    <th className="p-3">Stage / Milestone</th>
                                                                    <th className="p-3">Workstation Tech</th>
                                                                    <th className="p-3">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tickets.filter(t => !selectedWorkloadBranch || t.branch === parseInt(selectedWorkloadBranch)).length === 0 ? (
                                                                    <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant font-semibold">No active repair orders registered yet.</td></tr>
                                                                ) : (
                                                                    tickets.filter(t => !selectedWorkloadBranch || t.branch === parseInt(selectedWorkloadBranch)).map((t) => {
                                                                        const sObj = getStatusLabelAndColor(t.status_code, stages);
                                                                        return (
                                                                            <tr key={t.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                                <td className="p-3">
                                                                                    <div className="flex items-start gap-2.5">
                                                                                        {t.device_image && (
                                                                                            <div className="w-10 h-10 rounded border border-outline overflow-hidden bg-surface-container flex-shrink-0">
                                                                                                <img src={t.device_image} alt="Device" className="w-full h-full object-cover" />
                                                                                            </div>
                                                                                        )}
                                                                                        <div>
                                                                                            <p className="font-bold text-on-surface">{t.device_brand} {t.device_model}</p>
                                                                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                                                <span className="text-[11px] text-outline font-semibold font-mono">{t.ticket_number}</span>
                                                                                                <button onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                                                                                                    <span className="material-symbols-outlined text-[12px]">{expandedTicketId === t.id ? 'unfold_less' : 'unfold_more'}</span>
                                                                                                    <span>Logs</span>
                                                                                                </button>
                                                                                                <button onClick={() => { setSuccessTicketNumber(t.ticket_number); setSuccessDeviceName(`${t.device_brand} ${t.device_model}`); setShowSuccessQrModal(true); }} className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-0.5">
                                                                                                    <span className="material-symbols-outlined text-[12px]">qr_code_2</span>
                                                                                                    <span>QR Code</span>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {expandedTicketId === t.id && t.history && (
                                                                                        <div className="mt-3 pl-2 space-y-2.5 border-l-2 border-outline-variant/60 animate-fadeIn text-[11px] text-left">
                                                                                            {t.history.map((hist, idx) => (
                                                                                                <div key={hist.id || idx} className="relative pl-3">
                                                                                                    <span style={{ backgroundColor: hist.stage_color || '#7c6cff' }} className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border border-surface"></span>
                                                                                                    <p className="font-bold text-on-surface">{hist.stage_name} <span className="text-[9px] text-outline font-normal">({new Date(hist.created_at).toLocaleDateString()})</span></p>
                                                                                                    <p className="text-on-surface-variant font-medium leading-relaxed mt-0.5">{hist.notes}</p>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                                <td className="p-3 font-medium text-on-surface-variant max-w-[200px] truncate">{t.issue_reported}</td>
                                                                                <td className="p-3">
                                                                                    <select value={t.status_code} onChange={(e) => handleMoveStage(t.id, e.target.value)} className="h-9 border border-outline rounded-lg text-xs font-bold bg-surface px-1 cursor-pointer focus:ring-1 focus:ring-primary">
                                                                                        {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                                                                                    </select>
                                                                                </td>
                                                                                <td className="p-3">
                                                                                    <select value={t.assigned_technician || ''} onChange={(e) => handleAssignTechnician(t.id, e.target.value)} className="h-9 border border-outline rounded-lg text-xs font-bold bg-surface px-1 cursor-pointer focus:ring-1 focus:ring-primary w-40">
                                                                                        <option value="">Unassigned</option>
                                                                                        {technicians.map(tc => <option key={tc.id} value={tc.id}>{tc.username}</option>)}
                                                                                    </select>
                                                                                </td>
                                                                                <td className="p-3">
                                                                                    {t.status_code === 'ready' && (
                                                                                        <button onClick={() => { setActiveInvoiceTicket(t); setInvoiceBillingAddress(`${t.customer_username} (Contact: ${t.customer_phone || 'N/A'}), Mumbai, Maharashtra, India`); setShowInvoiceModal(true); }} className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold text-xs active:scale-95 transition-all shadow flex items-center gap-1">
                                                                                            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                                                                            <span>Invoice</span>
                                                                                        </button>
                                                                                    )}
                                                                                    {t.status_code === 'delivered' && (
                                                                                        <span className="text-secondary font-bold text-xs uppercase flex items-center gap-0.5">
                                                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                                                            <span>Archived</span>
                                                                                        </span>
                                                                                    )}
                                                                                    {t.status_code !== 'ready' && t.status_code !== 'delivered' && (
                                                                                        <span className="text-outline font-bold text-[11px] uppercase tracking-wider">In Transit</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Technician Staff Registry */}
                                                <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm mt-6">
                                                    <div className="p-4 border-b border-surface-container flex justify-between items-center">
                                                        <h3 className="font-bold text-md text-primary flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined">badge</span>
                                                            <span>Workstation Staff Registry</span>
                                                        </h3>
                                                        <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded">Active Benched</span>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse text-sm">
                                                            <thead>
                                                                <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[12px] uppercase">
                                                                    <th className="p-3">Technician</th>
                                                                    <th className="p-3">Experience</th>
                                                                    <th className="p-3">Skills / Specialties</th>
                                                                    <th className="p-3">Assigned Workstation</th>
                                                                    <th className="p-3 text-center">Jobs Done</th>
                                                                    <th className="p-3 text-center">B2B Verification</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {technicians.length === 0 ? (
                                                                    <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant font-semibold">No technicians linked to this shop yet. Link technicians via join requests above.</td></tr>
                                                                ) : (
                                                                    technicians.map((tc) => (
                                                                        <tr key={tc.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                            <td className="p-3 font-bold text-on-surface">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">{tc.username.substring(0, 2)}</div>
                                                                                    <span>{tc.username}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3 font-semibold text-on-surface-variant">{tc.experience_years} Years</td>
                                                                            <td className="p-3 font-medium text-on-surface-variant max-w-[200px]">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {tc.skills_list && tc.skills_list.length > 0
                                                                                        ? tc.skills_list.map(sk => <span key={sk.id} className="bg-primary/5 text-primary text-[10px] font-semibold px-2 py-0.5 rounded border border-primary/5">{sk.name}</span>)
                                                                                        : <span className="text-outline text-[11px]">General Hardware</span>}
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3 font-bold text-xs text-on-surface">{tc.branch_name || 'Hub Central Workstation'}</td>
                                                                            <td className="p-3 text-center font-bold text-sm text-secondary">
                                                                                {tickets.filter(t => t.technician_name === tc.username && (t.status_code === 'ready' || t.status_code === 'delivered')).length}
                                                                            </td>
                                                                            <td className="p-3 text-center">
                                                                                <button onClick={() => handleToggleVerification(tc.id, tc.is_verified)} className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 mx-auto active:scale-95 transition-all shadow-sm ${tc.is_verified ? 'bg-success/15 text-success hover:bg-success/20 border border-success/20' : 'bg-warning/15 text-warning hover:bg-warning/20 border border-warning/20'}`}>
                                                                                    <span className="material-symbols-outlined text-[14px]">{tc.is_verified ? 'verified' : 'pending_actions'}</span>
                                                                                    <span>{tc.is_verified ? 'Verified Staff' : 'Verify Credentials'}</span>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ── INVENTORY TAB ── */}
                                {activeTab === 'inventory' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end flex-wrap gap-2 mb-2">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Spares Inventory</h2>
                                                <p className="font-body-md text-on-surface-variant">Real-time spares, stock allocations, and compliance pricing.</p>
                                            </div>
                                            <button onClick={() => { if (branches.length === 0) { toast.error('Initialize shop branches first.'); return; } setInventoryForm(prev => ({ ...prev, branch: branches[0]?.id || '' })); setShowAddInventory(true); }} className="h-11 px-4 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-1 text-sm shadow-md active:scale-95 transition-all hover:bg-primary-container">
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                <span>Register Spares Item</span>
                                            </button>
                                        </div>
                                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[12px] uppercase">
                                                            <th className="p-3">Part Name / SKU</th>
                                                            <th className="p-3">Category</th>
                                                            <th className="p-3 text-center">Stock Level</th>
                                                            <th className="p-3 text-right">Selling Price</th>
                                                            <th className="p-3 text-center">HSN Code</th>
                                                            <th className="p-3 text-center">GST Rate</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {inventory.length === 0 ? (
                                                            <tr><td colSpan="6" className="p-8 text-center text-on-surface-variant font-semibold">No spares cataloged in parts inventory.</td></tr>
                                                        ) : (
                                                            inventory.map((item) => (
                                                                <tr key={item.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                    <td className="p-3 font-bold text-on-surface">
                                                                        <div className="flex items-start gap-2.5">
                                                                            {item.image ? (
                                                                                <div className="w-10 h-10 rounded border border-outline overflow-hidden bg-surface-container flex-shrink-0"><img src={item.image} alt="Spare Part" className="w-full h-full object-cover" /></div>
                                                                            ) : (
                                                                                <div className="w-10 h-10 rounded border border-outline bg-surface-container-low flex items-center justify-center flex-shrink-0 text-outline"><span className="material-symbols-outlined text-[20px]">build</span></div>
                                                                            )}
                                                                            <div>
                                                                                <p>{item.name}</p>
                                                                                <p className="text-[11px] text-outline font-semibold mt-0.5">SKU: {item.sku}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-on-surface-variant font-semibold">{item.category}</td>
                                                                    <td className="p-3 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.stock_level <= item.low_stock_threshold ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                                                            {item.stock_level} Units
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-right font-bold text-primary">₹{item.selling_price}</td>
                                                                    <td className="p-3 text-center font-mono text-xs">{item.hsn_code}</td>
                                                                    <td className="p-3 text-center text-xs font-semibold">{item.gst_rate}%</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── BILLING TAB ── */}
                                {activeTab === 'billing' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">GST Invoices & Financial Analytics</h2>
                                            <p className="font-body-md text-on-surface-variant">Real-time tracking of CGST/SGST collected, spares value, and printable B2B tax invoice logs.</p>
                                        </div>

                                        {/* Financial KPI */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Total Revenue</span><span className="material-symbols-outlined text-primary text-[20px]">currency_rupee</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">₹{invoices.reduce((s, inv) => s + parseFloat(inv.grand_total || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Taxes Collected (GST)</span><span className="material-symbols-outlined text-secondary text-[20px]">percent</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">₹{invoices.reduce((s, inv) => s + parseFloat(inv.cgst || 0) + parseFloat(inv.sgst || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-tertiary-container shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Invoices Compiled</span><span className="material-symbols-outlined text-tertiary-container text-[20px]">receipt_long</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">{invoices.length} <span className="text-xs text-outline font-semibold">synced records</span></p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-error shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start"><span className="text-[11px] font-bold text-outline uppercase tracking-wider">Spares Warning</span><span className="material-symbols-outlined text-error text-[20px]">inventory_2</span></div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">{lowStockSparesCount} <span className="text-xs text-outline font-semibold">under limit</span></p>
                                            </div>
                                        </div>

                                        {/* Invoices Table */}
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
                                                            <th className="p-3 text-right">CGST (9%)</th>
                                                            <th className="p-3 text-right">SGST (9%)</th>
                                                            <th className="p-3 text-right">Grand Total</th>
                                                            <th className="p-3 text-center">Status</th>
                                                            <th className="p-3 text-center">GST Invoice</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {invoices.length === 0 ? (
                                                            <tr><td colSpan="8" className="p-8 text-center text-on-surface-variant font-semibold">No invoices generated yet for scoped branches.</td></tr>
                                                        ) : (
                                                            invoices.map((inv) => (
                                                                <tr key={inv.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                    <td className="p-3"><p className="font-bold text-on-surface">{inv.invoice_number}</p><p className="text-[11px] text-outline font-semibold mt-0.5">{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p></td>
                                                                    <td className="p-3"><p className="font-semibold text-on-surface">{inv.device}</p><p className="text-[11px] text-outline font-semibold mt-0.5">Ticket: {inv.ticket_number}</p></td>
                                                                    <td className="p-3 text-right font-medium text-on-surface-variant">₹{inv.labor_charges}</td>
                                                                    <td className="p-3 text-right text-xs font-medium text-outline">₹{inv.cgst}</td>
                                                                    <td className="p-3 text-right text-xs font-medium text-outline">₹{inv.sgst}</td>
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
                <StageTransitionModal
                    open={showStageNotesModal}
                    onClose={() => setShowStageNotesModal(false)}
                    stageCode={stageNotesCode}
                    stages={stages}
                    notes={stageNotesInput}
                    onNotesChange={setStageNotesInput}
                    onSubmit={submitStageNotesTransition}
                />
                <WalkinModal
                    open={showWalkinModal}
                    onClose={() => setShowWalkinModal(false)}
                    form={walkinForm}
                    onFormChange={setWalkinForm}
                    onSubmit={handleCreateWalkinSubmit}
                    customers={customers}
                    branches={branches}
                />
                <CreateBranchModal
                    open={showAddBranchModal}
                    onClose={() => setShowAddBranchModal(false)}
                    form={branchForm}
                    onFormChange={setBranchForm}
                    onSubmit={handleCreateBranchSubmit}
                />
                <CreateInvoiceModal
                    open={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    ticket={activeInvoiceTicket}
                    inventory={inventory}
                    laborCharges={laborCharges}
                    onLaborChange={setLaborCharges}
                    selectedSpares={selectedSpares}
                    onSparesChange={setSelectedSpares}
                    shopGstin={invoiceShopGstin}
                    onShopGstinChange={setInvoiceShopGstin}
                    customerGstin={invoiceCustomerGstin}
                    onCustomerGstinChange={setInvoiceCustomerGstin}
                    billingAddress={invoiceBillingAddress}
                    onBillingAddressChange={setInvoiceBillingAddress}
                    onSubmit={handleCreateInvoiceSubmit}
                />
                <AddInventoryModal
                    open={showAddInventory}
                    onClose={() => setShowAddInventory(false)}
                    form={inventoryForm}
                    onFormChange={setInventoryForm}
                    onSubmit={handleAddSparesInventory}
                    branches={branches}
                />
                <InvoicePrintView
                    open={showInvoicePreviewModal}
                    onClose={() => setShowInvoicePreviewModal(false)}
                    invoice={selectedPreviewInvoice}
                />
                <QrSuccessModal open={showSuccessQrModal} onClose={() => setShowSuccessQrModal(false)} ticketNumber={successTicketNumber} deviceName={successDeviceName} />

                {/* Manual Invoice Modal (inline) */}
                <Modal open={showManualInvoiceModal} onClose={() => setShowManualInvoiceModal(false)} title="Manual GST Invoice Generator" maxWidth="max-w-2xl">
                    <form onSubmit={handleManualInvoiceSubmit} className="space-y-4 text-left">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Customer Name *</label>
                                <input type="text" placeholder="Full customer name" value={manualInvoiceForm.customer_name} onChange={(e) => setManualInvoiceForm(p => ({ ...p, customer_name: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Customer Phone</label>
                                <input type="text" placeholder="e.g. 9892123456" value={manualInvoiceForm.customer_phone} onChange={(e) => setManualInvoiceForm(p => ({ ...p, customer_phone: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Shop GSTIN</label>
                                <input type="text" value={manualInvoiceForm.shop_gstin} onChange={(e) => setManualInvoiceForm(p => ({ ...p, shop_gstin: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none font-mono focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Customer GSTIN</label>
                                <input type="text" placeholder="Optional" value={manualInvoiceForm.customer_gstin} onChange={(e) => setManualInvoiceForm(p => ({ ...p, customer_gstin: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none font-mono focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-outline uppercase">Billing Address *</label>
                            <textarea rows="2" placeholder="Full billing address..." value={manualInvoiceForm.billing_address} onChange={(e) => setManualInvoiceForm(p => ({ ...p, billing_address: e.target.value }))} className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none focus:ring-1 focus:ring-primary" required />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Labour Charges (₹)</label>
                                <input type="number" step="0.01" value={manualInvoiceForm.labor_charges} onChange={(e) => setManualInvoiceForm(p => ({ ...p, labor_charges: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Payment Method</label>
                                <select value={manualInvoiceForm.payment_method} onChange={(e) => setManualInvoiceForm(p => ({ ...p, payment_method: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none focus:ring-1 focus:ring-primary">
                                    <option value="upi">UPI</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-outline uppercase">Payment Status</label>
                                <select value={manualInvoiceForm.payment_status} onChange={(e) => setManualInvoiceForm(p => ({ ...p, payment_status: e.target.value }))} className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none focus:ring-1 focus:ring-primary">
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                </select>
                            </div>
                        </div>

                        {/* Dynamic Items */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-outline uppercase">Line Items / Parts</label>
                                <button type="button" onClick={addManualItem} className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    <span>Add Item</span>
                                </button>
                            </div>
                            {manualInvoiceForm.items.length === 0 ? (
                                <p className="text-[11px] text-outline font-semibold text-center py-3 border border-dashed border-outline-variant rounded-lg">No items added. Click "Add Item" to include spare parts or services.</p>
                            ) : (
                                <div className="space-y-2">
                                    {manualInvoiceForm.items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-surface-container-low p-2 rounded-lg border border-outline-variant">
                                            <input type="text" placeholder="Part/Service Name" value={item.name} onChange={(e) => updateManualItem(idx, 'name', e.target.value)} className="col-span-4 h-9 border border-outline rounded text-xs px-2 bg-surface outline-none" />
                                            <input type="text" placeholder="HSN" value={item.hsn} onChange={(e) => updateManualItem(idx, 'hsn', e.target.value)} className="col-span-2 h-9 border border-outline rounded text-xs px-2 bg-surface outline-none font-mono" />
                                            <input type="number" placeholder="Price" step="0.01" value={item.price} onChange={(e) => updateManualItem(idx, 'price', e.target.value)} className="col-span-2 h-9 border border-outline rounded text-xs px-2 bg-surface outline-none" />
                                            <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={(e) => updateManualItem(idx, 'qty', e.target.value)} className="col-span-2 h-9 border border-outline rounded text-xs px-2 bg-surface outline-none" />
                                            <button type="button" onClick={() => removeManualItem(idx)} className="col-span-2 h-9 bg-error/10 text-error hover:bg-error/20 rounded font-bold text-xs flex items-center justify-center active:scale-95 transition-transform">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Totals Preview */}
                        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant space-y-1.5 text-sm">
                            <div className="flex justify-between"><span className="text-outline font-semibold">Subtotal</span><span className="font-bold">₹{manualSubtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-outline font-semibold">GST (18%)</span><span className="font-bold text-secondary">₹{manualGst.toFixed(2)}</span></div>
                            <div className="flex justify-between border-t border-outline-variant pt-1.5"><span className="font-extrabold text-primary">Grand Total</span><span className="font-extrabold text-primary text-lg">₹{manualGrandTotal.toFixed(2)}</span></div>
                        </div>

                        <button type="submit" className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-sm shadow">
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            <span>Generate Manual GST Invoice</span>
                        </button>
                    </form>
                </Modal>
            </div>
        </>
    );
}
