import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';

/**
 * CreateBranchModal — shop owner form to register a new physical branch.
 */
const schema = z.object({
    name: z.string().min(2, 'Branch name required'),
    city: z.string().min(1, 'City required'),
    address: z.string().min(5, 'Full address required'),
    phone: z.string().min(10, 'Valid phone number required'),
    specialties: z.string().min(1, 'Add at least one specialty'),
    latitude: z.coerce.number().min(-90).max(90).default(19.076),
    longitude: z.coerce.number().min(-180).max(180).default(72.8777),
    gst_number: z.string().optional().default(''),
});

export function CreateBranchModal({ open, onClose, onSubmit }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            city: 'Mumbai',
            address: '',
            phone: '',
            specialties: 'Mobiles, Laptops, Tablets',
            latitude: 19.076,
            longitude: 72.8777,
            gst_number: '',
        },
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const onValidSubmit = (data) => {
        onSubmit(data);
    };

    const FieldError = ({ name }) =>
        errors[name] ? <p className="text-xs text-red-500 mt-0.5">{errors[name].message}</p> : null;

    const inputCls = (name) =>
        `w-full border ${errors[name] ? 'border-red-400' : 'border-outline-variant'} rounded-lg px-3 py-2 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary`;

    return (
        <Modal open={open} onClose={onClose} title="Register New Branch Location" maxWidth="max-w-lg">
            <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-1">Branch Name *</label>
                    <input
                        {...register('name')}
                        placeholder="e.g. RepairBharat Andheri Service Center"
                        className={inputCls('name')}
                    />
                    <FieldError name="name" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">City *</label>
                        <input
                            {...register('city')}
                            placeholder="Mumbai"
                            className={inputCls('city')}
                        />
                        <FieldError name="city" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Phone *</label>
                        <input
                            {...register('phone')}
                            placeholder="9820098200"
                            className={inputCls('phone')}
                        />
                        <FieldError name="phone" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-1">Full Address *</label>
                    <textarea
                        {...register('address')}
                        rows={2}
                        placeholder="Shop No. 4, Ground Floor, Andheri West, Mumbai..."
                        className={inputCls('address')}
                    />
                    <FieldError name="address" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-1">Specialties (comma-separated)</label>
                    <input
                        {...register('specialties')}
                        placeholder="Mobiles, Laptops, Tablets"
                        className={inputCls('specialties')}
                    />
                    <FieldError name="specialties" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            {...register('latitude')}
                            className={inputCls('latitude')}
                        />
                        <FieldError name="latitude" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            {...register('longitude')}
                            className={inputCls('longitude')}
                        />
                        <FieldError name="longitude" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-1">GST Number</label>
                    <input
                        {...register('gst_number')}
                        placeholder="27AAAAA1111A1Z1"
                        className={`${inputCls('gst_number')} uppercase`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-secondary text-on-secondary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow disabled:opacity-60"
                >
                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                    <span>{isSubmitting ? 'Registering…' : 'Register Branch'}</span>
                </button>
            </form>
        </Modal>
    );
}
