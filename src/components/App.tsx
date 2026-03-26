import { useState, useRef, useCallback, useEffect } from 'react';
import { parseJson, ValidationResult } from '../utils/jsonValidator';

type StatusState = 'ready' | 'valid' | 'invalid';

export function App() {
  const [input, setInput] = useState('');
  const [formattedOutput, setFormattedOutput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [status, setStatus] = useState<StatusState>('ready');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateStatus = useCallback((newStatus: StatusState) => {
    setStatus(newStatus);
  }, []);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = parseJson(input);
    setValidation(result);
    if (result.valid) {
      const formatted = JSON.stringify(result.data, null, 2);
      setFormattedOutput(formatted);
      updateStatus('valid');
    } else {
      setFormattedOutput('');
      updateStatus('invalid');
    }
  }, [input, updateStatus]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    const result = parseJson(input);
    setValidation(result);
    if (result.valid) {
      const minified = JSON.stringify(result.data);
      setFormattedOutput(minified);
      updateStatus('valid');
    } else {
      setFormattedOutput('');
      updateStatus('invalid');
    }
  }, [input, updateStatus]);

  const handleCopy = useCallback(() => {
    if (!formattedOutput) return;
    navigator.clipboard.writeText(formattedOutput).then(() => {
      setShowCopyToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowCopyToast(false);
      }, 2000);
    });
  }, [formattedOutput]);

  const handleClear = useCallback(() => {
    setInput('');
    setFormattedOutput('');
    setValidation(null);
    setStatus('ready');
    textareaRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormat();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'm') {
        e.preventDefault();
        handleMinify();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && formattedOutput) {
        // Only if textarea is NOT focused (copy output, not input)
        if (document.activeElement !== textareaRef.current) {
          e.preventDefault();
          handleCopy();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'x') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFormat, handleMinify, handleCopy, handleClear, formattedOutput]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const isEmpty = !input.trim();

  return (
    <div className="h-screen flex flex-col bg-[#0e0e0e] text-[#ffffff] overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center w-full px-8 py-6 bg-[#131313] border-b border-[#484847]/15">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black tracking-tighter text-[#81ecff] font-mono">FORMATTER</span>
          <nav className="flex gap-6">
            <a className="text-[#81ecff] border-b-2 border-[#81ecff] pb-1 font-mono tracking-tight uppercase text-sm cursor-pointer" href="#">EDITOR</a>
            <a className="text-[#adaaaa] hover:text-[#81ecff] transition-colors font-mono tracking-tight uppercase text-sm cursor-pointer" href="#">DOCS</a>
            <a className="text-[#adaaaa] hover:text-[#81ecff] transition-colors font-mono tracking-tight uppercase text-sm cursor-pointer" href="#">HISTORY</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          {status === 'ready' && (
            <div className="flex items-center gap-2 bg-[#484847]/10 text-[#adaaaa] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>HAZIR</span>
            </div>
          )}
          {status === 'valid' && (
            <div className="flex items-center gap-2 bg-[#4af8e3]/10 text-[#4af8e3] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>GEÇERLİ</span>
            </div>
          )}
          {status === 'invalid' && (
            <div className="flex items-center gap-2 bg-[#ff716c]/10 text-[#ff716c] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm">close</span>
              <span>GEÇERSİZ</span>
            </div>
          )}
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-[#adaaaa] cursor-pointer hover:text-[#81ecff] transition-colors">settings</span>
            <span className="material-symbols-outlined text-[#adaaaa] cursor-pointer hover:text-[#81ecff] transition-colors">help</span>
            <span className="material-symbols-outlined text-[#adaaaa] cursor-pointer hover:text-[#81ecff] transition-colors">account_circle</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden mt-[73px] mb-8">
        {/* Left Pane: Editor */}
        <section className="flex-1 flex flex-col bg-[#131313] relative overflow-hidden border-r border-[#484847]/15">
          {/* Editor Toolbar */}
          <div className="h-10 px-4 bg-[#131313] flex items-center justify-between border-b border-[#484847]/15">
            <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">input.json</span>
            <div className="flex gap-4">
              <button
                onClick={handleFormat}
                className="text-[10px] text-[#81ecff] uppercase font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                Biçimlendir
              </button>
              <button
                onClick={handleClear}
                className="text-[10px] text-[#adaaaa] uppercase font-bold hover:underline cursor-pointer"
              >
                Temizle
              </button>
            </div>
          </div>
          {/* Editor Content */}
          <div className="flex-1 flex font-mono text-sm relative">
            {/* Line Numbers */}
            <div className="w-12 bg-[#000000] text-[#767575]/40 py-4 flex flex-col items-center select-none text-[12px]">
              {input.split('\n').map((_, i) => (
                <span key={i}>{String(i + 1).padStart(2, '0')}</span>
              ))}
              {input === '' && <span>01</span>}
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (!e.target.value.trim()) {
                  setStatus('ready');
                  setFormattedOutput('');
                  setValidation(null);
                }
              }}
              className="flex-1 p-4 bg-[#131313] text-[#adaaaa] font-medium overflow-auto resize-none outline-none"
              placeholder="JSON yapıştırın veya sürükleyip bırakın"
            />
          </div>
        </section>

        {/* Right Pane: Tree View */}
        <section className="flex-1 bg-[#20201f] flex flex-col relative overflow-hidden">
          {/* Output Toolbar */}
          <div className="h-10 px-4 bg-[#1a1a1a] flex items-center justify-between border-b border-[#484847]/15">
            <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">tree_view.json</span>
            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="text-[10px] text-[#bc87fe] uppercase font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Kopyala
              </button>
              <button
                onClick={handleMinify}
                className="text-[10px] text-[#adaaaa] uppercase font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">compress</span>
                Minify
              </button>
            </div>
          </div>
          {/* Output Content */}
          <div className="flex-1 overflow-auto p-6">
            {formattedOutput ? (
              <pre className="text-sm text-[#81ecff] font-mono whitespace-pre-wrap">
                {formattedOutput}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-6 opacity-20">
                  <span className="material-symbols-outlined text-7xl text-[#bc87fe]">account_tree</span>
                </div>
                <p className="text-[#adaaaa] text-center max-w-sm leading-relaxed text-sm">
                  JSON girin, yapılandırılmış ağaç görünümünü burada keşfedin
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed top-24 right-8 bg-[#4af8e3] text-[#005762] px-6 py-3 font-bold text-sm rounded-sm shadow-lg z-50">
          Kopyalandı!
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full flex justify-between items-center px-6 py-2 bg-[#131313] border-t border-[#484847]/15 z-50">
        <div className="flex items-center gap-4">
          <span className="text-[#81ecff] font-bold font-mono text-[10px]">FORMATTER v1.2.4</span>
          <span className="text-[#adaaaa] font-mono text-[10px] uppercase font-medium">© 2024 MONOLITHIC LOGIC. ALL SYSTEMS OPERATIONAL.</span>
        </div>
        <div className="flex gap-6">
          <span className="text-[#adaaaa] hover:text-white transition-colors font-mono text-[10px] uppercase font-medium cursor-default">STATUS: OK</span>
          <span className="text-[#adaaaa] hover:text-white transition-colors font-mono text-[10px] uppercase font-medium cursor-default">ENCODING: UTF-8</span>
          <span className="text-[#81ecff] font-mono text-[10px] uppercase font-medium">{input.split('\n').length} LINES</span>
        </div>
      </footer>
    </div>
  );
}
