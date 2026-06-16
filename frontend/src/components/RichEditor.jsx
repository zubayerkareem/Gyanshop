import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Unlink,
} from 'lucide-react'

function Sep() {
  return <div className="w-px h-5 bg-border mx-0.5 self-center" />
}

function Btn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`h-7 min-w-7 px-1 flex items-center justify-center rounded text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        ${active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
    >
      {children}
    </button>
  )
}

export default function RichEditor({ content = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: { class: 'outline-none min-h-64 p-3 text-sm leading-relaxed' },
    },
  })

  if (!editor) return null

  const is = (name, attrs) => editor.isActive(name, attrs)

  function handleLink() {
    if (is('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = window.prompt('লিংক URL দিন:', 'https://')
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="rounded-md border border-border overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5">
        <Btn active={is('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn active={is('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn active={is('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn active={is({ textAlign: 'left' })}   onClick={() => editor.chain().focus().setTextAlign('left').run()}   title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={is({ textAlign: 'right' })}  onClick={() => editor.chain().focus().setTextAlign('right').run()}  title="Align right">
          <AlignRight className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn active={is('link')} onClick={handleLink} title={is('link') ? 'লিংক সরান' : 'লিংক যোগ করুন'}>
          {is('link') ? <Unlink className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
        </Btn>

        <Sep />

        <Btn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <Undo className="h-3.5 w-3.5" />
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
          <Redo className="h-3.5 w-3.5" />
        </Btn>
      </div>

      {/* Editor canvas */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-4
                   [&_.ProseMirror_h2]:text-xl  [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3
                   [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3
                   [&_.ProseMirror_p]:mb-2
                   [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2 [&_.ProseMirror_ul>li]:mb-1
                   [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2 [&_.ProseMirror_ol>li]:mb-1
                   [&_.ProseMirror_blockquote]:border-l-[3px] [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_blockquote]:my-3
                   [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer
                   [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_u]:underline [&_.ProseMirror_s]:line-through
                   [&_.ProseMirror_.ProseMirror-placeholder]:text-muted-foreground/50"
      />
    </div>
  )
}
