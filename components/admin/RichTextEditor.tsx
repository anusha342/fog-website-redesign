'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { useRef, useState, useEffect } from 'react';
import styles from './rich-text-editor.module.css';

interface Props {
  value:    string;
  onChange: (html: string) => void;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

interface TBtnProps {
  onClick:    () => void;
  active?:    boolean;
  disabled?:  boolean;
  title:      string;
  children:   React.ReactNode;
}

function TBtn({ onClick, active, disabled, title, children }: TBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }} // prevent editor blur
      disabled={disabled}
      title={title}
      className={`${styles.tbtn} ${active ? styles.tbtnActive : ''} ${disabled ? styles.tbtnDisabled : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className={styles.divider} aria-hidden="true" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange }: Props) {
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError,     setImgError]     = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable h1 — blog posts should never contain h1 (page has one already)
        heading: { levels: [2, 3] },
      }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: { class: styles.proseMirror },
    },
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  // Sync external value changes into the editor (e.g., if parent resets the form)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '');
    }
    // Only run when `value` prop changes from outside, not on every editor keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Image upload handler ────────────────────────────────────────────────────
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setImgError('Only JPG, PNG, WebP and GIF are allowed.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setImgError('Image must be smaller than 4 MB.');
      return;
    }

    setImgUploading(true);
    setImgError('');

    try {
      const body = new FormData();
      body.append('file', file);
      const res  = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        setImgError(data.error || 'Upload failed.');
        return;
      }

      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch {
      setImgError('Network error during image upload.');
    } finally {
      setImgUploading(false);
    }
  }

  if (!editor) return null;

  return (
    <div className={styles.wrap}>

      {/* Hidden file input for body images */}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageFile}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">

        {/* Text style */}
        <TBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </TBtn>

        <Divider />

        {/* Headings */}
        <TBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </TBtn>

        <Divider />

        {/* Lists */}
        <TBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          &#8226;&#8212;
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          1.&#8212;
        </TBtn>

        <Divider />

        {/* Blocks */}
        <TBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          &#10077;
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          {'</>'}
        </TBtn>

        <Divider />

        {/* Extras */}
        <TBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          &#8212;
        </TBtn>

        {/* Image insert */}
        <TBtn
          onClick={() => imgInputRef.current?.click()}
          disabled={imgUploading}
          title="Insert image"
        >
          {imgUploading ? <span className={styles.miniSpinner} /> : '&#128247;'}
        </TBtn>

      </div>

      {/* Image upload error */}
      {imgError && (
        <div className={styles.imgErr}>
          {imgError}
          <button
            type="button"
            onClick={() => setImgError('')}
            className={styles.imgErrClose}
            aria-label="Dismiss"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* ── Editor content area ─────────────────────────────────────────── */}
      <div className={styles.editorWrap}>
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>

      {/* Word / char count */}
      <div className={styles.footer}>
        <span className={styles.wordCount}>
          {editor.storage.characterCount?.words?.() ?? countWords(editor.getText())} words
        </span>
      </div>

    </div>
  );
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
