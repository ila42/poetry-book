import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage, BookReader, AudioArchive, PoemOfTheDay, PoemRoute } from '@/pages';
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
      <Route path="/poem/:poemId" element={<PoemRoute />} />
      <Route path="/audio-archive" element={<AudioArchive />} />
      <Route path="/poem-of-the-day" element={<PoemOfTheDay />} />
    </Routes>
  );
}

export default App;
