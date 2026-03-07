import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const AgencyAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Agency Dashboard">
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/properties')}
          >
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Total Properties
              </p>
              <h3 className="text-3xl font-bold text-primary">482</h3>
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
              <h3 className="text-3xl font-bold text-primary">14</h3>
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
              <h3 className="text-3xl font-bold text-primary">142</h3>
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
              <h3 className="text-3xl font-bold text-primary">14</h3>
              <p className="text-xs text-danger-600 mt-2">Failed</p>
            </div>
          </Card>
        </div>

        {/* Trade Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-primary mb-6">Trade Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart Placeholder */}
            <div className="flex items-center justify-center h-64 border border-primary rounded-lg bg-elevated">
              <p className="text-secondary">Donut chart placeholder</p>
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-4 bg-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-success-600 rounded-full"></div>
                  <span className="text-sm font-medium text-primary">Sale</span>
                </div>
                <span className="text-2xl font-bold text-primary">84</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
                  <span className="text-sm font-medium text-primary">Rent</span>
                </div>
                <span className="text-2xl font-bold text-primary">52</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-elevated rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-warning-600 rounded-full"></div>
                  <span className="text-sm font-medium text-primary">Transfer</span>
                </div>
                <span className="text-2xl font-bold text-primary">20</span>
              </div>

              <div className="p-4 bg-elevated rounded-lg border-t-2 border-primary">
                <p className="text-xs text-secondary uppercase tracking-wider mb-1">Total Volume</p>
                <p className="text-3xl font-bold text-primary">156</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AgencyAdminDashboard;