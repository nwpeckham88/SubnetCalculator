// --- IPv4 Helpers ---

export const ipToLong = (ip: string): number => {
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;
  return (
    ((parseInt(parts[0], 10) << 24) |
    (parseInt(parts[1], 10) << 16) |
    (parseInt(parts[2], 10) << 8) |
    parseInt(parts[3], 10)) >>> 0
  );
};

export const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff,
  ].join('.');
};

export const isValidIp = (ip: string): boolean => {
  const pattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return pattern.test(ip);
};

export const toBinaryString = (num: number): string => {
  return (num >>> 0).toString(2).padStart(32, '0');
};

export const getSubnetMaskLong = (cidr: number): number => {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
};

export const classifyIp = (ip: string): { type: string; isPrivate: boolean } => {
  const long = ipToLong(ip);
  
  // Private Ranges
  if ((long & 0xff000000) === 0x0a000000) return { type: 'Private (Class A)', isPrivate: true };
  if ((long & 0xfff00000) === 0xac100000) return { type: 'Private (Class B)', isPrivate: true };
  if ((long & 0xffff0000) === 0xc0a80000) return { type: 'Private (Class C)', isPrivate: true };
  if ((long & 0xff000000) === 0x7f000000) return { type: 'Loopback', isPrivate: true };
  if ((long & 0xffff0000) === 0xa9fe0000) return { type: 'Link-Local', isPrivate: true };
  if ((long & 0xf0000000) === 0xe0000000) return { type: 'Multicast', isPrivate: false };

  const firstOctet = (long >>> 24) & 0xff;
  if (firstOctet >= 1 && firstOctet <= 126) return { type: 'Public (Class A)', isPrivate: false };
  if (firstOctet >= 128 && firstOctet <= 191) return { type: 'Public (Class B)', isPrivate: false };
  if (firstOctet >= 192 && firstOctet <= 223) return { type: 'Public (Class C)', isPrivate: false };

  return { type: 'Reserved/Other', isPrivate: false };
};

export const calculateSubnetDetails = (ip: string, mask: number) => {
  const ipLong = ipToLong(ip);
  const maskLong = getSubnetMaskLong(mask);
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | ~maskLong) >>> 0;
  
  const hostCount = Math.pow(2, 32 - mask) - 2;
  const firstUsableLong = (networkLong + 1) >>> 0;
  const lastUsableLong = (broadcastLong - 1) >>> 0;

  return {
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstUsable: hostCount > 0 ? longToIp(firstUsableLong) : 'N/A',
    lastUsable: hostCount > 0 ? longToIp(lastUsableLong) : 'N/A',
    totalHosts: hostCount > 0 ? hostCount : 0,
    subnetMaskString: longToIp(maskLong),
    binaryIp: toBinaryString(ipLong),
    binaryMask: toBinaryString(maskLong)
  };
};

// --- IPv6 Helpers ---

export const isValidIpv6 = (ip: string): boolean => {
  const pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return pattern.test(ip);
};

// Expands :: to full zeros
export const expandIpv6 = (ip: string): string => {
  let fullIp = ip;
  if (ip.indexOf('::') !== -1) {
    const parts = ip.split('::');
    const left = parts[0].split(':').filter(p => p);
    const right = parts[1].split(':').filter(p => p);
    const missing = 8 - (left.length + right.length);
    const zeros = Array(missing).fill('0000');
    fullIp = [...left, ...zeros, ...right].join(':');
  }
  
  // Pad individual hextets
  return fullIp.split(':').map(part => part.padStart(4, '0')).join(':');
};

export const compressIpv6 = (expandedIp: string): string => {
  // expandedIp is typically fully padded e.g., 2001:0db8:0000:0000...
  // First, remove leading zeros in each hextet
  const hextets = expandedIp.split(':').map(h => parseInt(h, 16).toString(16));

  // Find longest run of zeros
  let maxRunStart = -1;
  let maxRunLen = 0;
  let currentRunStart = -1;
  let currentRunLen = 0;

  for (let i = 0; i < 8; i++) {
    if (hextets[i] === '0') {
      if (currentRunStart === -1) currentRunStart = i;
      currentRunLen++;
    } else {
      if (currentRunLen > maxRunLen) {
        maxRunLen = currentRunLen;
        maxRunStart = currentRunStart;
      }
      currentRunStart = -1;
      currentRunLen = 0;
    }
  }
  // Check trailing run
  if (currentRunLen > maxRunLen) {
    maxRunLen = currentRunLen;
    maxRunStart = currentRunStart;
  }

  // RFC5952: "The symbol :: MUST NOT be used to shorten just one 16-bit 0 field"
  if (maxRunLen < 2) {
    return hextets.join(':');
  }

  const left = hextets.slice(0, maxRunStart).join(':');
  const right = hextets.slice(maxRunStart + maxRunLen).join(':');

  return `${left}::${right}`;
};

