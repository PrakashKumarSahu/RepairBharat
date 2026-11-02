import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';

const DEVICE_CATEGORIES = ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'Smartwatch', 'Gaming Console', 'Other'];

const schema = z.object({
    customer: z.string().min(1, 'Please select a customer'),
    branch: z.string().min(1, 'Please select a branch'),
    device_category: z.string().min(1, 'Category required'),
    device_brand: z.string().min(1, 'Brand required'),
    device_model: z.string().min(1, 'Model required'),
    device_serial: z.string().optional().default(''),
    issue_reported: z.string().min(5, 'Describe the issue (min 5 characters)'),
    priority: z.enum(['low', 'medium', 'high']),
    estimated_cost: z.coerce.number().min(0).default(0),
    advance_paid: z.coerce.number().min(0).default(0),
});

export function WalkinModal({ open, onClose, onSubmit, customers = [], branches = [] }) {
    const localBranches = branches.filter((b) => b.is_local_db !== false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            customer: '',
            branch: '',
            device_category: 'Smartphone',
            device_brand: '',
            device_model: '',
            device_serial: '',
            issue_reported: '',
            priority: 'medium',
            estimated_cost: 0,
            advance_paid: 0,
        },
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onValidSubmit = (data) => {
        onSubmit(data);
    };

    // Helper for field error display
    const FieldError = ({ name }) =>
        errors[name] ? <p className="text-xs text-red-500 mt-0.5">{errors[name].message}</p> : null;

    const inputCls = (name) =>
        `w-full border ${errors[name] ? 'border-red-400' : 'border-outline-variant'} rounded-lg px-3 py-2 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary`;

    return (
        <Modal open={open} onClose={onClose} title="Walk-in Repair Ticket" maxWidth="max-w-xl">
            <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
                {/* Customer */}
                <div>
                    <label className="block text-xs font-semibold text-outline uppercase mb-1">Customer *</label>
                    <select {...register('customer')} className={inputCls('customer')}>
                        <option value="">— Select customer —</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>{c.username} {c.phone ? `(${c.phone})` : ''}</option>
                        ))}
                    </select>
                    <FieldError name="customer" />
                </div>

                {/* Branch */}
                <div>
                    <label className="block text-xs font-semibold text-outline uppercase mb-1">Branch *</label>
                    <select {...register('branch')} className={inputCls('branch')}>
                        <option value="">— Select branch —</option>
                        {localBranches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                        ))}
                    </select>
                    <FieldError name="branch" />
                </div>

                {/* Device */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Category</label>
                        <select {...register('device_category')} className={inputCls('device_category')}>
                            {DEVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Priority</label>
                        <select {...register('priority')} className={inputCls('priority')}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Brand *</label>
                        <input {...register('device_brand')} placeholder="Apple, Samsung…" className={inputCls('device_brand')} />
                        <FieldError name="device_brand" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Model *</label>
                        <input {...register('device_model')} placeholder="iPhone 15…" className={inputCls('device_model')} />
                        <FieldError name="device_model" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-outline uppercase mb-1">Serial / IMEI</label>
                    <input {...register('device_serial')} placeholder="Optional" className={inputCls('device_serial')} />
                </div>

                {/* Issue */}
                <div>
                    <label className="block text-xs font-semibold text-outline uppercase mb-1">Issue Reported *</label>
                    <textarea {...register('issue_reported')} rows={3} placeholder="Describe the problem…" className={inputCls('issue_reported')} />
                    <FieldError name="issue_reported" />
                </div>

                {/* Costs */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Est. Cost (₹)</label>
                        <input type="number" step="0.01" min="0" {...register('estimated_cost')} className={inputCls('estimated_cost')} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-outline uppercase mb-1">Advance Paid (₹)</label>
                        <input type="number" step="0.01" min="0" {...register('advance_paid')} className={inputCls('advance_paid')} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold text-sm disabled:opacity-60 active:scale-95 transition-all"
                >
                    {isSubmitting ? 'Creating…' : 'Create Walk-in Ticket'}
                </button>
            </form>
        </Modal>
    );
}
