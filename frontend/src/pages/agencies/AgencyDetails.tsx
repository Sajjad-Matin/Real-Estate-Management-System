import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { agenciesApi } from '../../api/agencies';
import { AgencyStatus, type Agency } from '../../types';
import { ArrowLeft, Edit, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const AgencyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgency(id);
    }
  }, [id]);

  const fetchAgency = async (agencyId: string) => {
    try {
      setLoading(true);
      const data = await agenciesApi.getOne(agencyId);
      setAgency(data);
    } catch (error) {
      console.error('Failed to fetch agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await agenciesApi.delete(id);
      navigate('/agencies');
    } catch (error) {
      console.error('Failed to delete agency:', error);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (action: 'ban' | 'close' | 'activate') => {
    if (!id) return;
    try {
      setActionLoading(true);
      if (action === 'ban') await agenciesApi.ban(id);
      else if (action === 'close') await agenciesApi.close(id);
      else await agenciesApi.activate(id);
      
      fetchAgency(id);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(false);
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
    }
  };

  if (loading) {
    return (
      <MainLayout title="Agency Details">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!agency) {
    return (
      <MainLayout title="Agency Not Found">
        <div className="p-6">
          <Card>
            <p className="text-center text-secondary py-12">Agency not found</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={agency.name}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => navigate('/agencies')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Agencies
          </Button>

          <div className="flex gap-3">
            {agency.status === AgencyStatus.ACTIVE && (
              <>
                <Button
                  variant="warning"
                  onClick={() => handleStatusChange('close')}
                  isLoading={actionLoading}
                >
                  <XCircle className="w-4 h-4" />
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange('ban')}
                  isLoading={actionLoading}
                >
                  <Ban className="w-4 h-4" />
                  Ban
                </Button>
              </>
            )}

            {agency.status !== AgencyStatus.ACTIVE && (
              <Button
                variant="success"
                onClick={() => handleStatusChange('activate')}
                isLoading={actionLoading}
              >
                <CheckCircle className="w-4 h-4" />
                Activate
              </Button>
            )}

            <Button
              variant="primary"
              onClick={() => navigate(`/agencies/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-primary mb-4">Agency Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary">License Number</label>
                <p className="text-primary font-mono mt-1">{agency.licenseNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary">Address</label>
                <p className="text-primary mt-1">{agency.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary">Region</label>
                <p className="text-primary mt-1">{agency.region}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary">Status</label>
                <div className="mt-1">{getStatusBadge(agency.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-secondary">Created</label>
                  <p className="text-primary mt-1">
                    {format(new Date(agency.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">Last Updated</label>
                  <p className="text-primary mt-1">
                    {format(new Date(agency.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Total Users</h4>
              <p className="text-3xl font-bold text-primary">{agency._count?.users || 0}</p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Total Properties</h4>
              <p className="text-3xl font-bold text-primary">{agency._count?.properties || 0}</p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Total Transactions</h4>
              <p className="text-3xl font-bold text-primary">{agency._count?.tradeTransactions || 0}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Agency"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Are you sure you want to delete <strong>{agency.name}</strong>? This action cannot be undone.
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
    </MainLayout>
  );
};

export default AgencyDetails;