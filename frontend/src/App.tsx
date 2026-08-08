import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import AgenciesList from "./pages/agencies/AgenciesList";
import AgencyForm from "./pages/agencies/AgencyForm";
import AgencyDetails from "./pages/agencies/AgencyDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthProvider from "./components/auth/AuthProvider";
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
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import type { UserRole } from "./types";

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
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <AgenciesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/create"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <AgencyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/:id"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <AgencyDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agencies/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
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
                "SUPER_ADMIN" as UserRole,
                "AGENCY_ADMIN" as UserRole,
                "INSPECTOR" as UserRole,
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
              allowedRoles={["SUPER_ADMIN" as UserRole, "AGENCY_ADMIN" as UserRole]}
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
                "SUPER_ADMIN" as UserRole,
                "AGENCY_ADMIN" as UserRole,
                "INSPECTOR" as UserRole,
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
              allowedRoles={["SUPER_ADMIN" as UserRole, "AGENCY_ADMIN" as UserRole]}
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
                "SUPER_ADMIN" as UserRole,
                "AGENCY_ADMIN" as UserRole,
                "INSPECTOR" as UserRole,
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
              allowedRoles={["SUPER_ADMIN" as UserRole, "AGENCY_ADMIN" as UserRole]}
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
                "SUPER_ADMIN" as UserRole,
                "AGENCY_ADMIN" as UserRole,
                "INSPECTOR" as UserRole,
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
              allowedRoles={["SUPER_ADMIN" as UserRole, "AGENCY_ADMIN" as UserRole]}
            >
              <TransactionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification-queue"
          element={
            <ProtectedRoute allowedRoles={["INSPECTOR" as UserRole]}>
              <VerificationQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={["INSPECTOR" as UserRole]}>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/create"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-log"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN" as UserRole]}>
              <AuditLogList />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
