import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();
  const { isDarkMode, setTheme } = useThemeStore();

  useEffect(() => {
    initialize();
    // Apply saved theme
    setTheme(isDarkMode);
  }, [initialize, isDarkMode, setTheme]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-elevated">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}