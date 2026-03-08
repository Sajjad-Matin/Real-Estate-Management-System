import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import AgenciesList from "./pages/agencies/AgenciesList";
import AgencyForm from "./pages/agencies/AgencyForm";
import AgencyDetails from "./pages/agencies/AgencyDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthProvider from "./components/auth/AuthProvider";
import { UserRole } from "./types";
import PropertiesList from "./pages/properties/PropertiesList";
import PropertyForm from "./pages/properties/PropertyForm";
import PropertyDetails from "./pages/properties/PropertyDetails";
import TransactionDetails from "./pages/transactions/TransactionDetails";
import TransactionForm from "./pages/transactions/TransactionsForm";
import TransactionsList from "./pages/transactions/TransactionsList";
import History from "./pages/inspector/History";
import VerificationQueue from "./pages/inspector/VerificationQueue";
import UserDetails from "./pages/users/UserDetails";
import UserForm from "./pages/users/UserForm";
import UsersList from "./pages/users/UsersList";
import AuditLogList from "./pages/auditLog/AuditLogList";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Agencies Routes */}
        <Route
          path="/agencies"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AgenciesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/create"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AgencyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AgencyDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AgencyForm />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/properties"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.AGENCY_ADMIN,
                UserRole.INSPECTOR,
              ]}
            >
              <PropertiesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/create"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}
            >
              <PropertyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.AGENCY_ADMIN,
                UserRole.INSPECTOR,
              ]}
            >
              <PropertyDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}
            >
              <PropertyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.AGENCY_ADMIN,
                UserRole.INSPECTOR,
              ]}
            >
              <TransactionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/create"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}
            >
              <TransactionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.AGENCY_ADMIN,
                UserRole.INSPECTOR,
              ]}
            >
              <TransactionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}
            >
              <TransactionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification-queue"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSPECTOR]}>
              <VerificationQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSPECTOR]}>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/create"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-log"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <AuditLogList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
