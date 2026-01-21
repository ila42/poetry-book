import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import {
  LoginPage,
  AdminLayout,
  Dashboard,
  PoemsManager,
  StructureManager,
  AuthorEditor,
  FileManager,
} from './components';

type Page = 'dashboard' | 'poems' | 'structure' | 'author' | 'files';

function AdminContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'poems':
        return <PoemsManager />;
      case 'structure':
        return <StructureManager />;
      case 'author':
        return <AuthorEditor />;
      case 'files':
        return <FileManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ContentProvider>
      <AdminLayout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)}>
        {renderPage()}
      </AdminLayout>
    </ContentProvider>
  );
}

export function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
