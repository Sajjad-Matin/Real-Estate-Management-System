import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { transactionsApi, type CreateTransactionData } from '../../api/transactions';
import { propertiesApi } from '../../api/properties';
import { agenciesApi } from '../../api/agencies';
import { TradeType, UserRole, type Agency, type Property } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formData, setFormData] = useState<CreateTransactionData>({
    propertyId: '',
    agencyId: user?.agencyId || '',
    tradeType: TradeType.SALE,
    price: 0,
    buyerName: '',
    buyerIdNo: '',
    sellerName: '',
    sellerIdNo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProperties();
    if (user?.role === UserRole.SUPER_ADMIN) {
      fetchAgencies();
    }
    
    if (isEdit && id) {
      fetchTransaction(id);
    }
  }, [id, isEdit, user?.role]);

  const fetchProperties = async () => {
    try {
      const response = await propertiesApi.getAll({ limit: 100 });
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await agenciesApi.getAll({ limit: 100 });
      setAgencies(response.data);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    }
  };

  const fetchTransaction = async (transactionId: string) => {
    try {
      const transaction = await transactionsApi.getOne(transactionId);
      setFormData({
        propertyId: transaction.propertyId,
        agencyId: transaction.agencyId,
        tradeType: transaction.tradeType,
        price: transaction.price,
        buyerName: transaction.buyerName,
        buyerIdNo: transaction.buyerIdNo || '',
        sellerName: transaction.sellerName,
        sellerIdNo: transaction.sellerIdNo || '',
      });
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEdit && id) {
        await transactionsApi.update(id, formData);
      } else {
        await transactionsApi.create(formData);
      }
      navigate('/transactions');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title={isEdit ? 'Edit Transaction' : 'Create Transaction'}>
      <div className="p-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/transactions')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Button>

        <Card className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  Property <span className="text-danger-600">*</span>
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trade Type */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Trade Type <span className="text-danger-600">*</span>
                </label>
                <select
                  value={formData.tradeType}
                  onChange={(e) => setFormData({ ...formData, tradeType: e.target.value as TradeType })}
                  className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value={TradeType.SALE}>Sale</option>
                  <option value={TradeType.RENT}>Rent</option>
                  <option value={TradeType.TRANSFER}>Transfer</option>
                </select>
              </div>

              {/* Price */}
              <Input
                label="Price (USD)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                error={errors.price}
                required
                min="0"
                step="0.01"
              />

              {/* Buyer Name */}
              <Input
                label="Buyer Name"
                type="text"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                error={errors.buyerName}
                required
              />

              {/* Buyer ID Number */}
              <Input
                label="Buyer ID Number (Optional)"
                type="text"
                value={formData.buyerIdNo}
                onChange={(e) => setFormData({ ...formData, buyerIdNo: e.target.value })}
                error={errors.buyerIdNo}
              />

              {/* Seller Name */}
              <Input
                label="Seller Name"
                type="text"
                value={formData.sellerName}
                onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                error={errors.sellerName}
                required
              />

              {/* Seller ID Number */}
              <Input
                label="Seller ID Number (Optional)"
                type="text"
                value={formData.sellerIdNo}
                onChange={(e) => setFormData({ ...formData, sellerIdNo: e.target.value })}
                error={errors.sellerIdNo}
              />

              {/* Agency (SUPER_ADMIN only) */}
              {user?.role === UserRole.SUPER_ADMIN && (
                <div className="md:col-span-2">
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
                </div>
              )}

              {user?.role === UserRole.AGENCY_ADMIN && user.agency && (
                <div className="md:col-span-2 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 text-info-800 dark:text-info-200 px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    This transaction will be registered under: <strong>{user.agency.name}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex-1"
              >
                {isEdit ? 'Update Transaction' : 'Create Transaction'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/transactions')}
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

export default TransactionForm;