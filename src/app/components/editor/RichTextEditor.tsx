import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Bold, Italic, Underline as UnderlineIcon, Quote } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const COLORS = [
  { label: 'Black', value: '#111111' },
  { label: 'Primary', value: '#7f15a8' },
  { label: 'Gray', value: '#666666' },
  { label: 'Red', value: '#e53e3e' },
  { label: 'Green', value: '#38a169' },
];

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `flex items-center justify-center rounded transition-colors ${
      active
        ? 'brand-gradient-bg text-white'
        : 'bg-transparent text-[#444444] hover:bg-[#eeeeee]'
    }`;

  return (
    <div className="border border-[#eeeeee] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-[#eeeeee] bg-[#fafafa]"
      >
        {/* Paragraph / Headings */}
        <select
          className="text-sm border border-[#eeeeee] rounded px-2 py-1 bg-white text-[#111111] h-8"
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
              ? 'h2'
              : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : 'p'
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'p') editor.chain().focus().setParagraph().run();
            else if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={btn(editor.isActive('bold'))}
          style={{ width: 32, height: 32 }}
          title="Bold"
        >
          <Bold size={14} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={btn(editor.isActive('italic'))}
          style={{ width: 32, height: 32 }}
          title="Italic"
        >
          <Italic size={14} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={btn(editor.isActive('underline'))}
          style={{ width: 32, height: 32 }}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          className={btn(editor.isActive('blockquote'))}
          style={{ width: 32, height: 32 }}
          title="Blockquote"
        >
          <Quote size={14} />
        </button>

        {/* Color */}
        <div className="flex items-center gap-1 ml-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setColor(c.value).run();
              }}
              title={c.label}
              className="rounded-full border border-[#eeeeee] flex-shrink-0 hover:scale-110 transition-transform"
              style={{
                width: 16,
                height: 16,
                backgroundColor: c.value,
                outline: editor.isActive('textStyle', { color: c.value })
                  ? '2px solid #7f15a8'
                  : 'none',
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="prose max-w-none px-4 py-3 min-h-[120px] text-[#111111]">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .tiptap { outline: none; }
        .tiptap h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5em 0; }
        .tiptap h2 { font-size: 1.375rem; font-weight: 700; margin: 0.5em 0; }
        .tiptap h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5em 0; }
        .tiptap p { margin: 0.25em 0; }
        .tiptap blockquote { border-left: 3px solid #7f15a8; padding-left: 12px; color: #666666; margin: 0.5em 0; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u { text-decoration: underline; }
      `}</style>
    </div>
  );
}


