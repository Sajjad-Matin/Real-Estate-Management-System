import { Moon, Sun, Bell, Download } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
}

const Header = ({ title, subtitle, showExport = false }: HeaderProps) => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="bg-base border-b border-primary px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-secondary mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-warning-500" />
            ) : (
              <Moon className="w-5 h-5 text-primary-600" />
            )}
          </button>

          {/* Export Button */}
          {showExport && (
            <button className="flex items-center gap-2 px-4 py-2 border border-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;