import { useState, useCallback } from 'react';

interface FileItem {
  name: string;
  path: string;
  type: 'audio' | 'image';
  size: string;
  uploaded: string;
}

// Mock data for files (in production, this would come from API)
const mockFiles: FileItem[] = [
  { name: 'poem-1.mp3', path: '/audio/poem-1.mp3', type: 'audio', size: '2.4 MB', uploaded: '2024-01-15' },
  { name: 'poem-2.mp3', path: '/audio/poem-2.mp3', type: 'audio', size: '3.1 MB', uploaded: '2024-01-14' },
  { name: 'author-photo.jpg', path: '/images/author-photo.jpg', type: 'image', size: '850 KB', uploaded: '2024-01-10' },
];

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [filter, setFilter] = useState<'all' | 'audio' | 'image'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filteredFiles = files.filter(f => filter === 'all' || f.type === filter);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = async (fileList: File[]) => {
    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newFiles: FileItem[] = fileList.map(file => ({
      name: file.name,
      path: `/${file.type.startsWith('audio') ? 'audio' : 'images'}/${file.name}`,
      type: file.type.startsWith('audio') ? 'audio' : 'image',
      size: formatFileSize(file.size),
      uploaded: new Date().toISOString().split('T')[0],
    }));
    
    setFiles([...newFiles, ...files]);
    setUploading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDelete = (path: string) => {
    if (confirm('Удалить этот файл?')) {
      setFiles(files.filter(f => f.path !== path));
    }
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Файловый менеджер</h1>
          <p className="text-slate-400 mt-1">
            Управление аудио и изображениями
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-8 p-8 rounded-xl border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-white">Загрузка файлов...</p>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white mb-2">
                Перетащите файлы сюда или{' '}
                <label className="text-amber-500 cursor-pointer hover:underline">
                  выберите
                  <input
                    type="file"
                    multiple
                    accept="audio/*,image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  />
                </label>
              </p>
              <p className="text-slate-500 text-sm">
                Поддерживаются MP3, WAV, JPG, PNG (до 10 MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-slate-800 rounded-lg p-1">
          {[
            { id: 'all', label: 'Все файлы' },
            { id: 'audio', label: 'Аудио' },
            { id: 'image', label: 'Изображения' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-sm">
          {filteredFiles.length} файлов
        </span>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.path}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden 
                hover:border-slate-600 transition-colors group"
            >
              {/* Preview */}
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                {file.type === 'audio' ? (
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-slate-400 text-xs">Аудио</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-400 text-xs">Изображение</span>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100
                  transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyPath(file.path)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white
                      transition-colors"
                    title="Копировать путь"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  {file.type === 'audio' && (
                    <button
                      className="p-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900
                        transition-colors"
                      title="Воспроизвести"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(file.path)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white
                      transition-colors"
                    title="Удалить"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <p className="text-white font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-slate-400">{file.size}</span>
                  <span className="text-slate-500">{file.uploaded}</span>
                </div>
                <p className="text-slate-500 text-xs mt-2 truncate" title={file.path}>
                  {file.path}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 text-lg mb-2">Нет загруженных файлов</p>
          <p className="text-slate-500 text-sm">
            Перетащите файлы в область выше или нажмите "выберите"
          </p>
        </div>
      )}

      {/* Storage Info */}
      <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-white font-medium mb-4">Использование хранилища</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Аудио файлы</span>
              <span className="text-slate-300">5.5 MB / 100 MB</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '5.5%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Изображения</span>
              <span className="text-slate-300">0.85 MB / 50 MB</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '1.7%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
