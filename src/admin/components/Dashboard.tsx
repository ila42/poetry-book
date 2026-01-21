import { useContent } from '../context/ContentContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data, loading } = useContent();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Calculate statistics
  let totalPoems = 0;
  let totalChapters = 0;
  let totalParts = 0;
  let totalVolumes = data?.volumes.length || 0;

  data?.volumes.forEach(vol => {
    totalParts += vol.parts.length;
    vol.parts.forEach(part => {
      if (part.chapters) {
        totalChapters += part.chapters.length;
        part.chapters.forEach(ch => {
          totalPoems += ch.poems.length;
        });
      }
      if (part.poems) {
        totalPoems += part.poems.length;
      }
    });
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Обзор</h1>
        <p className="text-slate-400 mt-1">
          Статистика и быстрые действия
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Стихотворений"
          value={totalPoems}
          color="bg-amber-500/20"
          icon={
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Глав"
          value={totalChapters}
          color="bg-blue-500/20"
          icon={
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Частей"
          value={totalParts}
          color="bg-green-500/20"
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Томов"
          value={totalVolumes}
          color="bg-purple-500/20"
          icon={
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      {/* Book Info */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Информация о книге</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Название</p>
            <p className="text-white font-medium">{data?.book.title}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Автор</p>
            <p className="text-white font-medium">{data?.book.author}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Год</p>
            <p className="text-white font-medium">{data?.book.year}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Версия</p>
            <p className="text-white font-medium">{data?.book.version}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 
            transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Добавить стих</p>
              <p className="text-slate-400 text-sm">Новое стихотворение</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 
            transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Загрузить аудио</p>
              <p className="text-slate-400 text-sm">Добавить запись</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 
            transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Экспорт JSON</p>
              <p className="text-slate-400 text-sm">Скачать данные</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 
            transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Сбросить изменения</p>
              <p className="text-slate-400 text-sm">К исходной версии</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
