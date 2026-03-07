import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { agenciesApi, type SearchAgenciesParams } from '../../api/agencies';
import { AgencyStatus, type Agency } from '../../types';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

const AgenciesList = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgencyStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAgencies();
  }, [search, statusFilter, currentPage]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const params: SearchAgenciesParams = {
        page: currentPage,
        limit: 10,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await agenciesApi.getAll(params);
      setAgencies(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AgencyStatus) => {
    switch (status) {
      case AgencyStatus.ACTIVE:
        return <Badge variant="success">Active</Badge>;
      case AgencyStatus.CLOSED:
        return <Badge variant="warning">Closed</Badge>;
      case AgencyStatus.BANNED:
        return <Badge variant="danger">Banned</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Agencies" subtitle="Manage real estate agencies" showExport>
      <div className="p-6">
        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <Input
                  type="text"
                  placeholder="Search agencies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AgencyStatus | '')}
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value={AgencyStatus.ACTIVE}>Active</option>
                <option value={AgencyStatus.CLOSED}>Closed</option>
                <option value={AgencyStatus.BANNED}>Banned</option>
              </select>

              <Button
                variant="primary"
                onClick={() => navigate('/agencies/create')}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Agency
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading agencies...</p>
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary">No agencies found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow
                      key={agency.id}
                      onClick={() => navigate(`/agencies/${agency.id}`)}
                    >
                      <TableCell className="font-medium text-primary">
                        {agency.name}
                      </TableCell>
                      <TableCell className="font-mono text-secondary">
                        {agency.licenseNumber}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {agency.region}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(agency.status)}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {agency._count?.properties || 0}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {agency._count?.users || 0}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {format(new Date(agency.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-primary">
                  <div className="text-sm text-secondary">
                    Page {currentPage} of {totalPages}
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

export default AgenciesList;