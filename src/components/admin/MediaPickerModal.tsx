import { createPortal } from 'react-dom';
import { X, Images } from 'lucide-react';
import { MediaBrowser } from './MediaBrowser';
import { R2MediaFile } from '../../lib/r2-upload';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultFolder?: string;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, defaultFolder = '' }: MediaPickerModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" id="media-picker-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <h3 className="text-white font-bold flex items-center gap-2 text-sm">
            <Images className="w-4 h-4 text-indigo-400" /> Selecionar Imagem do R2
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <MediaBrowser
            initialPrefix={defaultFolder}
            allowDelete={false}
            allowCreateFolder={false}
            onSelect={(file: R2MediaFile) => {
              onSelect(file.url);
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
