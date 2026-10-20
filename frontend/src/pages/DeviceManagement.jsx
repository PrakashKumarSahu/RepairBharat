import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useUserContext } from '../services';
import { Navbar } from '../components/layout/Navbar';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';

const DEVICE_CATEGORIES = ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'Smartwatch', 'Gaming Console', 'Other'];

function AddDeviceModal({ open, onClose, onSubmit }) {
    const [form, setForm] = useState({
        category: 'Smartphone', brand: '', model: '', serial_number: '', imei: '', purchase_year: '',
    });

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.brand || !form.model) { toast.error('Brand and model are required'); return; }
        onSubmit(form);
    };

    return (
        <Modal open={open} onClose={onClose} title="Register Device">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm">
                        {DEVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Brand *</label>
                        <input name="brand" value={form.brand} onChange={handleChange} required
                            placeholder="Apple, Samsung..." className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Model *</label>
                        <input name="model" value={form.model} onChange={handleChange} required
                            placeholder="iPhone 15, Galaxy S24..." className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Serial Number</label>
                    <input name="serial_number" value={form.serial_number} onChange={handleChange}
                        placeholder="Optional" className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">IMEI (for phones)</label>
                    <input name="imei" value={form.imei} onChange={handleChange}
                        placeholder="15-digit IMEI" maxLength={15} className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Purchase Year</label>
                    <input name="purchase_year" type="number" value={form.purchase_year} onChange={handleChange}
                        placeholder="2023" min="2000" max="2030" className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface text-on-surface text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 border border-outline-variant rounded-lg py-2 text-sm text-on-surface-variant hover:bg-surface-variant">
                        Cancel
                    </button>
                    <button type="submit"
                        className="flex-1 bg-primary text-on-primary rounded-lg py-2 text-sm font-semibold hover:bg-primary/90">
                        Register Device
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function DeviceManagement() {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/devices/');
            setDevices(res.data);
        } catch {
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDevices(); }, []);

    const handleAddDevice = async (form) => {
        try {
            await api.post('/api/devices/', form);
            toast.success('Device registered!');
            setShowAdd(false);
            loadDevices();
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to register device');
        }
    };

    const handleDeleteDevice = async (id) => {
        if (!window.confirm('Remove this device from your profile?')) return;
        try {
            await api.delete(`/api/devices/${id}/`);
            toast.success('Device removed');
            loadDevices();
        } catch {
            toast.error('Failed to remove device');
        }
    };

    const categoryIcons = {
        Smartphone: 'smartphone', Tablet: 'tablet', Laptop: 'laptop', Desktop: 'computer',
        Smartwatch: 'watch', 'Gaming Console': 'sports_esports', Other: 'devices_other',
    };

    return (
        <>
            <Toaster position="top-center" />
            <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
                <Navbar />
                <main className="flex-1 pt-16 px-4 md:px-8 max-w-4xl mx-auto w-full pb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-on-surface">My Devices</h1>
                            <p className="text-sm text-on-surface-variant">Manage your registered devices</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Device
                        </button>
                    </div>

                    {loading ? (
                        <Spinner label="Loading devices..." />
                    ) : devices.length === 0 ? (
                        <EmptyState
                            icon="devices"
                            message="No devices registered yet"
                            action={{ label: 'Add Your First Device', onClick: () => setShowAdd(true) }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {devices.map((device) => (
                                <div key={device.id} className="bg-surface border border-outline-variant rounded-xl p-4 flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-[24px]">
                                            {categoryIcons[device.category] || 'devices_other'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-on-surface truncate">{device.brand} {device.model}</p>
                                        <p className="text-xs text-on-surface-variant">{device.category}</p>
                                        {device.serial_number && (
                                            <p className="text-xs text-on-surface-variant mt-0.5">S/N: {device.serial_number}</p>
                                        )}
                                        {device.imei && (
                                            <p className="text-xs text-on-surface-variant">IMEI: {device.imei}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDevice(device.id)}
                                        className="text-on-surface-variant hover:text-error transition-colors shrink-0"
                                        title="Remove device"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <AddDeviceModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddDevice} />
            </div>
        </>
    );
}
