import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import {
  propertiesApi,
  type SearchPropertiesParams,
} from "../../api/properties";
import { Plus, Search, Home } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "../../stores/authStore";
import { UserRole, type Property } from "../../types";
import ExportModal from "../../components/common/ExportModal";
import { exportToCSV, exportToExcel } from "../../utils/export";

const PropertiesList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [search, regionFilter, currentPage]);

  const canCreate =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.AGENCY_ADMIN;

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params: SearchPropertiesParams = {
        page: currentPage,
        limit: 10,
      };

      if (search) params.search = search;
      if (regionFilter) params.region = regionFilter;

      const response = await propertiesApi.getAll(params);
      setProperties(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (fileFormat: "csv" | "excel") => {
    const exportData = properties.map((property) => ({
      Title: property.title,
      "Cadastral Number": property.cadastralNo || "N/A",
      Address: property.address,
      Region: property.region,
      Agency: property.agency?.name || "N/A",
      "Total Trades": property._count?.trades || 0,
      "Created Date": format(new Date(property.createdAt), "MMM d, yyyy"),
    }));

    if (fileFormat === "csv") {
      exportToCSV(exportData, "properties");
    } else {
      exportToExcel(exportData, "properties", "Properties");
    }
  };

  return (
    <>
      <MainLayout
        title="Properties"
        subtitle="Manage property listings"
        showExport
        onExport={() => setShowExportModal(true)}
      >
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {total}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Home className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Active Listings
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {total}
                  </p>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                  <Home className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">
                    Regions Covered
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {new Set(properties.map((p) => p.region)).size}
                  </p>
                </div>
                <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                  <Home className="w-6 h-6 text-info-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <Input
                    type="text"
                    placeholder="Search properties..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Filter by region..."
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                />

                {canCreate && (
                  <Button
                    variant="primary"
                    onClick={() => navigate("/properties/create")}
                    className="whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Property
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-secondary">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-secondary">No properties found</p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/properties/create")}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Add First Property
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Cadastral No.</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Trades</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow
                        key={property.id}
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        <TableCell className="font-medium text-primary">
                          {property.title}
                        </TableCell>
                        <TableCell className="font-mono text-secondary">
                          {property.cadastralNo || "-"}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {property.address}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {property.region}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {property.agency?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {property._count?.trades || 0}
                        </TableCell>
                        <TableCell className="text-secondary">
                          {format(new Date(property.createdAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-primary">
                    <div className="text-sm text-secondary">
                      Page {currentPage} of {totalPages} • {total} total
                      properties
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </MainLayout>
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title="Export Properties"
      />
    </>
  );
};

export default PropertiesList;
