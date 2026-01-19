import React from 'react';

interface IPv6ScopeVisualizerProps {
  prefix: number; // Child (New Mask)
  initialMask: number; // Parent (Initial Mask)
}

const ScaleCard = ({ title, count, analogy, icon, color, subtext, highlight = false }: any) => (
  <div className={`h-full relative flex flex-col items-center p-6 rounded-xl border transition-all duration-300 ${highlight ? 'bg-slate-800/80 border-indigo-500/50 shadow-xl scale-105 z-10' : 'bg-slate-900/50 border-slate-700/50 grayscale hover:grayscale-0'}`}>
    {highlight && <div className="absolute -top-3 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">Current Selection</div>}
    <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-3xl mb-4 shadow-lg ring-4 ring-opacity-20 ring-white flex-shrink-0`}>
      {icon}
    </div>
    <h4 className="text-sm font-bold text-slate-200 text-center uppercase tracking-wide mb-1">{title}</h4>
    <div className="text-xs font-mono text-slate-400 mb-3">{count}</div>
    <div className="flex-grow flex items-center justify-center">
        <p className="text-xs text-slate-300 text-center leading-relaxed opacity-90">
        {analogy}
        </p>
    </div>
    {subtext && <div className="w-full mt-4 pt-3 border-t border-slate-700/50 text-[10px] text-slate-500 text-center">{subtext}</div>}
  </div>
);

const IPv6ScopeVisualizer: React.FC<IPv6ScopeVisualizerProps> = ({ prefix, initialMask }) => {

  // --- Calculations ---
  // How many Child subnets fit in the Parent?
  const bitsForSubnets = Math.max(0, prefix - initialMask);
  const totalSubnets = 1n << BigInt(bitsForSubnets);
  
  // Grid Rendering (Cap at 256)
  const MAX_SQUARES = 256;
  const totalSquaresToRender = totalSubnets > BigInt(MAX_SQUARES) ? MAX_SQUARES : Number(totalSubnets);
  const isTruncated = totalSubnets > BigInt(MAX_SQUARES);

  // Format Helper
  const formatCount = (n: bigint) => {
    if (n < 10000n) return n.toString();
    if (n > 1000000000n) return "Billions+";
    return n.toLocaleString();
  };

  // --- Standards Definition ---
  const standards = [
    {
      mask: 48,
      label: "Enterprise / Ideal",
      subnets: "65,536",
      desc: "The 'Gold Standard' for IPv6 delegation. Typically assigned to business sites or by premium 'prosumer' ISPs. It allows for massive segmentation (Campus, VoIP, Guest, IoT, Lab) without ever running out of space.",
      verdict: "Best",
      color: "green"
    },
    {
      mask: 56,
      label: "Residential Standard",
      subnets: "256",
      desc: "The modern standard for Fiber & DSL (e.g., AT&T Fiber, Google Fiber). It provides 256 standard /64 LANs. This is the sweet spot for home power users—plenty of room for VLANs (IoT, Guest, Servers, Kids) without the waste of a /48.",
      verdict: "Good",
      color: "blue"
    },
    {
      mask: 60,
      label: "Basic Residential",
      subnets: "16",
      desc: "Common on large cable networks (e.g., Comcast/Xfinity). You get 16 standard /64 LANs. This is 'Okay'—it's enough for a basic segmentation strategy (Home + Guest + IoT), but might feel tight for complex homelabs requiring many VLANs.",
      verdict: "Okay",
      color: "amber"
    },
    {
      mask: 64,
      label: "Single LAN (Broken)",
      subnets: "1",
      desc: "The ISP assigns you a single subnet. You cannot create true VLANs because you cannot subnet a /64 further without breaking standard IPv6 features like SLAAC. If you need a Guest network, you are stuck using ugly NAT66 hacks.",
      verdict: "Bad",
      color: "red"
    }
  ];

  const activeStandard = standards.find(s => s.mask === initialMask);

  // --- Scale Logic ---
  let userScaleTitle = "A Single Subnet";
  let userScaleAnalogy = "One Giant Stadium";
  
  if (initialMask <= 48) {
     userScaleTitle = "A Metropolis of Subnets";
     userScaleAnalogy = "A massive city containing 65,536 Sports Stadiums.";
  } else if (initialMask <= 56) {
     userScaleTitle = "An Olympic Complex";
     userScaleAnalogy = "A large district containing 256 Sports Stadiums.";
  } else if (initialMask <= 60) {
     userScaleTitle = "A City Block";
     userScaleAnalogy = "A neighborhood containing 16 Sports Stadiums.";
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm mt-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">ISP Delegation Context</h3>
         </div>
         {activeStandard && (
             <span className={`px-3 py-1 rounded text-[11px] font-bold uppercase border bg-opacity-10 ${
                 activeStandard.color === 'green' ? 'border-green-500 bg-green-500 text-green-400' :
                 activeStandard.color === 'blue' ? 'border-blue-500 bg-blue-500 text-blue-400' :
                 activeStandard.color === 'amber' ? 'border-amber-500 bg-amber-500 text-amber-400' :
                 'border-red-500 bg-red-500 text-red-400'
             }`}>
                Verdict: {activeStandard.verdict}
             </span>
         )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Col: Visual Capacity Grid + Stats */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subnet Capacity</h4>
          
          {/* Top Block: Visualization */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-5 flex flex-col min-h-[220px]">
             <div className="flex justify-between items-end mb-4">
                <div>
                   <div className="text-4xl font-mono font-bold text-white leading-none tracking-tight">{formatCount(totalSubnets)}</div>
                   <div className="text-sm text-slate-500 mt-1 font-medium">
                      Available <strong>/{prefix}</strong> Networks
                   </div>
                </div>
             </div>

             {/* The Visual Grid */}
             <div className="relative mb-2 flex-grow">
                 {totalSquaresToRender > 0 ? (
                    <div className="grid grid-cols-16 gap-0.5 w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12px, 1fr))' }}>
                        {Array.from({ length: totalSquaresToRender }).map((_, i) => (
                            <div 
                            key={i} 
                            className={`aspect-square rounded-[1px] ${i === 0 ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors`}
                            title={`Network #${i+1}`}
                            ></div>
                        ))}
                    </div>
                 ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm italic border border-dashed border-slate-800 rounded">
                        Invalid Configuration
                    </div>
                 )}
                 
                 {isTruncated && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] text-indigo-200 font-bold bg-indigo-900/90 px-3 py-1 rounded-full border border-indigo-500/30 shadow-lg">
                            + {formatCount(totalSubnets - BigInt(MAX_SQUARES))} more...
                        </span>
                    </div>
                 )}
             </div>
             
             {/* Subnetting Warning */}
             {prefix > 64 && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded flex gap-3">
                    <div className="text-red-400 mt-0.5 text-lg">⚠️</div>
                    <div>
                        <h6 className="text-xs font-bold text-red-300 uppercase">SLAAC Broken</h6>
                        <p className="text-[11px] text-red-200/70 leading-relaxed mt-1">
                            Splitting a /64 breaks Stateless Address Auto-Configuration (SLAAC).
                        </p>
                    </div>
                </div>
             )}
          </div>

          {/* Bottom Block: Stats */}
          <div className="bg-slate-800/40 rounded-lg p-5 border border-slate-700/50 flex-grow">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">The Cosmic Scale of IPv6</h5>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-400">Addresses in ONE <span className="text-white font-mono bg-slate-700 px-1 rounded">/64</span></span>
                        <span className="text-indigo-300 font-mono font-bold">18.4 Quintillion</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-right tracking-tighter">
                        18,446,744,073,709,551,616
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-700/50 pt-3">
                    <span className="text-slate-400"><span className="text-white font-mono bg-slate-700 px-1 rounded">/64</span> networks in a <span className="text-white font-mono bg-slate-700 px-1 rounded">/48</span></span>
                    <span className="text-green-400 font-mono font-bold">65,536</span>
                </div>
            </div>
          </div>

        </div>

        {/* Right Col: Standards Comparison List */}
        <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Common ISP Assignments</h4>
            
            {standards.map((std) => {
                const isActive = std.mask === initialMask;
                const activeClasses = isActive 
                    ? "ring-1 ring-offset-0 ring-opacity-50 opacity-100 shadow-lg scale-[1.02]" 
                    : "opacity-50 hover:opacity-100 scale-100 cursor-help hover:bg-slate-800";
                
                let colorClasses = "border-slate-700 bg-slate-900";
                if (isActive) {
                    if (std.color === 'green') colorClasses = "border-green-500 bg-green-900/10 ring-green-500";
                    if (std.color === 'blue') colorClasses = "border-blue-500 bg-blue-900/10 ring-blue-500";
                    if (std.color === 'amber') colorClasses = "border-amber-500 bg-amber-900/10 ring-amber-500";
                    if (std.color === 'red') colorClasses = "border-red-500 bg-red-900/10 ring-red-500";
                }

                return (
                    <div 
                        key={std.mask}
                        className={`relative group rounded-lg border p-4 transition-all duration-300 ${colorClasses} ${activeClasses}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`font-mono text-lg font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>/{std.mask}</span>
                                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{std.label}</span>
                            </div>
                            {isActive ? (
                                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{std.subnets} LANs</span>
                            ) : (
                                <span className="text-[10px] text-slate-600 font-mono hidden sm:inline group-hover:text-slate-400">Hover for info</span>
                            )}
                        </div>
                        {isActive && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-700/50 pt-2">{std.desc}</p>
                            </div>
                        )}
                        {!isActive && (
                            <div className="absolute z-20 left-0 bottom-full mb-2 w-full p-4 bg-slate-800 text-slate-200 text-sm rounded-lg shadow-2xl border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-y-2 group-hover:translate-y-0">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                                    <span className="font-bold text-white">/{std.mask}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                        std.color === 'green' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                        std.color === 'blue' ? 'border-blue-500 text-blue-400 bg-blue-500/10' :
                                        std.color === 'amber' ? 'border-amber-500 text-amber-400 bg-amber-500/10' :
                                        'border-red-500 text-red-400 bg-red-500/10'
                                    }`}>{std.verdict}</span>
                                </div>
                                <p className="leading-relaxed text-slate-300 text-xs">{std.desc}</p>
                                <div className="mt-2 text-[10px] font-mono text-slate-500">Contains {std.subnets} /64 LANs</div>
                                <div className="absolute left-6 -bottom-1.5 w-3 h-3 bg-slate-800 border-b border-r border-slate-600 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
      </div>

      {/* --- INFOGRAPHIC SECTION --- */}
      <div className="border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8">
        <div className="text-center mb-10">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Visualizing the Impossible Scale</h4>
            <p className="text-slate-500 text-xs">If the entire IPv4 Internet was a golf ball...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            
            {/* 1. IPv4 */}
            <ScaleCard 
                title="IPv4 Internet" 
                count="4.3 Billion Addrs" 
                analogy="A single Golf Ball"
                icon={<span>⛳</span>}
                color="bg-blue-500/20 text-blue-400"
                subtext="The entire internet from 1983-2015 fits in your hand."
            />

            {/* 2. IPv6 /64 */}
            <ScaleCard 
                title="One /64 Subnet" 
                count="18 Quintillion Addrs" 
                analogy="A Giant Stadium filled with Golf Balls"
                icon={<span>🏟️</span>}
                color="bg-indigo-500/20 text-indigo-400"
                subtext="A single standard LAN segment holds more addresses than 4 billion IPv4 Internets combined."
            />

            {/* 3. Your Selection */}
            <ScaleCard 
                title={`Your /${initialMask} Range`} 
                count={`${formatCount(totalSubnets)} Subnets`} 
                analogy={userScaleAnalogy}
                icon={<span>🏙️</span>}
                color="bg-green-500/20 text-green-400"
                highlight={true}
                subtext="Your current allocation from the ISP."
            />

            {/* 4. IPv6 Total */}
            <ScaleCard 
                title="Total IPv6 Space" 
                count="340 Undecillion" 
                analogy="The Sun (filled with Stadiums)"
                icon={<span>☀️</span>}
                color="bg-amber-500/20 text-amber-400"
                subtext="There is enough space for every atom on Earth to have its own internet."
            />

        </div>
      </div>
    </div>
  );
};

export default IPv6ScopeVisualizer;