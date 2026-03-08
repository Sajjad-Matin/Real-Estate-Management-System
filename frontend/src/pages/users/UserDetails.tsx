import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { usersApi } from '../../api/users';
import {  UserRole, type User } from '../../types';
import { ArrowLeft, Edit, Trash2, UserCheck, UserX, Mail, Globe, Building2, ShieldCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const data = await usersApi.getOne(userId);
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await usersApi.delete(id);
      navigate('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !user) return;
    try {
      setActionLoading(true);
      if (user.isActive) {
        await usersApi.deactivate(id);
      } else {
        await usersApi.activate(id);
      }
      fetchUser(id);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Badge variant="danger">Super Admin</Badge>;
      case UserRole.AGENCY_ADMIN:
        return <Badge variant="info">Agency Admin</Badge>;
      case UserRole.INSPECTOR:
        return <Badge variant="success">Inspector</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="default">Inactive</Badge>
    );
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <ShieldCheck className="w-8 h-8 text-danger-600" />;
      case UserRole.AGENCY_ADMIN:
        return <Building2 className="w-8 h-8 text-info-600" />;
      case UserRole.INSPECTOR:
        return <Eye className="w-8 h-8 text-success-600" />;
    }
  };

  const canDelete = () => {
    // Can't delete yourself
    if (currentUser?.id === user?.id) return false;
    // Can't delete other super admins
    if (user?.role === UserRole.SUPER_ADMIN) return false;
    return true;
  };

  const canToggleStatus = () => {
    // Can't deactivate yourself
    if (currentUser?.id === user?.id) return false;
    return true;
  };

  if (loading) {
    return (
      <MainLayout title="User Details">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout title="User Not Found">
        <div className="p-6">
          <Card>
            <p className="text-center text-secondary py-12">User not found</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={user.fullName}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>

          <div className="flex gap-3">
            {canToggleStatus() && (
              <Button
                variant={user.isActive ? 'warning' : 'success'}
                onClick={handleToggleStatus}
                isLoading={actionLoading}
              >
                {user.isActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate
                  </>
                )}
              </Button>
            )}

            <Button
              variant="primary"
              onClick={() => navigate(`/users/${id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>

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
            {/* User Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-primary mb-6">
              <div className="p-4 bg-elevated rounded-lg">
                {getRoleIcon(user.role)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-2">{user.fullName}</h3>
                <div className="flex flex-wrap gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.isActive)}
                </div>
              </div>
            </div>

            {/* User Information */}
            <h4 className="text-lg font-semibold text-primary mb-4">User Information</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-primary mt-1">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </label>
                <p className="text-primary mt-1 uppercase">
                  {user.language === 'EN' && 'English'}
                  {user.language === 'FA' && 'Dari/Farsi'}
                  {user.language === 'PS' && 'Pashto'}
                </p>
              </div>

              {user.agency && (
                <div>
                  <label className="text-sm font-medium text-secondary flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Agency
                  </label>
                  <p className="text-primary mt-1 font-medium">{user.agency.name}</p>
                  <p className="text-sm text-secondary font-mono mt-1">
                    License: {user.agency.licenseNumber}
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    {user.agency.address} • {user.agency.region}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-secondary">Created</label>
                  <p className="text-primary mt-1">
                    {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">Last Updated</label>
                  <p className="text-primary mt-1">
                    {format(new Date(user.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Info */}
          <div className="space-y-6">
            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">User ID</h4>
              <p className="text-lg font-mono font-bold text-primary break-all">
                {user.id}
              </p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Account Status</h4>
              <div className="mt-2">{getStatusBadge(user.isActive)}</div>
              <p className="text-xs text-secondary mt-2">
                {user.isActive
                  ? 'User can log in and access the system'
                  : 'User cannot log in to the system'}
              </p>
            </Card>

            <Card>
              <h4 className="text-sm font-medium text-secondary mb-2">Access Level</h4>
              <div className="mt-2">{getRoleBadge(user.role)}</div>
              <p className="text-xs text-secondary mt-2">
                {user.role === UserRole.SUPER_ADMIN && 'Full system access and control'}
                {user.role === UserRole.AGENCY_ADMIN && 'Manage own agency, properties, and transactions'}
                {user.role === UserRole.INSPECTOR && 'Verify transactions and view system data'}
              </p>
            </Card>

            {currentUser?.id === user.id && (
              <Card className="bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-info-800 dark:text-info-200">
                      This is you!
                    </p>
                    <p className="text-xs text-info-600 dark:text-info-300 mt-1">
                      You cannot delete or deactivate your own account.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Are you sure you want to delete <strong>{user.fullName}</strong>? This action cannot be undone.
          </p>
          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Warning:</strong> This will permanently remove the user and all associated data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={actionLoading}
              className="flex-1"
            >
              Delete User
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

export default UserDetails;