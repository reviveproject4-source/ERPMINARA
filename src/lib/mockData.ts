import type { 
  Employee, Prospect, DiscoveryRecord, DemoRecord, ProposalRecord, DealRecord, AuditLog,
  CSTenantRecord, SupportTicket, ReactivationLead
} from '../types/database';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    tenant_id: 'tenant-minara-01',
    name: 'Budi Santoso',
    email: 'budi.sales@minara.id',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    phone: '081234567890'
  },
  {
    id: 'emp-2',
    tenant_id: 'tenant-minara-01',
    name: 'Siti Rahmawati',
    email: 'siti.cs@minara.id',
    role: 'cs',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    phone: '081298765432'
  },
  {
    id: 'emp-3',
    tenant_id: 'tenant-minara-01',
    name: 'Ahmad Finance',
    email: 'ahmad.finance@minara.id',
    role: 'finance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    phone: '081311223344'
  },
  {
    id: 'emp-4',
    tenant_id: 'tenant-minara-01',
    name: 'Ustadz Ridwan (Sales Manager)',
    email: 'ridwan.manager@minara.id',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '081599887766'
  },
  {
    id: 'emp-5',
    tenant_id: 'tenant-minara-01',
    name: 'Minara Founder (Owner)',
    email: 'founder@minara.id',
    role: 'founder',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    phone: '081100009999'
  }
];

// Empty Data Arrays for Fresh Manual Testing
export const INITIAL_PROSPECTS: Prospect[] = [];
export const INITIAL_DISCOVERY: DiscoveryRecord[] = [];
export const INITIAL_DEMOS: DemoRecord[] = [];
export const INITIAL_PROPOSALS: ProposalRecord[] = [];
export const INITIAL_DEALS: DealRecord[] = [];
export const INITIAL_CS_TENANTS: CSTenantRecord[] = [];
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
export const INITIAL_REACTIVATION_LEADS: ReactivationLead[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
