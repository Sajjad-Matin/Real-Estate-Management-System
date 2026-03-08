import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { auditLogApi, type AuditLog, type SearchAuditLogsParams, } from '../../api/auditLog';
import { Search, Filter, FileText, User, Calendar, MapPin, Monitor } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogList = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [search, entityFilter, actionFilter, startDate, endDate, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: SearchAuditLogsParams = {
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await auditLogApi.getAll(params);
      setLogs(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return <Badge variant="info">{action}</Badge>;
    }
    if (action.includes('DELETE') || action.includes('BAN') || action.includes('REJECT')) {
      return <Badge variant="danger">{action}</Badge>;
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return <Badge variant="default">{action}</Badge>;
    }
    if (action.includes('APPROVE') || action.includes('VERIFY')) {
      return <Badge variant="success">{action}</Badge>;
    }
    return <Badge variant="default">{action}</Badge>;
  };

  const getEntityIcon = (entity: string) => {
    const baseClasses = "w-8 h-8 rounded-lg flex items-center justify-center";
    switch (entity.toLowerCase()) {
      case 'user':
        return (
          <div className={`${baseClasses} bg-primary-100 dark:bg-primary-900`}>
            <User className="w-4 h-4 text-primary-600" />
          </div>
        );
      case 'agency':
        return (
          <div className={`${baseClasses} bg-info-100 dark:bg-info-900`}>
            <FileText className="w-4 h-4 text-info-600" />
          </div>
        );
      case 'property':
        return (
          <div className={`${baseClasses} bg-success-100 dark:bg-success-900`}>
            <FileText className="w-4 h-4 text-success-600" />
          </div>
        );
      case 'transaction':
        return (
          <div className={`${baseClasses} bg-warning-100 dark:bg-warning-900`}>
            <FileText className="w-4 h-4 text-warning-600" />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 dark:bg-gray-800`}>
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
        );
    }
  };

  const clearFilters = () => {
    setEntityFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  return (
    <MainLayout title="Audit Log" subtitle="System activity and security audit trail" showExport>
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Activities</p>
                <p className="text-3xl font-bold text-primary mt-2">{total}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Today's Activities</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {logs.filter(log => 
                    new Date(log.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <Calendar className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Unique Users</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {new Set(logs.map(log => log.userId)).size}
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <User className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Entities Tracked</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {new Set(logs.map(log => log.entity)).size}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <Monitor className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-secondary" />
              <span className="font-medium text-primary">Filters</span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Entities</option>
                <option value="User">User</option>
                <option value="Agency">Agency</option>
                <option value="Property">Property</option>
                <option value="Transaction">Transaction</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
              </select>

              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />

              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />

              <Button
                variant="secondary"
                onClick={clearFilters}
                className="md:col-span-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary">No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getEntityIcon(log.entity)}
                          <div>
                            <p className="font-medium text-primary">{log.entity}</p>
                            <p className="text-xs text-secondary font-mono">
                              ID: {log.entityId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">
                            {log.user?.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-secondary">{log.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.details && (
                          <div className="max-w-xs">
                            <pre className="text-xs text-secondary overflow-auto">
                              {JSON.stringify(log.details, null, 2).slice(0, 100)}...
                            </pre>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span className="text-sm text-secondary font-mono">
                            {log.ipAddress || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-secondary">
                        {format(new Date(log.createdAt), 'MMM d, yyyy h:mm:ss a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-primary">
                  <div className="text-sm text-secondary">
                    Page {currentPage} of {totalPages} • {total} total logs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default AuditLogList;