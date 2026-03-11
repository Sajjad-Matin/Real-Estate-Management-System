import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import DonutChart from '../../components/charts/DonutChart';
import LineChart from '../../components/charts/LineChart';
import { statsApi } from '../../api/stats';

const DonutChartAny = DonutChart as unknown as any;

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData, distributionData] = await Promise.all([
        statsApi.getAgencyAdminStats(),
        statsApi.getTransactionTrends(30),
        statsApi.getTradeTypeDistribution(),
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setDistribution(distributionData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Agency Dashboard">
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
    <MainLayout title="Agency Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/properties')}
          >
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Total Properties
              </p>
              <h3 className="text-3xl font-bold text-primary">
                {stats?.totalProperties || 0}
              </h3>
              <p className="text-xs text-tertiary mt-2">All Locations</p>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/transactions?status=PENDING')}
          >
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Pending Trades
              </p>
              <h3 className="text-3xl font-bold text-primary">
                {stats?.pendingTransactions || 0}
              </h3>
              <p className="text-xs text-warning-600 mt-2">Verification</p>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/transactions?status=APPROVED')}
          >
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Approved Trades
              </p>
              <h3 className="text-3xl font-bold text-primary">
                {stats?.approvedTransactions || 0}
              </h3>
              <p className="text-xs text-success-600 mt-2">Closed</p>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/transactions?status=REJECTED')}
          >
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Rejected Trades
              </p>
              <h3 className="text-3xl font-bold text-primary">
                {stats?.rejectedTransactions || 0}
              </h3>
              <p className="text-xs text-danger-600 mt-2">Failed</p>
            </div>
          </Card>
        </div>

        {/* Transaction Trends */}
        <Card>
          <div className="h-80">
            <LineChart
              data={trends}
              xKey="date"
              yKey="count"
              title="Transaction Activity (Last 30 Days)"
              color="#10b981"
            />
          </div>
        </Card>

        {/* Trade Distribution */}
        <Card>
          <div className="h-96">
            <DonutChartAny
              data={distribution}
              nameKey="type"
              valueKey="count"
              title="Trade Type Distribution"
              colors={['#10b981', '#3b82f6', '#f59e0b']}
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AgencyAdminDashboard;