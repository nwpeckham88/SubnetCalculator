import React from 'react';

interface BinaryVisualizerProps {
  binaryIp: string;
  initialMask: number;
  newMask: number;
  mode: 'IPv4' | 'IPv6';
}

const Legend = ({ initialMask, newMask }: { initialMask: number, newMask: number }) => (
  <div className="flex flex-wrap gap-4 text-xs mb-2">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-net rounded-sm shadow-sm shadow-blue-500/50"></div>
      <span className="text-slate-300 font-medium">Network <span className="text-slate-500">/{initialMask}</span></span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-sub rounded-sm shadow-sm shadow-orange-500/50"></div>
      <span className="text-slate-300 font-medium">Subnet <span className="text-slate-500">/{newMask}</span></span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-host rounded-sm shadow-sm"></div>
      <span className="text-slate-300 font-medium">Host</span>
    </div>
  </div>
);

const BinaryVisualizer: React.FC<BinaryVisualizerProps> = ({ binaryIp, initialMask, newMask, mode }) => {
  const isV6 = mode === 'IPv6';

  // --- Helpers ---
  const getBitType = (index: number) => {
    if (index < initialMask) return 'Network';
    if (index >= initialMask && index < newMask) return 'Subnet';
    return 'Host';
  };

  const getBitColorClass = (index: number) => {
    if (index < initialMask) return 'bg-net text-white shadow-sm shadow-blue-500/20';
    if (index >= initialMask && index < newMask) return 'bg-sub text-white shadow-sm shadow-orange-500/20';
    return 'bg-host text-slate-900 border border-slate-400/20';
  };

  const getHexStyle = (nibbleIndex: number) => {
    const startBit = nibbleIndex * 4;
    const endBit = startBit + 3;

    // Pure States
    if (endBit < initialMask) return { backgroundColor: '#3b82f6', color: 'white', boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)' };
    if (startBit >= newMask) return { backgroundColor: '#9ca3af', color: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' };
    if (startBit >= initialMask && endBit < newMask) return { backgroundColor: '#f97316', color: 'white', boxShadow: '0 1px 2px rgba(249, 115, 22, 0.2)' };

    // Gradient State
    let netBits = 0;
    let subBits = 0;
    for (let b = startBit; b <= endBit; b++) {
      if (b < initialMask) netBits++;
      else if (b < newMask) subBits++;
    }

    const netPct = (netBits / 4) * 100;
    const subPct = (subBits / 4) * 100;
    const stop1 = netPct;
    const stop2 = netPct + subPct;

    const bg = `linear-gradient(90deg, 
      #3b82f6 0%, #3b82f6 ${stop1}%, 
      #f97316 ${stop1}%, #f97316 ${stop2}%, 
      #9ca3af ${stop2}%, #9ca3af 100%)`;
    
    return { background: bg, color: 'white' };
  };

  const getNibbleTooltip = (nibbleIndex: number, char: string) => {
    const startBit = nibbleIndex * 4;
    const endBit = startBit + 3;
    let typeDescription = "";
    
    if (endBit < initialMask) typeDescription = "Network Part";
    else if (startBit >= newMask) typeDescription = "Host Part";
    else if (startBit >= initialMask && endBit < newMask) typeDescription = "Subnet Part";
    else typeDescription = "Mixed Boundary";

    return `Nibble Index: ${nibbleIndex}\nBits: ${startBit + 1} - ${endBit + 1}\nHex Value: ${char}\nType: ${typeDescription}`;
  };

  if (!isV6) {
    // --- IPv4 Layout: 4 Octets ---
    const octets = [];
    for(let i=0; i<32; i+=8) {
      octets.push(binaryIp.substring(i, i+8).split(''));
    }

    return (
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-sm w-full">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">IPv4 Bits</h3>
           <Legend initialMask={initialMask} newMask={newMask} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {octets.map((bits, octetIndex) => (
             <div key={octetIndex} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
                <div className="w-full flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Octet {octetIndex + 1}</span>
                    <span className="text-[9px] font-mono text-slate-600">Bits {octetIndex * 8 + 1}-{ (octetIndex + 1) * 8 }</span>
                </div>
                
                <div className="flex justify-center gap-[2px] w-full">
                   {bits.map((bit, bitIdx) => {
                      const globalIndex = octetIndex * 8 + bitIdx;
                      return (
                        <div 
                          key={bitIdx} 
                          className={`flex-1 h-10 flex items-center justify-center rounded-[2px] text-base font-mono font-medium transition-all hover:opacity-90 hover:scale-105 ${getBitColorClass(globalIndex)}`}
                          title={`Bit Index: ${globalIndex + 1}\nValue: ${bit}\nType: ${getBitType(globalIndex)}`}
                        >
                          {bit}
                        </div>
                      );
                   })}
                </div>
                
                {/* Decimal Value of this Octet (Optional but nice) */}
                <div className="mt-2 text-xs font-mono text-slate-500">
                    Decimal: {parseInt(bits.join(''), 2)}
                </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  // --- IPv6 Layout: 8 Hextets ---
  const hexNibbles = [];
  for (let i = 0; i < 128; i += 4) {
    const chunk = binaryIp.substring(i, i + 4);
    const hexChar = parseInt(chunk, 2).toString(16);
    hexNibbles.push(hexChar);
  }
  
  const hextets = [];
  for (let i = 0; i < 32; i += 4) {
    hextets.push(hexNibbles.slice(i, i + 4));
  }

  return (
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-sm w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
           <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">IPv6 Segments</h3>
           <Legend initialMask={initialMask} newMask={newMask} />
        </div>
        
        {/* Grid Layout: 8 Hextets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           {hextets.map((nibbles, groupIndex) => (
             <div key={groupIndex} className="bg-slate-950/50 p-2 md:p-3 rounded-lg border border-slate-800 flex flex-col items-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                <div className="w-full flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seg {groupIndex + 1}</span>
                    <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">{groupIndex * 16 + 1}-{ (groupIndex + 1) * 16 }</span>
                </div>

                <div className="flex justify-center gap-[2px] w-full">
                   {nibbles.map((char, charIdx) => {
                      const globalIndex = groupIndex * 4 + charIdx;
                      return (
                        <div 
                          key={charIdx} 
                          style={getHexStyle(globalIndex)}
                          className="flex-1 h-8 sm:h-10 flex items-center justify-center rounded-[2px] text-sm sm:text-lg font-mono font-bold uppercase transition-transform hover:scale-105 cursor-help"
                          title={getNibbleTooltip(globalIndex, char)}
                        >
                          {char}
                        </div>
                      );
                   })}
                </div>
             </div>
           ))}
        </div>
      </div>
  );
};

export default BinaryVisualizer;