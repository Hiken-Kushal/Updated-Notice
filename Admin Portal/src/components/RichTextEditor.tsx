import React, { useRef, useEffect, useState, useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter formatted circular instructions and description...',
  minHeight = '180px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isUpdatingRef = useRef(false);

  // Sync incoming value to editor contentEditable when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isUpdatingRef.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }, [onChange]);

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        executeCommand('bold');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        executeCommand('italic');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        executeCommand('underline');
      }
    }
  };

  const isEmpty = !value || value === '<p><br></p>' || value === '<br>' || value.trim() === '';

  return (
    <div
      className={`w-full rounded-lg border transition-all bg-white flex flex-col overflow-hidden ${
        isFocused
          ? 'border-[#003c84] ring-1 ring-[#003c84]'
          : 'border-[#e2e6ec] hover:border-[#cbd5e1]'
      }`}
    >
      {/* Formatting Toolbar */}
      <div className="bg-[#f8fafc] px-2.5 py-1.5 border-b border-[#e2e6ec] flex items-center gap-1 flex-wrap select-none">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('bold');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer font-bold text-xs"
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <span className="material-symbols-outlined text-[18px]">format_bold</span>
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('italic');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <span className="material-symbols-outlined text-[18px]">format_italic</span>
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('underline');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <span className="material-symbols-outlined text-[18px]">format_underlined</span>
        </button>

        <div className="h-4 w-px bg-[#cbd5e1] mx-0.5" />

        {/* Align Left */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyLeft');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Align Left"
          aria-label="Align Left"
        >
          <span className="material-symbols-outlined text-[18px]">format_align_left</span>
        </button>

        {/* Align Center */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyCenter');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Align Center"
          aria-label="Align Center"
        >
          <span className="material-symbols-outlined text-[18px]">format_align_center</span>
        </button>

        {/* Align Right */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('justifyRight');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Align Right"
          aria-label="Align Right"
        >
          <span className="material-symbols-outlined text-[18px]">format_align_right</span>
        </button>

        <div className="h-4 w-px bg-[#cbd5e1] mx-0.5" />

        {/* Bullet List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('insertUnorderedList');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Bulleted List"
          aria-label="Bulleted List"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('insertOrderedList');
          }}
          className="p-1.5 text-[#434751] hover:text-[#00275a] hover:bg-[#e2e6ec]/80 rounded transition-colors cursor-pointer text-xs"
          title="Numbered List"
          aria-label="Numbered List"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
        </button>

        <div className="h-4 w-px bg-[#cbd5e1] mx-0.5" />

        {/* Clear Formatting */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('removeFormat');
          }}
          className="p-1.5 text-[#737782] hover:text-[#ef4444] hover:bg-[#ffdad6]/60 rounded transition-colors cursor-pointer text-xs"
          title="Clear Formatting"
          aria-label="Clear Formatting"
        >
          <span className="material-symbols-outlined text-[18px]">format_clear</span>
        </button>

        <span className="ml-auto text-[10px] text-[#737782] font-medium hidden sm:inline-block">
          Rich Text
        </span>
      </div>

      {/* Editable Area */}
      <div className="relative flex-1 p-3.5">
        {isEmpty && !isFocused && (
          <div className="absolute top-3.5 left-3.5 text-sm text-[#737782] pointer-events-none select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          style={{ minHeight }}
          className="outline-none text-sm text-[#1c1b1b] leading-relaxed prose prose-sm max-w-none [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
        />
      </div>
    </div>
  );
};
