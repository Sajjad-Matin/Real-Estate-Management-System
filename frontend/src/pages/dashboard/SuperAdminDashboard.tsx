import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import { Building2, Home, FileText, Users, Ban, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <MainLayout 
      title="Ministry Overview" 
      subtitle="Real-time administrative command and control center" 
      showExport
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/properties')}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Total Properties
                </p>
                <h3 className="text-3xl font-bold text-primary mt-2">8,432</h3>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Home className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agencies')}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Active Agencies
                </p>
                <h3 className="text-3xl font-bold text-primary mt-2">1,284</h3>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <Building2 className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Banned Agencies
                </p>
                <h3 className="text-3xl font-bold text-primary mt-2">12</h3>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <Ban className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/transactions')}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Pending Verifications
                </p>
                <h3 className="text-3xl font-bold text-primary mt-2">42</h3>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                  Total Inspectors
                </p>
                <h3 className="text-3xl font-bold text-primary mt-2">156</h3>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <Users className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Trade Transaction Trends */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-primary">Trade Transaction Trends</h3>
              <p className="text-sm text-secondary mt-1">Monthly volume analysis across key sectors</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                <span className="text-secondary">Sale</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-600 rounded-full"></div>
                <span className="text-secondary">Rent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning-600 rounded-full"></div>
                <span className="text-secondary">Transfer</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border border-primary rounded-lg bg-elevated">
            <p className="text-secondary">Chart placeholder - Last 6 months</p>
          </div>
        </Card>

        {/* System Audit Log */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">System Audit Log</h3>
            <button 
              onClick={() => navigate('/audit-log')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-primary">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">Super Admin Login</p>
                <p className="text-xs text-secondary mt-1">Credentials verified for Amin Rezai</p>
              </div>
              <span className="text-xs text-tertiary">08:45 AM - SYSTEM</span>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-primary">
              <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <FileText className="w-5 h-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">Certificate Renewal</p>
                <p className="text-xs text-secondary mt-1">Global Import Inc. updated credentials</p>
              </div>
              <span className="text-xs text-tertiary">09:12 AM - AGENCY</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;