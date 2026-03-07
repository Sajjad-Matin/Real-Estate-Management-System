import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { transactionsApi } from '../../api/transactions';
import {  VerificationStatus, TradeType, type Transaction } from '../../types';
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const VerificationQueue = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>(VerificationStatus.APPROVED);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'oldest' | 'newest' | 'price'>('oldest');

  useEffect(() => {
    fetchPendingTransactions();
  }, [sortBy]);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsApi.getAll({
        status: VerificationStatus.PENDING,
        limit: 50,
        sortBy: sortBy === 'price' ? 'price' : 'createdAt',
        sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch pending transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedTransaction) return;
    try {
      setActionLoading(true);
      await transactionsApi.verify(selectedTransaction.id, {
        status: verifyStatus,
        remarks: remarks || undefined,
      });
      setShowVerifyModal(false);
      setSelectedTransaction(null);
      setRemarks('');
      fetchPendingTransactions();
    } catch (error) {
      console.error('Failed to verify transaction:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openVerifyModal = (transaction: Transaction, status: VerificationStatus) => {
    setSelectedTransaction(transaction);
    setVerifyStatus(status);
    setShowVerifyModal(true);
  };

  const getPriorityLevel = (createdAt: string): 'high' | 'medium' | 'low' => {
    const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursAgo >= 48) return 'high';
    if (hoursAgo >= 24) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-danger-500';
      case 'medium':
        return 'border-warning-500';
      case 'low':
        return 'border-info-500';
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="info">Low Priority</Badge>;
    }
  };

  const getTradeTypeIcon = (type: TradeType) => {
    const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold";
    switch (type) {
      case TradeType.SALE:
        return <div className={`${baseClasses} bg-success-600`}>S</div>;
      case TradeType.RENT:
        return <div className={`${baseClasses} bg-primary-600`}>R</div>;
      case TradeType.TRANSFER:
        return <div className={`${baseClasses} bg-warning-600`}>T</div>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(price);
  };

  const highPriorityCount = transactions.filter(t => getPriorityLevel(t.createdAt) === 'high').length;
  const mediumPriorityCount = transactions.filter(t => getPriorityLevel(t.createdAt) === 'medium').length;

  return (
    <MainLayout 
      title="Verification Queue" 
      subtitle={`${transactions.length} transactions pending verification`}
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Queue</p>
                <p className="text-3xl font-bold text-primary mt-2">{transactions.length}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">High Priority</p>
                <p className="text-3xl font-bold text-primary mt-2">{highPriorityCount}</p>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <AlertCircle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Medium Priority</p>
                <p className="text-3xl font-bold text-primary mt-2">{mediumPriorityCount}</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Avg. Wait Time</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {transactions.length > 0
                    ? Math.round(
                        transactions.reduce(
                          (acc, t) => acc + (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60),
                          0
                        ) / transactions.length
                      )
                    : 0}h
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <Clock className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sort Controls */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Filter className="w-4 h-4" />
              <span>Sort by:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'oldest'
                    ? 'bg-primary-600 text-white'
                    : 'bg-elevated text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Oldest First
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-primary-600 text-white'
                    : 'bg-elevated text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'price'
                    ? 'bg-primary-600 text-white'
                    : 'bg-elevated text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Highest Value
              </button>
            </div>
          </div>
        </Card>

        {/* Queue List */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading queue...</p>
            </div>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">All Caught Up!</h3>
              <p className="text-secondary">No pending transactions to verify at the moment.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const priority = getPriorityLevel(transaction.createdAt);
              return (
                <Card
                  key={transaction.id}
                  className={`border-l-4 ${getPriorityColor(priority)} hover:shadow-lg transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Trade Type Icon */}
                    <div className="flex-shrink-0">
                      {getTradeTypeIcon(transaction.tradeType)}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-1">
                            {transaction.property?.title || 'Property'}
                          </h3>
                          <p className="text-sm text-secondary">
                            {transaction.property?.address} • {transaction.property?.region}
                          </p>
                        </div>
                        {getPriorityBadge(priority)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-secondary">Transaction ID</p>
                          <p className="text-sm font-mono text-primary">#{transaction.id.slice(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary">Price</p>
                          <p className="text-sm font-bold text-primary">{formatPrice(transaction.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary">Buyer</p>
                          <p className="text-sm text-primary truncate">{transaction.buyerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-secondary">Seller</p>
                          <p className="text-sm text-primary truncate">{transaction.sellerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-tertiary">
                          <span>Agency: {transaction.agency?.name}</span>
                          <span>•</span>
                          <span>
                            Submitted {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVerifyModal(transaction, VerificationStatus.REJECTED);
                            }}
                            className="text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button
                            variant="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVerifyModal(transaction, VerificationStatus.APPROVED);
                            }}
                            className="text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/transactions/${transaction.id}`);
                            }}
                            className="text-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedTransaction(null);
          setRemarks('');
        }}
        title={verifyStatus === VerificationStatus.APPROVED ? 'Approve Transaction' : 'Reject Transaction'}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {/* Transaction Summary */}
            <div className="bg-elevated p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Property:</span>
                  <span className="text-primary font-medium">{selectedTransaction.property?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Type:</span>
                  <span className="text-primary capitalize">{selectedTransaction.tradeType.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Price:</span>
                  <span className="text-primary font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(selectedTransaction.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Buyer:</span>
                  <span className="text-primary">{selectedTransaction.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Seller:</span>
                  <span className="text-primary">{selectedTransaction.sellerName}</span>
                </div>
              </div>
            </div>

            <p className="text-secondary">
              {verifyStatus === VerificationStatus.APPROVED
                ? 'Are you sure you want to approve this transaction? This will mark it as verified and complete.'
                : 'Are you sure you want to reject this transaction? Please provide a reason below.'}
            </p>

            <Input
              label={verifyStatus === VerificationStatus.REJECTED ? 'Rejection Reason (Required)' : 'Remarks (Optional)'}
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                verifyStatus === VerificationStatus.REJECTED
                  ? 'e.g., Invalid documentation, missing signatures...'
                  : 'Add any notes...'
              }
              required={verifyStatus === VerificationStatus.REJECTED}
            />

            <div className="flex gap-3">
              <Button
                variant={verifyStatus === VerificationStatus.APPROVED ? 'success' : 'danger'}
                onClick={handleVerify}
                isLoading={actionLoading}
                disabled={verifyStatus === VerificationStatus.REJECTED && !remarks.trim()}
                className="flex-1"
              >
                {verifyStatus === VerificationStatus.APPROVED ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve Transaction
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Transaction
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedTransaction(null);
                  setRemarks('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default VerificationQueue;