import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Building2,
  Home,
  Receipt,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ClipboardCheck,
  History,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navigation items based on role
  const superAdminNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { path: '/agencies', icon: Building2, label: t('sidebar.agencies') },
    { path: '/properties', icon: Home, label: t('sidebar.properties') },
    { path: '/transactions', icon: Receipt, label: t('sidebar.transactions') },
    { path: '/users', icon: Users, label: t('sidebar.users') },
    { path: '/audit-log', icon: ClipboardList, label: t('sidebar.auditLog') },
    { path: '/settings', icon: Settings, label: t('sidebar.settings') },
  ];

  const agencyAdminNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { path: '/properties', icon: Home, label: t('sidebar.properties') },
    { path: '/transactions', icon: Receipt, label: t('sidebar.transactions') },
  ];

  const inspectorNav = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { path: '/verification-queue', icon: ClipboardCheck, label: t('sidebar.verificationQueue') },
    { path: '/history', icon: History, label: t('sidebar.history') },
  ];

  // Get navigation items based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return superAdminNav;
      case 'AGENCY_ADMIN':
        return agencyAdminNav;
      case 'INSPECTOR':
        return inspectorNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return t('users.superAdmin');
      case 'AGENCY_ADMIN':
        return t('users.agencyAdmin');
      case 'INSPECTOR':
        return t('users.inspector');
      default:
        return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 bg-base border-r border-primary h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">
              {user?.role === 'SUPER_ADMIN' ? 'Ministry Command' : 'REMS'}
            </h1>
            <p className="text-xs text-secondary">
              {user?.role === 'SUPER_ADMIN' ? 'Admin Portal' : 'Real Estate System'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  active
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-primary">
        <div className="mb-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.fullName ? getInitials(user.fullName) : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-secondary">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;