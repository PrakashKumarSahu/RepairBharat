import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicTicket } from "../services/api";

export default function TrackTicket() {
    const { ticketNumber } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const data = await fetchPublicTicket(ticketNumber);
                setTicket(data);
                setError(null);
            } catch (err) {
                console.error("Failed fetching public ticket", err);
                setError("Ticket not found. Make sure the ticket number is correct.");
            } finally {
                setLoading(false);
            }
        };
        if (ticketNumber) {
            loadTicket();
            
            // Real-time tracking synchronization heartbeat (5s reload)
            const intervalId = setInterval(loadTicket, 5000);
            return () => clearInterval(intervalId);
        }
    }, [ticketNumber]);

    const getStatusDetails = (code) => {
        switch (code) {
            case "received": return { label: "Received & Logged", icon: "inbox_customize", color: "#3755c3", desc: "Your device has been checked in and registered at our workstation queue." };
            case "diagnosing": return { label: "Diagnostics Bench", icon: "troubleshoot", color: "#ffa85d", desc: "Our certified hardware technicians are diagnosing motherboard and circuitry logs." };
            case "repairing": return { label: "Active Service Bench", icon: "build_circle", color: "#00288e", desc: "Technical repair operations and spare parts replacement are currently underway." };
            case "ready": return { label: "Quality Checks & Ready", icon: "verified", color: "#006d30", desc: "Service completed! Device passed all quality parameters and is ready for pickup." };
            case "delivered": return { label: "Delivered & Settled", icon: "check_circle", color: "#444653", desc: "The device has been successfully handed over to the client. Case closed." };
            default: return { label: code || "Registered", icon: "settings_wrench", color: "#3755c3", desc: "Workstation queue logs updated." };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-sm text-outline animate-pulse">Pinpointing repair telemetry logs...</p>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-sans max-w-md mx-auto">
                <span className="material-symbols-outlined text-[64px] text-error mb-2 animate-bounce">warning</span>
                <h2 className="text-xl font-bold text-on-surface">Tracking Logs Missing</h2>
                <p className="text-xs text-outline font-semibold mt-2 leading-relaxed">{error || "Could not retrieve repair ticket logs."}</p>
                <div className="pt-6 w-full flex gap-2">
                    <Link to="/login" className="flex-1 h-11 bg-primary text-on-primary rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[16px]">login</span>
                        <span>Employee Login Portal</span>
                    </Link>
                </div>
            </div>
        );
    }

    const currentStatus = getStatusDetails(ticket.status_code);

    return (
        <div className="min-h-screen bg-surface text-on-background py-8 px-4 md:px-margin-desktop font-sans text-left">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* ── Top Header branding ── */}
                <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px] fill-primary">handyman</span>
                        <h1 className="font-extrabold text-xl text-primary tracking-tight">RepairBharat</h1>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Public tracker</span>
                    </div>
                    <Link to="/login" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                        <span>Staff Login</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                </div>

                {/* ── Ticket summary Bento row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Col 1 & 2: Main Device & Status Bento */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Hardware Repair Order</span>
                                    <h2 className="text-2xl font-extrabold text-on-surface mt-0.5">{ticket.device_brand} {ticket.device_model}</h2>
                                    <p className="text-xs text-outline font-bold mt-1">Ticket Number: <span className="font-mono text-primary uppercase">{ticket.ticket_number}</span></p>
                                </div>
                                <span 
                                    style={{ color: currentStatus.color, borderColor: currentStatus.color, backgroundColor: `${currentStatus.color}12` }}
                                    className="px-3.5 py-1 rounded-full font-extrabold text-xs border uppercase tracking-wider flex items-center gap-1 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">{currentStatus.icon}</span>
                                    <span>{currentStatus.label}</span>
                                </span>
                            </div>

                            <div className="bg-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                                <h3 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">info</span>
                                    <span>Diagnosis & Work Report</span>
                                </h3>
                                <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
                                    <strong className="text-on-surface">Client Complaint:</strong> {ticket.issue_reported}
                                </p>
                                {ticket.diagnostics_notes && (
                                    <p className="text-xs text-outline font-semibold leading-relaxed border-t border-outline-variant/20 pt-2 mt-2">
                                        <strong className="text-on-surface-variant uppercase text-[10px] tracking-wider block mb-0.5">Technician Bench Notes:</strong>
                                        {ticket.diagnostics_notes}
                                    </p>
                                )}
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/40">
                                    <span className="text-[10px] font-bold text-outline uppercase block">Advance Deposited</span>
                                    <p className="text-lg font-extrabold text-on-surface mt-1">₹{parseFloat(ticket.advance_paid || 0).toFixed(2)}</p>
                                </div>
                                <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/40 border-l-4 border-l-primary">
                                    <span className="text-[10px] font-bold text-outline uppercase block">Estimated cost</span>
                                    <p className="text-lg font-extrabold text-primary mt-1">₹{parseFloat(ticket.estimated_cost || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Stepper Bento */}
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
                            <h3 className="font-bold text-md text-primary flex items-center gap-1.5 border-b border-surface-container pb-3 text-left">
                                <span className="material-symbols-outlined">analytics</span>
                                <span>Repair Workflow Cycle Milestone Logs</span>
                            </h3>

                            <div className="relative pl-6 border-l-2 border-outline-variant/60 ml-2 space-y-6 pt-2">
                                {ticket.history && ticket.history.length > 0 ? (
                                    ticket.history.map((hist, idx) => {
                                        const hStatus = getStatusDetails(hist.stage_code);
                                        return (
                                            <div key={hist.id || idx} className="relative animate-fadeIn text-left">
                                                <span 
                                                    style={{ backgroundColor: hist.stage_color || hStatus.color }}
                                                    className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest shadow-sm"
                                                ></span>
                                                <div>
                                                    <div className="flex justify-between items-center gap-2">
                                                        <h4 className="font-extrabold text-sm text-on-surface flex items-center gap-1 uppercase tracking-wide">
                                                            <span>{hist.stage_name}</span>
                                                        </h4>
                                                        <span className="text-[10px] text-outline font-semibold">{new Date(hist.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed mt-1 bg-surface p-2.5 rounded-lg border border-outline-variant/40 mt-1">{hist.notes}</p>
                                                    <p className="text-[9px] text-outline mt-1 font-semibold flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[11px]">engineering</span>
                                                        <span>Logged by: {hist.updated_by_username}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-xs text-outline py-4 text-center">No logs generated for this repair order yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Side Device Image & Workshop Bento */}
                    <div className="space-y-6">
                        
                        {/* Device Image Card */}
                        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm space-y-3">
                            <h3 className="font-bold text-xs text-outline uppercase tracking-wider text-left">Item Intake Imagery</h3>
                            {ticket.device_image ? (
                                <div className="rounded-xl border border-outline-variant/60 overflow-hidden shadow-sm relative group bg-surface flex items-center justify-center min-h-[160px]">
                                    <img 
                                        src={ticket.device_image} 
                                        alt={`${ticket.device_brand} ${ticket.device_model}`} 
                                        className="w-full h-auto object-cover max-h-[220px]"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                        Check-in Photo
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border-2 border-dashed border-outline-variant bg-surface flex flex-col items-center justify-center p-6 text-center text-outline min-h-[160px]">
                                    <span className="material-symbols-outlined text-[36px]">image_not_supported</span>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5">No Device Image Logged</p>
                                    <p className="text-[9px] mt-0.5">Physical intake image was not captured upon order submission.</p>
                                </div>
                            )}
                        </div>

                        {/* QR Code Sharing */}
                        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm space-y-4 text-center">
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block text-left">Scan & Share Status</span>
                            <div className="bg-white p-3.5 rounded-xl inline-block border border-gray-200 shadow-inner">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} 
                                    alt="Tracking QR Code"
                                    className="w-[120px] h-[120px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-on-surface">Share Ticket Access</p>
                                <p className="text-[10px] text-outline leading-relaxed font-semibold">Customers or partners can scan this QR code to access this live repair ledger directly without needing to log in.</p>
                            </div>
                        </div>

                        {/* Franchise details */}
                        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm space-y-3 text-left">
                            <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Intake Workstation Workshop</h3>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                    <span>{ticket.branch_name || "RepairBharat Franchise Hub"}</span>
                                </p>
                                <p className="text-xs text-on-surface-variant font-semibold flex items-start gap-1">
                                    <span className="material-symbols-outlined text-[15px] shrink-0 text-outline mt-0.5">location_on</span>
                                    <span>Mumbai, Maharashtra, India</span>
                                </p>
                                <div className="border-t border-outline-variant/40 pt-3 mt-2 text-[10px] text-outline font-semibold leading-relaxed">
                                    <p>Contact Customer Care: 1800-REPAIR-BHARAT</p>
                                    <p className="mt-1 text-primary">Operated under certified SLA metrics.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
