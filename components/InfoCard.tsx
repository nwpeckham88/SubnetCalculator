import React, { useState } from 'react';
import { CalculationContext } from '../types';
import { compressIpv6 } from '../utils/subnetUtils';

interface InfoCardProps {
  data: CalculationContext;
  compressed?: boolean;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="ml-2 text-slate-500 hover:text-white transition-colors focus:outline-none"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

const InfoItem = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
  <div className="flex flex-col p-3 bg-slate-800 rounded-lg border border-slate-700 min-w-0">
    <span className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</span>
    <div className="flex items-start justify-between">
      <span 
        className="font-mono text-white font-medium break-all text-sm leading-tight" 
        title={value}
      >
        {value}
      </span>
      <CopyButton text={value} />
    </div>
    {subValue && <span className="text-xs text-slate-500 mt-1">{subValue}</span>}
  </div>
);

const InfoCard: React.FC<InfoCardProps> = ({ data, compressed = false }) => {
  const isV6 = data.mode === 'IPv6';

  const formatIp = (ip: string) => {
    if (!isV6 || !compressed) return ip;
    return compressIpv6(ip);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
      <InfoItem 
        label={isV6 ? "Network Prefix" : "Network Address"} 
        value={formatIp(data.networkAddress)} 
        subValue={`/${data.newMask}`}
      />
      <InfoItem 
        label={isV6 ? "Last Address (Range End)" : "Broadcast Address"} 
        value={formatIp(data.broadcastAddress)}
      />
      <div className="md:col-span-2 grid grid-cols-2 gap-3">
        <InfoItem 
            label="First Usable" 
            value={formatIp(data.firstUsable)}
        />
        <InfoItem 
            label="Last Usable" 
            value={formatIp(data.lastUsable)} 
        />
      </div>
      
      <InfoItem 
        label="Total Hosts" 
        value={data.totalHosts.toString()} 
        subValue="Per Subnet"
      />
      
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex justify-between items-center">
        <span className="text-sm text-slate-400">Type: <span className="text-slate-200 font-semibold">{data.ipClass}</span></span>
        <span className={`text-xs px-2 py-1 rounded-full border ${data.isPrivate ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
          {data.isPrivate ? 'PRIVATE' : 'PUBLIC'}
        </span>
      </div>
    </div>
  );
};

export default InfoCard;