import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import {
  transactionsApi,
  type SearchTransactionsParams,
} from "../../api/transactions";
import {
  VerificationStatus,
  TradeType,
  UserRole,
  type Transaction,
} from "../../types";
import { Plus, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "../../stores/authStore";
import { exportToCSV, exportToExcel } from "../../utils/export";
import ExportModal from "../../components/common/ExportModal";

const TransactionsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("");
  const [tradeTypeFilter, setTradeTypeFilter] = useState<TradeType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get status from URL params if exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) {
      setStatusFilter(status as VerificationStatus);
    }
  }, [location.search]);

  useEffect(() => {
    fetchTransactions();
  }, [search, statusFilter, tradeTypeFilter, currentPage]);

  const canCreate =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.AGENCY_ADMIN;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: SearchTransactionsParams = {
        page: currentPage,
        limit: 10,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (tradeTypeFilter) params.tradeType = tradeTypeFilter;

      const response = await transactionsApi.getAll(params);
      setTransactions(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case VerificationStatus.PENDING:
        return <Badge variant="warning">Pending</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTradeTypeBadge = (type: TradeType) => {
    switch (type) {
      case TradeType.SALE:
        return <Badge variant="success">Sale</Badge>;
      case TradeType.RENT:
        return <Badge variant="info">Rent</Badge>;
      case TradeType.TRANSFER:
        return <Badge variant="warning">Transfer</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Count by status
  const pendingCount = transactions.filter(
    (t) => t.status === VerificationStatus.PENDING,
  ).length;
  const approvedCount = transactions.filter(
    (t) => t.status === VerificationStatus.APPROVED,
  ).length;
  const rejectedCount = transactions.filter(
    (t) => t.status === VerificationStatus.REJECTED,
  ).length;

  const handleExport = (exportFormat: "csv" | "excel") => {
    const exportData = transactions.map((transaction) => ({
      "Transaction ID": transaction.id.slice(0, 8),
      Property: transaction.property?.title || "N/A",
      Type: transaction.tradeType,
      Buyer: transaction.buyerName,
      Seller: transaction.sellerName,
      Price: transaction.price,
      Status: transaction.status,
      Agency: transaction.agency?.name || "N/A",
      "Created Date": format(new Date(transaction.createdAt), "MMM d, yyyy"),
    }));

    if (exportFormat === "csv") {
      exportToCSV(exportData, "transactions");
    } else {
      exportToExcel(exportData, "transactions", "Transactions");
    }
  };

  return (
    <>
    <MainLayout
      title="Transactions"
      subtitle="Manage property transactions"
      showExport
      onExport={() => setShowExportModal(true)}
    >
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Total Transactions
                </p>
                <p className="text-3xl font-bold text-primary mt-2">{total}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStatusFilter(VerificationStatus.PENDING)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Pending</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {pendingCount}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <FileText className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStatusFilter(VerificationStatus.APPROVED)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Approved</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {approvedCount}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <FileText className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStatusFilter(VerificationStatus.REJECTED)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Rejected</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {rejectedCount}
                </p>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <FileText className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as VerificationStatus | "")
                }
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value={VerificationStatus.PENDING}>Pending</option>
                <option value={VerificationStatus.APPROVED}>Approved</option>
                <option value={VerificationStatus.REJECTED}>Rejected</option>
              </select>

              <select
                value={tradeTypeFilter}
                onChange={(e) =>
                  setTradeTypeFilter(e.target.value as TradeType | "")
                }
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                <option value={TradeType.SALE}>Sale</option>
                <option value={TradeType.RENT}>Rent</option>
                <option value={TradeType.TRANSFER}>Transfer</option>
              </select>

              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/transactions/create")}
                  className="whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  New Transaction
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary">No transactions found</p>
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/transactions/create")}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Create First Transaction
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      onClick={() =>
                        navigate(`/transactions/${transaction.id}`)
                      }
                    >
                      <TableCell className="font-medium text-primary">
                        {transaction.property?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getTradeTypeBadge(transaction.tradeType)}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {transaction.buyerName}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {transaction.sellerName}
                      </TableCell>
                      <TableCell className="font-mono text-secondary">
                        {formatPrice(transaction.price)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {transaction.agency?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-primary">
                  <div className="text-sm text-secondary">
                    Page {currentPage} of {totalPages} • {total} total
                    transactions
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
