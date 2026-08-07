import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { usersApi, type CreateUserData } from "../../api/users";
import { agenciesApi } from "../../api/agencies";
import { UserRole, Language, type Agency } from "../../types";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formData, setFormData] = useState<CreateUserData>({
    fullName: "",
    email: "",
    password: "",
    role: UserRole.INSPECTOR,
    language: Language.EN,
    agencyId: undefined,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAgencies();

    if (isEdit && id) {
      fetchUser(id);
    }
  }, [id, isEdit]);

  const fetchAgencies = async () => {
    try {
      const response = await agenciesApi.getAll({ limit: 100 });
      setAgencies(response.data);
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      const user = await usersApi.getOne(userId);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        password: "", // Don't populate password on edit
        role: user.role,
        language: user.language,
        agencyId: user.agencyId || undefined,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isEdit && id) {
        // Don't send password on edit if empty
        const updateData = { ...formData };
        delete (updateData as any).password;
        await usersApi.update(id, updateData);
      } else {
        await usersApi.create(formData);
      }
      navigate("/users");
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const requiresAgency = formData.role === UserRole.AGENCY_ADMIN;

  return (
    <MainLayout title={isEdit ? "Edit User" : "Create User"}>
      <div className="p-6">
        <Button
          variant="secondary"
          onClick={() => navigate("/users")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                error={errors.fullName}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                required
              />

              {!isEdit && (
                <div className="md:col-span-2">
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={errors.password}
                    required
                    placeholder="Minimum 8 characters"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Role <span className="text-danger-600">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  )}
                  <option value={UserRole.AGENCY_ADMIN}>Agency Admin</option>
                  <option value={UserRole.INSPECTOR}>Inspector</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Language <span className="text-danger-600">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      language: e.target.value as Language,
                    })
                  }
                  className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value={Language.EN}>English</option>
                  <option value={Language.FA}>Dari/Farsi</option>
                  <option value={Language.PS}>Pashto</option>
                </select>
              </div>

              {requiresAgency && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Agency <span className="text-danger-600">*</span>
                  </label>
                  <select
                    value={formData.agencyId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agencyId: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required={requiresAgency}
                  >
                    <option value="">Select an agency</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name} ({agency.licenseNumber})
                      </option>
                    ))}
                  </select>
                  {errors.agencyId && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.agencyId}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 bg-base border-primary rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-primary">
                    Active User
                  </span>
                </label>
                <p className="text-xs text-secondary mt-1">
                  Inactive users cannot log in to the system
                </p>
              </div>
            </div>

            {requiresAgency && !formData.agencyId && (
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Agency Required</p>
                  <p className="text-xs mt-1">
                    Agency Admin users must be assigned to an agency.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex-1"
              >
                {isEdit ? "Update User" : "Create User"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/users")}
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

export default UserForm;
