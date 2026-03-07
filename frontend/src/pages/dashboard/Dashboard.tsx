import { useAuthStore } from '../../stores/authStore';
import MainLayout from '../../components/layout/MainLayout';
import { UserRole } from '../../types';
import AgencyAdminDashboard from './AgencyAdminDashboard';
import InspectorDashboard from './InspectorDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
const Dashboard = () => {
  const { user } = useAuthStore();

  const renderDashboard = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case UserRole.AGENCY_ADMIN:
        return <AgencyAdminDashboard />;
      case UserRole.INSPECTOR:
        return <InspectorDashboard />;
      default:
        return (
          <MainLayout title="Dashboard">
            <div className="p-6">
              <p className="text-secondary">Invalid role</p>
            </div>
          </MainLayout>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;