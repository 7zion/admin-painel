import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight, FolderPlus, Folder, Copy, Check, Trash2, Loader2 } from 'lucide-react';
import { listR2Media, createR2Folder, deleteR2ObjectByKey, R2MediaFile } from '../../lib/r2-upload';

interface MediaBrowserProps {
  initialPrefix?: string;
  onSelect?: (file: R2MediaFile) => void;
  allowDelete?: boolean;
  allowCreateFolder?: boolean;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const fileNameFromKey = (key: string) => key.split('/').pop() || key;

export function MediaBrowser({ initialPrefix = '', onSelect, allowDelete = true, allowCreateFolder = true }: MediaBrowserProps) {
  const [prefix, setPrefix] = useState(initialPrefix);
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<R2MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const load = useCallback(async (targetPrefix: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await listR2Media(targetPrefix);
      setFolders(data.folders);
      setFiles(data.files);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar mídias do R2.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(prefix);
  }, [prefix, load]);

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split('/').filter(Boolean);
    const crumbs: { label: string; prefix: string }[] = [{ label: 'Raiz', prefix: '' }];
    let acc = '';
    for (const part of parts) {
      acc += `${part}/`;
      crumbs.push({ label: part, prefix: acc });
    }
    return crumbs;
  }, [prefix]);

  const folderLabel = (full: string) => full.slice(prefix.length).replace(/\/$/, '') || full;

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsSavingFolder(true);
    try {
      await createR2Folder(prefix, newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      await load(prefix);
    } catch (err: any) {
      alert(err?.message || 'Erro ao criar pasta.');
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleDelete = async (file: R2MediaFile) => {
    if (!window.confirm(`Excluir "${fileNameFromKey(file.key)}" permanentemente do bucket R2? Essa ação não pode ser desfeita.`)) return;
    setDeletingKey(file.key);
    try {
      await deleteR2ObjectByKey(file.key);
      setFiles((prev) => prev.filter((f) => f.key !== file.key));
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir arquivo do R2.');
    } finally {
      setDeletingKey(null);
    }
  };

  const handleCopy = async (file: R2MediaFile) => {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopiedKey(file.key);
      setTimeout(() => setCopiedKey((k) => (k === file.key ? null : k)), 1500);
    } catch {
      // clipboard indisponível, ignora
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 text-xs flex-wrap">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.prefix}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-600" />}
              <button
                type="button"
                onClick={() => setPrefix(crumb.prefix)}
                className={`px-2 py-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${
                  crumb.prefix === prefix ? 'text-white font-bold bg-white/5' : 'text-gray-400'
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>
        {allowCreateFolder && (
          <button
            type="button"
            onClick={() => setIsCreatingFolder(true)}
            className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Nova Pasta
          </button>
        )}
      </div>

      {isCreatingFolder && (
        <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nome da pasta"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName(''); }
            }}
          />
          <button
            type="button"
            onClick={handleCreateFolder}
            disabled={isSavingFolder || !newFolderName.trim()}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {isSavingFolder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Criar'}
          </button>
          <button
            type="button"
            onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando mídias...
        </div>
      ) : folders.length === 0 && files.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">Nenhum arquivo nesta pasta.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {folders.map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setPrefix(folder)}
              className="aspect-square bg-[#121212] border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-white/5 transition-all cursor-pointer"
            >
              <Folder className="w-8 h-8 text-indigo-400" />
              <span className="text-[10px] text-gray-300 font-medium truncate max-w-full px-2">{folderLabel(folder)}</span>
            </button>
          ))}
          {files.map((file) => (
            <div key={file.key} className="group relative aspect-square bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
              <img src={file.url} alt={fileNameFromKey(file.key)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="text-[9px] text-gray-300 leading-tight break-all line-clamp-2">
                  {fileNameFromKey(file.key)}
                  <br />
                  <span className="text-gray-500">{formatSize(file.size)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(file)}
                      className="flex-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-md font-bold cursor-pointer"
                    >
                      Usar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(file)}
                    title="Copiar URL"
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white cursor-pointer"
                  >
                    {copiedKey === file.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {allowDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(file)}
                      disabled={deletingKey === file.key}
                      title="Excluir do R2"
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-md text-red-400 disabled:opacity-50 cursor-pointer"
                    >
                      {deletingKey === file.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
