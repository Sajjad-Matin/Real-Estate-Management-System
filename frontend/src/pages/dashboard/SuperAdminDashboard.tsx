import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import { Building2, Home, Ban, Clock, Users, ArrowRight } from 'lucide-react';
import LineChart from '../../components/charts/LineChart';
import { statsApi } from '../../api/stats';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData] = await Promise.all([
        statsApi.getSuperAdminStats(),
        statsApi.getTransactionTrends(30),
      ]);
      setStats(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Ministry Overview" showExport>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Ministry Overview" showExport>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/properties')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Properties</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats?.totalProperties || 0}
                </p>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Active Agencies</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats?.activeAgencies || 0}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <Building2 className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agencies')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Banned Agencies</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats?.bannedAgencies || 0}
                </p>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <Ban className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/transactions?status=PENDING')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Pending Verifications</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats?.pendingVerifications || 0}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/users?role=INSPECTOR')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Inspectors</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats?.totalInspectors || 0}
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <Users className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction Trends Chart */}
        <Card>
          <div className="h-80">
            <LineChart
              data={trends}
              xKey="date"
              yKey="count"
              title="Transaction Trends (Last 30 Days)"
              color="#2563eb"
            />
          </div>
        </Card>

        {/* System Audit Log Preview */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">Recent System Activity</h3>
            <button
              onClick={() => navigate('/audit-log')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-primary last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">System activity logged</p>
                    <p className="text-xs text-secondary">Recent system event #{i}</p>
                  </div>
                </div>
                <span className="text-xs text-tertiary">Just now</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;