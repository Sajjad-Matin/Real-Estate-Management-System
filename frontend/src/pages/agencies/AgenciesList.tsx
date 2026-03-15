import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ Add this
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ExportModal from "../../components/common/ExportModal";
import { exportToCSV, exportToExcel } from "../../utils/export";
import { agenciesApi } from "../../api/agencies";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Ban,
  Building2,
  Users,
  Home,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

const AgenciesList = () => {
  const { t } = useTranslation(); // ✅ Add this
  const navigate = useNavigate();

  type AgencyStatus = "ACTIVE" | "CLOSED" | "BANNED";

  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgencyStatus | "">("");
  const [showExportModal, setShowExportModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchAgencies();
  }, [page, search, statusFilter]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await agenciesApi.getAll({
        page,
        limit,
        search,
        status: statusFilter || undefined,
      });

      setAgencies(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (fileFormat: "csv" | "excel") => {
    const exportData = agencies.map((agency) => ({
      [t("agencies.name")]: agency.name,
      [t("agencies.licenseNumber")]: agency.licenseNumber,
      [t("agencies.address")]: agency.address,
      [t("agencies.region")]: agency.region,
      [t("agencies.status")]: agency.status,
      [t("agencies.totalUsers")]: agency._count?.users || 0,
      [t("agencies.totalProperties")]: agency._count?.properties || 0,
      [t("agencies.totalTransactions")]: agency._count?.tradeTransactions || 0,
      [t("agencies.createdDate")]: format(
        new Date(agency.createdAt),
        "MMM d, yyyy",
      ),
    }));

    if (fileFormat === "csv") {
      exportToCSV(exportData, "agencies");
    } else {
      exportToExcel(exportData, "agencies", t("agencies.title"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("agencies.confirmDelete"))) return;

    try {
      await agenciesApi.delete(id);
      fetchAgencies();
    } catch (error) {
      console.error("Failed to delete agency:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE:
        "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
      BANNED:
        "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200",
      CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };

    const labels = {
      ACTIVE: t("common.active"),
      BANNED: t("agencies.banned"),
      CLOSED: t("agencies.closed"),
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading && agencies.length === 0) {
    return (
      <MainLayout title={t("agencies.title")} subtitle={t("agencies.subtitle")}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary">{t("common.loading")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        title={t("agencies.title")}
        subtitle={t("agencies.subtitle")}
        showExport
        onExport={() => setShowExportModal(true)}
      >
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    {t("agencies.title")}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {agencies.length}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    {t("common.active")}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {agencies.filter((a) => a.status === "ACTIVE").length}
                  </p>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                  <Building2 className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    {t("agencies.banned")}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {agencies.filter((a) => a.status === "BANNED").length}
                  </p>
                </div>
                <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                  <Ban className="w-6 h-6 text-danger-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    {t("agencies.closed")}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {agencies.filter((a) => a.status === "CLOSED").length}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-secondary" />
                </div>
                <Input
                  className="pl-10"
                  placeholder={t("common.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AgencyStatus | "")}
              className="px-4 py-2 bg-base border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t("common.status")}</option>
              <option value="ACTIVE">{t("common.active")}</option>
              <option value="BANNED">{t("agencies.banned")}</option>
              <option value="CLOSED">{t("agencies.closed")}</option>
            </select>
            <Button
              variant="primary"
              onClick={() => navigate("/agencies/create")}
            >
              <Plus className="w-5 h-5" />
              {t("agencies.newAgency")}
            </Button>
          </div>

          {/* Agencies Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                      {t("agencies.name")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                      {t("agencies.licenseNumber")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                      {t("agencies.region")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                      {t("agencies.status")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                      {t("agencies.totalProperties")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-primary">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency) => (
                    <tr
                      key={agency.id}
                      className="border-b border-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-primary">
                          {agency.name}
                        </div>
                        <div className="text-sm text-secondary">
                          {agency.address}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary">
                        {agency.licenseNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary">
                        {agency.region}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(agency.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary">
                        {agency._count?.properties || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/agencies/${agency.id}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t("common.view")}
                          >
                            <Eye className="w-4 h-4 text-secondary" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/agencies/${agency.id}/edit`)
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t("common.edit")}
                          >
                            <Edit className="w-4 h-4 text-secondary" />
                          </button>
                          <button
                            onClick={() => handleDelete(agency.id)}
                            className="p-2 hover:bg-danger-100 dark:hover:bg-danger-900 rounded-lg transition-colors"
                            title={t("common.delete")}
                          >
                            <Trash2 className="w-4 h-4 text-danger-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {agencies.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-secondary">{t("common.noData")}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary">
                {t("common.page")} {page} {t("common.of")} {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </MainLayout>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title={t("agencies.title")}
      />
    </>
  );
};

export default AgenciesList;
