import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../services";
import toast, { Toaster } from "react-hot-toast";
import {
    fetchBranches,
    fetchTickets,
    createTicket,
    updateTicket,
    fetchTechnicians,
    fetchInventory,
    addInventoryItem,
    createInvoice,
    fetchStages,
    fetchCustomers,
    createBranch,
    fetchInvoices,
    fetchShops,
    fetchJoinRequests,
    createJoinRequest,
    updateJoinRequest
} from "../services/api";

export default function Dashboard() {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    // App Loading and core datasets
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [stages, setStages] = useState([]);

    // GST Billing, Invoices & Customer Lookup States
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Join Requests and Shop Search States
    const [joinRequests, setJoinRequests] = useState([]);
    const [shopsSearchResults, setShopsSearchResults] = useState([]);
    const [shopSearchInput, setShopSearchInput] = useState("");
    const [joinRequestModalOpen, setJoinRequestModalOpen] = useState(false);
    const [expandedTicketId, setExpandedTicketId] = useState(null);

    // Stage log notes modal
    const [showStageNotesModal, setShowStageNotesModal] = useState(false);
    const [stageNotesTicketId, setStageNotesTicketId] = useState(null);
    const [stageNotesCode, setStageNotesCode] = useState("");
    const [stageNotesInput, setStageNotesInput] = useState("");

    // Register Branch Modal state
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const [branchForm, setBranchForm] = useState({
        name: "",
        city: "Mumbai",
        address: "",
        phone: "",
        specialties: "Mobiles, Laptops, Tablets"
    });

    // Walk-in Ticket Creation state
    const [showWalkinModal, setShowWalkinModal] = useState(false);
    const [walkinForm, setWalkinForm] = useState({
        customer: "",
        branch: "",
        device_category: "Smartphone",
        device_brand: "",
        device_model: "",
        device_serial: "",
        issue_reported: "",
        priority: "medium",
        estimated_cost: "0.00",
        advance_paid: "0.00"
    });

    // UI Panel States
    const [activeTab, setActiveTab] = useState("repairs"); // customer: repairs, workshops, history; owner: erp, inventory; tech: queue, diagnostics
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filtering states for Customer Branch Discovery
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");

    // Google Places Search & Distance Pagination States
    const [selectedRepairType, setSelectedRepairType] = useState("");
    const [visibleShopsLimit, setVisibleShopsLimit] = useState(10);

    // Customer Booking Modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        device_category: "Smartphone",
        device_brand: "",
        device_model: "",
        device_serial: "",
        issue_reported: "",
        priority: "medium"
    });

    // Shop Owner Spares / Inventory Add
    const [showAddInventory, setShowAddInventory] = useState(false);
    const [inventoryForm, setInventoryForm] = useState({
        branch: "",
        name: "",
        sku: "",
        category: "Display",
        stock_level: 10,
        low_stock_threshold: 3,
        purchase_price: "",
        selling_price: "",
        hsn_code: "8517",
        gst_rate: "18.00"
    });

    // Shop Owner GST Billing Modal
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [activeInvoiceTicket, setActiveInvoiceTicket] = useState(null);
    const [laborCharges, setLaborCharges] = useState("0.00");
    const [selectedSpares, setSelectedSpares] = useState([]);
    const [invoiceShopGstin, setInvoiceShopGstin] = useState("27AAAAA1111A1Z1");
    const [invoiceCustomerGstin, setInvoiceCustomerGstin] = useState("");
    const [invoiceBillingAddress, setInvoiceBillingAddress] = useState("");
    const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
    const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);

    // Technician Diagnostics Workstation
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [diagNotes, setDiagNotes] = useState("");
    const [repairStatus, setRepairStatus] = useState("diagnosing");
    const [techSelectedSpares, setTechSelectedSpares] = useState([]);

    useEffect(() => {
        if (!user) {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login", { replace: true });
            }
        } else {
            // Set default tabs based on workstation roles
            if (user.role === "shop_owner") setActiveTab("erp");
            else if (user.role === "technician") setActiveTab("queue");
            else setActiveTab("repairs");

            loadDashboardData();
        }
    }, [user]);

    // Reactive refetch hook for Google Places API simulation parameters
    useEffect(() => {
        if (user && user.role === "customer" && activeTab === "workshops") {
            const reloadBranches = async () => {
                try {
                    const branchData = await fetchBranches({ 
                        repair_type: selectedRepairType,
                        city: cityFilter,
                        specialty: specialtyFilter
                    });
                    setBranches(branchData);
                } catch (error) {
                    console.error("Failed loading filtered workshops", error);
                }
            };
            reloadBranches();
        }
    }, [selectedRepairType, cityFilter, specialtyFilter, activeTab]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load branches based on user role (scoping vs. discovery)
            const branchData = await fetchBranches(user?.role === "customer" ? { all: true } : {});
            setBranches(branchData);

            const ticketData = await fetchTickets();
            setTickets(ticketData);

            const stageData = await fetchStages();
            setStages(stageData);

            if (user?.role === "shop_owner" || user?.role === "technician") {
                const invData = await fetchInventory();
                setInventory(invData);
                
                try {
                    const custData = await fetchCustomers();
                    setCustomers(custData);
                    
                    const invList = await fetchInvoices();
                    setInvoices(invList);
                } catch (e) {
                    console.error("Staff lookup data fetch issue", e);
                }

                if (user?.role === "shop_owner" || user?.role === "technician") {
                    const techData = await fetchTechnicians();
                    setTechnicians(techData);

                    try {
                        const reqData = await fetchJoinRequests();
                        setJoinRequests(reqData);
                    } catch (reqErr) {
                        console.error("Failed loading join requests", reqErr);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading dashboard data", error);
            toast.error("Unable to load latest records. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login", { replace: true });
        toast.success("Successfully logged out");
    };

    // Filter branches dynamically based on user inputs
    const filteredBranches = branches.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.specialties.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = cityFilter === "" || b.city.toLowerCase() === cityFilter.toLowerCase();
        const matchesSpecialty = specialtyFilter === "" || b.specialties.toLowerCase().includes(specialtyFilter.toLowerCase());
        return matchesSearch && matchesCity && matchesSpecialty;
    });

    // Customer: Submit secure repair booking ticket
    const handleCreateTicketSubmit = async (e) => {
        e.preventDefault();
        if (!bookingForm.device_brand || !bookingForm.device_model || !bookingForm.issue_reported) {
            toast.error("Please fill in all required device details.");
            return;
        }

        try {
            const ticketPayload = {
                branch: selectedBranch.id,
                device_category: bookingForm.device_category,
                device_brand: bookingForm.device_brand,
                device_model: bookingForm.device_model,
                device_serial: bookingForm.device_serial || "N/A",
                issue_reported: bookingForm.issue_reported,
                priority: bookingForm.priority
            };

            await createTicket(ticketPayload);
            toast.success("Secure repair booking submitted successfully!");
            setShowBookingModal(false);
            setBookingForm({
                device_category: "Smartphone",
                device_brand: "",
                device_model: "",
                device_serial: "",
                issue_reported: "",
                priority: "medium"
            });
            // Refresh
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
            setActiveTab("repairs");
        } catch (error) {
            console.error("Failed booking secure repair", error);
            toast.error("Booking failed. Please try again.");
        }
    };

    // Shop Owner: Register new physical Branch/Office Location
    const handleCreateBranchSubmit = async (e) => {
        e.preventDefault();
        if (!branchForm.name || !branchForm.city || !branchForm.address || !branchForm.phone) {
            toast.error("Please provide all required branch details.");
            return;
        }

        try {
            await createBranch(branchForm);
            toast.success("New physical branch registered successfully!");
            setShowAddBranchModal(false);
            setBranchForm({
                name: "",
                city: "Mumbai",
                address: "",
                phone: "",
                specialties: "Mobiles, Laptops, Tablets"
            });
            loadDashboardData();
        } catch (error) {
            console.error("Failed registering physical branch", error);
            toast.error("Branch registration failed. Check GST parameters.");
        }
    };

    // B2B Walk-in / Technician: Submit new repair job order
    const handleCreateWalkinSubmit = async (e) => {
        e.preventDefault();
        if (!walkinForm.customer || !walkinForm.branch || !walkinForm.device_brand || !walkinForm.device_model || !walkinForm.issue_reported) {
            toast.error("Please select customer, branch, and fill in required device parameters.");
            return;
        }

        try {
            const payload = {
                customer: walkinForm.customer,
                branch: walkinForm.branch,
                device_category: walkinForm.device_category,
                device_brand: walkinForm.device_brand,
                device_model: walkinForm.device_model,
                device_serial: walkinForm.device_serial || "N/A",
                issue_reported: walkinForm.issue_reported,
                priority: walkinForm.priority,
                estimated_cost: walkinForm.estimated_cost,
                advance_paid: walkinForm.advance_paid
            };

            // If technician, auto-assign this job to their own technician profile ID
            if (user?.role === "technician") {
                const techDetails = technicians.find(t => t.username === user.username);
                if (techDetails) {
                    payload.assigned_technician = techDetails.id;
                }
            }

            await createTicket(payload);
            toast.success("Walk-in repair order created successfully!");
            setShowWalkinModal(false);
            setWalkinForm({
                customer: "",
                branch: "",
                device_category: "Smartphone",
                device_brand: "",
                device_model: "",
                device_serial: "",
                issue_reported: "",
                priority: "medium",
                estimated_cost: "0.00",
                advance_paid: "0.00"
            });
            loadDashboardData();
        } catch (error) {
            console.error("Failed creating walk-in job order", error);
            toast.error("Failed to register walk-in repair order.");
        }
    };

    // Shop Owner: Assign technician to repair order
    const handleAssignTechnician = async (ticketId, techId) => {
        try {
            await updateTicket(ticketId, { assigned_technician: techId });
            toast.success("Technician assigned to workstation successfully.");
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
        } catch (error) {
            console.error("Assign technician failure", error);
            toast.error("Failed to assign technician.");
        }
    };

    // Shop Owner & Technician: Move ticket to standard stage, triggering work notes prompt
    const handleMoveStage = (ticketId, stageCode) => {
        setStageNotesTicketId(ticketId);
        setStageNotesCode(stageCode);
        setStageNotesInput("");
        setShowStageNotesModal(true);
    };

    const submitStageNotesTransition = async (e) => {
        e.preventDefault();
        if (!stageNotesTicketId || !stageNotesCode) return;

        try {
            const stageObj = stages.find(s => s.code === stageNotesCode);
            await updateTicket(stageNotesTicketId, { 
                status_code: stageNotesCode,
                stage_notes: stageNotesInput || `Repair transitioned to ${stageObj?.name || 'next stage'}`
            });
            toast.success("Pipeline milestone updated with transition notes.");
            setShowStageNotesModal(false);
            setStageNotesTicketId(null);
            setStageNotesCode("");
            setStageNotesInput("");
            
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
        } catch (error) {
            console.error("Stage update failure", error);
            toast.error("Failed to update milestone.");
        }
    };

    // Technician: Search for shops to join
    const handleSearchShops = async (e) => {
        e.preventDefault();
        if (!shopSearchInput.trim()) {
            toast.error("Enter a shop name or Shop ID.");
            return;
        }
        try {
            const results = await fetchShops(shopSearchInput);
            setShopsSearchResults(results);
            if (results.length === 0) {
                toast.error("No registered shops matched your criteria.");
            } else {
                toast.success(`Found ${results.length} matching shops.`);
            }
        } catch (err) {
            console.error("Failed searching shops", err);
            toast.error("Search failed.");
        }
    };

    // Technician: Request to join a B2B shop
    const handleRequestToJoinShop = async (shopId) => {
        try {
            await createJoinRequest(shopId);
            toast.success("Join request submitted successfully. Awaiting approval!");
            const freshReqs = await fetchJoinRequests();
            setJoinRequests(freshReqs);
        } catch (err) {
            console.error("Join request failed", err);
            toast.error("Duplicate request or shop join issue.");
        }
    };

    // Shop Owner: Approve or Reject Join Request
    const handleManageJoinRequest = async (requestId, statusValue) => {
        try {
            await updateJoinRequest(requestId, statusValue);
            toast.success(`Join request ${statusValue} successfully.`);
            loadDashboardData();
        } catch (err) {
            console.error("Failed managing join request", err);
            toast.error("Failed to update join request.");
        }
    };

    // Shop Owner: Register new spares consumed
    const handleAddSparesInventory = async (e) => {
        e.preventDefault();
        if (!inventoryForm.branch || !inventoryForm.name || !inventoryForm.selling_price) {
            toast.error("Complete branch and spare item particulars.");
            return;
        }

        try {
            await addInventoryItem({
                ...inventoryForm,
                purchase_price: inventoryForm.purchase_price || "0.00",
                selling_price: inventoryForm.selling_price
            });
            toast.success("New spare item registered in parts inventory.");
            setShowAddInventory(false);
            
            // Reset form
            setInventoryForm({
                branch: branches[0]?.id || "",
                name: "",
                sku: "",
                category: "Display",
                stock_level: 10,
                low_stock_threshold: 3,
                purchase_price: "",
                selling_price: "",
                hsn_code: "8517",
                gst_rate: 18.00
            });

            // Refresh inventory
            const freshInv = await fetchInventory();
            setInventory(freshInv);
        } catch (error) {
            console.error("Parts registration failure", error);
            toast.error("Failed registering spare parts.");
        }
    };

    // Shop Owner: Submit compliant GST invoice
    const handleCreateInvoiceSubmit = async (e) => {
        e.preventDefault();
        if (!laborCharges || parseFloat(laborCharges) < 0) {
            toast.error("Input valid labor charges.");
            return;
        }

        try {
            const invoicePayload = {
                ticket: activeInvoiceTicket.id,
                labor_charges: parseFloat(laborCharges).toFixed(2),
                spares_used: selectedSpares.map(id => ({ id, quantity: 1 })),
                shop_gstin: invoiceShopGstin || "27AAAAA1111A1Z1",
                customer_gstin: invoiceCustomerGstin || "",
                billing_address: invoiceBillingAddress || (activeInvoiceTicket.customer_username + ", Mumbai")
            };

            await createInvoice(invoicePayload);
            toast.success("CGST/SGST compliant GST invoice generated successfully!");
            setShowInvoiceModal(false);
            setSelectedSpares([]);
            setLaborCharges("0.00");
            setInvoiceCustomerGstin("");
            setInvoiceBillingAddress("");
            
            // Refresh dataset
            loadDashboardData();
        } catch (error) {
            console.error("Failed invoice generation", error);
            toast.error("Invoice compilation failed.");
        }
    };

    // Technician: Save diagnostic logs and advance workflow stage
    const handleTechnicianSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTicket) {
            toast.error("Select a job sheet first.");
            return;
        }

        try {
            await updateTicket(selectedTicket.id, {
                diagnostics_notes: diagNotes,
                status_code: repairStatus
            });
            toast.success("Diagnostic logs & workflow stage updated!");
            setSelectedTicket(null);
            setDiagNotes("");
            // Refresh
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
        } catch (error) {
            console.error("Tech workstation save failure", error);
            toast.error("Failed updating technical workstation.");
        }
    };

    // Resolve stage status labels dynamically
    const getStatusLabelAndColor = (code) => {
        const matchingStage = stages.find(s => s.code === code);
        if (matchingStage) {
            return {
                label: matchingStage.name,
                color: matchingStage.color || "#00288e"
            };
        }

        // Fallbacks
        switch (code) {
            case "received": return { label: "Received", color: "#00288e" };
            case "diagnosing": return { label: "Diagnosing", color: "#cca000" };
            case "waiting_approval": return { label: "Awaiting Approval", color: "#ff8c00" };
            case "in_repair": return { label: "Repairing", color: "#007233" };
            case "testing": return { label: "Testing", color: "#6f00ba" };
            case "ready": return { label: "Ready for Pickup", color: "#006d30" };
            case "delivered": return { label: "Delivered", color: "#444653" };
            default: return { label: code, color: "#00288e" };
        }
    };

    // Derived owner metrics calculations
    const openTicketsCount = tickets.filter(t => t.status_code !== "delivered").length;
    const completedTicketsCount = tickets.filter(t => t.status_code === "delivered").length;
    const activeTechsCount = technicians.length;
    const lowStockSparesCount = inventory.filter(item => item.stock_level <= item.low_stock_threshold).length;
    const totalRevEst = tickets
        .filter(t => t.status_code === "delivered")
        .reduce((sum, t) => sum + parseFloat(t.estimated_cost || 0), 0);

    return (
        <>
            <Toaster position="top-center" />
            <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
                
                {/* ── TopAppBar ── */}
                <header className="fixed top-0 w-full z-50 bg-surface dark:bg-inverse-surface shadow-sm flex justify-between items-center px-margin-mobile h-touch-target">
                    <div className="flex items-center gap-sm">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex items-center justify-center p-1 text-primary hover:bg-surface-container rounded-lg"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                        <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>handyman</span>
                        <h1 className="font-headline-lg text-[22px] font-bold text-primary dark:text-primary-fixed">RepairBharat</h1>
                    </div>

                    <div className="flex items-center gap-md">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-sm font-bold text-on-surface">{user?.username}</span>
                            <span className="text-[11px] text-on-surface-variant font-semibold uppercase">
                                {user?.role === "shop_owner" ? "ERP Admin" : user?.role === "technician" ? "Workstation Tech" : "Customer Client"}
                            </span>
                        </div>
                        
                        {/* Profile action menu dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileMenu(prev => !prev)}
                                className="w-8 h-8 rounded-full overflow-hidden bg-primary-container border border-outline flex items-center justify-center font-bold text-primary text-sm shadow-sm cursor-pointer"
                            >
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </button>
                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-surface shadow-md rounded-xl border border-outline-variant p-2 w-48 z-50 animate-fadeIn">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 p-2 text-sm text-error hover:bg-error-container rounded-lg font-bold transition-all text-left"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Outer Shell Flex Row ── */}
                <div className="flex flex-1 pt-12">
                    
                    {/* ── Left Sidebar Navigation (Desktop) ── */}
                    <aside className={`hidden md:flex flex-col w-64 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant p-4 sticky top-12 h-[calc(100vh-48px)] justify-between`}>
                        <div className="space-y-6">
                            
                            {/* Profile Info Spot */}
                            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
                                    {user?.username?.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-primary truncate">{user?.username}</p>
                                    <p className="text-[11px] text-on-surface-variant font-semibold truncate uppercase">{user?.role?.replace("_", " ")}</p>
                                </div>
                            </div>

                            {/* Nav Options */}
                            <nav className="flex flex-col gap-1">
                                {user?.role === "customer" && (
                                    <>
                                        <button
                                            onClick={() => setActiveTab("repairs")}
                                            className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                activeTab === "repairs" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">handyman</span>
                                            <span>My Active Repairs</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("workshops")}
                                            className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                activeTab === "workshops" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">explore</span>
                                            <span>Discover Workshops</span>
                                        </button>
                                    </>
                                )}

                                {user?.role === "shop_owner" && (
                                     <>
                                         <button
                                             onClick={() => setActiveTab("erp")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "erp" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                             <span>Master ERP Control</span>
                                         </button>
                                         <button
                                             onClick={() => setActiveTab("inventory")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "inventory" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                                             <span>Spares Inventory</span>
                                         </button>
                                         <button
                                             onClick={() => setActiveTab("billing")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "billing" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                             <span>GST Billing & Invoices</span>
                                         </button>
                                     </>
                                 )}
 
                                 {user?.role === "technician" && (
                                     <>
                                         <button
                                             onClick={() => setActiveTab("queue")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "queue" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">assignment</span>
                                             <span>My Active Queue</span>
                                         </button>
                                         <button
                                             onClick={() => setActiveTab("diagnostics")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "diagnostics" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">construction</span>
                                             <span>Diagnostics Bench</span>
                                         </button>
                                         <button
                                             onClick={() => setActiveTab("billing")}
                                             className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                 activeTab === "billing" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
                                             }`}
                                         >
                                             <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                             <span>GST Billing & Invoices</span>
                                         </button>
                                     </>
                                 )}
                            </nav>

                        </div>

                        {/* Sidebar Footer */}
                        <div className="border-t border-outline-variant pt-3 space-y-2">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-2 bg-surface hover:bg-error-container/20 text-error rounded-lg font-bold transition-all text-xs border border-error/20"
                            >
                                <span className="material-symbols-outlined text-[16px]">logout</span>
                                <span>Sign Out</span>
                            </button>
                            <p className="text-[10px] text-outline font-semibold text-center">RepairBharat v3.0.0</p>
                        </div>
                    </aside>

                    {/* ── Mobile Sidebar Navigation Overlay ── */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-40 flex">
                            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)}></div>
                            <aside className="relative flex flex-col w-64 bg-surface max-w-xs h-full p-4 z-50 justify-between">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                                        <span className="font-bold text-primary">Workstation Options</span>
                                        <button onClick={() => setMobileMenuOpen(false)}>
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>
                                    </div>
                                    <nav className="flex flex-col gap-1">
                                        {user?.role === "customer" && (
                                            <>
                                                <button
                                                    onClick={() => { setActiveTab("repairs"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "repairs" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">handyman</span>
                                                    <span>My Active Repairs</span>
                                                </button>
                                                <button
                                                    onClick={() => { setActiveTab("workshops"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "workshops" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">explore</span>
                                                    <span>Discover Workshops</span>
                                                </button>
                                            </>
                                        )}

                                        {user?.role === "shop_owner" && (
                                            <>
                                                <button
                                                    onClick={() => { setActiveTab("erp"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "erp" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                                    <span>Master ERP Control</span>
                                                </button>
                                                <button
                                                    onClick={() => { setActiveTab("inventory"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "inventory" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                                                    <span>Spares Inventory</span>
                                                </button>
                                            </>
                                        )}

                                        {user?.role === "technician" && (
                                            <>
                                                <button
                                                    onClick={() => { setActiveTab("queue"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "queue" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                                                    <span>My Active Queue</span>
                                                </button>
                                                <button
                                                    onClick={() => { setActiveTab("diagnostics"); setMobileMenuOpen(false); }}
                                                    className={`flex items-center gap-3 p-3 font-semibold text-sm rounded-lg transition-all ${
                                                        activeTab === "diagnostics" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">construction</span>
                                                    <span>Diagnostics Bench</span>
                                                </button>
                                            </>
                                        )}
                                    </nav>
                                </div>
                                <div className="border-t border-outline-variant pt-3 space-y-2">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 p-2 bg-surface hover:bg-error-container/20 text-error rounded-lg font-bold transition-all text-xs border border-error/20"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">logout</span>
                                        <span>Sign Out</span>
                                    </button>
                                    <p className="text-[10px] text-outline font-semibold text-center">RepairBharat v3.0.0</p>
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* ── Main Canvas Content Pane ── */}
                    <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto max-w-5xl mx-auto space-y-md w-full pb-16">
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                                <p className="font-semibold text-sm">Accessing workstation database...</p>
                            </div>
                        ) : (
                            <>
                                {/* ── CUSTOMER VIEW ── */}
                                {user.role === "customer" && activeTab === "repairs" && (
                                    <div className="space-y-6">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">Active Repair Orders</h2>
                                            <p className="font-body-md text-on-surface-variant">Real-time milestones tracking of your devices.</p>
                                        </div>

                                        {tickets.length === 0 ? (
                                            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container text-center shadow-sm">
                                                <span className="material-symbols-outlined text-[64px] text-outline mb-2">assignment_late</span>
                                                <p className="font-semibold text-on-surface-variant">No active repair orders registered.</p>
                                                <button 
                                                    onClick={() => setActiveTab("workshops")}
                                                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all inline-flex items-center gap-1 text-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">explore</span>
                                                    <span>Explore Repair Centers</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {tickets.map((t) => {
                                                    const sObj = getStatusLabelAndColor(t.status_code);
                                                    return (
                                                        <div key={t.id} className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-headline-md text-lg font-bold text-on-surface">{t.device_brand} {t.device_model}</h4>
                                                                        <span className="text-[11px] font-bold px-2 py-0.5 bg-surface-container-high rounded text-primary uppercase">{t.device_category}</span>
                                                                    </div>
                                                                    <p className="text-xs text-outline font-semibold mt-1">Ticket: {t.ticket_number}</p>
                                                                    <p className="text-xs text-on-surface-variant font-semibold mt-1 flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                                                                        <span>{t.branch_name}</span>
                                                                    </p>
                                                                </div>

                                                                <div className="flex flex-col items-end text-right">
                                                                    <span 
                                                                        style={{ color: sObj.color, borderColor: sObj.color, backgroundColor: `${sObj.color}10` }}
                                                                        className="px-3 py-1 rounded-full font-bold text-[12px] border text-center uppercase tracking-wider"
                                                                    >
                                                                        {sObj.label}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-primary mt-1">Est: ₹{t.estimated_cost}</span>
                                                                </div>
                                                            </div>

                                                            {/* Custom visual progress bar */}
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-[11px] font-bold text-outline uppercase mb-2">
                                                                    <span>Received</span>
                                                                    <span>Diagnosing</span>
                                                                    <span>In Repair</span>
                                                                    <span>Ready</span>
                                                                </div>
                                                                <div className="w-full bg-surface-container rounded-full h-2 relative overflow-hidden">
                                                                    <div 
                                                                        style={{ width: t.status_code === "ready" || t.status_code === "delivered" ? "100%" : t.status_code === "in_repair" ? "75%" : t.status_code === "diagnosing" ? "50%" : "25%" }}
                                                                        className="bg-primary h-full rounded-full transition-all duration-300"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {t.diagnostics_notes && (
                                                                <div className="mt-4 bg-surface-container p-3 rounded-lg border border-outline-variant text-[13px] text-on-surface flex items-start gap-2">
                                                                    <span className="material-symbols-outlined text-[18px] text-primary">feedback</span>
                                                                    <div>
                                                                        <strong className="font-bold text-primary">Technician Live Note:</strong>
                                                                        <p className="mt-0.5">{t.diagnostics_notes}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user.role === "customer" && activeTab === "workshops" && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Discover Proximity Repair Stations</h2>
                                                <p className="font-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                                                    <span className="material-symbols-outlined text-[18px] text-secondary">explore</span>
                                                    <span>Pinpointing certified workshops using Google Places API proximity telemetry.</span>
                                                </p>
                                            </div>

                                            {/* Search bar */}
                                            <div className="relative max-w-sm w-full">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search center name or address..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full h-11 pl-10 pr-4 border border-outline rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                                />
                                                {searchQuery && (
                                                    <button 
                                                        onClick={() => setSearchQuery("")}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category chips row */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Specialty & Service Category</label>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
                                                <button
                                                    onClick={() => { setSelectedRepairType(""); setVisibleShopsLimit(10); }}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start active:scale-95 flex items-center gap-1 ${
                                                        selectedRepairType === ""
                                                            ? "bg-primary text-on-primary shadow-sm"
                                                            : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">grid_view</span>
                                                    <span>All Specialties</span>
                                                </button>
                                                {[
                                                    { code: "Screen", name: "Screen Repair", icon: "phone_android" },
                                                    { code: "Battery", name: "Battery Assembly", icon: "battery_charging_full" },
                                                    { code: "Soldering", name: "IC & Motherboard", icon: "memory" },
                                                    { code: "Liquid", name: "Liquid Recovery", icon: "water_drop" },
                                                    { code: "Port", name: "Charging Interface", icon: "power" },
                                                    { code: "Laptop", name: "Laptop Systems", icon: "laptop" },
                                                    { code: "Tablet", name: "Tablet Workbench", icon: "tablet_mac" }
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.code}
                                                        onClick={() => { setSelectedRepairType(cat.code); setVisibleShopsLimit(10); }}
                                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start active:scale-95 flex items-center gap-1 ${
                                                            selectedRepairType === cat.code
                                                                ? "bg-primary text-on-primary shadow-sm"
                                                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                                                        <span>{cat.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main 2-Column Content */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                            {/* Left Column: Workshop Listings */}
                                            <div className="lg:col-span-7 space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[12px] font-bold text-outline uppercase tracking-wider">
                                                        Nearby Certified Stations ({branches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase())).length})
                                                    </span>
                                                    {selectedRepairType && (
                                                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                                            <span className="material-symbols-outlined text-[12px]">filter_alt</span>
                                                            <span>Specialized only</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {branches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                                    <div className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container text-center shadow-sm">
                                                        <span className="material-symbols-outlined text-[64px] text-outline mb-2">location_off</span>
                                                        <p className="font-semibold text-on-surface-variant">No certified workshops match your active filters.</p>
                                                        <button 
                                                            onClick={() => { setSelectedRepairType(""); setSearchQuery(""); }}
                                                            className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs"
                                                        >
                                                            Reset Filters
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {branches
                                                            .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase()))
                                                            .slice(0, visibleShopsLimit)
                                                            .map((b, idx) => {
                                                                const isSelected = selectedBranch?.id === b.id;
                                                                return (
                                                                    <div 
                                                                        key={b.id} 
                                                                        onClick={() => setSelectedBranch(b)}
                                                                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group shadow-sm hover:shadow-md ${
                                                                            isSelected 
                                                                                ? "bg-surface-container-low border-primary ring-2 ring-primary/20" 
                                                                                : "bg-surface-container-lowest border-surface-container hover:border-outline-variant"
                                                                        }`}
                                                                    >
                                                                        <div className="flex justify-between items-start gap-2 flex-wrap">
                                                                            <div className="flex-1 min-w-[200px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="font-bold text-md text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
                                                                                        <span>{b.name}</span>
                                                                                        {b.rating >= 4.7 && (
                                                                                            <span className="material-symbols-outlined text-[16px] text-secondary fill-secondary" title="Elite Verified Station">verified</span>
                                                                                        )}
                                                                                    </h4>
                                                                                </div>
                                                                                <p className="text-xs text-on-surface-variant mt-1.5 flex items-start gap-1 font-medium">
                                                                                    <span className="material-symbols-outlined text-[15px] text-outline shrink-0 mt-0.5">location_on</span>
                                                                                    <span>{b.address}</span>
                                                                                </p>
                                                                                <div className="flex gap-2 mt-2 flex-wrap items-center">
                                                                                    {b.specialties.split(",").map((spec, sIdx) => (
                                                                                        <span 
                                                                                            key={sIdx} 
                                                                                            className="text-[10px] font-bold px-2 py-0.5 bg-surface-container rounded text-outline-variant text-primary uppercase tracking-wide font-mono"
                                                                                        >
                                                                                            {spec.trim()}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            <div className="text-right flex flex-col items-end shrink-0 gap-1">
                                                                                <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded text-secondary font-bold text-xs">
                                                                                    <span className="material-symbols-outlined text-[13px] fill-secondary">star</span>
                                                                                    <span>{b.rating}</span>
                                                                                    <span className="text-[10px] text-outline font-normal">({b.reviews_count})</span>
                                                                                </div>
                                                                                <span className="text-xs font-bold text-primary-container bg-primary/10 px-2 py-0.5 rounded mt-1 flex items-center gap-0.5">
                                                                                    <span className="material-symbols-outlined text-[13px]">distance</span>
                                                                                    <span>{b.distance} km away</span>
                                                                                </span>
                                                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-1 flex items-center gap-0.5">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                                                                                    <span>Open Now</span>
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Action Row */}
                                                                        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-between items-center">
                                                                            <span className="text-xs text-outline font-semibold flex items-center gap-1">
                                                                                <span className="material-symbols-outlined text-[14px]">call</span>
                                                                                <span>{b.phone}</span>
                                                                            </span>
                                                                            <div className="flex gap-2">
                                                                                <a
                                                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="h-8 px-3 rounded-lg border border-outline text-outline hover:text-primary hover:border-primary text-xs font-bold flex items-center gap-0.5 transition-all"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[14px]">directions</span>
                                                                                    <span>Route</span>
                                                                                </a>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedBranch(b);
                                                                                        setShowBookingModal(true);
                                                                                    }}
                                                                                    className="h-8 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold flex items-center gap-0.5 transition-all shadow-sm active:scale-95"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                                                                    <span>Book Now</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}

                                                        {/* Pagination Load More */}
                                                        {branches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase())).length > visibleShopsLimit && (
                                                            <div className="pt-4 text-center">
                                                                <button
                                                                    onClick={() => setVisibleShopsLimit(prev => prev + 10)}
                                                                    className="px-6 h-11 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest text-primary font-bold rounded-xl text-sm transition-all active:scale-95 inline-flex items-center gap-1.5 shadow-sm"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                                                    <span>Load More Nearby Stations</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column: Proximity Radar Map Visualizer */}
                                            <div className="lg:col-span-5 space-y-4 sticky top-6 hidden lg:block">
                                                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col items-center text-center">
                                                    <div className="w-full flex justify-between items-center mb-3">
                                                        <span className="text-[12px] font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px] text-primary">radar</span>
                                                            <span>Interactive Proximity Radar</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Active Sweep</span>
                                                    </div>

                                                    {/* Radial Radar Map Screen Container */}
                                                    <div className="w-[280px] h-[280px] rounded-full border-2 border-outline-variant relative overflow-hidden bg-[#0d1527] shadow-inner flex items-center justify-center">
                                                        {/* CRT Radial Grids */}
                                                        <div className="absolute w-[220px] h-[220px] rounded-full border border-primary/20 pointer-events-none"></div>
                                                        <div className="absolute w-[160px] h-[160px] rounded-full border border-primary/30 pointer-events-none"></div>
                                                        <div className="absolute w-[100px] h-[100px] rounded-full border border-primary/40 pointer-events-none"></div>
                                                        
                                                        {/* Radar Crosshairs */}
                                                        <div className="absolute w-full h-[1px] bg-primary/20 pointer-events-none"></div>
                                                        <div className="absolute h-full w-[1px] bg-primary/20 pointer-events-none"></div>

                                                        {/* Sweeping Beam Beam Animation overlay */}
                                                        <div 
                                                            className="absolute inset-0 rounded-full pointer-events-none animate-spin" 
                                                            style={{ 
                                                                animationDuration: '6s', 
                                                                background: 'conic-gradient(from 0deg, rgba(30,64,175,0.2) 0deg, transparent 140deg, transparent 360deg)' 
                                                            }}
                                                        ></div>

                                                        {/* Distance Ring Indicator labels */}
                                                        <span className="absolute text-[8px] font-mono text-primary/50 top-1/2 left-3/4 translate-x-1.5 -translate-y-2 pointer-events-none">10km</span>
                                                        <span className="absolute text-[8px] font-mono text-primary/50 top-1/2 left-[60%] translate-x-1 -translate-y-2 pointer-events-none">5km</span>

                                                        {/* Central Point Indicator (User Location) */}
                                                        <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
                                                            <div className="w-3 h-3 rounded-full bg-secondary border border-white relative shadow-lg flex items-center justify-center">
                                                                <span className="absolute w-6 h-6 rounded-full bg-secondary/30 animate-ping"></span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-white mt-1 px-1.5 py-0.5 bg-black/70 rounded border border-white/20">You (Mumbai)</span>
                                                        </div>

                                                        {/* SVG Coordinate points overlay */}
                                                        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 300 300">
                                                            {branches
                                                                .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase()))
                                                                .map((b, idx) => {
                                                                    const maxDistance = Math.max(...branches.map(br => br.distance || 1), 1);
                                                                    // calculate vector angle based on latitude offsets
                                                                    const angle = Math.atan2(b.latitude - 19.0760, b.longitude - 72.8777);
                                                                    // scale radial radius between 25px and 125px on 150px half-width
                                                                    const r = 30 + ((b.distance || 1) / maxDistance) * 105;
                                                                    const cx = 150 + r * Math.cos(angle);
                                                                    const cy = 150 - r * Math.sin(angle);
                                                                    const isSelected = selectedBranch?.id === b.id;

                                                                    return (
                                                                        <g 
                                                                            key={b.id} 
                                                                            onClick={() => setSelectedBranch(b)}
                                                                            className="cursor-pointer group"
                                                                        >
                                                                            {/* Radar highlight ring */}
                                                                            {isSelected && (
                                                                                <circle cx={cx} cy={cy} r="10" fill="none" stroke="#92f5a4" strokeWidth="1.5" className="animate-pulse" />
                                                                            )}
                                                                            <circle cx={cx} cy={cy} r="7" fill={isSelected ? "#92f5a4" : "#b8c4ff"} className="group-hover:fill-secondary transition-all" stroke="#0d1527" strokeWidth="1.5" />
                                                                            <circle cx={cx} cy={cy} r="3" fill={isSelected ? "#006d30" : "#00288e"} />
                                                                            
                                                                            {/* Mini-Label text */}
                                                                            <text x={cx} y={cy - 9} textAnchor="middle" className="text-[9px] font-extrabold fill-white font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                                                                {idx + 1}
                                                                            </text>
                                                                        </g>
                                                                    );
                                                                })}
                                                        </svg>
                                                    </div>

                                                    {/* Telemetry sidebar Details Card */}
                                                    <div className="w-full mt-4 p-4 rounded-xl border border-outline-variant bg-surface text-left">
                                                        {selectedBranch ? (
                                                            <div className="space-y-3 animate-scaleIn">
                                                                <div className="flex justify-between items-start gap-1 flex-wrap">
                                                                    <div className="flex-1">
                                                                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">Station Details</span>
                                                                        <h5 className="font-bold text-md text-on-surface mt-1">{selectedBranch.name}</h5>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5 bg-secondary/10 px-1.5 py-0.5 rounded text-secondary font-bold text-xs shrink-0">
                                                                        <span className="material-symbols-outlined text-[13px] fill-secondary">star</span>
                                                                        <span>{selectedBranch.rating}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5 text-xs text-on-surface-variant font-medium">
                                                                    <p className="flex items-start gap-1">
                                                                        <span className="material-symbols-outlined text-[14px] text-outline shrink-0 mt-0.5">location_on</span>
                                                                        <span>{selectedBranch.address}</span>
                                                                    </p>
                                                                    <p className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[14px] text-outline shrink-0">call</span>
                                                                        <span>{selectedBranch.phone}</span>
                                                                    </p>
                                                                    <p className="flex items-center gap-1 text-[11px] font-mono text-outline">
                                                                        <span className="material-symbols-outlined text-[14px] text-outline shrink-0">gps_fixed</span>
                                                                        <span>Lat: {selectedBranch.latitude}, Lng: {selectedBranch.longitude}</span>
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                                    <a
                                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="h-10 bg-surface-container hover:bg-surface-container-high text-primary border border-outline rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">directions</span>
                                                                        <span>Directions</span>
                                                                    </a>
                                                                    <button
                                                                        onClick={() => setShowBookingModal(true)}
                                                                        className="h-10 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow active:scale-95"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                                        <span>Book Repair</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 text-outline font-semibold text-xs flex flex-col items-center gap-2">
                                                                <span className="material-symbols-outlined text-[36px] text-outline/50 animate-pulse">radar</span>
                                                                <p className="max-w-[200px] leading-relaxed">Select a station in the list or radar node to review telemetry metrics and GPS coordinates.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* ── SHOP OWNER MASTER VIEW ── */}
                                {user.role === "shop_owner" && activeTab === "erp" && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Master Station Control Panel</h2>
                                                <p className="font-body-md text-on-surface-variant">Real-time shop operations oversight and workflow allocation.</p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => setShowAddBranchModal(true)}
                                                    className="h-11 px-4 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                                                    <span>Register Branch</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (branches.length === 0) {
                                                            toast.error("Please register a branch location first.");
                                                            return;
                                                        }
                                                        setWalkinForm({
                                                            customer: customers[0]?.id || "",
                                                            branch: branches[0]?.id || "",
                                                            device_category: "Smartphone",
                                                            device_brand: "",
                                                            device_model: "",
                                                            device_serial: "",
                                                            issue_reported: "",
                                                            priority: "medium",
                                                            estimated_cost: "0.00",
                                                            advance_paid: "0.00"
                                                        });
                                                        setShowWalkinModal(true);
                                                    }}
                                                    className="h-11 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_box</span>
                                                    <span>Book Walk-in Repair</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* B2B Technician Join Requests Widget */}
                                        {joinRequests.filter(r => r.status === "pending").length > 0 && (
                                            <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm space-y-3 animate-fadeIn text-left mb-6">
                                                <h3 className="font-bold text-md text-primary flex items-center gap-1">
                                                    <span className="material-symbols-outlined">badge</span>
                                                    <span>Pending Technician Join Requests ({joinRequests.filter(r => r.status === "pending").length})</span>
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {joinRequests.filter(r => r.status === "pending").map(req => (
                                                        <div key={req.id} className="bg-surface p-4 rounded-xl border border-outline-variant flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-all">
                                                            <div>
                                                                <h4 className="font-bold text-sm text-on-surface">{req.technician_name}</h4>
                                                                <p className="text-[11px] text-outline font-semibold">Experience: {req.experience_years} Years</p>
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {req.skills_summary.map((sk, idx) => (
                                                                        <span key={idx} className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-secondary/10">{sk}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleManageJoinRequest(req.id, "approved")}
                                                                    className="flex-1 h-9 bg-success text-on-success hover:bg-success/90 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    <span>Grant Link</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleManageJoinRequest(req.id, "rejected")}
                                                                    className="flex-1 h-9 bg-error text-on-error hover:bg-error/90 border border-error/20 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
                                                                >
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
                                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                                    Welcome to RepairBharat ERP! Register your first physical office or service workstation to begin cataloging inventory spares, assigned technicians, physical walk-in repair bookings, and GST invoice logs.
                                                </p>
                                                <div className="pt-2">
                                                    <button 
                                                        onClick={() => setShowAddBranchModal(true)}
                                                        className="px-5 h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all inline-flex items-center gap-1.5 text-sm shadow"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">add_business</span>
                                                        <span>Register dadar / local Branch</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[12px] font-bold text-outline uppercase">Active Workloads</span>
                                                    <span className="material-symbols-outlined text-primary text-[20px]">engineering</span>
                                                </div>
                                                <p className="text-3xl font-bold text-on-surface mt-1">{openTicketsCount} <span className="text-xs text-outline font-semibold">orders in transit</span></p>
                                            </div>

                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[12px] font-bold text-outline uppercase">Verified Techs</span>
                                                    <span className="material-symbols-outlined text-secondary text-[20px]">group</span>
                                                </div>
                                                <p className="text-3xl font-bold text-on-surface mt-1">{activeTechsCount} <span className="text-xs text-outline font-semibold">on shop benched</span></p>
                                            </div>

                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-error shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[12px] font-bold text-outline uppercase">Low Spares Warnings</span>
                                                    <span className="material-symbols-outlined text-error text-[20px]">inventory_2</span>
                                                </div>
                                                <p className="text-3xl font-bold text-on-surface mt-1">{lowStockSparesCount} <span className="text-xs text-outline font-semibold">under thresholds</span></p>
                                            </div>
                                        </div>

                                        {/* ERP Main workflow table */}
                                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-surface-container flex justify-between items-center">
                                                <h3 className="font-bold text-md text-primary">Repair Order Workloads</h3>
                                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">Real-Time Sync</span>
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
                                                        {tickets.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="p-8 text-center text-on-surface-variant font-semibold">No active repair orders registered yet.</td>
                                                            </tr>
                                                        ) : (
                                                            tickets.map((t) => {
                                                                const sObj = getStatusLabelAndColor(t.status_code);
                                                                return (
                                                                    <tr key={t.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                        <td className="p-3">
                                                                            <p className="font-bold text-on-surface">{t.device_brand} {t.device_model}</p>
                                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                                <span className="text-[11px] text-outline font-semibold">{t.ticket_number}</span>
                                                                                <button 
                                                                                    onClick={() => setExpandedTicketId(expandedTicketId === t.id ? null : t.id)}
                                                                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[12px]">
                                                                                        {expandedTicketId === t.id ? "unfold_less" : "unfold_more"}
                                                                                    </span>
                                                                                    <span>Logs</span>
                                                                                </button>
                                                                            </div>
                                                                            
                                                                            {expandedTicketId === t.id && t.history && (
                                                                                <div className="mt-3 pl-2 space-y-2.5 border-l-2 border-outline-variant/60 animate-fadeIn text-[11px] text-left">
                                                                                    {t.history.map((hist, idx) => (
                                                                                        <div key={hist.id || idx} className="relative pl-3">
                                                                                            <span 
                                                                                                style={{ backgroundColor: hist.stage_color || "#7c6cff" }}
                                                                                                className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border border-surface"
                                                                                            ></span>
                                                                                            <p className="font-bold text-on-surface">{hist.stage_name} <span className="text-[9px] text-outline font-normal">({new Date(hist.created_at).toLocaleDateString()})</span></p>
                                                                                            <p className="text-on-surface-variant font-medium leading-relaxed mt-0.5">{hist.notes}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="p-3 font-medium text-on-surface-variant max-w-[200px] truncate">{t.issue_reported}</td>
                                                                        <td className="p-3">
                                                                            <select 
                                                                                value={t.status_code}
                                                                                onChange={(e) => handleMoveStage(t.id, e.target.value)}
                                                                                className="h-9 border border-outline rounded-lg text-xs font-bold bg-surface px-1 cursor-pointer focus:ring-1 focus:ring-primary"
                                                                            >
                                                                                {stages.map(st => (
                                                                                    <option key={st.code} value={st.code}>{st.name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <select
                                                                                value={t.assigned_technician || ""}
                                                                                onChange={(e) => handleAssignTechnician(t.id, e.target.value)}
                                                                                className="h-9 border border-outline rounded-lg text-xs font-bold bg-surface px-1 cursor-pointer focus:ring-1 focus:ring-primary w-40"
                                                                            >
                                                                                <option value="">Unassigned</option>
                                                                                {technicians.map(tc => (
                                                                                    <option key={tc.id} value={tc.id}>{tc.username}</option>
                                                                                ))}
                                                                            </select>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {t.status_code === "ready" && (
                                                                                <button
                                                                                    onClick={() => { 
                                                                                        setActiveInvoiceTicket(t); 
                                                                                        setInvoiceBillingAddress(`${t.customer_username} (Contact: ${t.customer_phone || 'N/A'}), Mumbai, Maharashtra, India`);
                                                                                        setShowInvoiceModal(true); 
                                                                                    }}
                                                                                    className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold text-xs active:scale-95 transition-all shadow flex items-center gap-1"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                                                                    <span>Invoice</span>
                                                                                </button>
                                                                            )}
                                                                            {t.status_code === "delivered" && (
                                                                                <span className="text-secondary font-bold text-xs uppercase flex items-center gap-0.5">
                                                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                                                    <span>Archived</span>
                                                                                </span>
                                                                            )}
                                                                            {t.status_code !== "ready" && t.status_code !== "delivered" && (
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
                                    </>
                                )}
                                    </div>
                                )}

                                {user.role === "shop_owner" && activeTab === "inventory" && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end flex-wrap gap-2 mb-2">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Spares Inventory</h2>
                                                <p className="font-body-md text-on-surface-variant">Real-time spares, stock allocations, and compliance pricing.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (branches.length === 0) {
                                                        toast.error("Initialize shop branches first.");
                                                        return;
                                                    }
                                                    setInventoryForm(prev => ({ ...prev, branch: branches[0]?.id || "" }));
                                                    setShowAddInventory(true);
                                                }}
                                                className="h-11 px-4 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-1 text-sm shadow-md active:scale-95 transition-all hover:bg-primary-container"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                <span>Register Spares Item</span>
                                            </button>
                                        </div>

                                        {/* Spares listing table */}
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
                                                            <tr>
                                                                <td colSpan="6" className="p-8 text-center text-on-surface-variant font-semibold">No spares cataloged in parts inventory.</td>
                                                            </tr>
                                                        ) : (
                                                            inventory.map((item) => (
                                                                <tr key={item.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                    <td className="p-3 font-bold text-on-surface">
                                                                        <p>{item.name}</p>
                                                                        <p className="text-[11px] text-outline font-semibold mt-0.5">SKU: {item.sku}</p>
                                                                    </td>
                                                                    <td className="p-3 text-on-surface-variant font-semibold">{item.category}</td>
                                                                    <td className="p-3 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                                            item.stock_level <= item.low_stock_threshold 
                                                                                ? "bg-error-container text-on-error-container" 
                                                                                : "bg-secondary-container text-on-secondary-container"
                                                                        }`}>
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

                                {/* ── TECHNICIAN VIEW ── */}
                                {user.role === "technician" && activeTab === "queue" && (() => {
                                    const techDetails = technicians.find(t => t.username === user.username);
                                    
                                    // If unassigned independent technician
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
                                                        <input 
                                                            type="text"
                                                            placeholder="Enter Shop name, owner username, or Shop ID..."
                                                            value={shopSearchInput}
                                                            onChange={(e) => setShopSearchInput(e.target.value)}
                                                            className="flex-1 h-11 border border-outline rounded-lg text-sm bg-surface px-3 outline-none focus:border-primary transition-colors animate-fadeIn"
                                                        />
                                                        <button 
                                                            type="submit"
                                                            className="h-11 px-5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow active:scale-95 transition-all"
                                                        >
                                                            Search
                                                        </button>
                                                    </form>

                                                    {shopsSearchResults.length > 0 && (
                                                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                                            {shopsSearchResults.map(shop => {
                                                                const hasPending = joinRequests.some(r => r.shop === shop.id && r.status === "pending");
                                                                const hasApproved = joinRequests.some(r => r.shop === shop.id && r.status === "approved");
                                                                return (
                                                                    <div key={shop.id} className="bg-surface-container-low p-4 rounded-xl border border-surface-container flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-shadow">
                                                                        <div>
                                                                            <h4 className="font-bold text-sm text-primary">{shop.shop_name}</h4>
                                                                            <p className="text-[11px] text-outline font-semibold">ID: {shop.id} | Owner: {shop.owner_username}</p>
                                                                            <p className="text-xs text-on-surface-variant mt-1">{shop.shop_address}</p>
                                                                        </div>
                                                                        <button
                                                                            disabled={hasPending || hasApproved}
                                                                            onClick={() => handleRequestToJoinShop(shop.id)}
                                                                            className={`w-full h-9 rounded-lg font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm ${
                                                                                hasApproved ? "bg-secondary/20 text-secondary cursor-not-allowed" :
                                                                                hasPending ? "bg-primary/20 text-primary cursor-not-allowed animate-pulse" :
                                                                                "bg-primary text-on-primary hover:bg-primary/95"
                                                                            }`}
                                                                        >
                                                                            <span className="material-symbols-outlined text-[16px]">
                                                                                {hasApproved ? "check_circle" : hasPending ? "hourglass_empty" : "group_add"}
                                                                            </span>
                                                                            <span>
                                                                                {hasApproved ? "Linked" : hasPending ? "Awaiting Response" : "Request to Join"}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

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
                                                                    <tr>
                                                                        <td colSpan="4" className="p-6 text-center text-on-surface-variant font-semibold">No join requests submitted yet. Use the search bar above to join shops.</td>
                                                                    </tr>
                                                                ) : (
                                                                    joinRequests.map(r => (
                                                                        <tr key={r.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                            <td className="p-3">
                                                                                <p className="font-bold text-on-surface">{r.shop_name}</p>
                                                                                <p className="text-[10px] text-outline font-semibold">Shop ID: {r.shop}</p>
                                                                            </td>
                                                                            <td className="p-3 font-medium text-on-surface-variant">{r.owner_username}</td>
                                                                            <td className="p-3 text-outline">{new Date(r.created_at).toLocaleDateString()}</td>
                                                                            <td className="p-3">
                                                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${
                                                                                    r.status === "approved" ? "bg-success/10 text-success border-success/20" :
                                                                                    r.status === "rejected" ? "bg-error/10 text-error border-error/20" :
                                                                                    "bg-warning/10 text-warning border-warning/20 animate-pulse"
                                                                                }`}>
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

                                    // If linked to a B2B Shop
                                    const techCompletedRepairs = tickets.filter(
                                        t => t.technician_name === user.username && (t.status_code === "ready" || t.status_code === "delivered")
                                    );
                                    const techActiveRepairs = tickets.filter(
                                        t => t.technician_name === user.username && t.status_code !== "ready" && t.status_code !== "delivered" && t.status_code !== "cancelled"
                                    );

                                    const getIncentive = (ticket) => {
                                        const base = 250;
                                        const priorityBonus = ticket.priority === "high" ? 100 : ticket.priority === "medium" ? 50 : 0;
                                        const commission = parseFloat(ticket.estimated_cost) * 0.10;
                                        return base + priorityBonus + commission;
                                    };

                                    const totalIncentivesEarned = techCompletedRepairs.reduce((acc, t) => acc + getIncentive(t), 0);

                                    return (
                                        <div className="space-y-6 animate-fadeIn text-left">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <h2 className="font-headline-xl text-[28px] font-bold text-primary">Workstation Repairs Queue</h2>
                                                    <p className="font-body-md text-on-surface-variant">Allocated repair orders demanding technical diagnostics and service.</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (branches.length === 0) {
                                                            toast.error("Establish a physical workstation branch first.");
                                                            return;
                                                        }
                                                        setWalkinForm({
                                                            customer: customers[0]?.id || "",
                                                            branch: branches[0]?.id || "",
                                                            device_category: "Smartphone",
                                                            device_brand: "",
                                                            device_model: "",
                                                            device_serial: "",
                                                            issue_reported: "",
                                                            priority: "medium",
                                                            estimated_cost: "0.00",
                                                            advance_paid: "0.00"
                                                        });
                                                        setShowWalkinModal(true);
                                                    }}
                                                    className="h-11 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center gap-1.5 text-sm shadow active:scale-95 transition-all self-start md:self-auto"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_box</span>
                                                    <span>Book New Repair Job</span>
                                                </button>
                                            </div>

                                            {/* Metrics Bento Scorecard */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28 animate-scaleIn">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Active Workstation</span>
                                                        <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-on-surface truncate">{techDetails.shop_name}</p>
                                                        <p className="text-[11px] text-outline font-semibold truncate uppercase">{techDetails.branch_name}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28 animate-scaleIn">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Jobs Completed</span>
                                                        <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-on-surface mt-1">{techCompletedRepairs.length} <span className="text-xs text-outline font-semibold">devices serviced</span></p>
                                                </div>

                                                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-success shadow-sm flex flex-col justify-between h-28 animate-scaleIn">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[12px] font-bold text-outline uppercase">Incentives Earned</span>
                                                        <span className="material-symbols-outlined text-success text-[20px]">payments</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-success mt-1">₹{totalIncentivesEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-outline font-semibold">bonus commission</span></p>
                                                </div>
                                            </div>

                                            {/* Work workloads */}
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
                                                            const sObj = getStatusLabelAndColor(t.status_code);
                                                            const isExpanded = expandedTicketId === t.id;
                                                            return (
                                                                <div key={t.id} className="bg-surface-container-lowest rounded-xl p-5 border border-surface-container shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                                                    <div>
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="font-bold text-md text-on-surface">{t.device_brand} {t.device_model}</h4>
                                                                                <p className="text-[11px] text-outline font-semibold mt-0.5">ID: {t.ticket_number}</p>
                                                                            </div>
                                                                            <span 
                                                                                style={{ color: sObj.color, borderColor: sObj.color, backgroundColor: `${sObj.color}10` }}
                                                                                className="px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase"
                                                                            >
                                                                                {sObj.label}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-on-surface-variant font-semibold mt-2">
                                                                            <strong className="text-primary font-bold">Issue:</strong> {t.issue_reported}
                                                                        </p>
                                                                        
                                                                        {/* History stepper toggle */}
                                                                        <div className="mt-3 border-t border-outline-variant/50 pt-2">
                                                                            <button 
                                                                                onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                                                                                className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[14px]">
                                                                                    {isExpanded ? "unfold_less" : "unfold_more"}
                                                                                </span>
                                                                                <span>{isExpanded ? "Hide Cycle History" : "View Repair Cycle History"}</span>
                                                                            </button>
                                                                            
                                                                            {isExpanded && t.history && (
                                                                                <div className="mt-3 pl-2 space-y-3 border-l-2 border-outline-variant/60 animate-fadeIn">
                                                                                    {t.history.map((hist, idx) => (
                                                                                        <div key={hist.id || idx} className="relative pl-3">
                                                                                            <span 
                                                                                                style={{ backgroundColor: hist.stage_color || "#7c6cff" }}
                                                                                                className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border border-surface"
                                                                                            ></span>
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
                                                                        <select
                                                                            value={t.status_code}
                                                                            onChange={(e) => handleMoveStage(t.id, e.target.value)}
                                                                            className="h-10 border border-outline rounded-lg text-xs font-bold bg-surface px-2 cursor-pointer focus:ring-1 focus:ring-primary flex-1 shadow-sm"
                                                                        >
                                                                            {stages.map(st => (
                                                                                <option key={st.code} value={st.code}>{st.name}</option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedTicket(t);
                                                                                setDiagNotes(t.diagnostics_notes || "");
                                                                                setRepairStatus(t.status_code);
                                                                                setActiveTab("diagnostics");
                                                                            }}
                                                                            className="h-10 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold flex items-center justify-center gap-1 text-xs shadow-sm active:scale-95 transition-transform"
                                                                        >
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

                                            {/* Completed jobs incentives ledger */}
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
                                                                <tr>
                                                                    <td colSpan="5" className="p-6 text-center text-on-surface-variant font-semibold">No jobs completed yet in this billing cycle. Serviced tickets will log payout statements here.</td>
                                                                </tr>
                                                            ) : (
                                                                techCompletedRepairs.map((t) => {
                                                                    const incentiveVal = getIncentive(t);
                                                                    return (
                                                                        <tr key={t.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                            <td className="p-3">
                                                                                <p className="font-bold text-on-surface">{t.device_brand} {t.device_model}</p>
                                                                                <p className="text-[10px] text-outline font-semibold">{t.ticket_number}</p>
                                                                            </td>
                                                                            <td className="p-3 text-outline">{new Date(t.updated_at).toLocaleDateString()}</td>
                                                                            <td className="p-3 text-center">
                                                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${
                                                                                    t.priority === "high" ? "bg-error/10 text-error border-error/20" :
                                                                                    t.priority === "medium" ? "bg-warning/10 text-warning border-warning/20" :
                                                                                    "bg-primary/10 text-primary border-primary/20"
                                                                                }`}>
                                                                                    {t.priority}
                                                                                </span>
                                                                            </td>
                                                                            <td className="p-3 text-right font-medium">₹{parseFloat(t.estimated_cost).toFixed(2)}</td>
                                                                            <td className="p-3 text-right font-bold text-success">₹{incentiveVal.toFixed(2)}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {user.role === "technician" && activeTab === "diagnostics" && (
                                    <div className="space-y-6">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">Technical Diagnostics Bench</h2>
                                            <p className="font-body-md text-on-surface-variant">Update active logs, track parts consumed, and advance stages.</p>
                                        </div>

                                        {!selectedTicket ? (
                                            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container text-center shadow-sm">
                                                <span className="material-symbols-outlined text-[64px] text-outline mb-2">handyman</span>
                                                <p className="font-semibold text-on-surface-variant">Select an active job sheet from your queue first.</p>
                                                <button 
                                                    onClick={() => setActiveTab("queue")}
                                                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all text-sm inline-flex items-center gap-1"
                                                >
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
                                                    <button 
                                                        onClick={() => setSelectedTicket(null)}
                                                        className="text-on-surface hover:text-primary"
                                                    >
                                                        <span className="material-symbols-outlined text-[24px]">close</span>
                                                    </button>
                                                </div>

                                                <form onSubmit={handleTechnicianSubmit} className="space-y-5 text-left">
                                                    <div>
                                                        <span className="text-[11px] font-bold text-outline uppercase block mb-1">Issue Reported by Client</span>
                                                        <p className="p-3 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface-variant font-medium">
                                                            {selectedTicket.issue_reported}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="font-bold text-xs text-outline uppercase" htmlFor="diagnostics-notes">Diagnostic Service Notes *</label>
                                                        <textarea
                                                            id="diagnostics-notes"
                                                            value={diagNotes}
                                                            onChange={(e) => setDiagNotes(e.target.value)}
                                                            rows="4"
                                                            placeholder="Describe diagnostic parameters, actions taken, thermal behaviors, parts replaced, and quality checks completed..."
                                                            className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm p-3 bg-surface"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="font-bold text-xs text-outline uppercase" htmlFor="repair-stage-select">Update Workflow Stage</label>
                                                            <select
                                                                id="repair-stage-select"
                                                                value={repairStatus}
                                                                onChange={(e) => setRepairStatus(e.target.value)}
                                                                className="w-full h-11 border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-surface px-2 font-bold text-primary"
                                                            >
                                                                {stages.map(st => (
                                                                    <option key={st.code} value={st.code}>{st.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="flex items-end">
                                                            <button
                                                                type="submit"
                                                                className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1 text-sm"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">save</span>
                                                                <span>Save Workspace Logs</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(user.role === "shop_owner" || user.role === "technician") && activeTab === "billing" && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="mb-4">
                                            <h2 className="font-headline-xl text-[28px] font-bold text-primary">GST Invoices & Financial Analytics</h2>
                                            <p className="font-body-md text-on-surface-variant">Real-time tracking of CGST/SGST collected, spares value, and InvoiceNinja synchronization logs.</p>
                                        </div>

                                        {/* Financial Analytics Bento Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-primary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Total Revenue</span>
                                                    <span className="material-symbols-outlined text-primary text-[20px]">currency_rupee</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">
                                                    ₹{invoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-secondary shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Taxes Collected (GST)</span>
                                                    <span className="material-symbols-outlined text-secondary text-[20px]">percent</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">
                                                    ₹{invoices.reduce((sum, inv) => sum + parseFloat(inv.cgst || 0) + parseFloat(inv.sgst || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-tertiary-container shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Invoices Compiled</span>
                                                    <span className="material-symbols-outlined text-tertiary-container text-[20px]">receipt_long</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">
                                                    {invoices.length} <span className="text-xs text-outline font-semibold">synced records</span>
                                                </p>
                                            </div>

                                            <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container border-l-4 border-error shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Spares warning</span>
                                                    <span className="material-symbols-outlined text-error text-[20px]">inventory_2</span>
                                                </div>
                                                <p className="text-3xl font-extrabold text-on-surface mt-1">
                                                    {inventory.filter(item => item.stock_level <= item.low_stock_threshold).length} <span className="text-xs text-outline font-semibold">under limit</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Invoice Listing Table */}
                                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-surface-container flex justify-between items-center flex-wrap gap-2">
                                                <h3 className="font-bold text-md text-primary">Compiled Invoices Registry</h3>
                                                <span className="text-xs font-bold bg-[#1e40af]/10 text-[#1e40af] px-2 py-0.5 rounded flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[13px]">sync</span>
                                                    <span>InvoiceNinja Synced</span>
                                                </span>
                                            </div>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="bg-surface-container border-b border-outline-variant font-bold text-outline text-[12px] uppercase">
                                                            <th className="p-3">Invoice Number / Date</th>
                                                            <th className="p-3">Hardware Client</th>
                                                            <th className="p-3 text-right">Labor Fees</th>
                                                            <th className="p-3 text-right">CGST (9%)</th>
                                                            <th className="p-3 text-right">SGST (9%)</th>
                                                            <th className="p-3 text-right">Grand Total</th>
                                                            <th className="p-3 text-center">Status</th>
                                                            <th className="p-3 text-center font-bold">Standard GST Invoice</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {invoices.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="8" className="p-8 text-center text-on-surface-variant font-semibold">No invoices generated yet for scoped branches.</td>
                                                            </tr>
                                                        ) : (
                                                            invoices.map((inv) => (
                                                                <tr key={inv.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                                                                    <td className="p-3">
                                                                        <p className="font-bold text-on-surface">{inv.invoice_number}</p>
                                                                        <p className="text-[11px] text-outline font-semibold mt-0.5">
                                                                            {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <p className="font-semibold text-on-surface">{inv.device}</p>
                                                                        <p className="text-[11px] text-outline font-semibold mt-0.5">Ticket: {inv.ticket_number}</p>
                                                                    </td>
                                                                    <td className="p-3 text-right font-medium text-on-surface-variant">₹{inv.labor_charges}</td>
                                                                    <td className="p-3 text-right text-xs font-medium text-outline">₹{inv.cgst}</td>
                                                                    <td className="p-3 text-right text-xs font-medium text-outline">₹{inv.sgst}</td>
                                                                    <td className="p-3 text-right font-extrabold text-primary">₹{inv.grand_total}</td>
                                                                    <td className="p-3 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                                            inv.payment_status === "paid"
                                                                                ? "bg-secondary-container text-on-secondary-container"
                                                                                : "bg-error-container text-on-error-container"
                                                                        }`}>
                                                                            {inv.payment_status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedPreviewInvoice(inv);
                                                                                setShowInvoicePreviewModal(true);
                                                                            }}
                                                                            className="px-3 py-1 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg text-[11px] font-bold inline-flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                                                                            <span>Print GST PDF 📄</span>
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

                {/* ── CUSTOMER BOOKING SECURE REPAIR MODAL ── */}
                {showBookingModal && selectedBranch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-lg w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary">Register Secure Repair Booking</h3>
                                <button onClick={() => setShowBookingModal(false)} className="text-on-surface hover:text-primary">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                                <div>
                                    <span className="text-[11px] font-bold text-outline uppercase block mb-1">Selected Center</span>
                                    <p className="font-bold text-sm text-on-surface">{selectedBranch.name} ({selectedBranch.city})</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-device-cat">Category *</label>
                                        <select
                                            id="book-device-cat"
                                            value={bookingForm.device_category}
                                            onChange={(e) => setBookingForm({ ...bookingForm, device_category: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2"
                                        >
                                            <option value="Smartphone">Smartphone</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Smartwatch">Smartwatch</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-device-priority">Priority *</label>
                                        <select
                                            id="book-device-priority"
                                            value={bookingForm.priority}
                                            onChange={(e) => setBookingForm({ ...bookingForm, priority: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2"
                                        >
                                            <option value="low">Standard</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-brand">Hardware Brand *</label>
                                        <input
                                            id="book-brand"
                                            type="text"
                                            placeholder="Apple, Samsung..."
                                            value={bookingForm.device_brand}
                                            onChange={(e) => setBookingForm({ ...bookingForm, device_brand: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="book-model">Hardware Model *</label>
                                        <input
                                            id="book-model"
                                            type="text"
                                            placeholder="iPhone 14, Galaxy S23..."
                                            value={bookingForm.device_model}
                                            onChange={(e) => setBookingForm({ ...bookingForm, device_model: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="book-serial">IMEI / Hardware Serial</label>
                                    <input
                                        id="book-serial"
                                        type="text"
                                        placeholder="Optional unique serialization identifier"
                                        value={bookingForm.device_serial}
                                        onChange={(e) => setBookingForm({ ...bookingForm, device_serial: e.target.value })}
                                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="book-issue">Client Issue Reported *</label>
                                    <textarea
                                        id="book-issue"
                                        rows="3"
                                        placeholder="Describe the failure, physical damage, hardware diagnostics, or liquid exposure..."
                                        value={bookingForm.issue_reported}
                                        onChange={(e) => setBookingForm({ ...bookingForm, issue_reported: e.target.value })}
                                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 text-sm shadow"
                                >
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    <span>Establish Secure Booking</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── SHOP OWNER REGISTER PHYSICAL BRANCH MODAL ── */}
                {showAddBranchModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-lg w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary">Register New Branch Location</h3>
                                <button onClick={() => setShowAddBranchModal(false)} className="text-on-surface hover:text-primary">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateBranchSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="br-name">Branch Name *</label>
                                        <input
                                            id="br-name"
                                            type="text"
                                            placeholder="e.g. RepairBharat Dadar East"
                                            value={branchForm.name}
                                            onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="br-city">City *</label>
                                        <input
                                            id="br-city"
                                            type="text"
                                            placeholder="e.g. Mumbai"
                                            value={branchForm.city}
                                            onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="br-phone">Contact Number *</label>
                                        <input
                                            id="br-phone"
                                            type="text"
                                            placeholder="e.g. 9892123456"
                                            value={branchForm.phone}
                                            onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="br-spec">Specialties / Tags *</label>
                                        <input
                                            id="br-spec"
                                            type="text"
                                            placeholder="Mobiles, Laptops, Tablets"
                                            value={branchForm.specialties}
                                            onChange={(e) => setBranchForm({ ...branchForm, specialties: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="br-addr">Physical Address *</label>
                                    <textarea
                                        id="br-addr"
                                        rows="2"
                                        placeholder="Full geographic address of the physical shop..."
                                        value={branchForm.address}
                                        onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                                >
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    <span>Register Office Branch</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── SHOP OWNER & TECHNICIAN WALK-IN BOOK REPAIR MODAL ── */}
                {showWalkinModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-lg w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary">Book Walk-in Repair Order</h3>
                                <button onClick={() => setShowWalkinModal(false)} className="text-on-surface hover:text-primary">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateWalkinSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-cust">Choose Customer *</label>
                                        <select
                                            id="walk-cust"
                                            value={walkinForm.customer}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, customer: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                                            required
                                        >
                                            <option value="">-- Choose Client --</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.username} ({c.email || "No Email"})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-branch">Assigned Branch *</label>
                                        <select
                                            id="walk-branch"
                                            value={walkinForm.branch}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, branch: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                                            required
                                        >
                                            <option value="">-- Select Branch --</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-cat">Category *</label>
                                        <select
                                            id="walk-cat"
                                            value={walkinForm.device_category}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, device_category: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                                        >
                                            <option value="Smartphone">Smartphone</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Smartwatch">Smartwatch</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-priority">Priority *</label>
                                        <select
                                            id="walk-priority"
                                            value={walkinForm.priority}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, priority: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2 outline-none"
                                        >
                                            <option value="low">Standard</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-serial">Serial / IMEI</label>
                                        <input
                                            id="walk-serial"
                                            type="text"
                                            placeholder="Serial number"
                                            value={walkinForm.device_serial}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, device_serial: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-brand">Hardware Brand *</label>
                                        <input
                                            id="walk-brand"
                                            type="text"
                                            placeholder="Apple, OnePlus..."
                                            value={walkinForm.device_brand}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, device_brand: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-model">Hardware Model *</label>
                                        <input
                                            id="walk-model"
                                            type="text"
                                            placeholder="iPhone 14, OnePlus 11..."
                                            value={walkinForm.device_model}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, device_model: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-cost">Estimated Cost (₹) *</label>
                                        <input
                                            id="walk-cost"
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 4500.00"
                                            value={walkinForm.estimated_cost}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, estimated_cost: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-advance">Advance Paid (₹)</label>
                                        <input
                                            id="walk-advance"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={walkinForm.advance_paid}
                                            onChange={(e) => setWalkinForm({ ...walkinForm, advance_paid: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="walk-issue">Reported Defect / Failure *</label>
                                    <textarea
                                        id="walk-issue"
                                        rows="2"
                                        placeholder="Gently explain touch bleeding, thermal issue, battery swelling..."
                                        value={walkinForm.issue_reported}
                                        onChange={(e) => setWalkinForm({ ...walkinForm, issue_reported: e.target.value })}
                                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                                >
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    <span>Establish Repair Workload</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── SHOP OWNER SPARES ADD INVENTORY MODAL ── */}
                {showAddInventory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-lg w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary">Catalog Spare Item</h3>
                                <button onClick={() => setShowAddInventory(false)} className="text-on-surface hover:text-primary">
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleAddSparesInventory} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-branch-select">Select Branch *</label>
                                        <select
                                            id="inv-branch-select"
                                            value={inventoryForm.branch}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, branch: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2"
                                        >
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-cat-select">Category</label>
                                        <select
                                            id="inv-cat-select"
                                            value={inventoryForm.category}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm bg-surface px-2"
                                        >
                                            <option value="Display">Display Panel</option>
                                            <option value="Battery">Lithium Battery</option>
                                            <option value="Camera">Optics / Camera</option>
                                            <option value="Motherboard">IC Board / Chip</option>
                                            <option value="Charging Port">Flex Ribbon Port</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-name">Part Name *</label>
                                        <input
                                            id="inv-name"
                                            type="text"
                                            placeholder="iPhone 13 Display Assembly"
                                            value={inventoryForm.name}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-sku">Part SKU Code *</label>
                                        <input
                                            id="inv-sku"
                                            type="text"
                                            placeholder="IP13-DISP-OEM"
                                            value={inventoryForm.sku}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-purchase">Purchase Price (₹)</label>
                                        <input
                                            id="inv-purchase"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={inventoryForm.purchase_price}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, purchase_price: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-sell">Selling Price (₹) *</label>
                                        <input
                                            id="inv-sell"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={inventoryForm.selling_price}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, selling_price: e.target.value })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-stock">Stock Quantity</label>
                                        <input
                                            id="inv-stock"
                                            type="number"
                                            value={inventoryForm.stock_level}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, stock_level: parseInt(e.target.value) || 0 })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="inv-threshold">Low Limit Threshold</label>
                                        <input
                                            id="inv-threshold"
                                            type="number"
                                            value={inventoryForm.low_stock_threshold}
                                            onChange={(e) => setInventoryForm({ ...inventoryForm, low_stock_threshold: parseInt(e.target.value) || 0 })}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 text-sm shadow"
                                >
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    <span>Register catalog Part</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── SHOP OWNER COMPLIANT GST INVOICE GENERATION MODAL ── */}
                {showInvoiceModal && activeInvoiceTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-lg w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined">receipt_long</span>
                                    <span>Compile GST Compliant Invoice</span>
                                </h3>
                                <button onClick={() => { setShowInvoiceModal(false); setSelectedSpares([]); }} className="text-on-surface hover:text-primary">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
                                <div>
                                    <span className="text-[11px] font-bold text-outline uppercase block mb-1">Hardware Particulars</span>
                                    <p className="font-bold text-sm text-on-surface">{activeInvoiceTicket.device_brand} {activeInvoiceTicket.device_model} ({activeInvoiceTicket.ticket_number})</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="labor-charges-field">Labor Charges (₹) *</label>
                                    <input
                                        id="labor-charges-field"
                                        type="number"
                                        step="0.01"
                                        value={laborCharges}
                                        onChange={(e) => setLaborCharges(e.target.value)}
                                        className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-bold text-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="shop-gstin-field">Shop GSTIN *</label>
                                        <input
                                            id="shop-gstin-field"
                                            type="text"
                                            value={invoiceShopGstin}
                                            onChange={(e) => setInvoiceShopGstin(e.target.value)}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-semibold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-outline uppercase" htmlFor="customer-gstin-field">Customer GSTIN (Optional)</label>
                                        <input
                                            id="customer-gstin-field"
                                            type="text"
                                            placeholder="e.g. 27BBBBB2222B2Z2"
                                            value={invoiceCustomerGstin}
                                            onChange={(e) => setInvoiceCustomerGstin(e.target.value)}
                                            className="w-full h-11 border border-outline rounded-lg text-sm px-3 bg-surface font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="billing-address-field">Customer Billing Address *</label>
                                    <textarea
                                        id="billing-address-field"
                                        rows="2"
                                        placeholder="Full physical address for billing..."
                                        value={invoiceBillingAddress}
                                        onChange={(e) => setInvoiceBillingAddress(e.target.value)}
                                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase">Select Spares Consumed from Inventory</label>
                                    <div className="max-h-[120px] overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-1 bg-surface">
                                        {inventory.length === 0 ? (
                                            <p className="text-xs text-outline text-center py-2 font-semibold">No spares available in catalog.</p>
                                        ) : (
                                            inventory.map(item => (
                                                <div key={item.id} className="flex items-center gap-2 text-xs font-bold py-1 border-b border-surface-container-high last:border-b-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`spare-inv-${item.id}`}
                                                        checked={selectedSpares.includes(item.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSpares([...selectedSpares, item.id]);
                                                            } else {
                                                                setSelectedSpares(selectedSpares.filter(id => id !== item.id));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={`spare-inv-${item.id}`} className="flex justify-between w-full cursor-pointer text-on-surface-variant font-medium">
                                                        <span>{item.name} (SKU: {item.sku})</span>
                                                        <span className="text-primary font-bold">₹{item.selling_price}</span>
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Live invoice dynamic computational breakdowns */}
                                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant text-[12px] font-bold space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant font-medium">Subtotal (Labor + Spares):</span>
                                        <span>₹{(parseFloat(laborCharges || 0) + selectedSpares.reduce((sum, id) => sum + parseFloat(inventory.find(i => i.id === id)?.selling_price || 0), 0)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-outline">
                                        <span className="font-medium">CGST (9.00%):</span>
                                        <span>₹{((parseFloat(laborCharges || 0) + selectedSpares.reduce((sum, id) => sum + parseFloat(inventory.find(i => i.id === id)?.selling_price || 0), 0)) * 0.09).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-outline">
                                        <span className="font-medium">SGST (9.00%):</span>
                                        <span>₹{((parseFloat(laborCharges || 0) + selectedSpares.reduce((sum, id) => sum + parseFloat(inventory.find(i => i.id === id)?.selling_price || 0), 0)) * 0.09).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-primary border-t border-outline-variant pt-2">
                                        <span>Total Outstanding (GST Inc.):</span>
                                        <span>₹{((parseFloat(laborCharges || 0) + selectedSpares.reduce((sum, id) => sum + parseFloat(inventory.find(i => i.id === id)?.selling_price || 0), 0)) * 1.18).toFixed(2)}</span>
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
                        </div>
                    </div>
                )}

                {/* ── GST INVOICE PRINT PREVIEW MODAL ── */}
                {showInvoicePreviewModal && selectedPreviewInvoice && (() => {
                    const inv = selectedPreviewInvoice;
                    const ticketObj = tickets.find(t => t.ticket_number === inv.ticket_number) || {};
                    const laborTaxable = parseFloat(inv.labor_charges || 0);
                    const laborGst = laborTaxable * 0.18;
                    const branchObj = branches.find(b => b.id === ticketObj.branch) || {};

                    return (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto no-print">
                            <div className="bg-surface rounded-xl border border-outline-variant shadow-lg max-w-2xl w-full relative animate-scaleIn text-left flex flex-col max-h-[90vh]">
                                
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container">
                                    <h3 className="font-bold text-md text-primary flex items-center gap-1">
                                        <span className="material-symbols-outlined">print</span>
                                        <span>GST Invoice Preview</span>
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => window.print()}
                                            className="px-3 h-9 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">print</span>
                                            <span>Print / Save PDF</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowInvoicePreviewModal(false);
                                                setSelectedPreviewInvoice(null);
                                            }} 
                                            className="px-3 h-9 bg-surface-container border border-outline rounded-lg font-bold text-xs flex items-center gap-1 hover:text-primary active:scale-95 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                            <span>Close</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Printable Area */}
                                <div id="printable-invoice-card" className="p-8 bg-white text-black overflow-y-auto flex-1 font-sans">
                                    {/* Company Letterhead */}
                                    <div className="flex justify-between items-start border-b-2 border-primary pb-4">
                                        <div>
                                            <h1 className="text-2xl font-extrabold text-primary tracking-wide">RepairBharat</h1>
                                            <p className="text-xs font-semibold text-gray-500 uppercase mt-0.5">Physical Franchise Workshop</p>
                                            <p className="text-xs font-bold text-gray-700 mt-2">{branchObj.name || 'RepairBharat Dadar Branch'}</p>
                                            <p className="text-xs text-gray-600 max-w-[280px] mt-0.5">{branchObj.address || 'Dadar, Mumbai, Maharashtra'}</p>
                                            <p className="text-xs font-bold text-gray-700 mt-2">GSTIN: {inv.shop_gstin || '27AAAAA1111A1Z1'}</p>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Tax Invoice</h2>
                                            <p className="text-xs text-gray-500 mt-1">Original for Recipient</p>
                                            <div className="mt-4 text-xs text-gray-700 space-y-1">
                                                <p><strong className="font-bold">Invoice No:</strong> {inv.invoice_number}</p>
                                                <p><strong className="font-bold">Date:</strong> {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : "N/A"}</p>
                                                <p><strong className="font-bold">Place of Supply:</strong> Maharashtra (27)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Billing Details Block */}
                                    <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To (Recipient)</h3>
                                            <p className="text-sm font-bold text-gray-800">{ticketObj.customer_username || 'Valued Customer'}</p>
                                            <p className="text-xs text-gray-600 font-semibold mt-1">Phone: {ticketObj.customer_phone || 'N/A'}</p>
                                            <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap"><strong className="font-bold">Address:</strong> {inv.billing_address || 'Mumbai, Maharashtra'}</p>
                                            {inv.customer_gstin && (
                                                <p className="text-xs font-bold text-primary mt-2">Customer GSTIN: {inv.customer_gstin}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between items-end">
                                            <div className="text-right">
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment particulars</h3>
                                                <p className="text-xs font-semibold text-gray-700">Payment Status: 
                                                    <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${inv.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {inv.payment_status}
                                                    </span>
                                                </p>
                                                <p className="text-xs font-semibold text-gray-700 mt-1">Payment Method: <span className="uppercase font-bold text-gray-900">{inv.payment_method}</span></p>
                                            </div>
                                            <div className="border border-green-500 bg-green-50 text-green-700 rounded-lg p-2.5 flex items-center gap-1.5 mt-2">
                                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider">GST INVOICE SECURED</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items Table */}
                                    <div className="py-4">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-300 font-bold text-gray-600 uppercase text-[10px]">
                                                    <th className="py-2">S.No</th>
                                                    <th className="py-2">Particulars / Service Details</th>
                                                    <th className="py-2 text-center">HSN/SAC</th>
                                                    <th className="py-2 text-right">Taxable Value</th>
                                                    <th className="py-2 text-center">GST Rate</th>
                                                    <th className="py-2 text-right">CGST (9%)</th>
                                                    <th className="py-2 text-right">SGST (9%)</th>
                                                    <th className="py-2 text-right">Total (INR)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Labor Charges */}
                                                <tr className="border-b border-gray-200">
                                                    <td className="py-3">1</td>
                                                    <td className="py-3">
                                                        <p className="font-bold text-gray-800">Technical Hardware Labor Fees</p>
                                                        <p className="text-[10px] text-gray-500">Service ticket number: {inv.ticket_number}</p>
                                                    </td>
                                                    <td className="py-3 text-center font-mono">998729</td>
                                                    <td className="py-3 text-right">₹{laborTaxable.toFixed(2)}</td>
                                                    <td className="py-3 text-center">18%</td>
                                                    <td className="py-3 text-right">₹{(laborTaxable * 0.09).toFixed(2)}</td>
                                                    <td className="py-3 text-right">₹{(laborTaxable * 0.09).toFixed(2)}</td>
                                                    <td className="py-3 text-right font-semibold">₹{(laborTaxable * 1.18).toFixed(2)}</td>
                                                </tr>
                                                
                                                {/* Calculated Spares */}
                                                {(() => {
                                                    const totalSparesWithTax = parseFloat(inv.grand_total) - (laborTaxable * 1.18);
                                                    if (totalSparesWithTax > 0.01) {
                                                        const sparesTaxable = totalSparesWithTax / 1.18;
                                                        return (
                                                            <tr className="border-b border-gray-200">
                                                                <td className="py-3">2</td>
                                                                <td className="py-3">
                                                                    <p className="font-bold text-gray-800">Spare Parts Kit Consumed</p>
                                                                    <p className="text-[10px] text-gray-500">Inventory parts replacement kit</p>
                                                                </td>
                                                                <td className="py-3 text-center font-mono">85177900</td>
                                                                <td className="py-3 text-right">₹{sparesTaxable.toFixed(2)}</td>
                                                                <td className="py-3 text-center">18%</td>
                                                                <td className="py-3 text-right">₹{(sparesTaxable * 0.09).toFixed(2)}</td>
                                                                <td className="py-3 text-right">₹{(sparesTaxable * 0.09).toFixed(2)}</td>
                                                                <td className="py-3 text-right font-semibold">₹{totalSparesWithTax.toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Final Summary Calculation */}
                                    <div className="flex justify-end pt-4">
                                        <div className="w-[300px] text-xs space-y-2">
                                            <div className="flex justify-between text-gray-600 font-semibold">
                                                <span>Taxable Subtotal:</span>
                                                <span>₹{(parseFloat(inv.grand_total) / 1.18).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600 font-semibold">
                                                <span>CGST Collected (9.00%):</span>
                                                <span>₹{parseFloat(inv.cgst).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600 font-semibold">
                                                <span>SGST Collected (9.00%):</span>
                                                <span>₹{parseFloat(inv.sgst).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-base font-extrabold text-primary border-t-2 border-gray-300 pt-2">
                                                <span>Grand Total (GST Inc.):</span>
                                                <span>₹{parseFloat(inv.grand_total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statutory Watermark Note */}
                                    <div className="mt-10 border-t border-gray-200 pt-6 text-[10px] text-gray-500 text-center space-y-1 leading-relaxed">
                                        <p className="font-bold uppercase tracking-wider text-gray-600">Declaration & Statutory Notice</p>
                                        <p>This is a computer-generated Tax Invoice generated relationally in accordance with Section 31 of CGST Act, 2017. It does not require physical signatures.</p>
                                        <p className="font-semibold text-primary mt-1">Thank you for supporting digital billing with RepairBharat!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── STAGE NOTES TRANSITION MODAL ── */}
                {showStageNotesModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-surface rounded-xl border border-outline-variant shadow-md p-6 max-w-md w-full relative animate-scaleIn text-left">
                            <div className="flex justify-between items-center pb-3 border-b border-outline-variant mb-4">
                                <h3 className="font-bold text-lg text-primary">Log Work Details</h3>
                                <button 
                                    onClick={() => {
                                        setShowStageNotesModal(false);
                                        setStageNotesTicketId(null);
                                        setStageNotesCode("");
                                    }} 
                                    className="text-on-surface hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-[24px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={submitStageNotesTransition} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-outline uppercase" htmlFor="stage-log-notes">What work was completed for this stage? *</label>
                                    <textarea
                                        id="stage-log-notes"
                                        rows="3"
                                        placeholder="Explain what steps or components were serviced, diagnostics checked, e.g. Motherboard micro-soldering complete..."
                                        value={stageNotesInput}
                                        onChange={(e) => setStageNotesInput(e.target.value)}
                                        className="w-full border border-outline rounded-lg text-sm p-3 bg-surface outline-none focus:border-primary transition-colors animate-fadeIn"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowStageNotesModal(false);
                                            setStageNotesTicketId(null);
                                            setStageNotesCode("");
                                        }}
                                        className="flex-1 h-11 bg-surface-container border border-outline hover:bg-surface-container-high rounded-lg font-bold text-sm active:scale-95 transition-transform"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 h-11 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-bold text-sm shadow active:scale-95 transition-transform"
                                    >
                                        Update Stage
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Accent bar */}
                <div className="fixed bottom-0 left-0 w-full h-1 bg-primary z-50"></div>
            </div>
        </>
    );
}
