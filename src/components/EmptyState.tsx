interface EmptyStateProps {
  onFormat: () => void;
}

export function EmptyState({ onFormat }: EmptyStateProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Left Pane: Editor (Input) */}
      <section className="flex-1 bg-[#0e0e0e] flex flex-col relative group">
        {/* Toolbar for Editor */}
        <div className="h-10 px-4 bg-[#131313] flex items-center justify-between border-b border-[#484847]/10">
          <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">input.json</span>
          <div className="flex gap-4">
            <button className="text-[10px] text-[#81ecff] uppercase font-bold hover:underline cursor-pointer">Dosya Yükle</button>
            <button className="text-[10px] text-[#adaaaa] uppercase font-bold cursor-pointer">Temizle</button>
          </div>
        </div>
        <div className="flex-grow flex">
          {/* Gutter */}
          <div className="w-12 bg-gradient-to-r from-[#131313] to-[#1a1a1a] flex flex-col items-center pt-4 text-[#adaaaa]/30 text-[12px] select-none">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          {/* Empty State Content */}
          <div className="flex-grow flex flex-col items-center justify-center p-12 transition-all duration-300 bg-[#131313] group-focus-within:bg-[#262626]">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#484847] flex items-center justify-center mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[#81ecff] text-3xl">upload_file</span>
            </div>
            <p className="text-[#adaaaa] text-center max-w-xs leading-relaxed font-medium">
              JSON yapıştırın veya sürükleyip bırakın
            </p>
            <button
              onClick={onFormat}
              className="mt-8 px-6 py-2 bg-gradient-to-r from-[#00e3fd] to-[#00d4ec] text-[#005762] font-bold text-xs uppercase tracking-tighter rounded-sm hover:shadow-[0_0_20px_rgba(129,236,255,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              BIÇIMLENDIR
            </button>
          </div>
        </div>
      </section>
      {/* Divider Line */}
      <div className="w-[1px] bg-[#484847]/10 h-full"></div>
      {/* Right Pane: Tree View (Output) */}
      <section className="flex-1 bg-[#20201f] flex flex-col">
        {/* Toolbar for Tree View */}
        <div className="h-10 px-4 bg-[#1a1a1a] flex items-center justify-between border-b border-[#484847]/10">
          <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">tree_view.json</span>
          <div className="flex gap-4">
            <button className="text-[10px] text-[#bc87fe] uppercase font-bold hover:underline cursor-pointer">Kopyala</button>
            <button className="text-[10px] text-[#adaaaa] uppercase font-bold cursor-pointer">Genişlet</button>
          </div>
        </div>
        {/* Empty State Content */}
        <div className="flex-grow flex flex-col items-center justify-center p-12 bg-[#20201f]">
          <div className="mb-6 opacity-20">
            <span className="material-symbols-outlined text-7xl text-[#bc87fe]">account_tree</span>
          </div>
          <p className="text-[#adaaaa] text-center max-w-sm leading-relaxed text-sm">
            JSON girin, yapılandırılmış ağaç görünümünü burada keşfedin
          </p>
          <div className="mt-8 grid grid-cols-2 gap-2 opacity-30">
            <div className="h-1 w-24 bg-[#484847] rounded-full"></div>
            <div className="h-1 w-12 bg-[#484847] rounded-full"></div>
            <div className="h-1 w-16 bg-[#484847] rounded-full col-start-2"></div>
            <div className="h-1 w-20 bg-[#484847] rounded-full"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