// Converts full expanded IPv6 to BigInt
export const ipv6ToBigInt = (expandedIp: string): bigint => {
  const hex = expandedIp.replace(/:/g, '');
  return BigInt(`0x${hex}`);
};

// Converts BigInt back to colon-separated hex (uncompressed, fully padded)
export const bigIntToIpv6 = (bigInt: bigint): string => {
  let hex = bigInt.toString(16).padStart(32, '0');
  const parts = [];
  for (let i = 0; i < 32; i += 4) {
    parts.push(hex.substring(i, i + 4));
  }
  return parts.join(':');
};

export const classifyIpv6 = (ip: string): { type: string; isPrivate: boolean } => {
  const expanded = expandIpv6(ip);
  const bi = ipv6ToBigInt(expanded);
  
  // fc00::/7 (Unique Local - Private)
  // fe80::/10 (Link Local)
  // 2000::/3 (Global Unicast)
  
  // Helper for prefix match
  const check = (val: bigint, prefix: bigint, len: bigint) => {
    const shift = 128n - len;
    return (val >> shift) === (prefix >> shift);
  };

  const fc00 = BigInt("0xfc000000000000000000000000000000");
  if (check(bi, fc00, 7n)) return { type: 'Unique Local (ULA)', isPrivate: true };

  const fe80 = BigInt("0xfe800000000000000000000000000000");
  if (check(bi, fe80, 10n)) return { type: 'Link-Local', isPrivate: true };

  const global = BigInt("0x20000000000000000000000000000000");
  if (check(bi, global, 3n)) return { type: 'Global Unicast', isPrivate: false };

  if (bi === 1n) return { type: 'Loopback', isPrivate: true };
  if (bi === 0n) return { type: 'Unspecified', isPrivate: false };

  return { type: 'Reserved/Other', isPrivate: false };
};

export const calculateIpv6Details = (ip: string, prefixLen: number) => {
  const expanded = expandIpv6(ip);
  const ipBigInt = ipv6ToBigInt(expanded);
  
  // Create mask
  const allOnes = (1n << 128n) - 1n;
  const maskShift = 128n - BigInt(prefixLen);
  const maskBigInt = (allOnes >> maskShift) << maskShift;
  
  const networkBigInt = ipBigInt & maskBigInt;
  
  const hostPartMask = (1n << maskShift) - 1n;
  const lastBigInt = networkBigInt | hostPartMask;

  const totalHostsBigInt = (1n << maskShift);
  
  // Formatting Total Hosts (can be huge)
  let totalHostsStr = totalHostsBigInt.toString();
  if (totalHostsBigInt > 1000000000n) {
      totalHostsStr = "3.4e38+ (Infinite)"; 
      if (prefixLen >= 64) totalHostsStr = "18 Quintillion+";
      if (prefixLen === 128) totalHostsStr = "1";
      if (prefixLen === 127) totalHostsStr = "2";
  }

  // First Usable: Network Address + 1 (0 address is Subnet-Router Anycast)
  const firstUsableBigInt = networkBigInt + 1n;

  // Binary string
  let binIp = ipBigInt.toString(2).padStart(128, '0');
  let binMask = maskBigInt.toString(2).padStart(128, '0');

  return {
    networkAddress: bigIntToIpv6(networkBigInt),
    broadcastAddress: bigIntToIpv6(lastBigInt), // Representing Last Range
    firstUsable: bigIntToIpv6(firstUsableBigInt),
    lastUsable: bigIntToIpv6(lastBigInt),
    totalHosts: totalHostsStr,
    subnetMaskString: `/ ${prefixLen}`,
    binaryIp: binIp,
    binaryMask: binMask
  };
};