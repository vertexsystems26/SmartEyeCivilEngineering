"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichText } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";

/*
 * Rich text stored as Tiptap JSON (not HTML): the public site renders it with
 * its own components, so pasted markup can never inject scripts or styles.
 * Only the structure the site supports is offered: h2/h3, lists, quotes,
 * bold, italic, underline, links.
 */
type Props = { id: string; value: RichText | null; onChange: (value: RichText | null) => void; describedBy?: string };

export function RichTextEditor({ id, value, onChange, describedBy }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder: "Commencez à écrire…" }),
    ],
    content: value ?? "",
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        class: "rich-text min-h-48 px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? null : (editor.getJSON() as RichText)),
  });

  return (
    <div className="overflow-hidden rounded-control border border-sage-300 bg-paper focus-within:border-pine-600 focus-within:ring-2 focus-within:ring-pine-600/30">
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-line bg-sand-100" />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const setLink = () => {
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Adresse du lien (laisser vide pour retirer le lien)", previous);
    if (url === null) return;
    if (url.trim() === "") chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const buttons: { label: string; text: string; active?: boolean; disabled?: boolean; run: () => void }[] = [
    { label: "Titre 2", text: "T2", active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "Titre 3", text: "T3", active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "Gras", text: "G", active: state.bold, run: () => chain().toggleBold().run() },
    { label: "Italique", text: "I", active: state.italic, run: () => chain().toggleItalic().run() },
    { label: "Souligné", text: "S", active: state.underline, run: () => chain().toggleUnderline().run() },
    { label: "Liste à puces", text: "•", active: state.bullet, run: () => chain().toggleBulletList().run() },
    { label: "Liste numérotée", text: "1.", active: state.ordered, run: () => chain().toggleOrderedList().run() },
    { label: "Citation", text: "❝", active: state.quote, run: () => chain().toggleBlockquote().run() },
    { label: "Lien", text: "🔗", active: state.link, run: setLink },
    { label: "Annuler", text: "↶", disabled: !state.canUndo, run: () => chain().undo().run() },
    { label: "Rétablir", text: "↷", disabled: !state.canRedo, run: () => chain().redo().run() },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Mise en forme"
      className="flex flex-wrap gap-1 border-b border-line bg-sand-100 p-1.5"
    >
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          aria-label={b.label}
          aria-pressed={b.active ?? undefined}
          disabled={b.disabled}
          onClick={b.run}
          className={cn(
            "min-h-9 min-w-9 rounded-[8px] px-2 text-small font-semibold text-ink transition-colors hover:bg-mist-200 disabled:opacity-40",
            b.active && "bg-pine-600 text-paper hover:bg-pine-700",
          )}
        >
          {b.text}
        </button>
      ))}
    </div>
  );
}
