import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api-client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const { logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/password', {
        currentPassword,
        newPassword,
      });

      setSuccess(true);

      // Auto-logout and redirect after 3 seconds
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      onClose();
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Password Changed">
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Password Changed Successfully!
          </h3>
          <p className="text-secondary mb-4">
            Your password has been changed. You will be logged out shortly for security.
          </p>
          <p className="text-sm text-tertiary">
            Logging out in 3 seconds...
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
          minLength={8}
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={8}
        />

        <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 text-info-800 dark:text-info-200 px-4 py-3 rounded-lg">
          <p className="text-xs">
            <strong>Password requirements:</strong>
            <br />• At least 8 characters long
            <br />• Different from current password
            <br />• Use a mix of letters, numbers, and symbols
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="flex-1"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;