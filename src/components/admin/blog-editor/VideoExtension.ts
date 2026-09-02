import { Node, mergeAttributes, ResizableNodeView } from '@tiptap/core';

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

export interface SetVideoOptions {
  src: string;
  kind: 'iframe' | 'file';
  width?: number;
  height?: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: SetVideoOptions) => ReturnType;
    };
  }
}

// Node de vídeo (YouTube/Vimeo via iframe, ou arquivo direto via <video>),
// redimensionável com o mesmo mecanismo nativo usado pela extensão de imagem do Tiptap.
export const Video = Node.create<VideoOptions>({
  name: 'video',

  addOptions() {
    return { HTMLAttributes: {} };
  },

  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      kind: { default: 'iframe' },
      width: { default: 640 },
      height: { default: 360 },
    };
  },

  parseHTML() {
    return [
      { tag: 'iframe[data-video]', getAttrs: (el) => ({ kind: 'iframe' }) },
      { tag: 'video[data-video]', getAttrs: (el) => ({ kind: 'file' }) },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, kind, width, height } = HTMLAttributes;
    if (kind === 'file') {
      return [
        'video',
        mergeAttributes(this.options.HTMLAttributes, {
          src,
          width,
          height,
          controls: 'true',
          'data-video': 'true',
          style: `width:${width}px;height:${height}px;max-width:100%;`,
        }),
      ];
    }
    return [
      'iframe',
      mergeAttributes(this.options.HTMLAttributes, {
        src,
        width,
        height,
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: 'true',
        'data-video': 'true',
        style: `width:${width}px;height:${height}px;max-width:100%;`,
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: SetVideoOptions) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    if (typeof document === 'undefined') return null;

    return ({ node, getPos, editor }) => {
      const kind = node.attrs.kind === 'file' ? 'file' : 'iframe';
      const el = document.createElement(kind === 'file' ? 'video' : 'iframe') as HTMLElement;
      el.setAttribute('src', node.attrs.src || '');
      el.setAttribute('data-video', 'true');
      if (kind === 'file') {
        (el as HTMLVideoElement).controls = true;
      } else {
        el.setAttribute('frameborder', '0');
        el.setAttribute('allowfullscreen', 'true');
      }
      el.style.width = `${node.attrs.width}px`;
      el.style.height = `${node.attrs.height}px`;
      el.style.maxWidth = '100%';
      el.style.display = 'block';

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;
          editor.chain().setNodeSelection(pos).updateAttributes(this.name, { width, height }).run();
        },
        onUpdate: (updatedNode) => updatedNode.type === node.type,
        options: {
          directions: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
          min: { width: 160, height: 90 },
          preserveAspectRatio: false,
        },
      });

      return nodeView;
    };
  },
});
