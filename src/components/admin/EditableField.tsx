import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { useCMS } from '../../hooks/useCMS';
import { useCMSContext } from '../../lib/cms-context';
import { uploadFileToR2 } from '../../lib/r2-upload';
import { MediaPickerModal } from './MediaPickerModal';
import { Edit2, Check, X, Palette, Type, Maximize2, Image as ImageIcon, Copy, Clipboard, AlignLeft, AlignCenter, AlignRight, GripHorizontal } from 'lucide-react';

interface EditableFieldProps {
  id: string;
  defaultValue: string;
  type?: 'text' | 'image' | 'html';
  children: (value: string, styles?: any) => React.ReactNode;
  className?: string;
}

export function EditableField({ id, defaultValue, type = 'text', children, className }: EditableFieldProps) {
  const { value, styles, updateContent, isAdmin } = useCMS(id, defaultValue, type);
  const { isEditMode, styleClipboard, setStyleClipboard } = useCMSContext();
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<any>(value);
  const [tempStyles, setTempStyles] = useState<any>(styles || {});
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const tempValueRef = useRef(tempValue);
  const tempStylesRef = useRef(tempStyles);

  useEffect(() => {
    tempValueRef.current = tempValue;
  }, [tempValue]);

  useEffect(() => {
    tempStylesRef.current = tempStyles;
  }, [tempStyles]);

  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const startResize = (e: React.PointerEvent, dir: 'width' | 'height' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    setIsSelected(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };
    
    const onMove = (moveEvent: PointerEvent) => {
      if (!resizeRef.current) return;
      
      const dx = moveEvent.clientX - resizeRef.current.startX;
      const dy = moveEvent.clientY - resizeRef.current.startY;
      
      setTempStyles((prev: any) => {
        const newStyles = { ...prev };
        if (dir === 'width' || dir === 'both') {
          newStyles.width = `${Math.max(10, resizeRef.current!.startWidth + dx)}px`;
        }
        if (dir === 'height' || dir === 'both') {
          newStyles.height = `${Math.max(10, resizeRef.current!.startHeight + dy)}px`;
        }
        return newStyles;
      });
    };
    
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      
      updateContent(tempValueRef.current, tempStylesRef.current);
    };
    
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    setTempStyles(styles || {});
  }, [styles]);

  // Block native clicks during edit mode
  useEffect(() => {
    if (!isEditMode || !isAdmin) return;
    const node = containerRef.current;
    if (!node) return;

    const handleNativeClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isSelected) {
        setIsSelected(true);
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    };

    // Use capture phase to intercept before React or native links
    node.addEventListener('click', handleNativeClick, true);
    node.addEventListener('dblclick', handleDoubleClick, true);
    
    return () => {
      node.removeEventListener('click', handleNativeClick, true);
      node.removeEventListener('dblclick', handleDoubleClick, true);
    };
  }, [isEditMode, isAdmin, isSelected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSelected && !isEditing && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected, isEditing]);

  const handleSave = async () => {
    try {
      await updateContent(tempValue, tempStyles);
      setIsEditing(false);
    } catch (e: any) {
      alert('Erro ao salvar no banco: ' + e.message);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setTempStyles(styles || {});
    setIsEditing(false);
  };

  const handleCopyStyle = () => {
    setStyleClipboard(tempStyles);
  };

  const handlePasteStyle = () => {
    if (styleClipboard) {
      setTempStyles({ ...tempStyles, ...styleClipboard });
    }
  };

  if (!isEditMode || !isAdmin) {
    return (
      <div className={className} style={{ ...styles, maxWidth: "100%", maxHeight: "100%" }}>
        {children(value, styles)}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative group cursor-pointer ${className || ''} ${isSelected ? 'z-[9990] ring-2 ring-indigo-500 ring-dashed' : 'hover:outline-2 hover:outline-indigo-500 hover:outline-dashed transition-all'}`}
    >
      <div className={`${isEditMode ? 'pointer-events-none' : ''} ${className?.includes('w-full') ? 'w-full' : ''} ${className?.includes('h-full') ? 'h-full' : ''}`} style={tempStyles}>
        {children(tempValue, tempStyles)}
      </div>

      {isEditMode && isAdmin && (
        <div className={`absolute inset-0 pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {/* Right Handle */}
          {!(className?.includes('w-full')) && (
            <div 
              className="absolute top-1/2 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full cursor-col-resize pointer-events-auto transform -translate-y-1/2 border border-white"
              onPointerDown={(e) => startResize(e, 'width')}
            />
          )}
          {/* Bottom Handle */}
          {!(className?.includes('h-full')) && (
            <div 
              className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-indigo-500 rounded-full cursor-row-resize pointer-events-auto transform -translate-x-1/2 border border-white"
              onPointerDown={(e) => startResize(e, 'height')}
            />
          )}
          {/* Bottom-Right Corner Handle */}
          {!(className?.includes('w-full') && className?.includes('h-full')) && (
            <div 
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full cursor-nwse-resize pointer-events-auto border border-white"
              onPointerDown={(e) => startResize(e, 'both')}
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <>
            {createPortal(
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              />,
              document.body
            )}

            {createPortal(
              <motion.div
                layoutId={`cms-bubble-${id}`}
                drag
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed top-[15%] left-[calc(50%-10rem)] w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-[9999] text-white flex flex-col"
              >
                <div 
                  className="flex items-center justify-between p-4 pb-3 border-b border-white/5 cursor-move active:cursor-grabbing hover:bg-white/5 rounded-t-2xl transition-colors"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest pointer-events-none">
                    <GripHorizontal className="w-4 h-4 opacity-50" />
                    Editar Conteúdo
                  </div>
                  <div className="flex items-center gap-1">
                    <button onPointerDown={(e) => e.stopPropagation()} onClick={handleCancel} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                    <button onPointerDown={(e) => e.stopPropagation()} onClick={handleSave} className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors cursor-pointer">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 p-4">
                  {/* Formatting Tools */}
                <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                  <button 
                    onClick={handleCopyStyle}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                    title="Copiar Formatação"
                  >
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                  <div className="w-[1px] h-4 bg-white/5" />
                  <button 
                    onClick={handlePasteStyle}
                    disabled={!styleClipboard}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${styleClipboard ? 'hover:bg-white/5 text-indigo-400 hover:text-indigo-300' : 'opacity-20 cursor-not-allowed text-gray-500'}`}
                    title="Colar Formatação"
                  >
                    <Clipboard className="w-3 h-3" /> Colar
                  </button>
                  <div className="w-[1px] h-4 bg-white/5" />
                  <button 
                    onClick={() => {
                      const newStyles = { ...tempStyles };
                      delete newStyles.width;
                      delete newStyles.height;
                      setTempStyles(newStyles);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                    title="Remover Tamanho Fixo"
                  >
                    <X className="w-3 h-3" /> Auto
                  </button>
                </div>

                {/* Content Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3 h-3" /> {type === 'image' ? 'URL da Imagem' : 'Texto / HMTL'}
                  </label>
                  {type === 'text' || type === 'html' ? (
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-y"
                    />
                  ) : (
                    <div className="space-y-4">
                       <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="https://..."
                      />

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploading(true);
                              try {
                                const url = await uploadFileToR2(file, "site");
                                setTempValue(url);
                              } catch (err: any) {
                                console.error('SERVER UPLOAD ERROR:', err);
                                alert(err?.message || 'Erro ao conectar ao servidor de upload. Falha no envio.');
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
                        />
                        <div className={`w-full py-2 flex items-center justify-center bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isUploading ? 'opacity-50' : 'hover:bg-indigo-600/30'}`}>
                          {isUploading ? 'Fazendo Upload...' : 'Ou Fazer Upload de Imagem Local'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Selecionar do R2
                      </button>

                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/5 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center">
                        <div className="w-full h-full bg-black/80 flex items-center justify-center p-2">
                          {tempValue ? (
                            <img src={tempValue} className="w-full h-full object-contain" alt="Preview" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-white/10" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Style Controls */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <Palette className="w-3 h-3" /> Estilização
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase">Cor do Texto</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={tempStyles.color || '#ffffff'} 
                          onChange={(e) => setTempStyles({ ...tempStyles, color: e.target.value })}
                          className="w-8 h-8 bg-transparent border-none cursor-pointer p-0"
                        />
                        <span className="text-[10px] font-mono text-gray-400 uppercase">{tempStyles.color || '#FFFFFF'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase">Tamanho (px)</label>
                      <input 
                        type="number" 
                        value={parseInt(String(tempStyles.fontSize || '16')) || 16} 
                        onChange={(e) => setTempStyles({ ...tempStyles, fontSize: e.target.value + 'px' })}
                        className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase">Peso da Fonte</label>
                      <select 
                        value={tempStyles.fontWeight || '400'}
                        onChange={(e) => setTempStyles({ ...tempStyles, fontWeight: e.target.value })}
                        className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">SemiBold</option>
                        <option value="700">Bold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-600 uppercase">Alinhamento</label>
                      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                        <button onClick={() => setTempStyles({...tempStyles, textAlign: 'left'})} className={`p-1 rounded ${tempStyles.textAlign === 'left' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}><AlignLeft size={12} /></button>
                        <button onClick={() => setTempStyles({...tempStyles, textAlign: 'center'})} className={`p-1 rounded ${tempStyles.textAlign === 'center' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}><AlignCenter size={12} /></button>
                        <button onClick={() => setTempStyles({...tempStyles, textAlign: 'right'})} className={`p-1 rounded ${tempStyles.textAlign === 'right' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}><AlignRight size={12} /></button>
                      </div>
                    </div>
                  </div>



                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-600 uppercase">Família da Fonte</label>
                    <select 
                      value={tempStyles.fontFamily || ''}
                      onChange={(e) => setTempStyles({ ...tempStyles, fontFamily: e.target.value })}
                      className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="">Padrão do Sistema</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-600 uppercase flex items-center justify-between">
                      Espaçamento/Margem <Maximize2 className="w-2.5 h-2.5" />
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: 0px 0px 20px 0px"
                      value={tempStyles.spacing || ''} 
                      onChange={(e) => setTempStyles({ ...tempStyles, spacing: e.target.value })}
                      className="w-full bg-black/50 border border-white/5 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
              </motion.div>,
              document.body
            )}
          </>
        )}
      </AnimatePresence>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setTempValue(url)}
        defaultFolder="site/"
      />
    </div>
  );
}
