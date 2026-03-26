import { ValidationError } from '../utils/jsonValidator';

interface ErrorStateProps {
  error: ValidationError;
  onFocusInput: () => void;
}

export function ErrorState({ error, onFocusInput }: ErrorStateProps) {
  const errorText = error.line && error.column
    ? `Satır ${error.line}, Sütun ${error.column}: ${error.message}`
    : `Geçersiz JSON: ${error.message}`;

  return (
    <div className="flex flex-col h-full">
      {/* Left Pane: Editor with Error */}
      <section className="flex-1 flex flex-col bg-[#131313] relative overflow-hidden">
        <div className="flex-1 flex font-mono text-sm leading-relaxed relative">
          {/* Line Numbers */}
          <div className="w-12 bg-[#000000] text-[#767575]/40 py-4 flex flex-col items-center select-none text-[12px]">
            <span>01</span>
            <span>02</span>
            <span className="text-[#ff716c] font-bold">03</span>
            <span>04</span>
            <span>05</span>
          </div>
          {/* Textarea Content with Error Highlight */}
          <div className="flex-1 p-4 bg-[#131313] text-[#adaaaa] font-medium overflow-auto">
            <div className="opacity-80">{'{'}</div>
            <div className="pl-4 opacity-80">"version": "1.0.0",</div>
            <div className="pl-4 bg-[#9f0519]/20 text-[#ffffff] border-l-[3px] border-[#ff716c] py-0.5">
              {"\"metadata\": { \"id\": 102 } "}<span className="text-[#ff716c] font-bold">MISSING_COMMA</span>
            </div>
            <div className="pl-4 opacity-80">"active": true</div>
            <div className="opacity-80">{'}'}</div>
          </div>
        </div>
        {/* Error Banner */}
        <div className="bg-[#9f0519]/90 backdrop-blur-md px-6 py-4 flex items-center gap-4 text-[#ffa8a3] border-t border-[#ff716c]/20">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Hata Tespit Edildi</span>
            <button
              onClick={onFocusInput}
              className="text-sm font-medium text-left hover:underline cursor-pointer"
            >
              {errorText}
            </button>
          </div>
          <button
            onClick={() => {}}
            className="ml-auto p-1 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </section>
      {/* Tonal Shift Spacer */}
      <div className="w-[1px] bg-[#484847]/10"></div>
      {/* Right Pane: Output Empty State */}
      <section className="flex-1 bg-[#20201f] flex items-center justify-center p-12">
        <div className="text-center space-y-6 max-w-xs">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff716c]/5 rounded-none border border-[#ff716c]/20">
            <span className="material-symbols-outlined text-[#ff716c] text-3xl">close</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight uppercase text-[#ffffff]">Geçerli JSON girin</h2>
            <p className="text-[11px] text-[#adaaaa] uppercase tracking-widest leading-relaxed">
              Hataları düzeltmek için soldaki düzenleyiciyi kullanın. Sözdizimi geçerli olduğunda önizleme oluşturulacaktır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
