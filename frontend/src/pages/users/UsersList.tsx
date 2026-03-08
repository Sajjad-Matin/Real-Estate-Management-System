import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { usersApi, type SearchUsersParams } from "../../api/users";
import { UserRole, type User } from "../../types";
import {
  Plus,
  Search,
  Users as UsersIcon,
  ShieldCheck,
  Building2,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: SearchUsersParams = {
        page: currentPage,
        limit: 10,
      };

      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === "active";

      const response = await usersApi.getAll(params);

      // ✅ Add safety checks
      setUsers(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // ✅ Reset state on error
      setUsers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
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
        return <ShieldCheck className="w-5 h-5 text-danger-600" />;
      case UserRole.AGENCY_ADMIN:
        return <Building2 className="w-5 h-5 text-info-600" />;
      case UserRole.INSPECTOR:
        return <Eye className="w-5 h-5 text-success-600" />;
    }
  };

  // Count by role
  const superAdminCount = users.filter(
    (u) => u.role === UserRole.SUPER_ADMIN,
  ).length;
  const agencyAdminCount = users.filter(
    (u) => u.role === UserRole.AGENCY_ADMIN,
  ).length;
  const inspectorCount = users.filter(
    (u) => u.role === UserRole.INSPECTOR,
  ).length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <MainLayout
      title="User Management"
      subtitle="Manage system users and permissions"
      showExport
    >
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-primary mt-2">{total}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <UsersIcon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Super Admins
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {superAdminCount}
                </p>
              </div>
              <div className="p-3 bg-danger-100 dark:bg-danger-900 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Agency Admins
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {agencyAdminCount}
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900 rounded-lg">
                <Building2 className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Inspectors</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {inspectorCount}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <Eye className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {activeCount}
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <UsersIcon className="w-6 h-6 text-success-600" />
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
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Roles</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                <option value={UserRole.AGENCY_ADMIN}>Agency Admin</option>
                <option value={UserRole.INSPECTOR}>Inspector</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "active" | "inactive" | "")
                }
                className="px-3 py-2 border border-primary bg-base text-primary rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button
                variant="primary"
                onClick={() => navigate("/users/create")}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary">No users found</p>
              <Button
                variant="primary"
                onClick={() => navigate("/users/create")}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add First User
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-elevated rounded-lg">
                            {getRoleIcon(user.role)}
                          </div>
                          <span className="font-medium text-primary">
                            {user.fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-secondary">
                        {user.email}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-secondary">
                        {user.agency?.name || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                      <TableCell className="text-secondary uppercase">
                        {user.language}
                      </TableCell>
                      <TableCell className="text-secondary">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-primary">
                  <div className="text-sm text-secondary">
                    Page {currentPage} of {totalPages} • {total} total users
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
  );
};

export default UsersList;
