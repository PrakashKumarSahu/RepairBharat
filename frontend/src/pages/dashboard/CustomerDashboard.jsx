import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useUserContext } from '../../services';
import { fetchBranches, fetchTickets, createTicket, fetchStages } from '../../services/api';
import { getStatusLabelAndColor } from '../../utils/status';
import { usePolling } from '../../hooks/usePolling';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Spinner } from '../../components/ui/Spinner';
import { QrSuccessModal } from '../../components/tickets/QrSuccessModal';
import { BookingModal } from '../../components/branches/BookingModal';

export default function CustomerDashboard() {
    const { user } = useUserContext();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);
    const [branches, setBranches] = useState([]);
    const [stages, setStages] = useState([]);

    const [activeTab, setActiveTab] = useState('repairs');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [userLat, setUserLat] = useState(19.0760);
    const [userLng, setUserLng] = useState(72.8777);
    const [locationMethod, setLocationMethod] = useState('default');
    const [locationProviderInfo, setLocationProviderInfo] = useState('Default Initial Center (Mumbai Hub)');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRepairType, setSelectedRepairType] = useState('');
    const [visibleShopsLimit, setVisibleShopsLimit] = useState(10);

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        device_category: 'Smartphone',
        device_brand: '',
        device_model: '',
        device_serial: '',
        issue_reported: '',
        priority: 'medium',
        device_image: ''
    });

    const [showSuccessQrModal, setShowSuccessQrModal] = useState(false);
    const [successTicketNumber, setSuccessTicketNumber] = useState('');
    const [successDeviceName, setSuccessDeviceName] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchData, ticketData, stageData] = await Promise.all([
                fetchBranches({ all: true }, { lat: userLat, lng: userLng }),
                fetchTickets(),
                fetchStages()
            ]);
            setBranches(branchData);
            setTickets(ticketData);
            setStages(stageData);
        } catch (error) {
            toast.error('Unable to load records. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    usePolling(async () => {
        try {
            const t = await fetchTickets();
            setTickets(t);
        } catch (_) {}
    }, 10000);

    useEffect(() => {
        if (activeTab === 'workshops') {
            fetchBranches({ repair_type: selectedRepairType }, { lat: userLat, lng: userLng })
                .then(setBranches)
                .catch(() => {});
        }
    }, [selectedRepairType, activeTab, userLat, userLng]);

    const handleAutoFetchLocation = () => {
        if (navigator.geolocation) {
            setLocationProviderInfo('Fetching coordinates from HTML5 Device Geolocation API...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLat(position.coords.latitude);
                    setUserLng(position.coords.longitude);
                    setLocationMethod('device_gps');
                    setLocationProviderInfo('W3C Device GPS Telemetry (HTML5 Location Service API)');
                    toast.success('Device telemetry coordinates fetched successfully!');
                },
                () => {
                    toast.error('GPS blocked or unavailable. Falling back to manual search.');
                    setLocationProviderInfo('Fallback Directory Engine (Standard Core Coordinates)');
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            toast.error('Geolocation API not supported by browser.');
        }
    };

    const handleCreateTicketSubmit = async (e) => {
        e.preventDefault();
        if (!bookingForm.device_brand || !bookingForm.device_model || !bookingForm.issue_reported) {
            toast.error('Please fill in all required device details.');
            return;
        }
        try {
            const payload = {
                branch: selectedBranch.id,
                device_category: bookingForm.device_category,
                device_brand: bookingForm.device_brand,
                device_model: bookingForm.device_model,
                device_serial: bookingForm.device_serial || 'N/A',
                issue_reported: bookingForm.issue_reported,
                priority: bookingForm.priority,
                device_image: bookingForm.device_image
            };
            const res = await createTicket(payload);
            toast.success('Secure repair booking submitted successfully!');
            setShowBookingModal(false);
            setSuccessTicketNumber(res.ticket_number);
            setSuccessDeviceName(`${res.device_brand || bookingForm.device_brand} ${res.device_model || bookingForm.device_model}`);
            setShowSuccessQrModal(true);
            setBookingForm({ device_category: 'Smartphone', device_brand: '', device_model: '', device_serial: '', issue_reported: '', priority: 'medium', device_image: '' });
            const freshTickets = await fetchTickets();
            setTickets(freshTickets);
            setActiveTab('repairs');
        } catch (error) {
            toast.error('Booking failed. Please try again.');
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.address || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <button
                        type="button"
                        onClick={handleAutoFetchLocation}
                        className="px-3.5 h-10 bg-primary hover:bg-primary-container text-on-primary hover:text-primary rounded-lg font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[16px]">my_location</span>
                        <span>Auto GPS</span>
                    </button>
                    <select
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                                const [lat, lng, label] = val.split('|');
                                setUserLat(parseFloat(lat));
                                setUserLng(parseFloat(lng));
                                setLocationMethod('manual_search');
                                setLocationProviderInfo('Manual Search Directory (Provider: OpenStreetMap Nominatim Engine)');
                                toast.success(`Position updated to ${label}!`);
                            }
                        }}
                        value={`${userLat}|${userLng}`}
                        className="px-3 h-10 bg-surface border border-outline rounded-lg font-bold text-xs cursor-pointer focus:ring-2 focus:ring-primary text-on-surface outline-none"
                    >
                        <option value="19.0760|72.8777">🔍 Select Station...</option>
                        <option value="19.0178|72.8478|Dadar, Mumbai">Dadar West Franchise Hub</option>
                        <option value="19.1136|72.8697|Andheri, Mumbai">Andheri East Tech Park</option>
                        <option value="19.0596|72.8295|Bandra, Mumbai">Bandra Reclamation Hub</option>
                        <option value="19.2183|72.9781|Thane, Mumbai">Thane Central Franchise</option>
                        <option value="18.9067|72.8147|Colaba, Mumbai">Colaba B2B Center</option>
                        <option value="19.0700|72.8800|Kurla, Mumbai">Kurla Junction Station</option>
                        <option value="19.2307|72.8567|Borivali, Mumbai">Borivali West Hub</option>
                        <option value="19.0860|72.9080|Ghatkopar, Mumbai">Ghatkopar Central Plaza</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-outline-variant font-bold border-t border-surface-container pt-2.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                <span>Telemetry Location Engine: </span>
                <strong className="text-secondary uppercase">
                    {locationMethod === 'device_gps' ? 'Active GPS Fetch' : locationMethod === 'manual_search' ? 'Manual Directory Search' : 'Default Initial Center'}
                </strong>
                <span className="text-[10px] text-outline font-semibold">| Provider: {locationProviderInfo || 'Core Spatial Map Engine'}</span>
            </div>
        </div>
    );

    return (
        <>
            <Toaster position="top-center" />
            <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
                <Navbar mobileMenuOpen={mobileMenuOpen} onMobileMenuToggle={() => setMobileMenuOpen(p => !p)} />
                <div className="flex flex-1 pt-12">
                    <Sidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        mobileOpen={mobileMenuOpen}
                        onMobileClose={() => setMobileMenuOpen(false)}
                    />
                    <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto max-w-5xl mx-auto space-y-md w-full pb-16">
                        {loading ? (
                            <Spinner label="Accessing workstation database..." />
                        ) : (
                            <>
                                {locationControlPanel}

                                {/* ── REPAIRS TAB ── */}
                                {activeTab === 'repairs' && (
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
                                                    onClick={() => setActiveTab('workshops')}
                                                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all inline-flex items-center gap-1 text-sm"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">explore</span>
                                                    <span>Explore Repair Centers</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {tickets.map((t) => {
                                                    const sObj = getStatusLabelAndColor(t.status_code, stages);
                                                    return (
                                                        <div key={t.id} className="bg-surface-container-lowest rounded-xl p-6 border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-left">
                                                            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-headline-md text-lg font-bold text-on-surface">{t.device_brand} {t.device_model}</h4>
                                                                        <span className="text-[11px] font-bold px-2 py-0.5 bg-surface-container-high rounded text-primary uppercase">{t.device_category}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <p className="text-xs text-outline font-semibold">Ticket: <span className="font-mono uppercase">{t.ticket_number}</span></p>
                                                                        <button
                                                                            onClick={() => { setSuccessTicketNumber(t.ticket_number); setSuccessDeviceName(`${t.device_brand} ${t.device_model}`); setShowSuccessQrModal(true); }}
                                                                            className="text-primary hover:text-primary-container flex items-center gap-0.5 text-[11px] font-bold"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                                                                            <span>QR Tracker</span>
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-xs text-on-surface-variant font-semibold mt-1 flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                                                                        <span>{t.branch_name}</span>
                                                                    </p>
                                                                    {t.device_image && (
                                                                        <div className="mt-3 relative w-full max-w-[150px] aspect-video rounded-lg overflow-hidden border border-outline-variant shadow-sm bg-surface-container">
                                                                            <img src={t.device_image} alt="Intake Device" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    )}
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

                                                            {/* Progress bar */}
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-[11px] font-bold text-outline uppercase mb-2">
                                                                    <span>Received</span>
                                                                    <span>Diagnosing</span>
                                                                    <span>In Repair</span>
                                                                    <span>Ready</span>
                                                                </div>
                                                                <div className="w-full bg-surface-container rounded-full h-2 relative overflow-hidden">
                                                                    <div
                                                                        style={{ width: t.status_code === 'ready' || t.status_code === 'delivered' ? '100%' : t.status_code === 'in_repair' ? '75%' : t.status_code === 'diagnosing' ? '50%' : '25%' }}
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

                                {/* ── WORKSHOPS TAB ── */}
                                {activeTab === 'workshops' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-headline-xl text-[28px] font-bold text-primary">Discover Proximity Repair Stations</h2>
                                                <p className="font-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                                                    <span className="material-symbols-outlined text-[18px] text-secondary">explore</span>
                                                    <span>Pinpointing certified workshops using GPS proximity telemetry.</span>
                                                </p>
                                            </div>
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
                                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary">
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category chips */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Specialty & Service Category</label>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
                                                <button
                                                    onClick={() => { setSelectedRepairType(''); setVisibleShopsLimit(10); }}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start active:scale-95 flex items-center gap-1 ${selectedRepairType === '' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">grid_view</span>
                                                    <span>All Specialties</span>
                                                </button>
                                                {[
                                                    { code: 'Screen', name: 'Screen Repair', icon: 'phone_android' },
                                                    { code: 'Battery', name: 'Battery Assembly', icon: 'battery_charging_full' },
                                                    { code: 'Soldering', name: 'IC & Motherboard', icon: 'memory' },
                                                    { code: 'Liquid', name: 'Liquid Recovery', icon: 'water_drop' },
                                                    { code: 'Port', name: 'Charging Interface', icon: 'power' },
                                                    { code: 'Laptop', name: 'Laptop Systems', icon: 'laptop' },
                                                    { code: 'Tablet', name: 'Tablet Workbench', icon: 'tablet_mac' }
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.code}
                                                        onClick={() => { setSelectedRepairType(cat.code); setVisibleShopsLimit(10); }}
                                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 snap-start active:scale-95 flex items-center gap-1 ${selectedRepairType === cat.code ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                                                        <span>{cat.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Branch listing + Radar */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                            <div className="lg:col-span-7 space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[12px] font-bold text-outline uppercase tracking-wider">
                                                        Nearby Certified Stations ({filteredBranches.length})
                                                    </span>
                                                    {selectedRepairType && (
                                                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                                            <span className="material-symbols-outlined text-[12px]">filter_alt</span>
                                                            <span>Specialized only</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {filteredBranches.length === 0 ? (
                                                    <div className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container text-center shadow-sm">
                                                        <span className="material-symbols-outlined text-[64px] text-outline mb-2">location_off</span>
                                                        <p className="font-semibold text-on-surface-variant">No certified workshops match your active filters.</p>
                                                        <button
                                                            onClick={() => { setSelectedRepairType(''); setSearchQuery(''); }}
                                                            className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs"
                                                        >
                                                            Reset Filters
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {filteredBranches.slice(0, visibleShopsLimit).map((b) => {
                                                            const isSelected = selectedBranch?.id === b.id;
                                                            return (
                                                                <div
                                                                    key={b.id}
                                                                    onClick={() => setSelectedBranch(b)}
                                                                    className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group shadow-sm hover:shadow-md ${isSelected ? 'bg-surface-container-low border-primary ring-2 ring-primary/20' : 'bg-surface-container-lowest border-surface-container hover:border-outline-variant'}`}
                                                                >
                                                                    <div className="flex justify-between items-start gap-2 flex-wrap">
                                                                        <div className="flex-1 min-w-[200px]">
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-bold text-md text-on-surface group-hover:text-primary transition-colors flex items-center gap-1">
                                                                                    <span>{b.name}</span>
                                                                                    {b.rating >= 4.7 && (
                                                                                        <span className="material-symbols-outlined text-[16px] text-secondary" title="Elite Verified Station">verified</span>
                                                                                    )}
                                                                                </h4>
                                                                            </div>
                                                                            <p className="text-xs text-on-surface-variant mt-1.5 flex items-start gap-1 font-medium">
                                                                                <span className="material-symbols-outlined text-[15px] text-outline shrink-0 mt-0.5">location_on</span>
                                                                                <span>{b.address}</span>
                                                                            </p>
                                                                            <div className="flex gap-2 mt-2 flex-wrap items-center">
                                                                                {b.specialties.split(',').map((spec, sIdx) => (
                                                                                    <span key={sIdx} className="text-[10px] font-bold px-2 py-0.5 bg-surface-container rounded text-primary uppercase tracking-wide font-mono">
                                                                                        {spec.trim()}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right flex flex-col items-end shrink-0 gap-1">
                                                                            <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded text-secondary font-bold text-xs">
                                                                                <span className="material-symbols-outlined text-[13px]">star</span>
                                                                                <span>{b.rating}</span>
                                                                                <span className="text-[10px] text-outline font-normal">({b.reviews_count})</span>
                                                                            </div>
                                                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 flex items-center gap-0.5">
                                                                                <span className="material-symbols-outlined text-[13px]">distance</span>
                                                                                <span>{b.distance} km away</span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
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
                                                                            {b.is_local_db ? (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); setSelectedBranch(b); setShowBookingModal(true); }}
                                                                                    className="h-8 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold flex items-center gap-0.5 transition-all shadow-sm active:scale-95"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                                                                    <span>Book Now</span>
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-[10px] text-outline font-semibold uppercase flex items-center gap-0.5 bg-surface-container px-2.5 h-8 rounded-lg">
                                                                                    <span className="material-symbols-outlined text-[12px]">info</span>
                                                                                    <span>Google Listing</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {filteredBranches.length > visibleShopsLimit && (
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

                                            {/* Radar */}
                                            <div className="lg:col-span-5 space-y-4 sticky top-6 hidden lg:block">
                                                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-sm flex flex-col items-center text-center">
                                                    <div className="w-full flex justify-between items-center mb-3">
                                                        <span className="text-[12px] font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px] text-primary">radar</span>
                                                            <span>Interactive Proximity Radar</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Active Sweep</span>
                                                    </div>

                                                    <div className="w-[280px] h-[280px] rounded-full border-2 border-outline-variant relative overflow-hidden bg-[#0d1527] shadow-inner flex items-center justify-center">
                                                        <div className="absolute w-[220px] h-[220px] rounded-full border border-primary/20 pointer-events-none"></div>
                                                        <div className="absolute w-[160px] h-[160px] rounded-full border border-primary/30 pointer-events-none"></div>
                                                        <div className="absolute w-[100px] h-[100px] rounded-full border border-primary/40 pointer-events-none"></div>
                                                        <div className="absolute w-full h-[1px] bg-primary/20 pointer-events-none"></div>
                                                        <div className="absolute h-full w-[1px] bg-primary/20 pointer-events-none"></div>
                                                        <div
                                                            className="absolute inset-0 rounded-full pointer-events-none animate-spin"
                                                            style={{ animationDuration: '6s', background: 'conic-gradient(from 0deg, rgba(30,64,175,0.2) 0deg, transparent 140deg, transparent 360deg)' }}
                                                        ></div>
                                                        <span className="absolute text-[8px] font-mono text-primary/50 top-1/2 left-3/4 translate-x-1.5 -translate-y-2 pointer-events-none">10km</span>
                                                        <span className="absolute text-[8px] font-mono text-primary/50 top-1/2 left-[60%] translate-x-1 -translate-y-2 pointer-events-none">5km</span>
                                                        <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
                                                            <div className="w-3 h-3 rounded-full bg-secondary border border-white relative shadow-lg flex items-center justify-center">
                                                                <span className="absolute w-6 h-6 rounded-full bg-secondary/30 animate-ping"></span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-white mt-1 px-1.5 py-0.5 bg-black/70 rounded border border-white/20">You ({userLat.toFixed(2)}, {userLng.toFixed(2)})</span>
                                                        </div>
                                                        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 300 300">
                                                            {filteredBranches.map((b, idx) => {
                                                                const maxDistance = Math.max(...filteredBranches.map(br => br.distance || 1), 1);
                                                                const angle = Math.atan2(b.latitude - userLat, b.longitude - userLng);
                                                                const r = 30 + ((b.distance || 1) / maxDistance) * 105;
                                                                const cx = 150 + r * Math.cos(angle);
                                                                const cy = 150 - r * Math.sin(angle);
                                                                const isSelected = selectedBranch?.id === b.id;
                                                                return (
                                                                    <g key={b.id} onClick={() => setSelectedBranch(b)} className="cursor-pointer group">
                                                                        {isSelected && <circle cx={cx} cy={cy} r="10" fill="none" stroke="#92f5a4" strokeWidth="1.5" className="animate-pulse" />}
                                                                        <circle cx={cx} cy={cy} r="7" fill={isSelected ? '#92f5a4' : '#b8c4ff'} className="group-hover:fill-secondary transition-all" stroke="#0d1527" strokeWidth="1.5" />
                                                                        <circle cx={cx} cy={cy} r="3" fill={isSelected ? '#006d30' : '#00288e'} />
                                                                        <text x={cx} y={cy - 9} textAnchor="middle" className="text-[9px] font-extrabold fill-white font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{idx + 1}</text>
                                                                    </g>
                                                                );
                                                            })}
                                                        </svg>
                                                    </div>

                                                    <div className="w-full mt-4 p-4 rounded-xl border border-outline-variant bg-surface text-left">
                                                        {selectedBranch ? (
                                                            <div className="space-y-3 animate-scaleIn">
                                                                <div className="flex justify-between items-start gap-1 flex-wrap">
                                                                    <div className="flex-1">
                                                                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">Station Details</span>
                                                                        <h5 className="font-bold text-md text-on-surface mt-1">{selectedBranch.name}</h5>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5 bg-secondary/10 px-1.5 py-0.5 rounded text-secondary font-bold text-xs shrink-0">
                                                                        <span className="material-symbols-outlined text-[13px]">star</span>
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
                                                                <p className="max-w-[200px] leading-relaxed">Select a station in the list or radar node to review telemetry metrics.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>

                <BookingModal
                    open={showBookingModal && !!selectedBranch}
                    onClose={() => setShowBookingModal(false)}
                    selectedBranch={selectedBranch}
                    form={bookingForm}
                    onFormChange={setBookingForm}
                    onSubmit={handleCreateTicketSubmit}
                />
                <QrSuccessModal
                    open={showSuccessQrModal}
                    onClose={() => setShowSuccessQrModal(false)}
                    ticketNumber={successTicketNumber}
                    deviceName={successDeviceName}
                />
            </div>
        </>
    );
}
