const activeAgents = [
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', alt: 'Agent 1' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', alt: 'Agent 2' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper', alt: 'Agent 3' },
];

export function LeftSidebar() {
  return (
    <div className="w-full md:w-[45%] bg-[#0B6C43] p-10 md:p-14 flex flex-col relative overflow-hidden">
      <div className="flex items-center space-x-2 mb-16 relative z-10">
        <img src="/logo.png" alt="OARI Logo" className="h-[40px] sm:h-[48px] w-auto shrink-0" />
        <div className="flex flex-col border-l border-white/30 pl-2">
          <span className="text-xs font-bold text-white leading-tight tracking-wide">Ethiopia OpenAgriNet</span>
          <span className="text-[10px] text-white/80 font-medium leading-tight tracking-wide">Access to Credit</span>
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-[10px] font-bold tracking-wider rounded-full uppercase mb-8 border border-white/10">
          FIELD AGENT PORTAL
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.2] tracking-tight">
          Empowering<br />Ethiopian<br />Agriculture
        </h1>
        <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-sm font-medium pr-4">
          Facilitating seamless credit access for millions of farmers through data-driven financial infrastructure. Secure, transparent, and resilient.
        </p>
      </div>

      <div className="mt-auto relative z-10 flex items-center gap-3">
        <div className="flex -space-x-3">
          {activeAgents.map((agent, index) => (
            <div key={index} className="w-10 h-10 rounded-full border-2 border-[#0B6C43] overflow-hidden flex items-center justify-center bg-white z-[3]">
              <img src={agent.src} alt={agent.alt} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-[#1F2937] border-2 border-[#0B6C43] flex items-center justify-center text-[10px] font-bold text-white z-[0]">
            +2k
          </div>
        </div>
        <span className="text-xs text-white/70 font-medium">Active agents in the field today</span>
      </div>
    </div>
  );
}
