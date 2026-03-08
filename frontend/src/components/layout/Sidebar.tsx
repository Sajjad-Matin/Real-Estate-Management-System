import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Home,
  ArrowLeftRight,
  Users,
  FileText,
  Settings,
  LogOut,
  ClipboardCheck,
  History,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR],
    },
    {
      name: 'Agencies',
      path: '/agencies',
      icon: <Building2 className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN, UserRole.INSPECTOR],
    },
    {
      name: 'Properties',
      path: '/properties',
      icon: <Home className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR],
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.INSPECTOR],
    },
    {
      name: 'Verification Queue',
      path: '/verification-queue',
      icon: <ClipboardCheck className="w-5 h-5" />,
      roles: [UserRole.INSPECTOR],
    },
    {
      name: 'History',
      path: '/history',
      icon: <History className="w-5 h-5" />,
      roles: [UserRole.INSPECTOR],
    },
    {
      name: 'Users',
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: 'Audit Log',
      path: '/audit-log',
      icon: <FileText className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: 'System Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: [UserRole.SUPER_ADMIN],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    await logout();
  };

  const getSystemTitle = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
        return 'Ministry Command';
      case UserRole.AGENCY_ADMIN:
        return 'NRTRS';
      case UserRole.INSPECTOR:
        return 'NRTRS';
      default:
        return 'REMS';
    }
  };

  const getSystemSubtitle = () => {
    switch (user?.role) {
      case UserRole.INSPECTOR:
        return 'Regulatory System';
      default:
        return '';
    }
  };

  return (
    <div className="w-64 h-screen bg-base border-r border-primary flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">{getSystemTitle()}</h1>
            {getSystemSubtitle() && (
              <p className="text-xs text-secondary">{getSystemSubtitle()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-primary">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {user?.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-secondary truncate">
              {user?.role === UserRole.SUPER_ADMIN && 'Cabinet Level'}
              {user?.role === UserRole.AGENCY_ADMIN && 'Chief Admin'}
              {user?.role === UserRole.INSPECTOR && 'Inspector'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;