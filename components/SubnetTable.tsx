import React, { useMemo } from 'react';
import { 
  ipToLong, longToIp, getSubnetMaskLong, 
  expandIpv6, ipv6ToBigInt, bigIntToIpv6, compressIpv6 
} from '../utils/subnetUtils';

interface SubnetTableProps {
  currentIp: string;
  initialMask: number;
  newMask: number;
  mode: 'IPv4' | 'IPv6';
  compressed?: boolean;
}

const SubnetTable: React.FC<SubnetTableProps> = ({ currentIp, initialMask, newMask, mode, compressed = false }) => {
  
  const rows = useMemo(() => {
    // Safety check
    if (newMask < initialMask) return { rows: [], total: 0, startIndex: 0 };

    if (mode === 'IPv4') {
        const ipLong = ipToLong(currentIp);
        const initialMaskLong = getSubnetMaskLong(initialMask);
        const newMaskLong = getSubnetMaskLong(newMask);
        
        const blockBase = (ipLong & initialMaskLong) >>> 0;
        const subnetSize = Math.pow(2, 32 - newMask);
        const currentSubnetNetwork = (ipLong & newMaskLong) >>> 0;
        const currentIndex = Math.floor((currentSubnetNetwork - blockBase) / subnetSize);
        const totalSubnets = Math.pow(2, newMask - initialMask);
        
        const range = 5;
        const start = Math.max(0, currentIndex - range);
        const end = Math.min(totalSubnets - 1, currentIndex + range);

        const generatedRows = [];

        for (let i = start; i <= end; i++) {
            const netAddrLong = (blockBase + (i * subnetSize)) >>> 0;
            const broadAddrLong = (netAddrLong + subnetSize - 1) >>> 0;
            const firstHost = (netAddrLong + 1) >>> 0;
            const lastHost = (broadAddrLong - 1) >>> 0;
            
            generatedRows.push({
                index: i,
                network: longToIp(netAddrLong),
                range: `${longToIp(firstHost)} ...`, 
                broadcast: longToIp(broadAddrLong),
                isCurrent: netAddrLong === currentSubnetNetwork
            });
        }
        return { rows: generatedRows, total: totalSubnets, startIndex: start };
    } else {
        // IPv6 Logic using BigInt
        try {
            const expanded = expandIpv6(currentIp);
            const ipBi = ipv6ToBigInt(expanded);
            
            // Masks
            const diff = BigInt(newMask - initialMask);
            const totalSubnets = 1n << diff;

            // Block Base
            const shiftInitial = 128n - BigInt(initialMask);
            const maskInitial = ((1n << 128n) - 1n) >> shiftInitial << shiftInitial;
            const blockBase = ipBi & maskInitial;

            // Subnet Size
            const shiftNew = 128n - BigInt(newMask);
            const subnetSize = 1n << shiftNew;

            // Current Subnet Base
            const maskNew = ((1n << 128n) - 1n) >> shiftNew << shiftNew;
            const currentSubnet = ipBi & maskNew;

            // Index
            const currentIndexBi = (currentSubnet - blockBase) / subnetSize;
            
            const range = 3n; 
            let startBi = currentIndexBi - range;
            if (startBi < 0n) startBi = 0n;
            
            let endBi = currentIndexBi + range;
            if (endBi >= totalSubnets) endBi = totalSubnets - 1n;

            const generatedRows = [];
            for (let i = startBi; i <= endBi; i++) {
                const netBi = blockBase + (i * subnetSize);
                const lastBi = netBi + subnetSize - 1n;
                
                const netStr = bigIntToIpv6(netBi);
                const lastStr = bigIntToIpv6(lastBi);

                generatedRows.push({
                    index: i.toString(),
                    network: compressed ? compressIpv6(netStr) : netStr,
                    range: `...${compressed ? compressIpv6(lastStr).slice(-9) : lastStr.slice(-9)}`,
                    broadcast: compressed ? compressIpv6(lastStr) : lastStr,
                    isCurrent: netBi === currentSubnet
                });
            }

            return { 
                rows: generatedRows, 
                total: totalSubnets > 1000000n ? "1M+" : totalSubnets.toString(), 
                startIndex: startBi.toString() 
            };
        } catch (e) {
            return { rows: [], total: 0, startIndex: 0 };
        }
    }
  }, [currentIp, initialMask, newMask, mode, compressed]);

  if (newMask < initialMask) {
    return <div className="p-4 text-center text-red-400 text-sm">New Mask cannot be smaller than Initial Mask.</div>;
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm flex flex-col w-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200">{mode} Subnet List</h3>
        <span className="text-xs text-slate-400">Total: {typeof rows.total === 'string' ? rows.total : rows.total.toLocaleString()}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Network ID</th>
              <th className="p-3 font-medium hidden md:table-cell">Range End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
             {rows.rows.map((row) => (
              <tr 
                key={row.network} 
                className={`${row.isCurrent ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-300 hover:bg-slate-800/50'} transition-colors`}
              >
                <td className="p-3 font-mono text-xs opacity-60 w-16">{row.index}</td>
                <td className="p-3 font-mono break-all text-xs md:text-sm">
                    <div>{row.network}</div>
                    <div className="md:hidden text-[10px] text-slate-500 mt-1">{row.range}</div>
                </td>
                <td className="p-3 font-mono text-xs opacity-70 hidden md:table-cell break-all">{row.broadcast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubnetTable;