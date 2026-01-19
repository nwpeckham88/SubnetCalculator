import React, { useState, useEffect, useMemo } from 'react';
import { 
  calculateSubnetDetails, classifyIp, isValidIp,
  calculateIpv6Details, classifyIpv6, isValidIpv6 
} from './utils/subnetUtils';
import { CalculationContext, IpMode } from './types';
import BinaryVisualizer from './components/BinaryVisualizer';
import SubnetTable from './components/SubnetTable';
import InfoCard from './components/InfoCard';
import AiTutor from './components/AiTutor';
import IPv6ScopeVisualizer from './components/IPv6ScopeVisualizer';

const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const App: React.FC = () => {
  // --- Central State ---
  const [mode, setMode] = useState<IpMode>('IPv4');
  const [compressV6, setCompressV6] = useState(true);
  
  // IPv4 State
  const [ip4, setIp4] = useState<string>('192.168.1.10');
  const [mask4Init, setMask4Init] = useState<number>(24);
  const [mask4New, setMask4New] = useState<number>(26);

  // IPv6 State
  const [ip6, setIp6] = useState<string>('2001:db8:abcd::1');
  const [mask6Init, setMask6Init] = useState<number>(48);
  const [mask6New, setMask6New] = useState<number>(64);

  // --- Logic Selection ---
  const ip = mode === 'IPv4' ? ip4 : ip6;
  const initialMask = mode === 'IPv4' ? mask4Init : mask6Init;
  const newMask = mode === 'IPv4' ? mask4New : mask6New;

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'IPv4') setIp4(e.target.value);
    else setIp6(e.target.value);
  };

  const handleInitialMaskChange = (val: number) => {
      if (mode === 'IPv4') setMask4Init(val);
      else setMask6Init(val);
  };

  const handleNewMaskChange = (val: number) => {
      if (mode === 'IPv4') setMask4New(val);
      else setMask6New(val);
  };

  // Mask Constraint Logic
  useEffect(() => {
    if (newMask < initialMask) {
        if (mode === 'IPv4') setMask4New(initialMask);
        else setMask6New(initialMask);
    }
  }, [initialMask, newMask, mode]);


  // --- Calculation ---
  const contextData: CalculationContext = useMemo(() => {
    if (mode === 'IPv4') {
        const valid = isValidIp(ip4);
        const safeIp = valid ? ip4 : '0.0.0.0';
        const details = calculateSubnetDetails(safeIp, mask4New);
        const classification = classifyIp(safeIp);

        return {
            mode: 'IPv4',
            ip: safeIp,
            initialMask: mask4Init,
            newMask: mask4New,
            networkAddress: details.networkAddress,
            broadcastAddress: details.broadcastAddress,
            firstUsable: details.firstUsable,
            lastUsable: details.lastUsable,
            totalHosts: details.totalHosts,
            subnetMaskString: details.subnetMaskString,
            binaryIp: details.binaryIp,
            binaryMask: details.binaryMask,
            ipClass: classification.type,
            isPrivate: classification.isPrivate,
        };
    } else {
        const valid = isValidIpv6(ip6);
        const safeIp = valid ? ip6 : '::';
        const details = calculateIpv6Details(safeIp, mask6New);
        const classification = classifyIpv6(safeIp);
        
        return {
            mode: 'IPv6',
            ip: safeIp,
            initialMask: mask6Init,
            newMask: mask6New,
            networkAddress: details.networkAddress,
            broadcastAddress: details.broadcastAddress, // Acts as Last Range End
            firstUsable: details.firstUsable,
            lastUsable: details.lastUsable,
            totalHosts: details.totalHosts,
            subnetMaskString: details.subnetMaskString,
            binaryIp: details.binaryIp,
            binaryMask: details.binaryMask,
            ipClass: classification.type,
            isPrivate: classification.isPrivate,
        };
    }
  }, [mode, ip4, mask4Init, mask4New, ip6, mask6Init, mask6New]);

  const isValidCurrent = mode === 'IPv4' ? isValidIp(ip) : isValidIpv6(ip);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <NetworkIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SubnetAI</h1>
              <p className="text-slate-400 text-xs md:text-sm">Interactive {mode} Calculator & Tutor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Compress Toggle (IPv6 Only) */}
             {mode === 'IPv6' && (
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400">Compressed</span>
                    <button 
                        onClick={() => setCompressV6(!compressV6)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${compressV6 ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${compressV6 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>
             )}

            {/* Mode Toggle */}
            <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
                <button 
                    onClick={() => setMode('IPv4')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'IPv4' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    IPv4
                </button>
                <button 
                    onClick={() => setMode('IPv6')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'IPv6' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    IPv6
                </button>
            </div>
          </div>
        </div>

        {/* Top Section: Split Columns (Static Layout) */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN: Controls & Visuals --- */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Controls Card */}
            <div className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-700 shadow-lg">
              
              {/* IP Input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {mode} Address
                </label>
                <input 
                  type="text" 
                  value={ip}
                  onChange={handleIpChange}
                  className={`w-full bg-slate-950 border-2 rounded-lg p-3 font-mono text-sm md:text-lg transition-colors focus:outline-none ${isValidCurrent ? 'border-slate-700 focus:border-blue-500 text-white' : 'border-red-500/50 text-red-200 focus:border-red-500'}`}
                  placeholder={mode === 'IPv4' ? "192.168.1.1" : "2001:db8::1"}
                />
                {!isValidCurrent && <p className="text-red-400 text-xs mt-1">Invalid {mode} format</p>}
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Initial Mask */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-semibold text-net uppercase tracking-wider">
                      {mode === 'IPv6' ? 'Parent Prefix' : 'Initial Mask'}
                    </label>
                    <span className="font-mono text-xl font-bold text-net">/{initialMask}</span>
                  </div>
                  <input 
                    type="range" 
                    min={mode === 'IPv4' ? 1 : 1} 
                    max={mode === 'IPv4' ? 32 : 128} 
                    value={initialMask}
                    onChange={(e) => handleInitialMaskChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>/1</span>
                    <span>{mode === 'IPv4' ? '/32' : '/128'}</span>
                  </div>
                </div>

                {/* New Mask */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-semibold text-sub uppercase tracking-wider">
                      {mode === 'IPv6' ? 'Child Prefix' : 'New Mask'}
                    </label>
                    <span className="font-mono text-xl font-bold text-sub">/{newMask}</span>
                  </div>
                  <input 
                    type="range" 
                    min={initialMask} 
                    max={mode === 'IPv4' ? 32 : 128} 
                    value={newMask}
                    onChange={(e) => handleNewMaskChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>/{initialMask}</span>
                    <span>{mode === 'IPv4' ? '/32' : '/128'}</span>
                  </div>
                </div>
              </div>

              <InfoCard data={contextData} compressed={compressV6} />
            </div>

            {/* Visualizer */}
            <BinaryVisualizer 
              binaryIp={contextData.binaryIp} 
              initialMask={initialMask} 
              newMask={newMask} 
              mode={mode}
            />
          </div>

          {/* --- RIGHT COLUMN: Table --- */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Subnet Table */}
            <div>
              <SubnetTable 
                currentIp={contextData.ip}
                initialMask={initialMask}
                newMask={newMask}
                mode={mode}
                compressed={compressV6}
              />
            </div>

            {/* AI Tutor Removed from here - moved to bottom */}

          </div>
        </div>

        {/* Bottom Section: IPv6 Scope Visualizer */}
        {mode === 'IPv6' && (
             <div className="w-full pb-8">
                <IPv6ScopeVisualizer prefix={newMask} initialMask={initialMask} />
             </div>
        )}

      </div>

      {/* Floating AI Tutor - Fixed to screen */}
      <AiTutor context={contextData} />
    </div>
  );
};

export default App;