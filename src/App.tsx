import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage, BookReader } from '@/pages';
import { AdminApp } from '@/admin';

function App() {
  const location = useLocation();
  
  // Проверяем, находимся ли на странице админки
  if (location.hash === '#/admin' || location.pathname === '/admin') {
    return <AdminApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/read" element={<BookReader />} />
    </Routes>
  );
}

export default App;
