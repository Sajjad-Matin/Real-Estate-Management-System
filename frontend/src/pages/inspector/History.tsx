import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { transactionsApi } from '../../api/transactions';
import {  VerificationStatus, type Transaction } from '../../types';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter, currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await transactionsApi.getAll({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });

      // Filter out pending transactions (only show verified ones)
      const verifiedTransactions = response.data.filter(
        (t) => t.status !== VerificationStatus.PENDING
      );

      setTransactions(verifiedTransactions);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return null;
    }
  };

  const approvedCount = transactions.filter((t) => t.status === VerificationStatus.APPROVED).length;
  const rejectedCount = transactions.filter((t) => t.status === VerificationStatus.REJECTED).length;

  return (
    <MainLayout title="Verification History" subtitle="View your verification activity">
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Verified</p>
                <p className="text-3xl font-bold text-primary mt-2">{transactions.length}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Approved</p>
                <p className="text-3xl font-bold text-primary mt-2">{approvedCount}</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Rejected</p>
                <p className="text-3xl font-bold text-primary mt-2">{rejectedCount}</p>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <XCircle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <Input
                  type="text"
                  placeholder="Search history..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | '')}
              className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Verified</option>
              <option value={VerificationStatus.APPROVED}>Approved Only</option>
              <option value={VerificationStatus.REJECTED}>Rejected Only</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary">No verification history found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    >
                      <TableCell className="font-mono text-primary">
                        #{transaction.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {transaction.property?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="text-secondary">{transaction.buyerName}</TableCell>
                      <TableCell className="text-secondary">{transaction.sellerName}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-secondary">
                        {format(new Date(transaction.updatedAt), 'MMM d, yyyy h:mm a')}
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

export default History;