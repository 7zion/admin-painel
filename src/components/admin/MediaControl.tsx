import { Images } from 'lucide-react';
import { MediaBrowser } from './MediaBrowser';

export function MediaControl() {
  return (
    <div className="space-y-6" id="media-control-root">
      <div className="bg-[#0b0b0b] p-6 rounded-2xl border border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Images className="w-6 h-6 text-indigo-400" /> Mídias
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Navegue pelas pastas do bucket R2, organize os arquivos e exclua o que não estiver mais em uso.
          As pastas seguem o nome da área onde o upload foi feito (produtos, blog, serviços, site).
        </p>
      </div>

      <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6">
        <MediaBrowser initialPrefix="" allowDelete allowCreateFolder />
      </div>
    </div>
  );
}
