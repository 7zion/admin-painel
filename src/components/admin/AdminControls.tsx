import React from 'react';
import { useCMSContext } from '../../lib/cms-context';
import { useAuth } from '../../lib/auth-context';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Eye, Settings, ShieldCheck, ChevronRight } from 'lucide-react';

export function AdminControls() {
  const { isEditMode, setIsEditMode, canEdit } = useCMSContext();
  const { userRole, currentUser } = useAuth();

  if (!canEdit) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-2 min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Modo Editor Ativo</span>
            </div>
            
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Clique em qualquer elemento realçado para editar o texto, imagem ou estilo diretamente.
            </p>

            <a 
              href="/admin" 
              className="flex items-center justify-between mt-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-indigo-400 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3 h-3 text-gray-500" />
                Painel Administrativo
              </div>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEditMode(!isEditMode)}
        className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm shadow-2xl transition-all border ${
          isEditMode 
            ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20' 
            : 'bg-white border-white text-black'
        }`}
      >
        {isEditMode ? (
          <>
            <Eye className="w-5 h-5" />
            Visualizar Site
          </>
        ) : (
          <>
            <Edit3 className="w-5 h-5" />
            Editar Conteúdo
          </>
        )}
      </motion.button>
    </div>
  );
}
