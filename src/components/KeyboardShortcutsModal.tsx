import React, { useEffect, useRef } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  label: string;
  keys: string[];
}

const shortcuts: ShortcutItem[] = [
  { label: 'Biçimlendir', keys: ['CTRL', 'ENTER'] },
  { label: 'Küçült', keys: ['CTRL', 'SHIFT', 'M'] },
  { label: 'Kopyala', keys: ['CTRL', 'SHIFT', 'C'] },
  { label: 'Temizle', keys: ['CTRL', 'L'] },
  { label: 'Bu pencere', keys: ['?'] },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'CTRL';

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0e0e]/80 backdrop-blur-sm"
      onClick={handleOverlayClick}
      data-testid="keyboard-shortcuts-modal"
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-2xl border border-[#484847]/15 shadow-2xl relative overflow-hidden"
        style={{ background: 'rgba(26, 26, 26, 0.7)', backdropFilter: 'blur(20px)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-modal-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[#484847]/10">
          <h2
            id="keyboard-shortcuts-modal-title"
            className="text-2xl font-black tracking-tighter text-[#81ecff] uppercase"
          >
            Klavye Kısayolları
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-[#adaaaa] hover:text-[#81ecff] transition-colors"
            data-testid="close-modal-btn"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="group flex justify-between items-center py-4 px-4 hover:bg-[#262626] transition-colors"
              >
                <span className="text-[#adaaaa] text-sm tracking-widest uppercase">
                  {shortcut.label}
                </span>
                <div className="flex gap-2">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="flex gap-2">
                      <kbd className="px-2 py-1 bg-[#262626] text-[#81ecff] border border-[#484847]/20 text-xs font-bold">
                        {key === 'CTRL' ? modifierKey : key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-[#484847]">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#81ecff] via-[#bc87fe] to-[#a0fff0] opacity-50"></div>
      </div>
    </div>
  );
}
