import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showExport?: boolean;
}

const MainLayout = ({
  children,
  title,
  subtitle,
  showExport = false,
}: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-elevated">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} showExport={showExport} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;