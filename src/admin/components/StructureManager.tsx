import { useState } from 'react';
import { useContent, Chapter, Part } from '../context/ContentContext';

// Generate unique ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function StructureManager() {
  const { 
    data, 
    loading, 
    addPart, 
    updatePart, 
    deletePart,
    addChapter,
    updateChapter,
    deleteChapter,
  } = useContent();
  
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set(['vol1']));
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [editingPart, setEditingPart] = useState<{ part: Part; volumeId: string } | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ chapter: Chapter; partId: string; volumeId: string } | null>(null);
  const [creatingPart, setCreatingPart] = useState<string | null>(null);
  const [creatingChapter, setCreatingChapter] = useState<{ volumeId: string; partId: string } | null>(null);

  const toggleVolume = (volId: string) => {
    const newSet = new Set(expandedVolumes);
    if (newSet.has(volId)) {
      newSet.delete(volId);
    } else {
      newSet.add(volId);
    }
    setExpandedVolumes(newSet);
  };

  const togglePart = (partId: string) => {
    const newSet = new Set(expandedParts);
    if (newSet.has(partId)) {
      newSet.delete(partId);
    } else {
      newSet.add(partId);
    }
    setExpandedParts(newSet);
  };

  const handleSavePart = (part: Part) => {
    if (editingPart) {
      updatePart(part.id, part);
      setEditingPart(null);
    } else if (creatingPart) {
      addPart(creatingPart, part);
      setCreatingPart(null);
    }
  };

  const handleSaveChapter = (chapter: Chapter) => {
    if (editingChapter) {
      updateChapter(chapter.id, chapter);
      setEditingChapter(null);
    } else if (creatingChapter) {
      addChapter(creatingChapter.volumeId, creatingChapter.partId, chapter);
      setCreatingChapter(null);
    }
  };

  const handleDeletePart = (partId: string) => {
    if (confirm('Удалить часть и все её содержимое? Это действие необратимо.')) {
      deletePart(partId);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Удалить главу и все её стихи? Это действие необратимо.')) {
      deleteChapter(chapterId);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Структура книги</h1>
        <p className="text-slate-400 mt-1">
          Управление томами, частями и главами
        </p>
      </div>

      {/* Structure Tree */}
      <div className="space-y-4">
        {data?.volumes.map(volume => (
          <div 
            key={volume.id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            {/* Volume Header */}
            <button
              onClick={() => toggleVolume(volume.id)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
            >
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  expandedVolumes.has(volume.id) ? 'rotate-90' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-semibold text-white">{volume.title}</h2>
                <p className="text-slate-400 text-sm">{volume.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {volume.parts.length} частей
                </span>
              </div>
            </button>

            {/* Volume Content */}
            {expandedVolumes.has(volume.id) && (
              <div className="border-t border-slate-700">
                {/* Parts */}
                {volume.parts.map((part) => (
                  <div key={part.id} className="border-b border-slate-700/50 last:border-0">
                    {/* Part Header */}
                    <div className="px-6 py-3 flex items-center gap-4 bg-slate-700/30">
                      <button
                        onClick={() => togglePart(part.id)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedParts.has(part.id) ? 'rotate-90' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">
                          {part.romanNumeral && <span className="text-amber-500 mr-2">{part.romanNumeral}</span>}
                          {part.title}
                        </h3>
                        {part.subtitle && (
                          <p className="text-slate-400 text-sm">{part.subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-600 text-slate-300 rounded text-xs">
                          {part.chapters ? `${part.chapters.length} глав` : `${part.poems?.length || 0} стихов`}
                        </span>
                        <button
                          onClick={() => setEditingPart({ part, volumeId: volume.id })}
                          className="p-1.5 hover:bg-slate-600 rounded transition-colors text-slate-400 
                            hover:text-white"
                          title="Редактировать часть"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-slate-400 
                            hover:text-red-400"
                          title="Удалить часть"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Chapters */}
                    {expandedParts.has(part.id) && part.chapters && (
                      <div className="pl-10 py-2 space-y-1">
                        {part.chapters.map((chapter) => (
                          <div 
                            key={chapter.id}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700/50 
                              transition-colors group"
                          >
                            <span className="text-slate-500 text-sm w-6">{chapter.number}</span>
                            <div className="flex-1">
                              <p className="text-slate-300">{chapter.title}</p>
                              {chapter.subtitle && (
                                <p className="text-slate-500 text-xs">{chapter.subtitle}</p>
                              )}
                            </div>
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                              {chapter.poems.length} стихов
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingChapter({ 
                                  chapter, 
                                  partId: part.id, 
                                  volumeId: volume.id 
                                })}
                                className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-400
                                  hover:text-white"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(chapter.id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors text-slate-400
                                  hover:text-red-400"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Add Chapter Button */}
                        <button
                          onClick={() => setCreatingChapter({ volumeId: volume.id, partId: part.id })}
                          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white
                            transition-colors text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить главу
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Part Button */}
                <button
                  onClick={() => setCreatingPart(volume.id)}
                  className="w-full px-6 py-3 flex items-center gap-2 text-slate-400 hover:text-white
                    hover:bg-slate-700/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить часть
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Part Editor Modal */}
      {(editingPart || creatingPart) && (
        <PartEditor
          part={editingPart?.part}
          onSave={handleSavePart}
          onCancel={() => {
            setEditingPart(null);
            setCreatingPart(null);
          }}
        />
      )}

      {/* Chapter Editor Modal */}
      {(editingChapter || creatingChapter) && (
        <ChapterEditor
          chapter={editingChapter?.chapter}
          onSave={handleSaveChapter}
          onCancel={() => {
            setEditingChapter(null);
            setCreatingChapter(null);
          }}
        />
      )}
    </div>
  );
}

// Part Editor Component
interface PartEditorProps {
  part?: Part;
  onSave: (part: Part) => void;
  onCancel: () => void;
}

function PartEditor({ part, onSave, onCancel }: PartEditorProps) {
  const [formData, setFormData] = useState<Partial<Part>>(part || {
    id: generateId('part'),
    number: 1,
    title: '',
    subtitle: null,
    romanNumeral: '',
    chapters: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Part);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              {part ? 'Редактировать часть' : 'Новая часть'}
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
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Римская нумерация
                </label>
                <input
                  type="text"
                  value={formData.romanNumeral || ''}
                  onChange={(e) => setFormData({ ...formData, romanNumeral: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                    text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="I, II, III..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Название
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Название части"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Подзаголовок
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value || null })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="(опционально)"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isEpilogue || false}
                  onChange={(e) => setFormData({ ...formData, isEpilogue: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-amber-500
                    focus:ring-amber-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm">Эпилог</span>
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

// Chapter Editor Component
interface ChapterEditorProps {
  chapter?: Chapter;
  onSave: (chapter: Chapter) => void;
  onCancel: () => void;
}

function ChapterEditor({ chapter, onSave, onCancel }: ChapterEditorProps) {
  const [formData, setFormData] = useState<Partial<Chapter>>(chapter || {
    id: generateId('ch'),
    number: 1,
    title: '',
    subtitle: null,
    poems: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Chapter);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              {chapter ? 'Редактировать главу' : 'Новая глава'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Номер
              </label>
              <input
                type="number"
                value={formData.number || ''}
                onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || null })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Название
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Название главы"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Подзаголовок
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value || null })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                  text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="(опционально)"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isIntermezzo || false}
                  onChange={(e) => setFormData({ ...formData, isIntermezzo: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-amber-500
                    focus:ring-amber-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm">Интермеццо</span>
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
