import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AdvancedFilters from '../../components/common/AdvancedFilters';
import SavedFilters from '../../components/common/SavedFilters';
import QuickFilters from '../../components/common/QuickFilters';
import ExportModal from '../../components/common/ExportModal';
import { exportToCSV, exportToExcel } from '../../utils/export';
import { transactionsApi } from '../../api/transactions';
import { Plus, Search, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

const TransactionsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({
    status: searchParams.get('status') || '',
    tradeType: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showExportModal, setShowExportModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [page, filters, search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsApi.getAll({
        page,
        limit,
        search,
        ...filters,
      });

      setTransactions(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      tradeType: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearch('');
    setPage(1);
  };

  const handleExport = (exportFormat: 'csv' | 'excel') => {
    const exportData = transactions.map(transaction => ({
      'Transaction ID': transaction.id.slice(0, 8),
      Property: transaction.property?.title || 'N/A',
      Type: transaction.tradeType,
      Buyer: transaction.buyerName,
      Seller: transaction.sellerName,
      Price: transaction.price,
      Status: transaction.status,
      Agency: transaction.agency?.name || 'N/A',
      'Created Date': format(new Date(transaction.createdAt), 'MMM d, yyyy'),
    }));

    if (exportFormat === 'csv') {
      exportToCSV(exportData, 'transactions');
    } else {
      exportToExcel(exportData, 'transactions', 'Transactions');
    }
  };

  // Advanced filter fields
  const filterFields = [
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
      ],
    },
    {
      name: 'tradeType',
      label: 'Trade Type',
      type: 'select' as const,
      options: [
        { value: 'SALE', label: 'Sale' },
        { value: 'LEASE', label: 'Lease' },
        { value: 'MORTGAGE', label: 'Mortgage' },
      ],
    },
    {
      name: 'minPrice',
      label: 'Min Price',
      type: 'number' as const,
      placeholder: 'Minimum price',
    },
    {
      name: 'maxPrice',
      label: 'Max Price',
      type: 'number' as const,
      placeholder: 'Maximum price',
    },
    {
      name: 'createdAt',
      label: 'Date Range',
      type: 'daterange' as const,
    },
  ];

  // Quick filters
  const quickFilters = [
    {
      label: 'Pending',
      value: { status: 'PENDING' },
      icon: <Clock className="w-4 h-4" />,
      color: 'border-warning-200 dark:border-warning-800 text-warning-700 dark:text-warning-300 hover:border-warning-400 dark:hover:border-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20',
    },
    {
      label: 'Approved',
      value: { status: 'APPROVED' },
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'border-success-200 dark:border-success-800 text-success-700 dark:text-success-300 hover:border-success-400 dark:hover:border-success-600 hover:bg-success-50 dark:hover:bg-success-900/20',
    },
    {
      label: 'Rejected',
      value: { status: 'REJECTED' },
      icon: <XCircle className="w-4 h-4" />,
      color: 'border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 hover:border-danger-400 dark:hover:border-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20',
    },
    {
      label: 'High Value (>$100k)',
      value: { minPrice: '100000' },
      icon: <DollarSign className="w-4 h-4" />,
      color: 'border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    },
  ];

  const canCreateTransaction = user?.role === 'SUPER_ADMIN' || user?.role === 'AGENCY_ADMIN';

  return (
    <>
      <MainLayout
        title="Transactions"
        subtitle="Manage property transactions"
        showExport
        onExport={() => setShowExportModal(true)}
      >
        <div className="p-6 space-y-6">
          {/* Search and Create */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <Input
                  className="pl-10"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {canCreateTransaction && (
              <Button variant="primary" onClick={() => navigate('/transactions/create')}>
                <Plus className="w-5 h-5" />
                New Transaction
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <QuickFilters filters={quickFilters} onSelect={handleApplyFilters} />

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AdvancedFilters
                fields={filterFields}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </div>
            <div>
              <SavedFilters
                category="transactions"
                onApply={handleApplyFilters}
                currentFilters={filters}
              />
            </div>
          </div>

          {/* Rest of your existing transactions list code */}
          {/* ... */}
        </div>
      </MainLayout>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title="Export Transactions"
      />
    </>
  );
};

export default TransactionsList;