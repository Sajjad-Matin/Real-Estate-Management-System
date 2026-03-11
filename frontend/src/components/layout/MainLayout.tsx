import Sidebar from './Sidebar';
import Header from './Header';
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showExport?: boolean;
  onExport?: () => void;
}

const MainLayout = ({ children, title, subtitle, showExport, onExport }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} showExport={showExport} onExport={onExport} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;