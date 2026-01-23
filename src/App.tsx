import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage, BookReader, AudioArchive } from '@/pages';
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
      <Route path="/audio-archive" element={<AudioArchive />} />
    </Routes>
  );
}

export default App;
