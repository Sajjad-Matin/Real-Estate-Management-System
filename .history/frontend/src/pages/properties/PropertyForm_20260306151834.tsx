import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { propertiesApi, type CreatePropertyData } from '../../api/properties';
import { agenciesApi } from '../../api/agencies';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole, type Agency } from '../../types';

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formData, setFormData] = useState<CreatePropertyData>({
    title: '',
    address: '',
    region: '',
    cadastralNo: '',
    agencyId: user?.agencyId || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Only fetch agencies if SUPER_ADMIN
    if (user?.role === UserRole.SUPER_ADMIN) {
      fetchAgencies();
    }
    
    if (isEdit && id) {
      fetchProperty(id);
    }
  }, [id, isEdit, user?.role]);

  const fetchAgencies = async () => {
    try {
      const response = await agenciesApi.getAll({ limit: 100 });
      setAgencies(response.data);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    }
  };

  const fetchProperty = async (propertyId: string) => {
    try {
      const property = await propertiesApi.getOne(propertyId);
      setFormData({
        title: property.title,
        address: property.address,
        region: property.region,
        cadastralNo: property.cadastralNo || '',
        agencyId: property.agencyId,
      });
    } catch (error) {
      console.error('Failed to fetch property:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEdit && id) {
        await propertiesApi.update(id, formData);
      } else {
        await propertiesApi.create(formData);
      }
      navigate('/properties');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title={isEdit ? 'Edit Property' : 'Create Property'}>
      <div className="p-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/properties')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Button>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <Input
              label="Property Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              placeholder="e.g., Villa in Wazir Akbar Khan"
              required
            />

            <Input
              label="Address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
              placeholder="e.g., Street 15, House 234"
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

            <Input
              label="Cadastral Number (Optional)"
              type="text"
              value={formData.cadastralNo}
              onChange={(e) => setFormData({ ...formData, cadastralNo: e.target.value })}
              error={errors.cadastralNo}
              placeholder="e.g., CAD-2024-001"
            />

            {user?.role === UserRole.SUPER_ADMIN && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Agency <span className="text-danger-600">*</span>
                </label>
                <select
                  value={formData.agencyId}
                  onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                  className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select an agency</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} ({agency.licenseNumber})
                    </option>
                  ))}
                </select>
                {errors.agencyId && (
                  <p className="mt-1 text-sm text-danger-600">{errors.agencyId}</p>
                )}
              </div>
            )}

            {user?.role === UserRole.AGENCY_ADMIN && user.agency && (
              <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 text-info-800 dark:text-info-200 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  This property will be registered under: <strong>{user.agency.name}</strong>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex-1"
              >
                {isEdit ? 'Update Property' : 'Create Property'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/properties')}
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

export default PropertyForm;