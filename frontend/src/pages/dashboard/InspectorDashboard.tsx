import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ClipboardCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InspectorDashboard = () => {
  const navigate = useNavigate();

  return (
    <MainLayout 
      title="Inspector Dashboard" 
      subtitle="Monitoring Trade & Real Estate Compliance"
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                  Pending Verifications
                </p>
                <h3 className="text-5xl font-bold text-primary">124</h3>
                <p className="text-xs text-success-600 mt-2">↑5% increase since yesterday</p>
              </div>
              <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <ClipboardCheck className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                  Today's Completed
                </p>
                <h3 className="text-5xl font-bold text-primary">18</h3>
                <p className="text-xs text-danger-600 mt-2">↓2% vs daily average</p>
              </div>
              <div className="p-4 bg-success-100 dark:bg-success-900 rounded-lg">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Verified Trades */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">Recent Verified Trades</h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
                      Trade ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
                      Property Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary">
                  <tr className="hover:bg-elevated cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-primary">#TRD-9842</td>
                    <td className="px-4 py-3 text-sm text-secondary">Oakwood Heights Unit 12</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Verified</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">Oct 24, 2:45 PM</td>
                  </tr>
                  <tr className="hover:bg-elevated cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-primary">#TRD-9841</td>
                    <td className="px-4 py-3 text-sm text-secondary">Golden Plaza Commercial</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Verified</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">Oct 24, 1:12 PM</td>
                  </tr>
                  <tr className="hover:bg-elevated cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-primary">#TRD-9838</td>
                    <td className="px-4 py-3 text-sm text-secondary">Seaview Apartment B3</td>
                    <td className="px-4 py-3">
                      <Badge variant="danger">Rejected</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">Oct 24, 10:30 AM</td>
                  </tr>
                  <tr className="hover:bg-elevated cursor-pointer">
                    <td className="px-4 py-3 text-sm font-mono text-primary">#TRD-9835</td>
                    <td className="px-4 py-3 text-sm text-secondary">Blueberry Estate Plot 4</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Verified</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">Oct 23, 4:55 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Priority Queue */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">Priority Queue</h3>
              <Badge variant="info">Oldest Pending</Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div 
                className="p-4 bg-elevated rounded-lg border-l-4 border-danger-500 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/verification-queue')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-semibold text-primary">#TRD-9712</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-secondary mb-1">Residential Plot (Transfer)</p>
                <p className="text-xs text-danger-600 font-medium">Pending for 48h+</p>
              </div>

              <div 
                className="p-4 bg-elevated rounded-lg border-l-4 border-warning-500 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/verification-queue')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-semibold text-primary">#TRD-9745</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-secondary mb-1">Luxury Penthouse Sale</p>
                <p className="text-xs text-warning-600 font-medium">Pending for 36h</p>
              </div>

              <div 
                className="p-4 bg-elevated rounded-lg border-l-4 border-info-500 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/verification-queue')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-semibold text-primary">#TRD-9788</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-secondary mb-1">Warehouse Lease Agreement</p>
                <p className="text-xs text-info-600 font-medium">Pending for 22h</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/verification-queue')}
              className="w-full"
            >
              Start Verifying Queue
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default InspectorDashboard;