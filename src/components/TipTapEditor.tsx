"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // ← fixes SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px]",
      },
    },
  });

  if (!mounted || !editor) return null;

  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      label: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      label: "Italic",
    },
    {
      icon: UnderlineIcon,
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      label: "Underline",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      label: "Heading",
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      label: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      label: "Numbered List",
    },
  ];

  return (
    <div className="tiptap-editor">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-surface-2 rounded-t-xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              onClick={tool.action}
              type="button"
              className={`p-2 rounded-lg transition-all duration-200 ${tool.active
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:text-text hover:bg-surface"
              }`}
              title={tool.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      {/* Editor */}
      <div className="bg-surface-2 rounded-b-xl border-x border-b border-border">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}