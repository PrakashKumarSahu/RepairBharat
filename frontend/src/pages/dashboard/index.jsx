import { Spinner } from '../../components/ui/Spinner';
import { useUserContext } from '../../services';
import CustomerDashboard from './CustomerDashboard';
import ShopOwnerDashboard from './ShopOwnerDashboard';
import TechnicianDashboard from './TechnicianDashboard';

export default function Dashboard() {
    const { user } = useUserContext();

    if (!user) {
        return <Spinner label="Loading workspace..." />;
    }

    if (user.role === 'customer') return <CustomerDashboard />;
    if (user.role === 'shop_owner') return <ShopOwnerDashboard />;
    if (user.role === 'technician') return <TechnicianDashboard />;

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-error font-bold">Unknown role: {user.role}</p>
        </div>
    );
}
