export interface SubnetInfo {
  address: string;
  rangeStart: string;
  rangeEnd: string;
  broadcast: string;
  hostCount: number;
}

export type IpMode = 'IPv4' | 'IPv6';

export interface CalculationContext {
  mode: IpMode;
  ip: string;
  initialMask: number;
  newMask: number;
  networkAddress: string;
  broadcastAddress: string; // Used as "Last Address" for IPv6
  ipClass: string;
  isPrivate: boolean;
  firstUsable: string;
  lastUsable: string;
  totalHosts: number | string; // String for IPv6 (too large for number)
  subnetMaskString: string;
  binaryIp: string;
  binaryMask: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}