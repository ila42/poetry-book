import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';

export function AuthorEditor() {
  const { data, loading, updateBook } = useContent();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: 2024,
    version: '',
    epigraph: '',
    afterword: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.book) {
      // Преобразуем epigraph из объекта в строку, если нужно
      const epigraphValue = typeof data.book.epigraph === 'string' 
        ? data.book.epigraph 
        : data.book.epigraph 
          ? `${data.book.epigraph.text}\n\n(${data.book.epigraph.source})`
          : '';
      
      setFormData({
        title: data.book.title,
        author: data.book.author,
        year: data.book.year,
        version: data.book.version,
        epigraph: epigraphValue,
        afterword: data.book.afterword || '',
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBook(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Информация об авторе</h1>
        <p className="text-slate-400 mt-1">
          Редактирование данных о книге и авторе
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Info Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Данные книги</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Название книги
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Автор
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Год издания
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Версия
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900
                font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Сохранено
                </>
              ) : (
                'Сохранить'
              )}
            </button>
          </form>
        </div>

        {/* Epigraph Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Эпиграф книги</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Текст эпиграфа
              </label>
              <textarea
                value={formData.epigraph}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  epigraph: e.target.value 
                })}
                rows={6}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif
                  italic"
                placeholder="Текст эпиграфа и автор"
              />
            </div>

            {/* Removed source field as it is now part of the text area */}
            <div className="hidden">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Источник
              </label>
              <input type="text" className="hidden" />
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-3">Предпросмотр:</p>
              <blockquote className="font-serif italic text-slate-300 border-l-2 border-amber-500 pl-4 whitespace-pre-line">
                {formData.epigraph || 'Текст эпиграфа...'}
              </blockquote>
            </div>
          </form>
        </div>

        {/* Afterword Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Послесловие</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Текст послесловия
              </label>
              <textarea
                value={formData.afterword}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  afterword: e.target.value 
                })}
                rows={10}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                placeholder="Текст послесловия..."
              />
            </div>
          </form>
        </div>

        {/* Author Bio */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6">Биография автора</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Фотография
              </label>
              <div className="aspect-square bg-slate-900 rounded-xl border-2 border-dashed 
                border-slate-600 flex flex-col items-center justify-center cursor-pointer
                hover:border-amber-500 transition-colors">
                <svg className="w-12 h-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-400 text-sm">Загрузить фото</span>
                <span className="text-slate-500 text-xs mt-1">JPG, PNG до 5MB</span>
              </div>
            </div>

            {/* Bio Text */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Текст биографии
              </label>
              <textarea
                rows={10}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Напишите краткую биографию автора..."
              />
              <p className="text-slate-500 text-xs mt-2">
                Отображается на странице "Об авторе"
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              type="button"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900
                font-semibold transition-colors"
            >
              Сохранить биографию
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
