import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LandingPage, BookReader, AudioArchive, PoemOfTheDay, PoemRoute, TableOfContentsPage } from '@/pages';
import { AdminApp } from '@/admin';

function App() {
  const location = useLocation();
  
  if (location.hash === '#/admin' || location.pathname === '/admin') {
    return <AdminApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/read/:bookSlug" element={<BookReader />} />
      <Route path="/read" element={<Navigate to="/read/book-1" replace />} />
      <Route path="/poem/:poemId" element={<PoemRoute />} />
      <Route path="/audio-archive" element={<AudioArchive />} />
      <Route path="/poem-of-the-day" element={<PoemOfTheDay />} />
      <Route path="/toc" element={<TableOfContentsPage />} />
    </Routes>
  );
}

export default App;
