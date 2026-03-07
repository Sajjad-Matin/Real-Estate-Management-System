import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { propertiesApi } from '../../api/properties';
import {  UserRole, type Property } from '../../types';
import { ArrowLeft, Edit, Trash2, MapPin, Building2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      const data = await propertiesApi.getOne(propertyId);
      setProperty(data);
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await propertiesApi.delete(id);
      navigate('/properties');
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const canEdit = () => {
    if (user?.role === UserRole.SUPER_ADMIN) return true;
    if (user?.role === UserRole.AGENCY_ADMIN && property?.agencyId === user.agencyId) return true;
    return false;
  };

  const canDelete = () => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  if (loading) {
    return (
      <MainLayout title="Property Details">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout title="Property Not Found">
        <div className="p-6">
          <Card>
            <p className="text-center text-secondary py-12">Property not found</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={property.title}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => navigate('/properties')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Button>

          <div className="flex gap-3">
            {canEdit() && (
              <Button
                variant="primary"
                onClick={() => navigate(`/properties/${id}/edit`)}
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
            <h3 className="text-lg font-semibold text-primary mb-4">Property Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary">Cadastral Number</label>
                <p className="text-primary font-mono mt-1">{property.cadastralNo || 'Not assigned'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <p className="text-primary mt-1">{property.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary">Region</label>
                <p className="text-primary mt-1">{property.region}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Agency
                </label>
                <p className="text-primary mt-1">
                  {property.agency?.name || 'N/A'}
                  {property.agency?.licenseNumber && (
                    <span className="text-secondary text-sm ml-2">
                      ({property.agency.licenseNumber})
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-secondary">Created</label>
                  <p className="text-primary mt-1">
                    {format(new Date(property.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">Last Updated</label>
                  <p className="text-primary mt-1">
                    {format(new Date(property.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total Trades
              </h4>
              <p className="text-3xl font-bold text-primary">{property._count?.trades || 0}</p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Ownership Records</h4>
              <p className="text-3xl font-bold text-primary">{property._count?.ownerships || 0}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Property"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Are you sure you want to delete <strong>{property.title}</strong>? This action cannot be undone.
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

export default PropertyDetails;