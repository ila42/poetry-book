import { useState, useMemo } from 'react';
import { useContent, Poem } from '../context/ContentContext';

// Generate unique ID
const generateId = () => `poem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface PoemEditorProps {
  poem?: Poem;
  onSave: (poem: Poem) => void;
  onCancel: () => void;
  location: { volumeId: string; partId: string; chapterId: string | null } | null;
}

function PoemEditor({ poem, onSave, onCancel }: PoemEditorProps) {
  const [formData, setFormData] = useState<Partial<Poem>>(poem || {
    id: generateId(),
    number: 1,
    title: '',
    alternateTitle: '',
    firstLine: '',
    text: '',
    audioUrl: '/audio/placeholder.mp3',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Poem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              {poem ? 'Редактировать стих' : 'Новый стих'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Номер
                </label>
                <input
                  type="number"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Название стиха"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Альтернативный заголовок
              </label>
              <input
                type="text"
                value={formData.alternateTitle || ''}
                onChange={(e) => setFormData({ ...formData, alternateTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="(опционально)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Первая строка
              </label>
              <input
                type="text"
                value={formData.firstLine || ''}
                onChange={(e) => setFormData({ ...formData, firstLine: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Первая строка стихотворения"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Текст стихотворения
              </label>
              <textarea
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={10}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                placeholder="Введите текст стихотворения..."
              />
              <p className="text-slate-500 text-xs mt-1">
                Используйте новую строку для переноса
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL аудиофайла
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.audioUrl || ''}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="/audio/poem-name.mp3"
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white
                    transition-colors"
                >
                  Загрузить
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isNew || false}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-amber-500
                    focus:ring-amber-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm">Новый стих</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isDiptych || false}
                  onChange={(e) => setFormData({ ...formData, isDiptych: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-amber-500
                    focus:ring-amber-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm">Диптих</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isTriptych || false}
                  onChange={(e) => setFormData({ ...formData, isTriptych: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-amber-500
                    focus:ring-amber-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm">Триптих</span>
              </label>
            </div>
          </div>

          <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white
                transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900
                font-semibold transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PoemsManager() {
  const { data, loading, addPoem, updatePoem, deletePoem } = useContent();
  const [search, setSearch] = useState('');
  const [selectedVolume, setSelectedVolume] = useState<string>('all');
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    volumeId: string;
    partId: string;
    chapterId: string | null;
  } | null>(null);

  // Flatten poems for display
  const allPoems = useMemo(() => {
    if (!data) return [];
    
    const poems: Array<{
      poem: Poem;
      volumeTitle: string;
      volumeId: string;
      partTitle: string;
      partId: string;
      chapterTitle: string | null;
      chapterId: string | null;
    }> = [];

    data.volumes.forEach(vol => {
      vol.parts.forEach(part => {
        if (part.chapters) {
          part.chapters.forEach(ch => {
            ch.poems.forEach(poem => {
              poems.push({
                poem,
                volumeTitle: vol.title,
                volumeId: vol.id,
                partTitle: part.title,
                partId: part.id,
                chapterTitle: ch.title,
                chapterId: ch.id,
              });
            });
          });
        }
        if (part.poems) {
          part.poems.forEach(poem => {
            poems.push({
              poem,
              volumeTitle: vol.title,
              volumeId: vol.id,
              partTitle: part.title,
              partId: part.id,
              chapterTitle: null,
              chapterId: null,
            });
          });
        }
      });
    });

    return poems;
  }, [data]);

  // Filter poems
  const filteredPoems = useMemo(() => {
    return allPoems.filter(item => {
      const matchesSearch = search === '' || 
        item.poem.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.poem.firstLine?.toLowerCase().includes(search.toLowerCase()) ||
        item.poem.text?.toLowerCase().includes(search.toLowerCase());
      
      const matchesVolume = selectedVolume === 'all' || item.volumeId === selectedVolume;
      
      return matchesSearch && matchesVolume;
    });
  }, [allPoems, search, selectedVolume]);

  const handleSavePoem = (poem: Poem) => {
    if (editingPoem) {
      updatePoem(poem.id, poem);
      setEditingPoem(null);
    } else if (selectedLocation) {
      addPoem(selectedLocation.volumeId, selectedLocation.partId, selectedLocation.chapterId, poem);
      setIsCreating(false);
      setSelectedLocation(null);
    }
  };

  const handleDeletePoem = (poemId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот стих?')) {
      deletePoem(poemId);
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Управление стихами</h1>
          <p className="text-slate-400 mt-1">
            {filteredPoems.length} из {allPoems.length} стихотворений
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 
            rounded-lg text-slate-900 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить стих
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию или тексту..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <select
            value={selectedVolume}
            onChange={(e) => setSelectedVolume(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
              text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Все тома</option>
            {data?.volumes.map(vol => (
              <option key={vol.id} value={vol.id}>{vol.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Poems Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">#</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Название / Первая строка</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Расположение</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Аудио</th>
                <th className="text-right px-6 py-4 text-slate-400 font-medium text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoems.map((item) => (
                <tr 
                  key={item.poem.id} 
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500">{item.poem.number}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">
                        {item.poem.title || item.poem.firstLine || 'Без названия'}
                      </p>
                      {item.poem.title && item.poem.firstLine && (
                        <p className="text-slate-400 text-sm truncate max-w-xs">
                          {item.poem.firstLine}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-400 text-sm">
                      <p>{item.volumeTitle}</p>
                      <p className="text-slate-500">{item.partTitle} {item.chapterTitle ? `→ ${item.chapterTitle}` : ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.poem.audioUrl && item.poem.audioUrl !== '/audio/placeholder.mp3' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 
                        text-green-400 rounded text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Есть
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 
                        text-slate-400 rounded text-xs">
                        Нет
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPoem(item.poem)}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-400
                          hover:text-white"
                        title="Редактировать"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePoem(item.poem.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400
                          hover:text-red-400"
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPoems.length === 0 && (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400">Стихи не найдены</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPoem && (
        <PoemEditor
          poem={editingPoem}
          onSave={handleSavePoem}
          onCancel={() => setEditingPoem(null)}
          location={null}
        />
      )}

      {/* Create Modal - Location Selector */}
      {isCreating && !selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Выберите расположение</h2>
              <p className="text-slate-400 text-sm mt-1">Куда добавить новый стих?</p>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-auto">
              {data?.volumes.map(vol => (
                <div key={vol.id}>
                  <p className="text-slate-300 font-medium mb-2">{vol.title}</p>
                  {vol.parts.map(part => (
                    <div key={part.id} className="ml-4 space-y-1">
                      {part.chapters ? (
                        part.chapters.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => setSelectedLocation({
                              volumeId: vol.id,
                              partId: part.id,
                              chapterId: ch.id,
                            })}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 
                              text-slate-400 hover:text-white transition-colors text-sm"
                          >
                            {part.title} → {ch.title}
                          </button>
                        ))
                      ) : (
                        <button
                          onClick={() => setSelectedLocation({
                            volumeId: vol.id,
                            partId: part.id,
                            chapterId: null,
                          })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 
                            text-slate-400 hover:text-white transition-colors text-sm"
                        >
                          {part.title}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setIsCreating(false)}
                className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg 
                  text-white transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal - Poem Editor */}
      {isCreating && selectedLocation && (
        <PoemEditor
          onSave={handleSavePoem}
          onCancel={() => {
            setIsCreating(false);
            setSelectedLocation(null);
          }}
          location={selectedLocation}
        />
      )}
    </div>
  );
}
