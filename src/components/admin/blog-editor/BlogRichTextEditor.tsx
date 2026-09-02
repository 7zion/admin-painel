import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import { Video } from './VideoExtension';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, Pilcrow,
  Palette, Type, Image as ImageIcon, Video as VideoIcon, Loader2, Link2, Check, X,
} from 'lucide-react';

const COLOR_OPTIONS = [
  '#2D2824', '#B06448', '#405739', '#98553D',
  '#1A1A1A', '#DC2626', '#2563EB', '#059669',
];

const FONT_OPTIONS = [
  { label: 'Padrão', value: '' },
  { label: 'Serifada (Playfair)', value: "'Playfair Display', serif" },
  { label: 'Sem serifa (Inter)', value: 'Inter, sans-serif' },
  { label: 'Monoespaçada', value: "'Courier New', monospace" },
];

const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];

interface Props {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function BlogContentEditor({ value, onChange, onUploadImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openPanel, setOpenPanel] = useState<'color' | 'font' | 'size' | 'image' | 'video' | 'link' | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [bubbleLinkOpen, setBubbleLinkOpen] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit,
      Placeholder.configure({ placeholder: 'Escreva seu artigo aqui...' }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: 'blog-editor-image' },
        resize: {
          enabled: true,
          directions: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
          minWidth: 80,
          minHeight: 80,
          alwaysPreserveAspectRatio: false,
        },
      }),
      Video,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] text-[#2D2824] prose-headings:font-serif',
      },
    },
  });

  // Sincroniza conteúdo externo (ex: ao trocar de post no formulário) sem
  // disparar onUpdate em loop.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Fecha o input de link do bubble menu ao mudar a seleção (evita ele
  // reaparecer aberto quando o usuário seleciona outro trecho de texto).
  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => setBubbleLinkOpen(false);
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor]);

  const closePanels = () => setOpenPanel(null);

  useEffect(() => {
    if (!openPanel) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-blog-editor-ui]')) return;
      closePanels();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openPanel]);

  if (!editor) {
    return (
      <div className="w-full bg-white border border-white/10 rounded-xl p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const handleImageFile = async (file: File) => {
    setIsUploadingInline(true);
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      closePanels();
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar imagem.');
    } finally {
      setIsUploadingInline(false);
    }
  };

  const handleInsertImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    editor.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
    setImageUrlInput('');
    closePanels();
  };

  const handleInsertVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    const parsed = parseVideoUrl(url);
    editor.chain().focus().setVideo(parsed).run();
    setVideoUrlInput('');
    closePanels();
  };

  const openLinkPanel = () => {
    setLinkUrlInput(editor.getAttributes('link').href || '');
    setOpenPanel(openPanel === 'link' ? null : 'link');
  };

  const applyLink = () => {
    const url = linkUrlInput.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkUrlInput('');
    closePanels();
  };

  const openBubbleLink = () => {
    setLinkUrlInput(editor.getAttributes('link').href || '');
    setBubbleLinkOpen(true);
  };

  const applyBubbleLink = () => {
    const url = linkUrlInput.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkUrlInput('');
    setBubbleLinkOpen(false);
  };

  return (
    <div className="space-y-2" data-blog-editor-ui>
      {/* Barra de ferramentas fixa */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#121212] border border-white/10 rounded-xl p-2">
        <ToolbarButton title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton title="Título grande (H2)" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Título pequeno (H3)" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Parágrafo normal" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton title="Cor do texto" active={openPanel === 'color'} onClick={() => setOpenPanel(openPanel === 'color' ? null : 'color')}>
          <Palette className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Fonte" active={openPanel === 'font'} onClick={() => setOpenPanel(openPanel === 'font' ? null : 'font')}>
          <Type className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Tamanho do texto" active={openPanel === 'size'} onClick={() => setOpenPanel(openPanel === 'size' ? null : 'size')}>
          <span className="text-[10px] font-black leading-none px-0.5">Aa</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton title="Link" active={editor.isActive('link') || openPanel === 'link'} onClick={openLinkPanel}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Inserir imagem" active={openPanel === 'image'} onClick={() => setOpenPanel(openPanel === 'image' ? null : 'image')}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Inserir vídeo por URL" active={openPanel === 'video'} onClick={() => setOpenPanel(openPanel === 'video' ? null : 'video')}>
          <VideoIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {openPanel === 'color' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          <span className="text-[10px] text-gray-500 uppercase font-bold mr-1">Cor:</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => { editor.chain().focus().setColor(c).run(); closePanels(); }}
              className="w-6 h-6 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); closePanels(); }}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            title="Cor customizada"
          />
          <button
            type="button"
            onClick={() => { editor.chain().focus().unsetColor().run(); closePanels(); }}
            className="text-[10px] text-gray-400 hover:text-white ml-1 underline"
          >
            remover cor
          </button>
        </div>
      )}

      {openPanel === 'font' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                if (f.value) editor.chain().focus().setFontFamily(f.value).run();
                else editor.chain().focus().unsetFontFamily().run();
                closePanels();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 cursor-pointer"
              style={{ fontFamily: f.value || undefined }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {openPanel === 'size' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => { editor.chain().focus().setFontSize(size).run(); closePanels(); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 cursor-pointer"
            >
              {size}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { editor.chain().focus().unsetFontSize().run(); closePanels(); }}
            className="text-[10px] text-gray-400 hover:text-white ml-1 underline"
          >
            padrão
          </button>
        </div>
      )}

      {openPanel === 'link' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          <input
            type="text"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyLink()}
            placeholder="Cole a URL do link (deixe vazio para remover)"
            autoFocus
            className="flex-1 min-w-[220px] bg-[#0b0b0b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button type="button" onClick={applyLink} className="text-xs px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 cursor-pointer">
            {editor.isActive('link') ? 'Atualizar' : 'Aplicar'}
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => { editor.chain().focus().unsetLink().run(); closePanels(); }}
              className="text-xs px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
            >
              Remover link
            </button>
          )}
        </div>
      )}

      {openPanel === 'image' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingInline}
            className="text-xs px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 cursor-pointer flex items-center gap-1.5"
          >
            {isUploadingInline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            Enviar arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
          />
          <span className="text-[10px] text-gray-500">ou</span>
          <input
            type="text"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Cole a URL da imagem"
            className="flex-1 min-w-[160px] bg-[#0b0b0b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button type="button" onClick={handleInsertImageUrl} className="text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 cursor-pointer">
            Inserir
          </button>
        </div>
      )}

      {openPanel === 'video' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-white/10 rounded-xl p-3">
          <input
            type="text"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="Cole a URL do vídeo (YouTube, Vimeo ou link .mp4)"
            className="flex-1 min-w-[220px] bg-[#0b0b0b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button type="button" onClick={handleInsertVideoUrl} className="text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 cursor-pointer">
            Inserir
          </button>
        </div>
      )}

      {/* Bubble menu nativo do Tiptap: aparece automaticamente perto da seleção */}
      <BubbleMenu editor={editor} className="flex items-center gap-1 bg-[#1a1a1a] border border-white/15 rounded-xl shadow-2xl p-1.5">
        {bubbleLinkOpen ? (
          <div className="flex items-center gap-1.5 p-0.5">
            <input
              type="text"
              autoFocus
              value={linkUrlInput}
              onChange={(e) => setLinkUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyBubbleLink();
                if (e.key === 'Escape') { setBubbleLinkOpen(false); setLinkUrlInput(''); }
              }}
              placeholder="Cole a URL do link..."
              className="w-52 bg-[#0b0b0b] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
            <PopoverButton title="Aplicar" onClick={applyBubbleLink}>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </PopoverButton>
            <PopoverButton title="Cancelar" onClick={() => { setBubbleLinkOpen(false); setLinkUrlInput(''); }}>
              <X className="w-3.5 h-3.5 text-gray-400" />
            </PopoverButton>
          </div>
        ) : (
          <>
            <PopoverButton title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="w-3.5 h-3.5" />
            </PopoverButton>
            <PopoverButton title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="w-3.5 h-3.5" />
            </PopoverButton>
            <PopoverButton title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="w-3.5 h-3.5" />
            </PopoverButton>
            <PopoverButton title="Título H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="w-3.5 h-3.5" />
            </PopoverButton>
            <PopoverButton title="Link" active={editor.isActive('link')} onClick={openBubbleLink}>
              <Link2 className="w-3.5 h-3.5" />
            </PopoverButton>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            {COLOR_OPTIONS.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => editor.chain().focus().setColor(c).run()}
                className="w-4 h-4 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </>
        )}
      </BubbleMenu>

      <div className="bg-white border border-white/10 rounded-xl p-6">
        <EditorContent editor={editor} />
      </div>

      {/*
        Estilos das alças de redimensionar (imagem/vídeo). O Tiptap não
        aplica nenhum CSS às alças por padrão — só cria os elementos com
        data-attributes (data-resize-wrapper, data-resize-handle, etc.), o
        estilo visual fica por conta de quem usa a biblioteca.
      */}
      <style>{`
        [data-resize-wrapper] {
          display: inline-block;
          max-width: 100%;
        }
        [data-resize-wrapper] img,
        [data-resize-wrapper] video,
        [data-resize-wrapper] iframe {
          max-width: 100%;
          display: block;
        }
        [data-resize-handle] {
          width: 14px;
          height: 14px;
          background: #6366f1;
          border: 2px solid white;
          border-radius: 9999px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 20;
        }
        [data-resize-wrapper]:hover [data-resize-handle],
        [data-resize-container][data-resize-state="true"] [data-resize-handle] {
          opacity: 1;
        }
        [data-resize-handle="top-left"] { transform: translate(-50%, -50%); cursor: nwse-resize; }
        [data-resize-handle="bottom-right"] { transform: translate(50%, 50%); cursor: nwse-resize; }
        [data-resize-handle="top-right"] { transform: translate(50%, -50%); cursor: nesw-resize; }
        [data-resize-handle="bottom-left"] { transform: translate(-50%, 50%); cursor: nesw-resize; }
        [data-resize-container] { max-width: 100%; }
      `}</style>
    </div>
  );
}

function ToolbarButton({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
        active
          ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
          : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function PopoverButton({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-indigo-600/40 text-indigo-200' : 'hover:bg-white/10 text-gray-200'}`}
    >
      {children}
    </button>
  );
}

function parseVideoUrl(url: string): { src: string; kind: 'iframe' | 'file'; width: number; height: number } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
  if (yt) {
    return { src: `https://www.youtube.com/embed/${yt[1]}`, kind: 'iframe', width: 640, height: 360 };
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return { src: `https://player.vimeo.com/video/${vimeo[1]}`, kind: 'iframe', width: 640, height: 360 };
  }
  return { src: url, kind: 'file', width: 640, height: 360 };
}
