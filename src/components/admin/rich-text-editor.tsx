'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Quote,
  Undo2,
  Redo2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const buttonClass = "p-2 rounded border border-gray-300 hover:bg-gray-100 text-gray-700";
  const activeButtonClass = "p-2 rounded border border-gray-300 bg-gray-200 text-gray-900";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? activeButtonClass : buttonClass}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? activeButtonClass : buttonClass}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </Button>

        <div className="border-l border-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}
          title="Heading"
        >
          <Heading2 size={18} />
        </Button>

        <div className="border-l border-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? activeButtonClass : buttonClass}
          title="Bullet List"
        >
          <List size={18} />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? activeButtonClass : buttonClass}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? activeButtonClass : buttonClass}
          title="Quote"
        >
          <Quote size={18} />
        </Button>

        <div className="border-l border-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={buttonClass}
          title="Undo"
        >
          <Undo2 size={18} />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={buttonClass}
          title="Redo"
        >
          <Redo2 size={18} />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 focus:outline-none min-h-64"
      />
    </div>
  );
}
