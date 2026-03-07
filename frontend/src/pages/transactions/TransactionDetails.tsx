import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { transactionsApi } from '../../api/transactions';
import { VerificationStatus, UserRole, type Transaction } from '../../types';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, MapPin, Building2, FileText, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

const TransactionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>(VerificationStatus.APPROVED);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTransaction(id);
    }
  }, [id]);

  const fetchTransaction = async (transactionId: string) => {
    try {
      setLoading(true);
      const data = await transactionsApi.getOne(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await transactionsApi.delete(id);
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleVerify = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await transactionsApi.verify(id, {
        status: verifyStatus,
        remarks: remarks || undefined,
      });
      setShowVerifyModal(false);
      fetchTransaction(id);
    } catch (error) {
      console.error('Failed to verify transaction:', error);
    } finally {
      setActionLoading(false);
      setRemarks('');
    }
  };

  const canEdit = () => {
    if (transaction?.status !== VerificationStatus.PENDING) return false;
    if (user?.role === UserRole.SUPER_ADMIN) return true;
    if (user?.role === UserRole.AGENCY_ADMIN && transaction?.agencyId === user.agencyId) return true;
    return false;
  };

  const canDelete = () => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  const canVerify = () => {
    return user?.role === UserRole.INSPECTOR && transaction?.status === VerificationStatus.PENDING;
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case VerificationStatus.PENDING:
        return <Badge variant="warning">Pending Verification</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <MainLayout title="Transaction Details">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!transaction) {
    return (
      <MainLayout title="Transaction Not Found">
        <div className="p-6">
          <Card>
            <p className="text-center text-secondary py-12">Transaction not found</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Transaction #${transaction.id.slice(0, 8)}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => navigate('/transactions')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Transactions
          </Button>

          <div className="flex gap-3">
            {canVerify() && (
              <>
                <Button
                  variant="success"
                  onClick={() => {
                    setVerifyStatus(VerificationStatus.APPROVED);
                    setShowVerifyModal(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setVerifyStatus(VerificationStatus.REJECTED);
                    setShowVerifyModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}

            {canEdit() && (
              <Button
                variant="primary"
                onClick={() => navigate(`/transactions/${id}/edit`)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}

            {canDelete() && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">Transaction Details</h3>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="space-y-6">
              {/* Property Info */}
              <div className="pb-6 border-b border-primary">
                <h4 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Property Information
                </h4>
                <div className="space-y-2">
                  <p className="text-primary font-medium">{transaction.property?.title}</p>
                  <p className="text-sm text-secondary">{transaction.property?.address}</p>
                  <p className="text-sm text-secondary">Region: {transaction.property?.region}</p>
                  {transaction.property?.cadastralNo && (
                    <p className="text-sm text-secondary font-mono">
                      Cadastral: {transaction.property.cadastralNo}
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction Info */}
              <div className="pb-6 border-b border-primary">
                <h4 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Transaction Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-secondary">Trade Type</label>
                    <p className="text-primary font-medium capitalize">{transaction.tradeType.toLowerCase()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-secondary">Price</label>
                    <p className="text-primary font-bold text-lg">{formatPrice(transaction.price)}</p>
                  </div>
                </div>
              </div>

              {/* Parties Info */}
              <div className="pb-6 border-b border-primary">
                <h4 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Parties Involved
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-secondary uppercase tracking-wider">Buyer</label>
                    <p className="text-primary font-medium mt-1">{transaction.buyerName}</p>
                    {transaction.buyerIdNo && (
                      <p className="text-sm text-secondary font-mono mt-1">ID: {transaction.buyerIdNo}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-secondary uppercase tracking-wider">Seller</label>
                    <p className="text-primary font-medium mt-1">{transaction.sellerName}</p>
                    {transaction.sellerIdNo && (
                      <p className="text-sm text-secondary font-mono mt-1">ID: {transaction.sellerIdNo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Agency Info */}
              <div className="pb-6 border-b border-primary">
                <h4 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Agency Information
                </h4>
                <p className="text-primary font-medium">{transaction.agency?.name || 'N/A'}</p>
                {transaction.agency?.licenseNumber && (
                  <p className="text-sm text-secondary font-mono mt-1">
                    License: {transaction.agency.licenseNumber}
                  </p>
                )}
              </div>

              {/* Verification History */}
              {transaction.verifications && transaction.verifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-3">Verification History</h4>
                  <div className="space-y-3">
                    {transaction.verifications.map((verification) => (
                      <div key={verification.id} className="bg-elevated p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          {getStatusBadge(verification.status)}
                          <span className="text-xs text-tertiary">
                            {format(new Date(verification.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {verification.remarks && (
                          <p className="text-sm text-secondary mt-2">{verification.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-secondary">Created</label>
                  <p className="text-primary mt-1">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">Last Updated</label>
                  <p className="text-primary mt-1">
                    {format(new Date(transaction.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Transaction ID</h4>
              <p className="text-lg font-mono font-bold text-primary">#{transaction.id.slice(0, 8)}</p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Transaction Value</h4>
              <p className="text-2xl font-bold text-primary">{formatPrice(transaction.price)}</p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Current Status</h4>
              <div className="mt-2">{getStatusBadge(transaction.status)}</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Transaction"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={actionLoading}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title={verifyStatus === VerificationStatus.APPROVED ? 'Approve Transaction' : 'Reject Transaction'}
      >
        <div className="space-y-4">
          <p className="text-secondary">
            {verifyStatus === VerificationStatus.APPROVED
              ? 'Are you sure you want to approve this transaction?'
              : 'Are you sure you want to reject this transaction?'}
          </p>

          <Input
            label="Remarks (Optional)"
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any notes or reasons..."
          />

          <div className="flex gap-3">
            <Button
              variant={verifyStatus === VerificationStatus.APPROVED ? 'success' : 'danger'}
              onClick={handleVerify}
              isLoading={actionLoading}
              className="flex-1"
            >
              {verifyStatus === VerificationStatus.APPROVED ? 'Approve' : 'Reject'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowVerifyModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default TransactionDetails;