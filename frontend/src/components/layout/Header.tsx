import { useState } from 'react';
import { Bell, Moon, Sun, Download, Key } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import Button from '../ui/Button';
import ChangePasswordModal from '../../pages/auth/ChangePasswordModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
  onExport?: () => void;
}

const Header = ({ title, subtitle, showExport, onExport }: HeaderProps) => {
  const { toggleTheme } = useThemeStore();
  const [isDark, setIsDark] = useState<boolean>(document.documentElement.classList.contains('dark'));
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <div className="bg-base border-b border-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Change Password Button */}
            <button
              onClick={() => setShowChangePassword(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Change Password"
            >
              <Key className="w-5 h-5 text-secondary" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-600 rounded-full"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsDark(prev => !prev);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-secondary" />
              ) : (
                <Moon className="w-5 h-5 text-secondary" />
              )}
            </button>

            {/* Export Button */}
            {showExport && onExport && (
              <Button variant="secondary" onClick={onExport} className="text-sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default Header;