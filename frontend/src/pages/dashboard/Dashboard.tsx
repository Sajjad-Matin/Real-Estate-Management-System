import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import { Building2, Home, FileText, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-secondary mt-2">
          Welcome back, {user?.fullName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Agencies</h3>
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">156</p>
          <p className="text-sm text-success-600 mt-2">↑ 12% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Properties</h3>
            <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
              <Home className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">3,842</p>
          <p className="text-sm text-success-600 mt-2">↑ 8% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Transactions</h3>
            <div className="p-2 bg-info-100 dark:bg-info-900 rounded-lg">
              <FileText className="w-6 h-6 text-info-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">892</p>
          <p className="text-sm text-tertiary mt-2">This month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Pending</h3>
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <Users className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">23</p>
          <p className="text-sm text-tertiary mt-2">Awaiting verification</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;