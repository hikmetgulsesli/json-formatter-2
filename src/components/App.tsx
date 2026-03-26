import { useState, useRef, useCallback, useEffect } from 'react';
import { parseJson, ValidationResult } from '../utils/jsonValidator';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export function App() {
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateInput = useCallback((value: string) => {
    if (!value.trim()) {
      setValidation(null);
      setShowErrorBanner(false);
      return;
    }
    const result = parseJson(value);
    setValidation(result);
    setShowErrorBanner(!result.valid);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateInput(input);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [input, validateInput]);

  const handleFocusInput = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const handleFormat = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const isEmpty = !input.trim();
  const hasError = validation && !validation.valid;
  const isValid = validation && validation.valid;

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
          {isEmpty && (
            <div className="flex items-center gap-2 bg-[#484847]/10 text-[#adaaaa] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>HAZIR</span>
            </div>
          )}
          {isValid && (
            <div className="flex items-center gap-2 bg-[#4af8e3]/10 text-[#4af8e3] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>GEÇERLİ</span>
            </div>
          )}
          {hasError && (
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

      {/* Main Content Area */}
      {isEmpty ? (
        <EmptyState onFormat={handleFormat} />
      ) : hasError ? (
        <ErrorState error={validation.error!} onFocusInput={handleFocusInput} />
      ) : (
        <ValidJsonView input={input} validation={validation!} />
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

interface ValidJsonViewProps {
  input: string;
  validation: ValidationResult;
}

function ValidJsonView({ input, validation }: ValidJsonViewProps) {
  const formatted = JSON.stringify(validation.data, null, 2);

  return (
    <div className="flex-1 flex overflow-hidden ml-0 mt-[73px] mb-8">
      {/* Left Pane: Editor */}
      <section className="flex-1 flex flex-col bg-[#131313] relative overflow-hidden">
        <div className="flex-1 flex font-mono text-sm leading-relaxed relative">
          {/* Line Numbers */}
          <div className="w-12 bg-[#000000] text-[#767575]/40 py-4 flex flex-col items-center select-none text-[12px]">
            {input.split('\n').map((_, i) => (
              <span key={i}>{String(i + 1).padStart(2, '0')}</span>
            ))}
          </div>
          {/* Textarea */}
          <textarea
            value={input}
            onChange={() => {}}
            className="flex-1 p-4 bg-[#131313] text-[#adaaaa] font-medium overflow-auto resize-none outline-none"
            placeholder="JSON yapıştırın veya sürükleyip bırakın"
          />
        </div>
      </section>
      {/* Divider */}
      <div className="w-[1px] bg-[#484847]/10"></div>
      {/* Right Pane: Tree View */}
      <section className="flex-1 bg-[#20201f] flex flex-col p-6 overflow-auto">
        <pre className="text-sm text-[#81ecff] font-mono whitespace-pre-wrap">
          {formatted}
        </pre>
      </section>
    </div>
  );
}
