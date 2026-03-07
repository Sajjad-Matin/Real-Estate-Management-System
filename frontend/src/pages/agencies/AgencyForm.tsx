import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { agenciesApi, type CreateAgencyData } from '../../api/agencies';
import { AgencyStatus } from '../../types';
import { ArrowLeft } from 'lucide-react';

const AgencyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAgencyData>({
    name: '',
    licenseNumber: '',
    address: '',
    region: '',
    status: AgencyStatus.ACTIVE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchAgency(id);
    }
  }, [id, isEdit]);

  const fetchAgency = async (agencyId: string) => {
    try {
      const agency = await agenciesApi.getOne(agencyId);
      setFormData({
        name: agency.name,
        licenseNumber: agency.licenseNumber,
        address: agency.address,
        region: agency.region,
        status: agency.status,
      });
    } catch (error) {
      console.error('Failed to fetch agency:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEdit && id) {
        await agenciesApi.update(id, formData);
      } else {
        await agenciesApi.create(formData);
      }
      navigate('/agencies');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title={isEdit ? 'Edit Agency' : 'Create Agency'}>
      <div className="p-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/agencies')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agencies
        </Button>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <Input
              label="Agency Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Input
              label="License Number"
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              error={errors.licenseNumber}
              required
            />

            <Input
              label="Address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
              required
            />

            <Input
              label="Region"
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              error={errors.region}
              placeholder="e.g., Kabul, Herat, Kandahar"
              required
            />

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AgencyStatus })}
                className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={AgencyStatus.ACTIVE}>Active</option>
                <option value={AgencyStatus.CLOSED}>Closed</option>
                <option value={AgencyStatus.BANNED}>Banned</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex-1"
              >
                {isEdit ? 'Update Agency' : 'Create Agency'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/agencies')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AgencyForm;